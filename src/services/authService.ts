import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile } from '../types';

/**
 * Creates a new user profile document in Firestore upon registration
 */
export async function createUserProfileDoc(
  user: FirebaseUser,
  customData: { username?: string; displayName?: string; bio?: string } = {}
): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const username =
    customData.username ||
    (user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') : `reader_${user.uid.slice(0, 5)}`);
  const displayName = customData.displayName || user.displayName || username;

  const profile: UserProfile = {
    id: user.uid,
    email: user.email || '',
    username,
    displayName,
    avatarUrl:
      user.photoURL ||
      `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
    bio: customData.bio || 'African serial fiction reader & enthusiast.',
    roles: ['reader'],
    isVerifiedWriter: false,
    followingIds: [],
    libraryStoryIds: [],
    walletBalanceNGN: 0,
    createdAt: Date.now(),
  };

  try {
    await setDoc(userRef, {
      ...profile,
      serverCreatedAt: serverTimestamp(),
    });
    return profile;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }
}

/**
 * Retrieves the user profile from Firestore or creates one if it doesn't exist
 */
export async function getOrCreateUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: user.uid,
        email: data.email || user.email || '',
        username: data.username || user.uid.slice(0, 8),
        displayName: data.displayName || user.displayName || 'StoryNest Reader',
        avatarUrl: data.avatarUrl || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
        bio: data.bio || '',
        roles: data.roles || ['reader'],
        isVerifiedWriter: Boolean(data.isVerifiedWriter),
        followingIds: data.followingIds || [],
        libraryStoryIds: data.libraryStoryIds || [],
        walletBalanceNGN: Number(data.walletBalanceNGN) || 0,
        bankAccount: data.bankAccount,
        createdAt: data.createdAt || Date.now(),
      };
    } else {
      return await createUserProfileDoc(user);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
  }
}

/**
 * Register with email and password
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  username: string,
  displayName: string
): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  try {
    await sendEmailVerification(cred.user);
  } catch (e) {
    console.warn('Could not dispatch verification email immediately:', e);
  }
  return await createUserProfileDoc(cred.user, { username, displayName });
}

/**
 * Login with email and password
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return await getOrCreateUserProfile(cred.user);
}

/**
 * Google Sign-In Popup
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  const cred = await signInWithPopup(auth, googleProvider);
  return await getOrCreateUserProfile(cred.user);
}

/**
 * Logout
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Send password reset email
 */
export async function triggerPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Upgrades a reader account to have 'writer' role without creating a separate account
 */
export async function upgradeToWriter(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;
    const currentRoles: string[] = snap.data().roles || ['reader'];
    if (!currentRoles.includes('writer')) {
      await updateDoc(userRef, {
        roles: [...currentRoles, 'writer'],
        isVerifiedWriter: true,
        updatedAt: Date.now(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}

/**
 * Updates editable user profile fields
 */
export async function updateUserProfile(
  userId: string,
  fields: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'avatarUrl' | 'bankAccount'>>
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      ...fields,
      updatedAt: Date.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}
