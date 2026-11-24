import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { CarrinhoService } from './features/carrinho/services/carrinho.service';

interface ItemMenu {
  rota: string;
  rotulo: string;
  icone: string;
}

/** Layout principal: barra superior + menu lateral persistente (desktop) ou recolhível (celular). */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatBadgeModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly carrinho = inject(CarrinhoService);
  readonly qtdCarrinho = this.carrinho.quantidadeTotal;

  readonly celular = toSignal(
    inject(BreakpointObserver).observe('(max-width: 959px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );
  readonly modoMenu = computed(() => (this.celular() ? 'over' : 'side'));

  readonly loja: ItemMenu[] = [
    { rota: '/', rotulo: 'Início', icone: 'home' },
    { rota: '/catalogo', rotulo: 'Catálogo', icone: 'storefront' },
    { rota: '/carrinho', rotulo: 'Carrinho', icone: 'shopping_cart' },
  ];

  readonly gestao: ItemMenu[] = [
    { rota: '/produtos', rotulo: 'Produtos', icone: 'inventory_2' },
    { rota: '/categorias', rotulo: 'Categorias', icone: 'category' },
    { rota: '/clientes', rotulo: 'Clientes', icone: 'people' },
    { rota: '/pedidos', rotulo: 'Pedidos', icone: 'receipt_long' },
    { rota: '/cupons', rotulo: 'Cupons', icone: 'local_offer' },
    { rota: '/relatorios/mais-vendidos', rotulo: 'Mais vendidos', icone: 'bar_chart' },
  ];
}
