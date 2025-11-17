import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, downloadFile } from '../../services/api';
import type { PayStubDto } from '../types/pay';
import type { EmployeeDto } from '../types/employee';
import './PayStubDetail.css';

export default function PayStubDetail() {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const yearMonth = searchParams.get('yearMonth');
  const [payStub, setPayStub] = useState<PayStubDto | null>(null);
  const [employee, setEmployee] = useState<EmployeeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (employeeId && yearMonth) {
      loadData();
    }
  }, [employeeId, yearMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [payStubData, employeeData] = await Promise.all([
        get<PayStubDto>(`/pay/paystub?employeeId=${employeeId}&yearMonth=${yearMonth}`),
        get<EmployeeDto>(`/employees/${employeeId}`)
      ]);
      setPayStub(payStubData);
      setEmployee(employeeData);
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger la fiche de paie');
      setLoading(false);
    }
  };

  const formatMonthYear = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA'
    }).format(amount);
  };

  const formatRate = (rate: number | null | undefined) => {
    if (!rate) return '-';
    return rate.toFixed(2);
  };

  const handleExportPDF = async () => {
    if (!payStub?.filepath) {
      console.error('Aucun fichier PDF disponible');
      return;
    }
    try {
      console.log("Téléchargement du fichier PDF : " + payStub.filepath);
      const fileName = `Bulletin_${employee?.lastName}_${yearMonth}.pdf`;
      await downloadFile(payStub.filepath, fileName);
    } catch (err) {
      console.error('Erreur lors du téléchargement du PDF:', err);
    }
  };

  const handleExportExcel = async () => {
    if (!payStub?.filepath) {
      console.error('Aucun fichier Excel disponible');
      return;
    }
    try {
      const excelPath = payStub.filepath.replace('.pdf', '.xlsx');
      console.log("Téléchargement du fichier Excel : " + excelPath);
      const fileName = `Bulletin_${employee?.lastName}_${yearMonth}.xlsx`;
      await downloadFile(excelPath, fileName);
    } catch (err) {
      console.error('Erreur lors du téléchargement du fichier Excel:', err);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de la fiche de paie...</p>
        </div>
      </div>
    );
  }

  if (error || !payStub || !employee) {
    return (
      <div className="admin-page">
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2>{error || 'Fiche de paie introuvable'}</h2>
          <p>Impossible de charger les informations de la fiche de paie</p>
          <button onClick={() => navigate('/admin/hr/pay')} className="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Bulletin de Paie</h1>
          <p className="page-subtitle">{employee.firstName} {employee.lastName} · {formatMonthYear(yearMonth!)}</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/admin/hr/pay')} className="btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Retour
          </button>
          <button onClick={handleExportExcel} className="btn-success">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            Exporter Excel
          </button>
          <button onClick={handleExportPDF} className="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Exporter PDF
          </button>
        </div>
      </div>

      <div className="paystub-document">
        {/* En-tête du bulletin */}
        <div className="document-header">
          <div className="company-info">
            <h2>Zentra RH</h2>
            <p>Gestion des Ressources Humaines</p>
            <p>Date d'émission: {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="document-title">
            <h1>BULLETIN DE PAIE</h1>
            <p className="period">{formatMonthYear(yearMonth!)}</p>
          </div>
        </div>

        {/* Informations employé */}
        <div className="employee-info-section">
          <h3>Informations de l'employé</h3>
          <div className="employee-details">
            <div className="info-row">
              <span className="info-label">Nom:</span>
              <span className="info-value">{employee.firstName} {employee.lastName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">N° Employé:</span>
              <span className="info-value">{employee.employeeNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Poste:</span>
              <span className="info-value">{employee.jobTitle || 'Non défini'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{employee.workEmail}</span>
            </div>
          </div>
        </div>

        {/* Tableau de rémunération - SALAIRE BRUT */}
        <div className="salary-table-section">
          <h3>Rémunération Brute</h3>
          <table className="salary-table">
            <thead>
              <tr>
                <th>Libellé</th>
                <th className="number-col">Nombre</th>
                <th className="number-col">Taux</th>
                <th className="amount-col">Montant</th>
              </tr>
            </thead>
            <tbody>

              {payStub.salaryComponents.map((comp, index) => (
                <tr key={index} className="positive-row">
                  <td>{comp.designation}</td>
                  <td className="number-col">{comp.number || '-'}</td>
                  <td className="number-col">{comp.rate ? formatRate(comp.rate) : '-'}</td>
                  <td className="amount-col positive">{formatCurrency(comp.amount)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan={3} style={{ textAlign: 'right', paddingRight: '20px' }}><strong>TOTAL BRUT</strong></td>
                <td className="amount-col"><strong>{formatCurrency(payStub.grossSalary)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tableau des déductions */}
        <div className="salary-table-section">
          <h3>Déductions</h3>
          <table className="salary-table">
            <thead>
              <tr>
                <th>Désignation</th>
                <th className="number-col">Taux</th>
                <th className="amount-col">Montant</th>
              </tr>
            </thead>
            <tbody>
              {payStub.salaryDeductions.map((ded, index) => (
                <tr key={index}>
                  <td>{ded.designation}</td>
                  <td className="number-col">{ded.rate ? `${formatRate(ded.rate)}%` : '-'}</td>
                  <td className="amount-col negative">{formatCurrency(ded.amount)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan={2} style={{ textAlign: 'right', paddingRight: '20px' }}><strong>TOTAL DÉDUCTIONS</strong></td>
                <td className="amount-col negative"><strong>{formatCurrency(payStub.sumDeductions)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* IRSA et revenu imposable */}
        {payStub.irsaDeduction && (
          <div className="salary-table-section">
            <table className="salary-table">
              <tbody>
                <tr className="gross-row">
                  <td><strong>Revenu imposable</strong></td>
                  <td className="amount-col"><strong>{formatCurrency(payStub.taxableIncome || 0)}</strong></td>
                </tr>
                <tr className="negative-row">
                  <td><strong>IRSA</strong></td>
                  <td className="amount-col negative"><strong>{formatCurrency(payStub.irsaDeduction)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Net à payer */}
        <div className="net-pay-section">
          <div className="net-pay-row">
            <span className="net-pay-label">NET À PAYER</span>
            <span className="net-pay-amount">{formatCurrency(payStub.netSalary)}</span>
          </div>
        </div>

        {/* Mode de paiement */}
        {payStub.payingMethod && (
          <div className="payment-method-section">
            <div className="payment-method-row">
              <span className="label">Mode de paiement</span>
              <span className="value">{payStub.payingMethod}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="document-footer">
          <p className="generated-date">
            Document généré automatiquement par Zentra RH le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </p>
          <p className="legal-notice">
            Ce bulletin de paie est conforme à la réglementation en vigueur et doit être conservé sans limitation de durée.
          </p>
        </div>
      </div>
    </div>
  );
}

