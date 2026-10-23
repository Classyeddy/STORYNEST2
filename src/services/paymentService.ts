import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Transaction, Entitlement, Chapter } from '../types';
import { calculateRevenueSplit } from '../utils/monetization';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  authorName: string;
  amountNGN: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'processed' | 'rejected';
  requestedAt: number;
}

/**
 * Creates an auditable financial transaction and grants entitlement
 * In production, this is called following server-side HMAC verification of Paystack
 */
export async function recordSuccessfulPayment(params: {
  reference: string;
  userId: string;
  authorId: string;
  chapter: Chapter;
  paymentType: 'chapter_unlock' | 'wallet_topup';
}): Promise<{ transaction: Transaction; entitlement: Entitlement }> {
  const { reference, userId, authorId, chapter, paymentType } = params;
  const split = calculateRevenueSplit(chapter.priceNGN);

  const tx: Transaction = {
    reference,
    userId,
    authorId,
    grossAmount: chapter.priceNGN,
    platformFee: split.platformFee,
    authorNet: split.authorNet,
    currency: 'NGN',
    status: 'success',
    type: paymentType,
    processedAt: Date.now(),
  };

  const entitlement: Entitlement = {
    id: `${userId}_${chapter.id}`,
    userId,
    storyId: chapter.storyId,
    chapterId: chapter.id,
    type: 'chapter_unlock',
    createdAt: Date.now(),
    expiresAt: null,
  };

  try {
    // 1. Record immutable ledger transaction
    await setDoc(doc(db, 'transactions', reference), {
      ...tx,
      serverProcessedAt: serverTimestamp(),
    });

    // 2. Grant reading entitlement
    await setDoc(doc(db, 'entitlements', entitlement.id), {
      ...entitlement,
      serverCreatedAt: serverTimestamp(),
    });

    // 3. Update Author's earnings ledger if authorId exists
    if (authorId && authorId !== userId) {
      const authorRef = doc(db, 'users', authorId);
      const snap = await getDoc(authorRef);
      if (snap.exists()) {
        const cur = snap.data().walletBalanceNGN || 0;
        await updateDoc(authorRef, {
          walletBalanceNGN: cur + split.authorNet,
          updatedAt: Date.now(),
        });
      }
    }

    return { transaction: tx, entitlement };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `transactions/${reference}`);
  }
}

/**
 * Unlocks chapter using existing wallet balance with ledger logging
 */
export async function unlockWithWalletBalance(
  userId: string,
  userCurrentBalance: number,
  chapter: Chapter,
  authorId: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (userCurrentBalance < chapter.priceNGN) {
    return {
      success: false,
      newBalance: userCurrentBalance,
      error: `Insufficient balance (₦${userCurrentBalance} vs ₦${chapter.priceNGN})`,
    };
  }

  const reference = `sn_wlt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const split = calculateRevenueSplit(chapter.priceNGN);
  const newBalance = userCurrentBalance - chapter.priceNGN;

  try {
    // Deduct user wallet
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      walletBalanceNGN: newBalance,
      updatedAt: Date.now(),
    });

    // Record ledger transaction & entitlement
    await recordSuccessfulPayment({
      reference,
      userId,
      authorId,
      chapter,
      paymentType: 'chapter_unlock',
    });

    return { success: true, newBalance };
  } catch (err) {
    console.error('Wallet unlock failed:', err);
    return {
      success: false,
      newBalance: userCurrentBalance,
      error: 'Transaction failed. Please try again.',
    };
  }
}

/**
 * Credits user wallet following successful top-up
 */
export async function creditUserWallet(
  userId: string,
  currentBalance: number,
  amountNGN: number
): Promise<number> {
  const ref = `sn_top_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newBalance = currentBalance + amountNGN;

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      walletBalanceNGN: newBalance,
      updatedAt: Date.now(),
    });

    await setDoc(doc(db, 'transactions', ref), {
      reference: ref,
      userId,
      grossAmount: amountNGN,
      platformFee: 0,
      authorNet: amountNGN,
      currency: 'NGN',
      status: 'success',
      type: 'wallet_topup',
      processedAt: Date.now(),
      serverProcessedAt: serverTimestamp(),
    });

    return newBalance;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
  }
}

/**
 * Requests an earnings withdrawal for a verified writer
 */
export async function requestAuthorWithdrawal(params: {
  userId: string;
  authorName: string;
  amountNGN: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}): Promise<WithdrawalRequest> {
  const id = `wd_${Date.now()}`;
  const req: WithdrawalRequest = {
    id,
    ...params,
    status: 'pending',
    requestedAt: Date.now(),
  };

  try {
    await setDoc(doc(db, 'withdrawals', id), {
      ...req,
      serverRequestedAt: serverTimestamp(),
    });
    return req;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `withdrawals/${id}`);
  }
}

/**
 * Lists user transaction ledger entries
 */
export async function fetchUserTransactions(userId: string): Promise<Transaction[]> {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('processedAt', 'desc')
    );
    const snap = await getDocs(q);
    const txs: Transaction[] = [];
    snap.forEach((d) => txs.push(d.data() as Transaction));
    return txs;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `transactions?userId=${userId}`);
  }
}
