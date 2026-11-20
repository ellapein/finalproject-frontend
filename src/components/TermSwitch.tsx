import type { Term } from '../types';
import { TERMS } from '../lib/peer';

interface Props<T extends string> { value: T; onChange: (v: T) => void; options?: readonly T[]; label?: string }

export default function TermSwitch<T extends string = Term>({ value, onChange, options, label = 'Evaluation period' }: Props<T>) {
  const list = (options ?? (TERMS as unknown as readonly T[]));
  return (
    <div className="segmented" role="group" aria-label={label}>
      {list.map((t) => (
        <button key={t} type="button" aria-pressed={t === value} onClick={() => onChange(t)}>{t}</button>
      ))}
    </div>
  );
}
