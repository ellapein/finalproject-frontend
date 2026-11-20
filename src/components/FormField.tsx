import { useId, type ReactNode } from 'react';

interface Props {
  label: string;
  hint?: string;
  error?: string;
  children: (props: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => ReactNode;
}

/** Label + control + accessible error message. */
export default function FormField({ label, hint, error, children }: Props) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className={`field ${error ? 'invalid' : ''}`}>
      <label htmlFor={id}>
        {label} {hint && <span className="hint">{hint}</span>}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? errId : undefined })}
      {error && <div className="error-msg" id={errId}>{error}</div>}
    </div>
  );
}
