import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { get, post, put } from '../../../services/api.ts';
import type { InterviewDto, InterviewFormDto, CandidateDto, EmployeeDto } from '../../../types';
import '../styles/InterviewForm.css';

export default function InterviewForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id !== 'new';

  const [formData, setFormData] = useState<InterviewFormDto>({
    candidateId: 0,
    interviewerId: 0,
    interviewDate: '',
    startTime: '',
    durationMinutes: 60,
    interviewType: 'PRESENTIEL',
    location: '',
    status: 'PLANIFIE',
  });

  const [candidates, setCandidates] = useState<CandidateDto[]>([]);
  const [interviewers, setInterviewers] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCandidates();
    loadInterviewers();
    if (isEdit && id) {
      loadInterview(id);
    }
  }, [isEdit, id]);

  const loadCandidates = async () => {
    try {
      const data = await get<CandidateDto[]>('/candidates');
      setCandidates(data);
    } catch (err: any) {
      setError('Impossible de charger la liste des candidats');
    }
  };

  const loadInterviewers = async () => {
    try {
      const data = await get<EmployeeDto[]>('/employees');
      setInterviewers(data);
    } catch (err: any) {
      setError('Impossible de charger la liste des recruteurs');
    }
  };

  const loadInterview = async (interviewId: string) => {
    try {
      const data = await get<InterviewDto>(`/interviews/${interviewId}`);
      setFormData({
        id: data.id,
        candidateId: data.candidateId,
        interviewerId: data.interviewerId,
        interviewDate: data.interviewDate,
        startTime: data.startTime,
        durationMinutes: data.durationMinutes,
        interviewType: data.interviewType,
        location: data.location,
        status: data.status,
        score: data.score,
        comment: data.comment,
        applicationId: data.applicationId,
      });
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger l\'entretien');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.candidateId === 0) {
      setError('Veuillez sélectionner un candidat');
      return;
    }

    if (formData.interviewerId === 0) {
      setError('Veuillez sélectionner un recruteur');
      return;
    }

    if (!formData.interviewDate) {
      setError('La date est obligatoire');
      return;
    }

    if (!formData.startTime) {
      setError('L\'heure de début est obligatoire');
      return;
    }

    if (formData.durationMinutes <= 0) {
      setError('La durée doit être supérieure à 0');
      return;
    }

    if (!formData.location.trim()) {
      setError('Le lieu ou lien est obligatoire');
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit) {
        await put('/interviews', formData);
      } else {
        await post('/interviews', formData);
      }
      navigate('/admin/interviews');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'candidateId' || name === 'interviewerId' || name === 'durationMinutes'
        ? parseInt(value) || 0
        : value,
    }));
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
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
            <span>{isEdit ? 'Modifier' : 'Planifier'}</span>
          </div>
          <h1>{isEdit ? 'Modifier l\'entretien' : 'Planifier un nouvel entretien'}</h1>
          <p className="page-subtitle">
            {isEdit ? 'Modifiez les informations de l\'entretien' : 'Remplissez les informations pour planifier un entretien'}
          </p>
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

      <form onSubmit={handleSubmit} className="interview-form">
        <div className="form-section">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Participants
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="candidateId">
                Candidat <span className="required">*</span>
              </label>
              <select
                id="candidateId"
                name="candidateId"
                value={formData.candidateId}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value={0}>Sélectionnez un candidat</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.firstName} {candidate.lastName} ({candidate.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="interviewerId">
                Recruteur <span className="required">*</span>
              </label>
              <select
                id="interviewerId"
                name="interviewerId"
                value={formData.interviewerId}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value={0}>Sélectionnez un recruteur</option>
                {interviewers.map((interviewer) => (
                  <option key={interviewer.id} value={interviewer.id}>
                    {interviewer.firstName} {interviewer.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Date et heure
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="interviewDate">
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="interviewDate"
                name="interviewDate"
                value={formData.interviewDate}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="startTime">
                Heure de début <span className="required">*</span>
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="durationMinutes">
                Durée (minutes) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="durationMinutes"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                min="15"
                step="15"
                required
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Type et lieu
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="interviewType">
                Type d'entretien <span className="required">*</span>
              </label>
              <select
                id="interviewType"
                name="interviewType"
                value={formData.interviewType}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="PRESENTIEL">🏢 Présentiel</option>
                <option value="VISIO">💻 Visioconférence</option>
                <option value="TELEPHONIQUE">📞 Téléphonique</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="location">
                {formData.interviewType === 'PRESENTIEL' && 'Lieu de l\'entretien'}
                {formData.interviewType === 'VISIO' && 'Lien de visioconférence'}
                {formData.interviewType === 'TELEPHONIQUE' && 'Numéro de téléphone'}
                <span className="required">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={
                  formData.interviewType === 'PRESENTIEL'
                    ? 'Ex: Salle de réunion A, Bâtiment Principal'
                    : formData.interviewType === 'VISIO'
                    ? 'Ex: https://meet.google.com/abc-defg-hij'
                    : 'Ex: +33 6 12 34 56 78'
                }
                required
                className="form-input"
              />
            </div>
          </div>
        </div>

        {isEdit && (
          <div className="form-section">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Statut et évaluation
            </h2>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="status">Statut</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="PLANIFIE">Planifié</option>
                  <option value="REALISE">Réalisé</option>
                  <option value="ANNULE">Annulé</option>
                </select>
              </div>

              {formData.status === 'REALISE' && (
                <>
                  <div className="form-group">
                    <label htmlFor="score">Note sur 20</label>
                    <input
                      type="number"
                      id="score"
                      name="score"
                      value={formData.score || ''}
                      onChange={handleChange}
                      min="0"
                      max="20"
                      step="0.5"
                      className="form-input"
                      placeholder="Ex: 15.5"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="comment">Commentaire</label>
                    <textarea
                      id="comment"
                      name="comment"
                      value={formData.comment || ''}
                      onChange={handleChange}
                      rows={4}
                      className="form-textarea"
                      placeholder="Vos observations sur le candidat..."
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="form-actions">
          <Link to="/admin/interviews" className="btn-secondary">
            Annuler
          </Link>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? (
              <>
                <div className="spinner-small"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                {isEdit ? 'Enregistrer les modifications' : 'Planifier l\'entretien'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

