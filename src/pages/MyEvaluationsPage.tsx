import { useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ErrorNotice from '../components/ErrorNotice';
import EvaluationCard from '../components/EvaluationCard';
import Spinner from '../components/Spinner';
import TermSwitch from '../components/TermSwitch';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { friendlyError } from '../services/authService';
import { deleteEvaluation, listWrittenBy } from '../services/evaluationService';
import { listTeamStudents } from '../services/userService';
import type { Evaluation } from '../types';

type Filter = 'All' | 'Midterm' | 'Final';

export default function MyEvaluationsPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('All');
  const [toDelete, setToDelete] = useState<Evaluation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const evals = useAsync(() => listWrittenBy(profile!.uid), [profile?.uid]);
  const names = useAsync(async () => {
    const list = profile!.teamId ? await listTeamStudents(profile!.teamId) : [];
    return new Map(list.map((u) => [u.uid, u.name]));
  }, [profile?.teamId]);

  const shown = (evals.data ?? []).filter((e) => filter === 'All' || e.term === filter);
  const nameOf = (id: string) => names.data?.get(id) ?? 'Former member';

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteEvaluation(toDelete.id);
      toast.show('Evaluation deleted.', 'success');
      setToDelete(null);
      evals.reload();
    } catch (err) {
      toast.show(friendlyError(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-head row between">
        <div>
          <h1>My Evaluations</h1>
          <p>These are the evaluations <strong>you</strong> wrote. Evaluations written about you are never shown here.</p>
        </div>
        <TermSwitch<Filter> value={filter} onChange={setFilter} options={['All', 'Midterm', 'Final']} label="Filter by period" />
      </div>

      {evals.error && <ErrorNotice message={evals.error} onRetry={evals.reload} />}
      {evals.loading ? (
        <Spinner />
      ) : (
        <div className="grid cols-2">
          {shown.length === 0 ? (
            <EmptyState icon="📭">
              No evaluations here yet.<br />
              <Link className="btn sm" style={{ marginTop: '1rem' }} to="/dashboard">Evaluate a teammate</Link>
            </EmptyState>
          ) : (
            shown.map((e) => (
              <EvaluationCard
                key={e.id}
                evaluation={e}
                title={nameOf(e.evaluateeId)}
                subtitle={`${e.term} · ${e.updatedAt?.toLocaleDateString() ?? ''}`}
                actions={
                  <>
                    <Link className="btn secondary sm" to={`/evaluate/${e.evaluateeId}?term=${e.term}`}>✏️ Edit</Link>
                    <button className="btn danger secondary sm" type="button" onClick={() => setToDelete(e)}>🗑 Delete</button>
                  </>
                }
              />
            ))
          )}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        busy={deleting}
        danger
        title="Delete this evaluation?"
        message={`Your evaluation of ${toDelete ? nameOf(toDelete.evaluateeId) : ''} will be permanently removed. You can write a new one later.`}
        confirmText="Delete"
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
