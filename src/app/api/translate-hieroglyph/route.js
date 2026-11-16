import { NextResponse } from 'next/server';
import { buildJsonLanguageInstruction, getLanguageMeta, normalizeLocale } from '@/lib/i18n-ai';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const COHERE_CHAT_URL = 'https://api.cohere.com/v2/chat';
const COHERE_VISION_MODEL = 'command-a-vision-07-2025';
const VISION_TIMEOUT_MS = 45000;

const CLASSIFICATION_LABELS = {
  authentic_inscription: {
    en: 'Authentic Epigraphic Inscription',
    ar: 'نقش هيروغليفي أثري أصيل',
    fr: 'Inscription épigraphique authentique',
    de: 'Authentische epigraphische Inschrift',
    it: 'Iscrizione epigrafica autentica',
    es: 'Inscripción epigráfica auténtica',
    zh: '真实古埃及铭文',
    ru: 'Подлинная эпиграфическая надпись',
  },
  modern_artwork: {
    en: 'Modern Hieroglyphic-Style Artwork',
    ar: 'عمل فني / إعلاني حديث مستوحى من الهيروغليفية',
    fr: 'Œuvre moderne de style hiéroglyphique',
    de: 'Modernes Kunstwerk im Hieroglyphen-Stil',
    it: 'Opera moderna in stile geroglifico',
    es: 'Obra moderna de estilo jeroglífico',
    zh: '现代仿象形文字艺术设计',
    ru: 'Современная стилизация под иероглифы',
  },
};

const UNAVAILABLE_ERRORS = {
  en: 'Vision AI service unavailable — please check API key configuration',
  ar: 'خدمة الذكاء الاصطناعي البصري غير متاحة حالياً — يرجى التحقق من إعداد مفتاح API',
  fr: 'Service Vision IA indisponible — veuillez vérifier la configuration de la clé API',
  de: 'Vision-KI-Dienst nicht verfügbar — bitte prüfen Sie die API-Schlüssel-Konfiguration',
  it: 'Servizio Vision AI non disponibile — verifica la configurazione della chiave API',
  es: 'Servicio Vision AI no disponible — verifica la configuración de la clave API',
  zh: '视觉 AI 服务不可用 — 请检查 API 密钥配置',
  ru: 'Сервис Vision ИИ недоступен — проверьте конфигурацию API-ключа',
};

function getClassificationLabel(classification, locale) {
  const loc = normalizeLocale(locale);
  const bucket =
    classification === 'modern_artwork'
      ? CLASSIFICATION_LABELS.modern_artwork
      : CLASSIFICATION_LABELS.authentic_inscription;
  return bucket[loc] || bucket.en;
}

function getUnavailableError(locale) {
  const loc = normalizeLocale(locale);
  return UNAVAILABLE_ERRORS[loc] || UNAVAILABLE_ERRORS.en;
}

