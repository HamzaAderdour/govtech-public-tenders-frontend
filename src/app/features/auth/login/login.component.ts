import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        // Redirect based on role
        this.redirectByRole(response.user.role);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Une erreur est survenue';
      }
    });
  }

  private redirectByRole(role: UserRole): void {
    switch (role) {
      case UserRole.ADMIN:
        this.router.navigate(['/admin/dashboard']);
        break;
      case UserRole.OWNER:
        this.router.navigate(['/owner/dashboard']);
        break;
      case UserRole.SUPPLIER:
        this.router.navigate(['/supplier/dashboard']);
        break;
    }
  }

  // Quick login helpers for testing
  quickLogin(email: string): void {
    this.loginForm.patchValue({ email, password: 'password123' });
    this.onSubmit();
  }
}
