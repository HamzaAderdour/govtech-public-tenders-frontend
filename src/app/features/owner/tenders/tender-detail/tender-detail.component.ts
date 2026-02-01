import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TenderService } from '../../../../core/services/tender.service';
import { SubmissionService } from '../../../../core/services/submission.service';
import { Tender, Submission } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-tender-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './tender-detail.component.html',
  styleUrls: ['./tender-detail.component.scss']
})
export class TenderDetailComponent implements OnInit {
  tender: Tender | null = null;
  submissions: Submission[] = [];
  loading = true;
  error = '';
  showPublishConfirm = false;
  showCloseConfirm = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenderService: TenderService,
    private submissionService: SubmissionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Tender Detail - Loading tender with ID:', id);
    if (id) {
      this.loadTender(id);
      this.loadSubmissions(id);
    } else {
      console.error('Tender Detail - No ID found in route');
      this.loading = false;
      this.error = 'ID de l\'appel d\'offre manquant';
    }
  }

  loadTender(id: string): void {
    console.log('Tender Detail - Fetching tender:', id);
    this.tenderService.getTenderById(id).subscribe({
      next: (tender) => {
        console.log('Tender Detail - Received tender:', tender);
        this.tender = tender;
        this.loading = false;
        console.log('Tender Detail - After setting: loading =', this.loading, ', tender =', this.tender);
        console.log('Tender Detail - Tender status:', this.tender?.status);
        console.log('Tender Detail - Tender deadline:', this.tender?.deadline);
        // Manually trigger change detection
        this.cdr.detectChanges();
        console.log('Tender Detail - Change detection triggered');
      },
      error: (err) => {
        console.error('Tender Detail - Error loading tender:', err);
        this.error = err.message || 'Erreur lors du chargement de l\'appel d\'offre';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadSubmissions(tenderId: string): void {
    console.log('Tender Detail - Fetching submissions for tender:', tenderId);
    this.submissionService.getSubmissionsByTender(tenderId).subscribe({
      next: (submissions) => {
        console.log('Tender Detail - Received submissions:', submissions);
        this.submissions = submissions;
      },
      error: (err) => {
        console.error('Tender Detail - Error loading submissions:', err);
        // Don't block the page if submissions fail to load
      }
    });
  }

  publishTender(): void {
    if (!this.tender) return;

    this.tenderService.publishTender(this.tender.id).subscribe({
      next: (updated) => {
        this.tender = updated;
        this.showPublishConfirm = false;
      },
      error: (err) => {
        this.error = err.message;
      }
    });
  }

  closeTender(): void {
    if (!this.tender) return;

    this.tenderService.closeTender(this.tender.id).subscribe({
      next: (updated) => {
        this.tender = updated;
        this.showCloseConfirm = false;
      },
      error: (err) => {
        this.error = err.message;
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getDaysRemaining(): number {
    if (!this.tender) return 0;
    const now = new Date();
    const diff = this.tender.deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
