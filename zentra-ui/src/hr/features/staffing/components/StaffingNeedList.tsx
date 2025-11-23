import { useState, useEffect } from 'react';
import type { StaffingNeed } from '../../../types/StaffingNeed.ts';
import { staffingNeedService } from '../../../services/staffingNeedService.ts';
import '../styles/StaffingNeedList.css';

interface StaffingNeedListProps {
  onEdit: (need: StaffingNeed) => void;
  onView: (need: StaffingNeed) => void;
}

export const StaffingNeedList = ({ onEdit, onView }: StaffingNeedListProps) => {
  const [staffingNeeds, setStaffingNeeds] = useState<StaffingNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    loadStaffingNeeds();
  }, [filterStatus, filterPriority]);

  const loadStaffingNeeds = async () => {
    try {
      setLoading(true);
      let data: StaffingNeed[];

      if (filterStatus !== 'all') {
        data = await staffingNeedService.getByStatus(filterStatus);
      } else if (filterPriority !== 'all') {
        data = await staffingNeedService.getByPriority(filterPriority);
      } else {
        data = await staffingNeedService.getAllStaffingNeeds();
      }

      setStaffingNeeds(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Erreur lors du chargement: ${errorMessage}`);
      console.error('Erreur complète:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce besoin ?')) {
      try {
        await staffingNeedService.deleteStaffingNeed(id);
        loadStaffingNeeds();
      } catch (err) {
        alert('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const getPriorityClass = (priority?: string) => {
    switch (priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'In Progress':
        return 'status-progress';
      case 'Fulfilled':
        return 'status-fulfilled';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="staffing-need-list">
      <div className="filters">
        <div className="filter-group">
          <label>Statut:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous</option>
            <option value="Open">Ouvert</option>
            <option value="In Progress">En cours</option>
            <option value="Fulfilled">Satisfait</option>
            <option value="Cancelled">Annulé</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Priorité:</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">Toutes</option>
            <option value="High">Haute</option>
            <option value="Medium">Moyenne</option>
            <option value="Low">Basse</option>
          </select>
        </div>

        <button className="btn-refresh" onClick={loadStaffingNeeds}>
          🔄 Actualiser
        </button>
      </div>

      <div className="needs-grid">
        {staffingNeeds.length === 0 ? (
          <div className="no-data">Aucun besoin en personnel trouvé</div>
        ) : (
          staffingNeeds.map((need) => (
            <div key={need.id} className="need-card">
              <div className="card-header">
                <h3>{need.title}</h3>
                <div className="card-badges">
                  {need.priority && (
                    <span className={`badge ${getPriorityClass(need.priority)}`}>
                      {need.priority}
                    </span>
                  )}
                  <span className={`badge ${getStatusClass(need.status)}`}>
                    {need.status}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <strong>Département:</strong> {need.departmentName || 'N/A'}
                </div>
                <div className="info-row">
                  <strong>Poste:</strong> {need.jobTitle || 'N/A'}
                </div>
                <div className="info-row">
                  <strong>Nombre de postes:</strong> {need.numberOfPositions}
                </div>
                {need.budgetAllocated && (
                  <div className="info-row">
                    <strong>Budget:</strong> {need.budgetAllocated.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'MGA',
                    })}
                  </div>
                )}
                {need.requiredStartDate && (
                  <div className="info-row">
                    <strong>Date début:</strong>{' '}
                    {new Date(need.requiredStartDate).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>

              <div className="card-footer">
                <button className="btn-view" onClick={() => onView(need)}>
                  👁️ Voir
                </button>
                <button className="btn-edit" onClick={() => onEdit(need)}>
                  ✏️ Modifier
                </button>
                <button
                  className="btn-delete"
                  onClick={() => need.id && handleDelete(need.id)}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
