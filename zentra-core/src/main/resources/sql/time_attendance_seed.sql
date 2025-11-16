-- Données de test pour la gestion des présences / temps
-- A exécuter sur une base de développement

-- Prérequis: s'assurer qu'au moins un département et un job existent
INSERT INTO department (name)
SELECT 'RH'
WHERE NOT EXISTS (SELECT 1 FROM department WHERE name = 'RH');

INSERT INTO job (title, department_id)
SELECT 'Employé', (SELECT id FROM department WHERE name = 'RH')
WHERE NOT EXISTS (SELECT 1 FROM job WHERE title = 'Employé');

-- Employés de test (si non existants). Adapter les IDs si conflits.
INSERT INTO employee (employee_number, last_name, first_name, work_email, birth_date, country, hire_date, base_salary, job_id)
VALUES ('E001','Dupont','Alice','alice.dupont@demo.local','1990-04-12','France','2023-01-02',3200,
        (SELECT id FROM job WHERE title='Employé' LIMIT 1));

INSERT INTO employee (employee_number, last_name, first_name, work_email, birth_date, country, hire_date, base_salary, job_id)
VALUES ('E002','Martin','Bruno','bruno.martin@demo.local','1988-07-21','France','2023-02-10',3000,
        (SELECT id FROM job WHERE title='Employé' LIMIT 1));

INSERT INTO employee (employee_number, last_name, first_name, work_email, birth_date, country, hire_date, base_salary, job_id)
VALUES ('E003','Leroy','Chloe','chloe.leroy@demo.local','1995-11-03','France','2023-03-15',3500,
        (SELECT id FROM job WHERE title='Employé' LIMIT 1));

-- Pointages sur une journée
-- Alice: arrivée à 09:05 -> 5 min retard, départ 18:10 -> 8h05 net - 1h pause = 7h05 travaillées, 0h05 HS
INSERT INTO time_entry (employee_id, entry_date, check_in, check_out, hours_worked, overtime_hours, late_minutes, break_minutes, entry_type, note)
VALUES ((SELECT id FROM employee WHERE employee_number='E001'), CURRENT_DATE - 1,
        (CURRENT_DATE - 1) + TIME '09:05', (CURRENT_DATE - 1) + TIME '18:10', 7.0833, 0.0833, 5, 60, 'MANUAL', 'Journée standard');

-- Bruno: arrivée 08:50, départ 17:30 -> 8h40 brutes - 1h pause = 7h40, pas d heures sup (<8h)
INSERT INTO time_entry (employee_id, entry_date, check_in, check_out, hours_worked, overtime_hours, late_minutes, break_minutes, entry_type, note)
VALUES ((SELECT id FROM employee WHERE employee_number='E002'), CURRENT_DATE - 1,
        (CURRENT_DATE - 1) + TIME '08:50', (CURRENT_DATE - 1) + TIME '17:30', 7.6667, 0.0, 0, 60, 'BADGE', 'Pointage badgeuse');

-- Chloe: arrivée 09:30 (retard 30'), départ 19:45 -> 10h15 brutes - 1h pause = 9h15 -> 1h15 HS
INSERT INTO time_entry (employee_id, entry_date, check_in, check_out, hours_worked, overtime_hours, late_minutes, break_minutes, entry_type, note)
VALUES ((SELECT id FROM employee WHERE employee_number='E003'), CURRENT_DATE - 1,
        (CURRENT_DATE - 1) + TIME '09:30', (CURRENT_DATE - 1) + TIME '19:45', 9.25, 1.25, 30, 60, 'MOBILE', 'Mission client fin de journée');

-- Journée courante: seulement Alice a déjà pointé (check-in sans check-out)
INSERT INTO time_entry (employee_id, entry_date, check_in, entry_type, late_minutes, note)
VALUES ((SELECT id FROM employee WHERE employee_number='E001'), CURRENT_DATE,
        CURRENT_TIMESTAMP - INTERVAL '3 hours', 'MANUAL', 0, 'Session ouverte');
