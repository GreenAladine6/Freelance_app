import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiUser, LoginResponse } from './api.service';

const ACCESS_TOKEN_KEY = 'fh_access_token';
const REFRESH_TOKEN_KEY = 'fh_refresh_token';
const USER_KEY = 'fh_user';

@Injectable({ providedIn: 'root' })
export class RoleService {
    private _accessToken = new BehaviorSubject<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));
    private _refreshToken = new BehaviorSubject<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY));
    private _user = new BehaviorSubject<ApiUser | null>(this._loadUser());

    accessToken$ = this._accessToken.asObservable();
    user$ = this._user.asObservable();

    get accessToken(): string | null { return this._accessToken.value; }
    get refreshToken(): string | null { return this._refreshToken.value; }
    get user(): ApiUser | null { return this._user.value; }
    get isAuthenticated(): boolean { return !!this._accessToken.value && !!this._user.value; }
    get role(): 'admin' | 'client' | 'freelancer' { return this._user.value?.user_type ?? 'freelancer'; }
    get userName(): string {
        const u = this._user.value;
        return u?.full_name || u?.username || u?.email || 'User';
    }

    private _loadUser(): ApiUser | null {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) as ApiUser : null;
        } catch { return null; }
    }

    handleLoginSuccess(login: LoginResponse): void {
        this._accessToken.next(login.access_token);
        this._refreshToken.next(login.refresh_token);
        this._user.next(login.user);
        localStorage.setItem(ACCESS_TOKEN_KEY, login.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, login.refresh_token);
        localStorage.setItem(USER_KEY, JSON.stringify(login.user));
    }

    updateCurrentUser(user: ApiUser): void {
        this._user.next(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    logout(): void {
        this._accessToken.next(null);
        this._refreshToken.next(null);
        this._user.next(null);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }
}
