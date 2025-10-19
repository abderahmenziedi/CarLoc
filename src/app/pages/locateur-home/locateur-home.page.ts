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
  filteredCars: Car[] = [];
  loading = false;
  showForm = false;
  isEditMode = false;
  selectedFilter: 'all' | 'available' | 'unavailable' = 'all';
  
  // Statistics properties
  totalCars = 0;
  availableCars = 0;
  unavailableCars = 0;
  
  // Photo handling
  selectedPhoto: File | null = null;
  photoPreview: string | null = null;
  
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
    disponible: true,
    photoUrl: ''
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
      this.updateStatistics();
      this.applyFilter();
    } catch (error: any) {
      this.showToast('Erreur lors du chargement des voitures', 'danger');
    } finally {
      this.loading = false;
    }
  }

  updateStatistics() {
    this.totalCars = this.cars.length;
    this.availableCars = this.cars.filter(car => car.disponible).length;
    this.unavailableCars = this.cars.filter(car => !car.disponible).length;
  }

  applyFilter() {
    switch (this.selectedFilter) {
      case 'available':
        this.filteredCars = this.cars.filter(car => car.disponible);
        break;
      case 'unavailable':
        this.filteredCars = this.cars.filter(car => !car.disponible);
        break;
      default:
        this.filteredCars = [...this.cars];
        break;
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
      disponible: true,
      photoUrl: ''
    };
    this.isEditMode = false;
    this.currentEditId = null;
    this.selectedPhoto = null;
    this.photoPreview = null;
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedPhoto = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
        // Update the form with the preview URL
        this.carForm.photoUrl = this.photoPreview;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveCar() {
    if (!this.validateForm()) {
      this.showToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    try {
      this.loading = true;
      
      // For now, we'll save the photo as a base64 string
      // In a production app, you would upload to a storage service and save the URL
      
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
    this.photoPreview = car.photoUrl || null;
    this.selectedPhoto = null;
    this.showForm = true;
  }

  async deleteCar(car: Car) {
    // Create a toast with action buttons
    const toast = await this.toastController.create({
      message: `Voulez-vous vraiment supprimer ${car.marque} ${car.modele} ?`,
      duration: 0, // Don't auto-dismiss
      color: 'warning',
      position: 'top',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            // User cancelled the deletion
          }
        },
        {
          text: 'Oui',
          role: 'confirm',
          handler: async () => {
            // User confirmed deletion
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

    await toast.present();
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