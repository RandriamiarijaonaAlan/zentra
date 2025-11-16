import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/QcmForm.css';

export default function CandidateApply() {
  const { publicationId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    lastName: '', firstName: '', email: '', phone: ''
  });

  const submit = () => {
    // Ici, on pourrait appeler l'API de candidature lorsqu'elle sera disponible
    navigate('/success');
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Postuler à l'annonce #{publicationId}</h1>
          <p className="page-subtitle">Remplissez vos informations pour postuler</p>
        </div>
        <button onClick={submit} className="btn-primary">Envoyer</button>
      </div>
      <div className="qcm-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nom</label>
            <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Prénom</label>
            <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
        </div>
      </div>
    </div>
  );
}
