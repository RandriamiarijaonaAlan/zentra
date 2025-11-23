import {useState, useEffect} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import {get} from '../../../services/api.ts';
import type {ApplicationDto, ApplicationFormDto, PublicationDto, CandidateDto} from '../../../types';
import axios from 'axios';
import '../styles/ApplicationForm.css';

export default function ApplicationForm() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !(id === 'new');

    const [formData, setFormData] = useState<ApplicationFormDto>({
        candidateId: 0,
        publicationId: 0,
    });

    const [candidateFormData, setCandidateFormData] = useState({
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

    const [showCandidateForm, setShowCandidateForm] = useState(false);

    const [cvFile, setCvFile] = useState<File | null>(null);
    const [motivationLetterFile, setMotivationLetterFile] = useState<File | null>(null);
    const [publications, setPublications] = useState<PublicationDto[]>([]);
    const [candidates, setCandidates] = useState<CandidateDto[]>([]);

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadPublications();
        loadCandidates();
        if (isEdit && id) {
            loadApplication(id);
        }
    }, [isEdit, id]);

    const loadPublications = async () => {
        try {
            const data = await get<PublicationDto[]>('/publications');
            setPublications(data);
        } catch (err: any) {
            console.error('Erreur lors du chargement des publications', err);
        }
    };

    const loadCandidates = async () => {
        try {
            const data = await get<CandidateDto[]>('/candidates');
            setCandidates(data);
        } catch (err: any) {
            console.error('Erreur lors du chargement des candidats', err);
        }
    };

    const loadApplication = async (appId: string) => {
        try {
            const data = await get<ApplicationDto>(`/applications/${appId}`);
            setFormData({
                id: data.id,
                candidateId: data.candidateId,
                publicationId: data.publicationId,
                appliedAt: data.appliedAt,
                status: data.status,
            });
            setLoading(false);
        } catch (err: any) {
            setError('Impossible de charger la candidature');
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

    const handleCreateCandidate = async () => {
        // Validation
        if (!candidateFormData.firstName.trim() || !candidateFormData.lastName.trim() ||
            !candidateFormData.email.trim() || !candidateFormData.phone.trim()) {
            setError('Les champs prénom, nom, email et téléphone sont obligatoires pour créer un candidat');
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
            const response = await axios.post(`${apiUrl}/candidates`, candidateFormData);
            const newCandidate = response.data;

            // Ajouter le nouveau candidat à la liste
            setCandidates([...candidates, newCandidate]);

            // Sélectionner automatiquement le nouveau candidat
            setFormData({...formData, candidateId: newCandidate.id});

            // Réinitialiser le formulaire et le fermer
            setCandidateFormData({
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
            setShowCandidateForm(false);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la création du candidat');
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

        if (formData.publicationId === 0) {
            setError('Veuillez sélectionner une publication');
            return;
        }

        if (!isEdit && !cvFile) {
            setError('Le CV est obligatoire');
            return;
        }

        if (!isEdit && !motivationLetterFile) {
            setError('La lettre de motivation est obligatoire');
            return;
        }

        setSubmitting(true);

        try {
            const formDataToSend = new FormData();

            // Récupérer les informations complètes du candidat
            const selectedCandidate = candidates.find(c => c.id === formData.candidateId);

            // Créer l'ApplicationDto complet
            const applicationDto: ApplicationDto = {
                id: formData.id || 0,
                candidateId: formData.candidateId,
                publicationId: formData.publicationId,
                appliedAt: formData.appliedAt || new Date().toISOString(),
                status: formData.status || 'received',
                candidate: selectedCandidate,
            };

            formDataToSend.append(
                'application',
                new Blob([JSON.stringify(applicationDto)], {type: 'application/json'})
            );

            // Ajouter les fichiers
            if (cvFile) {
                formDataToSend.append('cv', cvFile);
            }
            if (motivationLetterFile) {
                formDataToSend.append('motivationLetter', motivationLetterFile);
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

            if (isEdit) {
                await axios.put(`${apiUrl}/applications/${id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                await axios.post(`${apiUrl}/applications`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            navigate('/admin/applications');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
            setSubmitting(false);
        }
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
                        <Link to="/admin/applications">Candidatures</Link>
                        <span>/</span>
                        <span>{isEdit ? 'Modifier' : 'Nouvelle'}</span>
                    </div>
                    <h1>{isEdit ? 'Modifier la candidature' : 'Nouvelle candidature'}</h1>
                    <p className="page-subtitle">
                        {isEdit ? 'Modifiez les informations de la candidature' : 'Créez une nouvelle candidature'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2">
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
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                        </div>
                        <div>
                            <h2>Informations générales</h2>
                            <p className="section-description">Sélectionnez le candidat et la publication</p>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="candidateId" className="required">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Candidat
                            </label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <select
                                    id="candidateId"
                                    value={formData.candidateId}
                                    onChange={(e) => setFormData({...formData, candidateId: parseInt(e.target.value)})}
                                    required
                                    disabled={isEdit}
                                    className="form-select"
                                    style={{ flex: 1 }}
                                >
                                    <option value={0}>Sélectionnez un candidat</option>
                                    {candidates.map((candidate) => (
                                        <option key={candidate.id} value={candidate.id}>
                                            {candidate.firstName} {candidate.lastName} - {candidate.email}
                                        </option>
                                    ))}
                                </select>
                                {!isEdit && (
                                    <button
                                        type="button"
                                        onClick={() => setShowCandidateForm(!showCandidateForm)}
                                        className="btn-secondary"
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                        Nouveau candidat
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="publicationId" className="required">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <path
                                        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                </svg>
                                Publication
                            </label>
                            <select
                                id="publicationId"
                                value={formData.publicationId}
                                onChange={(e) => setFormData({...formData, publicationId: parseInt(e.target.value)})}
                                required
                                className="form-select"
                            >
                                <option value={0}>Sélectionnez une publication</option>
                                {publications.map((publication) => (
                                    <option key={publication.id} value={publication.id}>
                                        {publication.title} ({publication.numberOfPositions} poste{publication.numberOfPositions > 1 ? 's' : ''})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isEdit && (
                            <div className="form-group">
                                <label htmlFor="status">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    Statut
                                </label>
                                <select
                                    id="status"
                                    value={formData.status || 'received'}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="form-select"
                                >
                                    <option value="received">Reçue</option>
                                    <option value="document_accepted">Dossier Accepté</option>
                                    <option value="test_scheduled">Test Planifié</option>
                                    <option value="interview_scheduled">Entretien Planifié</option>
                                    <option value="accepted">Acceptée</option>
                                    <option value="rejected">Rejetée</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {showCandidateForm && (
                    <div className="form-section" style={{ backgroundColor: '#f8f9fa', border: '2px solid #007bff' }}>
                        <div className="section-header">
                            <div className="section-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="8.5" cy="7" r="4"></circle>
                                    <line x1="20" y1="8" x2="20" y2="14"></line>
                                    <line x1="23" y1="11" x2="17" y2="11"></line>
                                </svg>
                            </div>
                            <div>
                                <h2>Créer un nouveau candidat</h2>
                                <p className="section-description">Remplissez les informations du candidat</p>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="newFirstName" className="required">Prénom</label>
                                <input
                                    type="text"
                                    id="newFirstName"
                                    value={candidateFormData.firstName}
                                    onChange={(e) => setCandidateFormData({...candidateFormData, firstName: e.target.value})}
                                    placeholder="Prénom"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newLastName" className="required">Nom</label>
                                <input
                                    type="text"
                                    id="newLastName"
                                    value={candidateFormData.lastName}
                                    onChange={(e) => setCandidateFormData({...candidateFormData, lastName: e.target.value})}
                                    placeholder="Nom"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newEmail" className="required">Email</label>
                                <input
                                    type="email"
                                    id="newEmail"
                                    value={candidateFormData.email}
                                    onChange={(e) => setCandidateFormData({...candidateFormData, email: e.target.value})}
                                    placeholder="email@exemple.com"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPhone" className="required">Téléphone</label>
                                <input
                                    type="tel"
                                    id="newPhone"
                                    value={candidateFormData.phone}
                                    onChange={(e) => setCandidateFormData({...candidateFormData, phone: e.target.value})}
                                    placeholder="+261 XX XX XXX XX"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newBirthDate">Date de naissance</label>
                                <input
                                    type="date"
                                    id="newBirthDate"
                                    value={candidateFormData.birthDate}
                                    onChange={(e) => setCandidateFormData({...candidateFormData, birthDate: e.target.value})}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newAddress">Adresse</label>
                                <input
                                    type="text"
                                    id="newAddress"
                                    value={candidateFormData.address}
                                    onChange={(e) => setCandidateFormData({...candidateFormData, address: e.target.value})}
                                    placeholder="Adresse"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newCity">Ville</label>
                                <input
                                    type="text"
                                    id="newCity"
                                    value={candidateFormData.city}
                                    onChange={(e) => setCandidateFormData({...candidateFormData, city: e.target.value})}
                                    placeholder="Ville"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newCountry">Pays</label>
                                <input
                                    type="text"
                                    id="newCountry"
                                    value={candidateFormData.country}
                                    onChange={(e) => setCandidateFormData({...candidateFormData, country: e.target.value})}
                                    placeholder="Pays"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newEducationLevel">Niveau d'éducation</label>
                                <select
                                    id="newEducationLevel"
                                    value={candidateFormData.educationLevel}
                                    onChange={(e) => setCandidateFormData({...candidateFormData, educationLevel: e.target.value})}
                                    className="form-select"
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
                                <label htmlFor="newLastDegree">Dernier diplôme</label>
                                <input
                                    type="text"
                                    id="newLastDegree"
                                    value={candidateFormData.lastDegree}
                                    onChange={(e) => setCandidateFormData({...candidateFormData, lastDegree: e.target.value})}
                                    placeholder="Ex: Master en Informatique"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newYearsExperience">Années d'expérience</label>
                                <input
                                    type="number"
                                    id="newYearsExperience"
                                    value={candidateFormData.yearsExperience}
                                    onChange={(e) => setCandidateFormData({...candidateFormData, yearsExperience: parseInt(e.target.value) || 0})}
                                    placeholder="0"
                                    min="0"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label htmlFor="newSkills">Compétences</label>
                                <textarea
                                    id="newSkills"
                                    value={candidateFormData.skills}
                                    onChange={(e) => setCandidateFormData({...candidateFormData, skills: e.target.value})}
                                    placeholder="Listez les compétences (ex: Java, React, SQL, etc.)"
                                    rows={3}
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button
                                type="button"
                                onClick={() => setShowCandidateForm(false)}
                                className="btn-secondary"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateCandidate}
                                className="btn-primary"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Créer le candidat
                            </button>
                        </div>
                    </div>
                )}

                <div className="form-section">
                    <div className="section-header">
                        <div className="section-icon documents-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                <polyline points="13 2 13 9 20 9"></polyline>
                            </svg>
                        </div>
                        <div>
                            <h2>Documents</h2>
                            <p className="section-description">Téléchargez le CV et la lettre de motivation</p>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group file-upload-group">
                            <label htmlFor="cv" className={!isEdit ? 'required' : ''}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                Curriculum Vitae (PDF)
                            </label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    id="cv"
                                    accept=".pdf"
                                    onChange={handleCvChange}
                                    required={!isEdit}
                                    className="file-input"
                                />
                                <div className="file-upload-display">
                                    {cvFile ? (
                                        <div className="file-selected">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <span>{cvFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="file-placeholder">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="17 8 12 3 7 8"></polyline>
                                                <line x1="12" y1="3" x2="12" y2="15"></line>
                                            </svg>
                                            <span>Cliquez pour télécharger ou glissez-déposez</span>
                                            <span className="file-info">PDF uniquement</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-group file-upload-group">
                            <label htmlFor="motivationLetter" className={!isEdit ? 'required' : ''}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <path
                                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                Lettre de Motivation (PDF/DOCX)
                            </label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    id="motivationLetter"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleMotivationLetterChange}
                                    required={!isEdit}
                                    className="file-input"
                                />
                                <div className="file-upload-display">
                                    {motivationLetterFile ? (
                                        <div className="file-selected">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <span>{motivationLetterFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="file-placeholder">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="17 8 12 3 7 8"></polyline>
                                                <line x1="12" y1="3" x2="12" y2="15"></line>
                                            </svg>
                                            <span>Cliquez pour télécharger ou glissez-déposez</span>
                                            <span className="file-info">PDF ou DOCX</span>
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
                        onClick={() => navigate('/admin/applications')}
                        className="btn-secondary"
                        disabled={submitting}
                    >
                        Annuler
                    </button>
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? (
                            <>
                                <div className="spinner-small"></div>
                                Sauvegarde...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                {isEdit ? 'Mettre à jour' : 'Créer la candidature'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

