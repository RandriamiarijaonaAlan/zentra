import { useEffect, useState } from 'react';
import { get, post } from '../../../services/api.ts';
import type { LeaveNotificationDto } from '../../../types';
import EmployeeSelector from '../../employee/components/EmployeeSelector.tsx';

export default function LeaveNotifications() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<LeaveNotificationDto[]>([]);

  useEffect(() => {
    if (selectedEmployeeId) load();
  }, [selectedEmployeeId]);

  async function load() {
    try {
      setLoading(true);
      const data = await get<LeaveNotificationDto[]>(`/leave-notifications/employee/${selectedEmployeeId}`);
      setNotifications(data);
    } catch {
      setError("Impossible de charger les notifications");
    } finally { setLoading(false); }
  }

  async function markAllAsRead() {
    if (!selectedEmployeeId) return;
    try {
      await post(`/leave-notifications/employee/${selectedEmployeeId}/read-all`);
      load();
    } catch {
      setError("Impossible de marquer toutes les notifications comme lues");
    }
  }

  async function markAsRead(id: number) {
    try {
      await post(`/leave-notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      setError("Impossible de marquer la notification comme lue");
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Notifications de Congés</h1>
      </div>

      <EmployeeSelector selectedEmployeeId={selectedEmployeeId} onSelectEmployee={setSelectedEmployeeId} />

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="content-card">
        {loading && <div className="loading-container"><div className="loading-spinner" /><p>Chargement...</p></div>}
        {!loading && notifications.length === 0 && <p>Aucune notification</p>}
        {!loading && notifications.length > 0 && (
          <ul className="notification-list">
            {notifications.map(n => (
              <li key={n.id} className={`notification-item ${n.isRead ? 'read' : 'unread'}`}>
                <div className="notification-message">{n.message}</div>
                <div className="notification-meta">
                  <span>{new Date(n.sentAt).toLocaleString('fr-FR')}</span>
                  {!n.isRead && <button className="btn btn-sm btn-outline-primary" onClick={() => markAsRead(n.id)}>Marquer comme lue</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="actions">
          <button className="btn btn-secondary" onClick={load} disabled={!selectedEmployeeId || loading}>Rafraîchir</button>
          <button className="btn btn-primary" onClick={markAllAsRead} disabled={!selectedEmployeeId || loading}>Tout marquer comme lu</button>
        </div>
      </div>
    </div>
  );
}
