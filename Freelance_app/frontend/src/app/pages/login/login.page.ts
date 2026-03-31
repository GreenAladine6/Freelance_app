import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterModule]
})
export class LoginPage {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;

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
  }

  async onLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;

    const { email, password } = this.loginForm.value;

    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.loading = false;
        // Backend returns `user_type` field (admin|client|freelancer)
        const userType = res.user?.user_type;

        if (userType === 'client') this.router.navigate(['/client']);
        else if (userType === 'freelancer') this.router.navigate(['/freelancer']);
        else if (userType === 'admin') this.router.navigate(['/admin']);
        else this.router.navigate(['/home']);
      },
      error: async (err) => {
        this.loading = false;
        const t = await this.toast.create({
          message: err.error?.error || 'Login failed',
          duration: 3000,
          color: 'danger'
        });
        t.present();
      }
    });
  }
}