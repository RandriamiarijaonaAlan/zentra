-- data_rh.sql
-- Données d'exemple pour la base PostgreSQL
-- Assumptions:
--  - Les colonnes `id` sont générées automatiquement (serial / identity).
--  - Les références FK sont résolues via des sous-requêtes sur des colonnes uniques (nom, email, employee_number, title, ...).

BEGIN;

-- Departments
INSERT INTO department (name, description, annual_budget) VALUES
  ('Informatique', 'Département en charge des développements', 500000.00),
  ('Ressources Humaines', 'Gestion du personnel et du recrutement', 200000.00);

-- Jobs
INSERT INTO job (title, description, required_degree, required_skills, department_id) VALUES
  ('Développeur Fullstack', 'Développement d''applications web', 'Master Informatique', 'Java, React, SQL', (SELECT id FROM department WHERE name = 'Informatique')),
  ('Chargé de Recrutement', 'Gestion des recrutements et publications', 'Licence RH', 'Communication, Sourcing', (SELECT id FROM department WHERE name = 'Ressources Humaines'));

-- Employees
INSERT INTO employee (employee_number, last_name, first_name, work_email, work_phone, birth_date, gender, address, city, country, hire_date, base_salary, contract_end_date, job_id) VALUES
  ('EMP-0001', 'Dupont', 'Alice', 'alice.dupont@example.com', '+33123456789', '1988-05-10', 'F', '10 Rue A', 'Paris', 'France', '2018-06-01', 45000.00, NULL, (SELECT id FROM job WHERE title = 'Développeur Fullstack')),
  ('EMP-0002', 'Martin', 'Jean', 'jean.martin@example.com', '+33111222333', '1982-11-20', 'M', '5 Rue B', 'Lyon', 'France', '2015-09-15', 38000.00, NULL, (SELECT id FROM job WHERE title = 'Chargé de Recrutement'));

-- Contracts
INSERT INTO employment_contract (employee_id, contract_number, start_date, end_date, gross_salary, annual_bonus, benefits, weekly_hours, annual_leave_days, signature_date, contract_file) VALUES
  ((SELECT id FROM employee WHERE employee_number = 'EMP-0001'), 'C-2020-001', '2018-06-01', NULL, 48000.00, 2000.00, 'Mutuelle;Tickets restaurant', 35.0, 25, '2018-06-01', 'files/contracts/c1.pdf'),
  ((SELECT id FROM employee WHERE employee_number = 'EMP-0002'), 'C-2016-010', '2015-09-15', NULL, 40000.00, 1500.00, 'Mutuelle', 35.0, 25, '2015-09-15', 'files/contracts/c2.pdf');

-- Publications
INSERT INTO publication (title, description, published_date, closing_date, number_of_positions, status, job_id) VALUES
  ('Développeur Fullstack - Paris', 'Recherche développeur fullstack pour projet web', '2025-01-15', '2026-02-28', 2, 'Open', (SELECT id FROM job WHERE title = 'Développeur Fullstack')),
  ('Chargé de Recrutement', 'Renforcement équipe recrutement', '2025-03-01', '2026-03-31', 1, 'Open', (SELECT id FROM job WHERE title = 'Chargé de Recrutement'));

-- QCMs
INSERT INTO qcm (title, description, duration_minutes, total_score, required_score) VALUES
  ('QCM Technique - Dev', 'QCM pour évaluer les compétences techniques', 30, 10.0, 6.0),
  ('QCM RH', 'QCM pour le process recrutement', 20, 5.0, 3.0);

-- Questions
INSERT INTO question (libelle, required, score, qcm_id) VALUES
  ('Quel est le rôle d''une API REST ?', true, 2.0, (SELECT id FROM qcm WHERE title = 'QCM Technique - Dev')),
  ('Expliquez le principe du garbage collector en Java', true, 3.0, (SELECT id FROM qcm WHERE title = 'QCM Technique - Dev')),
  ('Quelle est la première étape d''un entretien ?', false, 2.0, (SELECT id FROM qcm WHERE title = 'QCM RH'));

