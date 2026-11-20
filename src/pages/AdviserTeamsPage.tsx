import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ErrorNotice from '../components/ErrorNotice';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { friendlyError } from '../services/authService';
import { deleteTeamCascade, listAdviserTeams, removeMember } from '../services/teamService';
import { listTeamStudents } from '../services/userService';
import type { Team, UserProfile } from '../types';

type Pending = { kind: 'team'; team: Team } | { kind: 'member'; team: Team; member: UserProfile } | null;

export default function AdviserTeamsPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);

  const data = useAsync(async () => {
    const teams = await listAdviserTeams(profile!.uid);
    const members = await Promise.all(teams.map((t) => listTeamStudents(t.code)));
    return teams.map((team, i) => ({ team, members: members[i] }));
  }, [profile?.uid]);

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.kind === 'team') {
        await deleteTeamCascade(pending.team.code);
        toast.show('Team deleted.', 'success');
      } else {
        await removeMember(pending.team.code, pending.member.uid);
        toast.show('Member removed.', 'success');
      }
      setPending(null);
      data.reload();
    } catch (err) {
      toast.show(friendlyError(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head row between">
        <div>
          <h1>Manage Teams 👥</h1>
          <p>Create capstone teams and share each team’s code with its students.</p>
        </div>
        <Link className="btn" to="/adviser/teams/new">＋ New team</Link>
      </div>

      {data.error && <ErrorNotice message={data.error} onRetry={data.reload} />}
      {data.loading ? <Spinner /> : (
        <div className="grid cols-2">
          {data.data?.length === 0 && <EmptyState icon="🗂️">No teams yet. Click “New team” to add one.</EmptyState>}
          {data.data?.map(({ team, members }) => (
            <article className="card stack" key={team.code}>
              <div className="row between">
                <h2 style={{ margin: 0 }}>{team.name}</h2>
                <Badge tone="info">{members.length} member{members.length === 1 ? '' : 's'}</Badge>
              </div>
              <p className="muted" style={{ margin: 0 }}>📌 {team.project}</p>
              <p style={{ margin: 0 }}>Team code: <code style={{ fontSize: '1.05rem', fontWeight: 800 }}>{team.code}</code></p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.5rem' }}>
                {members.length === 0 && <li className="muted small">No students have joined yet.</li>}
                {members.map((m) => (
                  <li className="row between" style={{ flexWrap: 'nowrap' }} key={m.uid}>
                    <span className="row" style={{ flexWrap: 'nowrap' }}>
                      <Avatar name={m.name} size="sm" />
                      <span>{m.name}<br /><span className="muted small">{m.projectRole}</span></span>
                    </span>
                    <button className="btn danger secondary sm" type="button" aria-label={`Remove ${m.name} from team`} onClick={() => setPending({ kind: 'member', team, member: m })}>Remove</button>
                  </li>
                ))}
              </ul>
              <div className="row">
                <Link className="btn secondary sm" to={`/adviser/teams/${team.code}/edit`}>✏️ Edit</Link>
                <button className="btn danger secondary sm" type="button" onClick={() => setPending({ kind: 'team', team })}>🗑 Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        busy={busy}
        danger
        title={pending?.kind === 'team' ? `Delete ${pending.team.name}?` : `Remove ${pending?.member.name ?? ''}?`}
        message={
          pending?.kind === 'team'
            ? 'This removes the team and ALL of its evaluations. Students will be unassigned. This cannot be undone.'
            : 'They will be removed from the team and all evaluations they gave or received will be deleted.'
        }
        confirmText={pending?.kind === 'team' ? 'Delete team' : 'Remove'}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
