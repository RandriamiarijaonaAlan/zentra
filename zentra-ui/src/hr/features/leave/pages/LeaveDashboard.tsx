import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../../services/api.ts';
import type { EmployeeLeaveOverviewDto, LeaveNotificationDto } from '../../../types';
import EmployeeSelector from '../../employee/components/EmployeeSelector.tsx';
import '../styles/LeaveDashboard.css';

interface Props { employeeId?: number; }

export default function LeaveDashboard({ employeeId: initialEmployeeId }: Props) {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(initialEmployeeId || 1);
    const [overview, setOverview] = useState<EmployeeLeaveOverviewDto | null>(null);
    const [notifications, setNotifications] = useState<LeaveNotificationDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { load(); }, [selectedEmployeeId]);

    async function load() {
        setLoading(true);
        setError('');
        try {
            const [o, n] = await Promise.all([
                get<EmployeeLeaveOverviewDto>(`/leave-balances/employee/${selectedEmployeeId}/overview`),
                get<LeaveNotificationDto[]>(`/leave-notifications/employee/${selectedEmployeeId}/unread`)
            ]);
            setOverview(o); setNotifications(n);
        } catch { setError('Impossible de charger le tableau de bord'); }
        finally { setLoading(false); }
    }

    const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR');
    const badge = (s: string) => s === 'APPROVED' ? 'badge-success' : s === 'PENDING' ? 'badge-warning' : s === 'REJECTED' ? 'badge-danger' : 'badge-secondary';
    const txt = (s: string) => s === 'APPROVED' ? 'Approuvé' : s === 'PENDING' ? 'En attente' : s === 'REJECTED' ? 'Rejeté' : s;

    if (loading) return (<div className="dashboard-loading"><div className="loading-spinner"></div><p>Chargement...</p></div>);
    if (error) return (<div className="dashboard-error"><i className="icon-warning"></i><p>{error}</p></div>);

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
                            </div>
                            <div className="balance-progress"><div className="progress-bar" style={{width: `${Math.min(100, (Number(b.usedDays)/Number(b.allocatedDays)) * 100)}%`}}></div></div>
                        </div>
                    ))}
                </div>
            </div>

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

            <div className="quick-actions-section">
                <h2>Actions Rapides</h2>
                <div className="quick-actions-grid">
                    <Link to="/admin/leaves/requests/new" className="quick-action-card"><i className="icon-plus"></i><span>Nouvelle demande</span></Link>
                    <Link to="/admin/leaves/requests" className="quick-action-card"><i className="icon-list"></i><span>Mes demandes</span></Link>
                    <Link to="/admin/leaves/calendar" className="quick-action-card"><i className="icon-calendar"></i><span>Calendrier</span></Link>
                    <Link to="/admin/leaves/types" className="quick-action-card"><i className="icon-bar-chart"></i><span>Types</span></Link>
                </div>
            </div>
        </div>
    );
}