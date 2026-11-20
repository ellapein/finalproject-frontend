import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ErrorNotice from '../components/ErrorNotice';
import FormField from '../components/FormField';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { hasErrors, validateTeamForm } from '../lib/validation';
import { friendlyError } from '../services/authService';
import { createTeam, getTeam, updateTeam } from '../services/teamService';
import type { FieldErrors } from '../types';

export default function TeamFormPage() {
  const { profile } = useAuth();
  const { code: editCode } = useParams();
  const editing = Boolean(editCode);
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', project: '', code: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const existing = useAsync(() => (editCode ? getTeam(editCode) : Promise.resolve(null)), [editCode]);

  useEffect(() => {
    if (existing.data) setForm({ name: existing.data.name, project: existing.data.project, code: existing.data.code });
  }, [existing.data]);

  if (editing && existing.loading) return <Spinner />;
  if (editing && (existing.error || !existing.data || existing.data.adviserId !== profile!.uid)) {
    return <ErrorNotice message={existing.error ?? 'Team not found.'} />;
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    const v = validateTeamForm(form, !editing);
    setErrors(v);
    if (hasErrors(v)) return;
    setBusy(true);
    try {
      if (editing) await updateTeam(editCode!, form);
      else await createTeam(profile!.uid, form);
      toast.show(editing ? 'Team updated.' : 'Team created.', 'success');
      navigate('/adviser/teams');
    } catch (err) {
      const msg = friendlyError(err);
      if (msg === 'That team code is already used.') setErrors({ code: msg });
      else setFormError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <p><Link to="/adviser/teams">← Back to teams</Link></p>
      <section className="card">
        <h1>{editing ? 'Edit team' : 'New team'}</h1>
        <form onSubmit={submit} noValidate>
          <FormField label="Team name" error={errors.name}>
            {(p) => <input {...p} type="text" value={form.name} onChange={set('name')} placeholder="e.g. Team Charlie" />}
          </FormField>
          <FormField label="Capstone project title" error={errors.project}>
            {(p) => <input {...p} type="text" value={form.project} onChange={set('project')} placeholder="e.g. Student Clearance System" />}
          </FormField>
          <FormField label="Team code" hint={editing ? 'The code cannot be changed after the team is created.' : 'Students use this to join. Letters, numbers and dashes only.'} error={errors.code}>
            {(p) => <input {...p} type="text" value={form.code} onChange={set('code')} disabled={editing} placeholder="e.g. CAP-CHARLIE" />}
          </FormField>
          {formError && <div className="error-msg" role="alert" style={{ marginBottom: '.75rem' }}>{formError}</div>}
          <div className="row">
            <button className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create team'}</button>
            <Link className="btn ghost" to="/adviser/teams">Cancel</Link>
          </div>
        </form>
      </section>
    </div>
  );
}
