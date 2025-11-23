import React, { useEffect, useState } from 'react';
import type { HRDocumentDto } from '../../../types/hrDocument.ts';
import { uploadHRDocumentFile, listHRDocuments, deleteHRDocument, buildFileDownloadUrl } from '../../../services/hrApi.ts';
import '../styles/HRPages.css';

interface Props { employeeId: number; }

export const HRDocumentManager: React.FC<Props> = ({ employeeId }) => {
  const [docs, setDocs] = useState<HRDocumentDto[]>([]);
  const [docType, setDocType] = useState('CIN');
  const [file, setFile] = useState<File | undefined>();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [visibleToEmployee, setVisibleToEmployee] = useState(true);

  const load = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await listHRDocuments(employeeId);
      setDocs(data);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      setError('Impossible de charger les documents. Vérifiez votre connexion au backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [employeeId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    try {
      setUploading(true);
      await uploadHRDocumentFile(employeeId, docType, file);
      setDocType('CIN');
      setFile(undefined);
      setExpiryDate('');
      setVisibleToEmployee(true);
      setShowUploadForm(false);
      await load();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors du téléversement du document. Vérifiez votre connexion au backend.');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id?: number) => {
    if (!id || !confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    try {
      await deleteHRDocument(id);
      await load();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du document. Vérifiez votre connexion au backend.');
    }
  };

  const getDocumentIcon = (type: string): string => {
    switch (type) {
      case 'CIN': return '🆔';
      case 'PASSEPORT': return '📘';
      case 'DIPLOME': return '🎓';
      case 'ATTESTATION': return '📄';
      case 'CV': return '📋';
      case 'CERTIFICAT': return '🏆';
      case 'CONTRAT': return '📝';
      default: return '📁';
    }
  };

  const getDocumentTypeName = (type: string): string => {
    const types: Record<string, string> = {
      'CIN': 'Carte d\'identité',
      'PASSEPORT': 'Passeport',
      'DIPLOME': 'Diplôme',
      'ATTESTATION': 'Attestation',
      'CV': 'Curriculum Vitae',
      'CERTIFICAT': 'Certificat',
      'CONTRAT': 'Contrat signé',
      'AUTRES': 'Autres'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="hr-container">
        <div className="hr-loading">
          <div className="hr-loading-spinner"></div>
          Chargement des documents...
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
          📁 Documents RH
        </h2>
        <div className="hr-quick-actions">
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="quick-action-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Télécharger un document
          </button>
        </div>
      </div>

      {showUploadForm && (
        <form onSubmit={submit} className="hr-container" style={{ marginBottom: '24px', border: '2px solid #27ae60' }}>
          <div className="hr-header">
            <h3 className="hr-title">
              📤 Nouveau document
            </h3>
          </div>

          <div className="form-section">
            <div className="section-title">
              📄 Informations du document
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type de document</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="CIN">🆔 Carte d'identité</option>
                  <option value="PASSEPORT">📘 Passeport</option>
                  <option value="DIPLOME">🎓 Diplôme</option>
                  <option value="ATTESTATION">📄 Attestation</option>
                  <option value="CV">📋 Curriculum Vitae</option>
                  <option value="CERTIFICAT">🏆 Certificat</option>
                  <option value="CONTRAT">📝 Contrat signé</option>
                  <option value="AUTRES">📁 Autres</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fichier</label>
                <input
                  type="file"
                  onChange={e => setFile(e.target.files?.[0])}
                  className="form-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  required
                />
                {file && (
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>
                    📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date d'expiration (optionnelle)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Visibilité</label>
                <select
                  value={visibleToEmployee ? 'true' : 'false'}
                  onChange={e => setVisibleToEmployee(e.target.value === 'true')}
                  className="form-input"
                >
                  <option value="true">👁️ Visible à l'employé</option>
                  <option value="false">🙈 Confidentiel (RH seulement)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => {
                setShowUploadForm(false);
                setFile(undefined);
                setExpiryDate('');
                setVisibleToEmployee(true);
              }}
              className="btn-secondary"
              disabled={uploading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading || !file}
            >
              {uploading && <div className="loading-spinner"></div>}
              {uploading ? 'Téléchargement...' : 'Télécharger'}
            </button>
          </div>
        </form>
      )}

      {docs.length === 0 ? (
        <div className="hr-empty">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <h3>Aucun document</h3>
          <p>Aucun document n'a encore été téléchargé pour cet employé</p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="quick-action-btn"
          >
            Télécharger le premier document
          </button>
        </div>
      ) : (
        <div className="hr-cards-grid">
          {docs.map(doc => (
            <div key={doc.id} className="hr-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '32px' }}>
                    {getDocumentIcon(doc.docType || '')}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', color: '#2c3e50', fontSize: '16px' }}>
                      {getDocumentTypeName(doc.docType || '')}
                    </h3>
                    {doc.filePath && (
                      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                        📎 {doc.filePath.split('/').pop() || 'Fichier'}
                      </div>
                    )}
                  </div>
                </div>
                <span className="status-badge active">
                  ✅ Disponible
                </span>
              </div>

              <div className="hr-card-stats">
                {doc.uploadedAt && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Téléchargé le</span>
                    <span className="hr-stat-value">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {doc.expiryDate && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Date d'expiration</span>
                    <span className="hr-stat-value">
                      {new Date(doc.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {doc.visibleToEmployee !== undefined && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Visible employé</span>
                    <span className="hr-stat-value">
                      {doc.visibleToEmployee ? '👁️ Oui' : '🙈 Non'}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                {doc.filePath && (
                  <a
                    href={buildFileDownloadUrl(doc.filePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quick-action-btn"
                    style={{
                      flex: 1,
                      fontSize: '14px',
                      textDecoration: 'none',
                      textAlign: 'center'
                    }}
                  >
                    👁️ Voir
                  </a>
                )}
                <button
                  onClick={() => remove(doc.id)}
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

