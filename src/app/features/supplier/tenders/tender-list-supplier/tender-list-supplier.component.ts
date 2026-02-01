import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TenderService } from '../../../../core/services/tender.service';
import { Tender } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-tender-list-supplier',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  template: `
    <div class="container">
      <h1>Appels d'offres disponibles</h1>
      <p class="subtitle">Consultez les opportunités et soumettez vos dossiers</p>

      <div *ngIf="loading" class="loading">Chargement...</div>

      <div *ngIf="!loading && tenders.length === 0" class="empty">
        <div class="empty-icon">📋</div>
        <h3>Aucun appel d'offre disponible</h3>
        <p>Revenez plus tard pour découvrir de nouvelles opportunités</p>
      </div>

      <div *ngIf="!loading && tenders.length > 0" class="tenders-grid">
        <div *ngFor="let tender of tenders" class="tender-card">
          <div class="card-header">
            <h3>{{ tender.title }}</h3>
            <app-status-badge [status]="tender.status"></app-status-badge>
          </div>
          <p class="description">{{ tender.description }}</p>
          <div class="card-info">

            <div class="info-item">
              <span class="label">Date limite</span>
              <span class="value">{{ tender.deadline | date: 'dd/MM/yyyy' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Organisation</span>
              <span class="value">{{ tender.ownerUserId }}</span>
            </div>
          </div>
          <button [routerLink]="['/supplier/tenders', tender.id]" class="btn-primary">
            Voir détails
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 2rem; margin: 0 0 0.5rem 0; }
    .subtitle { color: #6b7280; margin: 0 0 2rem 0; }
    .loading, .empty { text-align: center; padding: 4rem 0; }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
    .tenders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 1.5rem; }
    .tender-card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; gap: 1rem; }
    .card-header h3 { font-size: 1.125rem; margin: 0; flex: 1; }
    .description { color: #6b7280; font-size: 0.875rem; margin: 0 0 1.5rem 0; }
    .card-info { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem; }
    .info-item { display: flex; justify-content: space-between; }
    .info-item .label { font-size: 0.875rem; color: #6b7280; }
    .info-item .value { font-weight: 600; }
    .btn-primary { width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
  `]
})
export class TenderListSupplierComponent implements OnInit {
  tenders: Tender[] = [];
  loading = true;

  constructor(
    private tenderService: TenderService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.tenderService.getOpenTenders().subscribe({
      next: (tenders) => {
        this.tenders = tenders;
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
