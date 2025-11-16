import { useEffect, useState } from 'react';
import { get } from '../services/api';
import type { SkillDto, EmployeeSkillDto } from '../types';
import '../styles/Dashboard.css';

interface EmployeeWithSkills {
  employeeId: number;
  skills: EmployeeSkillDto[];
}

export default function EmployeeSkillMatrix() {
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkillDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const skillList = await get<SkillDto[]>('/skills');
      setSkills(skillList);

      // Load all employee skills (in a real app, you'd want pagination/filtering)
      try {
        const allEmployeeSkills: EmployeeSkillDto[] = [];
        // For now, we'll just show the skills without employee data
        // In production, add an endpoint to get all employee skills aggregated
        setEmployeeSkills(allEmployeeSkills);
      } catch {
        // If endpoint doesn't exist yet, continue with empty array
        setEmployeeSkills([]);
      }
    } catch (err) {
      setError('Cannot load skills matrix');
    } finally {
      setLoading(false);
    }
  }

  const categories = Array.from(new Set(skills.map(s => s.category).filter(Boolean)));
  const filteredSkills = selectedCategory
    ? skills.filter(s => s.category === selectedCategory)
    : skills;

  // Group employee skills by employee
  const employeeMap = new Map<number, EmployeeSkillDto[]>();
  employeeSkills.forEach(es => {
    if (!employeeMap.has(es.employeeId)) {
      employeeMap.set(es.employeeId, []);
    }
    employeeMap.get(es.employeeId)!.push(es);
  });

  const getLevelColor = (level: number) => {
    const colors = ['#f5f5f5', '#ef5350', '#ffa726', '#66bb6a', '#42a5f5'];
    return colors[level] || '#f5f5f5';
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Skills Matrix</h1>
          <p className="page-subtitle">Overview of skills across your organization</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{ minWidth: '200px' }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {filteredSkills.map(skill => {
          const skillEmployees = employeeSkills.filter(es => es.skillId === skill.id);
          const avgLevel = skillEmployees.length > 0
            ? skillEmployees.reduce((sum, es) => sum + es.level, 0) / skillEmployees.length
            : 0;

          return (
            <div key={skill.id} className="dashboard-card" style={{ cursor: 'default', height: 'auto' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{skill.name}</h3>
                {skill.category && (
                  <span style={{
                    background: '#e3f2fd',
                    color: '#1976d2',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {skill.category}
                  </span>
                )}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#f5f5f5',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>Employees</span>
                  <strong style={{ fontSize: '1.25rem' }}>{skillEmployees.length}</strong>
                </div>

                {skillEmployees.length > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    marginTop: '0.5rem',
                    background: getLevelColor(Math.round(avgLevel)),
                    borderRadius: '8px',
                    color: avgLevel > 0 ? 'white' : '#666'
                  }}>
                    <span style={{ fontSize: '0.875rem' }}>Avg Level</span>
                    <strong>{avgLevel.toFixed(1)}</strong>
                  </div>
                )}
              </div>

              {skill.description && (
                <p style={{
                  fontSize: '0.875rem',
                  color: '#666',
                  marginTop: '1rem',
                  lineHeight: '1.5'
                }}>
                  {skill.description.slice(0, 100)}{skill.description.length > 100 ? '...' : ''}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
          </div>
          <h2>No skills found</h2>
          <p>Add skills to see them in the matrix</p>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Level Legend</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { level: 1, label: 'Beginner' },
            { level: 2, label: 'Intermediate' },
            { level: 3, label: 'Advanced' },
            { level: 4, label: 'Expert' }
          ].map(({ level, label }) => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                backgroundColor: getLevelColor(level)
              }}></div>
              <span style={{ fontSize: '0.875rem' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

