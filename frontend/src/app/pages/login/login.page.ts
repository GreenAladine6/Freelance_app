import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth';

declare var google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class LoginPage {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;
  verificationCode = '';
  requiresVerification = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    // Make the callback available globally for Google
    (window as any).handleCredentialResponse = (response: any) => this.handleGoogleLogin(response);
  }

  ngOnInit() {
    this.initializeGoogleSignIn();
  }

  initializeGoogleSignIn() {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  handleGoogleLogin(response: any) {
    if (!response.credential) {
      this.showToast('Google authentication failed', 'danger');
      return;
    }

    this.loading = true;
    const googleToken = response.credential;

    this.auth.loginWithGoogle(googleToken).subscribe({
      next: (res) => {
        this.loading = false;
        const userType = res.user?.user_type;

        if (userType === 'client') this.router.navigate(['/dashboard-client']);
        else if (userType === 'freelancer') this.router.navigate(['/dashboard']);
        else if (userType === 'admin') this.router.navigate(['/dashboard-admin']);
        else this.router.navigate(['/dashboard']);
      },
      error: async (err) => {
        this.loading = false;
        this.showToast(err.error?.error || 'Google login failed', 'danger');
      }
    });
  }

  async onLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;

    const { email, password } = this.loginForm.value;

    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.loading = false;
        this.requiresVerification = false;
        this.verificationCode = '';
        // Backend returns `user_type` field (admin|client|freelancer)
        const userType = res.user?.user_type;

        if (userType === 'client') this.router.navigate(['/dashboard-client']);
        else if (userType === 'freelancer') this.router.navigate(['/dashboard']);
        else if (userType === 'admin') this.router.navigate(['/dashboard-admin']);
        else this.router.navigate(['/dashboard']);
      },
      error: async (err) => {
        this.loading = false;
        if (err.error?.requires_email_verification) {
          this.requiresVerification = true;
        }
        this.showToast(err.error?.error || 'Login failed', 'danger');
      }
    });
  }

  async verifyEmail() {
    const email = this.loginForm.get('email')?.value;
    const code = (this.verificationCode || '').trim();

    if (!email || !code) {
      this.showToast('Enter email and verification code', 'warning');
      return;
    }

    this.loading = true;
    this.auth.verifyEmail(email, code).subscribe({
      next: async (res) => {
        this.loading = false;
        this.requiresVerification = false;
        this.verificationCode = '';
        this.showToast(res.message || 'Email verified successfully', 'success');
      },
      error: async (err) => {
        this.loading = false;
        this.showToast(err.error?.error || 'Failed to verify email', 'danger');
      }
    });
  }

  async resendVerificationCode() {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.showToast('Enter your email first', 'warning');
      return;
    }

    this.loading = true;
    this.auth.resendVerificationCode(email).subscribe({
      next: async (res) => {
        this.loading = false;
        this.showToast(res.message || 'Verification code resent', 'success');
      },
      error: async (err) => {
        this.loading = false;
        this.showToast(err.error?.error || 'Failed to resend code', 'danger');
      }
    });
  }

  private async showToast(message: string, color: string) {
    const t = await this.toast.create({
      message,
      duration: 3000,
      color
    });
    t.present();
  }
}