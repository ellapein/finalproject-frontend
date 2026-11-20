interface Props { percent: number; labelledBy: string }

export default function ProgressBar({ percent, labelledBy }: Props) {
  return (
    <div className="progress" role="progressbar" aria-labelledby={labelledBy} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}
