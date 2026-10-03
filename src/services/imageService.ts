/**
 * Image Project Service
 * Handles Live Pexels API image search, curated HD background assets,
 * dynamic layout presets, text wrapping and canvas drawing for Image Studio.
 */

export type ImageRatioType = '4:5' | '9:16' | '1.91:1' | '16:9' | '1:1';

export interface ImageRatioConfig {
  id: ImageRatioType;
  name: string;
  sublabel: string;
  width: number;
  height: number;
  ratioLabel: string;
  aspectRatioCss: string;
  description: string;
}

export const IMAGE_RATIO_CONFIGS: Record<ImageRatioType, ImageRatioConfig> = {
  '4:5': {
    id: '4:5',
    name: 'Portrait',
    sublabel: 'Instagram Feed / Posts',
    width: 1080,
    height: 1350,
    ratioLabel: '4:5',
    aspectRatioCss: '4 / 5',
    description: '1080 × 1350 px',
  },
  '9:16': {
    id: '9:16',
    name: 'Stories / Reels',
    sublabel: 'Reels / Shorts / TikTok',
    width: 1080,
    height: 1920,
    ratioLabel: '9:16',
    aspectRatioCss: '9 / 16',
    description: '1080 × 1920 px',
  },
  '1.91:1': {
    id: '1.91:1',
    name: 'Landscape',
    sublabel: 'Twitter / Facebook Banners',
    width: 1080,
    height: 566,
    ratioLabel: '1.91:1',
    aspectRatioCss: '1.91 / 1',
    description: '1080 × 566 px',
  },
  '16:9': {
    id: '16:9',
    name: 'Widescreen',
    sublabel: 'YouTube / Desktop Wallpapers',
    width: 1920,
    height: 1080,
    ratioLabel: '16:9',
    aspectRatioCss: '16 / 9',
    description: '1920 × 1080 px',
  },
  '1:1': {
    id: '1:1',
    name: 'Square',
    sublabel: 'Instagram Square / Profile',
    width: 1080,
    height: 1080,
    ratioLabel: '1:1',
    aspectRatioCss: '1 / 1',
    description: '1080 × 1080 px',
  },
};

export interface PexelsPhoto {
  id: string | number;
  thumb: string;
  medium: string;
  full: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
}

export interface CuratedBackground {
  name: string;
  url: string;
  thumb: string;
  category: string;
}

export const CURATED_BACKGROUNDS: CuratedBackground[] = [
  {
    name: 'BMW M5 Dark Front Angle',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=95&w=4320&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=600&auto=format&fit=crop',
    category: 'Cars',
  },
  {
    name: 'BMW M5 Competition Rear View',
    url: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=95&w=4320&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=600&auto=format&fit=crop',
    category: 'Cars',
  },
  {
    name: 'BMW M5 CS Headlight Close-up',
    url: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=95&w=4320&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=600&auto=format&fit=crop',
    category: 'Cars',
  },
  {
    name: 'BMW M5 Studio Front Profile',
    url: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=95&w=4320&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=600&auto=format&fit=crop',
    category: 'Cars',
  },
  {
    name: 'BMW M4 Shadowy Forest Drive',
    url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=95&w=4320&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=600&auto=format&fit=crop',
    category: 'Cars',
  },
  {
    name: 'Classic Sunset Mountain Glow',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=95&w=4320&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop',
    category: 'Aesthetic',
  },
  {
    name: 'Moody Mist Mountains',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=95&w=4320&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
    category: 'Nature',
  },
  {
    name: 'Cyberpunk Neon City',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=95&w=4320&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=600&auto=format&fit=crop',
    category: 'Aesthetic',
  },
  {
    name: 'Minimal Dark Architecture',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=95&w=4320&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
    category: 'Architecture',
  },
];

const PEXELS_API_KEY = 'F5GY5xTk5YuS3NslDKxmhW94LAL51xpts7av26v3BE6mHFvCB5H5KQCn';

export type PexelsOrientation = '' | 'landscape' | 'portrait' | 'square';

/**
 * Searches Pexels for photos using clean valid endpoint with orientation support
 */
