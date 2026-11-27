import { Routes } from '@angular/router';
import { ProdutoLista } from './components/produto-lista/produto-lista';
import { ProdutoForm } from './components/produto-form/produto-form';

export const PRODUTOS_ROUTES: Routes = [
  { path: '', component: ProdutoLista, title: 'Produtos | GarboShop' },
  { path: 'novo', component: ProdutoForm, title: 'Novo produto | GarboShop' },
  { path: 'edit/:id', component: ProdutoForm, title: 'Editar produto | GarboShop' },
];
