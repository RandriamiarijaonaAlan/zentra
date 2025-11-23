import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../shared/components/UserNavbar.tsx';
import '../../shared/styles/Success.css';

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <UserNavbar />
      <div className="success-card">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1>Test soumis avec succès!</h1>
        <p>Merci d'avoir complété le QCM. Vos réponses ont été enregistrées.</p>
        <p className="success-subtitle">Vous serez contacté(e) prochainement concernant les résultats.</p>
        <button onClick={() => navigate('/')} className="success-btn">
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

