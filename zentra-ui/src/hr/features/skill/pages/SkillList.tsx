import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, del } from '../../../services/api.ts';
import type { SkillDto } from '../../../types';
import '../../qcm/styles/QcmList.css';

export default function SkillList() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [sort, setSort] = useState<'name-asc' | 'name-desc' | 'category'>('name-asc');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadSkills(); }, []);

  async function loadSkills() {
    setRefreshing(true);
    try {
      const data = await get<SkillDto[]>('/skills');
      setSkills(data);
      setError('');
    } catch (e) {
      setError('Cannot load skills');
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const filtered = skills
    .filter(s => {
      const nameMatch = s.name.toLowerCase().includes(filter.toLowerCase());
      const categoryMatch = !categoryFilter || s.category === categoryFilter;
      return nameMatch && categoryMatch;
    })
    .sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      if (sort === 'name-desc') return b.name.localeCompare(a.name);
      if (sort === 'category') return (a.category || '').localeCompare(b.category || '');
      return 0;
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
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={loadSkills} className="btn-secondary" disabled={refreshing} title="Refresh list">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15A9 9 0 1 1 12 3v2"/></svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={() => navigate('/admin/skills/new')} className="btn-primary" title="Create a new skill">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Skill
          </button>
        </div>
      </div>
      {/* Global statistics panel */}
      {skills.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
        }}>
          <StatCard label="Total Skills" value={skills.length} color="#1976d2" />
          <StatCard label="Categories" value={categories.length} color="#9c27b0" />
          <StatCard label="With Description" value={skills.filter(s => s.description && s.description.trim() !== '').length} color="#2e7d32" />
          <StatCard label="Filtered" value={filtered.length} color="#ed6c02" />
        </div>
      )}
      {/* Filters */}
      <div className="filter-bar" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          style={{ flex: '1 1 240px' }}
          placeholder="Search by name..."
          aria-label="Search skill by name"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <select
          style={{ minWidth: '180px' }}
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          style={{ minWidth: '160px' }}
          aria-label="Sort skills"
          value={sort}
          onChange={e => setSort(e.target.value as any)}
        >
          <option value="name-asc">Name A→Z</option>
          <option value="name-desc">Name Z→A</option>
          <option value="category">Category</option>
        </select>
      </div>
      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2>No skills found</h2>
          <p>Adjust filters or create a new skill</p>
          <button onClick={() => navigate('/admin/skills/new')} className="btn-primary">Create a Skill</button>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(skill => (
            <div key={skill.id} style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              position: 'relative',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'box-shadow .2s, transform .2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, lineHeight: 1.3 }}>{skill.name}</h3>
                  {skill.category && (
                    <span style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      marginTop: '0.35rem',
                      display: 'inline-block'
                    }}>{skill.category}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <IconButton label="View" onClick={() => navigate(`/admin/skills/${skill.id}`)} icon={EyeIcon} />
                  <IconButton label="Edit" onClick={() => navigate(`/admin/skills/${skill.id}/edit`)} icon={EditIcon} />
                  <IconButton label="Delete" danger onClick={() => setDeleteConfirm(skill.id)} icon={TrashIcon} />
                </div>
              </div>
              <p style={{
                margin: 0,
                fontSize: '0.75rem',
                lineHeight: 1.4,
                color: '#555'
              }}>{skill.description ? (skill.description.length > 140 ? skill.description.slice(0, 140) + '…' : skill.description) : 'No description provided.'}</p>
              {deleteConfirm === skill.id && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(2px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Confirm deletion</h4>
                  <p style={{ fontSize: '0.7rem', textAlign: 'center', margin: '0.5rem 0 0.75rem' }}>Delete “{skill.name}” permanently?</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setDeleteConfirm(null)} className="btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>Cancel</button>
                    <button onClick={() => handleDelete(skill.id)} className="btn-danger" style={{ padding: '0.4rem 0.75rem' }}>Delete</button>
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

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '0.75rem',
      border: '1px solid #e5e7eb',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.35rem'
    }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '.5px', color: '#555', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function IconButton({ label, onClick, icon: Icon, danger = false }: { label: string; onClick: () => void; icon: any; danger?: boolean }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        background: danger ? '#fef2f2' : '#f1f5f9',
        border: '1px solid ' + (danger ? '#fca5a5' : '#e2e8f0'),
        color: danger ? '#b91c1c' : '#334155',
        padding: '0.35rem',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex'
      }}
    >
      <Icon />
    </button>
  );
}

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
