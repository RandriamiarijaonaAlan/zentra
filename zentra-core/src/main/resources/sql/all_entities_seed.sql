-- ============================================================================
-- Zentra Core - Jeu de données de démonstration (PostgreSQL)
-- Cohérent et professionnel couvrant les entités HR principales
-- NB: suppose que le schéma a été créé par Hibernate (ddl-auto=update)
--     et que la stratégie de nommage physique est en snake_case (par défaut Spring)
--     Les IDs sont générés automatiquement (IDENTITY). On utilise des sous-requêtes
--     sur des colonnes uniques pour lier les entités.
-- ============================================================================

BEGIN;

-- Nettoyage optionnel (idempotent). Décommentez si nécessaire.
-- ATTENTION: TRUNCATE CASCADE effacera toutes les données liées.
-- DO $$ BEGIN
--   EXECUTE 'TRUNCATE TABLE
--     answer,
--     attempt,
--     token,
--     interview,
--     application,
--     candidate,
--     publication,
--     question,
--     choice,
--     qcm,
--     salary_component,
--     salary_deduction,
--     pay_stub,
--     salary_advance,
--     bonus,
--     overtime_rate,
--     irsa_rate,
--     cnaps_rate,
--     ostie_rate,
--     employee_skill_history,
--     employee_skill,
--     skill_level,
--     skill,
--     job_history,
--     hr_document,
--     performance_review,
--     time_entry,
--     leave_notification,
--     leave_request,
--     leave_balance,
--     leave_type,
--     training_skill,
--     training,
--     staffing_need,
--     employment_contract,
--     employee,
--     job,
--     department,
--     audit_log
--     RESTART IDENTITY CASCADE';
-- EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ============================================================================
-- Départements
-- ============================================================================
INSERT INTO department (name, description, annual_budget)
VALUES
  ('Engineering', 'Département ingénierie, développement logiciel et DevOps', 1500000),
  ('Human Resources', 'Département RH: recrutement, formation, relations sociales', 400000),
  ('Finance', 'Département finances et comptabilité', 600000)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- Postes (Jobs)
