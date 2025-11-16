import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p className="page-subtitle">Bienvenue dans l'espace d'administration Zentra</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <Link to="/admin/qcms" className="dashboard-card">
          <div className="dashboard-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="dashboard-content">
            <h3>Gestion des QCM</h3>
            <p>Créer, modifier et gérer vos questionnaires</p>
          </div>
          <div className="dashboard-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </Link>

        <Link to="/admin/besoins" className="dashboard-card">
          <div className="dashboard-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <div className="dashboard-content">
            <h3>Besoins</h3>
            <p>Gérer les besoins et candidatures</p>
          </div>
          <div className="dashboard-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </Link>

        <Link to="/admin/leaves/dashboard" className="dashboard-card">
          <div className="dashboard-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="dashboard-content">
            <h3>Gestion des Congés</h3>
            <p>Gérer les demandes de congés et absences</p>
          </div>
          <div className="dashboard-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </Link>

        <Link to="/admin/skills" className="dashboard-card">
          <div className="dashboard-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="dashboard-content">
            <h3>Compétences</h3>
            <p>Référentiel et matrice des compétences</p>
          </div>
          <div className="dashboard-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </Link>

        <Link to="/admin/trainings" className="dashboard-card">
          <div className="dashboard-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
          </div>
          <div className="dashboard-content">
            <h3>Formations</h3>
            <p>Catalogue et suggestions de formations</p>
          </div>
          <div className="dashboard-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </Link>

        <div className="dashboard-card disabled">
          <div className="dashboard-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="dashboard-content">
            <h3>Utilisateurs</h3>
            <p>Bientôt disponible</p>
          </div>
        </div>

        <div className="dashboard-card disabled">
          <div className="dashboard-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="dashboard-content">
            <h3>Rapports</h3>
            <p>Bientôt disponible</p>
          </div>
        </div>
      </div>

      <div className="welcome-section">
        <div className="welcome-card">
          <h2>🎉 Bienvenue sur Zentra Admin</h2>
          <p>
            Gérez facilement vos QCM, besoins et candidatures depuis cet espace d'administration.
            Utilisez le menu latéral pour naviguer entre les différents modules.
          </p>
        </div>
      </div>
    </div>
  );
}