-- Choices
INSERT INTO choice (libelle, correct, question_id) VALUES
  ('Permettre la communication entre serveurs via HTTP', true, (SELECT id FROM question WHERE libelle = 'Quel est le rôle d''une API REST ?')),
  ('Stocker des données uniquement', false, (SELECT id FROM question WHERE libelle = 'Quel est le rôle d''une API REST ?')),
  ('Processus automatique de libération de mémoire', true, (SELECT id FROM question WHERE libelle = 'Expliquez le principe du garbage collector en Java')),
  ('Une librairie tierce', false, (SELECT id FROM question WHERE libelle = 'Expliquez le principe du garbage collector en Java')),
  ('Accueil et présentation', true, (SELECT id FROM question WHERE libelle = 'Quelle est la première étape d''un entretien ?')),
  ('Signature du contrat', false, (SELECT id FROM question WHERE libelle = 'Quelle est la première étape d''un entretien ?'));

-- Candidates
INSERT INTO candidate (last_name, first_name, email, phone, birth_date, address, city, country, education_level, last_degree, years_experience, skills, cv_file, motivational_letter_file) VALUES
  ('Nguyen', 'Lina', 'lina.nguyen@example.com', '+33611112222', '1995-04-02', '12 Rue C', 'Paris', 'France', 'Master', 'M2 Informatique', 3, 'Java, React', 'files/cv/lina.pdf', 'files/lettre/lina.pdf'),
  ('Kouassi', 'Marc', 'marc.kouassi@example.com', '+33633334444', '1990-09-12', '34 Av D', 'Lille', 'France', 'Licence', 'L3 RH', 5, 'Recrutement, Sourcing', 'files/cv/marc.pdf', NULL),
  ('Rajaonarivelo', 'Hery', 'hery.raja@example.com', NULL, '1998-01-20', '7 Rue E', 'Bordeaux', 'France', 'Licence', NULL, 1, 'SQL, JS', NULL, NULL),
  ('Alan', 'Alan', 'alan.alan@example.com', '+33670000001', '1992-07-15', '1 Rue Alan', 'Antananarivo', 'Madagascar', 'Licence', 'L3 Informatique', 2, 'HTML, CSS', NULL, NULL),
  ('Manakasina', 'Judicael', 'judicael.manakasina@example.com', '+33670000002', '1994-05-22', '22 Rue M', 'Antananarivo', 'Madagascar', 'Master', 'M2 Informatique', 3, 'Java, Spring', 'files/cv/judicael.pdf', NULL),
  ('Nahary', 'Kevin', 'kevin.nahary@example.com', '+33670000003', '1990-11-03', '5 Av N', 'Toulouse', 'France', 'Licence', 'L3 Dev', 4, 'SQL, Node.js', NULL, NULL),
  ('Matia', 'Randy', 'randy.matia@example.com', '+33670000004', '1991-02-18', '10 Bd R', 'Marseille', 'France', 'Master', 'M2 RH', 2, 'Communication, Sourcing', NULL, NULL),
  ('Fy', 'Aro Loyola', 'aro.loyola@example.com', '+33670000005', '1993-09-30', '8 Rue F', 'Paris', 'France', 'Licence', NULL, 1, 'Design, UX', NULL, NULL);

-- Applications
INSERT INTO application (applied_at, status, document_score, score, comment, candidate_id, qcm_id, publication_id) VALUES
  ('2025-01-20 09:15:00', 'interview_scheduled', 8.5, 9.0, 'Très bon dossier', (SELECT id FROM candidate WHERE email = 'lina.nguyen@example.com'), (SELECT id FROM qcm WHERE title = 'QCM Technique - Dev'), (SELECT id FROM publication WHERE title = 'Développeur Fullstack - Paris')),
-- Application 2: without interview/attempt/score (intentionnel)
  ('2025-02-02 11:00:00', 'test_scheduled', 7.0, NULL, 'A revoir pour QCM', (SELECT id FROM candidate WHERE email = 'marc.kouassi@example.com'), (SELECT id FROM qcm WHERE title = 'QCM Technique - Dev'), (SELECT id FROM publication WHERE title = 'Développeur Fullstack - Paris')),
-- Application 3: without QCM and without attempt/interview/score
  ('2025-03-05 14:30:00', 'received', NULL, NULL, NULL, (SELECT id FROM candidate WHERE email = 'hery.raja@example.com'), NULL, (SELECT id FROM publication WHERE title = 'Chargé de Recrutement'));

