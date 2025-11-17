import React, { useState, useEffect } from 'react';
import { getPayslips } from '../services/selfService';
import type { Payslip } from '../types/selfService.ts';
import '../styles/PayslipsPage.css';

const PayslipsPage: React.FC = () => {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    loadPayslips();
  }, [selectedYear]);

  const loadPayslips = async () => {
    try {
      setLoading(true);
      const data = await getPayslips(selectedYear);
      setPayslips(data);
    } catch (err) {
      setError('Erreur lors du chargement des bulletins');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1];
  };

  const handleDownload = (payslip: Payslip) => {
    if (payslip.filePath) {
      // TODO: Implement file download endpoint
      window.open(`http://localhost:8080${payslip.filePath}`, '_blank');
    }
  };

  return (
    <div className="payslips-page">
      <h1>Mes Bulletins de Paie</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="year-selector">
        <label>Année:</label>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : payslips.length === 0 ? (
        <p className="no-data">Aucun bulletin de paie pour {selectedYear}</p>
      ) : (
        <div className="payslips-grid">
          {payslips.map((payslip) => (
            <div key={payslip.id} className="payslip-card">
              <div className="payslip-header">
                <h3>
                  {getMonthName(payslip.periodMonth)} {payslip.periodYear}
                </h3>
                <span className={`badge badge-${payslip.status.toLowerCase()}`}>
                  {payslip.status}
                </span>
              </div>
              <div className="payslip-body">
                <div className="payslip-amount">
                  <div className="amount-item">
                    <label>Brut</label>
                    <span className="amount">{payslip.grossAmount.toFixed(2)} €</span>
                  </div>
                  <div className="amount-item net">
                    <label>Net</label>
                    <span className="amount">{payslip.netAmount.toFixed(2)} €</span>
                  </div>
                </div>
                {payslip.deductions !== undefined && payslip.deductions > 0 && (
                  <div className="payslip-detail">
                    <label>Déductions:</label>
                    <span>{payslip.deductions.toFixed(2)} €</span>
                  </div>
                )}
                {payslip.bonuses !== undefined && payslip.bonuses > 0 && (
                  <div className="payslip-detail">
                    <label>Primes:</label>
                    <span>{payslip.bonuses.toFixed(2)} €</span>
                  </div>
                )}
              </div>
              <div className="payslip-footer">
                <button
                  onClick={() => handleDownload(payslip)}
                  className="btn-primary"
                  disabled={!payslip.filePath}
                >
                  📥 Télécharger
                </button>
                <small>
                  Généré le {new Date(payslip.generatedAt).toLocaleDateString('fr-FR')}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PayslipsPage;
