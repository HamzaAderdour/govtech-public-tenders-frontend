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
  supplierId: string;
  status: SubmissionStatus;
  price: number;
  technical: number;
  deadline: number;
  documentId?: string; // ID of the uploaded document
  score?: number; // Overall score from AI evaluation
  scores?: SubmissionScore[]; // Detailed scores per criterion
  ragAnalysis?: string; // AI analysis text
}

export interface CreateSubmissionDto {
  tenderId: string;
  price: number;
  technical: number;
  deadline: number;
}
