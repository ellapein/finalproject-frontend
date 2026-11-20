import type { ReactNode } from 'react';

interface Props { icon: string; children: ReactNode }

export default function EmptyState({ icon, children }: Props) {
  return (
    <div className="card empty" style={{ gridColumn: '1 / -1' }}>
      <span className="big" aria-hidden="true">{icon}</span>
      {children}
    </div>
  );
}
