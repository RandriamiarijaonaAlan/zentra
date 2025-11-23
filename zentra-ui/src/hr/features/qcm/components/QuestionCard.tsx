import type { QuestionDto } from '../../../types';
import '../styles/QuestionCard.css';

interface QuestionCardProps {
  question: QuestionDto;
  questionNumber: number;
  totalQuestions: number;
  selectedChoiceId?: number;
  onAnswerChange: (questionId: number, choiceId: number) => void;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedChoiceId,
  onAnswerChange,
}: QuestionCardProps) {
  return (
    <div className="question-card">
      <div className="question-header">
        <div className="question-number-badge">
          Question {questionNumber} sur {totalQuestions}
        </div>
        <div className="question-meta">
          {question.required && (
            <span className="required-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Obligatoire
            </span>
          )}
          <span className="score-badge">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            {question.score} points
          </span>
        </div>
      </div>

      <div className="question-content">
        <h2 className="question-text">{question.libelle}</h2>

        <div className="choices-container">
          {question.choices.map((choice) => (
            <label
              key={choice.id}
              className={`choice-item ${
                selectedChoiceId === choice.id ? 'selected' : ''
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={choice.id}
                checked={selectedChoiceId === choice.id}
                onChange={() => onAnswerChange(question.id, choice.id)}
              />
              <span className="choice-radio"></span>
              <span className="choice-text">{choice.libelle}</span>
              <span className="choice-checkmark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

