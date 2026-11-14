import { NextResponse } from 'next/server';
import { buildJsonLanguageInstruction, getLanguageMeta } from '@/lib/i18n-ai';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const COHERE_CHAT_URL = 'https://api.cohere.com/v2/chat';
const HIEROGLYPH_VISION_MODEL = 'command-a-vision-07-2025';
const COHERE_TIMEOUT_MS = 45000;

function buildHieroglyphPrompt(language) {
  const { name } = getLanguageMeta(language);
  return [
    'Act as a Senior Egyptologist and Epigrapher. Scan the inscription carefully from top-to-bottom, row-by-row, and examine only the real hieroglyphic signs clearly carved in the image.',
    '',
    'STRICT ANTI-REPETITION RULE:',
    '- Output ONLY unique, distinct hieroglyphic signs actually visible in the uploaded image (maximum 6 to 10 distinct signs).',
    '- NEVER repeat or duplicate the same Gardiner code or symbol entry multiple times.',
    '- If a sign exact Gardiner code is uncertain, omit it rather than guessing a wrong code.',
    '',
    'CANONICAL GARDINER SIGN LIST REFERENCE (NEVER mismatch codes and meanings):',
    '- A1 = Seated Man (determinative)',
    '- C1 / C2 = Seated Deity (Re / Amun)',
    '- D4 = Eye (ir - to make/do)',
    '- D10 = Eye of Horus / Wedjat (wdAt - protection/wholeness)',
    '- D21 = Mouth (r)',
    '- D36 = Forearm (a)',
    '- F35 = Heart and Windpipe (nfr - good/beautiful)',
    '- G1 = Egyptian Vulture (A) — NEVER call G1 a Falcon',
    '- G5 = Falcon (Hr - Horus)',
    '- G17 = Owl (m)',
    '- G43 = Quail Chick (w)',
    '- I9 = Horned Viper (f)',
    '- L1 = Scarab Beetle (xpr)',
    '- M17 = Flowering Reed / Feather (i)',
    '- N5 = Sun Disk (ra)',
    '- N35 = Water Ripple (n)',
    '- O1 = House / Plan (pr)',
    '- Q3 = Stool (p)',
    '- R8 = Sacred Flag / Cloth (nTr - god)',
    '- S3 = Red Crown of Lower Egypt (dSrt) — NEVER call S3 a Bowl',
    '- S29 = Folded Cloth (s)',
    '- S34 = Ankh / Sandal Strap (anx - life)',
    '- V30 = Basket (nb - lord/all)',
    '- W1 / W24 = Sealed Oil Jar / Nu Pot (nw)',
    '- X1 = Bread Loaf (t)',
    '- Z1 / Z2 = Single Stroke / Plural Strokes',
    '',
    `Combine the identified signs to provide an accurate Egyptological translation in English, Arabic, and ${name}.`,
    `Output ONLY raw valid JSON with keys: \`symbols\` (array of unique strings formatted like "D4 (ir) - Eye"), \`english_translation\` (string), \`arabic_translation\` (string), \`localized_translation\` (string in ${name}), and \`confidence\` (string like "93%"). Never include emojis.`,
    '',
    buildJsonLanguageInstruction(language),
  ].join('\n');
}

function normalizeConfidence(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    return `${clamped}%`;
  }
  const str = String(value ?? '').trim();
  if (!str) return '85%';
  if (/^\d+(\.\d+)?$/.test(str)) {
    const clamped = Math.max(0, Math.min(100, Math.round(Number(str))));
    return `${clamped}%`;
  }
  return str;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  const mapped = value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        return String(
          item.code || item.symbol || item.description || JSON.stringify(item)
        ).trim();
      }
      return String(item ?? '').trim();
    })
    .filter(Boolean);
  return Array.from(new Set(mapped));
}

function extractJsonObject(rawText) {
  const cleaned = String(rawText || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  if (!cleaned) return null;

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function parseImageDataUrl(req) {
  const formData = await req.formData();
  const image = formData.get('image');
  const language = String(formData.get('language') || formData.get('locale') || 'en').trim();

  if (!image) {
    return { error: 'Image file is required in form data', status: 400 };
  }

  if (
    image instanceof Blob ||
    (typeof image === 'object' && typeof image.arrayBuffer === 'function')
  ) {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (!buffer || buffer.length === 0) {
      return { error: 'Uploaded image buffer is empty', status: 400 };
    }
    const rawType = typeof image.type === 'string' ? image.type.trim() : '';
    const mimeType =
      rawType && rawType.startsWith('image/') ? rawType : 'image/jpeg';
    return { dataUrl: `data:${mimeType};base64,${buffer.toString('base64')}`, language };
  }

  if (typeof image === 'string') {
    const trimmed = image.trim();
    if (!trimmed) {
      return { error: 'Uploaded image string is empty', status: 400 };
    }
    if (trimmed.startsWith('data:image/')) {
      return { dataUrl: trimmed, language };
    }
    return { dataUrl: `data:image/jpeg;base64,${trimmed}`, language };
  }

  return { error: 'Invalid image format provided', status: 400 };
}

async function callCohereVision(apiKey, model, imageDataUrl, language) {
  const prompt = buildHieroglyphPrompt(language);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), COHERE_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(COHERE_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.05,
        frequency_penalty: 0.4,
        presence_penalty: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Cohere ${model} returned ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const rawContent =
    data?.message?.content?.[0]?.text ??
    (Array.isArray(data?.message?.content)
      ? data.message.content
          .map((block) => (typeof block?.text === 'string' ? block.text : ''))
          .join('\n')
      : String(data?.message?.content || ''));

  const cleaned = String(rawContent)
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const parsed = extractJsonObject(cleaned);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Cohere ${model} returned non-JSON output`);
  }

  return {
    symbols: normalizeStringArray(parsed.symbols),
    english_translation: String(parsed.english_translation || '').trim(),
    arabic_translation: String(parsed.arabic_translation || '').trim(),
    localized_translation: String(
      parsed.localized_translation ||
        (language === 'ar' ? parsed.arabic_translation : parsed.english_translation) ||
        ''
    ).trim(),
    confidence: normalizeConfidence(parsed.confidence),
  };
}

export async function POST(req) {
  try {
    const cohereApiKey = (
      process.env.COHERE_API_KEY ||
      process.env['\uFEFFCOHERE_API_KEY'] ||
      ''
    ).trim();

    if (!cohereApiKey) {
      return NextResponse.json(
        {
          error: 'COHERE_API_KEY is not configured',
          visual_breakdown: [],
          symbols: [],
          english_translation: '',
          arabic_translation: '',
          confidence: '0%',
        },
        { status: 500 }
      );
    }

    const parsedInput = await parseImageDataUrl(req);
    if (parsedInput.error) {
      return NextResponse.json(
        {
          error: parsedInput.error,
          visual_breakdown: [],
          symbols: [],
          english_translation: '',
          arabic_translation: '',
          confidence: '0%',
        },
        { status: parsedInput.status || 400 }
      );
    }

    const result = await callCohereVision(
      cohereApiKey,
      HIEROGLYPH_VISION_MODEL,
      parsedInput.dataUrl,
      parsedInput.language
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[translate-hieroglyph] Cohere Vision error:', error?.message || error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to analyze hieroglyph image',
        visual_breakdown: [],
        symbols: [],
        english_translation: '',
        arabic_translation: '',
        confidence: '0%',
      },
      { status: 500 }
    );
  }
}
