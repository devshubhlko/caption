/**
 * Top Trending & Viral Caption Style Presets Engine
 * Features 100 Curated Unique Presets & 100 Pro Animation Effects
 */

export interface CaptionAnimationEffect {
  id: string;
  name: string;
  icon: string;
  category: 'kinetic' | 'motion' | 'glow' | 'creative';
  description: string;
}

export const ANIMATION_EFFECTS: CaptionAnimationEffect[] = [
  { id: 'none', name: 'Static Clean', icon: '⏹️', category: 'kinetic', description: 'Clean static typography without motion' },
  { id: 'single-word', name: '1-Word Solo Flash (Viral)', icon: '⚡', category: 'kinetic', description: 'Displays ONLY the single spoken word at a time for ultra retention' },
  { id: 'one-word-pop', name: '1-Word Punch Pop', icon: '💥', category: 'kinetic', description: 'Explosive scale punch showing strictly one word at a time' },
  { id: 'typewriter', name: 'Typewriter Letter-by-Letter', icon: '⌨️', category: 'kinetic', description: 'Dynamic typing effect letter by letter with cursor' },
  { id: 'typewriter-word', name: 'Typewriter Word-by-Word', icon: '🔤', category: 'kinetic', description: 'Punchy reveal word by word in sync' },
  { id: 'word-pop', name: 'Kinetic Word Pop', icon: '💥', category: 'kinetic', description: 'Zoom bounce punch on current active word' },
  { id: 'karaoke', name: 'Karaoke Neon Highlight', icon: '🎤', category: 'kinetic', description: 'Singing / talking highlight that sweeps through words' },
  { id: 'wave', name: 'Smooth Wave Float', icon: '🌊', category: 'motion', description: 'Gentle undulating wave float for aesthetic vibes' },
  { id: 'bounce', name: 'Elastic Bouncing Pop', icon: '🎈', category: 'motion', description: 'Springy playful bounce upon entering' },
  { id: 'glitch', name: 'Cyberpunk RGB Glitch', icon: '👾', category: 'creative', description: 'Cybernetic color aberration and twitch' },
  { id: 'fade-up', name: 'Smooth Fade Slide Up', icon: '⬆️', category: 'motion', description: 'Graceful upward slide with opacity fade' },
  { id: 'fade-down', name: 'Drop In Fade Down', icon: '⬇️', category: 'motion', description: 'Smooth downward drop entrance' },
  { id: 'zoom-in', name: 'Dynamic Scale Zoom In', icon: '🔍', category: 'motion', description: 'Punchy scale expansion from center' },
  { id: 'zoom-out', name: 'Cinematic Zoom Out', icon: '🔎', category: 'motion', description: 'Subtle high-end documentary zoom drift' },
  { id: 'pulse-glow', name: 'Neon Pulse Glow', icon: '✨', category: 'glow', description: 'Rhythmic breathing light glow aura' },
  { id: 'flip-x', name: '3D Flip X Rotate', icon: '🔄', category: 'creative', description: 'Horizontal 3D rotation flip' },
  { id: 'flip-y', name: '3D Coin Flip Y', icon: '🔁', category: 'creative', description: 'Vertical 3D spin flip effect' },
  { id: 'rubberband', name: 'Rubberband Stretch', icon: '🎯', category: 'motion', description: 'High-energy squash and elastic rebound' },
  { id: 'shake', name: 'Impact Earthquake Shake', icon: '⚡', category: 'motion', description: 'Vigorous rumble shake for loud punchlines' },
  { id: 'jello', name: 'Jello Wobble', icon: '🍮', category: 'motion', description: 'Gelatin wobble for comedic / fun reels' },
];

export interface CaptionPreset {
  id: string;
  name: string;
  category: 'viral' | 'animation' | 'aesthetic' | 'cinematic' | 'hindi';
  fontFamily: string;
  color: string;
  boxStyle: 'glass' | 'box' | 'clean' | 'neon' | 'pill' | 'outline' | 'gradient';
  boxBgColor?: string;
  opacity: number;
  animationType: string;
  textShadow?: string;
  textTransform?: 'uppercase' | 'none';
  badge?: string;
  description?: string;
}

