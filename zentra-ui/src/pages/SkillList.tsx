import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, del } from '../services/api';
import type { SkillDto } from '../types';
import '../styles/QcmList.css';

export default function SkillList() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { loadSkills(); }, []);

  async function loadSkills() {
    try {
      const data = await get<SkillDto[]>('/skills');
      setSkills(data);
    } catch (e) {
      setError('Cannot load skills');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await del(`/skills/${id}`);
      setSkills(skills.filter(s => s.id !== id));
      setDeleteConfirm(null);
    } catch (e) {
      setError('Cannot delete skill');
    }
  }

  const filtered = skills.filter(s => {
    const nameMatch = s.name.toLowerCase().includes(filter.toLowerCase());
    const categoryMatch = !categoryFilter || s.category === categoryFilter;
    return nameMatch && categoryMatch;
  });

  const categories = Array.from(new Set(skills.map(s => s.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Skills Repository</h1>
          <p className="page-subtitle">Manage your organizational skills</p>
        </div>
        <button onClick={() => navigate('/admin/skills/new')} className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Skill
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

      <div className="filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input
          style={{ flex: 1 }}
          placeholder="Filter by name..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <select
          style={{ minWidth: '200px' }}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>No skills available</h2>
          <p>Start by creating your first skill</p>
          <button onClick={() => navigate('/admin/skills/new')} className="btn-primary">
            Create a Skill
          </button>
        </div>
      ) : (
        <div className="qcm-grid">
          {filtered.map(skill => (
            <div key={skill.id} className="qcm-card">
              <div className="qcm-card-header">
                <h3>{skill.name}</h3>
                <div className="qcm-card-actions">
                  <button
                    onClick={() => navigate(`/admin/skills/${skill.id}`)}
                    className="btn-icon"
                    title="View details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button
                    onClick={() => navigate(`/admin/skills/${skill.id}/edit`)}
                    className="btn-icon"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(skill.id)}
                    className="btn-icon btn-danger"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {skill.category && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <span className="badge" style={{
                    background: '#e3f2fd',
                    color: '#1976d2',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {skill.category}
                  </span>
                </div>
              )}

              <p className="qcm-description">{skill.description || 'No description'}</p>

              {deleteConfirm === skill.id && (
                <div className="delete-confirm-overlay">
                  <div className="delete-confirm-modal">
                    <h4>Confirm deletion</h4>
                    <p>Are you sure you want to delete this skill?</p>
                    <div className="delete-confirm-actions">
                      <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
                        Cancel
                      </button>
                      <button onClick={() => handleDelete(skill.id)} className="btn-danger">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

