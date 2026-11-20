import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ErrorNotice from '../components/ErrorNotice';
import ProgressBar from '../components/ProgressBar';
import Spinner from '../components/Spinner';
import TeammateCard from '../components/TeammateCard';
import TermSwitch from '../components/TermSwitch';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { asTerm } from '../lib/peer';
import { friendlyError } from '../services/authService';
import { listWrittenBy } from '../services/evaluationService';
import { getTeam } from '../services/teamService';
import { joinTeam, listTeamStudents } from '../services/userService';
import type { Term } from '../types';

export default function DashboardPage() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const term = asTerm(params.get('term'));
  const [code, setCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const teamId = profile?.teamId ?? null;

  const team = useAsync(() => (teamId ? getTeam(teamId) : Promise.resolve(null)), [teamId]);
  const mates = useAsync(async () => (teamId ? (await listTeamStudents(teamId)).filter((m) => m.uid !== profile!.uid) : []), [teamId]);
  const mine = useAsync(() => listWrittenBy(profile!.uid), [profile?.uid]);

  const loading = team.loading || mates.loading || mine.loading;
  const error = team.error || mates.error || mine.error;
  const reload = () => { team.reload(); mates.reload(); mine.reload(); };

  const written = new Map((mine.data ?? []).filter((e) => e.term === term).map((e) => [e.evaluateeId, e]));
  const list = mates.data ?? [];
  const done = list.filter((m) => written.has(m.uid)).length;
  const percent = list.length ? Math.round((done / list.length) * 100) : 0;

  const changeTerm = (t: Term) => setParams({ term: t });

  const join = async (e: FormEvent) => {
    e.preventDefault();
    setJoinError('');
    try {
      const found = await getTeam(code);
      if (!found) { setJoinError('We could not find a team with that code.'); return; }
      await joinTeam(profile!.uid, code);
      await refreshProfile();
      toast.show(`You joined ${found.name}!`, 'success');
    } catch (err) {
      setJoinError(friendlyError(err));
    }
  };

  return (
    <>
      <div className="page-head row between">
        <div>
          <h1>Hello, {profile!.name.split(' ')[0]}! 👋</h1>
          <p>{team.data ? `${team.data.name} · ${team.data.project}` : 'You are not on a team yet.'}</p>
        </div>
        <TermSwitch value={term} onChange={changeTerm} />
      </div>

      <div className="notice" style={{ marginBottom: '1.25rem' }}>
        <span className="ico" aria-hidden="true">🔒</span>
        <p><strong>Your evaluations are private.</strong> You can’t see what your teammates wrote about you, and they can’t see what you wrote about them. Only your adviser sees the results.</p>
      </div>

      {error && <ErrorNotice message={error} onRetry={reload} />}

      {!teamId ? (
        <section className="card" aria-labelledby="join-title">
          <h2 id="join-title">Join your team</h2>
          <p className="muted">Enter the team code from your adviser or team leader.</p>
          <form onSubmit={join} className="row" noValidate>
            <input aria-label="Team code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CAP-ALPHA" style={{ maxWidth: 260 }} />
            <button className="btn" type="submit">Join team</button>
          </form>
          {joinError && <div className="error-msg" role="alert">{joinError}</div>}
        </section>
      ) : loading ? (
        <Spinner />
      ) : (
        <>
          <section className="card" aria-labelledby="progress-title" style={{ marginBottom: '1.5rem' }}>
            <div className="row between">
              <h2 id="progress-title" style={{ margin: 0 }}>Your progress</h2>
              <Badge tone={list.length && done === list.length ? 'done' : 'todo'}>
                {list.length && done === list.length ? '🎉 All done' : `${done} of ${list.length} done`}
              </Badge>
            </div>
            <p className="muted" style={{ margin: '.4rem 0 .75rem' }}>
              {!list.length
                ? 'You have no teammates to evaluate yet.'
                : done === list.length
                  ? `You have evaluated everyone for the ${term} period. You can still edit any evaluation.`
                  : `Evaluate each teammate for the ${term} period. ${list.length - done} more to go!`}
            </p>
            <ProgressBar percent={percent} labelledBy="progress-title" />
          </section>

          <h2>Your teammates</h2>
          <div className="grid cols-3">
            {list.length === 0 ? (
              <EmptyState icon="👋">You are the only member so far. Share the team code <strong>{teamId}</strong> with your teammates.</EmptyState>
            ) : (
              list.map((m) => <TeammateCard key={m.uid} mate={m} evaluation={written.get(m.uid)} term={term} />)
            )}
          </div>
        </>
      )}
    </>
  );
}
