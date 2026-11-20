import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, message, confirmText = 'Confirm', danger, busy, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} aria-labelledby="dlg-title" onCancel={(e) => { e.preventDefault(); onCancel(); }}>
      <div className="dialog-body">
        <h2 id="dlg-title">{title}</h2>
        <p>{message}</p>
        <div className="dialog-actions">
          <button type="button" className="btn ghost" onClick={onCancel} disabled={busy} autoFocus>Cancel</button>
          <button type="button" className={`btn ${danger ? 'danger' : ''}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Please wait…' : confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
}
