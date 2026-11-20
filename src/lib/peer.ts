import type { CriterionId, Term } from '../types';

export const TERMS: Term[] = ['Midterm', 'Final'];

export const CRITERIA: { id: CriterionId; label: string; hint: string }[] = [
  { id: 'contribution', label: 'Contribution', hint: 'Did they do their fair share of the work?' },
  { id: 'quality', label: 'Quality of work', hint: 'Is their work accurate, neat and well done?' },
  { id: 'communication', label: 'Communication', hint: 'Do they keep the team updated and reply on time?' },
  { id: 'teamwork', label: 'Teamwork', hint: 'Do they listen, help others and respect ideas?' },
  { id: 'reliability', label: 'Reliability', hint: 'Do they meet deadlines and attend meetings?' },
  { id: 'initiative', label: 'Initiative', hint: 'Do they solve problems and take responsibility without being asked?' },
];

export const SCALE: { value: number; label: string }[] = [
  { value: 1, label: 'Needs a lot of improvement' },
  { value: 2, label: 'Below expectations' },
  { value: 3, label: 'Meets expectations' },
  { value: 4, label: 'Above expectations' },
  { value: 5, label: 'Outstanding' },
];

export const PROJECT_ROLES = [
  'Project Leader / System Analyst',
  'Technical Writer',
  'Frontend Developer',
  'Backend Developer',
  'UI/UX Designer',
  'Member',
];

export const MIN_COMMENT = 20;
export const MAX_COMMENT = 500;

/** Deterministic document id: guarantees one evaluation per evaluator + teammate + term. */
export const evaluationId = (evaluatorId: string, evaluateeId: string, term: Term) =>
  `${evaluatorId}_${evaluateeId}_${term}`;

export const asTerm = (value: string | null): Term => (value === 'Final' ? 'Final' : 'Midterm');
