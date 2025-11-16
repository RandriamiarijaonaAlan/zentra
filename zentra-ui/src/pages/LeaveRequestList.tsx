import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get, del } from '../services/api';
import type { LeaveRequestDto } from '../types';
import EmployeeSelector from '../components/EmployeeSelector';
import '../styles/LeaveRequestList.css';

interface Props { employeeId?: number; showEmployeeColumn?: boolean; }

export function LeaveRequestList({ employeeId: initialEmployeeId, showEmployeeColumn = true }: Props) {
  const [rows, setRows] = useState<LeaveRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>(initialEmployeeId);

  useEffect(() => { load(); }, [selectedEmployeeId, filterStatus]);

  async function load() {
    try {
      let url = '/leave-requests';
      if (selectedEmployeeId) url = `/leave-requests/employee/${selectedEmployeeId}`;
      else if (filterStatus === 'PENDING') url = '/leave-requests/pending';
      const data = await get<LeaveRequestDto[]>(url);
      const filtered = (filterStatus === 'ALL' || filterStatus === 'PENDING') ? data : data.filter(r => r.status === filterStatus);
      setRows(filtered);
    } catch { setError('Impossible de charger les demandes de congés'); }
    finally { setLoading(false); }
  }

  async function remove(id: number) {
    try { await del(`/leave-requests/${id}`); setRows(prev => prev.filter(r => r.id !== id)); setDeleteConfirm(null); }
    catch { setError('Impossible de supprimer la demande'); }
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR');
  const badge = (s: string) => s === 'APPROVED' ? 'badge-success' : s === 'PENDING' ? 'badge-warning' : s === 'REJECTED' ? 'badge-danger' : 'badge-secondary';
  const txt = (s: string) => s === 'APPROVED' ? 'Approuvé' : s === 'PENDING' ? 'En attente' : s === 'REJECTED' ? 'Rejeté' : 'Annulé';

  if (loading) return (<div className="admin-page"><div className="loading-container"><div className="loading-spinner"></div><p>Chargement...</p></div></div>);

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Gestion des Demandes de Congés</h1>
        <Link to="/admin/leaves/requests/new" className="btn btn-primary">Nouvelle Demande</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      {!initialEmployeeId && (
        <EmployeeSelector
          selectedEmployeeId={selectedEmployeeId}
          onSelectEmployee={setSelectedEmployeeId}
        />
      )}

      <div className="content-card">
        <div className="filters">
          <div className="filter-group">
            <label>Filtrer par statut:</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-control filter-select">
              <option value="ALL">Tous</option>
              <option value="PENDING">En attente</option>
              <option value="APPROVED">Approuvés</option>
              <option value="REJECTED">Rejetés</option>
              <option value="CANCELLED">Annulés</option>
            </select>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {showEmployeeColumn && <th>Employé</th>}
                <th>Type</th><th>Période</th><th>Jours</th><th>Raison</th><th>Statut</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  {showEmployeeColumn && <td>{r.employeeName}</td>}
                  <td><div className="leave-type-cell">{r.leaveTypeColor && <span className="color-indicator" style={{backgroundColor: r.leaveTypeColor}}></span>}{r.leaveTypeName}</div></td>
                  <td><div className="date-range"><span className="start-date">{fmt(r.startDate)}</span><i className="icon-arrow-right"></i><span className="end-date">{fmt(r.endDate)}</span></div></td>
                  <td><span className="days-count">{r.daysRequested}</span></td>
                  <td className="reason-cell">{r.reason}</td>
                  <td><span className={`badge ${badge(r.status)}`}>{txt(r.status)}</span></td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/admin/leaves/requests/${r.id}`} className="btn btn-sm btn-outline-primary">Voir</Link>
                      {r.status === 'PENDING' && (
                        <>
                          {/* Bouton approbation visible uniquement en mode admin (pas de employé forcé) */}
                          {!initialEmployeeId && (
                            <Link
                              to={`/admin/leaves/requests/${r.id}/approve`}
                              className="btn btn-sm btn-outline-success"
                            >
                              Approuver
                            </Link>
                          )}
                          {/* Actions de modification / annulation visibles seulement quand on est dans le contexte d'un employé spécifique */}
                          {initialEmployeeId && (
                            <>
                              <Link
                                to={`/admin/leaves/requests/${r.id}/edit`}
                                className="btn btn-sm btn-outline-secondary"
                              >
                                Modifier
                              </Link>
                              <button
                                onClick={() => setDeleteConfirm(r.id)}
                                className="btn btn-sm btn-outline-danger"
                                type="button"
                              >
                                Annuler
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay"><div className="modal"><div className="modal-header"><h3>Confirmer l'annulation</h3></div><div className="modal-body"><p>Annuler cette demande ?</p></div><div className="modal-footer"><button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary">Non</button><button onClick={() => remove(deleteConfirm)} className="btn btn-danger">Oui, annuler</button></div></div></div>
      )}
    </div>
  );
}
