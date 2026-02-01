import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
          <label for="price">Prix proposé (EUR) *</label>
          <input id="price" type="number" formControlName="price" placeholder="Prix" />
        </div>

        <div class="form-group">
          <label for="technical">Note Technique (si applicable) *</label>
          <input id="technical" type="number" formControlName="technical" placeholder="Score Technique" />
        </div>

        <div class="form-group">
          <label for="deadline">Délai (Jours) *</label>
          <input id="deadline" type="number" formControlName="deadline" placeholder="Jours" />
        </div>

        <div class="form-group">
          <label for="documents">Documents (Technique, Financier, Références)</label>
          <input
            id="documents"
            type="file"
            multiple
            (change)="onFileSelected($event)"
            class="file-input"
          />
          <p class="help-text">Veuillez joindre tous les documents requis.</p>
          
          <div class="selected-files" *ngIf="selectedFiles.length > 0">
            <div *ngFor="let file of selectedFiles; let i = index" class="file-item">
              <span>{{ file.name }} ({{ (file.size / 1024).toFixed(2) }} KB)</span>
              <button type="button" (click)="removeFile(i)" class="btn-remove-file">✕</button>
            </div>
          </div>
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
    .help-text { color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem; }
    .file-input { border: 1px dashed #e5e7eb; padding: 2rem; text-align: center; cursor: pointer; }
    .selected-files { margin-top: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden; }
    .file-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
    .file-item:last-child { border-bottom: none; }
    .btn-remove-file { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.25rem; }
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
  selectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private submissionService: SubmissionService,
    private tenderService: TenderService,
    private cdr: ChangeDetectorRef
  ) {
    this.submissionForm = this.fb.group({
      price: [0, [Validators.required, Validators.min(0)]],
      technical: [0, [Validators.required, Validators.min(0)]],
      deadline: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const tenderId = this.route.snapshot.paramMap.get('tenderId');
    if (tenderId) {
      this.tenderService.getTenderById(tenderId).subscribe({
        next: (tender) => {
          this.tender = tender;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement de l\'appel d\'offre';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files) {
      for (let i = 0; i < event.target.files.length; i++) {
        this.selectedFiles.push(event.target.files[i]);
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  submit(): void {
    if (this.submissionForm.invalid || !this.tender) return;

    this.submitting = true;
    this.error = '';

    const dto: CreateSubmissionDto = {
      tenderId: this.tender.id,
      price: this.submissionForm.value.price,
      technical: this.submissionForm.value.technical,
      deadline: this.submissionForm.value.deadline,
    };

    this.submissionService.createSubmission(dto, this.selectedFiles).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/supplier/submissions']);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.message || 'Erreur lors de la soumission';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/supplier/tenders']);
  }
}
