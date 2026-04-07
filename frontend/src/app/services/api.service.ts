import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ApiUser {
    id: string;
    username?: string;
    email?: string;
    user_type: 'admin' | 'client' | 'freelancer';
    full_name?: string;
    bio?: string;
    skills?: string;
    hourly_rate?: number;
    avatar_url?: string;
    education?: any[];
    experience?: any[];
    portfolio?: any[];
    created_at?: string;
}

export interface LoginResponse {
    message: string;
    access_token: string;
    refresh_token: string;
    user: ApiUser;
}

export interface GoogleLoginPayload {
    token: string;
}

export interface GoogleLoginResponse {
    message: string;
    access_token: string;
    refresh_token: string;
    user: ApiUser;
    is_new_user?: boolean;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    user_type: 'client' | 'freelancer';
    full_name?: string;
    bio?: string;
    skills?: string;
    hourly_rate?: number;
    avatar_url?: string;
    education?: any[];
    experience?: any[];
    portfolio?: any[];
}

export interface ApiJob {
    id: string;
    title: string;
    description: string;
    budget: number | string;
    duration?: string;
    skills_required?: string;
    client_id?: string;
    client_name?: string;
    status: string;
    application_count?: number;
}

export interface CreateJobPayload {
    title: string;
    description: string;
    budget: number;
    duration?: string;
    skills_required?: string;
    image_url?: string;
}

export interface ApiApplication {
    id: string;
    job_id: string;
    freelancer_id?: string;
    freelancer_name?: string;
    cover_letter: string;
    proposed_rate?: number;
    status: 'pending' | 'accepted' | 'rejected';
    created_at?: string;
}

export interface AdminStats {
    total_users: number;
    freelancers: number;
    clients: number;
    open_jobs: number;
    total_jobs: number;
    total_applications: number;
    pending_applications: number;
}

export interface ApiConversation {
    id: string;
    last_message_at: string;
    other_user: ApiUser;
    last_message: ApiMessage;
    unread_count?: number;
}

export interface ApiMessage {
    id: string;
    conversation_id: string;
    sender_id: string;
    text: string;
    is_read: boolean;
    created_at: string;
}

export interface ApiProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    seller_id: string;
    seller_avatar_url?: string;
    created_at: string;
}

export interface AvatarUploadResponse {
    message: string;
    avatar_url: string;
    user: ApiUser;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
    readonly baseUrl = 'http://localhost:5000/api';
    readonly defaultAvatarUrl = `${this.baseUrl}/uploads/profile-images/default.avif`;

    constructor(private http: HttpClient) { }

