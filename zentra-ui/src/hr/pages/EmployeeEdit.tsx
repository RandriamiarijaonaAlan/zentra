import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEmployee } from '../services/hrApi';
import { EmployeeForm } from '../components/EmployeeForm';
import type { EmployeeDto } from '../types/employee';
import '../../styles/HRPages.css';

const EmployeeEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeDto | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployee = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getEmployee(Number(id));
        setEmployee(data);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'employé:', error);
        setError('Impossible de charger l\'employé. Vérifiez votre connexion au backend.');
      } finally {
        setLoading(false);
      }
    };
    loadEmployee();
  }, [id]);

  const onSaved = (savedEmployee: EmployeeDto) => {
    // Rediriger vers le profil de l'employé
    navigate(`/admin/hr/employees/${savedEmployee.id}`);
  };

  if (loading) {
    return (
      <div className="hr-page">
        <div className="hr-container">
          <div className="hr-loading">
            <div className="hr-loading-spinner"></div>
            Chargement de l'employé...
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="hr-page">
        <div className="hr-container">
          <div className="hr-header">
            <h1 className="hr-title">
              ✏️ Modifier l'employé
            </h1>
          </div>
          <div className="hr-empty">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <h3>Erreur</h3>
            <p>{error || 'Employé non trouvé'}</p>
            <Link to="/admin/hr/employees" className="quick-action-btn">
              Retour à la liste
            </Link>
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
            ✏️ Modifier l'employé
          </h1>
          <p className="hr-subtitle">
            {employee.firstName} {employee.lastName}
          </p>
        </div>

        <div className="hr-quick-actions">
          <Link to={`/admin/hr/employees/${employee.id}`} className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Retour au profil
          </Link>
          <Link to="/admin/hr/employees" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
            </svg>
            Liste des employés
          </Link>
        </div>

        <EmployeeForm initial={employee} onSaved={onSaved} />
      </div>
    </div>
  );
};

export default EmployeeEdit;



