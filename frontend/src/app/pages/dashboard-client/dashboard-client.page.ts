import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService, ApiUser, ApiJob } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

const CATEGORIES = ['Design', 'Development', 'Writing', 'Marketing', 'Video', 'Business'];

@Component({
  selector: 'app-dashboard-client',
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent],
  template: `
    <ion-content class="client-content">
      <div class="page-wrap">
        <!-- Header -->
        <header class="app-bar">
          <div class="user-row">
            <img src="https://i.pravatar.cc/150?u=client" class="avatar" (click)="router.navigate(['/profile-client'])" alt="Profile">
            <h2 class="greeting">Hi, {{firstName}} 👋</h2>
          </div>
          <div class="icons">
            <button class="icon-btn"><ion-icon name="search-outline"></ion-icon></button>
            <button class="icon-btn">
              <ion-icon name="notifications-outline"></ion-icon>
              <span class="dot"></span>
            </button>
          </div>
        </header>

        <!-- Hero Search -->
        <section class="hero-card">
          <h2>Find the perfect freelancer</h2>
          <p>Browse thousands of talented professionals</p>
          <div class="search-row">
            <ion-icon name="search-outline"></ion-icon>
            <input type="text" placeholder="What service are you looking for?">
          </div>
          <div class="chip-scroll">
            <button class="cat-chip" *ngFor="let c of categories" (click)="router.navigate(['/browse'])">{{c}}</button>
          </div>
        </section>

        <!-- Stats -->
        <section class="stats-row">
          <div class="stat-pill" *ngFor="let s of stats">
            <div class="pill-icon" [style.background]="s.bg">
              <ion-icon [name]="s.icon" [style.color]="s.color"></ion-icon>
            </div>
            <div>
              <p class="pill-val">{{loading ? '...' : s.value}}</p>
              <p class="pill-label">{{s.label}}</p>
            </div>
          </div>
        </section>

        <!-- Recommended Freelancers -->
        <section class="section">
          <div class="section-header">
            <h3>Recommended</h3>
            <button (click)="router.navigate(['/browse'])">See All</button>
          </div>
          <div class="freelancer-scroll">
            <div class="freelancer-card" *ngFor="let f of freelancers" (click)="router.navigate(['/freelancer-profile', f.id])">
              <img [src]="'https://i.pravatar.cc/150?u=' + f.id" [alt]="f.full_name || f.username">
              <p class="f-name">{{f.full_name || f.username}}</p>
              <p class="f-skill">{{(f.skills ? f.skills.split(',')[0] : 'Freelancer')}}</p>
              <div class="f-rating">
                <ion-icon name="star" class="star"></ion-icon>
                <span>5.0</span>
              </div>
              <p class="f-rate" *ngIf="f.hourly_rate">\${{f.hourly_rate}}/hr</p>
            </div>
            <div class="freelancer-card placeholder" *ngIf="freelancers.length === 0 && !loading">
              <p>No freelancers yet.</p>
            </div>
          </div>
        </section>

        <!-- Popular Services -->
        <section class="section">
          <h3 class="section-title">Popular Services</h3>
          <div class="services-grid">
            <div class="service-card" *ngFor="let s of services">
              <img [src]="s.img" [alt]="s.title">
              <div class="service-info">
                <p class="service-title">{{s.title}}</p>
                <p class="service-price">{{s.price}}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ion-content>

    <button class="fab" (click)="router.navigate(['/create-gig'])">
      <ion-icon name="add"></ion-icon>
    </button>
    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .client-content { --background: #F8F9FA; }
    .page-wrap { padding: 0 0 90px; max-width: 420px; margin: 0 auto; }
    .app-bar {
      background: white; padding: 12px 16px;
      display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .user-row { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #8B5CF620; cursor: pointer; object-fit: cover; }
    .greeting { font-size: 16px; font-weight: 700; color: #111827; margin: 0; }
    .icons { display: flex; gap: 4px; }
    .icon-btn { position: relative; background: none; border: none; padding: 8px; cursor: pointer; ion-icon { font-size: 22px; color: #6B7280; } }
    .dot { position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background: #EF4444; border-radius: 50%; border: 2px solid white; }
    .hero-card {
      background: linear-gradient(135deg, #8B5CF6, #6D28D9);
      margin: 16px; border-radius: 20px; padding: 20px;
      box-shadow: 0 8px 24px rgba(139,92,246,0.3);
      h2 { color: white; font-size: 18px; font-weight: 700; margin: 0 0 4px; }
      p { color: rgba(255,255,255,0.8); font-size: 13px; margin: 0 0 14px; }
    }
    .search-row {
      display: flex; align-items: center; gap: 8px;
      background: white; border-radius: 12px; padding: 10px 14px; margin-bottom: 12px;
      ion-icon { color: #9CA3AF; font-size: 16px; }
      input { flex: 1; border: none; outline: none; font-size: 13px; color: #374151; }
    }
    .chip-scroll { display: flex; gap: 8px; overflow-x: auto; }
    .cat-chip {
      white-space: nowrap; background: rgba(255,255,255,0.2); color: white;
      padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
      border: none; cursor: pointer;
    }
    .stats-row { display: flex; gap: 12px; overflow-x: auto; padding: 0 16px 8px; }
    .stat-pill { min-width: 130px; background: white; border-radius: 16px; padding: 14px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .pill-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; ion-icon { font-size: 18px; } }
    .pill-val { font-size: 18px; font-weight: 700; color: #111827; margin: 0; }
    .pill-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9CA3AF; margin: 0; }
    .section { padding: 8px 16px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
      h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #111827; margin: 0; }
      button { background: none; border: none; color: #8B5CF6; font-size: 12px; font-weight: 700; cursor: pointer; }
    }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #111827; margin: 0 0 12px; }
    .freelancer-scroll { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 4px; }
    .freelancer-card {
      min-width: 140px; background: white; border-radius: 16px; padding: 16px;
      display: flex; flex-direction: column; align-items: center; text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; margin-bottom: 8px; }
    }
    .freelancer-card.placeholder { justify-content: center; color: #9CA3AF; font-size: 12px; min-width: 160px; }
    .f-name { font-size: 13px; font-weight: 700; color: #111827; margin: 0 0 2px; }
    .f-skill { font-size: 10px; color: #9CA3AF; margin: 0 0 4px; }
    .f-rating { display: flex; align-items: center; gap: 3px; justify-content: center; .star { color: #FBBF24; font-size: 12px; } span { font-size: 11px; font-weight: 700; color: #374151; } }
    .f-rate { font-size: 12px; font-weight: 700; color: #8B5CF6; margin: 4px 0 0; }
    .services-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .service-card { background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); img { width: 100%; height: 80px; object-fit: cover; } }
    .service-info { padding: 10px; }
    .service-title { font-size: 11px; font-weight: 700; color: #111827; margin: 0 0 2px; }
    .service-price { font-size: 11px; font-weight: 700; color: #8B5CF6; margin: 0; }
    .fab {
      position: fixed; bottom: 80px; right: 20px; width: 52px; height: 52px;
      background: #8B5CF6; color: white; border: none; border-radius: 16px;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      box-shadow: 0 8px 20px rgba(139,92,246,0.4); z-index: 30; transition: transform 0.15s;
      ion-icon { font-size: 28px; }
    }
    .fab:active { transform: scale(0.93); }
  `]
})
export class DashboardClientPage implements OnInit {
  freelancers: ApiUser[] = [];
  myJobs: ApiJob[] = [];
  services: any[] = [];
  loading = false;
  categories = CATEGORIES;

