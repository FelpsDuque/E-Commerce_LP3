import { Routes } from '@angular/router';
import { ClienteLista } from './components/cliente-lista/cliente-lista';
import { ClienteForm } from './components/cliente-form/cliente-form';

export const CLIENTES_ROUTES: Routes = [
  { path: '', component: ClienteLista, title: 'Clientes | Loja' },
  { path: 'novo', component: ClienteForm, title: 'Novo cliente | Loja' },
  { path: 'edit/:id', component: ClienteForm, title: 'Editar cliente | Loja' },
];
