import { Injectable } from '@angular/core';
import { Observable, of, throwError, map } from 'rxjs';
import { Submission, SubmissionStatus, CreateSubmissionDto } from '../models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private apiUrl = environment.submissionApi;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Get all submissions
  getAllSubmissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(this.apiUrl).pipe(
      map(submissions => submissions.map(s => this.mapSubmission(s)))
    );
  }

  // Get submissions by tender
  getSubmissionsByTender(tenderId: string): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.apiUrl}/tender/${tenderId}`).pipe(
      map(submissions => submissions.map(s => this.mapSubmission(s)))
    );
  }

  // Get submissions by supplier
  getSubmissionsBySupplier(supplierId: string): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.apiUrl}/supplier/${supplierId}`).pipe(
      map(submissions => submissions.map(s => this.mapSubmission(s)))
    );
  }

  // Get submission by ID
  getSubmissionById(id: string): Observable<Submission> {
    return this.http.get<Submission>(`${this.apiUrl}/${id}`).pipe(
      map(submission => this.mapSubmission(submission))
    );
  }

  // Map backend submission to frontend model
  private mapSubmission(submission: any): Submission {
    return {
      ...submission,
      // Ensure all fields are properly mapped
      documentId: submission.documentId,
      score: submission.score,
      scores: submission.scores || [],
      ragAnalysis: submission.ragAnalysis
    };
  }

  // Create submission
  createSubmission(dto: CreateSubmissionDto, files: File[] = []): Observable<Submission> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    const formData = new FormData();

    // Explicit mapping to individual parts as backend uses @ModelAttribute
    formData.append('tenderId', dto.tenderId);
    formData.append('supplierId', user.id || '2');
    formData.append('price', String(dto.price || 0));
    formData.append('technical', String(dto.technical || 0));
    formData.append('deadline', String(dto.deadline || 0));

    if (files && files.length > 0) {
      formData.append('document', files[0]); // Backend expects 'document' MultipartFile
    }

    return this.http.post<Submission>(this.apiUrl, formData).pipe(
      map(submission => this.mapSubmission(submission))
    );
  }

  // Accept submission
  acceptSubmission(id: string): Observable<Submission> {
    return this.http.patch<Submission>(`${this.apiUrl}/${id}/status`, { status: SubmissionStatus.ACCEPTED }).pipe(
      map(submission => this.mapSubmission(submission))
    );
  }

  // Reject submission
  rejectSubmission(id: string): Observable<Submission> {
    return this.http.patch<Submission>(`${this.apiUrl}/${id}/status`, { status: SubmissionStatus.REJECTED }).pipe(
      map(submission => this.mapSubmission(submission))
    );
  }

  // Mark as winner
  markAsWinner(id: string): Observable<Submission> {
    return this.http.patch<Submission>(`${this.apiUrl}/${id}/status`, { status: SubmissionStatus.WINNER }).pipe(
      map(submission => this.mapSubmission(submission))
    );
  }
}
