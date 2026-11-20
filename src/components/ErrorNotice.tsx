interface Props { message: string; onRetry?: () => void }

export default function ErrorNotice({ message, onRetry }: Props) {
  return (
    <div className="notice warn" role="alert" style={{ marginBottom: '1rem' }}>
      <span className="ico" aria-hidden="true">⚠️</span>
      <p>
        {message}{' '}
        {onRetry && <button type="button" className="btn sm secondary" onClick={onRetry}>Try again</button>}
      </p>
    </div>
  );
}
