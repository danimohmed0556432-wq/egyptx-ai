import { NextResponse } from 'next/server';
import {
  identifyLandmarkWithCohereVision,
  parseRecognitionInput,
} from '@/lib/landmark-recognition';
import type { SupportedLocale } from '@/lib/i18n-ai';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const uncertainRecord = (lang: string) => ({
  transliteration: lang === 'ar' ? 'لم أتمكن من التعرف بدقة' : 'Could not identify accurately',
  englishTranslation: 'Could not accurately identify the inscription or monument.',
  arabicExplanation:
    'لم يتم التحقق من تطابق دقيق من قاعدة البيانات الأثرية. يرجى رفع صورة واضحة للمعلم أو القطعة الأثرية.',
  context: {
    personOrKing: 'Unknown',
    era: 'Unknown',
    temple: 'Unknown',
    meaning: 'Insufficient image data for verification.',
  },
  metadata: {
    confidence: '0%',
    source: 'EgyptX Vision + Verified Knowledge Base',
  },
  sources: [] as Array<{ title: string; url: string }>,
});

export async function POST(req: Request) {
  let language: SupportedLocale = 'en';
  try {
    const parsed = await parseRecognitionInput(req);
    language = parsed.language;

    if (!parsed.buffer) {
      return NextResponse.json({ error: 'No image payload provided' }, { status: 400 });
    }

    const visionResult = await identifyLandmarkWithCohereVision(parsed.buffer, {
      language,
      prompt: parsed.prompt,
      filename: parsed.filename,
    });

    return NextResponse.json({
      transliteration: visionResult.identified_name,
      englishTranslation: visionResult.identified_name,
      arabicExplanation: visionResult.historical_significance || visionResult.ai_description,
      context: {
        personOrKing: visionResult.builder,
        era: visionResult.dynasty,
        temple: visionResult.location,
        meaning: visionResult.historical_significance,
      },
      metadata: {
        confidence: visionResult.confidence_percent,
        model: visionResult.model_used,
        source: 'EgyptX Vision + Verified Knowledge Base',
      },
      sources: [
        {
          title: 'EgyptX Vision + Verified Archaeological Knowledge Base',
          url: '',
        },
      ],
    });
  } catch (error: any) {
    console.error('[Analyze Vision Route Exception]:', error?.message || 'error');
    return NextResponse.json(uncertainRecord(language));
  }
}
