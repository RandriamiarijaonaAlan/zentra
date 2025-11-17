export interface ContractDto {
  id?: number;
  employeeId: number;
  contractNumber?: string;
  startDate?: string;
  endDate?: string;
  grossSalary?: number;
  annualBonus?: number;
  benefits?: string;
  weeklyHours?: number;
  annualLeaveDays?: number;
  signatureDate?: string;
  contractFile?: string;
  contractType?: string;
  durationMonths?: number;
  trialPeriodMonths?: number;
  renewable?: boolean;
}

