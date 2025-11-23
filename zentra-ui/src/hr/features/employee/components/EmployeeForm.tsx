import React, { useState, useEffect } from 'react';
import type { EmployeeDto } from '../../../types/employee.ts';
import { createEmployee, updateEmployee, listJobTitles, listDepartments, listManagers } from '../../../services/hrApi.ts';
import '../styles/EmployeeForm.css';

interface Props {
  initial?: EmployeeDto;
  onSaved: (e: EmployeeDto) => void;
}

interface ReferenceData {
  departments: {id: number, name: string}[];
  jobTitles: {id: number, title: string, departmentId: number}[];
  managers: {id: number, firstName: string, lastName: string}[];
}

const empty: EmployeeDto = { firstName: '', lastName: '', workEmail: '' };

export const EmployeeForm: React.FC<Props> = ({ initial, onSaved }) => {
  const [form, setForm] = useState<EmployeeDto>(initial || empty);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refData, setRefData] = useState<ReferenceData>({
    departments: [],
    jobTitles: [],
    managers: []
  });

  useEffect(() => {
    if (initial) {
      setForm(initial);
      // Si l'employé a déjà une photo, l'afficher en prévisualisation (upload de photo désactivé)
    }
    loadReferenceData();
  }, [initial]);

  const loadReferenceData = async () => {
    try {
      const [departments, jobTitles, managers] = await Promise.all([
        listDepartments().catch(() => { throw new Error('Départements'); }),
        listJobTitles().catch(() => { throw new Error('Postes'); }),
        listManagers().catch(() => { throw new Error('Managers'); })
      ]);
      setRefData({ departments, jobTitles, managers });
    } catch (error) {
      console.error('Erreur lors du chargement des données de référence:', error);
      // Les listes resteront vides, les sélecteurs afficheront "Aucune donnée disponible"
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    // Nettoyer l'erreur quand l'utilisateur tape
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.firstName?.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!form.lastName?.trim()) newErrors.lastName = 'Le nom est requis';
    if (!form.workEmail?.trim()) newErrors.workEmail = 'L\'email professionnel est requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.workEmail)) {
      newErrors.workEmail = 'Format d\'email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // D'abord sauvegarder l'employé
      const saved = form.id ? await updateEmployee(form) : await createEmployee(form);

      onSaved(saved);

      if (!form.id) {
        setForm(empty);
        setErrors({});
        // Reset de l'input fichier supprimé (upload photo désactivé)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'employé. Vérifiez votre connexion au backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-form-page">
      <div className="form-container">
        <div className="form-header">
          <h3 className="form-title">
            {form.id ? '✏️ Modifier' : '➕ Ajouter'} un employé
          </h3>
        </div>

        <form onSubmit={submit} className="employee-form">
          {/* Section Identité */}
          <div className="form-section">
            <div className="section-title">
              👤 Informations personnelles
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Prénom <span className="required">*</span>
                </label>
                <input
                  name="firstName"
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Entrez le prénom"
                  required
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Nom <span className="required">*</span>
                </label>
                <input
                  name="lastName"
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Entrez le nom"
                  required
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date de naissance</label>
                <input
                  type="date"
                  name="birthDate"
                  className="form-input"
                  value={form.birthDate || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Genre</label>
                <select
                  name="gender"
                  className="form-input"
                  value={form.gender || ''}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                  <option value="O">Autre</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section Contact */}
          <div className="form-section">
            <div className="section-title">
              📧 Informations de contact
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Email professionnel <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="workEmail"
                  className={`form-input ${errors.workEmail ? 'error' : ''}`}
                  value={form.workEmail}
                  onChange={handleChange}
                  placeholder="nom@entreprise.com"
                  required
                />
                {errors.workEmail && <span className="error-text">{errors.workEmail}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Téléphone professionnel</label>
                <input
                  name="workPhone"
                  className="form-input"
                  value={form.workPhone || ''}
                  onChange={handleChange}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Adresse</label>
                <input
                  name="address"
                  className="form-input"
                  value={form.address || ''}
                  onChange={handleChange}
                  placeholder="123 Rue de la République"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ville</label>
                <input
                  name="city"
                  className="form-input"
                  value={form.city || ''}
                  onChange={handleChange}
                  placeholder="Paris"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pays</label>
                <input
                  name="country"
                  className="form-input"
                  value={form.country || 'France'}
                  onChange={handleChange}
                  placeholder="France"
                />
              </div>
            </div>
          </div>

          {/* Section Professionnel */}
          <div className="form-section">
            <div className="section-title">
              💼 Informations professionnelles
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Matricule employé</label>
                <input
                  name="employeeNumber"
                  className="form-input"
                  value={form.employeeNumber || ''}
                  onChange={handleChange}
                  placeholder="EMP001"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Poste</label>
                <select
                  name="jobId"
                  className="form-input"
                  value={form.jobId || ''}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner un poste</option>
                  {refData.jobTitles.length === 0 ? (
                    <option value="" disabled>Aucun poste disponible - Vérifiez la connexion au backend</option>
                  ) : (
                    refData.jobTitles.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date d'embauche</label>
                <input
                  type="date"
                  name="hireDate"
                  className="form-input"
                  value={form.hireDate || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date de fin de contrat</label>
                <input
                  type="date"
                  name="contractEndDate"
                  className="form-input"
                  value={form.contractEndDate || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading && <div className="loading-spinner"></div>}
              {form.id ? 'Sauvegarder les modifications' : 'Créer l\'employé'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