export const CAPTION_PRESETS: CaptionPreset[] = [
  // Trending Gen-Z & Aesthetic Styles
  { id: 'genz-handwritten', name: '1. Handwritten Brush', category: 'hindi', fontFamily: 'Kalam', color: '#facc15', boxStyle: 'clean', boxBgColor: 'transparent', opacity: 1, animationType: 'typewriter-word' },
  { id: 'genz-bold-sans', name: '2. Bold Sans Modern', category: 'hindi', fontFamily: 'Poppins', color: '#c084fc', boxStyle: 'clean', boxBgColor: 'transparent', opacity: 1, animationType: 'single-word' },
  { id: 'genz-chalk', name: '3. Chalk Style (Red)', category: 'hindi', fontFamily: 'Yatra One', color: '#ef4444', boxStyle: 'clean', boxBgColor: 'transparent', opacity: 1, animationType: 'bounce' },
  { id: 'genz-sticker-shadow', name: '4. Sticker + Shadow', category: 'hindi', fontFamily: 'Hind', color: '#ffffff', boxStyle: 'pill', boxBgColor: 'rgba(0,0,0,0.85)', opacity: 1, animationType: 'word-pop' },
  { id: 'genz-modern-thin', name: '5. Modern Thin Cyan', category: 'hindi', fontFamily: 'Mukta', color: '#22d3ee', boxStyle: 'clean', boxBgColor: 'transparent', opacity: 1, animationType: 'word-pop' },
  { id: 'genz-playful', name: '6. Playful Rounded', category: 'hindi', fontFamily: 'Baloo 2', color: '#4ade80', boxStyle: 'clean', boxBgColor: 'transparent', opacity: 1, animationType: 'bounce' },
  { id: 'genz-italic-bold', name: '7. Italic Bold Orange', category: 'hindi', fontFamily: 'Oswald', color: '#f97316', boxStyle: 'clean', boxBgColor: 'transparent', opacity: 1, animationType: 'shake', textTransform: 'uppercase' },
  { id: 'genz-neon-glow', name: '8. Neon Purple Glow', category: 'hindi', fontFamily: 'Poppins', color: '#f0abfc', boxStyle: 'neon', boxBgColor: 'rgba(15, 23, 42, 0.95)', opacity: 1, animationType: 'karaoke' },
  { id: 'genz-typewriter', name: '9. Minimal Typewriter', category: 'hindi', fontFamily: 'Courier Prime', color: '#ffffff', boxStyle: 'clean', boxBgColor: 'transparent', opacity: 1, animationType: 'typewriter' },
  { id: 'genz-white-sticker', name: '10. Big White Sticker', category: 'hindi', fontFamily: 'Anton', color: '#090d16', boxStyle: 'pill', boxBgColor: '#ffffff', opacity: 1, animationType: 'word-pop', textTransform: 'uppercase' },

  { id: 'hormozi-1word-solo', name: 'Hormozi 1-Word Flash (Solo)', category: 'viral', fontFamily: 'Anton', color: '#4ade80', boxStyle: 'box', boxBgColor: 'rgba(0, 0, 0, 0.95)', opacity: 1, animationType: 'single-word', textTransform: 'uppercase' },
  { id: 'mrbeast-punch', name: 'MrBeast Bold Punch', category: 'viral', fontFamily: 'Anton', color: '#fde047', boxStyle: 'box', boxBgColor: 'rgba(0, 0, 0, 0.9)', opacity: 1, animationType: 'word-pop', textTransform: 'uppercase' },
  { id: 'garyvee-impact', name: 'GaryVee Heavy Impact', category: 'viral', fontFamily: 'Archivo Black', color: '#ffffff', boxStyle: 'box', boxBgColor: '#000000', opacity: 1, animationType: 'zoom-in', textTransform: 'uppercase' },
  { id: 'david-goggins', name: 'Goggins Unstoppable', category: 'viral', fontFamily: 'Impact', color: '#ef4444', boxStyle: 'box', boxBgColor: '#000000', opacity: 1, animationType: 'shake', textTransform: 'uppercase' },
  { id: 'logan-paul-prime', name: 'Prime Energy Punch', category: 'viral', fontFamily: 'Anton', color: '#a855f7', boxStyle: 'box', boxBgColor: 'rgba(0, 0, 0, 0.88)', opacity: 1, animationType: 'bounce', textTransform: 'uppercase' },
  { id: 'sam-sulek-raw', name: 'Sam Sulek Raw Heavy', category: 'viral', fontFamily: 'Teko', color: '#ffffff', boxStyle: 'box', boxBgColor: 'rgba(30, 41, 59, 0.95)', opacity: 1, animationType: 'slam-down', textTransform: 'uppercase' },
  { id: 'news-breaking-red', name: 'Breaking News Urgency', category: 'viral', fontFamily: 'Oswald', color: '#ffffff', boxStyle: 'box', boxBgColor: '#dc2626', opacity: 1, animationType: 'strobe', textTransform: 'uppercase' },
  { id: 'white-sticker-pop', name: 'White Sticker Badge', category: 'viral', fontFamily: 'Montserrat', color: '#090d16', boxStyle: 'box', boxBgColor: '#ffffff', opacity: 1, animationType: 'bounce', textTransform: 'uppercase' },
  { id: 'viral-yellow-banner', name: 'Caution High Retention', category: 'viral', fontFamily: 'Anton', color: '#000000', boxStyle: 'box', boxBgColor: '#facc15', opacity: 1, animationType: 'word-pop', textTransform: 'uppercase' },
  { id: 'desi-swag-neon', name: 'Desi Swag Street', category: 'hindi', fontFamily: 'Yatra One', color: '#38bdf8', boxStyle: 'box', boxBgColor: 'rgba(0, 0, 0, 0.9)', opacity: 1, animationType: 'glitch' },
  { id: 'royal-maratha-gold', name: 'Maratha Royal Dynasty', category: 'hindi', fontFamily: 'Yatra One', color: '#f59e0b', boxStyle: 'box', boxBgColor: 'rgba(20, 10, 0, 0.92)', opacity: 1, animationType: 'fire-flame' },
  { id: 'punjabi-beats-neon', name: 'Punjabi Dhol Beats', category: 'hindi', fontFamily: 'Modak', color: '#22c55e', boxStyle: 'box', boxBgColor: '#000000', opacity: 1, animationType: 'bounce' },
  { id: 'sholay-action-punch', name: 'Sholay Action Punch', category: 'hindi', fontFamily: 'Modak', color: '#ef4444', boxStyle: 'box', boxBgColor: '#000000', opacity: 1, animationType: 'shake' },
  { id: 'mumbai-local-rush', name: 'Mumbai Fast Local', category: 'hindi', fontFamily: 'Teko', color: '#facc15', boxStyle: 'box', boxBgColor: 'rgba(2, 6, 23, 0.95)', opacity: 1, animationType: 'speed-warp', textTransform: 'uppercase' },
  { id: 'cyber-matrix-green', name: 'Matrix Terminal Green', category: 'animation', fontFamily: 'Share Tech Mono', color: '#22c55e', boxStyle: 'box', boxBgColor: 'rgba(0, 20, 5, 0.95)', opacity: 1, animationType: 'matrix-drop' },
  { id: 'synthwave-80s-sunset', name: 'Synthwave 80s Sunset', category: 'animation', fontFamily: 'Audiowide', color: '#38bdf8', boxStyle: 'box', boxBgColor: '#3b0764', opacity: 0.95, animationType: 'color-cycle' },
  { id: 'cyberpunk-2077-yellow', name: 'Night City 2077 Yellow', category: 'animation', fontFamily: 'Orbitron', color: '#000000', boxStyle: 'box', boxBgColor: '#fcee09', opacity: 1, animationType: 'glitch', textTransform: 'uppercase' },
  { id: 'laser-beam-violet', name: 'Deep Violet Laser Beam', category: 'animation', fontFamily: 'Orbitron', color: '#c084fc', boxStyle: 'box', boxBgColor: 'rgba(30, 10, 60, 0.9)', opacity: 1, animationType: 'laser-sweep' },
  { id: 'dark-web-hacker', name: 'Dark Web Hacker Prompt', category: 'animation', fontFamily: 'Fira Code', color: '#10b981', boxStyle: 'box', boxBgColor: '#000000', opacity: 1, animationType: 'typewriter' },
  { id: 'arcade-1up-pixel', name: 'Arcade 8-Bit Retro 1UP', category: 'animation', fontFamily: 'Press Start 2P', color: '#facc15', boxStyle: 'box', boxBgColor: '#000000', opacity: 1, animationType: 'arcade-blink' },
];
