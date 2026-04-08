import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { ApiService } from '../../services/api.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <div class="header-content">
          <div class="logo-area">
            <div class="logo-icon">FH</div>
            <span class="logo-text">FreelanceHub</span>
          </div>
          <div class="header-actions">
            <ion-button fill="clear" color="medium"><ion-icon name="search-outline"></ion-icon></ion-button>
            <ion-button *ngIf="!roleService.isAuthenticated" fill="clear" color="primary" class="login-btn" (click)="goToLogin()">Login</ion-button>
            <ion-button *ngIf="roleService.isAuthenticated" fill="clear" color="primary" class="login-btn" (click)="goToProfile()">
              <ion-icon name="person-circle-outline" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
        </div>
      </ion-toolbar>
      <div class="tabs-container">
        <button *ngFor="let tab of tabs" 
                class="tab-btn" 
                [class.active]="activeTab === tab"
                (click)="activeTab = tab">
          {{ tab }}
          <div *ngIf="activeTab === tab" class="tab-indicator"></div>
        </button>
      </div>
    </ion-header>

    <ion-content class="browse-content">
      <!-- Services Tab -->
      <div *ngIf="activeTab === 'Services'">
        <div class="section">
          <h2 class="section-title">Marketplace Services</h2>
          <div class="horizontal-scroll" *ngIf="services.length > 0">
            <div *ngFor="let item of services.slice(0, 5)" class="service-card" (click)="handleInteraction()">
              <div class="image-wrapper">
                <img [src]="item.image" [alt]="item.title" />
                <button class="bookmark-btn"><ion-icon name="bookmark-outline"></ion-icon></button>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ item.title }}</h3>
                <div class="freelancer-info">
                  <img [src]="item.avatar" class="mini-avatar" />
                  <span>{{ item.freelancer }}</span>
                </div>
                <div class="card-footer">
                  <div class="rating"><ion-icon name="star"></ion-icon> {{ item.rating | number:'1.1-1' }}</div>
                  <div class="price">From {{ item.price }}</div>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="services.length === 0 && !loading" class="empty-state-mini">
            <p>No services available yet</p>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Top Rated</h2>
          <div class="vertical-list">
            <div *ngFor="let item of services.slice(5)" class="popular-card" (click)="handleInteraction()">
              <div class="image-wrapper">
                <img [src]="item.image" [alt]="item.title" />
              </div>
              <div class="card-content">
                <div>
                  <h3 class="card-title">{{ item.title }}</h3>
                  <span class="freelancer-name">{{ item.freelancer }}</span>
                </div>
                <div class="card-footer">
                  <div class="rating"><ion-icon name="star"></ion-icon> {{ item.rating | number:'1.1-1' }}</div>
                  <div class="price">{{ item.price }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Freelancers Tab -->
      <div *ngIf="activeTab === 'Freelancers'" class="tab-content">
        <p class="count-text">{{ freelancers.length }} freelancers available</p>
        <div *ngFor="let f of freelancers" class="freelancer-card" (click)="handleInteraction()">
          <div class="card-header">
            <div class="avatar-wrapper">
              <img [src]="f.avatar" class="avatar" />
              <div *ngIf="f.verified" class="verified-badge"><ion-icon name="checkmark-circle"></ion-icon></div>
            </div>
            <div class="info">
              <h3>{{ f.name }}</h3>
              <p class="specialty">{{ f.specialty }}</p>
              <div class="location"><ion-icon name="location-outline"></ion-icon> {{ f.location }}</div>
            </div>
            <div class="stats">
              <div class="rate">{{ f.rate }}</div>
              <div class="rating-info">
                <ion-icon name="star"></ion-icon> <span>{{ f.rating }}</span> ({{ f.reviews }})
              </div>
            </div>
          </div>
          <div class="skills">
            <span *ngFor="let skill of f.skills" class="skill-tag">{{ skill }}</span>
          </div>
          <div class="card-actions">
            <button class="action-btn outline-btn" (click)="goToMessages(f); $event.stopPropagation()">Message</button>
            <button class="action-btn" (click)="goToFreelancerProfile(f); $event.stopPropagation()">View Profile</button>
          </div>
        </div>
      </div>

      <!-- Projects Tab -->
      <div *ngIf="activeTab === 'Projects'" class="tab-content">
        <p class="count-text">{{ projects.length }} open projects</p>
        <div *ngFor="let p of projects" class="project-card" (click)="handleInteraction()">
          <div class="card-header">
            <img [src]="p.avatar" class="client-avatar" />
            <div class="info">
              <h3>{{ p.title }}</h3>
              <p class="client-name">{{ p.client }}</p>
            </div>
          </div>
          <div class="project-meta">
            <div class="meta-item text-green"><span class="font-bold">{{ p.budget }}</span> budget</div>
            <div class="meta-item"><ion-icon name="time-outline"></ion-icon> {{ p.deadline }}</div>
            <div class="meta-item">{{ p.proposals }} proposals</div>
          </div>
          <div class="skills mb">
            <span *ngFor="let skill of p.skills" class="skill-tag gray-tag">{{ skill }}</span>
          </div>
          <button class="action-btn outline-btn" (click)="handleInteraction(); $event.stopPropagation()">Apply Now</button>
        </div>
      </div>
    </ion-content>

    <!-- Login Prompt Modal Elements -->
    <div class="modal-overlay" *ngIf="showLoginPrompt" (click)="showLoginPrompt = false"></div>
    <div class="bottom-sheet" *ngIf="showLoginPrompt" [class.show]="showLoginPrompt">
      <div class="drag-handle"></div>
      <div class="sheet-content">
        <div class="sheet-icon"><ion-icon name="log-in-outline"></ion-icon></div>
        <h2>Join FreelanceHub to continue</h2>
        <p>Create an account or sign in to access this feature</p>
        
        <div class="sheet-actions">
          <button class="primary-btn" (click)="goToSignup()">Create Account</button>
          <button class="secondary-btn" (click)="goToLogin()">Sign In</button>
          <button class="ghost-btn" (click)="showLoginPrompt = false">Continue as guest</button>
        </div>
      </div>
    </div>
    
    <!-- Floating Banner -->
    <div class="floating-banner" *ngIf="!showLoginPrompt && !roleService.isAuthenticated">
      <div class="banner-text">
        <p class="banner-title">Unlock full features</p>
        <p class="banner-sub">Save projects, chat, and more</p>
      </div>
      <button class="banner-btn" (click)="goToSignup()">Sign Up</button>
    </div>
    
    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    ion-toolbar { --background: white; border-bottom: 1px solid #F3F4F6; }
    .header-content { display: flex; justify-content: space-between; align-items: center; padding: 0 16px; width: 100%; height: 100%; }
    .logo-area { display: flex; align-items: center; gap: 8px; }
    .logo-icon { width: 32px; height: 32px; background: #8B5CF6; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
    .logo-text { color: #8B5CF6; font-weight: 700; font-size: 18px; }
    .header-actions { display: flex; align-items: center; gap: 4px; }
    .login-btn { font-weight: 600; font-size: 14px; }
    
    .tabs-container { display: flex; border-bottom: 1px solid #E5E7EB; background: white; }
    .tab-btn { flex: 1; padding: 12px 0; background: transparent; border: none; font-size: 14px; font-weight: 500; color: #6B7280; position: relative; transition: color 0.2s; }
    .tab-btn.active { color: #8B5CF6; }
    .tab-indicator { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: #8B5CF6; }
    
    .browse-content { --background: #F5F5F5; }
    
    .section { padding: 24px 0 0; }
    .section-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 16px; padding: 0 16px; }
    
    .horizontal-scroll { display: flex; overflow-x: auto; gap: 16px; padding: 0 16px 16px; }
    .horizontal-scroll::-webkit-scrollbar { display: none; }
    .service-card { min-width: 240px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex: 0 0 auto; cursor: pointer; }
    
    .image-wrapper { height: 128px; position: relative; }
    .image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
    .bookmark-btn { position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; background: rgba(255,255,255,0.8); backdrop-filter: blur(4px); border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; color: #4B5563; }
    
    .card-content { padding: 12px; }
    .card-title { font-size: 14px; font-weight: 500; color: #111827; margin: 0 0 4px; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .freelancer-info { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 12px; color: #6B7280; }
    .mini-avatar { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }
    
    .card-footer { display: flex; justify-content: space-between; align-items: center; }
    .rating { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500; }
    .rating ion-icon { color: #FACC15; }
    .price { font-size: 14px; font-weight: 700; color: #8B5CF6; }
    
    .vertical-list { display: flex; flex-direction: column; gap: 16px; padding: 0 16px 16px; }
    .popular-card { background: white; border-radius: 12px; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; gap: 12px; cursor: pointer; }
    .popular-card .image-wrapper { width: 96px; height: 96px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
    .popular-card .card-content { padding: 2px 0; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
    .freelancer-name { font-size: 12px; color: #6B7280; }
    
    .tab-content { padding: 16px; display: flex; flex-direction: column; gap: 12px; padding-bottom: 100px; }
    .count-text { font-size: 12px; font-weight: 500; color: #6B7280; margin: 0; }
    
    /* Freelancer & Project Cards */
    .freelancer-card, .project-card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); cursor: pointer; }
    .card-header { display: flex; gap: 12px; margin-bottom: 12px; }
    .avatar-wrapper { position: relative; }
    .avatar, .client-avatar { width: 56px; height: 56px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.1); object-fit: cover; }
    .client-avatar { width: 40px; height: 40px; }
    .verified-badge { position: absolute; bottom: -2px; right: -2px; background: #8B5CF6; border-radius: 50%; padding: 2px; display: flex; border: 2px solid white; color: white; }
    .verified-badge ion-icon { font-size: 10px; }
    
    .info { flex: 1; min-width: 0; }
    .info h3 { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 2px; }
    .specialty { font-size: 12px; color: #6B7280; margin: 0; }
    .location { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #9CA3AF; margin-top: 2px; }
    .client-name { font-size: 12px; color: #6B7280; margin: 0; }
    
    .stats { text-align: right; }
    .rate { font-size: 14px; font-weight: 700; color: #8B5CF6; }
    .rating-info { display: flex; align-items: center; justify-content: flex-end; gap: 2px; font-size: 10px; color: #9CA3AF; margin-top: 2px; }
    .rating-info span { font-size: 12px; font-weight: 700; color: #374151; }
    .rating-info ion-icon { color: #FACC15; font-size: 12px; }
    
    .project-meta { display: flex; align-items: center; gap: 16px; font-size: 12px; color: #4B5563; margin-bottom: 12px; }
    .meta-item { display: flex; align-items: center; gap: 4px; }
    .text-green { color: #16A34A; }
    .font-bold { font-weight: 700; }
    
    .skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .skills.mb { margin-bottom: 12px; }
    .skill-tag { background: #F3E8FF; color: #8B5CF6; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; border: 1px solid #E9D5FF; }
    .gray-tag { background: #F3F4F6; color: #4B5563; border-color: transparent; }

    .card-actions { display: flex; gap: 8px; margin-top: 12px; }
    
    .action-btn { width: 100%; padding: 8px 0; background: #8B5CF6; color: white; font-size: 12px; font-weight: 700; border-radius: 12px; border: none; margin-top: 12px; transition: background 0.2s; }
    .action-btn:active { transform: scale(0.98); }
    .outline-btn { background: transparent; color: #8B5CF6; border: 2px solid #8B5CF6; }
    .outline-btn:hover, .outline-btn:active { background: #8B5CF6; color: white; }
    
    /* Login Prompt Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; animation: fadeIn 0.2s ease; }
    .bottom-sheet { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-radius: 24px 24px 0 0; padding: 24px; z-index: 101; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1); }
    .bottom-sheet.show { transform: translateY(0); }
    .drag-handle { width: 48px; height: 6px; background: #E5E7EB; border-radius: 3px; margin: 0 auto 24px; }
    
    .sheet-content { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .sheet-icon { width: 64px; height: 64px; border-radius: 50%; background: #F3E8FF; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: #8B5CF6; font-size: 32px; }
    .sheet-content h2 { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px; }
    .sheet-content p { font-size: 14px; color: #6B7280; margin: 0 0 32px; }
    
    .sheet-actions { width: 100%; display: flex; flex-direction: column; gap: 12px; }
    .primary-btn { width: 100%; padding: 14px; background: #8B5CF6; color: white; border-radius: 9999px; font-weight: 700; border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .secondary-btn { width: 100%; padding: 14px; background: white; color: #374151; border-radius: 9999px; font-weight: 700; border: 1px solid #D1D5DB; }
    .ghost-btn { width: 100%; padding: 8px; background: transparent; color: #6B7280; font-weight: 500; font-size: 14px; border: none; margin-top: 8px; }
    
    /* Floating Banner */
    .floating-banner { position: fixed; bottom: 84px; left: 16px; right: 16px; background: #1F2937; color: white; padding: 16px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; z-index: 50; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); animation: slideUp 0.3s ease; }
    .banner-title { font-size: 14px; font-weight: 500; margin: 0; }
    .banner-sub { font-size: 10px; color: #9CA3AF; margin: 0; }
    .banner-btn { background: #8B5CF6; color: white; padding: 8px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; border: none; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(100px); } to { transform: translateY(0); } }
  `]
})
export class BrowsePage implements OnInit {
  activeTab = 'Services';
  tabs = ['Services', 'Freelancers', 'Projects'];
  showLoginPrompt = false;

  services: any[] = [];
  freelancers: any[] = [];
  projects: any[] = [];
  loading = false;

  constructor(private router: Router, private api: ApiService, public roleService: RoleService) { }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;

    // Load Products (Services)
    this.api.getProducts().subscribe({
      next: (data) => {
        this.services = data.map(p => ({
          ...p,
          title: p.name,
          freelancer: 'Pro Seller', // In real app, join with User
          avatar: p.seller_avatar_url || this.api.defaultAvatarUrl,
          rating: 4.8 + (Math.random() * 0.2), // Simulated rating
          price: '$' + p.price,
          image: p.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'
        }));
      }
    });

    // Load Freelancers
    this.api.getFreelancers().subscribe({
      next: (data) => {
        this.freelancers = data.map((f: any) => ({
          ...f,
          name: f.full_name || f.username,
          specialty: f.skills ? f.skills.split(',')[0] : 'Freelancer',
          rate: f.hourly_rate ? '$' + f.hourly_rate + '/hr' : 'Negotiable',
          rating: 5.0,
          reviews: Math.floor(Math.random() * 10),
          location: 'Remote',
          avatar: f.avatar_url || this.api.defaultAvatarUrl,
          verified: true,
          skills: f.skills ? f.skills.split(',').map((s: string) => s.trim()) : []
        }));
      }
    });

    // Load Projects (Jobs)
    this.api.getJobs().subscribe({
      next: (data) => {
        this.projects = data.map((j: any) => ({
          ...j,
          client: j.client_name || 'Client',
          budget: '$' + j.budget,
          deadline: j.duration || 'Flexible',
          skills: j.skills_required ? j.skills_required.split(',').map((s: string) => s.trim()) : [],
          proposals: j.application_count || 0,
          avatar: j.client_avatar_url || this.api.defaultAvatarUrl
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  handleInteraction() {
    if (!this.roleService.isAuthenticated) {
      this.showLoginPrompt = true;
    }
  }

  goToProfile() {
    const role = this.roleService.role;
    if (role === 'client') this.router.navigate(['/profile-client']);
    else if (role === 'admin') this.router.navigate(['/profile-admin']);
    else this.router.navigate(['/freelancer-profile']);
  }

  goToMessages(freelancer: any) {
    if (!this.roleService.isAuthenticated) {
      this.showLoginPrompt = true;
      return;
    }

    this.api.getOrCreateConversationWithUser(freelancer.id).subscribe({
      next: (conversation) => {
        this.router.navigate(['/chat', conversation.id]);
      },
      error: () => {
        this.router.navigate(['/conversations']);
      }
    });
  }

  goToFreelancerProfile(freelancer: any) {
    if (!freelancer?.id) {
      return;
    }
    this.router.navigate(['/freelancer-profile', freelancer.id]);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
