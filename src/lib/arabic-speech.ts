const EASTERN_ARABIC_DIGITS: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
  '٫': '.',
  '٬': ',',
};

const ONES = [
  '',
  'واحد',
  'اثنين',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة',
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
];

const TENS = [
  '',
  'عشرة',
  'عشرين',
  'ثلاثين',
  'أربعين',
  'خمسين',
  'ستين',
  'سبعين',
  'ثمانين',
  'تسعين',
];

const HUNDREDS = [
  '',
  'مئة',
  'مئتين',
  'ثلاثمئة',
  'أربعمئة',
  'خمسمئة',
  'ستمئة',
  'سبعمئة',
  'ثمنمئة',
  'تسعمئة',
];

export function toWesternDigits(input: string): string {
  return String(input || '').replace(/[٠-٩٫٬]/g, (ch) => EASTERN_ARABIC_DIGITS[ch] ?? ch);
}

function underThousandToArabic(n: number): string {
  if (n <= 0) return '';
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rem = n % 100;

  if (h > 0) parts.push(HUNDREDS[h]);

  if (rem > 0) {
    if (rem < 20) {
      parts.push(ONES[rem]);
    } else {
      const u = rem % 10;
      const t = Math.floor(rem / 10);
      if (u > 0) {
        parts.push(`${ONES[u]} و${TENS[t]}`);
      } else {
        parts.push(TENS[t]);
      }
    }
  }

  return parts.join(' و');
}

export function intToArabicWords(num: number): string {
  if (!Number.isFinite(num)) return String(num);
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'صفر';
  if (n > 999999) return String(n);

  const thousands = Math.floor(n / 1000);
  const remainder = n % 1000;
  const parts: string[] = [];

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('ألف');
    } else if (thousands === 2) {
      parts.push('ألفين');
    } else if (thousands <= 10) {
      parts.push(`${ONES[thousands]} آلاف`);
    } else {
      parts.push(`${underThousandToArabic(thousands)} ألف`);
    }
  }

  if (remainder > 0) {
    parts.push(underThousandToArabic(remainder));
  }

  return parts.join(' و');
}

function numericStringToArabicWords(rawNum: string): string {
  const cleaned = rawNum.replace(/,/g, '');
  if (!/^\d+(?:\.\d+)?$/.test(cleaned)) return rawNum;

  if (cleaned.includes('.')) {
    const [intPart, decPart] = cleaned.split('.');
    const intWords = intToArabicWords(Number(intPart));
    const decDigits = decPart
      .split('')
      .map((d) => (d === '0' ? 'صفر' : ONES[Number(d)]))
      .join(' ');
    return `${intWords} فاصلة ${decDigits}`;
  }

  const val = Number(cleaned);
  if (val > 999999) return rawNum;
  return intToArabicWords(val);
}

/**
 * Converts digits, percentages, currencies, and BCE/CE years in Arabic text
 * into natural spoken Arabic words for Web Speech API / TTS engines.
 */
export function normalizeArabicNumbersForSpeech(text: string): string {
  if (!text) return '';
  let normalized = toWesternDigits(text);

  // Replace BCE abbreviations/markers after numbers: e.g. 2560 ق.م or 2560 BCE -> <words> قبل الميلاد
  normalized = normalized.replace(
    /(\d{1,3}(?:,\d{3})*|\d+(?:\.\d+)?)\s*(?:ق\.?\s*م\.?|BCE|BC)\b/gi,
    (_, num) => `${numericStringToArabicWords(num)} قبل الميلاد`
  );

  // Replace CE/AD markers after numbers: e.g. 1922 م or 1922 CE -> <words> ميلادياً
  normalized = normalized.replace(
    /(\d{1,3}(?:,\d{3})*|\d+(?:\.\d+)?)\s*(?:CE|AD)\b/gi,
    (_, num) => `${numericStringToArabicWords(num)} ميلادياً`
  );

  // Replace percentages: e.g. 50% -> خمسين في المئة
  normalized = normalized.replace(
    /(\d{1,3}(?:,\d{3})*|\d+(?:\.\d+)?)\s*%/g,
    (_, num) => `${numericStringToArabicWords(num)} في المئة`
  );

  // Replace currency codes: EGP / ج.م / USD / $
  normalized = normalized.replace(
    /(\d{1,3}(?:,\d{3})*|\d+(?:\.\d+)?)\s*(?:EGP|ج\.?\s*م\.?)\b/gi,
    (_, num) => `${numericStringToArabicWords(num)} جنيه مصري`
  );
  normalized = normalized.replace(
    /(\d{1,3}(?:,\d{3})*|\d+(?:\.\d+)?)\s*(?:USD|\$)/gi,
    (_, num) => `${numericStringToArabicWords(num)} دولار`
  );

  // Replace remaining standalone numbers (0 - 999,999, including decimals and comma-grouped integers)
  normalized = normalized.replace(
    /\b(\d{1,3}(?:,\d{3})*|\d+(?:\.\d+)?)\b/g,
    (match) => numericStringToArabicWords(match)
  );

  return normalized;
}

export interface BidiSegment {
  text: string;
  isNumeric: boolean;
}

/**
 * Splits text into plain and numeric/time segments so numeric tokens can be
 * wrapped in `<bdi dir="ltr">` inside RTL Arabic chat bubbles.
 */
export function splitTextForBidiNumbers(text: string): BidiSegment[] {
  if (!text) return [];
  const tokenRegex = /([0-9٠-٩]+(?:[.,:٫٬][0-9٠-٩]+)*%?)/g;
  const segments: BidiSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(tokenRegex)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      segments.push({ text: text.slice(lastIndex, idx), isNumeric: false });
    }
    segments.push({ text: match[0], isNumeric: true });
    lastIndex = idx + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isNumeric: false });
  }

  return segments;
}
