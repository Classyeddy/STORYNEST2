import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bookmark,
  CheckCircle2,
  DollarSign,
  X,
  CreditCard,
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import {
  getOrCreateUserProfile,
  logoutUser,
} from './services/authService';
import {
  fetchPublishedStories,
  fetchChaptersForStory,
  fetchReviewsForStory,
  saveStoryToFirestore,
  saveChapterToFirestore,
  saveReadingProgressToFirestore,
  fetchUserReadingProgress,
  fetchUserEntitlements,
  saveReviewToFirestore,
  toggleLibraryStory,
  toggleFollowAuthor,
  seedFirestoreIfEmpty,
} from './services/storyService';
import {
  unlockWithWalletBalance,
  creditUserWallet,
  fetchUserTransactions,
} from './services/paymentService';
import { Story, Chapter, Review, UserProfile, ReadingProgress, Transaction } from './types';
import {
  SEED_STORIES,
  SEED_CHAPTERS,
  SEED_REVIEWS,
  INITIAL_USER,
} from './data/seedData';
import { formatNGN } from './utils/monetization';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ReaderView } from './components/ReaderView';
import { StoryDetailView } from './components/StoryDetailView';
import { PaymentModal } from './components/PaymentModal';
import { WriterStudio } from './components/WriterStudio';
import { AdminPanel } from './components/AdminPanel';
import { ProfileView } from './components/ProfileView';
import { DiscoverView } from './components/DiscoverView';
import { HomeView } from './components/HomeView';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'library' | 'write' | 'profile' | 'admin'>('home');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [activeReadingChapter, setActiveReadingChapter] = useState<Chapter | null>(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Core Data State (Initialized from rich seed data, dynamically synced with Firestore)
  const [stories, setStories] = useState<Story[]>(SEED_STORIES);
  const [chapters, setChapters] = useState<Chapter[]>(SEED_CHAPTERS);
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [unlockedChapterIds, setUnlockedChapterIds] = useState<string[]>([
    'ch-1',
    'ch-2',
    'ch-201',
    'ch-202',
    'ch-301',
    'ch-302',
  ]);

  // Reading Progress State per story
  const [readingProgress, setReadingProgress] = useState<Record<string, ReadingProgress>>({
    'story-1': {
      userId: INITIAL_USER.id,
      storyId: 'story-1',
      lastChapterId: 'ch-1',
      lastChapterNumber: 1,
      scrollPercentage: 65,
      updatedAt: Date.now(),
    },
  });

  // Modal & Notification States
  const [paymentModalChapter, setPaymentModalChapter] = useState<Chapter | null>(null);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast Notification Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await getOrCreateUserProfile(fbUser);
          setUser(profile);
          setIsAuthenticated(true);

          // Fetch user's persistent progress & entitlements from Firestore
          const progress = await fetchUserReadingProgress(profile.id);
          if (progress && Object.keys(progress).length > 0) {
            setReadingProgress((prev) => ({ ...prev, ...progress }));
          }

          const entitlements = await fetchUserEntitlements(profile.id);
          if (entitlements && entitlements.length > 0) {
            setUnlockedChapterIds((prev) => Array.from(new Set([...prev, ...entitlements])));
          }

          const userTxs = await fetchUserTransactions(profile.id);
          if (userTxs) {
            setTransactions(userTxs);
          }
        } catch (err) {
          console.warn('Error loading user profile from Firestore:', err);
        }
      } else {
        setIsAuthenticated(false);
        setUser(INITIAL_USER);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Initial Data Loading & Firestore synchronization
  useEffect(() => {
    // Seed initial African serials if database is empty
    seedFirestoreIfEmpty().catch(console.warn);

    // Fetch published stories from Firestore
    fetchPublishedStories()
      .then((fetched) => {
        if (fetched && fetched.length > 0) {
          setStories(fetched);
        }
      })
      .catch((err) => {
        console.warn('Loading stories from local cache / seed:', err);
      });
  }, []);

  // 3. Load chapters & reviews when a story is selected
  useEffect(() => {
    if (!selectedStory) return;

    fetchChaptersForStory(selectedStory.id, true)
      .then((chs) => {
        if (chs && chs.length > 0) {
          setChapters((prev) => {
            const others = prev.filter((c) => c.storyId !== selectedStory.id);
            return [...others, ...chs];
          });
        }
      })
      .catch(console.warn);

    fetchReviewsForStory(selectedStory.id)
      .then((revs) => {
        if (revs && revs.length > 0) {
          setReviews((prev) => {
            const others = prev.filter((r) => r.storyId !== selectedStory.id);
            return [...others, ...revs];
          });
        }
      })
      .catch(console.warn);
  }, [selectedStory?.id]);

  // Check URL query parameters on mount (e.g. autostart or deep link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('story')) {
      const found = stories.find((s) => s.id === params.get('story'));
      if (found) setSelectedStory(found);
    }
  }, [stories]);

  // Handle Paystack Wallet Chapter Unlock
  const handleUnlockWithWallet = async (chapter: Chapter) => {
    const parentStory = stories.find((s) => s.id === chapter.storyId);
    const authorId = parentStory?.authorId || chapter.authorId || 'auth-1';

    if (user.walletBalanceNGN >= chapter.priceNGN) {
      setUser((prev) => ({
        ...prev,
        walletBalanceNGN: prev.walletBalanceNGN - chapter.priceNGN,
      }));
      setUnlockedChapterIds((prev) => [...prev, chapter.id]);
      setPaymentModalChapter(null);
      showToast(`Unlocked "${chapter.title}"! ${formatNGN(chapter.priceNGN)} deducted.`);
      setActiveReadingChapter(chapter);

      try {
        await unlockWithWalletBalance(user.id, user.walletBalanceNGN, chapter, authorId);
        const updatedTxs = await fetchUserTransactions(user.id);
        if (updatedTxs) setTransactions(updatedTxs);
      } catch (err) {
        console.warn('Recorded unlock locally, remote sync error:', err);
      }
    } else {
      showToast('Insufficient wallet balance. Please top up with Paystack.');
    }
  };

  // Handle Instant Top-Up & Unlock
  const handleTopUpAndUnlock = async (chapter: Chapter, topUpAmount: number) => {
    const parentStory = stories.find((s) => s.id === chapter.storyId);
    const authorId = parentStory?.authorId || chapter.authorId || 'auth-1';

    setUser((prev) => ({
      ...prev,
      walletBalanceNGN: prev.walletBalanceNGN + topUpAmount - chapter.priceNGN,
    }));
    setUnlockedChapterIds((prev) => [...prev, chapter.id]);
    setPaymentModalChapter(null);
    showToast(
      `Paystack: Credited ${formatNGN(topUpAmount)}, unlocked "${chapter.title}" (${formatNGN(chapter.priceNGN)})!`
    );
    setActiveReadingChapter(chapter);

    try {
      await creditUserWallet(user.id, user.walletBalanceNGN, topUpAmount);
      await unlockWithWalletBalance(user.id, user.walletBalanceNGN + topUpAmount, chapter, authorId);
      const updatedTxs = await fetchUserTransactions(user.id);
      if (updatedTxs) setTransactions(updatedTxs);
    } catch (err) {
      console.warn('Top-up and unlock recorded locally, remote sync error:', err);
    }
  };

  // Direct Paystack Top-Up
  const handleDirectTopUp = async (amount: number) => {
    setUser((prev) => ({
      ...prev,
      walletBalanceNGN: prev.walletBalanceNGN + amount,
    }));
    setIsTopUpModalOpen(false);
    showToast(`Paystack: Successfully credited ${formatNGN(amount)} to your wallet!`);

    try {
      await creditUserWallet(user.id, user.walletBalanceNGN, amount);
      const updatedTxs = await fetchUserTransactions(user.id);
      if (updatedTxs) setTransactions(updatedTxs);
    } catch (err) {
      console.warn('Top-up recorded locally, remote sync deferred:', err);
    }
  };

  // Toggle Save to Reading Library
  const handleToggleLibrary = async (storyId: string) => {
    const exists = user.libraryStoryIds.includes(storyId);
    const updated = exists
      ? user.libraryStoryIds.filter((id) => id !== storyId)
      : [...user.libraryStoryIds, storyId];

    setUser((prev) => ({ ...prev, libraryStoryIds: updated }));
    showToast(exists ? 'Removed from Library' : 'Saved to Library for offline reading');

    if (isAuthenticated && user.id) {
      try {
        await toggleLibraryStory(user.id, storyId, user.libraryStoryIds);
      } catch (err) {
        console.warn('Library sync deferred:', err);
      }
    }
  };

  // Toggle Following Author
  const handleToggleFollowAuthor = async (authorId: string) => {
    const isFollowing = user.followingIds.includes(authorId);
    const updated = isFollowing
      ? user.followingIds.filter((id) => id !== authorId)
      : [...user.followingIds, authorId];

    setUser((prev) => ({ ...prev, followingIds: updated }));
    showToast(isFollowing ? 'Unfollowed author' : 'Now following author for serialization alerts!');

    if (isAuthenticated && user.id) {
      try {
        await toggleFollowAuthor(user.id, authorId, user.followingIds);
      } catch (err) {
        console.warn('Follow sync deferred:', err);
      }
    }
  };

  // Submit Review and recalculate story average rating
  const handleSubmitReview = async (storyId: string, rating: number, comment: string) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      storyId,
      userId: user.id,
      userName: user.displayName,
      userAvatar: user.avatarUrl,
      rating,
      content: comment,
      helpfulCount: 0,
      helpfulUserIds: [],
      createdAt: Date.now(),
      formattedDate: 'Just now',
    };

    setReviews((prev) => [newRev, ...prev]);

    // Update story rating average
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          const newCount = (s.ratingCount || 0) + 1;
          const newAvg = ((s.ratingAverage || 5) * (s.ratingCount || 0) + rating) / newCount;
          return {
            ...s,
            ratingCount: newCount,
            ratingAverage: Math.round(newAvg * 10) / 10,
          };
        }
        return s;
      })
    );

    showToast('Your review has been published!');

    try {
      await saveReviewToFirestore(newRev);
    } catch (err) {
      console.warn('Review saved locally, remote sync deferred:', err);
    }
  };

  // Publish New Chapter from Writer Studio
  const handlePublishChapter = async (newChapterData: Omit<Chapter, 'id' | 'publishedAt' | 'updatedAt'>) => {
    const newId = `ch-${Date.now()}`;
    const newChapter: Chapter = {
      ...newChapterData,
      id: newId,
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    };

    setChapters((prev) => [...prev, newChapter]);
    if (!newChapter.isPremium) {
      setUnlockedChapterIds((prev) => [...prev, newId]);
    }

    // Increment author story chapter count & word count
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === newChapter.storyId) {
          return {
            ...s,
            chapterCount: Math.max(s.chapterCount || 0, newChapter.chapterNumber),
            totalWords: (s.totalWords || 0) + newChapter.wordCount,
            updatedAt: Date.now(),
          };
        }
        return s;
      })
    );

    try {
      await saveChapterToFirestore(newChapter);
    } catch (err) {
      console.warn('Chapter saved locally, Firestore sync deferred:', err);
    }
  };

  // Create New Serial Story from Writer Studio
  const handleCreateStory = async (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
    showToast(`"${newStory.title}" serial created and published!`);

    try {
      await saveStoryToFirestore(newStory);
    } catch (err) {
      console.warn('Story saved locally, Firestore sync deferred:', err);
    }
  };

  // Update Reading Progress
  const handleUpdateProgress = async (
    storyId: string,
    chapterId: string,
    chapterNum: number,
    scrollPct: number
  ) => {
    const progress: ReadingProgress = {
      userId: user.id,
      storyId,
      lastChapterId: chapterId,
      lastChapterNumber: chapterNum,
      scrollPercentage: scrollPct,
      updatedAt: Date.now(),
    };

    setReadingProgress((prev) => ({
      ...prev,
      [storyId]: progress,
    }));

    if (isAuthenticated && user.id) {
      try {
        await saveReadingProgressToFirestore(progress);
      } catch (err) {
        console.warn('Progress saved locally, remote sync deferred:', err);
      }
    }
  };

  // Share helper
  const handleShare = (story: Story) => {
    if (navigator.share) {
      navigator
        .share({
          title: story.title,
          text: `Read "${story.title}" on StoryNest: ${story.tagline}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Story link copied to clipboard!');
    }
  };

  // Clear current active reader/story view when clicking bottom navigation tabs
  const handleClearReaderAndStory = () => {
    setActiveReadingChapter(null);
    setSelectedStory(null);
  };

  // Sub-view: Active Reading Canvas
  if (activeReadingChapter) {
    const parentStory =
      stories.find((s) => s.id === activeReadingChapter.storyId) || stories[0];

    return (
      <>
        {paymentModalChapter && (
          <PaymentModal
            chapter={paymentModalChapter}
            walletBalanceNGN={user.walletBalanceNGN}
            onClose={() => setPaymentModalChapter(null)}
            onUnlockWithWallet={handleUnlockWithWallet}
            onTopUpAndUnlock={handleTopUpAndUnlock}
          />
        )}
        <ReaderView
          story={parentStory}
          chapter={activeReadingChapter}
          allChapters={chapters.filter((c) => c.storyId === parentStory.id)}
          unlockedChapterIds={unlockedChapterIds}
          onBack={() => setActiveReadingChapter(null)}
          onSelectChapter={(ch) => setActiveReadingChapter(ch)}
          onRequestUnlock={(ch) => setPaymentModalChapter(ch)}
          onUpdateProgress={handleUpdateProgress}
        />
      </>
    );
  }

  // Sub-view: Story Details & Chapter List
  if (selectedStory) {
    return (
      <>
        {paymentModalChapter && (
          <PaymentModal
            chapter={paymentModalChapter}
            walletBalanceNGN={user.walletBalanceNGN}
            onClose={() => setPaymentModalChapter(null)}
            onUnlockWithWallet={handleUnlockWithWallet}
            onTopUpAndUnlock={handleTopUpAndUnlock}
          />
        )}
        <StoryDetailView
          story={selectedStory}
          chapters={chapters.filter((c) => c.storyId === selectedStory.id)}
          reviews={reviews.filter((r) => r.storyId === selectedStory.id)}
          user={user}
          unlockedChapterIds={unlockedChapterIds}
          isFollowingAuthor={user.followingIds.includes(selectedStory.authorId)}
          onBack={() => setSelectedStory(null)}
          onToggleLibrary={handleToggleLibrary}
          onToggleFollowAuthor={handleToggleFollowAuthor}
          onSelectChapter={(ch) => {
            if (ch.isPremium && !unlockedChapterIds.includes(ch.id)) {
              setPaymentModalChapter(ch);
            } else {
              setActiveReadingChapter(ch);
            }
          }}
          onRequestUnlock={(ch) => setPaymentModalChapter(ch)}
          onSubmitReview={handleSubmitReview}
          onShare={handleShare}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#101114] text-gray-100 flex flex-col font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-50 bg-amber-500 text-black px-4 py-3 rounded-2xl shadow-2xl font-black text-xs sm:text-sm flex items-center gap-2 border border-amber-300 animate-in fade-in slide-in-from-top-4"
        >
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Auth Modal (Email/Password, Google Sign-in, Password Reset) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(profile) => {
          setUser(profile);
          setIsAuthenticated(true);
        }}
        onShowToast={showToast}
      />

      {/* Chapter Unlock Modal */}
      {paymentModalChapter && (
        <PaymentModal
          chapter={paymentModalChapter}
          walletBalanceNGN={user.walletBalanceNGN}
          onClose={() => setPaymentModalChapter(null)}
          onUnlockWithWallet={handleUnlockWithWallet}
          onTopUpAndUnlock={handleTopUpAndUnlock}
        />
      )}

      {/* Standalone Paystack Top-Up Modal */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181A20] border border-gray-800 rounded-3xl max-w-sm w-full p-6 text-left relative shadow-2xl">
            <button
              onClick={() => setIsTopUpModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4">
              <CreditCard size={22} />
            </div>

            <h3 className="text-base font-extrabold text-white mb-1">Top Up StoryNest Wallet</h3>
            <p className="text-xs text-gray-400 mb-4">
              Current balance: <strong className="text-amber-400">{formatNGN(user.walletBalanceNGN)}</strong>
            </p>

            <div className="space-y-2 mb-5">
              {[500, 1000, 2500, 5000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleDirectTopUp(amount)}
                  className="w-full p-3 rounded-xl bg-[#121316] hover:bg-amber-500 hover:text-black text-white text-xs font-bold border border-gray-800 hover:border-amber-400 transition flex items-center justify-between group"
                >
                  <span>Credit ₦{amount.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-400 group-hover:text-black font-semibold">
                    Paystack Direct
                  </span>
                </button>
              ))}
            </div>

            <p className="text-[10px] text-gray-500 text-center">
              Supports Nigerian debit cards, USSD, and instant bank transfers.
            </p>
          </div>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(t) => {
          handleClearReaderAndStory();
          setActiveTab(t);
        }}
        user={user}
        isAuthenticated={isAuthenticated}
        onOpenTopUp={() => setIsTopUpModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Tab Content Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <HomeView
            stories={stories}
            chapters={chapters}
            readingProgress={readingProgress}
            libraryStoryIds={user.libraryStoryIds}
            onSelectStory={(s) => setSelectedStory(s)}
            onSelectChapter={(ch) => {
              if (ch.isPremium && !unlockedChapterIds.includes(ch.id)) {
                setPaymentModalChapter(ch);
              } else {
                setActiveReadingChapter(ch);
              }
            }}
            onToggleLibrary={handleToggleLibrary}
            onNavigateToDiscover={() => setActiveTab('discover')}
          />
        )}

        {/* TAB 2: DISCOVER */}
        {activeTab === 'discover' && (
          <DiscoverView
            stories={stories}
            onSelectStory={(s) => setSelectedStory(s)}
          />
        )}

        {/* TAB 3: USER LIBRARY */}
        {activeTab === 'library' && (
          <div className="space-y-6 pb-20 md:pb-8">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Bookmark size={20} className="text-amber-400" />
                  <span>Your Reading Library</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Serials bookmarked for rapid offline reading and progress resumption.
                </p>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                {user.libraryStoryIds.length} Saved
              </span>
            </div>

            {user.libraryStoryIds.length === 0 ? (
              <div className="p-14 text-center bg-[#181A20] rounded-3xl border border-gray-800">
                <Bookmark size={36} className="mx-auto mb-3 text-gray-600" />
                <h3 className="text-sm font-bold text-white mb-1">Your library is empty</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto mb-4">
                  Explore Nigerian and African serial fiction and save stories to access them offline anytime.
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="px-5 py-2.5 bg-amber-500 text-black text-xs font-extrabold rounded-xl hover:bg-amber-400 transition"
                >
                  Discover Stories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stories
                  .filter((st) => user.libraryStoryIds.includes(st.id))
                  .map((story) => {
                    const progress = readingProgress[story.id];
                    return (
                      <div
                        key={story.id}
                        className="p-4 rounded-3xl bg-[#181A20] border border-gray-800/80 hover:border-gray-700 flex gap-4 items-center justify-between transition group"
                      >
                        <div
                          className="flex gap-4 items-center cursor-pointer flex-1 min-w-0"
                          onClick={() => setSelectedStory(story)}
                        >
                          <img
                            src={story.coverImage}
                            alt={story.title}
                            className="w-16 h-22 object-cover rounded-2xl border border-gray-700 shrink-0 group-hover:scale-105 transition"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase text-amber-400">
                              {story.genres[0]}
                            </span>
                            <h4 className="text-sm font-bold text-white truncate">{story.title}</h4>
                            <p className="text-xs text-gray-400 truncate">{story.authorName}</p>
                            {progress && (
                              <div className="mt-2">
                                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                  <span>Ch {progress.lastChapterNumber}</span>
                                  <span>{progress.scrollPercentage}%</span>
                                </div>
                                <div className="w-28 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-amber-400 h-full"
                                    style={{ width: `${progress.scrollPercentage}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleLibrary(story.id)}
                          className="p-2 text-gray-500 hover:text-red-400 rounded-xl hover:bg-gray-800 transition"
                          title="Remove from library"
                          aria-label={`Remove ${story.title} from library`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WRITER STUDIO */}
        {activeTab === 'write' && (
          <WriterStudio
            stories={stories}
            user={user}
            onPublishChapter={handlePublishChapter}
            onCreateStory={handleCreateStory}
            onShowToast={showToast}
          />
        )}

        {/* TAB 5: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            stories={stories}
            isAuthenticated={isAuthenticated}
            transactions={transactions}
            onTopUp={handleDirectTopUp}
            onRemoveFromLibrary={handleToggleLibrary}
            onSelectStory={(s) => setSelectedStory(s)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onSignOut={async () => {
              await logoutUser();
              setIsAuthenticated(false);
              setUser(INITIAL_USER);
              showToast('Signed out of StoryNest');
            }}
            onShowToast={showToast}
            onUserUpdated={(updatedUser) => setUser(updatedUser)}
          />
        )}

        {/* TAB 6: GOVERNANCE & ADMIN */}
        {activeTab === 'admin' && (
          <AdminPanel
            stories={stories}
            onShowToast={showToast}
            onRefreshData={async () => {
              const fetched = await fetchPublishedStories();
              if (fetched && fetched.length > 0) {
                setStories(fetched);
              }
              showToast('Stories refreshed from Firestore');
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(t) => {
          handleClearReaderAndStory();
          setActiveTab(t);
        }}
        onClearReaderAndStory={handleClearReaderAndStory}
      />
    </div>
  );
}
