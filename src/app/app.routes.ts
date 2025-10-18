import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { SignupPage } from './pages/signup/signup.page';
import { ClientHomePage } from './pages/client-home/client-home.page';
import { LocateurHomePage } from './pages/locateur-home/locateur-home.page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'signup', component: SignupPage },
  { path: 'client-home', component: ClientHomePage },
  { path: 'locateur-home', component: LocateurHomePage },
  { path: '**', redirectTo: 'login' }
];
