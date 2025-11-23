import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post, put } from '../../../services/api.ts';
import type { LeaveRequestFormDto, LeaveTypeDto, LeaveBalanceDto } from '../../../types';
import EmployeeSelector from '../../employee/components/EmployeeSelector.tsx';
import '../styles/LeaveRequestForm.css';

interface LeaveRequestFormProps {
  employeeId?: number;
}

export default function LeaveRequestForm({ employeeId: initialEmployeeId }: LeaveRequestFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(initialEmployeeId || 1);

  const [formData, setFormData] = useState<LeaveRequestFormDto>({
    id: undefined,
    leaveTypeId: 0,
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDayStart: false,
    isHalfDayEnd: false,
    emergencyContact: ''
  });

  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeDto[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalanceDto[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveTypeDto | null>(null);
  const [calculatedDays, setCalculatedDays] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const isReadOnlyView = isEdit && !window.location.pathname.endsWith('/edit');

  useEffect(() => {
    loadInitialData();
  }, [selectedEmployeeId]);

  useEffect(() => {
    if (isEdit && id) {
      loadLeaveRequest(parseInt(id));
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (formData.leaveTypeId) {
      const leaveType = leaveTypes.find(lt => lt.id === formData.leaveTypeId);
      setSelectedLeaveType(leaveType || null);
    }
  }, [formData.leaveTypeId, leaveTypes]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      calculateDays();
      checkWarnings();
    }
  }, [formData.startDate, formData.endDate, formData.isHalfDayStart, formData.isHalfDayEnd]);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      const year = new Date().getFullYear();
      const [typesData, balancesData] = await Promise.all([
        get<LeaveTypeDto[]>('/leave-types/active'),
        get<LeaveBalanceDto[]>(`/leave-balances/employee/${selectedEmployeeId}?year=${year}`)
      ]);
      // Fallback si pas de types actifs
      if (!typesData || typesData.length === 0) {
        try {
          const allTypes = await get<LeaveTypeDto[]>('/leave-types');
          setLeaveTypes(allTypes);
        } catch {
          setLeaveTypes([]);
        }
      } else {
        setLeaveTypes(typesData);
      }
      if (!balancesData || balancesData.length === 0) {
        try {
          await post(`/leave-balances/employee/${selectedEmployeeId}/initialize?year=${year}`);
          const reloaded = await get<LeaveBalanceDto[]>(`/leave-balances/employee/${selectedEmployeeId}?year=${year}`);
          setLeaveBalances(reloaded);
        } catch {
          setLeaveBalances([]);
        }
      } else {
        setLeaveBalances(balancesData);
      }
    } catch (err: any) {
      setError(`Impossible de charger les données: ${err.response?.status || ''} ${err.response?.data?.message || ''}`.trim());
    } finally {
      setInitialLoading(false);
    }
  };

  const loadLeaveRequest = async (requestId: number) => {
    try {
      setLoading(true);
      const data = await get<any>(`/leave-requests/${requestId}`);
      setFormData({
        id: data.id,
        leaveTypeId: data.leaveTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason || '',
        isHalfDayStart: data.isHalfDayStart,
        isHalfDayEnd: data.isHalfDayEnd,
        emergencyContact: data.emergencyContact || ''
      });
    } catch (err: any) {
      setError('Impossible de charger la demande de congé');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) {
      setCalculatedDays(0);
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (start > end) {
      setCalculatedDays(0);
      return;
    }

    // Calcul simplifié des jours ouvrés (exclut weekends)
    let days = 0;
    let current = new Date(start);

    while (current <= end) {
      // 1-5 = Lundi à Vendredi
      if (current.getDay() >= 1 && current.getDay() <= 5) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }

    // Ajustement pour les demi-journées
    if (formData.isHalfDayStart && days > 0) {
      days -= 0.5;
    }
    if (formData.isHalfDayEnd && days > 0) {
      days -= 0.5;
    }

    setCalculatedDays(Math.max(0, days));
  };

  const checkWarnings = async () => {
    const newWarnings: string[] = [];

    if (!formData.startDate || !formData.endDate || !formData.leaveTypeId) {
      setWarnings([]);
      return;
    }

    const startDate = new Date(formData.startDate);
    const today = new Date();

    // Vérification du préavis
    if (selectedLeaveType?.advanceNoticeDays) {
      const requiredDate = new Date(today);
      requiredDate.setDate(today.getDate() + selectedLeaveType.advanceNoticeDays);

      if (startDate < requiredDate) {
        newWarnings.push(`Ce type de congé nécessite un préavis de ${selectedLeaveType.advanceNoticeDays} jours.`);
      }
    }

    // Vérification du solde
    const balance = leaveBalances.find(b => b.leaveTypeId === formData.leaveTypeId);
    if (balance && calculatedDays > balance.remainingDays) {
      newWarnings.push(`Solde insuffisant. Disponible: ${balance.remainingDays} jour(s), Demandé: ${calculatedDays} jour(s).`);
    }

    // Vérification des chevauchements (simplifié)
    try {
      const overlapping = await get<any[]>(`/leave-requests/overlapping?startDate=${formData.startDate}&endDate=${formData.endDate}&excludeEmployeeId=${selectedEmployeeId}`);
      if (overlapping.length > 0) {
        newWarnings.push(`${overlapping.length} autre(s) employé(s) ont des congés sur cette période.`);
      }
    } catch (err) {
      // Ignore les erreurs de vérification des chevauchements
    }

    setWarnings(newWarnings);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'leaveTypeId') {
      setFormData({ ...formData, [name]: parseInt(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validations
    if (!formData.leaveTypeId) {
      setError('Veuillez sélectionner un type de congé');
      setLoading(false);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Veuillez sélectionner les dates de début et fin');
      setLoading(false);
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('La date de début doit être antérieure à la date de fin');
      setLoading(false);
      return;
    }

    if (calculatedDays <= 0) {
      setError('La période sélectionnée ne contient aucun jour ouvré');
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await put(`/leave-requests/employee/${selectedEmployeeId}`, formData);
      } else {
        await post(`/leave-requests/employee/${selectedEmployeeId}`, formData);
      }
      navigate('/admin/leaves/requests');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentBalance = () => {
    if (!formData.leaveTypeId) return null;
    return leaveBalances.find(b => b.leaveTypeId === formData.leaveTypeId);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{isEdit ? 'Modifier la Demande de Congé' : 'Nouvelle Demande de Congé'}</h1>
      </div>

      {!initialEmployeeId && (
        <EmployeeSelector
          selectedEmployeeId={selectedEmployeeId}
          onSelectEmployee={setSelectedEmployeeId}
        />
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="icon-warning"></i>
          {error}
        </div>
      )}

      {initialLoading && (
        <div className="loading-container"><div className="loading-spinner"></div><p>Chargement des données...</p></div>
      )}

      {!initialLoading && leaveTypes.length === 0 && !error && (
        <div className="alert alert-warning">
          Aucun type de congé disponible. <a href="/admin/leaves/types/new">Créer un type de congé</a>.
        </div>
      )}

      {warnings.length > 0 && (
        <div className="alert alert-warning">
          <i className="icon-info"></i>
          <strong>Attention:</strong>
          <ul>
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="content-card">
        <form onSubmit={handleSubmit} className="leave-request-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="leaveTypeId">Type de congé *</label>
              <select
                id="leaveTypeId"
                name="leaveTypeId"
                value={formData.leaveTypeId}
                onChange={handleInputChange}
                className="form-control"
                required
                disabled={isReadOnlyView}
              >
                <option value="">Sélectionnez un type de congé</option>
                {leaveTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} {type.isPaid ? '(Payé)' : '(Non payé)'}
                  </option>
                ))}
              </select>
            </div>

            {getCurrentBalance() && (
              <div className="balance-info">
                <h4>Solde disponible</h4>
                <div className="balance-details">
                  <span className="balance-amount">{getCurrentBalance()?.remainingDays}</span>
                  <span className="balance-unit">jour(s)</span>
                </div>
                <small className="text-muted">
                  Utilisé: {getCurrentBalance()?.usedDays} |
                  En attente: {getCurrentBalance()?.pendingDays}
                </small>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Date de début *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="form-control"
                required
                min={new Date().toISOString().split('T')[0]}
                disabled={isReadOnlyView}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">Date de fin *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="form-control"
                required
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                disabled={isReadOnlyView}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isHalfDayStart"
                  checked={formData.isHalfDayStart}
                  onChange={handleInputChange}
                  disabled={isReadOnlyView}
                />
                <span className="checkmark"></span>
                Demi-journée le premier jour
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isHalfDayEnd"
                  checked={formData.isHalfDayEnd}
                  onChange={handleInputChange}
                  disabled={isReadOnlyView}
                />
                <span className="checkmark"></span>
                Demi-journée le dernier jour
              </label>
            </div>
          </div>

          {calculatedDays > 0 && (
            <div className="calculated-days">
              <h4>Durée calculée</h4>
              <div className="days-display">
                <span className="days-count">{calculatedDays}</span>
                <span className="days-unit">jour{calculatedDays !== 1 ? 's' : ''} ouvré{calculatedDays !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reason">Motif</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="form-control"
              rows={3}
              placeholder="Motif de la demande de congé (optionnel)..."
              disabled={isReadOnlyView}
            />
          </div>

          <div className="form-group">
            <label htmlFor="emergencyContact">Contact d'urgence</label>
            <input
              type="text"
              id="emergencyContact"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Numéro de téléphone ou email en cas d'urgence"
              disabled={isReadOnlyView}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/leaves/requests')}
              className="btn btn-secondary"
            >
              {isReadOnlyView ? 'Retour' : 'Annuler'}
            </button>
            {!isReadOnlyView && (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || calculatedDays <= 0}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sauvegarde...
                  </>
                ) : (
                  isEdit ? 'Modifier' : 'Soumettre la demande'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
