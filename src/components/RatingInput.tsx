import { SCALE } from '../lib/peer';

interface Props {
  name: string;
  label: string;
  hint: string;
  value: number | undefined;
  error?: string;
  onChange: (value: number) => void;
}

/** A 1–5 radio scale (keyboard + screen-reader friendly). */
export default function RatingInput({ name, label, hint, value, error, onChange }: Props) {
  return (
    <div className={`criterion ${error ? 'invalid' : ''}`}>
      <fieldset>
        <legend>{label}</legend>
        <span className="hint muted small">{hint}</span>
        <div className="rating">
          {SCALE.map((s) => (
            <span key={s.value} style={{ display: 'contents' }}>
              <input type="radio" name={name} id={`${name}-${s.value}`} checked={value === s.value} onChange={() => onChange(s.value)} />
              <label htmlFor={`${name}-${s.value}`} title={s.label}>
                <span className="sr-only">{s.label} – </span>
                {s.value}
              </label>
            </span>
          ))}
        </div>
        <div className="scale-legend" aria-hidden="true"><span>Needs improvement</span><span>Outstanding</span></div>
        {error && <div className="error-msg" role="alert">{error}</div>}
      </fieldset>
    </div>
  );
}
