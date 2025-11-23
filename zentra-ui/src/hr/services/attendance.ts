import { get, post } from './api.ts';

export interface TimeEntryDto {
  id: number;
  employeeId: number;
  employeeName: string;
  entryDate: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  overtimeHours?: number;
  lateMinutes?: number;
  breakMinutes?: number;
  entryType?: string;
  note?: string;
}

export interface AttendanceReportDto {
  employeeId?: number;
  employeeName?: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  totalOvertime: number;
  totalLateMinutes: number;
  totalBreakMinutes: number;
  entries: TimeEntryDto[];
}

export async function checkIn(employeeId: number, type: string = 'MANUAL'): Promise<TimeEntryDto> {
  return post('/attendance/check-in?employeeId=' + employeeId + '&type=' + type);
}

export async function checkOut(employeeId: number): Promise<TimeEntryDto> {
  return post('/attendance/check-out?employeeId=' + employeeId);
}

export async function getDailyEntries(employeeId: number, date: string): Promise<TimeEntryDto[]> {
  return get(`/attendance/daily?employeeId=${employeeId}&date=${date}`);
}

export async function getReport(employeeId: number | undefined, start: string, end: string): Promise<AttendanceReportDto> {
  const empParam = employeeId ? `employeeId=${employeeId}&` : '';
  return get(`/attendance/report?${empParam}start=${start}&end=${end}`);
}
