import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TenderService } from '../../../../core/services/tender.service';
import { SubmissionService } from '../../../../core/services/submission.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Tender } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-tender-detail-supplier',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  template: `
    <div class="container" *ngIf="!loading && tender">
      <button routerLink="/supplier/tenders" class="btn-back">← Retour</button>

      <div class="header">
        <div>
          <h1>{{ tender.title }}</h1>
          <app-status-badge [status]="tender.status"></app-status-badge>
        </div>
        <button 
          *ngIf="!hasSubmitted && tender.status === 'PUBLISHED'" 
          [routerLink]="['/supplier/submissions/submit', tender.id]" 
          class="btn-primary">
          Soumettre un dossier
        </button>
        <div *ngIf="hasSubmitted" class="submitted-badge">
          ✓ Dossier déjà soumis
        </div>
      </div>

      <div class="content-grid">
        <div class="main-content">
          <div class="card">
            <h2>Description</h2>
            <p>{{ tender.description }}</p>
          </div>

          <div class="card">
            <h2>Critères d'évaluation</h2>
            <div class="criteria-list">
              <div *ngFor="let criterion of tender.criteria" class="criterion-item">
                <div class="criterion-header">
                  <strong>{{ criterion.name }}</strong>
                  <span class="weight-badge">{{ criterion.weight }}%</span>
                </div>
                <p *ngIf="criterion.description">{{ criterion.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar">
          <div class="card">
            <h3>Informations</h3>
            <div class="info-list">
              <div class="info-item">
                <span class="label">Organisation</span>
                <span class="value">{{ tender.ownerUserId }}</span>
              </div>

              <div class="info-item">
                <span class="label">Date limite</span>
                <span class="value">{{ tender.deadline | date: 'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Jours restants</span>
                <span class="value" [class.urgent]="getDaysRemaining() < 7">{{ getDaysRemaining() }} jours</span>
              </div>
            </div>
          </div>

          <div class="card">
            <h3>Documents</h3>
            <p class="info-text">Documents officiels disponibles (simulation)</p>
            <div class="doc-list">
              <div class="doc-item">📄 Cahier des charges.pdf</div>
              <div class="doc-item">📄 Règlement de consultation.pdf</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="loading">Chargement...</div>
  `,
  styles: [`
    .container { max-width: 1400px; margin: 0 auto; }
    .btn-back { padding: 0.5rem 1rem; background: #f3f4f6; border: none; border-radius: 0.375rem; cursor: pointer; margin-bottom: 1rem; }
    .btn-back:hover { background: #e5e7eb; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .header h1 { font-size: 2rem; margin: 0 0 0.5rem 0; }
    .btn-primary { padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
    .submitted-badge { padding: 0.75rem 1.5rem; background: #d1fae5; color: #065f46; border-radius: 0.5rem; font-weight: 600; }
    .content-grid { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; }
    .card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
    .card h2, .card h3 { margin: 0 0 1rem 0; }
    .criteria-list { display: flex; flex-direction: column; gap: 1rem; }
    .criterion-item { padding: 1rem; background: #f9fafb; border-radius: 0.5rem; }
    .criterion-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
    .weight-badge { background: #e9d5ff; color: #6b21a8; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
    .criterion-item p { margin: 0; color: #6b7280; font-size: 0.875rem; }
    .info-list { display: flex; flex-direction: column; gap: 1rem; }
    .info-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .info-item .label { color: #6b7280; font-size: 0.875rem; }
    .info-item .value { font-weight: 600; }
    .info-item .value.urgent { color: #dc2626; }
    .info-text { color: #6b7280; font-size: 0.875rem; margin: 0 0 1rem 0; }
    .doc-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .doc-item { padding: 0.75rem; background: #f9fafb; border-radius: 0.375rem; font-size: 0.875rem; }
    .loading { text-align: center; padding: 4rem 0; }
  `]
})
export class TenderDetailSupplierComponent implements OnInit {
  tender: Tender | null = null;
  loading = true;
  hasSubmitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenderService: TenderService,
    private submissionService: SubmissionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTender(id);
      this.checkSubmission(id);
    }
  }

  loadTender(id: string): void {
    this.tenderService.getTenderById(id).subscribe({
      next: (tender) => {
        this.tender = tender;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  checkSubmission(tenderId: string): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.submissionService.getSubmissionsByTender(tenderId).subscribe({
      next: (submissions) => {
        // Correctly check if user.id matches any supplierId in the tender's submissions
        this.hasSubmitted = submissions.some(s => String(s.supplierId) === String(user.id));
      },
      error: () => { }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  getDaysRemaining(): number {
    if (!this.tender) return 0;
    const now = new Date();
    const diff = this.tender.deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
