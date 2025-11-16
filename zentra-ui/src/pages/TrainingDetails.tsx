import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { get } from '../services/api';
import type { TrainingDto, SkillDto } from '../types';
import '../styles/QcmDetails.css';

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

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/admin/trainings">Trainings</Link>
            <span>/</span>
            <span>{training.title}</span>
          </div>
          <h1>{training.title}</h1>
          <span className="badge" style={{
            background: getLevelColor(training.maxLevelReached),
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '16px',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginTop: '0.5rem',
            display: 'inline-block'
          }}>
            Max Level: {getLevelLabel(training.maxLevelReached)}
          </span>
        </div>
        <button onClick={() => navigate(`/admin/trainings/${id}/edit`)} className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit Training
        </button>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <h2>Description</h2>
          <p>{training.description || 'No description provided'}</p>
        </div>

        <div className="details-card">
          <h2>Target Skills ({targetSkills.length})</h2>
          {targetSkills.length === 0 ? (
            <p className="empty-message">No target skills defined</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {targetSkills.map((skill) => (
                <div
                  key={skill.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/admin/skills/${skill.id}`)}
                >
                  <div>
                    <strong>{skill.name}</strong>
                    {skill.category && (
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                        {skill.category}
                      </div>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', color: '#999' }}>
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="details-card">
          <h2>Training Information</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                Maximum Level Reached
              </div>
              <div style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                backgroundColor: getLevelColor(training.maxLevelReached),
                color: 'white',
                fontWeight: 600
              }}>
                Level {training.maxLevelReached} - {getLevelLabel(training.maxLevelReached)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                Number of Target Skills
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                {targetSkills.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="details-actions">
        <button onClick={() => navigate('/admin/trainings')} className="btn-secondary">
          Back to Trainings
        </button>
        <Link to="/admin/trainings/suggestions" className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          View Suggestions
        </Link>
      </div>
    </div>
  );
}

