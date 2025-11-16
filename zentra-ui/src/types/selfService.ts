// Self-Service Employee Types

export interface EmployeeProfile {
  id: number;
  employeeNumber: string;
  lastName: string;
  firstName: string;
  workEmail: string;
  workPhone?: string;
  birthDate: string;
  gender?: string;
  address?: string;
  city?: string;
  country: string;
  hireDate: string;
  baseSalary: number;
  contractEndDate?: string;
  jobId?: number;
}

export interface EmployeeProfileUpdate {
  workPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  gender?: string;
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  year: number;
  annualTotal: number;
  annualTaken: number;
  annualRemaining: number;
  sickTotal: number;
  sickTaken: number;
  sickRemaining: number;
  exceptionalTotal: number;
  exceptionalTaken: number;
  exceptionalRemaining: number;
}

export interface LeaveRequest {
  id?: number;
  employeeId?: number;
  employeeName?: string;
  startDate: string;
  endDate: string;
  days?: number;
  type: 'ANNUAL' | 'SICK' | 'EXCEPTIONAL';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason?: string;
  approverId?: number;
  approverName?: string;
  approvedAt?: string;
}

export interface Payslip {
  id: number;
  employeeId: number;
  employeeName: string;
  periodYear: number;
  periodMonth: number;
  grossAmount: number;
  netAmount: number;
  deductions?: number;
  bonuses?: number;
  filePath?: string;
  generatedAt: string;
  status: string;
}

export interface DocumentRequest {
  id?: number;
  employeeId?: number;
  employeeName?: string;
  type: 'WORK_CERTIFICATE' | 'SALARY_CERTIFICATE' | 'TAX_CERTIFICATE' | 'EMPLOYMENT_CONTRACT';
  status?: 'PENDING' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';
  reason?: string;
  requestedAt?: string;
  processedAt?: string;
  deliveredAt?: string;
  filePath?: string;
  processedById?: number;
  processedByName?: string;
  notes?: string;
}

export interface ExpenseClaim {
  id?: number;
  employeeId?: number;
  employeeName?: string;
  claimDate: string;
  amount: number;
  currency?: string;
  category: 'TRAVEL' | 'MEAL' | 'ACCOMMODATION' | 'OFFICE_SUPPLIES' | 'CLIENT_ENTERTAINMENT' | 'OTHER';
  description?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED';
  receiptFiles?: string;
  submittedAt?: string;
  reviewedById?: number;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  paidAt?: string;
}

export interface HrMessage {
  id?: number;
  employeeId?: number;
  employeeName?: string;
  senderRole: 'EMPLOYEE' | 'HR';
  subject?: string;
  body: string;
  sentAt?: string;
  readAt?: string;
  threadId?: string;
  isArchived?: boolean;
  hrUserId?: number;
  hrUserName?: string;
}
