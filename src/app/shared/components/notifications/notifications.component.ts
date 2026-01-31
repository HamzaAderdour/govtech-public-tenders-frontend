import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <button class="notif-button" (click)="toggleDropdown()">
        <span class="bell-icon">🔔</span>
        <span *ngIf="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </button>

      <div *ngIf="showDropdown" class="dropdown" (click)="$event.stopPropagation()">
        <div class="dropdown-header">
          <h3>Notifications</h3>
          <button *ngIf="unreadCount > 0" (click)="markAllAsRead()" class="mark-all-btn">
            Tout marquer comme lu
          </button>
        </div>

        <div class="notifications-list">
          <div *ngIf="notifications.length === 0" class="empty-state">
            <span class="empty-icon">📭</span>
            <p>Aucune notification</p>
          </div>

          <div 
            *ngFor="let notif of notifications" 
            class="notif-item"
            [class.unread]="!notif.read"
            (click)="handleNotificationClick(notif)">
            <div class="notif-content">
              <div class="notif-title">{{ notif.title }}</div>
              <div class="notif-message">{{ notif.message }}</div>
              <div class="notif-time">{{ getTimeAgo(notif.createdAt) }}</div>
            </div>
            <button class="delete-btn" (click)="deleteNotification($event, notif.id)">✕</button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="showDropdown" class="overlay" (click)="closeDropdown()"></div>
  `,
  styles: [`
    .notifications-container {
      position: relative;
    }

    .notif-button {
      position: relative;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }

    .bell-icon {
      font-size: 1.5rem;
    }

    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #ef4444;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
      min-width: 1.25rem;
      text-align: center;
    }

    .dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      width: 400px;
      max-height: 500px;
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      z-index: 1001;
      display: flex;
      flex-direction: column;
    }

    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;

      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
      }
    }

    .mark-all-btn {
      padding: 0.375rem 0.75rem;
      background: #f3f4f6;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #e5e7eb;
      }
    }

    .notifications-list {
      overflow-y: auto;
      max-height: 400px;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #6b7280;

      .empty-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: 0.5rem;
      }

      p {
        margin: 0;
      }
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #f9fafb;
      }

      &.unread {
        background: #eff6ff;

        &:hover {
          background: #dbeafe;
        }
      }
    }

    .notif-content {
      flex: 1;
    }

    .notif-title {
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
    }

    .notif-message {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .notif-time {
      color: #9ca3af;
      font-size: 0.75rem;
    }

    .delete-btn {
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: all 0.2s;

      &:hover {
        background: #fee2e2;
        color: #dc2626;
      }
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  showDropdown = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getUserNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.unreadCount = notifications.filter(n => !n.read).length;
      }
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.loadNotifications();
    }
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }

  handleNotificationClick(notification: Notification): void {
    // Mark as read
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          this.loadNotifications();
        }
      });
    }

    // Navigate to related entity
    if (notification.relatedEntityId) {
      this.closeDropdown();
      // Navigate based on notification type
      // This is a simplified version - in real app, you'd have more sophisticated routing
      this.router.navigate(['/']); // Placeholder
    }
  }

  deleteNotification(event: Event, id: string): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  }
}
