import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  standalone: true,
  selector: 'app-locateur-home',
  templateUrl: './locateur-home.page.html',
  imports: [IonicModule, CommonModule]
})
export class LocateurHomePage {
  constructor(private authService: AuthService) {}
  logout() { this.authService.logout(); }
}
