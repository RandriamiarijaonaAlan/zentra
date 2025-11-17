import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post, put } from '../../services/api';
import type { BonusDto, SalaryAdvanceDto } from '../types/pay';
import type { EmployeeDto } from '../types/employee';
import './BonusAdvanceManager.css';

export default function BonusAdvanceManager() {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [activeTab, setActiveTab] = useState<'bonus' | 'advance'>('bonus');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Bonus form
  const [bonusForm, setBonusForm] = useState<BonusDto>({
    employeeId: 0,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Advance form
  const [advanceForm, setAdvanceForm] = useState<SalaryAdvanceDto>({
    employeeId: 0,
    amount: 0,
    reason: '',
    requestDate: new Date().toISOString().split('T')[0],
    status: 'PENDING'
  });

  const [advances, setAdvances] = useState<SalaryAdvanceDto[]>([]);

  useEffect(() => {
    loadEmployees();
    if (activeTab === 'advance') {
      loadAdvances();
    }
  }, [activeTab]);

  const loadEmployees = async () => {
    try {
      const data = await get<EmployeeDto[]>('/employees');
      setEmployees(data);
    } catch (err) {
      setError('Erreur lors du chargement des employés');
    }
  };

  const loadAdvances = async () => {
    try {
      // Charger toutes les avances en attente
      const data = await get<SalaryAdvanceDto[]>('/pay/salary-advance');
      setAdvances(data);
    } catch (err) {
      // Endpoint might not exist, ignore error
      setAdvances([]);
    }
  };

  const handleCreateBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await post<BonusDto>('/pay/bonus', bonusForm);
      alert('Prime ajoutée avec succès');
      setShowModal(false);
      setBonusForm({
        employeeId: 0,
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError('Erreur lors de la création de la prime');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await post<SalaryAdvanceDto>('/pay/salary-advance', advanceForm);
      alert('Avance créée avec succès');
      setShowModal(false);
      setAdvanceForm({
        employeeId: 0,
        amount: 0,
        reason: '',
        requestDate: new Date().toISOString().split('T')[0],
        status: 'PENDING'
      });
      loadAdvances();
    } catch (err) {
      setError('Erreur lors de la création de l\'avance');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateAdvance = async (id: number) => {
    try {
      await put(`/pay/salary-advance/${id}/validate`);
      alert('Avance validée');
      loadAdvances();
    } catch (err) {
      setError('Erreur lors de la validation');
    }
  };

  const handleRejectAdvance = async (id: number) => {
    try {
      await put(`/pay/salary-advance/${id}/reject`);
      alert('Avance rejetée');
      loadAdvances();
    } catch (err) {
      setError('Erreur lors du rejet');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getEmployeeName = (employeeId: number) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Inconnu';
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <nav className="breadcrumb">
            <span onClick={() => navigate('/hr/pay')} style={{ cursor: 'pointer' }}>Gestion de Paie</span>
            <i className="fas fa-chevron-right"></i>
            <span>Primes & Avances</span>
          </nav>
          <h1>Gestion des Primes et Avances</h1>
          <p className="page-subtitle">Gérez les primes et les avances sur salaire de vos employés</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <i className="fas fa-plus"></i>
          {activeTab === 'bonus' ? 'Nouvelle Prime' : 'Nouvelle Avance'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
          <button onClick={() => setError('')} className="alert-close">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'bonus' ? 'active' : ''}`}
          onClick={() => setActiveTab('bonus')}
        >
          <i className="fas fa-gift"></i>
          Primes
        </button>
        <button
          className={`tab-btn ${activeTab === 'advance' ? 'active' : ''}`}
          onClick={() => setActiveTab('advance')}
        >
          <i className="fas fa-hand-holding-usd"></i>
          Avances sur Salaire
        </button>
      </div>

      {activeTab === 'advance' && (
        <div className="advances-list">
          {advances.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-inbox"></i>
              </div>
              <h2>Aucune avance en attente</h2>
              <p>Les demandes d'avances apparaîtront ici</p>
            </div>
          ) : (
            <div className="advances-grid">
              {advances.map((advance) => (
                <div key={advance.id} className="advance-card">
                  <div className="advance-header">
                    <h3>{getEmployeeName(advance.employeeId)}</h3>
                    <span className={`status-badge status-${advance.status.toLowerCase()}`}>
                      {advance.status === 'PENDING' ? 'En attente' :
                       advance.status === 'APPROVED' ? 'Approuvée' : 'Rejetée'}
                    </span>
                  </div>
                  <div className="advance-body">
                    <div className="advance-amount">
                      {formatCurrency(advance.amount)}
                    </div>
                    {advance.reason && (
                      <p className="advance-reason">
                        <i className="fas fa-comment"></i>
                        {advance.reason}
                      </p>
                    )}
                    <p className="advance-date">
                      <i className="fas fa-calendar"></i>
                      Demandé le {new Date(advance.requestDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {advance.status === 'PENDING' && (
                    <div className="advance-actions">
                      <button
                        onClick={() => handleValidateAdvance(advance.id!)}
                        className="btn-success"
                      >
                        <i className="fas fa-check"></i>
                        Approuver
                      </button>
                      <button
                        onClick={() => handleRejectAdvance(advance.id!)}
                        className="btn-danger"
                      >
                        <i className="fas fa-times"></i>
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className={`fas fa-${activeTab === 'bonus' ? 'gift' : 'hand-holding-usd'}`}></i>
                {activeTab === 'bonus' ? 'Nouvelle Prime' : 'Nouvelle Avance'}
              </h2>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {activeTab === 'bonus' ? (
              <form onSubmit={handleCreateBonus} className="modal-form">
                <div className="form-group">
                  <label>
                    <i className="fas fa-user"></i>
                    Employé
                  </label>
                  <select
                    value={bonusForm.employeeId}
                    onChange={(e) => setBonusForm({ ...bonusForm, employeeId: parseInt(e.target.value) })}
                    required
                  >
                    <option value={0}>Sélectionner un employé</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.employeeNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-euro-sign"></i>
                    Montant
                  </label>
                  <input
                    type="number"
                    value={bonusForm.amount}
                    onChange={(e) => setBonusForm({ ...bonusForm, amount: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-comment"></i>
                    Motif
                  </label>
                  <textarea
                    value={bonusForm.description}
                    onChange={(e) => setBonusForm({ ...bonusForm, description: e.target.value })}
                    required
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-calendar"></i>
                    Date
                  </label>
                  <input
                    type="date"
                    value={bonusForm.date}
                    onChange={(e) => setBonusForm({ ...bonusForm, date: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Création...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Créer
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateAdvance} className="modal-form">
                <div className="form-group">
                  <label>
                    <i className="fas fa-user"></i>
                    Employé
                  </label>
                  <select
                    value={advanceForm.employeeId}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, employeeId: parseInt(e.target.value) })}
                    required
                  >
                    <option value={0}>Sélectionner un employé</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.employeeNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-euro-sign"></i>
                    Montant
                  </label>
                  <input
                    type="number"
                    value={advanceForm.amount}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, amount: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-comment"></i>
                    Motif
                  </label>
                  <textarea
                    value={advanceForm.reason}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                    required
                    rows={3}
                    placeholder="Raison de la demande d'avance..."
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-calendar"></i>
                    Date de la demande
                  </label>
                  <input
                    type="date"
                    value={advanceForm.requestDate}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, requestDate: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Création...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Créer
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

