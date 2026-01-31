import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, delay, map } from 'rxjs';
import { Submission, SubmissionStatus, CreateSubmissionDto, SubmissionScore, Tender, EvaluationCriteria } from '../models';
import { AuthService } from './auth.service';
import { TenderService } from './tender.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private submissionsSubject = new BehaviorSubject<Submission[]>([]);
  public submissions$ = this.submissionsSubject.asObservable();

  private storageKey = 'submissions_data';

  constructor(
    private authService: AuthService,
    private tenderService: TenderService,
    private notificationService: NotificationService
  ) {
    this.loadSubmissions();
  }

  private loadSubmissions(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const submissions = JSON.parse(stored);
      submissions.forEach((s: any) => {
        s.submittedAt = new Date(s.submittedAt);
        if (s.evaluatedAt) s.evaluatedAt = new Date(s.evaluatedAt);
      });
      this.submissionsSubject.next(submissions);
    } else {
      this.initializeMockData();
    }
  }

  private saveSubmissions(submissions: Submission[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(submissions));
    this.submissionsSubject.next(submissions);
  }

  private initializeMockData(): void {
    const mockSubmissions: Submission[] = [
      {
        id: 'sub1',
        tenderId: '1',
        tenderTitle: 'Construction du pont autoroutier A25',
        supplierId: '3',
        supplierName: 'TechBuild SARL',
        status: SubmissionStatus.SUBMITTED,
        proposedPrice: 4750000,
        technicalDocumentIds: ['tech1', 'tech2'],
        financialDocumentIds: ['fin1'],
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'sub2',
        tenderId: '2',
        tenderTitle: 'Fourniture de matériel informatique',
        supplierId: '3',
        supplierName: 'TechBuild SARL',
        status: SubmissionStatus.SUBMITTED,
        proposedPrice: 680000,
        technicalDocumentIds: ['tech3'],
        financialDocumentIds: ['fin2'],
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    this.saveSubmissions(mockSubmissions);
  }

  // Get all submissions
  getAllSubmissions(): Observable<Submission[]> {
    return of(this.submissionsSubject.value).pipe(delay(300));
  }

  // Get submissions by tender
  getSubmissionsByTender(tenderId: string): Observable<Submission[]> {
    return of(this.submissionsSubject.value.filter(s => s.tenderId === tenderId)).pipe(delay(300));
  }

  // Get submissions by supplier
  getSubmissionsBySupplier(supplierId: string): Observable<Submission[]> {
    return of(this.submissionsSubject.value.filter(s => s.supplierId === supplierId)).pipe(delay(300));
  }

  // Get submission by ID
  getSubmissionById(id: string): Observable<Submission> {
    const submission = this.submissionsSubject.value.find(s => s.id === id);
    if (!submission) {
      return throwError(() => new Error('Soumission non trouvée')).pipe(delay(300));
    }
    return of(submission).pipe(delay(300));
  }

  // Create submission
  createSubmission(dto: CreateSubmissionDto): Observable<Submission> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    // Check if already submitted
    const existing = this.submissionsSubject.value.find(
      s => s.tenderId === dto.tenderId && s.supplierId === user.id
    );
    if (existing) {
      return throwError(() => new Error('Vous avez déjà soumis un dossier pour cet appel d\'offre'));
    }

    return this.tenderService.getTenderById(dto.tenderId).pipe(
      delay(500),
      map((tender: Tender) => {
        const submissions = this.submissionsSubject.value;
        const newSubmission: Submission = {
          id: `sub_${Date.now()}`,
          tenderId: dto.tenderId,
          tenderTitle: tender.title,
          supplierId: user.id,
          supplierName: user.organizationName || `${user.firstName} ${user.lastName}`,
          status: SubmissionStatus.SUBMITTED,
          proposedPrice: dto.proposedPrice,
          technicalDocumentIds: dto.technicalDocumentIds,
          financialDocumentIds: dto.financialDocumentIds,
          submittedAt: new Date()
        };

        this.saveSubmissions([...submissions, newSubmission]);
        
        // Notify owner
        this.notificationService.notifySubmissionReceived(
          tender.ownerId,
          tender.title,
          newSubmission.supplierName,
          newSubmission.id
        );
        
        return newSubmission;
      })
    );
  }

  // Evaluate submission (calculate scores)
  evaluateSubmission(id: string): Observable<Submission> {
    const submissions = this.submissionsSubject.value;
    const index = submissions.findIndex(s => s.id === id);

    if (index === -1) {
      return throwError(() => new Error('Soumission non trouvée'));
    }

    const submission = submissions[index];

    return this.tenderService.getTenderById(submission.tenderId).pipe(
      delay(800),
      map((tender: Tender) => {
        // Mock score calculation
        const scores: SubmissionScore[] = tender.criteria.map((criterion: EvaluationCriteria) => {
          const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
          const weightedScore = (score * criterion.weight) / 100;
          return {
            criteriaId: criterion.id,
            criteriaName: criterion.name,
            score,
            weight: criterion.weight,
            weightedScore
          };
        });

        const totalScore = scores.reduce((sum, s) => sum + s.weightedScore, 0);

        const updatedSubmission: Submission = {
          ...submission,
          status: SubmissionStatus.IN_EVALUATION,
          scores,
          totalScore,
          evaluatedAt: new Date()
        };

        submissions[index] = updatedSubmission;
        this.saveSubmissions(submissions);

        return updatedSubmission;
      })
    );
  }

  // Accept submission
  acceptSubmission(id: string): Observable<Submission> {
    return this.updateSubmissionStatus(id, SubmissionStatus.ACCEPTED);
  }

  // Reject submission
  rejectSubmission(id: string): Observable<Submission> {
    return this.updateSubmissionStatus(id, SubmissionStatus.REJECTED);
  }

  // Mark as winner
  markAsWinner(id: string): Observable<Submission> {
    const submissions = this.submissionsSubject.value;
    const submission = submissions.find(s => s.id === id);

    if (!submission) {
      return throwError(() => new Error('Soumission non trouvée'));
    }

    // Mark all other submissions for same tender as NOT_SELECTED
    const updatedSubmissions = submissions.map(s => {
      if (s.tenderId === submission.tenderId) {
        if (s.id === id) {
          return { ...s, status: SubmissionStatus.WINNER };
        } else {
          return { ...s, status: SubmissionStatus.NOT_SELECTED };
        }
      }
      return s;
    });

    this.saveSubmissions(updatedSubmissions);

    // Also update tender status to AWARDED
    this.tenderService.awardTender(submission.tenderId).subscribe();

    // Notify winner
    this.notificationService.notifyWinner(
      submission.supplierId,
      submission.tenderTitle,
      submission.id
    );

    // Notify not selected suppliers
    updatedSubmissions.forEach(s => {
      if (s.tenderId === submission.tenderId && s.status === SubmissionStatus.NOT_SELECTED) {
        this.notificationService.notifyNotSelected(
          s.supplierId,
          s.tenderTitle,
          s.id
        );
      }
    });

    const winner = updatedSubmissions.find(s => s.id === id)!;
    return of(winner).pipe(delay(500));
  }

  private updateSubmissionStatus(id: string, status: SubmissionStatus): Observable<Submission> {
    const submissions = this.submissionsSubject.value;
    const index = submissions.findIndex(s => s.id === id);

    if (index === -1) {
      return throwError(() => new Error('Soumission non trouvée'));
    }

    const updatedSubmission = {
      ...submissions[index],
      status
    };

    submissions[index] = updatedSubmission;
    this.saveSubmissions(submissions);

    return of(updatedSubmission).pipe(delay(500));
  }

  // Get statistics
  getStatistics(): Observable<{
    total: number;
    submitted: number;
    inEvaluation: number;
    winner: number;
    rejected: number;
  }> {
    const submissions = this.submissionsSubject.value;
    return of({
      total: submissions.length,
      submitted: submissions.filter(s => s.status === SubmissionStatus.SUBMITTED).length,
      inEvaluation: submissions.filter(s => s.status === SubmissionStatus.IN_EVALUATION).length,
      winner: submissions.filter(s => s.status === SubmissionStatus.WINNER).length,
      rejected: submissions.filter(s => s.status === SubmissionStatus.REJECTED || s.status === SubmissionStatus.NOT_SELECTED).length
    }).pipe(delay(300));
  }
}
