import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ApiProduct, ApiService, ApiUser } from '../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  mode: 'store' | 'service' = 'store';
  loading = true;
  loadError: string | null = null;
  storePicks: ApiProduct[] = [];
  servicePicks: ApiUser[] = [];
  featuredTitle = '';
  featuredSubtitle = '';

  get defaultAvatarUrl() {
    return this.api.defaultAvatarUrl;
  }

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.pickMode();
    void this.loadFeaturedContent();
  }

  refreshContent() {
    this.pickMode();
    void this.loadFeaturedContent();
  }

  private pickMode() {
    this.mode = Math.random() < 0.5 ? 'store' : 'service';
    this.featuredTitle = this.mode === 'store' ? 'Fresh from the store' : 'Featured services';
    this.featuredSubtitle = this.mode === 'store'
      ? 'Discover products and templates picked for you.'
      : 'Browse talented freelancers and service offerings.';
  }

  private async loadFeaturedContent() {
    this.loading = true;
    this.loadError = null;

    try {
      if (this.mode === 'store') {
        const products = await firstValueFrom(this.api.getProducts(undefined, 1, 6));
        this.storePicks = (products || []).slice(0, 6);
        this.servicePicks = [];
      } else {
        const freelancers = await firstValueFrom(this.api.getFreelancers());
        this.servicePicks = (freelancers || []).slice(0, 6);
        this.storePicks = [];
      }
    } catch {
      this.loadError = 'Could not load featured content right now.';
      this.storePicks = [];
      this.servicePicks = [];
    } finally {
      this.loading = false;
    }
  }

}
