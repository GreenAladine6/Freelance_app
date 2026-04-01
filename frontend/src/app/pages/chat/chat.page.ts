import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, ApiMessage, ApiConversation } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/conversations" icon="arrow-back"></ion-back-button>
        </ion-buttons>
        <div class="user-info" *ngIf="otherUser" (click)="goToOtherProfile()">
          <div class="avatar-container">
            <img [src]="'https://i.pravatar.cc/150?u=' + otherUser.id" class="avatar" />
          </div>
          <div>
            <h1 class="user-name">{{ otherUser.full_name || otherUser.username }}</h1>
            <p class="user-status">Online</p>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="chat-content" #content>
      <div class="message-list">
        <div *ngFor="let msg of messages" class="message-wrapper" 
             [ngClass]="{'sent': msg.sender_id === currentUserId, 'received': msg.sender_id !== currentUserId}">
          <div class="message-bubble" 
               [ngClass]="{'sent-bubble': msg.sender_id === currentUserId, 'received-bubble': msg.sender_id !== currentUserId}">
            {{ msg.text }}
          </div>
          <div class="message-meta">
            <span class="time">{{ msg.created_at | date:'shortTime' }}</span>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border chat-footer">
      <ion-toolbar>
        <div class="input-container">
          <div class="textarea-wrapper">
            <textarea rows="1" [(ngModel)]="inputValue" placeholder="Type a message..." (keydown.enter)="handleSendMessage($event)"></textarea>
          </div>
          <ion-button *ngIf="inputValue.trim()" fill="clear" color="primary" class="send-btn" (click)="handleSendMessage()">
            <ion-icon name="send"></ion-icon>
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .user-info { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 4px 8px; border-radius: 8px; transition: background 0.2s; }
    .user-info:active { background: #f0f0f0; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
    .user-name { font-size: 14px; font-weight: 700; margin: 0; color: #111827; }
    .user-status { font-size: 10px; color: #16a34a; margin: 0; }
    .chat-content { --background: #F8F9FA; }
    .message-list { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
    .message-wrapper { display: flex; flex-direction: column; max-width: 80%; }
    .message-wrapper.sent { align-self: flex-end; align-items: flex-end; }
    .message-wrapper.received { align-self: flex-start; align-items: flex-start; }
    .message-bubble { padding: 10px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
    .sent-bubble { background: #8B5CF6; color: white; border-bottom-right-radius: 4px; }
    .received-bubble { background: white; color: #1F2937; border-bottom-left-radius: 4px; border: 1px solid #E5E7EB; }
    .message-meta { margin-top: 4px; }
    .time { font-size: 9px; color: #9CA3AF; }
    .chat-footer { background: white; border-top: 1px solid #E5E7EB; padding: 8px 16px; }
    .input-container { display: flex; align-items: flex-end; gap: 12px; }
    .textarea-wrapper { flex: 1; background: #F9FAFB; border: 1.5px solid #E5E7EB; border-radius: 20px; padding: 8px 16px; }
    textarea { width: 100%; background: transparent; border: none; outline: none; resize: none; font-size: 14px; }
    .send-btn { --padding-start: 8px; --padding-end: 8px; height: 36px; }
  `]
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild('content', { static: false }) content: any;

  messages: ApiMessage[] = [];
  inputValue = '';
  conversationId = '';
  currentUserId = '';
  otherUser: any = null;
  private pollSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private roleService: RoleService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUserId = this.roleService.user?.id || '';
    this.conversationId = this.route.snapshot.paramMap.get('id') || '';

    this.loadMessages();
    this.loadConversation();
    this.startPolling();
  }

  loadConversation() {
    this.api.getConversation(this.conversationId).subscribe(conv => {
      this.otherUser = conv.other_user;
    });
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  loadMessages() {
    this.api.getMessages(this.conversationId).subscribe(msgs => {
      this.messages = msgs;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  startPolling() {
    this.pollSub = interval(3000).pipe(
      startWith(0),
      switchMap(() => this.api.getMessages(this.conversationId))
    ).subscribe(msgs => {
      if (msgs.length > this.messages.length) {
        this.messages = msgs;
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }

  handleSendMessage(event?: Event) {
    if (event) event.preventDefault();
    if (!this.inputValue.trim()) return;

    const text = this.inputValue;
    this.inputValue = '';

    this.api.sendMessage({
      conversation_id: this.conversationId,
      text: text
    }).subscribe(msg => {
      this.messages.push(msg);
      this.scrollToBottom();
    });
  }

  goToOtherProfile() {
    if (!this.otherUser) return;
    const type = this.otherUser.user_type;
    if (type === 'freelancer') {
      this.router.navigate(['/freelancer-profile', this.otherUser.id]);
    } else {
      // For clients, we could show a client profile page if it exists
      this.router.navigate(['/profile-client', this.otherUser.id]);
      // Wait, profile-client currently doesn't take an ID in routing?
      // I'll check routing again.
    }
  }
}
