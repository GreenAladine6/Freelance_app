import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService, AdminStats } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { NotificationBadgeComponent } from '../../components/notification-badge/notification-badge.component';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, BottomNavComponent, NotificationBadgeComponent],
  template: `
    <ion-content class="admin-content">
      <div class="glass-header">
        <div class="header-top">
          <div class="header-titles">
            <span class="welcome-text">FREELANCEHUB ADMIN</span>
            <h1 class="dashboard-title">Dashboard</h1>
          </div>
          <div class="header-actions">
            <app-notification-badge></app-notification-badge>
            <div class="admin-avatar">AD</div>
          </div>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- OVERVIEW SEGMENT -->
        <div *ngIf="segment === 'overview'" class="fade-in">
          <!-- Main Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card purple">
              <div class="stat-icon-wrap">
                <ion-icon name="people"></ion-icon>
              </div>
              <div class="stat-info">
                <h3>{{stats?.total_users || 0}}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div class="stat-card blue">
              <div class="stat-icon-wrap">
                <ion-icon name="briefcase"></ion-icon>
              </div>
              <div class="stat-info">
                <h3>{{stats?.open_jobs || 0}}</h3>
                <p>Open Jobs</p>
              </div>
            </div>
          </div>

          <!-- Secondary Stats -->
          <div class="stats-grid mini">
            <div class="stat-card-mini">
              <span class="mini-val">{{stats?.freelancers || 0}}</span>
              <span class="mini-lbl">Freelancers</span>
            </div>
            <div class="stat-card-mini">
              <span class="mini-val">{{stats?.clients || 0}}</span>
              <span class="mini-lbl">Clients</span>
            </div>
            <div class="stat-card-mini">
              <span class="mini-val">{{stats?.total_applications || 0}}</span>
              <span class="mini-lbl">Applications</span>
            </div>
          </div>

          <!-- Analytics & Logs Section -->
          <div class="section-header">
            <h2>Recent Activity</h2>
            <ion-button fill="clear" size="small" (click)="loadLogs()">Refresh</ion-button>
          </div>

          <div class="logs-container">
            <div *ngIf="logs.length === 0" class="empty-state">
              <ion-icon name="list-outline"></ion-icon>
              <p>No recent activity logs found</p>
            </div>
            <div class="log-item" *ngFor="let log of logs">
              <div class="log-indicator" [class.success]="log.action.includes('Approve')" [class.danger]="log.action.includes('Delete')"></div>
              <div class="log-content">
                <p class="log-action">{{log.action}}</p>
                <div class="log-meta">
                  <span><ion-icon name="time-outline"></ion-icon> {{formatDate(log.created_at)}}</span>
                  <span *ngIf="log.details" class="log-details">{{log.details}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MANAGEMENT SEGMENT -->
        <div *ngIf="segment === 'management'" class="fade-in">
          <div class="management-grid">
            <div class="manage-item" *ngFor="let action of adminActions" (click)="goToAdminAction(action)">
              <div class="manage-icon" [style.background]="action.color">
                <ion-icon [name]="action.icon"></ion-icon>
              </div>
              <h3>{{action.title}}</h3>
              <p>{{action.description}}</p>
              <ion-button fill="clear" color="primary" (click)="goToAdminAction(action); $event.stopPropagation()">Access <ion-icon name="chevron-forward-outline" slot="end"></ion-icon></ion-button>
            </div>
          </div>
        </div>

        <!-- MODERATION SEGMENT -->
        <div *ngIf="segment === 'moderation'" class="fade-in">
          <ion-segment [(ngModel)]="moderateTab" mode="ios" class="sub-segment">
            <ion-segment-button value="reports">
              <ion-label>Reports ({{reports.length}})</ion-label>
            </ion-segment-button>
            <ion-segment-button value="pending">
              <ion-label>Approvals ({{pendingJobs.length + pendingProducts.length}})</ion-label>
            </ion-segment-button>
          </ion-segment>

          <!-- Reports Tab -->
          <div *ngIf="moderateTab === 'reports'">
            <div *ngIf="reports.length === 0" class="empty-state">
              <div class="success-icon"><ion-icon name="checkmark-done-circle"></ion-icon></div>
              <h3>No Pending Reports</h3>
            </div>
            <ion-card class="report-card" *ngFor="let report of reports">
              <ion-card-header>
                <div class="report-header">
                  <ion-badge [color]="report.target_type === 'user' ? 'primary' : 'warning'">{{report.target_type}}</ion-badge>
                  <span class="report-date">{{formatDate(report.created_at)}}</span>
                </div>
                <ion-card-title>Reason: {{report.reason}}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Reported ID: <code class="id-tag">{{report.target_id}}</code></p>
                <div class="report-actions">
                  <ion-button size="small" fill="outline" color="medium" (click)="handleReport(report.id, 'dismissed')">Dismiss</ion-button>
                  <ion-button size="small" color="danger" (click)="handleReport(report.id, 'resolved')">Resolve</ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          </div>

          <!-- Pending Approvals Tab -->
          <div *ngIf="moderateTab === 'pending'">
            <div *ngIf="pendingJobs.length === 0 && pendingProducts.length === 0" class="empty-state">
              <div class="success-icon"><ion-icon name="thumbs-up-outline"></ion-icon></div>
              <h3>No Pending Approvals</h3>
            </div>

            <!-- Pending Jobs -->
            <div class="section-header" *ngIf="pendingJobs.length > 0">
              <h2>Pending Jobs</h2>
            </div>
            <ion-card class="content-card" *ngFor="let job of pendingJobs">
              <img *ngIf="job.image_url" [src]="job.image_url" class="card-img" />
              <ion-card-header>
                <ion-card-title>{{job.title}}</ion-card-title>
                <ion-card-subtitle>Budget: {{job.budget}} | By: {{job.client_name}}</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <p class="description">{{job.description}}</p>
                <div class="report-actions">
                  <ion-button size="small" fill="outline" color="danger" (click)="reject('job', job.id)">Reject</ion-button>
                  <ion-button size="small" color="success" (click)="approve('job', job.id)">Approve</ion-button>
                </div>
              </ion-card-content>
            </ion-card>

            <!-- Pending Products -->
            <div class="section-header" *ngIf="pendingProducts.length > 0">
              <h2>Pending Gigs</h2>
            </div>
            <ion-card class="content-card" *ngFor="let prod of pendingProducts">
              <img *ngIf="prod.image_url" [src]="prod.image_url" class="card-img" />
              <ion-card-header>
                <ion-card-title>{{prod.name}}</ion-card-title>
                <ion-card-subtitle>Price: {{prod.price}}$</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <p class="description">{{prod.description}}</p>
                <div class="report-actions">
                  <ion-button size="small" fill="outline" color="danger" (click)="reject('product', prod.id)">Reject</ion-button>
                  <ion-button size="small" color="success" (click)="approve('product', prod.id)">Approve</ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          </div>
        </div>

        <!-- ANALYTICS SEGMENT -->
        <div *ngIf="segment === 'analytics'" class="fade-in">
          <div class="analytics-card">
            <div class="chart-header">
              <h3>User Growth</h3>
              <p>Weekly registration trend</p>
            </div>
            <div class="bar-chart">
              <div class="bar-wrapper" *ngFor="let val of analytics?.user_growth; let i = index">
                <div class="bar-fill" [style.height.%]="(val / 150) * 100"></div>
                <span class="bar-label">W{{i+1}}</span>
              </div>
            </div>
          </div>

          <div class="analytics-grid">
            <div class="mini-analytic">
              <h4>Project Completion</h4>
              <div class="circle-chart">84%</div>
            </div>
            <div class="mini-analytic">
              <h4>Platform Health</h4>
              <div class="circle-chart green">99%</div>
            </div>
          </div>

          <div class="section-header">
            <h2>Top Skills</h2>
          </div>
          <div class="skills-list">
            <div class="skill-item" *ngFor="let s of analytics?.top_skills">
              <div class="skill-info">
                <span class="skill-name">{{s.skill}}</span>
                <span class="skill-count">{{s.count}} users</span>
              </div>
              <div class="skill-bar">
                <div class="skill-progress" [style.width.%]="(s.count / 50) * 100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bottom-padding"></div>
    </ion-content>
    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    :host {
      --primary-purple: #7B2FBE;
      --light-purple: #9B59D0;
      --bg-color: #F8FAFC;
      --text-dark: #1E293B;
      --text-muted: #64748B;
    }

    .admin-content {
      --background: #F8FAFC !important;
      color: #1E293B !important;
    }
    ion-card {
      --background: #ffffff !important;
      --color: #1E293B !important;
    }
    ion-card-title {
      color: #1E293B !important;
    }
    ion-card-subtitle {
      color: #64748B !important;
    }

    .glass-header {
      background: #7B2FBE;
      background: linear-gradient(135deg, #7B2FBE, #9B59D0);
      padding: 30px 20px 20px;
      border-radius: 0 0 30px 30px;
      margin-bottom: 10px;
      box-shadow: 0 10px 30px rgba(123, 47, 190, 0.2);
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }

    .welcome-text {
      color: #ffffff;
      opacity: 0.9;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .dashboard-title {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 800;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .notif-btn {
      --color: white;
      position: relative;
      margin: 0;
    }

    .badge-dot {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 8px;
      height: 8px;
      background: #FF4D4D;
      border-radius: 50%;
      border: 2px solid var(--primary-purple);
    }

    .admin-avatar {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .custom-segment {
      --background: rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 4px;
      backdrop-filter: blur(5px);
      
      ion-segment-button {
        --color: rgba(255, 255, 255, 0.7);
        --color-checked: white;
        --indicator-color: var(--primary-purple);
        --indicator-height: 100%;
        min-height: 38px;
        font-weight: 600;
        font-size: 11px;
      }
    }

    .sub-segment {
      margin-bottom: 15px;
      --background: #ffffff !important;
      border-radius: 10px;
      ion-segment-button { font-size: 12px; font-weight: 700; --color: #64748B !important; --color-checked: #1E293B !important; }
    }

    .content-wrapper {
      padding: 0 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }

    .stat-card {
      padding: 20px;
      border-radius: 20px;
      color: white;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0,0,0,0.05);

      &.purple { background: linear-gradient(135deg, #7B2FBE, #9B59D0); }
      &.blue { background: linear-gradient(135deg, #3B82F6, #60A5FA); }

      .stat-icon-wrap {
        width: 36px;
        height: 36px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        ion-icon { font-size: 20px; }
      }

      .stat-info {
        h3 { margin: 0; font-size: 24px; font-weight: 800; }
        p { margin: 0; font-size: 12px; opacity: 0.9; font-weight: 500; }
      }
    }

    .stats-grid.mini {
      grid-template-columns: 1fr 1fr 1fr;
    }

    .stat-card-mini {
      background: #ffffff !important;
      padding: 15px 10px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      border: 1px solid #F1F5F9;

      .mini-val { font-weight: 800; font-size: 16px; color: #1E293B !important; }
      .mini-lbl { font-size: 10px; color: #64748B !important; font-weight: 600; text-transform: uppercase; }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 25px 0 15px;

      h2 { font-size: 18px; font-weight: 700; color: #1E293B !important; margin: 0; }
      ion-button { --color: var(--primary-purple); font-weight: 600; }
    }

    .logs-container {
      background: #ffffff !important;
      border-radius: 20px;
      padding: 5px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
    }

    .log-item {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      gap: 15px;
      border-bottom: 1px solid #F1F5F9;
      &:last-child { border: none; }

      .log-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #CBD5E1;
        &.success { background: #10B981; }
        &.danger { background: #EF4444; }
      }

      .log-action { margin: 0; font-size: 14px; font-weight: 600; color: #1E293B !important; }
      .log-meta { 
        display: flex; gap: 10px; align-items: center; margin-top: 2px;
        span { font-size: 11px; color: #64748B !important; display: flex; align-items: center; gap: 4px; }
      }
      .log-details { font-style: italic; background: #F8FAFC; padding: 2px 6px; border-radius: 4px; color: #64748B !important; }
    }

    .management-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .manage-item {
      background: #ffffff !important;
      padding: 20px;
      border-radius: 20px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      .manage-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
        color: white;
        ion-icon { font-size: 24px; }
      }

      h3 { margin: 0 0 5px; font-size: 16px; font-weight: 700; color: #1E293B !important; }
      p { margin: 0 10px 0 0; font-size: 13px; color: #64748B !important; line-height: 1.4; }
      ion-button { margin-left: -8px; --padding-start: 8px; font-weight: 700; font-size: 13px; }
    }

    .report-card, .content-card {
      background: #ffffff !important;
      margin: 0 0 15px;
      border-radius: 18px;
      box-shadow: 0 6px 15px rgba(0,0,0,0.05);
      overflow: hidden;

      .card-img { width: 100%; height: 140px; object-fit: crop; }

      .report-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .report-date { font-size: 11px; color: #64748B !important; }
      .id-tag { background: #F1F5F9; padding: 2px 6px; border-radius: 6px; font-size: 12px; color: #1E293B !important; }

      .report-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
        ion-button { flex: 1; font-weight: 700; --border-radius: 10px; }
      }

      .description { font-size: 13px; color: #64748B !important; line-height: 1.5; margin: 0; }
    }

    .analytics-card {
      background: #ffffff !important;
      padding: 20px;
      border-radius: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.04);
    }

    .chart-header {
      margin-bottom: 20px;
      h3 { margin: 0; font-size: 16px; font-weight: 700; color: #1E293B !important; }
      p { margin: 0; font-size: 12px; color: #64748B !important; }
    }

    .bar-chart {
      height: 120px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding-top: 10px;
    }

    .bar-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .bar-fill {
      width: 12px;
      background: linear-gradient(to top, var(--primary-purple), var(--light-purple));
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      min-height: 4px;
      animation: growHeight 0.6s ease-out;
    }

    .bar-label { font-size: 10px; font-weight: 700; color: var(--text-muted); }

    .analytics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }

    .mini-analytic {
      background: #ffffff !important;
      padding: 15px;
      border-radius: 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      h4 { margin: 0; font-size: 12px; font-weight: 700; text-align: center; color: #64748B !important; }
    }

    .circle-chart {
      width: 60px; height: 60px; border-radius: 50%;
      border: 5px solid #F1F5F9; border-top-color: var(--primary-purple);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 14px;
      color: #1E293B !important;
      &.green { border-top-color: #10B981; }
    }

    .skills-list {
      background: #ffffff !important;
      padding: 15px;
      border-radius: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
    }

    .skill-item {
      margin-bottom: 15px;
      &:last-child { margin-bottom: 0; }
    }

    .skill-info {
      display: flex; justify-content: space-between; margin-bottom: 6px;
      .skill-name { font-weight: 700; font-size: 13px; color: #1E293B !important; }
      .skill-count { font-size: 12px; color: #64748B !important; }
    }

    .skill-bar { height: 6px; background: #F1F5F9; border-radius: 10px; overflow: hidden; }
    .skill-progress { height: 100%; background: var(--primary-purple); border-radius: 10px; }

    .empty-state {
      padding: 40px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;

      ion-icon { font-size: 60px; color: #E2E8F0; }
      .success-icon { 
        width: 80px; height: 80px; background: #ECFDF5; color: #10B981; 
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        ion-icon { font-size: 40px; color: #10B981; }
      }
      h3 { margin: 0; font-size: 18px; font-weight: 700; color: #1E293B !important; }
    }

    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes growHeight {
      from { height: 0; }
    }

    .bottom-padding { height: 100px; }
  `]
})
export class DashboardAdminPage implements OnInit {
  segment = 'overview';
  moderateTab = 'reports';
  stats: AdminStats | null = null;
  logs: any[] = [];
  reports: any[] = [];
  pendingJobs: any[] = [];
  pendingProducts: any[] = [];
  analytics: any = null;