  get firstName() { return this.roleService.userName.split(' ')[0]; }
  get stats() {
    return [
      { label: 'Active Projects', value: String(this.myJobs.filter(j => j.status === 'open').length), icon: 'folder-outline', color: '#3B82F6', bg: '#EFF6FF' },
      { label: 'Proposals', value: String(this.myJobs.reduce((s, j) => s + (j.application_count || 0), 0)), icon: 'document-text-outline', color: '#F59E0B', bg: '#FFFBEB' },
      { label: 'In Progress', value: String(this.myJobs.filter(j => j.status === 'in_progress').length), icon: 'wallet-outline', color: '#10B981', bg: '#ECFDF5' },
    ];
  }

  constructor(public router: Router, public roleService: RoleService, private api: ApiService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    Promise.all([
      this.api.getFreelancers().toPromise().then(fl => { this.freelancers = (fl || []).slice(0, 5); }).catch(() => { }),
      this.api.getMyJobs().toPromise().then(jobs => { this.myJobs = jobs || []; }).catch(() => { }),
      this.api.getProducts().toPromise().then(prods => {
        this.services = (prods || []).slice(0, 4).map(p => ({
          title: p.name,
          price: 'from $' + p.price,
          img: p.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300'
        }));
      }).catch(() => { })
    ]).finally(() => { this.loading = false; });
  }
}
