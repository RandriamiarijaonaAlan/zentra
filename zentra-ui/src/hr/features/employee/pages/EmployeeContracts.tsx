import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listEmployees } from '../../../services/hrApi.ts';
import type { EmployeeDto } from '../../../types/employee.ts';
import '../../documents/styles/HRPages.css';

const EmployeeContracts: React.FC = () => {
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
    (emp.workEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
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
              📋 Gestion des contrats
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
            📋 Gestion des contrats
          </h1>
          <p className="hr-subtitle">
            Gérer les contrats de travail de vos employés
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
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

              return (
                <div key={employee.id} className="hr-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    {employee.photoUrl && (
                      <img
                        src={employee.photoUrl}
                        alt={`${employee.firstName} ${employee.lastName}`}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #e0e0e0'
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
                    </div>
                    <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                      {isActive ? '✅ Actif' : '❌ Inactif'}
                    </span>
                  </div>

                  <div className="hr-card-stats">
                    <div className="hr-stat">
                      <span className="hr-stat-label">Email</span>
                      <span className="hr-stat-value">{employee.workEmail}</span>
                    </div>
                    {employee.hireDate && (
                      <div className="hr-stat">
                        <span className="hr-stat-label">Embauché le</span>
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
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <button
                      onClick={() => navigate(`/admin/hr/employees/${employee.id}?tab=contracts`)}
                      className="quick-action-btn"
                      style={{ flex: 1, fontSize: '14px' }}
                    >
                      📋 Gérer contrats
                    </button>
                    <button
                      onClick={() => navigate(`/admin/hr/employees/${employee.id}`)}
                      className="quick-action-btn"
                      style={{ fontSize: '14px' }}
                    >
                      👁️ Profil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Section d'aide */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ marginBottom: '16px', color: '#2c3e50' }}>
            💡 Gestion des contrats
          </h3>
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e0e0e0'
          }}>
            <div className="hr-cards-grid" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>📋</div>
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#2c3e50' }}>Créer un contrat</h4>
                  <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
                    Cliquez sur "Gérer contrats" pour un employé
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>✏️</div>
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#2c3e50' }}>Modifier un contrat</h4>
                  <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
                    Accédez au profil pour modifier les détails
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>📊</div>
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#2c3e50' }}>Suivi des contrats</h4>
                  <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
                    Visualisez le statut et les dates importantes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeContracts;
