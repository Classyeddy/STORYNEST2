import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Story, Chapter, Review, ReadingProgress } from '../types';
import { SEED_STORIES, SEED_CHAPTERS, SEED_REVIEWS } from '../data/seedData';

/**
 * Fetches all publicly published stories from Firestore
 */
export async function fetchPublishedStories(): Promise<Story[]> {
  try {
    const q = query(
      collection(db, 'stories'),
      where('status', 'in', ['ongoing', 'completed', 'hiatus']),
      limit(50)
    );
    const snap = await getDocs(q);
    const stories: Story[] = [];
    snap.forEach((d) => {
      stories.push(d.data() as Story);
    });
    return stories;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'stories');
  }
}

/**
 * Fetches single story document
 */
export async function fetchStoryById(storyId: string): Promise<Story | null> {
  try {
    const snap = await getDoc(doc(db, 'stories', storyId));
    if (snap.exists()) {
      return snap.data() as Story;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `stories/${storyId}`);
  }
}

/**
 * Fetches all published chapters for a story
 */
export async function fetchChaptersForStory(
  storyId: string,
  includeDrafts: boolean = false
): Promise<Chapter[]> {
  try {
    let q = query(
      collection(db, 'chapters'),
      where('storyId', '==', storyId),
      orderBy('chapterNumber', 'asc')
    );
    if (!includeDrafts) {
      q = query(
        collection(db, 'chapters'),
        where('storyId', '==', storyId),
        where('isDraft', '==', false),
        orderBy('chapterNumber', 'asc')
      );
    }
    const snap = await getDocs(q);
    const chapters: Chapter[] = [];
    snap.forEach((d) => {
      chapters.push(d.data() as Chapter);
    });
    return chapters;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `chapters?storyId=${storyId}`);
  }
}

/**
 * Creates or updates a story document
 */
export async function saveStoryToFirestore(story: Story): Promise<void> {
  try {
    const ref = doc(db, 'stories', story.id);
    await setDoc(ref, {
      ...story,
      updatedAt: Date.now(),
      serverUpdatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `stories/${story.id}`);
  }
}

/**
 * Publishes or updates a chapter in Firestore
 */
export async function saveChapterToFirestore(chapter: Chapter): Promise<void> {
  try {
    const ref = doc(db, 'chapters', chapter.id);
    await setDoc(ref, {
      ...chapter,
      updatedAt: Date.now(),
      serverUpdatedAt: serverTimestamp(),
    });

    // Update story cumulative metrics if published
    if (!chapter.isDraft) {
      const storyRef = doc(db, 'stories', chapter.storyId);
      const storySnap = await getDoc(storyRef);
      if (storySnap.exists()) {
        const s = storySnap.data() as Story;
        await updateDoc(storyRef, {
          chapterCount: Math.max(s.chapterCount || 0, chapter.chapterNumber),
          totalWords: (s.totalWords || 0) + chapter.wordCount,
          updatedAt: Date.now(),
        });
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `chapters/${chapter.id}`);
  }
}

/**
 * Saves reader progress in Firestore
 */
export async function saveReadingProgressToFirestore(progress: ReadingProgress): Promise<void> {
  const docId = `${progress.userId}_${progress.storyId}`;
  try {
    await setDoc(doc(db, 'readingProgress', docId), {
      ...progress,
      updatedAt: Date.now(),
      serverUpdatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `readingProgress/${docId}`);
  }
}

/**
 * Fetches all reading progress bookmarks for a user
 */
export async function fetchUserReadingProgress(userId: string): Promise<Record<string, ReadingProgress>> {
  try {
    const q = query(
      collection(db, 'readingProgress'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const result: Record<string, ReadingProgress> = {};
    snap.forEach((d) => {
      const p = d.data() as ReadingProgress;
      result[p.storyId] = p;
    });
    return result;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `readingProgress?userId=${userId}`);
  }
}

/**
 * Fetches user unlocked entitlements
 */
export async function fetchUserEntitlements(userId: string): Promise<string[]> {
  try {
    const q = query(
      collection(db, 'entitlements'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const chapterIds: string[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.chapterId) chapterIds.push(data.chapterId);
    });
    return chapterIds;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `entitlements?userId=${userId}`);
  }
}

/**
 * Submits a reader review to Firestore
 */
export async function saveReviewToFirestore(review: Review): Promise<void> {
  try {
    await setDoc(doc(db, 'reviews', review.id), {
      ...review,
      serverCreatedAt: serverTimestamp(),
    });

    // Update average rating on the story
    const storyRef = doc(db, 'stories', review.storyId);
    const snap = await getDoc(storyRef);
    if (snap.exists()) {
      const story = snap.data() as Story;
      const count = (story.ratingCount || 0) + 1;
      const avg = ((story.ratingAverage || 5) * (story.ratingCount || 0) + review.rating) / count;
      await updateDoc(storyRef, {
        ratingCount: count,
        ratingAverage: Math.round(avg * 10) / 10,
        updatedAt: Date.now(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `reviews/${review.id}`);
  }
}

/**
 * Fetches reviews for a story
 */
export async function fetchReviewsForStory(storyId: string): Promise<Review[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('storyId', '==', storyId),
      limit(50)
    );
    const snap = await getDocs(q);
    const reviews: Review[] = [];
    snap.forEach((d) => {
      reviews.push(d.data() as Review);
    });
    return reviews.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `reviews?storyId=${storyId}`);
  }
}

/**
 * Toggles a story in the user's library document
 */
export async function toggleLibraryStory(
  userId: string,
  storyId: string,
  currentIds: string[]
): Promise<string[]> {
  const exists = currentIds.includes(storyId);
  const updated = exists ? currentIds.filter((id) => id !== storyId) : [...currentIds, storyId];

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      libraryStoryIds: updated,
      updatedAt: Date.now(),
    });
    return updated;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}

/**
 * Toggles following an author
 */
export async function toggleFollowAuthor(
  userId: string,
  authorId: string,
  currentFollowing: string[]
): Promise<string[]> {
  const exists = currentFollowing.includes(authorId);
  const updated = exists ? currentFollowing.filter((id) => id !== authorId) : [...currentFollowing, authorId];

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      followingIds: updated,
      updatedAt: Date.now(),
    });
    return updated;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}

/**
 * Seeds initial African serials if Firestore collections are empty
 */
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  try {
    if (!auth.currentUser) {
      return false; // Skip client-side seeding if unauthenticated
    }
    const storiesRef = collection(db, 'stories');
    const existingSnap = await getDocs(query(storiesRef, limit(1)));
    if (!existingSnap.empty) {
      return false; // Already populated
    }

    console.log('Seeding initial African serial stories to Firestore...');
    for (const story of SEED_STORIES) {
      await setDoc(doc(db, 'stories', story.id), story);
    }

    for (const ch of SEED_CHAPTERS) {
      await setDoc(doc(db, 'chapters', ch.id), ch);
    }

    for (const rev of SEED_REVIEWS) {
      await setDoc(doc(db, 'reviews', rev.id), rev);
    }

    return true;
  } catch (err) {
    console.warn('Initial seeding could not be completed automatically:', err);
    return false;
  }
}
