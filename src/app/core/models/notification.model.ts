export enum NotificationType {
  TENDER_PUBLISHED = 'TENDER_PUBLISHED',
  SUBMISSION_RECEIVED = 'SUBMISSION_RECEIVED',
  TENDER_CLOSED = 'TENDER_CLOSED',
  EVALUATION_COMPLETE = 'EVALUATION_COMPLETE',
  AWARD_WINNER = 'AWARD_WINNER',
  AWARD_NOT_SELECTED = 'AWARD_NOT_SELECTED',
  SYSTEM = 'SYSTEM'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedEntityId?: string;
  createdAt: Date;
}
