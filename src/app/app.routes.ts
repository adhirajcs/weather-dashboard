import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
    {path: '', title: "Weather Dashboard", component: DashboardComponent},
    {path: 'about', title: "Weather Dashboard - About", component: AboutComponent},
];
