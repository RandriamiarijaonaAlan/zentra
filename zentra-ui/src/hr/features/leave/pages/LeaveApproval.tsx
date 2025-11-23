import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, post } from '../../../services/api.ts';
import type { LeaveRequestDto, LeaveApprovalDto } from '../../../types';
import EmployeeSelector from '../../employee/components/EmployeeSelector.tsx';
import '../styles/LeaveApproval.css';

interface LeaveApprovalProps {
  managerId?: number;
}

export default function LeaveApproval({ managerId: initialManagerId }: LeaveApprovalProps) {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [selectedManagerId, setSelectedManagerId] = useState<number>(initialManagerId || 1);
  const [request, setRequest] = useState<LeaveRequestDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (requestId) {
      loadLeaveRequest(parseInt(requestId));
    }
  }, [requestId]);

  const loadLeaveRequest = async (id: number) => {
    try {
      const data = await get<LeaveRequestDto>(`/leave-requests/${id}`);
      setRequest(data);
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger la demande de congé');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!decision) {
      setError('Veuillez sélectionner une décision');
      return;
    }

    if (!request) return;

    setSubmitting(true);
    setError('');

    try {
      const approvalData: LeaveApprovalDto = {
        id: request.id,
        status: decision,
        approvalComment: comment.trim() || undefined
      };

      const endpoint = decision === 'APPROVED'
        ? `/leave-requests/${request.id}/approve`
        : `/leave-requests/${request.id}/reject`;

      await post(`${endpoint}?approverId=${selectedManagerId}`, approvalData);

      navigate('/admin/leaves/requests/pending');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="approval-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de la demande...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="approval-page">
        <div className="error-container">
          <i className="icon-warning"></i>
          <p>Demande de congé non trouvée</p>
        </div>
      </div>
    );
  }

  if (request.status !== 'PENDING') {
    return (
      <div className="approval-page">
        <div className="info-container">
          <i className="icon-info"></i>
          <p>Cette demande a déjà été traitée</p>
          <p>Statut: <strong>{request.status === 'APPROVED' ? 'Approuvé' : 'Rejeté'}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="approval-page">
      <div className="page-header">
        <h1>Approbation de Demande de Congé</h1>
        <button
          onClick={() => navigate('/admin/leaves/requests/pending')}
          className="btn btn-secondary"
        >
          Retour à la liste
        </button>
      </div>

      <EmployeeSelector
        selectedEmployeeId={selectedManagerId}
        onSelectEmployee={setSelectedManagerId}
      />

      {error && (
        <div className="alert alert-danger">
          <i className="icon-warning"></i>
          {error}
        </div>
      )}

      <div className="request-details-card">
        <div className="card-header">
          <h2>Détails de la Demande</h2>
          <span className="status-badge status-pending">En attente</span>
        </div>

        <div className="request-info">
          <div className="info-grid">
            <div className="info-item">
              <label>Employé</label>
              <div className="employee-info">
                <strong>{request.employeeName}</strong>
              </div>
            </div>

            <div className="info-item">
              <label>Type de congé</label>
              <div className="leave-type-info">
                {request.leaveTypeColor && (
                  <span
                    className="color-indicator"
                    style={{ backgroundColor: request.leaveTypeColor }}
                  ></span>
                )}
                <span>{request.leaveTypeName}</span>
              </div>
            </div>

            <div className="info-item">
              <label>Période</label>
              <div className="period-info">
                <div className="dates">
                  <span className="start-date">{formatDate(request.startDate)}</span>
                  <i className="icon-arrow-right"></i>
                  <span className="end-date">{formatDate(request.endDate)}</span>
                </div>
                <div className="duration">
                  Durée: <strong>{request.daysRequested} jour{request.daysRequested > 1 ? 's' : ''} ouvrés</strong>
                </div>
              </div>
            </div>

            {(request.isHalfDayStart || request.isHalfDayEnd) && (
              <div className="info-item">
                <label>Demi-journées</label>
                <div className="half-days">
                  {request.isHalfDayStart && <span className="badge badge-info">½ début</span>}
                  {request.isHalfDayEnd && <span className="badge badge-info">½ fin</span>}
                </div>
              </div>
            )}

            {request.reason && (
              <div className="info-item full-width">
                <label>Motif</label>
                <div className="reason-content">
                  {request.reason}
                </div>
              </div>
            )}

            {request.emergencyContact && (
              <div className="info-item">
                <label>Contact d'urgence</label>
                <div className="emergency-contact">
                  {request.emergencyContact}
                </div>
              </div>
            )}

            <div className="info-item">
              <label>Demandé le</label>
              <div className="request-date">
                {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="approval-form-card">
        <div className="card-header">
          <h2>Décision</h2>
        </div>

        <div className="decision-section">
          <div className="decision-buttons">
            <button
              type="button"
              className={`decision-btn approve-btn ${decision === 'APPROVED' ? 'selected' : ''}`}
              onClick={() => setDecision('APPROVED')}
            >
              <i className="icon-check"></i>
              Approuver
            </button>

            <button
              type="button"
              className={`decision-btn reject-btn ${decision === 'REJECTED' ? 'selected' : ''}`}
              onClick={() => setDecision('REJECTED')}
            >
              <i className="icon-x"></i>
              Rejeter
            </button>
          </div>

          <div className="comment-section">
            <label htmlFor="comment">
              Commentaire {decision === 'REJECTED' ? '(obligatoire pour un rejet)' : '(optionnel)'}
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                decision === 'APPROVED'
                  ? "Commentaire optionnel pour l'approbation..."
                  : decision === 'REJECTED'
                  ? "Veuillez expliquer les raisons du rejet..."
                  : "Commentaire..."
              }
              rows={4}
              className="form-control"
              required={decision === 'REJECTED'}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/leaves/requests/pending')}
            className="btn btn-secondary"
          >
            Annuler
          </button>

          <button
            type="submit"
            className={`btn ${decision === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
            disabled={submitting || !decision || (decision === 'REJECTED' && !comment.trim())}
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                Traitement...
              </>
            ) : (
              decision === 'APPROVED' ? 'Approuver la demande' : 'Rejeter la demande'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
