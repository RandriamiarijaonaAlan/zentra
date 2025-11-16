import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get, del } from '../services/api';
import type { LeaveTypeDto } from '../types';
import '../styles/LeaveTypeList.css';

export function LeaveTypeList() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await get<LeaveTypeDto[]>('/leave-types');
      setLeaveTypes(data);
    } catch {
      setError('Impossible de charger les types de congés');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await del(`/leave-types/${id}`);
      setLeaveTypes((prev) => prev.filter((lt) => lt.id !== id));
      setDeleteConfirm(null);
    } catch { setError('Suppression impossible'); }
  };

  const toggleStatus = async (id: number, isActive: boolean) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/leave-types/${id}/${isActive ? 'deactivate' : 'activate'}`, { method: 'PATCH' });
      load();
    } catch { setError('Impossible de modifier le statut'); }
  };

  if (loading) return (<div className="admin-page"><div className="loading-container"><div className="loading-spinner"></div><p>Chargement...</p></div></div>);

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Types de Congés</h1>
        <Link to="/admin/leaves/types/new" className="btn btn-primary">Nouveau Type</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="content-card">
        <div className="table-container">
          <table className="data-table">
             <thead><tr><th>Nom</th><th>Description</th><th>Payé</th><th>Max/an</th><th>Préavis</th><th>Simultanées max</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {leaveTypes.map(lt => (
                <tr key={lt.id}>
                  <td><div className="leave-type-name">{lt.color && <span className="color-indicator" style={{backgroundColor: lt.color}}></span>}{lt.name}</div></td>
                  <td className="description-cell">{lt.description}</td>
                  <td><span className={`badge ${lt.isPaid ? 'badge-success' : 'badge-warning'}`}>{lt.isPaid ? 'Payé' : 'Non payé'}</span></td>
                  <td>{lt.maxDaysPerYear ?? '—'}</td>
                  <td>{lt.advanceNoticeDays ?? '—'}</td>
                  <td>{(lt as any).maxConcurrentRequests ?? '—'}</td>
                  <td><span className={`badge ${lt.isActive ? 'badge-success' : 'badge-secondary'}`}>{lt.isActive ? 'Actif' : 'Inactif'}</span></td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/admin/leaves/types/${lt.id}/edit`} className="btn btn-sm btn-outline-secondary">Modifier</Link>
                      <button onClick={() => toggleStatus(lt.id, lt.isActive)} className={`btn btn-sm ${lt.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}>{lt.isActive ? 'Désactiver' : 'Activer'}</button>
                      <button onClick={() => setDeleteConfirm(lt.id)} className="btn btn-sm btn-outline-danger">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {deleteConfirm && (
        <div className="modal-overlay"><div className="modal"><div className="modal-header"><h3>Confirmer</h3></div><div className="modal-body"><p>Supprimer ce type ?</p></div><div className="modal-footer"><button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary">Annuler</button><button onClick={() => handleDelete(deleteConfirm)} className="btn btn-danger">Supprimer</button></div></div></div>
      )}
    </div>
  );
}
