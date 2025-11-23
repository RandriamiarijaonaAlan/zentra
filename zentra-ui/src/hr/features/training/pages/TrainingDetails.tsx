import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { get } from '../../../services/api.ts';
import type { TrainingDto, SkillDto } from '../../../types';
import '../../qcm/styles/QcmDetails.css';

export default function TrainingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [training, setTraining] = useState<TrainingDto | null>(null);
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadTrainingDetails(id);
    }
  }, [id]);

  const loadTrainingDetails = async (trainingId: string) => {
    try {
      const [trainingData, skillData] = await Promise.all([
        get<TrainingDto>(`/trainings/${trainingId}`),
        get<SkillDto[]>('/skills')
      ]);
      setTraining(trainingData);
      setSkills(skillData);
      setLoading(false);
    } catch (err: any) {
      setError('Cannot load training details');
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

  const getTargetSkills = () => {
    if (!training) return [];
    return training.targetSkillIds
      .map(id => skills.find(s => s.id === id))
      .filter(Boolean) as SkillDto[];
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

  if (error || !training) {
    return (
      <div className="admin-page">
        <div className="alert alert-error">{error || 'Training not found'}</div>
        <button onClick={() => navigate('/admin/trainings')} className="btn-secondary">
          Back to Trainings
        </button>
      </div>
    );
  }

  const targetSkills = getTargetSkills();
  const stats = {
    skillCount: targetSkills.length,
    maxLevel: training.maxLevelReached,
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/admin/trainings">Trainings</Link><span>/</span><span>{training.title}</span>
          </div>
          <h1 style={{ marginBottom: '.75rem' }}>{training.title}</h1>
          <span style={{
            background:getLevelColor(training.maxLevelReached),
            color:'white',
            padding:'0.35rem 0.8rem',
            borderRadius:'6px',
            fontSize:'0.7rem',
            fontWeight:600
          }}>Max: {getLevelLabel(training.maxLevelReached)} (L{training.maxLevelReached})</span>
        </div>
        <div style={{ display:'flex', gap:'.5rem' }}>
          <button onClick={() => navigate(`/admin/trainings/${id}/edit`)} className="btn-primary">Edit</button>
          <Link to="/admin/trainings" className="btn-secondary">Back</Link>
        </div>
      </div>

      {/* Stats Panel */}
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
        <Stat label="Target Skills" value={stats.skillCount} color="#1976d2" />
        <Stat label="Max Level" value={stats.maxLevel} color="#ed6c02" />
        <Stat label="Description" value={training.description? (training.description.length>30? training.description.slice(0,30)+'…':'OK'): 'None'} color="#6a1b9a" />
      </div>

      <div style={{ display:'grid', gap:'1.25rem' }}>
        <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'1.25rem' }}>
          <h2 style={{ marginTop:0 }}>Description</h2>
          <p style={{ fontSize:'0.8rem', lineHeight:1.5 }}>{training.description || 'No description provided.'}</p>
        </div>

        <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'1.25rem' }}>
          <h2 style={{ marginTop:0 }}>Target Skills ({targetSkills.length})</h2>
          {targetSkills.length === 0 ? (
            <p style={{ fontSize:'0.75rem', color:'#666' }}>No target skills defined.</p>
          ) : (
            <div style={{ display:'grid', gap:'.75rem', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))' }}>
              {targetSkills.map(s => (
                <button key={s.id} onClick={()=> navigate(`/admin/skills/${s.id}`)} style={{
                  textAlign:'left',
                  border:'1px solid #e0e0e0',
                  background:'white',
                  borderRadius:'8px',
                  padding:'.75rem',
                  cursor:'pointer',
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center'
                }}>
                  <div>
                    <strong style={{ fontSize:'0.75rem'}}>{s.name}</strong>
                    {s.category && <div style={{ fontSize:'0.6rem', color:'#666', marginTop:'.25rem' }}>{s.category}</div>}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height:'16px', color:'#999' }}><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop:'1.5rem', display:'flex', gap:'.75rem' }}>
        <Link to="/admin/trainings/suggestions" className="btn-primary">View Suggestions</Link>
      </div>
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
