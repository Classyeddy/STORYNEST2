import React, { useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Star,
  CheckCircle2,
  Lock,
  Eye,
  BookOpen,
  AlertTriangle,
  UserCheck,
  UserPlus,
  Send,
} from 'lucide-react';
import { Story, Chapter, Review, UserProfile } from '../types';
import { formatNGN } from '../utils/monetization';

interface StoryDetailViewProps {
  story: Story;
  chapters: Chapter[];
  reviews: Review[];
  user: UserProfile;
  unlockedChapterIds: string[];
  isFollowingAuthor: boolean;
  onBack: () => void;
  onToggleLibrary: (storyId: string) => void;
  onToggleFollowAuthor: (authorId: string) => void;
  onSelectChapter: (chapter: Chapter) => void;
  onRequestUnlock: (chapter: Chapter) => void;
  onSubmitReview: (storyId: string, rating: number, comment: string) => void;
  onShare: (story: Story) => void;
}

export const StoryDetailView: React.FC<StoryDetailViewProps> = ({
  story,
  chapters,
  reviews,
  user,
  unlockedChapterIds,
  isFollowingAuthor,
  onBack,
  onToggleLibrary,
  onToggleFollowAuthor,
  onSelectChapter,
  onRequestUnlock,
  onSubmitReview,
  onShare,
}) => {
  const isInLibrary = user.libraryStoryIds.includes(story.id);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const storyReviews = reviews.filter((r) => r.storyId === story.id);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onSubmitReview(story.id, newRating, newComment.trim());
    setNewComment('');
  };

  return (
    <div className="min-h-screen bg-[#101114] text-gray-200 pb-24 md:pb-12">
      {/* Sticky Story Header Bar */}
      <div className="sticky top-0 z-30 bg-[#101114]/90 backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-between border-b border-gray-800">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-gray-800 text-gray-300 transition"
          aria-label="Back to browsing"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleLibrary(story.id)}
            className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
              isInLibrary
                ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                : 'border-gray-700 bg-gray-800/40 text-gray-300 hover:bg-gray-800'
            }`}
            aria-label={isInLibrary ? 'Remove from library' : 'Save to library'}
          >
            <Bookmark size={16} fill={isInLibrary ? 'currentColor' : 'none'} />
            <span className="hidden sm:inline">{isInLibrary ? 'In Library' : 'Save'}</span>
          </button>

          <button
            onClick={() => onShare(story)}
            className="p-2 rounded-xl border border-gray-700 bg-gray-800/40 hover:bg-gray-800 text-gray-300 transition"
            aria-label="Share story"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Story Hero Section */}
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-[#181A20] p-6 rounded-3xl border border-gray-800/80 shadow-2xl">
          <img
            src={story.coverImage}
            alt={story.title}
            className="w-40 h-56 sm:w-48 sm:h-68 object-cover rounded-2xl shadow-2xl border border-gray-700/60 shrink-0"
          />

          <div className="flex-1 text-center sm:text-left">
            {/* Genre and Status Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-2.5">
              {story.genres.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"
                >
                  {g}
                </span>
              ))}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 capitalize">
                {story.status}
              </span>
              {story.contentWarnings && story.contentWarnings.length > 0 && story.contentWarnings[0] !== 'none' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                  <AlertTriangle size={11} />
                  <span>{story.contentWarnings.join(', ').replace('_', ' ')}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              {story.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 italic mb-4">
              "{story.tagline}"
            </p>

            {/* Author Profile Strip */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-5">
              <img
                src={story.authorAvatar}
                alt={story.authorName}
                className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
              />
              <div className="text-left">
                <span className="text-[11px] text-gray-400 block">Written by</span>
                <span className="text-xs sm:text-sm font-bold text-white">{story.authorName}</span>
              </div>
              <button
                onClick={() => onToggleFollowAuthor(story.authorId)}
                className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
                  isFollowingAuthor
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-gray-200'
                }`}
              >
                {isFollowingAuthor ? <UserCheck size={13} /> : <UserPlus size={13} />}
                <span>{isFollowingAuthor ? 'Following' : 'Follow'}</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-2 bg-[#121317] p-3 rounded-2xl border border-gray-800/80 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs sm:text-sm font-black">
                  <Star size={13} fill="currentColor" />
                  <span>{story.ratingAverage.toFixed(1)}</span>
                </div>
                <span className="text-[10px] text-gray-400">{story.ratingCount} reviews</span>
              </div>
              <div className="border-x border-gray-800">
                <span className="text-xs sm:text-sm font-bold text-white">{sortedChapters.length}</span>
                <span className="text-[10px] text-gray-400 block">Chapters</span>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {(story.totalWords / 1000).toFixed(0)}k
                </span>
                <span className="text-[10px] text-gray-400 block">Words</span>
              </div>
              <div className="border-l border-gray-800">
                <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-bold text-gray-300">
                  <Eye size={12} className="text-gray-400" />
                  <span>{(story.viewsCount / 1000).toFixed(1)}k</span>
                </div>
                <span className="text-[10px] text-gray-400 block">Reads</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="mt-5 flex items-center justify-center sm:justify-start gap-3">
              <button
                onClick={() => {
                  if (sortedChapters.length > 0) {
                    onSelectChapter(sortedChapters[0]);
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
              >
                <BookOpen size={16} />
                <span>Start Reading Chapter 1</span>
              </button>
            </div>
          </div>
        </div>

        {/* Story Synopsis & Tags */}
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-2">
            Synopsis
          </h2>
          <div className="bg-[#181A20] p-5 rounded-2xl border border-gray-800/80 leading-relaxed text-xs sm:text-sm text-gray-300">
            {story.synopsis}
          </div>

          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {story.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-[#1F222A] text-gray-400 border border-gray-800"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Table of Contents / Chapters */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Table of Contents</h2>
              <p className="text-xs text-gray-400">
                Serialized chapters released directly by {story.authorName}
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-400 bg-gray-800/80 px-2.5 py-1 rounded-full">
              {sortedChapters.length} Chapters
            </span>
          </div>

          <div className="space-y-2.5">
            {sortedChapters.map((ch) => {
              const isLocked = ch.isPremium && !unlockedChapterIds.includes(ch.id);

              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    if (isLocked) {
                      onRequestUnlock(ch);
                    } else {
                      onSelectChapter(ch);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isLocked
                      ? 'bg-[#181A20] hover:bg-[#1E2128] border-gray-800'
                      : 'bg-[#1C1F27] hover:bg-[#232732] border-gray-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                      {ch.chapterNumber}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                        {ch.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                        {ch.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    {isLocked ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-amber-500/20 transition">
                        <Lock size={12} />
                        <span>{formatNGN(ch.priceNGN)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 size={13} />
                        <span>{ch.isPremium ? 'Unlocked' : 'Free'}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reader Reviews & Ratings Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Reader Community & Reviews</h2>
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
              <Star size={13} fill="currentColor" /> {story.ratingAverage.toFixed(1)} / 5.0
            </span>
          </div>

          {/* Review Submission Form */}
          <form
            onSubmit={handleReviewSubmit}
            className="p-5 rounded-2xl bg-[#181A20] border border-gray-800 mb-6"
          >
            <span className="text-xs font-bold text-white block mb-2">Leave a Rating & Review</span>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setNewRating(s)}
                  className="p-1 text-amber-400 hover:scale-115 transition"
                  aria-label={`Rate ${s} stars`}
                >
                  <Star
                    size={22}
                    fill={(hoverRating ?? newRating) >= s ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
              <span className="text-xs text-gray-400 ml-2 font-medium">
                {newRating === 5 ? 'Masterpiece!' : newRating === 4 ? 'Great Read' : `${newRating} Stars`}
              </span>
            </div>

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What made this African fiction memorable? React to plot twists or encourage the writer..."
              rows={3}
              className="w-full bg-[#101114] border border-gray-700/80 rounded-xl p-3 text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500 mb-3"
            />

            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-xs font-bold transition flex items-center gap-1.5"
            >
              <Send size={13} />
              <span>Post Review</span>
            </button>
          </form>

          {/* List of Reviews */}
          <div className="space-y-3">
            {storyReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-[#181A20] border border-gray-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.userAvatar}
                      alt={rev.userName}
                      className="w-7 h-7 rounded-full object-cover border border-amber-500/20"
                    />
                    <span className="text-xs font-bold text-white">{rev.userName}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">{rev.content}</p>

                {rev.authorReply && (
                  <div className="bg-[#121316] p-3 rounded-xl border-l-2 border-amber-400 mt-2 text-[11px]">
                    <span className="text-amber-400 font-bold block mb-0.5">Author Response:</span>
                    <p className="text-gray-300 italic">{rev.authorReply}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[10px] text-gray-500">
                  <span>{rev.formattedDate || 'Recent'}</span>
                  <span>{rev.helpfulCount} readers found this helpful</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
