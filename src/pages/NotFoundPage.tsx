import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFoundPage() {
  return (
    <div className="grid" style={{ marginTop: '2rem' }}>
      <EmptyState icon="🧭">
        <h1>Page not found</h1>
        <p>The page you’re looking for doesn’t exist.</p>
        <Link className="btn" to="/">Go home</Link>
      </EmptyState>
    </div>
  );
}
