import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../../services/api.ts';
import type { PublicationDto } from '../../../types';
import UserNavbar from '../../shared/components/UserNavbar.tsx';
import '../styles/PublicationListUser.css';

export default function PublicationListUser() {
  const [publications, setPublications] = useState<PublicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    try {
      const data = await get<PublicationDto[]>('/users/publications');
      setPublications(data);
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger les offres d\'emploi');
      setLoading(false);
    }
  };

  const handleApply = (publicationId: number) => {
    navigate(`/apply/${publicationId}`);
  };


  if (loading) {
    return (
      <div className="publications-user-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des offres d'emploi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="publications-user-page">
      <UserNavbar />
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Trouvez votre prochain emploi</h1>
          <p className="hero-subtitle">Découvrez nos opportunités de carrière et rejoignez notre équipe</p>
          <div className="search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Rechercher une offre par titre ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>

      <div className="publications-container">
        {error && (
          <div className="alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        <div className="publications-header">
          <h2>Offres disponibles</h2>
          <div className="publications-count">
            <span className="count-number">{publications.length}</span>
            <span className="count-label">postes ouverts</span>
          </div>
        </div>

        {publications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3>Aucune offre disponible</h3>
            <p>Revenez bientôt pour découvrir de nouvelles opportunités</p>
          </div>
        ) : (
          <div className="publications-grid">
            {publications.map((publication) => (
              <div key={publication.id} className="publication-card">
                <div className="card-header">
                  <div className="card-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    <span>Nouveau</span>
                  </div>
                  <h3 className="card-title">{publication.title}</h3>
                </div>

                <p className="card-description">{publication.description}</p>

                <div className="card-info">
                  <div className="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>
                      Publiée le {new Date(publication.publishedDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {publication.closingDate && (
                    <div className="info-item closing-date">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>
                        Date limite: {new Date(publication.closingDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  <div className="info-item positions">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>
                      {publication.numberOfPositions} poste{publication.numberOfPositions > 1 ? 's' : ''} disponible{publication.numberOfPositions > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleApply(publication.id)}
                  className="apply-button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  Postuler maintenant
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

