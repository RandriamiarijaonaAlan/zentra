import { useEffect, useState } from 'react';
import { getCurrentEmployeeId, setCurrentEmployeeId } from '../services/selfService';
import axios from 'axios';

type EmployeeOption = { id: number; employeeNumber?: string; fullName?: string };

interface Props {
  onChange?: (id: number) => void;
}

export default function EmployeeSelector({ onChange }: Props) {
  const [input, setInput] = useState<string>('');
  const [options, setOptions] = useState<EmployeeOption[]>([]);

  useEffect(() => {
    const current = getCurrentEmployeeId();
    if (current) setInput(String(current));
    // Load first page of employees
    axios
      .get('/api/self/employees', { params: { page: 0, size: 20 } })
      .then((res) => setOptions(res.data))
      .catch(() => setOptions([]));
  }, []);

  const apply = () => {
    const id = Number(input);
    if (!Number.isFinite(id) || id <= 0) return;
    setCurrentEmployeeId(id);
    onChange?.(id);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') apply();
  };

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
    </div>
  );
}
