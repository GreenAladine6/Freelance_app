import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, IonicModule],
    template: `
    <ion-content class="not-found-content">
      <div class="container">
        <div class="icon-circle">
          <ion-icon name="alert-circle-outline"></ion-icon>
        </div>
        <h1 class="title">404</h1>
        <h2 class="subtitle">Page Not Found</h2>
        <p class="description">Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.</p>
        
        <button class="back-btn" (click)="goHome()">
          <ion-icon name="home-outline"></ion-icon>
          Go Back Home
        </button>
      </div>
    </ion-content>
  `,
    styles: [`
    .not-found-content { --background: #F9FAFB; }
    .container { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px; text-align: center; }
    
    .icon-circle { width: 96px; height: 96px; background: #F3E8FF; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
    .icon-circle ion-icon { font-size: 48px; color: #8B5CF6; }
    
    .title { font-size: 72px; font-weight: 800; color: #111827; margin: 0 0 8px; line-height: 1; text-shadow: 2px 2px 4px rgba(0,0,0,0.05); }
    .subtitle { font-size: 24px; font-weight: 700; color: #374151; margin: 0 0 16px; }
    
    .description { font-size: 16px; color: #6B7280; line-height: 1.6; margin: 0 0 40px; }
    
    .back-btn { display: flex; align-items: center; gap: 8px; background: #8B5CF6; color: white; border: none; padding: 14px 28px; border-radius: 9999px; font-size: 16px; font-weight: 700; cursor: pointer; transition: background-color 0.2s, transform 0.2s; box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.3); }
    .back-btn:hover { background: #7C3AED; }
    .back-btn:active { transform: scale(0.95); }
  `]
})
export class NotFoundPage {
    constructor(private router: Router) { }

    goHome() {
        this.router.navigate(['/']);
    }
}
