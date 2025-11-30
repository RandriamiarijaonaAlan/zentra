import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { selfServiceApi } from '../services/selfServiceApi';
import type { LeaveRequest, LeaveBalance } from '../services/selfServiceApi';
import '../../../../styles/EmployeeLeaveRequests.css';

export default function EmployeeLeaveRequests() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  const [newRequest, setNewRequest] = useState<Partial<LeaveRequest>>({
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    days: 1,
    reason: ''
  });

  useEffect(() => {
    if (employeeId) {
      loadData();
    }
  }, [employeeId, filterStatus]);

  const loadData = async () => {
    if (!employeeId) return;
    
    setLoading(true);
    try {
      const [requests, balance] = await Promise.all([
        selfServiceApi.getLeaveRequests(Number(employeeId), undefined, filterStatus || undefined),
        selfServiceApi.getLeaveBalance(Number(employeeId))
      ]);
      setLeaveRequests(requests);
      setLeaveBalance(balance);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    if (!newRequest.startDate || !newRequest.endDate) {
      alert('Veuillez remplir les dates de début et de fin');
      return;
    }

    setLoading(true);
    try {
      await selfServiceApi.createLeaveRequest(Number(employeeId), {
        employeeId: Number(employeeId),
        leaveType: newRequest.leaveType || 'ANNUAL',
        startDate: newRequest.startDate || '',
        endDate: newRequest.endDate || '',
        days: newRequest.days || 1,
        reason: newRequest.reason,
        status: 'PENDING'
      });
      
      alert('Demande de congé créée avec succès!');
      setShowForm(false);
      setNewRequest({
        leaveType: 'ANNUAL',
        startDate: '',
        endDate: '',
        days: 1,
        reason: ''
      });
      loadData();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId: number) => {
    if (!employeeId || !confirm('Voulez-vous vraiment annuler cette demande?')) return;

    try {
      await selfServiceApi.cancelLeaveRequest(Number(employeeId), requestId);
      alert('Demande annulée avec succès');
      loadData();
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      alert('Erreur lors de l\'annulation de la demande');
    }
  };

  const calculateDays = () => {
    if (newRequest.startDate && newRequest.endDate) {
      const start = new Date(newRequest.startDate);
      const end = new Date(newRequest.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setNewRequest(prev => ({ ...prev, days: diffDays }));
    }
  };

  useEffect(() => {
    calculateDays();
  }, [newRequest.startDate, newRequest.endDate]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      PENDING: { label: '⏳ En attente', className: 'status-pending' },
      APPROVED: { label: '✅ Approuvé', className: 'status-approved' },
      REJECTED: { label: '❌ Rejeté', className: 'status-rejected' },
      CANCELLED: { label: '🚫 Annulé', className: 'status-cancelled' }
    };
    return badges[status] || { label: status, className: '' };
  };

  return (
    <div className="employee-leave-requests">
      <div className="page-header">
        <h1>🏖️ Mes Demandes de Congé</h1>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? '❌ Annuler' : '➕ Nouvelle demande'}
        </button>
      </div>

      {/* Leave Balance Summary */}
      {leaveBalance && (
        <div className="leave-balance-summary">
          <div className="balance-card">
            <span className="balance-label">Total annuel</span>
            <span className="balance-value">{leaveBalance.annualLeaveDays} jours</span>
          </div>
          <div className="balance-card">
            <span className="balance-label">Utilisés</span>
            <span className="balance-value used">{leaveBalance.usedDays} jours</span>
          </div>
          <div className="balance-card">
            <span className="balance-label">En attente</span>
            <span className="balance-value pending">{leaveBalance.pendingDays} jours</span>
          </div>
          <div className="balance-card">
            <span className="balance-label">Restants</span>
            <span className="balance-value remaining">{leaveBalance.remainingDays} jours</span>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form className="leave-request-form" onSubmit={handleSubmit}>
          <h3>Nouvelle demande de congé</h3>
          
          <div className="form-group">
            <label>Type de congé</label>
            <select
              value={newRequest.leaveType}
              onChange={(e) => setNewRequest({ ...newRequest, leaveType: e.target.value })}
              required
            >
              <option value="ANNUAL">Congé annuel</option>
              <option value="SICK">Congé maladie</option>
              <option value="UNPAID">Congé sans solde</option>
              <option value="MATERNITY">Congé maternité</option>
              <option value="PATERNITY">Congé paternité</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date de début</label>
              <input
                type="date"
                value={newRequest.startDate}
                onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Date de fin</label>
              <input
                type="date"
                value={newRequest.endDate}
                onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                min={newRequest.startDate}
                required
              />
            </div>

            <div className="form-group">
              <label>Nombre de jours</label>
              <input
                type="number"
                value={newRequest.days}
                onChange={(e) => setNewRequest({ ...newRequest, days: Number(e.target.value) })}
                min="1"
                required
                readOnly
              />
            </div>
          </div>

          <div className="form-group">
            <label>Motif (optionnel)</label>
            <textarea
              value={newRequest.reason}
              onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
              rows={3}
              placeholder="Précisez le motif de votre demande..."
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Envoi...' : '✅ Soumettre la demande'}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="filters">
        <label>Filtrer par statut:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tous</option>
          <option value="PENDING">En attente</option>
          <option value="APPROVED">Approuvé</option>
          <option value="REJECTED">Rejeté</option>
          <option value="CANCELLED">Annulé</option>
        </select>
      </div>

      {/* Requests List */}
      {loading && <div className="loading">Chargement...</div>}

      {!loading && leaveRequests.length === 0 && (
        <div className="no-data">
          <p>Aucune demande de congé trouvée</p>
        </div>
      )}

      {!loading && leaveRequests.length > 0 && (
        <div className="requests-list">
          {leaveRequests.map(request => {
            const status = getStatusBadge(request.status);
            return (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <span className={`status-badge ${status.className}`}>
                    {status.label}
                  </span>
                  <span className="request-type">{request.leaveType}</span>
                </div>

                <div className="request-dates">
                  <div>
                    <strong>Du:</strong> {new Date(request.startDate).toLocaleDateString('fr-FR')}
                  </div>
                  <div>
                    <strong>Au:</strong> {new Date(request.endDate).toLocaleDateString('fr-FR')}
                  </div>
                  <div>
                    <strong>Durée:</strong> {request.days} jour{request.days > 1 ? 's' : ''}
                  </div>
                </div>

                {request.reason && (
                  <div className="request-reason">
                    <strong>Motif:</strong> {request.reason}
                  </div>
                )}

                {request.requestDate && (
                  <div className="request-meta">
                    Demandé le {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                  </div>
                )}

                {request.status === 'APPROVED' && request.approvedDate && (
                  <div className="request-meta approved">
                    ✅ Approuvé le {new Date(request.approvedDate).toLocaleDateString('fr-FR')}
                  </div>
                )}

                {request.status === 'REJECTED' && request.rejectionReason && (
                  <div className="request-meta rejected">
                    ❌ Motif du rejet: {request.rejectionReason}
                  </div>
                )}

                {request.status === 'PENDING' && (
                  <button 
                    className="btn-cancel" 
                    onClick={() => request.id && handleCancel(request.id)}
                  >
                    Annuler la demande
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
