import { CRITERIA } from '../lib/peer';
import type { ResultRow } from '../lib/stats';
import Avatar from './Avatar';
import Badge, { toneForScore } from './Badge';

const Score = ({ n }: { n: number | null }) =>
  n == null ? <span className="muted">—</span> : <Badge tone={toneForScore(n)}>{n.toFixed(1)}</Badge>;

export default function ResultsTable({ rows }: { rows: ResultRow[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            {CRITERIA.map((c) => <th className="num" key={c.id}>{c.label}</th>)}
            <th className="num">Overall</th>
            <th className="num">Received</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.member.uid}>
              <td>
                <div className="row" style={{ flexWrap: 'nowrap' }}>
                  <Avatar name={r.member.name} size="sm" />
                  <div><strong>{r.member.name}</strong><br /><span className="muted small">{r.member.projectRole}</span></div>
                </div>
              </td>
              {CRITERIA.map((c) => <td className="num" key={c.id}><Score n={r.perCriterion[c.id]} /></td>)}
              <td className="num"><Score n={r.overall} /></td>
              <td className="num">{r.received.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
