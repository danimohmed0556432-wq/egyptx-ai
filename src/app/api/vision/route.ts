import { NextResponse } from 'next/server';
import {
  identifyLandmarkWithCohereVision,
  parseRecognitionInput,
} from '@/lib/landmark-recognition';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Route: /api/vision
 * Egyptian landmark and artifact recognition using Cohere Aya Vision API.
 */
export async function POST(req: Request) {
  try {
    const { buffer, language, prompt, filename } = await parseRecognitionInput(req);

    if (!buffer) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const visionResult = await identifyLandmarkWithCohereVision(buffer, {
      language,
      prompt,
      filename,
    });

    return NextResponse.json({
      reply: visionResult.ai_description,
      result: visionResult.ai_description,
      identified_name: visionResult.identified_name,
      confidence_level: visionResult.confidence_level,
      ai_description: visionResult.ai_description,
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
    });
  } catch (error: any) {
    console.error('[Vision API Error]:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process vision query' },
      { status: 500 }
    );
  }
}
