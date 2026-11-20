import { describe, expect, it } from 'vitest';
import { hasErrors, validateEvaluation, validateLogin, validateRegister, validateTeamForm } from '../validation';

const goodRatings = { contribution: 4, quality: 4, communication: 4, teamwork: 4, reliability: 4, initiative: 4 };
const text = 'This is a helpful and specific comment.';

describe('validateLogin', () => {
  it('rejects bad email and empty password', () => {
    const e = validateLogin('nope', '');
    expect(e.email).toBeDefined();
    expect(e.password).toBeDefined();
  });
  it('accepts valid credentials', () => {
    expect(hasErrors(validateLogin('a@b.co', 'secret'))).toBe(false);
  });
});

describe('validateRegister', () => {
  const base = { role: 'student' as const, name: 'Juan Dela Cruz', studentId: '2023-0105', teamCode: 'CAP-ALPHA', email: 'j@x.com', password: 'password1', confirm: 'password1' };
  it('accepts a valid student', () => expect(hasErrors(validateRegister(base))).toBe(false));
  it('checks student id format', () => expect(validateRegister({ ...base, studentId: '123' }).studentId).toBeDefined());
  it('checks password match and length', () => {
    expect(validateRegister({ ...base, confirm: 'other' }).confirm).toBeDefined();
    expect(validateRegister({ ...base, password: 'short', confirm: 'short' }).password).toBeDefined();
  });
  it('does not require student id / team code for advisers', () => {
    expect(hasErrors(validateRegister({ ...base, role: 'adviser', studentId: '', teamCode: '' }))).toBe(false);
  });
});

describe('validateEvaluation', () => {
  it('accepts a complete evaluation', () => expect(hasErrors(validateEvaluation(goodRatings, text, text))).toBe(false));
  it('requires all six ratings', () => {
    const e = validateEvaluation({ contribution: 5 }, text, text);
    expect(Object.keys(e)).toHaveLength(5);
  });
  it('rejects out-of-range or decimal ratings', () => {
    expect(validateEvaluation({ ...goodRatings, quality: 6 }, text, text).quality).toBeDefined();
    expect(validateEvaluation({ ...goodRatings, quality: 2.5 }, text, text).quality).toBeDefined();
  });
  it('enforces comment length limits', () => {
    expect(validateEvaluation(goodRatings, 'short', text).strengths).toBeDefined();
    expect(validateEvaluation(goodRatings, text, 'x'.repeat(501)).improvements).toBeDefined();
  });
});

describe('validateTeamForm', () => {
  it('validates fields and ignores code when editing', () => {
    expect(hasErrors(validateTeamForm({ name: 'Team Charlie', project: 'Student Clearance', code: 'a b' }, false))).toBe(false);
    expect(validateTeamForm({ name: 'Team Charlie', project: 'Student Clearance', code: 'a b' }, true).code).toBeDefined();
    expect(validateTeamForm({ name: 'T', project: 'x', code: 'CAP-1234' }, true).name).toBeDefined();
  });
});
