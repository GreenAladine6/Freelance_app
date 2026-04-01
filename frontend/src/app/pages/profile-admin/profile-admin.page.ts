import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-profile-admin',
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent],
  template: `
    <ion-content class="profile-content">
      <div class="profile-header elevation-1">
        <div class="header-top">
          <ion-button fill="clear" color="dark" (click)="goBack()" class="back-btn"><ion-icon name="arrow-back"></ion-icon></ion-button>
          <h1 class="header-title">Admin Profile</h1>
          <div class="spacer"></div>
        </div>
        
        <div class="profile-info-center">
          <div class="avatar-wrap">
            <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" class="main-avatar" />
            <div class="status-indicator icon-badge">
              <ion-icon name="shield"></ion-icon>
            </div>
          </div>
          <h2 class="display-name">{{ roleService.user?.full_name || roleService.user?.username || 'Sarah Williams' }}</h2>
          <div class="badges-row">
            <span class="role-badge">System Admin</span>
            <span class="text-muted">Member since {{ roleService.user?.created_at ? (roleService.user?.created_at | date:'yyyy') : '2024' }}</span>
          </div>
        </div>
      </div>

      <div class="content-sections">
        <div class="section-card">
          <h3 class="section-title">Admin Info</h3>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ roleService.user?.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Employee ID</span>
              <span class="info-value">#ADM-9421</span>
            </div>
            <div class="info-item">
              <span class="info-label">Last Login</span>
              <span class="info-value">Today, 08:45 AM</span>
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <ion-icon name="checkmark-circle" color="success"></ion-icon>
            <p class="stat-num">1,245</p>
            <p class="stat-label">Validated</p>
          </div>
          <div class="stat-box">
            <ion-icon name="flag" color="danger"></ion-icon>
            <p class="stat-num">432</p>
            <p class="stat-label">Moderated</p>
          </div>
          <div class="stat-box">
            <ion-icon name="bar-chart" color="primary"></ion-icon>
            <p class="stat-num">98%</p>
            <p class="stat-label">Efficiency</p>
          </div>
        </div>

        <div class="actions-card">
          <button class="action-btn">
            <div class="action-label">
              <div class="action-icon icon-blue"><ion-icon name="key"></ion-icon></div>
              <span>Change Password</span>
            </div>
            <ion-icon name="chevron-forward" class="chevron"></ion-icon>
          </button>
          <button class="action-btn">
            <div class="action-label">
              <div class="action-icon icon-purple"><ion-icon name="settings"></ion-icon></div>
              <span>Admin Settings</span>
            </div>
            <ion-icon name="chevron-forward" class="chevron"></ion-icon>
          </button>
          <button class="action-btn">
            <div class="action-label">
              <div class="action-icon icon-orange"><ion-icon name="document-text"></ion-icon></div>
              <span>View Audit Log</span>
            </div>
            <ion-icon name="chevron-forward" class="chevron"></ion-icon>
          </button>
        </div>

        <div class="section-card">
          <h3 class="section-title">Recent Activity Log</h3>
          <div class="log-list">
            <div class="log-item" *ngFor="let log of logs">
              <div class="log-line"></div>
              <div class="log-content">
                <p class="log-action">{{ log.action }}</p>
                <p class="log-time">{{ log.time }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="logout-container">
          <button class="logout-btn" (click)="handleLogout()">
            <ion-icon name="log-out"></ion-icon> Log Out of System
          </button>
        </div>
      </div>
    </ion-content>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .profile-content { --background: #F5F5F5; }
    
    .profile-header { background: white; padding: 16px 16px 24px; position: relative; border-bottom: 1px solid #F3F4F6; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 16px; }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header-title { font-size: 16px; font-weight: 700; color: #111827; margin: 0; }
    .back-btn { margin-left: -8px; }
    .spacer { width: 40px; }
    
    .profile-info-center { display: flex; flex-direction: column; align-items: center; }
    .avatar-wrap { position: relative; margin-bottom: 12px; }
    .main-avatar { width: 80px; height: 80px; border-radius: 50%; border: 4px solid #F3E8FF; object-fit: cover; }
    .icon-badge { position: absolute; bottom: 0; right: 0; background: #EF4444; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    .icon-badge ion-icon { font-size: 12px; }
    
    .display-name { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 8px; }
    .badges-row { display: flex; align-items: center; gap: 8px; }
    .role-badge { background: #FEF2F2; color: #DC2626; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 8px; border-radius: 9999px; }
    .text-muted { font-size: 10px; color: #9CA3AF; font-weight: 500; }
    
    .content-sections { padding: 0 16px 100px; display: flex; flex-direction: column; gap: 16px; }
    
    .section-card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section-title { font-size: 10px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px; }
    
    .info-list { display: flex; flex-direction: column; gap: 12px; }
    .info-item { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
    .info-label { color: #6B7280; }
    .info-value { font-weight: 700; color: #1F2937; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .stat-box { background: white; padding: 12px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; }
    .stat-box ion-icon { font-size: 16px; margin-bottom: 4px; }
    .stat-num { font-size: 14px; font-weight: 700; color: #111827; margin: 0; }
    .stat-label { font-size: 8px; font-weight: 700; color: #6B7280; text-transform: uppercase; margin: 0; }
    
    .actions-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .action-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 16px; background: transparent; border: none; border-bottom: 1px solid #F9FAFB; cursor: pointer; transition: background 0.2s; }
    .action-btn:last-child { border-bottom: none; }
    .action-btn:active { background: #F9FAFB; }
    .action-label { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 700; color: #374151; }
    .action-icon { padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .icon-blue { background: #EFF6FF; color: #3B82F6; }
    .icon-purple { background: #F3E8FF; color: #8B5CF6; }
    .icon-orange { background: #FFF7ED; color: #F97316; }
    .chevron { color: #9CA3AF; }
    
    .log-list { display: flex; flex-direction: column; gap: 16px; }
    .log-item { display: flex; gap: 12px; }
    .log-line { width: 4px; background: #8B5CF6; border-radius: 9999px; }
    .log-content { flex: 1; }
    .log-action { font-size: 12px; font-weight: 500; color: #1F2937; margin: 0 0 4px; line-height: 1.2; }
    .log-time { font-size: 10px; font-weight: 700; color: #9CA3AF; margin: 0; }
    
    .logout-container { padding-top: 16px; }
    .logout-btn { width: 100%; background: white; color: #EF4444; border: 1px solid #FEE2E2; padding: 12px; border-radius: 16px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .logout-btn:active { transform: scale(0.98); }
  `]
})
export class ProfileAdminPage {
  logs = [
    { action: "Updated security protocols", time: "2h ago" },
    { action: "Approved 15 new freelancer applications", time: "4h ago" },
  ];

  constructor(private router: Router, public roleService: RoleService) { }

  goBack() {
    this.router.navigate(['/dashboard-admin']);
  }

  handleLogout() {
    this.roleService.logout();
    this.router.navigate(['/login']);
  }
}
