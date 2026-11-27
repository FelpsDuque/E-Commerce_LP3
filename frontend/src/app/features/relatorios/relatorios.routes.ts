import { Routes } from '@angular/router';
import { MaisVendidos } from './components/mais-vendidos/mais-vendidos';

export const RELATORIOS_ROUTES: Routes = [
  { path: 'mais-vendidos', component: MaisVendidos, title: 'Mais vendidos | GarboShop' },
  { path: '', redirectTo: 'mais-vendidos', pathMatch: 'full' },
];
