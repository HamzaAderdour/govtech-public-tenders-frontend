import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SubmissionService } from '../../../../core/services/submission.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Submission } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-my-submissions',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  template: `
    <div class="container">
      <h1>Mes soumissions</h1>
      <p class="subtitle">Suivez l'état de vos candidatures</p>

      <div *ngIf="loading" class="loading">Chargement...</div>

      <div *ngIf="!loading && submissions.length === 0" class="empty">
        <div class="empty-icon">📄</div>
        <h3>Aucune soumission</h3>
        <p>Vous n'avez pas encore soumis de dossier</p>
        <button routerLink="/supplier/tenders" class="btn-primary">Parcourir les appels d'offres</button>
      </div>

      <div *ngIf="!loading && submissions.length > 0" class="submissions-list">
        <div *ngFor="let submission of submissions" class="submission-card">
          <div class="card-header">
            <div>
              <h3>Tender ID: {{ submission.tenderId }}</h3>
              <p class="date">Statut: {{ submission.status }}</p>
            </div>
            <app-status-badge [status]="submission.status"></app-status-badge>
          </div>

          <div class="card-info">
            <div class="info-item">
              <span class="label">Prix proposé</span>
              <span class="value">{{ formatCurrency(submission.price) }}</span>
            </div>
            <div class="info-item" *ngIf="submission.score">
              <span class="label">Score obtenu</span>
              <span class="value score">{{ submission.score.toFixed(2) }}/100</span>
            </div>
            <div class="info-item" *ngIf="submission.status === 'WINNER'">
              <span class="label">Résultat</span>
              <span class="value winner">🏆 Gagnant</span>
            </div>
          </div>

          <div *ngIf="submission.scores && submission.scores.length > 0" class="scores-detail">
            <h4>Détail des scores</h4>
            <div class="scores-grid">
              <div *ngFor="let score of submission.scores" class="score-item">
                <span class="score-name">{{ score.criteriaName }}</span>
                <span class="score-value">{{ score.score }}/100 ({{ score.weight }}%)</span>
              </div>
            </div>
          </div>

          <div *ngIf="submission.ragAnalysis" class="rag-analysis">
            <h4>Analyse IA</h4>
            <div class="analysis-content">
              {{ submission.ragAnalysis }}
            </div>
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
    .date { color: #6b7280; font-size: 0.875rem; margin: 0.25rem 0 0 0; }
    .card-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem; }
    .info-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .info-item .label { font-size: 0.875rem; color: #6b7280; }
    .info-item .value { font-weight: 600; }
    .info-item .score { color: #7c3aed; font-size: 1.125rem; }
    .info-item .winner { color: #f59e0b; font-size: 1.125rem; }
    .scores-detail { padding: 1rem; background: #faf5ff; border-radius: 0.5rem; margin-bottom: 1rem; }
    .scores-detail h4 { margin: 0 0 1rem 0; font-size: 1rem; }
    .scores-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; }
    .score-item { display: flex; justify-content: space-between; padding: 0.5rem; background: white; border-radius: 0.375rem; }
    .score-name { font-size: 0.875rem; color: #6b7280; }
    .score-value { font-weight: 600; color: #7c3aed; }
    .rag-analysis { margin-bottom: 1rem; padding: 1.25rem; background: #e0f2fe; border-radius: 0.75rem; border-left: 4px solid #0ea5e9; }
    .rag-analysis h4 { margin: 0 0 0.75rem 0; color: #0369a1; font-size: 1rem; }
    .analysis-content { color: #0c4a6e; font-size: 0.9375rem; line-height: 1.5; white-space: pre-wrap; }
    .btn-primary { padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
  `]
})
export class MySubmissionsComponent implements OnInit {
  submissions: Submission[] = [];
  loading = true;

  constructor(
    private submissionService: SubmissionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.error('My Submissions - No user found');
      this.loading = false;
      return;
    }

    this.submissionService.getSubmissionsBySupplier(user.id).subscribe({
      next: (submissions) => {
        this.submissions = submissions.sort((a, b) => Number(b.id) - Number(a.id));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }
}
