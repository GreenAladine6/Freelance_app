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
    </ion-header>

    <ion-content class="conversations-content">
      <div class="empty-state" *ngIf="conversations.length === 0 && !loading">
        <div class="empty-icon-wrapper">
          <ion-icon name="chatbubbles-outline" class="empty-icon"></ion-icon>
        </div>
        <h2>No conversations yet</h2>
        <p>Your messages will appear here once you start chatting.</p>
      </div>

      <ion-list lines="full" class="conversation-list" *ngIf="!loading">
        <ion-item *ngFor="let chat of conversations" (click)="goToChat(chat.id)" detail="false" class="conversation-item">
          <div slot="start" class="avatar-wrapper" (click)="goToProfile($event, chat.other_user)">
            <img [src]="'https://i.pravatar.cc/150?u=' + chat.other_user.id" class="avatar" />
          </div>
          
          <ion-label>
            <div class="header-row">
              <div class="name-container">
                <h3>{{ chat.other_user.full_name || chat.other_user.username }}</h3>
              </div>
              <span class="time">{{ chat.last_message_at | date:'shortTime' }}</span>
            </div>
            
            <div class="message-row">
              <p class="last-message" [class.unread-text]="chat.last_message && !chat.last_message.is_read">
                {{ chat.last_message ? chat.last_message.text : 'No messages yet' }}
              </p>
            </div>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-spinner *ngIf="loading" class="ion-margin"></ion-spinner>
    </ion-content>
    
    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    ion-toolbar { --background: white; }
    ion-title { font-weight: 700; font-size: 20px; }
    .conversations-content { --background: white; }
    .conversation-list { padding: 0; background: transparent; }
    .conversation-item { --padding-start: 16px; --padding-end: 16px; --padding-top: 12px; --padding-bottom: 12px; cursor: pointer; --background-hover: #F9FAFB; }
    .avatar-wrapper { position: relative; margin-right: 12px; }
    .avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
    .name-container h3 { font-size: 14px; font-weight: 700; color: #374151; margin: 0; }
    .unread-text { color: #111827 !important; font-weight: 700 !important; }
    .time { font-size: 10px; color: #9CA3AF; font-weight: 500; }
    .message-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .last-message { font-size: 12px; color: #6B7280; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 80px; text-align: center; }
    .empty-icon-wrapper { width: 80px; height: 80px; background: #F3F4F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .empty-icon { font-size: 40px; color: #D1D5DB; }
    .empty-state h2 { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 8px; }
    .empty-state p { font-size: 14px; color: #6B7280; margin: 0; }
  `]
})
export class ConversationsListPage implements OnInit {
  conversations: ApiConversation[] = [];
  loading = false;

  constructor(
    private router: Router,
    private roleService: RoleService,
    private api: ApiService
  ) { }

  ngOnInit() {
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
}
