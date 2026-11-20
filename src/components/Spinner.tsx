export default function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="empty" role="status" aria-live="polite">
      <span className="big" aria-hidden="true">⏳</span>
      {label}
    </div>
  );
}
