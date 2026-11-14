import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createUniversalChatCompletion } from '@/lib/ai-client';
import { resolveEgyptianLandmarkImage } from '@/lib/egypt-image-pipeline';
import { buildJsonLanguageInstruction, normalizeLocale } from '@/lib/i18n-ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      country,
      budget,
      interests,
      travelStyle,
      travelers,
      governorateId,
      pace,
      accessibility,
      avoidPlaces,
      avoidCrowds,
      dayNumber,
      existingItinerary,
      language,
      locale,
    } = body;
    const targetLocale = normalizeLocale(language || locale);

    const parsedTravelers = Math.max(1, parseInt(travelers, 10) || 1);
    const numericBudget =
      parseFloat(String(budget || '').replace(/[^0-9.]/g, '')) || 0;
    const totalDays = Array.isArray(existingItinerary)
      ? Math.max(1, existingItinerary.length)
      : 3;
    const perDayBudget =
      numericBudget > 0 ? Math.round(numericBudget / totalDays) : 150;

    const existingDayCity = Array.isArray(existingItinerary)
      ? existingItinerary.find((d: any) => Number(d?.day) === Number(dayNumber))?.city
      : undefined;

    const supabase = await createClient();
    let query = supabase
      .from('attractions')
      .select('id, name_en, city, category, description_en')
      .eq('verified', true);

    if (governorateId) {
      query = query.eq('governorate_id', governorateId);
    }

    const { data: attractions, error: dbError } = await query.limit(100);
    if (dbError) {
      console.warn('Database Error:', dbError);
    }

    const attractionsContext =
      attractions && attractions.length > 0
        ? attractions
            .map(
              (a) =>
                `- ${a.name_en} (${a.city}) [Category: ${a.category}]: ${a.description_en || 'Historic site'}`
            )
            .join('\n')
        : 'Giza Pyramids, Egyptian Museum, Karnak Temple, Luxor Temple, Valley of the Kings, Philae Temple, Citadel of Saladin.';

    let paceInstruction = '3 activities per day.';
    if (pace === 'relaxed') paceInstruction = '2 activities per day.';
    else if (pace === 'packed') paceInstruction = '4 activities per day.';

    const interestsString = Array.isArray(interests)
      ? interests.join(', ')
      : 'sightseeing, heritage';

    const prompt = `You are an expert Egypt travel planner for EgyptX AI. The user wants to REGENERATE Day ${dayNumber} of their trip.

Traveler Details:
- Origin: ${country || 'International'}
- Daily Budget Target: ~$${perDayBudget} USD for ${parsedTravelers} traveler(s) (Total Budget: $${numericBudget || perDayBudget * totalDays} USD)
- Target City: ${existingDayCity || 'Keep consistent with existing itinerary'}
- Interests: ${interestsString}
- Travel Style: ${travelStyle || 'standard'}
- Pace: ${paceInstruction}
${accessibility ? `- Accessibility: ${accessibility}` : ''}
${avoidPlaces ? `- Places to Avoid: ${avoidPlaces}` : ''}
${avoidCrowds ? `- Preference: Avoid crowded places.` : ''}

EXISTING ITINERARY CONTEXT:
${JSON.stringify(existingItinerary || {}, null, 2)}

REAL ATTRACTIONS DATABASE:
${attractionsContext}

IMPORTANT INSTRUCTIONS:
- Restrict ALL activities, restaurants, and landmarks strictly to REAL places inside the target city. Never invent fake cafes or teleport across governorates.
- Apply real city-specific Egyptian transit (Cairo Metro Lines 1/2/3, Luxor East-West Public Nile Ferry/Motorboat or Corniche microbus, Aswan Motorboat/Ferry, Alexandria Tram) — never hallucinate a Metro in Luxor or Aswan!
- Group sites logically by geography and include "exact_landmark_name" (official English Wikipedia title of the monument/district), "estimated_cost_usd" (e.g. "$40"), "transport_mode", and "transport_tip" (Nearest Station/Pier/Pickup + Exact Travel Time + Fare in EGP & USD) for every activity.
- Return ONLY strictly valid JSON matching this exact structure:

{
  "dayNumber": ${dayNumber},
  "city": "${existingDayCity || 'Cairo'}",
  "activities": [
    {
      "time": "09:00 AM",
      "category": "Historical",
      "title": "Exact Real Landmark Name",
      "exact_landmark_name": "Karnak",
      "description": "Engaging description of the activity and highlights.",
      "transport_mode": "Corniche El-Nile Service Microbus / Taxi",
      "transport_tip": "Pickup near Luxor Temple Corniche | 10 mins | 10 EGP microbus / 80 EGP taxi (~$0.20-$1.60 USD)",
      "estimated_cost_usd": "$40"
    }
  ]
}

Do not include any text before or after the JSON.

${buildJsonLanguageInstruction(targetLocale)}
- Keep \`exact_landmark_name\` as the official English Wikipedia title for photo lookup, and translate \`city\`, \`category\`, \`title\`, \`description\`, \`transport_mode\`, and \`transport_tip\` into the requested output language.`;

    const rawContent = await createUniversalChatCompletion({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    let data: any;
    try {
      data = JSON.parse(rawContent);
    } catch {
      const cleanedText = rawContent
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      data = JSON.parse(cleanedText);
    }

    if (!data || !Array.isArray(data.activities)) {
      throw new Error('AI returned an invalid day structure.');
    }

    const city = data.city || existingDayCity || 'Cairo';
    const usedImageUrls = new Set<string>();
    const resolvedActivities = [];

    for (const a of data.activities) {
      const title = a.title || a.name || 'Activity';
      const exactLandmarkName = String(
        a.exact_landmark_name || a.image_search_query || title
      ).trim();
      const resolvedImg = await resolveEgyptianLandmarkImage(
        exactLandmarkName,
        city,
        usedImageUrls
      );
      const costStr = String(
        a.estimated_cost_usd ||
          a.cost ||
          `$${Math.max(15, Math.round(perDayBudget / Math.max(1, data.activities.length)))}`
      ).trim();

      resolvedActivities.push({
        time: a.time || '10:00 AM',
        type: a.category || a.type || 'sightseeing',
        name: title,
        title,
        exact_landmark_name: exactLandmarkName,
        description: a.description || 'Enjoy this Egyptian cultural experience.',
        imagePath: resolvedImg.url,
        image_search_query: exactLandmarkName,
        transport: a.transport_mode || a.transport || 'Private A/C Car',
        transport_mode: a.transport_mode || a.transport || 'Uber / Private A/C Car',
        transport_tip: a.transport_tip || '',
        estimated_cost_usd: costStr,
        cost: costStr,
      });
    }

    return NextResponse.json({
      day: data.dayNumber || dayNumber,
      city,
      activities: resolvedActivities,
    });
  } catch (error) {
    console.error('Regenerate Day Route Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while regenerating this day.' },
      { status: 500 }
    );
  }
}
