import { Link } from 'react-router-dom';
import type { Evaluation, Term, UserProfile } from '../types';
import Avatar from './Avatar';
import Badge from './Badge';

interface Props { mate: UserProfile; evaluation: Evaluation | undefined; term: Term }

export default function TeammateCard({ mate, evaluation, term }: Props) {
  return (
    <article className="card mate">
      <div className="mate-top">
        <Avatar name={mate.name} size="lg" />
        <div>
          <h3>{mate.name}</h3>
          <span className="muted small">{mate.projectRole}</span>
        </div>
      </div>
      <div>
        {evaluation ? (
          <Badge tone="done">✓ Submitted {evaluation.updatedAt?.toLocaleDateString() ?? ''}</Badge>
        ) : (
          <Badge tone="todo">⏳ Not yet evaluated</Badge>
        )}
      </div>
      <div className="actions">
        <Link className={`btn ${evaluation ? 'secondary' : ''} sm`} to={`/evaluate/${mate.uid}?term=${term}`}>
          {evaluation ? '✏️ Edit evaluation' : '📝 Evaluate'}
        </Link>
      </div>
    </article>
  );
}
