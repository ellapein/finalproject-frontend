import {
  collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Team } from '../types';

const toTeam = (id: string, d: Record<string, unknown>): Team => ({
  code: id,
  name: String(d.name ?? ''),
  project: String(d.project ?? ''),
  adviserId: String(d.adviserId ?? ''),
});

/** READ one team by its code (the code is the document id). */
export async function getTeam(code: string): Promise<Team | null> {
  const snap = await getDoc(doc(db, 'teams', code.trim().toUpperCase()));
  return snap.exists() ? toTeam(snap.id, snap.data()) : null;
}

/** READ the teams owned by an adviser. */
export async function listAdviserTeams(adviserId: string): Promise<Team[]> {
  const snap = await getDocs(query(collection(db, 'teams'), where('adviserId', '==', adviserId)));
  return snap.docs.map((d) => toTeam(d.id, d.data())).sort((a, b) => a.name.localeCompare(b.name));
}

/** CREATE a team. The code becomes the document id, so it is unique by design. */
export async function createTeam(adviserId: string, v: { name: string; project: string; code: string }) {
  const code = v.code.trim().toUpperCase();
  if (await getTeam(code)) throw new Error('That team code is already used.');
  await setDoc(doc(db, 'teams', code), {
    name: v.name.trim(), project: v.project.trim(), code, adviserId, createdAt: serverTimestamp(),
  });
}

/** UPDATE a team's name and project (the code never changes). */
export async function updateTeam(code: string, v: { name: string; project: string }) {
  await updateDoc(doc(db, 'teams', code), { name: v.name.trim(), project: v.project.trim() });
}

/** DELETE a team with everything that belongs to it (evaluations, memberships). */
export async function deleteTeamCascade(code: string) {
  const [evals, members] = await Promise.all([
    getDocs(query(collection(db, 'evaluations'), where('teamId', '==', code))),
    getDocs(query(collection(db, 'users'), where('teamId', '==', code))),
  ]);
  const batch = writeBatch(db);
  evals.docs.forEach((d) => batch.delete(d.ref));
  members.docs.forEach((d) => batch.update(d.ref, { teamId: null }));
  batch.delete(doc(db, 'teams', code));
  await batch.commit();
}

/** Remove a student from a team and delete every evaluation they gave or received. */
export async function removeMember(teamCode: string, uid: string) {
  const col = collection(db, 'evaluations');
  const [given, received] = await Promise.all([
    getDocs(query(col, where('teamId', '==', teamCode), where('evaluatorId', '==', uid))),
    getDocs(query(col, where('teamId', '==', teamCode), where('evaluateeId', '==', uid))),
  ]);
  const batch = writeBatch(db);
  [...given.docs, ...received.docs].forEach((d) => batch.delete(d.ref));
  batch.update(doc(db, 'users', uid), { teamId: null });
  await batch.commit();
}

