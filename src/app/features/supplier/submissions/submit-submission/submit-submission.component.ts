import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubmissionService } from '../../../../core/services/submission.service';
import { TenderService } from '../../../../core/services/tender.service';
import { Tender, CreateSubmissionDto } from '../../../../core/models';

@Component({
  selector: 'app-submit-submission',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h1>Soumettre un dossier</h1>
      <p class="subtitle" *ngIf="tender">Pour: {{ tender.title }}</p>

      <div *ngIf="loading" class="loading">Chargement...</div>

      <form *ngIf="!loading && tender" [formGroup]="submissionForm" (ngSubmit)="submit()" class="form-card">
        <div class="form-group">
          <label for="proposedPrice">Prix proposé (EUR) *</label>
          <input
            id="proposedPrice"
            type="number"
            formControlName="proposedPrice"
            placeholder="1000000"
            [class.error]="submissionForm.get('proposedPrice')?.invalid && submissionForm.get('proposedPrice')?.touched"
          />
          <span class="error-message" *ngIf="submissionForm.get('proposedPrice')?.invalid && submissionForm.get('proposedPrice')?.touched">
            Le prix doit être supérieur à 0
          </span>
        </div>

        <div class="info-box">
          <h3>Documents requis (simulation)</h3>
          <p>Dans une version réelle, vous pourriez uploader vos documents techniques et financiers ici.</p>
          <ul>
            <li>Dossier technique</li>
            <li>Offre financière</li>
            <li>Références</li>
          </ul>
        </div>

        <div *ngIf="error" class="error-alert">{{ error }}</div>

        <div class="form-actions">
          <button type="button" (click)="cancel()" class="btn-cancel" [disabled]="submitting">
            Annuler
          </button>
          <button type="submit" class="btn-primary" [disabled]="submissionForm.invalid || submitting">
            <span *ngIf="!submitting">Soumettre le dossier</span>
            <span *ngIf="submitting">Soumission...</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 2rem; margin: 0 0 0.5rem 0; }
    .subtitle { color: #6b7280; margin: 0 0 2rem 0; }
    .loading { text-align: center; padding: 4rem 0; }
    .form-card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem; font-size: 0.875rem; }
    .form-group input { width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 0.5rem; font-size: 1rem; }
    .form-group input:focus { outline: none; border-color: #7c3aed; }
    .form-group input.error { border-color: #ef4444; }
    .error-message { display: block; color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; }
    .info-box { padding: 1.5rem; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 0.5rem; margin-bottom: 1.5rem; }
    .info-box h3 { margin: 0 0 0.5rem 0; font-size: 1rem; }
    .info-box p { color: #6b7280; margin: 0 0 1rem 0; font-size: 0.875rem; }
    .info-box ul { margin: 0; padding-left: 1.5rem; color: #6b7280; font-size: 0.875rem; }
    .error-alert { padding: 1rem; background: #fee2e2; color: #dc2626; border-radius: 0.5rem; margin-bottom: 1rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; }
    .btn-cancel { padding: 0.75rem 1.5rem; background: transparent; color: #6b7280; border: 2px solid #e5e7eb; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
    .btn-cancel:hover:not(:disabled) { background: #f3f4f6; }
    .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class SubmitSubmissionComponent implements OnInit {
  submissionForm: FormGroup;
  tender: Tender | null = null;
  loading = true;
  submitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private submissionService: SubmissionService,
    private tenderService: TenderService
  ) {
    this.submissionForm = this.fb.group({
      proposedPrice: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    const tenderId = this.route.snapshot.paramMap.get('tenderId');
    if (tenderId) {
      this.tenderService.getTenderById(tenderId).subscribe({
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
  }

  submit(): void {
    if (this.submissionForm.invalid || !this.tender) return;

    this.submitting = true;
    this.error = '';

    const dto: CreateSubmissionDto = {
      tenderId: this.tender.id,
      proposedPrice: this.submissionForm.value.proposedPrice,
      technicalDocumentIds: ['mock-tech-doc-1', 'mock-tech-doc-2'],
      financialDocumentIds: ['mock-fin-doc-1']
    };

    this.submissionService.createSubmission(dto).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/supplier/submissions']);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.message;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/supplier/tenders']);
  }
}
