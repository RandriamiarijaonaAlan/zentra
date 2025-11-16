import { get, put } from './api';
import type { LeaveRequest } from '../types/selfService.ts';

export async function listLeaveRequests(status?: string): Promise<LeaveRequest[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return await get(`/admin/leave/requests${qs}`);
}

export async function approveLeaveRequest(id: number, approverId: number): Promise<LeaveRequest> {
  return await put(`/admin/leave/requests/${id}/approve?approverId=${approverId}`);
}

export async function rejectLeaveRequest(id: number, approverId: number, reason?: string): Promise<LeaveRequest> {
  const qs = `approverId=${approverId}` + (reason ? `&reason=${encodeURIComponent(reason)}` : '');
  return await put(`/admin/leave/requests/${id}/reject?${qs}`);
}
