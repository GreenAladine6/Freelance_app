import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { RoleService } from '../../services/role.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-create-gig',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, BottomNavComponent],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button [defaultHref]="roleService.role === 'client' ? '/dashboard-client' : '/dashboard'" icon="arrow-back"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ roleService.role === 'client' ? 'Post Project' : 'Post Service' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="create-content">
      <div class="form-container">
        <!-- Title -->
        <div class="form-group">
          <label>{{ roleService.role === 'client' ? 'Project' : 'Service' }} Title <span class="required">*</span></label>
          <input type="text" [(ngModel)]="title" [placeholder]="roleService.role === 'client' ? 'e.g., Build a React Dashboard' : 'e.g., I will design a professional logo'" class="custom-input" />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label>Description <span class="required">*</span></label>
          <textarea [(ngModel)]="description" placeholder="Describe in detail..." class="custom-textarea" rows="5"></textarea>
        </div>

        <!-- Category -->
        <div class="form-group">
          <label>Category <span class="required">*</span></label>
          <div class="select-wrapper">
            <select [(ngModel)]="category" class="custom-select">
              <option value="" disabled selected>Select a category</option>
              <option value="Design">Design & Creative</option>
              <option value="Development">Development & IT</option>
              <option value="Writing">Writing & Translation</option>
              <option value="Templates">Templates & UI Kits</option>
              <option value="Video">Video & Animation</option>
            </select>
            <ion-icon name="chevron-down" class="select-icon"></ion-icon>
          </div>
        </div>

        <!-- Price/Budget -->
        <div class="form-group">
          <label>{{ roleService.role === 'client' ? 'Budget' : 'Price' }} <span class="required">*</span></label>
          <div class="price-wrapper">
            <span class="currency-symbol">$</span>
            <input type="number" [(ngModel)]="price" placeholder="0.00" class="custom-input price-input" />
          </div>
        </div>

        <!-- Image URL -->
        <div class="form-group">
          <label>Image URL (Optional)</label>
          <input type="text" [(ngModel)]="imageUrl" placeholder="https://images.unsplash.com/..." class="custom-input" />
        </div>

        <!-- Tags -->
        <div class="form-group">
          <label>{{ roleService.role === 'client' ? 'Required Skills' : 'Tags' }}</label>
          <div class="tags-container" *ngIf="tags.length > 0">
            <span class="tag" *ngFor="let tag of tags">
              {{ tag }}
              <ion-icon name="close" (click)="handleRemoveTag(tag)"></ion-icon>
            </span>
          </div>
          <div class="tag-input-row">
            <input type="text" [(ngModel)]="newTag" (keydown.enter)="handleAddTag()" placeholder="Add a tag..." class="custom-input tag-input" />
            <button class="add-tag-btn" (click)="handleAddTag()">Add</button>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <div class="error-msg" *ngIf="error">
        {{ error }}
      </div>
      <div class="footer-buttons">
        <button class="submit-btn" [disabled]="loading" (click)="handleSubmit()">
          <ion-spinner *ngIf="loading" name="crescent" class="btn-spinner"></ion-spinner>
          <span *ngIf="!loading">Submit for Admin Review</span>
        </button>
        <button class="draft-btn" [disabled]="loading" (click)="handleCancel()">
          Cancel
        </button>
      </div>
    </ion-footer>
    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    ion-toolbar { --background: white; border-bottom: 1px solid #E5E7EB; }
    ion-title { font-size: 18px; font-weight: 600; color: #111827; }
    .save-btn { --color: #8B5CF6; }
    
    .create-content { --background: #F9FAFB; }
    .form-container { padding: 24px 16px; display: flex; flex-direction: column; gap: 24px; }
    
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 14px; font-weight: 500; color: #111827; }
    .required { color: #EF4444; }
    
    .custom-input, .custom-textarea, .custom-select { width: 100%; border: 2px solid #D1D5DB; border-radius: 8px; background: white; outline: none; transition: border-color 0.2s; font-family: inherit; font-size: 14px; color: #111827; padding: 0 16px; }
    .custom-input { height: 48px; }
    .custom-textarea { padding: 12px 16px; resize: none; }
    .custom-input:focus, .custom-textarea:focus, .custom-select:focus { border-color: #8B5CF6; }
    .custom-input::placeholder, .custom-textarea::placeholder { color: #9CA3AF; }
    
    .char-count { font-size: 12px; color: #6B7280; }
    
    .select-wrapper { position: relative; }
    .custom-select { height: 48px; appearance: none; -webkit-appearance: none; }
    .select-icon { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #6B7280; pointer-events: none; }
    
    .price-wrapper { position: relative; }
    .currency-symbol { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #4B5563; font-weight: 500; z-index: 1; }
    .price-input { padding-left: 32px; }
    
    .tags-container { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
    .tag { display: flex; align-items: center; gap: 4px; padding: 6px 12px; background: #F3E8FF; color: #8B5CF6; border: 1px solid #E9D5FF; border-radius: 9999px; font-size: 14px; font-weight: 500; }
    .tag ion-icon { cursor: pointer; border-radius: 50%; padding: 2px; }
    .tag ion-icon:hover { background: #E9D5FF; }
    
    .tag-input-row { display: flex; gap: 8px; }
    .tag-input { flex: 1; height: 40px; }
    .add-tag-btn { height: 40px; padding: 0 16px; background: #F3F4F6; color: #374151; font-weight: 500; border: none; border-radius: 8px; cursor: pointer; }
    .add-tag-btn:hover { background: #E5E7EB; }
    
    ion-footer { background: white; padding: 16px; border-top: 1px solid #E5E7EB; }
    .error-msg { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 12px; }
    
    .footer-buttons { display: flex; flex-direction: column; gap: 12px; }
    .submit-btn, .draft-btn { width: 100%; height: 48px; border-radius: 8px; font-weight: 500; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .submit-btn { background: #8B5CF6; color: white; border: none; transition: background 0.2s; }
    .submit-btn:hover { background: #7C3AED; }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .draft-btn { background: white; color: #374151; border: 2px solid #D1D5DB; transition: background 0.2s; }
    .draft-btn:hover { background: #F9FAFB; }
    .draft-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .btn-spinner { width: 20px; height: 20px; color: white; }
  `]
})
export class CreateGigPage {
  title = '';
  description = '';
  category = '';
  price = '';
  imageUrl = '';
  tags: string[] = [];
  newTag = '';
  loading = false;
  error: string | null = null;

  constructor(
    public router: Router,
    public api: ApiService,
    public roleService: RoleService
  ) { }

  handleAddTag() {
    if (this.newTag.trim() && !this.tags.includes(this.newTag.trim())) {
      this.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }

  handleRemoveTag(tagToRemove: string) {
    this.tags = this.tags.filter(tag => tag !== tagToRemove);
  }

  handleCancel() {
    const path = this.roleService.role === 'client' ? '/dashboard-client' : '/dashboard';
    this.router.navigate([path]);
  }

  async handleSubmit() {
    if (!this.title.trim() || !this.description.trim() || !this.price) {
      this.error = "Title, description, and price are required.";
      return;
    }

    const budgetNum = parseFloat(this.price);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      this.error = "Please enter a valid price.";
      return;
    }

    try {
      this.loading = true;
      this.error = null;

      if (this.roleService.role === 'client') {
        // Post as Job
        await this.api.createJob({
          title: this.title.trim(),
          description: this.description.trim(),
          budget: budgetNum,
          skills_required: this.tags.join(", "),
          duration: this.category || 'Flexible',
          image_url: this.imageUrl || undefined
        }).toPromise();
        this.router.navigate(['/dashboard-client']);
      } else {
        // Post as Product (Gig)
        await this.api.addProduct({
          name: this.title.trim(),
          description: this.description.trim(),
          price: budgetNum,
          category: this.category || 'General',
          image_url: this.imageUrl || undefined
        }).toPromise();
        this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      this.error = err.message || "Failed to submit. Please try again.";
    } finally {
      this.loading = false;
    }
  }
}
