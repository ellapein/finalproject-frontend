import {
  collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, Timestamp, updateDoc, where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { evaluationId } from '../lib/peer';
import type { Evaluation, Ratings, Term } from '../types';

const toDate = (v: unknown) => (v instanceof Timestamp ? v.toDate() : null);

const toEvaluation = (id: string, d: Record<string, unknown>): Evaluation => ({
  id,
  teamId: String(d.teamId),
  term: d.term === 'Final' ? 'Final' : 'Midterm',
  evaluatorId: String(d.evaluatorId),
  evaluateeId: String(d.evaluateeId),
  ratings: d.ratings as Ratings,
  strengths: String(d.strengths ?? ''),
  improvements: String(d.improvements ?? ''),
  createdAt: toDate(d.createdAt),
  updatedAt: toDate(d.updatedAt),
});

/**
 * READ – evaluations the signed-in student WROTE.
 * PRIVACY: this query is the only evaluation query a student ever runs, and the Firestore
 * Security Rules refuse any read where evaluatorId is not the signed-in user.
 */
export async function listWrittenBy(evaluatorId: string): Promise<Evaluation[]> {
  const snap = await getDocs(query(collection(db, 'evaluations'), where('evaluatorId', '==', evaluatorId)));
  return snap.docs.map((d) => toEvaluation(d.id, d.data())).sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
}

export async function getWritten(evaluatorId: string, evaluateeId: string, term: Term): Promise<Evaluation | null> {
  const snap = await getDoc(doc(db, 'evaluations', evaluationId(evaluatorId, evaluateeId, term)));
  return snap.exists() ? toEvaluation(snap.id, snap.data()) : null;
}

export interface EvaluationInput {
  teamId: string;
  term: Term;
  evaluatorId: string;
  evaluateeId: string;
  ratings: Ratings;
  strengths: string;
  improvements: string;
}

/** CREATE or UPDATE (one evaluation per evaluator + teammate + term). */
export async function saveEvaluation(input: EvaluationInput): Promise<'created' | 'updated'> {
  const ref = doc(db, 'evaluations', evaluationId(input.evaluatorId, input.evaluateeId, input.term));
  const strengths = input.strengths.trim();
  const improvements = input.improvements.trim();
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, { ratings: input.ratings, strengths, improvements, updatedAt: serverTimestamp() });
    return 'updated';
  }
  await setDoc(ref, {
    teamId: input.teamId, term: input.term, evaluatorId: input.evaluatorId, evaluateeId: input.evaluateeId,
    ratings: input.ratings, strengths, improvements, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  return 'created';
}

/** DELETE an evaluation the student wrote. */
export async function deleteEvaluation(id: string) {
  await deleteDoc(doc(db, 'evaluations', id));
}

/** READ (adviser only) – every evaluation of a team in one term. */
export async function listForTeam(teamId: string, term: Term): Promise<Evaluation[]> {
  const snap = await getDocs(query(collection(db, 'evaluations'), where('teamId', '==', teamId), where('term', '==', term)));
  return snap.docs.map((d) => toEvaluation(d.id, d.data()));
}
