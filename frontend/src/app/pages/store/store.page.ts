import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService, ApiProduct } from '../../services/api.service';
import { ToastController } from '@ionic/angular';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, BottomNavComponent],
  template: `
    <ion-header class="ion-no-border store-header">
      <ion-toolbar>
        <ion-title>Store</ion-title>
        <ion-buttons slot="end">
          <button class="cart-btn" (click)="openCart()">
            <ion-icon name="cart-outline"></ion-icon>
            <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
          </button>
        </ion-buttons>
      </ion-toolbar>
      
      <div class="search-section">
        <div class="search-bar">
          <ion-icon name="search-outline"></ion-icon>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search products..." />
        </div>
      </div>
      
      <div class="categories-scroll">
        <button *ngFor="let cat of categories" 
                class="category-btn" 
                [class.active]="selectedCategory === cat"
                (click)="onCategoryChange(cat)">
          {{ cat }}
        </button>
      </div>
    </ion-header>

    <ion-content class="store-content">
      <div class="products-section">
        <div class="products-grid" *ngIf="!loading || products.length > 0">
          <div *ngFor="let item of products" class="product-card elevation-1">
            <div class="product-image-wrap">
              <img [src]="item.image_url || 'https://via.placeholder.com/300x200'" class="product-image" />
            </div>
            
            <div class="product-details">
              <h4 class="product-title">{{ item.name }}</h4>
              <p class="product-desc">{{ item.description }}</p>
              
              <div class="price-row">
                <span class="current-price">\${{ item.price }}</span>
              </div>
              
              <button class="add-cart-btn" (click)="addToCart(item)">
                {{ isInCart(item) ? 'In Cart' : 'Add to Cart' }}
              </button>
            </div>
          </div>
        </div>
        
        <ion-spinner *ngIf="loading" class="ion-padding"></ion-spinner>

        <div *ngIf="!loading && products.length === 0" class="empty-state">
          <div class="empty-icon"><ion-icon name="search"></ion-icon></div>
          <h3>No products found</h3>
        </div>

        <ion-infinite-scroll threshold="120px" (ionInfinite)="loadMore($event)" [disabled]="!hasMore">
          <ion-infinite-scroll-content loadingSpinner="dots" loadingText="Loading more products..."></ion-infinite-scroll-content>
        </ion-infinite-scroll>
      </div>
    </ion-content>

    <div class="modal-overlay" *ngIf="isCartOpen" (click)="closeCart()"></div>
    <div class="bottom-sheet" *ngIf="isCartOpen" [class.show]="isCartOpen">
      <div class="sheet-head">
        <h3>My Purchases</h3>
        <ion-button fill="clear" color="medium" (click)="closeCart()">
          <ion-icon name="close"></ion-icon>
        </ion-button>
      </div>

      <div class="cart-empty" *ngIf="cartItems.length === 0">
        <ion-icon name="cart-outline"></ion-icon>
        <p>Your cart is empty</p>
      </div>

      <div class="cart-list" *ngIf="cartItems.length > 0">
        <div class="cart-item" *ngFor="let item of cartItems">
          <img [src]="item.image_url || 'https://via.placeholder.com/120x90'" alt="Product" />
          <div class="cart-info">
            <p class="cart-title">{{ item.name }}</p>
            <p class="cart-price">{{ item.price }} USD</p>
          </div>
          <button class="remove-btn" (click)="removeFromCart(item)">Remove</button>
        </div>
      </div>

      <div class="cart-footer" *ngIf="cartItems.length > 0">
        <div class="cart-total">
          <span>Total</span>
          <strong>{{ getCartTotal() }} USD</strong>
        </div>
        <button class="cart-action solid" (click)="validateCart()">Valider panier</button>
      </div>
    </div>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .store-header { background: white; border-bottom: 1px solid #F3F4F6; }
    ion-toolbar { --background: white; }
    ion-title { font-size: 20px; font-weight: 600; color: #111827; }
    .cart-btn { position: relative; background: transparent; border: none; padding: 8px; margin-right: 8px; font-size: 24px; color: #111827; }
    .cart-badge { position: absolute; top: 0; right: 0; background: #8B5CF6; color: white; font-size: 10px; font-weight: 700; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .search-section { padding: 8px 16px 16px; }
    .search-bar { display: flex; align-items: center; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; height: 48px; padding: 0 16px; gap: 8px; }
    .search-bar ion-icon { color: #9CA3AF; font-size: 20px; }
    .search-bar input { flex: 1; border: none; background: transparent; outline: none; font-size: 14px; color: #111827; }
    .categories-scroll { display: flex; overflow-x: auto; gap: 8px; padding: 0 16px 16px; }
    .categories-scroll::-webkit-scrollbar { display: none; }
    .category-btn { padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; white-space: nowrap; background: white; color: #4B5563; border: 1px solid #D1D5DB; }
    .category-btn.active { background: #8B5CF6; color: white; border-color: #8B5CF6; }
    .store-content { --background: #F9FAFB; }
    .products-section { padding: 16px 16px 100px; }
    .products-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .product-card { background: white; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
    .product-image-wrap { position: relative; aspect-ratio: 4/3; }
    .product-image { width: 100%; height: 100%; object-fit: cover; }
    .product-details { padding: 12px; display: flex; flex-direction: column; flex: 1; }
    .product-title { font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 4px; }
    .product-desc { font-size: 10px; color: #6B7280; margin: 0 0 8px; }
    .price-row { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
    .current-price { font-size: 14px; font-weight: 700; color: #8B5CF6; }
    .add-cart-btn { width: 100%; padding: 8px; background: #8B5CF6; color: white; border-radius: 8px; font-size: 12px; font-weight: 500; border: none; margin-top: auto; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 16px; text-align: center; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; }
    .bottom-sheet {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-width: 420px;
      margin: 0 auto;
      background: white;
      border-radius: 24px 24px 0 0;
      padding: 16px;
      z-index: 101;
      transform: translateY(100%);
      transition: transform 0.3s;
      max-height: 78vh;
      display: flex;
      flex-direction: column;
    }
    .bottom-sheet.show { transform: translateY(0); }
    .sheet-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .sheet-head h3 { margin: 0; font-size: 18px; font-weight: 700; color: #111827; }

    .cart-empty { padding: 30px 10px; text-align: center; color: #6b7280; }
    .cart-empty ion-icon { font-size: 42px; }
    .cart-empty p { margin: 8px 0 0; font-size: 14px; }

    .cart-list { overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 8px; }
    .cart-item { display: flex; align-items: center; gap: 10px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 8px; }
    .cart-item img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; }
    .cart-info { flex: 1; min-width: 0; }
    .cart-title { margin: 0; font-size: 13px; font-weight: 700; color: #111827; }
    .cart-price { margin: 4px 0 0; font-size: 12px; color: #8B5CF6; font-weight: 700; }
    .remove-btn { border: none; background: #fee2e2; color: #b91c1c; border-radius: 8px; padding: 6px 8px; font-size: 11px; font-weight: 700; }

    .cart-footer { border-top: 1px solid #e5e7eb; margin-top: 10px; padding-top: 10px; display: flex; flex-direction: column; gap: 8px; }
    .cart-total { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #374151; }
    .cart-total strong { color: #111827; font-size: 16px; }
    .cart-action { width: 100%; border: none; border-radius: 10px; padding: 10px 12px; font-size: 13px; font-weight: 700; }
    .cart-action.solid { background: #8B5CF6; color: white; }
  `]
})
export class StorePage implements OnInit {
  searchQuery = "";
  selectedCategory = "All";
  loading = false;
  loadingMore = false;
  products: ApiProduct[] = [];
  categories = ["All", "Templates", "Graphics", "UI Kits", "Icons"];
  cartItems: ApiProduct[] = [];
  cartCount = 0;
  isCartOpen = false;
  currentPage = 1;
  readonly pageSize = 10;
  hasMore = true;

