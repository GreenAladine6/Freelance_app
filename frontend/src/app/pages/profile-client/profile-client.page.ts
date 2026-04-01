import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, ApiUser, ApiJob } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-profile-client',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, BottomNavComponent],
  template: `
    <ion-content class="profile-content">
      <div class="profile-header elevation-1">
        <div class="header-top">
          <ion-button fill="clear" color="dark" (click)="goBack()" class="back-btn"><ion-icon name="arrow-back"></ion-icon></ion-button>
          <button *ngIf="isOwnProfile" class="edit-btn" (click)="openEdit()">
            <ion-icon name="pencil"></ion-icon> Edit Profile
          </button>
        </div>
        
        <div class="profile-info-center">
          <div class="avatar-wrap">
            <img src="https://i.pravatar.cc/150?u=client" alt="Profile" class="main-avatar" />
            <div class="status-indicator icon-badge">
              <ion-icon name="checkmark-circle"></ion-icon>
            </div>
          </div>
          <h2 class="display-name">{{ displayName }}</h2>
          <div class="badges-row">
            <span class="role-badge">Client</span>
            <span class="text-muted">Member since {{ joinYear }}</span>
          </div>
        </div>
      </div>

      <div class="content-sections">
        <div class="section-card">
          <h3 class="section-title">About</h3>
          <p class="body-text">{{ aboutText }}</p>
        </div>

        <div class="section-card">
          <h3 class="section-title">Hiring Preferences</h3>
          <div class="tags-container">
            <span *ngFor="let tag of preferences" class="tag">{{ tag }}</span>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <ion-icon name="briefcase" class="icon-purple"></ion-icon>
            <p class="stat-num">{{ loading ? '...' : myJobs.length }}</p>
            <p class="stat-label">Projects Posted</p>
          </div>
          <div class="stat-box">
            <ion-icon name="people" class="icon-blue"></ion-icon>
            <p class="stat-num">{{ loading ? '...' : inProgressJobs.length }}</p>
            <p class="stat-label">In Progress</p>
          </div>
          <div class="stat-box">
            <ion-icon name="logo-usd" class="icon-green"></ion-icon>
            <p class="stat-num">{{ loading ? '...' : totalApplications() }}</p>
            <p class="stat-label">Total Proposals</p>
          </div>
          <div class="stat-box">
            <ion-icon name="star" class="icon-yellow"></ion-icon>
            <p class="stat-num">{{ loading ? '...' : openJobs.length }}</p>
            <p class="stat-label">Open Jobs</p>
          </div>
        </div>

        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">My Jobs</h3>
            <button class="view-all-btn" (click)="goToGigs()">View All</button>
          </div>
          <div class="job-list">
            <p *ngIf="loading" class="empty-text">Loading...</p>
            <p *ngIf="!loading && myJobs.length === 0" class="empty-text">No jobs posted yet.</p>
            <div *ngFor="let job of getRecentJobs()" class="job-item">
              <div class="job-info">
                <p class="job-title">{{ job.title }}</p>
                <p class="job-status" [ngClass]="{'status-open': job.status === 'open', 'status-progress': job.status === 'in_progress', 'status-closed': job.status !== 'open' && job.status !== 'in_progress'}">
                  {{ job.status === 'in_progress' ? 'In Progress' : (job.status | titlecase) }}
                  <span *ngIf="job.application_count !== undefined"> · {{ job.application_count }} proposals</span>
                </p>
              </div>
              <button class="icon-btn" (click)="goToGigs()"><ion-icon name="chevron-forward"></ion-icon></button>
            </div>
          </div>
        </div>

        <div class="actions-card mb">
          <button class="action-btn">
            <div class="action-label">
              <div class="action-icon icon-blue-bg"><ion-icon name="settings"></ion-icon></div>
              <span>Account Settings</span>
            </div>
            <ion-icon name="chevron-forward" class="chevron"></ion-icon>
          </button>
          <button class="action-btn">
            <div class="action-label">
              <div class="action-icon icon-purple-bg"><ion-icon name="help-circle"></ion-icon></div>
              <span>Help & Support</span>
            </div>
            <ion-icon name="chevron-forward" class="chevron"></ion-icon>
          </button>
          <button class="action-btn" (click)="handleLogout()">
            <div class="action-label">
              <div class="action-icon icon-red-bg"><ion-icon name="log-out"></ion-icon></div>
              <span class="text-red">Log Out</span>
            </div>
            <ion-icon name="chevron-forward" class="text-red-light"></ion-icon>
          </button>
        </div>
      </div>
    </ion-content>

    <div class="modal-overlay" *ngIf="editing" (click)="editing = false"></div>
    <div class="bottom-sheet" *ngIf="editing" [class.show]="editing">
      <div class="modal-header">
        <h3>Edit Profile</h3>
        <ion-button fill="clear" color="medium" (click)="editing = false"><ion-icon name="close"></ion-icon></ion-button>
      </div>
      <div class="form-group mb">
        <label>Full Name</label>
        <input type="text" [(ngModel)]="editName" placeholder="Your name" class="custom-input" />
      </div>
      <div class="form-group mb-lg">
        <label>Bio</label>
        <textarea [(ngModel)]="editBio" rows="3" placeholder="Describe yourself..." class="custom-textarea"></textarea>
      </div>
      
      <p class="save-msg" *ngIf="saveMsg" [class.error]="saveMsg.includes('Failed')">{{ saveMsg }}</p>
      
      <button class="save-btn" [disabled]="saving" (click)="handleSave()">
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

  <ion-footer *ngIf="isOwnProfile">
    <app-bottom-nav></app-bottom-nav>
  </ion-footer>
  `,
  styles: [`
    .profile-content { --background: #F8F9FA; }
    
    .profile-header { background: white; padding: 16px 16px 48px; position: relative; border-bottom: 1px solid #F3F4F6; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .back-btn { margin-left: -8px; }
    .edit-btn { display: flex; align-items: center; gap: 8px; border: 1px solid #E5E7EB; background: white; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; color: #374151; cursor: pointer; }
    
    .profile-info-center { display: flex; flex-direction: column; align-items: center; }
    .avatar-wrap { position: relative; margin-bottom: 16px; }
    .main-avatar { width: 96px; height: 96px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); object-fit: cover; }
    .icon-badge { position: absolute; bottom: 4px; right: 4px; background: #3B82F6; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    .icon-badge ion-icon { font-size: 12px; }
    
    .display-name { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 6px; }
    .badges-row { display: flex; align-items: center; gap: 8px; }
    .role-badge { background: #EFF6FF; color: #2563EB; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 2px 12px; border-radius: 9999px; }
    .text-muted { font-size: 11px; color: #9CA3AF; font-weight: 500; }
    
    .content-sections { padding: 0 16px 100px; margin-top: -24px; position: relative; z-index: 10; display: flex; flex-direction: column; gap: 16px; }
    
    .section-card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .section-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 8px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h3 { margin: 0; }
    .view-all-btn { font-size: 12px; font-weight: 700; color: #8B5CF6; background: transparent; border: none; }
    
    .body-text { font-size: 12px; color: #4B5563; line-height: 1.6; margin: 0; }
    
    .tags-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .tag { background: #F3F4F6; color: #4B5563; font-size: 10px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .stat-box { background: white; padding: 16px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; }
    .stat-box ion-icon { font-size: 20px; margin-bottom: 4px; }
    .icon-purple { color: #8B5CF6; }
    .icon-blue { color: #3B82F6; }
    .icon-green { color: #22C55E; }
    .icon-yellow { color: #EAB308; }
    .stat-num { font-size: 18px; font-weight: 700; color: #111827; margin: 0; }
    .stat-label { font-size: 9px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
    
    .job-list { display: flex; flex-direction: column; }
    .empty-text { font-size: 12px; color: #9CA3AF; margin: 0 0 12px; }
    .job-item { display: flex; justify-content: space-between; align-items: center; padding: 0 0 16px; border-bottom: 1px solid #F9FAFB; margin-bottom: 16px; }
    .job-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .job-info { flex: 1; }
    .job-title { font-size: 14px; font-weight: 700; color: #1F2937; margin: 0 0 4px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
    .job-status { font-size: 10px; font-weight: 700; margin: 0; }
    .status-open { color: #22C55E; }
    .status-progress { color: #3B82F6; }
    .status-closed { color: #9CA3AF; }
    .icon-btn { padding: 6px; border-radius: 50%; background: transparent; color: #9CA3AF; display: flex; align-items: center; justify-content: center; border: none; }
    .icon-btn:hover { background: #F9FAFB; }
    
    .actions-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .action-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: transparent; border: none; border-bottom: 1px solid #F9FAFB; cursor: pointer; transition: background 0.2s; }
    .action-btn:last-child { border-bottom: none; }
    .action-label { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 700; color: #374151; }
    .action-icon { padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .icon-blue-bg { background: #EFF6FF; color: #2563EB; }
    .icon-purple-bg { background: #F3E8FF; color: #8B5CF6; }
    .icon-red-bg { background: #FEF2F2; color: #EF4444; }
    .text-red { color: #EF4444; }
    .text-red-light { color: #FCA5A5; }
    .chevron { color: #D1D5DB; }
    
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; }
    .bottom-sheet { position: fixed; bottom: 0; left: 0; right: 0; max-width: 512px; margin: 0 auto; background: white; border-radius: 24px 24px 0 0; padding: 24px; z-index: 101; transform: translateY(100%); transition: transform 0.3s; box-shadow: 0 -10px 40px rgba(0,0,0,0.1); }
    .bottom-sheet.show { transform: translateY(0); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .modal-header h3 { font-size: 16px; font-weight: 700; color: #111827; margin: 0; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: #4B5563; margin-bottom: 4px; }
    .custom-input, .custom-textarea { width: 100%; border: 1px solid #E5E7EB; border-radius: 12px; padding: 10px 12px; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
    .custom-input:focus, .custom-textarea:focus { border-color: #8B5CF6; box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2); }
    .custom-textarea { resize: none; }
    .mb { margin-bottom: 12px; }
    .mb-lg { margin-bottom: 24px; }
    .save-msg { font-size: 12px; font-weight: 600; color: #16A34A; margin: 0 0 12px; }
    .save-msg.error { color: #EF4444; }
    .save-btn { width: 100%; padding: 12px; background: #8B5CF6; color: white; border-radius: 16px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: transform 0.1s; }
    .save-btn:active { transform: scale(0.98); }
    .save-btn:disabled { opacity: 0.6; }
  `]
})
export class ProfileClientPage implements OnInit {
  displayName = 'Client User';
  joinYear = new Date().getFullYear();
  aboutText = 'Tech entrepreneur looking for creative designers and developers.';
  preferences = ["UI/UX Design", "React", "Node.js", "Brand Strategy", "SaaS"];

