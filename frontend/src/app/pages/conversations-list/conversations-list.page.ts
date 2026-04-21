import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService, ApiConversation } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-conversations-list',
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Messages</ion-title>
        <ion-buttons slot="end">
          <ion-button><ion-icon name="search-outline"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
      <div class="subtitle-bar">
        <p>Jump back into your active conversations</p>
      </div>
    </ion-header>

    <ion-content class="conversations-content">
      <div class="empty-state" *ngIf="conversations.length === 0 && !loading">
        <div class="empty-icon-wrapper">
          <ion-icon name="chatbubbles-outline" class="empty-icon"></ion-icon>
        </div>
        <h2>No conversations yet</h2>
        <p>Your messages will appear here once you start chatting.</p>
      </div>

      <ion-list lines="none" class="conversation-list" *ngIf="!loading">
        <ion-item *ngFor="let chat of conversations" (click)="goToChat(chat.id)" detail="false" class="conversation-item" [class.unread-item]="isUnread(chat)">
          <div slot="start" class="avatar-wrapper" (click)="goToProfile($event, chat.other_user)">
            <img [src]="chat.other_user.avatar_url || api.defaultAvatarUrl" class="avatar" />
            <span *ngIf="isUnread(chat)" class="unread-dot"></span>
          </div>
          
          <ion-label>
            <div class="header-row">
              <div class="name-container">
                <h3>{{ chat.other_user.full_name || chat.other_user.username }}</h3>
              </div>
              <span class="time">{{ chat.last_message_at | date:'shortTime' }}</span>
            </div>
            
            <div class="message-row">
              <p class="last-message" [class.unread-text]="isUnread(chat)">
                {{ chat.last_message ? chat.last_message.text : 'No messages yet' }}
              </p>
              <span class="jump-chip">Open</span>
            </div>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-spinner *ngIf="loading" class="ion-margin"></ion-spinner>
    </ion-content>
    
    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    ion-toolbar { --background: #ffffff; }
    ion-title { font-weight: 700; font-size: 20px; }
    .subtitle-bar { padding: 0 16px 10px; background: #ffffff; border-bottom: 1px solid #eceff3; }
    .subtitle-bar p { margin: 0; font-size: 12px; color: #64748b; }
    .conversations-content { --background: #f8fafc; }
    .conversation-list { padding: 10px 0 92px; background: transparent; }
    .conversation-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      --background: #ffffff;
      --background-hover: #f3f4f6;
      --inner-border-width: 0;
      margin: 0 10px 8px;
      border-radius: 14px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(17, 24, 39, 0.05);
      border: 1px solid #edf0f5;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .conversation-item:active { transform: scale(0.995); }
    .conversation-item.unread-item { border-color: #d9c6ff; box-shadow: 0 8px 18px rgba(124, 58, 237, 0.10); }
    .avatar-wrapper { position: relative; margin-right: 12px; }
    .avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 2px solid #ffffff; }
    .unread-dot { position: absolute; right: 0; bottom: 2px; width: 10px; height: 10px; border-radius: 50%; background: #8b5cf6; border: 2px solid #ffffff; }
    .header-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
    .name-container h3 { font-size: 14px; font-weight: 700; color: #111827; margin: 0; }
    .unread-text { color: #111827 !important; font-weight: 700 !important; }
    .time { font-size: 10px; color: #6b7280; font-weight: 500; }
    .message-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .last-message { font-size: 12px; color: #6b7280; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .jump-chip { flex-shrink: 0; font-size: 10px; font-weight: 700; color: #7c3aed; background: #f3e8ff; border: 1px solid #e9d5ff; padding: 4px 8px; border-radius: 999px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 80px; text-align: center; }
    .empty-icon-wrapper { width: 80px; height: 80px; background: #f3e8ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .empty-icon { font-size: 40px; color: #8b5cf6; }
    .empty-state h2 { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 8px; }
    .empty-state p { font-size: 14px; color: #6b7280; margin: 0; }
  `]
})
export class ConversationsListPage implements OnInit {
  conversations: ApiConversation[] = [];
  loading = false;
  currentUserId = '';

  constructor(
    private router: Router,
    private roleService: RoleService,
    public api: ApiService
  ) { }

  ngOnInit() {
    this.currentUserId = this.roleService.user?.id || '';
    this.loadConversations();
  }

  ionViewWillEnter() {
    this.currentUserId = this.roleService.user?.id || '';
    this.loadConversations();
  }

  loadConversations() {
    this.loading = true;
    this.api.getConversations().subscribe({
      next: (data) => {
        this.conversations = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  goToChat(id: string) {
    this.router.navigate(['/chat', id]);
  }

  goToProfile(event: Event, user: any) {
    event.stopPropagation();
    if (user.user_type === 'freelancer') {
      this.router.navigate(['/freelancer-profile', user.id]);
    } else {
      this.router.navigate(['/profile-client', user.id]);
    }
  }

  isUnread(chat: ApiConversation) {
    return (chat.unread_count || 0) > 0;
  }
}
