import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService, ApiJob } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-gigs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, BottomNavComponent],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>{{ isClient() ? 'My Projects' : 'Browse Gigs' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button><ion-icon name="search"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
      <div *ngIf="isClient()" class="tabs-container">
        <button class="tab-btn" [class.active]="activeTab === 'mine'" (click)="setTab('mine')">
          My Jobs
          <div *ngIf="activeTab === 'mine'" class="tab-indicator"></div>
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'all'" (click)="setTab('all')">
          All Jobs
          <div *ngIf="activeTab === 'all'" class="tab-indicator"></div>
        </button>
      </div>
      <div class="search-bar">
        <div class="search-input-wrapper">
          <ion-icon name="search-outline"></ion-icon>
          <input type="text" placeholder="Search gigs..." [(ngModel)]="search" />
        </div>
      </div>
    </ion-header>

    <ion-content class="gigs-content">
      <div *ngIf="loading" class="spinner-container">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
      </div>
      
      <div *ngIf="error && !loading" class="error-msg">{{ error }}</div>
      
      <div *ngIf="!loading && !error && filteredJobs.length === 0" class="empty-state">
        <ion-icon name="briefcase-outline" class="empty-icon"></ion-icon>
        <p>No gigs found</p>
        <button *ngIf="isClient()" class="post-btn" (click)="goToCreate()">Post a Job</button>
      </div>

      <div class="job-list" *ngIf="!loading && !error">
        <div *ngFor="let job of filteredJobs" class="job-card elevation-1" (click)="openJobModal(job)">
          <div class="card-header">
            <div class="client-avatar">{{ (job.client_name || 'C')[0] | uppercase }}</div>
            <div class="card-title-area">
              <span class="client-name">{{ job.client_name || 'Client' }}</span>
              <h3>{{ job.title }}</h3>
            </div>
            <span class="status-badge" [ngClass]="job.status === 'open' ? 'status-open' : (job.status === 'in_progress' ? 'status-progress' : 'status-closed')">
              {{ job.status === 'in_progress' ? 'In Progress' : (job.status | titlecase) }}
            </span>
          </div>
          <p class="job-desc">{{ job.description }}</p>
          <div class="job-stats">
            <div class="stats-left">
              <div *ngIf="job.duration" class="stat-item"><ion-icon name="time-outline"></ion-icon> {{ job.duration }}</div>
              <div *ngIf="job.application_count !== undefined" class="stat-item"><ion-icon name="person-outline"></ion-icon> {{ job.application_count }} applied</div>
            </div>
            <div class="budget">
              <ion-icon name="logo-usd"></ion-icon> {{ job.budget }}
            </div>
          </div>
          <div class="skills-list" *ngIf="job.skills_required">
            <span *ngFor="let s of job.skills_required.split(',')" class="skill-tag">{{ s.trim() }}</span>
          </div>
        </div>
      </div>

      <ion-fab *ngIf="isClient()" vertical="bottom" horizontal="end" slot="fixed" class="custom-fab">
        <ion-fab-button color="primary" (click)="goToCreate()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <app-bottom-nav></app-bottom-nav>

    <!-- Modal implementation would go here -->
    <div class="modal-overlay" *ngIf="selectedJob" (click)="selectedJob = null"></div>
    <div class="bottom-sheet" *ngIf="selectedJob" [class.show]="selectedJob">
       <div class="modal-header">
          <div>
            <h2>{{ selectedJob.title }}</h2>
            <p>{{ selectedJob.client_name || 'Client' }}</p>
          </div>
          <ion-button fill="clear" color="medium" (click)="selectedJob = null"><ion-icon name="close"></ion-icon></ion-button>
       </div>
       <div class="modal-body">
         <p class="desc">{{ selectedJob.description }}</p>
         <button class="apply-btn">Apply for this Job</button>
       </div>
    </div>
  `,
  styles: [`
    ion-toolbar { --background: white; border-bottom: 1px solid #F3F4F6; }
    ion-title { font-size: 18px; font-weight: 600; }
    
    .tabs-container { display: flex; border-bottom: 1px solid #E5E7EB; background: white; }
    .tab-btn { flex: 1; padding: 12px 0; background: transparent; border: none; font-size: 14px; font-weight: 700; color: #6B7280; position: relative; transition: color 0.2s; }
    .tab-btn.active { color: #8B5CF6; }
    .tab-indicator { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: #8B5CF6; }
    
    .search-bar { background: white; padding: 12px 16px; border-bottom: 1px solid #E5E7EB; }
    .search-input-wrapper { display: flex; align-items: center; gap: 8px; background: #F3F4F6; border-radius: 12px; height: 40px; padding: 0 16px; }
    .search-input-wrapper ion-icon { color: #6B7280; }
    .search-input-wrapper input { flex: 1; background: transparent; border: none; outline: none; font-size: 14px; color: #111827; }
    
    .gigs-content { --background: #F9FAFB; }
    .spinner-container { display: flex; justify-content: center; padding: 40px; }
    .error-msg { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; padding: 16px; margin: 16px; border-radius: 12px; text-align: center; }
    
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 64px 16px; text-align: center; }
    .empty-icon { font-size: 48px; color: #E5E7EB; margin-bottom: 12px; }
    .empty-state p { font-size: 14px; font-weight: 700; color: #6B7280; margin-bottom: 16px; }
    .post-btn { background: #8B5CF6; color: white; padding: 10px 24px; border-radius: 9999px; font-size: 12px; font-weight: 700; border: none; }
    
    .job-list { padding: 16px; display: flex; flex-direction: column; gap: 12px; padding-bottom: 80px; }
    .job-card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; }
    .card-header { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }
    .client-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; display: flex; justify-content: center; align-items: center; font-weight: 700; font-size: 14px; }
    .card-title-area { flex: 1; min-width: 0; }
    .client-name { font-size: 11px; color: #6B7280; font-weight: 500; }
    .card-title-area h3 { font-size: 14px; font-weight: 700; color: #111827; margin: 2px 0 0; line-height: 1.2; }
    .status-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; }
    .status-open { background: #DCFCE7; color: #16A34A; }
    .status-progress { background: #EFF6FF; color: #2563EB; }
    .status-closed { background: #F3F4F6; color: #6B7280; }
    
    .job-desc { font-size: 12px; color: #6B7280; line-height: 1.5; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    
    .job-stats { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .stats-left { display: flex; gap: 12px; font-size: 12px; color: #6B7280; }
    .stat-item { display: flex; align-items: center; gap: 4px; }
    .budget { display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 700; color: #8B5CF6; }
    
    .skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag { background: #F3E8FF; color: #8B5CF6; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; }
    
    .custom-fab { margin-bottom: 60px; }
    .custom-fab ion-fab-button { --background: #8B5CF6; --background-hover: #7C3AED; }
    
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; }
    .bottom-sheet { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-radius: 24px 24px 0 0; padding: 24px; z-index: 101; transform: translateY(100%); transition: transform 0.3s; }
    .bottom-sheet.show { transform: translateY(0); }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .modal-header h2 { font-size: 16px; font-weight: 700; margin: 0; }
    .modal-header p { font-size: 12px; color: #6B7280; margin: 4px 0 0; }
    .desc { font-size: 14px; color: #4B5563; line-height: 1.6; margin-bottom: 24px; }
    .apply-btn { width: 100%; padding: 14px; background: #8B5CF6; color: white; border-radius: 9999px; font-size: 14px; font-weight: 700; border: none; }
  `]
})
export class GigsListPage implements OnInit {
  role = 'freelancer';
  search = '';
  activeTab = 'all';
  tabs = ['all', 'mine'];
  jobs: ApiJob[] = [];
  loading = false;
  error: string | null = null;
  selectedJob: ApiJob | null = null;

  mockJobs: ApiJob[] = [];

  constructor(private router: Router, private roleService: RoleService, private api: ApiService) { }

  ngOnInit() {
    this.roleService.user$.subscribe(user => {
      this.role = user?.user_type || 'freelancer';
      this.activeTab = this.isClient() ? 'mine' : 'all';
      this.loadJobs();
    });
  }

  isClient(): boolean {
    return this.role === 'client';
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.loadJobs();
  }

  goToCreate() {
    this.router.navigate(['/create-gig']);
  }

  openJobModal(job: ApiJob) {
    this.selectedJob = job;
  }

  async loadJobs() {
    try {
      this.loading = true;
      const data = this.isClient() ? await this.api.getMyJobs().toPromise() : await this.api.getJobs().toPromise();
      this.jobs = data || [];
    } catch {
      this.error = 'Failed to load jobs';
    } finally {
      this.loading = false;
    }
  }

  get filteredJobs() {
    if (!this.search.trim()) return this.jobs;
    const term = this.search.toLowerCase();
    return this.jobs.filter((job) =>
      (job.title?.toLowerCase() || '').includes(term) ||
      (job.description?.toLowerCase() || '').includes(term) ||
      (job.skills_required?.toLowerCase() || '').includes(term)
    );
  }
}
