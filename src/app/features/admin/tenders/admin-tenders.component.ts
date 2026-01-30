import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TenderService } from '../../../core/services/tender.service';
import { Tender, TenderStatus } from '../../../core/models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-tenders',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  template: `
    <div class="container">
      <h1>Tous les appels d'offres</h1>
      <p class="subtitle">Vue d'ensemble de la plateforme</p>

      <div class="filters">
        <button 
          *ngFor="let status of statuses" 
          (click)="filterByStatus(status.value)" 
          [class.active]="selectedStatus === status.value"
          class="filter-btn">
          {{ status.label }} ({{ getCountByStatus(status.value) }})
        </button>
      </div>

      <div *ngIf="loading" class="loading">Chargement...</div>

      <div *ngIf="!loading && filteredTenders.length === 0" class="empty">
        <h3>Aucun appel d'offre</h3>
      </div>

      <div *ngIf="!loading && filteredTenders.length > 0" class="tenders-table">
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Organisation</th>
              <th>Budget</th>
              <th>Date limite</th>
              <th>Statut</th>
              <th>Créé le</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tender of filteredTenders">
              <td><strong>{{ tender.title }}</strong></td>
              <td>{{ tender.ownerName }}</td>
              <td>{{ formatCurrency(tender.budget) }}</td>
              <td>{{ tender.deadline | date: 'dd/MM/yyyy' }}</td>
              <td><app-status-badge [status]="tender.status"></app-status-badge></td>
              <td>{{ tender.createdAt | date: 'dd/MM/yyyy' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 2rem; margin: 0 0 0.5rem 0; }
    .subtitle { color: #6b7280; margin: 0 0 2rem 0; }
    .filters { display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .filter-btn { padding: 0.5rem 1rem; background: #f3f4f6; color: #374151; border: 2px solid transparent; border-radius: 0.5rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .filter-btn:hover { background: #e5e7eb; }
    .filter-btn.active { background: #dbeafe; color: #1e40af; border-color: #3b82f6; }
    .loading, .empty { text-align: center; padding: 4rem 0; }
    .tenders-table { background: white; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #f9fafb; }
    th { padding: 1rem; text-align: left; font-weight: 600; color: #374151; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 1rem; border-top: 1px solid #e5e7eb; }
    tbody tr:hover { background: #f9fafb; }
  `]
})
export class AdminTendersComponent implements OnInit {
  tenders: Tender[] = [];
  filteredTenders: Tender[] = [];
  loading = true;
  selectedStatus: string | null = null;

  statuses = [
    { label: 'Tous', value: null },
    { label: 'Brouillon', value: TenderStatus.DRAFT },
    { label: 'Ouvert', value: TenderStatus.OPEN },
    { label: 'Fermé', value: TenderStatus.CLOSED },
    { label: 'Attribué', value: TenderStatus.AWARDED }
  ];

  constructor(private tenderService: TenderService) {}

  ngOnInit(): void {
    this.tenderService.getAllTenders().subscribe({
      next: (tenders) => {
        this.tenders = tenders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        this.filteredTenders = tenders;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterByStatus(status: string | null): void {
    this.selectedStatus = status;
    if (status === null) {
      this.filteredTenders = this.tenders;
    } else {
      this.filteredTenders = this.tenders.filter(t => t.status === status);
    }
  }

  getCountByStatus(status: string | null): number {
    if (status === null) return this.tenders.length;
    return this.tenders.filter(t => t.status === status).length;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }
}
