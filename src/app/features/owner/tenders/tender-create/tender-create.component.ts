import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TenderService } from '../../../../core/services/tender.service';
import { CreateTenderDto } from '../../../../core/models';

@Component({
  selector: 'app-tender-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tender-create.component.html',
  styleUrls: ['./tender-create.component.scss']
})
export class TenderCreateComponent {
  tenderForm: FormGroup;
  loading = false;
  error = '';
  currentStep = 1;
  totalSteps = 3;
  selectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private tenderService: TenderService,
    private router: Router
  ) {
    this.tenderForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(50)]],
      deadline: ['', Validators.required],
      criteria: this.fb.array([])
    });

    // Initialize with fixed criteria
    this.initFixedCriteria();
  }

  get criteria(): FormArray {
    return this.tenderForm.get('criteria') as FormArray;
  }

  private initFixedCriteria(): void {
    const fixedCriteria = [
      { name: 'PRICE', label: 'Prix', defaultWeight: 40 },
      { name: 'TECHNICAL_QUALITY', label: 'Qualité Technique', defaultWeight: 40 },
      { name: 'DELIVERY_TIME', label: 'Délais de livraison', defaultWeight: 20 }
    ];

    fixedCriteria.forEach(c => {
      const criterionForm = this.fb.group({
        name: [c.name, Validators.required], // Keep internal name as enum value
        label: [c.label], // Display label
        weight: [c.defaultWeight, [Validators.required, Validators.min(0), Validators.max(100)]],
        description: ['']
      });
      this.criteria.push(criterionForm);
    });
  }

  // Removed addCriterion and removeCriterion as criteria are fixed

  getTotalWeight(): number {
    return this.criteria.controls.reduce((sum, control) => {
      return sum + (control.get('weight')?.value || 0);
    }, 0);
  }

  isWeightValid(): boolean {
    return this.getTotalWeight() === 100;
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!(this.tenderForm.get('title')?.valid &&
          this.tenderForm.get('description')?.valid);
      case 2:
        return !!(this.tenderForm.get('deadline')?.valid);
      case 3:
        return this.criteria.valid && this.isWeightValid();
      default:
        return false;
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

  saveDraft(): void {
    if (this.tenderForm.invalid) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (!this.isWeightValid()) {
      this.error = 'La somme des poids des critères doit être égale à 100%';
      return;
    }

    this.loading = true;
    this.error = '';

    const dto: CreateTenderDto = this.tenderForm.value;

    this.tenderService.createTender(dto, this.selectedFiles).subscribe({
      next: (tender) => {
        this.loading = false;
        this.router.navigate(['/owner/tenders', tender.id]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message;
      }
    });
  }

  saveAndPublish(): void {
    if (this.tenderForm.invalid) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (!this.isWeightValid()) {
      this.error = 'La somme des poids des critères doit être égale à 100%';
      return;
    }

    this.loading = true;
    this.error = '';

    const dto: CreateTenderDto = this.tenderForm.value;

    this.tenderService.createTender(dto, this.selectedFiles).subscribe({
      next: (tender) => {
        this.tenderService.publishTender(tender.id).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/owner/tenders', tender.id]);
          },
          error: (err) => {
            this.loading = false;
            this.error = err.message;
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/owner/tenders']);
  }

  getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
}
