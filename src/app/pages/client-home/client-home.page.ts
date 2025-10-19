import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CarService, Car } from '../../services/car.service';

interface Reservation {
  carId: string;
  numberOfDays: number;
}

@Component({
  selector: 'app-client-home',
  standalone: true,
  templateUrl: './client-home.page.html',
  styleUrls: ['./client-home.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule],
})
export class ClientHomePage implements OnInit {
  selectedCategory: string = 'all';
  cars: Car[] = [];
  allCars: Car[] = [];
  isLoading: boolean = false;
  
  currentUser = {
    name: 'Client',
    avatar: 'assets/logo0.jpg',
  };

  // Reservation form data
  reservationData: Reservation = {
    carId: '',
    numberOfDays: 1
  };
  selectedCar: Car | null = null;

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private carService: CarService
  ) {}

  async ngOnInit() {
    await this.loadAllCars();
  }

  async loadAllCars() {
    this.isLoading = true;
    try {
      // Get all cars from Firestore
      const q = await this.carService['firestore'];
      const carsCollection = await import('@angular/fire/firestore').then(m => 
        m.collection(this.carService['firestore'], 'cars')
      );
      const getDocs = await import('@angular/fire/firestore').then(m => m.getDocs);
      const snap = await getDocs(carsCollection);
      
      this.allCars = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as Car));
      
      this.cars = [...this.allCars];
    } catch (error) {
      console.error('Error loading cars:', error);
      const toast = await this.toastCtrl.create({
        message: 'Erreur lors du chargement des voitures',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  get availableCarsCount(): number {
    return this.cars.filter((c) => c.disponible).length;
  }

  get filteredCars(): Car[] {
    if (this.selectedCategory === 'all') return this.cars;
    // You can add category filtering based on car properties if needed
    return this.cars;
  }

  async openReservationForm(car: Car) {
    if (!car.disponible) {
      const toast = await this.toastCtrl.create({
        message: 'Cette voiture n\'est pas disponible',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.selectedCar = car;
    this.reservationData = {
      carId: car.id || '',
      numberOfDays: 1
    };

    const totalPrice = car.prixParJour * this.reservationData.numberOfDays;

    const alert = await this.alertCtrl.create({
      header: 'Réserver ' + car.marque + ' ' + car.modele,
      message: 'Combien de jours souhaitez-vous réserver cette voiture?',
      inputs: [
        {
          name: 'numberOfDays',
          type: 'number',
          placeholder: 'Nombre de jours',
          min: 1,
          value: 1
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Confirmer',
          handler: (data) => {
            if (data.numberOfDays && data.numberOfDays > 0) {
              this.confirmReservation(car, parseInt(data.numberOfDays));
              return true;
            } else {
              this.showToast('Veuillez entrer un nombre de jours valide', 'warning');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmReservation(car: Car, numberOfDays: number) {
    const totalPrice = car.prixParJour * numberOfDays;
    
    const confirmAlert = await this.alertCtrl.create({
      header: 'Confirmer la réservation',
      message: `
        <div style="text-align: left;">
          <p><strong>Voiture:</strong> ${car.marque} ${car.modele}</p>
          <p><strong>Année:</strong> ${car.annee}</p>
          <p><strong>Prix par jour:</strong> ${car.prixParJour} DT</p>
          <p><strong>Nombre de jours:</strong> ${numberOfDays}</p>
          <p style="color: #2563eb; font-size: 18px;"><strong>Total:</strong> ${totalPrice} DT</p>
        </div>
      `,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Confirmer la réservation',
          handler: () => {
            this.processReservation(car, numberOfDays, totalPrice);
          }
        }
      ]
    });

    await confirmAlert.present();
  }

  async processReservation(car: Car, numberOfDays: number, totalPrice: number) {
    try {
      // Here you would typically save the reservation to Firestore
      // For now, we'll just update the car availability
      if (car.id) {
        await this.carService.updateCar(car.id, { disponible: false });
      }

      const toast = await this.toastCtrl.create({
        message: `✅ Réservation confirmée! ${car.marque} ${car.modele} pour ${numberOfDays} jour(s) - Total: ${totalPrice} DT`,
        duration: 3000,
        color: 'success',
        position: 'top'
      });
      await toast.present();

      // Reload cars to reflect the updated availability
      await this.loadAllCars();
    } catch (error) {
      console.error('Error processing reservation:', error);
      await this.showToast('Erreur lors de la réservation', 'danger');
    }
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
