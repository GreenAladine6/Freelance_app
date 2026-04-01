import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RoleService } from '../../services/role.service';

@Component({
    selector: 'app-splash',
    standalone: true,
    imports: [CommonModule, IonicModule],
    template: `
    <ion-content class="splash-content">
      <div class="splash-container" [class.visible]="visible">
        <div class="splash-logo">
          <ion-icon name="briefcase" class="logo-icon"></ion-icon>
        </div>
        <h1 class="splash-title">FreelanceHub</h1>
        <p class="splash-sub">Where freelance happens</p>
        <div class="splash-loader">
          <div class="loader-bar"></div>
        </div>
      </div>
    </ion-content>
  `,
    styles: [`
    .splash-content { --background: #000; }
    .splash-container {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100%; gap: 16px;
      opacity: 0; transform: scale(0.9);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .splash-container.visible { opacity: 1; transform: scale(1); }
    .splash-logo {
      width: 80px; height: 80px; border-radius: 20px;
      background: #8B5CF6; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 20px 40px rgba(139,92,246,0.5);
    }
    .logo-icon { font-size: 40px; color: white; }
    .splash-title { color: white; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -1px; }
    .splash-sub { color: #9CA3AF; font-size: 16px; margin: 0; }
    .splash-loader { width: 120px; height: 3px; background: #ffffff20; border-radius: 4px; margin-top: 32px; overflow: hidden; }
    .loader-bar {
      height: 100%; background: #8B5CF6; border-radius: 4px;
      animation: load 2.5s ease-in-out forwards;
    }
    @keyframes load { from { width: 0 } to { width: 100% } }
  `]
})
export class SplashPage implements OnInit {
    visible = false;

    constructor(private router: Router, private roleService: RoleService) { }

    ngOnInit() {
        setTimeout(() => { this.visible = true; }, 50);
        setTimeout(() => {
            if (this.roleService.isAuthenticated) {
                const role = this.roleService.role;
                if (role === 'admin') this.router.navigate(['/dashboard-admin'], { replaceUrl: true });
                else if (role === 'client') this.router.navigate(['/dashboard-client'], { replaceUrl: true });
                else this.router.navigate(['/dashboard'], { replaceUrl: true });
            } else {
                this.router.navigate(['/interests'], { replaceUrl: true });
            }
        }, 3000);
    }
}
