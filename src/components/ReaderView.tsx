import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sun,
  Type,
  Maximize2,
  BookOpen,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { Story, Chapter } from '../types';
import { calculateReadingTimeMinutes } from '../utils/monetization';

interface ReaderViewProps {
  story: Story;
  chapter: Chapter;
  allChapters: Chapter[];
  unlockedChapterIds: string[];
  onBack: () => void;
  onSelectChapter: (chapter: Chapter) => void;
  onRequestUnlock: (chapter: Chapter) => void;
  onUpdateProgress: (storyId: string, chapterId: string, chapterNum: number, scrollPct: number) => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  story,
  chapter,
  allChapters,
  unlockedChapterIds,
  onBack,
  onSelectChapter,
  onRequestUnlock,
  onUpdateProgress,
}) => {
  // Reading preferences with local storage or state persistence
  const [readerTheme, setReaderTheme] = useState<'charcoal' | 'dark' | 'sepia' | 'light'>('charcoal');
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [readerWidth, setReaderWidth] = useState<'narrow' | 'normal' | 'wide'>('normal');
  const [showToc, setShowToc] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Monitor scroll for progress calculation
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const currentProgress = Math.round((window.scrollY / totalScroll) * 100);
      setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      onUpdateProgress(story.id, chapter.id, chapter.chapterNumber, currentProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [story.id, chapter.id, chapter.chapterNumber, onUpdateProgress]);

  // Theme palettes
  const themeStyles = {
    charcoal: {
      bg: 'bg-[#101114]',
      text: 'text-[#E5E7EB]',
      headerBg: 'bg-[#101114]/90 border-gray-800',
      panelBg: 'bg-[#1A1D24] border-gray-800',
      accent: 'text-amber-400',
    },
    dark: {
      bg: 'bg-[#0A0A0C]',
      text: 'text-[#DDE0E8]',
      headerBg: 'bg-[#0A0A0C]/90 border-neutral-800',
      panelBg: 'bg-[#14151A] border-neutral-800',
      accent: 'text-amber-400',
    },
    sepia: {
      bg: 'bg-[#211B17]',
      text: 'text-[#EFE0CE]',
      headerBg: 'bg-[#211B17]/90 border-[#382F28]',
      panelBg: 'bg-[#2C241E] border-[#382F28]',
      accent: 'text-amber-300',
    },
    light: {
      bg: 'bg-[#F9F9F8]',
      text: 'text-[#1F242F]',
      headerBg: 'bg-[#F9F9F8]/90 border-gray-200',
      panelBg: 'bg-white border-gray-200 shadow-sm',
      accent: 'text-amber-600',
    },
  };

  const fontStyles = {
    serif: 'font-serif leading-[1.85] tracking-normal',
    sans: 'font-sans leading-[1.8] tracking-tight',
    mono: 'font-mono text-sm leading-[1.9] tracking-tight',
  };

  const widthStyles = {
    narrow: 'max-w-xl',
    normal: 'max-w-2xl',
    wide: 'max-w-4xl',
  };

  const currentTheme = themeStyles[readerTheme];
  const sortedChapters = [...allChapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const prevChapter = sortedChapters.find((c) => c.chapterNumber === chapter.chapterNumber - 1);
  const nextChapter = sortedChapters.find((c) => c.chapterNumber === chapter.chapterNumber + 1);

  const handleNextClick = () => {
    if (!nextChapter) return;
    const isLocked = nextChapter.isPremium && !unlockedChapterIds.includes(nextChapter.id);
    if (isLocked) {
      onRequestUnlock(nextChapter);
    } else {
      onSelectChapter(nextChapter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const readingTime = calculateReadingTimeMinutes(chapter.wordCount);

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} flex flex-col transition-colors duration-200`}>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-black/20">
        <div
          className="h-full bg-amber-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Sticky Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b px-3 sm:px-6 py-2.5 flex items-center justify-between ${currentTheme.headerBg}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-white/10 transition text-gray-300"
            aria-label="Back to story details"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <span className={`text-[11px] font-bold uppercase tracking-wider block truncate ${currentTheme.accent}`}>
              {story.title}
            </span>
            <h1 className="text-xs sm:text-sm font-semibold truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              Ch {chapter.chapterNumber}: {chapter.title}
            </h1>
          </div>
        </div>

        {/* Reader Preferences Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Font Size Adjusters */}
          <div className="flex items-center bg-black/30 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 1))}
              className="px-2 py-1 text-xs font-bold hover:text-amber-400 focus:outline-none"
              title="Decrease font size"
              aria-label="Decrease font size"
            >
              A-
            </button>
            <span className="text-[11px] px-1 font-mono text-gray-400">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(26, fontSize + 1))}
              className="px-2 py-1 text-xs font-bold hover:text-amber-400 focus:outline-none"
              title="Increase font size"
              aria-label="Increase font size"
            >
              A+
            </button>
          </div>

          {/* Theme Switcher Cycle */}
          <button
            onClick={() => {
              const themes: Array<'charcoal' | 'dark' | 'sepia' | 'light'> = ['charcoal', 'dark', 'sepia', 'light'];
              const nextIndex = (themes.indexOf(readerTheme) + 1) % themes.length;
              setReaderTheme(themes[nextIndex]);
            }}
            className="p-2 rounded-lg bg-black/30 border border-white/10 hover:text-amber-400 transition"
            title={`Current theme: ${readerTheme}. Click to cycle.`}
            aria-label="Cycle theme mode"
          >
            <Sun size={15} />
          </button>

          {/* Font Family Cycle */}
          <button
            onClick={() => {
              const fonts: Array<'serif' | 'sans' | 'mono'> = ['serif', 'sans', 'mono'];
              const nextIndex = (fonts.indexOf(fontFamily) + 1) % fonts.length;
              setFontFamily(fonts[nextIndex]);
            }}
            className="p-2 rounded-lg bg-black/30 border border-white/10 hover:text-amber-400 transition"
            title={`Font: ${fontFamily}. Click to cycle.`}
            aria-label="Cycle font style"
          >
            <Type size={15} />
          </button>

          {/* Column Width Toggle */}
          <button
            onClick={() => {
              const widths: Array<'narrow' | 'normal' | 'wide'> = ['narrow', 'normal', 'wide'];
              const nextIndex = (widths.indexOf(readerWidth) + 1) % widths.length;
              setReaderWidth(widths[nextIndex]);
            }}
            className="hidden sm:block p-2 rounded-lg bg-black/30 border border-white/10 hover:text-amber-400 transition"
            title={`Width: ${readerWidth}. Click to toggle.`}
            aria-label="Toggle reading container width"
          >
            <Maximize2 size={15} />
          </button>

          {/* Table of Contents Drawer Toggle */}
          <button
            onClick={() => setShowToc(!showToc)}
            className="p-2 rounded-lg bg-black/30 border border-white/10 hover:text-amber-400 transition"
            title="Table of Contents"
            aria-label="Open Table of Contents"
          >
            <BookOpen size={15} />
          </button>
        </div>
      </header>

      {/* Table of Contents Modal / Drawer */}
      {showToc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm h-full bg-[#181A20] border-l border-gray-800 p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Table of Contents</h3>
                <p className="text-xs text-gray-400">{story.title}</p>
              </div>
              <button
                onClick={() => setShowToc(false)}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              {sortedChapters.map((ch) => {
                const isCurrent = ch.id === chapter.id;
                const isLocked = ch.isPremium && !unlockedChapterIds.includes(ch.id);

                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setShowToc(false);
                      if (isLocked) {
                        onRequestUnlock(ch);
                      } else {
                        onSelectChapter(ch);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition border ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                        : 'bg-[#20232B] border-gray-800/80 hover:border-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono font-bold w-6 text-gray-400">
                        {ch.chapterNumber}
                      </span>
                      <span className="text-xs font-medium truncate">{ch.title}</span>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isLocked ? (
                        <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          <Lock size={11} /> ₦{ch.priceNGN}
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          Reading
                        </span>
                      ) : (
                        <CheckCircle size={14} className="text-green-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reader Main Content Canvas */}
      <main className={`flex-1 mx-auto w-full px-5 sm:px-8 py-8 sm:py-12 ${widthStyles[readerWidth]}`}>
        {/* Chapter Header Card */}
        <div className="mb-8 pb-6 border-b border-white/10 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
            <span className={`text-xs font-bold tracking-widest uppercase ${currentTheme.accent}`}>
              Chapter {chapter.chapterNumber}
            </span>
            {chapter.isPremium && (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                Premium Serial
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 mb-3">
            {chapter.title}
          </h2>

          <div className="flex items-center justify-center sm:justify-start gap-3 text-xs opacity-75">
            <span>By {story.authorName}</span>
            <span>•</span>
            <span>{chapter.wordCount.toLocaleString()} words</span>
            <span>•</span>
            <span>~{readingTime} min read</span>
          </div>
        </div>

        {/* Narrative Chapter Body */}
        <article
          className={`${fontStyles[fontFamily]} whitespace-pre-line tracking-normal select-text`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {chapter.content}
        </article>

        {/* Reader Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between gap-4">
          <button
            disabled={!prevChapter}
            onClick={() => {
              if (prevChapter) {
                onSelectChapter(prevChapter);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold transition"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span className="text-xs opacity-60">
            {chapter.chapterNumber} of {sortedChapters.length}
          </span>

          {nextChapter ? (
            <button
              onClick={handleNextClick}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition shadow-lg shadow-amber-500/20"
            >
              <span>{nextChapter.isPremium && !unlockedChapterIds.includes(nextChapter.id) ? `Unlock Ch ${nextChapter.chapterNumber} (₦${nextChapter.priceNGN})` : 'Next Chapter'}</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold"
            >
              Back to Story
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
