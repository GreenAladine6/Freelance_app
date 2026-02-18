import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-interests',
  templateUrl: './interests.page.html',
  styleUrls: ['./interests.page.scss'],
})
export class InterestsPage {
  INTERESTS = [
    'Technology',
    'Design',
    'Music',
    'Sports',
    'Business',
    'Art',
  ];

  selected: string[] = [];

  constructor(private navCtrl: NavController) {}

  toggleInterest(interest: string) {
    if (this.selected.includes(interest)) {
      this.selected = this.selected.filter(i => i !== interest);
    } else {
      this.selected = [...this.selected, interest];
    }
  }

  get isContinueEnabled(): boolean {
    return this.selected.length > 0;
  }

  goToBrowse() {
    this.navCtrl.navigateForward('/browse');
  }
}
