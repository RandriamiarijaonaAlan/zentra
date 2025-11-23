import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get, del } from '../../../services/api.ts';
import '../../qcm/styles/QcmList.css';

interface PublicationDto {
  id: number;
  title: string;
  description: string;
  publishedDate: string;
  closingDate?: string;
  numberOfPositions: number;
  status: string;
  jobId: number;
}

// Nouveau: modèle léger côté UI pour StaffingNeed
interface StaffingNeedListItem {
  id: number;
  title: string;
  jobId: number;
}

export default function PublicationsPage() {
  const [items, setItems] = useState<PublicationDto[]>([]);
  const [needs, setNeeds] = useState<StaffingNeedListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [pubs, sn] = await Promise.all([
        get<PublicationDto[]>('/publications'),
        get<StaffingNeedListItem[]>('/staffing-needs').catch(() => []),
      ]);
      setItems(pubs);
      setNeeds(sn);
      setLoading(false);
    } catch (e) {
      setError("Impossible de charger les publications");
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await del(`/publications/${id}`);
      setItems(items.filter(i => i.id !== id));
      setDeleteConfirm(null);
    } catch (e) {
      setError("Impossible de supprimer la publication");
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des publications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Publications</h1>
          <p className="page-subtitle">Gérez les annonces basées sur des besoins (Staffing Needs)</p>
        </div>
        <Link to="/admin/publications/new" className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Créer une publication
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

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <h2>Aucune publication</h2>
          <p>Commencez par créer votre première publication</p>
          <Link to="/admin/publications/new" className="btn-primary">
            Créer une publication
          </Link>
        </div>
      ) : (
        <div className="qcm-grid">
          {items.map((p) => {
            const need = needs.find(n => n.jobId === p.jobId);
            return (
              <div key={p.id} className="qcm-card">
                <div className="qcm-card-header">
                  <h3>{p.title}</h3>
                  <div className="qcm-card-actions">
                    <button
                      onClick={() => navigate(`/apply/${p.id}`)}
                      className="btn-icon"
                      title="Postuler"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => navigate(`/admin/publications/new?id=${p.id}`)}
                      className="btn-icon"
                      title="Modifier"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(p.id)}
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

                {need && (
                  <p className="qcm-description"><strong>Besoin lié:</strong> {need.title} (ID: {need.id})</p>
                )}
                <p className="qcm-description">{p.description}</p>

                <div className="qcm-stats">
                  <div className="stat">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{new Date(p.publishedDate).toLocaleDateString()}</span>
                  </div>
                  {p.closingDate && (
                    <div className="stat">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4"></path>
                      </svg>
                      <span>Clôture: {new Date(p.closingDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="stat">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>{p.numberOfPositions} postes</span>
                  </div>
                </div>

                <div className="qcm-footer">
                  <span className="required-score">
                    Statut: {p.status}
                  </span>
                  <Link to={`/apply/${p.id}`} className="btn-primary" style={{marginLeft: 'auto'}}>
                    Postuler
                  </Link>
                </div>

                {deleteConfirm === p.id && (
                  <div className="delete-confirm-overlay">
                    <div className="delete-confirm-modal">
                      <h4>Confirmer la suppression</h4>
                      <p>Êtes-vous sûr de vouloir supprimer cette publication ?</p>
                      <div className="delete-confirm-actions">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="btn-secondary"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="btn-danger"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
