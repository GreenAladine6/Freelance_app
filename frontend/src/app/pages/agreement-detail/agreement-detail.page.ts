import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, ApiAgreement } from '../../services/api.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-agreement-detail',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/agreements" icon="arrow-back"></ion-back-button>
        </ion-buttons>
        <ion-title>Contract Agreement</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="agreement-content" *ngIf="agreement">
      <!-- Project Info -->
      <div class="section project-info">
        <h2>{{ agreement.job_title }}</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Client</span>
            <span class="value">{{ agreement.client_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Freelancer</span>
            <span class="value">{{ agreement.freelancer_name }}</span>
          </div>
        </div>
      </div>

      <!-- Budget & Fees -->
      <div class="section budget-section">
        <h3>Budget Breakdown</h3>
        <div class="budget-row">
          <span class="budget-label">Total Budget</span>
          <span class="budget-amount">\${{ agreement.budget.toFixed(2) }}</span>
        </div>
        <div class="budget-row">
          <span class="budget-label">Platform Fee ({{ agreement.app_fee_percent }}%)</span>
          <span class="budget-amount">-\${{ agreement.app_fee.toFixed(2) }}</span>
        </div>
        <div class="budget-row total">
          <span class="budget-label">Freelancer Receives</span>
          <span class="budget-amount">\${{ agreement.freelancer_payout.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Status Timeline -->
      <div class="section status-timeline">
        <h3>Agreement Status</h3>
        <div class="status-step" [class.completed]="agreement.client_approved || agreement.freelancer_approved">
          <div class="status-icon">
            <ion-icon name="checkmark-circle" *ngIf="agreement.client_approved || agreement.freelancer_approved"></ion-icon>
            <ion-icon name="ellipse" *ngIf="!agreement.client_approved && !agreement.freelancer_approved"></ion-icon>
          </div>
          <div class="status-content">
            <span class="status-title">Approvals Pending</span>
            <span class="status-desc">
              Client: <strong [class.approved]="agreement.client_approved">{{ agreement.client_approved ? '✓ Approved' : '⏳ Pending' }}</strong>
              · Freelancer: <strong [class.approved]="agreement.freelancer_approved">{{ agreement.freelancer_approved ? '✓ Approved' : '⏳ Pending' }}</strong>
            </span>
          </div>
        </div>

        <div class="status-step" [class.completed]="agreement.payment_status === 'held' || agreement.payment_status === 'paid'">
          <div class="status-icon">
            <ion-icon name="checkmark-circle" *ngIf="agreement.payment_status === 'held' || agreement.payment_status === 'paid'"></ion-icon>
            <ion-icon name="ellipse" *ngIf="agreement.payment_status === 'pending'"></ion-icon>
          </div>
          <div class="status-content">
            <span class="status-title">Payment</span>
            <span class="status-desc">{{ agreement.payment_status | titlecase }}</span>
          </div>
        </div>

        <div class="status-step" [class.completed]="agreement.completion_status === 'approved'">
          <div class="status-icon">
            <ion-icon name="checkmark-circle" *ngIf="agreement.completion_status === 'approved'"></ion-icon>
            <ion-icon name="ellipse" *ngIf="agreement.completion_status !== 'approved'"></ion-icon>
          </div>
          <div class="status-content">
            <span class="status-title">Project Completion</span>
            <span class="status-desc">{{ agreement.completion_status | titlecase }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="section actions-section">
        <!-- Client Actions -->
        <div *ngIf="isClient">
          <ion-button
            expand="block"
            color="primary"
            (click)="approveAgreement()"
            [disabled]="agreement.client_approved || loading"
            class="action-btn"
          >
            <ion-icon name="checkmark-outline" slot="start"></ion-icon>
            {{ agreement.client_approved ? 'You Approved This' : 'Approve Agreement' }}
          </ion-button>

          <ion-button
            expand="block"
            color="success"
            (click)="processPayment()"
            [disabled]="!agreement.both_approved || agreement.payment_status !== 'pending' || loading"
            class="action-btn"
          >
            <ion-icon name="wallet-outline" slot="start"></ion-icon>
            Pay \${{ agreement.budget.toFixed(2) }} Now
          </ion-button>

          <ion-button
            expand="block"
            color="tertiary"
            (click)="approveCompletion()"
            [disabled]="agreement.completion_status !== 'submitted' || loading"
            class="action-btn"
          >
            <ion-icon name="thumbs-up-outline" slot="start"></ion-icon>
            Approve & Release Payment
          </ion-button>
        </div>

        <!-- Freelancer Actions -->
        <div *ngIf="isFreelancer">
          <ion-button
            expand="block"
            color="primary"
            (click)="approveAgreement()"
            [disabled]="agreement.freelancer_approved || loading"
            class="action-btn"
          >
            <ion-icon name="checkmark-outline" slot="start"></ion-icon>
            {{ agreement.freelancer_approved ? 'You Approved This' : 'Approve Agreement' }}
          </ion-button>

          <ion-button
            expand="block"
            color="secondary"
            (click)="submitCompletion()"
            [disabled]="agreement.payment_status !== 'held' || agreement.completion_status !== 'in_progress' || loading"
            class="action-btn"
          >
            <ion-icon name="checkmark-done-outline" slot="start"></ion-icon>
            Submit for Approval
          </ion-button>
        </div>

        <ion-button
          expand="block"
          fill="outline"
          color="medium"
          (click)="goBack()"
          class="action-btn"
        >
          Back to Agreements
        </ion-button>
      </div>

      <ion-spinner *ngIf="loading" name="crescent"></ion-spinner>
    </ion-content>
  `,
  styles: [`
    .agreement-content {
      --background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
      padding-bottom: 100px;
    }

    .section {
      margin: 20px 16px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    }

    h2 {
      font-size: 20px;
      font-weight: 800;
      color: #111827;
      margin: 0 0 16px;
    }

    h3 {
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 12px;
    }

    .project-info {
      border-left: 4px solid #7c3aed;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
    }

    /* Budget Section */
    .budget-section {
      border-left: 4px solid #10b981;
    }

    .budget-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }

    .budget-row.total {
      border-bottom: none;
      border-top: 2px solid #d1d5db;
      margin-top: 8px;
      padding-top: 12px;
      font-weight: 700;
      color: #111827;
    }

    .budget-label {
      color: #6b7280;
    }

    .budget-amount {
      color: #1f2937;
      font-weight: 700;
    }

    /* Status Timeline */
    .status-timeline {
      border-left: 4px solid #06b6d4;
    }

    .status-step {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      padding: 12px;
      background: #f3f4f6;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .status-step.completed {
      background: #ecfdf5;
      border-left: 3px solid #10b981;
    }

    .status-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 28px;
    }

    .status-icon ion-icon {
      font-size: 24px;
      color: #9ca3af;
    }

    .status-step.completed .status-icon ion-icon {
      color: #10b981;
    }

    .status-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .status-title {
      font-weight: 700;
      color: #111827;
      font-size: 14px;
    }

    .status-desc {
      font-size: 12px;
      color: #6b7280;
    }

    .status-desc strong {
      color: #1f2937;
    }

    .status-desc strong.approved {
      color: #10b981;
    }

    /* Actions */
    .actions-section {
      border-left: 4px solid #f59e0b;
      padding: 16px;
    }

    .action-btn {
      --border-radius: 12px;
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      height: 44px;
      margin-bottom: 10px;
      font-weight: 700;
      font-size: 14px;
    }

    .action-btn:disabled {
      opacity: 0.6;
    }

    ion-spinner {
      display: flex;
      justify-content: center;
      margin: 40px 0;
      color: #7c3aed;
    }
  `]
})
export class AgreementDetailPage implements OnInit {
  agreement: ApiAgreement | null = null;
  loading = false;
  isClient = false;
  isFreelancer = false;
  currentUserId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private roleService: RoleService,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.currentUserId = this.roleService.user?.id || '';
    const agreementId = this.route.snapshot.paramMap.get('id');
    if (agreementId) {
      this.loadAgreement(agreementId);
    }
  }

  loadAgreement(id: string) {
    this.loading = true;
    this.api.getAgreement(id).subscribe({
      next: (agreement) => {
        this.agreement = agreement;
        this.isClient = agreement.client_id === this.currentUserId;
        this.isFreelancer = agreement.freelancer_id === this.currentUserId;
        this.loading = false;
      },
      error: (err) => {
        this.showToast('Failed to load agreement', 'danger');
        this.loading = false;
      }
    });
  }

  approveAgreement() {
    if (!this.agreement) return;
    this.loading = true;

    this.api.approveAgreement(this.agreement.id).subscribe({
      next: (res) => {
        this.agreement = res.agreement;
        this.showToast('Agreement approved successfully', 'success');
        this.loading = false;
      },
      error: (err) => {
        this.showToast('Failed to approve agreement', 'danger');
        this.loading = false;
      }
    });
  }

  processPayment() {
    if (!this.agreement) return;
    this.loading = true;

    this.api.processPayment(this.agreement.id).subscribe({
      next: (res) => {
        this.agreement = res.agreement;
        this.showToast('Payment processed successfully', 'success');
        this.loading = false;
      },
      error: (err) => {
        this.showToast('Payment failed: ' + (err.error?.error || 'Unknown error'), 'danger');
        this.loading = false;
      }
    });
  }

  submitCompletion() {
    if (!this.agreement) return;
    this.loading = true;

    this.api.submitCompletion(this.agreement.id).subscribe({
      next: (res) => {
        this.agreement = res.agreement;
        this.showToast('Project submitted for approval', 'success');
        this.loading = false;
      },
      error: (err) => {
        this.showToast('Failed to submit completion', 'danger');
        this.loading = false;
      }
    });
  }

  approveCompletion() {
    if (!this.agreement) return;
    this.loading = true;

    this.api.approveCompletion(this.agreement.id).subscribe({
      next: (res) => {
        this.agreement = res.agreement;
        this.showToast('Project approved! Payment released.', 'success');
        this.loading = false;
      },
      error: (err) => {
        this.showToast('Failed to approve completion', 'danger');
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/agreements']);
  }

  async showToast(message: string, color: 'success' | 'danger' = 'danger') {
    const t = await this.toast.create({ message, duration: 2200, color });
    t.present();
  }
}
