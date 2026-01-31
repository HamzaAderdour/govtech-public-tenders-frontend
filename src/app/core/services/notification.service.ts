import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { Notification, NotificationType } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private initialized = false;

  private storageKey = 'notifications_data';

  constructor(private authService: AuthService) {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const notifications = JSON.parse(stored);
        notifications.forEach((n: any) => {
          n.createdAt = new Date(n.createdAt);
        });
        this.notificationsSubject.next(notifications);
        this.initialized = true;
      } catch (e) {
        console.error('Error parsing notifications:', e);
        this.initializeMockData();
      }
    } else {
      this.initializeMockData();
    }
  }

  private saveNotifications(notifications: Notification[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    this.notificationsSubject.next(notifications);
    this.initialized = true;
  }

  private initializeMockData(): void {
    const mockNotifications: Notification[] = [
      {
        id: 'notif1',
        userId: '3',
        type: NotificationType.TENDER_PUBLISHED,
        title: 'Nouvel appel d\'offre',
        message: 'Un nouvel appel d\'offre "Construction du pont autoroutier A25" a été publié',
        read: false,
        relatedEntityId: '1',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'notif2',
        userId: '3',
        type: NotificationType.TENDER_PUBLISHED,
        message: 'Un nouvel appel d\'offre "Fourniture de matériel informatique" a été publié',
        title: 'Nouvel appel d\'offre',
        read: true,
        relatedEntityId: '2',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'notif3',
        userId: '2',
        type: NotificationType.SUBMISSION_RECEIVED,
        title: 'Nouvelle soumission',
        message: 'TechBuild SARL a soumis un dossier pour "Construction du pont autoroutier A25"',
        read: false,
        relatedEntityId: 'sub1',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    this.saveNotifications(mockNotifications);
  }

  // Get notifications for current user
  getUserNotifications(): Observable<Notification[]> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return of([]);
    }

    if (!this.initialized) {
      return new Observable(observer => {
        setTimeout(() => {
          const userNotifications = this.notificationsSubject.value
            .filter(n => n.userId === user.id)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          observer.next(userNotifications);
          observer.complete();
        }, 50);
      });
    }

    const userNotifications = this.notificationsSubject.value
      .filter(n => n.userId === user.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return of(userNotifications);
  }

  // Get unread count
  getUnreadCount(): Observable<number> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return of(0);
    }

    const count = this.notificationsSubject.value
      .filter(n => n.userId === user.id && !n.read)
      .length;
    
    return of(count);
  }

  // Mark as read
  markAsRead(id: string): Observable<void> {
    const notifications = this.notificationsSubject.value;
    const notification = notifications.find(n => n.id === id);
    
    if (notification) {
      notification.read = true;
      this.saveNotifications(notifications);
    }
    
    return of(void 0).pipe(delay(100));
  }

  // Mark all as read
  markAllAsRead(): Observable<void> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return of(void 0);
    }

    const notifications = this.notificationsSubject.value;
    notifications.forEach(n => {
      if (n.userId === user.id) {
        n.read = true;
      }
    });
    
    this.saveNotifications(notifications);
    return of(void 0).pipe(delay(100));
  }

  // Create notification
  createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityId?: string
  ): Observable<Notification> {
    const notifications = this.notificationsSubject.value;
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      userId,
      type,
      title,
      message,
      read: false,
      relatedEntityId,
      createdAt: new Date()
    };

    this.saveNotifications([...notifications, newNotification]);
    return of(newNotification).pipe(delay(100));
  }

  // Notify all suppliers about new tender
  notifyTenderPublished(tenderId: string, tenderTitle: string, supplierIds: string[]): void {
    supplierIds.forEach(supplierId => {
      this.createNotification(
        supplierId,
        NotificationType.TENDER_PUBLISHED,
        'Nouvel appel d\'offre',
        `Un nouvel appel d\'offre "${tenderTitle}" a été publié`,
        tenderId
      ).subscribe();
    });
  }

  // Notify owner about new submission
  notifySubmissionReceived(ownerId: string, tenderTitle: string, supplierName: string, submissionId: string): void {
    this.createNotification(
      ownerId,
      NotificationType.SUBMISSION_RECEIVED,
      'Nouvelle soumission',
      `${supplierName} a soumis un dossier pour "${tenderTitle}"`,
      submissionId
    ).subscribe();
  }

  // Notify supplier about evaluation
  notifyEvaluationComplete(supplierId: string, tenderTitle: string, submissionId: string): void {
    this.createNotification(
      supplierId,
      NotificationType.EVALUATION_COMPLETE,
      'Évaluation terminée',
      `Votre soumission pour "${tenderTitle}" a été évaluée`,
      submissionId
    ).subscribe();
  }

  // Notify winner
  notifyWinner(supplierId: string, tenderTitle: string, submissionId: string): void {
    this.createNotification(
      supplierId,
      NotificationType.AWARD_WINNER,
      '🏆 Félicitations !',
      `Vous avez remporté le marché "${tenderTitle}"`,
      submissionId
    ).subscribe();
  }

  // Notify not selected
  notifyNotSelected(supplierId: string, tenderTitle: string, submissionId: string): void {
    this.createNotification(
      supplierId,
      NotificationType.AWARD_NOT_SELECTED,
      'Résultat de l\'appel d\'offre',
      `Votre soumission pour "${tenderTitle}" n'a pas été retenue`,
      submissionId
    ).subscribe();
  }

  // Delete notification
  deleteNotification(id: string): Observable<void> {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.saveNotifications(notifications);
    return of(void 0).pipe(delay(100));
  }
}
