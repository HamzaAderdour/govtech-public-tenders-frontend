import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TenderService } from '../../../../core/services/tender.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Tender } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-tender-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './tender-list.component.html',
  styleUrls: ['./tender-list.component.scss']
})
export class TenderListComponent implements OnInit {
  tenders: Tender[] = [];
  loading = true;
  error = '';

  constructor(
    private tenderService: TenderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTenders();
  }

  loadTenders(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.tenderService.getTendersByOwner(user.id).subscribe({
      next: (tenders) => {
        this.tenders = tenders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  getDeadlineStatus(deadline: Date): string {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return 'Expiré';
    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Demain';
    return `${days} jours`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}
