import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ApiService, ApiApplication, ApiJob } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { NotificationBadgeComponent } from '../../components/notification-badge/notification-badge.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule, BottomNavComponent, NotificationBadgeComponent],
    template: `
    <ion-content class="dashboard-content">
      <div class="page-wrap">
        <header class="app-bar">
          <div class="user-info" (click)="router.navigate(['/freelancer-profile'])">
            <img [src]="currentAvatar" class="avatar" alt="Profile">
            <div>
              <p class="welcome-text">Freelancer workspace</p>
              <h2 class="user-name">{{roleService.userName}}</h2>
            </div>
          </div>
          <div class="header-actions">
            <button class="refresh-btn" (click)="refresh()" [disabled]="loading" aria-label="Refresh dashboard">
              <ion-icon name="refresh-outline"></ion-icon>
            </button>
            <app-notification-badge></app-notification-badge>
          </div>
        </header>

        <section class="stats-grid">
          <div class="stat-card" *ngFor="let s of stats">
            <div class="stat-icon" [style.background]="s.bg">
              <ion-icon [name]="s.icon" [style.color]="s.color"></ion-icon>
            </div>
            <p class="stat-value">{{loading ? '...' : s.value}}</p>
            <p class="stat-label">{{s.label}}</p>
          </div>
        </section>

        <section class="section insights">
          <div class="section-header">
            <h3 class="section-title">Performance Snapshot</h3>
          </div>
          <div class="insight-card">
            <div class="insight-row">
              <span>Accepted</span>
              <strong>{{ acceptedCount }}</strong>
            </div>
            <ion-progress-bar [value]="acceptedRatio" color="success"></ion-progress-bar>

            <div class="insight-row">
              <span>Pending</span>
              <strong>{{ pendingCount }}</strong>
            </div>
            <ion-progress-bar [value]="pendingRatio" color="warning"></ion-progress-bar>

            <div class="insight-row">
              <span>Rejected</span>
              <strong>{{ rejectedCount }}</strong>
            </div>
            <ion-progress-bar [value]="rejectedRatio" color="danger"></ion-progress-bar>

            <p class="insight-note">Acceptance rate: <strong>{{ acceptanceRate }}%</strong></p>
          </div>
        </section>

        <section class="section">
          <div class="section-header">
            <h3 class="section-title">Recommended for You</h3>
            <button class="see-all" (click)="router.navigate(['/browse'])">See All</button>
          </div>
          <div class="project-scroll" *ngIf="recommendedProjects.length > 0; else noRecommended">
            <article class="project-card" *ngFor="let p of recommendedProjects" (click)="router.navigate(['/browse'])">
              <div class="project-top">
                <p class="project-title">{{ p.title }}</p>
                <span class="badge" [class]="p.status">{{ formatStatus(p.status) }}</span>
              </div>
              <p class="project-meta">{{ p.client_name || 'Client' }} · {{ p.budget ? ('$' + p.budget) : 'Budget TBD' }}</p>
              <p class="project-skills" *ngIf="p.skills_required">{{ p.skills_required }}</p>
            </article>
          </div>
          <ng-template #noRecommended>
            <div class="empty-state compact">
              <p>{{ loading ? 'Loading recommendations...' : 'No personalized recommendations yet.' }}</p>
            </div>
          </ng-template>
        </section>

        <section class="section discover">
          <div class="section-header">
            <h3 class="section-title">Find Projects</h3>
            <button class="see-all" (click)="router.navigate(['/browse'])">Browse</button>
          </div>
          <div class="search-wrap">
            <ion-icon name="search-outline"></ion-icon>
            <input
              [(ngModel)]="projectSearch"
              (input)="filterProjects()"
              type="text"
              placeholder="Search title or skills">
          </div>
          <div class="status-chips">
            <button class="status-chip" [class.active]="projectFilter === 'all'" (click)="setProjectFilter('all')">All</button>
            <button class="status-chip" [class.active]="projectFilter === 'open'" (click)="setProjectFilter('open')">Open</button>
            <button class="status-chip" [class.active]="projectFilter === 'in_progress'" (click)="setProjectFilter('in_progress')">In Progress</button>
          </div>
          <div class="project-scroll" *ngIf="filteredProjects.length > 0; else noProjects">
            <article class="project-card" *ngFor="let p of filteredProjects" (click)="router.navigate(['/browse'])">
              <div class="project-top">
                <p class="project-title">{{ p.title }}</p>
                <span class="badge" [class]="p.status">{{ formatStatus(p.status) }}</span>
              </div>
              <p class="project-meta">{{ p.client_name || 'Client' }} · {{ p.budget ? ('$' + p.budget) : 'Budget TBD' }}</p>
              <p class="project-skills" *ngIf="p.skills_required">{{ p.skills_required }}</p>
            </article>
          </div>
          <ng-template #noProjects>
            <div class="empty-state compact">
              <p>{{ loading ? 'Loading projects...' : 'No projects match your search.' }}</p>
            </div>
          </ng-template>
        </section>

        <section class="section">
          <h3 class="section-title">Quick Actions</h3>
          <div class="chip-row">
            <button class="chip filled" (click)="router.navigate(['/create-gig'])">Create New Gig</button>
            <button class="chip" (click)="router.navigate(['/browse'])">Browse Projects</button>
            <button class="chip" (click)="router.navigate(['/gigs'])">My Gigs</button>
            <button class="chip" (click)="router.navigate(['/freelancer-profile'])">Portfolio</button>
          </div>
        </section>

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
    .dashboard-content {
      --background:
        radial-gradient(circle at top, rgba(139, 92, 246, 0.12), transparent 28%),
        linear-gradient(180deg, #f8fafc 0%, #f3f4f6 100%);
    }
    .page-wrap { padding: 0 0 80px; max-width: 420px; margin: 0 auto; }
    .app-bar {
      background: rgba(255,255,255,0.96); padding: 16px;
      display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .user-info { display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; border: 2px solid #8B5CF620; object-fit: cover; }
    .welcome-text { font-size: 11px; color: #9CA3AF; margin: 0; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; }
    .user-name { font-size: 15px; font-weight: 700; color: #111827; margin: 0; }
    .header-actions { display: flex; align-items: center; gap: 4px; }
    .refresh-btn {
      border: none; background: transparent; padding: 8px; border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      ion-icon { font-size: 22px; color: #6B7280; }
    }
    .refresh-btn:disabled { opacity: 0.5; }
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
    .insights { padding-top: 0; }
    .insight-card {
      background: white;
      border-radius: 14px;
      border: 1px solid #E5E7EB;
      padding: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .insight-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 2px 0 4px;
      font-size: 12px;
      color: #4B5563;
      font-weight: 700;
    }
    .insight-row strong { color: #111827; }
    .insight-card ion-progress-bar { --background: #E5E7EB; height: 7px; border-radius: 999px; margin-bottom: 8px; }
    .insight-note { margin: 4px 0 0; font-size: 12px; color: #6B7280; }
    .insight-note strong { color: #8B5CF6; }
    .discover { padding-top: 0; }
    .search-wrap {
      background: white; border: 1px solid #E5E7EB; border-radius: 14px; height: 44px;
      display: flex; align-items: center; gap: 8px; padding: 0 12px; margin-bottom: 10px;
      ion-icon { color: #9CA3AF; }
      input { border: none; outline: none; width: 100%; font-size: 13px; color: #111827; background: transparent; }
    }
    .status-chips { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 10px; }
    .status-chip {
      border: 1px solid #E5E7EB; background: #fff; color: #374151;
      font-size: 11px; font-weight: 700; border-radius: 999px; padding: 7px 12px;
    }
    .status-chip.active { background: #EEF2FF; border-color: #C7D2FE; color: #4338CA; }
    .project-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 2px; }
    .project-card {
      min-width: 220px; background: white; border-radius: 14px; padding: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .project-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
    .project-title { margin: 0; font-size: 13px; font-weight: 700; color: #111827; }
    .badge {
      font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px;
      padding: 4px 8px; border-radius: 999px;
    }
    .badge.open { background: #EFF6FF; color: #1D4ED8; }
    .badge.in_progress { background: #ECFDF5; color: #059669; }
    .badge.completed { background: #F3F4F6; color: #374151; }
    .project-meta { margin: 0; font-size: 11px; color: #6B7280; }
    .project-skills { margin: 6px 0 0; font-size: 11px; color: #4B5563; }
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
    .empty-state.compact { padding: 18px; }
  `]
})
export class DashboardPage implements OnInit {
    applications: ApiApplication[] = [];
    openProjects: ApiJob[] = [];
  recommendedProjects: ApiJob[] = [];
    filteredProjects: ApiJob[] = [];
    loading = false;
    apps: any[] = [];
    projectSearch = '';
    projectFilter: 'all' | 'open' | 'in_progress' = 'all';

