import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { CarrinhoService } from './features/carrinho/services/carrinho.service';
import { CarrinhoPainelService } from './features/carrinho/services/carrinho-painel.service';
import { Carrinho } from './features/carrinho/components/carrinho/carrinho';

interface ItemMenu {
  rota: string;
  rotulo: string;
}

const ROTAS_GESTAO = ['/pedidos', '/produtos', '/categorias', '/clientes', '/cupons', '/relatorios'];

/** Layout principal: cabeçalho único (loja + gestão) e carrinho em painel lateral à direita. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatButtonModule, Carrinho],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  readonly painel = inject(CarrinhoPainelService);
  readonly qtdCarrinho = inject(CarrinhoService).quantidadeTotal;

  /** A segunda linha do cabeçalho (abas de gestão) aparece só nas rotas de gestão. */
  readonly emGestao = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => ROTAS_GESTAO.some((r) => e.urlAfterRedirects.startsWith(r))),
    ),
    { initialValue: false },
  );

  readonly gestao: ItemMenu[] = [
    { rota: '/pedidos', rotulo: 'Pedidos' },
    { rota: '/produtos', rotulo: 'Produtos' },
    { rota: '/categorias', rotulo: 'Categorias' },
    { rota: '/clientes', rotulo: 'Clientes' },
    { rota: '/cupons', rotulo: 'Cupons' },
    { rota: '/relatorios/mais-vendidos', rotulo: 'Mais vendidos' },
  ];
}
