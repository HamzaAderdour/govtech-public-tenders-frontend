import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>Dashboard Administrateur</h1>
      <p class="subtitle">Vue d'ensemble de la plateforme</p>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>Utilisateurs</h3>
            <p class="stat-value">156</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <h3>Appels d'offres</h3>
            <p class="stat-value">42</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-content">
            <h3>Soumissions</h3>
            <p class="stat-value">128</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>Marchés attribués</h3>
            <p class="stat-value">18</p>
          </div>
        </div>
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
  `]
})
export class AdminDashboardComponent {}
