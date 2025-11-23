import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listEmployees } from '../services/hrApi';
import type { EmployeeDto } from '../types/employee';
import '../features/documents/styles/HRPages.css';

const JobHistoryPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
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

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.employeeNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (error) {
    return (
      <div className="hr-page">
        <div className="hr-container">
          <div className="hr-header">
            <h1 className="hr-title">
              🔄 Historique des postes
            </h1>
          </div>
          <div className="hr-empty">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <h3>Erreur de connexion</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="quick-action-btn">
              Réessayer
            </button>
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
            🔄 Historique des postes
          </h1>
          <p className="hr-subtitle">
            Consulter l'évolution de carrière de vos employés
          </p>
        </div>

        <div className="hr-quick-actions">
          <Link to="/admin/hr" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Retour au dashboard
          </Link>
          <input
            className="form-input"
            style={{ maxWidth: '300px' }}
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="hr-empty">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <h3>{searchTerm ? 'Aucun résultat' : 'Aucun employé'}</h3>
            <p>
              {searchTerm
                ? `Aucun employé trouvé pour "${searchTerm}"`
                : 'Aucun employé n\'est enregistré dans le système'
              }
            </p>
            {!searchTerm && (
              <Link to="/admin/hr/employees/new" className="quick-action-btn">
                Ajouter le premier employé
              </Link>
            )}
          </div>
        ) : (
          <div className="hr-cards-grid">
            {filteredEmployees.map(employee => {
              const isActive = !employee.contractEndDate || new Date(employee.contractEndDate) > new Date();
              const yearsOfService = employee.hireDate
                ? Math.floor((new Date().getTime() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365))
                : 0;

              return (
                <div key={employee.id} className="hr-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    {employee.photoUrl && (
                      <img
                        src={employee.photoUrl}
                        alt={`${employee.firstName} ${employee.lastName}`}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #e0e0e0'
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 className="hr-card-title">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="hr-card-description">
                        {employee.jobTitle || 'Poste non défini'}
                        {employee.employeeNumber && ` • #${employee.employeeNumber}`}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                          {isActive ? '✅ Actif' : '❌ Inactif'}
                        </span>
                        {yearsOfService > 0 && (
                          <span style={{
                            background: '#e3f2fd',
                            color: '#1976d2',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            🕐 {yearsOfService} an{yearsOfService > 1 ? 's' : ''} d'ancienneté
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="hr-card-stats">
                    <div className="hr-stat">
                      <span className="hr-stat-label">Poste actuel</span>
                      <span className="hr-stat-value">{employee.jobTitle || 'Non défini'}</span>
                    </div>
                    {employee.hireDate && (
                      <div className="hr-stat">
                        <span className="hr-stat-label">Date d'embauche</span>
                        <span className="hr-stat-value">
                          {new Date(employee.hireDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="hr-stat">
                      <span className="hr-stat-label">Email</span>
                      <span className="hr-stat-value">{employee.workEmail}</span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <button
                      onClick={() => navigate(`/admin/hr/employees/${employee.id}?tab=history`)}
                      className="quick-action-btn"
                      style={{ flex: 1, fontSize: '14px' }}
                    >
                      🔄 Voir historique
                    </button>
                    <button
                      onClick={() => navigate(`/admin/hr/employees/${employee.id}`)}
                      className="quick-action-btn"
                      style={{ fontSize: '14px' }}
                    >
                      👁️ Profil complet
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Section d'informations */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ marginBottom: '16px', color: '#2c3e50' }}>
            📊 À propos de l'historique des postes
          </h3>
          <div className="hr-cards-grid">
            <div className="hr-card">
              <div className="hr-card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 className="hr-card-title">Suivi de carrière</h3>
              <p className="hr-card-description">
                Consultez l'évolution professionnelle de chaque employé au sein de votre organisation.
              </p>
            </div>

            <div className="hr-card">
              <div className="hr-card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 className="hr-card-title">Évolution salariale</h3>
              <p className="hr-card-description">
                Suivez les changements de salaire et les promotions dans le temps.
              </p>
            </div>

            <div className="hr-card">
              <div className="hr-card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 0 0-6 0v4"></path>
                  <rect x="2" y="9" width="20" height="12" rx="2" ry="2"></rect>
                </svg>
              </div>
              <h3 className="hr-card-title">Gestion des accès</h3>
              <p className="hr-card-description">
                Historique des responsabilités et niveaux d'accès accordés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobHistoryPage;
