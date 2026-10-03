import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Image as ImageIcon, Palette } from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNav, StudioTab } from '../components/BottomNav';
import { VideoPlayerCanvas } from '../components/VideoPlayerCanvas';
import { PlaybackControls } from '../components/PlaybackControls';
import { CaptionsPanel } from '../components/CaptionsPanel';
import { StylePanel } from '../components/StylePanel';
import { AudioPanel } from '../components/AudioPanel';
import { ExportModal } from '../components/ExportModal';
import { EditCueModal } from '../components/EditCueModal';
import { AddCustomTextModal } from '../components/AddCustomTextModal';
import { ChangeImageModal } from '../components/ChangeImageModal';
import {
  useAppTheme,
  getProjectImageUri,
  setProjectImageUri,
  updateProjectState,
  subscribeProjectState,
} from '../services/projectState';
import {
  SubtitleCue,
  transcribeAudioToSubtitles,
  readSubtitleFileText,
  parseUniversalSubtitleContent,
  generateTxtContent,
  generateSrtContent,
  generateVttContent,
  convertCuesLanguage,
  DEFAULT_GROQ_API_KEY,
} from '../services/transcriptionService';
import { exportHdVideo, ExportResult } from '../services/exportService';

export const StudioPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectType = (searchParams.get('type') as 'canvas' | 'image') || 'canvas';
  const aspectRatio = (searchParams.get('size') as '9:16' | '16:9') || '9:16';
  const initialCanvasBgColor = searchParams.get('canvasBgColor') || '#0f172a';

  const { theme } = useAppTheme();

  const [currentCanvasBgColor, setCurrentCanvasBgColor] = useState<string>(initialCanvasBgColor);
  const [currentImageUri, setCurrentImageUri] = useState<string>(
    getProjectImageUri() || searchParams.get('imageUri') || ''
  );

  const canvasColorInputRef = useRef<HTMLInputElement>(null);
  const [isChangeImageModalOpen, setIsChangeImageModalOpen] = useState<boolean>(false);

  const handleSelectImageFromModal = (newUri: string) => {
    setCurrentImageUri(newUri);
    setProjectImageUri(newUri);
    updateProjectState({ imageUri: newUri });
  };

  // Subscribe to project state updates
  useEffect(() => {
    const unsub = subscribeProjectState(() => {
      const uri = getProjectImageUri();
      if (uri) setCurrentImageUri(uri);
    });
    return unsub;
  }, []);

  // Bottom Navigation Active Tab
  const [activeTab, setActiveTab] = useState<StudioTab>('captions');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: StudioTab) => {
    setActiveTab(tab);
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 180, behavior: 'smooth' });
    }, 50);
  };

  // Playback & Timing State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(15);

  // Audio State & HTML5 Audio Element for Web Sync
  const [customAudio, setCustomAudio] = useState<{
    name: string;
    uri: string;
    file?: File;
    size?: number;
  } | null>(null);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Setup / Sync HTML5 Audio
  useEffect(() => {
    if (customAudio && customAudio.uri) {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
      }
      const audio = audioElementRef.current;
      audio.src = customAudio.uri;
      audio.loop = true;
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
          setDuration(Math.ceil(audio.duration));
        }
      };
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    }
  }, [customAudio]);

  // Audio Playback Sync
  useEffect(() => {
    const audio = audioElementRef.current;
    if (audio) {
      if (isPlaying) {
        audio.currentTime = currentTime;
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  // Playback Timer Loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const maxDur = duration > 0 ? duration : 15;
          const next = prev + 0.1;
          if (next >= maxDur) {
            return 0; // Loop seamlessly
          }
          return parseFloat(next.toFixed(2));
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
    }
  };

  // Caption Styling & Position State
  const [captionPosition, setCaptionPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [captionFontSize, setCaptionFontSize] = useState<number>(18);
  const [captionColor, setCaptionColor] = useState<string>('#ffffff');
  const [captionBgColor, setCaptionBgColor] = useState<string>('transparent');
  const [captionStyle, setCaptionStyle] = useState<'glass' | 'box' | 'neon' | 'clean' | 'pill' | 'outline' | 'gradient'>('glass');
  const [captionFontFamily, setCaptionFontFamily] = useState<string>('default');
  const [captionOpacity, setCaptionOpacity] = useState<number>(1);
  const [captionAnimation, setCaptionAnimation] = useState<'none' | 'typewriter' | 'word-pop' | 'wave' | 'karaoke' | 'glitch' | 'bounce'>('none');

  // Independent Custom Text Overlay State (persists simultaneously with subtitles)
  const [customText, setCustomText] = useState<string>('');
  const [customTextPosition, setCustomTextPosition] = useState<{ x: number; y: number }>({ x: 0, y: -70 });
  const [customTextFontSize, setCustomTextFontSize] = useState<number>(20);

  // Subtitles Data State
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([]);
  const [rawOriginalCues, setRawOriginalCues] = useState<SubtitleCue[]>([]);
  const [captionSource, setCaptionSource] = useState<string | null>(null);
  const [srtData, setSrtData] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<'hi' | 'hinglish'>('hi');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  // Modals State
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editingCue, setEditingCue] = useState<SubtitleCue | null>(null);

  const [addTextModalVisible, setAddTextModalVisible] = useState<boolean>(false);

  const [exportModalVisible, setExportModalVisible] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStepText, setExportStepText] = useState<string>('');
  const [generatedVideo, setGeneratedVideo] = useState<ExportResult | null>(null);

  // Hidden Image Picker for Studio
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handlePickStudioImage = (file: File) => {
    const url = URL.createObjectURL(file);
    setCurrentImageUri(url);
    setProjectImageUri(url);
  };

  // Pick Custom Audio
  const handlePickAudio = (file: File) => {
    const url = URL.createObjectURL(file);
    setCustomAudio({
      name: file.name,
      uri: url,
      file,
      size: file.size,
    });
  };

  const handleRemoveAudio = () => {
    setCustomAudio(null);
  };

  // 1-Click Transcribe Audio
  const handleAutoTranscribeAudio = async () => {
    if (!customAudio) return;
    try {
      setIsTranscribing(true);
      const res = await transcribeAudioToSubtitles(
        customAudio.file || customAudio.uri,
        selectedLang,
        duration > 0 ? duration : 15,
        DEFAULT_GROQ_API_KEY
      );

      if (res.success && res.cues.length > 0) {
        setSubtitles(res.cues);
        setRawOriginalCues(res.cues);
        setSrtData(res.srtText);
        setCaptionSource(`${customAudio.name} (${selectedLang.toUpperCase()})`);

        const maxCueEnd = Math.max(...res.cues.map((c) => c.end));
        if (maxCueEnd > 0) {
          setDuration(Math.ceil(maxCueEnd) + 1);
        }
      } else {
        alert(res.message || 'Could not transcribe speech from audio.');
      }
    } catch (err: any) {
      alert(err.message || 'Audio transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Import SRT / VTT
  const handleImportSrt = async (file: File) => {
    try {
      const content = await readSubtitleFileText(file);
      const parsed = parseUniversalSubtitleContent(content);

      if (parsed.length > 0) {
        setSubtitles(parsed);
        setRawOriginalCues(parsed);
        setSrtData(generateSrtContent(parsed));
        setCaptionSource(file.name);

        const maxCueEnd = Math.max(...parsed.map((c) => c.end));
        if (maxCueEnd > 0) {
          setDuration(Math.ceil(maxCueEnd) + 1);
        }
      } else {
        alert('No subtitle cues found. Please ensure it is a valid .srt or .vtt file.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to read subtitle file.');
    }
  };

  // Language Switcher (translates existing cues between Hindi & Hinglish)
  const handleLanguageChange = async (newLang: 'hi' | 'hinglish') => {
    setSelectedLang(newLang);
    const sourceCues = rawOriginalCues.length > 0 ? rawOriginalCues : subtitles;
    if (sourceCues.length > 0) {
      try {
        setIsTranscribing(true);
        const converted = await convertCuesLanguage(sourceCues, newLang, DEFAULT_GROQ_API_KEY);
        if (converted && converted.length > 0) {
          setSubtitles(converted);
          setSrtData(generateSrtContent(converted));
          setCaptionSource((prev) =>
            prev
              ? `${prev.split(' (')[0]} (${newLang.toUpperCase()})`
              : `Captions (${newLang.toUpperCase()})`
          );
        }
      } catch (err) {
        console.warn('Language switch conversion note:', err);
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  // Edit Cue Handlers
  const handleOpenEditCue = (cue: SubtitleCue) => {
    setEditingCue(cue);
    setEditModalVisible(true);
  };

  const handleSaveEditCue = (newText: string) => {
    if (!editingCue) return;
    const updated = subtitles.map((c) => (c.id === editingCue.id ? { ...c, text: newText } : c));
    setSubtitles(updated);
    setRawOriginalCues((prev) =>
      prev.map((c) => (c.id === editingCue.id ? { ...c, text: newText } : c))
    );
    setSrtData(generateSrtContent(updated));
    setEditModalVisible(false);
    setEditingCue(null);
  };

  // Add Custom Text Handler (Keeps speech subtitles intact and adds independent overlay)
  const handleAddCustomText = (text: string) => {
    setCustomText(text);
    setAddTextModalVisible(false);
  };

  // Export Handler (Video Only)
  const handleExportVideo = async () => {
    setIsExporting(true);
    setExportProgress(10);
    setExportStepText('Initializing video rendering engine...');
    setGeneratedVideo(null);

    try {
      const result = await exportHdVideo({
        projectType,
        aspectRatio,
        canvasBgColor: currentCanvasBgColor,
        imageUri: currentImageUri,
        audioUri: customAudio?.uri || null,
        subtitles,
        captionFontSize,
        captionColor,
        captionBgColor,
        captionStyle,
        captionFontFamily,
        captionPosition,
        captionOpacity,
        captionAnimation,
        duration,
        customText,
        customTextPosition,
        customTextFontSize,
        onProgress: (pct, step) => {
          setExportProgress(pct);
          setExportStepText(step);
        },
      });

      setGeneratedVideo(result);
      setIsExporting(false);
    } catch (err: any) {
      setIsExporting(false);
      alert(err.message || 'Export failed. Please try again.');
    }
  };

  // Active Subtitle Calculation (with default sample cue so text is always visible & draggable)
  const currentSubtitle = subtitles.find(
    (cue) => currentTime >= cue.start && currentTime <= cue.end
  );

  const samplePlaceholderCue: SubtitleCue = {
    id: 'placeholder',
    start: 0,
    end: 999,
    text: 'Viral Caption • Drag to Position ⚡',
  };

  const activeDisplaySubtitle = isPlaying
    ? currentSubtitle
    : currentSubtitle ||
      (subtitles.length > 0
        ? subtitles.find((c) => c.start >= currentTime) || subtitles[subtitles.length - 1]
        : samplePlaceholderCue);

  return (
    <div
      style={{
        height: '100%',
        minHeight: '100vh',
        backgroundColor: theme.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hidden Image Input for Studio */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handlePickStudioImage(e.target.files[0]);
          }
        }}
        style={{ display: 'none' }}
      />

      {/* Hidden Color Picker for Canvas Background */}
      <input
        type="color"
        ref={canvasColorInputRef}
        value={currentCanvasBgColor}
        onChange={(e) => setCurrentCanvasBgColor(e.target.value)}
        style={{ display: 'none' }}
      />

      {/* Top Header */}
      <Header
        title="Studio"
        rightAction={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Context-Aware Action: If Image project -> Change Image button */}
            {projectType === 'image' && (
              <button
                onClick={() => setIsChangeImageModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  color: theme.textPrimary,
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Change Background Image (Live / Upload)"
              >
                <ImageIcon size={14} color="#818cf8" />
                <span style={{ whiteSpace: 'nowrap' }}></span>
              </button>
            )}

            {/* Context-Aware Action: If Canvas project -> Canvas Color picker button */}
            {projectType === 'canvas' && (
              <button
                onClick={() => canvasColorInputRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  color: theme.textPrimary,
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Change Canvas Background Color"
              >
                <span
                  style={{
                    width: '13px',
                    height: '13px',
                    borderRadius: '50%',
                    backgroundColor: currentCanvasBgColor,
                    border: '1.5px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 0 3px rgba(0,0,0,0.3)',
                    display: 'inline-block',
                  }}
                />
                <Palette size={14} color="#818cf8" />
                <span style={{ whiteSpace: 'nowrap' }}>Canvas Color</span>
              </button>
            )}

            {/* Export HD Button */}
            <button
              onClick={() => setExportModalVisible(true)}
              style={{
                backgroundColor: '#6366f1',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
                border: 'none',
              }}
            >
              <Download size={14} />
              <span style={{ whiteSpace: 'nowrap' }}>Export HD</span>
            </button>
          </div>
        }
      />

      {/* Studio Split Layout Container */}
      <div className="studio-split-wrapper">
        {/* LEFT COLUMN: Settings, Configurations & Active Panels */}
        <div className="studio-left-settings" ref={scrollContainerRef}>
          {/* Desktop Tab Selector */}
          <div
            className="desktop-only-flex"
            style={{
              gap: '8px',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            {[
              { id: 'captions', label: 'Captions' },
              { id: 'style', label: 'Style' },
              { id: 'audio', label: 'Audio' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as StudioTab)}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: isActive ? '#6366f1' : theme.innerBg,
                    color: isActive ? '#ffffff' : theme.textSecondary,
                    border: `1px solid ${isActive ? '#6366f1' : theme.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Focused Panel Content Based on Selected Tab */}
          {activeTab === 'captions' && (
            <CaptionsPanel
              selectedLang={selectedLang}
              isTranscribing={isTranscribing}
              onLanguageChange={handleLanguageChange}
              onAutoSpeechClick={() => {
                if (customAudio) {
                  handleAutoTranscribeAudio();
                } else {
                  setActiveTab('audio');
                }
              }}
              onImportSrt={handleImportSrt}
              subtitles={subtitles}
              captionSource={captionSource}
              currentTime={currentTime}
              onClearSubtitles={() => {
                setSubtitles([]);
                setRawOriginalCues([]);
                setCaptionSource(null);
                setSrtData('');
              }}
              onEditCue={handleOpenEditCue}
              hasAudio={!!customAudio}
            />
          )}

          {activeTab === 'style' && (
            <StylePanel
              onOpenAddCustomText={() => setAddTextModalVisible(true)}
              captionFontSize={captionFontSize}
              onFontSizeChange={setCaptionFontSize}
              captionColor={captionColor}
              onColorChange={setCaptionColor}
              captionBgColor={captionBgColor}
              onBgColorChange={setCaptionBgColor}
              captionStyle={captionStyle}
              onStyleChange={setCaptionStyle}
              captionFontFamily={captionFontFamily}
              onFontChange={setCaptionFontFamily}
              captionOpacity={captionOpacity}
              onOpacityChange={setCaptionOpacity}
              captionAnimation={captionAnimation}
              onAnimationChange={setCaptionAnimation}
              onSetPresetPosition={(x, y) => setCaptionPosition({ x, y })}
              currentSubtitleText={activeDisplaySubtitle?.text || subtitles[0]?.text || ''}
              customText={customText}
              onCustomTextChange={setCustomText}
              customTextFontSize={customTextFontSize}
              onCustomTextFontSizeChange={setCustomTextFontSize}
              onSetCustomTextPosition={(x, y) => setCustomTextPosition({ x, y })}
            />
          )}

          {activeTab === 'audio' && (
            <AudioPanel
              customAudio={customAudio}
              duration={duration}
              isTranscribing={isTranscribing}
              onPickAudio={handlePickAudio}
              onRemoveAudio={handleRemoveAudio}
              onAutoTranscribeAudio={handleAutoTranscribeAudio}
              projectType={projectType}
              currentImageUri={currentImageUri}
              onPickImage={() => setIsChangeImageModalOpen(true)}
            />
          )}
        </div>

        {/* RIGHT COLUMN: Output Video Canvas & Playback Controls */}
        <div className="studio-right-output">
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: aspectRatio === '9:16' ? '340px' : '580px',
              gap: '14px',
            }}
          >
            {/* Main Canvas / Image Video Frame */}
            <VideoPlayerCanvas
              projectType={projectType}
              aspectRatio={aspectRatio}
              canvasBgColor={currentCanvasBgColor}
              imageUri={currentImageUri}
              activeSubtitle={activeDisplaySubtitle || null}
              captionFontSize={captionFontSize}
              captionColor={captionColor}
              captionBgColor={captionBgColor}
              captionStyle={captionStyle}
              captionFontFamily={captionFontFamily}
              captionPosition={captionPosition}
              onPositionChange={setCaptionPosition}
              isPlaying={isPlaying}
              onTogglePlayPause={togglePlayPause}
              onPickImage={() => setIsChangeImageModalOpen(true)}
              captionOpacity={captionOpacity}
              captionAnimation={captionAnimation}
              currentTime={currentTime}
              customText={customText}
              customTextPosition={customTextPosition}
              onCustomTextPositionChange={setCustomTextPosition}
              customTextFontSize={customTextFontSize}
            />

            {/* Playback Controls & Seek Bar */}
            <div style={{ width: '100%' }}>
              <PlaybackControls
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                onSeek={handleSeek}
                onTogglePlayPause={togglePlayPause}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sleek Bottom Navigation (Mobile Only) */}
      <div className="mobile-only-block">
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        isExporting={isExporting}
        exportProgress={exportProgress}
        exportStepText={exportStepText}
        duration={duration}
        aspectRatio={aspectRatio}
        onExportVideo={handleExportVideo}
        generatedVideo={generatedVideo}
        onResetGeneratedVideo={() => setGeneratedVideo(null)}
      />

      <EditCueModal
        isOpen={editModalVisible}
        cue={editingCue}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveEditCue}
      />

      <AddCustomTextModal
        isOpen={addTextModalVisible}
        currentTime={currentTime}
        initialText={customText}
        onClose={() => setAddTextModalVisible(false)}
        onAdd={handleAddCustomText}
      />

      {/* Change Background Image Modal (Live Search & Upload) */}
      <ChangeImageModal
        isOpen={isChangeImageModalOpen}
        currentImageUrl={currentImageUri}
        onSelectImage={handleSelectImageFromModal}
        onClose={() => setIsChangeImageModalOpen(false)}
      />
    </div>
  );
};
