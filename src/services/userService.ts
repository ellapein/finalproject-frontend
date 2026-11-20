import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile } from '../types';

export const toProfile = (uid: string, data: Record<string, unknown>): UserProfile => ({
  uid,
  name: String(data.name ?? ''),
  email: String(data.email ?? ''),
  role: data.role === 'adviser' ? 'adviser' : 'student',
  studentId: (data.studentId as string | null) ?? null,
  teamId: (data.teamId as string | null) ?? null,
  projectRole: String(data.projectRole ?? 'Member'),
});

/** READ one user profile. */
export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? toProfile(snap.id, snap.data()) : null;
}

/** READ all students of a team (name-sorted). Firestore rules allow this only for team members and the team's adviser. */
export async function listTeamStudents(teamId: string): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, 'users'), where('teamId', '==', teamId)));
  return snap.docs
    .map((d) => toProfile(d.id, d.data()))
    .filter((u) => u.role === 'student')
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** UPDATE own profile. */
export async function updateProfile(uid: string, fields: { name: string; projectRole: string }) {
  await updateDoc(doc(db, 'users', uid), { name: fields.name.trim(), projectRole: fields.projectRole });
}

/** UPDATE own team (only allowed while the student has no team). */
export async function joinTeam(uid: string, teamCode: string) {
  await updateDoc(doc(db, 'users', uid), { teamId: teamCode.trim().toUpperCase() });
}
