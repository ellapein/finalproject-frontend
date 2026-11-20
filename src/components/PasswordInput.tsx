import { useState, type InputHTMLAttributes } from 'react';

/** Password field with a "show / hide" eye button. Accepts the same props as <input>. */
export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="pw-wrap">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="pw-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? '🙈' : '👁'}
      </button>
    </div>
  );
}
