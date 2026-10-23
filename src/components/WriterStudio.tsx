import React, { useState } from 'react';
import {
  PenTool,
  BookPlus,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Eye,
  PlusCircle,
  X,
  FileText,
} from 'lucide-react';
import { Story, Chapter, UserProfile, ContentWarning } from '../types';
import { formatNGN, calculateReadingTimeMinutes } from '../utils/monetization';

interface WriterStudioProps {
  stories: Story[];
  user: UserProfile;
  onPublishChapter: (newChapter: Omit<Chapter, 'id' | 'publishedAt' | 'updatedAt'>) => void;
  onCreateStory: (newStory: Story) => void;
  onShowToast: (msg: string) => void;
}

export const WriterStudio: React.FC<WriterStudioProps> = ({
  stories,
  user,
  onPublishChapter,
  onCreateStory,
  onShowToast,
}) => {
  const userStories = stories.filter((s) => s.authorId === user.id);
  const availableStories = userStories.length > 0 ? userStories : stories;

  const [selectedStoryId, setSelectedStoryId] = useState<string>(availableStories[0]?.id || 'story-1');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [priceNGN, setPriceNGN] = useState<number>(150);
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'stories' | 'new-story'>('editor');
  const [statusMessage, setStatusMessage] = useState('All drafts autosaved locally');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // New Story Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newCoverImage, setNewCoverImage] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Fantasy', 'Afrofuturism']);
  const [newTags, setNewTags] = useState('Nigeria, Lagos, Mythology');
  const [selectedWarnings, setSelectedWarnings] = useState<ContentWarning[]>(['none']);

  const selectedStory = availableStories.find((s) => s.id === selectedStoryId) || availableStories[0];
  const wordCount = chapterContent.trim() ? chapterContent.trim().split(/\s+/).length : 0;
  const readingTime = calculateReadingTimeMinutes(wordCount);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim() || !chapterContent.trim()) {
      onShowToast('Please provide a chapter title and narrative content.');
      return;
    }

    setStatusMessage('Broadcasting to StoryNest serialization pipeline...');
    setTimeout(() => {
      onPublishChapter({
        storyId: selectedStoryId,
        authorId: user.id,
        chapterNumber: (selectedStory?.chapterCount || 0) + 1,
        title: chapterTitle.trim(),
        content: chapterContent.trim(),
        excerpt: chapterContent.trim().slice(0, 140) + '...',
        wordCount,
        isPremium,
        priceNGN: isPremium ? priceNGN : 0,
        isDraft: false,
      });

      setStatusMessage('Chapter published and live in database!');
      onShowToast(`"Chapter ${chapterTitle}" published successfully!`);
      setChapterTitle('');
      setChapterContent('');
      setIsPreviewOpen(false);
    }, 600);
  };

  const handleCreateNewStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSynopsis.trim()) {
      onShowToast('Please provide a title and synopsis for your new serial.');
      return;
    }

    const storyId = `story-${Date.now()}`;
    const created: Story = {
      id: storyId,
      authorId: user.id,
      authorName: user.displayName,
      authorAvatar: user.avatarUrl,
      title: newTitle.trim(),
      tagline: newTagline.trim() || newTitle.trim(),
      synopsis: newSynopsis.trim(),
      coverImage: newCoverImage.trim(),
      genres: selectedGenres,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'ongoing',
      contentWarnings: selectedWarnings,
      totalWords: 0,
      chapterCount: 0,
      viewsCount: 0,
      ratingAverage: 5.0,
      ratingCount: 1,
      isFeatured: false,
      isTrending: false,
      isNewAndUnderrated: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onCreateStory(created);
    setSelectedStoryId(storyId);
    setActiveSubTab('editor');
    onShowToast(`"${created.title}" created! You can now write its first chapter.`);
    setNewTitle('');
    setNewTagline('');
    setNewSynopsis('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <PenTool size={18} />
            </span>
            <h2 className="text-xl font-extrabold text-white">StoryNest Writer Studio</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Publish serialized chapters, manage your series, and earn directly in Nigerian Naira.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 bg-[#1A1D24] p-1 rounded-xl border border-gray-800 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('editor')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'editor'
                ? 'bg-amber-500 text-black shadow font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Chapter Editor
          </button>
          <button
            onClick={() => setActiveSubTab('new-story')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              activeSubTab === 'new-story'
                ? 'bg-amber-500 text-black shadow font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <PlusCircle size={13} />
            <span>New Serial</span>
          </button>
          <button
            onClick={() => setActiveSubTab('stories')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'stories'
                ? 'bg-amber-500 text-black shadow font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Series ({availableStories.length})
          </button>
        </div>
      </div>

      {/* Author Analytics Snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#181A20] border border-gray-800/80">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Total Reads</span>
            <TrendingUp size={14} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">41.8k</p>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">+18% this month</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#181A20] border border-gray-800/80">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Subscribers</span>
            <Users size={14} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">1,248</p>
          <span className="text-[10px] text-amber-400/80 font-semibold mt-1 block">Active readers</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#181A20] border border-gray-800/80">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Author Balance</span>
            <DollarSign size={14} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{formatNGN(user.walletBalanceNGN)}</p>
          <span className="text-[10px] text-gray-400 mt-1 block">85% Net Royalty Split</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#181A20] border border-gray-800/80">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Payout Account</span>
            <ShieldCheck size={14} className="text-emerald-400" />
          </div>
          <p className="text-xs font-bold text-white mt-1">
            {user.bankAccount ? `${user.bankAccount.bankName} •••${user.bankAccount.accountNumber.slice(-4)}` : 'Access Bank •••4920'}
          </p>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
            <CheckCircle2 size={11} /> Verified (Paystack)
          </span>
        </div>
      </div>

      {/* SUB-VIEW 1: CHAPTER EDITOR */}
      {activeSubTab === 'editor' && (
        <form onSubmit={handlePublish} className="space-y-4">
          <div className="bg-[#181A20] p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="story-select" className="text-xs text-gray-400 font-semibold whitespace-nowrap">
                Publishing to:
              </label>
              <select
                id="story-select"
                value={selectedStoryId}
                onChange={(e) => setSelectedStoryId(e.target.value)}
                className="bg-[#101114] border border-gray-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500"
              >
                {availableStories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.chapterCount} chs)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                disabled={!chapterTitle.trim() || !chapterContent.trim()}
                className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-200 text-xs font-bold transition flex items-center gap-1"
              >
                <Eye size={13} />
                <span>Preview</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Publish Chapter</span>
              </button>
            </div>
          </div>

          <div className="bg-[#181A20] p-5 rounded-3xl border border-gray-800 space-y-4">
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Chapter Title (e.g. Chapter 5: Fire on the Lagoon)"
              className="w-full bg-[#101114] border border-gray-700/80 rounded-2xl px-4 py-3 text-sm text-white font-bold placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#121316] border border-gray-800 text-xs text-gray-300">
              <div className="flex items-center gap-4">
                <span className="font-mono text-gray-400">
                  <strong className="text-white">{wordCount.toLocaleString()}</strong> words
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">~{readingTime} min read</span>
              </div>

              {/* Premium Toggle */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                  <span className="font-semibold flex items-center gap-1 text-white">
                    <Lock size={12} className={isPremium ? 'text-amber-400' : 'text-gray-400'} />
                    Lock as Premium (Monetized)
                  </span>
                </label>

                {isPremium && (
                  <div className="flex items-center gap-1.5 bg-[#181A20] px-3 py-1 rounded-xl border border-amber-500/30">
                    <span className="text-amber-400 font-bold">₦</span>
                    <input
                      type="number"
                      min="50"
                      max="2000"
                      step="50"
                      value={priceNGN}
                      onChange={(e) => setPriceNGN(Number(e.target.value))}
                      className="w-16 bg-transparent text-white font-bold text-xs focus:outline-none"
                    />
                    <span className="text-[10px] text-gray-400">per unlock</span>
                  </div>
                )}
              </div>
            </div>

            <textarea
              value={chapterContent}
              onChange={(e) => setChapterContent(e.target.value)}
              placeholder="Write your serialized African story here. Use double returns for paragraphs. Readers will experience this in customizable reader palettes..."
              rows={14}
              className="w-full bg-[#101114] border border-gray-700/80 rounded-2xl p-5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500 font-serif leading-relaxed"
            />
          </div>
        </form>
      )}

      {/* SUB-VIEW 2: CREATE NEW SERIAL */}
      {activeSubTab === 'new-story' && (
        <form onSubmit={handleCreateNewStory} className="bg-[#181A20] p-6 rounded-3xl border border-gray-800 space-y-4">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookPlus size={18} className="text-amber-400" />
              <span>Create New Serialized African Fiction</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Launch a new serialized work on StoryNest. Once created, you can publish chapters immediately.
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-300 font-semibold block mb-1">Story Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Chronicles of the Oshun Springs"
              className="w-full bg-[#101114] border border-gray-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 font-semibold block mb-1">Tagline (One-sentence hook)</label>
            <input
              type="text"
              value={newTagline}
              onChange={(e) => setNewTagline(e.target.value)}
              placeholder="e.g. When the ancient river wakes, only a rogue apprentice can broker peace."
              className="w-full bg-[#101114] border border-gray-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 font-semibold block mb-1">Synopsis</label>
            <textarea
              required
              rows={4}
              value={newSynopsis}
              onChange={(e) => setNewSynopsis(e.target.value)}
              placeholder="Describe the world, character conflict, and high stakes that will keep serialized readers hooked..."
              className="w-full bg-[#101114] border border-gray-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 font-semibold block mb-1">Cover Image URL</label>
            <input
              type="url"
              value={newCoverImage}
              onChange={(e) => setNewCoverImage(e.target.value)}
              className="w-full bg-[#101114] border border-gray-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-300 font-semibold block mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Yoruba, Magic, Tech, Lagos"
                className="w-full bg-[#101114] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-semibold block mb-1">Content Warnings</label>
              <select
                value={selectedWarnings[0]}
                onChange={(e) => setSelectedWarnings([e.target.value as ContentWarning])}
                className="w-full bg-[#101114] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="none">None (General Audiences)</option>
                <option value="violence">Violence / Action</option>
                <option value="strong_language">Strong Language</option>
                <option value="mature_themes">Mature Themes</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition mt-4"
          >
            Create Serial & Start Writing
          </button>
        </form>
      )}

      {/* SUB-VIEW 3: MY PUBLISHED SERIES */}
      {activeSubTab === 'stories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availableStories.map((story) => (
            <div
              key={story.id}
              className="p-5 rounded-3xl bg-[#181A20] border border-gray-800 flex gap-4 items-start"
            >
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-20 h-28 object-cover rounded-2xl border border-gray-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {story.status}
                </span>
                <h3 className="text-sm font-bold text-white truncate mt-0.5">{story.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 my-1">{story.tagline}</p>

                <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                  <span>{story.chapterCount} chapters</span>
                  <span>•</span>
                  <span>★ {story.ratingAverage.toFixed(1)}</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedStoryId(story.id);
                    setActiveSubTab('editor');
                  }}
                  className="mt-3 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/20 transition flex items-center gap-1"
                >
                  <BookPlus size={12} />
                  <span>Write Next Chapter</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chapter Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#101114] border border-gray-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Chapter Preview • {selectedStory.title}
                </span>
                <h3 className="text-sm font-bold text-white">{chapterTitle || 'Untitled Chapter'}</h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-serif text-sm leading-relaxed text-gray-200 whitespace-pre-line">
              {chapterContent}
            </div>

            <div className="p-4 border-t border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-400">
                {wordCount} words • {isPremium ? `Locked at ₦${priceNGN}` : 'Free Chapter'}
              </span>
              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400"
              >
                Looks Good — Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
