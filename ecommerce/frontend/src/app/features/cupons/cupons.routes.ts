import { Routes } from '@angular/router';
import { CupomLista } from './components/cupom-lista/cupom-lista';
import { CupomForm } from './components/cupom-form/cupom-form';

export const CUPONS_ROUTES: Routes = [
  { path: '', component: CupomLista, title: 'Cupons | Loja' },
  { path: 'novo', component: CupomForm, title: 'Novo cupom | Loja' },
  { path: 'edit/:id', component: CupomForm, title: 'Editar cupom | Loja' },
];