  get currentAvatar() {
      return this.roleService.user?.avatar_url || this.api.defaultAvatarUrl;
  }

    get stats() {
        const apps = this.applications;
        return [
            { label: 'Active Gigs', value: String(apps.filter(a => a.status === 'accepted').length), icon: 'briefcase-outline', color: '#8B5CF6', bg: '#F5F3FF' },
            { label: 'Pending', value: String(apps.filter(a => a.status === 'pending').length), icon: 'time-outline', color: '#F59E0B', bg: '#FFFBEB' },
            { label: 'Total Applied', value: String(apps.length), icon: 'trending-up-outline', color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'Earnings', value: '$0', icon: 'cash-outline', color: '#10B981', bg: '#ECFDF5' },
        ];
    }

    get acceptedCount() {
      return this.applications.filter(a => a.status === 'accepted').length;
    }

    get pendingCount() {
      return this.applications.filter(a => a.status === 'pending').length;
    }

    get rejectedCount() {
      return this.applications.filter(a => a.status === 'rejected').length;
    }

    get acceptedRatio() {
      return this.safeRatio(this.acceptedCount, this.applications.length);
    }

    get pendingRatio() {
      return this.safeRatio(this.pendingCount, this.applications.length);
    }

    get rejectedRatio() {
      return this.safeRatio(this.rejectedCount, this.applications.length);
    }

