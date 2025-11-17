-- Self-Service Sample Data

-- Sample Payslips for existing employees
INSERT INTO payslip (employee_id, period_year, period_month, gross_amount, net_amount, deductions, bonuses, file_path, generated_at, status)
SELECT 
    id,
    2024,
    11,
    base_salary,
    base_salary * 0.75,
    base_salary * 0.25,
    0,
    '/uploads/payslips/2024/11/' || employee_number || '.pdf',
    '2024-11-30 23:59:59',
    'GENERATED'
FROM employee
WHERE id IN (SELECT id FROM employee LIMIT 3);

INSERT INTO payslip (employee_id, period_year, period_month, gross_amount, net_amount, deductions, bonuses, file_path, generated_at, status)
SELECT 
    id,
    2024,
    10,
    base_salary,
    base_salary * 0.75,
    base_salary * 0.25,
    0,
    '/uploads/payslips/2024/10/' || employee_number || '.pdf',
    '2024-10-31 23:59:59',
    'VIEWED'
FROM employee
WHERE id IN (SELECT id FROM employee LIMIT 3);

-- Sample Leave Balances
INSERT INTO leave_balance (employee_id, year, annual_total, annual_taken, sick_total, sick_taken, exceptional_total, exceptional_taken)
SELECT 
    id,
    2024,
    25.0,
    5.0,
    10.0,
    2.0,
    5.0,
    0.0
FROM employee
WHERE id IN (SELECT id FROM employee LIMIT 5);

-- Sample Leave Requests
INSERT INTO leave_request (employee_id, start_date, end_date, days, type, status, reason)
SELECT 
    id,
    '2024-12-23',
    '2024-12-27',
    5.0,
    'ANNUAL',
    'PENDING',
    'Congés de fin d''année'
FROM employee
WHERE id = (SELECT id FROM employee LIMIT 1);

INSERT INTO leave_request (employee_id, start_date, end_date, days, type, status, reason, approver_id, approved_at)
SELECT 
    e1.id,
    '2024-11-04',
    '2024-11-08',
    5.0,
    'ANNUAL',
    'APPROVED',
    'Vacances familiales',
    e2.id,
    '2024-10-25 14:30:00'
FROM employee e1
CROSS JOIN (SELECT id FROM employee OFFSET 1 LIMIT 1) e2
WHERE e1.id = (SELECT id FROM employee LIMIT 1);

-- Sample Document Requests
INSERT INTO document_request (employee_id, type, status, reason, requested_at)
SELECT 
    id,
    'WORK_CERTIFICATE',
    'PENDING',
    'Pour demande de visa',
    CURRENT_TIMESTAMP
FROM employee
WHERE id = (SELECT id FROM employee LIMIT 1);

INSERT INTO document_request (employee_id, type, status, reason, requested_at, processed_at, file_path, processed_by)
SELECT 
    e1.id,
    'SALARY_CERTIFICATE',
    'READY',
    'Pour dossier bancaire',
    '2024-11-10 09:00:00',
    '2024-11-12 15:30:00',
    '/uploads/documents/salary_cert_' || e1.employee_number || '.pdf',
    e2.id
FROM employee e1
CROSS JOIN (SELECT id FROM employee OFFSET 1 LIMIT 1) e2
WHERE e1.id = (SELECT id FROM employee LIMIT 1);

-- Sample Expense Claims
INSERT INTO expense_claim (employee_id, claim_date, amount, currency, category, description, status, receipt_files, submitted_at)
SELECT 
    id,
    '2024-11-15',
    125.50,
    'EUR',
    'MEAL',
    'Déjeuner client - Projet X',
    'PENDING',
    '/uploads/expenses/receipt_001.jpg',
    '2024-11-15 18:30:00'
FROM employee
WHERE id = (SELECT id FROM employee LIMIT 1);

INSERT INTO expense_claim (employee_id, claim_date, amount, currency, category, description, status, receipt_files, submitted_at, reviewed_by, reviewed_at, review_notes)
SELECT 
    e1.id,
    '2024-10-20',
    450.00,
    'EUR',
    'TRAVEL',
    'Train Paris-Lyon A/R',
    'APPROVED',
    '/uploads/expenses/receipt_002.pdf',
    '2024-10-21 10:00:00',
    e2.id,
    '2024-10-23 16:00:00',
    'Approuvé'
FROM employee e1
CROSS JOIN (SELECT id FROM employee OFFSET 1 LIMIT 1) e2
WHERE e1.id = (SELECT id FROM employee LIMIT 1);

-- Sample HR Messages
INSERT INTO hr_message (employee_id, sender_role, subject, body, sent_at, thread_id)
SELECT 
    id,
    'EMPLOYEE',
    'Question sur bulletin de paie',
    'Bonjour, j''ai une question concernant une ligne de mon dernier bulletin de paie. Pouvez-vous m''éclairer ?',
    '2024-11-14 10:00:00',
    'THREAD-MSG-001'
FROM employee
WHERE id = (SELECT id FROM employee LIMIT 1);

INSERT INTO hr_message (employee_id, sender_role, subject, body, sent_at, read_at, thread_id, hr_user_id)
SELECT 
    e1.id,
    'HR',
    'RE: Question sur bulletin de paie',
    'Bonjour, bien sûr ! De quelle ligne s''agit-il précisément ?',
    '2024-11-14 14:30:00',
    '2024-11-14 15:00:00',
    'THREAD-MSG-001',
    e2.id
FROM employee e1
CROSS JOIN (SELECT id FROM employee OFFSET 1 LIMIT 1) e2
WHERE e1.id = (SELECT id FROM employee LIMIT 1);
