import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, del } from '../services/api';
import type { TrainingDto, SkillDto } from '../types';
import '../styles/QcmList.css';

export default function TrainingList() {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<TrainingDto[]>([]);
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState<number | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [sort, setSort] = useState<'title-asc' | 'title-desc' | 'level-asc' | 'level-desc'>('title-asc');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setRefreshing(true);
    try {
      const [trainingData, skillData] = await Promise.all([
        get<TrainingDto[]>('/trainings'),
        get<SkillDto[]>('/skills')
      ]);
      setTrainings(trainingData);
      setSkills(skillData);
      setError('');
    } catch {
      setError('Cannot load trainings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await del(`/trainings/${id}`);
      setTrainings(trainings.filter(t => t.id !== id));
      setDeleteConfirm(null);
    } catch {
      setError('Delete failed');
    }
  }

  const getSkillNames = (skillIds: number[]) => {
    return skillIds
      .map(id => skills.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getLevelLabel = (level: number) => {
    const labels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
    return labels[level] || 'Unknown';
  };

  const skillName = (id: number) => skills.find(s => s.id === id)?.name || String(id);
  const allTargetSkillIds = Array.from(new Set(trainings.flatMap(t => t.targetSkillIds)));

  const filtered = trainings
    .filter(t => search === '' || t.title.toLowerCase().includes(search.toLowerCase()))
    .filter(t => skillFilter === 'all' || t.targetSkillIds.includes(skillFilter))
    .filter(t => levelFilter === 'all' || t.maxLevelReached === levelFilter)
    .sort((a, b) => {
      if (sort === 'title-asc') return a.title.localeCompare(b.title);
      if (sort === 'title-desc') return b.title.localeCompare(a.title);
      if (sort === 'level-asc') return a.maxLevelReached - b.maxLevelReached;
      if (sort === 'level-desc') return b.maxLevelReached - a.maxLevelReached;
      return 0;
    });

  const avgMax = filtered.length > 0 ? (filtered.reduce((s, t) => s + t.maxLevelReached, 0) / filtered.length).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading trainings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Training Programs</h1>
          <p className="page-subtitle">Manage training and development programs</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={load} className="btn-secondary" disabled={refreshing} title="Refresh trainings">
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={() => navigate('/admin/trainings/new')} className="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Training
          </button>
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

      {trainings.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
          gap: '0.75rem',
          background: '#f8f9fa',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginBottom: '1.25rem'
        }}>
          <Stat label="Total" value={trainings.length} color="#1976d2" />
          <Stat label="Filtered" value={filtered.length} color="#0288d1" />
          <Stat label="Avg Max" value={avgMax} color="#2e7d32" />
          <Stat label="Distinct Skills" value={allTargetSkillIds.length} color="#6a1b9a" />
        </div>
      )}

      {trainings.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            style={{ flex: '1 1 240px' }}
            placeholder="Search title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            style={{ minWidth: '160px' }}
            value={skillFilter === 'all' ? '' : String(skillFilter)}
            onChange={e => setSkillFilter(e.target.value === '' ? 'all' : parseInt(e.target.value))}
          >
            <option value="">All Skills</option>
            {allTargetSkillIds.map(id => <option key={id} value={id}>{skillName(id)}</option>)}
          </select>
          <select
            style={{ minWidth: '140px' }}
            value={levelFilter === 'all' ? '' : String(levelFilter)}
            onChange={e => setLevelFilter(e.target.value === '' ? 'all' : parseInt(e.target.value))}
          >
            <option value="">Any Level</option>
            {[1,2,3,4].map(l => <option key={l} value={l}>Level {l}</option>)}
          </select>
          <select
            style={{ minWidth: '160px' }}
            value={sort}
            onChange={e => setSort(e.target.value as any)}
          >
            <option value="title-asc">Title A→Z</option>
            <option value="title-desc">Title Z→A</option>
            <option value="level-asc">Level ↑</option>
            <option value="level-desc">Level ↓</option>
          </select>
        </div>
      )}

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1.25rem' }}>
        {filtered.map(training => (
          <div key={training.id} style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '.6rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.75rem' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{training.title}</h3>
                <span style={{
                  marginTop: '.35rem',
                  display: 'inline-block',
                  background: '#ffe0b2',
                  color: '#e65100',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '16px',
                  fontSize: '0.65rem',
                  fontWeight: 600
                }}>Max: {training.maxLevelReached}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <ActionIcon label="View" onClick={() => navigate(`/admin/trainings/${training.id}`)} icon={EyeIcon} />
                <ActionIcon label="Edit" onClick={() => navigate(`/admin/trainings/${training.id}/edit`)} icon={EditIcon} />
                <ActionIcon label="Delete" danger onClick={() => setDeleteConfirm(training.id)} icon={TrashIcon} />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#555', lineHeight: 1.4 }}>
              {training.description ? (training.description.length > 150 ? training.description.slice(0,150)+'…' : training.description) : 'No description provided.'}
            </p>
            <div style={{ fontSize: '0.7rem', color: '#444' }}>
              <strong>Target Skills:</strong>{' '}
              {training.targetSkillIds.length > 0 ? training.targetSkillIds.map(skillName).join(', ') : 'None'}
            </div>
            {deleteConfirm === training.id && (
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
                <p style={{ fontSize: '0.7rem', textAlign: 'center', margin: '0.5rem 0 0.75rem' }}>Delete “{training.title}” permanently?</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setDeleteConfirm(null)} className="btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>Cancel</button>
                  <button onClick={() => handleDelete(training.id)} className="btn-danger" style={{ padding: '0.4rem 0.75rem' }}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '.6rem',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '.6rem', letterSpacing: '.5px', textTransform: 'uppercase', color: '#555', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function ActionIcon({ label, onClick, icon: Icon, danger = false }: { label: string; onClick: () => void; icon: any; danger?: boolean }) {
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