-- Additional applications for newly added candidates
INSERT INTO application (applied_at, status, document_score, score, comment, candidate_id, qcm_id, publication_id) VALUES
  ('2025-04-10 09:00:00', 'received', 6.5, NULL, 'Candidature reçue', (SELECT id FROM candidate WHERE email = 'alan.alan@example.com'), (SELECT id FROM qcm WHERE title = 'QCM Technique - Dev'), (SELECT id FROM publication WHERE title = 'Développeur Fullstack - Paris')),
  ('2025-04-12 10:30:00', 'test_scheduled', 8.0, NULL, 'QCM programmé', (SELECT id FROM candidate WHERE email = 'judicael.manakasina@example.com'), (SELECT id FROM qcm WHERE title = 'QCM Technique - Dev'), (SELECT id FROM publication WHERE title = 'Développeur Fullstack - Paris')),
  ('2025-04-15 14:00:00', 'test_scheduled', 7.5, NULL, NULL, (SELECT id FROM candidate WHERE email = 'kevin.nahary@example.com'), (SELECT id FROM qcm WHERE title = 'QCM Technique - Dev'), (SELECT id FROM publication WHERE title = 'Développeur Fullstack - Paris')),
  ('2025-04-18 11:00:00', 'interview_scheduled', 7.0, NULL, 'Bonne expérience précédente', (SELECT id FROM candidate WHERE email = 'randy.matia@example.com'), (SELECT id FROM qcm WHERE title = 'QCM RH'), (SELECT id FROM publication WHERE title = 'Chargé de Recrutement')),
  ('2025-04-20 16:20:00', 'received', 6.0, NULL, 'Portfolio intéressant', (SELECT id FROM candidate WHERE email = 'aro.loyola@example.com'), (SELECT id FROM qcm WHERE title = 'QCM Technique - Dev'), (SELECT id FROM publication WHERE title = 'Développeur Fullstack - Paris'));

-- Attempts (exist for certain applications only)
-- Attempt for the first application (linked by candidate)
INSERT INTO attempt (application_id, obtained_score) VALUES
  ((SELECT a.id FROM application a JOIN candidate c ON a.candidate_id = c.id WHERE c.email = 'lina.nguyen@example.com' ORDER BY a.applied_at LIMIT 1), 9.0);

-- Answers for attempt 1 (choosing correct choices)
INSERT INTO answer (attempt_id, choice_id) VALUES
  ((SELECT id FROM attempt WHERE application_id = (SELECT id FROM application WHERE candidate_id = (SELECT id FROM candidate WHERE email = 'lina.nguyen@example.com') ORDER BY applied_at LIMIT 1)), (SELECT id FROM choice WHERE libelle = 'Permettre la communication entre serveurs via HTTP')),
  ((SELECT id FROM attempt WHERE application_id = (SELECT id FROM application WHERE candidate_id = (SELECT id FROM candidate WHERE email = 'lina.nguyen@example.com') ORDER BY applied_at LIMIT 1)), (SELECT id FROM choice WHERE libelle = 'Processus automatique de libération de mémoire'));

-- Interviews
-- Interview for the application of Lina Nguyen
INSERT INTO interview (candidate_id, interviewer_id, interview_date, start_time, duration_minutes, interview_type, location, status, comment, score, application_id) VALUES
  ((SELECT id FROM candidate WHERE email = 'lina.nguyen@example.com'), (SELECT id FROM employee WHERE employee_number = 'EMP-0002'), '2025-01-25', '10:00:00', 45, 'PRESENTIEL', 'Bureau Paris - Salle 2', 'REALISE', 'Bonne discussion', 8.5, (SELECT id FROM application WHERE candidate_id = (SELECT id FROM candidate WHERE email = 'lina.nguyen@example.com') ORDER BY applied_at LIMIT 1));

