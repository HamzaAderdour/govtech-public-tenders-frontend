export enum TenderStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
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
  status: TenderStatus;
  ownerUserId: string;
  organizationId: number;
  publishDate?: Date;
  deadline: Date;
  criteria: EvaluationCriteria[];
  documentIds: string[];
}

export interface CreateTenderDto {
  title: string;
  description: string;
  deadline: Date;
  criteria: Omit<EvaluationCriteria, 'id'>[];
  organizationId: number;
  ownerUserId: string;
}
