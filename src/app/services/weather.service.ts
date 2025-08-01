import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { WeatherData } from '../interfaces/weather-data';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private http = inject(HttpClient);
  private currentLocation = "";

  /**
   * Gets weather data for the specified location by calling the server-side proxy
   * This approach keeps the API key secure on the server
   */
  getWeatherByLocation(location: string): Observable<WeatherData> {
    if (!location.trim()) {
      return throwError(() => new Error('Please enter a location'));
    }

    // Store the current location so other components can access it
    this.currentLocation = location;

    // Call our server-side endpoint instead of the OpenWeather API directly
    const url = `/api/weather?location=${encodeURIComponent(location)}`;

    return this.http.get<WeatherData>(url).pipe(
      catchError((error) => {
        if (error.status === 404) {
          return throwError(
            () => new Error('Location not found. Please try again.')
          );
        } else {
          console.error('API Error:', error);
          return throwError(
            () =>
              new Error('Error fetching weather data. Please try again later.')
          );
        }
      })
    );
  }

  /**
   * Returns the URL for a weather icon
   */
  getWeatherIconUrl(icon: string): string {
    return `http://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  /**
   * Returns the relative API URL for weather data
   */
  getWeatherApiUrl(): string {
    return `/api/weather?location=${encodeURIComponent(this.currentLocation)}`;
  }

  /**
   * Clears the stored location
   */
  clearCurrentLocation(): void {
    this.currentLocation = "";
  }

  /**
   * Formats a timestamp with timezone offset into a readable time
   */
  formatTimestamp(timestamp: number, timezone: number): string {
    // timestamp is in seconds UTC, timezone is offset in seconds
    // build a UTC‐based date at the shifted moment, then format as UTC
    const utcMs = timestamp * 1000;
    const offsetMs = timezone * 1000;
    const date = new Date(utcMs + offsetMs);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });
  }
}
