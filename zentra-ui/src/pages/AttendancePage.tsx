import { useEffect, useState } from 'react';
import { get } from '../services/api';
import { checkIn, checkOut, getDailyEntries, getReport, type TimeEntryDto, type AttendanceReportDto } from '../services/attendance';
import '../styles/AttendancePage.css';

interface EmployeeDto {
  id: number;
  firstName: string;
  lastName: string;
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [entries, setEntries] = useState<TimeEntryDto[]>([]);
  const [report, setReport] = useState<AttendanceReportDto | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().substring(0, 10);
  const weekAgo = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().substring(0,10); })();
  const [rangeStart, setRangeStart] = useState(weekAgo);
  const [rangeEnd, setRangeEnd] = useState(today);

  useEffect(() => {
    (async () => {
      const data = await get<EmployeeDto[]>('/employees');
      setEmployees(data);
      if (data.length && selectedEmployee === null) {
        setSelectedEmployee(data[0].id);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedEmployee != null) {
      refreshDaily();
      refreshReport();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee, rangeStart, rangeEnd]);

  async function refreshDaily() {
    if (selectedEmployee == null) return;
    const data = await getDailyEntries(selectedEmployee, today);
    setEntries(data);
  }

  async function refreshReport() {
    if (selectedEmployee == null) return;
    const rep = await getReport(selectedEmployee, rangeStart, rangeEnd);
    setReport(rep);
  }

  async function handleCheckIn() {
    if (selectedEmployee == null) return;
    setLoading(true);
    try {
      await checkIn(selectedEmployee);
      await refreshDaily();
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut() {
    if (selectedEmployee == null) return;
    setLoading(true);
    try {
      await checkOut(selectedEmployee);
      await refreshDaily();
      await refreshReport();
    } finally {
      setLoading(false);
    }
  }

  const hasOpen = entries.some(e => e.checkIn && !e.checkOut);

  return (
    <div className="attendance-page">
      <h2>Gestion des présences</h2>
      <div className="employee-selector">
        {employees.map(emp => (
          <button key={emp.id}
                  className={emp.id === selectedEmployee ? 'selected' : ''}
                  onClick={() => setSelectedEmployee(emp.id)}>
            {emp.firstName} {emp.lastName}
          </button>
        ))}
      </div>

      <div className="actions">
        <button disabled={loading || hasOpen || selectedEmployee == null} onClick={handleCheckIn}>Check-In</button>
        <button disabled={loading || !hasOpen || selectedEmployee == null} onClick={handleCheckOut}>Check-Out</button>
        <button onClick={refreshDaily} disabled={loading || selectedEmployee == null}>Rafraîchir</button>
      </div>

      <div className="daily-section">
        <h3>Pointages du jour</h3>
        <table>
          <thead>
          <tr>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Heures</th>
            <th>HS</th>
            <th>Retard (min)</th>
            <th>Pause (min)</th>
          </tr>
          </thead>
          <tbody>
          {entries.map(e => (
            <tr key={e.id} className={e.checkIn && !e.checkOut ? 'open' : ''}>
              <td>{e.checkIn ? new Date(e.checkIn).toLocaleTimeString() : '-'}</td>
              <td>{e.checkOut ? new Date(e.checkOut).toLocaleTimeString() : '-'}</td>
              <td>{e.hoursWorked?.toFixed(2) ?? '-'}</td>
              <td>{e.overtimeHours?.toFixed(2) ?? '-'}</td>
              <td>{e.lateMinutes ?? '-'}</td>
              <td>{e.breakMinutes ?? '-'}</td>
            </tr>
          ))}
          {entries.length === 0 && <tr><td colSpan={6}>Aucun pointage aujourd'hui.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="report-filters">
        <h3>Rapport</h3>
        <label>Début <input type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)} /></label>
        <label>Fin <input type="date" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} /></label>
        <button
          className="export-btn"
          disabled={!selectedEmployee}
          onClick={() => {
            if (!selectedEmployee) return;
            const url = `/api/attendance/report/export?employeeId=${selectedEmployee}&start=${rangeStart}&end=${rangeEnd}`;
            window.open(url, '_blank');
          }}
        >
          Exporter CSV
        </button>
      </div>
      {report && (
        <>
          <div className="report-summary">
            <p>Total heures: <strong>{report.totalHours.toFixed(2)}</strong></p>
            <p>Heures supp: <strong>{report.totalOvertime.toFixed(2)}</strong></p>
            <p>Retards: <strong>{report.totalLateMinutes} min</strong></p>
            <p>Pauses: <strong>{report.totalBreakMinutes} min</strong></p>
          </div>

          <div className="attendance-table-container">
            <h3>Historique des présences</h3>
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Heures</th>
                  <th>HS</th>
                  <th>Retard</th>
                  <th>Pause</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {report.entries && report.entries.length > 0 ? (
                  report.entries.map((e) => (
                    <tr key={e.id}>
                      <td>{e.entryDate}</td>
                      <td>{e.checkIn ? new Date(e.checkIn).toLocaleTimeString() : '-'}</td>
                      <td>{e.checkOut ? new Date(e.checkOut).toLocaleTimeString() : '-'}</td>
                      <td>{e.hoursWorked?.toFixed(2) ?? '-'}</td>
                      <td>{e.overtimeHours?.toFixed(2) ?? '-'}</td>
                      <td>{e.lateMinutes ?? 0} min</td>
                      <td>{e.breakMinutes ?? 0} min</td>
                      <td>{e.entryType ?? '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>Aucun enregistrement sur la période sélectionnée.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
