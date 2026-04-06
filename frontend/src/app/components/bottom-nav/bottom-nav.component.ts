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
        [class.active]="isActive(item)"
        (click)="navigate(item)">
        <div class="icon-wrap">
          <ion-icon [name]="isActive(item) ? item.activeIcon : item.icon"></ion-icon>
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
      padding-bottom: env(safe-area-inset-bottom); z-index: 100;
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
  queryParams: any = {};

  constructor(public router: Router, private roleService: RoleService) {
    this.currentPath = this.router.url.split('?')[0];
    this.queryParams = this.getQueryParams(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.urlAfterRedirects.split('?')[0];
      this.queryParams = this.getQueryParams(event.urlAfterRedirects);
    });
  }

  getQueryParams(url: string) {
    const params: any = {};
    const parts = url.split('?');
    if (parts.length > 1) {
      const q = parts[1].split('&');
      q.forEach(pair => {
        const [k, v] = pair.split('=');
        params[k] = v;
      });
    }
    return params;
  }

  isActive(item: NavItem) {
    const isPathMatch = this.currentPath.startsWith(item.path);
    if (this.roleService.role === 'admin' && item.path === '/dashboard-admin') {
      const segment = this.queryParams['seg'] || 'overview';
      return isPathMatch && segment === item.tab;
    }
    return isPathMatch;
  }

  navigate(item: NavItem) {
    if (this.roleService.role === 'admin' && item.path === '/dashboard-admin') {
      this.router.navigate([item.path], { queryParams: { seg: item.tab } });
    } else {
      this.router.navigate([item.path]);
    }
  }

  ngOnInit() {
    const role = this.roleService.role;
    if (role === 'client') {
      this.navItems = [
        { icon: 'home-outline', activeIcon: 'home', label: 'Home', path: '/dashboard-client', tab: 'home' },
        { icon: 'search-outline', activeIcon: 'search', label: 'Browse', path: '/browse', tab: 'browse' },
        { icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', label: 'Messages', path: '/conversations', tab: 'messages', badge: false },
        { icon: 'person-outline', activeIcon: 'person', label: 'Profile', path: '/profile-client', tab: 'profile' },
      ];
    } else if (role === 'admin') {
      this.navItems = [
        { icon: 'home-outline', activeIcon: 'home', label: 'Overview', path: '/dashboard-admin', tab: 'overview' },
        { icon: 'shield-outline', activeIcon: 'shield', label: 'Moderate', path: '/dashboard-admin', tab: 'moderation', badge: true },
        { icon: 'pie-chart-outline', activeIcon: 'pie-chart', label: 'Analytics', path: '/dashboard-admin', tab: 'analytics' },
        { icon: 'settings-outline', activeIcon: 'settings', label: 'Settings', path: '/profile-admin', tab: 'settings' },
      ];
    } else { // freelancer
      this.navItems = [
        { icon: 'home-outline', activeIcon: 'home', label: 'Home', path: '/dashboard', tab: 'home' },
        { icon: 'briefcase-outline', activeIcon: 'briefcase', label: 'Gigs', path: '/gigs', tab: 'gigs' },
        { icon: 'add-circle-outline', activeIcon: 'add-circle', label: 'Create', path: '/create-gig', tab: 'create' },
        { icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', label: 'Chat', path: '/conversations', tab: 'chat', badge: false },
        { icon: 'person-outline', activeIcon: 'person', label: 'Profile', path: '/freelancer-profile', tab: 'profile' },
      ];
    }
  }
}
