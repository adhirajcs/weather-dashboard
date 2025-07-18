import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

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
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class NavbarComponent {
  showTooltip = false;

  copyUrlToClipboard(): void {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          console.log('URL copied to clipboard successfully!');
          this.displayTooltip();
        })
        .catch(err => console.error('Failed to copy URL: ', err));
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        console.log('URL copied to clipboard successfully!');
        this.displayTooltip();
      } catch (err) {
        console.error('Failed to copy URL: ', err);
      }
      document.body.removeChild(textarea);
    }
  }

  displayTooltip(): void {
    this.showTooltip = true;
    setTimeout(() => {
      this.showTooltip = false;
    }, 3000);
  }
}
