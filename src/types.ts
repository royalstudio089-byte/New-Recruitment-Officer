export type VisaStatus = 'Student' | 'Full timer' | 'E-Visa';
export type CarOption = 'Yes' | 'No';

export type RecruitmentStage = 
  | 'New Applicant'
  | 'Interview Scheduled'
  | 'Interviewed'
  | 'Selected'
  | 'Rejected'
  | 'On Hold'
  | 'Active'
  | 'Inactive';

export interface SecurityOfficer {
  id: string;
  srNo: number;
  name: string;
  city: string;
  phoneNumber: string;
  status: string; // 'Student' | 'Full timer' | 'E-Visa' or recruitment stages
  car: CarOption;
  stage?: RecruitmentStage;
  notes?: string;
  addedAt?: string;
}

export interface RecruitmentMetrics {
  totalOfficers: number;
  students: number;
  fullTimer: number;
  eVisa: number;
  officersWithCar: number;
  withoutCar: number;
  statusCounts: Record<string, number>;
}
