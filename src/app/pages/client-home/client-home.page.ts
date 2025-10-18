import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  standalone: true,
  selector: 'app-client-home',
  templateUrl: './client-home.page.html',
  imports: [IonicModule, CommonModule]
})
export class ClientHomePage {
  constructor(private authService: AuthService) {}
  logout() { this.authService.logout(); }
}
