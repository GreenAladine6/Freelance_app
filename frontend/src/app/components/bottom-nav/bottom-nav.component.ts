import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RoleService } from '../../services/role.service';
import { filter } from 'rxjs/operators';

interface NavItem {
  icon: string;
  activeIcon: string;
  label: string;
  path: string;
  tab: string;
  badge?: boolean;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="bottom-nav">
      <button 
        *ngFor="let item of navItems" 
        class="nav-tab" 
        [class.active]="currentPath.startsWith(item.path)"
        (click)="router.navigate([item.path])">
        <div class="icon-wrap">
          <ion-icon [name]="currentPath.startsWith(item.path) ? item.activeIcon : item.icon"></ion-icon>
          <div *ngIf="item.badge" class="badge"></div>
        </div>
        <span class="label">{{item.label}}</span>
      </button>
    </div>
  `,
  styles: [`
    .bottom-nav {
      position: fixed; bottom: 0; left: 0; right: 0;
      height: 64px; background: white; border-top: 1px solid #E5E7EB;
      display: flex; justify-content: space-around; padding: 0 8px;
      padding-bottom: env(safe-area-inset-bottom); z-index: 50;
      box-shadow: 0 -4px 12px rgba(0,0,0,0.03);
    }
    .nav-tab {
      background: none; border: none; flex: 1;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 4px; color: #9CA3AF; cursor: pointer; transition: color 0.2s;
    }
    .nav-tab.active { color: #8B5CF6; }
    .icon-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
    ion-icon { font-size: 24px; transition: transform 0.2s; }
    .nav-tab.active ion-icon { transform: scale(1.1); }
    .badge {
      position: absolute; top: 0; right: -2px; width: 8px; height: 8px;
      background: #EF4444; border-radius: 50%; border: 2px solid white;
    }
    .label { font-size: 10px; font-weight: 600; letter-spacing: 0.3px; }
  `]
})
export class BottomNavComponent implements OnInit {
  navItems: NavItem[] = [];
  currentPath = '';

  constructor(public router: Router, private roleService: RoleService) {
    this.currentPath = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.urlAfterRedirects;
    });
  }

  ngOnInit() {
    const role = this.roleService.role;
    if (role === 'client') {
      this.navItems = [
        { icon: 'home-outline', activeIcon: 'home', label: 'Home', path: '/dashboard-client', tab: 'home' },
        { icon: 'search-outline', activeIcon: 'search', label: 'Browse', path: '/browse', tab: 'browse' },
        { icon: 'folder-outline', activeIcon: 'folder', label: 'My Jobs', path: '/gigs', tab: 'projects' },
        { icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', label: 'Messages', path: '/conversations', tab: 'messages', badge: true },
        { icon: 'person-outline', activeIcon: 'person', label: 'Profile', path: '/profile-client', tab: 'profile' },
      ];
    } else if (role === 'admin') {
      this.navItems = [
        { icon: 'home-outline', activeIcon: 'home', label: 'Dashboard', path: '/dashboard-admin', tab: 'dashboard' },
        { icon: 'shield-outline', activeIcon: 'shield', label: 'Moderate', path: '/dashboard-admin', tab: 'moderation', badge: true },
        { icon: 'pie-chart-outline', activeIcon: 'pie-chart', label: 'Analytics', path: '/dashboard-admin', tab: 'analytics' },
        { icon: 'settings-outline', activeIcon: 'settings', label: 'Settings', path: '/profile-admin', tab: 'settings' },
      ];
    } else { // freelancer
      this.navItems = [
        { icon: 'home-outline', activeIcon: 'home', label: 'Home', path: '/dashboard', tab: 'home' },
        { icon: 'briefcase-outline', activeIcon: 'briefcase', label: 'My Gigs', path: '/gigs', tab: 'gigs' },
        { icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', label: 'Messages', path: '/conversations', tab: 'messages', badge: true },
        { icon: 'storefront-outline', activeIcon: 'storefront', label: 'Store', path: '/store', tab: 'store' },
        { icon: 'person-outline', activeIcon: 'person', label: 'Profile', path: '/freelancer-profile', tab: 'profile' },
      ];
    }
  }
}
