import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ApiService, ApiUser, ApiJob } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { NotificationBadgeComponent } from '../../components/notification-badge/notification-badge.component';

const CATEGORIES = ['Design', 'Development', 'Writing', 'Marketing', 'Video', 'Business'];

@Component({
  selector: 'app-dashboard-client',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, BottomNavComponent, NotificationBadgeComponent],
  template: `
    <ion-content class="client-content">
      <div class="page-wrap">
        <header class="app-bar">
          <div class="user-row">
            <img [src]="currentAvatar" class="avatar" (click)="router.navigate(['/profile-client'])" alt="Profile">
            <div>
              <p class="eyebrow">Client dashboard</p>
              <h2 class="greeting">Hi, {{firstName}} 👋</h2>
            </div>
          </div>
          <div class="icons">
            <button class="icon-btn" (click)="refreshData()" [disabled]="loading" aria-label="Refresh dashboard">
              <ion-icon name="refresh-outline"></ion-icon>
            </button>
            <app-notification-badge></app-notification-badge>
          </div>
        </header>

        <section class="hero-card">
          <h2>Find the right freelancer and post work faster</h2>
          <p>Track your projects, review proposals, and discover talent in one place.</p>
          <div class="search-row">
            <ion-icon name="search-outline"></ion-icon>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="updateFilters()"
              placeholder="Search freelancers, skills, or services">
            <button *ngIf="searchTerm" class="clear-btn" (click)="clearSearch()" type="button">Clear</button>
          </div>
          <div class="chip-scroll">
            <button
              class="cat-chip"
              *ngFor="let c of categories"
              [class.active]="selectedCategory === c"
              (click)="selectCategory(c)">
              {{c}}
            </button>
          </div>
        </section>

        <section class="stats-row">
          <div class="stat-pill" *ngFor="let s of stats">
            <div class="pill-icon" [style.background]="s.bg">
              <ion-icon [name]="s.icon" [style.color]="s.color"></ion-icon>
            </div>
            <div>
              <p class="pill-val">{{loading ? '...' : s.value}}</p>
              <p class="pill-label">{{s.label}}</p>
            </div>
          </div>
        </section>

        <section class="section quick-actions">
          <button class="action-card primary" (click)="router.navigate(['/create-gig'])">
            <ion-icon name="add-circle-outline"></ion-icon>
            <span>Post a project</span>
          </button>
          <button class="action-card" (click)="router.navigate(['/manage-jobs'])">
            <ion-icon name="folder-open-outline"></ion-icon>
            <span>My jobs</span>
          </button>
          <button class="action-card" (click)="router.navigate(['/browse'])">
            <ion-icon name="search-outline"></ion-icon>
            <span>Browse talent</span>
          </button>
          <button class="action-card" (click)="router.navigate(['/conversations'])">
            <ion-icon name="chatbubbles-outline"></ion-icon>
            <span>Messages</span>
          </button>
          <button class="action-card" (click)="router.navigate(['/profile-client'])">
            <ion-icon name="person-outline"></ion-icon>
            <span>Profile</span>
          </button>
        </section>

        <section class="section">
          <div class="section-header">
            <h3>Recommended freelancers</h3>
            <button (click)="router.navigate(['/browse'])">See All</button>
          </div>
          <div class="freelancer-scroll" *ngIf="filteredFreelancers.length > 0; else noFreelancers">
            <div class="freelancer-card" *ngFor="let f of filteredFreelancers" (click)="router.navigate(['/freelancer-profile', f.id])">
              <img [src]="f.avatar_url || api.defaultAvatarUrl" [alt]="f.full_name || f.username">
              <p class="f-name">{{f.full_name || f.username}}</p>
              <p class="f-skill">{{(f.skills ? f.skills.split(',')[0] : 'Freelancer')}}</p>
              <div class="f-rating">
                <ion-icon name="star" class="star"></ion-icon>
                <span>5.0</span>
              </div>
              <p class="f-rate" *ngIf="f.hourly_rate">\${{f.hourly_rate}}/hr</p>
            </div>
          </div>
          <ng-template #noFreelancers>
            <div class="empty-card">
              <p>{{loading ? 'Loading freelancers...' : 'No freelancers match your search.'}}</p>
            </div>
          </ng-template>
        </section>

        <section class="section">
          <div class="section-header">
            <h3 class="section-title">Active projects</h3>
            <button (click)="router.navigate(['/create-gig'])">New project</button>
          </div>
          <div class="project-list" *ngIf="myJobs.length > 0; else noProjects">
            <article class="project-card" *ngFor="let job of myJobs.slice(0, 3)">
              <div class="project-top">
                <div>
                  <p class="project-title">{{job.title}}</p>
                  <p class="project-meta">{{job.application_count || 0}} proposals · {{formatBudget(job)}}</p>
                </div>
                <span class="project-badge" [class]="job.status">{{formatStatus(job.status)}}</span>
              </div>
              <p class="project-desc">{{job.description}}</p>
            </article>
          </div>
          <ng-template #noProjects>
            <div class="empty-card">
              <p>{{loading ? 'Loading projects...' : 'No projects yet. Create your first project to start receiving proposals.'}}</p>
            </div>
          </ng-template>
        </section>

        <section class="section">
          <h3 class="section-title">Popular services</h3>
          <div class="services-grid">
            <div class="service-card" *ngFor="let s of filteredServices" (click)="router.navigate(['/store'])">
              <img [src]="s.img" [alt]="s.title">
              <div class="service-info">
                <p class="service-title">{{s.title}}</p>
                <p class="service-price">{{s.price}}</p>
              </div>
            </div>
          </div>
          <div class="empty-card" *ngIf="filteredServices.length === 0">
            <p>{{loading ? 'Loading services...' : 'No services match your search.'}}</p>
          </div>
        </section>

        <section class="section">
          <div class="section-header">
            <h3 class="section-title">Store products</h3>
            <button (click)="router.navigate(['/store'])">See All</button>
          </div>
          <div class="store-scroll" *ngIf="filteredStoreProducts.length > 0; else noStoreProducts">
            <article class="store-card" *ngFor="let item of filteredStoreProducts" (click)="router.navigate(['/store'])">
              <img [src]="item.img" [alt]="item.title">
              <div class="store-card-info">
                <p class="store-card-title">{{ item.title }}</p>
                <p class="store-card-meta">{{ item.category || 'Product' }}</p>
                <p class="store-card-price">{{ item.price }}</p>
              </div>
            </article>
          </div>
          <ng-template #noStoreProducts>
            <div class="empty-card">
              <p>{{loading ? 'Loading products...' : 'No store products match your search.'}}</p>
            </div>
          </ng-template>
        </section>

        <section class="section">
          <div class="section-header">
            <h3 class="section-title">Store services</h3>
            <button (click)="router.navigate(['/store'])">See All</button>
          </div>
          <div class="store-scroll" *ngIf="filteredStoreServices.length > 0; else noStoreServices">
            <article class="store-card" *ngFor="let item of filteredStoreServices" (click)="router.navigate(['/store'])">
              <img [src]="item.img" [alt]="item.title">
              <div class="store-card-info">
                <p class="store-card-title">{{ item.title }}</p>
                <p class="store-card-meta">{{ item.category || 'Service' }}</p>
                <p class="store-card-price">{{ item.price }}</p>
              </div>
            </article>
          </div>
          <ng-template #noStoreServices>
            <div class="empty-card">
              <p>{{loading ? 'Loading services...' : 'No store services match your search.'}}</p>
            </div>
          </ng-template>
        </section>

        <div class="error-banner" *ngIf="loadError">
          {{loadError}}
        </div>
      </div>
    </ion-content>

    <button class="fab" (click)="router.navigate(['/create-gig'])">
      <ion-icon name="add"></ion-icon>
    </button>
    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .client-content {
      --background:
        radial-gradient(circle at top, rgba(139, 92, 246, 0.12), transparent 30%),
        linear-gradient(180deg, #f8fafc 0%, #f3f4f6 100%);
    }
    .page-wrap { padding: 0 0 100px; max-width: 420px; margin: 0 auto; }
    .app-bar {
      margin: 0 12px; padding: 14px 14px 10px;
      border-radius: 0 0 20px 20px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(14px);
      display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .user-row { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #8B5CF620; cursor: pointer; object-fit: cover; }
    .eyebrow { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #8B5CF6; margin: 0 0 2px; }
    .greeting { font-size: 16px; font-weight: 700; color: #111827; margin: 0; }
    .icons { display: flex; gap: 4px; }
    .icon-btn {
      position: relative; background: none; border: none; padding: 8px; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      ion-icon { font-size: 22px; color: #6B7280; }
    }
    .icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .hero-card {
      background: linear-gradient(135deg, #8B5CF6, #6D28D9 55%, #4F46E5);
      margin: 16px 12px 0; border-radius: 24px; padding: 20px;
      box-shadow: 0 10px 28px rgba(139,92,246,0.28);
      h2 { color: white; font-size: 18px; font-weight: 700; margin: 0 0 4px; }
      p { color: rgba(255,255,255,0.8); font-size: 13px; margin: 0 0 14px; }
    }
    .search-row {
      display: flex; align-items: center; gap: 8px;
      background: #ffffff !important; border-radius: 14px; padding: 10px 12px; margin-bottom: 12px;
      ion-icon { color: #9CA3AF; font-size: 16px; }
      input { flex: 1; border: none; outline: none; font-size: 13px; color: #111827 !important; background: transparent !important; min-width: 0; }
    }
    .clear-btn {
      border: none; background: #f3f4f6; color: #374151; font-size: 11px; font-weight: 700;
      border-radius: 999px; padding: 6px 10px; cursor: pointer;
    }
    .chip-scroll { display: flex; gap: 8px; overflow-x: auto; }
    .cat-chip {
      white-space: nowrap; background: rgba(255,255,255,0.2); color: white;
      padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
      border: none; cursor: pointer;
    }
    .cat-chip.active { background: rgba(255,255,255,0.92); color: #4C1D95; }
    .stats-row { display: flex; gap: 12px; overflow-x: auto; padding: 0 16px 8px; }
    .stat-pill { min-width: 130px; background: white; border-radius: 16px; padding: 14px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .pill-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; ion-icon { font-size: 18px; } }
    .pill-val { font-size: 18px; font-weight: 700; color: #111827; margin: 0; }
    .pill-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9CA3AF; margin: 0; }
    .section { padding: 8px 16px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
      h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #111827; margin: 0; }
      button { background: none; border: none; color: #8B5CF6; font-size: 12px; font-weight: 700; cursor: pointer; }
    }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #111827; margin: 0 0 12px; }
    .freelancer-scroll { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 4px; }
    .freelancer-card {
      min-width: 140px; background: white; border-radius: 16px; padding: 16px;
      display: flex; flex-direction: column; align-items: center; text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; margin-bottom: 8px; }
    }
    .empty-card {
      background: rgba(255,255,255,0.9); border: 1px dashed #d1d5db; border-radius: 16px;
      padding: 18px; color: #6b7280; font-size: 13px; text-align: center;
    }
    .f-name { font-size: 13px; font-weight: 700; color: #111827; margin: 0 0 2px; }
    .f-skill { font-size: 10px; color: #9CA3AF; margin: 0 0 4px; }
    .f-rating { display: flex; align-items: center; gap: 3px; justify-content: center; .star { color: #FBBF24; font-size: 12px; } span { font-size: 11px; font-weight: 700; color: #374151; } }
    .f-rate { font-size: 12px; font-weight: 700; color: #8B5CF6; margin: 4px 0 0; }
    .services-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .service-card { background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); img { width: 100%; height: 80px; object-fit: cover; } }
    .service-info { padding: 10px; }
    .service-title { font-size: 11px; font-weight: 700; color: #111827; margin: 0 0 2px; }
    .service-price { font-size: 11px; font-weight: 700; color: #8B5CF6; margin: 0; }
    .store-scroll {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .store-card {
      min-width: 160px;
      max-width: 160px;
      background: white;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      cursor: pointer;
    }
    .store-card img {
      width: 100%;
      height: 94px;
      object-fit: cover;
      display: block;
    }
    .store-card-info { padding: 10px; }
    .store-card-title {
      font-size: 12px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .store-card-meta { font-size: 10px; color: #6b7280; margin: 0 0 4px; }
    .store-card-price { font-size: 11px; color: #8B5CF6; font-weight: 700; margin: 0; }
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      padding-top: 4px;
    }
    .action-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 14px 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: #111827;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .action-card.primary {
      background: linear-gradient(135deg, #8B5CF6, #6D28D9);
      color: white;
      border-color: transparent;
    }
    .action-card ion-icon { font-size: 18px; }
    .project-list { display: flex; flex-direction: column; gap: 10px; }
    .project-card {
      background: white;
      border-radius: 16px;
      padding: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .project-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
    .project-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 2px; }
    .project-meta { font-size: 11px; color: #6b7280; margin: 0; }
    .project-desc { font-size: 12px; color: #4b5563; margin: 0; line-height: 1.45; }
    .project-badge {
      font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
      padding: 6px 10px; border-radius: 999px; white-space: nowrap;
    }
    .project-badge.open { background: #eff6ff; color: #2563eb; }
    .project-badge.in_progress { background: #ecfdf5; color: #059669; }
    .project-badge.completed { background: #f3f4f6; color: #374151; }
    .project-badge.closed { background: #fef2f2; color: #dc2626; }
    .error-banner {
      margin: 12px 16px 0;
      border-radius: 14px;
      padding: 12px 14px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      font-size: 13px;
    }
    .fab {
      position: fixed; bottom: 80px; right: 20px; width: 56px; height: 56px;
      background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border: none; border-radius: 18px;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      box-shadow: 0 8px 20px rgba(139,92,246,0.4); z-index: 30; transition: transform 0.15s;
      ion-icon { font-size: 28px; }
    }
    .fab:active { transform: scale(0.93); }
  `]
})
export class DashboardClientPage implements OnInit {
  freelancers: ApiUser[] = [];
  myJobs: ApiJob[] = [];
  services: any[] = [];
  storeProducts: any[] = [];
  storeServices: any[] = [];
  filteredFreelancers: ApiUser[] = [];
  filteredServices: any[] = [];
  filteredStoreProducts: any[] = [];
  filteredStoreServices: any[] = [];
  loading = false;
  loadError: string | null = null;
  searchTerm = '';
  selectedCategory: string | null = null;
  categories = CATEGORIES;

