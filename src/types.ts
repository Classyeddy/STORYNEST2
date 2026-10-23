export type Role = 'reader' | 'writer' | 'admin';
export type StoryStatus = 'ongoing' | 'completed' | 'hiatus';
export type ContentWarning = 'violence' | 'strong_language' | 'mature_themes' | 'none';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  roles: Role[];
  isVerifiedWriter: boolean;
  followingIds: string[];
  libraryStoryIds: string[];
  walletBalanceNGN: number;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: number;
}

export interface Chapter {
  id: string;
  storyId: string;
  authorId?: string;
  chapterNumber: number;
  title: string;
  content: string; // Stored securely; served to authorized readers
  excerpt: string;
  wordCount: number;
  isPremium: boolean;
  priceNGN: number;
  publishedAt: number | null;
  isDraft: boolean;
  updatedAt: number;
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  tagline: string;
  synopsis: string;
  coverImage: string;
  genres: string[];
  tags: string[];
  status: StoryStatus;
  contentWarnings: ContentWarning[];
  totalWords: number;
  chapterCount: number;
  viewsCount: number;
  ratingAverage: number;
  ratingCount: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewAndUnderrated?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ReadingProgress {
  userId: string;
  storyId: string;
  lastChapterId: string;
  lastChapterNumber: number;
  scrollPercentage: number;
  updatedAt: number;
}

export interface Review {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 to 5
  content: string;
  helpfulCount: number;
  helpfulUserIds: string[];
  authorReply?: string;
  createdAt: number;
  formattedDate?: string;
}

export interface Entitlement {
  id: string;
  userId: string;
  storyId?: string;
  chapterId?: string;
  tierId?: string;
  type: 'chapter_unlock' | 'writer_subscription';
  expiresAt: number | null; // null for perpetual chapter unlocks
  createdAt: number;
}

export interface Transaction {
  reference: string;
  userId: string;
  authorId?: string;
  grossAmount: number;
  platformFee: number;
  authorNet: number;
  currency: 'NGN';
  status: 'success' | 'pending' | 'failed';
  type: 'chapter_unlock' | 'wallet_topup' | 'subscription';
  processedAt: number;
}