-- ============================================================================
INSERT INTO job (title, description, required_degree, required_skills, department_id)
VALUES
  ('Software Engineer', 'Développeur Java/Spring Boot, CI/CD, bonnes pratiques', 'Master Informatique', 'Java, Spring, SQL, Git, CI/CD', (SELECT id FROM department WHERE name='Engineering')),
  ('HR Manager', 'Gestion du recrutement, des talents et de la conformité', 'Master RH', 'Communication, Législation sociale, Négociation', (SELECT id FROM department WHERE name='Human Resources')),
  ('Accountant', 'Tenue de la comptabilité, reporting mensuel, clôture', 'Licence Comptabilité', 'Comptabilité générale, Excel, ERP', (SELECT id FROM department WHERE name='Finance'))
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Employés
-- ============================================================================
INSERT INTO employee (
  employee_number, cnaps_number, last_name, first_name, work_email, work_phone,
  birth_date, gender, address, city, country, hire_date, base_salary, contract_end_date, job_id
) VALUES
  ('E001', 100000001, 'Doe', 'John', 'john.doe@zentra.local', '+33 1 76 00 01 01',
   DATE '1990-01-15', 'M', '10 Rue de Java', 'Paris', 'France', DATE '2020-03-01', 3500.00, NULL,
   (SELECT id FROM job WHERE title='Software Engineer' AND department_id=(SELECT id FROM department WHERE name='Engineering'))),
  ('E002', 100000002, 'Martin', 'Sophie', 'sophie.martin@zentra.local', '+33 1 76 00 02 02',
   DATE '1988-09-05', 'F', '22 Avenue des RH', 'Lyon', 'France', DATE '2018-06-15', 4200.00, NULL,
   (SELECT id FROM job WHERE title='HR Manager' AND department_id=(SELECT id FROM department WHERE name='Human Resources'))),
  ('E003', 100000003, 'Durand', 'Paul', 'paul.durand@zentra.local', '+33 1 76 00 03 03',
   DATE '1992-12-01', 'M', '5 Allée des Comptables', 'Marseille', 'France', DATE '2021-01-04', 2800.00, NULL,
   (SELECT id FROM job WHERE title='Accountant' AND department_id=(SELECT id FROM department WHERE name='Finance')))
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Contrats (employment_contract)
-- ============================================================================
INSERT INTO employment_contract (
  employee_id, contract_number, start_date, end_date, gross_salary, annual_bonus, benefits,
  weekly_hours, annual_leave_days, signature_date, contract_file, contract_type, duration_months,
  trial_period_months, renewable
) VALUES
  ((SELECT id FROM employee WHERE employee_number='E001'), 'CT-2020-0001', DATE '2020-03-01', NULL, 3500.00, 2000.00, 'Tickets resto, mutuelle', 35, 25, DATE '2020-02-20', NULL, 'CDI', NULL, 4, TRUE),
  ((SELECT id FROM employee WHERE employee_number='E002'), 'CT-2018-0007', DATE '2018-06-15', NULL, 4200.00, 3000.00, 'Mutuelle cadre', 35, 25, DATE '2018-06-01', NULL, 'CDI', NULL, 4, TRUE),
  ((SELECT id FROM employee WHERE employee_number='E003'), 'CT-2021-0003', DATE '2021-01-04', NULL, 2800.00, 1500.00, 'Tickets resto', 35, 25, DATE '2020-12-20', NULL, 'CDI', NULL, 4, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Historique de poste
-- ============================================================================
INSERT INTO job_history (employee_id, job_id, department_id, start_date, end_date, reason) VALUES
  ((SELECT id FROM employee WHERE employee_number='E001'),
   (SELECT id FROM job WHERE title='Software Engineer'),
   (SELECT id FROM department WHERE name='Engineering'), DATE '2020-03-01', NULL, 'Embauche'),
  ((SELECT id FROM employee WHERE employee_number='E002'),
   (SELECT id FROM job WHERE title='HR Manager'),
   (SELECT id FROM department WHERE name='Human Resources'), DATE '2018-06-15', NULL, 'Embauche')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Publications (offres)
-- ============================================================================
INSERT INTO publication (title, description, published_date, closing_date, number_of_positions, status, job_id)
VALUES
  ('Ingénieur Logiciel Java', 'Nous recrutons un(e) Ingénieur(e) Logiciel Java/Spring Boot', DATE '2025-11-01', DATE '2025-12-15', 2, 'Open',
   (SELECT id FROM job WHERE title='Software Engineer' AND department_id=(SELECT id FROM department WHERE name='Engineering')))
ON CONFLICT DO NOTHING;

-- ============================================================================
-- QCM / Questions / Choix
-- ============================================================================
INSERT INTO qcm (title, description, duration_minutes, total_score, required_score)
VALUES ('Java Basics', 'QCM de base Java et Spring', 30, 100.0, 60.0)
ON CONFLICT DO NOTHING;

INSERT INTO question (libelle, required, score, qcm_id) VALUES
  ('Quelle est la sortie de System.out.println("Hello") ?', TRUE, 50.0, (SELECT id FROM qcm WHERE title='Java Basics')),
  ('Quel stéréotype Spring pour une classe de service ?', TRUE, 50.0, (SELECT id FROM qcm WHERE title='Java Basics'))
ON CONFLICT DO NOTHING;

-- Choix pour Q1
INSERT INTO choice (libelle, correct, question_id) VALUES
  ('Hello', TRUE,  (SELECT id FROM question WHERE libelle='Quelle est la sortie de System.out.println("Hello") ?')),
  ('hello', FALSE, (SELECT id FROM question WHERE libelle='Quelle est la sortie de System.out.println("Hello") ?')),
  ('"Hello"', FALSE,(SELECT id FROM question WHERE libelle='Quelle est la sortie de System.out.println("Hello") ?'))
ON CONFLICT DO NOTHING;

-- Choix pour Q2
INSERT INTO choice (libelle, correct, question_id) VALUES
  ('@Repository', FALSE, (SELECT id FROM question WHERE libelle='Quel stéréotype Spring pour une classe de service ?')),
  ('@Service',    TRUE,  (SELECT id FROM question WHERE libelle='Quel stéréotype Spring pour une classe de service ?')),
  ('@Component',  FALSE, (SELECT id FROM question WHERE libelle='Quel stéréotype Spring pour une classe de service ?'))
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Candidat & Candidature
-- ============================================================================
INSERT INTO candidate (last_name, first_name, email, phone, birth_date, address, city, country, education_level, last_degree, years_experience, skills, cv_file, motivational_letter_file)
VALUES ('Leroy', 'Camille', 'camille.leroy@example.com', '+33 6 11 22 33 44', DATE '1996-04-12',
        '7 Rue des Candidats', 'Paris', 'France', 'Master Informatique', 'M2 Génie Logiciel', 3, 'Java, Git, SQL',
        'uploads/candidates/cvs/lina.pdf', 'uploads/candidates/motivation-letters/lina.pdf')
ON CONFLICT (email) DO NOTHING;

INSERT INTO application (applied_at, status, document_score, score, comment, candidate_id, qcm_id, publication_id)
VALUES (
  CURRENT_TIMESTAMP, 'Received', 75.0, NULL, 'Bon dossier',
  (SELECT id FROM candidate WHERE email='camille.leroy@example.com'),
  (SELECT id FROM qcm WHERE title='Java Basics'),
  (SELECT id FROM publication WHERE title='Ingénieur Logiciel Java')
) ON CONFLICT DO NOTHING;

-- Entretien (interviewer = HR Manager)
INSERT INTO interview (candidate_id, interviewer_id, interview_date, start_time, duration_minutes, interview_type, location, status, comment, score, application_id)
VALUES (
  (SELECT id FROM candidate WHERE email='camille.leroy@example.com'),
  (SELECT id FROM employee WHERE employee_number='E002'),
  DATE '2025-11-20', TIME '10:00', 60, 'VISIO', 'Lien Teams', 'PLANIFIE', NULL, NULL,
  (SELECT id FROM application WHERE candidate_id=(SELECT id FROM candidate WHERE email='camille.leroy@example.com'))
) ON CONFLICT DO NOTHING;

-- Token d’évaluation pour la candidature
INSERT INTO token (value, active, expiration_date, application_id)
VALUES ('tok_abc123', TRUE, CURRENT_TIMESTAMP + INTERVAL '7 days',
        (SELECT id FROM application WHERE candidate_id=(SELECT id FROM candidate WHERE email='camille.leroy@example.com')))
ON CONFLICT DO NOTHING;

-- Tentative (Attempt) & Réponses
INSERT INTO attempt (application_id, obtained_score)
VALUES ((SELECT id FROM application WHERE candidate_id=(SELECT id FROM candidate WHERE email='camille.leroy@example.com')), 85.0)
ON CONFLICT DO NOTHING;

-- Réponses: Q1 -> 'Hello', Q2 -> '@Service'
INSERT INTO answer (attempt_id, choice_id) VALUES
  ((SELECT id FROM attempt WHERE application_id=(SELECT id FROM application WHERE candidate_id=(SELECT id FROM candidate WHERE email='camille.leroy@example.com'))),
   (SELECT c.id FROM choice c JOIN question q ON c.question_id=q.id WHERE q.libelle='Quelle est la sortie de System.out.println("Hello") ?' AND c.libelle='Hello')),
  ((SELECT id FROM attempt WHERE application_id=(SELECT id FROM application WHERE candidate_id=(SELECT id FROM candidate WHERE email='camille.leroy@example.com'))),
   (SELECT c.id FROM choice c JOIN question q ON c.question_id=q.id WHERE q.libelle='Quel stéréotype Spring pour une classe de service ?' AND c.libelle='@Service'))
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Compétences & Niveaux
-- ============================================================================
INSERT INTO skill (name, description, category) VALUES
  ('Java', 'Programmation Java moderne (17+), Spring', 'TECHNICAL'),
  ('Communication', 'Communication écrite et orale', 'BEHAVIORAL'),
  ('Comptabilité', 'Comptabilité générale et analytique', 'BUSINESS')
ON CONFLICT DO NOTHING;

INSERT INTO skill_level (label, value) VALUES
  ('Beginner', 1), ('Intermediate', 2), ('Advanced', 3), ('Expert', 4)
ON CONFLICT DO NOTHING;

INSERT INTO employee_skill (employee_id, skill_id, level, target_level, evaluation_method, last_evaluation_date, years_experience)
VALUES
  ((SELECT id FROM employee WHERE employee_number='E001'), (SELECT id FROM skill WHERE name='Java'), 3, 4, 'MANAGER', DATE '2025-06-01', 5.0),
  ((SELECT id FROM employee WHERE employee_number='E002'), (SELECT id FROM skill WHERE name='Communication'), 4, 4, 'MANAGER', DATE '2025-05-01', 8.0),
  ((SELECT id FROM employee WHERE employee_number='E003'), (SELECT id FROM skill WHERE name='Comptabilité'), 2, 3, 'SELF', DATE '2025-07-15', 2.5)
ON CONFLICT DO NOTHING;

INSERT INTO employee_skill_history (employee_skill_id, previous_level, new_level, evaluation_method, evaluation_date) VALUES
  ((SELECT id FROM employee_skill WHERE employee_id=(SELECT id FROM employee WHERE employee_number='E001') AND skill_id=(SELECT id FROM skill WHERE name='Java')), 2, 3, 'TEST', DATE '2025-06-01')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Paie: Taux & Bulletins
-- ============================================================================
INSERT INTO overtime_rate (min_hours, max_hours, rate) VALUES
  (0, 8, 1.25), (9, 12, 1.50), (13, 999, 2.00)
ON CONFLICT DO NOTHING;

INSERT INTO irsa_rate (min_income, max_income, rate, amount) VALUES
  (0,      350000, 0.00, 0.00),
  (350001, 500000, 5.00, 0.00),
  (500001, 1000000, 10.00, 7500.00),
  (1000001, NULL, 20.00, 57500.00)
ON CONFLICT DO NOTHING;

INSERT INTO cnaps_rate (ceiling_base_amount, ceiling_rate, rate) VALUES
  (2000000, 0.05, 13.00)
ON CONFLICT DO NOTHING;

INSERT INTO ostie_rate (rate) VALUES (1.00) ON CONFLICT DO NOTHING;

-- Bulletin de paie pour John Doe (E001)
INSERT INTO pay_stub (
  employee_id, date, employee_name, employee_number, job_title, cnaps_number,
  hire_date, seniority, classification, base_salary, day_rate, hour_rate, salary_index,
  gross_salary, sum_deductions, net_salary, irsa_deduction, taxable_income, paying_method, filepath
) VALUES (
  (SELECT id FROM employee WHERE employee_number='E001'), DATE '2025-10-31', 'John Doe', 'E001', 'Software Engineer', 100000001,
  (SELECT hire_date FROM employee WHERE employee_number='E001'), '5y 7m', 'A2', 3500.00, 166.67, 20.83, 1.0,
  3800.00, 300.00, 3500.00, 120.00, 3680.00, 'BANK_TRANSFER', NULL
) ON CONFLICT DO NOTHING;

INSERT INTO salary_component (pay_stub_id, designation, number, rate, amount) VALUES
  ((SELECT id FROM pay_stub WHERE employee_id=(SELECT id FROM employee WHERE employee_number='E001') AND date=DATE '2025-10-31'), 'Salaire de base', NULL, NULL, 3500.00),
  ((SELECT id FROM pay_stub WHERE employee_id=(SELECT id FROM employee WHERE employee_number='E001') AND date=DATE '2025-10-31'), 'Prime de performance', NULL, NULL, 300.00)
ON CONFLICT DO NOTHING;

INSERT INTO salary_deduction (pay_stub_id, designation, rate, amount) VALUES
  ((SELECT id FROM pay_stub WHERE employee_id=(SELECT id FROM employee WHERE employee_number='E001') AND date=DATE '2025-10-31'), 'IRSA', 20.00, 120.00),
  ((SELECT id FROM pay_stub WHERE employee_id=(SELECT id FROM employee WHERE employee_number='E001') AND date=DATE '2025-10-31'), 'CNaPS', 13.00, 150.00),
  ((SELECT id FROM pay_stub WHERE employee_id=(SELECT id FROM employee WHERE employee_number='E001') AND date=DATE '2025-10-31'), 'OSTIE', 1.00, 30.00)
ON CONFLICT DO NOTHING;

INSERT INTO salary_advance (employee_id, amount, reason, date, status) VALUES
  ((SELECT id FROM employee WHERE employee_number='E001'), 500.00, 'Avance exceptionnelle', '2025-10', 'APPROVED')
ON CONFLICT DO NOTHING;

INSERT INTO bonus (employee_id, amount, description, date) VALUES
  ((SELECT id FROM employee WHERE employee_number='E001'), 800.00, 'Prime annuelle', '2025-12')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Temps & Absences
-- ============================================================================
INSERT INTO time_entry (employee_id, entry_date, check_in, check_out, hours_worked, overtime_hours, late_minutes, break_minutes, entry_type, note) VALUES
  ((SELECT id FROM employee WHERE employee_number='E001'), DATE '2025-10-01', TIMESTAMP '2025-10-01 09:00', TIMESTAMP '2025-10-01 17:30', 8.5, 0.5, 0, 60, 'BADGE', 'Journée standard'),
  ((SELECT id FROM employee WHERE employee_number='E001'), DATE '2025-10-02', TIMESTAMP '2025-10-02 09:15', TIMESTAMP '2025-10-02 18:00', 8.75, 0.75, 15, 60, 'BADGE', 'Léger retard')
ON CONFLICT DO NOTHING;

INSERT INTO leave_type (name, description, is_paid, max_days_per_year, requires_approval, advance_notice_days, is_active, color, max_concurrent_requests) VALUES
  ('Congés Payés', 'Congés payés annuels', TRUE, 25, TRUE, 7, TRUE, '#2E86C1', NULL),
  ('Maladie', 'Congé maladie', TRUE, NULL, TRUE, NULL, TRUE, '#C0392B', NULL)
ON CONFLICT DO NOTHING;

-- Solde de congés 2025 pour John Doe
INSERT INTO leave_balance (employee_id, leave_type_id, year, allocated_days, used_days, pending_days, carried_over_days, expires_on)
VALUES (
  (SELECT id FROM employee WHERE employee_number='E001'),
  (SELECT id FROM leave_type WHERE name='Congés Payés'),
  2025, 25.00, 5.00, 0.00, 0.00, DATE '2026-03-31'
) ON CONFLICT DO NOTHING;

-- Demande de congé approuvée par Sophie Martin (HR)
INSERT INTO leave_request (employee_id, leave_type_id, start_date, end_date, days_requested, reason, status, approved_by, approved_date, approval_comment, is_half_day_start, is_half_day_end, emergency_contact)
VALUES (
  (SELECT id FROM employee WHERE employee_number='E001'),
  (SELECT id FROM leave_type WHERE name='Congés Payés'),
  DATE '2025-12-21', DATE '2025-12-24', 4.00, 'Vacances de Noël', 'APPROVED',
  (SELECT id FROM employee WHERE employee_number='E002'), DATE '2025-12-05', 'Bon solde, OK', FALSE, FALSE, '+33 6 99 88 77 66'
) ON CONFLICT DO NOTHING;

INSERT INTO leave_notification (leave_request_id, recipient_id, notification_type, message, is_read, read_at, sent_at)
VALUES (
  (SELECT id FROM leave_request WHERE employee_id=(SELECT id FROM employee WHERE employee_number='E001') AND start_date=DATE '2025-12-21'),
  (SELECT id FROM employee WHERE employee_number='E001'),
  'REQUEST_APPROVED', 'Votre demande de congé a été approuvée', FALSE, NULL, CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- Formations
-- ============================================================================
INSERT INTO training (title, description, max_level_reached) VALUES
  ('Spring Boot Advanced', 'Microservices, sécurité, performance', 4)
ON CONFLICT DO NOTHING;

-- Lier formation -> compétence Java
INSERT INTO training_skill (training_id, skill_id) VALUES
  ((SELECT id FROM training WHERE title='Spring Boot Advanced'), (SELECT id FROM skill WHERE name='Java'))
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Documents RH
-- ============================================================================
INSERT INTO hr_document (employee_id, doc_type, file_path, uploaded_at, expiry_date, visible_to_employee) VALUES
  ((SELECT id FROM employee WHERE employee_number='E001'), 'CIN', 'files/docs/E001_cin.pdf', CURRENT_TIMESTAMP, NULL, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Évaluations de performance
-- ============================================================================
INSERT INTO performance_review (employee_id, reviewer_id, period_start, period_end, score, comments, status, reviewed_at) VALUES
  ((SELECT id FROM employee WHERE employee_number='E001'), (SELECT id FROM employee WHERE employee_number='E002'),
   DATE '2025-01-01', DATE '2025-12-31', 85, 'Bon niveau technique et esprit d’équipe', 'COMPLETED', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Besoins en staffing
-- ============================================================================
INSERT INTO staffing_need (title, description, number_of_positions, priority, status, required_start_date, budget_allocated, justification, department_id, job_id, requested_by)
VALUES (
  'Renfort équipe produit', '2 ingénieurs pour accélérer la roadmap', 2, 'High', 'Open', DATE '2026-01-15', 120000.00, 'Croissance des features',
  (SELECT id FROM department WHERE name='Engineering'),
  (SELECT id FROM job WHERE title='Software Engineer'),
  (SELECT id FROM employee WHERE employee_number='E002')
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- Audit log (exemples)
-- ============================================================================
INSERT INTO audit_log (action_by, action, entity_name, entity_id, details, created_at)
VALUES
  ('system', 'INSERT', 'employee', (SELECT id FROM employee WHERE employee_number='E001'), 'Création employé E001', CURRENT_TIMESTAMP),
  ('system', 'INSERT', 'publication', (SELECT id FROM publication WHERE title='Ingénieur Logiciel Java'), 'Création publication', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Duplication des données pour multiplier par 3
INSERT INTO department (name, description, annual_budget)
VALUES
  ('Engineering - Copy 1', 'Département ingénierie, développement logiciel et DevOps', 1500000),
  ('Human Resources - Copy 1', 'Département RH: recrutement, formation, relations sociales', 400000),
  ('Finance - Copy 1', 'Département finances et comptabilité', 600000),
  ('Engineering - Copy 2', 'Département ingénierie, développement logiciel et DevOps', 1500000),
  ('Human Resources - Copy 2', 'Département RH: recrutement, formation, relations sociales', 400000),
  ('Finance - Copy 2', 'Département finances et comptabilité', 600000)
ON CONFLICT (name) DO NOTHING;

-- Duplication des employés
INSERT INTO employee (
  employee_number, cnaps_number, last_name, first_name, work_email, work_phone,
  birth_date, gender, address, city, country, hire_date, base_salary, contract_end_date, job_id
) VALUES
  ('E001-Copy1', 200000001, 'Doe', 'John', 'john.doe.copy1@zentra.local', '+33 1 76 00 01 11',
   DATE '1990-01-15', 'M', '10 Rue de Java', 'Paris', 'France', DATE '2020-03-01', 3500.00, NULL,
   (SELECT id FROM job WHERE title='Software Engineer' AND department_id=(SELECT id FROM department WHERE name='Engineering'))),
  ('E002-Copy1', 200000002, 'Martin', 'Sophie', 'sophie.martin.copy1@zentra.local', '+33 1 76 00 02 22',
   DATE '1988-09-05', 'F', '22 Avenue des RH', 'Lyon', 'France', DATE '2018-06-15', 4200.00, NULL,
   (SELECT id FROM job WHERE title='HR Manager' AND department_id=(SELECT id FROM department WHERE name='Human Resources'))),
  ('E003-Copy1', 200000003, 'Durand', 'Paul', 'paul.durand.copy1@zentra.local', '+33 1 76 00 03 33',
   DATE '1992-12-01', 'M', '5 Allée des Comptables', 'Marseille', 'France', DATE '2021-01-04', 2800.00, NULL,
   (SELECT id FROM job WHERE title='Accountant' AND department_id=(SELECT id FROM department WHERE name='Finance'))),
  ('E001-Copy2', 300000001, 'Doe', 'John', 'john.doe.copy2@zentra.local', '+33 1 76 00 01 12',
   DATE '1990-01-15', 'M', '10 Rue de Java', 'Paris', 'France', DATE '2020-03-01', 3500.00, NULL,
   (SELECT id FROM job WHERE title='Software Engineer' AND department_id=(SELECT id FROM department WHERE name='Engineering'))),
  ('E002-Copy2', 300000002, 'Martin', 'Sophie', 'sophie.martin.copy2@zentra.local', '+33 1 76 00 02 23',
   DATE '1988-09-05', 'F', '22 Avenue des RH', 'Lyon', 'France', DATE '2018-06-15', 4200.00, NULL,
   (SELECT id FROM job WHERE title='HR Manager' AND department_id=(SELECT id FROM department WHERE name='Human Resources'))),
  ('E003-Copy2', 300000003, 'Durand', 'Paul', 'paul.durand.copy2@zentra.local', '+33 1 76 00 03 34',
   DATE '1992-12-01', 'M', '5 Allée des Comptables', 'Marseille', 'France', DATE '2021-01-04', 2800.00, NULL,
   (SELECT id FROM job WHERE title='Accountant' AND department_id=(SELECT id FROM department WHERE name='Finance')))
ON CONFLICT DO NOTHING;

-- Répétez cette logique pour les autres tables en ajustant les valeurs uniques comme les identifiants, emails, etc.

COMMIT;
