-- Self-Service Employee Tables

-- Payslip table
CREATE TABLE IF NOT EXISTS payslip (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(id),
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    gross_amount DOUBLE PRECISION NOT NULL,
    net_amount DOUBLE PRECISION NOT NULL,
    deductions DOUBLE PRECISION,
    bonuses DOUBLE PRECISION,
    file_path VARCHAR(500),
    generated_at TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'GENERATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, period_year, period_month)
);

-- Document Request table
CREATE TABLE IF NOT EXISTS document_request (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(id),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reason TEXT,
    requested_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP,
    delivered_at TIMESTAMP,
    file_path VARCHAR(500),
    processed_by BIGINT REFERENCES employee(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expense Claim table
CREATE TABLE IF NOT EXISTS expense_claim (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(id),
    claim_date DATE NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    category VARCHAR(100),
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    receipt_files TEXT,
    submitted_at TIMESTAMP NOT NULL,
    reviewed_by BIGINT REFERENCES employee(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HR Message table
CREATE TABLE IF NOT EXISTS hr_message (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(id),
    sender_role VARCHAR(20) NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL,
    read_at TIMESTAMP,
    thread_id VARCHAR(100),
    is_archived BOOLEAN DEFAULT FALSE,
    hr_user_id BIGINT REFERENCES employee(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave Balance table (if not exists)
CREATE TABLE IF NOT EXISTS leave_balance (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(id),
    year INTEGER NOT NULL,
    annual_total DOUBLE PRECISION DEFAULT 25.0,
    annual_taken DOUBLE PRECISION DEFAULT 0.0,
    sick_total DOUBLE PRECISION DEFAULT 0.0,
    sick_taken DOUBLE PRECISION DEFAULT 0.0,
    exceptional_total DOUBLE PRECISION DEFAULT 0.0,
    exceptional_taken DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, year)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payslip_employee ON payslip(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslip_period ON payslip(period_year, period_month);

CREATE INDEX IF NOT EXISTS idx_document_request_employee ON document_request(employee_id);
CREATE INDEX IF NOT EXISTS idx_document_request_status ON document_request(status);

CREATE INDEX IF NOT EXISTS idx_expense_claim_employee ON expense_claim(employee_id);
CREATE INDEX IF NOT EXISTS idx_expense_claim_status ON expense_claim(status);

CREATE INDEX IF NOT EXISTS idx_hr_message_employee ON hr_message(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_message_thread ON hr_message(thread_id);

CREATE INDEX IF NOT EXISTS idx_leave_balance_employee_year ON leave_balance(employee_id, year);
