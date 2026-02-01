import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TenderService } from '../../../core/services/tender.service';
import { SubmissionService } from '../../../core/services/submission.service';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <h1>Dashboard Owner</h1>
      <p class="subtitle">Gérez vos appels d'offres</p>

      <div class="stats-grid">
        <div class="stat-card" routerLink="/owner/tenders">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <h3>Appels d'offres actifs</h3>
            <p class="stat-value">{{ activeTenders }}</p>
          </div>
        </div>

        <div class="stat-card" routerLink="/owner/submissions">
          <div class="stat-icon">📄</div>
          <div class="stat-content">
            <h3>Soumissions reçues</h3>
            <p class="stat-value">{{ totalSubmissions }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>En évaluation</h3>
            <p class="stat-value">{{ inEvaluation }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>Marchés attribués</h3>
            <p class="stat-value">{{ awarded }}</p>
          </div>
        </div>
      </div>

      <div class="action-section">
        <button routerLink="/owner/tenders/create" class="create-btn">
          ➕ Créer un nouvel appel d'offre
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      h1 { font-size: 2rem; color: #111827; margin: 0 0 0.5rem 0; }
      .subtitle { color: #6b7280; margin: 0 0 2rem 0; }
    }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: white; border-radius: 0.75rem; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); transition: transform 0.2s; cursor: pointer; }
    .stat-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
    .stat-icon { font-size: 2.5rem; }
    .stat-content { h3 { font-size: 0.875rem; color: #6b7280; margin: 0 0 0.25rem 0; font-weight: 500; } .stat-value { font-size: 2rem; font-weight: 700; color: #111827; margin: 0; } }
    .action-section { display: flex; justify-content: center; margin-top: 3rem; }
    .create-btn { padding: 1rem 2rem; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
    .create-btn:hover { transform: translateY(-2px); }
  `]
})
export class OwnerDashboardComponent implements OnInit {
  activeTenders = 0;
  totalSubmissions = 0;
  inEvaluation = 0;
  awarded = 0;

  constructor(
    private tenderService: TenderService,
    private submissionService: SubmissionService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    forkJoin({
      tenders: this.tenderService.getTendersByOwner(user.id),
      submissions: this.submissionService.getAllSubmissions() // Owner sees all submissions for their tenders on backend ideally, but we'll filter here if needed
    }).subscribe({
      next: (data) => {
        this.activeTenders = data.tenders.filter(t => t.status === 'PUBLISHED').length;

        // Filter submissions that belong to owner's tenders
        const ownerTenderIds = new Set(data.tenders.map(t => t.id));
        const ownerSubmissions = data.submissions.filter(s => ownerTenderIds.has(s.tenderId));

        this.totalSubmissions = ownerSubmissions.length;
        this.inEvaluation = ownerSubmissions.filter(s => s.status === 'IN_EVALUATION' || s.status === 'SUBMITTED').length;
        this.awarded = data.tenders.filter(t => t.status === 'AWARDED').length;
      }
    });
  }
}
