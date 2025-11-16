import { useEffect, useState } from 'react';
import { get } from '../services/api';
import type { EmployeeSkillDto, SkillDto } from '../types';
import EmployeeSelector from '../components/EmployeeSelector';
import '../styles/QcmList.css';

export default function EmployeeSkills() {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [skillsIndex, setSkillsIndex] = useState<Record<number, SkillDto>>({});
  const [items, setItems] = useState<EmployeeSkillDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Preload skill catalog for name/category display
    (async () => {
      try {
        const skills = await get<SkillDto[]>('/skills');
        const map: Record<number, SkillDto> = {};
        skills.forEach(s => { if (s.id != null) map[s.id] = s; });
        setSkillsIndex(map);
      } catch {
        setSkillsIndex({});
      }
    })();
  }, []);

  useEffect(() => {
    if (employeeId == null) { setItems([]); setError(''); return; }
    void load(employeeId);
  }, [employeeId]);

  async function load(empId: number) {
    setLoading(true);
    setError('');
    try {
      const data = await get<EmployeeSkillDto[]>(`/employee-skills/by-employee/${empId}`);
      setItems(data);
    } catch {
      setError('Cannot load employee skills');
    } finally {
      setLoading(false);
    }
  }

  function levelLabel(level?: number) {
    const labels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
    return level ? labels[level] || `Level ${level}` : 'N/A';
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Employee Skills</h1>
          <p className="page-subtitle">Browse the skills of a selected employee</p>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label>Employee</label>
        <EmployeeSelector
          onSelectEmployee={(id: number) => setEmployeeId(id)}
          selectedEmployeeId={employeeId ?? undefined}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p>Loading...</p>}

      {!loading && employeeId != null && items.length === 0 && (
        <p>No skills found for this employee.</p>
      )}

      {items.length > 0 && (
        <div className="qcm-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {items.map(es => {
            const skill = es.skillId != null ? skillsIndex[es.skillId] : undefined;
            return (
              <div key={es.id} className="qcm-card">
                <div className="qcm-card-header">
                  <h3>{skill?.name || `Skill #${es.skillId}`}</h3>
                </div>
                {skill?.category && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className="badge" style={{ background: '#e3f2fd', color: '#1976d2' }}>{skill.category}</span>
                  </div>
                )}
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div><strong>Level:</strong> {levelLabel(es.level)} ({es.level})</div>
                  {es.targetLevel && <div><strong>Target:</strong> {levelLabel(es.targetLevel)} ({es.targetLevel})</div>}
                  {es.yearsExperience != null && <div><strong>Experience:</strong> {es.yearsExperience} years</div>}
                  {es.lastEvaluationDate && (
                    <div><strong>Last evaluation:</strong> {new Date(es.lastEvaluationDate).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

