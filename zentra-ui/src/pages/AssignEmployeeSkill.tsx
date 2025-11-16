import { useEffect, useState } from 'react';
import { get, post } from '../services/api';
import type { SkillDto } from '../types';
import EmployeeSelector from '../components/EmployeeSelector';
import '../styles/QcmForm.css';

export default function AssignEmployeeSkill() {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [skillId, setSkillId] = useState<number | ''>('');
  const [level, setLevel] = useState<number>(1);
  const [targetLevel, setTargetLevel] = useState<number | ''>('');
  const [evaluationMethod, setEvaluationMethod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await get<SkillDto[]>('/skills');
      setSkills(data);
    } catch {
      setError('Cannot load skills');
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!employeeId) return setError('Select an employee');
    if (skillId === '') return setError('Select a skill');

    setSubmitting(true);
    try {
      const params = new URLSearchParams();
      params.set('employeeId', String(employeeId));
      params.set('skillId', String(skillId));
      params.set('level', String(level));
      if (targetLevel !== '') params.set('targetLevel', String(targetLevel));
      if (evaluationMethod.trim()) params.set('evaluationMethod', evaluationMethod.trim());

      await post(`/employee-skills?${params.toString()}`);
      setSuccess('Skill assigned successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  }

  const selectedSkill = skills.find(s=> s.id === skillId);

  if (loading) return <div className="admin-page"><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Assign Skill to Employee</h1>
          <p className="page-subtitle">Select an employee, a skill, and the level</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display:'grid', gap:'1.25rem', gridTemplateColumns:'minmax(0,1fr) 300px' }}>
        <form onSubmit={handleAssign} className="qcm-form" style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'1.25rem' }}>
          <div className="form-section" style={{ marginBottom:'1rem' }}>
            <h2 style={{ marginTop:0 }}>Assignment</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Employee <span className="required">*</span></label>
                <EmployeeSelector onSelectEmployee={id => setEmployeeId(id)} selectedEmployeeId={employeeId ?? undefined} />
              </div>
              <div className="form-group full-width">
                <label htmlFor="skill">Skill <span className="required">*</span></label>
                <select id="skill" name="skill" value={skillId} onChange={e => setSkillId(e.target.value ? parseInt(e.target.value) : '')}>
                  <option value="">Select a skill</option>
                  {skills.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="level">Level <span className="required">*</span></label>
                <select id="level" name="level" value={level} onChange={e => setLevel(parseInt(e.target.value))}>
                  <option value={1}>1 - Beginner</option>
                  <option value={2}>2 - Intermediate</option>
                  <option value={3}>3 - Advanced</option>
                  <option value={4}>4 - Expert</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="targetLevel">Target Level</label>
                <select id="targetLevel" name="targetLevel" value={targetLevel} onChange={e => setTargetLevel(e.target.value ? parseInt(e.target.value) : '')}>
                  <option value="">None</option>
                  <option value={1}>1 - Beginner</option>
                  <option value={2}>2 - Intermediate</option>
                  <option value={3}>3 - Advanced</option>
                  <option value={4}>4 - Expert</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label htmlFor="evaluationMethod">Evaluation Method</label>
                <input id="evaluationMethod" name="evaluationMethod" placeholder="e.g., Manager Review, Certification, Test" value={evaluationMethod} onChange={e => setEvaluationMethod(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>Assign</button>
          </div>
        </form>
        <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'1.25rem' }}>
          <h2 style={{ marginTop:0 }}>Preview</h2>
          {!employeeId && <p style={{ fontSize:'0.75rem', color:'#666' }}>Select an employee.</p>}
          {!selectedSkill && <p style={{ fontSize:'0.75rem', color:'#666' }}>Select a skill.</p>}
          {selectedSkill && (
            <div style={{ fontSize:'0.7rem', lineHeight:1.5 }}>
              <strong>{selectedSkill.name}</strong>
              {selectedSkill.category && <div style={{ fontSize:'0.6rem', color:'#666', marginTop:'.25rem' }}>{selectedSkill.category}</div>}
              <div style={{ marginTop:'.5rem' }}>Assigned Level: L{level}</div>
              {targetLevel !== '' && <div>Target Level: L{targetLevel}</div>}
              {evaluationMethod && <div>Method: {evaluationMethod}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
