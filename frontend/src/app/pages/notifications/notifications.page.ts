import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { ApiNotification } from '../../services/api.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  notifications: ApiNotification[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 20;
  totalCount = 0;

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications(event?: any, append: boolean = false) {
    this.isLoading = true;
    this.notificationService.getNotifications(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (append) {
          this.notifications = [...this.notifications, ...response.notifications];
        } else {
          this.notifications = response.notifications;
        }
        this.totalCount = response.total_count;
        this.isLoading = false;
        if (event?.target?.complete) {
          event.target.complete();
        } else if (event?.detail?.complete) {
          event.detail.complete();
        }
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
        this.isLoading = false;
        if (event?.target?.complete) {
          event.target.complete();
        } else if (event?.detail?.complete) {
          event.detail.complete();
        }
      }
    });
  }

  onLoadMore(event: any) {
    this.currentPage++;
    this.loadNotifications(event, true);
  }

  markAsRead(notification: ApiNotification) {
    if (notification.is_read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.is_read = true;
        this.notificationService.refreshUnreadCount();
      },
      error: (err) => console.error('Failed to mark notification as read:', err)
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.is_read = true);
        this.notificationService.refreshUnreadCount();
      },
      error: (err) => console.error('Failed to mark all as read:', err)
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  refreshNotifications(event: any) {
    this.currentPage = 1;
    this.loadNotifications(event, false);
  }

  getNotificationLink(notification: ApiNotification): string {
    // Route to the related item (application, job, etc.)
    if (notification.related_type === 'application') {
      return `/dashboard-client`; // Go to client dashboard to see applications
    }
    if (notification.related_type === 'conversation' && notification.related_id) {
      return `/chat/${notification.related_id}`;
    }
    return '/notifications';
  }
}
