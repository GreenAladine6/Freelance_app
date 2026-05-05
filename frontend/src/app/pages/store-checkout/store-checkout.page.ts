import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiProduct } from '../../services/api.service';

@Component({
  selector: 'app-store-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/store"></ion-back-button>
        </ion-buttons>
        <ion-title>Validate Order</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="checkout-content">
      <div class="page-wrap">
        <section class="card">
          <h3>Delivery Details</h3>
          <div class="form-grid">
            <label>
              Full Name
              <input type="text" [(ngModel)]="form.fullName" placeholder="Client full name" />
            </label>
            <label>
              Email
              <input type="email" [(ngModel)]="form.email" placeholder="name@example.com" />
            </label>
            <label>
              Phone
              <input type="tel" [(ngModel)]="form.phone" placeholder="+212 ..." />
            </label>
            <label>
              Address
              <input type="text" [(ngModel)]="form.address" placeholder="Street, building..." />
            </label>
            <label>
              City
              <input type="text" [(ngModel)]="form.city" placeholder="City" />
            </label>
            <label>
              Postal Code
              <input type="text" [(ngModel)]="form.postalCode" placeholder="Postal code" />
            </label>
            <label>
              Country
              <input type="text" [(ngModel)]="form.country" placeholder="Country" />
            </label>
          </div>
        </section>

        <section class="card" *ngIf="cartItems.length > 0">
          <h3>Purchases</h3>
          <div class="summary-item" *ngFor="let item of cartItems">
            <span>{{ item.name }}</span>
            <strong>{{ item.price }} USD</strong>
          </div>
          <div class="summary-total">
            <span>Total</span>
            <strong>{{ cartTotal }} USD</strong>
          </div>
        </section>

        <section class="card empty" *ngIf="cartItems.length === 0">
          <p>Your cart is empty.</p>
          <button class="secondary" (click)="backToStore()">Back to Store</button>
        </section>

        <button class="primary" [disabled]="!canProceed() || cartItems.length === 0" (click)="passerAuPaiement()">
          Passer au paiement
        </button>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-toolbar { --background: #ffffff; border-bottom: 1px solid #e5e7eb; }
    .checkout-content { --background: #f9fafb; }
    .page-wrap { max-width: 520px; margin: 0 auto; padding: 16px; padding-bottom: 32px; display: flex; flex-direction: column; gap: 12px; }
    .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .card h3 { margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #111827; }
    .form-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
    label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 700; color: #374151; }
    input { border: 1px solid #d1d5db; border-radius: 10px; padding: 10px 12px; font-size: 14px; outline: none; }
    input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 2px rgba(139,92,246,0.15); }
    .summary-item { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px dashed #e5e7eb; font-size: 13px; color: #374151; }
    .summary-total { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; margin-top: 8px; font-size: 14px; color: #111827; font-weight: 700; }
    .primary { border: none; border-radius: 12px; background: #8b5cf6; color: white; font-weight: 700; font-size: 14px; padding: 12px; }
    .primary:disabled { opacity: 0.5; }
    .secondary { border: 1px solid #8b5cf6; border-radius: 10px; background: #fff; color: #8b5cf6; font-weight: 700; font-size: 13px; padding: 10px 12px; }
    .empty p { margin: 0 0 10px; color: #6b7280; }
  `]
})
export class StoreCheckoutPage implements OnInit {
  cartItems: ApiProduct[] = [];
  cartTotal = 0;

  form = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  };

  private readonly cartStorageKey = 'fh_store_cart';

  constructor(private router: Router, private toast: ToastController) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    try {
      const raw = localStorage.getItem(this.cartStorageKey);
      this.cartItems = raw ? JSON.parse(raw) : [];
      this.cartTotal = this.cartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    } catch {
      this.cartItems = [];
      this.cartTotal = 0;
    }
  }

  canProceed(): boolean {
    return !!(
      this.form.fullName.trim() &&
      this.form.email.trim() &&
      this.form.phone.trim() &&
      this.form.address.trim() &&
      this.form.city.trim() &&
      this.form.postalCode.trim() &&
      this.form.country.trim()
    );
  }

  async passerAuPaiement(): Promise<void> {
    const t = await this.toast.create({
      message: 'Payment will be available soon',
      duration: 2200,
      color: 'medium'
    });
    t.present();
  }

  backToStore(): void {
    this.router.navigate(['/store']);
  }
}
