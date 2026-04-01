import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { RoleService } from './role.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private roleService: RoleService, private router: Router) { }

    canActivate(): boolean {
        if (this.roleService.isAuthenticated) {
            return true;
        }
        this.router.navigate(['/splash']);
        return false;
    }
}
