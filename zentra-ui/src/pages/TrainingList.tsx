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

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [trainingData, skillData] = await Promise.all([
        get<TrainingDto[]>('/trainings'),
        get<SkillDto[]>('/skills')
      ]);
      setTrainings(trainingData);
      setSkills(skillData);
    } catch {
      setError('Cannot load trainings');
    } finally {
      setLoading(false);
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
        <button onClick={() => navigate('/admin/trainings/new')} className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Training
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

      {trainings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
          </div>
          <h2>No training programs</h2>
          <p>Start by creating your first training program</p>
          <button onClick={() => navigate('/admin/trainings/new')} className="btn-primary">
            Create a Training
          </button>
        </div>
      ) : (
        <div className="qcm-grid">
          {trainings.map(training => (
            <div key={training.id} className="qcm-card">
              <div className="qcm-card-header">
                <h3>{training.title}</h3>
                <div className="qcm-card-actions">
                  <button
                    onClick={() => navigate(`/admin/trainings/${training.id}`)}
                    className="btn-icon"
                    title="View details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button
                    onClick={() => navigate(`/admin/trainings/${training.id}/edit`)}
                    className="btn-icon"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(training.id)}
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

              <div style={{ marginBottom: '0.75rem' }}>
                <span className="badge" style={{
                  background: '#fff3e0',
                  color: '#e65100',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Max Level: {getLevelLabel(training.maxLevelReached)}
                </span>
              </div>

              <p className="qcm-description">{training.description || 'No description'}</p>

              <div className="qcm-footer" style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  <strong>Target Skills:</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    {training.targetSkillIds.length > 0 ? getSkillNames(training.targetSkillIds) : 'None'}
                  </div>
                </div>
              </div>

              {deleteConfirm === training.id && (
                <div className="delete-confirm-overlay">
                  <div className="delete-confirm-modal">
                    <h4>Confirm deletion</h4>
                    <p>Are you sure you want to delete this training?</p>
                    <div className="delete-confirm-actions">
                      <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
                        Cancel
                      </button>
                      <button onClick={() => handleDelete(training.id)} className="btn-danger">
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
