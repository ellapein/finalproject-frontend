import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ErrorNotice from '../components/ErrorNotice';
import FormField from '../components/FormField';
import RatingInput from '../components/RatingInput';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { asTerm, CRITERIA, MAX_COMMENT, MIN_COMMENT, SCALE } from '../lib/peer';
import { average, round1 } from '../lib/stats';
import { hasErrors, validateEvaluation } from '../lib/validation';
import { friendlyError } from '../services/authService';
import { getWritten, saveEvaluation } from '../services/evaluationService';
import { getProfile } from '../services/userService';
import type { FieldErrors, Ratings } from '../types';

export default function EvaluatePage() {
  const { profile } = useAuth();
  const { mateId = '' } = useParams();
  const [params] = useSearchParams();
  const term = asTerm(params.get('term'));
  const navigate = useNavigate();
  const toast = useToast();

  const [ratings, setRatings] = useState<Partial<Ratings>>({});
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const mate = useAsync(() => getProfile(mateId), [mateId]);
  const existing = useAsync(() => getWritten(profile!.uid, mateId, term), [mateId, term]);

  // Pre-fill the form when editing
  useEffect(() => {
    if (existing.data) {
      setRatings(existing.data.ratings);
      setStrengths(existing.data.strengths);
      setImprovements(existing.data.improvements);
    }
  }, [existing.data]);

  if (mate.loading || existing.loading) return <Spinner />;
  const m = mate.data;
  if (mate.error || !m || m.role !== 'student' || m.teamId !== profile!.teamId || m.uid === profile!.uid) {
    return (
      <div className="grid" style={{ marginTop: '1.5rem' }}>
        <EmptyState icon="🤔">
          <h1>Teammate not found</h1>
          <p>That teammate isn’t on your team.</p>
          <Link className="btn" to="/dashboard">Back to dashboard</Link>
        </EmptyState>
      </div>
    );
  }

  const chosen = Object.values(ratings).filter((v): v is number => typeof v === 'number');
  const overall = chosen.length ? round1(average(chosen)).toFixed(1) : '–';
  const editing = Boolean(existing.data);

  const counter = (text: string) => {
    const len = text.trim().length;
    return <div className={`counter ${len >= MIN_COMMENT ? 'ok' : ''}`}>{len} / {MAX_COMMENT}{len < MIN_COMMENT ? ` (min ${MIN_COMMENT})` : ' ✓'}</div>;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = validateEvaluation(ratings, strengths, improvements);
    setErrors(v);
    if (hasErrors(v)) {
      requestAnimationFrame(() => document.querySelector('.invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }
    setConfirmOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await saveEvaluation({
        teamId: profile!.teamId!, term, evaluatorId: profile!.uid, evaluateeId: m.uid,
        ratings: ratings as Ratings, strengths, improvements,
      });
      toast.show('Saved! Thank you for your feedback 🎉', 'success');
      navigate(`/dashboard?term=${term}`);
    } catch (err) {
      setConfirmOpen(false);
      setSaveError(friendlyError(err));
      toast.show(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <p><Link to={`/dashboard?term=${term}`}>← Back to dashboard</Link></p>

      <div className="page-head row">
        <Avatar name={m.name} size="lg" />
        <div>
          <h1 style={{ margin: 0 }}>{editing ? 'Edit' : 'Evaluate'} {m.name}</h1>
          <p style={{ margin: 0 }}><Badge tone="info">{term} period</Badge> <span className="muted">{m.projectRole}</span></p>
        </div>
      </div>

      <div className="notice" style={{ marginBottom: '1.25rem' }}>
        <span className="ico" aria-hidden="true">🤝</span>
        <p><strong>Be honest, specific and kind.</strong> Talk about the work and actions, not the person. Your teammate will <em>not</em> see this — only your adviser will.</p>
      </div>

      {existing.error && <ErrorNotice message={existing.error} onRetry={existing.reload} />}

      <form className="card" onSubmit={submit} noValidate>
        <h2>1. Rate your teammate</h2>
        <p className="muted small">{SCALE.map((s) => `${s.value} = ${s.label}`).join('  ·  ')}</p>

        {CRITERIA.map((c) => (
          <RatingInput
            key={c.id}
            name={c.id}
            label={c.label}
            hint={c.hint}
            value={ratings[c.id]}
            error={errors[c.id]}
            onChange={(v) => {
              setRatings((r) => ({ ...r, [c.id]: v }));
              setErrors((er) => ({ ...er, [c.id]: '' }));
            }}
          />
        ))}

        <div className="score-box" aria-live="polite">
          <div className="num">{overall}</div>
          <div><strong>Overall average</strong><br /><span className="muted small">Updates as you rate</span></div>
        </div>

        <h2 style={{ marginTop: '1.5rem' }}>2. Add your comments</h2>
        <FormField label="What did they do well?" hint="Give an example if you can." error={errors.strengths}>
          {(p) => (
            <>
              <textarea {...p} value={strengths} maxLength={MAX_COMMENT} onChange={(e) => setStrengths(e.target.value)} placeholder="e.g. She finished the login page early and helped me fix my layout bugs." />
              {counter(strengths)}
            </>
          )}
        </FormField>
        <FormField label="What could they improve?" hint="Suggest something they can act on." error={errors.improvements}>
          {(p) => (
            <>
              <textarea {...p} value={improvements} maxLength={MAX_COMMENT} onChange={(e) => setImprovements(e.target.value)} placeholder="e.g. Please share progress updates in the group chat before our meetings." />
              {counter(improvements)}
            </>
          )}
        </FormField>

        {(hasErrors(errors) && Object.values(errors).some(Boolean)) && <div className="error-msg" role="alert">Please complete the highlighted items before submitting.</div>}
        {saveError && <div className="error-msg" role="alert">{saveError}</div>}
        <div className="sticky-actions">
          <button className="btn" type="submit">{editing ? 'Save changes' : 'Submit evaluation'}</button>
          <Link className="btn ghost" to={`/dashboard?term=${term}`}>Cancel</Link>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        busy={saving}
        title={editing ? 'Save your changes?' : 'Submit this evaluation?'}
        message={`Your overall rating for ${m.name} is ${overall}. Only your adviser can see this. You can edit it later.`}
        confirmText={editing ? 'Save changes' : 'Submit'}
        onConfirm={save}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
