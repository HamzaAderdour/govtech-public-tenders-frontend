export enum DocumentType {
  TENDER_SPECIFICATION = 'TENDER_SPECIFICATION',
  TENDER_TERMS = 'TENDER_TERMS',
  TECHNICAL_PROPOSAL = 'TECHNICAL_PROPOSAL',
  FINANCIAL_PROPOSAL = 'FINANCIAL_PROPOSAL',
  OTHER = 'OTHER'
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  url?: string;
}

export interface UploadDocumentDto {
  file: File;
  type: DocumentType;
}
