import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/self';

export interface EmployeeProfile {
  id: number;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  workEmail: string;
  workPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  hireDate: string;
  baseSalary?: number;
}

export interface LeaveBalance {
  employeeId: number;
  year: number;
  annualLeaveDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
}

export interface LeaveRequest {
  id?: number;
  employeeId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  requestDate?: string;
  approvedBy?: number;
  approvedDate?: string;
  rejectionReason?: string;
}

export interface Payslip {
  id: number;
  employeeId: number;
  payPeriod: string;
  payDate: string;
  grossSalary: number;
  netSalary: number;
  deductions: number;
  bonuses: number;
  tax: number;
  socialSecurity: number;
  filePath?: string;
}

export interface DocumentRequest {
  id?: number;
  employeeId: number;
  documentType: string;
  requestDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED';
  deliveryDate?: string;
  filePath?: string;
}

export interface ExpenseClaim {
  id?: number;
  employeeId: number;
  category: string;
  amount: number;
  expenseDate: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  receiptPath?: string;
  submissionDate?: string;
}

export interface EmployeeOption {
  id: number;
  fullName: string;
  employeeNumber: string;
}

// API Calls
export const selfServiceApi = {
  // Profile
  getMyProfile: async (employeeId: number): Promise<EmployeeProfile> => {
    const response = await axios.get(`${API_BASE_URL}/profile?employeeId=${employeeId}`);
    return response.data;
  },

  updateMyProfile: async (employeeId: number, data: Partial<EmployeeProfile>): Promise<EmployeeProfile> => {
    const response = await axios.put(`${API_BASE_URL}/profile?employeeId=${employeeId}`, data);
    return response.data;
  },

  // Leave Balance
  getLeaveBalance: async (employeeId: number, year?: number): Promise<LeaveBalance> => {
    const url = year 
      ? `${API_BASE_URL}/leave/balance?employeeId=${employeeId}&year=${year}`
      : `${API_BASE_URL}/leave/balance?employeeId=${employeeId}`;
    const response = await axios.get(url);
    return response.data;
  },

  // Leave Requests
  getLeaveRequests: async (employeeId: number, year?: number, status?: string): Promise<LeaveRequest[]> => {
    let url = `${API_BASE_URL}/leave/requests?employeeId=${employeeId}`;
    if (year) url += `&year=${year}`;
    if (status) url += `&status=${status}`;
    const response = await axios.get(url);
    return response.data;
  },

  createLeaveRequest: async (employeeId: number, request: LeaveRequest): Promise<LeaveRequest> => {
    const response = await axios.post(`${API_BASE_URL}/leave/requests?employeeId=${employeeId}`, request);
    return response.data;
  },

  cancelLeaveRequest: async (employeeId: number, requestId: number): Promise<LeaveRequest> => {
    const response = await axios.put(`${API_BASE_URL}/leave/requests/${requestId}/cancel?employeeId=${employeeId}`);
    return response.data;
  },

  // Payslips
  getPayslips: async (employeeId: number, year?: number): Promise<Payslip[]> => {
    const url = year 
      ? `${API_BASE_URL}/payslips?employeeId=${employeeId}&year=${year}`
      : `${API_BASE_URL}/payslips?employeeId=${employeeId}`;
    const response = await axios.get(url);
    return response.data;
  },

  getPayslip: async (employeeId: number, payslipId: number): Promise<Payslip> => {
    const response = await axios.get(`${API_BASE_URL}/payslips/${payslipId}?employeeId=${employeeId}`);
    return response.data;
  },

  // Document Requests
  getDocumentRequests: async (employeeId: number): Promise<DocumentRequest[]> => {
    const response = await axios.get(`${API_BASE_URL}/doc-requests?employeeId=${employeeId}`);
    return response.data;
  },

  createDocumentRequest: async (employeeId: number, request: DocumentRequest): Promise<DocumentRequest> => {
    const response = await axios.post(`${API_BASE_URL}/doc-requests?employeeId=${employeeId}`, request);
    return response.data;
  },

  // Expense Claims
  getExpenseClaims: async (employeeId: number): Promise<ExpenseClaim[]> => {
    const response = await axios.get(`${API_BASE_URL}/expense-claims?employeeId=${employeeId}`);
    return response.data;
  },

  createExpenseClaim: async (employeeId: number, claim: ExpenseClaim): Promise<ExpenseClaim> => {
    const response = await axios.post(`${API_BASE_URL}/expense-claims?employeeId=${employeeId}`, claim);
    return response.data;
  },

  cancelExpenseClaim: async (employeeId: number, claimId: number): Promise<ExpenseClaim> => {
    const response = await axios.put(`${API_BASE_URL}/expense-claims/${claimId}/cancel?employeeId=${employeeId}`);
    return response.data;
  },

  // Employee List
  listEmployees: async (search?: string, page?: number, size?: number): Promise<EmployeeOption[]> => {
    let url = `${API_BASE_URL}/employees?`;
    if (search) url += `q=${encodeURIComponent(search)}&`;
    if (page !== undefined) url += `page=${page}&`;
    if (size !== undefined) url += `size=${size}&`;
    const response = await axios.get(url);
    return response.data;
  }
};
