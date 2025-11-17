export interface JobHistoryDto {
  id?: number;
  employeeId: number;
  jobId?: number;
  departmentId?: number;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

