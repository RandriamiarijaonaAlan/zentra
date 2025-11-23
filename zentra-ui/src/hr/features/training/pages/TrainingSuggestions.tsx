import { useEffect, useState } from 'react';
import { get } from '../../../services/api.ts';
import type { TrainingDto, SkillDto, EmployeeSkillDto } from '../../../types';
import EmployeeSelector from '../../employee/components/EmployeeSelector.tsx';

export default function TrainingSuggestions() {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [trainings, setTrainings] = useState<TrainingDto[]>([]);
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkillDto[]>([]);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState<number | 'all'>('all');
  const [maxLevelFilter, setMaxLevelFilter] = useState<number | 'all'>('all');
  const [sort, setSort] = useState<'title-asc' | 'title-desc' | 'level-desc' | 'level-asc'>('title-asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  interface SuggestedItem { training: TrainingDto; gapSkills: number[]; }
  const [suggested, setSuggested] = useState<SuggestedItem[]>([]);

  useEffect(() => {
    // Preload skills for name mapping
    (async () => {
      try {
        const data = await get<SkillDto[]>('/skills');
        setSkills(data);
      } catch {
        // If skills fail to load, we can still show IDs
        setSkills([]);
      }
    })();
  }, []);

  useEffect(() => {
    // Auto-load when an employee is selected, reset when deselected
    if (employeeId == null) {
      setTrainings([]);
      setSuggested([]);
      setEmployeeSkills([]);
      setError('');
      setLoading(false);
      return;
    }
    void loadAll(employeeId);
  }, [employeeId]);

  async function loadAll(empId: number) {
    setLoading(true);
    setError('');
    try {
      const [trainingsData, skillsData, empSkills] = await Promise.all([
        get<TrainingDto[]>(`/trainings/suggestions?employeeId=${empId}`),
        skills.length === 0 ? get<SkillDto[]>('/skills') : Promise.resolve(skills),
        get<EmployeeSkillDto[]>(`/employee-skills/by-employee/${empId}`)
      ]);
      if (skills.length === 0) setSkills(skillsData);
      setEmployeeSkills(empSkills);
      setTrainings(trainingsData);
      // Identify gap skills (targetLevel > current level)
      const gapSkillIds = new Set<number>();
      empSkills.forEach(es => {
        if (es.targetLevel != null && (es.level == null ? 0 : es.level) < es.targetLevel) {
          if (es.skillId != null) gapSkillIds.add(es.skillId);
        }
      });
      const enriched: SuggestedItem[] = trainingsData.map(t => ({
        training: t,
        gapSkills: t.targetSkillIds.filter(id => gapSkillIds.has(id))
      }));
      setSuggested(enriched);
    } catch {
      setError('Cannot load suggestions');
    } finally {
      setLoading(false);
    }
  }

  const skillName = (id: number) => skills.find(s => s.id === id)?.name || String(id);
  const allTargetSkillIds = Array.from(new Set(trainings.flatMap(t => t.targetSkillIds)));
  const gapSkills = employeeSkills.filter(es => es.targetLevel != null && (es.level == null ? 0 : es.level) < es.targetLevel);

  const filtered = suggested
    .filter(item => (search === '' || item.training.title.toLowerCase().includes(search.toLowerCase())))
    .filter(item => (skillFilter === 'all' || item.training.targetSkillIds.includes(skillFilter)))
    .filter(item => (maxLevelFilter === 'all' || item.training.maxLevelReached === maxLevelFilter))
    .sort((a, b) => {
      if (sort === 'title-asc') return a.training.title.localeCompare(b.training.title);
      if (sort === 'title-desc') return b.training.title.localeCompare(a.training.title);
      if (sort === 'level-asc') return a.training.maxLevelReached - b.training.maxLevelReached;
      if (sort === 'level-desc') return b.training.maxLevelReached - a.training.maxLevelReached;
      return 0;
    });

  const gapCount = filtered.reduce((sum, i) => sum + i.gapSkills.length, 0);
  const avgMax = filtered.length > 0 ? (filtered.reduce((s, i) => s + i.training.maxLevelReached, 0) / filtered.length).toFixed(1) : '0';

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Training Suggestions</h1>
          <p className="page-subtitle">Recommended trainings based on employee skill gaps</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            onClick={() => employeeId != null && loadAll(employeeId)}
            disabled={loading || employeeId == null}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', marginBottom: '.35rem' }}>Employee</label>
        <EmployeeSelector
          onSelectEmployee={(id: number) => setEmployeeId(id)}
          selectedEmployeeId={employeeId ?? undefined}
        />
      </div>

      {employeeId != null && trainings.length > 0 && (
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
          <Stat label="Suggestions" value={filtered.length} color="#1976d2" />
          <Stat label="Avg Max Level" value={avgMax} color="#2e7d32" />
          <Stat label="Gap Matches" value={gapCount} color="#ed6c02" />
          <Stat label="Distinct Skills" value={allTargetSkillIds.length} color="#6a1b9a" />
        </div>
      )}

      {/* Filters */}
      {employeeId != null && trainings.length > 0 && (
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
            {allTargetSkillIds.map(id => (
              <option key={id} value={id}>{skillName(id)}</option>
            ))}
          </select>
          <select
            style={{ minWidth: '140px' }}
            value={maxLevelFilter === 'all' ? '' : String(maxLevelFilter)}
            onChange={e => setMaxLevelFilter(e.target.value === '' ? 'all' : parseInt(e.target.value))}
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

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p>Loading...</p>}

      {employeeId != null && !loading && filtered.length === 0 && (
        <div className="empty-state" style={{ padding: '2rem 1rem' }}>
          <h2>No suggestions</h2>
          <p>No training matches current filters or gaps.</p>
        </div>
      )}

      {employeeId != null && gapSkills.length > 0 && (
        <div style={{
          marginBottom: '1.25rem',
          background: '#fff8e1',
          border: '1px solid #ffecb3',
          padding: '1rem',
          borderRadius: '8px'
        }}>
          <strong style={{ display: 'block', marginBottom: '.5rem', color: '#e65100' }}>Employee Skill Gaps</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {gapSkills.slice(0, 12).map(es => (
              <span key={es.id} style={{
                background: '#ffe0b2',
                color: '#e65100',
                padding: '0.25rem 0.6rem',
                borderRadius: '16px',
                fontSize: '0.65rem',
                fontWeight: 600
              }}>
                {skillName(es.skillId!)}: L{es.level || 0}→{es.targetLevel}
              </span>
            ))}
            {gapSkills.length > 12 && (
              <span style={{ fontSize: '0.65rem', color: '#e65100' }}>+{gapSkills.length - 12} more…</span>
            )}
          </div>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
          gap: '1rem'
        }}>
          {filtered.map(item => (
            <div key={item.training.id} style={{
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
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{item.training.title}</h3>
                  <span style={{
                    marginTop: '.35rem',
                    display: 'inline-block',
                    background: '#ffe0b2',
                    color: '#e65100',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '16px',
                    fontSize: '0.65rem',
                    fontWeight: 600
                  }}>Max: {item.training.maxLevelReached}</span>
                </div>
                <button
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.7rem', fontSize: '0.7rem' }}
                  onClick={() => window.location.href = `/admin/trainings/${item.training.id}`}
                >Details</button>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#555', lineHeight: 1.4 }}>
                {item.training.description ? (item.training.description.length > 150 ? item.training.description.slice(0,150)+'…' : item.training.description) : 'No description provided.'}
              </p>
              <div style={{ fontSize: '0.7rem', color: '#444' }}>
                <strong>Target Skills:</strong>{' '}
                {item.training.targetSkillIds.length > 0 ? item.training.targetSkillIds.map(skillName).join(', ') : 'None'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#444' }}>
                <strong>Gap Matches:</strong>{' '}
                {item.gapSkills.length > 0 ? item.gapSkills.map(skillName).join(', ') : 'No direct gap'}
              </div>
            </div>
          ))}
        </div>
      )}
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
