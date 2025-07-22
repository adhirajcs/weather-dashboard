import { Component, HostListener, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out',style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in',style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
  ],
})
export class NavbarComponent {
  showTooltip = false;
  private tooltipTimeout: any
  private weatherService = inject(WeatherService);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showTooltip) {
      const tooltipElement = document.querySelector('.fixed.top-6');
      if (tooltipElement && !tooltipElement.contains(event.target as Node)) {
        this.showTooltip = false;
        clearTimeout(this.tooltipTimeout);
      }
    }
  }

  copyUrlToClipboard(): void {
    // Get the relative URL from WeatherService then prepend window.location.origin
    const relativeUrl = this.weatherService.getWeatherApiUrl();
    const apiUrl = `${window.location.origin}${relativeUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(apiUrl)
        .then(() => {
          console.log('URL copied to clipboard successfully!', apiUrl);
          this.displayTooltip();
        })
        .catch((err) => console.error('Failed to copy URL: ', err));
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = apiUrl;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        console.log('URL copied to clipboard successfully!', apiUrl);
        this.displayTooltip();
      } catch (err) {
        console.error('Failed to copy URL: ', err);
      }
      document.body.removeChild(textarea);
    }
  }

  displayTooltip(): void {
    this.showTooltip = true;
    this.tooltipTimeout = setTimeout(() => {
      this.showTooltip = false;
    }, 2000);
  }
}
