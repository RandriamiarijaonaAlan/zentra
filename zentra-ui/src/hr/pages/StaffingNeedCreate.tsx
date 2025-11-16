import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StaffingNeedForm } from '../components/StaffingNeedForm';
import '../../styles/HRPages.css';

const StaffingNeedCreate: React.FC = () => {
  const navigate = useNavigate();

  const handleSave = () => {
    // Rediriger vers la liste des besoins
    navigate('/admin/hr/staffing-needs');
  };

  const handleCancel = () => {
    navigate('/admin/hr/staffing-needs');
  };

  return (
    <div className="hr-page">
      <div className="hr-container">
        <div className="hr-header">
          <h1 className="hr-title">
            ➕ Nouveau besoin en personnel
          </h1>
          <p className="hr-subtitle">
            Créer une nouvelle demande de recrutement
          </p>
        </div>

        <div className="hr-quick-actions">
          <Link to="/admin/hr/staffing-needs" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Retour à la liste
          </Link>
        </div>

        <StaffingNeedForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default StaffingNeedCreate;
