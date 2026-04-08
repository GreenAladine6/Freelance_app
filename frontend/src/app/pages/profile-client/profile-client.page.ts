import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
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
        <div class="header-glow"></div>
        <div class="header-top">
          <ion-button fill="clear" color="dark" (click)="goBack()" class="back-btn"><ion-icon name="arrow-back"></ion-icon></ion-button>
          <button *ngIf="isOwnProfile" type="button" class="edit-btn" (click)="openEdit()">
            <ion-icon name="pencil"></ion-icon> Edit Profile
          </button>
        </div>

        <div class="profile-info-center">
          <div class="avatar-wrap">
            <img [src]="profileImage || defaultAvatar" alt="Profile" class="main-avatar" />
            <div class="status-indicator icon-badge">
              <ion-icon name="checkmark-circle"></ion-icon>
            </div>
          </div>
          <h2 class="display-name">{{ displayName }}</h2>
          <div class="badges-row">
            <span class="role-badge">Client</span>
            <span class="text-muted">Member since {{ joinYear }}</span>
          </div>
          <div class="header-kpis" *ngIf="isOwnProfile">
            <div class="kpi-chip">
              <ion-icon name="briefcase-outline"></ion-icon>
              <span>{{ myJobs.length }} jobs</span>
            </div>
            <div class="kpi-chip">
              <ion-icon name="time-outline"></ion-icon>
              <span>{{ inProgressJobs.length }} active</span>
            </div>
            <div class="kpi-chip">
              <ion-icon name="checkmark-done-outline"></ion-icon>
              <span>{{ closedJobs.length }} done</span>
            </div>
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
                <p class="job-meta">{{ job.budget ? ('$' + job.budget) : 'Budget on request' }}</p>
              </div>
              <button class="icon-btn" (click)="goToGigs()"><ion-icon name="chevron-forward"></ion-icon></button>
            </div>
          </div>
        </div>

        <div class="actions-card mb" *ngIf="isOwnProfile">
          <button class="action-btn" (click)="openAccountSettings()">
            <div class="action-label">
              <div class="action-icon icon-blue-bg"><ion-icon name="settings"></ion-icon></div>
              <span>Account Settings</span>
            </div>
            <ion-icon name="chevron-forward" class="chevron"></ion-icon>
          </button>
          <button class="action-btn" (click)="openHelpSupport()">
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
      <div class="edit-avatar-preview">
        <img [src]="profileImage || defaultAvatar" alt="Profile preview" />
        <p>Current profile picture</p>
      </div>
      <div class="form-group mb">
        <label>Full Name</label>
        <input type="text" [(ngModel)]="editName" placeholder="Your name" class="custom-input" />
      </div>
      <div class="form-group mb-lg">
        <label>Bio</label>
        <textarea [(ngModel)]="editBio" rows="3" placeholder="Describe yourself..." class="custom-textarea"></textarea>
      </div>
      <div class="form-group mb-lg">
        <label>Upload Profile Image</label>
        <input type="file" accept="image/*" (change)="onAvatarFileSelected($event)" class="custom-input file-input" />
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
    .profile-content { --background: linear-gradient(180deg, #f6f8fb 0%, #eef4f5 58%, #f5f7fb 100%); }

    .profile-header {
      background: radial-gradient(circle at 10% -20%, #9dd6c6 0%, transparent 35%),
                  radial-gradient(circle at 100% 0%, #f8d99c 0%, transparent 40%),
                  #ffffff;
      padding: 16px 16px 52px;
      position: relative;
      border-bottom: 1px solid #e5ecef;
      box-shadow: 0 10px 22px rgba(20, 39, 55, 0.08);
      overflow: hidden;
    }
    .header-glow {
      position: absolute;
      width: 180px;
      height: 180px;
      background: rgba(255, 255, 255, 0.42);
      filter: blur(6px);
      border-radius: 50%;
      right: -50px;
      top: -72px;
      pointer-events: none;
    }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; position: relative; z-index: 2; }
    .back-btn { margin-left: -8px; }
    .edit-btn { display: flex; align-items: center; gap: 8px; border: 1px solid #d9e4e8; background: #ffffff; padding: 7px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; color: #1f3a4b; cursor: pointer; }
    
    .profile-info-center { display: flex; flex-direction: column; align-items: center; }
    .avatar-wrap { position: relative; margin-bottom: 16px; }
    .main-avatar { width: 102px; height: 102px; border-radius: 50%; border: 4px solid white; box-shadow: 0 8px 18px rgba(23, 57, 72, 0.18); object-fit: cover; }
    .icon-badge { position: absolute; bottom: 4px; right: 4px; background: #1d9a7c; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    .icon-badge ion-icon { font-size: 12px; }
    
    .display-name { font-size: 21px; font-weight: 800; color: #122531; margin: 0 0 6px; letter-spacing: 0.01em; }
    .badges-row { display: flex; align-items: center; gap: 8px; }
    .role-badge { background: #ddf4ed; color: #15735c; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 2px 12px; border-radius: 9999px; }
    .text-muted { font-size: 11px; color: #647481; font-weight: 600; }
    .header-kpis {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
    }
    .kpi-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 11px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid #dce6ea;
      color: #264252;
      font-size: 11px;
      font-weight: 700;
    }
    .kpi-chip ion-icon { font-size: 14px; color: #127763; }
    
    .content-sections { padding: 0 16px 100px; margin-top: -24px; position: relative; z-index: 10; display: flex; flex-direction: column; gap: 16px; }
    
    .section-card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 8px 20px rgba(17, 38, 56, 0.08); border: 1px solid #edf3f6; }
    .section-title { font-size: 14px; font-weight: 800; color: #122531; margin: 0 0 8px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h3 { margin: 0; }
    .view-all-btn { font-size: 12px; font-weight: 700; color: #0f6d94; background: transparent; border: none; }
    
    .body-text { font-size: 12px; color: #3b4e5a; line-height: 1.65; margin: 0; }
    
    .tags-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .tag { background: #edf5f7; color: #255165; font-size: 10px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; border: 1px solid #d9e7ed; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .stat-box { background: white; padding: 16px; border-radius: 16px; box-shadow: 0 8px 20px rgba(17, 38, 56, 0.08); border: 1px solid #edf3f6; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; }
    .stat-box ion-icon { font-size: 20px; margin-bottom: 4px; }
    .icon-purple { color: #0f6d94; }
    .icon-blue { color: #15735c; }
    .icon-green { color: #008a64; }
    .icon-yellow { color: #ad6a00; }
    .stat-num { font-size: 18px; font-weight: 800; color: #122531; margin: 0; }
    .stat-label { font-size: 9px; font-weight: 700; color: #61727f; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
    
    .job-list { display: flex; flex-direction: column; }
    .empty-text { font-size: 12px; color: #80909c; margin: 0 0 12px; }
    .job-item { display: flex; justify-content: space-between; align-items: center; padding: 0 0 16px; border-bottom: 1px solid #f0f4f6; margin-bottom: 16px; }
    .job-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .job-info { flex: 1; }
    .job-title { font-size: 14px; font-weight: 700; color: #1c3341; margin: 0 0 4px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
    .job-status { font-size: 10px; font-weight: 700; margin: 0; }
    .status-open { color: #0f8f63; }
    .status-progress { color: #0f6d94; }
    .status-closed { color: #80909c; }
    .job-meta { margin: 4px 0 0; font-size: 11px; color: #647481; font-weight: 600; }
    .icon-btn { padding: 6px; border-radius: 50%; background: transparent; color: #80909c; display: flex; align-items: center; justify-content: center; border: none; }
    .icon-btn:hover { background: #f2f6f8; }
    
    .actions-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 20px rgba(17, 38, 56, 0.08); border: 1px solid #edf3f6; }
    .action-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: transparent; border: none; border-bottom: 1px solid #f0f4f6; cursor: pointer; transition: background 0.2s; }
    .action-btn:last-child { border-bottom: none; }
    .action-label { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 700; color: #2a4150; }
    .action-icon { padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .icon-blue-bg { background: #e8f5fb; color: #0f6d94; }
    .icon-purple-bg { background: #e7f4ef; color: #15735c; }
    .icon-red-bg { background: #FEF2F2; color: #EF4444; }
    .text-red { color: #EF4444; }
    .text-red-light { color: #FCA5A5; }
    .chevron { color: #b8c6cf; }
    
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; }
    .bottom-sheet { position: fixed; bottom: 0; left: 0; right: 0; max-width: 512px; margin: 0 auto; background: white; border-radius: 24px 24px 0 0; padding: 24px; z-index: 101; transform: translateY(100%); transition: transform 0.3s; box-shadow: 0 -10px 40px rgba(0,0,0,0.1); }
    .bottom-sheet.show { transform: translateY(0); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .modal-header h3 { font-size: 16px; font-weight: 700; color: #11202a; margin: 0; }
    .edit-avatar-preview { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 18px; }
    .edit-avatar-preview img { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; border: 3px solid #fff; box-shadow: 0 8px 18px rgba(23, 57, 72, 0.14); }
    .edit-avatar-preview p { margin: 0; font-size: 11px; font-weight: 700; color: #6b7f8c; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: #3b4e5a; margin-bottom: 4px; }
    .custom-input, .custom-textarea { width: 100%; border: 1px solid #E5E7EB; border-radius: 12px; padding: 10px 12px; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
    .custom-input:focus, .custom-textarea:focus { border-color: #0f6d94; box-shadow: 0 0 0 2px rgba(15, 109, 148, 0.15); }
    .custom-textarea { resize: none; }
    .file-input { padding: 9px 10px; background: #f9fafb; }
    .mb { margin-bottom: 12px; }
    .mb-lg { margin-bottom: 24px; }
    .save-msg { font-size: 12px; font-weight: 600; color: #16A34A; margin: 0 0 12px; }
    .save-msg.error { color: #EF4444; }
    .save-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #0f6d94, #148469); color: white; border-radius: 16px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: transform 0.1s; }
    .save-btn:active { transform: scale(0.98); }
    .save-btn:disabled { opacity: 0.6; }

    @media (max-width: 370px) {
      .content-sections { padding-left: 12px; padding-right: 12px; }
      .kpi-chip { font-size: 10px; }
      .stat-box { padding: 12px; }
    }
  `]
})
export class ProfileClientPage implements OnInit {
  displayName = 'Client User';
  joinYear = new Date().getFullYear();
  aboutText = 'Tech entrepreneur looking for creative designers and developers.';
  profileImage = '';
  defaultAvatar = 'http://localhost:5000/api/uploads/profile-images/default.avif';
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
    private api: ApiService,
    private toast: ToastController
  ) { }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    let currentUser = this.roleService.user;

    if (!currentUser) {
      try {
        currentUser = await this.api.getProfile().toPromise() || null;
        if (currentUser) {
          this.roleService.updateCurrentUser(currentUser);
        }
      } catch {
        currentUser = null;
      }
    }

    if (id && currentUser && id !== currentUser.id) {
      this.isOwnProfile = false;
      try {
        const u = await this.api.getUser(id).toPromise();
        if (u) {
          this.displayName = u.full_name || u.username || 'User';
          this.aboutText = u.bio || 'No bio provided.';
          this.profileImage = u.avatar_url || '';
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
          this.profileImage = profile.avatar_url || '';
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

  get closedJobs() {
    return this.myJobs.filter(j => j.status !== 'open' && j.status !== 'in_progress');
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
        this.profileImage = updated.user.avatar_url || '';
        this.roleService.updateCurrentUser(updated.user);
      }
      this.saveMsg = "Profile saved!";
      setTimeout(() => { this.editing = false; this.saveMsg = ''; }, 1200);
    } catch (err: any) {
      this.saveMsg = "Failed to save.";
    } finally {
      this.saving = false;
    }
  }

  async onAvatarFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    try {
      this.saving = true;
      this.saveMsg = '';
      const uploaded = await this.api.uploadProfileImage(file).toPromise();
      if (uploaded?.user) {
        this.profileImage = uploaded.user.avatar_url || '';
        this.roleService.updateCurrentUser(uploaded.user);
        this.saveMsg = 'Image uploaded!';
      }
    } catch {
      this.saveMsg = 'Failed to upload image.';
    } finally {
      this.saving = false;
      input.value = '';
    }
  }

  handleLogout() {
    this.roleService.logout();
    this.router.navigate(['/login']);
  }

  openAccountSettings() {
    this.openEdit();
  }

  async openHelpSupport() {
    const t = await this.toast.create({
      message: 'Support is available from the browse screen for now.',
      duration: 2200,
      color: 'medium'
    });
    t.present();
  }
}