-- Token (par exemple pour accès au QCM) - lié à l'application 1 et 2
INSERT INTO token (value, active, expiration_date, application_id) VALUES
  ('tok_ABC123', false, '2026-02-01 00:00:00', (SELECT id FROM application WHERE candidate_id = (SELECT id FROM candidate WHERE email = 'lina.nguyen@example.com') ORDER BY applied_at LIMIT 1)),
  ('tok_DEF456', true, '2026-03-01 00:00:00', (SELECT id FROM application WHERE candidate_id = (SELECT id FROM candidate WHERE email = 'marc.kouassi@example.com') ORDER BY applied_at LIMIT 1)),
  ('tok_JUDI001', true, '2026-04-01 00:00:00', (SELECT id FROM application WHERE candidate_id = (SELECT id FROM candidate WHERE email = 'judicael.manakasina@example.com') ORDER BY applied_at LIMIT 1)),
  ('tok_KEVIN001', true, '2026-04-01 00:00:00', (SELECT id FROM application WHERE candidate_id = (SELECT id FROM candidate WHERE email = 'kevin.nahary@example.com') ORDER BY applied_at LIMIT 1));

-- Staffing Needs
INSERT INTO staffing_need (title, description, number_of_positions, priority, status, required_start_date, budget_allocated, justification, department_id, job_id, requested_by) VALUES
  ('Renforcement équipe dev', 'Besoin de 2 développeurs pour nouveau projet', 2, 'High', 'Open', '2025-04-01', 120000.00, 'Projet critique', (SELECT id FROM department WHERE name = 'Informatique'), (SELECT id FROM job WHERE title = 'Développeur Fullstack'), (SELECT id FROM employee WHERE employee_number = 'EMP-0001')),
  ('Assistant recrutement', 'Support pour tri des candidatures', 1, 'Medium', 'Open', '2025-05-15', 30000.00, 'Pic d''activité', (SELECT id FROM department WHERE name = 'Ressources Humaines'), (SELECT id FROM job WHERE title = 'Chargé de Recrutement'), (SELECT id FROM employee WHERE employee_number = 'EMP-0002'));

COMMIT;

-- Fin du script
-- Note: certaines applications n'ont volontairement pas d'interview ni d'attempt et leur colonne score est NULL.

-- Ajout d'une interview planifiée pour Randy Matia (application avec status interview_scheduled)
INSERT INTO interview (candidate_id, interviewer_id, interview_date, start_time, duration_minutes, interview_type, location, status, comment, score, application_id) VALUES
  ((SELECT id FROM candidate WHERE email = 'randy.matia@example.com'), (SELECT id FROM employee WHERE employee_number = 'EMP-0002'), '2025-04-25', '09:30:00', 30, 'PRESENTIEL', 'Bureau Lyon - Salle 3', 'SCHEDULED', 'A programmer après QCM', NULL, (SELECT id FROM application WHERE candidate_id = (SELECT id FROM candidate WHERE email = 'randy.matia@example.com') ORDER BY applied_at LIMIT 1));

INSERT INTO department (name, description, annual_budget)
VALUES
    ('Développement', 'Équipe de développement logiciel', 250000.00),
    ('Marketing', 'Marketing & communication', 120000.00),
    ('Finance', 'Comptabilité et finances', 100000.00);

-- 2) Postes (jobs) — référence au département par nom
INSERT INTO job (title, description, required_degree, required_skills, department_id)
VALUES
    ('Développeur Frontend', 'Travail sur UI/UX et composants React', 'Bac+3', 'React, TypeScript, HTML, CSS', (SELECT id FROM department WHERE name = 'Développement')),
    ('Développeur Backend', 'API et logique serveur (Java/Spring)', 'Bac+3', 'Java, Spring, SQL', (SELECT id FROM department WHERE name = 'Développement')),
    ('Chef de projet', 'Gestion de projets IT', 'Bac+5', 'Management, Agile', (SELECT id FROM department WHERE name = 'Développement')),
    ('Marketing Manager', 'Stratégie marketing digital', 'Bac+3', 'SEO, SEA, Analytics', (SELECT id FROM department WHERE name = 'Marketing'));

