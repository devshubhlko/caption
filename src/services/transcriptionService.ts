export const DEFAULT_GROQ_API_KEY = '';

export interface SubtitleCue {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

export interface TranscriptionResult {
  success: boolean;
  message?: string;
  cues: SubtitleCue[];
  txtText: string;
  srtText: string;
  vttText: string;
  fullTranscript: string;
}

/**
 * Converts seconds to SRT time format: 00:00:00,000
 */
export function formatSrtTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);

  const pad = (num: number, size: number = 2) => String(num).padStart(size, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds, 3)}`;
}

/**
 * Converts seconds to VTT time format: 00:00:00.000
 */
export function formatVttTime(totalSeconds: number): string {
  const srt = formatSrtTime(totalSeconds);
  return srt.replace(',', '.');
}

/**
 * Timestamp Parser (supports HH:MM:SS,mmm | HH:MM:SS.mmm | MM:SS,mmm | MM:SS.mmm | MM:SS)
 */
export function parseTimestampToSeconds(timestamp: string): number {
  if (!timestamp) return 0;
  const clean = timestamp.trim().replace(',', '.');
  const parts = clean.split(':');

  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  } else if (parts.length === 1) {
    return parseFloat(parts[0]) || 0;
  }
  return 0;
}

/**
 * Universal SRT & VTT Parser
 */
export function parseUniversalSubtitleContent(content: string): SubtitleCue[] {
  if (!content || content.trim().length === 0) return [];

  const cues: SubtitleCue[] = [];
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n+/);

  let idCounter = 1;

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) continue;

    if (lines[0].toUpperCase().startsWith('WEBVTT') && lines.length === 1) {
      continue;
    }

    let timeLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        timeLineIndex = i;
        break;
      }
    }

    if (timeLineIndex !== -1) {
      const timeLine = lines[timeLineIndex];
      const timeParts = timeLine.split('-->');
      if (timeParts.length === 2) {
        const rawStart = timeParts[0].trim().split(' ')[0];
        const rawEnd = timeParts[1].trim().split(' ')[0];

        const start = parseTimestampToSeconds(rawStart);
        const end = parseTimestampToSeconds(rawEnd);

        const textLines = lines.slice(timeLineIndex + 1).join('\n');
        const cleanText = textLines.replace(/<[^>]*>/g, '').trim();

        if (cleanText && end > start) {
          cues.push({
            id: `cue-${idCounter++}`,
            start,
            end,
            text: cleanText,
          });
        }
      }
    }
  }

  return cues;
}

/**
 * Generates plain TXT format from cues
 */
export function generateTxtContent(cues: SubtitleCue[]): string {
  return cues.map((cue) => cue.text.trim()).join('\n');
}

/**
 * Generates SRT file content string from cues
 */
export function generateSrtContent(cues: SubtitleCue[]): string {
  return cues
    .map((cue, idx) => `${idx + 1}\n${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}\n${cue.text}\n`)
    .join('\n');
}

/**
 * Generates VTT file content string from cues
 */
export function generateVttContent(cues: SubtitleCue[]): string {
  const body = cues
    .map((cue, idx) => `${idx + 1}\n${formatVttTime(cue.start)} --> ${formatVttTime(cue.end)}\n${cue.text}\n`)
    .join('\n');
  return `WEBVTT\n\n${body}`;
}

/**
 * Safe Subtitle Text File Reader
 */
export async function readSubtitleFileText(uriOrFile: string | File): Promise<string> {
  try {
    if (typeof uriOrFile !== 'string') {
      return await uriOrFile.text();
    }
    const res = await fetch(uriOrFile);
    const text = await res.text();
    if (text && text.trim().length > 0) {
      return text;
    }
  } catch { }
  return '';
}

/**
 * Splits recognized transcript into timed Subtitle Cues
 */
export function buildTimedCuesFromTranscript(
  text: string,
  totalDuration: number = 15,
  rawChunks?: { start: number; end: number; text: string }[]
): SubtitleCue[] {
  if (rawChunks && rawChunks.length > 0) {
    return rawChunks
      .filter((c) => c.text && c.text.trim().length > 0)
      .map((chunk, idx) => ({
        id: `cue-${idx + 1}`,
        start: parseFloat(chunk.start.toFixed(2)),
        end: parseFloat(chunk.end.toFixed(2)),
        text: chunk.text.trim(),
      }));
  }

  if (!text || text.trim().length === 0) return [];

  const rawSentences = text
    .split(/(?<=[.?!।\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const chunks: string[] = [];
  for (const sentence of rawSentences) {
    const words = sentence.split(' ');
    if (words.length > 8) {
      for (let i = 0; i < words.length; i += 6) {
        chunks.push(words.slice(i, i + 6).join(' '));
      }
    } else {
      chunks.push(sentence);
    }
  }

  const finalSentences = chunks.filter((c) => c.trim().length > 0);
  if (finalSentences.length === 0) return [];

  const totalLength = finalSentences.reduce((acc, s) => acc + s.length, 0);
  let currentTime = 0.0;

  const availableDuration = Math.max(totalDuration - 0.5, finalSentences.length * 2);
  const cues: SubtitleCue[] = [];

  finalSentences.forEach((sentence, index) => {
    const proportion = totalLength > 0 ? sentence.length / totalLength : 1 / finalSentences.length;
    let cueDuration = proportion * availableDuration;
    cueDuration = Math.max(1.5, Math.min(cueDuration, 5.0));

    const start = currentTime;
    const end = Math.min(currentTime + cueDuration, totalDuration > 0 ? totalDuration : start + 3.5);

    cues.push({
      id: `cue-${index + 1}`,
      start: parseFloat(start.toFixed(2)),
      end: parseFloat(end.toFixed(2)),
      text: sentence.trim(),
    });

    currentTime = end;
  });

  return cues;
}

/**
 * Fallback phonetic Devanagari to Romanized Hinglish engine
 */
export function phoneticDevanagariToHinglish(text: string): string {
  if (!text) return '';

  const wordMap: Record<string, string> = {
    'नमस्ते': 'Namaste', 'नमस्कार': 'Namaskar', 'हेलो': 'Hello', 'दोस्तों': 'dosto',
    'दोस्त': 'dost', 'आप': 'aap', 'कैसे': 'kaise', 'हो': 'ho', 'हैं': 'hain', 'है': 'hai',
    'हूँ': 'hoon', 'हूं': 'hoon', 'था': 'tha', 'थी': 'thi', 'थे': 'the', 'क्या': 'kya',
    'क्यों': 'kyon', 'कब': 'kab', 'कहाँ': 'kahan', 'कहा': 'kaha', 'कौन': 'kaun',
    'किस': 'kis', 'किसने': 'kisne', 'मुझको': 'mujhko', 'मुझे': 'mujhe', 'मेरा': 'mera',
    'मेरी': 'meri', 'मेरे': 'mere', 'हम': 'hum', 'हमारा': 'hamara', 'हमारे': 'hamare',
    'तुम्हें': 'tumhein', 'तुम': 'tum', 'तुम्हारा': 'tumhara', 'तुम्हारी': 'tumhari',
    'ये': 'ye', 'यह': 'yeh', 'वो': 'woh', 'वह': 'woh', 'इस': 'is', 'उस': 'us',
    'सब': 'sab', 'सभी': 'sabhi', 'लोग': 'log', 'करना': 'karna', 'कर': 'kar',
    'करते': 'karte', 'करती': 'karti', 'करेंगे': 'karenge', 'करेगा': 'karega',
    'वीडियो': 'video', 'ऑडियो': 'audio', 'चैनल': 'channel', 'लाइक': 'like',
    'शेयर': 'share', 'सब्सक्राइब': 'subscribe', 'आज': 'aaj', 'कल': 'kal',
    'बहुत': 'bahut', 'अच्छा': 'achha', 'अच्छी': 'achhi', 'नहीं': 'nahi',
    'हाँ': 'haan', 'बात': 'baat', 'देखते': 'dekhte', 'देखो': 'dekho',
    'सुनो': 'suno', 'शुरू': 'shuru', 'खत्म': 'khatam', 'पर': 'par',
    'में': 'mein', 'से': 'se', 'को': 'ko', 'का': 'ka', 'की': 'ki', 'के': 'ke',
    'और': 'aur', 'या': 'ya', 'लेकिन': 'lekin', 'तो': 'toh', 'भी': 'bhi',
    'स्वागत': 'swagat', 'आपका': 'aapka', 'धन्यवाद': 'dhanyawad', 'शुक्रिया': 'shukriya',
    'चलो': 'chalo', 'चलते': 'chalte', 'बताओ': 'batao', 'बोल': 'bol', 'रहा': 'raha',
    'रही': 'rahi', 'रहे': 'rahe', 'गया': 'gaya', 'गई': 'gayi', 'गए': 'gaye',
    'आया': 'aaya', 'आई': 'aayi', 'आए': 'aaye', 'किया': 'kiya', 'देना': 'dena',
    'दिया': 'diya', 'लेना': 'lena', 'लिया': 'liya', 'होगा': 'hoga', 'होगी': 'hogi',
    'होंगे': 'honge', 'सकता': 'sakta', 'सकती': 'sakti', 'सकते': 'sakte', 'प्लीज': 'please'
  };

  const vowels: Record<string, string> = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h',
  };

  const consonants: Record<string, string> = {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'f', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
    'ष': 'sh', 'स': 's', 'ह': 'h',
    'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'd', 'ढ़': 'dh', 'फ़': 'f',
  };

  const words = text.split(/(\s+|[.,!?।])/);
  return words
    .map((w) => {
      const clean = w.trim();
      if (!clean) return w;
      if (wordMap[clean]) return wordMap[clean];

      let out = '';
      for (let i = 0; i < clean.length; i++) {
        const ch = clean[i];
        const next = clean[i + 1];

        if (consonants[ch]) {
          out += consonants[ch];
          if (next === '्') {
            i++;
          } else if (vowels[next]) {
            // will be handled by next char
          } else {
            if (i < clean.length - 1 && clean[i + 1] !== ' ') {
              out += 'a';
            }
          }
        } else if (vowels[ch]) {
          out += vowels[ch];
        } else if (ch === '्') {
          // skip
        } else if (ch === '।') {
          out += '.';
        } else {
          out += ch;
        }
      }
      return out || clean;
    })
    .join('');
}

/**
 * Convert Subtitle Cues between Hindi (Devanagari) and Hinglish (Roman Hindi)
 * Works universally for imported SRT files and generated speech captions.
 */
export async function convertCuesLanguage(
  cues: SubtitleCue[],
  targetMode: 'hi' | 'hinglish',
  apiKey?: string
): Promise<SubtitleCue[]> {
  if (!cues || cues.length === 0) return cues;
  const activeKey = apiKey && apiKey.trim().length > 0 ? apiKey.trim() : DEFAULT_GROQ_API_KEY;

  const BATCH_SIZE = 20;
  const convertedCues: SubtitleCue[] = [];

  for (let b = 0; b < cues.length; b += BATCH_SIZE) {
    const batchCues = cues.slice(b, b + BATCH_SIZE);
    const inputTexts = batchCues.map((c) => c.text);

    let systemPrompt = '';
    if (targetMode === 'hi') {
      systemPrompt =
        'You are an expert multilingual subtitle translator. The input is a JSON array of subtitle lines in ANY language (English, Spanish, French, German, Arabic, Chinese, Japanese, Russian, Portuguese, Tamil, Telugu, Urdu, etc. or Hinglish). Translate every line accurately into natural, fluent, standard Devanagari Hindi text (e.g. ["Hello, how are you?", "Bienvenue à tous"] -> ["नमस्ते, आप कैसे हैं?", "सभी का स्वागत है"]). Maintain the exact same meaning and context. You MUST return ONLY a valid JSON array of strings corresponding 1-to-1 with the input array without any extra explanation or markdown.';
    } else {
      systemPrompt =
        'You are an expert multilingual subtitle translator into Hinglish (conversational Hindi written in Roman/English alphabet). The input is a JSON array of subtitle lines in ANY language (English, Spanish, French, German, Arabic, Chinese, Japanese, Russian, Portuguese, Hindi Devanagari, etc.). Translate every line into natural, colloquial, modern Hinglish (e.g. ["Hello, how are you?", "Welcome everyone", "नमस्ते दोस्तों"] -> ["Hello, aap kaise hain?", "Sabhi ka swagat hai", "Namaste dosto"]). Return ONLY a valid JSON array of strings corresponding 1-to-1 with the input array without any extra explanation or markdown.';
    }

    const MODELS_TO_TRY = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
    let convertedBatchSuccess = false;

    for (const modelName of MODELS_TO_TRY) {
      if (convertedBatchSuccess) break;
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            temperature: 0.1,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: JSON.stringify(inputTexts) },
            ],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const arr = JSON.parse(jsonMatch[0]);
              if (Array.isArray(arr) && arr.length === batchCues.length) {
                arr.forEach((text, i) => {
                  convertedCues.push({
                    ...batchCues[i],
                    text: text ? String(text).trim() : batchCues[i].text,
                  });
                });
                convertedBatchSuccess = true;
                break;
              }
            }
          }
        }
      } catch (err) {
        console.log(`Model ${modelName} conversion note:`, err);
      }
    }

    // Fallback if all AI models fail
    if (!convertedBatchSuccess) {
      batchCues.forEach((c) => {
        convertedCues.push({
          ...c,
          text: targetMode === 'hinglish' ? phoneticDevanagariToHinglish(c.text) : c.text,
        });
      });
    }
  }

  return convertedCues;
}

/**
 * Whisper Speech-to-Text Pipeline with Groq API for Browser
 * Audio (File/Blob/URL) -> Groq Whisper -> Timestamps -> TXT / SRT / VTT
 */
export async function transcribeAudioToSubtitles(
  audioSource: string | File | Blob,
  targetMode: 'hi' | 'hinglish' = 'hi',
  estimatedDuration: number = 15,
  customApiKey?: string
): Promise<TranscriptionResult> {
  const activeKey =
    customApiKey && customApiKey.trim().length > 0
      ? customApiKey.trim()
      : DEFAULT_GROQ_API_KEY;

  const whisperLanguage = 'hi';

  try {
    let audioBlob: Blob;

    if (audioSource instanceof File || audioSource instanceof Blob) {
      audioBlob = audioSource;
    } else {
      const response = await fetch(audioSource);
      audioBlob = await response.blob();
    }

    const fd = new FormData();
    fd.append('file', audioBlob, 'audio.mp3');
    fd.append('model', 'whisper-large-v3');
    fd.append('language', whisperLanguage);
    fd.append('response_format', 'verbose_json');

    const groqFetchRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeKey}`,
      },
      body: fd,
    });

    let recognizedText = '';
    let extractedSegments: { start: number; end: number; text: string }[] = [];

    if (groqFetchRes.ok) {
      const data = await groqFetchRes.json();
      if (data.text) {
        recognizedText = data.text.trim();
      }
      if (Array.isArray(data.segments)) {
        extractedSegments = data.segments.map((seg: any) => ({
          start: typeof seg.start === 'number' ? seg.start : 0,
          end: typeof seg.end === 'number' ? seg.end : (seg.start || 0) + 3,
          text: seg.text ? seg.text.trim() : '',
        }));
      }
    } else {
      try {
        const errData = await groqFetchRes.json();
        if (errData.error && errData.error.message) {
          return {
            success: false,
            message: `Groq Error: ${errData.error.message}`,
            cues: [],
            txtText: '',
            srtText: '',
            vttText: '',
            fullTranscript: '',
          };
        }
      } catch { }
    }

    if (!recognizedText || recognizedText.trim().length === 0) {
      return {
        success: false,
        message: 'Could not transcribe speech. Please ensure the audio contains clear spoken voice.',
        cues: [],
        txtText: '',
        srtText: '',
        vttText: '',
        fullTranscript: '',
      };
    }

    // Build Subtitle Cues with Timestamps
    let cues = buildTimedCuesFromTranscript(
      recognizedText,
      estimatedDuration,
      extractedSegments.length > 0 ? extractedSegments : undefined
    );

    // If Hinglish requested, convert
    if (targetMode === 'hinglish') {
      cues = await convertCuesLanguage(cues, 'hinglish', activeKey);
    }

    const txtText = generateTxtContent(cues);
    const srtText = generateSrtContent(cues);
    const vttText = generateVttContent(cues);

    return {
      success: true,
      cues,
      txtText,
      srtText,
      vttText,
      fullTranscript: cues.map((c) => c.text).join(' '),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Error processing audio transcription',
      cues: [],
      txtText: '',
      srtText: '',
      vttText: '',
      fullTranscript: '',
    };
  }
}
