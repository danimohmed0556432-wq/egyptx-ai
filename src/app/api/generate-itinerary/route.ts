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
      duration,
      startDate,
      endDate,
      budget,
      interests,
      travelStyle,
      travelers,
      governorateId,
      pace,
      accessibility,
      avoidPlaces,
      avoidCrowds,
      routePreference,
      destinations,
      language,
      locale,
    } = body;
    const targetLocale = normalizeLocale(language || locale);

    let parsedDuration = parseInt(duration, 10);
    if (startDate && endDate) {
      const startMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();
      const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
      if (!isNaN(diffDays) && diffDays >= 1) {
        parsedDuration = diffDays;
      }
    }

    if (isNaN(parsedDuration) || parsedDuration < 1 || parsedDuration > 21) {
      return NextResponse.json(
        { error: 'Trip duration must be between 1 and 21 days.' },
        { status: 400 }
      );
    }

    const parsedTravelers = Math.max(1, parseInt(travelers, 10) || 1);
    const numericBudget =
      parseFloat(String(budget || '').replace(/[^0-9.]/g, '')) || 0;
    const perDayBudget =
      numericBudget > 0 ? Math.round(numericBudget / parsedDuration) : 150;
    const budgetTier =
      numericBudget <= 0
        ? 'Mid-Range'
        : perDayBudget / parsedTravelers < 90
        ? 'Budget'
        : perDayBudget / parsedTravelers > 260
        ? 'Luxury'
        : 'Mid-Range';

    // Fetch verified attractions from Supabase
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
      console.warn('Database Attractions Warning:', dbError);
    }

    const attractionsContext =
      attractions && attractions.length > 0
        ? attractions
            .map(
              (a) =>
                `- ${a.name_en} (${a.city}) [${a.category}]: ${a.description_en || 'Historic Egyptian site'}`
            )
            .join('\n')
        : 'Major landmarks: Giza Pyramids, Egyptian Museum, Grand Egyptian Museum, Khan el-Khalili, Karnak Temple, Luxor Temple, Valley of the Kings, Hatshepsut Temple, Philae Temple, Abu Simbel.';

    const paceInstruction =
      pace === 'relaxed'
        ? 'Schedule 2 activities per day.'
        : pace === 'packed'
        ? 'Schedule 4 activities per day.'
        : 'Schedule 3 activities per day (morning, afternoon, evening).';

    const interestsString = Array.isArray(interests)
      ? interests.join(', ')
      : 'sightseeing, history, culture';
    const destinationsConstraint =
      destinations && destinations.length > 0
        ? destinations.join(', ')
        : 'Cairo, Luxor, Aswan';

    const totalBudgetUsd =
      numericBudget > 0 ? Math.round(numericBudget) : perDayBudget * parsedDuration;

    const systemPrompt = `You are the master Egypt travel planner for EgyptX AI.
Generate a realistic, exciting, and factually accurate ${parsedDuration}-day Egypt travel itinerary.

CRITICAL INSTRUCTIONS:
1. You MUST respond ONLY with a valid JSON object matching the schema below. Do not include markdown fences, preambles, or explanations.
2. Generate EXACTLY ${parsedDuration} days (dayNumber 1 through ${parsedDuration}). Never invent extra days or skip days.
3. STRICT REAL-LOCATION RULE (ZERO HALLUCINATIONS):
   - Restrict ALL activities, temples, restaurants, cafes, and hotels strictly to REAL, verifiable places located INSIDE the exact selected cities (${destinationsConstraint}).
   - NEVER invent fake cafes or restaurants (for example, never invent a non-existent place like "Local Dendera Cafe" inside Luxor).
   - NEVER teleport the traveler to another governorate or city without an explicit inter-city transfer step.
   - Ensure realistic daily pacing (morning, afternoon, evening) and logical geographical grouping (for example, Luxor West Bank sites together, East Bank sites together) with accurate transit times.
4. SCALABLE USD COSTING:
   - Total trip budget is $${totalBudgetUsd} USD (${budgetTier} tier, approximately $${perDayBudget} USD/day for ${parsedTravelers} traveler(s)).
   - For EVERY activity, meal, transfer, and ticket, output an exact "estimated_cost_usd" string (e.g., "$45", "$120", "$0") scaled proportionally so the sum across all ${parsedDuration} days realistically aligns with $${totalBudgetUsd} USD.
5. EXACT LANDMARK NAMING FOR PHOTO VERIFICATION:
   - For EVERY activity, output "exact_landmark_name": the official English Wikipedia/Wikimedia article title of the exact monument, museum, or district (for example: "Great Pyramid of Giza", "Temple of Kom Ombo", "Ramesseum", "Bibliotheca Alexandrina", "Baron Empain Palace", "Al-Azhar Mosque", "Philae", "Karnak", "Luxor Temple", "Valley of the Kings").
   - NEVER put generic action titles like "Arrival & Transfer", "Check-in", or "Lunch at Restaurant" in "exact_landmark_name"; instead name the actual landmark or historic district (for example, "Khan el-Khalili" or "Aswan Botanical Garden").
6. HYPER-REALISTIC, GEOGRAPHY-AWARE EGYPTIAN TRANSIT (NEVER HALLUCINATE A METRO IN LUXOR OR ASWAN):
   - Output "transport_mode" and "transport_tip" matching the ACTUAL real-world public and local transit infrastructure of that exact Egyptian city and the user's ${budgetTier} tier:
     * Cairo & Giza: Specify exact Cairo Metro Lines and nearest real stations when faster than traffic (for example: "Cairo Metro Line 1 to Mar Girgis Station - 2 mins walk to Coptic Cairo", "Cairo Metro Line 2 to Sadat Station for Egyptian Museum", "Cairo Metro Line 3 to Attaba or Bab El-Shaaria for Khan el-Khalili", or "Uber / Taxi via Remaya Square for Grand Egyptian Museum").
     * Luxor: Strictly differentiate East Bank vs West Bank!
       - Crossing Nile (East <-> West Bank): Recommend the Public Nile Ferry (المعدية النيلية) from near Luxor Temple to the West Bank pier (5 mins, 10 EGP / ~$0.20 USD) + local service microbus/taxi to Valley of the Kings or Hatshepsut Temple, OR private motorboat (اللنش النيلي).
       - Within East Bank (Luxor Temple <-> Karnak): Specify local white-and-blue service microbus, caleche, or taxi along Corniche El-Nile (10 mins).
     * Aswan: Specify motorboat/ferry (مركب نيلي / معدية) to Elephantine Island, Kitchener's Island, or Philae Marina (Shellal), and local taxis/microbuses from Aswan Corniche.
     * Alexandria: Specify the historic Alexandria Tram (ترام الرمل / ترام المدينة) with exact station names (such as Raml Station), coastal Corniche microbuses, or taxi/Careem.
     * Inter-City Transfers (moving between governorates):
       - Long distance (Cairo <-> Luxor / Aswan / Sharm El-Sheikh / Hurghada): Specify EgyptAir Domestic Flight (1h-1h15m - fastest) OR Egyptian National Railways (VIP / Talgo / Abela Sleeper Train) from Ramses Station (Cairo) / Giza Station.
       - Medium distance (Cairo <-> Alexandria): Specify Talgo / VIP Express Train (2h 15m from Ramses Station to Misr or Sidi Gaber Station - fastest) or Go Bus.
       - Oasis / Sinai overland (Cairo <-> Siwa / Dahab): Specify West & Mid Delta / Go Bus Elite Plus or private 4x4 transfer.
   - "transport_tip" MUST ALWAYS include: Nearest Station/Pier/Pickup point + Exact Travel Time + Realistic Local Fare in BOTH EGP and USD (for example: "Take Metro Line 2 to Sadat Station, 4 mins walk | 15 mins | 15 EGP (~$0.30 USD)" or "Public Nile Ferry from Luxor Temple pier + West Bank taxi | 20 mins | 10 EGP ferry + 150 EGP taxi (~$3.20 USD)").
7. Every activity MUST have:
   - "time": e.g. "09:00 AM", "01:30 PM", "06:30 PM"
   - "title": Exact real landmark or activity name
   - "exact_landmark_name": Official English Wikipedia/Wikimedia title of the monument or district
   - "description": 2-3 engaging, descriptive sentences
   - "category": e.g. "Historical", "Culture", "Dining", "Adventure"
   - "transport_mode": Real city-accurate Egyptian transport mode
   - "transport_tip": Nearest Station/Pier/Pickup + Exact Travel Time + Realistic Fare in EGP & USD
   - "estimated_cost_usd": e.g. "$45"
   - "historicalFact": An authentic historical fact about the site

JSON SCHEMA REQUIRED:
{
  "days": [
    {
      "dayNumber": 1,
      "city": "Giza",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Giza Pyramids and Great Sphinx",
          "exact_landmark_name": "Giza pyramid complex",
          "description": "Witness the colossal pyramids of Khufu, Khafre, and Menkaure on the Giza plateau.",
          "category": "Historical",
          "transport_mode": "Cairo Metro Line 2 to Giza Station + Uber via Al-Haram St",
          "transport_tip": "Metro Line 2 to Giza Station then 15 mins Uber to Nazlet El-Semman Gate | 35 mins total | 15 EGP metro + 90 EGP Uber (~$2.20 USD)",
          "estimated_cost_usd": "$55",
          "historicalFact": "The Great Pyramid remained the tallest human-made structure for over 3,800 years."
        }
      ]
    }
  ]
}

Available Landmarks for Reference:
${attractionsContext}

${buildJsonLanguageInstruction(targetLocale)}
- NOTE ON \`exact_landmark_name\`: Keep \`exact_landmark_name\` as the official English Wikipedia/Wikimedia title so photo lookup works, and translate \`city\`, \`title\`, \`description\`, \`category\`, \`transport_mode\`, \`transport_tip\`, and \`historicalFact\` into the requested output language.`;

    const userPrompt = `Generate an exact ${parsedDuration}-day itinerary for ${parsedTravelers} traveler(s).
Total Budget: $${totalBudgetUsd} USD (${budgetTier} tier).
Selected Cities ONLY: ${destinationsConstraint}.
Interests: ${interestsString}.
Travel style: ${travelStyle || 'standard'}.
Pace: ${paceInstruction}
${accessibility ? `Accessibility: ${accessibility}` : ''}
${avoidPlaces ? `Avoid: ${avoidPlaces}` : ''}
${avoidCrowds ? `Avoid crowded peak hours where possible.` : ''}
${routePreference ? `Route: ${routePreference}` : ''}`;

    let formattedData: any = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Itinerary Generator] Attempt ${attempt} calling AI completion...`);

        const rawContent = await createUniversalChatCompletion({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        });

        let parsed: any;
        try {
          parsed = JSON.parse(rawContent);
        } catch {
          const cleaned = rawContent
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
          parsed = JSON.parse(cleaned);
        }

        const rawDays = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.days)
          ? parsed.days
          : Array.isArray(parsed?.itinerary)
          ? parsed.itinerary
          : null;

        if (!rawDays || rawDays.length === 0) {
          throw new Error('Parsed response does not contain a valid days array.');
        }

        const slicedDays = rawDays.slice(0, parsedDuration);
        const usedImageUrls = new Set<string>();

        formattedData = [];
        for (let idx = 0; idx < slicedDays.length; idx += 1) {
          const d = slicedDays[idx];
          const dayNum = d.dayNumber ?? d.day ?? idx + 1;
          const city = d.city || destinationsConstraint.split(',')[0].trim() || 'Cairo';
          const activities = Array.isArray(d.activities) ? d.activities : [];
          const resolvedActivities = [];

          for (const a of activities) {
            const title = a.title || a.name || 'Egyptian Landmark Experience';
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
                `$${Math.max(15, Math.round(perDayBudget / Math.max(1, activities.length)))}`
            ).trim();

            resolvedActivities.push({
              time: a.time || '10:00 AM',
              name: title,
              title,
              exact_landmark_name: exactLandmarkName,
              description:
                a.description ||
                'Immerse yourself in authentic Egyptian culture and historical wonders.',
              type: a.category || a.type || 'sightseeing',
              imagePath: resolvedImg.url,
              image_search_query: exactLandmarkName,
              transport: a.transport_mode || a.transport || 'Private A/C Car',
              transport_mode: a.transport_mode || a.transport || 'Uber / Private A/C Car',
              transport_tip: a.transport_tip || '',
              estimated_cost_usd: costStr,
              cost: costStr,
              tip: a.tip || null,
              fact: a.historicalFact || a.fact || null,
            });
          }

          formattedData.push({
            day: dayNum,
            city,
            activities: resolvedActivities,
          });
        }

        console.log(`[Itinerary Generator] Successfully generated ${formattedData.length} days.`);
        break;
      } catch (err: any) {
        console.error(`[Itinerary Generator] Attempt ${attempt} failed:`, err?.message || err);
      }
    }

    if (!formattedData || formattedData.length === 0) {
      console.error('[Itinerary Generator] All attempts failed, returning fallback itinerary structure.');
      const selectedCities = destinationsConstraint
        .split(',')
        .map((c: string) => c.trim())
        .filter(Boolean);
      const fallbackCities = selectedCities.length > 0 ? selectedCities : ['Cairo', 'Giza', 'Luxor', 'Aswan'];

      formattedData = await Promise.all(
        Array.from({ length: parsedDuration }, async (_, i) => {
          const city = fallbackCities[i % fallbackCities.length];
          const morningCost = `$${Math.max(20, Math.round(perDayBudget * 0.4))}`;
          const afternoonCost = `$${Math.max(15, Math.round(perDayBudget * 0.3))}`;
          const eveningCost = `$${Math.max(15, Math.round(perDayBudget * 0.3))}`;

          const [img1, img2, img3] = await Promise.all([
            resolveEgyptianLandmarkImage(`${city} ancient temple landmark Egypt`, city),
            resolveEgyptianLandmarkImage(`${city} museum heritage Egypt`, city),
            resolveEgyptianLandmarkImage(`Nile River sunset ${city} Egypt`, city),
          ]);

          return {
            day: i + 1,
            city,
            activities: [
              {
                time: '09:00 AM',
                name: `${city} Heritage Exploration`,
                title: `${city} Heritage Exploration`,
                description: `Discover the monumental landmarks, archaeological treasures, and rich legacy of ${city}.`,
                type: 'Historical',
                imagePath: img1.url,
                image_search_query: `${city} ancient temple landmark Egypt`,
                transport: 'Uber / Private A/C Car',
                transport_mode: 'Uber / Private A/C Car (approx. 15-20 mins)',
                transport_tip: `15-20 mins ride to ${city} main heritage entrance (~$4 USD)`,
                estimated_cost_usd: morningCost,
                cost: morningCost,
                tip: 'Arrive early to beat the afternoon heat.',
                fact: `${city} has stood as a crossroad of civilization for millennia.`,
              },
              {
                time: '02:00 PM',
                name: `${city} Cultural Journey`,
                title: `${city} Cultural Journey`,
                description: `Experience authentic Egyptian crafts, local culinary traditions, and guided museum collections in ${city}.`,
                type: 'Culture',
                imagePath: img2.url,
                image_search_query: `${city} museum heritage Egypt`,
                transport: 'Walking - 10 mins',
                estimated_cost_usd: afternoonCost,
                cost: afternoonCost,
                tip: 'Sample fresh koshary and hibiscus tea.',
                fact: 'Traditional Egyptian hospitality dates back to ancient times.',
              },
              {
                time: '06:30 PM',
                name: `Nile Sunset & Evening Promenade`,
                title: `Nile Sunset & Evening Promenade`,
                description: `Unwind with an evening stroll along the waterfront or take a traditional felucca sail in ${city}.`,
                type: 'Relaxation',
                imagePath: img3.url,
                image_search_query: `Nile River sunset ${city} Egypt`,
                transport: 'Felucca Boat',
                estimated_cost_usd: eveningCost,
                cost: eveningCost,
                tip: 'Sunset on the Nile offers incredible photography lighting.',
                fact: 'The Nile River has nurtured civilization in Egypt for over 5,000 years.',
              },
            ],
          };
        })
      );
    }

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error('[Itinerary Generator Critical Error]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while planning your journey.' },
      { status: 500 }
    );
  }
}
