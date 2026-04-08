import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { ApiService, ApiNotification } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<ApiNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private currentPage = 1;
  private pageSize = 20;

  constructor(private apiService: ApiService) {
    this.startPolling();
  }

  // Start polling for new notifications every 30 seconds
  private startPolling(): void {
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.apiService.getUnreadNotificationCount())
      )
      .subscribe(response => {
        this.unreadCountSubject.next(response.unread_count);
      });
  }

  // Get all notifications with pagination
  getNotifications(page: number = 1, limit: number = 20): Observable<{
    notifications: ApiNotification[];
    total_count: number;
    unread_count: number;
    page: number;
    limit: number;
  }> {
    return this.apiService.getNotifications(page, limit, false);
  }

  // Get only unread notifications
  getUnreadNotifications(): Observable<{
    notifications: ApiNotification[];
    total_count: number;
    unread_count: number;
    page: number;
    limit: number;
  }> {
    return this.apiService.getNotifications(1, 100, true);
  }

  // Get unread count
  getUnreadCount(): Observable<{ unread_count: number }> {
    return this.apiService.getUnreadNotificationCount();
  }

  // Mark single notification as read
  markAsRead(notificationId: string): Observable<any> {
    return this.apiService.markNotificationAsRead(notificationId);
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<any> {
    return this.apiService.markAllNotificationsAsRead();
  }

  // Refresh unread count
  refreshUnreadCount(): void {
    this.apiService.getUnreadNotificationCount().subscribe(response => {
      this.unreadCountSubject.next(response.unread_count);
    });
  }

  // Load notifications into subject
  loadNotifications(page: number = 1, limit: number = 20): void {
    this.apiService.getNotifications(page, limit, false).subscribe(response => {
      this.notificationsSubject.next(response.notifications);
      this.unreadCountSubject.next(response.unread_count);
      this.currentPage = page;
    });
  }
}
