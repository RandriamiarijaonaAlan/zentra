import { get, post, put, del } from './api.ts';
import type { EmployeeDto } from '../types/employee';
import type { ContractDto } from '../types/contract';
import type { JobHistoryDto } from '../types/jobHistory';
import type { HRDocumentDto } from '../types/hrDocument';
import type { StaffingNeed } from '../types/StaffingNeed';

// Reference Data
export const listDepartments = () => get<{ id: number; name: string }[]>('/departments');
export const listJobTitles = () => get<{ id: number; title: string; departmentId: number }[]>('/jobs');
export const listManagers = () => get<{ id: number; firstName: string; lastName: string }[]>('/employees/managers');
export const listServices = () => get<{ id: number; name: string }[]>('/services');
export const listPositions = () => get<{ id: number; name: string }[]>('/positions');

// Employees
export const listEmployees = () => get<EmployeeDto[]>('/employees');
export const getEmployee = (id: number) => get<EmployeeDto>(`/employees/${id}`);
export const createEmployee = (e: EmployeeDto) => post<EmployeeDto>('/employees', e);
export const updateEmployee = (e: EmployeeDto) => put<EmployeeDto>('/employees', e);
export const deleteEmployee = (id: number) => del<void>(`/employees/${id}`);

// Photo upload (utilise fetch direct avec baseURL de api.ts pour rester cohérent)
export const uploadEmployeePhoto = async (employeeId: number, file: File) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  const formData = new FormData();
  formData.append('employeeId', String(employeeId));
  formData.append('photo', file);

  const response = await fetch(`${apiUrl}/employees/upload-photo`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Erreur lors de l\'upload de la photo');
  }

  return (await response.json()) as { photoUrl: string };
};

// Contracts
export const listContractsByEmployee = (employeeId: number) => get<ContractDto[]>(`/contracts/employee/${employeeId}`);
export const createContract = (c: ContractDto) => post<ContractDto>('/contracts', c);
export const updateContract = (c: ContractDto) => put<ContractDto>('/contracts', c);
export const deleteContract = (id: number) => del<void>(`/contracts/${id}`);

// Job Histories
export const listJobHistoryByEmployee = (employeeId: number) => get<JobHistoryDto[]>(`/job-histories/employee/${employeeId}`);
export const createJobHistory = (j: JobHistoryDto) => post<JobHistoryDto>('/job-histories', j);
export const updateJobHistory = (j: JobHistoryDto) => put<JobHistoryDto>('/job-histories', j);
export const deleteJobHistory = (id: number) => del<void>(`/job-histories/${id}`);

// HR Documents
export const uploadHRDocument = (d: HRDocumentDto) => post<HRDocumentDto>('/hr-documents', d);
export const listHRDocuments = (employeeId: number) => get<HRDocumentDto[]>(`/hr-documents/employee/${employeeId}`);
export const deleteHRDocument = (id: number) => del<void>(`/hr-documents/${id}`);
export const uploadHRDocumentFile = async (employeeId: number, docType: string, file: File) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  const form = new FormData();
  form.append('employeeId', String(employeeId));
  form.append('docType', docType);
  form.append('file', file);

  const res = await fetch(`${apiUrl}/hr-documents/upload`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error('Erreur lors de l\'upload du document');
  }

  return (await res.json()) as HRDocumentDto;
};

export const buildFileDownloadUrl = (path: string) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  return `${apiUrl}/files/download?path=${encodeURIComponent(path)}`;
};

// Staffing Needs
export const listStaffingNeeds = () => get<StaffingNeed[]>('/staffing-needs');
export const getStaffingNeed = (id: number) => get<StaffingNeed>(`/staffing-needs/${id}`);
export const createStaffingNeed = (need: StaffingNeed) => post<StaffingNeed>('/staffing-needs', need);
export const updateStaffingNeed = (need: StaffingNeed) => put<StaffingNeed>(`/staffing-needs/${need.id}`, need);
export const deleteStaffingNeed = (id: number) => del<void>(`/staffing-needs/${id}`);
