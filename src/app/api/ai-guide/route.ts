import { NextResponse } from 'next/server';
import { getLanguageMeta, normalizeLocale } from '@/lib/i18n-ai';
import {
  ARCHAEOLOGICAL_ACCURACY_RULE,
  VERIFIED_EGYPT_HERITAGE_KB,
  OUT_OF_SCOPE_AR,
  OUT_OF_SCOPE_EN,
  isClearlyOutOfScope,
  isItineraryOrWeatherQuery,
  fetchEgyptLiveWeather,
  fetchTrustedWikipediaAndRAG,
  streamWithSmartFallback,
} from '@/lib/egypt-rag';
import {
  decodeBase64Image,
  identifyLandmarkWithCohereVision,
} from '@/lib/landmark-recognition';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const TEXT_CHAT_SYSTEM_PROMPT = `You are a warm, highly intelligent Egyptian travel companion, best friend, and authoritative Egyptologist. Greet the user back naturally (e.g., if they say 'مرحبا', reply 'مرحبا! كيف يمكنني مساعدتك اليوم؟', and if they greet you in English, greet them back warmly in English). If they ask for itinerary advice like 'I have 3 free hours', give them an awesome, creative plan focusing on Egyptian tourism using the live weather.

NEVER say you lack information on Egyptian heritage. Match the user's language exactly (Arabic for Arabic, English for English).

${ARCHAEOLOGICAL_ACCURACY_RULE}

${VERIFIED_EGYPT_HERITAGE_KB}

NUMERIC & DATE PRECISION RULE:
- Verify every number (historical dynasties/years, pyramid heights, ticket prices in Egyptian Pounds or USD, distances, opening hours) against the verified heritage database and context before outputting. NEVER guess or invent approximate figures.
- Always include explicit units right after every number (e.g., متر، جنيه مصري، قبل الميلاد، ميلادياً، كيلومتر) and NEVER use ambiguous abbreviations like BCE, CE, or EGP inside Arabic responses.

NEVER use Markdown formatting. Do not use asterisks (**), hashes (#), or bullet symbols. Output 100% clean, conversational plain text.`;

