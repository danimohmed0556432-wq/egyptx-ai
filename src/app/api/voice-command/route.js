import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

const COHERE_CHAT_URL = 'https://api.cohere.com/v2/chat';
const VOICE_COMMAND_MODEL = 'command-a-03-2025';
const COHERE_TIMEOUT_MS = 5000;

function extractJsonObject(text) {
  if (!text) return null;
  const cleaned = String(text)
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function buildSystemPrompt(todayIso, currentPath, language, visibleElements) {
  const safeElements = Array.isArray(visibleElements) ? visibleElements.slice(0, 45) : [];
  return [
    'You are the EgyptX Universal Voice Action Executor.',
    'You natively understand Egyptian Colloquial Arabic (العامية المصرية), Modern Standard Arabic, English, and mixed Arabic-English code-switching (e.g. "افتح AI Planner", "روح Smart Navigator").',
    'Convert the user spoken command into an ordered JSON array of `actions` to execute immediately on the EgyptX web app, plus a short spoken/displayed confirmation `reply` in the user language.',
    'STRICTLY NO EMOJIS anywhere in your output.',
    '',
    `Today Date (YYYY-MM-DD): ${todayIso}`,
    `Current Path: ${currentPath || '/'}`,
    `Active UI Language: ${language || 'en'}`,
    '',
    'Visible Interactive Elements on Current Screen:',
    JSON.stringify(safeElements),
    '',
    'Exact Verified Navbar Routes (use ONLY these exact paths for NAVIGATE):',
    '- "/" (Home / الرئيسية)',
    '- "/explore" (Explore Egypt / استكشف مصر)',
    '- "/hidden-egypt" (Hidden Egypt / مصر الخفية)',
    '- "/egyptian-culture" (Egyptian Culture / الثقافة المصرية)',
    '- "/navigator" (Smart Navigator / الملاحة الذكية / الخريطة / ازاي اروح)',
    '- "/planner" (AI Planner / مخطط الرحلات / اعمل لي رحلة)',
    '- "/ai-guide" (AI Guide / Vision Guide / صور الاثر / المرشد البصري / المرشد الذكي)',
    '- "/vr-egypt" (VR Egypt / جولة افتراضية / ابو سمبل / VR)',
    '- "/hieroglyph-scanner" (Hieroglyph Scanner / ترجم هيروغليفي / ماسح الهيروغليف)',
    '- "/slang" (EgyptSpeak / العامية المصرية)',
    '- "/memory-core" (Memory Core / الذكريات)',
    '- "/news" (Egypt Life / Journal / الأخبار)',
    '- "/videos" (Cinema / الفيديوهات)',
    '- "/reels" (Reels / الريلز)',
    '- "/crafts" (Crafts / الحرف اليدوية)',
    '- "/bookings" (Concierge Bookings / الحجوزات / الفنادق)',
    '- "/egypt-official" (Official / الجهات الرسمية)',
    '- "/national-projects" (National Projects / المشروعات القومية)',
    '- "/tut-hall-vr" (Tut Hall VR / قاعة توت)',
    '- "/kids" (Kids Mode / وضع الأطفال)',
    '- "/command-center" (Command Center / مركز القيادة)',
    '',
    'Egyptian Colloquial + English Mapping Examples:',
    '- "افتح التجارب" / "قائمة التجارب" / "Open Experiences" -> { "type": "OPEN_MENU", "menu": "experiences" }',
    '- "افتح المخطط" / "اعمل لي رحلة" / "AI Planner" -> { "type": "NAVIGATE", "path": "/planner" }',
    '- "الخريطة" / "الملاحة" / "ازاي اروح" / "Smart Navigator" -> { "type": "NAVIGATE", "path": "/navigator" }',
    '- "صور الاثر" / "المرشد البصري" / "Vision Guide" -> { "type": "NAVIGATE", "path": "/ai-guide" }',
    '- "ترجم هيروغليفي" / "Hieroglyph" -> { "type": "NAVIGATE", "path": "/hieroglyph-scanner" }',
    '- "جولة افتراضية" / "ابو سمبل" / "VR" -> { "type": "NAVIGATE", "path": "/vr-egypt" }',
    '- "اقلب عربي" / "خليه عربي" -> { "type": "SET_LANGUAGE", "code": "ar" }',
    '- "خليه انجليزي" / "اقلب انجليزي" -> { "type": "SET_LANGUAGE", "code": "en" }',
    '- "الوضع الليلي" / "دارك مود" -> { "type": "SET_THEME", "mode": "dark" }',
    '- "الوضع النهاري" / "لايت مود" -> { "type": "SET_THEME", "mode": "light" }',
    '',
    'Supported Action Objects (return ONLY valid JSON with `{ "actions": [...], "reply": "..." }`):',
    '1. { "type": "NAVIGATE", "path": "<exact verified route above>" }',
    '2. { "type": "OPEN_MENU", "menu": "experiences" | "explore" | "egypt-life" | "official" | "language" }',
    '3. { "type": "FILL_INPUT", "fieldHint": "startDate" | "endDate" | "budget" | "destination" | "search" | "chat" | "travelers", "value": "..." }',
    `   - Convert spoken relative or natural dates (e.g., "tomorrow", "بكرة", "بعد بكرة", "next Friday", "يوم 20 نوفمبر") into exact YYYY-MM-DD format using Today Date (${todayIso}).`,
    '   - For budget or travelers, output clean numeric digits (e.g. "3000", "4").',
    '4. { "type": "SELECT_OPTION", "label": "Luxor" | "Aswan" | "Cairo" | "Giza" | "Alexandria" | "Solo" | "Couple" | "Family" | "Group" | ... }',
    '5. { "type": "CLICK_BUTTON", "label": "Next" | "Generate" | "Find Route" | "Identify" | "Start Call" | ... }',
    '6. { "type": "SET_LANGUAGE", "code": "ar" | "en" | "fr" | "de" | "it" | "es" | "zh" | "ru" }',
    '7. { "type": "SET_THEME", "mode": "dark" | "light" }',
    '8. { "type": "SCROLL", "direction": "down" | "up" | "top" }',
    '',
    'Rules:',
    '- If the user asks to go to another page AND do something there (e.g. "وديني الملاحة الذكية وابحث عن مينا هاوس"), put NAVIGATE first, then FILL_INPUT / SELECT_OPTION / CLICK_BUTTON in order.',
    '- Keep `reply` concise (1 short sentence, no markdown, no emojis).',
    '- Output ONLY raw valid JSON.',
  ].join('\n');
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
        { error: 'COHERE_API_KEY is not configured', actions: [], reply: '' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const transcript = String(body?.transcript || '').trim();
    const currentPath = String(body?.currentPath || '/').trim();
    const language = String(body?.language || 'en').trim();
    const visibleElements = Array.isArray(body?.visibleElements) ? body.visibleElements : [];
    const todayIso =
      typeof body?.today === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.today)
        ? body.today
        : new Date().toISOString().slice(0, 10);

    if (!transcript) {
      return NextResponse.json(
        { error: 'Missing transcript', actions: [], reply: '' },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(todayIso, currentPath, language, visibleElements);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), COHERE_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(COHERE_CHAT_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cohereApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: VOICE_COMMAND_MODEL,
          temperature: 0.0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: transcript },
          ],
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return NextResponse.json(
        {
          error: `Cohere returned ${response.status}: ${errText}`,
          actions: [],
          reply: '',
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawContent =
      data?.message?.content?.[0]?.text ??
      (Array.isArray(data?.message?.content)
        ? data.message.content
            .map((block) => (typeof block?.text === 'string' ? block.text : ''))
            .join('\n')
        : String(data?.message?.content || ''));

    const parsed = extractJsonObject(rawContent);
    if (!parsed || typeof parsed !== 'object') {
      return NextResponse.json(
        { error: 'Model returned invalid JSON', actions: [], reply: '' },
        { status: 502 }
      );
    }

    const actions = Array.isArray(parsed.actions)
      ? parsed.actions.filter((a) => a && typeof a === 'object' && typeof a.type === 'string')
      : [];
    const reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : '';

    return NextResponse.json({ actions, reply });
  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    return NextResponse.json(
      {
        error: isAbort ? 'Voice command parser timed out' : err?.message || 'Voice command error',
        actions: [],
        reply: '',
      },
      { status: isAbort ? 504 : 500 }
    );
  }
}
