import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CategoriaService } from '../categorias/services/categoria.service';
import { Categoria } from '../categorias/models/categoria';
import { CupomService } from '../cupons/services/cupom.service';
import { Cupom } from '../cupons/models/cupom';
import { RelatorioService } from '../relatorios/services/relatorio.service';
import { ProdutoMaisVendido } from '../relatorios/models/produto-mais-vendido';

function paraIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Página inicial: título, cupom em destaque, categorias e mais vendidos. */
@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe, MatButtonModule],
  template: `
    <section class="pagina">
      <div class="hero">
        <span class="gs-sobretitulo">Loja · coleção atual</span>
        <h1 class="titulo">Tudo o que você precisa,<br />sem excesso.</h1>
        <p class="texto-secundario lead">Produtos selecionados, preço justo e entrega acompanhada do pedido à sua porta.</p>
        <div class="acoes">
          <a mat-flat-button class="gs-primario" routerLink="/catalogo">Ver catálogo</a>
          <a mat-stroked-button class="gs-secundario" routerLink="/pedidos">Área de gestão</a>
        </div>
      </div>

      @if (cupom(); as c) {
        <aside class="cupom" aria-label="Cupom em destaque">
          <div>
            <span class="gs-sobretitulo">Cupom da semana</span>
            <p class="cupom-valor">{{ c.percentual }}% off</p>
            <p class="texto-secundario">Válido até {{ c.validade + 'T00:00:00' | date: 'dd/MM/yyyy' }}. Aplique no carrinho.</p>
          </div>
          <span class="codigo">{{ c.codigo }}</span>
        </aside>
      }

      @if (categorias().length) {
        <section class="secao" aria-labelledby="titulo-categorias">
          <div class="secao-topo">
            <h2 id="titulo-categorias" class="gs-h2">Categorias</h2>
            <a routerLink="/catalogo" class="link">Ver tudo →</a>
          </div>
          <div class="categorias">
            @for (c of categorias(); track c.id) {
              <a class="categoria" routerLink="/catalogo" [queryParams]="{ categoriaId: c.id }">
                <span class="cat-nome">{{ c.nome }}</span>
                <span class="texto-secundario">{{ c.quantidadeProdutos }} {{ c.quantidadeProdutos === 1 ? 'produto' : 'produtos' }}</span>
              </a>
            }
          </div>
        </section>
      }

      @if (maisVendidos().length) {
        <section class="secao" aria-labelledby="titulo-mais-vendidos">
          <div class="secao-topo">
            <h2 id="titulo-mais-vendidos" class="gs-h2">Mais vendidos</h2>
            <span class="texto-secundario">Últimos 30 dias</span>
          </div>
          <ol class="ranking">
            @for (p of maisVendidos(); track p.produtoId; let i = $index) {
              <li>
                <a [routerLink]="['/catalogo', p.produtoId]">
                  <span class="posicao">{{ i + 1 }}</span>
                  <span class="dados">
                    <span class="gs-sobretitulo">{{ p.categoriaNome }}</span>
                    <span class="nome">{{ p.produtoNome }}</span>
                  </span>
                  <span class="texto-secundario">{{ p.quantidadeVendida }} vendidos</span>
                </a>
              </li>
            }
          </ol>
        </section>
      }
    </section>
  `,
  styles: `
    .hero { padding: 24px 0 56px; border-bottom: 1px solid var(--gs-tinta); }
    .titulo {
      font-family: var(--gs-titulo); font-weight: 800; letter-spacing: -2px; line-height: .95;
      font-size: 48px; margin: 16px 0 20px;
    }
    @media (min-width: 768px) { .titulo { font-size: 80px; } }
    .lead { font-size: 18px; max-width: 560px; margin: 0 0 32px; }
    .acoes { display: flex; flex-wrap: wrap; gap: 12px; }

    .cupom {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;
      margin: 40px 0 0; padding: 28px; background: var(--gs-superficie); border-radius: var(--gs-raio);
    }
    .cupom p { margin: 4px 0 0; }
    .cupom-valor { font-family: var(--gs-titulo); font-weight: 800; font-size: 36px; letter-spacing: -1px; }
    .codigo {
      font: 600 18px var(--gs-texto); letter-spacing: 2px; padding: 12px 20px;
      border: 1px dashed var(--gs-tinta); border-radius: var(--gs-raio); background: var(--gs-fundo);
    }

    .secao { margin-top: 56px; }
    .secao-topo { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
    .link { font-size: 14px; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }

    .categorias { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); }
    .categoria {
      display: flex; flex-direction: column; justify-content: flex-end; gap: 4px; min-height: 160px; padding: 20px;
      background: var(--gs-superficie); border-radius: var(--gs-raio); text-decoration: none;
      border: 1px solid transparent; transition: border-color .15s;
    }
    .categoria:hover, .categoria:focus-visible { border-color: var(--gs-tinta); }
    .cat-nome { font-family: var(--gs-titulo); font-weight: 700; font-size: 22px; }

    .ranking { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--gs-tinta); }
    .ranking li { border-bottom: 1px solid var(--gs-linha); }
    .ranking a { display: flex; align-items: center; gap: 20px; padding: 18px 0; text-decoration: none; }
    .ranking a:hover .nome { text-decoration: underline; }
    .posicao { font-family: var(--gs-titulo); font-weight: 800; font-size: 28px; width: 40px; }
    .dados { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .nome { font-weight: 600; font-size: 16px; }
  `,
})
export class Home implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  private readonly cupomService = inject(CupomService);
  private readonly relatorioService = inject(RelatorioService);

  readonly categorias = signal<Categoria[]>([]);
  readonly cupom = signal<Cupom | null>(null);
  readonly maisVendidos = signal<ProdutoMaisVendido[]>([]);

  ngOnInit(): void {
    // A página inicial é vitrine: se algo falhar, a seção simplesmente não aparece.
    this.categoriaService.listar().subscribe({ next: (c) => this.categorias.set(c.slice(0, 8)), error: () => {} });

    this.cupomService.listar().subscribe({
      next: (lista) => {
        const validos = lista.filter((c) => c.valido).sort((a, b) => b.percentual - a.percentual);
        this.cupom.set(validos[0] ?? null);
      },
      error: () => {},
    });

    const fim = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 30);
    this.relatorioService.maisVendidos(paraIso(inicio), paraIso(fim), 4).subscribe({
      next: (l) => this.maisVendidos.set(l),
      error: () => {},
    });
  }
}
