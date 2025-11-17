-- Script SQL de test pour le service de paie (PayService)
-- Ce script insère des données pour tester la génération de fiches de paie
-- Ordre d'insertion respecté pour les dépendances entre tables

-- Nettoyer les données existantes (optionnel - décommenter si nécessaire)
-- TRUNCATE TABLE pay_stub CASCADE;
-- TRUNCATE TABLE salary_component CASCADE;
-- TRUNCATE TABLE salary_deduction CASCADE;
-- TRUNCATE TABLE bonus CASCADE;
-- TRUNCATE TABLE salary_advance CASCADE;
-- TRUNCATE TABLE time_entry CASCADE;
-- TRUNCATE TABLE overtime_rate CASCADE;
-- TRUNCATE TABLE cnaps_rate CASCADE;
-- TRUNCATE TABLE irsa_rate CASCADE;
-- TRUNCATE TABLE ostie_rate CASCADE;

-- ============================================
-- 1. TAUX DE COTISATIONS ET TAXES
-- ============================================

-- CNAPS Rate (Caisse Nationale de Prévoyance Sociale)
INSERT INTO cnaps_rate (id, ceiling_base_amount, ceiling_rate, rate, created_at, updated_at)
VALUES
(1, 8000000.0, 8.0, 1.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET ceiling_base_amount = EXCLUDED.ceiling_base_amount,
    ceiling_rate = EXCLUDED.ceiling_rate,
    rate = EXCLUDED.rate,
    updated_at = NOW();

-- OSTIE Rate (Organisme Sanitaire Tananarivien Inter-Entreprises)
INSERT INTO ostie_rate (id, rate, created_at, updated_at)
VALUES
(1, 5.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET rate = EXCLUDED.rate,
    updated_at = NOW();

-- IRSA Rates (Impôt sur les Revenus Salariaux et Assimilés) - Tranches progressives
-- Tranche 1: 0 à 350,000 Ar = 0%
INSERT INTO irsa_rate (id, min_income, max_income, rate, amount, created_at, updated_at)
VALUES
(1, NULL, 350000.0, 0.0, 0.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET min_income = EXCLUDED.min_income,
    max_income = EXCLUDED.max_income,
    rate = EXCLUDED.rate,
    amount = EXCLUDED.amount,
    updated_at = NOW();

-- Tranche 2: 350,001 à 400,000 Ar = 5%
INSERT INTO irsa_rate (id, min_income, max_income, rate, amount, created_at, updated_at)
VALUES
(2, 350000.0, 400000.0, 5.0, 50000.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET min_income = EXCLUDED.min_income,
    max_income = EXCLUDED.max_income,
    rate = EXCLUDED.rate,
    amount = EXCLUDED.amount,
    updated_at = NOW();

-- Tranche 3: 400,001 à 500,000 Ar = 10%
INSERT INTO irsa_rate (id, min_income, max_income, rate, amount, created_at, updated_at)
VALUES
(3, 400000.0, 500000.0, 10.0, 100000.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET min_income = EXCLUDED.min_income,
    max_income = EXCLUDED.max_income,
    rate = EXCLUDED.rate,
    amount = EXCLUDED.amount,
    updated_at = NOW();

-- Tranche 4: 500,001 à 600,000 Ar = 15%
INSERT INTO irsa_rate (id, min_income, max_income, rate, amount, created_at, updated_at)
VALUES
(4, 500000.0, 600000.0, 15.0, 100000.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET min_income = EXCLUDED.min_income,
    max_income = EXCLUDED.max_income,
    rate = EXCLUDED.rate,
    amount = EXCLUDED.amount,
    updated_at = NOW();

-- Tranche 5: Au-delà de 600,000 Ar = 20%
INSERT INTO irsa_rate (id, min_income, max_income, rate, amount, created_at, updated_at)
VALUES
(5, 600000.0, NULL, 20.0, 100000, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET min_income = EXCLUDED.min_income,
    max_income = EXCLUDED.max_income,
    rate = EXCLUDED.rate,
    amount = EXCLUDED.amount,
    updated_at = NOW();

-- Overtime Rates (Heures supplémentaires)
-- Tranche 1: 0-8 heures = 30% de majoration
INSERT INTO overtime_rate (id, min_hours, max_hours, rate, created_at, updated_at)
VALUES
(1, 0, 8, 30.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET min_hours = EXCLUDED.min_hours,
    max_hours = EXCLUDED.max_hours,
    rate = EXCLUDED.rate,
    updated_at = NOW();

-- Tranche 2: 9-16 heures = 50% de majoration
INSERT INTO overtime_rate (id, min_hours, max_hours, rate, created_at, updated_at)
VALUES
(2, 8, 16, 50.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET min_hours = EXCLUDED.min_hours,
    max_hours = EXCLUDED.max_hours,
    rate = EXCLUDED.rate,
    updated_at = NOW();

-- Tranche 3: Au-delà de 16 heures = 100% de majoration
INSERT INTO overtime_rate (id, min_hours, max_hours, rate, created_at, updated_at)
VALUES
(3, 16, 999, 100.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET min_hours = EXCLUDED.min_hours,
    max_hours = EXCLUDED.max_hours,
    rate = EXCLUDED.rate,
    updated_at = NOW();

-- ============================================
-- 2. STRUCTURE ORGANISATIONNELLE
-- ============================================

-- Departments
INSERT INTO department (id, name, created_at, updated_at)
VALUES
(100, 'Ressources Humaines M', NOW(), NOW()),
(101, 'Développement M', NOW(), NOW()),
(102, 'Commercial M', NOW(), NOW()),
(103, 'Finance M', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    updated_at = NOW();

-- Jobs
INSERT INTO job (id, title, description, department_id, created_at, updated_at)
VALUES
(200, 'Développeur Senior', 'Développement d''applications', 101, NOW(), NOW()),
(201, 'Manager RH', 'Gestion des ressources humaines', 100, NOW(), NOW()),
(202, 'Commercial', 'Ventes et relations clients', 102, NOW(), NOW()),
(203, 'Comptable', 'Gestion comptable et financière', 103, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    department_id = EXCLUDED.department_id,
    updated_at = NOW();

-- ============================================
-- 3. EMPLOYÉS ET CONTRATS
-- ============================================

-- Employé 1: Rakoto Jean (Développeur Senior)
INSERT INTO employee (id, first_name, last_name, work_email, work_phone, birth_date, gender, address,
                     city, country, employee_number, cnaps_number, hire_date, base_salary, job_id, created_at, updated_at)
VALUES
(1000, 'Jean', 'Rakoto', 'jean.rakoto@zentra.mg', '+261 34 12 345 67', '1990-05-15', 'M',
 'Lot II B 45 Ankorondrano, Antananarivo', 'Antananarivo', 'Madagascar', 'EMP-2023-001', 1234567890, '2020-01-15', 1500000.0, 200, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    work_email = EXCLUDED.work_email,
    base_salary = EXCLUDED.base_salary,
    updated_at = NOW();

-- Contrat pour Employé 1
INSERT INTO employment_contract (id, employee_id, contract_number, contract_type, start_date, end_date,
                     gross_salary, annual_leave_days, weekly_hours, created_at, updated_at)
VALUES
(2000, 1000, 'CONT-2020-001', 'CDI', '2020-01-15', NULL, 1500000.0, 30, 40.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET gross_salary = EXCLUDED.gross_salary,
    updated_at = NOW();

-- Employé 2: Rabe Marie (Manager RH)
INSERT INTO employee (id, first_name, last_name, work_email, work_phone, birth_date, gender, address,
                     city, country, employee_number, cnaps_number, hire_date, base_salary, job_id, created_at, updated_at)
VALUES
(1001, 'Marie', 'Rabe', 'marie.rabe@zentra.mg', '+261 33 98 765 43', '1988-08-22', 'F',
 'Lot III C 12 Ambohimanarina, Antananarivo', 'Antananarivo', 'Madagascar', 'EMP-2023-002', 9876543210, '2019-03-10', 2000000.0, 201, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    work_email = EXCLUDED.work_email,
    base_salary = EXCLUDED.base_salary,
    updated_at = NOW();

-- Contrat pour Employé 2
INSERT INTO employment_contract (id, employee_id, contract_number, contract_type, start_date, end_date,
                     gross_salary, annual_leave_days, weekly_hours, created_at, updated_at)
VALUES
(2001, 1001, 'CONT-2019-002', 'CDI', '2019-03-10', NULL, 2000000.0, 30, 40.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET gross_salary = EXCLUDED.gross_salary,
    updated_at = NOW();

-- Employé 3: Andrianina Paul (Commercial)
INSERT INTO employee (id, first_name, last_name, work_email, work_phone, birth_date, gender, address,
                     city, country, employee_number, cnaps_number, hire_date, base_salary, job_id, created_at, updated_at)
VALUES
(1002, 'Paul', 'Andrianina', 'paul.andrianina@zentra.mg', '+261 32 55 444 33', '1992-11-30', 'M',
 'Lot IV A 78 Ivato, Antananarivo', 'Antananarivo', 'Madagascar', 'EMP-2023-003', 5555666677, '2021-06-01', 800000.0, 202, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    work_email = EXCLUDED.work_email,
    base_salary = EXCLUDED.base_salary,
    updated_at = NOW();

-- Contrat pour Employé 3
INSERT INTO employment_contract (id, employee_id, contract_number, contract_type, start_date, end_date,
                     gross_salary, annual_leave_days, weekly_hours, created_at, updated_at)
VALUES
(2002, 1002, 'CONT-2021-003', 'CDD', '2021-06-01', '2025-06-01', 800000.0, 25, 40.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET gross_salary = EXCLUDED.gross_salary,
    updated_at = NOW();

-- ============================================
-- 4. DONNÉES DE TEMPS ET PRÉSENCE (Janvier 2025)
-- ============================================

-- TimeEntries pour Jean Rakoto (Janvier 2025) - 22 jours travaillés + 10h sup
INSERT INTO time_entry (id, employee_id, entry_date, check_in, check_out, hours_worked, overtime_hours,
                        late_minutes, break_minutes, entry_type, created_at, updated_at)
SELECT
    3000 + (day - 1) as id,
    1000 as employee_id,
    DATE '2025-01-01' + (day - 1) as entry_date,
    TIMESTAMP '2025-01-01 08:00:00' + (day - 1) * INTERVAL '1 day' as check_in,
    TIMESTAMP '2025-01-01 17:30:00' + (day - 1) * INTERVAL '1 day' as check_out,
    8.5 as hours_worked,
    CASE WHEN day IN (15, 22) THEN 2.0 ELSE 0.5 END as overtime_hours,
    0 as late_minutes,
    60 as break_minutes,
    'WORK' as entry_type,
    NOW() as created_at,
    NOW() as updated_at
FROM generate_series(1, 22) as day
WHERE EXTRACT(DOW FROM DATE '2025-01-01' + (day - 1)) NOT IN (0, 6) -- Exclure weekends
ON CONFLICT (id) DO NOTHING;

-- TimeEntries pour Marie Rabe (Janvier 2025) - 20 jours travaillés
INSERT INTO time_entry (id, employee_id, entry_date, check_in, check_out, hours_worked, overtime_hours,
                        late_minutes, break_minutes, entry_type, created_at, updated_at)
SELECT
    3100 + (day - 1) as id,
    1001 as employee_id,
    DATE '2025-01-01' + (day - 1) as entry_date,
    TIMESTAMP '2025-01-01 08:15:00' + (day - 1) * INTERVAL '1 day' as check_in,
    TIMESTAMP '2025-01-01 17:15:00' + (day - 1) * INTERVAL '1 day' as check_out,
    8.0 as hours_worked,
    0.0 as overtime_hours,
    15 as late_minutes,
    60 as break_minutes,
    'WORK' as entry_type,
    NOW() as created_at,
    NOW() as updated_at
FROM generate_series(1, 20) as day
WHERE EXTRACT(DOW FROM DATE '2025-01-01' + (day - 1)) NOT IN (0, 6)
ON CONFLICT (id) DO NOTHING;

-- TimeEntries pour Paul Andrianina (Janvier 2025) - 18 jours travaillés + absences
INSERT INTO time_entry (id, employee_id, entry_date, check_in, check_out, hours_worked, overtime_hours,
                        late_minutes, break_minutes, entry_type, created_at, updated_at)
SELECT
    3200 + (day - 1) as id,
    1002 as employee_id,
    DATE '2025-01-01' + (day - 1) as entry_date,
    TIMESTAMP '2025-01-01 08:30:00' + (day - 1) * INTERVAL '1 day' as check_in,
    TIMESTAMP '2025-01-01 17:00:00' + (day - 1) * INTERVAL '1 day' as check_out,
    7.5 as hours_worked,
    0.0 as overtime_hours,
    30 as late_minutes,
    60 as break_minutes,
    'WORK' as entry_type,
    NOW() as created_at,
    NOW() as updated_at
FROM generate_series(1, 18) as day
WHERE EXTRACT(DOW FROM DATE '2025-01-01' + (day - 1)) NOT IN (0, 6)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. BONUS (Janvier 2025)
-- ============================================

-- Bonus pour Jean Rakoto - Prime de performance
INSERT INTO bonus (id, employee_id, amount, description, date, created_at, updated_at)
VALUES
(4000, 1000, 150000.0, 'Prime de performance Q4 2024', '2025-01-15', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET amount = EXCLUDED.amount,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Bonus pour Marie Rabe - Prime exceptionnelle
INSERT INTO bonus (id, employee_id, amount, description, date, created_at, updated_at)
VALUES
(4001, 1001, 250000.0, 'Prime exceptionnelle - Projet réussi', '2025-01-20', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET amount = EXCLUDED.amount,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Bonus pour Paul Andrianina - Prime de vente
INSERT INTO bonus (id, employee_id, amount, description, date, created_at, updated_at)
VALUES
(4002, 1002, 100000.0, 'Commission sur ventes Janvier', '2025-01-25', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET amount = EXCLUDED.amount,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================
-- 6. AVANCES SUR SALAIRE (Janvier 2025)
-- ============================================

-- Avance pour Jean Rakoto - Approuvée
INSERT INTO salary_advance (id, employee_id, amount, reason, date, status, created_at, updated_at)
VALUES
(5000, 1000, 200000.0, 'Frais médicaux urgents', '2025-01-10', 'APPROVED', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET amount = EXCLUDED.amount,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Avance pour Paul Andrianina - En attente
INSERT INTO salary_advance (id, employee_id, amount, reason, date, status, created_at, updated_at)
VALUES
(5001, 1002, 100000.0, 'Scolarité enfants', '2025-01-18', 'PENDING', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET amount = EXCLUDED.amount,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Avance pour Marie Rabe - Rejetée
INSERT INTO salary_advance (id, employee_id, amount, reason, date, status, created_at, updated_at)
VALUES
(5002, 1001, 300000.0, 'Achat véhicule', '2025-01-05', 'REJECTED', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET amount = EXCLUDED.amount,
    status = EXCLUDED.status,
    updated_at = NOW();


-- ============================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- ============================================

-- Vérifier les employés
SELECT e.id, e.employee_number, e.first_name, e.last_name, e.base_salary, j.title
FROM employee e
JOIN job j ON e.job_id = j.id
WHERE e.id IN (1000, 1001, 1002)
ORDER BY e.id;

-- -- Vérifier les taux de cotisation
-- SELECT 'CNAPS' as type, rate FROM cnaps_rate WHERE id = 1
-- UNION ALL
-- SELECT 'OSTIE' as type, rate FROM ostie_rate WHERE id = 1
-- UNION ALL
-- SELECT 'IRSA-' || id as type, rate FROM irsa_rate ORDER BY id;

-- Vérifier les heures supplémentaires pour Janvier 2025
SELECT
    e.employee_number,
    e.first_name || ' ' || e.last_name as employee_name,
    COUNT(*) as days_worked,
    SUM(te.overtime_hours) as total_overtime
FROM employee e
JOIN time_entry te ON e.id = te.employee_id
WHERE te.entry_date BETWEEN '2025-01-01' AND '2025-01-31'
GROUP BY e.id, e.employee_number, e.first_name, e.last_name
ORDER BY e.employee_number;

-- Vérifier les bonus de Janvier 2025
SELECT
    e.employee_number,
    e.first_name || ' ' || e.last_name as employee_name,
    b.amount,
    b.description,
    b.date
FROM employee e
JOIN bonus b ON e.id = b.employee_id
WHERE b.date BETWEEN '2025-01-01' AND '2025-01-31'
ORDER BY e.employee_number;

-- Vérifier les avances sur salaire
SELECT
    e.employee_number,
    e.first_name || ' ' || e.last_name as employee_name,
    sa.amount,
    sa.reason,
    sa.status,
    sa.date
FROM employee e
JOIN salary_advance sa ON e.id = sa.employee_id
WHERE sa.date BETWEEN '2025-01-01' AND '2025-01-31'
ORDER BY e.employee_number;

-- ============================================
-- COMMANDES DE TEST POUR L'API
-- ============================================

-- Pour tester la génération de fiche de paie, utiliser ces endpoints:
--
-- 1. Générer la fiche de paie de Jean Rakoto pour Janvier 2025:
--    POST http://localhost:8080/api/pay/paystub/generate?employeeId=1000&yearMonth=2025-01
--
-- 2. Générer la fiche de paie de Marie Rabe pour Janvier 2025:
--    POST http://localhost:8080/api/pay/paystub/generate?employeeId=1001&yearMonth=2025-01
--
-- 3. Générer la fiche de paie de Paul Andrianina pour Janvier 2025:
--    POST http://localhost:8080/api/pay/paystub/generate?employeeId=1002&yearMonth=2025-01
--
-- 4. Récupérer une fiche de paie existante:
--    GET http://localhost:8080/api/pay/paystub?employeeId=1000&yearMonth=2025-01
--
-- 5. Créer un nouveau bonus:
--    POST http://localhost:8080/api/pay/bonus
--    Body: {"employeeId": 1000, "amount": 50000, "description": "Test bonus", "date": "2025-01"}
--
-- 6. Valider une avance sur salaire:
--    PUT http://localhost:8080/api/pay/salary-advance/5001/validate

-- ============================================
-- FIN DU SCRIPT
-- ============================================

COMMIT;

-- Afficher un message de succès
DO $$
BEGIN
    RAISE NOTICE '✅ Script de test exécuté avec succès!';
    RAISE NOTICE '📊 Données insérées:';
    RAISE NOTICE '   - 3 employés avec contrats';
    RAISE NOTICE '   - Taux CNAPS, OSTIE et IRSA configurés';
    RAISE NOTICE '   - 3 tranches d''heures supplémentaires';
    RAISE NOTICE '   - Entrées de temps pour Janvier 2025';
    RAISE NOTICE '   - 3 bonus et 3 avances sur salaire';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Prêt pour les tests du PayService!';
END $$;

