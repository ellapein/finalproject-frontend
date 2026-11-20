import type { ReactNode } from 'react';

/**
 * Two-panel screen used by Login and Register:
 * maroon panel (logo + welcome text) on the left, white card on the right.
 * Put your school logo at  public/sorsu-logo.png  (any square PNG).
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <a className="skip-link" href="#main">Skip to main content</a>
      <section className="auth-brand" aria-label="About PeerCheck">
        <img
          className="auth-logo"
          src="/sorsu.png"
          alt="Sorsogon State University seal"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <h1>Welcome to Peer to Apir Evaluation</h1>
        <p className="auth-sub">Capstone Peer Evaluation · SorSU Bulan-Campus</p>
        <p className="auth-note">Rate your teammates honestly. Your answers stay private, teammates can never read what you wrote about them.</p>
      </section>
      <main id="main" className="auth-panel">
        <div className="auth-card">
          {children}
          <footer className="auth-foot">
            <span>© 2026 Peer to Apir Evaluation</span>
            <span>SorSU Bulan-Campus</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
