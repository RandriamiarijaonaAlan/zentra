import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get, patch } from '../services/api';
import type { InterviewDto } from '../types';
import '../styles/InterviewDetails.css';

export default function InterviewDetails() {
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<InterviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [evaluationData, setEvaluationData] = useState({ score: '', comment: '' });

  useEffect(() => {
    if (id) {
      loadInterview(id);
    }
  }, [id]);

  const loadInterview = async (interviewId: string) => {
    try {
      const data = await get<InterviewDto>(`/interviews/${interviewId}`);
      setInterview(data);
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger l\'entretien');
      setLoading(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (!interview) return;

    try {
      const data = await patch(`/interviews/${interview.id}/complete`, {
        score: evaluationData.score ? parseFloat(evaluationData.score) : null,
        comment: evaluationData.comment || null,
      });
      setInterview(data);
      setShowEvaluationModal(false);
      setEvaluationData({ score: '', comment: '' });
    } catch (err: any) {
      setError('Impossible de clôturer l\'entretien');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!interview) return;

    try {
      const data = await patch(`/interviews/${interview.id}/status`, { status: newStatus });
      setInterview(data);
    } catch (err: any) {
      setError('Impossible de mettre à jour le statut');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      PLANIFIE: { class: 'status-planned', label: 'Planifié' },
      REALISE: { class: 'status-completed', label: 'Réalisé' },
      ANNULE: { class: 'status-cancelled', label: 'Annulé' },
    };
    const badge = badges[status] || { class: '', label: status };
    return <span className={`status-badge ${badge.class}`}>{badge.label}</span>;
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { class: string; label: string; icon: string }> = {
      PRESENTIEL: { class: 'type-presentiel', label: 'Présentiel', icon: '🏢' },
      VISIO: { class: 'type-visio', label: 'Visioconférence', icon: '💻' },
      TELEPHONIQUE: { class: 'type-phone', label: 'Téléphonique', icon: '📞' },
    };
    const badge = badges[type] || { class: '', label: type, icon: '📋' };
    return (
      <span className={`type-badge ${badge.class}`}>
        <span className="type-icon">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de l'entretien...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="admin-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>{error || 'Entretien introuvable'}</h2>
          <Link to="/admin/interviews" className="btn-primary">
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
            <Link to="/admin/interviews">Entretiens</Link>
            <span>/</span>
            <span>{interview.candidateName}</span>
          </div>
          <h1>Entretien avec {interview.candidateName}</h1>
          <p className="page-subtitle">
            {formatDate(interview.interviewDate)} à {formatTime(interview.startTime)}
          </p>
        </div>
        <div className="header-actions">
          <Link to={`/admin/interviews/${interview.id}/edit`} className="btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Modifier
          </Link>
          {interview.status === 'PLANIFIE' && (
            <button onClick={() => setShowEvaluationModal(true)} className="btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              Clôturer l'entretien
            </button>
          )}
        </div>
      </div>

      <div className="details-grid">
        {/* Section Informations générales */}
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="info-content">
                <span className="info-label">Date</span>
                <span className="info-value">{formatDate(interview.interviewDate)}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="info-content">
                <span className="info-label">Heure de début</span>
                <span className="info-value">{formatTime(interview.startTime)}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="info-content">
                <span className="info-label">Durée</span>
                <span className="info-value">{interview.durationMinutes} minutes</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">📋</div>
              <div className="info-content">
                <span className="info-label">Type</span>
                <span className="info-value">{getTypeBadge(interview.interviewType)}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">⚡</div>
              <div className="info-content">
                <span className="info-label">Statut</span>
                <span className="info-value">{getStatusBadge(interview.status)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Participants */}
        <div className="details-section">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Participants
          </h2>
          <div className="participants-grid">
            <div className="participant-card">
              <div className="participant-avatar candidate">
                {interview.candidateName.charAt(0).toUpperCase()}
              </div>
              <div className="participant-info">
                <span className="participant-label">Candidat</span>
                <h3>{interview.candidateName}</h3>
                <a href={`mailto:${interview.candidateEmail}`} className="participant-email">
                  {interview.candidateEmail}
                </a>
              </div>
            </div>

            <div className="participant-card">
              <div className="participant-avatar interviewer">
                {interview.interviewerName.charAt(0).toUpperCase()}
              </div>
              <div className="participant-info">
                <span className="participant-label">Recruteur</span>
                <h3>{interview.interviewerName}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Section Lieu/Lien */}
        <div className="details-section full-width">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {interview.interviewType === 'PRESENTIEL' ? 'Lieu de l\'entretien' : 'Informations de connexion'}
          </h2>
          <div className="location-box">
            {interview.interviewType === 'VISIO' && interview.location.startsWith('http') ? (
              <a href={interview.location} target="_blank" rel="noopener noreferrer" className="location-link">
                {interview.location}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            ) : (
              <p className="location-text">{interview.location}</p>
            )}
          </div>
        </div>

        {/* Section Évaluation */}
        {interview.status === 'REALISE' && (
          <div className="details-section full-width">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              Évaluation
            </h2>
            <div className="evaluation-content">
              {interview.score !== null && interview.score !== undefined && (
                <div className="score-display">
                  <span className="score-label">Note</span>
                  <span className="score-value">{interview.score}/20</span>
                </div>
              )}
              {interview.comment && (
                <div className="comment-display">
                  <span className="comment-label">Commentaire</span>
                  <p className="comment-text">{interview.comment}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions rapides */}
        {interview.status === 'PLANIFIE' && (
          <div className="details-section full-width">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m-6-6H1m6 0h6"></path>
              </svg>
              Actions rapides
            </h2>
            <div className="quick-actions">
              <button onClick={() => handleUpdateStatus('ANNULE')} className="btn-action btn-cancel">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Annuler l'entretien
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'évaluation */}
      {showEvaluationModal && (
        <div className="modal-overlay" onClick={() => setShowEvaluationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Clôturer l'entretien</h2>
              <button onClick={() => setShowEvaluationModal(false)} className="modal-close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="score">Note sur 20 (optionnel)</label>
                <input
                  id="score"
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={evaluationData.score}
                  onChange={(e) => setEvaluationData({ ...evaluationData, score: e.target.value })}
                  placeholder="Ex: 15.5"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="comment">Commentaire (optionnel)</label>
                <textarea
                  id="comment"
                  value={evaluationData.comment}
                  onChange={(e) => setEvaluationData({ ...evaluationData, comment: e.target.value })}
                  placeholder="Vos observations sur le candidat..."
                  rows={6}
                  className="form-textarea"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowEvaluationModal(false)} className="btn-secondary">
                Annuler
              </button>
              <button onClick={handleCompleteInterview} className="btn-primary">
                Valider et clôturer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

