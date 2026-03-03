// Simple API client for talking to the Freelance_app Flask backend

const DEFAULT_API_URL = "http://localhost:5000/api";

export const API_URL =
  // Vite env var if provided, otherwise default to localhost
  (import.meta as any).env?.VITE_API_URL || DEFAULT_API_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: any;
    token?: string | null;
    query?: Record<string, string | number | boolean | undefined>;
  } = {}
): Promise<T> {
  const { method = "GET", body, token, query } = options;

  const url = new URL(API_URL + path);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

// ===== Auth =====

export interface ApiUser {
  id: string;
  username?: string;
  email?: string;
  user_type: "admin" | "client" | "freelancer";
  full_name?: string;
  bio?: string;
  skills?: string;
  hourly_rate?: number;
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

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: ApiUser;
}

export async function apiLogin(email: string, password: string) {
  return request<LoginResponse>("/login", {
    method: "POST",
    body: { email, password },
  });
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  user_type: "client" | "freelancer";
  full_name?: string;
  bio?: string;
  skills?: string;
  hourly_rate?: number;
}

export async function apiRegister(payload: RegisterPayload) {
  return request<{ message: string; user: ApiUser }>("/register", {
    method: "POST",
    body: payload,
  });
}

// ===== Profile =====

export interface UpdateProfilePayload {
  full_name?: string;
  bio?: string;
  skills?: string;
  hourly_rate?: number;
  password?: string;
}

export async function apiUpdateProfile(token: string, payload: UpdateProfilePayload) {
  return request<{ message: string; user: ApiUser }>("/me", {
    method: "PUT",
    body: payload,
    token,
  });
}

export async function apiGetProfile(token: string) {
  return request<ApiUser>("/me", { token });
}

// ===== Jobs (Gigs) =====

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
}

export async function apiGetJobs(params?: { status?: string; skills?: string }) {
  return request<ApiJob[]>("/jobs", {
    method: "GET",
    query: {
      status: params?.status,
      skills: params?.skills,
    },
  });
}

export async function apiGetJob(jobId: string) {
  return request<ApiJob>(`/jobs/${jobId}`);
}

export async function apiCreateJob(token: string, payload: CreateJobPayload) {
  return request<{ message: string; job: ApiJob }>("/jobs", {
    method: "POST",
    body: payload,
    token,
  });
}

export async function apiUpdateJob(token: string, jobId: string, payload: Partial<CreateJobPayload & { status: string }>) {
  return request<{ message: string; job: ApiJob }>(`/jobs/${jobId}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export async function apiDeleteJob(token: string, jobId: string) {
  return request<{ message: string }>(`/jobs/${jobId}`, {
    method: "DELETE",
    token,
  });
}

export async function apiGetMyJobs(token: string) {
  return request<ApiJob[]>("/my-jobs", { token });
}

// ===== Applications =====

export interface ApiApplication {
  id: string;
  job_id: string;
  freelancer_id?: string;
  freelancer_name?: string;
  cover_letter: string;
  proposed_rate?: number;
  status: "pending" | "accepted" | "rejected";
  created_at?: string;
}

export async function apiApplyForJob(
  token: string,
  jobId: string,
  payload: { cover_letter: string; proposed_rate?: number }
) {
  return request<{ message: string; application: ApiApplication }>(
    `/jobs/${jobId}/apply`,
    { method: "POST", body: payload, token }
  );
}

export async function apiGetJobApplications(token: string, jobId: string) {
  return request<ApiApplication[]>(`/jobs/${jobId}/applications`, { token });
}

export async function apiAcceptApplication(token: string, applicationId: string) {
  return request<{ message: string; application: ApiApplication }>(
    `/applications/${applicationId}/accept`,
    { method: "POST", token }
  );
}

export async function apiRejectApplication(token: string, applicationId: string) {
  return request<{ message: string; application: ApiApplication }>(
    `/applications/${applicationId}/reject`,
    { method: "POST", token }
  );
}

export async function apiGetMyApplications(token: string) {
  return request<ApiApplication[]>("/my-applications", { token });
}

// ===== Freelancers =====

export async function apiGetFreelancers(skills?: string) {
  return request<ApiUser[]>("/freelancers", {
    query: { skills },
  });
}

export async function apiGetUser(userId: string) {
  return request<ApiUser>(`/users/${userId}`);
}

// ===== Admin =====

export async function apiAdminStats(token: string) {
  return request<AdminStats>("/admin/stats", { token });
}