    get acceptanceRate() {
      return Math.round(this.acceptedRatio * 100);
    }

    constructor(public router: Router, public roleService: RoleService, private api: ApiService) { }

    ngOnInit() { this.loadDashboard(); }

    async loadDashboard() {
        if (!this.roleService.accessToken) return;
        this.loading = true;
      try {
        const skillsQuery = this.roleService.user?.skills?.split(',')[0]?.trim();
        const [myApps, openJobs] = await Promise.all([
          firstValueFrom(this.api.getMyApplications()),
          firstValueFrom(this.api.getJobs({ status: 'open' }))
        ]);

        const recommended = await firstValueFrom(this.api.getJobs({ status: 'open', skills: skillsQuery || undefined }));

        this.applications = myApps || [];
        this.apps = this.applications.slice(0, 4).map(a => ({
          text: `Application ${a.status === 'pending' ? 'pending review' : a.status} — Job ${a.job_id.slice(-6)}`,
          time: a.created_at ? new Date(a.created_at).toLocaleDateString() : '',
          icon: a.status === 'accepted' ? 'checkmark-circle-outline' : a.status === 'pending' ? 'time-outline' : 'close-circle-outline',
          statusClass: a.status === 'accepted' ? 'success' : a.status === 'pending' ? 'pending' : 'danger'
        }));

        this.openProjects = (openJobs || []).slice(0, 12);
        this.recommendedProjects = (recommended || []).slice(0, 8);
        this.filterProjects();
      } finally {
        this.loading = false;
      }
    }

    refresh() {
      if (!this.loading) {
        void this.loadDashboard();
      }
    }

    setProjectFilter(filter: 'all' | 'open' | 'in_progress') {
      this.projectFilter = filter;
      this.filterProjects();
    }

    filterProjects() {
      const query = this.projectSearch.trim().toLowerCase();
      this.filteredProjects = this.openProjects.filter(project => {
        const haystack = [project.title, project.skills_required, project.description].filter(Boolean).join(' ').toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const matchesStatus = this.projectFilter === 'all' || project.status === this.projectFilter;
        return matchesQuery && matchesStatus;
      }).slice(0, 8);
    }

    formatStatus(status: string) {
      return (status || 'open').replace(/_/g, ' ');
    }

    private safeRatio(value: number, total: number) {
      if (!total) {
        return 0;
      }

      return Math.min(1, value / total);
    }
}
