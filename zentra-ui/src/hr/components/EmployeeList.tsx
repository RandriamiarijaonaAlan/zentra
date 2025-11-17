import React from 'react';
import type { EmployeeDto } from '../types/employee';
import { deleteEmployee } from '../services/hrApi';

interface Props { employees: EmployeeDto[]; onDeleted: (id: number) => void; onSelect: (e: EmployeeDto) => void; }

export const EmployeeList: React.FC<Props> = ({ employees, onDeleted, onSelect }) => {
  const remove = async (id?: number) => { if (!id) return; await deleteEmployee(id); onDeleted(id); };
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><tr><th>ID</th><th>Nom</th><th>Email</th><th>Matricule</th><th>Actions</th></tr></thead>
      <tbody>
        {employees.map(e => (
          <tr key={e.id} style={{ borderBottom: '1px solid #ddd' }}>
            <td>{e.id}</td>
            <td>{e.firstName} {e.lastName}</td>
            <td>{e.workEmail}</td>
            <td>{e.employeeNumber}</td>
            <td>
              <button onClick={() => onSelect(e)}>Éditer</button>
              <button onClick={() => remove(e.id)}>Suppr</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