  private readonly cartStorageKey = 'fh_store_cart';

  constructor(private api: ApiService, private toast: ToastController, private router: Router) { }

  ngOnInit() {
    this.loadCart();
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.currentPage = 1;
    this.hasMore = true;
    setTimeout(() => {
      this.api.getProducts(this.selectedCategory === 'All' ? undefined : this.selectedCategory, this.currentPage, this.pageSize).subscribe({
        next: (data) => {
          this.products = data;
          this.loading = false;
          this.hasMore = data.length === this.pageSize;
        },
        error: () => this.loading = false
      });
    }, 1000);
  }

  loadMore(event: any) {
    if (!this.hasMore || this.loadingMore) {
      event.target.complete();
      return;
    }

    this.loadingMore = true;
    const nextPage = this.currentPage + 1;
    setTimeout(() => {
      this.api.getProducts(this.selectedCategory === 'All' ? undefined : this.selectedCategory, nextPage, this.pageSize).subscribe({
        next: (data) => {
          this.products = [...this.products, ...data];
          this.currentPage = nextPage;
          this.hasMore = data.length === this.pageSize;
          this.loadingMore = false;
          event.target.complete();
          if (!this.hasMore) {
            event.target.disabled = true;
          }
        },
        error: () => {
          this.loadingMore = false;
          event.target.complete();
        }
      });
    }, 1000);
  }

  onCategoryChange(cat: string) {
    this.selectedCategory = cat;
    this.loadProducts();
  }

  isInCart(item: any): boolean {
    return this.cartItems.some(cartItem => cartItem.id === item.id);
  }

  async addToCart(item: any) {
    if (this.isInCart(item)) {
      const existingToast = await this.toast.create({
        message: 'This item is already in your cart',
        duration: 1800,
        color: 'medium'
      });
      existingToast.present();
      return;
    }

    this.cartItems = [...this.cartItems, item];
    this.cartCount = this.cartItems.length;
    localStorage.setItem(this.cartStorageKey, JSON.stringify(this.cartItems));

    const t = await this.toast.create({
      message: 'Added to cart',
      duration: 1800,
      color: 'success'
    });
    t.present();
  }

  loadCart() {
    try {
      const raw = localStorage.getItem(this.cartStorageKey);
      this.cartItems = raw ? JSON.parse(raw) : [];
      this.cartCount = this.cartItems.length;
    } catch {
      this.cartItems = [];
      this.cartCount = 0;
    }
  }

  openCart() {
    this.isCartOpen = true;
  }

  closeCart() {
    this.isCartOpen = false;
  }

  getCartTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }

  async removeFromCart(item: ApiProduct) {
    this.cartItems = this.cartItems.filter((cartItem) => cartItem.id !== item.id);
    this.cartCount = this.cartItems.length;
    localStorage.setItem(this.cartStorageKey, JSON.stringify(this.cartItems));
    const t = await this.toast.create({
      message: 'Item removed from cart',
      duration: 1500,
      color: 'medium'
    });
    t.present();
  }

  async validateCart() {
    if (this.cartItems.length === 0) {
      const t = await this.toast.create({
        message: 'Your cart is empty',
        duration: 1500,
        color: 'warning'
      });
      t.present();
      return;
    }
    this.closeCart();
    this.router.navigate(['/store/checkout']);
  }
}
