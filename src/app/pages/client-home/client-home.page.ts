import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  availability: boolean;
  category: 'suv' | 'sedan' | 'luxury' | 'electric';
  image: string;
  features: string[];
  rating: number;
}

@Component({
  selector: 'app-client-home',
  standalone: true,
  templateUrl: './client-home.page.html',
  styleUrls: ['./client-home.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule],
})
export class ClientHomePage {
  selectedCategory: string = 'all';

  currentUser = {
    name: 'John Doe',
    avatar: 'https://ionicframework.com/docs/demos/api/avatar/avatar.svg',
  };

  cars: Car[] = [
    {
      id: '1',
      make: 'Toyota',
      model: 'RAV4',
      year: 2023,
      pricePerDay: 60,
      availability: true,
      category: 'suv',
      image: 'https://images.unsplash.com/photo-1617814079827-88f24bfb9f8f',
      features: ['Automatic', '5 Seats', 'AC'],
      rating: 4.6,
    },
    {
      id: '2',
      make: 'Honda',
      model: 'Civic',
      year: 2022,
      pricePerDay: 45,
      availability: true,
      category: 'sedan',
      image: 'https://images.unsplash.com/photo-1597764699510-1f4d6c6aa0f1',
      features: ['Manual', '4 Doors', 'Hybrid'],
      rating: 4.4,
    },
    {
      id: '3',
      make: 'BMW',
      model: 'X5',
      year: 2023,
      pricePerDay: 120,
      availability: true,
      category: 'luxury',
      image: 'https://images.unsplash.com/photo-1616788076590-7d9cfcb2b273',
      features: ['Automatic', '4WD', 'Leather Seats'],
      rating: 4.8,
    },
    {
      id: '4',
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      pricePerDay: 95,
      availability: true,
      category: 'electric',
      image: 'https://images.unsplash.com/photo-1610465299990-d46d9c2f19c5',
      features: ['Electric', 'Autopilot', 'Sunroof'],
      rating: 4.9,
    },
    {
      id: '5',
      make: 'Mercedes',
      model: 'C-Class',
      year: 2022,
      pricePerDay: 110,
      availability: false,
      category: 'luxury',
      image: 'https://images.unsplash.com/photo-1617358574072-72d1f5b87d18',
      features: ['Automatic', 'Leather', 'GPS'],
      rating: 4.7,
    },
  ];

  constructor(private toastCtrl: ToastController) {}

  get availableCarsCount(): number {
    return this.cars.filter((c) => c.availability).length;
  }

  get filteredCars(): Car[] {
    if (this.selectedCategory === 'all') return this.cars;
    return this.cars.filter((c) => c.category === this.selectedCategory);
  }

  async bookCar(carId: string) {
    const car = this.cars.find((c) => c.id === carId);
    if (!car) return;

    car.availability = false;

    const toast = await this.toastCtrl.create({
      message: `You booked the ${car.make} ${car.model}!`,
      duration: 2000,
      color: 'success',
    });
    toast.present();
  }
}
