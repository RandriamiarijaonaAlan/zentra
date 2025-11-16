import React, { useState, useEffect } from 'react';
import { getLeaveBalance, getLeaveRequests, createLeaveRequest, cancelLeaveRequest } from '../services/selfService';
import type { LeaveBalance, LeaveRequest } from '../types/selfService.ts';
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

  useEffect(() => {
    loadData();
  }, []);

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
      setLoading(true);
      await cancelLeaveRequest(requestId);
      await loadData();
    } catch (err) {
      setError('Erreur lors de l\'annulation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      REJECTED: 'badge-danger',
      CANCELLED: 'badge-secondary',
    };
    return badges[status] || 'badge-secondary';
  };

  if (loading && !balance) return <div className="loading">Chargement...</div>;

  return (
    <div className="leave-dashboard">
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
            </div>
          </div>
        </div>
      )}

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
              </div>
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
};

export default LeaveDashboard;