    // ── Auth ──────────────────────────────────────────────
    login(email: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { email, password });
    }

    loginWithGoogle(token: string): Observable<GoogleLoginResponse> {
        return this.http.post<GoogleLoginResponse>(`${this.baseUrl}/login-google`, { token });
    }

    register(payload: RegisterPayload): Observable<{ message: string; user: ApiUser }> {
        return this.http.post<{ message: string; user: ApiUser }>(`${this.baseUrl}/register`, payload);
    }

    refresh(refreshToken: string): Observable<{ access_token: string }> {
        return this.http.post<{ access_token: string }>(`${this.baseUrl}/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
        });
    }

    // ── Profile ───────────────────────────────────────────
    getProfile(): Observable<ApiUser> {
        return this.http.get<ApiUser>(`${this.baseUrl}/me`);
    }

    updateProfile(payload: Partial<ApiUser & { password: string }>): Observable<{ message: string; user: ApiUser }> {
        return this.http.put<{ message: string; user: ApiUser }>(`${this.baseUrl}/me`, payload);
    }

    getUser(userId: string): Observable<ApiUser> {
        return this.http.get<ApiUser>(`${this.baseUrl}/users/${userId}`);
    }

    uploadProfileImage(file: File): Observable<AvatarUploadResponse> {
        const formData = new FormData();
        formData.append('image', file);
        return this.http.post<AvatarUploadResponse>(`${this.baseUrl}/me/avatar`, formData);
    }

    // ── Jobs ──────────────────────────────────────────────
    getJobs(params?: { status?: string; skills?: string }): Observable<ApiJob[]> {
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.skills) httpParams = httpParams.set('skills', params.skills);
        return this.http.get<ApiJob[]>(`${this.baseUrl}/jobs`, { params: httpParams });
    }

    getJob(jobId: string): Observable<ApiJob> {
        return this.http.get<ApiJob>(`${this.baseUrl}/jobs/${jobId}`);
    }

    createJob(payload: CreateJobPayload): Observable<{ message: string; job: ApiJob }> {
        return this.http.post<{ message: string; job: ApiJob }>(`${this.baseUrl}/jobs`, payload);
    }

    updateJob(jobId: string, payload: Partial<CreateJobPayload & { status: string }>): Observable<{ message: string; job: ApiJob }> {
        return this.http.put<{ message: string; job: ApiJob }>(`${this.baseUrl}/jobs/${jobId}`, payload);
    }

    deleteJob(jobId: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/jobs/${jobId}`);
    }

    getMyJobs(): Observable<ApiJob[]> {
        return this.http.get<ApiJob[]>(`${this.baseUrl}/my-jobs`);
    }

    // ── Applications ──────────────────────────────────────
    applyForJob(jobId: string, payload: { cover_letter: string; proposed_rate?: number }): Observable<{ message: string; application: ApiApplication }> {
        return this.http.post<{ message: string; application: ApiApplication }>(`${this.baseUrl}/jobs/${jobId}/apply`, payload);
    }

    getJobApplications(jobId: string): Observable<ApiApplication[]> {
        return this.http.get<ApiApplication[]>(`${this.baseUrl}/jobs/${jobId}/applications`);
    }

    acceptApplication(applicationId: string): Observable<{ message: string; application: ApiApplication }> {
        return this.http.post<{ message: string; application: ApiApplication }>(`${this.baseUrl}/applications/${applicationId}/accept`, {});
    }

    rejectApplication(applicationId: string): Observable<{ message: string; application: ApiApplication }> {
        return this.http.post<{ message: string; application: ApiApplication }>(`${this.baseUrl}/applications/${applicationId}/reject`, {});
    }

    getMyApplications(): Observable<ApiApplication[]> {
        return this.http.get<ApiApplication[]>(`${this.baseUrl}/my-applications`);
    }

    // ── Freelancers ───────────────────────────────────────
    getFreelancers(skills?: string): Observable<ApiUser[]> {
        let httpParams = new HttpParams();
        if (skills) httpParams = httpParams.set('skills', skills);
        return this.http.get<ApiUser[]>(`${this.baseUrl}/freelancers`, { params: httpParams });
    }

    // ── Admin ─────────────────────────────────────────────
    getAdminStats(): Observable<AdminStats> {
        return this.http.get<AdminStats>(`${this.baseUrl}/admin/stats`);
    }

    getAdminLogs(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/admin/logs`);
    }

    getAdminReports(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/admin/reports`);
    }

    updateReportStatus(reportId: string, status: 'resolved' | 'dismissed'): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/admin/reports/${reportId}`, { status });
    }

    getPendingContent(): Observable<{ jobs: any[], products: any[] }> {
        return this.http.get<{ jobs: any[], products: any[] }>(`${this.baseUrl}/admin/pending`);
    }

    approveContent(type: 'job' | 'product', id: string): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/admin/approve/${type}/${id}`, {});
    }

    getAnalytics(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/admin/analytics`);
    }

    // ── Chat ──────────────────────────────────────────────
    getConversations(): Observable<ApiConversation[]> {
        return this.http.get<ApiConversation[]>(`${this.baseUrl}/conversations`);
    }

    getOrCreateConversationWithUser(userId: string): Observable<ApiConversation> {
        return this.http.get<ApiConversation>(`${this.baseUrl}/conversations/with/${userId}`);
    }

    getConversation(conversationId: string): Observable<ApiConversation> {
        return this.http.get<ApiConversation>(`${this.baseUrl}/conversations/${conversationId}`);
    }

    getMessages(conversationId: string): Observable<ApiMessage[]> {
        return this.http.get<ApiMessage[]>(`${this.baseUrl}/conversations/${conversationId}/messages`);
    }

    sendMessage(payload: { recipient_id?: string; conversation_id?: string; text: string }): Observable<ApiMessage> {
        return this.http.post<ApiMessage>(`${this.baseUrl}/messages`, payload);
    }

    // ── Store ─────────────────────────────────────────────
    getProducts(category?: string, page: number = 1, limit: number = 10): Observable<ApiProduct[]> {
        let params = new HttpParams();
        if (category) params = params.set('category', category);
        params = params.set('page', String(page));
        params = params.set('limit', String(limit));
        return this.http.get<ApiProduct[]>(`${this.baseUrl}/products`, { params });
    }

    addProduct(payload: any): Observable<ApiProduct> {
        return this.http.post<ApiProduct>(`${this.baseUrl}/products`, payload);
    }

    // ── Health ────────────────────────────────────────────
    healthCheck(): Observable<{ status: string; message: string }> {
        return this.http.get<{ status: string; message: string }>(`${this.baseUrl}/health`);
    }
}
