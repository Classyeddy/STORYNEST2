import { Chapter } from '../types';

export const PLATFORM_FEE_RATE = 0.15; // 15% platform commission

export interface RevenueSplitResult {
  grossAmount: number;
  platformFee: number;
  authorNet: number;
}

/**
 * Calculates the 85/15 revenue split for Nigerian Naira (NGN) story monetization.
 */
export function calculateRevenueSplit(amountNGN: number, feeRate: number = PLATFORM_FEE_RATE): RevenueSplitResult {
  if (amountNGN < 0) {
    throw new Error('Transaction amount cannot be negative');
  }
  const platformFee = Math.round(amountNGN * feeRate * 100) / 100;
  const authorNet = Math.round((amountNGN - platformFee) * 100) / 100;

  return {
    grossAmount: amountNGN,
    platformFee,
    authorNet,
  };
}

/**
 * Validates whether a user has sufficient balance to unlock a chapter.
 */
export function canUnlockChapter(walletBalanceNGN: number, chapterPriceNGN: number): boolean {
  if (chapterPriceNGN <= 0) return true;
  return walletBalanceNGN >= chapterPriceNGN;
}

/**
 * Processes a chapter unlock attempt against a user's wallet.
 */
export function processChapterUnlock(
  currentBalance: number,
  chapter: Pick<Chapter, 'id' | 'priceNGN' | 'isPremium'>
): { success: boolean; newBalance: number; error?: string } {
  if (!chapter.isPremium || chapter.priceNGN <= 0) {
    return { success: true, newBalance: currentBalance };
  }

  if (currentBalance < chapter.priceNGN) {
    return {
      success: false,
      newBalance: currentBalance,
      error: `Insufficient wallet balance. Chapter costs ₦${chapter.priceNGN}, but balance is ₦${currentBalance}.`,
    };
  }

  return {
    success: true,
    newBalance: currentBalance - chapter.priceNGN,
  };
}

/**
 * Formats a number to Nigerian Naira display string (e.g. ₦1,500).
 */
export function formatNGN(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace('NGN', '₦').trim();
}

/**
 * Calculates estimated reading time in minutes based on word count.
 */
export function calculateReadingTimeMinutes(wordCount: number, wordsPerMinute: number = 200): number {
  if (wordCount <= 0) return 1;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
