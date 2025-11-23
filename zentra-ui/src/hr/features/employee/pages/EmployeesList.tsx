import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listEmployees, deleteEmployee } from '../../../services/hrApi.ts';
import type { EmployeeDto } from '../../../types/employee.ts';
import '../../documents/styles/HRPages.css';

const EmployeesList: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = async () => {
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

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => employees.filter(e =>
    (e.firstName + ' ' + e.lastName).toLowerCase().includes(q.toLowerCase()) ||
    (e.jobTitle || '').toLowerCase().includes(q.toLowerCase()) ||
    (e.workEmail || '').toLowerCase().includes(q.toLowerCase()) ||
    (e.employeeNumber || '').toLowerCase().includes(q.toLowerCase())
  ), [employees, q]);

  const remove = async (id?: number) => {
    if (!id || !confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) return;
    try {
      await deleteEmployee(id);
      await load();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'employé. Vérifiez votre connexion au backend.');
    }
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

  if (error) {
    return (
      <div className="hr-page">
        <div className="hr-container">
          <div className="hr-header">
            <h1 className="hr-title">
              👥 Liste des employés
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
            <button onClick={load} className="quick-action-btn">
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
            👥 Liste des employés
          </h1>
          <p className="hr-subtitle">
            {employees.length} employé(s) enregistré(s)
          </p>
        </div>

        <div className="hr-quick-actions">
          <Link to="/admin/hr/employees/new" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Ajouter un employé
          </Link>
          <button onClick={load} className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            Actualiser
          </button>
          <input
            className="form-input"
            style={{ maxWidth: '300px' }}
            placeholder="Rechercher par nom, poste, email..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="hr-empty">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
            <h3>{q ? 'Aucun résultat' : 'Aucun employé'}</h3>
            <p>
              {q
                ? `Aucun employé trouvé pour "${q}"`
                : 'Commencez par ajouter votre premier employé'
              }
            </p>
            {!q && (
              <Link to="/admin/hr/employees/new" className="quick-action-btn">
                Ajouter le premier employé
              </Link>
            )}
          </div>
        ) : (
          <div className="hr-table-container">
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Poste</th>
                  <th>Contact</th>
                  <th>Dates</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => {
                  const isActive = !e.contractEndDate || new Date(e.contractEndDate) > new Date();
                  return (
                    <tr key={e.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {e.photoUrl && (
                            <img
                              src={e.photoUrl}
                              alt={`${e.firstName} ${e.lastName}`}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #e0e0e0'
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: '600' }}>
                              {e.firstName} {e.lastName}
                            </div>
                            {e.employeeNumber && (
                              <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                                #{e.employeeNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{e.jobTitle || '-'}</td>
                      <td>
                        <div>
                          <div>{e.workEmail}</div>
                          {e.workPhone && (
                            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                              {e.workPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          {e.hireDate && (
                            <div style={{ fontSize: '12px' }}>
                              Embauche: {new Date(e.hireDate).toLocaleDateString()}
                            </div>
                          )}
                          {e.contractEndDate && (
                            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                              Fin: {new Date(e.contractEndDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                          {isActive ? '✅ Actif' : '❌ Inactif'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="quick-action-btn"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                            onClick={() => navigate(`/admin/hr/employees/${e.id}`)}
                          >
                            👁️
                          </button>
                          <button
                            className="quick-action-btn"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                            onClick={() => navigate(`/admin/hr/employees/${e.id}/edit`)}
                          >
                            ✏️
                          </button>
                          <button
                            className="quick-action-btn"
                            style={{
                              fontSize: '12px',
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #e74c3c, #c0392b)'
                            }}
                            onClick={() => remove(e.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesList;

