import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-freelancer-welcome',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Freelancer</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Welcome to the Freelancer page</h2>
      <p>You are logged in as a freelancer.</p>
    </ion-content>
  `
})
export class FreelancerWelcomePage {}


