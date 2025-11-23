import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../../services/api.ts';
import type { QcmDto, AttemptDto, CandidateMinInfoDto } from '../../../types';
import UserNavbar from '../../shared/components/UserNavbar.tsx';
import Timer from '../../attendance/components/Timer.tsx';
import QuestionCard from '../components/QuestionCard.tsx';
import ProgressBar from '../../shared/components/ProgressBar.tsx';
import '../styles/QcmAttempt.css';

export default function QcmAttempt() {
  const [qcm, setQcm] = useState<QcmDto | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [candidate, setCandidate] = useState<CandidateMinInfoDto | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem('qcm_token');
    const candidateInfo = localStorage.getItem('candidate_info');

    if (!token) {
      navigate('/');
      return;
    }

    if (candidateInfo) {
      setCandidate(JSON.parse(candidateInfo));
    }

    // Charger le QCM
    loadQcm();
  }, [navigate]);

  const loadQcm = async () => {
    try {
      const qcmData = await get<QcmDto>('/users/qcm');
      setQcm(qcmData);
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger le QCM. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, choiceId: number) => {
    setAnswers(new Map(answers.set(questionId, choiceId)));
  };

  const handleNext = () => {
    if (qcm && currentQuestionIndex < qcm.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!qcm) return;

    // Vérifier que toutes les questions requises ont une réponse
    const unansweredRequired = qcm.questions.filter(
      (q) => q.required && !answers.has(q.id)
    );

    if (unansweredRequired.length > 0) {
      setError(`Veuillez répondre à toutes les questions obligatoires (${unansweredRequired.length} restantes)`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const attemptDto: AttemptDto = {
        answers: Array.from(answers.entries()).map(([_, choiceId]) => ({
          choiceId,
        })),
      };

      await post('/users/attempt', attemptDto);

      // Rediriger vers une page de confirmation
      localStorage.removeItem('qcm_token');
      localStorage.removeItem('candidate_info');
      navigate('/success');
    } catch (err: any) {
      setError('Erreur lors de la soumission. Veuillez réessayer.');
      setSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  if (loading) {
    return (
      <div className="qcm-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du QCM...</p>
      </div>
    );
  }

  if (error && !qcm) {
    return (
      <div className="qcm-error">
        <div className="error-icon">⚠️</div>
        <h2>{error}</h2>
        <button onClick={() => navigate('/')}>Retour</button>
      </div>
    );
  }

  if (!qcm) return null;

  const currentQuestion = qcm.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / qcm.questions.length) * 100;
  const answeredCount = answers.size;

  return (
    <div className="qcm-container">
      <UserNavbar />
      <header className="qcm-header">
        <div className="header-content">
          <div className="header-left">
            <h1>{qcm.title}</h1>
            {candidate && (
              <p className="candidate-name">
                {candidate.firstName} {candidate.lastName}
              </p>
            )}
          </div>
          <div className="header-right">
            <Timer
              durationMinutes={qcm.durationMinutes}
              onTimeUp={handleTimeUp}
            />
          </div>
        </div>
      </header>

      <div className="qcm-content">
        <div className="qcm-sidebar">
          <div className="qcm-info-card">
            <h3>Informations</h3>
            <div className="info-item">
              <span className="info-label">Score total</span>
              <span className="info-value">{qcm.totalScore} pts</span>
            </div>
            <div className="info-item">
              <span className="info-label">Score requis</span>
              <span className="info-value">{qcm.requiredScore} pts</span>
            </div>
            <div className="info-item">
              <span className="info-label">Questions</span>
              <span className="info-value">{qcm.questions.length}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Répondues</span>
              <span className="info-value">
                {answeredCount}/{qcm.questions.length}
              </span>
            </div>
          </div>

          <div className="question-navigator">
            <h3>Navigation</h3>
            <div className="question-grid">
              {qcm.questions.map((q, index) => (
                <button
                  key={q.id}
                  className={`question-nav-btn ${
                    index === currentQuestionIndex ? 'active' : ''
                  } ${answers.has(q.id) ? 'answered' : ''} ${
                    q.required ? 'required' : ''
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                  title={q.required ? 'Question obligatoire' : 'Question optionnelle'}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="qcm-main">
          <ProgressBar progress={progress} />

          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={qcm.questions.length}
            selectedChoiceId={answers.get(currentQuestion.id)}
            onAnswerChange={handleAnswerChange}
          />

          {error && <div className="error-banner">{error}</div>}

          <div className="qcm-actions">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="btn-secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Précédent
            </button>

            <div className="action-spacer"></div>

            {currentQuestionIndex === qcm.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-submit"
              >
                {submitting ? 'Soumission...' : 'Soumettre le test'}
              </button>
            ) : (
              <button onClick={handleNext} className="btn-primary">
                Suivant
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

