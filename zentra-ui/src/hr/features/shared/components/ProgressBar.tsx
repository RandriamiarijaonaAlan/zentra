import '../styles/ProgressBar.css';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        >
          <span className="progress-bar-text">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}

