import { Routes } from '@angular/router';
import { CupomLista } from './components/cupom-lista/cupom-lista';
import { CupomForm } from './components/cupom-form/cupom-form';

export const CUPONS_ROUTES: Routes = [
  { path: '', component: CupomLista, title: 'Cupons | GarboShop' },
  { path: 'novo', component: CupomForm, title: 'Novo cupom | GarboShop' },
  { path: 'edit/:id', component: CupomForm, title: 'Editar cupom | GarboShop' },
];
