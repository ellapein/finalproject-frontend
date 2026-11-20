import { describe, expect, it } from 'vitest';
import type { Evaluation, UserProfile } from '../../types';
import { completion, overallOf, summarizeResults, toCsv } from '../stats';

const user = (uid: string, name: string): UserProfile => ({ uid, name, email: `${uid}@x.com`, role: 'student', studentId: null, teamId: 'T1', projectRole: 'Member' });
const ev = (from: string, to: string, n: number): Evaluation => ({
  id: `${from}_${to}_Midterm`, teamId: 'T1', term: 'Midterm', evaluatorId: from, evaluateeId: to,
  ratings: { contribution: n, quality: n, communication: n, teamwork: n, reliability: n, initiative: n },
  strengths: 'good "work"', improvements: 'keep going', createdAt: null, updatedAt: null,
});

const members = [user('a', 'Ana'), user('b', 'Ben'), user('c', 'Cy')];

describe('stats', () => {
  it('computes the overall average of one evaluation', () => {
    expect(overallOf({ contribution: 5, quality: 4, communication: 5, teamwork: 5, reliability: 4, initiative: 5 })).toBe(4.7);
  });

  it('averages the exact (unrounded) means, not rounded scores', () => {
    const a = { contribution: 5, quality: 4, communication: 5, teamwork: 5, reliability: 4, initiative: 5 }; // 4.667
    const b = { contribution: 4, quality: 4, communication: 4, teamwork: 5, reliability: 4, initiative: 4 }; // 4.167
    const e1 = { ...ev('b', 'a', 1), ratings: a };
    const e2 = { ...ev('c', 'a', 1), ratings: b };
    expect(summarizeResults(members, [e1, e2]).find((r) => r.member.uid === 'a')!.overall).toBe(4.4);
  });

  it('averages ratings received per student and counts given evaluations', () => {
    const rows = summarizeResults(members, [ev('b', 'a', 5), ev('c', 'a', 3), ev('a', 'b', 4)]);
    const ana = rows.find((r) => r.member.uid === 'a')!;
    expect(ana.overall).toBe(4);
    expect(ana.received).toHaveLength(2);
    expect(ana.given).toBe(1);
    expect(ana.expected).toBe(2);
    expect(rows.find((r) => r.member.uid === 'c')!.overall).toBeNull();
  });

  it('reports completion percentage', () => {
    const rows = summarizeResults(members, [ev('b', 'a', 5), ev('c', 'a', 3), ev('a', 'b', 4)]);
    expect(completion(rows)).toEqual({ given: 3, expected: 6, percent: 50 });
    expect(completion([])).toEqual({ given: 0, expected: 0, percent: 0 });
  });

  it('exports CSV with escaped quotes', () => {
    const rows = summarizeResults(members, [ev('b', 'a', 5)]);
    const csv = toCsv('Midterm', rows, (id) => members.find((m) => m.uid === id)!.name);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('"Ben"');
    expect(lines[1]).toContain('"good ""work"""');
  });
});
