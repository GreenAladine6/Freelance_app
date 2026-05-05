import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ApiService, ApiAgreement } from '../../services/api.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-agreements-list',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button auto-hide="false"></ion-menu-button>
        </ion-buttons>
        <ion-title>Agreements</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="agreements-content">
      <div class="header-section">
        <h1>Contract Management</h1>
        <p>View and manage your project agreements</p>
      </div>

      <!-- Filters -->
      <div class="filter-buttons">
        <ion-button
          *ngFor="let filter of statusFilters"
          [fill]="selectedFilter === filter.value ? 'solid' : 'outline'"
          [color]="selectedFilter === filter.value ? 'primary' : 'medium'"
          (click)="setFilter(filter.value)"
          class="filter-btn"
        >
          {{ filter.label }}
        </ion-button>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredAgreements.length === 0 && !loading">
        <ion-icon name="document-outline"></ion-icon>
        <h2>No Agreements Yet</h2>
        <p *ngIf="selectedFilter === 'all'">
          Start by applying for jobs or accepting applications to create agreements.
        </p>
        <p *ngIf="selectedFilter !== 'all'">
          No agreements match the "{{ selectedFilter }}" filter.
        </p>
      </div>

      <!-- Agreements List -->
      <ion-list lines="none" class="agreements-list" *ngIf="filteredAgreements.length > 0">
        <ion-item
          *ngFor="let agreement of filteredAgreements"
          [routerLink]="['/agreement', agreement.id]"
          detail="false"
          class="agreement-item"
          button
        >
          <div class="agreement-card">
            <!-- Status Badge -->
            <div class="status-badge" [ngClass]="getStatusClass(agreement)">
              {{ getStatusText(agreement) }}
            </div>

            <!-- Main Content -->
            <div class="agreement-main">
              <h3 class="agreement-title">{{ agreement.job_title }}</h3>
              <div class="agreement-meta">
                <span class="meta-item">
                  <ion-icon name="person-outline"></ion-icon>
                  {{ agreement.client_id === currentUserId ? agreement.freelancer_name : agreement.client_name }}
                </span>
                <span class="meta-item" *ngIf="agreement.created_at">
                  <ion-icon name="calendar-outline"></ion-icon>
                  {{ agreement.created_at | date:'short' }}
                </span>
              </div>
            </div>

            <!-- Budget & Action -->
            <div class="agreement-side">
              <div class="budget">
                <span class="budget-label">Budget</span>
                <span class="budget-amount">\${{ agreement.budget.toFixed(0) }}</span>
              </div>
              <ion-icon name="chevron-forward" class="chevron"></ion-icon>
            </div>
          </div>

          <!-- Progress Indicators -->
          <div class="progress-indicators">
            <div class="indicator" [class.done]="agreement.client_approved || agreement.freelancer_approved">
              <span class="dot"></span>
              <span class="label">Approval</span>
            </div>
            <div class="indicator" [class.done]="agreement.payment_status !== 'pending'">
              <span class="dot"></span>
              <span class="label">Payment</span>
            </div>
            <div class="indicator" [class.done]="agreement.completion_status === 'approved'">
              <span class="dot"></span>
              <span class="label">Completion</span>
            </div>
          </div>
        </ion-item>
      </ion-list>

      <ion-spinner *ngIf="loading" name="crescent" class="spinner"></ion-spinner>
    </ion-content>
  `,
  styles: [`
    .agreements-content {
      --background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
      padding-bottom: 20px;
    }

    .header-section {
      padding: 24px 16px;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      color: #ffffff;
    }

    .header-section h1 {
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 8px;
    }

    .header-section p {
      font-size: 14px;
      opacity: 0.9;
      margin: 0;
    }

    /* Filters */
    .filter-buttons {
      display: flex;
      gap: 8px;
      padding: 16px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .filter-btn {
      --padding-start: 12px;
      --padding-end: 12px;
      --border-radius: 20px;
      height: 36px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      color: #6b7280;
      padding: 40px 20px;
    }

    .empty-state ion-icon {
      font-size: 60px;
      color: #d1d5db;
      margin-bottom: 16px;
    }

    .empty-state h2 {
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 8px;
    }

    .empty-state p {
      font-size: 13px;
      color: #6b7280;
      margin: 0;
    }

    /* Agreements List */
    .agreements-list {
      padding: 0 8px;
    }

    .agreement-item {
      margin: 8px;
      --padding-start: 0;
      --padding-end: 0;
      --inner-padding-start: 0;
      --inner-padding-end: 0;
    }

    .agreement-card {
      width: 100%;
      padding: 16px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
      display: flex;
      gap: 16px;
      align-items: flex-start;
      border-left: 4px solid #7c3aed;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .agreement-card:active {
      transform: scale(0.98);
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
      min-width: 60px;
      text-align: center;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.held {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-badge.paid {
      background: #dcfce7;
      color: #15803d;
    }

    .status-badge.approved {
      background: #c6f6d5;
      color: #22543d;
    }

    .agreement-main {
      flex: 1;
      min-width: 0;
    }

    .agreement-title {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .agreement-meta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      font-size: 12px;
      color: #6b7280;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }

    .meta-item ion-icon {
      font-size: 14px;
    }

    .agreement-side {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .budget {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .budget-label {
      font-size: 10px;
      color: #9ca3af;
      font-weight: 600;
      text-transform: uppercase;
    }

    .budget-amount {
      font-size: 16px;
      font-weight: 800;
      color: #7c3aed;
    }

    .chevron {
      font-size: 20px;
      color: #d1d5db;
    }

    /* Progress Indicators */
    .progress-indicators {
      display: flex;
      gap: 12px;
      padding: 12px 16px 0;
      border-top: 1px solid #e5e7eb;
      margin-top: 8px;
    }

    .indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex: 1;
      font-size: 11px;
      color: #9ca3af;
    }

    .indicator.done {
      color: #10b981;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d1d5db;
    }

    .indicator.done .dot {
      background: #10b981;
    }

    /* Spinner */
    .spinner {
      display: flex;
      justify-content: center;
      margin: 40px 0;
      color: #7c3aed;
    }
  `]
})
export class AgreementsListPage implements OnInit {
  agreements: ApiAgreement[] = [];
  filteredAgreements: ApiAgreement[] = [];
  loading = false;
  currentUserId = '';
  selectedFilter: string = 'all';

  statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' }
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    this.currentUserId = this.roleService.user?.id || '';
    this.loadAgreements();
  }

  loadAgreements() {
    this.loading = true;
    this.api.getAgreements().subscribe({
      next: (agreements) => {
        this.agreements = agreements;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load agreements', err);
        this.loading = false;
      }
    });
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedFilter === 'all') {
      this.filteredAgreements = this.agreements;
    } else if (this.selectedFilter === 'pending') {
      this.filteredAgreements = this.agreements.filter(a => !a.both_approved);
    } else if (this.selectedFilter === 'active') {
      this.filteredAgreements = this.agreements.filter(a => a.both_approved && a.payment_status === 'held');
    } else if (this.selectedFilter === 'completed') {
      this.filteredAgreements = this.agreements.filter(a => a.completion_status === 'approved');
    }
  }

  viewAgreement(id: string) {
    this.router.navigate(['/agreement', id]);
  }

  getStatusText(agreement: ApiAgreement): string {
    if (agreement.completion_status === 'approved') {
      return 'Completed';
    } else if (agreement.payment_status === 'held') {
      return 'Active';
    } else if (!agreement.both_approved) {
      return 'Pending';
    }
    return 'Pending Payment';
  }

  getStatusClass(agreement: ApiAgreement): string {
    if (agreement.completion_status === 'approved') {
      return 'approved';
    } else if (agreement.payment_status === 'held') {
      return 'held';
    } else if (agreement.payment_status === 'paid') {
      return 'paid';
    }
    return 'pending';
  }
}