-- 3) Employés
INSERT INTO employee (employee_number, last_name, first_name, work_email, work_phone, birth_date, gender, address, city, country, hire_date, base_salary, contract_end_date, job_id)
VALUES
    ('EMP-2001', 'Dupont', 'Marie', 'marie.dupont@example.com', '+33123456789', '1988-03-12', 'F', '12 rue de la Paix', 'Paris', 'France', '2020-05-15', 4500.00, NULL, (SELECT id FROM job WHERE title = 'Développeur Backend')),
    ('EMP-2002', 'Martin', 'Jean', 'jean.martin@example.com', '+33198765432', '1985-07-02', 'M', '5 avenue Victor', 'Lyon', 'France', '2019-09-01', 4000.00, NULL, (SELECT id FROM job WHERE title = 'Marketing Manager')),
    ('EMP-2003', 'Bernard', 'Sofia', 'sofia.bernard@example.com', NULL, '1992-11-20', 'F', '34 rue des Fleurs', 'Toulouse', 'France', '2021-02-20', 3500.00, '2023-02-19', (SELECT id FROM job WHERE title = 'Développeur Frontend'));

-- 4) Contrats (employment_contract)
INSERT INTO employment_contract (employee_id, contract_number, start_date, end_date, gross_salary, annual_bonus, benefits, weekly_hours, annual_leave_days, signature_date, contract_file, contract_type, duration_months, trial_period_months, renewable)
VALUES
    ((SELECT id FROM employee WHERE employee_number = 'EMP-2001'), 'C-2020-001', '2020-05-15', NULL, 4500.00, 3000.00, 'Tickets restaurant, mutuelle', 35.0, 25, '2020-05-14', NULL, 'CDI', NULL, 3, true),
    ((SELECT id FROM employee WHERE employee_number = 'EMP-2002'), 'C-2019-001', '2019-09-01', NULL, 4000.00, 2000.00, 'Mutuelle', 35.0, 25, '2019-08-30', NULL, 'CDI', NULL, 3, true),
    ((SELECT id FROM employee WHERE employee_number = 'EMP-2003'), 'C-2021-001', '2021-02-20', '2023-02-19', 3200.00, 0.00, 'CDD - pas d''avantages', 35.0, 25, '2021-02-18', NULL, 'CDD', 24, 0, false);

-- 5) Historique des postes (job_history)
INSERT INTO job_history (employee_id, job_id, department_id, start_date, end_date, reason)
VALUES
    ((SELECT id FROM employee WHERE employee_number = 'EMP-2001'), (SELECT id FROM job WHERE title = 'Développeur Backend'), (SELECT id FROM department WHERE name = 'Développement'), '2020-05-15', NULL, 'Embauche directe'),
    ((SELECT id FROM employee WHERE employee_number = 'EMP20002'), (SELECT id FROM job WHERE title = 'Marketing Manager'), (SELECT id FROM department WHERE name = 'Marketing'), '2019-09-01', NULL, 'Recrutement'),
    ((SELECT id FROM employee WHERE employee_number = 'EMP-2003'), (SELECT id FROM job WHERE title = 'Développeur Frontend'), (SELECT id FROM department WHERE name = 'Développement'), '2021-02-20', '2023-02-19', 'CDD terminé');

-- 6) Documents RH (hr_document)
INSERT INTO hr_document (employee_id, doc_type, file_path, uploaded_at, expiry_date, visible_to_employee)
VALUES
    ((SELECT id FROM employee WHERE employee_number = 'EMP-2001'), 'CV', 'uploads/employees/1/cv_marie_dupont.pdf', NOW(), NULL, true),
    ((SELECT id FROM employee WHERE employee_number = 'EMP-2002'), 'CONTRAT', 'uploads/employees/2/contract_jean_martin.pdf', NOW(), NULL, false);

-- 7) Besoins en personnel (staffing_need)
INSERT INTO staffing_need (title, description, number_of_positions, priority, status, required_start_date, budget_allocated, justification, department_id, job_id, requested_by)
VALUES
    ('Développeur Backend Senior', 'Renforcement de l''équipe backend', 1, 'High', 'Open', '2025-01-15', 60000.00, 'Projet critique', (SELECT id FROM department WHERE name = 'Développement'), (SELECT id FROM job WHERE title = 'Développeur Backend'), (SELECT id FROM employee WHERE employee_number = 'EMP-0001')),
    ('Spécialiste Marketing Digital', 'Améliorer la présence en ligne', 1, 'Medium', 'In Progress', '2025-02-01', 40000.00, 'Campagne Q1', (SELECT id FROM department WHERE name = 'Marketing'), (SELECT id FROM job WHERE title = 'Marketing Manager'), (SELECT id FROM employee WHERE employee_number = 'EMP-0002'));

