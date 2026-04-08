import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './notification-badge.component.html',
  styleUrls: ['./notification-badge.component.scss']
})
export class NotificationBadgeComponent implements OnInit {
  unreadCount = 0;

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    // Subscribe to unread count changes
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });

    // Initial load
    this.notificationService.refreshUnreadCount();
  }
}
