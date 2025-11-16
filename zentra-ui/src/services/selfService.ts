import axios from 'axios';
import type {
  EmployeeProfile,
  EmployeeProfileUpdate,
  LeaveBalance,
  LeaveRequest,
  Payslip,
  DocumentRequest,
  ExpenseClaim,
  HrMessage,
} from '../types/selfService.ts';

const API_BASE = '/api/self';

const EMPLOYEE_ID_KEY = 'currentEmployeeId';
export const setCurrentEmployeeId = (id: number) => {
  if (!Number.isFinite(id)) return;
  localStorage.setItem(EMPLOYEE_ID_KEY, String(id));
};

export const getCurrentEmployeeId = (): number | null => {
  const v = typeof window !== 'undefined' ? localStorage.getItem(EMPLOYEE_ID_KEY) : null;
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function requireEmployeeId(): number {
  const id = getCurrentEmployeeId();
  if (!id) throw new Error('NO_EMPLOYEE_SELECTED');
  return id;
}

// Profile
export const getMyProfile = async (): Promise<EmployeeProfile> => {
  const response = await axios.get(`${API_BASE}/profile`, {
    params: { employeeId: requireEmployeeId() },
  });
  return response.data;
};

export const updateMyProfile = async (data: EmployeeProfileUpdate): Promise<EmployeeProfile> => {
  const response = await axios.put(`${API_BASE}/profile`, data, {
    params: { employeeId: requireEmployeeId() },
  });
  return response.data;
};

// Leave
export const getLeaveBalance = async (year?: number): Promise<LeaveBalance> => {
  const response = await axios.get(`${API_BASE}/leave/balance`, {
    params: { employeeId: requireEmployeeId(), year },
  });
  return response.data;
};

export const getLeaveRequests = async (year?: number, status?: string): Promise<LeaveRequest[]> => {
  const response = await axios.get(`${API_BASE}/leave/requests`, {
    params: { employeeId: requireEmployeeId(), year, status },
  });
  return response.data;
};

export const createLeaveRequest = async (data: LeaveRequest): Promise<LeaveRequest> => {
  const response = await axios.post(`${API_BASE}/leave/requests`, data, {
    params: { employeeId: requireEmployeeId() },
  });
  return response.data;
};

export const cancelLeaveRequest = async (requestId: number): Promise<LeaveRequest> => {
  const response = await axios.put(`${API_BASE}/leave/requests/${requestId}/cancel`, null, {
    params: { employeeId: requireEmployeeId() },
  });
  return response.data;
};

// Payslips
export const getPayslips = async (year?: number): Promise<Payslip[]> => {
  const response = await axios.get(`${API_BASE}/payslips`, {
    params: { employeeId: requireEmployeeId(), year },
  });
  return response.data;
};

export const getPayslip = async (payslipId: number): Promise<Payslip> => {
  const response = await axios.get(`${API_BASE}/payslips/${payslipId}`, {
    params: { employeeId: requireEmployeeId() },
  });
  return response.data;
};

// Document Requests
export const getDocumentRequests = async (): Promise<DocumentRequest[]> => {
  const response = await axios.get(`${API_BASE}/doc-requests`, {
    params: { employeeId: requireEmployeeId() },
  });
  return response.data;
};

export const createDocumentRequest = async (data: DocumentRequest): Promise<DocumentRequest> => {
  const response = await axios.post(`${API_BASE}/doc-requests`, data, {
    params: { employeeId: requireEmployeeId() },
  });
  return response.data;
};

// Expense Claims
export const getExpenseClaims = async (): Promise<ExpenseClaim[]> => {
  const response = await axios.get(`${API_BASE}/expense-claims`, {
    params: { employeeId: requireEmployeeId() },
  });
  return response.data;
};

export const createExpenseClaim = async (data: ExpenseClaim): Promise<ExpenseClaim> => {
  const response = await axios.post(`${API_BASE}/expense-claims`, data, {
    params: { employeeId: requireEmployeeId() },
  });
  return response.data;
};

export const cancelExpenseClaim = async (claimId: number): Promise<ExpenseClaim> => {
  const response = await axios.put(`${API_BASE}/expense-claims/${claimId}/cancel`, null, {
    params: { employeeId: requireEmployeeId() },
  });
  return response.data;
};

// HR Messages
export const getMessageThreads = async (): Promise<string[]> => {
  const response = await axios.get(`${API_BASE}/messages/threads`, {
    params: { employeeId: requireEmployeeId() },
  });
  return response.data;
};

export const getThreadMessages = async (threadId: string): Promise<HrMessage[]> => {
  const response = await axios.get(`${API_BASE}/messages/threads/${threadId}`, {
    params: { employeeId: requireEmployeeId() },
  });
  return response.data;
};

export const sendMessage = async (data: HrMessage): Promise<HrMessage> => {
  const response = await axios.post(`${API_BASE}/messages`, data, {
    params: { employeeId: requireEmployeeId() },
  });
  return response.data;
};
