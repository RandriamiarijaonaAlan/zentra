import React, { useState, useEffect } from 'react';
import { getDocumentRequests, createDocumentRequest } from '../services/selfService';
import type { DocumentRequest } from '../types/selfService.ts';
import '../styles/DocumentRequestsPage.css';

const DocumentRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<DocumentRequest>({
    type: 'WORK_CERTIFICATE',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const documentTypes = [
    { value: 'WORK_CERTIFICATE', label: 'Attestation de travail' },
    { value: 'SALARY_CERTIFICATE', label: 'Attestation de salaire' },
    { value: 'TAX_CERTIFICATE', label: 'Attestation fiscale' },
    { value: 'EMPLOYMENT_CONTRACT', label: 'Contrat de travail' },
  ];

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getDocumentRequests();
      setRequests(data);
    } catch (err) {
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await createDocumentRequest(formData);
      setShowForm(false);
      setFormData({ type: 'WORK_CERTIFICATE', reason: '' });
      await loadRequests();
    } catch (err) {
      setError('Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'badge-warning',
      IN_PROGRESS: 'badge-info',
      READY: 'badge-success',
      DELIVERED: 'badge-success',
      CANCELLED: 'badge-secondary',
    };
    return badges[status] || 'badge-secondary';
  };

  const handleDownload = (request: DocumentRequest) => {
    if (request.filePath) {
      window.open(`http://localhost:8080${request.filePath}`, '_blank');
    }
  };

  return (
    <div className="document-requests-page">
      <h1>Demandes d'Attestations</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="section-header">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Annuler' : '+ Nouvelle Demande'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="document-request-form">
          <div className="form-group">
            <label>Type de document *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              required
            >
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Motif de la demande</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              placeholder="Ex: Pour demande de visa, dossier bancaire, etc."
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Envoi...' : 'Soumettre la demande'}
          </button>
        </form>
      )}

      <div className="requests-list">
        {loading && requests.length === 0 ? (
          <div className="loading">Chargement...</div>
        ) : requests.length === 0 ? (
          <p className="no-data">Aucune demande d'attestation</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Date de demande</th>
                <th>Statut</th>
                <th>Motif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const docType = documentTypes.find((t) => t.value === req.type);
                return (
                  <tr key={req.id}>
                    <td>{docType?.label || req.type}</td>
                    <td>{new Date(req.requestedAt!).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(req.status || '')}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>{req.reason || '-'}</td>
                    <td>
                      {(req.status === 'READY' || req.status === 'DELIVERED') && req.filePath && (
                        <button
                          onClick={() => handleDownload(req)}
                          className="btn-small btn-primary"
                        >
                          📥 Télécharger
                        </button>
                      )}
                      {req.status === 'PENDING' && (
                        <span className="text-muted">En attente</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DocumentRequestsPage;
