-- Create Leave Type table
CREATE TABLE leave_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    max_days_per_year INT,
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    advance_notice_days INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    color VARCHAR(7) DEFAULT '#007bff'
);

-- Create Leave Request table
CREATE TABLE leave_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    employee_id BIGINT NOT NULL,
    leave_type_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INT NOT NULL,
    reason TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    approved_by BIGINT,
    approved_date DATE,
    approval_comment TEXT,
    is_half_day_start BOOLEAN NOT NULL DEFAULT FALSE,
    is_half_day_end BOOLEAN NOT NULL DEFAULT FALSE,
    emergency_contact VARCHAR(150),
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_type(id),
    FOREIGN KEY (approved_by) REFERENCES employee(id)
);

-- Create Leave Balance table
CREATE TABLE leave_balance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    employee_id BIGINT NOT NULL,
    leave_type_id BIGINT NOT NULL,
    year INT NOT NULL,
    allocated_days DECIMAL(5,2) NOT NULL,
    used_days DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    pending_days DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    carried_over_days DECIMAL(5,2) DEFAULT 0.00,
    expires_on DATE,
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_type(id),
    UNIQUE KEY unique_employee_leave_year (employee_id, leave_type_id, year)
);

-- Create Leave Notification table
CREATE TABLE leave_notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    leave_request_id BIGINT NOT NULL,
    recipient_id BIGINT NOT NULL,
    notification_type ENUM('REQUEST_SUBMITTED', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'REQUEST_CANCELLED', 'BALANCE_LOW', 'EXPIRING_LEAVE', 'OVERLAPPING_LEAVE') NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leave_request_id) REFERENCES leave_request(id),
    FOREIGN KEY (recipient_id) REFERENCES employee(id)
);

-- Create indexes for better performance
CREATE INDEX idx_leave_request_employee ON leave_request(employee_id);
CREATE INDEX idx_leave_request_status ON leave_request(status);
CREATE INDEX idx_leave_request_dates ON leave_request(start_date, end_date);
CREATE INDEX idx_leave_balance_employee_year ON leave_balance(employee_id, year);
CREATE INDEX idx_leave_notification_recipient ON leave_notification(recipient_id, is_read);

-- Insert default leave types
INSERT INTO leave_type (name, description, is_paid, max_days_per_year, requires_approval, advance_notice_days, color) VALUES
('Congés Payés', 'Congés payés annuels', TRUE, 25, TRUE, 7, '#007bff'),
('RTT', 'Réduction du Temps de Travail', TRUE, 10, TRUE, 3, '#28a745'),
('Congé Maladie', 'Congé pour maladie', TRUE, NULL, FALSE, 0, '#ffc107'),
('Congé Maternité', 'Congé de maternité', TRUE, NULL, FALSE, 30, '#e83e8c'),
('Congé Paternité', 'Congé de paternité', TRUE, NULL, FALSE, 30, '#6f42c1'),
('Congé Sans Solde', 'Congé sans solde', FALSE, NULL, TRUE, 30, '#6c757d'),
('Formation', 'Congé de formation', TRUE, NULL, TRUE, 15, '#fd7e14'),
('Congé Exceptionnel', 'Congé pour événement familial', TRUE, 5, TRUE, 1, '#dc3545');
