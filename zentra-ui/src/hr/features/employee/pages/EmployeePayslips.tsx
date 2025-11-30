import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { selfServiceApi } from '../services/selfServiceApi';
import type { Payslip } from '../services/selfServiceApi';
import '../../../../styles/EmployeePayslips.css';

export default function EmployeePayslips() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (employeeId) {
      loadPayslips();
    }
  }, [employeeId, filterYear]);

  const loadPayslips = async () => {
    if (!employeeId) return;

    setLoading(true);
    try {
      const data = await selfServiceApi.getPayslips(Number(employeeId), filterYear);
      setPayslips(data);
    } catch (error) {
      console.error('Erreur lors du chargement des bulletins:', error);
      alert('Erreur lors du chargement des bulletins de paie');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = async (payslipId: number) => {
    if (!employeeId) return;

    try {
      const data = await selfServiceApi.getPayslip(Number(employeeId), payslipId);
      setSelectedPayslip(data);
    } catch (error) {
      console.error('Erreur lors du chargement du bulletin:', error);
      alert('Erreur lors du chargement du bulletin de paie');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="employee-payslips">
      <div className="page-header">
        <h1>💰 Mes Bulletins de Paie</h1>
        {selectedPayslip && (
          <button className="btn-back" onClick={() => setSelectedPayslip(null)}>
            ← Retour à la liste
          </button>
        )}
      </div>

      {!selectedPayslip && (
        <>
          {/* Filter */}
          <div className="filters">
            <label>Filtrer par année:</label>
            <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))}>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {loading && <div className="loading">Chargement...</div>}

          {!loading && payslips.length === 0 && (
            <div className="no-data">
              <p>Aucun bulletin de paie trouvé pour l'année {filterYear}</p>
            </div>
          )}

          {!loading && payslips.length > 0 && (
            <div className="payslips-grid">
              {payslips.map(payslip => (
                <div key={payslip.id} className="payslip-card" onClick={() => handleViewPayslip(payslip.id)}>
                  <div className="payslip-period">
                    📅 {payslip.payPeriod}
                  </div>
                  <div className="payslip-date">
                    Date de paiement: {new Date(payslip.payDate).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="payslip-amounts">
                    <div className="amount-item">
                      <span className="amount-label">Salaire brut</span>
                      <span className="amount-value">{formatCurrency(payslip.grossSalary)}</span>
                    </div>
                    <div className="amount-item net">
                      <span className="amount-label">Salaire net</span>
                      <span className="amount-value">{formatCurrency(payslip.netSalary)}</span>
                    </div>
                  </div>
                  <button className="btn-view">👁️ Voir les détails</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedPayslip && (
        <div className="payslip-detail">
          <div className="detail-header">
            <h2>Bulletin de paie - {selectedPayslip.payPeriod}</h2>
            <p className="detail-date">
              Date de paiement: {new Date(selectedPayslip.payDate).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="detail-grid">
            {/* Gross Salary Section */}
            <div className="detail-section">
              <h3>💵 Rémunération brute</h3>
              <div className="detail-row">
                <span>Salaire brut de base</span>
                <span className="value">{formatCurrency(selectedPayslip.grossSalary)}</span>
              </div>
              {selectedPayslip.bonuses > 0 && (
                <div className="detail-row bonus">
                  <span>+ Primes et bonus</span>
                  <span className="value">{formatCurrency(selectedPayslip.bonuses)}</span>
                </div>
              )}
              <div className="detail-row total">
                <span><strong>Total brut</strong></span>
                <span className="value">
                  <strong>{formatCurrency(selectedPayslip.grossSalary + selectedPayslip.bonuses)}</strong>
                </span>
              </div>
            </div>

            {/* Deductions Section */}
            <div className="detail-section">
              <h3>📉 Déductions</h3>
              <div className="detail-row">
                <span>Cotisations sociales</span>
                <span className="value deduction">-{formatCurrency(selectedPayslip.socialSecurity)}</span>
              </div>
              <div className="detail-row">
                <span>Impôts</span>
                <span className="value deduction">-{formatCurrency(selectedPayslip.tax)}</span>
              </div>
              <div className="detail-row">
                <span>Autres déductions</span>
                <span className="value deduction">-{formatCurrency(selectedPayslip.deductions)}</span>
              </div>
              <div className="detail-row total">
                <span><strong>Total déductions</strong></span>
                <span className="value">
                  <strong>
                    -{formatCurrency(selectedPayslip.socialSecurity + selectedPayslip.tax + selectedPayslip.deductions)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Net Salary Section */}
            <div className="detail-section net-section">
              <h3>✅ Salaire net à payer</h3>
              <div className="net-amount">
                {formatCurrency(selectedPayslip.netSalary)}
              </div>
              <p className="net-description">
                Montant qui sera versé sur votre compte bancaire
              </p>
            </div>
          </div>

          {/* Summary Table */}
          <div className="summary-table">
            <h3>📊 Récapitulatif</h3>
            <table>
              <tbody>
                <tr>
                  <td>Salaire brut</td>
                  <td className="amount">{formatCurrency(selectedPayslip.grossSalary)}</td>
                </tr>
                {selectedPayslip.bonuses > 0 && (
                  <tr className="bonus-row">
                    <td>Primes et bonus</td>
                    <td className="amount">+{formatCurrency(selectedPayslip.bonuses)}</td>
                  </tr>
                )}
                <tr className="deduction-row">
                  <td>Cotisations sociales</td>
                  <td className="amount">-{formatCurrency(selectedPayslip.socialSecurity)}</td>
                </tr>
                <tr className="deduction-row">
                  <td>Impôts</td>
                  <td className="amount">-{formatCurrency(selectedPayslip.tax)}</td>
                </tr>
                <tr className="deduction-row">
                  <td>Autres déductions</td>
                  <td className="amount">-{formatCurrency(selectedPayslip.deductions)}</td>
                </tr>
                <tr className="total-row">
                  <td><strong>Net à payer</strong></td>
                  <td className="amount"><strong>{formatCurrency(selectedPayslip.netSalary)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {selectedPayslip.filePath && (
            <div className="download-section">
              <a 
                href={`http://localhost:8080${selectedPayslip.filePath}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-download"
              >
                📥 Télécharger le bulletin (PDF)
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
