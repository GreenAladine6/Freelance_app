import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService, AdminStats } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, BottomNavComponent],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Admin Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear">
            <ion-icon slot="icon-only" name="settings-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="admin-content">
      <ion-segment [(ngModel)]="segment" class="admin-segment">
        <ion-segment-button value="overview"><ion-label>Overview</ion-label></ion-segment-button>
        <ion-segment-button value="analytics"><ion-label>Analytics</ion-label></ion-segment-button>
        <ion-segment-button value="reports"><ion-label>Reports</ion-label></ion-segment-button>
      </ion-segment>

      <!-- Pending Approvals -->
      <ion-card class="warning-card">
        <ion-card-header color="warning">
          <ion-card-title>
            <span>Pending Approvals</span>
            <ion-icon name="time-outline"></ion-icon>
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col size="4" class="stat-col">
                <p class="stat-num">{{stats ? stats.pending_applications : '...'}}</p>
                <p class="stat-lbl">Pending Apps</p>
              </ion-col>
              <ion-col size="4" class="stat-col">
                <p class="stat-num">{{stats ? stats.open_jobs : '...'}}</p>
                <p class="stat-lbl">Open Jobs</p>
              </ion-col>
              <ion-col size="4" class="stat-col">
                <p class="stat-num">{{stats ? stats.total_users : '...'}}</p>
                <p class="stat-lbl">Users</p>
              </ion-col>
            </ion-row>
          </ion-grid>
          <ion-button expand="block" color="warning" class="review-btn">Review Now</ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Platform Stats -->
      <ion-card>
        <ion-card-header color="primary">
          <ion-card-title>
            <span>Platform Statistics</span>
            <ion-icon name="trending-up-outline"></ion-icon>
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list lines="none">
            <ion-item *ngFor="let s of statItems">
              <ion-icon [name]="s.icon" slot="start" color="medium"></ion-icon>
              <ion-label>{{s.label}}</ion-label>
              <ion-badge [color]="s.color">{{stats ? s.value(stats) : '...'}}</ion-badge>
            </ion-item>
          </ion-list>
          <!-- Mini bar chart -->
          <div class="mini-chart">
            <div class="bar" *ngFor="let h of barHeights" [style.height.%]="h"></div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Reports -->
      <ion-card>
        <ion-card-header color="danger">
          <ion-card-title>
            <span>Reports & Flags</span>
            <ion-icon name="warning-outline"></ion-icon>
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="reports-row">
            <div>
              <p class="report-num">5</p>
              <p class="report-lbl">Pending Reports</p>
            </div>
            <ion-button color="danger" size="small">Moderate</ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- System Actions -->
      <div class="system-actions">
        <p class="actions-title">System Actions</p>
        <div class="chips">
          <ion-chip color="primary" *ngFor="let a of actions; let i = index" [color]="i === 0 ? 'primary' : 'medium'">
            <ion-label>{{a}}</ion-label>
          </ion-chip>
        </div>
      </div>

      <!-- Admin Logs -->
      <div class="logs-section">
        <p class="actions-title">Admin Logs</p>
        <ion-card>
          <ion-list>
            <ion-item *ngFor="let log of logs">
              <ion-icon [name]="log.icon" slot="start" [color]="log.color"></ion-icon>
              <ion-label>
                <h3>{{log.action}}</h3>
                <p>{{log.time}}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card>
      </div>
    </ion-content>
    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .admin-content { --background: #F5F5F5; }
    .admin-segment { margin: 12px; }
    ion-card-title { display: flex; justify-content: space-between; align-items: center; }
    .warning-card { margin: 16px; }
    .stat-col { text-align: center; }
    .stat-num { font-size: 24px; font-weight: 700; margin: 0; }
    .stat-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B7280; margin: 0; }
    .review-btn { margin-top: 12px; font-weight: 700; }
    .mini-chart { height: 60px; background: #EFF6FF; border-radius: 10px; display: flex; align-items: flex-end; justify-content: space-around; padding: 6px 8px; gap: 4px; margin-top: 16px; }
    .bar { background: #3B82F6; border-radius: 3px 3px 0 0; flex: 1; transition: height 0.3s; }
    .reports-row { display: flex; align-items: center; justify-content: space-between; }
    .report-num { font-size: 24px; font-weight: 700; color: #DC2626; margin: 0; }
    .report-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9CA3AF; margin: 0; }
    .system-actions, .logs-section { padding: 0 16px 8px; }
    .actions-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; margin: 0 0 10px; }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; }
    ion-badge { font-weight: 700; }
  `]
})
export class DashboardAdminPage implements OnInit {
  segment = 'overview';
  stats: AdminStats | null = null;
  barHeights = [40, 60, 30, 80, 50, 90, 70];
  actions = ['Validate Profiles', 'Review Gigs', 'Manage Categories', 'Analytics'];
  statItems = [
    { label: 'Total Users', icon: 'people-outline', color: 'dark', value: (s: AdminStats) => s.total_users },
    { label: 'Freelancers', icon: 'person-outline', color: 'dark', value: (s: AdminStats) => s.freelancers },
    { label: 'Clients', icon: 'person-outline', color: 'dark', value: (s: AdminStats) => s.clients },
    { label: 'Open Jobs', icon: 'briefcase-outline', color: 'dark', value: (s: AdminStats) => s.open_jobs },
    { label: 'Total Applications', icon: 'document-text-outline', color: 'success', value: (s: AdminStats) => s.total_applications },
  ];
  logs = [
    { action: 'Approved freelancer: John Doe', time: '5m ago', icon: 'checkmark-circle-outline', color: 'success' },
    { action: 'Deleted flagged product #892', time: '2h ago', icon: 'warning-outline', color: 'danger' },
    { action: 'Updated Category: Design', time: '5h ago', icon: 'settings-outline', color: 'primary' },
  ];

  constructor(public router: Router, private roleService: RoleService, private api: ApiService) { }

  ngOnInit() {
    this.api.getAdminStats().subscribe({ next: s => { this.stats = s; }, error: () => { } });
  }
}
