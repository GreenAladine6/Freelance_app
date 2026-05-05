import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, ApiMessage, ApiConversation } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { Subscription } from 'rxjs';
import { RealtimeChatService } from '../../services/realtime-chat.service';

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
            <img [src]="otherUser.avatar_url || api.defaultAvatarUrl" class="avatar" />
            <span class="live-dot"></span>
          </div>
          <div>
            <h1 class="user-name">{{ otherUser.full_name || otherUser.username }}</h1>
            <p class="user-status">Active now</p>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="chat-content" #content>
      <div class="message-alert" *ngIf="messageError">
        {{ messageError }}
      </div>
      <div class="message-list">
        <div *ngIf="messages.length === 0" class="empty-chat-state">
          <h2>Start something great</h2>
          <p>This conversation is waiting for your first message.</p>
        </div>
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
    ion-toolbar { --background: #ffffff; --border-width: 0; }
    ion-back-button { --color: #111827; }
    .user-info { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 6px 10px; border-radius: 12px; transition: background 0.2s; }
    .user-info:active { background: #f3f4f6; }
    .avatar-container { position: relative; }
    .avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(15, 23, 42, 0.14); }
    .live-dot { position: absolute; right: -1px; bottom: -1px; width: 11px; height: 11px; border-radius: 50%; background: #22c55e; border: 2px solid #ffffff; }
    .user-name { font-size: 14px; font-weight: 800; margin: 0; color: #111827; }
    .user-status { font-size: 10px; color: #64748b; margin: 0; }
    .chat-content {
      --background:
        radial-gradient(circle at 5% 10%, #fde68a55 0%, transparent 32%),
        radial-gradient(circle at 95% 15%, #ddd6fe77 0%, transparent 34%),
        linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    }
    .message-alert {
      margin: 14px 16px 0;
      padding: 12px 14px;
      border-radius: 14px;
      background: rgba(254, 226, 226, 0.96);
      color: #991b1b;
      border: 1px solid #fecaca;
      font-size: 13px;
      font-weight: 600;
    }
    .message-list { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
    .empty-chat-state {
      min-height: 42vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: rgba(255,255,255,0.72);
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      backdrop-filter: blur(4px);
      padding: 22px;
    }
    .empty-chat-state h2 { font-size: 19px; font-weight: 800; margin: 0 0 8px; color: #111827; }
    .empty-chat-state p { font-size: 14px; margin: 0; color: #6b7280; }
    .message-wrapper { display: flex; flex-direction: column; max-width: 82%; animation: bubbleIn 0.22s ease; }
    .message-wrapper.sent { align-self: flex-end; align-items: flex-end; }
    .message-wrapper.received { align-self: flex-start; align-items: flex-start; }
    .message-bubble { padding: 10px 16px; border-radius: 18px; font-size: 14px; line-height: 1.5; }
    .sent-bubble {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%);
      color: #ffffff;
      border-bottom-right-radius: 5px;
      box-shadow: 0 8px 18px rgba(109, 40, 217, 0.26);
    }
    .received-bubble {
      background: rgba(255,255,255,0.92);
      color: #111827;
      border-bottom-left-radius: 5px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
    }
    .message-meta { margin-top: 4px; }
    .time { font-size: 9px; color: #9ca3af; }
    .chat-footer { background: #ffffff; border-top: 1px solid #e5e7eb; padding: 8px 16px calc(8px + env(safe-area-inset-bottom)); }
    .input-container { display: flex; align-items: flex-end; gap: 12px; }
    .textarea-wrapper {
      flex: 1;
      background: #ffffff;
      border: 1.5px solid #d1d5db;
      border-radius: 20px;
      padding: 8px 16px;
      box-shadow: 0 5px 14px rgba(15, 23, 42, 0.06);
    }
    textarea { width: 100%; background: transparent; border: none; outline: none; resize: none; font-size: 14px; color: #111827; caret-color: #7c3aed; }
    textarea::placeholder { color: #9ca3af; }
    .send-btn {
      --padding-start: 8px;
      --padding-end: 8px;
      height: 38px;
      --color: #7c3aed;
      --background-hover: #f3e8ff;
      border-radius: 999px;
    }

    @keyframes bubbleIn {
      from { opacity: 0; transform: translateY(6px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild('content', { static: false }) content: any;

  messages: ApiMessage[] = [];
  inputValue = '';
  conversationId = '';
  currentUserId = '';
  otherUser: any = null;
  messageError = '';
  private realtimeSub?: Subscription;
  private realtimeErrorSub?: Subscription;
  private tempMessageCounter = 0;
  private pendingTempMessageId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public api: ApiService,
    private roleService: RoleService,
    private router: Router,
    private realtimeChat: RealtimeChatService
  ) { }

  ngOnInit() {
    this.currentUserId = this.roleService.user?.id || '';
    this.conversationId = this.route.snapshot.paramMap.get('id') || '';

    this.loadMessages();
    this.loadConversation();
    this.startRealtime();
  }

  loadConversation() {
    this.api.getConversation(this.conversationId).subscribe(conv => {
      this.otherUser = conv.other_user;
    });
  }

  ngOnDestroy() {
    this.realtimeSub?.unsubscribe();
    this.realtimeErrorSub?.unsubscribe();
    this.realtimeChat.disconnect();
  }

  loadMessages() {
    this.api.getMessages(this.conversationId).subscribe(msgs => {
      this.messages = msgs;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  startRealtime() {
    this.realtimeChat.joinConversation(this.conversationId);

    this.realtimeSub = this.realtimeChat.onNewMessage().subscribe(msg => {
      if (msg.conversation_id !== this.conversationId) {
        return;
      }

      const existingById = this.messages.some(existing => existing.id === msg.id);
      if (existingById) {
        return;
      }

      // Reconcile optimistic message from current user with the server payload.
      const optimisticIndex = this.messages.findIndex(existing =>
        existing.id.startsWith('temp-') &&
        existing.sender_id === this.currentUserId &&
        existing.text === msg.text
      );

      if (optimisticIndex >= 0) {
        const updated = [...this.messages];
        updated[optimisticIndex] = msg;
        this.messages = updated;
        this.pendingTempMessageId = null;
        this.scrollToBottom();
        return;
      }

      this.messages = [...this.messages, msg];
      this.scrollToBottom();
    });

    this.realtimeErrorSub = this.realtimeChat.onError().subscribe(err => {
      console.error('Realtime chat error:', err);
      this.messageError = err;
      this.removePendingMessage();
    });
  }

  private removePendingMessage() {
    if (!this.pendingTempMessageId) {
      return;
    }

    this.messages = this.messages.filter(message => message.id !== this.pendingTempMessageId);
    this.pendingTempMessageId = null;
  }

  scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }

  handleSendMessage(event?: Event) {
    if (event) event.preventDefault();
    const text = this.inputValue.trim();
    if (!text) return;

    this.messageError = '';
    this.inputValue = '';

    const optimisticMessage: ApiMessage = {
      id: `temp-${Date.now()}-${this.tempMessageCounter++}`,
      conversation_id: this.conversationId,
      sender_id: this.currentUserId,
      text,
      is_read: true,
      created_at: new Date().toISOString()
    };

    this.messages = [...this.messages, optimisticMessage];
    this.pendingTempMessageId = optimisticMessage.id;
    this.scrollToBottom();

    if (this.realtimeChat.isConnected) {
      this.realtimeChat.sendMessage(this.conversationId, text);
      return;
    }

    this.api.sendMessage({
      conversation_id: this.conversationId,
      text: text
    }).subscribe(msg => {
      this.messages = this.messages.filter(m => m.id !== optimisticMessage.id);
      this.messages.push(msg);
      this.pendingTempMessageId = null;
      this.scrollToBottom();
    }, () => {
      // Keep UI consistent if send fails.
      this.messages = this.messages.filter(m => m.id !== optimisticMessage.id);
      this.pendingTempMessageId = null;
      this.messageError = 'Message could not be sent.';
    });
  }

  goToOtherProfile() {
    if (!this.otherUser) return;
    const type = this.otherUser.user_type;
    if (type === 'freelancer') {
      this.router.navigate(['/freelancer-profile', this.otherUser.id]);
    } else {
      this.router.navigate(['/profile-client', this.otherUser.id]);
    }
  }
}
