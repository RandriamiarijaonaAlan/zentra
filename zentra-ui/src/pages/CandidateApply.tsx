import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { FormEvent } from 'react';
import '../styles/QcmForm.css';

export default function CandidateApply() {
  const { publicationId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ lastName: '', firstName: '', email: '', phone: '' });

  const submit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    // Ici, on pourrait appeler l'API de candidature lorsqu'elle sera disponible
    navigate('/success');
  };

  return (
    <div className="admin-page">
      <div className="form-section qcm-form">
        <div className="section-header">
          <div>
            <h2>Postuler à l'annonce #{publicationId}</h2>
            <p className="page-subtitle">Remplissez vos informations pour postuler</p>
          </div>
          <div className="form-actions">
            <button onClick={submit} className="btn-primary">Envoyer</button>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nom</label>
              <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Prénom</label>
              <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
