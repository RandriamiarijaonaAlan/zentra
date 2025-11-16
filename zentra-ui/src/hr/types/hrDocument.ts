export interface HRDocumentDto {
  id?: number;
  employeeId: number;
  docType?: string;
  filePath?: string;
  uploadedAt?: string;
  expiryDate?: string;
  visibleToEmployee?: boolean;
}

