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
          <button class="cart-btn">
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
        <div class="products-grid" *ngIf="!loading">
          <div *ngFor="let item of (products.length > 0 ? products : mockItems)" class="product-card elevation-1">
            <div class="product-image-wrap">
              <img [src]="item.image_url || item.image || 'https://via.placeholder.com/300x200'" class="product-image" />
            </div>
            
            <div class="product-details">
              <h4 class="product-title">{{ item.name || item.title }}</h4>
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

        <div *ngIf="!loading && products.length === 0 && mockItems.length === 0" class="empty-state">
          <div class="empty-icon"><ion-icon name="search"></ion-icon></div>
          <h3>No products found</h3>
        </div>
      </div>
    </ion-content>

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
  `]
})
export class StorePage implements OnInit {
  searchQuery = "";
  selectedCategory = "All";
  loading = false;
  products: ApiProduct[] = [];
  categories = ["All", "Templates", "Graphics", "UI Kits", "Icons"];
  cartItems: ApiProduct[] = [];
  cartCount = 0;

  private readonly cartStorageKey = 'fh_store_cart';

  mockItems: any[] = [
  ];

  constructor(private api: ApiService, private toast: ToastController) { }

  ngOnInit() {
    this.loadCart();
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.api.getProducts(this.selectedCategory === 'All' ? undefined : this.selectedCategory).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
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
}
