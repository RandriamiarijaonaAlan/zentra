import { useState, useEffect } from 'react';
import { get, post, put, del } from '../services/api.ts';
import type { IrsaRateDto, CnapsRateDto, OstieRateDto } from '../types';
import '../styles/ContributionConfiguration.css';

export default function ContributionConfiguration() {
  const [cnaps, setCnaps] = useState<CnapsRateDto | null>(null);
  const [ostie, setOstie] = useState<OstieRateDto | null>(null);
  const [irsaRates, setIrsaRates] = useState<IrsaRateDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingCnaps, setEditingCnaps] = useState(false);
  const [editingOstie, setEditingOstie] = useState(false);
  const [editingIrsa, setEditingIrsa] = useState<number | null>(null);
  const [addingIrsa, setAddingIrsa] = useState(false);

  const [cnapsForm, setCnapsForm] = useState<CnapsRateDto>({ id: 0, ceilingBaseAmount: 0, ceilingRate: 0, rate: 0, ceilingAmount: 0 });
  const [ostieForm, setOstieForm] = useState<OstieRateDto>({ id: 0, rate: 0 });
  const [irsaForm, setIrsaForm] = useState<IrsaRateDto>({ id: 0, minIncome: 0, maxIncome: 0, rate: 0, amount: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cnapsData, ostieData, irsaData] = await Promise.all([
        get<CnapsRateDto>('/contributions/cnaps'),
        get<OstieRateDto>('/contributions/ostie'),
        get<IrsaRateDto[]>('/contributions/irsa'),
      ]);

      setCnaps(cnapsData);
      setOstie(ostieData);
      setIrsaRates(irsaData);
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger les données de configuration');
      setLoading(false);
    }
  };

  const handleEditCnaps = () => {
    if (cnaps) {
      setCnapsForm(cnaps);
      setEditingCnaps(true);
    }
  };

  const handleSaveCnaps = async () => {
    try {
      const updated = await put<CnapsRateDto>('/contributions/cnaps', cnapsForm);
      setCnaps(updated);
      setEditingCnaps(false);
      showSuccess('CNAPS mis à jour avec succès');
    } catch (err: any) {
      setError('Erreur lors de la mise à jour CNAPS');
    }
  };

  const handleEditOstie = () => {
    if (ostie) {
      setOstieForm(ostie);
      setEditingOstie(true);
    }
  };

  const handleSaveOstie = async () => {
    try {
      const updated = await put<OstieRateDto>('/contributions/ostie', ostieForm);
      setOstie(updated);
      setEditingOstie(false);
      showSuccess('OSTIE mis à jour avec succès');
    } catch (err: any) {
      setError('Erreur lors de la mise à jour OSTIE');
    }
  };

  const handleAddIrsa = () => {
    setIrsaForm({ id: 0, minIncome: null, maxIncome: null, rate: null, amount: null });
    setAddingIrsa(true);
  };

  const handleEditIrsa = (rate: IrsaRateDto) => {
    setIrsaForm(rate);
    setEditingIrsa(rate.id);
  };

  const handleSaveIrsa = async () => {
    try {
      if (addingIrsa) {
        const created = await post<IrsaRateDto>('/contributions/irsa', irsaForm);
        setIrsaRates([...irsaRates, created]);
        setAddingIrsa(false);
        showSuccess('Tranche IRSA ajoutée avec succès');
      } else if (editingIrsa !== null) {
        const updated = await put<IrsaRateDto>('/contributions/irsa', irsaForm);
        setIrsaRates(irsaRates.map(r => r.id === updated.id ? updated : r));
        setEditingIrsa(null);
        showSuccess('Tranche IRSA mise à jour avec succès');
      }
    } catch (err: any) {
      setError('Erreur lors de la sauvegarde IRSA');
    }
  };

  const handleDeleteIrsa = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tranche IRSA ?')) {
      return;
    }

    try {
      await del(`/contributions/irsa/${id}`);
      setIrsaRates(irsaRates.filter(r => r.id !== id));
      showSuccess('Tranche IRSA supprimée avec succès');
    } catch (err: any) {
      setError('Erreur lors de la suppression IRSA');
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return (
      <div className="contribution-config-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contribution-config-page">
      <div className="contribution-header">
        <div>
          <h1>Configuration des Contributions</h1>
          <p className="contribution-subtitle">Gérez les taux et les barèmes des contributions sociales et fiscales</p>
        </div>
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

      {success && (
        <div className="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {success}
        </div>
      )}

      <div className="contribution-grid">
        {/* CNAPS Card */}
        <div className="contribution-card">
          <div className="contribution-card-header">
            <div className="contribution-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="contribution-card-title">
              <h3>CNAPS</h3>
              <p>Caisse Nationale de Prévoyance Sociale</p>
            </div>
            {!editingCnaps && (
              <button onClick={handleEditCnaps} className="btn-edit">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Modifier
              </button>
            )}
          </div>

          {editingCnaps ? (
            <div className="contribution-form">
              <div className="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  Montant de base plafond
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cnapsForm.ceilingBaseAmount ?? ''}
                  onChange={(e) => setCnapsForm({ ...cnapsForm, ceilingBaseAmount: parseFloat(e.target.value) || null })}
                />
              </div>

              <div className="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                  </svg>
                  Taux plafond (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cnapsForm.ceilingRate ?? ''}
                  onChange={(e) => setCnapsForm({ ...cnapsForm, ceilingRate: parseFloat(e.target.value) || null })}
                />
              </div>

              <div className="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                    <path d="M12 18V6"></path>
                  </svg>
                  Taux de cotisation (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cnapsForm.rate ?? ''}
                  onChange={(e) => setCnapsForm({ ...cnapsForm, rate: parseFloat(e.target.value) || null })}
                />
              </div>

              <div className="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  Montant plafond
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cnapsForm.ceilingAmount ?? ''}
                  onChange={(e) => setCnapsForm({ ...cnapsForm, ceilingAmount: parseFloat(e.target.value) || null })}
                />
              </div>

              <div className="form-actions">
                <button onClick={() => setEditingCnaps(false)} className="btn-cancel">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Annuler
                </button>
                <button onClick={handleSaveCnaps} className="btn-save">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Enregistrer
                </button>
              </div>
            </div>
          ) : (
            cnaps && (
              <div className="contribution-form">
                <div className="contribution-value">
                  <span className="contribution-value-label">Montant de base plafond:</span>
                  <span className="contribution-value-amount">{cnaps.ceilingBaseAmount?.toFixed(2) ?? 'N/A'} Ar</span>
                </div>
                <div className="contribution-value">
                  <span className="contribution-value-label">Taux plafond:</span>
                  <span className="contribution-value-amount">{cnaps.ceilingRate?.toFixed(2) ?? 'N/A'} %</span>
                </div>
                <div className="contribution-value">
                  <span className="contribution-value-label">Taux de cotisation:</span>
                  <span className="contribution-value-amount">{cnaps.rate?.toFixed(2) ?? 'N/A'} %</span>
                </div>
                <div className="contribution-value">
                  <span className="contribution-value-label">Montant plafond:</span>
                  <span className="contribution-value-amount">{cnaps.ceilingAmount?.toFixed(2) ?? 'N/A'} Ar</span>
                </div>
              </div>
            )
          )}
        </div>

        {/* OSTIE Card */}
        <div className="contribution-card">
          <div className="contribution-card-header">
            <div className="contribution-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <div className="contribution-card-title">
              <h3>OSTIE</h3>
              <p>Office de Santé et d'Hygiène au Travail</p>
            </div>
            {!editingOstie && (
              <button onClick={handleEditOstie} className="btn-edit">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Modifier
              </button>
            )}
          </div>

          {editingOstie ? (
            <div className="contribution-form">
              <div className="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                    <path d="M12 18V6"></path>
                  </svg>
                  Taux de cotisation (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ostieForm.rate ?? ''}
                  onChange={(e) => setOstieForm({ ...ostieForm, rate: parseFloat(e.target.value) || null })}
                />
              </div>

              <div className="form-actions">
                <button onClick={() => setEditingOstie(false)} className="btn-cancel">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Annuler
                </button>
                <button onClick={handleSaveOstie} className="btn-save">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Enregistrer
                </button>
              </div>
            </div>
          ) : (
            ostie && (
              <div className="contribution-form">
                <div className="contribution-value">
                  <span className="contribution-value-label">Taux de cotisation:</span>
                  <span className="contribution-value-amount">{ostie.rate?.toFixed(2) ?? 'N/A'} %</span>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* IRSA Card - Full Width */}
      <div className="contribution-card" style={{ marginTop: '2rem' }}>
        <div className="contribution-card-header">
          <div className="contribution-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
          <div className="contribution-card-title">
            <h3>IRSA</h3>
            <p>Impôt sur les Revenus Salariaux et Assimilés</p>
          </div>
          {!addingIrsa && !editingIrsa && (
            <button onClick={handleAddIrsa} className="btn-add">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Ajouter une tranche
            </button>
          )}
        </div>

        {(addingIrsa || editingIrsa !== null) && (
          <div className="contribution-form" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                  </svg>
                  Revenu min (Ar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={irsaForm.minIncome ?? ''}
                  onChange={(e) => setIrsaForm({ ...irsaForm, minIncome: parseFloat(e.target.value) || null })}
                  placeholder="Optionnel"
                />
              </div>

              <div className="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                  </svg>
                  Revenu max (Ar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={irsaForm.maxIncome ?? ''}
                  onChange={(e) => setIrsaForm({ ...irsaForm, maxIncome: parseFloat(e.target.value) || null })}
                  placeholder="Optionnel"
                />
              </div>

              <div className="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                  </svg>
                  Taux (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={irsaForm.rate ?? ''}
                  onChange={(e) => setIrsaForm({ ...irsaForm, rate: parseFloat(e.target.value) || null })}
                  placeholder="Optionnel"
                />
              </div>

              <div className="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  Montant (Ar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={irsaForm.amount ?? ''}
                  onChange={(e) => setIrsaForm({ ...irsaForm, amount: parseFloat(e.target.value) || null })}
                  placeholder="Optionnel"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                onClick={() => {
                  setAddingIrsa(false);
                  setEditingIrsa(null);
                }}
                className="btn-cancel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Annuler
              </button>
              <button onClick={handleSaveIrsa} className="btn-save">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Enregistrer
              </button>
            </div>
          </div>
        )}

        <div className="irsa-rates-list">
          {irsaRates.length === 0 ? (
            <div className="empty-state">
              <h3>Aucune tranche IRSA configurée</h3>
              <p>Ajoutez des tranches pour définir le barème de l'IRSA</p>
            </div>
          ) : (
            irsaRates.map((rate) => (
              <div key={rate.id} className="irsa-rate-item">
                <div className="irsa-rate-info">
                  <div className="irsa-rate-range">
                    {rate.minIncome !== null && rate.minIncome !== undefined ? `${rate.minIncome.toFixed(2)} Ar` : '0 Ar'}
                    {' → '}
                    {rate.maxIncome !== null && rate.maxIncome !== undefined ? `${rate.maxIncome.toFixed(2)} Ar` : '∞'}
                  </div>
                  <div className="irsa-rate-details">
                    Taux: {rate.rate !== null && rate.rate !== undefined ? `${rate.rate}%` : 'N/A'} |
                    Montant: {rate.amount !== null && rate.amount !== undefined ? `${rate.amount.toFixed(2)} Ar` : 'N/A'}
                  </div>
                </div>
                <div className="irsa-rate-actions">
                  <button
                    onClick={() => handleEditIrsa(rate)}
                    className="btn-icon"
                    title="Modifier"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteIrsa(rate.id)}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

