import { Routes } from '@angular/router';

/** RNF21 - Rotas por funcionalidade, carregadas sob demanda (lazy loading). */
export const routes: Routes = [
  { path: '', title: 'Início | GarboShop', loadComponent: () => import('./features/home/home').then((m) => m.Home) },
  { path: 'catalogo', loadChildren: () => import('./features/catalogo/catalogo.routes').then((m) => m.CATALOGO_ROUTES) },
  { path: 'carrinho', loadChildren: () => import('./features/carrinho/carrinho.routes').then((m) => m.CARRINHO_ROUTES) },
  { path: 'produtos', loadChildren: () => import('./features/produtos/produtos.routes').then((m) => m.PRODUTOS_ROUTES) },
  { path: 'categorias', loadChildren: () => import('./features/categorias/categorias.routes').then((m) => m.CATEGORIAS_ROUTES) },
  { path: 'clientes', loadChildren: () => import('./features/clientes/clientes.routes').then((m) => m.CLIENTES_ROUTES) },
  { path: 'pedidos', loadChildren: () => import('./features/pedidos/pedidos.routes').then((m) => m.PEDIDOS_ROUTES) },
  { path: 'cupons', loadChildren: () => import('./features/cupons/cupons.routes').then((m) => m.CUPONS_ROUTES) },
  { path: 'relatorios', loadChildren: () => import('./features/relatorios/relatorios.routes').then((m) => m.RELATORIOS_ROUTES) },
  { path: '**', redirectTo: '' },
];
