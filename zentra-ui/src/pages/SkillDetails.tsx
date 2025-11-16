import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { get } from '../services/api';
import type { SkillDto, EmployeeSkillDto } from '../types';
import '../styles/QcmDetails.css';

export default function SkillDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [skill, setSkill] = useState<SkillDto | null>(null);
  const [employees, setEmployees] = useState<EmployeeSkillDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadSkillDetails(id);
    }
  }, [id]);

  const loadSkillDetails = async (skillId: string) => {
    try {
      const [skillData, employeeData] = await Promise.all([
        get<SkillDto>(`/skills/${skillId}`),
        get<EmployeeSkillDto[]>(`/employee-skills/by-skill/${skillId}`)
      ]);
      setSkill(skillData);
      setEmployees(employeeData);
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
          <h1>{skill.name}</h1>
          {skill.category && (
            <span className="badge" style={{
              background: '#e3f2fd',
              color: '#1976d2',
              padding: '0.5rem 1rem',
              borderRadius: '16px',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginTop: '0.5rem',
              display: 'inline-block'
            }}>
              {skill.category}
            </span>
          )}
        </div>
        <button onClick={() => navigate(`/admin/skills/${id}/edit`)} className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit Skill
        </button>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <h2>Description</h2>
          <p>{skill.description || 'No description provided'}</p>
        </div>

        <div className="details-card">
          <h2>Employees with this skill ({employees.length})</h2>
          {employees.length === 0 ? (
            <p className="empty-message">No employees have this skill yet</p>
          ) : (
            <div className="employee-list">
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
                    <strong>Employee ID: {emp.employeeId}</strong>
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
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: getLevelColor(emp.level),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}>
                      {getLevelLabel(emp.level)} (Level {emp.level})
                    </div>
                    {emp.targetLevel && emp.targetLevel > emp.level && (
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                        Target: Level {emp.targetLevel}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="details-actions">
        <button onClick={() => navigate('/admin/skills')} className="btn-secondary">
          Back to Skills
        </button>
      </div>
    </div>
  );
}

