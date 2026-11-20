import { useState, type FormEvent } from 'react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import ErrorNotice from '../components/ErrorNotice';
import FormField from '../components/FormField';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { PROJECT_ROLES } from '../lib/peer';
import { hasErrors, validateProfile } from '../lib/validation';
import { friendlyError } from '../services/authService';
import { getTeam } from '../services/teamService';
import { getProfile, listTeamStudents, updateProfile } from '../services/userService';
import type { FieldErrors } from '../types';

export default function TeamPage() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(profile!.name);
  const [role, setRole] = useState(profile!.projectRole);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const teamId = profile!.teamId;
  const data = useAsync(async () => {
    if (!teamId) return null;
    const [team, members] = await Promise.all([getTeam(teamId), listTeamStudents(teamId)]);
    const adviser = team ? await getProfile(team.adviserId).catch(() => null) : null;
    return { team, members, adviserName: adviser?.name ?? '—' };
  }, [teamId, profile?.name, profile?.projectRole]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const v = validateProfile(name);
    setErrors(v);
    if (hasErrors(v)) return;
    setSaving(true);
    try {
      await updateProfile(profile!.uid, { name, projectRole: role });
      await refreshProfile();
      toast.show('Profile updated.', 'success');
    } catch (err) {
      toast.show(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>My Team</h1>
        <p>See who’s on your capstone team and keep your own profile up to date.</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', alignItems: 'start' }}>
        <section className="card" aria-labelledby="team-title">
          <h2 id="team-title">Team details</h2>
          {data.error && <ErrorNotice message={data.error} onRetry={data.reload} />}
          {data.loading ? <Spinner /> : !data.data?.team ? (
            <p className="muted">You are not on a team yet. Join one from the dashboard.</p>
          ) : (
            <>
              <p style={{ marginBottom: '.25rem' }}><strong>{data.data.team.name}</strong></p>
              <p className="muted" style={{ marginBottom: '.5rem' }}>📌 {data.data.team.project}</p>
              <p className="small muted" style={{ margin: 0 }}>Adviser: {data.data.adviserName}</p>
              <p className="small muted" style={{ margin: 0 }}>Team code: <code>{data.data.team.code}</code></p>
              <h3 style={{ marginTop: '1.25rem' }}>Members</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.75rem' }}>
                {data.data.members.map((m) => (
                  <li className="row" key={m.uid}>
                    <Avatar name={m.name} />
                    <div>
                      <strong>{m.name} {m.uid === profile!.uid && <Badge tone="info">You</Badge>}</strong><br />
                      <span className="muted small">{m.projectRole}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="card" aria-labelledby="profile-title">
          <h2 id="profile-title">My profile</h2>
          <form onSubmit={save} noValidate>
            <FormField label="Full name" error={errors.name}>
              {(p) => <input {...p} type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
            </FormField>
            <FormField label="My role in the project">
              {(p) => (
                <select {...p} value={role} onChange={(e) => setRole(e.target.value)}>
                  {PROJECT_ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              )}
            </FormField>
            <FormField label="Student ID">
              {(p) => <input {...p} type="text" value={profile!.studentId ?? ''} disabled />}
            </FormField>
            <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
          </form>
        </section>
      </div>
    </>
  );
}