async function buildLandmarkResponse(
  imageBuffer: Buffer,
  options: { language?: string; prompt?: string; filename?: string; mimeType?: string }
) {
  const visionResult = await identifyLandmarkWithCohereVision(imageBuffer, options);

  return {
    identified_name: visionResult.identified_name,
    confidence_level: visionResult.confidence_level,
    ai_description: visionResult.ai_description,
    reply: visionResult.ai_description,
    landmark: {
      name: visionResult.identified_name,
      dynasty: visionResult.dynasty,
      builder: visionResult.builder,
      location: visionResult.location,
      historical_significance: visionResult.historical_significance,
    },
    metadata: {
      confidence: visionResult.confidence_percent,
      model: visionResult.model_used,
      source: 'EgyptX Vision + Verified Knowledge Base',
    },
  };
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const fileEntry = formData.get('image') || formData.get('file');
      const language = String(formData.get('language') || 'en');
      const prompt = formData.get('prompt') ? String(formData.get('prompt')) : undefined;

      if (!fileEntry || typeof fileEntry === 'string') {
        if (typeof fileEntry === 'string' && fileEntry.trim()) {
          const buf = decodeBase64Image(fileEntry);
          return NextResponse.json(await buildLandmarkResponse(buf, { language, prompt }));
        }
        return NextResponse.json({ error: 'No image provided' }, { status: 400 });
      }

      const buf = Buffer.from(await fileEntry.arrayBuffer());
      const filename = 'name' in fileEntry ? String((fileEntry as File).name) : undefined;
      const mimeType = 'type' in fileEntry ? String((fileEntry as File).type) : undefined;
      return NextResponse.json(
        await buildLandmarkResponse(buf, { language, prompt, filename, mimeType })
      );
    }

    const body = await req.json();
    const { messages, prompt, question, image, filename, language, locale, stream } = body;
    const targetLocale = normalizeLocale(language || locale);
    const langMeta = getLanguageMeta(targetLocale);
    const hasImage = Boolean(image);

    if (hasImage) {
      try {
        const buf = decodeBase64Image(String(image));
        return NextResponse.json(
          await buildLandmarkResponse(buf, {
            language,
            prompt: prompt || question,
            filename,
          })
        );
      } catch (visionErr: any) {
        const msg = visionErr?.message || 'Failed to analyze image with Cohere Vision API';
        const status = msg.includes('COHERE_API_KEY is not configured') ? 500 : 502;
        return NextResponse.json({ error: msg }, { status });
      }
    }

    const groqKey = (process.env.GROQ_API_KEY || (process.env as any)['\uFEFFGROQ_API_KEY'])?.trim();
    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    const openrouterKey = process.env.OPENROUTER_API_KEY?.trim();

    if (!groqKey && !openaiKey && !openrouterKey) {
      return NextResponse.json({ error: 'AI API key is not configured' }, { status: 500 });
    }

    let formattedMessages: Array<{ role: 'user' | 'assistant'; content: string | any[] }> = [];

    if (Array.isArray(messages) && messages.length > 0) {
      formattedMessages = messages
        .filter((m: any) => m.role !== 'system')
        .map((m: any) => ({
          role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: m.content,
        }));
    } else if (prompt || question) {
      const textQuery = prompt || question;
      formattedMessages = [{ role: 'user', content: textQuery }];
    } else {
      const isArabic = language === 'ar';
      formattedMessages = [
        {
          role: 'user',
          content: isArabic
            ? 'مرحباً! حدثني عن مصر وأجمل الأماكن لزيارتها.'
            : 'Hello! Tell me about Egypt and the best places to visit.',
        },
      ];
    }

    const textMessages = formattedMessages.map((m) => ({
      role: m.role,
      content:
        typeof m.content === 'string'
          ? m.content
          : (m.content as any[]).filter((p) => p.type === 'text').map((p) => p.text).join('\n'),
    }));

    const lastUserText =
      [...textMessages].reverse().find((m) => m.role === 'user')?.content || '';
    const isArabicQuery = /[\u0600-\u06FF]/.test(String(lastUserText));

    if (isClearlyOutOfScope(String(lastUserText))) {
      const refusal = isArabicQuery ? OUT_OF_SCOPE_AR : OUT_OF_SCOPE_EN;
      if (stream === false) {
        return NextResponse.json({ reply: refusal });
      }
      return new Response(refusal, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    const [wikiAndDbContext, weatherContext] = await Promise.all([
      fetchTrustedWikipediaAndRAG(String(lastUserText)),
      isItineraryOrWeatherQuery(String(lastUserText))
        ? fetchEgyptLiveWeather(String(lastUserText))
        : Promise.resolve(''),
    ]);

    let systemPrompt = TEXT_CHAT_SYSTEM_PROMPT;
    systemPrompt += `\n\n--- USER INTERFACE LANGUAGE PREFERENCE ---\nThe user's active interface language is ${langMeta.name} (${targetLocale}). ${langMeta.directive} If the user explicitly writes in a different language, match their message language; otherwise respond in ${langMeta.name}.`;
    if (weatherContext) {
      systemPrompt += `\n\n--- LIVE EGYPT WEATHER ---\n${weatherContext}`;
    }
    if (wikiAndDbContext) {
      systemPrompt += `\n\n--- VERIFIED ENCYCLOPEDIA & WIKIPEDIA RAG CONTEXT ---\n${wikiAndDbContext}`;
    }

    return await streamWithSmartFallback(req, {
      systemPrompt,
      messages: textMessages,
      temperature: 0.1,
      nonStreamingJson: stream === false,
      extraJsonFields: {
        identified_name: 'معلم أثري مصري',
        confidence_level: 'high',
      },
    });
  } catch (error: any) {
    console.error('[AI Guide Route Error]:', error);
    return NextResponse.json(
      { reply: 'مرحباً بك! أنا رفيقك السياحي في مصر، كيف يمكنني مساعدتك في رحلتك اليوم؟' },
      { status: 200 }
    );
  }
}