  get currentAvatar() {
    return this.roleService.user?.avatar_url || this.api.defaultAvatarUrl;
  }

  get firstName() { return this.roleService.userName.split(' ')[0]; }
  get stats() {
    return [
      { label: 'Active Projects', value: String(this.myJobs.filter(j => j.status === 'open').length), icon: 'folder-outline', color: '#3B82F6', bg: '#EFF6FF' },
      { label: 'Proposals', value: String(this.myJobs.reduce((s, j) => s + (j.application_count || 0), 0)), icon: 'document-text-outline', color: '#F59E0B', bg: '#FFFBEB' },
      { label: 'In Progress', value: String(this.myJobs.filter(j => j.status === 'in_progress').length), icon: 'wallet-outline', color: '#10B981', bg: '#ECFDF5' },
    ];
  }

  constructor(public router: Router, public roleService: RoleService, public api: ApiService) { }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.loadError = null;

    try {
      const [freelancers, jobs, products] = await Promise.all([
        firstValueFrom(this.api.getFreelancers()),
        firstValueFrom(this.api.getMyJobs()),
        firstValueFrom(this.api.getProducts())
      ]);

      this.freelancers = (freelancers || []).slice(0, 5);
      this.myJobs = jobs || [];
      const mappedProducts = (products || []).slice(0, 14).map(p => ({
        title: p.name,
        price: 'from $' + p.price,
        category: p.category,
        img: p.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300'
      }));

      this.services = mappedProducts.slice(0, 4);
      this.assignStoreSections(mappedProducts);
      this.updateFilters();
    } catch {
      this.loadError = 'We could not load your dashboard right now. Please try again.';
      this.freelancers = [];
      this.myJobs = [];
      this.services = [];
      this.storeProducts = [];
      this.storeServices = [];
      this.updateFilters();
    } finally {
      this.loading = false;
    }
  }

  refreshData() {
    if (this.loading) {
      return;
    }

    void this.loadData();
  }

  selectCategory(category: string) {
    this.selectedCategory = this.selectedCategory === category ? null : category;
    this.updateFilters();
  }

  clearSearch() {
    this.searchTerm = '';
    this.updateFilters();
  }

  updateFilters() {
    const query = this.searchTerm.trim().toLowerCase();
    const selectedCategory = this.selectedCategory?.toLowerCase() ?? '';

    this.filteredFreelancers = this.freelancers.filter(f => {
      const haystack = [f.full_name, f.username, f.skills, f.bio].filter(Boolean).join(' ').toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesCategory = !selectedCategory || (f.skills || '').toLowerCase().includes(selectedCategory);
      return matchesQuery && matchesCategory;
    });

    this.filteredServices = this.services.filter(service => {
      const haystack = [service.title, service.category].filter(Boolean).join(' ').toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesCategory = !selectedCategory || (service.category || '').toLowerCase().includes(selectedCategory);
      return matchesQuery && matchesCategory;
    });

    this.filteredStoreProducts = this.storeProducts.filter(item => {
      const haystack = [item.title, item.category].filter(Boolean).join(' ').toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesCategory = !selectedCategory || (item.category || '').toLowerCase().includes(selectedCategory);
      return matchesQuery && matchesCategory;
    });

    this.filteredStoreServices = this.storeServices.filter(item => {
      const haystack = [item.title, item.category].filter(Boolean).join(' ').toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesCategory = !selectedCategory || (item.category || '').toLowerCase().includes(selectedCategory);
      return matchesQuery && matchesCategory;
    });
  }

  assignStoreSections(items: any[]) {
    const serviceKeywords = ['service', 'consult', 'support', 'coaching'];
    const detectedServices = items.filter(item =>
      serviceKeywords.some(keyword => (item.category || '').toLowerCase().includes(keyword))
    );

    const detectedProducts = items.filter(item => !detectedServices.includes(item));

    this.storeProducts = (detectedProducts.length > 0 ? detectedProducts : items).slice(0, 8);
    this.storeServices = (detectedServices.length > 0 ? detectedServices : items.slice(0, 8)).slice(0, 8);
  }

  formatBudget(job: ApiJob) {
    const budget = typeof job.budget === 'string' ? Number(job.budget) : job.budget;
    if (!budget || Number.isNaN(budget)) {
      return 'Budget not set';
    }

    return `Budget $${budget}`;
  }

  formatStatus(status: string) {
    const normalized = (status || '').replace(/_/g, ' ');
    return normalized ? normalized : 'unknown';
  }
}
