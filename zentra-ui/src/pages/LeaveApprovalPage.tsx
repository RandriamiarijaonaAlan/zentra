import { useEffect, useState } from 'react';
import { listLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from '../services/adminLeave.ts';
import type { LeaveRequest } from '../types/selfService.ts';

export default function LeaveApprovalPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const approverId = Number(localStorage.getItem('currentEmployeeId')) || 1; // fallback admin id

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listLeaveRequests('PENDING');
      setRequests(data);
    } catch (e: any) {
      setError(e?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onApprove = async (id: number) => {
    await approveLeaveRequest(id, approverId);
    await load();
  };

  const onReject = async (id: number) => {
    const reason = prompt('Motif de rejet ?') || undefined;
    await rejectLeaveRequest(id, approverId, reason);
    await load();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Validation des congés</h1>
        <button className="btn" onClick={load}>Rafraîchir</button>
      </div>
      {loading && <p>Chargement…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && requests.length === 0 && <p>Aucune demande en attente.</p>}
      {!loading && requests.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Période</th>
                <th>Jours</th>
                <th>Type</th>
                <th>Motif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td>{r.employeeName}</td>
                  <td>{r.startDate} → {r.endDate}</td>
                  <td>{r.days}</td>
                  <td>{r.type}</td>
                  <td>{r.reason}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => onApprove(r.id!)}>Approuver</button>
                    <button className="btn btn-danger" onClick={() => onReject(r.id!)}>Rejeter</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
