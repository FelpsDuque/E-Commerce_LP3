import { Routes } from '@angular/router';
import { CategoriaLista } from './components/categoria-lista/categoria-lista';
import { CategoriaForm } from './components/categoria-form/categoria-form';

export const CATEGORIAS_ROUTES: Routes = [
  { path: '', component: CategoriaLista, title: 'Categorias | GarboShop' },
  { path: 'novo', component: CategoriaForm, title: 'Nova categoria | GarboShop' },
  { path: 'edit/:id', component: CategoriaForm, title: 'Editar categoria | GarboShop' },
];
