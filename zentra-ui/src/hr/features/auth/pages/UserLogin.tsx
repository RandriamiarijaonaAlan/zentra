import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../../../services/api.ts';
import type { CandidateMinInfoDto } from '../../../types';
import UserNavbar from '../../shared/components/UserNavbar.tsx';
import '../styles/UserLogin.css';

export default function UserLogin() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Veuillez entrer votre token');
      return;
    }

    setLoading(true);

    try {
      const candidateInfo = await post<CandidateMinInfoDto>('/users/auth', { token });

      // Stocker le token dans localStorage
      localStorage.setItem('qcm_token', token);

      // Stocker les infos du candidat
      localStorage.setItem('candidate_info', JSON.stringify(candidateInfo));

      // Rediriger vers la page du QCM
      navigate('/qcm-attempt');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Token invalide. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <UserNavbar />
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-circle">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h1>Bienvenue au Test QCM</h1>
            <p>Entrez votre token d'authentification pour commencer</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="token">Token d'authentification</label>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Entrez votre token ici"
                className={error ? 'input-error' : ''}
                disabled={loading}
                autoFocus
              />
              {error && <span className="error-message">{error}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Vérification...
                </>
              ) : (
                'Commencer le test'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Assurez-vous d'avoir une connexion Internet stable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

