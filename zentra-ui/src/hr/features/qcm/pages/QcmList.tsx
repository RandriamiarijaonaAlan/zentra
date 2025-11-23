import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get, del } from '../../../services/api.ts';
import type { QcmListItemDto } from '../../../types';
import '../styles/QcmList.css';

export default function QcmList() {
  const [qcms, setQcms] = useState<QcmListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadQcms();
  }, []);

  const loadQcms = async () => {
    try {
      const data = await get<QcmListItemDto[]>('/qcms');
      setQcms(data);
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger les QCM');
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await del(`/qcms/${id}`);
      setQcms(qcms.filter((q) => q.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError('Impossible de supprimer le QCM');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des QCM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Liste des QCM</h1>
          <p className="page-subtitle">Gérez tous vos questionnaires à choix multiples</p>
        </div>
        <Link to="/admin/qcms/new/edit" className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nouveau QCM
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      {qcms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <h2>Aucun QCM disponible</h2>
          <p>Commencez par créer votre premier QCM</p>
          <Link to="/admin/qcms/new/edit" className="btn-primary">
            Créer un QCM
          </Link>
        </div>
      ) : (
        <div className="qcm-grid">
          {qcms.map((qcm) => (
            <div key={qcm.id} className="qcm-card">
              <div className="qcm-card-header">
                <h3>{qcm.title}</h3>
                <div className="qcm-card-actions">
                  <button
                    onClick={() => navigate(`/admin/qcms/${qcm.id}`)}
                    className="btn-icon"
                    title="Voir les détails"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button
                    onClick={() => navigate(`/admin/qcms/${qcm.id}/edit`)}
                    className="btn-icon"
                    title="Modifier"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(qcm.id)}
                    className="btn-icon btn-danger"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <p className="qcm-description">{qcm.description}</p>

              <div className="qcm-stats">
                <div className="stat">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>{qcm.durationMinutes} min</span>
                </div>
                <div className="stat">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  <span>{qcm.questionsCount} questions</span>
                </div>
                <div className="stat">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>{qcm.totalScore} pts</span>
                </div>
              </div>

              <div className="qcm-footer">
                <span className="required-score">
                  Requis: {qcm.requiredScore} pts
                </span>
              </div>

              {deleteConfirm === qcm.id && (
                <div className="delete-confirm-overlay">
                  <div className="delete-confirm-modal">
                    <h4>Confirmer la suppression</h4>
                    <p>Êtes-vous sûr de vouloir supprimer ce QCM ?</p>
                    <div className="delete-confirm-actions">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="btn-secondary"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleDelete(qcm.id)}
                        className="btn-danger"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

