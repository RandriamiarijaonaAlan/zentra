import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EmployeeForm } from '../components/EmployeeForm';
import type { EmployeeDto } from '../types/employee';
import '../../styles/HRPages.css';

const EmployeeCreate: React.FC = () => {
  const navigate = useNavigate();

  const onSaved = (employee: EmployeeDto) => {
    // Rediriger vers le profil de l'employé créé
    navigate(`/admin/hr/employees/${employee.id}`);
  };

  return (
    <div className="hr-page">
      <div className="hr-container">
        <div className="hr-header">
          <h1 className="hr-title">
            ➕ Nouvel employé
          </h1>
          <p className="hr-subtitle">
            Créer un nouveau profil employé
          </p>
        </div>

        <div className="hr-quick-actions">
          <Link to="/admin/hr/employees" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Retour à la liste
          </Link>
        </div>

        <EmployeeForm onSaved={onSaved} />
      </div>
    </div>
  );
};

export default EmployeeCreate;
