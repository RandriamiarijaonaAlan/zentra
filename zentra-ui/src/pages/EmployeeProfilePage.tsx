import React, { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile, getCurrentEmployeeId } from '../services/selfService';
import type { EmployeeProfile, EmployeeProfileUpdate } from '../types/selfService.ts';
import '../styles/EmployeeProfilePage.css';
import EmployeeSelector from '../components/EmployeeSelector';

const EmployeeProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EmployeeProfileUpdate>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Auto-load if an employee is already selected
    if (getCurrentEmployeeId()) {
      loadProfile();
    }
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
      setFormData({
        workPhone: data.workPhone,
        address: data.address,
        city: data.city,
        country: data.country,
        gender: data.gender,
      });
    } catch (err) {
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const updated = await updateMyProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      setSuccess('Profil mis à jour avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-profile-page">
      <h1>Mon Profil</h1>

      {/* Sélecteur d'employé pour admins */}
      <EmployeeSelector onChange={() => {
        setProfile(null);
        setError(null);
        loadProfile();
      }} />

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!profile ? (
        <div className="info-item">Sélectionnez un employé pour charger le profil.</div>
      ) : (
      <div className="profile-container">
        <div className="profile-section">
          <h2>Informations Personnelles</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Numéro employé</label>
              <p>{profile!.employeeNumber}</p>
            </div>
            <div className="info-item">
              <label>Nom</label>
              <p>{profile!.lastName}</p>
            </div>
            <div className="info-item">
              <label>Prénom</label>
              <p>{profile!.firstName}</p>
            </div>
            <div className="info-item">
              <label>Email professionnel</label>
              <p>{profile!.workEmail}</p>
            </div>
            <div className="info-item">
              <label>Date de naissance</label>
              <p>{new Date(profile!.birthDate).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="info-item">
              <label>Date d'embauche</label>
              <p>{new Date(profile!.hireDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2>Coordonnées Modifiables</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-edit">
                Modifier
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label>Téléphone professionnel</label>
                <input
                  type="tel"
                  value={formData.workPhone || ''}
                  onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Ville</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Pays</label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Genre</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">-</option>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>Téléphone</label>
                <p>{profile!.workPhone || '-'} </p>
              </div>
              <div className="info-item">
                <label>Adresse</label>
                <p>{profile!.address || '-'}</p>
              </div>
              <div className="info-item">
                <label>Ville</label>
                <p>{profile!.city || '-'}</p>
              </div>
              <div className="info-item">
                <label>Pays</label>
                <p>{profile!.country}</p>
              </div>
              <div className="info-item">
                <label>Genre</label>
                <p>{profile!.gender || '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default EmployeeProfilePage;
