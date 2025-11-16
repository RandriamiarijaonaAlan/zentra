import { useState } from 'react';
import { get } from '../services/api';
import type { TrainingDto } from '../types';

export default function TrainingSuggestions() {
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [trainings, setTrainings] = useState<TrainingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    if (employeeId === '') return;
    setLoading(true);
    setError('');
    try {
      const data = await get<TrainingDto[]>(`/trainings/suggestions?employeeId=${employeeId}`);
      setTrainings(data);
    } catch {
      setError('Cannot load suggestions');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <h1>Training Suggestions</h1>
      <div className="form-group">
        <label>Employee ID</label>
        <input
          type="number"
          value={employeeId}
          onChange={e => setEmployeeId(e.target.value ? parseInt(e.target.value) : '')}
        />
        <button
          className="btn-primary"
          onClick={load}
          disabled={loading || employeeId === ''}
        >
          Load
        </button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p>Loading...</p>}
      {!loading && trainings.length === 0 && employeeId !== '' && <p>No suggestions</p>}
      {trainings.length > 0 && (
        <table className="table-list">
          <thead>
            <tr>
              <th>Title</th>
              <th>Max Level</th>
              <th>Target Skills</th>
            </tr>
          </thead>
          <tbody>
            {trainings.map(t => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.maxLevelReached}</td>
                <td>{t.targetSkillIds.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

