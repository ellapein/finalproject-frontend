import type { CriterionId, Evaluation, Ratings, UserProfile } from '../types';
import { CRITERIA } from './peer';

export const round1 = (n: number) => Math.round(n * 10) / 10;
export const average = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);

/** Exact mean of the six ratings (use for aggregates). */
export const meanOf = (r: Ratings) => average(CRITERIA.map((c) => r[c.id]));
/** Mean rounded to one decimal (use for display). */
export const overallOf = (r: Ratings) => round1(meanOf(r));

export interface ResultRow {
  member: UserProfile;
  received: Evaluation[];
  perCriterion: Record<CriterionId, number | null>;
  overall: number | null;
  given: number;
  expected: number;
}

/** Adviser-side aggregation: one row per student with averages of the ratings they received. */
export function summarizeResults(members: UserProfile[], evaluations: Evaluation[]): ResultRow[] {
  return members.map((member) => {
    const received = evaluations.filter((e) => e.evaluateeId === member.uid);
    const perCriterion = {} as Record<CriterionId, number | null>;
    for (const c of CRITERIA) {
      perCriterion[c.id] = received.length ? round1(average(received.map((e) => e.ratings[c.id]))) : null;
    }
    return {
      member,
      received,
      perCriterion,
      overall: received.length ? round1(average(received.map((e) => meanOf(e.ratings)))) : null,
      given: evaluations.filter((e) => e.evaluatorId === member.uid).length,
      expected: Math.max(members.length - 1, 0),
    };
  });
}

export function completion(rows: ResultRow[]) {
  const expected = rows.reduce((s, r) => s + r.expected, 0);
  const given = rows.reduce((s, r) => s + r.given, 0);
  return { given, expected, percent: expected ? Math.round((given / expected) * 100) : 0 };
}

export function toCsv(term: string, rows: ResultRow[], nameOf: (uid: string) => string): string {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['Term', 'Evaluatee', 'Evaluator', ...CRITERIA.map((c) => c.label), 'Overall', 'Strengths', 'Areas to improve'];
  const lines = [header.map(esc).join(',')];
  for (const r of rows) {
    for (const e of r.received) {
      lines.push(
        [term, r.member.name, nameOf(e.evaluatorId), ...CRITERIA.map((c) => e.ratings[c.id]), overallOf(e.ratings), e.strengths, e.improvements]
          .map(esc)
          .join(','),
      );
    }
  }
  return lines.join('\n');
}
