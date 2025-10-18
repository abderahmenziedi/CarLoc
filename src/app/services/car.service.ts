import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp, Timestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export interface Car {
  id?: string;
  marque: string;
  modele: string;
  annee: number;
  couleur: string;
  immatriculation: string;
  prixParJour: number;
  typeCarburant: string;
  nombrePlaces: number;
  transmission: string;
  disponible: boolean;
  ownerId: string;
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({ providedIn: 'root' })
export class CarService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private carsCollection = collection(this.firestore, 'cars');

  async addCar(car: Omit<Car, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Vous devez être connecté");
    
    // Clean the data - remove undefined fields and ensure proper types
    const carData = {
      marque: car.marque || '',
      modele: car.modele || '',
      annee: Number(car.annee) || new Date().getFullYear(),
      couleur: car.couleur || '',
      immatriculation: car.immatriculation || '',
      prixParJour: Number(car.prixParJour) || 0,
      typeCarburant: car.typeCarburant || 'Essence',
      nombrePlaces: Number(car.nombrePlaces) || 5,
      transmission: car.transmission || 'Manuelle',
      disponible: car.disponible !== undefined ? car.disponible : true,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(this.carsCollection, carData);
    return docRef.id;
  }

  async getOwnerCars(): Promise<Car[]> {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Vous devez être connecté");
    const q = query(this.carsCollection, where('ownerId', '==', user.uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Car));
  }

  async updateCar(carId: string, updates: Partial<Car>) {
    const carRef = doc(this.firestore, `cars/${carId}`);
    
    // Clean the updates object - remove undefined and convert types
    const cleanUpdates: any = { updatedAt: serverTimestamp() };
    
    if (updates.marque !== undefined) cleanUpdates.marque = updates.marque;
    if (updates.modele !== undefined) cleanUpdates.modele = updates.modele;
    if (updates.annee !== undefined) cleanUpdates.annee = Number(updates.annee);
    if (updates.couleur !== undefined) cleanUpdates.couleur = updates.couleur;
    if (updates.immatriculation !== undefined) cleanUpdates.immatriculation = updates.immatriculation;
    if (updates.prixParJour !== undefined) cleanUpdates.prixParJour = Number(updates.prixParJour);
    if (updates.typeCarburant !== undefined) cleanUpdates.typeCarburant = updates.typeCarburant;
    if (updates.nombrePlaces !== undefined) cleanUpdates.nombrePlaces = Number(updates.nombrePlaces);
    if (updates.transmission !== undefined) cleanUpdates.transmission = updates.transmission;
    if (updates.disponible !== undefined) cleanUpdates.disponible = updates.disponible;
    
    await updateDoc(carRef, cleanUpdates);
  }

  async deleteCar(carId: string) {
    const carRef = doc(this.firestore, `cars/${carId}`);
    await deleteDoc(carRef);
  }
}
