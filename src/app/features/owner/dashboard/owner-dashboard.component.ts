import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <h1>Dashboard Owner</h1>
      <p class="subtitle">Gérez vos appels d'offres</p>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <h3>Appels d'offres actifs</h3>
            <p class="stat-value">8</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-content">
            <h3>Soumissions reçues</h3>
            <p class="stat-value">34</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>En évaluation</h3>
            <p class="stat-value">5</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>Marchés attribués</h3>
            <p class="stat-value">12</p>
          </div>
        </div>
      </div>

      <div class="action-section">
        <button routerLink="/owner/tenders/create" class="create-btn">
          ➕ Créer un nouvel appel d'offre
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      h1 {
        font-size: 2rem;
        color: #111827;
        margin: 0 0 0.5rem 0;
      }

      .subtitle {
        color: #6b7280;
        margin: 0 0 2rem 0;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .stat-icon {
        font-size: 2.5rem;
      }

      .stat-content {
        h3 {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.25rem 0;
          font-weight: 500;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
      }
    }

    .action-section {
      display: flex;
      justify-content: center;
      margin-top: 3rem;
    }

    .create-btn {
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }
    }
  `]
})
export class OwnerDashboardComponent {}