  loading = false;
  myJobs: ApiJob[] = [
    { id: '1', title: 'React Developer needed for MVP', description: 'Looking for a dev.', status: 'open', budget: 1500, application_count: 5 },
    { id: '2', title: 'Logo Design', description: 'Need a logo.', status: 'in_progress', budget: 300, application_count: 3 },
  ];

  editing = false;
  editName = '';
  editBio = '';
  saving = false;
  saveMsg = '';
  isOwnProfile = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    const currentUser = this.roleService.user;

    if (id && id !== currentUser?.id) {
      this.isOwnProfile = false;
      try {
        const u = await this.api.getUser(id).toPromise();
        if (u) {
          this.displayName = u.full_name || u.username || 'User';
          this.aboutText = u.bio || 'No bio provided.';
          if (u.created_at) this.joinYear = new Date(u.created_at).getFullYear();
          // Hide sensitive buttons like Logout/Store
        }
      } catch { }
    } else {
      this.isOwnProfile = true;
      try {
        const profile = await this.api.getProfile().toPromise();
        if (profile) {
          this.displayName = profile.full_name || 'Client User';
          this.aboutText = profile.bio || this.aboutText;
          if (profile.created_at) this.joinYear = new Date(profile.created_at).getFullYear();
        }
        const jobs = await this.api.getMyJobs().toPromise();
        if (jobs) {
          this.myJobs = jobs;
        }
      } catch { }
    }
    this.loading = false;
  }

  get inProgressJobs() {
    return this.myJobs.filter(j => j.status === 'in_progress');
  }

  get openJobs() {
    return this.myJobs.filter(j => j.status === 'open');
  }

  totalApplications() {
    return this.myJobs.reduce((s, j) => s + (j.application_count || 0), 0);
  }

  getRecentJobs() {
    return this.myJobs.slice(0, 3);
  }

  goBack() {
    this.router.navigate(['/dashboard-client']);
  }

  goToGigs() {
    this.router.navigate(['/gigs']);
  }

  openEdit() {
    this.editName = this.displayName;
    this.editBio = this.aboutText;
    this.saveMsg = '';
    this.editing = true;
  }

  async handleSave() {
    try {
      this.saving = true;
      const updated = await this.api.updateProfile({
        full_name: this.editName.trim() || undefined,
        bio: this.editBio.trim() || undefined,
      }).toPromise();

      if (updated && updated.user) {
        this.displayName = updated.user.full_name || this.displayName;
        this.aboutText = updated.user.bio || this.aboutText;
      }
      this.saveMsg = "Profile saved!";
      setTimeout(() => { this.editing = false; this.saveMsg = ''; }, 1200);
    } catch (err: any) {
      this.saveMsg = "Failed to save.";
    } finally {
      this.saving = false;
    }
  }

  handleLogout() {
    this.roleService.logout();
    this.router.navigate(['/login']);
  }
}
