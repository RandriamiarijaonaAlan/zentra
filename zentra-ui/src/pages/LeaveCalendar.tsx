import { useState, useEffect } from 'react';
import { get } from '../services/api';
import type { LeaveRequestDto } from '../types';
import EmployeeSelector from '../components/EmployeeSelector';
import '../styles/LeaveCalendar.css';

export default function LeaveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaves, setLeaves] = useState<LeaveRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(1);

  useEffect(() => {
    loadLeaves();
  }, [currentDate, selectedEmployeeId]);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const data = await get<LeaveRequestDto[]>(`/leave-requests/employee/${selectedEmployeeId}/calendar/${year}/${month}`);
      setLeaves(data.filter(leave => leave.status === 'APPROVED'));
    } catch (err: any) {
      console.error('Erreur lors du chargement du calendrier:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    // Convert to Monday-based (0 = Monday, 6 = Sunday)
    let startingDayOfWeek = firstDay.getDay();
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getLeavesForDate = (date: Date) => {
    if (!date) return [];

    const dateStr = date.toISOString().split('T')[0];
    return leaves.filter(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const checkDate = new Date(dateStr);

      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date: Date) => {
    if (!date) return false;
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const renderCalendarDay = (date: Date | null, index: number) => {
    if (!date) {
      return <div key={index} className="calendar-day empty"></div>;
    }

    const dayLeaves = getLeavesForDate(date);
    const isCurrentDay = isToday(date);
    const isWeekendDay = isWeekend(date);

    return (
      <div
        key={index}
        className={`calendar-day ${isCurrentDay ? 'today' : ''} ${isWeekendDay ? 'weekend' : ''}`}
      >
        <div className="day-number">{date.getDate()}</div>

        {dayLeaves.length > 0 && (
          <div className="day-leaves">
            {dayLeaves.slice(0, 3).map((leave, leaveIndex) => (
              <div
                key={leaveIndex}
                className="leave-indicator"
                style={{ backgroundColor: leave.leaveTypeColor || '#007bff' }}
                title={`${leave.employeeName} - ${leave.leaveTypeName}`}
              >
                <span className="leave-text">
                  {leave.employeeName.split(' ').map(n => n[0]).join('.')}
                </span>
              </div>
            ))}
            {dayLeaves.length > 3 && (
              <div className="more-leaves">
                +{dayLeaves.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="leave-calendar">
      <div className="calendar-header">
        <h1>Calendrier des Congés</h1>

        <EmployeeSelector
          selectedEmployeeId={selectedEmployeeId}
          onSelectEmployee={setSelectedEmployeeId}
        />

        <div className="calendar-controls">
          <div className="month-selector">
            <button
              onClick={() => navigateMonth('prev')}
              className="nav-button"
              aria-label="Mois précédent"
            >
              ←
            </button>

            <div className="month-display">
              {formatMonthYear(currentDate)}
            </div>

            <button
              onClick={() => navigateMonth('next')}
              className="nav-button"
              aria-label="Mois suivant"
            >
              →
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="btn btn-primary"
          >
            Aujourd'hui
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du calendrier...</p>
        </div>
      ) : (
        <>
          <div className="calendar-container">
            <div className="calendar-grid">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}

              {getDaysInMonth(currentDate).map((date, index) =>
                renderCalendarDay(date, index)
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="calendar-legend">
            <div className="legend-title">Légende</div>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#007bff' }}></div>
                <span className="legend-label">Congés payés</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#28a745' }}></div>
                <span className="legend-label">RTT</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
                <span className="legend-label">Congés maladie</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#dc3545' }}></div>
                <span className="legend-label">Congés exceptionnels</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
