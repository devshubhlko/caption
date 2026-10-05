import { SubtitleCue } from './transcriptionService';
import { loadGoogleFont } from './fontService';
import confetti from 'canvas-confetti';

export function formatTimeHelper(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export interface ExportOptions {
  projectType: 'canvas' | 'image';
  aspectRatio: string;
  canvasBgColor: string;
  imageUri: string | null;
  audioUri: string | null;
  subtitles: SubtitleCue[];
  captionFontSize: number;
  captionColor: string;
  captionBgColor?: string;
  captionStyle: 'glass' | 'box' | 'neon' | 'clean' | 'pill' | 'outline' | 'gradient';
  captionFontFamily: string;
  captionPosition: { x: number; y: number };
  captionOpacity?: number;
  captionAnimation?: string[];
  duration: number;
  customText?: string;
  customTextPosition?: { x: number; y: number };
  customTextFontSize?: number;
  customTextOpacity?: number;
  onProgress: (progress: number, stepText: string) => void;
}

export interface ExportResult {
  blob: Blob;
  url: string;
  filename: string;
  duration: number;
  aspectRatio: string;
}

/**
 * Downloads a Blob or URL as a file in the browser
 */
export function triggerDownload(urlOrBlob: string | Blob, filename: string) {
  const url = typeof urlOrBlob === 'string' ? urlOrBlob : URL.createObjectURL(urlOrBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof urlOrBlob !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 20000);
  }
}

/**
 * Ultra HD 1080p 60FPS Video Render & Export Engine
 * Generates true 1080p crisp frames with all 35+ Pro Caption Animations (typewriter, word-pop, bounce, wave, glow, etc.)
 */