function buildHieroglyphPrompt(language) {
  const loc = normalizeLocale(language);
  const { name } = getLanguageMeta(loc);
  return [
    'Act as a Senior Egyptologist, Epigrapher, and Visual Forensics Analyst.',
    'Examine the actual symbols drawn in the uploaded image carefully, pixel-by-pixel.',
    '',
    'CRITICAL RULES:',
    '1. READING ORDER & EXACT VISIBLE GARDINER SIGNS ONLY:',
    '   - Read any hieroglyphic signs in their actual ancient reading order (facing into the direction of birds and figures).',
    '   - Identify ONLY the exact Gardiner hieroglyphic signs truly visible in the image (for example, F35 Heart & Windpipe = nfr, G17 Owl = m, I6 Crocodile Scale = km, X1 Bread Loaf = t, O49 Town/Egypt determinative = niwt, reading nfr m kmt = "Beautiful in Egypt").',
    '   - NEVER invent, guess, or inject signs that are not visibly drawn in the image. If no authentic Gardiner signs are clearly visible, return `"signs": []`.',
    '   - NEVER repeat or duplicate the same sign entry.',
    '',
    '2. AUTHENTIC INSCRIPTION VS. MODERN / ARTISTIC STYLIZATION:',
    '   - Determine honestly whether the image is:',
    '     * "authentic_inscription": A genuine ancient Egyptian hieroglyphic carving, stela, papyrus, or royal cartouche.',
    '     * "modern_artwork": A modern graphic, poster, advertisement, logo, or stylized Arabic/English artwork made to look like hieroglyphs.',
    '   - If it is "modern_artwork", state that clearly and explain what is written or depicted.',
    '',
    'CANONICAL GARDINER SIGN LIST REFERENCE (STRICT CODE ACCURACY):',
    '- S34 = Ankh / Sandal Strap (anx - Life)',
    '- U28 = Fire Drill (wDA - Prosperity / Soundness / Wedja)',
    '- S29 = Folded Cloth (s / snb - Health / Seneb)',
    '- NOTE: The classic royal blessing formula S34 + U28 + S29 MUST always be decoded as "ankh wedja seneb" ("Life, Prosperity, Health").',
    '- F35 = Heart and Windpipe (nfr - Good / Beautiful)',
    '- I6 = Crocodile Scale (km - Black / Egypt root)',
    '- G17 = Owl (m - in / from)',
    '- X1 = Bread Loaf (t - feminine ending)',
    '- O49 = Village Crossroads / Town (niwt - Town / Land determinative; I6 + G17 + X1 + O49 = kmt = "Egypt")',
    '- R4 = Offering Table (Htp - Peace / Offering)',
    '- Q3 = Stool (p)',
    '- N5 = Sun Disk (ra - Ra / Sun)',
    '- L1 = Scarab Beetle (xpr - Manifestation / Kheper)',
    '- Y5 = Senet Game Board (mn - Enduring / Men)',
    '- G1 = Egyptian Vulture (A)',
    '- M17 = Reed Leaf (i)',
    '- N35 = Water Ripple (n)',
    '- D21 = Mouth (r)',
    '- D36 = Forearm (a)',
    '- S38 = Crook (HqA - Ruler)',
    '- M13 = Papyrus Stem (wAD - Green / Flourish)',
    '- I10 = Cobra (D)',
    '- A1 = Seated Man (determinative)',
    '- D55 = Legs Walking Backwards',
    '',
    '3. OUTPUT SCHEMA (RAW VALID JSON ONLY, NO MARKDOWN FENCES, ZERO EMOJIS):',
    '   - "classification": "authentic_inscription" OR "modern_artwork"',
    `   - "signs": array of unique strings in ${name} formatted as "<GardinerCode> - <Sign Name & Phonetic Value>" (or [] if none are genuinely visible)`,
    '   - "transliteration": accurate Egyptological transliteration string (or empty string if modern artwork with no hieroglyphs)',
    '   - "english_translation": clear translation or honest visual explanation in English',
    '   - "arabic_translation": clear translation or honest visual explanation in Arabic',
    `   - "localized_translation": clear translation or honest visual explanation strictly in ${name}`,
    '   - "confidence": percentage string like "92%"',
    `   - "context": { "personOrKing": string in ${name}, "era": string in ${name}, "temple": string in ${name}, "meaning": honest historical or visual explanation in ${name} }`,
    '',
    buildJsonLanguageInstruction(loc),
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

function sanitizeGardinerCode(rawCode, textToInspect) {
  const text = String(textToInspect || '').toLowerCase();
  if (/\bankh\b|sandal strap|\blife\b|عنخ|الحياة/.test(text)) return 'S34';
  if (/\bwedja\b|fire drill|prosperity|soundness|وجا|الرخاء/.test(text)) return 'U28';
  if (/\bsenb\b|\bseneb\b|folded cloth|\bhealth\b|سنب|الصحة/.test(text)) return 'S29';
  if (/\bnefer\b|\bnfr\b|heart and windpipe|نفر/.test(text)) return 'F35';
  if (/\bowl\b|بومة/.test(text)) return 'G17';
  if (/crocodile scale|\bkm\b|\bkmt\b/.test(text)) return 'I6';
  if (/bread loaf|رغيف/.test(text)) return 'X1';
  if (/crossroads|\btown\b|\bniwt\b/.test(text)) return 'O49';
  if (/sun disk|قرص الشمس/.test(text)) return 'N5';
  if (/scarab|جعران/.test(text)) return 'L1';
  if (/\bcrook\b|صولجان/.test(text)) return 'S38';
  if (/papyrus|بردي/.test(text)) return 'M13';
  return rawCode;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  const mapped = value
    .map((item) => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (!trimmed) return '';
        const codeMatch = trimmed.match(/^([A-Z]\d+[A-Z]?)\b/i);
        const rawCode = codeMatch ? codeMatch[1].toUpperCase() : '';
        const cleanCode = sanitizeGardinerCode(rawCode, trimmed);
        if (rawCode && cleanCode && rawCode !== cleanCode) {
          return trimmed.replace(codeMatch[1], cleanCode);
        }
        return trimmed;
      }
      if (item && typeof item === 'object') {
        const rawCode = String(item.code || item.symbol || '').trim();
        const name = String(item.name || item.description || '').trim();
        const phonetic = String(item.phonetic || '').trim();
        const meaning = String(item.meaning || '').trim();
        const code = sanitizeGardinerCode(rawCode, `${name} ${phonetic} ${meaning}`);
        if (code || name) {
          const head = [code, phonetic ? `(${phonetic})` : ''].filter(Boolean).join(' ');
          const tail = [name, meaning].filter(Boolean).join(': ');
          return [head, tail].filter(Boolean).join(' - ');
        }
        return JSON.stringify(item);
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
  const language = normalizeLocale(
    String(formData.get('language') || formData.get('locale') || 'en').trim()
  );

  if (!image) {
    return { error: 'Image file is required in form data', status: 400, language };
  }

  if (
    image instanceof Blob ||
    (typeof image === 'object' && typeof image.arrayBuffer === 'function')
  ) {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (!buffer || buffer.length === 0) {
      return { error: 'Uploaded image buffer is empty', status: 400, language };
    }
    const rawType = typeof image.type === 'string' ? image.type.trim() : '';
    const mimeType =
      rawType && rawType.startsWith('image/') ? rawType : 'image/jpeg';
    return {
      dataUrl: `data:${mimeType};base64,${buffer.toString('base64')}`,
      base64: buffer.toString('base64'),
      mimeType,
      language,
    };
  }

  if (typeof image === 'string') {
    const trimmed = image.trim();
    if (!trimmed) {
      return { error: 'Uploaded image string is empty', status: 400, language };
    }
    if (trimmed.startsWith('data:image/')) {
      const m = trimmed.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      return {
        dataUrl: trimmed,
        mimeType: m?.[1] || 'image/jpeg',
        base64: m?.[2] || '',
        language,
      };
    }
    return {
      dataUrl: `data:image/jpeg;base64,${trimmed}`,
      mimeType: 'image/jpeg',
      base64: trimmed,
      language,
    };
  }

  return { error: 'Invalid image format provided', status: 400, language };
}

function formatVisionResult(parsed, language) {
  const classification =
    parsed.classification === 'modern_artwork' ? 'modern_artwork' : 'authentic_inscription';
  const signs = normalizeStringArray(parsed.signs ?? parsed.symbols);
  const englishTranslation = String(parsed.english_translation || '').trim();
  const arabicTranslation = String(parsed.arabic_translation || '').trim();
  const localizedTranslation = String(
    parsed.localized_translation ||
      (language === 'ar' ? arabicTranslation : englishTranslation) ||
      ''
  ).trim();

  return {
    classification,
    classification_label: getClassificationLabel(classification, language),
    transliteration: String(parsed.transliteration || '').trim(),
    signs,
    symbols: signs,
    english_translation: englishTranslation,
    arabic_translation: arabicTranslation,
    localized_translation: localizedTranslation,
    confidence: normalizeConfidence(parsed.confidence),
    context:
      parsed.context && typeof parsed.context === 'object'
        ? {
            personOrKing: parsed.context.personOrKing
              ? String(parsed.context.personOrKing).trim()
              : undefined,
            era: parsed.context.era ? String(parsed.context.era).trim() : undefined,
            temple: parsed.context.temple
              ? String(parsed.context.temple).trim()
              : undefined,
            meaning: parsed.context.meaning
              ? String(parsed.context.meaning).trim()
              : undefined,
          }
        : undefined,
  };
}

async function callCohereVision(apiKey, imageDataUrl, language) {
  const loc = normalizeLocale(language);
  const systemPrompt = buildHieroglyphPrompt(loc);
  const userText = `Decode the hieroglyphs in this image and output all text fields strictly in language: ${loc}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);

  try {
    const response = await fetch(COHERE_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: COHERE_VISION_MODEL,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`[hieroglyph-vision] Cohere ${COHERE_VISION_MODEL} HTTP ${response.status}:`, errText);
      throw new Error(`Cohere Vision (${COHERE_VISION_MODEL}) returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const rawContent =
      data?.message?.content?.[0]?.text ??
      (Array.isArray(data?.message?.content)
        ? data.message.content.map((b) => (typeof b?.text === 'string' ? b.text : '')).join('\n')
        : String(data?.message?.content || ''));
    const parsed = extractJsonObject(rawContent);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error(`Cohere Vision (${COHERE_VISION_MODEL}) returned non-JSON output`);
    }
    return formatVisionResult(parsed, language);
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildGracefulEmptyResult(language) {
  const loc = normalizeLocale(language);
  const msg = getUnavailableError(loc);
  return {
    classification: 'modern_artwork',
    classification_label: getClassificationLabel('modern_artwork', loc),
    transliteration: '',
    signs: [],
    symbols: [],
    english_translation: UNAVAILABLE_ERRORS.en,
    arabic_translation: UNAVAILABLE_ERRORS.ar,
    localized_translation: msg,
    confidence: '0%',
    context: {
      meaning: msg,
    },
  };
}

export async function POST(req) {
  let activeLang = 'en';
  try {
    const parsedInput = await parseImageDataUrl(req);
    activeLang = parsedInput.language || 'en';

    if (parsedInput.error) {
      return NextResponse.json(
        {
          ...buildGracefulEmptyResult(activeLang),
          english_translation: parsedInput.error,
          localized_translation: parsedInput.error,
        },
        { status: 200 }
      );
    }

    const cohereApiKey = (
      process.env.COHERE_API_KEY ||
      process.env['\uFEFFCOHERE_API_KEY'] ||
      ''
    ).trim();

    if (cohereApiKey && parsedInput.dataUrl) {
      try {
        const result = await callCohereVision(
          cohereApiKey,
          parsedInput.dataUrl,
          parsedInput.language
        );
        return NextResponse.json(result, { status: 200 });
      } catch (err) {
        console.warn('[hieroglyph-vision] Cohere Vision failed:', err?.message || err);
      }
    }

    return NextResponse.json(buildGracefulEmptyResult(activeLang), { status: 200 });
  } catch (error) {
    console.error('[translate-hieroglyph] Cohere Vision error:', error?.message || error);
    return NextResponse.json(buildGracefulEmptyResult(activeLang), { status: 200 });
  }
}
