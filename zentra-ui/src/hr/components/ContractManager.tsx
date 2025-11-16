import React, { useEffect, useState } from 'react';
import type { ContractDto } from '../types/contract';
import { listContractsByEmployee, createContract, updateContract, deleteContract } from '../services/hrApi';
import '../../styles/HRPages.css';

interface Props { employeeId: number; }

export const ContractManager: React.FC<Props> = ({ employeeId }) => {
  const [contracts, setContracts] = useState<ContractDto[]>([]);
  const [current, setCurrent] = useState<ContractDto | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await listContractsByEmployee(employeeId);
      setContracts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des contrats:', error);
      setError('Impossible de charger les contrats. Vérifiez votre connexion au backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [employeeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) :
                     type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                     value;
    setCurrent(c => ({ ...(c || { employeeId }), [name]: newValue }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    try {
      await (current.id ? updateContract(current) : createContract(current));
      setCurrent(undefined);
      setShowForm(false);
      await load();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du contrat. Vérifiez votre connexion au backend.');
    }
  };

  const remove = async (id?: number) => {
    if (!id || !confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) return;
    try {
      await deleteContract(id);
      await load();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du contrat. Vérifiez votre connexion au backend.');
    }
  };

  const edit = (contract: ContractDto) => {
    setCurrent(contract);
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
          Chargement des contrats...
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
          📋 Gestion des contrats
        </h2>
        <div className="hr-quick-actions">
          <button onClick={startNew} className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nouveau contrat
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="hr-container" style={{ marginBottom: '24px', border: '2px solid #3498db' }}>
          <div className="hr-header">
            <h3 className="hr-title">
              {current?.id ? '✏️ Modifier le contrat' : '➕ Nouveau contrat'}
            </h3>
          </div>

          <div className="form-section">
            <div className="section-title">
              📄 Informations du contrat
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Numéro de contrat</label>
                <input
                  name="contractNumber"
                  className="form-input"
                  value={current?.contractNumber || ''}
                  onChange={handleChange}
                  placeholder="C-2024-001"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type de contrat</label>
                <select
                  name="contractType"
                  className="form-input"
                  value={current?.contractType || ''}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date de début</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-input"
                  value={current?.startDate || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date de fin</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-input"
                  value={current?.endDate || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">
              💰 Rémunération
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Salaire brut mensuel (€)</label>
                <input
                  type="number"
                  name="grossSalary"
                  className="form-input"
                  value={current?.grossSalary || ''}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  placeholder="3500"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Prime annuelle (€)</label>
                <input
                  type="number"
                  name="annualBonus"
                  className="form-input"
                  value={current?.annualBonus || ''}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  placeholder="5000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Heures hebdomadaires</label>
                <input
                  type="number"
                  name="weeklyHours"
                  className="form-input"
                  value={current?.weeklyHours || ''}
                  onChange={handleChange}
                  min="1"
                  max="60"
                  placeholder="35"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Jours de congés annuels</label>
                <input
                  type="number"
                  name="annualLeaveDays"
                  className="form-input"
                  value={current?.annualLeaveDays || ''}
                  onChange={handleChange}
                  min="0"
                  max="50"
                  placeholder="25"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">
              ⚙️ Conditions
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Période d'essai (mois)</label>
                <input
                  type="number"
                  name="trialPeriodMonths"
                  className="form-input"
                  value={current?.trialPeriodMonths || ''}
                  onChange={handleChange}
                  min="0"
                  max="12"
                  placeholder="3"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Durée (mois) - si CDD</label>
                <input
                  type="number"
                  name="durationMonths"
                  className="form-input"
                  value={current?.durationMonths || ''}
                  onChange={handleChange}
                  min="1"
                  max="36"
                  placeholder="12"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Avantages</label>
              <textarea
                name="benefits"
                className="form-input"
                style={{ minHeight: '80px', resize: 'vertical' }}
                value={current?.benefits || ''}
                onChange={handleChange}
                placeholder="Tickets restaurant, mutuelle, télétravail..."
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="renewable"
                  checked={current?.renewable || false}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                <label className="form-label" style={{ margin: 0 }}>
                  Contrat renouvelable
                </label>
              </div>
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

      {contracts.length === 0 ? (
        <div className="hr-empty">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <h3>Aucun contrat</h3>
          <p>Cet employé n'a pas encore de contrat enregistré</p>
          <button onClick={startNew} className="quick-action-btn">
            Créer le premier contrat
          </button>
        </div>
      ) : (
        <div className="hr-cards-grid">
          {contracts.map(contract => (
            <div key={contract.id} className="hr-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px', color: '#2c3e50', fontSize: '18px' }}>
                    {contract.contractType || 'Contrat'}
                  </h3>
                  {contract.contractNumber && (
                    <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                      #{contract.contractNumber}
                    </div>
                  )}
                </div>
                <span className={`status-badge ${new Date(contract.endDate || '') > new Date() ? 'active' : 'inactive'}`}>
                  {new Date(contract.endDate || '') > new Date() ? '✅ Actif' : '❌ Expiré'}
                </span>
              </div>

              <div className="hr-card-stats">
                {contract.startDate && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Début</span>
                    <span className="hr-stat-value">
                      {new Date(contract.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {contract.endDate && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Fin</span>
                    <span className="hr-stat-value">
                      {new Date(contract.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {contract.grossSalary && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Salaire brut</span>
                    <span className="hr-stat-value">
                      {contract.grossSalary.toLocaleString()} €
                    </span>
                  </div>
                )}
                {contract.weeklyHours && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Heures/semaine</span>
                    <span className="hr-stat-value">{contract.weeklyHours}h</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                <button
                  onClick={() => edit(contract)}
                  className="quick-action-btn"
                  style={{ flex: 1, fontSize: '14px' }}
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => remove(contract.id)}
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

