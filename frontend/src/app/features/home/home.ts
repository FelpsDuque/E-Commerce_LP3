import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/** Página inicial com acesso às principais funcionalidades. */
@Component({
  selector: 'app-home',
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <section class="pagina">
      <div class="hero cartao">
        <h1>Bem-vindo à Loja Virtual</h1>
        <p class="texto-secundario">
          Sistema de e-commerce em arquitetura MVC — Spring Boot (Model + Controller) e Angular (View).
        </p>
        <a mat-flat-button routerLink="/catalogo">
          <mat-icon aria-hidden="true">storefront</mat-icon> Ver catálogo
        </a>
      </div>

      <div class="atalhos">
        @for (a of atalhos; track a.rota) {
          <a class="atalho" [routerLink]="a.rota">
            <mat-card appearance="outlined">
              <mat-card-content>
                <mat-icon aria-hidden="true">{{ a.icone }}</mat-icon>
                <h2>{{ a.titulo }}</h2>
                <p class="texto-secundario">{{ a.descricao }}</p>
              </mat-card-content>
            </mat-card>
          </a>
        }
      </div>
    </section>
  `,
  styles: `
    .hero { margin-bottom: 24px; padding: 24px; }
    .hero h1 { margin-top: 0; font: var(--mat-sys-headline-medium); }
    .atalhos { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
    .atalho { text-decoration: none; color: inherit; }
    .atalho mat-card { height: 100%; transition: box-shadow .2s; }
    .atalho:hover mat-card, .atalho:focus-visible mat-card { box-shadow: var(--mat-sys-level2); }
    .atalho mat-icon { color: var(--mat-sys-primary); font-size: 32px; width: 32px; height: 32px; }
    .atalho h2 { font: var(--mat-sys-title-medium); margin: 8px 0 4px; }
  `,
})
export class Home {
  readonly atalhos = [
    { rota: '/catalogo', icone: 'storefront', titulo: 'Catálogo', descricao: 'Buscar produtos e adicionar ao carrinho.' },
    { rota: '/carrinho', icone: 'shopping_cart', titulo: 'Carrinho', descricao: 'Revisar itens, aplicar cupom e finalizar.' },
    { rota: '/pedidos', icone: 'receipt_long', titulo: 'Pedidos', descricao: 'Consultar pedidos e alterar status.' },
    { rota: '/produtos', icone: 'inventory_2', titulo: 'Produtos', descricao: 'Cadastrar, editar e inativar produtos.' },
    { rota: '/categorias', icone: 'category', titulo: 'Categorias', descricao: 'Organizar o catálogo.' },
    { rota: '/clientes', icone: 'people', titulo: 'Clientes', descricao: 'Cadastro de clientes.' },
    { rota: '/cupons', icone: 'local_offer', titulo: 'Cupons', descricao: 'Descontos percentuais com validade.' },
    { rota: '/relatorios/mais-vendidos', icone: 'bar_chart', titulo: 'Mais vendidos', descricao: 'Relatório por período.' },
  ];
}
