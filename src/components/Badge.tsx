import type { ReactNode } from 'react';

interface Props { tone?: 'done' | 'todo' | 'info' | 'neutral'; title?: string; children: ReactNode }

export default function Badge({ tone = 'neutral', title, children }: Props) {
  return <span className={`badge ${tone === 'neutral' ? '' : tone}`} title={title}>{children}</span>;
}

/** Color a 1–5 score. */
export const toneForScore = (n: number | null): 'done' | 'info' | 'todo' | 'neutral' =>
  n == null ? 'neutral' : n >= 4 ? 'done' : n >= 3 ? 'info' : 'todo';
