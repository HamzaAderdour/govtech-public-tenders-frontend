import { Component, OnInit } from '@angular/core';
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
    private submissionService: SubmissionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTender(id);
      this.loadSubmissions(id);
    }
  }

  loadTender(id: string): void {
    this.tenderService.getTenderById(id).subscribe({
      next: (tender) => {
        this.tender = tender;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  loadSubmissions(tenderId: string): void {
    this.submissionService.getSubmissionsByTender(tenderId).subscribe({
      next: (submissions) => {
        this.submissions = submissions;
      },
      error: () => {}
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
