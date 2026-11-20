import type { FieldErrors, Ratings, Role } from '../types';
import { CRITERIA, MAX_COMMENT, MIN_COMMENT } from './peer';

const EMAIL = /^\S+@\S+\.\S+$/;
const STUDENT_ID = /^\d{4}-\d{3,5}$/;
const TEAM_CODE = /^[A-Za-z0-9-]{4,20}$/;

export function validateLogin(email: string, password: string): FieldErrors {
  const e: FieldErrors = {};
  if (!EMAIL.test(email.trim())) e.email = 'Please enter a valid email address.';
  if (!password) e.password = 'Please enter your password.';
  return e;
}

export interface RegisterInput {
  role: Role;
  name: string;
  studentId: string;
  teamCode: string;
  email: string;
  password: string;
  confirm: string;
}

export function validateRegister(v: RegisterInput): FieldErrors {
  const e: FieldErrors = {};
  if (v.name.trim().length < 3) e.name = 'Please enter your full name.';
  if (v.role === 'student') {
    if (!STUDENT_ID.test(v.studentId.trim())) e.studentId = 'Use the format 2023-0105.';
    if (!TEAM_CODE.test(v.teamCode.trim())) e.teamCode = 'Enter the team code from your adviser or leader.';
  }
  if (!EMAIL.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  if (v.password.length < 8) e.password = 'Password must be at least 8 characters.';
  if (v.confirm !== v.password) e.confirm = 'Passwords do not match.';
  return e;
}

export function validateEvaluation(
  ratings: Partial<Ratings>,
  strengths: string,
  improvements: string,
): FieldErrors {
  const e: FieldErrors = {};
  for (const c of CRITERIA) {
    const v = ratings[c.id];
    if (!(typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5)) e[c.id] = 'Please choose a rating from 1 to 5.';
  }
  const check = (key: 'strengths' | 'improvements', text: string) => {
    const len = text.trim().length;
    if (len < MIN_COMMENT) e[key] = `Please write at least ${MIN_COMMENT} characters so your feedback is helpful.`;
    else if (len > MAX_COMMENT) e[key] = `Please keep this under ${MAX_COMMENT} characters.`;
  };
  check('strengths', strengths);
  check('improvements', improvements);
  return e;
}

export function validateTeamForm(v: { name: string; project: string; code: string }, requireCode: boolean): FieldErrors {
  const e: FieldErrors = {};
  if (v.name.trim().length < 3) e.name = 'Team name must be at least 3 characters.';
  if (v.project.trim().length < 5) e.project = 'Please enter the capstone project title.';
  if (requireCode && !TEAM_CODE.test(v.code.trim())) e.code = 'Use 4–20 letters, numbers or dashes (no spaces).';
  return e;
}

export function validateProfile(name: string): FieldErrors {
  return name.trim().length < 3 ? { name: 'Please enter your full name.' } : {};
}

export const hasErrors = (e: FieldErrors) => Object.keys(e).length > 0;
