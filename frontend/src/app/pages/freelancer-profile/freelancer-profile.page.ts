import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-freelancer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, BottomNavComponent],
  template: `
    <ion-content class="profile-content">
      <div class="profile-header elevation-1">
        <div class="header-glow"></div>
        <div class="header-top">
          <ion-button fill="clear" color="dark" (click)="goBack()" class="back-btn"><ion-icon name="arrow-back"></ion-icon></ion-button>
          <button *ngIf="isOwnProfile" type="button" class="edit-btn" (click)="openEdit()">
            <ion-icon name="create-outline"></ion-icon>
            Edit Profile
          </button>
        </div>

        <div class="profile-info-center">
          <div class="avatar-wrap">
              <img [src]="profileImage || selectedAvatarPreview || defaultAvatar" alt="Profile" class="main-avatar" />
            <div class="status-indicator" [class.unavailable]="!isAvailableForHire"></div>
          </div>
          <h2 class="display-name">{{ displayName }}</h2>
          <div class="badges-row">
            <span class="role-badge">Freelancer</span>
            <div class="rating-badge">
              <ion-icon name="star"></ion-icon>
              <span>4.9</span>
              <span class="text-muted">(124 reviews)</span>
            </div>
          </div>
          <div class="hero-meta">
            <p *ngIf="rate" class="rate-text">{{ rate }}</p>
            <p class="availability-text" [class.unavailable]="!isAvailableForHire">{{ isAvailableForHire ? 'Available for hire' : 'Not available now' }}</p>
          </div>
          <div class="profile-actions">
            <button *ngIf="!isOwnProfile" class="message-btn" (click)="goToMessages()">
              <ion-icon name="chatbubbles-outline"></ion-icon>
              Message
            </button>
            <button *ngIf="!isOwnProfile" class="message-btn ghost" (click)="goBack()">
              <ion-icon name="briefcase-outline"></ion-icon>
              View Jobs
            </button>
          </div>
          <div class="kpi-row">
            <div class="kpi">
              <span class="kpi-value">{{ skills.length }}</span>
              <span class="kpi-label">Skills</span>
            </div>
            <div class="kpi">
              <span class="kpi-value">{{ experience.length }}</span>
              <span class="kpi-label">Roles</span>
            </div>
            <div class="kpi">
              <span class="kpi-value">{{ portfolioItems.length }}</span>
              <span class="kpi-label">Projects</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-sections">
        <div class="section-card">
          <h3>About Me</h3>
          <p class="body-text">{{ bio }}</p>
        </div>

        <div class="section-card">
          <h3>Education</h3>
          <div *ngIf="education.length === 0" class="empty-text body-text">No education added yet.</div>
          <div *ngFor="let edu of education" class="cv-item">
            <h4 class="cv-title">{{ edu.degree }}</h4>
            <p class="cv-subtitle">{{ edu.school }} • {{ edu.year }}</p>
          </div>
        </div>

        <div class="section-card">
          <h3>Experience</h3>
          <div *ngIf="experience.length === 0" class="empty-text body-text">No experience added yet.</div>
          <div *ngFor="let exp of experience" class="cv-item">
            <h4 class="cv-title">{{ exp.role }}</h4>
            <p class="cv-subtitle">{{ exp.company }} • {{ exp.duration }}</p>
          </div>
        </div>

        <div class="section-card">
          <h3>Skills</h3>
          <div class="skills-container" *ngIf="skills.length > 0; else noSkills">
            <span *ngFor="let skill of skills" class="skill-tag">{{ skill }}</span>
          </div>
          <ng-template #noSkills>
            <p class="empty-text body-text">No skills listed yet.</p>
          </ng-template>
        </div>

        <div class="section-card">
          <div class="section-header">
            <h3>Portfolio</h3>
            <button class="see-all-btn" [disabled]="portfolioItems.length === 0">See All</button>
          </div>
          <div class="grid-2" *ngIf="portfolioItems.length > 0; else noPortfolio">
            <div *ngFor="let item of portfolioItems" class="portfolio-item">
              <img [src]="item.image" [alt]="item.title" />
              <div class="portfolio-overlay">
                <p>{{ item.title }}</p>
              </div>
            </div>
          </div>
          <ng-template #noPortfolio>
            <p class="empty-text body-text">No portfolio projects yet.</p>
          </ng-template>
        </div>

        <div class="actions-card" *ngIf="isOwnProfile">
          <button class="action-btn" (click)="handleLogout()">
            <div class="action-label">
              <div class="action-icon icon-red-bg"><ion-icon name="log-out-outline"></ion-icon></div>
              <span class="text-red">Sign Out</span>
            </div>
            <ion-icon name="chevron-forward" class="text-red-light"></ion-icon>
          </button>
        </div>
      </div>
    </ion-content>

    <div class="modal-overlay" *ngIf="editing" (click)="editing = false"></div>
    <div class="bottom-sheet" *ngIf="editing" [class.show]="editing">
      <h3>Edit Profile</h3>
      <div class="edit-avatar-preview">
        <img [src]="selectedAvatarPreview || profileImage || defaultAvatar" alt="Profile preview" />
        <p>Current profile picture</p>
      </div>
      <div class="form-group mb">
        <label>Full Name</label>
        <input type="text" [(ngModel)]="editName" class="custom-input" />
      </div>
      <div class="form-group mb">
        <label>Bio</label>
        <textarea [(ngModel)]="editBio" class="custom-textarea" rows="3"></textarea>
      </div>
      <div class="form-group mb">
        <label>Skills</label>
        <input type="text" [(ngModel)]="editSkills" placeholder="React, TypeScript" class="custom-input" />
      </div>
      <div class="form-group mb">
        <label>Education</label>
        <textarea [(ngModel)]="editEducation" rows="3" placeholder="Degree | School | Year" class="custom-textarea"></textarea>
      </div>
      <div class="form-group mb">
        <label>Experience</label>
        <textarea [(ngModel)]="editExperience" rows="3" placeholder="Role | Company | Duration" class="custom-textarea"></textarea>
      </div>
      <div class="form-group mb">
        <label>Portfolio</label>
        <textarea [(ngModel)]="editPortfolio" rows="3" placeholder="Title | Image URL" class="custom-textarea"></textarea>
      </div>
      <div class="form-group mb-lg">
        <label>Hourly Rate ($)</label>
        <input type="number" [(ngModel)]="editRate" placeholder="45" class="custom-input" />
      </div>
      <div class="form-group mb-lg toggle-group">
        <div class="toggle-label-wrap">
          <label>Availability</label>
          <p>Show clients whether you are open to new work.</p>
        </div>
        <ion-toggle color="success" [(ngModel)]="editAvailableForHire">Available for hire</ion-toggle>
      </div>
      <div class="form-group mb-lg">
        <label>Upload Profile Image</label>
        <input type="file" accept="image/*" (change)="onAvatarFileSelected($event)" class="custom-input file-input" />
      </div>
      
      <p class="save-msg" *ngIf="saveMsg">{{ saveMsg }}</p>
      
      <button class="save-btn" [disabled]="saving" (click)="handleSave()">
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

    <ion-footer *ngIf="isOwnProfile">
      <app-bottom-nav></app-bottom-nav>
    </ion-footer>
  `,
  styles: [`
    .profile-content { --background: linear-gradient(180deg, #f6f8fb 0%, #eff5f6 55%, #f5f8fc 100%); }
    .profile-header {
      background: radial-gradient(circle at 5% -18%, #9dd6c6 0%, transparent 35%),
                  radial-gradient(circle at 95% -12%, #f6d08c 0%, transparent 38%),
                  #ffffff;
      padding: 16px 16px 48px;
      position: relative;
      border-bottom: 1px solid #e5ecef;
      box-shadow: 0 10px 22px rgba(20, 39, 55, 0.08);
      overflow: hidden;
    }
    .header-glow {
      position: absolute;
      width: 170px;
      height: 170px;
      border-radius: 50%;
      background: rgba(255,255,255,0.42);
      filter: blur(7px);
      right: -58px;
      top: -70px;
      pointer-events: none;
    }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; position: relative; z-index: 2; }
    .back-btn { margin-left: -8px; }
    .edit-btn { display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; border-radius: 999px; border: 1px solid #d9e4e8; background: #fff; color: #1f3a4b; font-size: 12px; font-weight: 700; }
    .profile-info-center { display: flex; flex-direction: column; align-items: center; }
    .avatar-wrap { position: relative; margin-bottom: 16px; }
    .main-avatar { width: 114px; height: 114px; border-radius: 50%; border: 4px solid white; box-shadow: 0 8px 18px rgba(23, 57, 72, 0.18); object-fit: cover; }
    .status-indicator { position: absolute; bottom: 8px; right: 8px; width: 20px; height: 20px; background: #22c55e; border: 2px solid white; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    .status-indicator.unavailable { background: #ef4444; }
    .display-name { font-size: 21px; font-weight: 800; color: #122531; margin: 0 0 8px; }
    .badges-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .role-badge { background: #ddf4ed; color: #15735c; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 12px; border-radius: 9999px; }
    .rating-badge { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: #1f3a4b; }
    .rating-badge ion-icon { color: #c77b00; }
    .text-muted { color: #6b7f8c; font-weight: 500; }
    .hero-meta { display: flex; align-items: center; gap: 10px; }
    .rate-text { font-size: 12px; font-weight: 700; color: #0f6d94; margin: 0; }
    .availability-text { font-size: 12px; font-weight: 700; color: #0f8f63; margin: 0; }
    .availability-text.unavailable { color: #b91c1c; }
    .profile-actions { margin-top: 14px; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
    .message-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: 9999px;
      background: linear-gradient(135deg, #0f6d94, #148469); color: white; border: none;
      font-size: 12px; font-weight: 700;
    }
    .message-btn.ghost { background: #ffffff; color: #1f3a4b; border: 1px solid #d9e4e8; }
    .kpi-row { margin-top: 14px; display: grid; grid-template-columns: repeat(3, minmax(76px, 1fr)); gap: 8px; }
    .kpi { text-align: center; background: rgba(255,255,255,0.85); border: 1px solid #dce6ea; border-radius: 12px; padding: 8px; }
    .kpi-value { display: block; color: #122531; font-size: 16px; font-weight: 800; }
    .kpi-label { display: block; margin-top: 2px; color: #6b7f8c; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
    .content-sections { padding: 0 16px; margin-top: -24px; position: relative; z-index: 10; display: flex; flex-direction: column; gap: 16px; padding-bottom: 100px; }
    .section-card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 8px 20px rgba(17, 38, 56, 0.08); border: 1px solid #edf3f6; }
    .section-card h3 { font-size: 14px; font-weight: 800; color: #122531; margin: 0 0 12px; }
    .cv-item { margin-bottom: 12px; }
    .cv-title { font-size: 13px; font-weight: 700; color: #1c3341; margin: 0 0 2px; }
    .cv-subtitle { font-size: 11px; font-weight: 600; color: #647481; margin: 0 0 4px; }
    .empty-text { font-style: italic; color: #80909c; }
    .body-text { font-size: 12px; color: #3b4e5a; line-height: 1.6; margin: 0; }
    .skills-container { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-tag { background: #edf5f7; color: #255165; font-size: 10px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; border: 1px solid #d9e7ed; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h3 { margin: 0; }
    .see-all-btn { font-size: 10px; font-weight: 700; color: #0f6d94; background: transparent; border: none; }
    .see-all-btn:disabled { opacity: 0.5; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .portfolio-item { aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid #F3F4F6; }
    .portfolio-item img { width: 100%; height: 100%; object-fit: cover; }
    .portfolio-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6), transparent); display: flex; align-items: flex-end; padding: 8px; opacity: 0; transition: opacity 0.3s; }
    .portfolio-item:hover .portfolio-overlay { opacity: 1; }
    .portfolio-overlay p { font-size: 9px; font-weight: 700; color: white; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }

    .actions-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 20px rgba(17, 38, 56, 0.08); border: 1px solid #edf3f6; }
    .action-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: transparent; border: none; border-bottom: 1px solid #f0f4f6; cursor: pointer; }
    .action-btn:last-child { border-bottom: none; }
    .action-label { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 700; color: #2a4150; }
    .action-icon { padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .icon-red-bg { background: #FEF2F2; color: #EF4444; }
    .text-red { color: #EF4444; }
    .text-red-light { color: #FCA5A5; }
    .chevron { color: #b8c6cf; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; }
    .bottom-sheet { position: fixed; bottom: 0; left: 0; right: 0; max-width: 420px; margin: 0 auto; background: white; border-radius: 24px 24px 0 0; padding: 24px; z-index: 101; transform: translateY(100%); transition: transform 0.3s; }
    .bottom-sheet.show { transform: translateY(0); }
    .bottom-sheet h3 { font-size: 16px; font-weight: 700; color: #11202a; margin: 0 0 20px; }
    .edit-avatar-preview { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 18px; }
    .edit-avatar-preview img { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; border: 3px solid #fff; box-shadow: 0 8px 18px rgba(23, 57, 72, 0.14); }
    .edit-avatar-preview p { margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #6b7f8c; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: #3b4e5a; margin-bottom: 4px; }
    .toggle-group { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .toggle-label-wrap { flex: 1; }
    .toggle-label-wrap p { margin: 4px 0 0; font-size: 11px; color: #6b7280; }
    .custom-input, .custom-textarea { width: 100%; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 10px 16px; font-size: 14px; outline: none; }
    .custom-input:focus, .custom-textarea:focus { border-color: #0f6d94; box-shadow: 0 0 0 2px rgba(15, 109, 148, 0.15); }
    .custom-textarea { resize: none; }
    .file-input { padding: 9px 10px; background: #f9fafb; }
    .mb { margin-bottom: 16px; }
    .mb-lg { margin-bottom: 24px; }
    .save-msg { font-size: 12px; font-weight: 500; color: #16A34A; margin: 0 0 12px; }
    .save-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #0f6d94, #148469); color: white; border-radius: 9999px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; }
    .save-btn:disabled { opacity: 0.6; }

    @media (max-width: 370px) {
      .content-sections { padding-left: 12px; padding-right: 12px; }
      .kpi-row { grid-template-columns: repeat(3, 1fr); }
    }
  `]
})
export class FreelancerProfilePage implements OnInit {
  displayName = 'Freelancer';
  bio = 'Expert UI/UX Designer & Full-stack Developer with over 5 years of experience.';
  profileImage = '';
  selectedAvatarPreview = '';
  defaultAvatar = 'http://localhost:5000/api/uploads/profile-images/default.avif';
  skills: string[] = [];
  rate: string | null = null;
  education: any[] = [];
  experience: any[] = [];
  portfolioItems = [
    { id: 1, title: 'E-commerce Website', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300' },
    { id: 2, title: 'Mobile App Design', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=300' }
  ];
  editing = false;
  editName = '';
  editBio = '';
  editSkills = '';
  editEducation = '';
  editExperience = '';
  editPortfolio = '';
  editRate = '';
  saving = false;
  saveMsg = '';
  isOwnProfile = true;
  isAvailableForHire = true;
  editAvailableForHire = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile() {
    const id = this.route.snapshot.paramMap.get('id');
    let currentUser = this.roleService.user;
    this.selectedAvatarPreview = '';

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
          this.bio = u.bio || 'No bio provided.';
          this.profileImage = u.avatar_url || '';
          this.skills = u.skills ? u.skills.split(',').map(s => s.trim()) : [];
          this.rate = u.hourly_rate ? '$' + u.hourly_rate + '/hr' : null;
          this.education = u.education || [];
          this.experience = u.experience || [];
          this.isAvailableForHire = u.is_available_for_hire !== false;
        }
      } catch { }
    } else {
      this.isOwnProfile = true;
      if (currentUser) {
        this.displayName = currentUser.full_name || currentUser.username || 'User';
        this.bio = currentUser.bio || 'Add a bio to your profile...';
        this.profileImage = currentUser.avatar_url || '';
        this.skills = currentUser.skills ? currentUser.skills.split(',').map(s => s.trim()) : [];
        this.rate = currentUser.hourly_rate ? '$' + currentUser.hourly_rate + '/hr' : 'Negotiable';
        this.education = currentUser.education || [];
        this.experience = currentUser.experience || [];
        this.isAvailableForHire = currentUser.is_available_for_hire !== false;
      }
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  goToMessages() {
    if (!this.roleService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    const targetUserId = this.route.snapshot.paramMap.get('id');
    if (!targetUserId) {
      this.router.navigate(['/conversations']);
      return;
    }

    this.api.getOrCreateConversationWithUser(targetUserId).subscribe({
      next: (conversation) => {
        this.router.navigate(['/chat', conversation.id]);
      },
      error: () => {
        this.router.navigate(['/conversations']);
      }
    });
  }

  openEdit() {
    this.selectedAvatarPreview = '';
    this.editName = this.displayName;
    this.editBio = this.bio;
    this.editSkills = this.skills.join(', ');
    this.editEducation = this.formatEducation(this.education);
    this.editExperience = this.formatExperience(this.experience);
    this.editPortfolio = this.formatPortfolio(this.portfolioItems);
    this.editRate = this.rate ? this.rate.replace(/[^0-9.]/g, '') : '';
    this.editAvailableForHire = this.isAvailableForHire;
    this.saveMsg = '';
    this.editing = true;
  }

  async handleSave() {
    try {
      this.saving = true;
      const payload: any = {};
      if (this.editName) payload.full_name = this.editName.trim();
      if (this.editBio) payload.bio = this.editBio.trim();
      if (this.editSkills) payload.skills = this.editSkills.trim();
      payload.education = this.parseEducation(this.editEducation);
      payload.experience = this.parseExperience(this.editExperience);
      payload.portfolio = this.parsePortfolio(this.editPortfolio);
      if (this.editRate) payload.hourly_rate = parseFloat(this.editRate);
      payload.is_available_for_hire = this.editAvailableForHire;

      const updated = await this.api.updateProfile(payload).toPromise();
      if (updated && updated.user) {
        this.displayName = updated.user.full_name || this.displayName;
        this.bio = updated.user.bio || this.bio;
        this.profileImage = updated.user.avatar_url || '';
        this.skills = updated.user.skills ? updated.user.skills.split(',').map((skill: string) => skill.trim()) : this.skills;
        this.rate = updated.user.hourly_rate ? '$' + updated.user.hourly_rate + '/hr' : null;
        this.education = updated.user.education || this.education;
        this.experience = updated.user.experience || this.experience;
        this.isAvailableForHire = updated.user.is_available_for_hire !== false;
        this.portfolioItems = updated.user.portfolio?.length
          ? updated.user.portfolio.map((item: any, index: number) => ({
              id: index + 1,
              title: item.title || 'Project',
              image: item.image_url || item.image || this.defaultAvatar,
            }))
          : this.portfolioItems;
        this.roleService.updateCurrentUser(updated.user);
      }
      this.saveMsg = "Profile saved!";
      setTimeout(() => { this.editing = false; this.saveMsg = ''; }, 1200);
    } catch (err) {
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

    this.selectedAvatarPreview = URL.createObjectURL(file);

    try {
      this.saving = true;
      this.saveMsg = '';
      const uploaded = await this.api.uploadProfileImage(file).toPromise();
      if (uploaded?.user) {
        this.profileImage = uploaded.user.avatar_url || '';
        this.selectedAvatarPreview = '';
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

  private formatEducation(items: any[]): string {
    return (items || []).map(item => [item?.degree, item?.school, item?.year].filter(Boolean).join(' | ')).join('\n');
  }

  private formatExperience(items: any[]): string {
    return (items || []).map(item => [item?.role, item?.company, item?.duration].filter(Boolean).join(' | ')).join('\n');
  }

  private formatPortfolio(items: any[]): string {
    return (items || []).map(item => [item?.title, item?.image || item?.image_url].filter(Boolean).join(' | ')).join('\n');
  }

  private parseEducation(text: string): any[] {
    return this.parseLines(text, ['degree', 'school', 'year']);
  }

  private parseExperience(text: string): any[] {
    return this.parseLines(text, ['role', 'company', 'duration']);
  }

  private parsePortfolio(text: string): any[] {
    return this.parseLines(text, ['title', 'image_url']);
  }

  private parseLines(text: string, keys: string[]): any[] {
    return (text || '')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split('|').map(part => part.trim()).filter(Boolean);
        const item: any = {};
        keys.forEach((key, index) => {
          if (parts[index]) {
            item[key] = parts[index];
          }
        });
        return item;
      })
      .filter(item => Object.keys(item).length > 0);
  }

  handleLogout() {
    this.roleService.logout();
    this.router.navigate(['/login']);
  }
}
