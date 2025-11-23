import React, { useEffect, useState } from 'react';
import type { JobHistoryDto } from '../../../types/jobHistory.ts';
import { listJobHistoryByEmployee, createJobHistory, updateJobHistory, deleteJobHistory } from '../../../services/hrApi.ts';
import '../../documents/styles/HRPages.css';

interface Props { employeeId: number; }

export const JobHistoryManager: React.FC<Props> = ({ employeeId }) => {
  const [items, setItems] = useState<JobHistoryDto[]>([]);
  const [current, setCurrent] = useState<JobHistoryDto | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await listJobHistoryByEmployee(employeeId);
      setItems(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      setError('Impossible de charger l\'historique. Vérifiez votre connexion au backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [employeeId]);

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) : value;
    setCurrent(c => ({ ...(c || { employeeId }), [name]: newValue }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    try {
      await (current.id ? updateJobHistory(current) : createJobHistory(current));
      setCurrent(undefined);
      setShowForm(false);
      await load();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'historique. Vérifiez votre connexion au backend.');
    }
  };

  const remove = async (id?: number) => {
    if (!id || !confirm('Êtes-vous sûr de vouloir supprimer cette entrée d\'historique ?')) return;
    try {
      await deleteJobHistory(id);
      await load();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'entrée. Vérifiez votre connexion au backend.');
    }
  };

  const edit = (item: JobHistoryDto) => {
    setCurrent(item);
    setShowForm(true);
  };

  const startNew = () => {
    setCurrent({ employeeId });
    setShowForm(true);
  };

  const cancel = () => {
    setCurrent(undefined);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="hr-container">
        <div className="hr-loading">
          <div className="hr-loading-spinner"></div>
          Chargement de l'historique...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hr-container">
        <div className="hr-empty">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <h3>Erreur de chargement</h3>
          <p>{error}</p>
          <button onClick={load} className="quick-action-btn">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hr-container">
      <div className="hr-header">
        <h2 className="hr-title">
          📈 Historique des postes
        </h2>
        <div className="hr-quick-actions">
          <button onClick={startNew} className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nouvelle entrée
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="hr-container" style={{ marginBottom: '24px', border: '2px solid #9b59b6' }}>
          <div className="hr-header">
            <h3 className="hr-title">
              {current?.id ? '✏️ Modifier l\'entrée' : '➕ Nouvelle entrée'}
            </h3>
          </div>

          <div className="form-section">
            <div className="section-title">
              📅 Période
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date de début</label>
                <input
                  name="startDate"
                  type="date"
                  className="form-input"
                  value={current?.startDate || ''}
                  onChange={change}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date de fin</label>
                <input
                  name="endDate"
                  type="date"
                  className="form-input"
                  value={current?.endDate || ''}
                  onChange={change}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">
              💼 Détails du poste
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ID Poste</label>
                <input
                  name="jobId"
                  type="number"
                  className="form-input"
                  value={current?.jobId || ''}
                  onChange={change}
                  placeholder="ID du poste"
                />
              </div>
              <div className="form-group">
                <label className="form-label">ID Département</label>
                <input
                  name="departmentId"
                  type="number"
                  className="form-input"
                  value={current?.departmentId || ''}
                  onChange={change}
                  placeholder="ID du département"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Raison du changement</label>
              <textarea
                name="reason"
                className="form-input"
                style={{ minHeight: '80px', resize: 'vertical' }}
                value={current?.reason || ''}
                onChange={change}
                placeholder="Raison du changement de poste..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={cancel} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {current?.id ? 'Sauvegarder' : 'Créer'}
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="hr-empty">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <h3>Aucun historique</h3>
          <p>Aucune entrée d'historique de poste n'a encore été enregistrée</p>
          <button onClick={startNew} className="quick-action-btn">
            Créer la première entrée
          </button>
        </div>
      ) : (
        <div className="hr-cards-grid">
          {items.map(item => (
            <div key={item.id} className="hr-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px', color: '#2c3e50', fontSize: '18px' }}>
                    Poste #{item.jobId || 'N/A'}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                    {item.startDate && (
                      <>Du {new Date(item.startDate).toLocaleDateString()}</>
                    )}
                    {item.endDate && (
                      <> au {new Date(item.endDate).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
                <span className={`status-badge ${!item.endDate || new Date(item.endDate) > new Date() ? 'active' : 'inactive'}`}>
                  {!item.endDate || new Date(item.endDate) > new Date() ? '🔄 En cours' : '✅ Terminé'}
                </span>
              </div>

              <div className="hr-card-stats">
                {item.departmentId && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">ID Département</span>
                    <span className="hr-stat-value">#{item.departmentId}</span>
                  </div>
                )}
                {item.reason && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Raison</span>
                    <span className="hr-stat-value">{item.reason}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                <button
                  onClick={() => edit(item)}
                  className="quick-action-btn"
                  style={{ flex: 1, fontSize: '14px' }}
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => remove(item.id)}
                  className="quick-action-btn"
                  style={{
                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

