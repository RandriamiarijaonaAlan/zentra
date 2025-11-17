import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listEmployees, uploadHRDocumentFile } from '../services/hrApi';
import type { EmployeeDto } from '../types/employee';
import '../../styles/HRPages.css';

const UploadDocumentPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
  const [docType, setDocType] = useState('CIN');
  const [file, setFile] = useState<File | undefined>();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const data = await listEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Erreur lors du chargement des employés:', error);
        setError('Impossible de charger la liste des employés. Vérifiez votre connexion au backend.');
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedEmployeeId) {
      setError('Veuillez sélectionner un employé');
      return;
    }

    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    try {
      setUploading(true);
      await uploadHRDocumentFile(Number(selectedEmployeeId), docType, file);
      setSuccess('Document téléchargé avec succès !');
      setSelectedEmployeeId('');
      setDocType('CIN');
      setFile(undefined);
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setError('Erreur lors du téléchargement du document. Vérifiez votre connexion au backend.');
    } finally {
      setUploading(false);
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
      <div className="hr-page">
        <div className="hr-container">
          <div className="hr-loading">
            <div className="hr-loading-spinner"></div>
            Chargement des employés...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hr-page">
      <div className="hr-container">
        <div className="hr-header">
          <h1 className="hr-title">
            📤 Télécharger un document RH
          </h1>
          <p className="hr-subtitle">
            Ajouter un document pour un employé
          </p>
        </div>

        <div className="hr-quick-actions">
          <Link to="/admin/hr" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Retour au dashboard
          </Link>
          <Link to="/admin/hr/employees" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
            </svg>
            Liste des employés
          </Link>
        </div>

        {error && (
          <div style={{
            background: '#fee',
            color: '#e74c3c',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #e74c3c',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #c3e6cb',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.47 0 2.85.35 4.07.98"></path>
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="hr-container" style={{ border: '2px solid #27ae60' }}>
          <div className="hr-header">
            <h3 className="hr-title">
              📋 Informations du document
            </h3>
          </div>

          <div className="form-section">
            <div className="section-title">
              👤 Sélection de l'employé
            </div>

            <div className="form-group">
              <label className="form-label">
                Employé <span className="required">*</span>
              </label>
              <select
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(Number(e.target.value) || '')}
                className="form-input"
                required
              >
                <option value="">Sélectionnez un employé</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.workEmail}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">
              📄 Détails du document
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Type de document <span className="required">*</span>
                </label>
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
                <label className="form-label">
                  Fichier <span className="required">*</span>
                </label>
                <input
                  id="file"
                  type="file"
                  onChange={e => setFile(e.target.files?.[0])}
                  className="form-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  required
                />
                <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>
                  Formats acceptés : PDF, DOC, DOCX, JPG, PNG, GIF (max 10MB)
                </div>
              </div>
            </div>

            {file && (
              <div style={{
                background: '#f8f9fa',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '16px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px' }}>📎</div>
                  <div>
                    <div style={{ fontWeight: '500', color: '#2c3e50' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                      {(file.size / 1024).toFixed(1)} KB • {getDocumentTypeName(docType)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => {
                setSelectedEmployeeId('');
                setDocType('CIN');
                setFile(undefined);
                setError(null);
                setSuccess(null);
                const fileInput = document.getElementById('file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
              }}
              className="btn-secondary"
              disabled={uploading}
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading || !file || !selectedEmployeeId}
            >
              {uploading && <div className="loading-spinner"></div>}
              {uploading ? 'Téléchargement...' : 'Télécharger le document'}
            </button>
          </div>
        </form>

        {employees.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ marginBottom: '16px', color: '#2c3e50' }}>
              💡 Conseil
            </h3>
            <div style={{
              background: '#e8f4fd',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #b3d9ff'
            }}>
              <p style={{ margin: 0, color: '#1976d2' }}>
                Vous pouvez également télécharger des documents directement depuis le profil d'un employé
                en utilisant l'onglet "Documents" dans la page de profil.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadDocumentPage;
