import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { SubmissionService } from '../../../../core/services/submission.service';
import { TenderService } from '../../../../core/services/tender.service';
import { Submission, Tender } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-submission-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  template: `
    <div class="container">
      <h1>Soumissions reçues</h1>
      <p class="subtitle" *ngIf="tender">Pour: {{ tender.title }}</p>

      <div *ngIf="loading" class="loading">Chargement...</div>

      <div *ngIf="!loading && submissions.length === 0" class="empty">
        <div class="empty-icon">📄</div>
        <h3>Aucune soumission</h3>
        <p>Aucun fournisseur n'a encore soumis de dossier</p>
      </div>

      <div *ngIf="!loading && submissions.length > 0" class="submissions-list">
        <div *ngFor="let submission of submissions" class="submission-card">
          <div class="card-header">
            <div>
              <h3>{{ submission.supplierName }}</h3>
              <p class="tender-title">{{ submission.tenderTitle }}</p>
            </div>
            <app-status-badge [status]="submission.status"></app-status-badge>
          </div>

          <div class="card-info">
            <div class="info-item">
              <span class="label">Prix proposé</span>
              <span class="value">{{ formatCurrency(submission.proposedPrice) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Date de soumission</span>
              <span class="value">{{ submission.submittedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="info-item" *ngIf="submission.totalScore">
              <span class="label">Score total</span>
              <span class="value score">{{ submission.totalScore.toFixed(2) }}/100</span>
            </div>
          </div>

          <div class="card-actions">
            <button *ngIf="submission.status === 'SUBMITTED'" (click)="evaluate(submission.id)" class="btn-primary">
              Évaluer
            </button>
            <button *ngIf="submission.status === 'IN_EVALUATION'" (click)="markAsWinner(submission.id)" class="btn-success">
              Sélectionner comme gagnant
            </button>
            <button *ngIf="submission.status === 'IN_EVALUATION'" (click)="reject(submission.id)" class="btn-danger">
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2rem; margin: 0 0 0.5rem 0; }
    .subtitle { color: #6b7280; margin: 0 0 2rem 0; }
    .loading, .empty { text-align: center; padding: 4rem 0; }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
    .submissions-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .submission-card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .card-header h3 { font-size: 1.25rem; margin: 0; }
    .tender-title { color: #6b7280; font-size: 0.875rem; margin: 0.25rem 0 0 0; }
    .card-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem; }
    .info-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .info-item .label { font-size: 0.875rem; color: #6b7280; }
    .info-item .value { font-weight: 600; }
    .info-item .score { color: #059669; font-size: 1.125rem; }
    .card-actions { display: flex; gap: 0.75rem; }
    .btn-primary { padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
    .btn-success { padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
    .btn-danger { padding: 0.75rem 1.5rem; background: #ef4444; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
  `]
})
export class SubmissionListComponent implements OnInit {
  submissions: Submission[] = [];
  tender: Tender | null = null;
  loading = true;
  tenderId: string | null = null;

  constructor(
    private submissionService: SubmissionService,
    private tenderService: TenderService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tenderId = params['tenderId'];
      if (this.tenderId) {
        this.loadTender(this.tenderId);
        this.loadSubmissions(this.tenderId);
      } else {
        this.loadAllSubmissions();
      }
    });
  }

  loadTender(id: string): void {
    this.tenderService.getTenderById(id).subscribe({
      next: (tender) => {
        this.tender = tender;
      },
      error: () => {}
    });
  }

  loadSubmissions(tenderId: string): void {
    this.submissionService.getSubmissionsByTender(tenderId).subscribe({
      next: (submissions) => {
        this.submissions = submissions;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadAllSubmissions(): void {
    this.submissionService.getAllSubmissions().subscribe({
      next: (submissions) => {
        this.submissions = submissions;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  evaluate(id: string): void {
    this.submissionService.evaluateSubmission(id).subscribe({
      next: () => {
        if (this.tenderId) {
          this.loadSubmissions(this.tenderId);
        } else {
          this.loadAllSubmissions();
        }
      },
      error: () => {}
    });
  }

  markAsWinner(id: string): void {
    if (confirm('Confirmer la sélection de ce fournisseur comme gagnant ?')) {
      this.submissionService.markAsWinner(id).subscribe({
        next: () => {
          if (this.tenderId) {
            this.loadSubmissions(this.tenderId);
          } else {
            this.loadAllSubmissions();
          }
        },
        error: () => {}
      });
    }
  }

  reject(id: string): void {
    if (confirm('Confirmer le rejet de cette soumission ?')) {
      this.submissionService.rejectSubmission(id).subscribe({
        next: () => {
          if (this.tenderId) {
            this.loadSubmissions(this.tenderId);
          } else {
            this.loadAllSubmissions();
          }
        },
        error: () => {}
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }
}
