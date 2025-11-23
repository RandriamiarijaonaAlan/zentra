import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { get, post, put } from '../../../services/api.ts';
import type { QcmDto, QcmFormDto, QuestionFormDto, ChoiceFormDto } from '../../../types';
import '../styles/QcmForm.css';

export default function QcmForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !(id == "new");

  const [formData, setFormData] = useState<QcmFormDto>({
    title: '',
    description: '',
    durationMinutes: 30,
    requiredScore: 60,
    questions: [],
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      loadQcm(id);
    }
  }, [isEdit, id]);

  const loadQcm = async (qcmId: string) => {
    try {
      const data = await get<QcmDto>(`/qcms/${qcmId}`);
      setFormData({
        id: data.id,
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        requiredScore: data.requiredScore,
        questions: data.questions.map((q) => ({
          id: q.id,
          libelle: q.libelle,
          required: q.required,
          score: q.score,
          choices: q.choices.map((c) => ({
            id: c.id,
            libelle: c.libelle,
            correct: c.correct || false,
          })),
        })),
      });
      setLoading(false);
    } catch (err: any) {
      setError('Impossible de charger le QCM');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    if (formData.questions.length === 0) {
      setError('Au moins une question est requise');
      return;
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      if (!question.libelle.trim()) {
        setError(`La question ${i + 1} doit avoir un libellé`);
        return;
      }
      if (question.choices.length < 2) {
        setError(`La question ${i + 1} doit avoir au moins 2 choix`);
        return;
      }
      if (!question.choices.some((c) => c.correct)) {
        setError(`La question ${i + 1} doit avoir au moins une réponse correcte`);
        return;
      }
    }

    setSubmitting(true);

    try {
      if (isEdit) {
        await put(`/qcms/${id}`, formData);
      } else {
        await post('/qcms', formData);
      }
      navigate('/admin/qcms');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      setSubmitting(false);
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          libelle: '',
          required: false,
          score: 10,
          choices: [
            { libelle: '', correct: false },
            { libelle: '', correct: false },
          ],
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const updateQuestion = (index: number, field: keyof QuestionFormDto, value: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  const addChoice = (questionIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].choices.push({ libelle: '', correct: false });
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeChoice = (questionIndex: number, choiceIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].choices = newQuestions[questionIndex].choices.filter(
      (_, i) => i !== choiceIndex
    );
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateChoice = (
    questionIndex: number,
    choiceIndex: number,
    field: keyof ChoiceFormDto,
    value: any
  ) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].choices[choiceIndex] = {
      ...newQuestions[questionIndex].choices[choiceIndex],
      [field]: value,
    };
    setFormData({ ...formData, questions: newQuestions });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/admin/qcms">QCM</Link>
            <span>/</span>
            <span>{isEdit ? 'Modifier' : 'Nouveau'}</span>
          </div>
          <h1>{isEdit ? 'Modifier le QCM' : 'Créer un nouveau QCM'}</h1>
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
          <h2>Informations générales</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="title">
                Titre du QCM <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Test de connaissances JavaScript"
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez brièvement le contenu du QCM..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">
                Durée (minutes) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="duration"
                min="1"
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="requiredScore">
                Score requis <span className="required">*</span>
              </label>
              <input
                type="number"
                id="requiredScore"
                min="0"
                value={formData.requiredScore}
                onChange={(e) =>
                  setFormData({ ...formData, requiredScore: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>Questions ({formData.questions.length})</h2>
            <button type="button" onClick={addQuestion} className="btn-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Ajouter une question
            </button>
          </div>

          {formData.questions.length === 0 ? (
            <div className="empty-questions">
              <p>Aucune question ajoutée</p>
              <button type="button" onClick={addQuestion} className="btn-primary">
                Ajouter la première question
              </button>
            </div>
          ) : (
            <div className="questions-form-list">
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="question-form-card">
                  <div className="question-form-header">
                    <span className="question-form-number">Question {qIndex + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="btn-icon btn-danger"
                      title="Supprimer la question"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Libellé de la question</label>
                    <textarea
                      value={question.libelle}
                      onChange={(e) => updateQuestion(qIndex, 'libelle', e.target.value)}
                      placeholder="Entrez votre question..."
                      rows={2}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Score</label>
                      <input
                        type="number"
                        min="1"
                        value={question.score}
                        onChange={(e) =>
                          updateQuestion(qIndex, 'score', parseInt(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)}
                        />
                        <span>Question obligatoire</span>
                      </label>
                    </div>
                  </div>

                  <div className="choices-section">
                    <div className="choices-header">
                      <span>Choix de réponses</span>
                      <button
                        type="button"
                        onClick={() => addChoice(qIndex)}
                        className="btn-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Ajouter un choix
                      </button>
                    </div>

                    <div className="choices-form-list">
                      {question.choices.map((choice, cIndex) => (
                        <div key={cIndex} className="choice-form-item">
                          <label className="checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={choice.correct}
                              onChange={(e) =>
                                updateChoice(qIndex, cIndex, 'correct', e.target.checked)
                              }
                              title="Réponse correcte"
                            />
                            <span className="checkbox-custom"></span>
                          </label>

                          <input
                            type="text"
                            value={choice.libelle}
                            onChange={(e) =>
                              updateChoice(qIndex, cIndex, 'libelle', e.target.value)
                            }
                            placeholder={`Choix ${cIndex + 1}`}
                            className="choice-input"
                          />

                          {question.choices.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeChoice(qIndex, cIndex)}
                              className="btn-icon btn-danger-sm"
                              title="Supprimer ce choix"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <Link to="/admin/qcms" className="btn-secondary">
            Annuler
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                {isEdit ? 'Enregistrer les modifications' : 'Créer le QCM'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

