import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule],
  template: `
    <ion-content class="signup-content">
      <div class="signup-container">
        <header class="top-bar">
          <button class="back-btn" (click)="goBack()">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </button>
          <h1>Create Account</h1>
        </header>

        <div class="step-indicator">
          <span class="step-label">Step {{ currentStep }} of 2</span>
          <div class="step-dots">
            <div class="dot" [class.active]="currentStep === 1"></div>
            <div class="dot" [class.active]="currentStep === 2"></div>
          </div>
        </div>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="signup-form">
          <ng-container *ngIf="currentStep === 1">
            <div class="field-group">
              <label>Full Name</label>
              <div class="input-row">
                <ion-icon name="person-circle-outline"></ion-icon>
                <input type="text" formControlName="full_name" placeholder="John Doe">
              </div>
            </div>

            <div class="field-group">
              <label>Email</label>
              <div class="input-row">
                <ion-icon name="mail-outline"></ion-icon>
                <input type="email" formControlName="email" placeholder="john@example.com">
              </div>
              <span class="field-error" *ngIf="f['email'].dirty && f['email'].invalid">Enter a valid email</span>
            </div>

            <div class="field-group">
              <label>Password</label>
              <div class="input-row">
                <ion-icon name="lock-closed-outline"></ion-icon>
                <input [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="••••••••">
                <ion-icon [name]="showPassword ? 'eye-off-outline' : 'eye-outline'" class="toggle-pw" (click)="showPassword = !showPassword"></ion-icon>
              </div>
              <span class="field-error" *ngIf="f['password'].dirty && f['password'].invalid">Min 6 characters</span>
            </div>

            <div class="field-group">
              <label>I want to join as:</label>
              <div class="role-cards">
                <button type="button" class="role-card" [class.selected]="role === 'freelancer'" (click)="role = 'freelancer'">
                  <ion-icon name="person-outline"></ion-icon>
                  <span>Freelancer</span>
                </button>
                <button type="button" class="role-card" [class.selected]="role === 'client'" (click)="role = 'client'">
                  <ion-icon name="briefcase-outline"></ion-icon>
                  <span>Client</span>
                </button>
              </div>
            </div>
          </ng-container>

          <ng-container *ngIf="currentStep === 2">
            <div class="role-summary">
              <span>{{ role === 'freelancer' ? 'Freelancer details' : 'Client details' }}</span>
              <p>{{ role === 'freelancer' ? 'Fill in your professional profile before creating the account.' : 'Add a short bio and finalize your account.' }}</p>
            </div>

            <div class="field-group">
              <label>About You</label>
              <div class="input-row textarea-row">
                <ion-icon name="document-text-outline"></ion-icon>
                <textarea formControlName="bio" placeholder="Tell people what you do"></textarea>
              </div>
            </div>

            <ng-container *ngIf="role === 'freelancer'">
              <div class="field-group">
                <label>Skills</label>
                <div class="input-row textarea-row">
                  <ion-icon name="pricetags-outline"></ion-icon>
                  <textarea formControlName="skills" placeholder="React, TypeScript, UI/UX"></textarea>
                </div>
              </div>

              <div class="field-group">
                <label>Hourly Rate</label>
                <div class="input-row">
                  <ion-icon name="cash-outline"></ion-icon>
                  <input type="number" formControlName="hourly_rate" placeholder="45">
                </div>
              </div>

              <div class="field-group">
                <label>Education</label>
                <div class="input-row textarea-row">
                  <ion-icon name="school-outline"></ion-icon>
                  <textarea formControlName="education" placeholder="Degree | School | Year"></textarea>
                </div>
              </div>

              <div class="field-group">
                <label>Experience</label>
                <div class="input-row textarea-row">
                  <ion-icon name="briefcase-outline"></ion-icon>
                  <textarea formControlName="experience" placeholder="Role | Company | Duration"></textarea>
                </div>
              </div>

              <div class="field-group">
                <label>Portfolio</label>
                <div class="input-row textarea-row">
                  <ion-icon name="image-outline"></ion-icon>
                  <textarea formControlName="portfolio" placeholder="Title | Image URL"></textarea>
                </div>
              </div>
            </ng-container>
          </ng-container>

          <!-- Terms -->
          <label class="terms-row">
            <input type="checkbox" [(ngModel)]="agreed" [ngModelOptions]="{standalone: true}">
            <span>I agree to <a href="#">Terms & Conditions</a></span>
          </label>

          <div class="error-msg" *ngIf="errorMsg">{{errorMsg}}</div>

          <div class="step-actions">
            <button *ngIf="currentStep === 2" type="button" class="secondary-btn" (click)="prevStep()">Back</button>
            <button *ngIf="currentStep === 1" type="button" class="submit-btn" [disabled]="!canContinueStep1()" (click)="nextStep()">
              Continue
            </button>
            <button *ngIf="currentStep === 2" type="submit" class="submit-btn" [disabled]="signupForm.invalid || !agreed || !role">
              Create Account
            </button>
          </div>
        </form>

        <p class="signin-link">
          Already have an account?
          <button (click)="goLogin()">Sign In</button>
        </p>
      </div>
    </ion-content>
  `,
  styles: [`
    .signup-content { --background: #fff; }
    .signup-container { padding: 0 24px 40px; max-width: 400px; margin: 0 auto; }
    .top-bar {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 0 8px; border-bottom: 1px solid #F3F4F6; margin-bottom: 20px;
    }
    .back-btn {
      background: none; border: none; padding: 4px; cursor: pointer;
      ion-icon { font-size: 24px; color: #374151; }
    }
    h1 { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
    .step-indicator {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
    }
    .step-label { font-size: 13px; font-weight: 600; color: #8B5CF6; }
    .step-dots { display: flex; gap: 4px; }
    .dot { width: 32px; height: 6px; border-radius: 3px; background: #E5E7EB; }
    .dot.active { background: #8B5CF6; }
    .role-summary {
      background: #F5F3FF;
      border: 1px solid #E9D5FF;
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 2px;
    }
    .role-summary span { display: block; font-size: 13px; font-weight: 700; color: #6D28D9; margin-bottom: 4px; }
    .role-summary p { margin: 0; font-size: 12px; color: #6B7280; line-height: 1.5; }
    .signup-form { display: flex; flex-direction: column; gap: 18px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-group label { font-size: 12px; font-weight: 600; color: #6B7280; }
    .input-row {
      display: flex; align-items: center; gap: 10px;
      background: #F9FAFB; border: 1.5px solid #E5E7EB;
      border-radius: 12px; padding: 12px 14px; transition: border 0.2s;
    }
    .textarea-row { align-items: flex-start; }
    .input-row:focus-within { border-color: #8B5CF6; }
    .input-row ion-icon { font-size: 18px; color: #9CA3AF; flex-shrink: 0; }
    .input-row input {
      flex: 1; border: none; background: transparent; font-size: 14px; color: #111827; outline: none;
    }
    .input-row textarea {
      flex: 1; min-height: 72px; border: none; background: transparent; font-size: 14px; color: #111827; outline: none; resize: vertical; font-family: inherit;
    }
    .toggle-pw { cursor: pointer; }
    .field-error { font-size: 11px; color: #EF4444; }
    .role-cards { display: flex; gap: 12px; }
    .role-card {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 16px 12px; border-radius: 12px; border: 2px solid #E5E7EB;
      background: white; cursor: pointer; transition: all 0.2s;
      ion-icon { font-size: 24px; color: #9CA3AF; }
      span { font-size: 12px; font-weight: 700; color: #6B7280; }
    }
    .role-card.selected {
      background: #F5F3FF; border-color: #8B5CF6;
      ion-icon { color: #8B5CF6; }
      span { color: #8B5CF6; }
    }
    .terms-row {
      display: flex; align-items: center; gap: 10px; cursor: pointer;
      input { width: 18px; height: 18px; accent-color: #8B5CF6; }
      span { font-size: 13px; color: #6B7280; }
      a { color: #8B5CF6; text-decoration: none; font-weight: 600; }
    }
    .error-msg { background: #FEF2F2; color: #DC2626; border-radius: 10px; padding: 10px 14px; font-size: 13px; }
    .step-actions { display: flex; gap: 12px; }
    .submit-btn {
      width: 100%; padding: 16px; background: #8B5CF6; color: white;
      border-radius: 24px; font-size: 15px; font-weight: 700; border: none; cursor: pointer;
      box-shadow: 0 8px 24px rgba(139,92,246,0.3); transition: opacity 0.2s, transform 0.15s;
    }
    .secondary-btn {
      width: 100%; padding: 16px; background: #fff; color: #6D28D9;
      border-radius: 24px; font-size: 15px; font-weight: 700; border: 1px solid #E9D5FF; cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
    }
    .submit-btn:disabled { background: #E5E7EB; color: #9CA3AF; box-shadow: none; cursor: not-allowed; }
    .submit-btn:not(:disabled):active { transform: scale(0.97); }
    .secondary-btn:active { transform: scale(0.97); }
    .signin-link {
      text-align: center; font-size: 14px; color: #6B7280; margin-top: 16px;
      button { background: none; border: none; color: #8B5CF6; font-weight: 700; cursor: pointer; }
    }
  `]
})
export class SignupPage {
  signupForm: FormGroup;
  showPassword = false;
  agreed = false;
  role: 'freelancer' | 'client' | '' = '';
  errorMsg = '';
  currentStep = 1;

