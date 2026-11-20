import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <Header />
      <main id="main">
        <div className="container"><Outlet /></div>
      </main>
      <footer className="site-footer">
        <div className="container row between">
          <span>PeerCheck · Peer Evaluation for IT Capstone Teams</span>
          <span>Sorsogon State University – CICT, Bulan Campus</span>
        </div>
      </footer>
    </>
  );
}
