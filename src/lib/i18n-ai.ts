export type SupportedLocale = 'en' | 'ar' | 'fr' | 'de' | 'it' | 'es' | 'zh' | 'ru';

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  'en',
  'ar',
  'fr',
  'de',
  'it',
  'es',
  'zh',
  'ru',
];

const LANGUAGE_META: Record<SupportedLocale, { name: string; nativeName: string; directive: string }> = {
  en: {
    name: 'English',
    nativeName: 'English',
    directive: 'Write all descriptive text, titles, explanations, tips, and recommendations in clear, natural English.',
  },
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    directive:
      'Write ALL descriptive text, titles, explanations, tips, and recommendations in authentic, natural Modern Standard Arabic using proper Egyptian tourism and Egyptological terminology (e.g., "عصر الدولة الحديثة، الأسرة الثامنة عشرة", "المتحف المصري الكبير", "وادي الملوك"). NEVER use literal machine translation.',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    directive:
      'Write ALL descriptive text, titles, explanations, tips, and recommendations in natural, idiomatic French using accurate French Egyptological and tourism terminology (e.g., "Nouvel Empire, XVIIIe dynastie", "Grand Musée égyptien").',
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    directive:
      'Write ALL descriptive text, titles, explanations, tips, and recommendations in natural, idiomatic German using accurate German Egyptological and tourism terminology (e.g., "Neues Reich, 18. Dynastie", "Großes Ägyptisches Museum").',
  },
  it: {
    name: 'Italian',
    nativeName: 'Italiano',
    directive:
      'Write ALL descriptive text, titles, explanations, tips, and recommendations in natural, idiomatic Italian using accurate Italian Egyptological and tourism terminology (e.g., "Nuovo Regno, XVIII dinastia", "Grande Museo Egizio").',
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    directive:
      'Write ALL descriptive text, titles, explanations, tips, and recommendations in natural, idiomatic Spanish using accurate Spanish Egyptological and tourism terminology (e.g., "Imperio Nuevo, Dinastía XVIII", "Gran Museo Egipcio").',
  },
  zh: {
    name: 'Simplified Chinese',
    nativeName: '中文',
    directive:
      'Write ALL descriptive text, titles, explanations, tips, and recommendations in natural, idiomatic Simplified Chinese using accurate Chinese Egyptological and tourism terminology (e.g., "新王国时期，第十八王朝", "大埃及博物馆").',
  },
  ru: {
    name: 'Russian',
    nativeName: 'Русский',
    directive:
      'Write ALL descriptive text, titles, explanations, tips, and recommendations in natural, idiomatic Russian using accurate Russian Egyptological and tourism terminology (e.g., "Новое царство, XVIII династия", "Большой Египетский музей").',
  },
};

export function normalizeLocale(input?: string | null): SupportedLocale {
  const code = String(input || 'en').trim().toLowerCase().split('-')[0] as SupportedLocale;
  return SUPPORTED_LOCALES.includes(code) ? code : 'en';
}

export function getLanguageMeta(input?: string | null) {
  const locale = normalizeLocale(input);
  return { locale, ...LANGUAGE_META[locale] };
}

export function buildJsonLanguageInstruction(input?: string | null): string {
  const { locale, name, directive } = getLanguageMeta(input);
  return `OUTPUT LANGUAGE REQUIREMENT (${name} / "${locale}"):
- ${directive}
- CRITICAL: Keep ALL JSON property keys in English exactly as specified in the schema. ONLY translate the JSON string values into ${name}.`;
}
