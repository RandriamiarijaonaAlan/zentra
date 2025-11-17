export interface SalaryComponentDto {
  designation: string;
  number?: string;
  rate?: number;
  amount: number;
}

export interface SalaryDeductionDto {
  designation: string;
  rate?: number;
  amount: number;
}

export interface PayStubDto {
  id?: number;
  employeeId: number;
  date: string; // LocalDate -> string ISO

  // Informations employé
  employeeName?: string;
  employeeNumber?: string;
  jobTitle?: string;
  cnapsNumber?: number;
  hireDate?: string; // LocalDate -> string ISO
  seniority?: string;

  // Classification et salaire
  classification?: string;
  baseSalary: number;
  dayRate?: number;
  hourRate?: number;
  salaryIndex?: number;

  // Composants de salaire (primes, indemnités, etc.)
  salaryComponents: SalaryComponentDto[];
  grossSalary: number;

  // Déductions
  salaryDeductions: SalaryDeductionDto[];
  sumDeductions: number;

  // Net à payer
  netSalary: number;

  // Impôts
  irsaDeduction?: number;
  taxableIncome?: number;

  // Informations complémentaires
  payingMethod?: string;
  filepath?: string;
}

export interface BonusDto {
  id?: number;
  employeeId: number;
  amount: number;
  description: string;
  date: string; // ISO format
}

export interface SalaryAdvanceDto {
  id?: number;
  employeeId: number;
  amount: number;
  reason: string;
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalDate?: string;
}

export interface EmployeePayInfoDto {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  photoUrl?: string;
  hasPayStub: boolean;
}

