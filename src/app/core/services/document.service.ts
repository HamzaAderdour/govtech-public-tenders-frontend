import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, delay } from 'rxjs';
import { Document, DocumentType, UploadDocumentDto } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private documentsSubject = new BehaviorSubject<Document[]>([]);
  public documents$ = this.documentsSubject.asObservable();
  private initialized = false;

  private storageKey = 'documents_data';

  constructor(private authService: AuthService) {
    this.loadDocuments();
  }

  private loadDocuments(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const documents = JSON.parse(stored);
        documents.forEach((d: any) => {
          d.uploadedAt = new Date(d.uploadedAt);
        });
        this.documentsSubject.next(documents);
        this.initialized = true;
      } catch (e) {
        console.error('Error parsing documents:', e);
        this.initializeMockData();
      }
    } else {
      this.initializeMockData();
    }
  }

  private saveDocuments(documents: Document[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(documents));
    this.documentsSubject.next(documents);
    this.initialized = true;
  }

  private initializeMockData(): void {
    const mockDocuments: Document[] = [
      {
        id: 'doc1',
        name: 'Cahier_des_charges_A25.pdf',
        type: DocumentType.TENDER_SPECIFICATION,
        size: 2458000,
        mimeType: 'application/pdf',
        uploadedBy: '2',
        uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        url: 'mock://documents/doc1'
      },
      {
        id: 'doc2',
        name: 'Reglement_consultation.pdf',
        type: DocumentType.TENDER_TERMS,
        size: 1234000,
        mimeType: 'application/pdf',
        uploadedBy: '2',
        uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        url: 'mock://documents/doc2'
      },
      {
        id: 'doc3',
        name: 'Specifications_techniques_IT.pdf',
        type: DocumentType.TENDER_SPECIFICATION,
        size: 987000,
        mimeType: 'application/pdf',
        uploadedBy: '2',
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        url: 'mock://documents/doc3'
      }
    ];

    this.saveDocuments(mockDocuments);
  }

  // Get all documents
  getAllDocuments(): Observable<Document[]> {
    if (!this.initialized) {
      return this.documents$.pipe(delay(50));
    }
    return of(this.documentsSubject.value);
  }

  // Get document by ID
  getDocumentById(id: string): Observable<Document> {
    const document = this.documentsSubject.value.find(d => d.id === id);
    if (!document) {
      return throwError(() => new Error('Document non trouvé'));
    }
    return of(document).pipe(delay(100));
  }

  // Get documents by IDs
  getDocumentsByIds(ids: string[]): Observable<Document[]> {
    const documents = this.documentsSubject.value.filter(d => ids.includes(d.id));
    return of(documents).pipe(delay(100));
  }

  // Upload document (mock)
  uploadDocument(dto: UploadDocumentDto, relatedEntityId?: string): Observable<Document> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    // Simulate file upload delay
    return new Observable(observer => {
      setTimeout(() => {
        const documents = this.documentsSubject.value;
        const newDocument: Document = {
          id: `doc_${Date.now()}`,
          name: dto.file.name,
          type: dto.type,
          size: dto.file.size,
          mimeType: dto.file.type,
          uploadedBy: user.id,
          uploadedAt: new Date(),
          url: `mock://documents/doc_${Date.now()}`
        };

        this.saveDocuments([...documents, newDocument]);
        observer.next(newDocument);
        observer.complete();
      }, 1000); // Simulate upload time
    });
  }

  // Delete document
  deleteDocument(id: string): Observable<void> {
    const documents = this.documentsSubject.value.filter(d => d.id !== id);
    this.saveDocuments(documents);
    return of(void 0).pipe(delay(300));
  }

  // Download document (mock)
  downloadDocument(id: string): Observable<Blob> {
    return new Observable(observer => {
      setTimeout(() => {
        // Create a mock blob
        const mockContent = `Mock document content for ID: ${id}`;
        const blob = new Blob([mockContent], { type: 'application/pdf' });
        observer.next(blob);
        observer.complete();
      }, 500);
    });
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Get file icon based on type
  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
    if (mimeType.includes('image')) return '🖼️';
    return '📎';
  }
}
