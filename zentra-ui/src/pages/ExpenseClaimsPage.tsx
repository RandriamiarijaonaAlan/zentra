import React, { useState, useEffect } from 'react';
import { getExpenseClaims, createExpenseClaim, cancelExpenseClaim } from '../services/selfService';
import type { ExpenseClaim } from '../types/selfService.ts';
import '../styles/ExpenseClaimsPage.css';

const ExpenseClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ExpenseClaim>({
    claimDate: new Date().toISOString().split('T')[0],
    amount: 0,
    category: 'MEAL',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'MEAL', label: 'Repas' },
    { value: 'TRAVEL', label: 'Transport' },
    { value: 'ACCOMMODATION', label: 'Hébergement' },
    { value: 'OFFICE_SUPPLIES', label: 'Fournitures' },
    { value: 'CLIENT_ENTERTAINMENT', label: 'Réception client' },
    { value: 'OTHER', label: 'Autre' },
  ];

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const data = await getExpenseClaims();
      setClaims(data);
    } catch (err) {
      setError('Erreur lors du chargement des notes de frais');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await createExpenseClaim(formData);
      setShowForm(false);
      setFormData({
        claimDate: new Date().toISOString().split('T')[0],
        amount: 0,
        category: 'MEAL',
        description: '',
      });
      await loadClaims();
    } catch (err) {
      setError('Erreur lors de la création de la note de frais');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (claimId: number) => {
    if (!window.confirm('Confirmer l\'annulation de cette note de frais ?')) return;
    try {
      setLoading(true);
      await cancelExpenseClaim(claimId);
      await loadClaims();
    } catch (err) {
      setError('Erreur lors de l\'annulation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      REJECTED: 'badge-danger',
      PAID: 'badge-info',
      CANCELLED: 'badge-secondary',
    };
    return badges[status] || 'badge-secondary';
  };

  const getTotalAmount = () => {
    return claims
      .filter((c) => c.status === 'APPROVED' || c.status === 'PAID')
      .reduce((sum, c) => sum + c.amount, 0);
  };

  return (
    <div className="expense-claims-page">
      <h1>Notes de Frais</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-bar">
        <div className="stat-item">
          <label>Total approuvé</label>
          <span className="stat-value">{getTotalAmount().toFixed(2)} €</span>
        </div>
        <div className="stat-item">
          <label>En attente</label>
          <span className="stat-value">
            {claims.filter((c) => c.status === 'PENDING').length}
          </span>
        </div>
      </div>

      <div className="section-header">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Annuler' : '+ Nouvelle Note de Frais'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="expense-claim-form">
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.claimDate}
                onChange={(e) => setFormData({ ...formData, claimDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Montant (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Catégorie *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Détails de la dépense..."
            />
          </div>
          <div className="form-group">
            <label>Justificatifs</label>
            <input type="file" multiple accept="image/*,application/pdf" />
            <small className="form-hint">
              Formats acceptés: PDF, JPG, PNG (TODO: Upload à implémenter)
            </small>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Envoi...' : 'Soumettre la note de frais'}
          </button>
        </form>
      )}

      <div className="claims-list">
        {loading && claims.length === 0 ? (
          <div className="loading">Chargement...</div>
        ) : claims.length === 0 ? (
          <p className="no-data">Aucune note de frais</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Montant</th>
                <th>Catégorie</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => {
                const category = categories.find((c) => c.value === claim.category);
                return (
                  <tr key={claim.id}>
                    <td>{new Date(claim.claimDate).toLocaleDateString('fr-FR')}</td>
                    <td className="amount">{claim.amount.toFixed(2)} €</td>
                    <td>{category?.label || claim.category}</td>
                    <td>{claim.description || '-'}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(claim.status || '')}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td>
                      {claim.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(claim.id!)}
                          className="btn-small btn-danger"
                          disabled={loading}
                        >
                          Annuler
                        </button>
                      )}
                      {claim.reviewNotes && (
                        <small className="review-note">{claim.reviewNotes}</small>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExpenseClaimsPage;
