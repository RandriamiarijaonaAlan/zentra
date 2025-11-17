export interface CandidateMinInfoDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  applicationId: number;
}

export interface ChoiceDto {
  id: number;
  libelle: string;
  correct?: boolean;
  questionId: number;
}

export interface QuestionDto {
  id: number;
  libelle: string;
  required: boolean;
  score: number;
  qcmId: number;
  choices: ChoiceDto[];
}

export interface QcmDto {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  totalScore: number;
  requiredScore: number;
  questions: QuestionDto[];
}

export interface AnswerDto {
  choiceId: number;
}

export interface AttemptDto {
  answers: AnswerDto[];
}

// Types pour les formulaires de création/édition
export interface ChoiceFormDto {
  id?: number;
  libelle: string;
  correct: boolean;
}

export interface QuestionFormDto {
  id?: number;
  libelle: string;
  required: boolean;
  score: number;
  choices: ChoiceFormDto[];
}

export interface QcmFormDto {
  id?: number;
  title: string;
  description: string;
  durationMinutes: number;
  requiredScore: number;
  questions: QuestionFormDto[];
}

// Type pour la liste des QCMs
export interface QcmListItemDto {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  totalScore: number;
  requiredScore: number;
  questionsCount: number;
}

// ========================================
// Types pour Interview
// ========================================

export interface InterviewDto {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  interviewerId: number;
  interviewerName: string;
  interviewDate: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:mm:ss
  durationMinutes: number;
  interviewType: 'PRESENTIEL' | 'VISIO' | 'TELEPHONIQUE';
  location: string;
  status: 'PLANIFIE' | 'REALISE' | 'ANNULE';
  score?: number;
  comment?: string;
  applicationId?: number;
}

export interface InterviewFormDto {
  id?: number;
  candidateId: number;
  interviewerId: number;
  interviewDate: string;
  startTime: string;
  durationMinutes: number;
  interviewType: 'PRESENTIEL' | 'VISIO' | 'TELEPHONIQUE';
  location: string;
  status?: 'PLANIFIE' | 'REALISE' | 'ANNULE';
  score?: number;
  comment?: string;
  applicationId?: number;
}

export interface InterviewListItemDto {
  id: number;
  candidateName: string;
  candidateEmail: string;
  interviewerName: string;
  interviewDate: string;
  startTime: string;
  durationMinutes: number;
  interviewType: 'PRESENTIEL' | 'VISIO' | 'TELEPHONIQUE';
  status: 'PLANIFIE' | 'REALISE' | 'ANNULE';
  score?: number;
}

export interface CandidateDto {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  birthDate?: string;
  address?: string;
  city?: string;
  country?: string;
  educationLevel?: string;
  lastDegree?: string;
  yearsExperience?: number;
  skills?: string;
  cvFile?: string;
  motivationalLetterFile?: string;
}


export interface EmployeeDto {
  id: number;
  firstName: string;
  lastName: string;
  workEmail: string;
}

export interface PublicationDto {
  id: number;
  title: string;
  description: string;
  publishedDate: string;
  closingDate?: string;
  numberOfPositions: number;
  status: string;
  jobId: number;
}

export interface PublicationFormDto {
  id?: number;
  title: string;
  description: string;
  publishedDate?: string;
  closingDate?: string;
  numberOfPositions: number;
  status: string;
  jobId: number;
}

// ========================================
// Types pour Application (Candidature)
// ========================================

export interface ApplicationDto {
  id: number;
  candidateId: number;
  publicationId: number;
  appliedAt: string;
  status: string;
  candidate?: CandidateDto;
}


export interface ApplicationListItemDto {
  id: number;
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  publicationTitle: string;
  appliedAt: string;
  status: string;
}

export interface ScoreDto {
  finalScore?: number;
  documentScore?: number;
  qcmScore?: number;
  interviewScore?: number;
}

export interface ApplicationFormDto {
  id?: number;
  candidateId: number;
  publicationId: number;
  appliedAt?: string;
  status?: string;
}

// ========================================
// Types pour Leave Management
// ========================================

export interface LeaveTypeDto {
  id: number;
  name: string;
  description: string;
  isPaid: boolean;
  maxDaysPerYear?: number;
  requiresApproval: boolean;
  advanceNoticeDays?: number;
  isActive: boolean;
  color?: string;
}

export interface LeaveRequestDto {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  leaveTypeColor?: string;
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  daysRequested: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedById?: number;
  approvedByName?: string;
  approvedDate?: string;
  approvalComment?: string;
  isHalfDayStart: boolean;
  isHalfDayEnd: boolean;
  emergencyContact?: string;
}

export interface LeaveRequestFormDto {
  id?: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason?: string;
  isHalfDayStart: boolean;
  isHalfDayEnd: boolean;
  emergencyContact?: string;
}

export interface LeaveBalanceDto {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  year: number;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  carriedOverDays: number;
  remainingDays: number;
  expiresOn?: string;
}

export interface LeaveApprovalDto {
  id: number;
  status: 'APPROVED' | 'REJECTED';
  approvalComment?: string;
}

export interface EmployeeLeaveOverviewDto {
  employeeId: number;
  employeeName: string;
  currentYear: number;
  leaveBalances: LeaveBalanceDto[];
  recentRequests: LeaveRequestDto[];
  upcomingLeaves: LeaveRequestDto[];
}

export interface LeaveNotificationDto {
  id: number;
  leaveRequestId: number;
  leaveRequestEmployee: string;
  leaveTypeName: string;
  recipientId: number;
  recipientName: string;
  notificationType: 'REQUEST_SUBMITTED' | 'REQUEST_APPROVED' | 'REQUEST_REJECTED' | 'REQUEST_CANCELLED' | 'BALANCE_LOW' | 'EXPIRING_LEAVE' | 'OVERLAPPING_LEAVE';
  message: string;
  isRead: boolean;
  readAt?: string;
  sentAt: string;
}
// ========================================
// Types pour Contributions (CNAPS, OSTIE, IRSA)
// ========================================

export interface IrsaRateDto {
  id: number;
  minIncome?: number | null;
  maxIncome?: number | null;
  rate?: number | null;
  amount?: number | null;
}

export interface CnapsRateDto {
  id: number;
  ceilingBaseAmount?: number | null;
  ceilingRate?: number | null;
  rate?: number | null;
  ceilingAmount?: number | null;
}

export interface OstieRateDto {
  id: number;
  rate?: number | null;
}


// ========================================
// Types pour Skill Management
// ========================================

export interface SkillDto {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

export interface EmployeeSkillDto {
  id: number;
  employeeId: number;
  skillId: number;
  skillName: string;
  category?: string;
  level: number;
  targetLevel?: number;
  evaluationMethod?: string;
  lastEvaluationDate?: string;
  yearsExperience?: number;
}

export interface EmployeeSkillHistoryDto {
  id: number;
  employeeSkillId: number;
  previousLevel?: number;
  newLevel: number;
  evaluationMethod?: string;
  evaluationDate: string;
}

export interface TrainingDto {
  id: number;
  title: string;
  description?: string;
  maxLevelReached: number;
  targetSkillIds: number[];
}

export interface SkillLevelDto {
  id: number;
  label: string;
  value: number;
}
