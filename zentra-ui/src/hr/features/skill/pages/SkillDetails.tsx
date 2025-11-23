import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { get } from '../../../services/api.ts';
import type { SkillDto, EmployeeSkillDto, EmployeeDto } from '../../../types';
import '../../qcm/styles/QcmDetails.css';

export default function SkillDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [skill, setSkill] = useState<SkillDto | null>(null);
  const [employees, setEmployees] = useState<EmployeeSkillDto[]>([]);
  const [employeesDirectory, setEmployeesDirectory] = useState<Record<number, EmployeeDto>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadSkillDetails(id);
    }
  }, [id]);

  const loadSkillDetails = async (skillId: string) => {
    try {
      const [skillData, employeeData, directory] = await Promise.all([
        get<SkillDto>(`/skills/${skillId}`),
        get<EmployeeSkillDto[]>(`/employee-skills/by-skill/${skillId}`),
        get<EmployeeDto[]>('/employees').catch(() => [])
      ]);
      setSkill(skillData);
      setEmployees(employeeData);
      if (Array.isArray(directory)) {
        const map: Record<number, EmployeeDto> = {} as any;
        (directory as EmployeeDto[]).forEach(e => { if (e && typeof e.id === 'number') map[e.id] = e; });
        setEmployeesDirectory(map);
      }
      setLoading(false);
    } catch (err: any) {
      setError('Cannot load skill details');
      setLoading(false);
    }
  };

  const getLevelLabel = (level: number) => {
    const labels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
    return labels[level] || 'Unknown';
  };

  const getLevelColor = (level: number) => {
    const colors = ['', '#ef5350', '#ffa726', '#66bb6a', '#42a5f5'];
    return colors[level] || '#999';
  };

  const avgLevel = employees.length > 0 ? (employees.reduce((s,e)=> s + (e.level||0),0)/employees.length).toFixed(1) : '0';
  const levelGroups = employees.reduce((acc, e) => { const l = e.level||0; acc[l] = (acc[l]||0)+1; return acc;}, {} as Record<number,number>);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="admin-page">
        <div className="alert alert-error">{error || 'Skill not found'}</div>
        <button onClick={() => navigate('/admin/skills')} className="btn-secondary">
          Back to Skills
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/admin/skills">Skills</Link>
            <span>/</span>
            <span>{skill.name}</span>
          </div>
          <h1 style={{ marginBottom: '.75rem' }}>{skill.name}</h1>
          {skill.category && (
            <span style={{
              background: '#dbeafe',
              color: '#1e40af',
              padding: '0.35rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: 600
            }}>{skill.category}</span>
          )}
        </div>
        <button onClick={() => navigate(`/admin/skills/${id}/edit`)} className="btn-primary">Edit Skill</button>
      </div>

      {/* Stats Panel */}
      {employees.length > 0 && (
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
          <Stat label="Employees" value={employees.length} color="#1976d2" />
          <Stat label="Avg Level" value={avgLevel} color="#2e7d32" />
          <Stat label="With Target" value={employees.filter(e=> e.targetLevel && e.targetLevel> (e.level||0)).length} color="#ed6c02" />
          <Stat label="Experience Yrs" value={employees.reduce((s,e)=> s + (e.yearsExperience||0),0)} color="#6a1b9a" />
        </div>
      )}

      <div style={{ display:'grid', gap:'1.25rem' }}>
        <div style={{
          background:'white',
          border:'1px solid #e5e7eb',
          borderRadius:'12px',
          padding:'1.25rem'
        }}>
          <h2 style={{ marginTop:0 }}>Description</h2>
          <p style={{ fontSize:'0.8rem', lineHeight:1.5 }}>{skill.description || 'No description provided.'}</p>
          {employees.length>0 && (
            <div style={{ marginTop:'1.25rem' }}>
              <h3 style={{ fontSize:'0.9rem', margin:'0 0 .5rem' }}>Level Distribution</h3>
              <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                {[1,2,3,4].map(l => (
                  <div key={l} style={{
                    background: levelGroups[l]? getLevelColor(l): '#f3f4f6',
                    color: levelGroups[l]? 'white':'#6b7280',
                    padding:'0.45rem 0.65rem',
                    borderRadius:'6px',
                    fontSize:'0.65rem',
                    fontWeight:600
                  }}>L{l}: {levelGroups[l]||0}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{
          background:'white',
          border:'1px solid #e5e7eb',
          borderRadius:'12px',
          padding:'1.25rem'
        }}>
          <h2 style={{ marginTop:0 }}>Employees ({employees.length})</h2>
          {employees.length === 0 ? (
            <p style={{ fontSize:'0.75rem', color:'#666' }}>No employees have this skill yet.</p>
          ) : (
            <div style={{ display:'grid', gap:'.75rem' }}>
              {employees.map((emp) => (
                <div key={emp.id} className="employee-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  marginBottom: '0.75rem'
                }}>
                  <div>
                    <strong>
                      {employeesDirectory[emp.employeeId]
                        ? `${employeesDirectory[emp.employeeId].firstName} ${employeesDirectory[emp.employeeId].lastName}`
                        : `Employee ID: ${emp.employeeId}`}
                    </strong>
                    {employeesDirectory[emp.employeeId]?.workEmail && (
                      <div style={{ fontSize: '0.8rem', color: '#777' }}>
                        {employeesDirectory[emp.employeeId].workEmail}
                      </div>
                    )}
                    {emp.yearsExperience && (
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                        {emp.yearsExperience} years of experience
                      </div>
                    )}
                    {emp.lastEvaluationDate && (
                      <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                        Last evaluated: {new Date(emp.lastEvaluationDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <span style={{
                      display:'inline-block',
                      background:getLevelColor(emp.level||0),
                      color:'white',
                      padding:'0.35rem 0.6rem',
                      borderRadius:'6px',
                      fontSize:'0.65rem',
                      fontWeight:600
                    }}>{getLevelLabel(emp.level||0)} (L{emp.level||0})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop:'1.5rem', display:'flex', gap:'.75rem' }}>
        <button onClick={() => navigate('/admin/skills')} className="btn-secondary">Back</button>
        <button onClick={() => navigate(`/admin/skills/${id}/edit`)} className="btn-primary">Edit</button>
      </div>
    </div>
  );
}

function Stat({label,value,color}:{label:string;value:string|number;color:string}) {
  return (
    <div style={{
      background:'white',
      border:'1px solid #e0e0e0',
      borderRadius:'8px',
      padding:'.6rem',
      textAlign:'center'
    }}>
      <div style={{ fontSize:'1.1rem', fontWeight:700, color }}>{value}</div>
      <div style={{ fontSize:'.55rem', letterSpacing:'.5px', textTransform:'uppercase', color:'#555', fontWeight:600 }}>{label}</div>
    </div>
  );
}
