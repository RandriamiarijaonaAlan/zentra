import React, { useState, useEffect } from 'react';
import { getLeaveBalance, getLeaveRequests, createLeaveRequest, cancelLeaveRequest } from '../services/selfService';
import type { LeaveBalance, LeaveRequest } from '../types/selfService.ts';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../../services/api.ts';
import type { EmployeeLeaveOverviewDto, LeaveNotificationDto } from '../../../types';
import EmployeeSelector from '../../employee/components/EmployeeSelector.tsx';
import '../styles/LeaveDashboard.css';

const LeaveDashboard: React.FC = () => {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<LeaveRequest>({
    startDate: '',
    endDate: '',
    type: 'ANNUAL',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
interface Props { employeeId?: number; }

export default function LeaveDashboard({ employeeId: initialEmployeeId }: Props) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(initialEmployeeId || 1);
  const [overview, setOverview] = useState<EmployeeLeaveOverviewDto | null>(null);
  const [notifications, setNotifications] = useState<LeaveNotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => { load(); }, [selectedEmployeeId]);
  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceData, requestsData] = await Promise.all([
        getLeaveBalance(),
        getLeaveRequests(),
      ]);
      setBalance(balanceData);
      setRequests(requestsData);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  async function load() {
    setLoading(true);
    setError('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await createLeaveRequest(formData);
      setShowForm(false);
      setFormData({ startDate: '', endDate: '', type: 'ANNUAL', reason: '' });
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId: number) => {
    if (!window.confirm('Confirmer l\'annulation de cette demande ?')) return;
    try {
      const [o, n] = await Promise.all([
        get<EmployeeLeaveOverviewDto>(`/leave-balances/employee/${selectedEmployeeId}/overview`),
        get<LeaveNotificationDto[]>(`/leave-notifications/employee/${selectedEmployeeId}/unread`)
      ]);
      setOverview(o); setNotifications(n);
    } catch { setError('Impossible de charger le tableau de bord'); }
    finally { setLoading(false); }
  }
      setLoading(true);
      await cancelLeaveRequest(requestId);
      await loadData();
    } catch (err) {
      setError('Erreur lors de l\'annulation');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR');
  const badge = (s: string) => s === 'APPROVED' ? 'badge-success' : s === 'PENDING' ? 'badge-warning' : s === 'REJECTED' ? 'badge-danger' : 'badge-secondary';
  const txt = (s: string) => s === 'APPROVED' ? 'Approuvé' : s === 'PENDING' ? 'En attente' : s === 'REJECTED' ? 'Rejeté' : s;
  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      REJECTED: 'badge-danger',
      CANCELLED: 'badge-secondary',
    };
    return badges[status] || 'badge-secondary';
  };

  if (loading) return (<div className="dashboard-loading"><div className="loading-spinner"></div><p>Chargement...</p></div>);
  if (error) return (<div className="dashboard-error"><i className="icon-warning"></i><p>{error}</p></div>);
  if (loading && !balance) return <div className="loading">Chargement...</div>;

  return (
    <div className="leave-dashboard">
      <div className="dashboard-header">
        <h1>Mon Tableau de Bord Congés</h1>
        <Link to="/admin/leaves/requests/new" className="btn btn-primary">Nouvelle demande</Link>
      </div>

      <EmployeeSelector
        selectedEmployeeId={selectedEmployeeId}
        onSelectEmployee={setSelectedEmployeeId}
      />

      {notifications.length > 0 && (
        <div className="notifications-section">
          <h2>Notifications récentes</h2>
          <div className="notifications-list">
            {notifications.slice(0,3).map(n => (
              <div key={n.id} className="notification-item"><div className="notification-content"><span className="notification-message">{n.message}</span><small className="notification-date">{fmt(n.sentAt)}</small></div></div>
            ))}
          </div>
          {notifications.length > 3 && <Link to="/admin/leaves/notifications" className="view-all-link">Voir toutes ({notifications.length})</Link>}
        </div>
      )}

      <div className="balances-section">
        <h2>Mes Soldes de Congés ({overview?.currentYear})</h2>
        <div className="balances-grid">
          {overview?.leaveBalances.map(b => (
            <div key={b.id} className="balance-card">
              <div className="balance-header"><h3>{b.leaveTypeName}</h3></div>
              <div className="balance-content">
                <div className="balance-main"><span className="balance-remaining">{b.remainingDays}</span><span className="balance-unit">jour(s)</span></div>
                <div className="balance-details">
                  <div className="balance-row"><span className="label">Alloué:</span><span className="value">{b.allocatedDays}</span></div>
                  <div className="balance-row"><span className="label">Utilisé:</span><span className="value">{b.usedDays}</span></div>
                  <div className="balance-row"><span className="label">En attente:</span><span className="value">{b.pendingDays}</span></div>
                  {b.carriedOverDays > 0 && <div className="balance-row"><span className="label">Report:</span><span className="value">{b.carriedOverDays}</span></div>}
                </div>
                {b.expiresOn && <div className="balance-expiry"><i className="icon-clock"></i><small>Expire le {fmt(b.expiresOn)}</small></div>}
      <h1>Gestion des Congés</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {balance && (
        <div className="leave-balance-card">
          <h2>Solde de Congés {balance.year}</h2>
          <div className="balance-grid">
            <div className="balance-item">
              <h3>Congés Annuels</h3>
              <div className="balance-stats">
                <span className="balance-remaining">{balance.annualRemaining}</span>
                <span className="balance-total">/ {balance.annualTotal} jours</span>
              </div>
              <p className="balance-taken">Pris: {balance.annualTaken} jours</p>
            </div>
            <div className="balance-item">
              <h3>Congés Maladie</h3>
              <div className="balance-stats">
                <span className="balance-remaining">{balance.sickRemaining}</span>
                <span className="balance-total">/ {balance.sickTotal} jours</span>
              </div>
            </div>
            <div className="balance-item">
              <h3>Congés Exceptionnels</h3>
              <div className="balance-stats">
                <span className="balance-remaining">{balance.exceptionalRemaining}</span>
                <span className="balance-total">/ {balance.exceptionalTotal} jours</span>
              </div>
              <div className="balance-progress"><div className="progress-bar" style={{width: `${Math.min(100, (Number(b.usedDays)/Number(b.allocatedDays)) * 100)}%`}}></div></div>
            </div>
          </div>
        </div>
      )}
          ))}
        </div>
      </div>

      <div className="leave-requests-section">
        <div className="section-header">
          <h2>Mes Demandes de Congés</h2>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Annuler' : 'Nouvelle Demande'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="leave-request-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date de début *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date de fin *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type de congé *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  required
                >
                  <option value="ANNUAL">Congé annuel</option>
                  <option value="SICK">Congé maladie</option>
                  <option value="EXCEPTIONAL">Congé exceptionnel</option>
                </select>
      <div className="recent-requests-section">
        <div className="section-header"><h2>Mes Demandes Récentes</h2><Link to="/admin/leaves/requests" className="view-all-link">Voir toutes</Link></div>
        {overview?.recentRequests?.length ? (
          <div className="requests-list">
            {overview.recentRequests.slice(0,5).map(r => (
              <div key={r.id} className="request-item">
                <div className="request-info"><div className="request-type">{r.leaveTypeName}</div><div className="request-dates">{fmt(r.startDate)} - {fmt(r.endDate)}</div><div className="request-days">{r.daysRequested} jour(s)</div></div>
                <div className="request-status"><span className={`badge ${badge(r.status)}`}>{txt(r.status)}</span></div>
              </div>
            ))}
          </div>
        ) : (<div className="empty-state"><i className="icon-calendar"></i><p>Aucune demande récente</p></div>)}
      </div>

      {overview?.upcomingLeaves?.length ? (
        <div className="upcoming-leaves-section">
          <h2>Mes Congés à Venir</h2>
          <div className="upcoming-list">
            {overview.upcomingLeaves.map(l => (
              <div key={l.id} className="upcoming-item">
                <div className="upcoming-info"><div className="upcoming-type">{l.leaveTypeName}</div><div className="upcoming-dates"><i className="icon-calendar"></i>{fmt(l.startDate)} - {fmt(l.endDate)}</div><div className="upcoming-days">{l.daysRequested} jour(s)</div></div>
                <div className="upcoming-countdown"><span className="countdown-value">{Math.ceil((new Date(l.startDate).getTime() - new Date().getTime()) / (1000*60*60*24))}</span><span className="countdown-unit">jour(s)</span></div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
            </div>
            <div className="form-group">
              <label>Motif</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Envoi...' : 'Soumettre la demande'}
            </button>
          </form>
        )}

      <div className="quick-actions-section">
        <h2>Actions Rapides</h2>
        <div className="quick-actions-grid">
          <Link to="/admin/leaves/requests/new" className="quick-action-card"><i className="icon-plus"></i><span>Nouvelle demande</span></Link>
          <Link to="/admin/leaves/requests" className="quick-action-card"><i className="icon-list"></i><span>Mes demandes</span></Link>
          <Link to="/admin/leaves/calendar" className="quick-action-card"><i className="icon-calendar"></i><span>Calendrier</span></Link>
          <Link to="/admin/leaves/types" className="quick-action-card"><i className="icon-bar-chart"></i><span>Types</span></Link>
        <div className="leave-requests-list">
          {requests.length === 0 ? (
            <p className="no-data">Aucune demande de congé</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Période</th>
                  <th>Jours</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Motif</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      {new Date(req.startDate).toLocaleDateString('fr-FR')} -{' '}
                      {new Date(req.endDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td>{req.days}</td>
                    <td>{req.type}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(req.status || '')}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>{req.reason || '-'}</td>
                    <td>
                      {req.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(req.id!)}
                          className="btn-small btn-danger"
                          disabled={loading}
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
};

export default LeaveDashboard;
