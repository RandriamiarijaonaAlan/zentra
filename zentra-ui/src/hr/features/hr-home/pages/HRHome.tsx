import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listEmployees } from '../../../services/hrApi.ts';
import '../../documents/styles/HRPages.css';

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  newThisMonth: number;
  contracts: number;
}

const HRHome: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    activeEmployees: 0,
    newThisMonth: 0,
    contracts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const employees = await listEmployees();
        const total = employees.length;
        const active = employees.filter(e => e.contractEndDate ? new Date(e.contractEndDate) > new Date() : true).length;
        const thisMonth = employees.filter(e => {
          if (!e.hireDate) return false;
          const hireDate = new Date(e.hireDate);
          const now = new Date();
          return hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear();
        }).length;

        setStats({
          totalEmployees: total,
          activeEmployees: active,
          newThisMonth: thisMonth,
          contracts: Math.floor(total * 0.9) // Estimation
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="hr-page">
      <div className="hr-container">
        <div className="hr-header">
          <h1 className="hr-title">
            👥 Dashboard RH
          </h1>
          <p className="hr-subtitle">
            Gestion des ressources humaines et du personnel
          </p>
        </div>

        <div className="hr-cards-grid">
          <div className="hr-card">
            <div className="hr-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="hr-card-title">Employés</h3>
            <p className="hr-card-description">Gestion complète du personnel</p>
            <div className="hr-card-stats">
              <div className="hr-stat">
                <span className="hr-stat-label">Total</span>
                <span className="hr-stat-value">{loading ? '...' : stats.totalEmployees}</span>
              </div>
              <div className="hr-stat">
                <span className="hr-stat-label">Actifs</span>
                <span className="hr-stat-value">{loading ? '...' : stats.activeEmployees}</span>
              </div>
              <div className="hr-stat">
                <span className="hr-stat-label">Nouveaux ce mois</span>
                <span className="hr-stat-value">{loading ? '...' : stats.newThisMonth}</span>
              </div>
            </div>
          </div>

          <Link to="/admin/hr/employees" className="hr-card">
            <div className="hr-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
            <h3 className="hr-card-title">Liste des employés</h3>
            <p className="hr-card-description">Voir tous les employés avec filtres et recherche</p>
          </Link>

          <Link to="/admin/hr/employees/new" className="hr-card">
            <div className="hr-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <h3 className="hr-card-title">Ajouter employé</h3>
            <p className="hr-card-description">Créer un nouveau profil employé</p>
          </Link>

          <Link to="/admin/hr/contracts" className="hr-card">
            <div className="hr-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="hr-card-title">Contrats</h3>
            <p className="hr-card-description">Gestion des contrats de travail</p>
            <div className="hr-card-stats">
              <div className="hr-stat">
                <span className="hr-stat-label">Contrats actifs</span>
                <span className="hr-stat-value">{loading ? '...' : stats.contracts}</span>
              </div>
            </div>
          </Link>

          <Link to="/admin/hr/staffing-needs" className="hr-card">
            <div className="hr-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <h3 className="hr-card-title">Besoins en personnel</h3>
            <p className="hr-card-description">Planification et demandes de recrutement</p>
          </Link>

          <Link to="/admin/hr/documents" className="hr-card">
            <div className="hr-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <h3 className="hr-card-title">Documents RH</h3>
            <p className="hr-card-description">Gestion documentaire des employés</p>
          </Link>
        </div>

        <div className="hr-quick-actions">
          <Link to="/admin/hr/employees/new" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nouvel employé
          </Link>
          <Link to="/admin/hr/upload-document" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Télécharger document
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HRHome;

