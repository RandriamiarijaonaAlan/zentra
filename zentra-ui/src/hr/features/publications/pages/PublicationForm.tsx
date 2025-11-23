import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, post, put } from '../../../services/api.ts';
import '../styles/PublicationForm.css';

interface PublicationFormDto {
  id?: number;
  title: string;
  description: string;
  publishedDate?: string;
  closingDate?: string;
  numberOfPositions: number;
  status: string;
  jobId: number | '';
}

// Nouveau: type léger pour StaffingNeed côté UI
interface StaffingNeedListItem {
  id: number;
  title: string;
  jobId: number;
  jobTitle?: string;
  numberOfPositions?: number;
}

export default function PublicationForm() {
  const [staffingNeeds, setStaffingNeeds] = useState<StaffingNeedListItem[]>([]);
  const [selectedNeedId, setSelectedNeedId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const initial: PublicationFormDto = useMemo(() => ({
    id: undefined,
    title: '',
    description: '',
    publishedDate: new Date().toISOString().slice(0,10),
    closingDate: '',
    numberOfPositions: 1,
    status: 'Open',
    jobId: ''
  }), []);

  const [form, setForm] = useState<PublicationFormDto>(initial);

  useEffect(() => {
    const id = search.get('id');
    // Charger les staffing needs + publication si édition
    Promise.all([
      get<StaffingNeedListItem[]>('/staffing-needs').catch(() => []),
      id ? get<PublicationFormDto>(`/publications/${id}`) : Promise.resolve(null)
    ]).then(([needs, pub]) => {
      setStaffingNeeds(needs);
      if (pub) {
        setForm({
          ...pub,
          publishedDate: pub.publishedDate?.slice(0,10),
          closingDate: pub.closingDate?.slice(0,10)
        });
        // Tenter de présélectionner un besoin qui correspond au jobId si présent
        const matchNeed = needs.find(n => n.jobId === (pub.jobId as number));
        if (matchNeed) setSelectedNeedId(matchNeed.id);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [search]);

  const onSelectNeed = (value: string) => {
    const needId = value ? Number(value) : '';
    setSelectedNeedId(needId);
    if (!value) {
      setForm(prev => ({ ...prev, jobId: '' }));
      return;
    }
    const need = staffingNeeds.find(n => n.id === Number(value));
    if (need) {
      // Mapper automatiquement le jobId depuis le besoin
      setForm(prev => ({
        ...prev,
        jobId: need.jobId,
        // Optionnel: si le besoin a un nombre de postes, le proposer par défaut s'il n'y a pas d'édition
        numberOfPositions: prev.id ? prev.numberOfPositions : (need.numberOfPositions ?? prev.numberOfPositions)
      }));
    }
  };

  const save = async () => {
    try {
      setError('');
      if (!form.jobId) {
        setError('Veuillez sélectionner un besoin (un job associé est requis)');
        return;
      }
      // S'assurer que la date de publication est bien au format YYYY-MM-DD
      const payload = {
        ...form,
        jobId: Number(form.jobId),
        publishedDate: form.publishedDate || new Date().toISOString().slice(0,10),
      };
      if (form.id) await put('/publications', payload);
      else await post('/publications', payload);
      navigate('/admin/publications');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  if (loading) return (
    <div className="publication-form-container">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    </div>
  );

  // Infos dérivées pour l'encart
  const selectedNeed = selectedNeedId ? staffingNeeds.find(n => n.id === selectedNeedId) : undefined;

  return (
    <div className="publication-form-container">
      <div className="publication-form-header">
        <h1>{form.id ? '✏️ Modifier la publication' : '➕ Créer une nouvelle publication'}</h1>
        <p className="subtitle">Remplissez les informations pour publier une offre d'emploi</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="publication-form-card">
        {/* Sélection du besoin (au lieu du job brut) */}
        <div className="publication-form-section">
          <h2 className="publication-section-title">🧩 Sélection du besoin</h2>
          <div className="publication-form-grid single-column">
            <div className="publication-form-group full-width">
              <label>Besoin en effectif <span className="required">*</span></label>
              <select
                value={selectedNeedId}
                onChange={e => onSelectNeed(e.target.value)}
              >
                <option value="">-- Sélectionner un besoin --</option>
                {staffingNeeds.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.title} {n.jobTitle ? `• ${n.jobTitle}` : ''} (ID: {n.id})
                  </option>
                ))}
              </select>
              <span className="publication-form-help">
                Sélectionnez un besoin; le poste associé sera appliqué automatiquement
              </span>
            </div>

            {/* Encart d'info du job associé */}
            {(selectedNeed || form.jobId) && (
              <div className="publication-info-card">
                <div className="info-row">
                  <span className="info-label">Poste associé</span>
                  <span className="info-value">{selectedNeed?.jobTitle || (form.jobId ? `Job #${form.jobId}` : '—')}</span>
                </div>
                {selectedNeed?.numberOfPositions && (
                  <div className="info-row">
                    <span className="info-label">Besoin (postes)</span>
                    <span className="info-value">{selectedNeed.numberOfPositions}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Informations principales */}
        <div className="publication-form-section">
          <h2 className="publication-section-title">📋 Informations principales</h2>
          <div className="publication-form-grid">
            <div className="publication-form-group full-width">
              <label>Titre de la publication <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Ex: Développeur Full Stack Senior"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
              />
            </div>
            <div className="publication-form-group full-width">
              <label>Description <span className="required">*</span></label>
              <textarea
                rows={6}
                placeholder="Décrivez le poste, les missions, les compétences requises..."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Dates et disponibilité */}
        <div className="publication-form-section">
          <h2 className="publication-section-title">📅 Dates et disponibilité</h2>
          <div className="publication-form-grid">
            <div className="publication-form-group">
              <label>Date de publication <span className="required">*</span></label>
              <input
                type="date"
                value={form.publishedDate}
                onChange={e => setForm({...form, publishedDate: e.target.value})}
              />
            </div>
            <div className="publication-form-group">
              <label>Date de clôture</label>
              <input
                type="date"
                value={form.closingDate || ''}
                onChange={e => setForm({...form, closingDate: e.target.value})}
              />
              <span className="publication-form-help">Optionnel - Date limite pour postuler</span>
            </div>
          </div>
        </div>

        {/* Détails du poste */}
        <div className="publication-form-section">
          <h2 className="publication-section-title">💼 Détails du poste</h2>
          <div className="publication-form-grid">
            <div className="publication-form-group">
              <label>Nombre de postes <span className="required">*</span></label>
              <input
                type="number"
                min={1}
                placeholder="1"
                value={form.numberOfPositions}
                onChange={e => setForm({...form, numberOfPositions: Number(e.target.value)})}
              />
            </div>
            <div className="publication-form-group">
              <label>Statut <span className="required">*</span></label>
              <select
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
              >
                <option value="Open">🟢 Ouvert</option>
                <option value="Closed">🔴 Fermé</option>
                <option value="Suspended">🟡 Suspendu</option>
                <option value="Filled">🔵 Pourvu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="publication-form-actions-footer">
          <button
            onClick={() => navigate('/admin/publications')}
            className="btn-cancel"
          >
            Annuler
          </button>
          <button
            onClick={save}
            className="btn-save"
          >
            {form.id ? '💾 Enregistrer les modifications' : '✨ Créer la publication'}
          </button>
        </div>
      </div>
    </div>
  );
}
