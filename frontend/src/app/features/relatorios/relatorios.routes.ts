import { Routes } from '@angular/router';
import { MaisVendidos } from './components/mais-vendidos/mais-vendidos';

export const RELATORIOS_ROUTES: Routes = [
  { path: 'mais-vendidos', component: MaisVendidos, title: 'Mais vendidos | Loja' },
  { path: '', redirectTo: 'mais-vendidos', pathMatch: 'full' },
];
