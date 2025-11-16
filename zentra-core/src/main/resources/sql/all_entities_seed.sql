-- Script simple de données de test pour toutes les entités
-- TRUNCATE + INSERTs basiques
-- A utiliser uniquement en environnement de développement / test

-- 1) Nettoyage (ordre respectant les FK)
TRUNCATE TABLE leave_notification CASCADE;
TRUNCATE TABLE leave_request CASCADE;
TRUNCATE TABLE leave_balance CASCADE;
TRUNCATE TABLE leave_type CASCADE;
TRUNCATE TABLE answer CASCADE;
TRUNCATE TABLE attempt CASCADE;
TRUNCATE TABLE choice CASCADE;
TRUNCATE TABLE question CASCADE;
TRUNCATE TABLE qcm CASCADE;
TRUNCATE TABLE application CASCADE;
TRUNCATE TABLE token CASCADE;
TRUNCATE TABLE interview CASCADE;
TRUNCATE TABLE publication CASCADE;
TRUNCATE TABLE employment_contract CASCADE;
TRUNCATE TABLE employee CASCADE;
TRUNCATE TABLE candidate CASCADE;
TRUNCATE TABLE job CASCADE;
TRUNCATE TABLE department CASCADE;

-- 2) Réinitialisation des séquences (si elles existent)
ALTER SEQUENCE IF EXISTS department_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS job_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS candidate_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS employee_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS employment_contract_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS publication_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS application_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS qcm_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS question_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS choice_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS attempt_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS response_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS interview_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS token_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS leave_type_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS leave_request_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS leave_balance_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS leave_notification_id_seq RESTART WITH 1;

-- 3) INSERTS simples

-- Departements
INSERT INTO department (name, description, annual_budget)
VALUES
  ('Informatique', 'Département développement & infrastructure', 500000.00),
  ('Ressources Humaines', 'Gestion du personnel', 120000.00),
  ('Commercial', 'Ventes et partenariats', 200000.00);

-- Jobs (référencent department_id 1..3)
INSERT INTO job (title, description, required_degree, required_skills, department_id)
VALUES
  ('Développeur Backend', 'Backend Java/Spring', 'Licence/Master', 'Java,Spring,SQL', 1),
  ('Développeur Frontend', 'Frontend React/TypeScript', 'Licence', 'React,TypeScript,HTML,CSS', 1),
  ('Chargé RH', 'Recrutement & administration', 'Licence', 'Recrutement,Paie', 2),
  ('Commercial', 'Gestion clients', 'Licence', 'Vente,CRM', 3);

-- Publications (liées aux jobs)
INSERT INTO publication (title, description, published_date, closing_date, number_of_positions, status, job_id)
VALUES
  ('Backend Java - CDI', 'Poste backend Java pour projet microservices', '2025-10-01', '2025-12-31', 2, 'Open', 1),
  ('Frontend React - CDI', 'Développeur frontend React', '2025-10-05', '2025-12-31', 1, 'Open', 2),
  ('Chargé RH - CDD', 'Mission RH', '2025-09-01', '2025-11-30', 1, 'Open', 3);

-- Candidates
INSERT INTO candidate (last_name, first_name, email, phone, birth_date, country, years_experience)
VALUES
  ('Dupont', 'Jean', 'jean.dupont@email.com', '+33123456789', '1990-05-15', 'France', 5),
  ('Durand', 'Alice', 'alice.durand@email.com', '+33698765432', '1992-08-20', 'France', 3),
  ('Moreau', 'Bob', 'bob.moreau@email.com', '+33611223344', '1988-12-10', 'France', 7);

-- Applications (candidatures)
INSERT INTO application (applied_at, status, document_score, comment, candidate_id, publication_id)
VALUES
  ('2025-10-15 10:30:00', 'Received', 85.0, 'Bonne expérience backend', 1, 1),
  ('2025-10-16 14:20:00', 'Received', 78.0, 'Profil frontend junior', 2, 2);

-- Employees
INSERT INTO employee (employee_number, last_name, first_name, work_email, birth_date, gender, hire_date, base_salary, job_id)
VALUES
  ('EMP001', 'Martin', 'Marie', 'marie.martin@company.com', '1985-05-15', 'F', '2020-01-15', 45000.00, 3),
  ('EMP002', 'Dubois', 'Pierre', 'pierre.dubois@company.com', '1988-08-20', 'M', '2019-03-10', 48000.00, 1),
  ('EMP003', 'Bernard', 'Sophie', 'sophie.bernard@company.com', '1990-08-15', 'F', '2020-03-01', 42000.00, 1),
  ('EMP004', 'Lefebvre', 'Pierre', 'pierre.lefebvre@company.com', '1985-12-03', 'M', '2017-01-15', 47000.00, 1),
  ('EMP005', 'Moreau', 'Lucas', 'lucas.moreau@company.com', '1992-04-22', 'M', '2021-06-01', 40000.00, 3);

-- Employment contracts (liés aux employees)
INSERT INTO employment_contract (employee_id, contract_number, start_date, gross_salary, weekly_hours)
VALUES
  (1, 'C-2023-001', '2023-01-01', 45000.00, 35.0),
  (2, 'C-2022-002', '2022-06-01', 48000.00, 35.0),
  (3, 'C-2020-003', '2020-03-01', 44000.00, 35.0),
  (4, 'C-2017-004', '2017-01-15', 49000.00, 35.0),
  (5, 'C-2021-005', '2021-06-01', 42000.00, 35.0);

-- QCM
INSERT INTO qcm (title, description, date, duration_minutes, total_score, required_score)
VALUES
  ('QCM Java', 'Test de connaissances Java', '2025-10-01', 30, 20.0, 12.0),
  ('QCM Frontend', 'Test React', '2025-10-02', 30, 20.0, 12.0);

