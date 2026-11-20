const COLORS = ['#4f46e5', '#0d9488', '#d97706', '#db2777', '#2563eb', '#7c3aed', '#059669', '#dc2626'];

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const colorFor = (name: string) => COLORS[[...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % COLORS.length];

interface Props { name: string; size?: 'sm' | 'lg' }

export default function Avatar({ name, size }: Props) {
  return (
    <span className={`avatar ${size ?? ''}`} style={{ background: colorFor(name) }} aria-hidden="true">
      {initials(name) || '?'}
    </span>
  );
}
