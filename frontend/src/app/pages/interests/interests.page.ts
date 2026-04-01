import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-interests',
    standalone: true,
    imports: [CommonModule, IonicModule],
    template: `
    <ion-content class="interests-content">
      <div class="interests-container">
        <div class="logo-badge">
          <ion-icon name="briefcase"></ion-icon>
          <span>FreelanceHub</span>
        </div>

        <div class="hero-section">
          <h1 class="hero-title">Where Talent<br>Meets Opportunity</h1>
          <p class="hero-sub">Join thousands of freelancers and clients building the future together.</p>
        </div>

        <div class="features">
          <div class="feature-item" *ngFor="let f of features">
            <div class="feature-icon">
              <ion-icon [name]="f.icon"></ion-icon>
            </div>
            <div>
              <p class="feature-title">{{f.title}}</p>
              <p class="feature-desc">{{f.desc}}</p>
            </div>
          </div>
        </div>

        <div class="cta-section">
          <button class="btn-primary" (click)="goSignUp()">Get Started</button>
          <button class="btn-secondary" (click)="goLogin()">I already have an account</button>
          <button class="btn-ghost" (click)="goBrowse()">Browse as guest →</button>
        </div>
      </div>
    </ion-content>
  `,
    styles: [`
    .interests-content { --background: #fff; }
    .interests-container {
      padding: 48px 24px 32px;
      display: flex; flex-direction: column; gap: 32px; min-height: 100%;
    }
    .logo-badge {
      display: flex; align-items: center; gap: 8px;
      ion-icon { font-size: 24px; color: #8B5CF6; }
      span { font-size: 18px; font-weight: 700; color: #8B5CF6; }
    }
    .hero-section { margin-top: 8px; }
    .hero-title { font-size: 36px; font-weight: 800; color: #111827; line-height: 1.15; margin: 0 0 12px; }
    .hero-sub { font-size: 15px; color: #6B7280; margin: 0; line-height: 1.6; }
    .features { display: flex; flex-direction: column; gap: 16px; }
    .feature-item { display: flex; align-items: center; gap: 14px; }
    .feature-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: #F5F3FF; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      ion-icon { font-size: 22px; color: #8B5CF6; }
    }
    .feature-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 2px; }
    .feature-desc { font-size: 12px; color: #6B7280; margin: 0; }
    .cta-section { display: flex; flex-direction: column; gap: 12px; margin-top: auto; }
    .btn-primary {
      width: 100%; padding: 16px; background: #8B5CF6; color: white;
      border-radius: 24px; font-size: 16px; font-weight: 700; border: none; cursor: pointer;
      box-shadow: 0 8px 24px rgba(139,92,246,0.35);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .btn-primary:active { transform: scale(0.97); }
    .btn-secondary {
      width: 100%; padding: 14px; background: transparent; color: #374151;
      border-radius: 24px; font-size: 15px; font-weight: 600;
      border: 2px solid #E5E7EB; cursor: pointer;
      transition: border-color 0.2s;
    }
    .btn-secondary:hover { border-color: #8B5CF6; color: #8B5CF6; }
    .btn-ghost {
      background: none; border: none; color: #8B5CF6;
      font-size: 14px; font-weight: 600; cursor: pointer; padding: 8px;
    }
  `]
})
export class InterestsPage {
    features = [
        { icon: 'briefcase-outline', title: 'Find Quality Work', desc: 'Browse hundreds of gigs matching your skills' },
        { icon: 'people-outline', title: 'Hire Top Talent', desc: 'Post jobs and get proposals from experts' },
        { icon: 'shield-checkmark-outline', title: 'Safe & Secure', desc: 'Verified profiles, secure payments' },
    ];

    constructor(private router: Router) { }

    goSignUp() { this.router.navigate(['/signup']); }
    goLogin() { this.router.navigate(['/login']); }
    goBrowse() { this.router.navigate(['/browse']); }
}
