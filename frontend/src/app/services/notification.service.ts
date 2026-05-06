import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import { catchError, startWith, switchMap, tap } from 'rxjs/operators';
import { ApiService, ApiNotification } from './api.service';
import { RoleService } from './role.service';

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

  constructor(private apiService: ApiService, private roleService: RoleService) {
    this.roleService.accessToken$.subscribe(token => {
      if (!token) {
        this.unreadCountSubject.next(0);
        this.notificationsSubject.next([]);
        return;
      }
      this.refreshUnreadCount();
    });

    this.startPolling();
  }

  // Start polling for new notifications every 30 seconds
  private startPolling(): void {
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => {
          if (!this.roleService.isAuthenticated) {
            return of({ unread_count: 0 });
          }

          return this.apiService.getUnreadNotificationCount().pipe(
            catchError(() => of({ unread_count: this.unreadCountSubject.value }))
          );
        })
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
    return this.apiService.getNotifications(page, limit, false).pipe(
      tap(response => {
        this.unreadCountSubject.next(response.unread_count);
        this.notificationsSubject.next(response.notifications);
        this.currentPage = page;
      })
    );
  }

  // Get only unread notifications
  getUnreadNotifications(): Observable<{
    notifications: ApiNotification[];
    total_count: number;
    unread_count: number;
    page: number;
    limit: number;
  }> {
    return this.apiService.getNotifications(1, 100, true).pipe(
      tap(response => {
        this.unreadCountSubject.next(response.unread_count);
        this.notificationsSubject.next(response.notifications);
      })
    );
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
    if (!this.roleService.isAuthenticated) {
      this.unreadCountSubject.next(0);
      return;
    }

    this.apiService.getUnreadNotificationCount().pipe(
      catchError(() => of({ unread_count: this.unreadCountSubject.value }))
    ).subscribe(response => {
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
