import React from 'react';
import {
  Star,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  Bookmark,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { Story, Chapter, ReadingProgress } from '../types';

interface HomeViewProps {
  stories: Story[];
  chapters: Chapter[];
  readingProgress: Record<string, ReadingProgress>;
  libraryStoryIds: string[];
  onSelectStory: (story: Story) => void;
  onSelectChapter: (chapter: Chapter) => void;
  onToggleLibrary: (storyId: string) => void;
  onNavigateToDiscover: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stories,
  chapters,
  readingProgress,
  libraryStoryIds,
  onSelectStory,
  onSelectChapter,
  onToggleLibrary,
  onNavigateToDiscover,
}) => {
  const featuredStory = stories.find((s) => s.isFeatured) || stories[0];
  const trendingStories = stories.filter((s) => s.isTrending);
  const newAndUnderrated = stories.filter((s) => s.isNewAndUnderrated);

  // Find the first story in progress
  const progressStoryId = Object.keys(readingProgress)[0] || 'story-1';
  const continueStory = stories.find((s) => s.id === progressStoryId) || stories[0];
  const progressInfo = readingProgress[progressStoryId] || {
    lastChapterId: 'ch-1',
    lastChapterNumber: 1,
    scrollPercentage: 65,
  };
  const continueChapter =
    chapters.find((c) => c.id === progressInfo.lastChapterId) ||
    chapters.find((c) => c.storyId === continueStory?.id) ||
    chapters[0];

  const isFeaturedSaved = featuredStory ? libraryStoryIds.includes(featuredStory.id) : false;

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Featured Story Cinematic Hero Banner */}
      {featuredStory && (
        <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-[#181A20] shadow-2xl group">
          {/* Subtle Ambient Background Backdrop */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredStory.coverImage}
              alt="Backdrop"
              className="w-full h-full object-cover opacity-15 filter blur-md scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101114] via-[#101114]/80 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
            <img
              src={featuredStory.coverImage}
              alt={featuredStory.title}
              className="w-40 h-56 sm:w-48 sm:h-68 object-cover rounded-2xl shadow-2xl border border-gray-700/60 shrink-0 group-hover:scale-102 transition duration-300"
            />

            <div className="flex-1 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles size={12} />
                <span>Featured African Serial</span>
              </span>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-3 mb-2 tracking-tight">
                {featuredStory.title}
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 mb-4 max-w-2xl leading-relaxed">
                {featuredStory.synopsis}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-xs text-gray-400">
                <span className="text-gray-300 font-semibold">By {featuredStory.authorName}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Star size={13} fill="currentColor" /> {featuredStory.ratingAverage.toFixed(1)}
                </span>
                <span>•</span>
                <span>{featuredStory.chapterCount} Chapters</span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3">
                <button
                  onClick={() => onSelectStory(featuredStory)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition flex items-center gap-2"
                >
                  <BookOpen size={16} />
                  <span>Read Now</span>
                </button>

                <button
                  onClick={() => onToggleLibrary(featuredStory.id)}
                  className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                    isFeaturedSaved
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-gray-800/80 hover:bg-gray-800 text-gray-300 border-gray-700'
                  }`}
                >
                  <Bookmark size={15} fill={isFeaturedSaved ? 'currentColor' : 'none'} />
                  <span>{isFeaturedSaved ? 'In Library' : '+ Add to Library'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Reading Section */}
      {continueStory && continueChapter && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              <span>Continue Reading</span>
            </h3>
            <span className="text-[11px] text-gray-400">{progressInfo.scrollPercentage}% completed</span>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-[#181A20] border border-gray-800/80 flex items-center justify-between gap-4 shadow-lg">
            <div
              onClick={() => onSelectChapter(continueChapter)}
              className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
            >
              <img
                src={continueStory.coverImage}
                alt={continueStory.title}
                className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-xl border border-gray-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block truncate">
                  {continueStory.title}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                  Ch {continueChapter.chapterNumber}: {continueChapter.title}
                </h4>
                {/* Visual Progress Bar */}
                <div className="w-full max-w-xs bg-gray-800 h-2 rounded-full mt-2 overflow-hidden border border-gray-700/50">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressInfo.scrollPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectChapter(continueChapter)}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black hover:bg-amber-400 transition shrink-0"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {/* Trending Stories Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-amber-400" />
            <span>Trending on StoryNest</span>
          </h3>
          <button
            onClick={onNavigateToDiscover}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Explore all</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {trendingStories.map((story) => (
            <div
              key={story.id}
              onClick={() => onSelectStory(story)}
              className="bg-[#181A20] rounded-2xl p-3 border border-gray-800/80 hover:border-amber-500/40 cursor-pointer transition flex flex-col group shadow-md"
            >
              <div className="relative overflow-hidden rounded-xl mb-2.5">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-44 sm:h-48 object-cover rounded-xl group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 backdrop-blur-sm text-amber-400">
                  Trending
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-snug">
                {story.title}
              </h4>
              <p className="text-[11px] text-gray-400 truncate mb-2">{story.authorName}</p>

              <div className="mt-auto flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-800/80 pt-2">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star size={11} fill="currentColor" /> {story.ratingAverage.toFixed(1)}
                </span>
                <span>{story.chapterCount} chs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New & Underrated Stories (Nurturing Emerging Voices) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              <span>New & Underrated African Voices</span>
            </h3>
            <p className="text-xs text-gray-400">
              Supporting rising storytellers across Nigeria, Kenya, and Ghana.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {newAndUnderrated.map((story) => (
            <div
              key={story.id}
              onClick={() => onSelectStory(story)}
              className="p-4 rounded-3xl bg-[#181A20] border border-gray-800/80 flex gap-4 cursor-pointer hover:border-gray-700 transition shadow-lg group"
            >
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-2xl shrink-0 group-hover:scale-105 transition"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Fresh Discovery
                </span>
                <h4 className="text-sm font-bold text-white truncate mt-0.5">{story.title}</h4>
                <p className="text-xs text-gray-400 line-clamp-2 my-1 leading-relaxed">
                  {story.synopsis}
                </p>
                <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400">
                  <span>By {story.authorName}</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Star size={11} fill="currentColor" /> {story.ratingAverage.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