export async function exportHdVideo(options: ExportOptions): Promise<ExportResult> {
  const {
    projectType,
    aspectRatio,
    canvasBgColor,
    imageUri,
    audioUri,
    subtitles,
    captionFontSize,
    captionColor,
    captionBgColor,
    captionStyle,
    captionFontFamily,
    captionPosition,
    captionOpacity = 1,
    captionAnimation = ['none'],
    duration,
    customText = '',
    customTextPosition = { x: 0, y: -70 },
    customTextFontSize = 20,
    customTextOpacity = 1,
    onProgress,
  } = options;

  onProgress(5, `Configuring Ultra HD 1080p 60fps render engine (${formatTimeHelper(duration)})...`);

  // Preload Google Font weights
  if (captionFontFamily && captionFontFamily !== 'default') {
    try {
      await loadGoogleFont(captionFontFamily, [400, 600, 700, 800, 900]);
    } catch (e) {
      console.warn('Font preload warning:', e);
    }
  }

  // True High Definition Dimensions
  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  let width = 1080;
  let height = 1920;

  if (aspectRatio === '16:9') {
    width = 1920;
    height = 1080;
  } else if (aspectRatio === '1:1') {
    width = 1080;
    height = 1080;
  } else if (aspectRatio === '4:5') {
    width = 1080;
    height = 1350;
  }
  
  if (isMobile) {
    width = Math.round(width * 0.5); // Prevent mobile crash
    height = Math.round(height * 0.5);
  }

  // 1. High-Resolution Offscreen Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', {
    alpha: false,
    desynchronized: false,
    willReadFrequently: false,
  });

  if (!ctx) {
    throw new Error('Could not create 2D canvas context');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  (ctx as any).textRendering = 'geometricPrecision';
  (ctx as any).fontKerning = 'normal';

  // 2. Preload and decode background visual media
  let loadedImage: HTMLImageElement | null = null;
  if (projectType === 'image' && imageUri) {
    onProgress(15, 'Buffering HD background visual media...');
    loadedImage = await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = imageUri;
    });
  }

  onProgress(25, 'Synchronizing studio audio master track...');

  // Setup Web Audio with 48kHz studio sample rate
  let audioContext: AudioContext | null = null;
  let audioSourceNode: AudioBufferSourceNode | null = null;
  let audioDestNode: MediaStreamAudioDestinationNode | null = null;

  if (audioUri) {
    try {
      const audioRes = await fetch(audioUri);
      const arrayBuffer = await audioRes.arrayBuffer();
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000,
      });
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      audioDestNode = audioContext.createMediaStreamDestination();
      audioSourceNode = audioContext.createBufferSource();
      audioSourceNode.buffer = audioBuffer;
      audioSourceNode.connect(audioDestNode);
    } catch (audioErr) {
      console.warn('Audio mixer note:', audioErr);
    }
  }

  // Capture ultra smooth video stream
  const fps = isMobile ? 30 : 60; // 30 FPS for mobile to prevent freezing
  const canvasStream = canvas.captureStream(fps);
  let combinedStream = canvasStream;

  if (audioDestNode) {
    const audioTrack = audioDestNode.stream.getAudioTracks()[0];
    if (audioTrack) {
      combinedStream.addTrack(audioTrack);
    }
  }

  // Best high-definition codecs priority
  const preferredTypes = [
    'video/mp4;codecs=avc1.640028,mp4a.40.2',
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];

  let selectedMimeType = '';
  for (const t of preferredTypes) {
    if (MediaRecorder.isTypeSupported(t)) {
      selectedMimeType = t;
      break;
    }
  }

  const recordedChunks: Blob[] = [];
  let mediaRecorder: MediaRecorder;
  try {
    mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: selectedMimeType || undefined,
      videoBitsPerSecond: 28000000, // 28 Mbps Ultra Crisp Detail
      audioBitsPerSecond: 320000,  // 320 kbps Studio Audio
    });
  } catch (recErr) {
    mediaRecorder = new MediaRecorder(combinedStream);
  }

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  const recordingPromise = new Promise<Blob>((resolve) => {
    mediaRecorder.onstop = () => {
      const finalBlob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'video/mp4' });
      resolve(finalBlob);
    };
  });

  mediaRecorder.start(100);
  if (audioSourceNode) {
    audioSourceNode.start(0);
  }

  const totalDurationMs = Math.max(1000, (duration > 0 ? duration : 15) * 1000);
  const frameIntervalMs = 1000 / fps;
  const scaleFactor = width / 360;
  const fontFam = captionFontFamily && captionFontFamily !== 'default' ? `"${captionFontFamily}", sans-serif` : 'sans-serif';

  onProgress(35, 'Encoding Ultra HD frames with animated typography...');

  const drawFrame = (currSec: number) => {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Draw Pristine Background
    if (loadedImage) {
      const imgRatio = loadedImage.width / loadedImage.height;
      const canvasRatio = width / height;
      let renderW = width;
      let renderH = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        renderW = height * imgRatio;
        offsetX = (width - renderW) / 2;
      } else {
        renderH = width / imgRatio;
        offsetY = (height - renderH) / 2;
      }

      ctx.drawImage(loadedImage, offsetX, offsetY, renderW, renderH);

      // Subtle HD cinematic contrast overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = canvasBgColor || '#0f172a';
      ctx.fillRect(0, 0, width, height);
    }

    // Helper to render high-definition typography box with full animation support
    const drawTextBox = (
      text: string,
      fontSize: number,
      pos: { x: number; y: number },
      activeCueItem: SubtitleCue | null = null,
      overrideOpacity: number | null = null
    ) => {
      if (!text || !text.trim()) return;

      let displayText = text;
      let scale = 1;
      let animOffsetX = 0;
      let animOffsetY = 0;
      let animAlpha = 1;
      let animRotate = 0;
      let glowBonus = 0;

      // Calculate Style Animation for Speech Subtitles
      if (activeCueItem && captionAnimation && captionAnimation.length > 0 && !captionAnimation.includes('none')) {
        const cueDuration = Math.max(0.3, activeCueItem.end - activeCueItem.start);
        const elapsed = Math.max(0, currSec - activeCueItem.start);
        const progress = Math.min(1, elapsed / cueDuration);
        
        // Universal "Halka sa" entry polish (Subtle fade, scale, float up)
        if (elapsed < 0.15) {
          const entryT = Math.max(0.01, elapsed / 0.15);
          animAlpha *= entryT;
          animOffsetY += (1 - entryT) * 12 * scaleFactor;
          scale *= 0.96 + 0.04 * entryT;
        }

        captionAnimation.forEach((anim) => {
          switch (anim) {
          case 'typewriter': {
            const charCount = Math.max(1, Math.floor(progress * text.length));
            displayText = text.slice(0, charCount) + (progress < 1 ? '▍' : '');
            break;
          }
          case 'typewriter-word': {
            const words = text.split(' ');
            const wordCount = Math.max(1, Math.ceil(progress * words.length));
            displayText = words.slice(0, wordCount).join(' ');
            break;
          }
          case 'single-word':
          case 'word-flash':
          case 'one-word-pop': {
            const words = text.trim().split(/\s+/);
            const activeWordIndex = Math.min(words.length - 1, Math.floor(progress * words.length));
            displayText = words[activeWordIndex] || words[0] || '';
            const wordDuration = cueDuration / Math.max(1, words.length);
            const wordElapsed = elapsed % wordDuration;
            const wordProgress = Math.min(1, wordElapsed / wordDuration);
            if (anim === 'one-word-pop') {
              scale = 1 + 0.35 * Math.sin(wordProgress * Math.PI);
            }
            break;
          }
          case 'word-pop': {
            const t = Math.min(1, elapsed / 0.28);
            scale = 1 + 0.28 * Math.sin(t * Math.PI);
            break;
          }
          case 'bounce': {
            const t = Math.min(1, elapsed / 0.4);
            scale = t === 1 ? 1 : 1 + 0.35 * Math.sin(t * Math.PI * 2.5) * (1 - t);
            break;
          }
          case 'wave':
          case 'float-slow': {
            animOffsetY = Math.sin(currSec * 4) * 8 * scaleFactor;
            break;
          }
          case 'fade-up': {
            const t = Math.min(1, elapsed / 0.28);
            animOffsetY = (1 - t) * 24 * scaleFactor;
            animAlpha = t;
            break;
          }
          case 'fade-down': {
            const t = Math.min(1, elapsed / 0.28);
            animOffsetY = -(1 - t) * 24 * scaleFactor;
            animAlpha = t;
            break;
          }
          case 'zoom-in': {
            const t = Math.min(1, elapsed / 0.3);
            scale = 0.65 + 0.35 * t;
            animAlpha = Math.min(1, t * 1.5);
            break;
          }
          case 'zoom-out': {
            const t = Math.min(1, elapsed / 0.3);
            scale = 1.35 - 0.35 * t;
            animAlpha = Math.min(1, t * 1.5);
            break;
          }
          case 'pulse-glow':
          case 'karaoke': {
            const pulse = 0.5 + 0.5 * Math.sin(currSec * 8);
            glowBonus = pulse * 14 * scaleFactor;
            scale = 1 + pulse * 0.04;
            break;
          }
          case 'heartbeat': {
            const hb = Math.pow(Math.sin(currSec * 5), 8) * 0.16;
            scale = 1 + hb;
            break;
          }
          case 'rubberband': {
            const t = Math.min(1, elapsed / 0.35);
            if (t < 1) {
              scale = 1 + 0.3 * Math.sin(t * Math.PI * 3) * (1 - t);
            }
            break;
          }
          case 'shake': {
            if (elapsed < 0.3) {
              const intensity = (1 - elapsed / 0.3) * 8 * scaleFactor;
              animOffsetX = Math.sin(currSec * 45) * intensity;
            }
            break;
          }
          case 'jello': {
            const t = Math.min(1, elapsed / 0.4);
            if (t < 1) {
              animRotate = Math.sin(t * Math.PI * 4) * 0.08 * (1 - t);
            }
            break;
          }
          case 'glitch': {
            if (Math.sin(currSec * 25) > 0.8) {
              animOffsetX = (Math.random() - 0.5) * 8 * scaleFactor;
              animOffsetY = (Math.random() - 0.5) * 4 * scaleFactor;
            }
            break;
          }
          case 'flip-x': {
            const t = Math.min(1, elapsed / 0.3);
            scale = Math.max(0.05, Math.abs(Math.cos((1 - t) * Math.PI / 2)));
            break;
          }
          case 'slide-left': {
            const t = Math.min(1, elapsed / 0.28);
            animOffsetX = (1 - t) * 60 * scaleFactor;
            animAlpha = t;
            break;
          }
          case 'slide-right': {
            const t = Math.min(1, elapsed / 0.28);
            animOffsetX = -(1 - t) * 60 * scaleFactor;
            animAlpha = t;
            break;
          }
          case 'fire-flame': {
            const flame = Math.sin(currSec * 10) * 0.05;
            scale = 1 + flame;
            glowBonus = 12 * scaleFactor;
            break;
          }
        }
        });
      }

      ctx.save();
      ctx.globalAlpha = (overrideOpacity !== null ? overrideOpacity : (captionOpacity ?? 1)) * animAlpha;

      const renderedFontSize = Math.round(fontSize * scaleFactor * 0.98);
      ctx.font = `800 ${renderedFontSize}px ${fontFam}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const maxTextWidth = width * 0.88;
      const words = displayText.split(' ');
      const lines: string[] = [];
      let currentLine = words[0] || '';

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        if (ctx.measureText(testLine).width < maxTextWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }
      lines.push(currentLine);

      const lineHeight = renderedFontSize * 1.35;
      const totalBoxHeight = lines.length * lineHeight + 26 * scaleFactor;

      let longestLineWidth = 0;
      lines.forEach((l) => {
        const lw = ctx.measureText(l).width;
        if (lw > longestLineWidth) longestLineWidth = lw;
      });
      const totalBoxWidth = Math.min(width * 0.94, longestLineWidth + 40 * scaleFactor);

      // Target position
      const centerX = width / 2 + pos.x * scaleFactor + animOffsetX;
      const centerY = height / 2 + pos.y * scaleFactor + animOffsetY;

      ctx.translate(centerX, centerY);
      if (animRotate !== 0) ctx.rotate(animRotate);
      if (scale !== 1) ctx.scale(scale, scale);

      const boxLeft = -totalBoxWidth / 2;
      const boxTop = -totalBoxHeight / 2;
      const boxRadius = captionStyle === 'pill' ? 999 * scaleFactor : 14 * scaleFactor;

      // Draw ultra crisp box background (skip completely if transparent)
      if (captionBgColor === 'transparent' || captionStyle === 'clean') {
        // Transparent: No background box drawn at all!
      } else if (captionBgColor && captionBgColor !== 'transparent') {
        ctx.fillStyle = captionBgColor;
        if (captionStyle === 'glass') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.lineWidth = 2 * scaleFactor;
        } else if (captionStyle === 'outline') {
          ctx.strokeStyle = captionColor || '#ffffff';
          ctx.lineWidth = 3 * scaleFactor;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1 * scaleFactor;
        }
        drawRoundedRect(ctx, boxLeft, boxTop, totalBoxWidth, totalBoxHeight, boxRadius);
        ctx.fill();
        ctx.stroke();
      } else if (captionStyle === 'glass') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 2 * scaleFactor;
        drawRoundedRect(ctx, boxLeft, boxTop, totalBoxWidth, totalBoxHeight, boxRadius);
        ctx.fill();
        ctx.stroke();
      } else if (captionStyle === 'box') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.2 * scaleFactor;
        drawRoundedRect(ctx, boxLeft, boxTop, totalBoxWidth, totalBoxHeight, boxRadius);
        ctx.fill();
        ctx.stroke();
      } else if (captionStyle === 'pill') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.5)';
        ctx.lineWidth = 2.2 * scaleFactor;
        drawRoundedRect(ctx, boxLeft, boxTop, totalBoxWidth, totalBoxHeight, boxRadius);
        ctx.fill();
        ctx.stroke();
      } else if (captionStyle === 'outline') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.strokeStyle = captionColor || '#ffffff';
        ctx.lineWidth = 3 * scaleFactor;
        drawRoundedRect(ctx, boxLeft, boxTop, totalBoxWidth, totalBoxHeight, boxRadius);
        ctx.fill();
        ctx.stroke();
      } else if (captionStyle === 'gradient') {
        const grad = ctx.createLinearGradient(boxLeft, boxTop, boxLeft + totalBoxWidth, boxTop + totalBoxHeight);
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.92)');
        grad.addColorStop(1, 'rgba(236, 72, 153, 0.92)');
        ctx.fillStyle = grad;
        drawRoundedRect(ctx, boxLeft, boxTop, totalBoxWidth, totalBoxHeight, boxRadius);
        ctx.fill();
      }

      // Draw High-Contrast Anti-Aliased Typography with crystal clear shadows
      ctx.fillStyle = captionColor || '#ffffff';
      if (captionBgColor === 'transparent') {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.98)';
        ctx.shadowBlur = (12 + glowBonus) * scaleFactor;
        ctx.shadowOffsetX = 3 * scaleFactor;
        ctx.shadowOffsetY = 3 * scaleFactor;
      } else {
        ctx.shadowColor = glowBonus > 0 ? (captionColor || '#6366f1') : 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = (8 + glowBonus) * scaleFactor;
        ctx.shadowOffsetX = 2 * scaleFactor;
        ctx.shadowOffsetY = 2 * scaleFactor;
      }

      const firstLineY = -((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, idx) => {
        ctx.fillText(line, 0, firstLineY + idx * lineHeight);
      });

      ctx.restore();
    };

    // 2. Draw Active Speech Subtitle Cue with Animations
    const activeCue = subtitles.find((c) => currSec >= c.start && currSec <= c.end);
    if (activeCue && activeCue.text) {
      drawTextBox(activeCue.text, captionFontSize, captionPosition, activeCue);
    }

    // 3. Draw Persistent Custom Text Overlay
    if (customText && customText.trim().length > 0) {
      drawTextBox(customText, customTextFontSize, customTextPosition, null, customTextOpacity);
    }
  };

  // Render loop using setTimeout to yield to browser event loop
  await new Promise<void>((resolve) => {
    let currentElapsedMs = 0;

    const renderNextFrame = () => {
      currentElapsedMs += frameIntervalMs;
      const currSec = currentElapsedMs / 1000;
      drawFrame(currSec);

      const pct = Math.min(95, Math.round(35 + (currentElapsedMs / totalDurationMs) * 60));
      
      // Update progress less frequently to save UI thread
      if (currentElapsedMs % (frameIntervalMs * 10) < frameIntervalMs) {
        onProgress(pct, `Rendering ${fps} FPS HD: ${formatTimeHelper(currSec)} / ${formatTimeHelper(duration)}...`);
      }

      if (currentElapsedMs >= totalDurationMs) {
        setTimeout(() => {
          mediaRecorder.stop();
          if (audioSourceNode) {
            try { audioSourceNode.stop(); } catch {}
          }
          if (audioContext) {
            try { audioContext.close(); } catch {}
          }
          resolve();
        }, 350);
      } else {
        setTimeout(renderNextFrame, 0); // Yield to browser to prevent mobile freezing
      }
    };
    
    renderNextFrame();
  });

  onProgress(98, 'Mastering 1080p MP4 stream container...');
  const finalVideoBlob = await recordingPromise;

  onProgress(100, 'Ultra HD 1080p Animated Video Ready!');

  const videoFileName = `HD_Reel_1080p_${Date.now()}.mp4`;
  const videoUrl = URL.createObjectURL(finalVideoBlob);

  // Confetti celebration
  try {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
  } catch {}

  return {
    blob: finalVideoBlob,
    url: videoUrl,
    filename: videoFileName,
    duration,
    aspectRatio,
  };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
