import type { ReactNode } from 'react';
import { CRITERIA } from '../lib/peer';
import { overallOf } from '../lib/stats';
import type { Evaluation } from '../types';
import Avatar from './Avatar';
import Badge from './Badge';

interface Props {
  evaluation: Evaluation;
  title: string; // who the evaluation is about / from
  subtitle?: string;
  showAvatar?: boolean;
  actions?: ReactNode;
}

export default function EvaluationCard({ evaluation: e, title, subtitle, showAvatar = true, actions }: Props) {
  return (
    <article className="card eval-card">
      <div className="row between">
        <div className="row">
          {showAvatar && <Avatar name={title} size="sm" />}
          <div>
            <h3 style={{ margin: 0 }}>{title}</h3>
            {subtitle && <span className="muted small">{subtitle}</span>}
          </div>
        </div>
        <Badge tone="info" title="Overall average">⭐ {overallOf(e.ratings).toFixed(1)}</Badge>
      </div>
      <div className="chips">
        {CRITERIA.map((c) => (
          <span className="chip" key={c.id}>{c.label} <b>{e.ratings[c.id]}</b></span>
        ))}
      </div>
      <blockquote><strong>Did well</strong>{e.strengths}</blockquote>
      <blockquote><strong>Could improve</strong>{e.improvements}</blockquote>
      {actions && <div className="row">{actions}</div>}
    </article>
  );
}
