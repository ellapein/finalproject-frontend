import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import FormField from '../components/FormField';
import PasswordInput from '../components/PasswordInput';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { hasErrors, validateRegister } from '../lib/validation';
import { friendlyError } from '../services/authService';
import type { FieldErrors, Role } from '../types';

export default function RegisterPage() {
  const { profile, registerStudent, registerAdviser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('student');
  const [form, setForm] = useState({ name: '', studentId: '', teamCode: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (profile) return <Navigate to="/" replace />;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    const v = validateRegister({ role, ...form });
    setErrors(v);
    if (hasErrors(v)) return;
    setBusy(true);
    try {
      if (role === 'student') {
        await registerStudent({ name: form.name, email: form.email, password: form.password, studentId: form.studentId, teamCode: form.teamCode });
      } else {
        await registerAdviser({ name: form.name, email: form.email, password: form.password });
      }
      toast.show(`Welcome to PeerCheck, ${form.name.split(' ')[0]}! 🎉`, 'success');
      navigate('/');
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <form className="auth-form" onSubmit={submit} noValidate aria-labelledby="register-title">
        <h2 id="register-title">Create your account</h2>
        <div className="field">
          <span className="label" id="role-label">I am a…</span>
          <div className="segmented" role="group" aria-labelledby="role-label">
            <button type="button" aria-pressed={role === 'student'} onClick={() => setRole('student')}>🎓 Student</button>
            <button type="button" aria-pressed={role === 'adviser'} onClick={() => setRole('adviser')}>🧑‍🏫 Adviser</button>
          </div>
        </div>

        <FormField label="Full name" error={errors.name}>
          {(p) => <input {...p} type="text" value={form.name} onChange={set('name')} autoComplete="name" placeholder="e.g. Juan Dela Cruz" />}
        </FormField>

        {role === 'student' && (
          <>
            <FormField label="Student ID" error={errors.studentId}>
              {(p) => <input {...p} type="text" value={form.studentId} onChange={set('studentId')} placeholder="e.g. 2023-0105" />}
            </FormField>
            <FormField label="Team code" hint="Ask your adviser or team leader." error={errors.teamCode}>
              {(p) => <input {...p} type="text" value={form.teamCode} onChange={set('teamCode')} autoCapitalize="characters" placeholder="e.g. CAP-ALPHA" />}
            </FormField>
          </>
        )}
        {role === 'adviser' && (
          <div className="notice warn" style={{ marginBottom: '1rem' }}>
            <span className="ico" aria-hidden="true">🔑</span>
            <p>Adviser accounts work only for emails approved by the administrator in advance.</p>
          </div>
        )}

        <FormField label="Email" error={errors.email}>
          {(p) => <input {...p} type="email" value={form.email} onChange={set('email')} autoComplete="email" />}
        </FormField>
        <FormField label="Password" hint="At least 8 characters" error={errors.password}>
          {(p) => <PasswordInput {...p} value={form.password} onChange={set('password')} autoComplete="new-password" />}
        </FormField>
        <FormField label="Confirm password" error={errors.confirm}>
          {(p) => <PasswordInput {...p} value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />}
        </FormField>

        {formError && <div className="error-msg" role="alert" style={{ marginBottom: '.75rem' }}>{formError}</div>}
        <button className="btn block" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create my account'}</button>
        <p className="center small" style={{ marginTop: '1.25rem' }}>Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </AuthShell>
  );
}