-- Questions
INSERT INTO question (libelle, required, score, qcm_id)
VALUES
  ('Qu''est-ce que la JVM ?', true, 5.0, 1),
  ('Qu''est-ce que React ?', true, 5.0, 2);

-- Choices
INSERT INTO choice (libelle, score, correct, question_id)
VALUES
  ('Machine virtuelle Java', 5.0, true, 1),
  ('Bibliothèque UI', 5.0, true, 2);

-- Attempts (tentatives de QCM) - lier application_id 1..2
INSERT INTO attempt (qcm_id, application_id, obtained_score)
VALUES
  (1, 1, 16.0),
  (2, 2, 14.0);

-- Responses
INSERT INTO response (attempt_id, choice_id)
VALUES
  (1, 1),
  (2, 2);

-- Interviews (liés à application_id)
INSERT INTO interview (interview_type, interview_date, start_time, duration_minutes, interviewer_id, report, score, application_id)
VALUES
  ('Phone', '2025-11-01', '10:00:00', 60, 1, 'Entretien initial', NULL, 1),
  ('Video', '2025-10-20', '14:00:00', 45, 2, 'Entretien technique', 16.5, 2);

-- Leave Types (Types de congés)
INSERT INTO leave_type (name, description, is_paid, max_days_per_year, requires_approval, advance_notice_days, is_active, color)
VALUES
  ('Congés Payés', 'Congés payés annuels', true, 25, true, 15, true, '#4CAF50'),
  ('RTT', 'Réduction du Temps de Travail', true, 10, true, 7, true, '#2196F3'),
  ('Congé Maladie', 'Arrêt maladie', true, NULL, false, 0, true, '#FF9800'),
  ('Congé Maternité', 'Congé de maternité', true, 112, false, 30, true, '#E91E63'),
  ('Congé Paternité', 'Congé de paternité', true, 25, false, 15, true, '#9C27B0'),
  ('Congé Sans Solde', 'Congé sans solde', false, NULL, true, 30, true, '#795548'),
  ('Formation', 'Congé formation', true, NULL, true, 21, true, '#607D8B');

-- Leave Balances (Soldes de congés pour 2025)
INSERT INTO leave_balance (employee_id, leave_type_id, year, allocated_days, used_days, pending_days, carried_over_days)
VALUES
  -- Marie Martin (EMP001)
  (1, 1, 2025, 25.0, 8.0, 0.0, 0.0),  -- Congés Payés
  (1, 2, 2025, 10.0, 2.0, 0.0, 0.0),  -- RTT

  -- Pierre Dubois (EMP002)
  (2, 1, 2025, 25.0, 5.0, 3.0, 0.0),  -- Congés Payés
  (2, 2, 2025, 10.0, 1.0, 0.0, 0.0),  -- RTT

  -- Sophie Bernard (EMP003)
  (3, 1, 2025, 25.0, 12.0, 0.0, 2.0), -- Congés Payés
  (3, 2, 2025, 10.0, 4.0, 0.0, 0.0),  -- RTT

  -- Pierre Lefebvre (EMP004)
  (4, 1, 2025, 25.0, 3.0, 5.0, 0.0),  -- Congés Payés
  (4, 2, 2025, 10.0, 0.0, 0.0, 0.0),  -- RTT

  -- Lucas Moreau (EMP005)
  (5, 1, 2025, 25.0, 7.0, 0.0, 0.0),  -- Congés Payés
  (5, 2, 2025, 10.0, 3.0, 0.0, 0.0);  -- RTT

-- Leave Requests (Demandes de congés)
INSERT INTO leave_request (employee_id, leave_type_id, start_date, end_date, days_requested, reason, status, is_half_day_start, is_half_day_end, emergency_contact)
VALUES
  -- Demandes approuvées
  (1, 1, '2025-12-23', '2025-12-31', 7.0, 'Congés de fin d''année', 'APPROVED', false, false, 'marie.martin.perso@gmail.com'),
  (2, 1, '2025-08-15', '2025-08-25', 9.0, 'Vacances d''été', 'APPROVED', false, false, 'pierre.dubois.perso@gmail.com'),
  (3, 2, '2025-07-12', '2025-07-12', 1.0, 'RTT pont', 'APPROVED', false, false, 'sophie.bernard.perso@gmail.com'),

  -- Demandes en attente
  (2, 1, '2025-12-01', '2025-12-03', 3.0, 'Week-end prolongé', 'PENDING', false, false, 'pierre.dubois.perso@gmail.com'),
  (4, 1, '2025-12-15', '2025-12-22', 6.0, 'Congés de Noël', 'PENDING', false, false, 'pierre.lefebvre.perso@gmail.com'),

  -- Demandes pour janvier 2026 (futures)
  (5, 1, '2026-01-15', '2026-01-18', 4.0, 'Long week-end', 'PENDING', false, false, 'lucas.moreau.perso@gmail.com');

-- Token (optionnel si la table existe)
-- INSERT INTO token (value, active, expiration_date, application_id) VALUES ('token123', true, '2026-01-01', 1);

-- Vérifications rapides
SELECT 'SUMMARY' AS tag,
  (SELECT COUNT(*) FROM department) AS departments,
  (SELECT COUNT(*) FROM job) AS jobs,
  (SELECT COUNT(*) FROM publication) AS publications,
  (SELECT COUNT(*) FROM candidate) AS candidates,
  (SELECT COUNT(*) FROM application) AS applications,
  (SELECT COUNT(*) FROM employee) AS employees,
  (SELECT COUNT(*) FROM leave_type) AS leave_types,
  (SELECT COUNT(*) FROM leave_request) AS leave_requests,
  (SELECT COUNT(*) FROM leave_balance) AS leave_balances;

