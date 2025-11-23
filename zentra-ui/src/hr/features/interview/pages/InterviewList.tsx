import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get, del } from '../../../services/api.ts';
import type { InterviewDto } from '../../../types';
import * as XLSX from 'xlsx';
import '../styles/InterviewList.css';

export default function InterviewList() {
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const data = await get<InterviewDto[]>('/interviews');
      setInterviews(data);
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger les entretiens');
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await del(`/interviews/${id}`);
      setInterviews(interviews.filter((i) => i.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError('Impossible de supprimer l\'entretien');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      PLANIFIE: { class: 'status-planned', label: 'Planifié' },
      REALISE: { class: 'status-completed', label: 'Réalisé' },
      ANNULE: { class: 'status-cancelled', label: 'Annulé' },
    };
    const badge = badges[status] || { class: '', label: status };
    return <span className={`status-badge ${badge.class}`}>{badge.label}</span>;
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { class: string; label: string; icon: string }> = {
      PRESENTIEL: { class: 'type-presentiel', label: 'Présentiel', icon: 'fa-building' },
      VISIO: { class: 'type-visio', label: 'Visio', icon: 'fa-video' },
      TELEPHONIQUE: { class: 'type-phone', label: 'Téléphone', icon: 'fa-phone' },
    };
    const badge = badges[type] || { class: '', label: type, icon: 'fa-clipboard' };
    return (
      <span className={`type-badge ${badge.class}`}>
        <i className={`fas ${badge.icon} type-icon`}></i>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:mm
  };

  // Fonction de tri
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <i className="fas fa-sort sort-icon"></i>;
    }
    return sortDirection === 'asc'
      ? <i className="fas fa-sort-up sort-icon active"></i>
      : <i className="fas fa-sort-down sort-icon active"></i>;
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (filterStatus !== 'ALL' && interview.status !== filterStatus) return false;
    if (filterType !== 'ALL' && interview.interviewType !== filterType) return false;
    return true;
  });

  // Tri des entretiens
  const sortedInterviews = [...filteredInterviews].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'candidate':
        aValue = a.candidateName.toLowerCase();
        bValue = b.candidateName.toLowerCase();
        break;
      case 'interviewer':
        aValue = a.interviewerName.toLowerCase();
        bValue = b.interviewerName.toLowerCase();
        break;
      case 'date':
        aValue = new Date(a.interviewDate + ' ' + a.startTime).getTime();
        bValue = new Date(b.interviewDate + ' ' + b.startTime).getTime();
        break;
      case 'duration':
        aValue = a.durationMinutes;
        bValue = b.durationMinutes;
        break;
      case 'type':
        aValue = a.interviewType;
        bValue = b.interviewType;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'score':
        aValue = a.score ?? -1;
        bValue = b.score ?? -1;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Calcul des statistiques
  const calculateStats = () => {
    const interviewsWithScore = sortedInterviews.filter(
      (i) => i.score !== null && i.score !== undefined
    );

    if (interviewsWithScore.length === 0) {
      return {
        averageScore: 0,
        count: 0,
        totalInterviews: sortedInterviews.length,
      };
    }

    const totalScore = interviewsWithScore.reduce((sum, i) => sum + (i.score || 0), 0);
    const averageScore = totalScore / interviewsWithScore.length;

    return {
      averageScore: Number(averageScore.toFixed(2)),
      count: interviewsWithScore.length,
      totalInterviews: sortedInterviews.length,
    };
  };

  const stats = calculateStats();

  // Export functions
  const exportToExcel = () => {
    const dataToExport = sortedInterviews.map((interview) => ({
      'Candidat': interview.candidateName,
      'Email': interview.candidateEmail,
      'Recruteur': interview.interviewerName,
      'Date': formatDate(interview.interviewDate),
      'Heure': formatTime(interview.startTime),
      'Durée (min)': interview.durationMinutes,
      'Type': interview.interviewType,
      'Statut': interview.status,
      'Note': interview.score !== null && interview.score !== undefined ? `${interview.score}/20` : '-',
      'Lieu/Lien': interview.location || '-',
      'Commentaire': interview.comment || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Entretiens');

    // Ajuster la largeur des colonnes
    const colWidths = [
      { wch: 25 }, // Candidat
      { wch: 30 }, // Email
      { wch: 25 }, // Recruteur
      { wch: 20 }, // Date
      { wch: 10 }, // Heure
      { wch: 12 }, // Durée
      { wch: 15 }, // Type
      { wch: 12 }, // Statut
      { wch: 10 }, // Note
      { wch: 30 }, // Lieu/Lien
      { wch: 40 }, // Commentaire
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `entretiens_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const dataToExport = sortedInterviews.map((interview) => ({
      'Candidat': interview.candidateName,
      'Email': interview.candidateEmail,
      'Recruteur': interview.interviewerName,
      'Date': formatDate(interview.interviewDate),
      'Heure': formatTime(interview.startTime),
      'Durée (min)': interview.durationMinutes,
      'Type': interview.interviewType,
      'Statut': interview.status,
      'Note': interview.score !== null && interview.score !== undefined ? `${interview.score}/20` : '-',
      'Lieu/Lien': interview.location || '-',
      'Commentaire': interview.comment || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const csv = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `entretiens_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des entretiens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Gestion des Entretiens</h1>
          <p className="page-subtitle">Planifiez et gérez tous vos entretiens de recrutement</p>
        </div>
        <Link to="/admin/interviews/new/edit" className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Planifier un entretien
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      <div className="filters-bar">
        <div className="filter-group">
          <label htmlFor="filterStatus">Statut</label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PLANIFIE">Planifiés</option>
            <option value="REALISE">Réalisés</option>
            <option value="ANNULE">Annulés</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filterType">Type</label>
          <select
            id="filterType"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tous les types</option>
            <option value="PRESENTIEL">Présentiel</option>
            <option value="VISIO">Visio</option>
            <option value="TELEPHONIQUE">Téléphone</option>
          </select>
        </div>

        <div className="filter-stats">
          <span className="stat-item">
            <strong>{sortedInterviews.length}</strong> entretien{sortedInterviews.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="export-buttons">
          <button onClick={exportToExcel} className="btn-export btn-excel" title="Exporter en Excel">
            <i className="fas fa-file-excel"></i>
            Excel
          </button>
          <button onClick={exportToCSV} className="btn-export btn-csv" title="Exporter en CSV">
            <i className="fas fa-file-csv"></i>
            CSV
          </button>
        </div>
      </div>

      {sortedInterviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <h2>Aucun entretien {filterStatus !== 'ALL' || filterType !== 'ALL' ? 'correspondant aux filtres' : 'disponible'}</h2>
          <p>Commencez par planifier votre premier entretien</p>
          <Link to="/admin/interviews/new/edit" className="btn-primary">
            Planifier un entretien
          </Link>
        </div>
      ) : (
        <div className="interview-table-container">
          <table className="interview-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('candidate')}>
                  <div className="th-content">
                    Candidat
                    {getSortIcon('candidate')}
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort('interviewer')}>
                  <div className="th-content">
                    Recruteur
                    {getSortIcon('interviewer')}
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort('date')}>
                  <div className="th-content">
                    Date & Heure
                    {getSortIcon('date')}
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort('duration')}>
                  <div className="th-content">
                    Durée
                    {getSortIcon('duration')}
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort('type')}>
                  <div className="th-content">
                    Type
                    {getSortIcon('type')}
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort('status')}>
                  <div className="th-content">
                    Statut
                    {getSortIcon('status')}
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort('score')}>
                  <div className="th-content">
                    Note
                    {getSortIcon('score')}
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedInterviews.map((interview) => (
                <tr key={interview.id}>
                  <td>
                    <div className="candidate-info">
                      <div className="candidate-avatar">
                        {interview.candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="candidate-name">{interview.candidateName}</div>
                        <div className="candidate-email">{interview.candidateEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="interviewer-name">{interview.interviewerName}</div>
                  </td>
                  <td>
                    <div className="datetime-info">
                      <div className="date-text"><i className="far fa-calendar"></i> {formatDate(interview.interviewDate)}</div>
                      <div className="time-text"><i className="far fa-clock"></i> {formatTime(interview.startTime)}</div>
                    </div>
                  </td>
                  <td>
                    <span className="duration-badge">{interview.durationMinutes} min</span>
                  </td>
                  <td>{getTypeBadge(interview.interviewType)}</td>
                  <td>{getStatusBadge(interview.status)}</td>
                  <td>
                    {interview.score !== null && interview.score !== undefined ? (
                      <span className="score-badge">{interview.score}/20</span>
                    ) : (
                      <span className="score-empty">-</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/admin/interviews/${interview.id}`)}
                        className="btn-icon"
                        title="Voir les détails"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button
                        onClick={() => navigate(`/admin/interviews/${interview.id}/edit`)}
                        className="btn-icon"
                        title="Modifier"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      {deleteConfirm === interview.id ? (
                        <div className="delete-confirm">
                          <button
                            onClick={() => handleDelete(interview.id)}
                            className="btn-confirm-delete"
                            title="Confirmer"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="btn-cancel-delete"
                            title="Annuler"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(interview.id)}
                          className="btn-icon btn-delete"
                          title="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sortedInterviews.length > 0 && (
        <div className="statistics-section">
          <h2 className="statistics-title">
            <i className="fas fa-chart-line"></i>
            Statistiques
          </h2>
          <div className="statistics-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Entretiens</div>
                <div className="stat-value">{stats.totalInterviews}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <i className="fas fa-star"></i>
              </div>
              <div className="stat-content">
                <div className="stat-label">Entretiens Notés</div>
                <div className="stat-value">{stats.count}</div>
              </div>
            </div>

            <div className="stat-card stat-card-highlight">
              <div className="stat-icon stat-icon-purple">
                <i className="fas fa-chart-bar"></i>
              </div>
              <div className="stat-content">
                <div className="stat-label">Moyenne des Notes</div>
                <div className="stat-value">
                  {stats.count > 0 ? (
                    <>
                      {stats.averageScore}<span className="stat-unit">/20</span>
                    </>
                  ) : (
                    <span className="stat-empty">-</span>
                  )}
                </div>
                {stats.count > 0 && (
                  <div className="stat-progress">
                    <div
                      className="stat-progress-bar"
                      style={{ width: `${(stats.averageScore / 20) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-orange">
                <i className="fas fa-percentage"></i>
              </div>
              <div className="stat-content">
                <div className="stat-label">Taux de Notation</div>
                <div className="stat-value">
                  {stats.totalInterviews > 0
                    ? Math.round((stats.count / stats.totalInterviews) * 100)
                    : 0}
                  <span className="stat-unit">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

