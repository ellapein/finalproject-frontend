export default function SetupPage() {
  return (
    <main style={{ padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="card">
          <h1>Almost there! 🔧</h1>
          <p>PeerCheck needs your Firebase project settings before it can start.</p>
          <ol>
            <li>Copy <code>.env.example</code> to <code>.env</code>.</li>
            <li>In the Firebase Console open <strong>Project settings → Your apps → Web app</strong> and copy the values into <code>.env</code>.</li>
            <li>Stop the dev server and run <code>npm run dev</code> again.</li>
          </ol>
          <p className="muted small">On Vercel, add the same <code>VITE_FIREBASE_*</code> values under Project Settings → Environment Variables, then redeploy.</p>
        </div>
      </div>
    </main>
  );
}
