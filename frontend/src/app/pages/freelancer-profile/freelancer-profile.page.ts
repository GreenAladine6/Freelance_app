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
        <div class="header-top">
          <ion-button fill="clear" color="dark" (click)="goBack()" class="back-btn"><ion-icon name="arrow-back"></ion-icon></ion-button>
        </div>
        
        <div class="profile-info-center">
          <div class="avatar-wrap">
            <img src="https://i.pravatar.cc/150?u=freelancer" alt="Profile" class="main-avatar" />
            <div class="status-indicator"></div>
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
          <p *ngIf="rate" class="rate-text">{{ rate }}</p>
          <p class="availability-text">Available for hire</p>
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
          <div class="skills-container">
            <span *ngFor="let skill of skills" class="skill-tag">{{ skill }}</span>
          </div>
        </div>

        <div class="section-card">
          <div class="section-header">
            <h3>Portfolio</h3>
            <button class="see-all-btn">See All</button>
          </div>
          <div class="grid-2">
            <div *ngFor="let item of portfolioItems" class="portfolio-item">
              <img [src]="item.image" [alt]="item.title" />
              <div class="portfolio-overlay">
                <p>{{ item.title }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Logout Button -->
        <div class="logout-section" *ngIf="isOwnProfile">
          <button class="logout-btn" (click)="handleLogout()">
            <ion-icon name="log-out-outline"></ion-icon>
            Sign Out
          </button>
        </div>
      </div>

      <ion-fab *ngIf="isOwnProfile" vertical="bottom" horizontal="end" slot="fixed" class="custom-fab">
        <ion-fab-button color="primary" (click)="openEdit()">
          <ion-icon name="pencil"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <div class="modal-overlay" *ngIf="editing" (click)="editing = false"></div>
    <div class="bottom-sheet" *ngIf="editing" [class.show]="editing">
      <h3>Edit Profile</h3>
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
      <div class="form-group mb-lg">
        <label>Hourly Rate ($)</label>
        <input type="number" [(ngModel)]="editRate" placeholder="45" class="custom-input" />
      </div>
      
      <p class="save-msg" *ngIf="saveMsg">{{ saveMsg }}</p>
      
      <button class="save-btn" [disabled]="saving" (click)="handleSave()">
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .profile-content { --background: #F5F5F5; }
    .profile-header { background: white; padding: 16px 16px 48px; position: relative; border-bottom: 1px solid #F3F4F6; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .header-top { display: flex; justify-content: flex-start; margin-bottom: 24px; }
    .back-btn { margin-left: -8px; }
    .profile-info-center { display: flex; flex-direction: column; align-items: center; }
    .avatar-wrap { position: relative; margin-bottom: 16px; }
    .main-avatar { width: 120px; height: 120px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); object-fit: cover; }
    .status-indicator { position: absolute; bottom: 8px; right: 8px; width: 20px; height: 20px; background: #22c55e; border: 2px solid white; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    .display-name { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px; }
    .badges-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .role-badge { background: #F3E8FF; color: #8B5CF6; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 12px; border-radius: 9999px; }
    .rating-badge { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: #374151; }
    .text-muted { color: #9CA3AF; font-weight: 500; }
    .rate-text { font-size: 12px; font-weight: 700; color: #8B5CF6; margin: 0 0 4px; }
    .availability-text { font-size: 12px; font-weight: 700; color: #16a34a; margin: 0; }
    .content-sections { padding: 0 16px; margin-top: -24px; position: relative; z-index: 10; display: flex; flex-direction: column; gap: 16px; padding-bottom: 100px; }
    .section-card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .section-card h3 { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 12px; }
    .cv-item { margin-bottom: 12px; }
    .cv-title { font-size: 13px; font-weight: 700; color: #374151; margin: 0 0 2px; }
    .cv-subtitle { font-size: 11px; font-weight: 500; color: #6B7280; margin: 0 0 4px; }
    .empty-text { font-style: italic; color: #9CA3AF; }
    .body-text { font-size: 12px; color: #4B5563; line-height: 1.6; margin: 0; }
    .skills-container { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-tag { background: #F3E8FF; color: #8B5CF6; font-size: 10px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; border: 1px solid #E9D5FF; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h3 { margin: 0; }
    .see-all-btn { font-size: 10px; font-weight: 700; color: #8B5CF6; background: transparent; border: none; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .portfolio-item { aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid #F3F4F6; }
    .portfolio-item img { width: 100%; height: 100%; object-fit: cover; }
    .portfolio-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6), transparent); display: flex; align-items: flex-end; padding: 8px; opacity: 0; transition: opacity 0.3s; }
    .portfolio-item:hover .portfolio-overlay { opacity: 1; }
    .portfolio-overlay p { font-size: 9px; font-weight: 700; color: white; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
    .custom-fab { margin-bottom: 60px; }
    .custom-fab ion-fab-button { --background: #8B5CF6; --background-hover: #7C3AED; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; }
    .bottom-sheet { position: fixed; bottom: 0; left: 0; right: 0; max-width: 360px; margin: 0 auto; background: white; border-radius: 24px 24px 0 0; padding: 24px; z-index: 101; transform: translateY(100%); transition: transform 0.3s; }
    .bottom-sheet.show { transform: translateY(0); }
    .bottom-sheet h3 { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 20px; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: #4B5563; margin-bottom: 4px; }
    .custom-input, .custom-textarea { width: 100%; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 10px 16px; font-size: 14px; outline: none; }
    .custom-textarea { resize: none; }
    .mb { margin-bottom: 16px; }
    .mb-lg { margin-bottom: 24px; }
    .save-msg { font-size: 12px; font-weight: 500; color: #16A34A; margin: 0 0 12px; }
    .save-btn { width: 100%; padding: 14px; background: #8B5CF6; color: white; border-radius: 9999px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; }
    .save-btn:disabled { opacity: 0.6; }
    .logout-section { margin-top: 32px; padding: 0 8px; }
    .logout-btn {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 14px; background: white; border: 2px solid #FEF2F2; color: #EF4444;
      border-radius: 16px; font-size: 14px; font-weight: 700; cursor: pointer;
    }
    .logout-btn:active { background: #FEF2F2; transform: scale(0.98); }
  `]
})
export class FreelancerProfilePage implements OnInit {
  displayName = 'Freelancer';
  bio = 'Expert UI/UX Designer & Full-stack Developer with over 5 years of experience.';
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
  editRate = '';
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
    this.loadProfile();
  }

  loadProfile() {
    const id = this.route.snapshot.paramMap.get('id');
    const currentUser = this.roleService.user;

    if (id && id !== currentUser?.id) {
      this.isOwnProfile = false;
      this.api.getUser(id).subscribe(u => {
        this.displayName = u.full_name || u.username || 'User';
        this.bio = u.bio || 'No bio provided.';
        this.skills = u.skills ? u.skills.split(',').map(s => s.trim()) : [];
        this.rate = u.hourly_rate ? '$' + u.hourly_rate + '/hr' : null;
        this.education = u.education || [];
        this.experience = u.experience || [];
      });
    } else {
      this.isOwnProfile = true;
      if (currentUser) {
        this.displayName = currentUser.full_name || currentUser.username || 'User';
        this.bio = currentUser.bio || 'Add a bio to your profile...';
        this.skills = currentUser.skills ? currentUser.skills.split(',').map(s => s.trim()) : [];
        this.rate = currentUser.hourly_rate ? '$' + currentUser.hourly_rate + '/hr' : 'Negotiable';
        this.education = currentUser.education || [];
        this.experience = currentUser.experience || [];
      }
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  openEdit() {
    this.editName = this.displayName;
    this.editBio = this.bio;
    this.editSkills = this.skills.join(', ');
    this.editRate = this.rate ? this.rate.replace(/[^0-9.]/g, '') : '';
    this.saveMsg = '';
    this.editing = true;
  }

  async handleSave() {
    try {
      this.saving = true;
      const payload: any = {};
      if (this.editName) payload.full_name = this.editName;
      if (this.editBio) payload.bio = this.editBio;
      if (this.editSkills) payload.skills = this.editSkills;
      if (this.editRate) payload.hourly_rate = parseFloat(this.editRate);

      const updated = await this.api.updateProfile(payload).toPromise();
      if (updated && updated.user) {
        this.displayName = updated.user.full_name || this.displayName;
        this.bio = updated.user.bio || this.bio;
        this.skills = updated.user.skills ? updated.user.skills.split(',') : this.skills;
        this.rate = updated.user.hourly_rate ? '$' + updated.user.hourly_rate + '/hr' : null;
      }
      this.saveMsg = "Profile saved!";
      setTimeout(() => { this.editing = false; this.saveMsg = ''; }, 1200);
    } catch (err) {
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
