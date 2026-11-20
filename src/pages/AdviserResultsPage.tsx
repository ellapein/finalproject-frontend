import { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ErrorNotice from '../components/ErrorNotice';
import EvaluationCard from '../components/EvaluationCard';
import ProgressBar from '../components/ProgressBar';
import ResultsTable from '../components/ResultsTable';
import Spinner from '../components/Spinner';
import TermSwitch from '../components/TermSwitch';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { overallOf, completion, summarizeResults, toCsv } from '../lib/stats';
import { listForTeam } from '../services/evaluationService';
import { listAdviserTeams } from '../services/teamService';
import { listTeamStudents } from '../services/userService';
import type { Term } from '../types';

export default function AdviserResultsPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [term, setTerm] = useState<Term>('Midterm');
  const [teamCode, setTeamCode] = useState('');

  const teams = useAsync(() => listAdviserTeams(profile!.uid), [profile?.uid]);
  const activeCode = teams.data?.find((t) => t.code === teamCode)?.code ?? teams.data?.[0]?.code ?? '';

  const results = useAsync(async () => {
    if (!activeCode) return null;
    const [members, evaluations] = await Promise.all([listTeamStudents(activeCode), listForTeam(activeCode, term)]);
    return { members, evaluations, rows: summarizeResults(members, evaluations) };
  }, [activeCode, term]);

  const exportCsv = () => {
    if (!results.data) return;
    const nameOf = (uid: string) => results.data!.members.find((m) => m.uid === uid)?.name ?? 'Former member';
    const csv = toCsv(term, results.data.rows, nameOf);
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCode}_${term}_peer_evaluations.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.show('CSV downloaded.', 'success');
  };

  if (teams.loading) return <Spinner />;
  const rows = results.data?.rows ?? [];
  const comp = completion(rows);

  return (
    <>
      <div className="page-head">
        <h1>Evaluation Results 📊</h1>
        <p>Review peer evaluations per team and period. Only advisers can see these results.</p>
      </div>

      {teams.error && <ErrorNotice message={teams.error} onRetry={teams.reload} />}

      {!teams.data?.length ? (
        <div className="grid"><EmptyState icon="🗂️">You have no teams yet. <Link to="/adviser/teams/new">Create your first team</Link>.</EmptyState></div>
      ) : (
        <>
          <div className="card flat row" style={{ marginBottom: '1.25rem' }}>
            <div className="field" style={{ margin: 0, flex: 1, minWidth: 220 }}>
              <label htmlFor="team-select">Team</label>
              <select id="team-select" value={activeCode} onChange={(e) => setTeamCode(e.target.value)}>
                {teams.data.map((t) => <option key={t.code} value={t.code}>{t.name} — {t.project}</option>)}
              </select>
            </div>
            <div>
              <span className="label">Period</span>
              <TermSwitch value={term} onChange={setTerm} />
            </div>
            <button className="btn secondary" type="button" style={{ alignSelf: 'flex-end' }} onClick={exportCsv} disabled={!rows.length}>⬇ Export CSV</button>
          </div>

          {results.error && <ErrorNotice message={results.error} onRetry={results.reload} />}
          {results.loading ? <Spinner /> : rows.length === 0 ? (
            <div className="grid"><EmptyState icon="👥">This team has no student members yet. Share its team code <strong>{activeCode}</strong> so students can join.</EmptyState></div>
          ) : (
            <>
              <section className="card" style={{ marginBottom: '1.25rem' }} aria-labelledby="comp-title">
                <div className="row between">
                  <h2 id="comp-title" style={{ margin: 0 }}>Completion</h2>
                  <Badge tone={comp.percent === 100 ? 'done' : 'todo'}>{comp.given} of {comp.expected} evaluations submitted</Badge>
                </div>
                <div style={{ margin: '.75rem 0' }}><ProgressBar percent={comp.percent} labelledBy="comp-title" /></div>
                <div className="chips">
                  {rows.map((r) => (
                    <span className="chip" key={r.member.uid}>{r.member.name.split(' ')[0]}: <b>{r.given}/{r.expected}</b> {r.given >= r.expected ? '✅' : '⏳'}</span>
                  ))}
                </div>
              </section>

              <section aria-labelledby="res-title">
                <h2 id="res-title">Average ratings received (1–5)</h2>
                <ResultsTable rows={rows} />
              </section>

              <section style={{ marginTop: '1.5rem' }} aria-labelledby="det-title">
                <h2 id="det-title">Details per student</h2>
                {rows.map((r) => (
                  <details key={r.member.uid}>
                    <summary>{r.member.name} — {r.received.length} evaluation(s) received{r.overall !== null && ` · ⭐ ${r.overall.toFixed(1)}`}</summary>
                    {r.received.length === 0 ? <p className="muted">No evaluations received yet.</p> : (
                      <div className="stack" style={{ marginTop: '.75rem' }}>
                        {r.received.map((e) => (
                          <EvaluationCard
                            key={e.id}
                            evaluation={e}
                            title={`From ${results.data!.members.find((m) => m.uid === e.evaluatorId)?.name ?? 'Former member'}`}
                            subtitle={`Overall ${overallOf(e.ratings).toFixed(1)}`}
                            showAvatar={false}
                          />
                        ))}
                      </div>
                    )}
                  </details>
                ))}
              </section>
            </>
          )}
        </>
      )}
    </>
  );
}
