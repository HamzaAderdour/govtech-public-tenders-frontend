import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, delay, map } from 'rxjs';
import { Tender, TenderStatus, CreateTenderDto } from '../models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class TenderService {
  private apiUrl = environment.tenderApi;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  // Get all tenders
  getAllTenders(): Observable<Tender[]> {
    return this.http.get<Tender[]>(this.apiUrl).pipe(
      map(tenders => tenders.map(t => this.mapTender(t)))
    );
  }

  // Get tenders by owner
  getTendersByOwner(ownerId: string): Observable<Tender[]> {
    return this.http.get<Tender[]>(`${this.apiUrl}/owner/${ownerId}`).pipe(
      map(tenders => tenders.map(t => this.mapTender(t)))
    );
  }

  // Get open tenders (for suppliers)
  getOpenTenders(): Observable<Tender[]> {
    return this.getAllTenders().pipe(
      map(tenders => tenders.filter(t => t.status === TenderStatus.PUBLISHED))
    );
  }

  // Get tender by ID
  getTenderById(id: string): Observable<Tender> {
    return this.http.get<Tender>(`${this.apiUrl}/${id}`).pipe(
      map(tender => this.mapTender(tender))
    );
  }

  private mapTender(tender: any): Tender {
    try {
      // Safely parse deadline
      let deadline: Date;
      if (tender.deadline) {
        if (typeof tender.deadline === 'string') {
          deadline = new Date(tender.deadline);
        } else if (tender.deadline instanceof Date) {
          deadline = tender.deadline;
        } else if (Array.isArray(tender.deadline)) {
          // Handle LocalDate array format [year, month, day]
          const [year, month, day] = tender.deadline;
          deadline = new Date(year, month - 1, day);
        } else {
          deadline = new Date();
        }
      } else {
        deadline = new Date();
      }

      // Safely parse publication date
      let publishDate: Date | undefined;
      if (tender.publicationDate) {
        if (typeof tender.publicationDate === 'string') {
          publishDate = new Date(tender.publicationDate);
        } else if (Array.isArray(tender.publicationDate)) {
          const [year, month, day] = tender.publicationDate;
          publishDate = new Date(year, month - 1, day);
        }
      }

      return {
        ...tender,
        deadline: deadline,
        publishDate: publishDate,
        ownerUserId: tender.ownerUserId || tender.ownerId,
        criteria: (tender.criteria || []).map((c: any) => ({
          ...c,
          name: c.type || c.name // Map backend 'type' to frontend 'name'
        }))
      };
    } catch (error) {
      console.error('Error mapping tender:', error, tender);
      // Return tender with minimal mapping if error occurs
      return {
        ...tender,
        deadline: new Date(),
        ownerUserId: tender.ownerUserId || tender.ownerId,
        criteria: tender.criteria || []
      };
    }
  }

  // Create tender
  createTender(dto: CreateTenderDto, files: File[] = []): Observable<Tender> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    const formData = new FormData();

    // Map criteria to backend EXPECTED format (EvaluationCriterionRequestDTO)
    // ONLY type and weight are allowed!
    const criteria = (dto.criteria || []).map(c => ({
      type: c.name,
      weight: c.weight
    }));

    // Construct the backend-expected DTO strictly
    const tenderRequest = {
      title: dto.title,
      description: dto.description,
      organizationId: 2, // Default org ID for bridge bridge project
      ownerUserId: user.id || '1',
      deadline: (dto.deadline instanceof Date ? dto.deadline : new Date(dto.deadline)).toISOString().split('T')[0],
      criteria: criteria
    };

    formData.append('data', JSON.stringify(tenderRequest));

    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    return this.http.post<Tender>(this.apiUrl, formData);
  }

  // Update tender
  updateTender(id: string, updates: Partial<Tender>): Observable<Tender> {
    return this.http.put<Tender>(`${this.apiUrl}/${id}`, updates);
  }

  // Publish tender
  publishTender(id: string): Observable<Tender> {
    return this.http.patch<Tender>(`${this.apiUrl}/${id}/publish`, {});
  }

  // Close tender
  closeTender(id: string): Observable<Tender> {
    return this.http.patch<Tender>(`${this.apiUrl}/${id}/close`, {});
  }

  // Award tender - Placeholder as backend might not have specific endpoint yet
  awardTender(id: string): Observable<Tender> {
    return of({} as Tender);
  }

  // Delete tender
  deleteTender(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get statistics
  getStatistics(): Observable<{
    total: number;
    draft: number;
    open: number;
    closed: number;
    awarded: number;
  }> {
    return this.getAllTenders().pipe(
      map(tenders => ({
        total: tenders.length,
        draft: tenders.filter(t => t.status === TenderStatus.DRAFT).length,
        open: tenders.filter(t => t.status === TenderStatus.PUBLISHED).length,
        closed: tenders.filter(t => t.status === TenderStatus.CLOSED).length,
        awarded: tenders.filter(t => t.status === TenderStatus.AWARDED).length
      }))
    );
  }
}
