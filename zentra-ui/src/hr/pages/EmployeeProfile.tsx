import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getEmployee } from '../services/hrApi';
import type { EmployeeDto } from '../types/employee';
import { ContractManager } from '../components/ContractManager';
import { JobHistoryManager } from '../components/JobHistoryManager';
import { HRDocumentManager } from '../components/HRDocumentManager';
import '../../styles/HRPages.css';

const EmployeeProfile: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [employee, setEmployee] = useState<EmployeeDto | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer l'onglet depuis l'URL ou utiliser 'profile' par défaut
  const tabFromUrl = searchParams.get('tab') as 'profile' | 'contracts' | 'history' | 'documents' | null;
  const [activeTab, setActiveTab] = useState<'profile' | 'contracts' | 'history' | 'documents'>(
    tabFromUrl || 'profile'
  );

  useEffect(() => {
    const loadEmployee = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getEmployee(Number(id));
        setEmployee(data);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'employé:', error);
        setError('Impossible de charger le profil de l\'employé. Vérifiez votre connexion au backend.');
      } finally {
        setLoading(false);
      }
    };
    loadEmployee();
  }, [id]);

  // Synchroniser l'onglet avec l'URL
  useEffect(() => {
    const tab = searchParams.get('tab') as 'profile' | 'contracts' | 'history' | 'documents' | null;
    if (tab && ['profile', 'contracts', 'history', 'documents'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="hr-page">
        <div className="hr-container">
          <div className="hr-loading">
            <div className="hr-loading-spinner"></div>
            Chargement du profil...
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee?.id) {
    return (
      <div className="hr-page">
        <div className="hr-container">
          <div className="hr-empty">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
            <h3>Employé non trouvé</h3>
            <p>{error || 'Cet employé n\'existe pas'}</p>
            <Link to="/admin/hr/employees" className="quick-action-btn">
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isActive = !employee.contractEndDate || new Date(employee.contractEndDate) > new Date();

  return (
    <div className="hr-page">
      <div className="hr-container">
        {/* En-tête du profil */}
        <div className="hr-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {employee.photoUrl && (
              <img
                src={employee.photoUrl}
                alt={`${employee.firstName} ${employee.lastName}`}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #e0e0e0'
                }}
              />
            )}
            <div>
              <h1 className="hr-title">
                👤 {employee.firstName} {employee.lastName}
              </h1>
              <p className="hr-subtitle">
                {employee.jobTitle || 'Poste non défini'}
                {employee.employeeNumber && ` • #${employee.employeeNumber}`}
              </p>
              <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                {isActive ? '✅ Actif' : '❌ Inactif'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="hr-quick-actions">
          <Link to="/admin/hr/employees" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Retour à la liste
          </Link>
          <Link to={`/admin/hr/employees/${employee.id}/edit`} className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Modifier
          </Link>
        </div>

        {/* Onglets */}
        <div style={{ borderBottom: '2px solid #e0e0e0', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '0' }}>
            {[
              { key: 'profile' as const, label: '👤 Profil', icon: '👤' },
              { key: 'contracts' as const, label: '📋 Contrats', icon: '📋' },
              { key: 'history' as const, label: '🔄 Historique', icon: '🔄' },
              { key: 'documents' as const, label: '📁 Documents', icon: '📁' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  background: activeTab === tab.key ? '#3498db' : 'transparent',
                  color: activeTab === tab.key ? 'white' : '#7f8c8d',
                  borderBottom: activeTab === tab.key ? '3px solid #3498db' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'profile' && (
          <div className="hr-cards-grid">
            <div className="hr-card">
              <h3 className="hr-card-title">📧 Contact</h3>
              <div className="hr-card-stats">
                <div className="hr-stat">
                  <span className="hr-stat-label">Email</span>
                  <span className="hr-stat-value">{employee.workEmail}</span>
                </div>
                {employee.workPhone && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Téléphone</span>
                    <span className="hr-stat-value">{employee.workPhone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="hr-card">
              <h3 className="hr-card-title">🏠 Adresse</h3>
              <div className="hr-card-stats">
                {employee.address && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Adresse</span>
                    <span className="hr-stat-value">{employee.address}</span>
                  </div>
                )}
                <div className="hr-stat">
                  <span className="hr-stat-label">Ville</span>
                  <span className="hr-stat-value">{employee.city || '-'}</span>
                </div>
                <div className="hr-stat">
                  <span className="hr-stat-label">Pays</span>
                  <span className="hr-stat-value">{employee.country || '-'}</span>
                </div>
              </div>
            </div>

            <div className="hr-card">
              <h3 className="hr-card-title">📅 Informations personnelles</h3>
              <div className="hr-card-stats">
                {employee.birthDate && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Date de naissance</span>
                    <span className="hr-stat-value">
                      {new Date(employee.birthDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {employee.gender && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Genre</span>
                    <span className="hr-stat-value">
                      {employee.gender === 'M' ? 'Masculin' :
                       employee.gender === 'F' ? 'Féminin' : 'Autre'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="hr-card">
              <h3 className="hr-card-title">💼 Informations professionnelles</h3>
              <div className="hr-card-stats">
                {employee.hireDate && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Date d'embauche</span>
                    <span className="hr-stat-value">
                      {new Date(employee.hireDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {employee.contractEndDate && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">Fin de contrat</span>
                    <span className="hr-stat-value">
                      {new Date(employee.contractEndDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {employee.jobId && (
                  <div className="hr-stat">
                    <span className="hr-stat-label">ID Poste</span>
                    <span className="hr-stat-value">{employee.jobId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contracts' && (
          <ContractManager employeeId={employee.id} />
        )}

        {activeTab === 'history' && (
          <JobHistoryManager employeeId={employee.id} />
        )}

        {activeTab === 'documents' && (
          <HRDocumentManager employeeId={employee.id} />
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
