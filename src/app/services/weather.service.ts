import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { WeatherData } from '../interfaces/weather-data';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private readonly apiKey = environment.WEATHER_API_KEY;
  private readonly baseUrl = environment.WEATHER_API_BASE_URL;

  getWeatherByLocation(location: string): Observable<WeatherData> {
    if (!location.trim()) {
      return throwError(() => new Error('Please enter a location'));
    }

    const url = `${this.baseUrl}?q=${encodeURIComponent(location)}&units=metric&appid=${this.apiKey}`;

    return this.http.get<WeatherData>(url).pipe(
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => new Error('Location not found. Please try again.'));
        } else {
          console.error('API Error:', error);
          return throwError(() => new Error('Error fetching weather data. Please try again later.'));
        }
      })
    );
  }

  getWeatherIconUrl(icon: string): string {
    return `http://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  formatTimestamp(timestamp: number, timezone: number): string {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
