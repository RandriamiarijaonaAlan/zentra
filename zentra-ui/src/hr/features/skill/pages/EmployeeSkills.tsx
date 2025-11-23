import { useEffect, useState } from 'react';
import { get } from '../../../services/api.ts';
import type { EmployeeSkillDto, SkillDto } from '../../../types';
import EmployeeSelector from '../../employee/components/EmployeeSelector.tsx';
import '../../qcm/styles/QcmList.css';

export default function EmployeeSkills() {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [skillsIndex, setSkillsIndex] = useState<Record<number, SkillDto>>({});
  const [items, setItems] = useState<EmployeeSkillDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const stats = {
    count: items.length,
    experienceTotal: items.reduce((s,e)=> s + (e.yearsExperience||0),0),
    gaps: items.filter(e=> e.targetLevel && (e.level||0) < e.targetLevel).length,
    avgLevel: items.length>0? (items.reduce((s,e)=> s + (e.level||0),0)/items.length).toFixed(1):'0'
  };

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

      {items.length>0 && (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
          gap:'.75rem',
          background:'#f8f9fa',
          padding:'0.75rem',
          borderRadius:'8px',
          border:'1px solid #e0e0e0',
          marginBottom:'1.25rem'
        }}>
          <Stat label="Skills" value={stats.count} color="#1976d2" />
          <Stat label="Avg Level" value={stats.avgLevel} color="#2e7d32" />
            <Stat label="Gaps" value={stats.gaps} color="#ed6c02" />
            <Stat label="Experience" value={stats.experienceTotal} color="#6a1b9a" />
        </div>
      )}

      {items.length > 0 && (
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.25rem' }}>
          {items.map(es => {
            const skill = es.skillId != null ? skillsIndex[es.skillId] : undefined;
            const gap = es.targetLevel && (es.level||0) < es.targetLevel;
            return (
              <div key={es.id} style={{
                background:'white',
                border:'1px solid #e5e7eb',
                borderRadius:'12px',
                padding:'1rem',
                display:'flex',
                flexDirection:'column',
                gap:'.5rem'
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'.5rem' }}>
                  <div>
                    <h3 style={{ margin:0, fontSize:'0.9rem' }}>{skill?.name || `Skill #${es.skillId}`}</h3>
                    {skill?.category && <span style={{ background:'#dbeafe', color:'#1e40af', padding:'0.25rem 0.6rem', borderRadius:'6px', fontSize:'0.55rem', fontWeight:600 }}>{skill.category}</span>}
                  </div>
                  <span style={{ background:'#f1f5f9', color:'#334155', padding:'0.25rem 0.5rem', borderRadius:'6px', fontSize:'0.55rem' }}>L{es.level||0}</span>
                </div>
                <div style={{ fontSize:'0.65rem', color:'#444' }}>
                  <strong>Level:</strong> {levelLabel(es.level)} {gap && <span style={{ color:'#e65100' }}> → Target L{es.targetLevel}</span>}
                </div>
                {es.yearsExperience != null && <div style={{ fontSize:'0.6rem', color:'#555' }}><strong>Experience:</strong> {es.yearsExperience} yrs</div>}
                {es.lastEvaluationDate && <div style={{ fontSize:'0.6rem', color:'#666' }}><strong>Last eval:</strong> {new Date(es.lastEvaluationDate).toLocaleDateString()}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({label,value,color}:{label:string;value:string|number;color:string}) {
  return (
    <div style={{ background:'white', border:'1px solid #e0e0e0', borderRadius:'8px', padding:'.6rem', textAlign:'center' }}>
      <div style={{ fontSize:'1.1rem', fontWeight:700, color }}>{value}</div>
      <div style={{ fontSize:'.55rem', letterSpacing:'.5px', textTransform:'uppercase', color:'#555', fontWeight:600 }}>{label}</div>
    </div>
  );
}
