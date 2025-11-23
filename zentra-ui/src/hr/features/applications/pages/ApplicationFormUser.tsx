import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get } from '../../../services/api.ts';
import type { PublicationDto } from '../../../types';
import axios from 'axios';
import UserNavbar from '../../shared/components/UserNavbar.tsx';
import '../styles/ApplicationFormUser.css';

export default function ApplicationFormUser() {
  const { publicationId } = useParams<{ publicationId: string }>();
  const navigate = useNavigate();

  const [publication, setPublication] = useState<PublicationDto | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    city: '',
    country: '',
    educationLevel: '',
    lastDegree: '',
    yearsExperience: 0,
    skills: '',
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [motivationLetterFile, setMotivationLetterFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (publicationId) {
      loadPublication(publicationId);
    }
  }, [publicationId]);

  const loadPublication = async (id: string) => {
    try {
      const data = await get<PublicationDto>(`/publications/${id}`);
      setPublication(data);
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger l\'offre d\'emploi');
      setLoading(false);
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setCvFile(file);
        setError('');
      } else {
        setError('Le CV doit être un fichier PDF');
        e.target.value = '';
      }
    }
  };

  const handleMotivationLetterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (
        file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      ) {
        setMotivationLetterFile(file);
        setError('');
      } else {
        setError('La lettre de motivation doit être un fichier PDF ou DOCX');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation simple
    if (!formData.firstName.trim()) return setError('Le prénom est obligatoire');
    if (!formData.lastName.trim()) return setError('Le nom est obligatoire');
    if (!formData.email.trim()) return setError('L\'email est obligatoire');
    if (!formData.phone.trim()) return setError('Le téléphone est obligatoire');
    if (!cvFile) return setError('Le CV est obligatoire');
    if (!motivationLetterFile) return setError('La lettre de motivation est obligatoire');

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Créer l'objet ApplicationDto avec la structure attendue
      const applicationDto = {
        candidate: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          birthDate: formData.birthDate || null, // important pour LocalDate
          address: formData.address || null,
          city: formData.city || null,
          country: formData.country || null,
          educationLevel: formData.educationLevel || null,
          lastDegree: formData.lastDegree || null,
          yearsExperience: formData.yearsExperience || 0,
          skills: formData.skills || null,
        },
        publicationId: parseInt(publicationId!, 10),
      };

      // Ajouter le JSON en Blob
      formDataToSend.append(
          'application',
          new Blob([JSON.stringify(applicationDto)], { type: 'application/json' })
      );

      // Ajouter les fichiers
      formDataToSend.append('cv', cvFile);
      formDataToSend.append('motivationLetter', motivationLetterFile);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

      await axios.post(`${apiUrl}/users/apply`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Redirection succès
      navigate('/application-success');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la soumission de votre candidature');
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="application-form-user-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !publication) {
    return (
      <div className="application-form-user-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>{error}</h2>
          <button onClick={() => navigate('/publications')} className="btn-back">
            Retour aux offres
          </button>
        </div>
      </div>
    );
  }

  if (!publication) return null;

  return (
    <div className="application-form-user-page">
      <UserNavbar />
      <div className="form-header">
        <button onClick={() => navigate('/publications')} className="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Retour aux offres
        </button>
        <h1>Postuler à l'offre</h1>
        <div className="publication-info-banner">
          <div className="banner-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div>
            <h2>{publication.title}</h2>
            <p>{publication.numberOfPositions} poste{publication.numberOfPositions > 1 ? 's' : ''} disponible{publication.numberOfPositions > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="form-container">
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

        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h3>Informations personnelles</h3>
                <p>Veuillez remplir vos coordonnées</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName">
                  Prénom <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Votre prénom"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  Nom <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Votre nom"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Téléphone <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+261 XX XX XXX XX"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="birthDate">
                  Date de naissance
                </label>
                <input
                  type="date"
                  id="birthDate"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  Adresse
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Votre adresse"
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">
                  Ville
                </label>
                <input
                  type="text"
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Votre ville"
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">
                  Pays
                </label>
                <input
                  type="text"
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Votre pays"
                />
              </div>

              <div className="form-group">
                <label htmlFor="educationLevel">
                  Niveau d'éducation
                </label>
                <select
                  id="educationLevel"
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="BAC">Baccalauréat</option>
                  <option value="BAC+2">Bac +2</option>
                  <option value="BAC+3">Bac +3 (Licence)</option>
                  <option value="BAC+5">Bac +5 (Master)</option>
                  <option value="BAC+8">Bac +8 (Doctorat)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="lastDegree">
                  Dernier diplôme obtenu
                </label>
                <input
                  type="text"
                  id="lastDegree"
                  value={formData.lastDegree}
                  onChange={(e) => setFormData({ ...formData, lastDegree: e.target.value })}
                  placeholder="Ex: Master en Informatique"
                />
              </div>

              <div className="form-group">
                <label htmlFor="yearsExperience">
                  Années d'expérience
                </label>
                <input
                  type="number"
                  id="yearsExperience"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="skills">
                  Compétences
                </label>
                <textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Listez vos compétences principales (ex: Java, React, SQL, etc.)"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <div className="section-icon documents-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
              </div>
              <div>
                <h3>Documents requis</h3>
                <p>Téléchargez votre CV et lettre de motivation</p>
              </div>
            </div>

            <div className="documents-grid">
              <div className="file-upload-group">
                <label htmlFor="cv">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  Curriculum Vitae (PDF) <span className="required">*</span>
                </label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="cv"
                    accept=".pdf"
                    onChange={handleCvChange}
                    required
                    className="file-input"
                  />
                  <div className="file-upload-display">
                    {cvFile ? (
                      <div className="file-selected">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{cvFile.name}</span>
                        <span className="file-size">({(cvFile.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    ) : (
                      <div className="file-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>Glissez-déposez ou cliquez pour choisir</span>
                        <span className="file-info">PDF uniquement, max 5 MB</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="file-upload-group">
                <label htmlFor="motivationLetter">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Lettre de Motivation <span className="required">*</span>
                </label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="motivationLetter"
                    accept=".pdf,.doc,.docx"
                    onChange={handleMotivationLetterChange}
                    required
                    className="file-input"
                  />
                  <div className="file-upload-display">
                    {motivationLetterFile ? (
                      <div className="file-selected">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{motivationLetterFile.name}</span>
                        <span className="file-size">({(motivationLetterFile.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    ) : (
                      <div className="file-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>Glissez-déposez ou cliquez pour choisir</span>
                        <span className="file-info">PDF ou DOCX, max 5 MB</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/publications')}
              className="btn-cancel"
              disabled={submitting}
            >
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="spinner-small"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13"></path>
                    <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                  </svg>
                  Soumettre ma candidature
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

