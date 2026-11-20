import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

interface NavItem { to: string; label: string; end?: boolean }

const STUDENT_LINKS: NavItem[] = [
  { to: '/dashboard', label: '🏠 Dashboard' },
  { to: '/my-evaluations', label: '📝 My Evaluations' },
  { to: '/team', label: '👥 My Team' },
  { to: '/guide', label: '💡 Guide' },
];
const ADVISER_LINKS: NavItem[] = [
  { to: '/adviser', label: '📊 Results', end: true },
  { to: '/adviser/teams', label: '👥 Manage Teams' },
  { to: '/guide', label: '💡 Guide' },
];

export default function Header() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = profile?.role === 'adviser' ? ADVISER_LINKS : STUDENT_LINKS;

  const signOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to={profile ? (profile.role === 'adviser' ? '/adviser' : '/dashboard') : '/login'}>
          <span className="brand-logo" aria-hidden="true">✓</span>
          <span>PeerCheck</span>
        </Link>
        {profile && (
          <>
            <button className="nav-toggle" type="button" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen((o) => !o)}>
              ☰ Menu
            </button>
            <nav className={`nav ${open ? 'open' : ''}`} id="main-nav" aria-label="Main navigation">
              <ul>
                {links.map((l) => (
                  <li key={l.to}>
                    <NavLink to={l.to} end={l.end ?? false} onClick={() => setOpen(false)}>{l.label}</NavLink>
                  </li>
                ))}
              </ul>
              <div className="user-chip">
                <Avatar name={profile.name} size="sm" />
                <div className="who">
                  <strong>{profile.name.split(' ')[0]}</strong>
                  <small>{profile.role === 'adviser' ? 'Adviser' : 'Student'}</small>
                </div>
                <button className="btn ghost sm" type="button" onClick={signOut}>Sign out</button>
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
