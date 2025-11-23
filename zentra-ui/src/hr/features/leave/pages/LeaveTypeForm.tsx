import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post, put } from '../../../services/api.ts';
import type { LeaveTypeDto } from '../../../types';
import '../styles/LeaveTypeForm.css';

export function LeaveTypeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState<LeaveTypeDto>({
    id: 0, name: '', description: '', isPaid: true, maxDaysPerYear: undefined,
    requiresApproval: true, advanceNoticeDays: undefined, isActive: true, color: '#007bff'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (isEdit && id) load(parseInt(id)); }, [id]);

  async function load(leaveTypeId: number) {
    try { setLoading(true); const data = await get<LeaveTypeDto>(`/leave-types/${leaveTypeId}`); setFormData(data); }
    catch { setError('Impossible de charger le type de congé'); }
    finally { setLoading(false); }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, type } = e.target;
    if (type === 'checkbox') setFormData(v => ({ ...v, [name]: (e.target as HTMLInputElement).checked }));
    else if (type === 'number') setFormData(v => ({ ...v, [name]: e.target.value === '' ? undefined : parseInt(e.target.value) }));
    else setFormData(v => ({ ...v, [name]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try { isEdit ? await put('/leave-types', formData) : await post('/leave-types', formData); navigate('/admin/leaves/types'); }
    catch (err: any) { setError(err.response?.data?.message || 'Erreur lors de la sauvegarde'); }
    finally { setLoading(false); }
  }

  return (
    <div className="admin-page">
      <div className="page-header"><h1>{isEdit ? 'Modifier' : 'Nouveau Type de Congé'}</h1></div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="content-card">
        <form onSubmit={onSubmit} className="leave-type-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nom *</label>
              <input type="text" name="name" value={formData.name} onChange={onChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Couleur</label>
              <input type="color" name="color" value={formData.color || '#007bff'} onChange={onChange} className="form-control color-input" />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={onChange} className="form-control" rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Max jours/an</label>
              <input type="number" name="maxDaysPerYear" value={formData.maxDaysPerYear ?? ''} onChange={onChange} className="form-control" min={0} />
            </div>
            <div className="form-group">
              <label>Préavis (jours)</label>
              <input type="number" name="advanceNoticeDays" value={formData.advanceNoticeDays ?? ''} onChange={onChange} className="form-control" min={0} />
            </div>
            <div className="form-group">
              <label>Max demandes simultanées</label>
              <input type="number" name="maxConcurrentRequests" value={(formData as any).maxConcurrentRequests ?? ''} onChange={onChange} className="form-control" min={0} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group checkbox-group"><label className="checkbox-label"><input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={onChange} /><span className="checkmark"></span>Payé</label></div>
            <div className="form-group checkbox-group"><label className="checkbox-label"><input type="checkbox" name="requiresApproval" checked={formData.requiresApproval} onChange={onChange} /><span className="checkmark"></span>Nécessite approbation</label></div>
            <div className="form-group checkbox-group"><label className="checkbox-label"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={onChange} /><span className="checkmark"></span>Actif</label></div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/admin/leaves/types')} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Sauvegarde...' : (isEdit ? 'Modifier' : 'Créer')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
