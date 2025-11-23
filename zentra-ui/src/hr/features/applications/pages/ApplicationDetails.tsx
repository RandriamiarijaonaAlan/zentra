import {useState, useEffect} from 'react';
import {Link, useParams, useNavigate} from 'react-router-dom';
import {get, del, post, downloadFile} from '../../../services/api.ts';
import type {ApplicationDto, PublicationDto, QcmListItemDto, ScoreDto} from '../../../types';
import '../styles/ApplicationDetails.css';

export default function ApplicationDetails() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [application, setApplication] = useState<ApplicationDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [publication, setPublication] = useState<PublicationDto | null>(null);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [documentScore, setDocumentScore] = useState<number>(0);
    const [scoreError, setScoreError] = useState('');
    const [showQcmModal, setShowQcmModal] = useState(false);
    const [qcms, setQcms] = useState<QcmListItemDto[]>([]);
    const [selectedQcmId, setSelectedQcmId] = useState<number | null>(null);
    const [qcmError, setQcmError] = useState('');
    const [score, setScore] = useState<ScoreDto | null>(null);

    useEffect(() => {
        if (id) {
            loadApplication(id);
        }
    }, [id]);

    const loadApplication = async (appId: string) => {
        try {
            const data = await get<ApplicationDto>(`/applications/${appId}`);
            setApplication(data);
            const pub = await get<PublicationDto>(`/publications/${data.publicationId}`);
            setPublication(pub);

            // Charger le score du candidat
            try {
                const scoreData = await get<ScoreDto>(`/applications/${appId}/score`);
                setScore(scoreData);
            } catch (scoreErr) {
                console.log('Aucun score disponible pour cette candidature');
                setScore(null);
            }

            setLoading(false);
        } catch (err: any) {
            setError('Impossible de charger la candidature');
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            await del(`/applications/${id}`);
            navigate('/admin/applications');
        } catch (err: any) {
            setError('Impossible de supprimer la candidature');
        }
    };

    const handleScoreSubmit = async () => {
        console.log("handleScoreSubmit called");
        console.log("application.candidate?.id:", application?.candidate?.id);
        console.log("documentScore:", documentScore);

        if (!application?.id) {
            console.log("No candidateId, returning");
            setScoreError('ID candidat manquant');
            return;
        }

        setScoreError('');

        if (documentScore < 0 || documentScore > 20) {
            setScoreError('La note doit être entre 0 et 20');
            return;
        }

        try {
            console.log("Sending POST request to /applications/document-score");
            console.log("Payload:", { candidateId: application?.candidate?.id, documentScore: documentScore });

            await post('/applications/document-score', {
                applicationId: application.id,
                documentScore: documentScore
            });

            console.log("Score saved successfully");
            setShowScoreModal(false);
            setDocumentScore(0);
            // Recharger la candidature pour voir les changements éventuels
            if (id) {
                await loadApplication(id);
            }
            alert('Note enregistrée avec succès');
        } catch (err: any) {
            console.error("Error saving score:", err);
            setScoreError('Erreur lors de l\'enregistrement de la note: ' + (err.message || 'Erreur inconnue'));
        }
    };

    const loadQcms = async () => {
        try {
            const data = await get<QcmListItemDto[]>('/qcms');
            setQcms(data);
        } catch (err: any) {
            setQcmError('Impossible de charger la liste des QCMs');
        }
    };

    const handleQcmModalOpen = async () => {
        setShowQcmModal(true);
        await loadQcms();
    };

    const handleQcmAssign = async () => {
        if (!application?.candidate?.id || !selectedQcmId) {
            setQcmError('Veuillez sélectionner un QCM');
            return;
        }

        setQcmError('');

        try {
            await post('/applications/assign-qcm', {
                applicationId: application.id,
                qcmId: selectedQcmId
            });
            setShowQcmModal(false);
            setSelectedQcmId(null);
            // Recharger la candidature pour voir les changements éventuels
            if (id) {
                await loadApplication(id);
            }
            alert('QCM assigné avec succès');
        } catch (err: any) {
            setQcmError('Erreur lors de l\'assignation du QCM');
        }
    };

    const handleAcceptApplication = async () => {
        if (!id) return;

        try {
            await post(`/applications/${id}/accept`);
            // Recharger la candidature pour voir les changements
            await loadApplication(id);
            alert('Candidature acceptée avec succès');
        } catch (err: any) {
            setError('Erreur lors de l\'acceptation de la candidature');
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'received':
                return 'badge-info';
            case 'rejected':
                return 'badge-danger';
            case 'document_accepted':
                return 'badge-primary';
            case 'test_scheduled':
                return 'badge-warning';
            case 'interview_scheduled':
                return 'badge-warning';
            case 'accepted':
                return 'badge-success';
            default:
                return 'badge-default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'received':
                return 'Reçue';
            case 'rejected':
                return 'Rejetée';
            case 'document_accepted':
                return 'Dossier Accepté';
            case 'test_scheduled':
                return 'Test Planifié';
            case 'interview_scheduled':
                return 'Entretien Planifié';
            case 'accepted':
                return 'Acceptée';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Chargement de la candidature...</p>
                </div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="admin-page">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h2>{error || 'Candidature introuvable'}</h2>
                    <Link to="/admin/applications" className="btn-primary">
                        Retour à la liste
                    </Link>
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
                        <span>
              {application.candidate?.firstName} {application.candidate?.lastName}
            </span>
                    </div>
                    <h1>Détails de la candidature</h1>
                    <p className="page-subtitle">
                        Candidature pour {publication?.title}
                    </p>
                </div>
                <div className="header-actions">
                    {application.status === 'received' && (
                        <button onClick={() => setShowScoreModal(true)} className="btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2">
                                <path
                                    d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                                <rect x="9" y="3" width="6" height="4" rx="1"></rect>
                                <path d="M9 12l2 2 4-4"></path>
                            </svg>
                            Évaluer
                        </button>
                    )}

                    {application.status === 'document_accepted' && (
                        <button onClick={handleQcmModalOpen} className="btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                            Assigner QCM
                        </button>
                    )}

                    {application.status === 'test_scheduled' && (
                        <Link
                            to={`/admin/interviews/new?candidateId=${application.candidate?.id}&applicationId=${application.id}`}
                            className="btn-primary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Planifier Entretien
                        </Link>
                    )}

                    {application.status === 'interview_scheduled' && (
                        <button onClick={handleAcceptApplication} className="btn-success">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Accepter
                        </button>
                    )}

                    <Link to={`/admin/applications/${application.id}/edit`} className="btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Modifier
                    </Link>
                    {deleteConfirm ? (
                        <div className="delete-confirm-group">
                            <button onClick={handleDelete} className="btn-danger">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Confirmer
                            </button>
                            <button onClick={() => setDeleteConfirm(false)} className="btn-secondary">
                                Annuler
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setDeleteConfirm(true)} className="btn-danger">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path
                                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Supprimer
                        </button>
                    )}
                </div>
            </div>

            <div className="details-grid">
                {/* Informations de candidature */}
                <div className="details-section">
                    <h2>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        Informations sur la candidature
                    </h2>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </div>
                            <div className="info-content">
                                <span className="info-label">Date de candidature</span>
                                <span className="info-value">
                  {new Date(application.appliedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                  })}
                </span>
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <div className="info-content">
                                <span className="info-label">Statut</span>
                                <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                  {getStatusLabel(application.status)}
                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informations du candidat */}
                {application.candidate && (
                    <div className="details-section candidate-section">
                        <h2>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Informations du candidat
                        </h2>
                        <div className="candidate-card">
                            <div className="candidate-avatar-large">
                                {application.candidate.firstName.charAt(0)}{application.candidate.lastName.charAt(0)}
                            </div>
                            <div className="candidate-details">
                                <h3>{application.candidate.firstName} {application.candidate.lastName}</h3>
                                <div className="candidate-contact">
                                    <div className="contact-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2">
                                            <path
                                                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                        <a href={`mailto:${application.candidate.email}`}>{application.candidate.email}</a>
                                    </div>
                                    <div className="contact-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2">
                                            <path
                                                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                        </svg>
                                        <span>{application.candidate.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scores du candidat */}
                {score && (score.documentScore !== undefined || score.qcmScore !== undefined || score.interviewScore !== undefined || score.finalScore !== undefined) && (
                    <div className="details-section">
                        <h2>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2">
                                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                                <rect x="9" y="3" width="6" height="4" rx="1"></rect>
                                <path d="M9 12l2 2 4-4"></path>
                            </svg>
                            Évaluation du candidat
                        </h2>
                        <div className="info-grid">
                            {score.documentScore !== undefined && (
                                <div className="info-card">
                                    <div className="info-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                        </svg>
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">Note Dossier</span>
                                        <span className="info-value">{score.documentScore.toFixed(2)} / 20</span>
                                    </div>
                                </div>
                            )}
                            {score.qcmScore !== undefined && (
                                <div className="info-card">
                                    <div className="info-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                        </svg>
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">Note QCM</span>
                                        <span className="info-value">{score.qcmScore.toFixed(2)} / 20</span>
                                    </div>
                                </div>
                            )}
                            {score.interviewScore !== undefined && (
                                <div className="info-card">
                                    <div className="info-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">Note Entretien</span>
                                        <span className="info-value">{score.interviewScore.toFixed(2)} / 20</span>
                                    </div>
                                </div>
                            )}
                            {score.finalScore !== undefined && (
                                <div className="info-card">
                                    <div className="info-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                        </svg>
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">Note Finale</span>
                                        <span className="info-value" style={{fontWeight: 'bold', fontSize: '1.2em'}}>{score.finalScore.toFixed(2)} / 20</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Informations de la publication */}
                {publication && (
                    <div className="details-section">
                        <h2>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2">
                                <path
                                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            </svg>
                            Publication associée
                        </h2>
                        <div className="publication-details">
                            <h3>{publication.title}</h3>
                            <p className="publication-description">{publication.description}</p>
                            <div className="publication-info-grid">
                                <div className="publication-info-item">
                                    <span className="publication-info-label">Postes disponibles</span>
                                    <span className="publication-info-value">{publication.numberOfPositions}</span>
                                </div>
                                <div className="publication-info-item">
                                    <span className="publication-info-label">Date de publication</span>
                                    <span className="publication-info-value">
                    {new Date(publication.publishedDate).toLocaleDateString('fr-FR')}
                  </span>
                                </div>
                                {publication.closingDate && (
                                    <div className="publication-info-item">
                                        <span className="publication-info-label">Date de clôture</span>
                                        <span className="publication-info-value">
                      {new Date(publication.closingDate).toLocaleDateString('fr-FR')}
                    </span>
                                    </div>
                                )}
                                <div className="publication-info-item">
                                    <span className="publication-info-label">Statut</span>
                                    <span
                                        className={`status-badge ${publication.status === 'ACTIVE' ? 'badge-success' : 'badge-default'}`}>
                    {publication.status}
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Documents */}
                <div className="details-section documents-section">
                    <h2>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                        Documents joints
                    </h2>
                    <div className="documents-grid">
                        {application.candidate?.cvFile && (
                            <div className="document-card">
                                <div className="document-icon cv-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                                <div className="document-info">
                                    <h4>Curriculum Vitae</h4>
                                    <p className="document-type">PDF</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (application.candidate?.cvFile) {
                                            try {
                                                await downloadFile(
                                                    application.candidate.cvFile,
                                                    `CV_${application.candidate.firstName}_${application.candidate.lastName}.pdf`
                                                );
                                            } catch (err) {
                                                alert('Erreur lors du téléchargement du fichier');
                                            }
                                        }
                                    }}
                                    className="btn-download"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    Télécharger
                                </button>
                            </div>
                        )}
                        {application.candidate?.motivationalLetterFile && (
                            <div className="document-card">
                                <div className="document-icon letter-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2">
                                        <path
                                            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                </div>
                                <div className="document-info">
                                    <h4>Lettre de Motivation</h4>
                                    <p className="document-type">PDF / DOCX</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (application.candidate?.motivationalLetterFile) {
                                            try {
                                                await downloadFile(
                                                    application.candidate.motivationalLetterFile,
                                                    `LettreMotivation_${application.candidate.firstName}_${application.candidate.lastName}.pdf`
                                                );
                                            } catch (err) {
                                                alert('Erreur lors du téléchargement du fichier');
                                            }
                                        }
                                    }}
                                    className="btn-download"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    Télécharger
                                </button>
                            </div>
                        )}
                        {!application.candidate?.cvFile && !application.candidate?.motivationalLetterFile && (
                            <div className="no-documents">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                    <polyline points="13 2 13 9 20 9"></polyline>
                                </svg>
                                <p>Aucun document joint</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal d'évaluation */}
            {showScoreModal && (
                <div className="modal-overlay" onClick={() => setShowScoreModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Évaluer le dossier</h2>
                            <button className="modal-close" onClick={() => setShowScoreModal(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="documentScore">
                                    Note du dossier (sur 20)
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="documentScore"
                                    value={documentScore}
                                    onChange={(e) => setDocumentScore(Number(e.target.value))}
                                    min="0"
                                    max="20"
                                    step="0.5"
                                    className="form-input"
                                    placeholder="Entrez une note entre 0 et 20"
                                />
                                <p className="form-help">Évaluez la qualité du CV et de la lettre de motivation</p>
                            </div>
                            {scoreError && (
                                <div className="error-message">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    {scoreError}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowScoreModal(false)} className="btn-secondary">
                                Annuler
                            </button>
                            <button onClick={handleScoreSubmit} className="btn-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Enregistrer la note
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'assignation de QCM */}
            {showQcmModal && (
                <div className="modal-overlay" onClick={() => setShowQcmModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Assigner un QCM</h2>
                            <button className="modal-close" onClick={() => setShowQcmModal(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="qcmSelect">
                                    Sélectionner un QCM
                                    <span className="required">*</span>
                                </label>
                                <select
                                    id="qcmSelect"
                                    value={selectedQcmId || ''}
                                    onChange={(e) => setSelectedQcmId(Number(e.target.value))}
                                    className="form-select"
                                >
                                    <option value="">-- Choisir un QCM --</option>
                                    {qcms.map((qcm) => (
                                        <option key={qcm.id} value={qcm.id}>
                                            {qcm.title} ({qcm.durationMinutes} min - {qcm.questionsCount} questions)
                                        </option>
                                    ))}
                                </select>
                                <p className="form-help">Le candidat recevra ce QCM à compléter</p>
                            </div>
                            {qcmError && (
                                <div className="error-message">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    {qcmError}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowQcmModal(false)} className="btn-secondary">
                                Annuler
                            </button>
                            <button onClick={handleQcmAssign} className="btn-primary" disabled={!selectedQcmId}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Assigner le QCM
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

