import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenderStatus, SubmissionStatus } from '../../../core/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="getBadgeClass()">
      {{ getLabel() }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .badge-draft {
      background: #f3f4f6;
      color: #6b7280;
    }

    .badge-open {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge-closed {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-awarded {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-submitted {
      background: #e0e7ff;
      color: #3730a3;
    }

    .badge-evaluation {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-accepted {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge-winner {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
    }

    .badge-not-selected {
      background: #f3f4f6;
      color: #6b7280;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status!: TenderStatus | SubmissionStatus;

  getBadgeClass(): string {
    const statusMap: Record<string, string> = {
      [TenderStatus.DRAFT]: 'badge-draft',
      [TenderStatus.OPEN]: 'badge-open',
      [TenderStatus.CLOSED]: 'badge-closed',
      [TenderStatus.AWARDED]: 'badge-awarded',
      [SubmissionStatus.SUBMITTED]: 'badge-submitted',
      [SubmissionStatus.IN_EVALUATION]: 'badge-evaluation',
      [SubmissionStatus.ACCEPTED]: 'badge-accepted',
      [SubmissionStatus.REJECTED]: 'badge-rejected',
      [SubmissionStatus.WINNER]: 'badge-winner',
      [SubmissionStatus.NOT_SELECTED]: 'badge-not-selected'
    };
    return statusMap[this.status] || 'badge-draft';
  }

  getLabel(): string {
    const labelMap: Record<string, string> = {
      [TenderStatus.DRAFT]: 'Brouillon',
      [TenderStatus.OPEN]: 'Ouvert',
      [TenderStatus.CLOSED]: 'Fermé',
      [TenderStatus.AWARDED]: 'Attribué',
      [SubmissionStatus.SUBMITTED]: 'Soumis',
      [SubmissionStatus.IN_EVALUATION]: 'En évaluation',
      [SubmissionStatus.ACCEPTED]: 'Accepté',
      [SubmissionStatus.REJECTED]: 'Rejeté',
      [SubmissionStatus.WINNER]: 'Gagnant',
      [SubmissionStatus.NOT_SELECTED]: 'Non retenu'
    };
    return labelMap[this.status] || this.status;
  }
}
