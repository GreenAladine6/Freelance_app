import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ApiMessage } from './api.service';
import { RoleService } from './role.service';

@Injectable({ providedIn: 'root' })
export class RealtimeChatService {
  private socket?: Socket;
  private readonly socketUrl = 'http://localhost:5000';

  constructor(private roleService: RoleService) {}

  get isConnected(): boolean {
    return !!this.socket?.connected;
  }

  connect(): void {
    const token = this.roleService.accessToken;
    if (!token) {
      return;
    }

    if (this.socket?.connected) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(this.socketUrl, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  joinConversation(conversationId: string): void {
    if (!conversationId) return;
    this.connect();
    this.socket?.emit('join_conversation', { conversation_id: conversationId });
  }

  sendMessage(conversationId: string, text: string): void {
    if (!conversationId || !text.trim()) return;
    this.connect();
    this.socket?.emit('send_message', {
      conversation_id: conversationId,
      text,
    });
  }

  onNewMessage(): Observable<ApiMessage> {
    return new Observable<ApiMessage>((observer) => {
      this.connect();
      const handler = (message: ApiMessage) => observer.next(message);
      this.socket?.on('new_message', handler);

      return () => {
        this.socket?.off('new_message', handler);
      };
    });
  }

  onError(): Observable<string> {
    return new Observable<string>((observer) => {
      this.connect();
      const handler = (payload: { error?: string }) => {
        observer.next(payload?.error || 'Chat error');
      };
      this.socket?.on('chat_error', handler);

      return () => {
        this.socket?.off('chat_error', handler);
      };
    });
  }
}
