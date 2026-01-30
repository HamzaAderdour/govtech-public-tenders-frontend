export enum TenderStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  AWARDED = 'AWARDED'
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  weight: number; // percentage
  description?: string;
}

export interface Tender {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  status: TenderStatus;
  ownerId: string;
  ownerName: string;
  publishDate?: Date;
  deadline: Date;
  criteria: EvaluationCriteria[];
  documentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenderDto {
  title: string;
  description: string;
  budget: number;
  currency: string;
  deadline: Date;
  criteria: Omit<EvaluationCriteria, 'id'>[];
}
