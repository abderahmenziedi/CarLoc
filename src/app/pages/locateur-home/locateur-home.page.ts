import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ToastController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { CarService, Car } from '../../services/car.service';

@Component({
  standalone: true,
  selector: 'app-locateur-home',
  templateUrl: './locateur-home.page.html',
  styleUrls: ['./locateur-home.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LocateurHomePage implements OnInit {
  cars: Car[] = [];
  loading = false;
  showForm = false;
  isEditMode = false;
  
  carForm: Partial<Car> = {
    marque: '',
    modele: '',
    annee: new Date().getFullYear(),
    couleur: '',
    immatriculation: '',
    prixParJour: 0,
    typeCarburant: 'Essence',
    nombrePlaces: 5,
    transmission: 'Manuelle',
    disponible: true
  };

  currentEditId: string | null = null;

  constructor(
    private authService: AuthService,
    private carService: CarService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadCars();
  }

  async loadCars() {
    try {
      this.loading = true;
      this.cars = await this.carService.getOwnerCars();
    } catch (error: any) {
      this.showToast('Erreur lors du chargement des voitures', 'danger');
    } finally {
      this.loading = false;
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.carForm = {
      marque: '',
      modele: '',
      annee: new Date().getFullYear(),
      couleur: '',
      immatriculation: '',
      prixParJour: 0,
      typeCarburant: 'Essence',
      nombrePlaces: 5,
      transmission: 'Manuelle',
      disponible: true
    };
    this.isEditMode = false;
    this.currentEditId = null;
  }

  async saveCar() {
    if (!this.validateForm()) {
      this.showToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    try {
      this.loading = true;
      
      if (this.isEditMode && this.currentEditId) {
        await this.carService.updateCar(this.currentEditId, this.carForm);
        this.showToast('Voiture modifiée avec succès', 'success');
      } else {
        await this.carService.addCar(this.carForm as Omit<Car, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>);
        this.showToast('Voiture ajoutée avec succès', 'success');
      }
      
      await this.loadCars();
      this.toggleForm();
    } catch (error: any) {
      this.showToast('Erreur: ' + error.message, 'danger');
    } finally {
      this.loading = false;
    }
  }

  editCar(car: Car) {
    this.isEditMode = true;
    this.currentEditId = car.id || null;
    this.carForm = { ...car };
    this.showForm = true;
  }

  async deleteCar(car: Car) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Voulez-vous vraiment supprimer ${car.marque} ${car.modele} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              this.loading = true;
              await this.carService.deleteCar(car.id!);
              this.showToast('Voiture supprimée avec succès', 'success');
              await this.loadCars();
            } catch (error: any) {
              this.showToast('Erreur lors de la suppression', 'danger');
            } finally {
              this.loading = false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async toggleDisponibilite(car: Car) {
    try {
      await this.carService.updateCar(car.id!, { disponible: !car.disponible });
      await this.loadCars();
      this.showToast(
        car.disponible ? 'Voiture marquée comme indisponible' : 'Voiture marquée comme disponible',
        'success'
      );
    } catch (error: any) {
      this.showToast('Erreur lors de la mise à jour', 'danger');
    }
  }

  validateForm(): boolean {
    return !!(
      this.carForm.marque &&
      this.carForm.modele &&
      this.carForm.annee &&
      this.carForm.couleur &&
      this.carForm.immatriculation &&
      this.carForm.prixParJour &&
      this.carForm.prixParJour > 0
    );
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    toast.present();
  }

  logout() { 
    this.authService.logout(); 
  }
}
