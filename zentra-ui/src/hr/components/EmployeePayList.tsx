import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../services/api';
import type { EmployeeDto } from '../types/employee';
import type { PayStubDto } from '../types/pay';
import './EmployeePayList.css';

export default function EmployeePayList() {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialiser avec le mois actuel
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await get<EmployeeDto[]>('/employees');
      setEmployees(data);
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger la liste des employés');
      setLoading(false);
    }
  };

  const handleGeneratePayStub = async (employeeId: number) => {
    if (!selectedMonth) return;

    setProcessingId(employeeId);
    try {
      await post<PayStubDto>(`/pay/paystub/generate?employeeId=${employeeId}&yearMonth=${selectedMonth}`);
      alert('Fiche de paie générée avec succès');
      setProcessingId(null);
    } catch (err: any) {
      setError('Impossible de générer la fiche de paie');
      setProcessingId(null);
    }
  };

  const handleViewPayStub = async (employeeId: number) => {
    if (!selectedMonth) return;
    navigate(`/admin/hr/pay/paystub?employeeId=${employeeId}&yearMonth=${selectedMonth}`);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1);

    if (direction === 'prev') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }

    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  const formatMonthYear = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des employés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <nav className="breadcrumb">
            <span>Gestion de Paie</span>
            <i className="fas fa-chevron-right"></i>
            <span>Fiches de Paie</span>
          </nav>
          <h1>Gestion des Fiches de Paie</h1>
          <p className="page-subtitle">Générez et consultez les fiches de paie de vos employés</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
          <button onClick={() => setError('')} className="alert-close">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="month-selector-card">
        <button
          onClick={() => handleMonthChange('prev')}
          className="month-nav-btn"
          title="Mois précédent"
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        <div className="month-display">
          <i className="fas fa-calendar-alt"></i>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-input"
          />
          <span className="month-text">{formatMonthYear(selectedMonth)}</span>
        </div>

        <button
          onClick={() => handleMonthChange('next')}
          className="month-nav-btn"
          title="Mois suivant"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-users"></i>
          </div>
          <h2>Aucun employé trouvé</h2>
          <p>Ajoutez des employés pour commencer à gérer leur paie</p>
        </div>
      ) : (
        <div className="employee-pay-grid">
          {employees.map((employee) => (
            <div key={employee.id} className="employee-pay-card">
              <div className="employee-pay-header">
                <div className="employee-avatar">
                  {employee.photoUrl ? (
                    <img src={employee.photoUrl} alt={`${employee.firstName} ${employee.lastName}`} />
                  ) : (
                    <div className="avatar-placeholder">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>
                <div className="employee-info">
                  <h3>{employee.firstName} {employee.lastName}</h3>
                  <p className="employee-number">N° {employee.employeeNumber}</p>
                  <p className="employee-job">{employee.jobTitle || 'Non défini'}</p>
                </div>
              </div>

              <div className="employee-pay-details">
                <div className="detail-item">
                  <i className="fas fa-briefcase"></i>
                  <span>Poste: {employee.jobTitle || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-calendar-check"></i>
                  <span>Embauché: {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-envelope"></i>
                  <span>{employee.workEmail}</span>
                </div>
              </div>

              <div className="employee-pay-actions">
                <button
                  onClick={() => handleGeneratePayStub(employee.id!)}
                  className="btn-action btn-primary"
                  disabled={processingId === employee.id}
                  title="Générer la fiche de paie"
                >
                  {processingId === employee.id ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Génération...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-money-check-alt"></i>
                      <span>Payer</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleViewPayStub(employee.id!)}
                  className="btn-action btn-secondary"
                  title="Voir la fiche de paie"
                >
                  <i className="fas fa-file-invoice"></i>
                  <span>Fiche de Paie</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

