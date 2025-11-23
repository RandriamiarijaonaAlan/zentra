import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get, del } from '../../../services/api.ts';
import type {ApplicationDto} from '../../../types';
import '../styles/ApplicationList.css';

export default function ApplicationList() {
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await get<ApplicationDto[]>('/applications');
      setApplications(data);
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger les candidatures');
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await del(`/applications/${id}`);
      setApplications(applications.filter((app) => app.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError('Impossible de supprimer la candidature');
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

  const filteredApplications = filter === 'ALL' 
    ? applications 
    : applications.filter(app => app.status === filter);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Candidatures</h1>
          <p className="page-subtitle">Gérez toutes les candidatures reçues</p>
        </div>
        <Link to="/admin/applications/new/edit" className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nouvelle Candidature
        </Link>
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

      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          Toutes
          <span className="filter-count">{applications.length}</span>
        </button>
        <button 
          className={`filter-btn ${filter === 'received' ? 'active' : ''}`}
          onClick={() => setFilter('received')}
        >
          Reçues
          <span className="filter-count">{applications.filter(a => a.status === 'received').length}</span>
        </button>
        <button 
          className={`filter-btn ${filter === 'document_accepted' ? 'active' : ''}`}
          onClick={() => setFilter('document_accepted')}
        >
          Dossiers Acceptés
          <span className="filter-count">{applications.filter(a => a.status === 'document_accepted').length}</span>
        </button>
        <button
          className={`filter-btn ${filter === 'test_scheduled' ? 'active' : ''}`}
          onClick={() => setFilter('test_scheduled')}
        >
          Tests Planifiés
          <span className="filter-count">{applications.filter(a => a.status === 'test_scheduled').length}</span>
        </button>
        <button
          className={`filter-btn ${filter === 'interview_scheduled' ? 'active' : ''}`}
          onClick={() => setFilter('interview_scheduled')}
        >
          Entretiens Planifiés
          <span className="filter-count">{applications.filter(a => a.status === 'interview_scheduled').length}</span>
        </button>
        <button 
          className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Acceptées
          <span className="filter-count">{applications.filter(a => a.status === 'accepted').length}</span>
        </button>
        <button 
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejetées
          <span className="filter-count">{applications.filter(a => a.status === 'rejected').length}</span>
        </button>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <h2>Aucune candidature</h2>
          <p>{filter === 'ALL' ? 'Aucune candidature disponible pour le moment' : `Aucune candidature ${getStatusLabel(filter).toLowerCase()}`}</p>
        </div>
      ) : (
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Candidat</th>
                <th>Email</th>
                <th>Publication</th>
                <th>Date de candidature</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id} className="application-row">
                  <td>
                    <div className="candidate-info">
                      <div className="candidate-avatar">
                        {app.candidate?.firstName[0]}{app.candidate?.lastName[0]}
                      </div>
                      <div className="candidate-name">
                        {app.candidate?.firstName} {app.candidate?.lastName}
                      </div>
                    </div>
                  </td>
                  <td className="email-cell">{app.candidate?.email}</td>
                  <td className="publication-cell">
                    <div className="publication-title">{app.publicationId}</div>
                  </td>
                  <td className="date-cell">
                    {new Date(app.appliedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/admin/applications/${app.id}`)}
                        className="btn-icon btn-view"
                        title="Voir les détails"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button
                        onClick={() => navigate(`/admin/applications/${app.id}/edit`)}
                        className="btn-icon btn-edit"
                        title="Modifier"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      {deleteConfirm === app.id ? (
                        <div className="confirm-delete">
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="btn-icon btn-danger"
                            title="Confirmer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="btn-icon"
                            title="Annuler"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(app.id)}
                          className="btn-icon btn-delete"
                          title="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

