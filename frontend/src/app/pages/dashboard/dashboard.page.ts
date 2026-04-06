import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService, ApiApplication } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, IonicModule, BottomNavComponent],
    template: `
    <ion-content class="dashboard-content">
      <div class="page-wrap">
        <!-- Header -->
        <header class="app-bar">
          <div class="user-info" (click)="router.navigate(['/freelancer-profile'])">
            <img src="https://i.pravatar.cc/150?u=me" class="avatar" alt="Profile">
            <div>
              <p class="welcome-text">Welcome back,</p>
              <h2 class="user-name">{{roleService.userName}}</h2>
            </div>
          </div>
          <button class="notif-btn">
            <ion-icon name="notifications-outline"></ion-icon>
            <span class="notif-dot"></span>
          </button>
        </header>

        <!-- Stats Grid -->
        <section class="stats-grid">
          <div class="stat-card" *ngFor="let s of stats">
            <div class="stat-icon" [style.background]="s.bg">
              <ion-icon [name]="s.icon" [style.color]="s.color"></ion-icon>
            </div>
            <p class="stat-value">{{loading ? '...' : s.value}}</p>
            <p class="stat-label">{{s.label}}</p>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="section">
          <h3 class="section-title">Quick Actions</h3>
          <div class="chip-row">
            <button class="chip filled" (click)="router.navigate(['/create-gig'])">Create New Gig</button>
            <button class="chip" (click)="router.navigate(['/browse'])">Browse Projects</button>
            <button class="chip" (click)="router.navigate(['/gigs'])">My Gigs</button>
            <button class="chip" (click)="router.navigate(['/freelancer-profile'])">Portfolio</button>
          </div>
        </section>

        <!-- Recent Applications -->
        <section class="section">
          <div class="section-header">
            <h3 class="section-title">My Applications</h3>
            <button class="see-all" (click)="router.navigate(['/gigs'])">See All</button>
          </div>
          <div class="activity-list" *ngIf="apps.length > 0">
            <div class="activity-item" *ngFor="let a of apps.slice(0, 4)">
              <div class="activity-icon" [class]="a.statusClass">
                <ion-icon [name]="a.icon"></ion-icon>
              </div>
              <div class="activity-body">
                <p class="activity-text">{{a.text}}</p>
                <p class="activity-time">{{a.time}}</p>
              </div>
            </div>
          </div>
          <div class="empty-state" *ngIf="apps.length === 0 && !loading">
            <p>No applications yet.</p>
            <button (click)="router.navigate(['/browse'])">Browse Now →</button>
          </div>
        </section>
      </div>
    </ion-content>
    <app-bottom-nav></app-bottom-nav>
  `,
    styles: [`
    .dashboard-content { --background: #F5F5F5; }
    .page-wrap { padding: 0 0 80px; max-width: 420px; margin: 0 auto; }
    .app-bar {
      background: white; padding: 16px;
      display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .user-info { display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; border: 2px solid #8B5CF620; object-fit: cover; }
    .welcome-text { font-size: 11px; color: #9CA3AF; margin: 0; font-weight: 500; }
    .user-name { font-size: 15px; font-weight: 700; color: #111827; margin: 0; }
    .notif-btn {
      position: relative; background: none; border: none; padding: 8px; cursor: pointer;
      ion-icon { font-size: 24px; color: #6B7280; }
    }
    .notif-dot {
      position: absolute; top: 8px; right: 8px; width: 8px; height: 8px;
      background: #EF4444; border-radius: 50%; border: 2px solid white;
    }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px; }
    .stat-card {
      background: white; border-radius: 16px; padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .stat-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; margin-bottom: 10px;
      ion-icon { font-size: 20px; }
    }
    .stat-value { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 2px; }
    .stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9CA3AF; margin: 0; }
    .section { padding: 0 16px 8px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #111827; margin: 0 0 12px; }
    .see-all { background: none; border: none; color: #8B5CF6; font-size: 12px; font-weight: 700; cursor: pointer; }
    .chip-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
    .chip {
      white-space: nowrap; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 700;
      background: white; color: #374151; border: 1px solid #E5E7EB; cursor: pointer; transition: all 0.15s;
    }
    .chip.filled { background: #8B5CF6; color: white; border-color: #8B5CF6; }
    .activity-list { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .activity-item {
      display: flex; align-items: center; gap: 14px; padding: 14px 16px;
      border-bottom: 1px solid #F9FAFB;
    }
    .activity-item:last-child { border-bottom: none; }
    .activity-icon {
      width: 36px; height: 36px; border-radius: 50%; background: #F9FAFB;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      ion-icon { font-size: 16px; }
    }
    .activity-icon.success ion-icon { color: #10B981; }
    .activity-icon.pending ion-icon { color: #F59E0B; }
    .activity-icon.danger ion-icon { color: #EF4444; }
    .activity-body { flex: 1; min-width: 0; }
    .activity-text { font-size: 12px; font-weight: 500; color: #374151; margin: 0 0 2px; }
    .activity-time { font-size: 10px; font-weight: 700; color: #9CA3AF; margin: 0; }
    .empty-state { background: white; border-radius: 16px; padding: 32px; text-align: center;
      p { font-size: 13px; color: #9CA3AF; margin: 0 0 12px; }
      button { background: none; border: none; color: #8B5CF6; font-weight: 700; cursor: pointer; font-size: 13px; }
    }
  `]
})
export class DashboardPage implements OnInit {
    applications: ApiApplication[] = [];
    loading = false;
    apps: any[] = [];

    get stats() {
        const apps = this.applications;
        return [
            { label: 'Active Gigs', value: String(apps.filter(a => a.status === 'accepted').length), icon: 'briefcase-outline', color: '#8B5CF6', bg: '#F5F3FF' },
            { label: 'Pending', value: String(apps.filter(a => a.status === 'pending').length), icon: 'time-outline', color: '#F59E0B', bg: '#FFFBEB' },
            { label: 'Total Applied', value: String(apps.length), icon: 'trending-up-outline', color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'Earnings', value: '$0', icon: 'cash-outline', color: '#10B981', bg: '#ECFDF5' },
        ];
    }

    constructor(public router: Router, public roleService: RoleService, private api: ApiService) { }

    ngOnInit() { this.loadApps(); }

    loadApps() {
        if (!this.roleService.accessToken) return;
        this.loading = true;
        this.api.getMyApplications().subscribe({
            next: data => {
                this.applications = data;
                this.apps = data.slice(0, 4).map(a => ({
                    text: `Application ${a.status === 'pending' ? 'pending review' : a.status} — Job ${a.job_id.slice(-6)}`,
                    time: a.created_at ? new Date(a.created_at).toLocaleDateString() : '',
                    icon: a.status === 'accepted' ? 'checkmark-circle-outline' : a.status === 'pending' ? 'time-outline' : 'close-circle-outline',
                    statusClass: a.status === 'accepted' ? 'success' : a.status === 'pending' ? 'pending' : 'danger'
                }));
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }
}
