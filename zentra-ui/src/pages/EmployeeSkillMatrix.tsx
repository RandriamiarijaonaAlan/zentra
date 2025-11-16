import { useEffect, useState } from 'react';
import { get } from '../services/api';
import type { SkillDto, EmployeeSkillDto } from '../types';
import '../styles/Dashboard.css';

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

      // Load all employee skills by fetching for each skill
      try {
        const allEmployeeSkills: EmployeeSkillDto[] = [];

        // For each skill, get employees who have it
        for (const skill of skillList) {
          try {
            const skillEmployees = await get<EmployeeSkillDto[]>(`/employee-skills/by-skill/${skill.id}`);
            allEmployeeSkills.push(...skillEmployees);
          } catch {
            // Skip if skill has no employees or endpoint fails
          }
        }

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

  const getLevelLabel = (level: number) => {
    const labels = ['Unknown', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
    return labels[level] || 'Unknown';
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
        <button onClick={load} className="btn-primary" disabled={loading}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', marginRight: '0.5rem' }}>
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
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

      {/* Global Statistics */}
      {employeeSkills.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
              {skills.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Total Skills</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#388e3c' }}>
              {new Set(employeeSkills.map(es => es.employeeId)).size}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Unique Employees</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f57c00' }}>
              {employeeSkills.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Skill Assignments</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7b1fa2' }}>
              {employeeSkills.length > 0 ?
                (employeeSkills.reduce((sum, es) => sum + (es.level || 0), 0) / employeeSkills.length).toFixed(1)
                : '0'
              }
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Global Avg Level</div>
          </div>
        </div>
      )}

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredSkills.map(skill => {
          const skillEmployees = employeeSkills.filter(es => es.skillId === skill.id);
          const avgLevel = skillEmployees.length > 0
            ? skillEmployees.reduce((sum, es) => sum + es.level, 0) / skillEmployees.length
            : 0;

          // Group by level for better visualization
          const levelGroups = skillEmployees.reduce((acc, emp) => {
            const level = emp.level || 0;
            if (!acc[level]) acc[level] = 0;
            acc[level]++;
            return acc;
          }, {} as Record<number, number>);

          return (
            <div key={skill.id} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              height: 'fit-content'
            }}>
              {/* Header Section */}
              <div style={{
                borderBottom: '1px solid #f3f4f6',
                paddingBottom: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    lineHeight: '1.4'
                  }}>
                    {skill.name}
                  </h3>
                  <div style={{
                    background: skillEmployees.length > 0 ? '#10b981' : '#6b7280',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    minWidth: '40px',
                    textAlign: 'center'
                  }}>
                    {skillEmployees.length}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {skill.category && (
                    <span style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {skill.category}
                    </span>
                  )}
                  {skillEmployees.length > 0 && (
                    <span style={{
                      background: getLevelColor(Math.round(avgLevel)),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Avg: {avgLevel.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Section */}
              {skillEmployees.length > 0 ? (
                <div style={{ marginBottom: '1.5rem' }}>
                  {/* Level Distribution */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#4b5563'
                    }}>
                      Distribution par niveau
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.5rem'
                    }}>
                      {[1, 2, 3, 4].map(level => {
                        const count = levelGroups[level] || 0;
                        const percentage = skillEmployees.length > 0 ? (count / skillEmployees.length * 100) : 0;

                        return (
                          <div key={level} style={{
                            background: count > 0 ? getLevelColor(level) : '#f3f4f6',
                            color: count > 0 ? 'white' : '#6b7280',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            <div>L{level}: {count}</div>
                            {count > 0 && (
                              <div style={{ fontSize: '0.625rem', opacity: 0.9 }}>
                                {percentage.toFixed(0)}%
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Employees List */}
                  <div>
                    <h4 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#4b5563'
                    }}>
                      Employés ({skillEmployees.length})
                    </h4>
                    <div style={{
                      maxHeight: '140px',
                      overflowY: 'auto',
                      background: '#f9fafb',
                      borderRadius: '6px',
                      padding: '0.5rem'
                    }}>
                      {skillEmployees.slice(0, 8).map((emp, idx) => (
                        <div key={emp.id || idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.375rem 0.5rem',
                          marginBottom: idx < skillEmployees.slice(0, 8).length - 1 ? '0.25rem' : 0,
                          background: 'white',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          border: '1px solid #e5e7eb'
                        }}>
                          <span style={{ fontWeight: '500', color: '#374151' }}>
                            Employé #{emp.employeeId}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>
                              {getLevelLabel(emp.level || 0)}
                            </span>
                            <span style={{
                              padding: '0.125rem 0.5rem',
                              background: getLevelColor(emp.level || 0),
                              color: 'white',
                              borderRadius: '4px',
                              fontWeight: '600',
                              fontSize: '0.625rem'
                            }}>
                              L{emp.level}
                            </span>
                          </div>
                        </div>
                      ))}
                      {skillEmployees.length > 8 && (
                        <div style={{
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          padding: '0.5rem',
                          fontStyle: 'italic'
                        }}>
                          +{skillEmployees.length - 8} employé(s) supplémentaire(s)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem 1rem',
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem'
                  }}>
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div style={{ fontWeight: '500' }}>Aucun employé</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Cette compétence n'est assignée à personne
                  </div>
                </div>
              )}

              {/* Description */}
              {skill.description && (
                <div style={{
                  borderTop: '1px solid #f3f4f6',
                  paddingTop: '1rem',
                  marginTop: '1rem'
                }}>
                  <h4 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#4b5563'
                  }}>
                    Description
                  </h4>
                  <p style={{
                    fontSize: '0.8125rem',
                    color: '#6b7280',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    {skill.description.length > 120
                      ? `${skill.description.slice(0, 120)}...`
                      : skill.description
                    }
                  </p>
                </div>
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

