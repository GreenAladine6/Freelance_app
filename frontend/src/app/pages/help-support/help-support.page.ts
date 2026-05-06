import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-help-support',
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent],
  template: `
    <ion-content class="help-content">
      <div class="page-wrap">
        <header class="hero">
          <ion-button fill="clear" color="light" (click)="router.navigate(['/profile-client'])" class="back-btn">
            <ion-icon name="arrow-back"></ion-icon>
          </ion-button>
          <p class="kicker">Support Center</p>
          <h1>Help & Support</h1>
          <p class="hero-sub">Contact the admin team directly for account, payment, and platform issues.</p>
        </header>

        <section class="section-card">
          <h2>Admin Contact</h2>
          <a class="contact-item" [href]="'mailto:' + admin.email">
            <ion-icon name="mail-outline"></ion-icon>
            <div>
              <p>Email</p>
              <strong>{{ admin.email }}</strong>
            </div>
          </a>
          <a class="contact-item" [href]="'tel:' + admin.phoneRaw">
            <ion-icon name="call-outline"></ion-icon>
            <div>
              <p>Phone</p>
              <strong>{{ admin.phone }}</strong>
            </div>
          </a>
          <a class="contact-item" [href]="'https://wa.me/' + admin.whatsapp" target="_blank" rel="noopener noreferrer">
            <ion-icon name="logo-whatsapp"></ion-icon>
            <div>
              <p>WhatsApp</p>
              <strong>Chat with admin</strong>
            </div>
          </a>
        </section>

        <section class="section-card">
          <h2>Support Hours</h2>
          <div class="hours-row">
            <ion-icon name="time-outline"></ion-icon>
            <strong>{{ admin.hours }}</strong>
          </div>
          <p class="note">Average response time: under 2 hours during business hours.</p>
        </section>
      </div>
    </ion-content>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .help-content {
      --background:
        radial-gradient(circle at top, rgba(15, 109, 148, 0.16), transparent 28%),
        linear-gradient(180deg, #f4f8fb 0%, #eef4f6 100%);
    }
    .page-wrap { max-width: 430px; margin: 0 auto; padding: 12px 16px 96px; }
    .hero {
      border-radius: 24px;
      padding: 16px;
      background: linear-gradient(135deg, #0f6d94, #148469);
      color: white;
      box-shadow: 0 14px 28px rgba(15, 109, 148, 0.25);
      margin-bottom: 14px;
      position: relative;
    }
    .back-btn { margin-left: -8px; --color: white; }
    .kicker {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 11px;
      font-weight: 800;
      opacity: 0.9;
    }
    .hero h1 { margin: 6px 0; font-size: 24px; font-weight: 800; }
    .hero-sub { margin: 0; font-size: 13px; opacity: 0.92; line-height: 1.45; }

    .section-card {
      background: white;
      border-radius: 16px;
      border: 1px solid #e6eef2;
      box-shadow: 0 8px 20px rgba(17, 38, 56, 0.08);
      padding: 16px;
      margin-bottom: 12px;
    }
    .section-card h2 {
      margin: 0 0 12px;
      font-size: 15px;
      font-weight: 800;
      color: #122531;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      background: #f7fbfd;
      border: 1px solid #dce8ef;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 10px;
      color: #1f3a4b;
    }
    .contact-item:last-child { margin-bottom: 0; }
    .contact-item ion-icon { font-size: 20px; color: #0f6d94; }
    .contact-item p { margin: 0; font-size: 11px; color: #61727f; font-weight: 700; }
    .contact-item strong { font-size: 13px; color: #122531; }

    .hours-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #1f3a4b;
      margin-bottom: 8px;
    }
    .hours-row ion-icon { font-size: 18px; color: #148469; }
    .note { margin: 0; font-size: 12px; color: #61727f; }
  `]
})
export class HelpSupportPage {
  admin = {
    email: 'dourayedg@gmail.com',
    phone: '+216 99315348',
    phoneRaw: '+21699315348',
    whatsapp: '21699315348',
    hours: 'Mon-Sat, 09:00-19:00'
  };

  constructor(public router: Router) { }
}
