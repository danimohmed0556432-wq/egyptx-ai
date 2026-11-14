const BAD_FILENAME_TOKENS = [
  '.svg',
  '.pdf',
  '.tif',
  '.tiff',
  '.djvu',
  '.ogg',
  '.ogv',
  '.webm',
  'black_and_white',
  'black-and-white',
  'monochrome',
  'portrait',
  'headshot',
  'engraving',
  'sketch',
  'map_of',
  'flag_of',
  'coat_of_arms',
  'logo',
  'icon',
  'diagram',
  'floorplan',
  'floor_plan',
  'coin_',
  'stamp_',
];

const BAD_UNSPLASH_TOKENS = [
  'portrait',
  'vintage',
  'monochrome',
  'black and white',
  'black-and-white',
  'selfie',
  'headshot',
];

const VERIFIED_CITY_HERO_IMAGES: Record<string, string[]> = {
  cairo: [
    'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=1000&q=80',
  ],
  giza: [
    'https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1000&q=80',
  ],
  luxor: [
    'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1000&q=80',
  ],
  aswan: [
    'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1000&q=80',
  ],
  alexandria: [
    'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=1000&q=80',
  ],
  hurghada: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
  ],
  sharm: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
  ],
  dahab: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
  ],
  siwa: [
    'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1000&q=80',
  ],
  fayoum: [
    'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1000&q=80',
  ],
  nile: [
    'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1000&q=80',
  ],
};

export function getVerifiedCityHeroImage(
  cityOrQuery?: string,
  usedUrls?: Set<string>
): string {
  const lower = String(cityOrQuery || '').toLowerCase();
  const allPool = Object.values(VERIFIED_CITY_HERO_IMAGES).flat();

  for (const [key, urls] of Object.entries(VERIFIED_CITY_HERO_IMAGES)) {
    if (lower.includes(key)) {
      const unused = urls.find((u) => !usedUrls?.has(u));
      if (unused) {
        usedUrls?.add(unused);
        return unused;
      }
    }
  }

  const anyUnused = allPool.find((u) => !usedUrls?.has(u));
  const chosen = anyUnused || VERIFIED_CITY_HERO_IMAGES.giza[0];
  usedUrls?.add(chosen);
  return chosen;
}

function isCleanPhotoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  for (const token of BAD_FILENAME_TOKENS) {
    if (lower.includes(token)) return false;
  }
  return /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url) || /\/(jpg|jpeg|png|webp)/i.test(url);
}

/**
 * Step B: Query official English Wikipedia PageImages API for the exact monument title.
 */
export async function searchWikipediaExactPageImage(
  exactLandmarkName: string,
  usedUrls?: Set<string>
): Promise<string | null> {
  const cleanTitle = exactLandmarkName.trim();
  if (!cleanTitle) return null;

  try {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      cleanTitle
    )}&prop=pageimages&format=json&pithumbsize=1000&redirects=1&origin=*`;

    const res = await fetch(endpoint, {
      headers: {
        'User-Agent': 'EgyptXAI-TravelPlanner/1.0',
      },
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages || typeof pages !== 'object') return null;

    for (const page of Object.values(pages) as any[]) {
      const thumb = page?.thumbnail;
      const url = thumb?.source;
      if (!url || typeof url !== 'string') continue;
      if (usedUrls?.has(url)) continue;
      if (!isCleanPhotoUrl(url)) continue;

      const width = Number(thumb?.width || 0);
      const height = Number(thumb?.height || 0);
      if (width > 0 && height > 0 && height > width * 1.15) continue;

      usedUrls?.add(url);
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Step C: Wikimedia Commons fallback filtering strictly for landscape .jpg/.jpeg/.png photos.
 */
export async function searchWikimediaMonumentPhoto(
  exactLandmarkName: string,
  usedUrls?: Set<string>
): Promise<string | null> {
  const cleanQuery = exactLandmarkName.trim();
  if (!cleanQuery) return null;

  try {
    const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      `${cleanQuery} Egypt`
    )}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size&iiurlwidth=1000&format=json&origin=*`;

    const res = await fetch(endpoint, {
      headers: {
        'User-Agent': 'EgyptXAI-TravelPlanner/1.0',
      },
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages || typeof pages !== 'object') return null;

    const sortedPages = Object.values(pages).sort(
      (a: any, b: any) => (a?.index ?? 999) - (b?.index ?? 999)
    ) as any[];

    for (const page of sortedPages) {
      const info = Array.isArray(page?.imageinfo) ? page.imageinfo[0] : null;
      const url = String(info?.thumburl || info?.url || '');
      if (!url || usedUrls?.has(url)) continue;

      const title = String(page?.title || '').toLowerCase();
      if (BAD_FILENAME_TOKENS.some((token) => title.includes(token))) continue;
      if (!/\.(jpg|jpeg|png)(\?|$)/i.test(url)) continue;

      const width = Number(info?.thumbwidth || info?.width || 0);
      const height = Number(info?.thumbheight || info?.height || 0);
      if (width > 0 && height > 0 && width <= height) continue;
      if (width > 0 && width < 400) continue;

      usedUrls?.add(url);
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Step D: Filtered Unsplash fallback with portrait/monochrome rejection and deduplication.
 */
export async function searchFilteredUnsplashPhoto(
  exactLandmarkName: string,
  usedUrls?: Set<string>
): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!accessKey || !exactLandmarkName.trim()) return null;

  try {
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      `${exactLandmarkName.trim()} Egypt`
    )}&orientation=landscape&content_filter=high&per_page=5`;

    const res = await fetch(unsplashUrl, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];

    for (const item of results) {
      const url = String(item?.urls?.regular || '');
      if (!url || usedUrls?.has(url)) continue;

      const width = Number(item?.width || 0);
      const height = Number(item?.height || 0);
      if (width > 0 && height > 0 && height >= width) continue;

      const textBlob = [
        item?.alt_description || '',
        item?.description || '',
        item?.slug || '',
        ...(Array.isArray(item?.tags)
          ? item.tags.map((t: any) => String(t?.title || ''))
          : []),
      ]
        .join(' ')
        .toLowerCase();

      if (BAD_UNSPLASH_TOKENS.some((token) => textBlob.includes(token))) {
        continue;
      }

      usedUrls?.add(url);
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

export async function resolveEgyptianLandmarkImage(
  exactLandmarkName: string,
  city?: string,
  usedUrls?: Set<string>
): Promise<{
  url: string;
  source: 'wikipedia' | 'wikimedia' | 'unsplash' | 'city-hero';
}> {
  const cleanName =
    String(exactLandmarkName || '').trim() || `${city || 'Egypt'}`;

  // Step B: Wikipedia PageImages API (highest accuracy for exact monument)
  const wikiPageUrl = await searchWikipediaExactPageImage(cleanName, usedUrls);
  if (wikiPageUrl) {
    return { url: wikiPageUrl, source: 'wikipedia' };
  }

  // Step C: Wikimedia Commons landscape .jpg/.jpeg/.png fallback
  const commonsUrl = await searchWikimediaMonumentPhoto(cleanName, usedUrls);
  if (commonsUrl) {
    return { url: commonsUrl, source: 'wikimedia' };
  }

  // Step D: Filtered Unsplash fallback with deduplication
  const unsplashUrl = await searchFilteredUnsplashPhoto(cleanName, usedUrls);
  if (unsplashUrl) {
    return { url: unsplashUrl, source: 'unsplash' };
  }

  // Final verified city-hero fallback (deduplicated)
  return {
    url: getVerifiedCityHeroImage(`${city || ''} ${cleanName}`, usedUrls),
    source: 'city-hero',
  };
}