export async function searchPexelsPhotos(
  query: string,
  page: number = 1,
  perPage: number = 12,
  orientation?: PexelsOrientation
): Promise<{ photos: PexelsPhoto[]; totalResults: number; hasMore: boolean }> {
  const cleanQuery = query.trim() || 'Nature';
  let url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(cleanQuery)}&per_page=${perPage}&page=${page}`;
  if (orientation) {
    url += `&orientation=${orientation}`;
  }

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!res.ok) {
      throw new Error(`Pexels API error: HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawPhotos = data.photos || [];

    const photos: PexelsPhoto[] = rawPhotos.map((item: any) => {
      const src = item.src || {};
      return {
        id: item.id || Math.random().toString(),
        thumb: src.medium || src.portrait || src.small || src.tiny,
        medium: src.large || src.portrait || src.medium,
        full: src.original || src.large2x || src.large,
        alt: item.alt || `${cleanQuery} photo`,
        photographer: item.photographer || 'Photographer',
        photographerUrl: item.photographer_url || '',
      };
    });

    const totalResults = data.total_results || 0;
    const hasMore = page * perPage < totalResults && photos.length > 0;

    return { photos, totalResults, hasMore };
  } catch (error) {
    console.warn('Pexels search error, providing curated fallback items:', error);
    // Fallback items matching query
    const filteredCurated = CURATED_BACKGROUNDS.filter(
      (bg) =>
        bg.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
        bg.category.toLowerCase().includes(cleanQuery.toLowerCase())
    );
    const fallbackList = filteredCurated.length > 0 ? filteredCurated : CURATED_BACKGROUNDS;

    const photos: PexelsPhoto[] = fallbackList.map((bg, idx) => ({
      id: `curated-${idx}-${Date.now()}`,
      thumb: bg.thumb,
      medium: bg.url,
      full: bg.url,
      alt: bg.name,
      photographer: 'Curated HD Stock',
    }));

    return { photos, totalResults: photos.length, hasMore: false };
  }
}

export interface ImageLayoutPreset {
  id: string;
  name: string;
  fontFamilyName: string;
  fontFamily: string;
  fontSize: number;
  positionPercent: number;
  overlayOpacity: number;
  shadowSoftness: number;
  shadowColorHex: string;
  shadowOpacityPercent: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  textAlignment: 'left' | 'center' | 'right';
  maxTextWidth: number;
}

export const POPULAR_HINDI_FONTS = [
  'Noto Sans Devanagari',
  'Yatra One',
  'Rozha One',
  'Kalam',
  'Modak',
  'Teko',
  'Rajdhani',
  'Mukta',
  'Poppins',
];

export const POPULAR_ENGLISH_FONTS = [
  'Outfit',
  'Poppins',
  'Playfair Display',
  'Pacifico',
  'Inter',
  'Roboto',
  'Montserrat',
  'Cinzel',
  'Bebas Neue',
];

export function generateMagicLayoutPresets(
  currentText: string,
  canvasWidth: number = 1080,
  count: number = 9
): ImageLayoutPreset[] {
  const isHindi = /[\u0900-\u097F]/.test(currentText);
  const fontPool = isHindi ? POPULAR_HINDI_FONTS : POPULAR_ENGLISH_FONTS;
  const alignments: ('left' | 'center' | 'right')[] = ['center', 'center', 'left', 'right', 'center'];

  const presets: ImageLayoutPreset[] = [];

  for (let i = 0; i < count; i++) {
    const fontName = fontPool[i % fontPool.length] || fontPool[0];
    const fontSize = Math.floor(Math.random() * (72 - 42 + 1)) + 42;
    const positionPercent = Math.floor(Math.random() * (68 - 34 + 1)) + 34;
    const overlayOpacity = Math.floor(Math.random() * (65 - 30 + 1)) + 30;
    const shadowSoftness = Math.floor(Math.random() * (22 - 6 + 1)) + 6;
    const shadowColorHex = '#000000';
    const shadowOpacityPercent = Math.floor(Math.random() * (95 - 65 + 1)) + 65;
    const shadowOffsetX = Math.floor(Math.random() * (6 - (-6) + 1)) - 6;
    const shadowOffsetY = Math.floor(Math.random() * (10 - 2 + 1)) + 2;
    const textAlignment = alignments[i % alignments.length];
    const maxTextWidth = Math.floor(canvasWidth * (0.8 + Math.random() * 0.12));

    presets.push({
      id: `preset-${i}-${Date.now()}`,
      name: `Design Style ${i + 1}`,
      fontFamilyName: fontName,
      fontFamily: `'${fontName}', sans-serif`,
      fontSize,
      positionPercent,
      overlayOpacity: overlayOpacity / 100,
      shadowSoftness,
      shadowColorHex,
      shadowOpacityPercent,
      shadowOffsetX,
      shadowOffsetY,
      textAlignment,
      maxTextWidth,
    });
  }

  return presets;
}

/**
 * Text word wrapping helper for Canvas
 */
export function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split('\n');
  const allLines: string[] = [];

  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        allLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      allLines.push(currentLine);
    }
  });

  return allLines;
}
