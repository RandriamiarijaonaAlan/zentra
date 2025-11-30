import { useState, useEffect } from 'react';
import { selfServiceApi } from '../services/selfServiceApi';
import type { EmployeeProfile, LeaveBalance, EmployeeOption } from '../services/selfServiceApi';
import '../../../../styles/EmployeeDashboard.css';

interface DashboardStats {
  remainingLeaveDays: number;
  pendingLeaveRequests: number;
  recentPayslips: number;
  pendingDocumentRequests: number;
}

export default function EmployeeDashboard() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    remainingLeaveDays: 0,
    pendingLeaveRequests: 0,
    recentPayslips: 0,
    pendingDocumentRequests: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadDashboardData();
    }
  }, [selectedEmployeeId]);

  const loadEmployees = async () => {
    try {
      const data = await selfServiceApi.listEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    }
  };

  const loadDashboardData = async () => {
    if (!selectedEmployeeId) return;

    setLoading(true);
    try {
      const [profileData, balanceData, leaveRequests, payslips, docRequests] = await Promise.all([
        selfServiceApi.getMyProfile(selectedEmployeeId),
        selfServiceApi.getLeaveBalance(selectedEmployeeId),
        selfServiceApi.getLeaveRequests(selectedEmployeeId),
        selfServiceApi.getPayslips(selectedEmployeeId),
        selfServiceApi.getDocumentRequests(selectedEmployeeId)
      ]);

      setProfile(profileData);
      setLeaveBalance(balanceData);

      setStats({
        remainingLeaveDays: balanceData.remainingDays,
        pendingLeaveRequests: leaveRequests.filter(r => r.status === 'PENDING').length,
        recentPayslips: payslips.length,
        pendingDocumentRequests: docRequests.filter(d => d.status === 'PENDING').length
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="employee-dashboard">
      <div className="dashboard-header">
        <h1>🏠 Espace Employé - Self Service</h1>
        <p className="subtitle">Gérez vos informations personnelles, congés et documents</p>
      </div>

      {/* Sélecteur d'employé */}
      <div className="employee-selector-card">
        <label>Sélectionner un employé :</label>
        <input
          type="text"
          placeholder="Rechercher par nom ou matricule..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedEmployeeId || ''}
          onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
          className="employee-select"
        >
          <option value="">-- Choisir un employé --</option>
          {filteredEmployees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.fullName} ({emp.employeeNumber})
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="loading">Chargement des données...</div>}

      {!loading && selectedEmployeeId && profile && (
        <>
          {/* Informations de profil */}
          <div className="profile-summary">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
              </div>
            </div>
            <div className="profile-info">
              <h2>{profile.firstName} {profile.lastName}</h2>
              <p className="employee-number">Matricule: {profile.employeeNumber}</p>
              <p>📧 {profile.workEmail}</p>
              {profile.workPhone && <p>📱 {profile.workPhone}</p>}
              <p>📅 Date d'embauche: {new Date(profile.hireDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="stats-grid">
            <div className="stat-card leave-card">
              <div className="stat-icon">🏖️</div>
              <div className="stat-content">
                <h3>Jours de congé restants</h3>
                <p className="stat-number">{stats.remainingLeaveDays}</p>
                <small>{leaveBalance?.annualLeaveDays} jours au total</small>
              </div>
            </div>

            <div className="stat-card pending-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Demandes en attente</h3>
                <p className="stat-number">{stats.pendingLeaveRequests}</p>
                <small>Demandes de congé</small>
              </div>
            </div>

            <div className="stat-card payslip-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Bulletins de paie</h3>
                <p className="stat-number">{stats.recentPayslips}</p>
                <small>Bulletins disponibles</small>
              </div>
            </div>

            <div className="stat-card document-card">
              <div className="stat-icon">📄</div>
              <div className="stat-content">
                <h3>Documents demandés</h3>
                <p className="stat-number">{stats.pendingDocumentRequests}</p>
                <small>En cours de traitement</small>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="quick-actions">
            <h3>Actions rapides</h3>
            <div className="actions-grid">
              <a href={`/employee/${selectedEmployeeId}/leave-requests`} className="action-button leave-btn">
                <span className="action-icon">📝</span>
                <span>Demander un congé</span>
              </a>
              <a href={`/employee/${selectedEmployeeId}/payslips`} className="action-button payslip-btn">
                <span className="action-icon">💵</span>
                <span>Voir mes bulletins</span>
              </a>
              <a href={`/employee/${selectedEmployeeId}/documents`} className="action-button doc-btn">
                <span className="action-icon">📑</span>
                <span>Demander un document</span>
              </a>
              <a href={`/employee/${selectedEmployeeId}/profile`} className="action-button profile-btn">
                <span className="action-icon">👤</span>
                <span>Mon profil</span>
              </a>
            </div>
          </div>

          {/* Solde de congés détaillé */}
          {leaveBalance && (
            <div className="leave-balance-detail">
              <h3>💼 Solde de congés {leaveBalance.year}</h3>
              <div className="balance-bars">
                <div className="balance-item">
                  <span className="balance-label">Total annuel</span>
                  <div className="balance-bar">
                    <div className="bar-fill total" style={{ width: '100%' }}>
                      {leaveBalance.annualLeaveDays} jours
                    </div>
                  </div>
                </div>
                <div className="balance-item">
                  <span className="balance-label">Jours utilisés</span>
                  <div className="balance-bar">
                    <div 
                      className="bar-fill used" 
                      style={{ width: `${(leaveBalance.usedDays / leaveBalance.annualLeaveDays) * 100}%` }}
                    >
                      {leaveBalance.usedDays} jours
                    </div>
                  </div>
                </div>
                <div className="balance-item">
                  <span className="balance-label">Jours en attente</span>
                  <div className="balance-bar">
                    <div 
                      className="bar-fill pending" 
                      style={{ width: `${(leaveBalance.pendingDays / leaveBalance.annualLeaveDays) * 100}%` }}
                    >
                      {leaveBalance.pendingDays} jours
                    </div>
                  </div>
                </div>
                <div className="balance-item">
                  <span className="balance-label">Jours restants</span>
                  <div className="balance-bar">
                    <div 
                      className="bar-fill remaining" 
                      style={{ width: `${(leaveBalance.remainingDays / leaveBalance.annualLeaveDays) * 100}%` }}
                    >
                      {leaveBalance.remainingDays} jours
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !selectedEmployeeId && (
        <div className="no-selection">
          <p>👆 Veuillez sélectionner un employé pour afficher son espace self-service</p>
        </div>
      )}
    </div>
  );
}
