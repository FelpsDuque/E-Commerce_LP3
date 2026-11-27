import { Routes } from '@angular/router';
import { PedidoLista } from './components/pedido-lista/pedido-lista';
import { PedidoDetalhe } from './components/pedido-detalhe/pedido-detalhe';

export const PEDIDOS_ROUTES: Routes = [
  { path: '', component: PedidoLista, title: 'Pedidos | GarboShop' },
  { path: ':id', component: PedidoDetalhe, title: 'Pedido | GarboShop' },
];
