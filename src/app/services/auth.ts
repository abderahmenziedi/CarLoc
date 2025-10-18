import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

interface UserData {
  email: string;
  role: 'client' | 'locateur';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;

      const docRef = doc(this.firestore, `users/${uid}`);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Le compte n’existe pas');
      }

      const userData = docSnap.data() as UserData;

      if (userData.role === 'client') {
        await this.router.navigate(['/client-home']);
      } else if (userData.role === 'locateur') {
        await this.router.navigate(['/locateur-home']);
      } else {
        throw new Error('Rôle inconnu');
      }

      return userData;

    } catch (error: any) {
      console.error('Erreur de connexion :', error.message);
      throw new Error(error.message);
    }
  }

  logout() {
    return this.auth.signOut().then(() => this.router.navigate(['/login']));
  }
}
