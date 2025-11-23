import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../shared/components/UserNavbar.tsx';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <UserNavbar />
      <div className="home-page">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-background">
            <div className="hero-circle circle-1"></div>
            <div className="hero-circle circle-2"></div>
            <div className="hero-circle circle-3"></div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">
              Bienvenue chez <span className="gradient-text">Zentra</span>
            </h1>
            <p className="hero-subtitle">
              Découvrez nos opportunités de carrière et passez nos tests de recrutement
            </p>
            <div className="hero-buttons">
              <button onClick={() => navigate('/publications')} className="btn-primary-large">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                Voir les offres
              </button>
              <button onClick={() => navigate('/')} className="btn-secondary-large">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Passer un test
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="features-container">
            <h2 className="section-title">Comment ça marche ?</h2>
            <p className="section-subtitle">Un processus simple et efficace pour rejoindre notre équipe</p>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon icon-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
                <h3>1. Découvrez nos offres</h3>
                <p>Parcourez nos offres d'emploi et trouvez le poste qui correspond à vos compétences et aspirations.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon icon-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                </div>
                <h3>2. Postulez en ligne</h3>
                <p>Soumettez votre candidature avec votre CV et lettre de motivation directement depuis notre plateforme.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon icon-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <h3>3. Passez un test</h3>
                <p>Complétez notre test d'évaluation en ligne pour démontrer vos compétences et connaissances.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon icon-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3>4. Rejoignez-nous</h3>
                <p>Recevez une réponse rapide et commencez votre nouvelle aventure professionnelle avec nous.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Candidats évalués</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">150+</div>
              <div className="stat-label">Postes pourvus</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">95%</div>
              <div className="stat-label">Taux de satisfaction</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24h</div>
              <div className="stat-label">Temps de réponse moyen</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta">
          <div className="cta-content">
            <h2>Prêt à commencer votre aventure ?</h2>
            <p>Rejoignez notre équipe et contribuez à notre succès</p>
            <button onClick={() => navigate('/publications')} className="cta-button">
              Découvrir les offres
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <span>Zentra</span>
            </div>
            <p className="footer-text">© 2025 Zentra. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

