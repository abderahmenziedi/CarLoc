import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: 'client' | 'locateur' | null = null;
  errorMessage: string = '';

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {}

  selectRole(selectedRole: 'client' | 'locateur') {
    this.role = selectedRole;
    this.errorMessage = ''; // Clear error when role is selected
  }

  async signup() {
    this.errorMessage = '';

    // Validation checks
    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = "Veuillez remplir tous les champs";
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = "Les mots de passe ne correspondent pas";
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = "Le mot de passe doit contenir au moins 6 caractères";
      return;
    }

    if (!this.role) {
      this.errorMessage = "Veuillez sélectionner un rôle (Client ou Locateur)";
      return;
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        this.auth, 
        this.email, 
        this.password
      );
      const uid = userCredential.user.uid;

      // Save user data to Firestore
      await setDoc(doc(this.firestore, `users/${uid}`), {
        email: this.email,
        role: this.role,
        createdAt: new Date().toISOString()
      });

      // Redirect based on role
      if (this.role === 'client') {
        await this.router.navigate(['/client-home']);
      } else if (this.role === 'locateur') {
        await this.router.navigate(['/locateur-home']);
      }

    } catch (error: any) {
      console.error('Erreur d\'inscription :', error);
      
      // Handle Firebase errors with user-friendly messages
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = "Cet email est déjà utilisé";
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = "Email invalide";
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = "Mot de passe trop faible";
      } else {
        this.errorMessage = error.message || "Erreur lors de l'inscription";
      }
    }
  }
}
