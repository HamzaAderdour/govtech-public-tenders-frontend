export enum SubmissionStatus {
  SUBMITTED = 'SUBMITTED',
  IN_EVALUATION = 'IN_EVALUATION',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WINNER = 'WINNER',
  NOT_SELECTED = 'NOT_SELECTED'
}

export interface SubmissionScore {
  criteriaId: string;
  criteriaName: string;
  score: number; // 0-100
  weight: number;
  weightedScore: number;
}

export interface Submission {
  id: string;
  tenderId: string;
  tenderTitle: string;
  supplierId: string;
  supplierName: string;
  status: SubmissionStatus;
  proposedPrice: number;
  technicalDocumentIds: string[];
  financialDocumentIds: string[];
  scores?: SubmissionScore[];
  totalScore?: number;
  submittedAt: Date;
  evaluatedAt?: Date;
}

export interface CreateSubmissionDto {
  tenderId: string;
  proposedPrice: number;
  technicalDocumentIds: string[];
  financialDocumentIds: string[];
}
