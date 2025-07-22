import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { WeatherService } from '../services/weather.service';
import { WeatherData } from '../interfaces/weather-data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {
  searchLocation = '';
  weatherData: WeatherData | null = null;
  loading = false;
  error = '';

  private weatherService = inject(WeatherService);
  private errorTimeout: any;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.error) {
      const tooltipElement = document.querySelector('.fixed.top-6');
      if (tooltipElement && !tooltipElement.contains(event.target as Node)) {
        this.error = '';
        clearTimeout(this.errorTimeout);
      }
    }
  }

  searchWeather() {
    if (!this.searchLocation.trim()) {
      this.weatherData = null;
      this.weatherService.clearCurrentLocation()
      this.showError('Please enter a location');
      return;
    }

    this.weatherData = null

    this.loading = true;
    this.error = '';
    clearTimeout(this.errorTimeout);

    this.weatherService.getWeatherByLocation(this.searchLocation)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.weatherData = data;
        },
        error: (err) => {
          this.weatherData = null
          this.showError(err.message);
        }
      });
  }

  showError(message: string) {
    this.error = message;
    clearTimeout(this.errorTimeout);
    this.errorTimeout = setTimeout(() => {
      this.error = '';
    }, 2000);
  }

  getWeatherIconUrl(icon: string): string {
    return this.weatherService.getWeatherIconUrl(icon);
  }

  formatTimestamp(timestamp: number, timezone: number): string {
    return this.weatherService.formatTimestamp(timestamp, timezone);
  }
}
