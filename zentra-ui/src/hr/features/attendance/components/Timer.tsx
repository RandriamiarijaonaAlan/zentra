import { useState, useEffect } from 'react';
import '../../shared/styles/Timer.css';

interface TimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
}

export default function Timer({ durationMinutes, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / (durationMinutes * 60)) * 100;

  const isWarning = percentage <= 25;
  const isCritical = percentage <= 10;

  return (
    <div className={`timer ${isWarning ? 'warning' : ''} ${isCritical ? 'critical' : ''}`}>
      <svg className="timer-ring" viewBox="0 0 100 100">
        <circle className="timer-ring-bg" cx="50" cy="50" r="45" />
        <circle
          className="timer-ring-progress"
          cx="50"
          cy="50"
          r="45"
          style={{
            strokeDashoffset: 283 - (283 * percentage) / 100,
          }}
        />
      </svg>
      <div className="timer-content">
        <svg className="timer-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <div className="timer-text">
          <span className="timer-value">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="timer-label">Temps restant</span>
        </div>
      </div>
    </div>
  );
}

