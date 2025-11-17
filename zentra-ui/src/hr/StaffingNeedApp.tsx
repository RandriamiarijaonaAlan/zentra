import React, { useEffect, useState } from 'react';
import { listEmployees } from './services/hrApi';
import type { EmployeeDto } from './types/employee';
import { EmployeeForm } from './components/EmployeeForm';
import { EmployeeList } from './components/EmployeeList';
import { ContractManager } from './components/ContractManager';
import { JobHistoryManager } from './components/JobHistoryManager';
import { HRDocumentManager } from './components/HRDocumentManager';

const HRDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [selected, setSelected] = useState<EmployeeDto | undefined>();

  const load = async () => setEmployees(await listEmployees());
  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Gestion RH Simple</h2>
        <EmployeeForm initial={selected} onSaved={() => { setSelected(undefined); load(); }} />
      <EmployeeList employees={employees} onDeleted={(id) => setEmployees(es => es.filter(e => e.id !== id))} onSelect={setSelected} />
      {selected?.id && (
        <>
          <ContractManager employeeId={selected.id} />
          <JobHistoryManager employeeId={selected.id} />
          <HRDocumentManager employeeId={selected.id} />
        </>
      )}
    </div>
  );
};

export default HRDashboard;

// Garder ce dashboard simple pour compatibilité, mais l’entrée principale est maintenant via /admin/hr
