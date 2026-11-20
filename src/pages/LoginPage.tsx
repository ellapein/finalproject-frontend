import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import FormField from '../components/FormField';
import PasswordInput from '../components/PasswordInput';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { hasErrors, validateLogin } from '../lib/validation';
import { friendlyError, sendResetEmail } from '../services/authService';
import type { FieldErrors } from '../types';

export default function LoginPage() {
  const { profile, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (profile) return <Navigate to={profile.role === 'adviser' ? '/adviser' : '/dashboard'} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    const v = validateLogin(email, password);
    setErrors(v);
    if (hasErrors(v)) return;
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    setFormError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrors({ email: 'Type your email address above first, then click “Forgot password?”.' });
      return;
    }
    setErrors({});
    try {
      await sendResetEmail(email);
    } catch {
      /* show the same message either way so we never reveal which emails are registered */
    }
    toast.show('If that email is registered, a password-reset link has been sent. Check your inbox (and spam).', 'success');
  };

  return (
    <AuthShell>
      <form className="auth-form" onSubmit={submit} noValidate aria-labelledby="login-title">
        <h2 id="login-title">Sign In</h2>

        <FormField label="Email" error={errors.email}>
          {(p) => <input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@student.sorsu.edu.ph" />}
        </FormField>

        <div className="field">
          <div className="label-row">
            <label htmlFor="login-password">Password</label>
            <button type="button" className="link-btn" onClick={forgot}>Forgot password?</button>
          </div>
          <PasswordInput id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined} />
          {errors.password && <div className="error-msg">{errors.password}</div>}
        </div>

        {formError && <div className="error-msg" role="alert" style={{ marginBottom: '.75rem' }}>{formError}</div>}
        <button className="btn block" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Continue'}</button>
        <p className="center small" style={{ marginTop: '1.25rem' }}>New here? <Link to="/register">Create an account</Link></p>
      </form>
    </AuthShell>
  );
}
