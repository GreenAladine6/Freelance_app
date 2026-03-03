import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-admin-welcome',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Admin</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Welcome to the Admin page</h2>
      <p>You are logged in as an admin.</p>
    </ion-content>
  `
})
export class AdminWelcomePage {}


