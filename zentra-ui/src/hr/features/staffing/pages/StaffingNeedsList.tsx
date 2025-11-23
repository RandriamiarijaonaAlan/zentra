import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listStaffingNeeds, deleteStaffingNeed } from '../../../services/hrApi.ts';
import type { StaffingNeed } from '../../../types/StaffingNeed.ts';
import '../../documents/styles/HRPages.css';
import '../styles/StaffingNeeds.css';

const StaffingNeedsList: React.FC = () => {
  const [needs, setNeeds] = useState<StaffingNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listStaffingNeeds();
      setNeeds(data);
    } catch (error) {
      console.error('Erreur lors du chargement des besoins:', error);
      setError('Impossible de charger la liste des besoins. Vérifiez votre connexion au backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id?: number) => {
    if (!id || !confirm('Êtes-vous sûr de vouloir supprimer ce besoin ?')) return;

    try {
      await deleteStaffingNeed(id);
      await load();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression. Vérifiez votre connexion au backend.');
    }
  };

  const filteredNeeds = needs.filter(need => {
    const matchesSearch = !filter ||
      need.title.toLowerCase().includes(filter.toLowerCase()) ||
      need.description?.toLowerCase().includes(filter.toLowerCase()) ||
      need.departmentName?.toLowerCase().includes(filter.toLowerCase()) ||
      need.jobTitle?.toLowerCase().includes(filter.toLowerCase());

    const matchesStatus = !statusFilter || need.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High': return '#e74c3c';
      case 'Medium': return '#f39c12';
      case 'Low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return '#27ae60';
      case 'In Progress': return '#f39c12';
      case 'Fulfilled': return '#2196f3';
      case 'Cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="hr-page">
        <div className="hr-container">
          <div className="hr-loading">
            <div className="hr-loading-spinner"></div>
            Chargement des besoins en personnel...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hr-page">
        <div className="hr-container">
          <div className="hr-header">
            <h1 className="hr-title">
              🎯 Besoins en personnel
            </h1>
          </div>
          <div className="hr-empty">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <h3>Erreur de connexion</h3>
            <p>{error}</p>
            <button onClick={load} className="quick-action-btn">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hr-page">
      <div className="hr-container">
        <div className="hr-header">
          <h1 className="hr-title">
            🎯 Besoins en personnel
          </h1>
          <p className="hr-subtitle">
            {needs.length} besoin(s) enregistré(s)
          </p>
        </div>

        <div className="hr-quick-actions">
          <Link to="/admin/hr/staffing-needs/new" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nouveau besoin
          </Link>
          <button onClick={load} className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            Actualiser
          </button>
          <input
            className="form-input"
            style={{ maxWidth: '300px' }}
            placeholder="Rechercher..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: '200px' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="Open">Ouvert</option>
            <option value="In Progress">En cours</option>
            <option value="Fulfilled">Satisfait</option>
            <option value="Cancelled">Annulé</option>
          </select>
        </div>

        {filteredNeeds.length === 0 ? (
          <div className="hr-empty">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <h3>{filter || statusFilter ? 'Aucun résultat' : 'Aucun besoin'}</h3>
            <p>
              {filter || statusFilter
                ? 'Aucun besoin trouvé avec ces critères'
                : 'Commencez par créer votre premier besoin en personnel'
              }
            </p>
            {!filter && !statusFilter && (
              <Link to="/admin/hr/staffing-needs/new" className="quick-action-btn">
                Créer le premier besoin
              </Link>
            )}
          </div>
        ) : (
          <div className="staffing-needs-grid">
            {filteredNeeds.map(need => (
              <div key={need.id} className="staffing-need-card">
                <div className="staffing-need-card-header">
                  <h3 className="staffing-need-card-title">{need.title}</h3>
                  <span
                    className={`staffing-need-priority ${need.priority?.toLowerCase()}`}
                    style={{ backgroundColor: `${getPriorityColor(need.priority)}20`, color: getPriorityColor(need.priority) }}
                  >
                    {need.priority === 'High' ? '🔥 Élevée' :
                     need.priority === 'Medium' ? '⚡ Moyenne' :
                     '🔄 Faible'}
                  </span>
                </div>

                <div className="staffing-need-info">
                  <div className="staffing-need-meta">
                    🏢 {need.departmentName || 'Département non spécifié'}
                    <br />
                    💼 {need.jobTitle || 'Poste non spécifié'}
                    <br />
                    👥 {need.numberOfPositions} poste{need.numberOfPositions > 1 ? 's' : ''}
                    {need.budgetAllocated && (
                      <>
                        <br />
                        💰 {need.budgetAllocated.toLocaleString()} Ar
                      </>
                    )}
                  </div>

                  {need.description && (
                    <p className="staffing-need-description">
                      {need.description}
                    </p>
                  )}
                </div>

                <div className="staffing-need-footer">
                  <span
                    className={`staffing-need-status ${need.status.toLowerCase().replace(' ', '-')}`}
                    style={{ backgroundColor: `${getStatusColor(need.status)}20`, color: getStatusColor(need.status) }}
                  >
                    {need.status === 'Open' ? '🆕 Ouvert' :
                     need.status === 'In Progress' ? '🔄 En cours' :
                     need.status === 'Fulfilled' ? '✅ Satisfait' :
                     '❌ Annulé'}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="quick-action-btn"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                      onClick={() => navigate(`/admin/hr/staffing-needs/${need.id}`)}
                    >
                      👁️
                    </button>
                    <button
                      className="quick-action-btn"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                      onClick={() => navigate(`/admin/hr/staffing-needs/${need.id}/edit`)}
                    >
                      ✏️
                    </button>
                    <button
                      className="quick-action-btn"
                      style={{
                        fontSize: '12px',
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, #e74c3c, #c0392b)'
                      }}
                      onClick={() => handleDelete(need.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {need.createdAt && (
                  <div className="staffing-need-date">
                    Créé le {new Date(need.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffingNeedsList;
