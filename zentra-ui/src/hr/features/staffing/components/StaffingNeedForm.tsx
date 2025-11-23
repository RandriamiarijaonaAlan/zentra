import { useState, useEffect } from 'react';
import type { StaffingNeed } from '../../../types/StaffingNeed.ts';
import { createStaffingNeed, updateStaffingNeed, listDepartments, listJobTitles, listManagers } from '../../../services/hrApi.ts';
import '../styles/StaffingNeeds.css';

interface StaffingNeedFormProps {
  need?: StaffingNeed;
  onSave: (savedNeed: StaffingNeed) => void;
  onCancel: () => void;
}

interface ReferenceData {
  departments: {id: number, name: string}[];
  jobs: {id: number, title: string, departmentId: number}[];
  managers: {id: number, firstName: string, lastName: string}[];
}

export const StaffingNeedForm = ({ need, onSave, onCancel }: StaffingNeedFormProps) => {
  const [formData, setFormData] = useState<StaffingNeed>({
    title: '',
    description: '',
    numberOfPositions: 1,
    priority: 'Medium',
    status: 'Open',
    requiredStartDate: '',
    budgetAllocated: 0,
    justification: '',
    departmentId: 0,
    jobId: 0,
    requestedById: undefined,
  });

  const [refData, setRefData] = useState<ReferenceData>({
    departments: [],
    jobs: [],
    managers: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (need) {
      setFormData(need);
    }
    loadReferenceData();
  }, [need]);

  const loadReferenceData = async () => {
    try {
      const [departments, jobs, managers] = await Promise.all([
        listDepartments().catch(() => { throw new Error('Départements'); }),
        listJobTitles().catch(() => { throw new Error('Postes'); }),
        listManagers().catch(() => { throw new Error('Managers'); })
      ]);
      setRefData({ departments, jobs, managers });
    } catch (error) {
      console.error('Erreur lors du chargement des données de référence:', error);
      // Les listes resteront vides, les sélecteurs afficheront "Aucune donnée disponible"
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) newErrors.title = 'Le titre est requis';
    if (formData.numberOfPositions < 1) newErrors.numberOfPositions = 'Le nombre de postes doit être positif';
    if (!formData.departmentId) newErrors.departmentId = 'Le département est requis';
    if (!formData.jobId) newErrors.jobId = 'Le poste est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const savedNeed = need?.id
        ? await updateStaffingNeed(formData)
        : await createStaffingNeed(formData);
      onSave(savedNeed);
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      setError('Erreur lors de l\'enregistrement. Vérifiez votre connexion au backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const filteredJobs = refData.jobs.filter(job =>
    !formData.departmentId || job.departmentId === formData.departmentId
  );

  return (
    <div className="staffing-need-form">
      <div className="staffing-need-container">
        <div className="staffing-need-header">
          <h1 className="staffing-need-title">
            {need ? '✏️ Modifier le besoin' : '➕ Nouveau besoin en personnel'}
          </h1>
          <p className="staffing-need-subtitle">
            {need ? 'Modifiez les informations du besoin' : 'Créez une nouvelle demande de personnel'}
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee',
            color: '#e74c3c',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #e74c3c'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section Informations générales */}
          <div className="form-section">
            <div className="section-title">
              📋 Informations générales
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Titre du besoin <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Développeur Backend Senior"
                  required
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description détaillée</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                placeholder="Décrivez le besoin en détail : missions, compétences requises, contexte..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Nombre de postes <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="numberOfPositions"
                  className={`form-input ${errors.numberOfPositions ? 'error' : ''}`}
                  value={formData.numberOfPositions}
                  onChange={handleChange}
                  min="1"
                  required
                />
                {errors.numberOfPositions && <span className="error-text">{errors.numberOfPositions}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Date de début souhaitée</label>
                <input
                  type="date"
                  name="requiredStartDate"
                  className="form-input"
                  value={formData.requiredStartDate || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section Organisation */}
          <div className="form-section">
            <div className="section-title">
              🏢 Organisation
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Département <span className="required">*</span>
                </label>
                <select
                  name="departmentId"
                  className={`form-select ${errors.departmentId ? 'error' : ''}`}
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un département</option>
                  {refData.departments.length === 0 ? (
                    <option value="" disabled>Aucun département disponible - Vérifiez la connexion au backend</option>
                  ) : (
                    refData.departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.departmentId && <span className="error-text">{errors.departmentId}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Poste <span className="required">*</span>
                </label>
                <select
                  name="jobId"
                  className={`form-select ${errors.jobId ? 'error' : ''}`}
                  value={formData.jobId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un poste</option>
                  {filteredJobs.length === 0 ? (
                    <option value="" disabled>
                      {formData.departmentId
                        ? 'Aucun poste disponible pour ce département'
                        : 'Sélectionnez d\'abord un département'
                      }
                    </option>
                  ) : (
                    filteredJobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))
                  )}
                </select>
                {errors.jobId && <span className="error-text">{errors.jobId}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Demandeur</label>
                <select
                  name="requestedById"
                  className="form-select"
                  value={formData.requestedById || ''}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner un demandeur</option>
                  {refData.managers.length === 0 ? (
                    <option value="" disabled>Aucun manager disponible - Vérifiez la connexion au backend</option>
                  ) : (
                    refData.managers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Budget alloué (Ar)</label>
                <input
                  type="number"
                  name="budgetAllocated"
                  className="form-input"
                  value={formData.budgetAllocated || ''}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  placeholder="Ex: 50000"
                />
              </div>
            </div>
          </div>

          {/* Section Priorité et Statut */}
          <div className="form-section">
            <div className="section-title">
              ⚡ Priorité et Statut
            </div>

            <div className="form-group">
              <label className="form-label">Priorité</label>
              <div className="priority-selector">
                {(['High', 'Medium', 'Low'] as const).map(priority => (
                  <div
                    key={priority}
                    className={`priority-option ${priority.toLowerCase()} ${formData.priority === priority ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, priority }))}
                  >
                    {priority === 'High' ? '🔥 Élevée' :
                     priority === 'Medium' ? '⚡ Moyenne' :
                     '🔄 Faible'}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Statut</label>
              <div className="status-selector">
                {(['Open', 'In Progress', 'Fulfilled', 'Cancelled'] as const).map(status => (
                  <div
                    key={status}
                    className={`status-option ${formData.status === status ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, status }))}
                  >
                    {status === 'Open' ? '🆕 Ouvert' :
                     status === 'In Progress' ? '🔄 En cours' :
                     status === 'Fulfilled' ? '✅ Satisfait' :
                     '❌ Annulé'}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Justification</label>
              <textarea
                name="justification"
                className="form-textarea"
                value={formData.justification || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Justifiez la nécessité de ce recrutement..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading && <div className="loading-spinner"></div>}
              {need ? 'Sauvegarder les modifications' : 'Créer le besoin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};