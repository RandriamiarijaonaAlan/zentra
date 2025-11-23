import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get } from '../../../services/api.ts';
import type { QcmDto } from '../../../types';
import '../styles/QcmDetails.css';

export default function QcmDetails() {
  const { id } = useParams<{ id: string }>();
  const [qcm, setQcm] = useState<QcmDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadQcm(id);
    }
  }, [id]);

  const loadQcm = async (qcmId: string) => {
    try {
      const data = await get<QcmDto>(`/qcms/${qcmId}`);
      setQcm(data);
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger le QCM');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du QCM...</p>
        </div>
      </div>
    );
  }

  if (error || !qcm) {
    return (
      <div className="admin-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>{error || 'QCM introuvable'}</h2>
          <Link to="/admin/qcms" className="btn-primary">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/admin/qcms">QCM</Link>
            <span>/</span>
            <span>{qcm.title}</span>
          </div>
          <h1>{qcm.title}</h1>
          <p className="page-subtitle">{qcm.description}</p>
        </div>
        <div className="header-actions">
          <Link to={`/admin/qcms/${qcm.id}/edit`} className="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Modifier
          </Link>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-section">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Informations générales
          </h2>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="info-content">
                <span className="info-label">Durée</span>
                <span className="info-value">{qcm.durationMinutes} minutes</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div className="info-content">
                <span className="info-label">Score total</span>
                <span className="info-value">{qcm.totalScore} points</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="info-content">
                <span className="info-label">Score requis</span>
                <span className="info-value">{qcm.requiredScore} points</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
              <div className="info-content">
                <span className="info-label">Questions</span>
                <span className="info-value">{qcm.questions.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Questions ({qcm.questions.length})
          </h2>

          <div className="questions-list">
            {qcm.questions.map((question, index) => (
              <div key={question.id} className="question-detail-card">
                <div className="question-detail-header">
                  <div className="question-number">
                    <span>Question {index + 1}</span>
                    {question.required && (
                      <span className="badge badge-required">Obligatoire</span>
                    )}
                    <span className="badge badge-score">{question.score} pts</span>
                  </div>
                </div>

                <div className="question-detail-body">
                  <h3>{question.libelle}</h3>

                  <div className="choices-detail-list">
                    {question.choices.map((choice) => (
                      <div
                        key={choice.id}
                        className={`choice-detail-item ${
                          choice.correct ? 'correct' : ''
                        }`}
                      >
                        <div className="choice-indicator">
                          {choice.correct ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                            </svg>
                          )}
                        </div>
                        <span className="choice-text">{choice.libelle}</span>
                        {choice.correct && (
                          <span className="correct-badge">Correcte</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

