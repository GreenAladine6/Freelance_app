import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiAgreement, ApiJob, ApiService } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { ToastController } from '@ionic/angular';

type JobFilter = 'all' | 'open' | 'awaiting_agreement' | 'in_progress' | 'completed';

interface ManagedJob {
  job: ApiJob;
  agreement?: ApiAgreement;
  progress: number;
  badgeLabel: string;
  badgeClass: string;
  completionLabel: string;
  hasAgreement: boolean;
  updatedLabel: string;
}

interface JobEditDraft {
  title: string;
  description: string;
  budget: string;
  duration: string;
  skills_required: string;
  status: string;
}

@Component({
  selector: 'app-manage-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, BottomNavComponent],
  template: `
    <ion-content class="jobs-content">
      <div class="page-wrap">
        <header class="hero">
          <div>
            <p class="eyebrow">Job tracker</p>
            <h1>Manage your posted jobs</h1>
            <p>See which jobs are open, in progress, or completed.</p>
          </div>
          <button class="refresh-btn" (click)="refresh()" [disabled]="loading" aria-label="Refresh jobs">
            <ion-icon name="refresh-outline"></ion-icon>
          </button>
        </header>

        <section class="summary-grid">
          <article class="summary-card">
            <span class="summary-label">Total</span>
            <strong>{{ stats.total }}</strong>
          </article>
          <article class="summary-card">
            <span class="summary-label">Open</span>
            <strong>{{ stats.open }}</strong>
          </article>
          <article class="summary-card">
            <span class="summary-label">In progress</span>
            <strong>{{ stats.inProgress }}</strong>
          </article>
          <article class="summary-card success">
            <span class="summary-label">Completed</span>
            <strong>{{ stats.completed }}</strong>
          </article>
        </section>

        <section class="search-card">
          <div class="search-row">
            <ion-icon name="search-outline"></ion-icon>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="applyFilters()"
              placeholder="Search a job title or skill">
          </div>
          <div class="chip-row">
            <button
              *ngFor="let filter of filters"
              class="chip"
              [class.active]="selectedFilter === filter"
              (click)="setFilter(filter)">
              {{ filterLabels[filter] }}
            </button>
          </div>
        </section>

        <section class="jobs-list" *ngIf="filteredJobs.length > 0; else emptyState">
          <article class="job-card" *ngFor="let item of filteredJobs">
            <div class="job-top">
              <div>
                <h2>{{ item.job.title }}</h2>
                <p>{{ item.job.application_count || 0 }} proposals · {{ formatBudget(item.job) }}</p>
              </div>
              <span class="status-pill" [ngClass]="item.badgeClass">{{ item.badgeLabel }}</span>
            </div>

            <p class="job-desc">{{ item.job.description }}</p>

            <div class="status-meta">
              <div class="meta-block">
                <span class="meta-label">Completion</span>
                <strong>{{ item.completionLabel }}</strong>
              </div>
              <div class="meta-block">
                <span class="meta-label">Updated</span>
                <strong>{{ item.updatedLabel }}</strong>
              </div>
            </div>

            <ion-progress-bar [value]="item.progress / 100" color="primary"></ion-progress-bar>

            <div class="action-row">
              <button class="ghost-btn" (click)="goToAgreements(item)">
                {{ item.hasAgreement ? 'View agreement' : 'Track progress' }}
              </button>
              <button class="solid-btn" (click)="goToCreate()">Post new job</button>
            </div>

            <div class="secondary-row">
              <button class="secondary-btn" (click)="openEdit(item)" [disabled]="!canEdit(item)">Edit</button>
              <button class="secondary-btn danger" (click)="deleteJob(item)" [disabled]="deletingJobId === item.job.id || !canDelete(item)">
                {{ deletingJobId === item.job.id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>

            <p class="job-warning" *ngIf="item.agreement">
              This job has an active agreement. Editing and deleting are disabled to avoid breaking the project history.
            </p>

            <div class="agreement-note" *ngIf="item.agreement">
              <span>Agreement:</span>
              <strong>{{ item.agreement.completion_status | titlecase }}</strong>
              <span>·</span>
              <span>{{ item.agreement.payment_status | titlecase }}</span>
            </div>
          </article>
        </section>

        <ng-template #emptyState>
          <div class="empty-state">
            <ion-icon name="folder-open-outline"></ion-icon>
            <h2>No jobs found</h2>
            <p *ngIf="loading">Loading your jobs...</p>
            <p *ngIf="!loading">Try a different filter or post a new project.</p>
            <button class="solid-btn" (click)="goToCreate()">Post a job</button>
          </div>
        </ng-template>

        <div class="error-banner" *ngIf="error">
          {{ error }}
        </div>
      </div>
    </ion-content>

    <div class="edit-backdrop" *ngIf="editingItem" (click)="cancelEdit()"></div>
    <section class="edit-sheet" *ngIf="editingItem">
      <div class="edit-header">
        <div>
          <p class="edit-eyebrow">Edit job</p>
          <h2>{{ editingItem.job.title }}</h2>
        </div>
        <button class="close-btn" (click)="cancelEdit()" aria-label="Close editor">
          <ion-icon name="close"></ion-icon>
        </button>
      </div>

      <div class="edit-form">
        <label>
          Title
          <input type="text" [(ngModel)]="editDraft.title" placeholder="Job title">
        </label>
        <label>
          Description
          <textarea rows="4" [(ngModel)]="editDraft.description" placeholder="Describe the job"></textarea>
        </label>
        <div class="edit-grid">
          <label>
            Budget
            <input type="number" min="1" [(ngModel)]="editDraft.budget" placeholder="0">
          </label>
          <label>
            Duration
            <input type="text" [(ngModel)]="editDraft.duration" placeholder="Flexible">
          </label>
        </div>
        <label>
          Required skills
          <input type="text" [(ngModel)]="editDraft.skills_required" placeholder="Design, Angular, ...">
        </label>
        <label>
          Status
          <select [(ngModel)]="editDraft.status">
            <option value="open">Open</option>
            <option value="awaiting_agreement">Awaiting agreement</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </div>

      <p class="edit-error" *ngIf="editError">{{ editError }}</p>

      <div class="edit-actions">
        <button class="secondary-btn" (click)="cancelEdit()" [disabled]="savingEdit">Cancel</button>
        <button class="solid-btn" (click)="saveEdit()" [disabled]="savingEdit">
          {{ savingEdit ? 'Saving...' : 'Save changes' }}
        </button>
      </div>
    </section>

    <button class="fab" (click)="goToCreate()">
      <ion-icon name="add"></ion-icon>
    </button>
    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .jobs-content {
      --background:
        radial-gradient(circle at top, rgba(139, 92, 246, 0.16), transparent 28%),
        linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    }
    .page-wrap { max-width: 420px; margin: 0 auto; padding: 12px 0 100px; }
    .hero {
      margin: 0 12px 16px; padding: 18px; border-radius: 24px; color: white;
      background: linear-gradient(135deg, #8B5CF6, #6D28D9 55%, #4F46E5);
      display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
      box-shadow: 0 14px 30px rgba(139, 92, 246, 0.28);
    }
    .eyebrow { margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px; font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.8); }
    .hero h1 { margin: 0 0 6px; font-size: 22px; font-weight: 800; }
    .hero p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.85); }
    .refresh-btn {
      background: rgba(255,255,255,0.14); color: white; border: none; border-radius: 14px;
      width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
    }
    .refresh-btn:disabled { opacity: 0.6; }
    .summary-grid {
      display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding: 0 12px 12px;
    }
    .summary-card {
      background: rgba(255,255,255,0.95); border-radius: 18px; padding: 14px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.07);
    }
    .summary-card.success { background: linear-gradient(135deg, #ecfdf5, #d1fae5); }
    .summary-label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6b7280; margin-bottom: 6px; }
    .summary-card strong { font-size: 22px; color: #111827; }
    .search-card {
      margin: 0 12px 14px; padding: 14px; border-radius: 18px; background: rgba(255,255,255,0.95);
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.07);
    }
    .search-row {
      display: flex; align-items: center; gap: 8px; background: #f3f4f6; border-radius: 14px;
      padding: 0 14px; height: 44px; margin-bottom: 12px;
    }
    .search-row ion-icon { color: #6b7280; font-size: 16px; }
    .search-row input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; color: #111827; min-width: 0; }
    .chip-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
    .chip {
      white-space: nowrap; border: 1px solid #e5e7eb; background: white; color: #374151;
      border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 700;
    }
    .chip.active { background: #8B5CF6; border-color: #8B5CF6; color: white; }
    .jobs-list { display: flex; flex-direction: column; gap: 12px; padding: 0 12px; }
    .job-card {
      background: rgba(255,255,255,0.96); border-radius: 20px; padding: 16px;
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08); border: 1px solid rgba(229, 231, 235, 0.7);
    }
    .job-top { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; margin-bottom: 10px; }
    .job-top h2 { margin: 0 0 4px; font-size: 16px; font-weight: 800; color: #111827; }
    .job-top p { margin: 0; font-size: 12px; color: #6b7280; }
    .status-pill {
      font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px;
      padding: 6px 10px; border-radius: 999px; white-space: nowrap;
    }
    .status-pill.open { background: #eff6ff; color: #2563eb; }
    .status-pill.awaiting_agreement { background: #fff7ed; color: #c2410c; }
    .status-pill.in_progress { background: #ecfdf5; color: #059669; }
    .status-pill.completed { background: #ede9fe; color: #7c3aed; }
    .job-desc { margin: 0 0 12px; font-size: 13px; line-height: 1.5; color: #4b5563; }
    .status-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }
    .meta-block { background: #f9fafb; border-radius: 14px; padding: 10px 12px; }
    .meta-label { display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px; }
    .meta-block strong { font-size: 13px; color: #111827; }
    ion-progress-bar { --background: #e5e7eb; --progress-background: linear-gradient(90deg, #8B5CF6, #4F46E5); height: 8px; border-radius: 999px; margin-bottom: 12px; }
    .action-row { display: flex; gap: 10px; }
    .ghost-btn, .solid-btn {
      flex: 1; height: 42px; border-radius: 14px; border: none; font-size: 12px; font-weight: 800;
    }
    .ghost-btn { background: #f3f4f6; color: #374151; }
    .solid-btn { background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; }
    .secondary-row { display: flex; gap: 10px; margin-top: 10px; }
    .secondary-btn {
      flex: 1; height: 38px; border-radius: 12px; border: 1px solid #e5e7eb; background: white;
      color: #374151; font-size: 12px; font-weight: 800;
    }
    .secondary-btn.danger { border-color: #fecaca; color: #b91c1c; background: #fef2f2; }
    .agreement-note {
      margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; font-size: 12px; color: #6b7280;
      background: #faf5ff; padding: 10px 12px; border-radius: 14px;
    }
    .agreement-note strong { color: #7c3aed; }
    .job-warning {
      margin: 10px 0 0;
      padding: 10px 12px;
      border-radius: 14px;
      background: #fff7ed;
      color: #9a3412;
      font-size: 12px;
      line-height: 1.45;
    }
    .empty-state {
      margin: 0 12px; padding: 40px 20px; text-align: center; background: rgba(255,255,255,0.95);
      border-radius: 24px; box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
    }
    .empty-state ion-icon { font-size: 56px; color: #d1d5db; margin-bottom: 10px; }
    .empty-state h2 { margin: 0 0 6px; font-size: 18px; color: #111827; }
    .empty-state p { margin: 0 0 16px; font-size: 13px; color: #6b7280; }
    .error-banner {
      margin: 12px; border-radius: 16px; padding: 12px 14px; background: #fef2f2; border: 1px solid #fecaca;
      color: #b91c1c; font-size: 13px;
    }
    .edit-backdrop {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); z-index: 90;
    }
    .edit-sheet {
      position: fixed; left: 12px; right: 12px; bottom: 84px; z-index: 91;
      background: white; border-radius: 24px; padding: 18px;
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.22);
      max-height: calc(100vh - 120px); overflow: auto;
    }
    .edit-header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
    .edit-eyebrow { margin: 0 0 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #8B5CF6; }
    .edit-header h2 { margin: 0; font-size: 18px; color: #111827; }
    .close-btn {
      width: 36px; height: 36px; border: none; border-radius: 12px; background: #f3f4f6; color: #374151;
      display: flex; align-items: center; justify-content: center;
    }
    .edit-form { display: flex; flex-direction: column; gap: 12px; }
    .edit-form label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 800; color: #374151; }
    .edit-form input, .edit-form textarea, .edit-form select {
      width: 100%; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px;
      font-size: 14px; color: #111827; outline: none; background: #fff;
    }
    .edit-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .edit-error { margin: 12px 0 0; color: #b91c1c; font-size: 13px; font-weight: 700; }
    .edit-actions { display: flex; gap: 10px; margin-top: 16px; }
    .fab {
      position: fixed; right: 20px; bottom: 80px; width: 56px; height: 56px; border: none; border-radius: 18px;
      display: flex; align-items: center; justify-content: center; color: white;
      background: linear-gradient(135deg, #8B5CF6, #6D28D9); box-shadow: 0 10px 22px rgba(139,92,246,0.38);
      z-index: 30;
    }
    .fab ion-icon { font-size: 28px; }
  `]
})
export class ManageJobsPage implements OnInit {
  jobs: ApiJob[] = [];
  agreements: ApiAgreement[] = [];
  managedJobs: ManagedJob[] = [];
  filteredJobs: ManagedJob[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  selectedFilter: JobFilter = 'all';
  editingItem: ManagedJob | null = null;
  editDraft: JobEditDraft = this.getEmptyDraft();
  editError: string | null = null;
  savingEdit = false;
  deletingJobId: string | null = null;

  filters: JobFilter[] = ['all', 'open', 'awaiting_agreement', 'in_progress', 'completed'];

  filterLabels: Record<JobFilter, string> = {
    all: 'All',
    open: 'Open',
    awaiting_agreement: 'Awaiting agreement',
    in_progress: 'In progress',
    completed: 'Completed'
  };

  get stats() {
    return {
      total: this.jobs.length,
      open: this.managedJobs.filter(item => item.job.status === 'open').length,
      inProgress: this.managedJobs.filter(item => item.job.status === 'in_progress').length,
      completed: this.managedJobs.filter(item => this.isCompleted(item)).length
    };
  }

  constructor(
    private router: Router,
    private api: ApiService,
    private roleService: RoleService,
    private toast: ToastController
  ) { }

  ngOnInit() {
    if (this.roleService.role !== 'client') {
      void this.router.navigate(['/dashboard']);
      return;
    }

    void this.loadJobs();
  }

  async loadJobs() {
    this.loading = true;
    this.error = null;

    try {
      const [jobs, agreements] = await Promise.all([
        firstValueFrom(this.api.getMyJobs()),
        firstValueFrom(this.api.getAgreements())
      ]);

      this.jobs = jobs || [];
      this.agreements = agreements || [];
      this.managedJobs = this.jobs.map(job => this.mapJob(job));
      this.applyFilters();
    } catch {
      this.jobs = [];
      this.agreements = [];
      this.managedJobs = [];
      this.filteredJobs = [];
      this.error = 'We could not load your jobs right now. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  refresh() {
    if (!this.loading) {
      void this.loadJobs();
    }
  }

  setFilter(filter: JobFilter) {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  applyFilters() {
    const query = this.searchTerm.trim().toLowerCase();

    this.filteredJobs = this.managedJobs.filter(item => {
      const searchable = [
        item.job.title,
        item.job.description,
        item.job.skills_required,
        item.agreement?.completion_status,
        item.agreement?.payment_status
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = !query || searchable.includes(query);
      const matchesFilter = this.selectedFilter === 'all' || item.job.status === this.selectedFilter || (this.selectedFilter === 'completed' && this.isCompleted(item));

      return matchesSearch && matchesFilter;
    });
  }

  goToCreate() {
    this.router.navigate(['/create-gig']);
  }

  goToAgreements(item: ManagedJob) {
    if (item.agreement) {
      this.router.navigate(['/agreement', item.agreement.id]);
      return;
    }

    this.router.navigate(['/agreements']);
  }

  formatBudget(job: ApiJob) {
    const amount = typeof job.budget === 'string' ? Number(job.budget) : job.budget;
    if (!amount || Number.isNaN(amount)) {
      return 'Budget not set';
    }

    return `Budget $${amount}`;
  }

  openEdit(item: ManagedJob) {
    if (!this.canEdit(item)) {
      void this.showToast('This job can no longer be edited.');
      return;
    }

    this.editingItem = item;
    this.editDraft = {
      title: item.job.title || '',
      description: item.job.description || '',
      budget: String(typeof item.job.budget === 'string' ? item.job.budget : item.job.budget ?? ''),
      duration: item.job.duration || '',
      skills_required: item.job.skills_required || '',
      status: item.job.status || 'open'
    };
    this.editError = null;
  }

  cancelEdit() {
    if (this.savingEdit) {
      return;
    }

    this.editingItem = null;
    this.editError = null;
    this.editDraft = this.getEmptyDraft();
  }

  async saveEdit() {
    if (!this.editingItem) {
      return;
    }

    const budget = Number(this.editDraft.budget);
    if (!this.editDraft.title.trim() || !this.editDraft.description.trim() || !budget || Number.isNaN(budget) || budget <= 0) {
      this.editError = 'Title, description, and a valid budget are required.';
      return;
    }

    this.savingEdit = true;
    this.editError = null;

    this.api.updateJob(this.editingItem.job.id, {
      title: this.editDraft.title.trim(),
      description: this.editDraft.description.trim(),
      budget,
      duration: this.editDraft.duration.trim() || undefined,
      skills_required: this.editDraft.skills_required.trim() || undefined,
      status: this.editDraft.status
    }).subscribe({
      next: async () => {
        this.savingEdit = false;
        this.editingItem = null;
        this.editDraft = this.getEmptyDraft();
        await this.loadJobs();
        const t = await this.toast.create({ message: 'Job updated successfully', duration: 1800, color: 'success' });
        t.present();
      },
      error: () => {
        this.savingEdit = false;
        this.editError = 'Could not update the job. Please try again.';
      }
    });
  }

  async deleteJob(item: ManagedJob) {
    if (this.deletingJobId) {
      return;
    }

    if (!this.canDelete(item)) {
      void this.showToast('Delete is disabled for jobs with agreements or completed work.');
      return;
    }

    const message = item.agreement
      ? 'This job already has an agreement. Deleting it will remove the job from your list. Continue?'
      : 'Delete this job? This action cannot be undone.';

    if (!window.confirm(message)) {
      return;
    }

    this.deletingJobId = item.job.id;
    this.api.deleteJob(item.job.id).subscribe({
      next: async () => {
        this.deletingJobId = null;
        await this.loadJobs();
        const t = await this.toast.create({ message: 'Job deleted', duration: 1800, color: 'success' });
        t.present();
      },
      error: async () => {
        this.deletingJobId = null;
        const t = await this.toast.create({ message: 'Could not delete the job', duration: 2200, color: 'danger' });
        t.present();
      }
    });
  }

  private mapJob(job: ApiJob): ManagedJob {
    const agreement = this.agreements.find(item => item.job_id === job.id);
    const completed = this.isCompleted({ job, agreement });
    const progress = completed ? 100 : agreement ? this.getAgreementProgress(agreement) : this.getJobProgress(job.status);

    return {
      job,
      agreement,
      progress,
      badgeLabel: this.getBadgeLabel(job.status, agreement),
      badgeClass: this.getBadgeClass(job.status, agreement),
      completionLabel: this.getCompletionLabel(job.status, agreement),
      hasAgreement: !!agreement,
      updatedLabel: job.status === 'completed' ? 'Done' : agreement?.updated_at ? new Date(agreement.updated_at).toLocaleDateString() : 'Awaiting updates'
    };
  }

  private getBadgeLabel(status: string, agreement?: ApiAgreement) {
    if (agreement?.completion_status === 'approved' || status === 'completed') return 'Completed';
    if (agreement?.completion_status === 'submitted') return 'Review needed';
    if (status === 'in_progress') return 'In progress';
    if (status === 'awaiting_agreement') return 'Awaiting agreement';
    return 'Open';
  }

  private getBadgeClass(status: string, agreement?: ApiAgreement) {
    if (agreement?.completion_status === 'approved' || status === 'completed') return 'completed';
    if (agreement?.completion_status === 'submitted') return 'in_progress';
    if (status === 'in_progress') return 'in_progress';
    if (status === 'awaiting_agreement') return 'awaiting_agreement';
    return 'open';
  }

  private getCompletionLabel(status: string, agreement?: ApiAgreement) {
    if (agreement?.completion_status === 'approved' || status === 'completed') return 'Finished';
    if (agreement?.completion_status === 'submitted') return 'Submitted for approval';
    if (status === 'in_progress') return 'Work in progress';
    if (status === 'awaiting_agreement') return 'Waiting on agreement';
    return 'No active work yet';
  }

  private getJobProgress(status: string) {
    if (status === 'completed') return 100;
    if (status === 'in_progress') return 70;
    if (status === 'awaiting_agreement') return 45;
    return 20;
  }

  private getAgreementProgress(agreement: ApiAgreement) {
    if (agreement.completion_status === 'approved') return 100;
    if (agreement.completion_status === 'submitted') return 85;
    if (agreement.payment_status === 'held') return 65;
    if (agreement.both_approved) return 50;
    return 30;
  }

  private isCompleted(item: { job: ApiJob; agreement?: ApiAgreement }) {
    return item.job.status === 'completed' || item.agreement?.completion_status === 'approved' || item.agreement?.payment_status === 'paid';
  }

  canEdit(item: ManagedJob) {
    return !item.agreement && item.job.status === 'open';
  }

  canDelete(item: ManagedJob) {
    return !item.agreement && item.job.status === 'open';
  }

  private async showToast(message: string) {
    const toast = await this.toast.create({ message, duration: 2200, color: 'medium' });
    toast.present();
  }

  private getEmptyDraft(): JobEditDraft {
    return {
      title: '',
      description: '',
      budget: '',
      duration: '',
      skills_required: '',
      status: 'open'
    };
  }
}