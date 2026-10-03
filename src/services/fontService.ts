/**
 * Live Dynamic Google Fonts Engine
 * Live fetches hundreds of Devanagari (Hindi) and 1,500+ Latin (English) fonts directly from Google Fonts API.
 * Injects dynamic CSS2 CDN links into the DOM on-demand.
 */

import { useState, useEffect } from 'react';

export interface GoogleFontItem {
  id: string;
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  language: 'hi' | 'en' | 'all';
  styleName: string;
  sampleText?: string;
  weights: number[];
  popularity?: number;
  subsets?: string[];
}

const GOOGLE_API_KEY = "AIzaSyCl9SxEXh-nqyUza8E0iyLaHSvRFWix95A";
const GOOGLE_FONTS_API = "https://www.googleapis.com/webfonts/v1/webfonts";

// Track loaded font stylesheets to avoid duplicate network requests
const loadedFontsSet = new Set<string>();

/**
 * Dynamically loads any Google Font into the DOM and awaits its readiness for Canvas / UI rendering.
 */
export async function loadGoogleFont(family: string, weights: number[] = [400, 600, 700, 800, 900]): Promise<boolean> {
  if (!family || family === 'default' || family === 'Inter' || family === 'sans-serif') {
    return true;
  }

  const normalizedFamily = family.trim();
  const fontKey = `${normalizedFamily}_${weights.join(',')}`;

  if (!loadedFontsSet.has(fontKey)) {
    try {
      const formattedFamily = encodeURIComponent(normalizedFamily);
      const weightParams = weights.length > 0 ? `:wght@${weights.join(';')}` : '';
      const url = `https://fonts.googleapis.com/css2?family=${formattedFamily}${weightParams}&display=swap`;

      // Check if link tag already exists
      const existingLink = document.querySelector(`link[data-google-font="${normalizedFamily}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.dataset.googleFont = normalizedFamily;
        document.head.appendChild(link);
      }

      loadedFontsSet.add(fontKey);
    } catch (e) {
      console.warn('Failed to inject font stylesheet:', e);
    }
  }

  // Await font loading in document.fonts for Canvas rendering accuracy
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await (document as any).fonts.load(`16px "${normalizedFamily}"`);
      await (document as any).fonts.ready;
      return true;
    } catch {
      return false;
    }
  }

  return true;
}

// Initial fallback Hindi fonts in case network is initially connecting
export const FALLBACK_HINDI_FONTS: GoogleFontItem[] = [
  { id: 'Poppins', family: 'Poppins', category: 'sans-serif', language: 'hi', styleName: 'Modern Reel Bold', sampleText: 'नमस्ते भारत / Reels ⚡', weights: [400, 600, 700, 800, 900] },
  { id: 'Kalam', family: 'Kalam', category: 'handwriting', language: 'hi', styleName: 'Signature Handwriting', sampleText: 'कलम से दिल तक ❤️', weights: [300, 400, 700] },
  { id: 'Mukta', family: 'Mukta', category: 'sans-serif', language: 'hi', styleName: 'Clean Headline Sans', sampleText: 'मुक्ता शानदार बोल', weights: [300, 400, 600, 700, 800] },
  { id: 'Rajdhani', family: 'Rajdhani', category: 'sans-serif', language: 'hi', styleName: 'Futuristic Tech', sampleText: 'राजधानी एक्सप्रेस 🚀', weights: [400, 500, 600, 700] },
  { id: 'Rozha One', family: 'Rozha One', category: 'serif', language: 'hi', styleName: 'Royal Vintage Serif', sampleText: 'शाही अंदाज़ 👑', weights: [400] },
  { id: 'Yatra One', family: 'Yatra One', category: 'display', language: 'hi', styleName: 'Heritage Classic', sampleText: 'यात्रा शुरू करें 🚩', weights: [400] },
  { id: 'Gotu', family: 'Gotu', category: 'handwriting', language: 'hi', styleName: 'Calligraphy Curves', sampleText: 'गोटू सुंदर अक्षर', weights: [400] },
  { id: 'Modak', family: 'Modak', category: 'display', language: 'hi', styleName: 'Pop Chubby Bold', sampleText: 'मोदक मज़ेदार 🎈', weights: [400] },
  { id: 'Hind', family: 'Hind', category: 'sans-serif', language: 'hi', styleName: 'Bold Headline News', sampleText: 'हिन्द देश के निवासी', weights: [300, 400, 500, 600, 700] },
  { id: 'Tiro Devanagari Hindi', family: 'Tiro Devanagari Hindi', category: 'serif', language: 'hi', styleName: 'Editorial Book Serif', sampleText: 'साहित्य एवं विचार', weights: [400] },
  { id: 'Tillana', family: 'Tillana', category: 'handwriting', language: 'hi', styleName: 'Dance Script Curves', sampleText: 'तिल्लाना मधुर संगीत', weights: [400, 500, 600, 700, 800] },
  { id: 'Sahitya', family: 'Sahitya', category: 'serif', language: 'hi', styleName: 'Classic Devanagari', sampleText: 'साहित्य संगीत कला', weights: [400, 700] },
  { id: 'Ranga', family: 'Ranga', category: 'display', language: 'hi', styleName: 'Artistic Brush', sampleText: 'रंगा रंगीला भारत', weights: [400, 700] },
  { id: 'Pragati Narrow', family: 'Pragati Narrow', category: 'sans-serif', language: 'hi', styleName: 'Compact Caption', sampleText: 'प्रगति की राह पर', weights: [400, 700] },
  { id: 'Halant', family: 'Halant', category: 'serif', language: 'hi', styleName: 'Clean Book Serif', sampleText: 'हलंत शांत सौंदर्य', weights: [300, 400, 500, 600, 700] },
  { id: 'Jaldi', family: 'Jaldi', category: 'sans-serif', language: 'hi', styleName: 'Fast Reading Sans', sampleText: 'जल्दी और सटीक', weights: [400, 700] },
  { id: 'Biryani', family: 'Biryani', category: 'sans-serif', language: 'hi', styleName: 'Geometric Modern', sampleText: 'बिरयानी अनोखा स्वाद', weights: [200, 300, 400, 600, 700, 800, 900] },
  { id: 'Arya', family: 'Arya', category: 'sans-serif', language: 'hi', styleName: 'Contrast Headline', sampleText: 'आर्य गौरवशाली इतिहास', weights: [400, 700] },
  { id: 'Amita', family: 'Amita', category: 'handwriting', language: 'hi', styleName: 'Flowing Cursive', sampleText: 'अमिता सुंदर रचना', weights: [400, 700] },
  { id: 'Karma', family: 'Karma', category: 'serif', language: 'hi', styleName: 'Elegant Literary', sampleText: 'कर्म ही पूजा है', weights: [300, 400, 500, 600, 700] },
  { id: 'Kurale', family: 'Kurale', category: 'serif', language: 'hi', styleName: 'Ornate Antique', sampleText: 'कुराले प्राचीन धरोहर', weights: [400] },
  { id: 'Eczar', family: 'Eczar', category: 'serif', language: 'hi', styleName: 'High Impact Serif', sampleText: 'एकज़ार गहरा प्रभाव', weights: [400, 500, 600, 700, 800] },
  { id: 'Khand', family: 'Khand', category: 'sans-serif', language: 'hi', styleName: 'Sharp Punch Bold', sampleText: 'खंड शक्ति और सामर्थ्य', weights: [300, 400, 500, 600, 700] },
  { id: 'Sarala', family: 'Sarala', category: 'sans-serif', language: 'hi', styleName: 'Minimal Clear', sampleText: 'सरला सरल जीवन', weights: [400, 700] },
  { id: 'Dekko', family: 'Dekko', category: 'handwriting', language: 'hi', styleName: 'Casual Friendly Marker', sampleText: 'देखो नया सवेरा', weights: [400] },
  { id: 'Laila', family: 'Laila', category: 'serif', language: 'hi', styleName: 'Poetic Grace', sampleText: 'लैला मधुर कविता', weights: [300, 400, 500, 600, 700] },
  { id: 'Federo', family: 'Federo', category: 'display', language: 'hi', styleName: 'Retro Elegant', sampleText: 'फेडरो नया अंदाज़', weights: [400] },
  { id: 'Martel', family: 'Martel', category: 'serif', language: 'hi', styleName: 'Heavy Duty Serif', sampleText: 'मार्तेल मजबूत इरादा', weights: [200, 300, 400, 600, 700, 800, 900] },
  { id: 'Samyak Devanagari', family: 'Samyak Devanagari', category: 'serif', language: 'hi', styleName: 'Traditional Veda', sampleText: 'सम्यक ज्ञान प्रकाश', weights: [400] },
  { id: 'Asar', family: 'Asar', category: 'serif', language: 'hi', styleName: 'Spiritual Inscription', sampleText: 'असर गहरा प्रभाव', weights: [400] },
  { id: 'Glegoo', family: 'Glegoo', category: 'serif', language: 'hi', styleName: 'Modern Slab Serif', sampleText: 'ग्लिगो मजबूत बोल', weights: [400, 700] },
  { id: 'Changa One', family: 'Changa One', category: 'display', language: 'hi', styleName: 'Heavy Impact Punch', sampleText: 'चंगा मस्त अंदाज़', weights: [400] },
  { id: 'Rhodium Libre', family: 'Rhodium Libre', category: 'serif', language: 'hi', styleName: 'Modern Devanagari', sampleText: 'रोडियम नई सुबह', weights: [400] },
  { id: 'Martel Sans', family: 'Martel Sans', category: 'sans-serif', language: 'hi', styleName: 'Clean Indian Sans', sampleText: 'मार्तेल सरल स्पष्ट', weights: [300, 400, 600, 700, 800] },
  { id: 'Vesper Libre', family: 'Vesper Libre', category: 'serif', language: 'hi', styleName: 'Literary Novel', sampleText: 'वेस्पर ज्ञान सुधा', weights: [400, 500, 700] },
  { id: 'Akshar', family: 'Akshar', category: 'sans-serif', language: 'hi', styleName: 'Variable Modern Sans', sampleText: 'अक्षर अनमोल शब्द', weights: [400, 600, 700] },
  { id: 'Baloo 2', family: 'Baloo 2', category: 'display', language: 'hi', styleName: 'Bouncy Bubble Bold', sampleText: 'बालू चुलबुला अंदाज़', weights: [400, 600, 700, 800] },
  { id: 'Anek Devanagari', family: 'Anek Devanagari', category: 'sans-serif', language: 'hi', styleName: 'Contemporary Variable', sampleText: 'अनेक रंग अनेक रूप', weights: [400, 600, 700, 800] },
  { id: 'Noto Sans Devanagari', family: 'Noto Sans Devanagari', category: 'sans-serif', language: 'hi', styleName: 'Universal Clear Devanagari', sampleText: 'नोतो सर्वव्यापी देवनागरी', weights: [400, 600, 700] },
  { id: 'Noto Serif Devanagari', family: 'Noto Serif Devanagari', category: 'serif', language: 'hi', styleName: 'Classic Book Typography', sampleText: 'नोतो क्लासिक साहित्य', weights: [400, 600, 700] },
  { id: 'Yantramanav', family: 'Yantramanav', category: 'sans-serif', language: 'hi', styleName: 'Industrial Geometric Sans', sampleText: 'यंत्रमानव आधुनिक तकनीक', weights: [300, 400, 500, 700, 900] },
  { id: 'Gajraj One', family: 'Gajraj One', category: 'display', language: 'hi', styleName: 'Heavy Elephant Punch', sampleText: 'गजराज शक्तिशाली', weights: [400] },
  { id: 'Tiro Devanagari Sanskrit', family: 'Tiro Devanagari Sanskrit', category: 'serif', language: 'hi', styleName: 'Sanskrit Vedic Classical', sampleText: 'संस्कृतं ज्ञानगंगा', weights: [400] },
  { id: 'Sura', family: 'Sura', category: 'serif', language: 'hi', styleName: 'Divine Traditional', sampleText: 'सुरा दिव्य विचार', weights: [400, 700] },
  { id: 'Palanquin', family: 'Palanquin', category: 'sans-serif', language: 'hi', styleName: 'Friendly Light Sans', sampleText: 'पालकी सुंदर यात्रा', weights: [400, 600, 700] },
  { id: 'Palanquin Dark', family: 'Palanquin Dark', category: 'sans-serif', language: 'hi', styleName: 'Heavy Duty Palanquin', sampleText: 'पालकी गहरा प्रभाव', weights: [400, 600, 700] },
];

// Initial fallback English fonts
export const FALLBACK_ENGLISH_FONTS: GoogleFontItem[] = [
  { id: 'Anton', family: 'Anton', category: 'sans-serif', language: 'en', styleName: 'Viral Heavy Punch', sampleText: 'VIRAL REELS IMPACT', weights: [400] },
  { id: 'Bebas Neue', family: 'Bebas Neue', category: 'display', language: 'en', styleName: 'Tall Cinematic Caps', sampleText: 'BEBAS SHORTS BOLD', weights: [400] },
  { id: 'Montserrat', family: 'Montserrat', category: 'sans-serif', language: 'en', styleName: 'Trending Clean Bold', sampleText: 'TRENDING AESTHETIC', weights: [400, 600, 700, 800, 900] },
  { id: 'Pacifico', family: 'Pacifico', category: 'handwriting', language: 'en', styleName: 'Summer Wave Brush', sampleText: 'Summer Vibes Mood', weights: [400] },
  { id: 'Caveat', family: 'Caveat', category: 'handwriting', language: 'en', styleName: 'Authentic Cursive', sampleText: 'Quotes & Memories ✨', weights: [400, 600, 700] },
  { id: 'Righteous', family: 'Righteous', category: 'display', language: 'en', styleName: 'Cyberpunk Glow 80s', sampleText: 'CYBERPUNK GLOW', weights: [400] },
  { id: 'Lobster', family: 'Lobster', category: 'display', language: 'en', styleName: 'Vintage Headline Reel', sampleText: 'Vintage Headline Reel', weights: [400] },
  { id: 'Oswald', family: 'Oswald', category: 'sans-serif', language: 'en', styleName: 'Punchy Condensed', sampleText: 'BREAKING NEWS ALERT', weights: [400, 600, 700] },
  { id: 'Outfit', family: 'Outfit', category: 'sans-serif', language: 'en', styleName: 'Ultra Modern Tech', sampleText: 'Creator Economy 2026', weights: [400, 600, 700, 800] },
  { id: 'Playfair Display', family: 'Playfair Display', category: 'serif', language: 'en', styleName: 'Luxury High Fashion', sampleText: 'Luxury & Vogue Lifestyle', weights: [400, 600, 700, 800, 900] },
  { id: 'Cinzel', family: 'Cinzel', category: 'serif', language: 'en', styleName: 'Epic Roman Cinematic', sampleText: 'WARRIORS & KINGS', weights: [400, 600, 700, 800] },
  { id: 'Permanent Marker', family: 'Permanent Marker', category: 'handwriting', language: 'en', styleName: 'Bold Graffiti Marker', sampleText: 'RAW & UNFILTERED', weights: [400] },
  { id: 'Orbitron', family: 'Orbitron', category: 'display', language: 'en', styleName: 'Sci-Fi Futuristic', sampleText: 'CYBER DIMENSION 3.0', weights: [400, 600, 700, 900] },
  { id: 'Bangers', family: 'Bangers', category: 'display', language: 'en', styleName: 'Comic Pop Punch', sampleText: 'BOOM! CRAZY ACTION', weights: [400] },
  { id: 'Abril Fatface', family: 'Abril Fatface', category: 'serif', language: 'en', styleName: 'High Drama Title', sampleText: 'Vogue Editorial Master', weights: [400] },
  { id: 'Audiowide', family: 'Audiowide', category: 'display', language: 'en', styleName: 'Synthwave Techno', sampleText: 'SPEED RACER DRIFT', weights: [400] },
  { id: 'Syne', family: 'Syne', category: 'sans-serif', language: 'en', styleName: 'Hyper Trendy Aesthetic', sampleText: 'FUTURE DESIGN CULTURE', weights: [600, 700, 800] },
  { id: 'Archivo Black', family: 'Archivo Black', category: 'sans-serif', language: 'en', styleName: 'Maximum Contrast Heavy', sampleText: 'PODCAST HIGHLIGHTS', weights: [400] },
  { id: 'Great Vibes', family: 'Great Vibes', category: 'handwriting', language: 'en', styleName: 'Graceful Calligraphy', sampleText: 'Wedding & Special Moments', weights: [400] },
  { id: 'Satisfy', family: 'Satisfy', category: 'handwriting', language: 'en', styleName: 'Smooth Signature Script', sampleText: 'Love Story Chronicles', weights: [400] },
  { id: 'Alfa Slab One', family: 'Alfa Slab One', category: 'serif', language: 'en', styleName: 'Heavy Slab Block', sampleText: 'MASSIVE TITLE DROP', weights: [400] },
  { id: 'Fredoka', family: 'Fredoka', category: 'sans-serif', language: 'en', styleName: 'Cute Rounded Friendly', sampleText: 'Fun & Playful Moments', weights: [400, 600, 700] },
  { id: 'Russo One', family: 'Russo One', category: 'sans-serif', language: 'en', styleName: 'Gaming Esports Heavy', sampleText: 'LEVEL UP CHAMPION', weights: [400] },
  { id: 'Roboto', family: 'Roboto', category: 'sans-serif', language: 'en', styleName: 'Google Material Modern', sampleText: 'Android Global Standard', weights: [400, 500, 700, 900] },
  { id: 'Inter', family: 'Inter', category: 'sans-serif', language: 'en', styleName: 'Pixel Perfect UI', sampleText: 'Software Interface 2026', weights: [400, 600, 700, 800] },
  { id: 'Lato', family: 'Lato', category: 'sans-serif', language: 'en', styleName: 'Warm Corporate Sans', sampleText: 'Building The Future', weights: [400, 700, 900] },
  { id: 'Lilita One', family: 'Lilita One', category: 'display', language: 'en', styleName: 'Fat Chunky Shorts', sampleText: 'LILITA ONE SHORTS', weights: [400] },
  { id: 'Luckiest Guy', family: 'Luckiest Guy', category: 'display', language: 'en', styleName: 'MrBeast Style Punch', sampleText: 'I GAVE AWAY $100,000!', weights: [400] },
  { id: 'Titan One', family: 'Titan One', category: 'display', language: 'en', styleName: 'Titan Extra Chunky', sampleText: 'TITAN HEAVY IMPACT', weights: [400] },
  { id: 'Paytone One', family: 'Paytone One', category: 'sans-serif', language: 'en', styleName: 'Ultra Clean Poster Punch', sampleText: 'PAYTONE BOLD REEL', weights: [400] },
  { id: 'Bowlby One SC', family: 'Bowlby One SC', category: 'display', language: 'en', styleName: 'Blocky Massive Caps', sampleText: 'BOWLBY MASSIVE CAPS', weights: [400] },
  { id: 'Black Ops One', family: 'Black Ops One', category: 'display', language: 'en', styleName: 'Military Stencil Bold', sampleText: 'TACTICAL MISSION ALERT', weights: [400] },
  { id: 'Sigmar', family: 'Sigmar', category: 'display', language: 'en', styleName: 'Playful Big Impact', sampleText: 'SIGMAR TRENDY VIBES', weights: [400] },
  { id: 'Squada One', family: 'Squada One', category: 'display', language: 'en', styleName: 'Condensed Tech Athletic', sampleText: 'SQUADA SPEED REEL', weights: [400] },
  { id: 'Rubik', family: 'Rubik', category: 'sans-serif', language: 'en', styleName: 'Friendly Rounded Bold', sampleText: 'Rubik Smooth Modern', weights: [400, 600, 700, 800, 900] },
  { id: 'Work Sans', family: 'Work Sans', category: 'sans-serif', language: 'en', styleName: 'Grotesque Contemporary', sampleText: 'Work Sans Architecture', weights: [400, 600, 700, 800] },
  { id: 'DM Sans', family: 'DM Sans', category: 'sans-serif', language: 'en', styleName: 'Silicon Valley Clean', sampleText: 'Minimal Clean Modern', weights: [400, 500, 700] },
  { id: 'Space Grotesk', family: 'Space Grotesk', category: 'sans-serif', language: 'en', styleName: 'Tech Brutalism', sampleText: 'AI GENERATION NEXT', weights: [400, 600, 700] },
  { id: 'Dancing Script', family: 'Dancing Script', category: 'handwriting', language: 'en', styleName: 'Bouncy Casual Script', sampleText: 'Dancing Through Life ✨', weights: [400, 700] },
  { id: 'Kaushan Script', family: 'Kaushan Script', category: 'handwriting', language: 'en', styleName: 'Expressive Brush Paint', sampleText: 'Express Yourself Boldly', weights: [400] },
  { id: 'Sacramento', family: 'Sacramento', category: 'handwriting', language: 'en', styleName: 'Delicate Monoline Script', sampleText: 'Delicate & Charming', weights: [400] },
  { id: 'Monoton', family: 'Monoton', category: 'display', language: 'en', styleName: 'Disco Neon Lines', sampleText: 'DISCO FEVER NIGHT', weights: [400] },
  { id: 'Bungee', family: 'Bungee', category: 'display', language: 'en', styleName: 'Urban Street Billboard', sampleText: 'CITY STREETS 2026', weights: [400] },
  { id: 'Creepster', family: 'Creepster', category: 'display', language: 'en', styleName: 'Horror Blood Dripping', sampleText: 'MIDNIGHT HORROR TALE', weights: [400] },
  { id: 'Courgette', family: 'Courgette', category: 'handwriting', language: 'en', styleName: 'Compact Elegant Cursive', sampleText: 'Charming & Graceful', weights: [400] },
  { id: 'Shadows Into Light', family: 'Shadows Into Light', category: 'handwriting', language: 'en', styleName: 'Neat Feminine Script', sampleText: 'Daily Journal Notes', weights: [400] },
];

export let HINDI_GOOGLE_FONTS: GoogleFontItem[] = [...FALLBACK_HINDI_FONTS];
export let ENGLISH_GOOGLE_FONTS: GoogleFontItem[] = [...FALLBACK_ENGLISH_FONTS];
export let ALL_GOOGLE_FONTS: GoogleFontItem[] = [...FALLBACK_HINDI_FONTS, ...FALLBACK_ENGLISH_FONTS];

// Parse variants like ['regular', '700', 'italic', '700italic'] into numeric weights
function parseWeights(variants: string[]): number[] {
  const weights = new Set<number>();
  variants.forEach((v) => {
    if (v === 'regular' || v === 'italic') weights.add(400);
    else {
      const match = v.match(/\d+/);
      if (match) weights.add(parseInt(match[0], 10));
    }
  });
  return weights.size > 0 ? Array.from(weights).sort((a, b) => a - b) : [400, 700];
}

// Convert raw Google Fonts API item to GoogleFontItem
function transformApiFont(item: any, language: 'hi' | 'en'): GoogleFontItem {
  const family = item.family || 'Sans';
  const category = (item.category || 'sans-serif') as GoogleFontItem['category'];
  const weights = item.variants ? parseWeights(item.variants) : [400, 700];
  const styleName = `${category.charAt(0).toUpperCase() + category.slice(1)} • ${weights.length} weights`;
  const sampleText = language === 'hi' ? 'नमस्ते भारत / Reels' : 'Viral Captions ⚡';

  return {
    id: family,
    family,
    category,
    language,
    styleName,
    sampleText,
    weights,
    subsets: item.subsets || [],
  };
}

// Global Store Listeners for live font updates
type FontListener = (fonts: { hindi: GoogleFontItem[]; english: GoogleFontItem[]; isLoading: boolean }) => void;
const fontListeners = new Set<FontListener>();

let isFetchingFonts = false;
let hasFetchedLive = false;

function notifyListeners() {
  fontListeners.forEach((listener) => {
    listener({
      hindi: HINDI_GOOGLE_FONTS,
      english: ENGLISH_GOOGLE_FONTS,
      isLoading: isFetchingFonts,
    });
  });
}

/**
 * Live Fetch all Google Fonts from Google API without limits
 */
export async function fetchLiveGoogleFonts(): Promise<{ hindi: GoogleFontItem[]; english: GoogleFontItem[] }> {
  if (hasFetchedLive && HINDI_GOOGLE_FONTS.length > 50) {
    return { hindi: HINDI_GOOGLE_FONTS, english: ENGLISH_GOOGLE_FONTS };
  }

  isFetchingFonts = true;
  notifyListeners();

  try {
    // Try reading cache from localStorage first for instant load
    if (typeof window !== 'undefined') {
      try {
        const cachedHindi = localStorage.getItem('live_gf_devanagari');
        const cachedEnglish = localStorage.getItem('live_gf_latin');
        if (cachedHindi && cachedEnglish) {
          const parsedH = JSON.parse(cachedHindi);
          const parsedE = JSON.parse(cachedEnglish);
          if (Array.isArray(parsedH) && parsedH.length > 0) HINDI_GOOGLE_FONTS = parsedH;
          if (Array.isArray(parsedE) && parsedE.length > 0) ENGLISH_GOOGLE_FONTS = parsedE;
          ALL_GOOGLE_FONTS = [...HINDI_GOOGLE_FONTS, ...ENGLISH_GOOGLE_FONTS];
          notifyListeners();
        }
      } catch (e) {
        // Ignore cache parsing error
      }
    }

    // Live API fetch for Hindi (devanagari) & English (latin)
    const [hindiRes, englishRes] = await Promise.all([
      fetch(`${GOOGLE_FONTS_API}?key=${encodeURIComponent(GOOGLE_API_KEY)}&subset=devanagari&capability=WOFF2&sort=alpha`),
      fetch(`${GOOGLE_FONTS_API}?key=${encodeURIComponent(GOOGLE_API_KEY)}&subset=latin&capability=WOFF2&sort=popularity`),
    ]);

    if (hindiRes.ok) {
      const data = await hindiRes.json();
      if (data.items && Array.isArray(data.items)) {
        HINDI_GOOGLE_FONTS = data.items.map((item: any) => transformApiFont(item, 'hi'));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('live_gf_devanagari', JSON.stringify(HINDI_GOOGLE_FONTS));
          } catch {}
        }
      }
    }

    if (englishRes.ok) {
      const data = await englishRes.json();
      if (data.items && Array.isArray(data.items)) {
        ENGLISH_GOOGLE_FONTS = data.items.map((item: any) => transformApiFont(item, 'en'));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('live_gf_latin', JSON.stringify(ENGLISH_GOOGLE_FONTS));
          } catch {}
        }
      }
    }

    ALL_GOOGLE_FONTS = [...HINDI_GOOGLE_FONTS, ...ENGLISH_GOOGLE_FONTS];
    hasFetchedLive = true;
  } catch (error) {
    console.warn('Live Google Fonts fetch encountered an issue, using fallback/cached fonts:', error);
  } finally {
    isFetchingFonts = false;
    notifyListeners();
  }

  return { hindi: HINDI_GOOGLE_FONTS, english: ENGLISH_GOOGLE_FONTS };
}

// React Hook to subscribe to live Google Fonts
export function useLiveGoogleFonts() {
  const [fonts, setFonts] = useState<{
    hindi: GoogleFontItem[];
    english: GoogleFontItem[];
    isLoading: boolean;
  }>({
    hindi: HINDI_GOOGLE_FONTS,
    english: ENGLISH_GOOGLE_FONTS,
    isLoading: isFetchingFonts,
  });

  useEffect(() => {
    const listener: FontListener = (updated) => {
      setFonts({ ...updated });
    };

    fontListeners.add(listener);

    // Trigger initial fetch if not yet started
    if (!hasFetchedLive && !isFetchingFonts) {
      fetchLiveGoogleFonts();
    }

    return () => {
      fontListeners.delete(listener);
    };
  }, []);

  return {
    hindiFonts: fonts.hindi,
    englishFonts: fonts.english,
    isLoading: fonts.isLoading,
    refresh: fetchLiveGoogleFonts,
  };
}

// Automatically trigger live fetch on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    fetchLiveGoogleFonts();
  }, 100);
}
