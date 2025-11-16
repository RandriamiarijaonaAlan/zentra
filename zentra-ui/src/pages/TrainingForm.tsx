import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post, put } from '../services/api';
import type { TrainingDto, SkillDto } from '../types';
import '../styles/QcmForm.css';

export default function TrainingForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';
  const titleRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<TrainingDto>({
    id: isEdit ? 0 : undefined as any,
    title: '',
    description: '',
    maxLevelReached: 2,
    targetSkillIds: [],
  });

  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [isEdit, id]);

  const loadData = async () => {
    try {
      const skillList = await get<SkillDto[]>('/skills');
      setSkills(skillList);

      if (isEdit && id) {
        const data = await get<TrainingDto>(`/trainings/${id}`);
        setFormData(data);
      } else {
        titleRef.current?.focus();
      }
      setLoading(false);
    } catch (err: any) {
      setError('Cannot load data');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Training title is required');
      return;
    }

    if (formData.targetSkillIds.length === 0) {
      setError('Select at least one target skill');
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit) {
        await put('/trainings', formData);
      } else {
        const { id: _omit, ...payload } = formData as any;
        await post('/trainings', payload);
      }
      navigate('/admin/trainings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving training');
      setSubmitting(false);
    }
  };

  const toggleSkill = (skillId: number) => {
    setFormData(prev => ({
      ...prev,
      targetSkillIds: prev.targetSkillIds.includes(skillId)
        ? prev.targetSkillIds.filter(id => id !== skillId)
        : [...prev.targetSkillIds, skillId]
    }));
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

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit Training' : 'New Training'}</h1>
          <p className="page-subtitle">Define a training program for skill development</p>
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

      <form onSubmit={handleSubmit} className="qcm-form">
        <div className="form-section">
          <h2>Training Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="title">
                Training Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Advanced JavaScript Workshop, Leadership Bootcamp"
                required
                ref={titleRef}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="maxLevelReached">
                Maximum Level Reached <span className="required">*</span>
              </label>
              <select
                id="maxLevelReached"
                name="maxLevelReached"
                value={formData.maxLevelReached}
                onChange={(e) => setFormData({ ...formData, maxLevelReached: parseInt(e.target.value) })}
                required
              >
                <option value="1">Level 1 - Beginner</option>
                <option value="2">Level 2 - Intermediate</option>
                <option value="3">Level 3 - Advanced</option>
                <option value="4">Level 4 - Expert</option>
              </select>
              <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                The highest skill level this training can help achieve
              </small>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the training program, duration, objectives..."
                rows={5}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>
            Target Skills <span className="required">*</span>
          </h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Select the skills that this training helps develop
          </p>

          {skills.length === 0 ? (
            <div className="alert alert-info">
              No skills available. Please create skills first.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {skills.map(skill => (
                <label
                  key={skill.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    border: formData.targetSkillIds.includes(skill.id) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: formData.targetSkillIds.includes(skill.id) ? '#e3f2fd' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.targetSkillIds.includes(skill.id)}
                    onChange={() => toggleSkill(skill.id)}
                    style={{ marginRight: '0.75rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{skill.name}</div>
                    {skill.category && (
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                        {skill.category}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/trainings')}
            className="btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Update Training' : 'Create Training'}
          </button>
        </div>
      </form>
    </div>
  );
}