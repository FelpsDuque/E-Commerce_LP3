import { Routes } from '@angular/router';
import { Catalogo } from './components/catalogo/catalogo';
import { ProdutoDetalhe } from './components/produto-detalhe/produto-detalhe';

export const CATALOGO_ROUTES: Routes = [
  { path: '', component: Catalogo, title: 'Catálogo | Loja' },
  { path: ':id', component: ProdutoDetalhe, title: 'Produto | Loja' },
];