  adminActions = [
    { title: 'Users Directory', description: 'Review, verify or suspend accounts', icon: 'people', color: '#7B2FBE' },
    { title: 'Gig Moderation', description: 'Approve or remove platform listings', icon: 'briefcase', color: '#3B82F6' },
    { title: 'System Content', description: 'Manage categories and site assets', icon: 'layers', color: '#10B981' },
    { title: 'Analytics Export', description: 'Generate platform performance reports', icon: 'bar-chart', color: '#F59E0B' },
  ];

  constructor(
    public router: Router,
    private roleService: RoleService,
    private api: ApiService,
    private route: ActivatedRoute,
    private toast: ToastController
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.segment = params['seg'] || 'overview';
      this.refreshData();
    });
  }

  refreshData() {
    if (this.segment === 'overview') {
      this.loadStats();
      this.loadLogs();
    } else if (this.segment === 'moderation') {
      this.loadReports();
      this.loadPending();
    } else if (this.segment === 'analytics') {
      this.loadAnalytics();
    }
  }

  loadStats() {
    this.api.getAdminStats().subscribe({
      next: s => { this.stats = s; },
      error: () => { this.showToast('Failed to load admin stats'); }
    });
  }

  loadLogs() {
    this.api.getAdminLogs().subscribe({
      next: l => { this.logs = l; },
      error: () => { this.showToast('Failed to load activity logs'); }
    });
  }

  loadReports() {
    this.api.getAdminReports().subscribe({
      next: r => { this.reports = r; },
      error: () => { this.showToast('Failed to load reports'); }
    });
  }

  loadPending() {
    this.api.getPendingContent().subscribe({
      next: data => {
        this.pendingJobs = data.jobs;
        this.pendingProducts = data.products;
      },
      error: () => { this.showToast('Failed to load pending approvals'); }
    });
  }

  loadAnalytics() {
    this.api.getAnalytics().subscribe({
      next: a => { this.analytics = a; },
      error: () => { this.showToast('Failed to load analytics'); }
    });
  }

  approve(type: 'job' | 'product', id: string) {
    this.api.approveContent(type, id).subscribe({
      next: () => {
        this.loadPending();
        this.loadLogs();
        this.loadStats();
        this.showToast(`${type === 'job' ? 'Job' : 'Product'} approved`, 'success');
      },
      error: () => { this.showToast('Approval failed'); }
    });
  }

  reject(type: 'job' | 'product', id: string) {
    this.pendingJobs = this.pendingJobs.filter(item => item.id !== id);
    this.pendingProducts = this.pendingProducts.filter(item => item.id !== id);
    this.showToast(`${type === 'job' ? 'Job' : 'Product'} rejected`, 'medium');
  }

  handleReport(reportId: string, status: 'resolved' | 'dismissed') {
    this.api.updateReportStatus(reportId, status).subscribe({
      next: () => {
        this.loadReports();
        this.loadLogs();
      },
      error: () => { this.showToast('Failed to update report status'); }
    });
  }

  goToAdminAction(action: { title: string }) {
    const map: Record<string, string> = {
      'Users Directory': 'overview',
      'Gig Moderation': 'moderation',
      'System Content': 'management',
      'Analytics Export': 'analytics'
    };

    this.router.navigate(['/dashboard-admin'], { queryParams: { seg: map[action.title] || 'overview' } });
  }

  async showToast(message: string, color: 'success' | 'medium' | 'danger' = 'danger') {
    const t = await this.toast.create({ message, duration: 2200, color });
    t.present();
  }

  formatDate(dateStr: string) {
    if (!dateStr) return 'Recent';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  }
}
