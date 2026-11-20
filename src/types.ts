export type Role = 'student' | 'adviser';
export type Term = 'Midterm' | 'Final';
export type CriterionId = 'contribution' | 'quality' | 'communication' | 'teamwork' | 'reliability' | 'initiative';
export type Ratings = Record<CriterionId, number>;

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  studentId: string | null;
  teamId: string | null;
  projectRole: string;
}

export interface Team {
  code: string; // also the Firestore document id
  name: string;
  project: string;
  adviserId: string;
}

export interface Evaluation {
  id: string;
  teamId: string;
  term: Term;
  evaluatorId: string;
  evaluateeId: string;
  ratings: Ratings;
  strengths: string;
  improvements: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type FieldErrors = Record<string, string>;
