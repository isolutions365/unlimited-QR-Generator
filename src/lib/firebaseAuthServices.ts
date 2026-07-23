import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  fetchSignInMethodsForEmail,
  UserCredential,
  User
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

/**
 * Service 1: Email Login
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, email, pass);
}

/**
 * Service 2: Email Signup
 */
export async function signupWithEmail(
  email: string,
  pass: string,
  displayName?: string
): Promise<UserCredential> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName });
  }
  return cred;
}

/**
 * Service 3: Google Login (With Popup & Redirect Fallback)
 */
export async function loginWithGoogle(): Promise<UserCredential | null> {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err: any) {
    console.warn('[Firebase Auth] Popup sign-in error, trying redirect fallback:', err?.code || err?.message);
    if (
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/popup-closed-by-user' ||
      err.code === 'auth/cancelled-popup-request' ||
      err.code === 'auth/operation-not-supported-in-this-environment' ||
      err.message?.includes('popup')
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw err;
  }
}

/**
 * Check redirect result on load
 */
export async function checkGoogleRedirectResult(): Promise<UserCredential | null> {
  try {
    return await getRedirectResult(auth);
  } catch (err: any) {
    console.warn('[Firebase Auth] Redirect result check notice:', err);
    return null;
  }
}

/**
 * Service 4: Logout
 */
export async function logoutFirebase(): Promise<void> {
  return await signOut(auth);
}

/**
 * Service 5: Forgot Password
 */
export async function sendPasswordReset(email: string): Promise<void> {
  return await sendPasswordResetEmail(auth, email);
}

/**
 * Service 6: Email Verification
 */
export async function verifyUserEmail(targetUser?: User | null): Promise<void> {
  const currentUser = targetUser || auth.currentUser;
  if (!currentUser) {
    throw new Error('No active authenticated user to verify email for.');
  }
  return await sendEmailVerification(currentUser);
}

/**
 * Service 7: Session Restore & ID Token Retrieval
 */
export async function getFirebaseIdToken(forceRefresh: boolean = false): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return await currentUser.getIdToken(forceRefresh);
}

/**
 * Service 8: Get Sign-In Methods for Email
 */
export async function getSignInMethods(email: string): Promise<string[]> {
  try {
    return await fetchSignInMethodsForEmail(auth, email);
  } catch (err: any) {
    console.warn('[Firebase Auth] fetchSignInMethodsForEmail notice:', err?.message || err);
    return [];
  }
}
