import { useEffect, useState } from 'react';
import { getCurrentEmployeeId, setCurrentEmployeeId } from '../services/selfService';
import axios from 'axios';

type EmployeeOption = { id: number; employeeNumber?: string; fullName?: string };

interface Props {
  onChange?: (id: number) => void;
import { useState, useEffect } from 'react';
import { get } from '../services/api';
import '../styles/EmployeeSelector.css';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  workEmail: string;
}

export default function EmployeeSelector({ onChange }: Props) {
  const [input, setInput] = useState<string>('');
  const [options, setOptions] = useState<EmployeeOption[]>([]);
interface EmployeeSelectorProps {
  onSelectEmployee: (employeeId: number) => void;
  selectedEmployeeId?: number;
}

export default function EmployeeSelector({ onSelectEmployee, selectedEmployeeId }: EmployeeSelectorProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const current = getCurrentEmployeeId();
    if (current) setInput(String(current));
    // Load first page of employees
    axios
      .get('/api/self/employees', { params: { page: 0, size: 20 } })
      .then((res) => setOptions(res.data))
      .catch(() => setOptions([]));
    loadEmployees();
  }, []);

  const apply = () => {
    const id = Number(input);
    if (!Number.isFinite(id) || id <= 0) return;
    setCurrentEmployeeId(id);
    onChange?.(id);
  };
  const loadEmployees = async () => {
    try {
      // Charger la liste des employés depuis l'API
      const data = await get<Employee[]>('/employees');
      setEmployees(data);

      // Sélectionner le premier employé par défaut si aucun n'est sélectionné
      if (!selectedEmployeeId && data.length > 0) {
        onSelectEmployee(data[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      // En cas d'erreur, créer des employés de test
      const testEmployees: Employee[] = [
        { id: 1, firstName: 'Jean', lastName: 'Dupont', workEmail: 'jean.dupont@zentra.com' },
        { id: 2, firstName: 'Marie', lastName: 'Martin', workEmail: 'marie.martin@zentra.com' },
        { id: 3, firstName: 'Pierre', lastName: 'Lefebvre', workEmail: 'pierre.lefebvre@zentra.com' },
        { id: 4, firstName: 'Sophie', lastName: 'Bernard', workEmail: 'sophie.bernard@zentra.com' },
        { id: 5, firstName: 'Lucas', lastName: 'Moreau', workEmail: 'lucas.moreau@zentra.com' },
      ];
      setEmployees(testEmployees);
      if (!selectedEmployeeId) {
        onSelectEmployee(testEmployees[0].id);
      }
    } finally {
      setLoading(false);
    }
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') apply();
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  if (loading) {
    return (
      <div className="employee-selector-loading">
        <div className="spinner-small"></div>
        <span>Chargement...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
      <label>Employé ID:</label>
      <select
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown as any}
        style={{ minWidth: 220 }}
      >
        <option value="">-- Sélectionner --</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            #{o.id} {o.employeeNumber ? `(${o.employeeNumber})` : ''} {o.fullName ?? ''}
          </option>
        ))}
      </select>
      <button onClick={apply}>Utiliser</button>
    <div className="employee-selector-container">
      <label className="employee-selector-label">
        👤 Employé sélectionné:
      </label>
      <div className="employee-selector-dropdown">
        <button
          className="employee-selector-button"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <div className="selected-employee-info">
            {selectedEmployee ? (
              <>
                <span className="employee-name">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </span>
                <span className="employee-email">{selectedEmployee.workEmail}</span>
              </>
            ) : (
              <span>Sélectionner un employé...</span>
            )}
          </div>
          <svg
            className={`chevron-icon ${isOpen ? 'open' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {isOpen && (
          <>
            <div className="dropdown-overlay" onClick={() => setIsOpen(false)}></div>
            <div className="employee-selector-menu">
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  className={`employee-option ${selectedEmployeeId === employee.id ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectEmployee(employee.id);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <div className="employee-option-content">
                    <span className="employee-option-name">
                      {employee.firstName} {employee.lastName}
                    </span>
                    <span className="employee-option-email">{employee.workEmail}</span>
                  </div>
                  {selectedEmployeeId === employee.id && (
                    <svg
                      className="check-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

