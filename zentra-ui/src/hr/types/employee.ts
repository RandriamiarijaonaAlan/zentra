export interface EmployeeDto {
  id?: number;
  employeeNumber?: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  workPhone?: string;
  birthDate?: string; // ISO
  gender?: string;
  address?: string;
  city?: string;
  country?: string;
  hireDate?: string;
  contractEndDate?: string;
  jobId?: number | string;
  contractId?: number;
  photoUrl?: string;
  jobTitle?: string; // Pour l'affichage du poste
}

