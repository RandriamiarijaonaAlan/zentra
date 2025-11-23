import type { StaffingNeed } from '../../../types/StaffingNeed.ts';
import '../styles/StaffingNeedDetail.css';

interface StaffingNeedDetailProps {
  need: StaffingNeed;
  onEdit: () => void;
  onClose: () => void;
}

export const StaffingNeedDetail = ({ need, onEdit, onClose }: StaffingNeedDetailProps) => {
  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'High':
        return 'Haute';
      case 'Medium':
        return 'Moyenne';
      case 'Low':
        return 'Basse';
      default:
        return 'Non définie';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Open':
        return 'Ouvert';
      case 'In Progress':
        return 'En cours';
      case 'Fulfilled':
        return 'Satisfait';
      case 'Cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <div className="staffing-need-detail">
      <div className="detail-header">
        <div>
          <h2>{need.title}</h2>
          <div className="detail-badges">
            {need.priority && (
              <span className={`badge priority-${need.priority.toLowerCase()}`}>
                {getPriorityLabel(need.priority)}
              </span>
            )}
            <span className={`badge status-${need.status.toLowerCase().replace(' ', '-')}`}>
              {getStatusLabel(need.status)}
            </span>
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn-edit" onClick={onEdit}>
            ✏️ Modifier
          </button>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div className="detail-content">
        <section className="detail-section">
          <h3>Informations générales</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Département</label>
              <p>{need.departmentName || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Poste</label>
              <p>{need.jobTitle || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Nombre de postes requis</label>
              <p className="highlight">{need.numberOfPositions}</p>
            </div>
            {need.requestedByName && (
              <div className="detail-item">
                <label>Demandé par</label>
                <p>{need.requestedByName}</p>
              </div>
            )}
          </div>
        </section>

        {need.description && (
          <section className="detail-section">
            <h3>Description</h3>
            <p className="detail-description">{need.description}</p>
          </section>
        )}

        <section className="detail-section">
          <h3>Détails</h3>
          <div className="detail-grid">
            {need.requiredStartDate && (
              <div className="detail-item">
                <label>Date de début souhaitée</label>
                <p>{new Date(need.requiredStartDate).toLocaleDateString('fr-FR')}</p>
              </div>
            )}
            {need.budgetAllocated && (
              <div className="detail-item">
                <label>Budget alloué</label>
                <p className="budget">
                  {need.budgetAllocated.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'MGA',
                  })}
                </p>
              </div>
            )}
          </div>
        </section>

        {need.justification && (
          <section className="detail-section">
            <h3>Justification</h3>
            <p className="detail-justification">{need.justification}</p>
          </section>
        )}

        <section className="detail-section">
          <h3>Informations système</h3>
          <div className="detail-grid">
            {need.createdAt && (
              <div className="detail-item">
                <label>Créé le</label>
                <p>{new Date(need.createdAt).toLocaleString('fr-FR')}</p>
              </div>
            )}
            {need.updatedAt && (
              <div className="detail-item">
                <label>Modifié le</label>
                <p>{new Date(need.updatedAt).toLocaleString('fr-FR')}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
