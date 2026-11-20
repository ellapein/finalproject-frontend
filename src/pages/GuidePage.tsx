import { SCALE } from '../lib/peer';

export default function GuidePage() {
  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <div className="page-head">
        <h1>How PeerCheck works 💡</h1>
        <p>A quick guide to giving fair, helpful feedback to your capstone teammates.</p>
      </div>

      <section className="card" style={{ marginBottom: '1.25rem' }} aria-labelledby="steps-title">
        <h2 id="steps-title">Four easy steps</h2>
        <ol className="steps">
          <li><div><strong>Open your dashboard.</strong><br /><span className="muted">Pick the period (Midterm or Final) and see your teammates.</span></div></li>
          <li><div><strong>Rate each teammate.</strong><br /><span className="muted">Choose 1–5 for six areas: contribution, quality, communication, teamwork, reliability and initiative.</span></div></li>
          <li><div><strong>Write two short comments.</strong><br /><span className="muted">One thing they did well and one thing they can improve.</span></div></li>
          <li><div><strong>Submit — and edit later if needed.</strong><br /><span className="muted">Find everything you wrote under “My Evaluations”.</span></div></li>
        </ol>
      </section>

      <section className="card" style={{ marginBottom: '1.25rem' }} aria-labelledby="scale-title">
        <h2 id="scale-title">What do the ratings mean?</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th className="num">Score</th><th>Meaning</th></tr></thead>
            <tbody>{SCALE.map((s) => <tr key={s.value}><td className="num"><strong>{s.value}</strong></td><td>{s.label}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginBottom: '1.25rem' }} aria-labelledby="tips-title">
        <h2 id="tips-title">Tips for good feedback</h2>
        <ul>
          <li><strong>Be specific.</strong> “She fixed the login bug before our demo” beats “She’s good.”</li>
          <li><strong>Focus on work, not personality.</strong> Describe actions you saw.</li>
          <li><strong>Be fair.</strong> Rate what happened this period, not what happened months ago.</li>
          <li><strong>Be constructive.</strong> Suggest something your teammate can actually do next.</li>
        </ul>
      </section>

      <section aria-labelledby="faq-title">
        <h2 id="faq-title">Questions you might have</h2>
        <details><summary>Can my teammates see what I wrote about them?</summary><p className="muted">No. Every evaluation is private. Only your adviser can view the results.</p></details>
        <details><summary>Can I see what my teammates wrote about me?</summary><p className="muted">No — this keeps everyone honest. If you want feedback, ask your adviser or talk to your team.</p></details>
        <details><summary>Can I change or delete an evaluation?</summary><p className="muted">Yes. Go to “My Evaluations” to edit or delete anything you submitted.</p></details>
        <details><summary>Do I evaluate myself?</summary><p className="muted">No. You evaluate only your teammates.</p></details>
        <details><summary>I can’t find my team. What do I do?</summary><p className="muted">Ask your adviser for the correct team code and enter it on your dashboard.</p></details>
      </section>
    </div>
  );
}