  get f() { return this.signupForm.controls; }

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private toast: ToastController,
    private loading: LoadingController
  ) {
    this.signupForm = this.fb.group({
      full_name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      bio: [''],
      skills: [''],
      hourly_rate: [''],
      education: [''],
      experience: [''],
      portfolio: ['']
    });
  }

  goBack() { history.back(); }
  goLogin() { this.router.navigate(['/login']); }

  nextStep() {
    if (!this.canContinueStep1()) return;
    this.errorMsg = '';
    this.currentStep = 2;
  }

  prevStep() {
    this.errorMsg = '';
    this.currentStep = 1;
  }

  canContinueStep1() {
    return !!this.signupForm.get('full_name')?.value?.trim()
      && this.signupForm.get('email')?.valid
      && this.signupForm.get('password')?.valid
      && !!this.role;
  }

  async onSubmit() {
    if (this.currentStep === 1) {
      this.nextStep();
      return;
    }

    if (this.signupForm.invalid || !this.agreed || !this.role) return;
    this.errorMsg = '';

    const loader = await this.loading.create({ message: 'Creating account...' });
    await loader.present();

    const { full_name, email, password, bio, skills, hourly_rate, education, experience, portfolio } = this.signupForm.value;
    const payload: any = {
      username: email.split('@')[0],
      email, password,
      user_type: this.role as 'client' | 'freelancer',
      full_name: full_name || undefined,
      bio: bio?.trim() || undefined,
    };

    if (this.role === 'freelancer') {
      payload.skills = skills?.trim() || undefined;
      payload.hourly_rate = hourly_rate ? parseFloat(hourly_rate) : undefined;
      payload.education = this.parseList(education, ['degree', 'school', 'year']);
      payload.experience = this.parseList(experience, ['role', 'company', 'duration']);
      payload.portfolio = this.parseList(portfolio, ['title', 'image_url']);
    }

    this.api.register(payload).subscribe({
      next: async () => {
        await loader.dismiss();
        const t = await this.toast.create({ message: 'Account created! Please sign in.', duration: 3000, color: 'success' });
        t.present();
        this.router.navigate(['/login']);
      },
      error: async (err) => {
        await loader.dismiss();
        this.errorMsg = err.error?.error || 'Registration failed.';
      }
    });
  }

  private parseList(text: string, keys: string[]): any[] {
    return (text || '')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split('|').map(part => part.trim()).filter(Boolean);
        const item: any = {};
        keys.forEach((key, index) => {
          if (parts[index]) item[key] = parts[index];
        });
        return item;
      })
      .filter(item => Object.keys(item).length > 0);
  }
}
