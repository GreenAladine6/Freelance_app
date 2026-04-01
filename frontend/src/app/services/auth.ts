import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { RoleService } from './role.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService, private role: RoleService) { }

  login(email: string, password: string): Observable<any> {
    return this.api.login(email, password).pipe(
      tap(res => this.role.handleLoginSuccess(res))
    );
  }

  logout(): void {
    this.role.logout();
  }

  isLoggedIn(): boolean {
    return this.role.isAuthenticated;
  }

  getToken(): string | null {
    return this.role.accessToken;
  }
}