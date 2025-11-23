import React, { useEffect, useState, useMemo } from 'react';
import { get } from '../../../services/api.ts';
import '../styles/EmployeeStatisticsDashboard.css';
import ChartWrapper from '../../shared/components/ChartWrapper.tsx';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Bar, Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

interface EmployeeStats {
  maleCount: number;
  femaleCount: number;
  lessThan30: number;
  between30And50: number;
  moreThan50: number;
  serviceStats: Record<string, number>;
  contractStats?: Record<string, number>;
  totalEmployees: number;
  turnoverRate?: number;
  absenteeismRate?: number;
  avgSeniority?: number;
  avgAge?: number;
  avgSalary?: number;
  activeEmployees?: number;
  inactiveEmployees?: number;
  turnoverTrend?: number[];
}

const EmployeeStatisticsDashboard: React.FC = React.memo(() => {
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await get<EmployeeStats>('/employees/statistics');
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Memoize chart options to prevent re-renders
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }), []);

  // Memoize chart data to prevent re-renders
  const chartData = useMemo(() => {
    if (!stats) return null;

    const total = stats.totalEmployees || 0;
    const pct = (n?: number) => (total > 0 && n ? Math.round((n / total) * 100) : 0);

    // Données pour le graphique genre
    const genderData = {
      labels: ['Hommes', 'Femmes'],
      datasets: [
        {
          data: [stats.maleCount, stats.femaleCount],
          backgroundColor: ['#667EEA', '#FF6384'],
          borderColor: ['#667EEA', '#FF6384'],
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };

    // Données pour le graphique âge
    const ageData = {
      labels: ['<30 ans', '30-50 ans', '>50 ans'],
      datasets: [
        {
          label: 'Effectif',
          data: [stats.lessThan30, stats.between30And50, stats.moreThan50],
          backgroundColor: ['#FFD86F', '#36A2EB', '#FF9AA2'],
          borderColor: ['#FFD86F', '#36A2EB', '#FF9AA2'],
          borderWidth: 1,
        },
      ],
    };

    // Données pour le graphique services
    const serviceLabels = Object.keys(stats.serviceStats || {});
    const serviceValues = serviceLabels.map(k => stats.serviceStats?.[k] || 0);
    const serviceData = {
      labels: serviceLabels,
      datasets: [
        {
          label: 'Nombre d\'employés',
          data: serviceValues,
          backgroundColor: serviceLabels.map((_, i) => `hsl(${(i * 60) % 360} 70% 60%)`),
          borderColor: serviceLabels.map((_, i) => `hsl(${(i * 60) % 360} 70% 40%)`),
          borderWidth: 1,
        },
      ],
    };

    // Données pour le graphique contrats
    const contractLabels = Object.keys(stats.contractStats || {});
    const contractValues = contractLabels.map(k => stats.contractStats?.[k] ?? 0);
    const contractData = {
      labels: contractLabels,
      datasets: [
        {
          data: contractValues,
          backgroundColor: ['#7BDFF6', '#FF6B9D', '#C44569', '#FFA07A'],
          borderColor: ['#0099CC', '#FF1493', '#8B0000', '#FF4500'],
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };

    // Données pour le graphique tendance
    const lineData = {
      labels: stats.turnoverTrend?.map((_, i) => `M${i + 1}`) ?? [],
      datasets: [
        {
          label: 'Turnover (mensuel %)',
          data: stats.turnoverTrend ?? [],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102,126,234,0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#667eea',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    return {
      genderData,
      ageData,
      serviceData,
      contractData,
      lineData,
      serviceLabels,
      contractLabels,
      pct,
      total
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner">Chargement des statistiques...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <h2>Erreur</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!stats || !chartData) {
    return (
      <div className="page-error">
        <h2>Aucune donnée</h2>
        <p>Impossible de charger les statistiques</p>
      </div>
    );
  }

  const { genderData, ageData, serviceData, contractData, lineData, serviceLabels, contractLabels, pct, total } = chartData;

  return (
    <div className="employee-stats-page">
      {/* En-tête */}
      <div className="page-header">
        <h1>📊 Statistiques des Employés</h1>
        <p className="subtitle">Tableau de bord RH - Vue d'ensemble des indicateurs clés</p>
      </div>

      {/* Cartes de synthèse */}
      <div className="stats-summary">
        <div className="summary-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Effectif Total</h3>
            <div className="big-number">{total}</div>
            <div className="card-details">
              <span>👨 Hommes: <strong>{stats.maleCount}</strong> ({pct(stats.maleCount)}%)</span>
              <span>👩 Femmes: <strong>{stats.femaleCount}</strong> ({pct(stats.femaleCount)}%)</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>Contrats</h3>
            <div className="metrics-row">
              <div className="metric-item">
                <span className="metric-label">Actifs</span>
                <span className="metric-value">{stats.activeEmployees ?? 0}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Inactifs</span>
                <span className="metric-value">{stats.inactiveEmployees ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Indicateurs</h3>
            <div className="metrics-row">
              <div className="metric-item">
                <span className="metric-label">Turnover</span>
                <span className="metric-value">{stats.turnoverRate ?? 0}%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Absentéisme</span>
                <span className="metric-value">{stats.absenteeismRate ?? 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">⏳</div>
          <div className="card-content">
            <h3>Moyennes</h3>
            <div className="metrics-row">
              <div className="metric-item">
                <span className="metric-label">Âge</span>
                <span className="metric-value">{stats.avgAge?.toFixed(1) ?? '-'} ans</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Ancienneté</span>
                <span className="metric-value">{stats.avgSeniority?.toFixed(1) ?? '-'} ans</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="charts-section">
        <div className="chart-grid">
          {/* Genre */}
          <div className="chart-card">
            <h3>Distribution par Genre</h3>
            <div className="chart-container">
              <ChartWrapper>
                <Pie data={genderData} options={chartOptions} />
              </ChartWrapper>
            </div>
          </div>

          {/* Âge */}
          {(stats.lessThan30 > 0 || stats.between30And50 > 0 || stats.moreThan50 > 0) && (
            <div className="chart-card">
              <h3>Répartition par Âge</h3>
              <div className="chart-container">
                <ChartWrapper>
                  <Bar data={ageData} options={chartOptions} />
                </ChartWrapper>
              </div>
            </div>
          )}

          {/* Services - largeur complète */}
          <div className="chart-card full-width">
            <h3>Effectif par Service/Département</h3>
            <div className="chart-container">
              <ChartWrapper>
                <Bar
                  data={serviceData}
                  options={{
                    ...chartOptions,
                    indexAxis: 'y',
                    plugins: {
                      legend: { display: true, position: 'bottom' as const },
                    },
                  }}
                />
              </ChartWrapper>
            </div>
          </div>

          {/* Contrats */}
          {contractLabels.length > 0 && (
            <div className="chart-card">
              <h3>Types de Contrats</h3>
              <div className="chart-container">
                <ChartWrapper>
                  <Doughnut data={contractData} options={chartOptions} />
                </ChartWrapper>
              </div>
            </div>
          )}

          {/* Tendance Turnover */}
          {stats.turnoverTrend && stats.turnoverTrend.some(val => val !== 0) && (
            <div className="chart-card full-width">
              <h3>Tendance du Turnover (12 derniers mois)</h3>
              <div className="chart-container">
                <ChartWrapper>
                  <Line data={lineData} options={chartOptions} />
                </ChartWrapper>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section détails */}
      <div className="details-section">
        <div className="details-card">
          <h3>📍 Répartition Détaillée par Service</h3>
          <table className="details-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Nombre</th>
                <th>Pourcentage</th>
              </tr>
            </thead>
            <tbody>
              {serviceLabels.map((service) => (
                <tr key={service}>
                  <td>{service}</td>
                  <td className="text-center"><strong>{stats.serviceStats?.[service] ?? 0}</strong></td>
                  <td className="text-center">{pct(stats.serviceStats?.[service])}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contractLabels.length > 0 && (
          <div className="details-card">
            <h3>📋 Types de Contrats</h3>
            <table className="details-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Nombre</th>
                  <th>Pourcentage</th>
                </tr>
              </thead>
              <tbody>
                {contractLabels.map((contract) => (
                  <tr key={contract}>
                    <td>{contract}</td>
                    <td className="text-center"><strong>{stats.contractStats?.[contract] ?? 0}</strong></td>
                    <td className="text-center">{pct(stats.contractStats?.[contract])}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="details-card">
          <h3>🎯 Âge par Catégorie</h3>
          <table className="details-table">
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Nombre</th>
                <th>Pourcentage</th>
              </tr>
            </thead>
            <tbody>
              {stats.lessThan30 > 0 && (
                <tr>
                  <td>&lt; 30 ans</td>
                  <td className="text-center"><strong>{stats.lessThan30}</strong></td>
                  <td className="text-center">{pct(stats.lessThan30)}%</td>
                </tr>
              )}
              {stats.between30And50 > 0 && (
                <tr>
                  <td>30 - 50 ans</td>
                  <td className="text-center"><strong>{stats.between30And50}</strong></td>
                  <td className="text-center">{pct(stats.between30And50)}%</td>
                </tr>
              )}
              {stats.moreThan50 > 0 && (
                <tr>
                  <td>&gt; 50 ans</td>
                  <td className="text-center"><strong>{stats.moreThan50}</strong></td>
                  <td className="text-center">{pct(stats.moreThan50)}%</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salaire moyen */}
      <div className="salary-section">
        <div className="salary-card">
          <h3>💰 Salaire Moyen</h3>
          <div className="salary-value">
            {stats.avgSalary ? `${stats.avgSalary.toLocaleString('fr-FR', { style: 'currency', currency: 'MGA' })}` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
});

EmployeeStatisticsDashboard.displayName = 'EmployeeStatisticsDashboard';

export default EmployeeStatisticsDashboard;
