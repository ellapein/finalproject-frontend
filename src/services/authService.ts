import { createUserWithEmailAndPassword, deleteUser, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

/** Turns Firebase error codes into friendly messages. */
export function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Email or password is incorrect. Please try again.';
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 8 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
    case 'unavailable':
      return 'Network problem. Please check your internet connection.';
    case 'permission-denied':
      return 'You do not have permission to do that.';
    default:
      return err instanceof Error && err.message && !code ? err.message : 'Something went wrong. Please try again.';
  }
}

export async function login(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

export const logout = () => signOut(auth);

/** Sends Firebase's password-reset email (works only for registered addresses; the caller shows a neutral message). */
export const sendResetEmail = (email: string) => sendPasswordResetEmail(auth, email.trim().toLowerCase());

interface RegisterBase { name: string; email: string; password: string }

/**
 * CREATE a student account: Firebase Auth user + users/{uid} profile in Firestore.
 * If anything fails after the Auth user exists, the Auth user is removed so no orphan account is left.
 */
export async function registerStudent(v: RegisterBase & { studentId: string; teamCode: string }) {
  const cred = await createUserWithEmailAndPassword(auth, v.email.trim().toLowerCase(), v.password);
  try {
    const teamId = v.teamCode.trim().toUpperCase();
    const team = await getDoc(doc(db, 'teams', teamId));
    if (!team.exists()) {
      throw new Error('We could not find a team with that code. Ask your adviser or team leader for the correct code.');
    }
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: v.name.trim(), email: v.email.trim().toLowerCase(), role: 'student',
      studentId: v.studentId.trim(), teamId, projectRole: 'Member', createdAt: serverTimestamp(),
    });
  } catch (err) {
    await deleteUser(cred.user).catch(() => undefined);
    throw err;
  }
  return cred.user.uid;
}

/**
 * CREATE an adviser account. Firestore rules only accept it when the email was pre-approved
 * in the `adviserInvites` collection by the administrator (see README).
 */
export async function registerAdviser(v: RegisterBase) {
  const cred = await createUserWithEmailAndPassword(auth, v.email.trim().toLowerCase(), v.password);
  try {
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: v.name.trim(), email: v.email.trim().toLowerCase(), role: 'adviser',
      studentId: null, teamId: null, projectRole: 'Capstone Adviser', createdAt: serverTimestamp(),
    });
  } catch (err) {
    await deleteUser(cred.user).catch(() => undefined);
    if ((err as { code?: string }).code === 'permission-denied') {
      throw new Error('This email has not been approved as an adviser. Ask the administrator to add it to the invite list.');
    }
    throw err;
  }
  return cred.user.uid;
}
