import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post, put } from '../services/api';
import type { SkillDto } from '../types';
import '../styles/QcmForm.css';

export default function SkillForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const [formData, setFormData] = useState<SkillDto>({
    id: 0,
    name: '',
    description: '',
    category: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      loadSkill(id);
    }
  }, [isEdit, id]);

  const loadSkill = async (skillId: string) => {
    try {
      const data = await get<SkillDto>(`/skills/${skillId}`);
      setFormData(data);
      setLoading(false);
    } catch (err: any) {
      setError('Cannot load skill');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Skill name is required');
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit) {
        await put('/skills', formData);
      } else {
        const { id: _omit, ...payload } = formData as any;
        await post('/skills', payload);
      }
      navigate('/admin/skills');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving skill');
      setSubmitting(false);
    }
  };

  const preview = {
    name: formData.name || 'Untitled Skill',
    category: formData.category || '—',
    desc: formData.description?.slice(0,120) || 'No description yet.'
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
          <h1>{isEdit ? 'Edit Skill' : 'New Skill'}</h1>
          <p className="page-subtitle">Define a skill for your organization</p>
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

      <div style={{ display:'grid', gap:'1.25rem', gridTemplateColumns:'minmax(0,1fr) 340px' }}>
        <form onSubmit={handleSubmit} className="qcm-form" style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'1.25rem' }}>
          <div className="form-section">
            <h2 style={{ marginTop:0 }}>Skill Information</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="name">
                  Skill Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., JavaScript, Project Management, Communication"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select a category</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="BEHAVIORAL">Behavioral</option>
                  <option value="BUSINESS">Business</option>
                  <option value="MANAGEMENT">Management</option>
                  <option value="LANGUAGE">Language</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the skill and its requirements..."
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/skills')}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Skill' : 'Create Skill'}
            </button>
          </div>
        </form>
        <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'1.25rem' }}>
          <h2 style={{ marginTop:0 }}>Preview</h2>
          <div style={{ fontSize:'0.75rem', lineHeight:1.5 }}>
            <strong>{preview.name}</strong>
            <div style={{ marginTop:'.25rem', color:'#555' }}>Category: {preview.category}</div>
            <div style={{ marginTop:'.5rem', color:'#666' }}>{preview.desc}</div>
          </div>
        </div>
      </div>
    </div>
  );
}