import { Injectable, computed, effect, signal } from '@angular/core';
import { Produto } from '../../produtos/models/produto';
import { ItemCarrinho } from '../models/item-carrinho';

const CHAVE = 'ecommerce.carrinho';

/**
 * RF04 - Estado do carrinho no frontend (signals + localStorage).
 * O carrinho é só uma "intenção de compra": preço e estoque são conferidos
 * de novo no backend na finalização (RN01 / RN02).
 */
@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private readonly _itens = signal<ItemCarrinho[]>(this.carregar());

  readonly itens = this._itens.asReadonly();
  readonly quantidadeTotal = computed(() => this._itens().reduce((s, i) => s + i.quantidade, 0));
  readonly total = computed(() => this._itens().reduce((s, i) => s + this.subtotal(i), 0));

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(CHAVE, JSON.stringify(this._itens()));
      } catch {
        /* armazenamento indisponível: carrinho fica só em memória */
      }
    });
  }

  subtotal(item: ItemCarrinho): number {
    return Math.round(item.precoUnitario * item.quantidade * 100) / 100;
  }

  /** Retorna false se a quantidade ultrapassar o estoque. */
  adicionar(produto: Produto, quantidade = 1): boolean {
    const atual = this._itens().find((i) => i.produtoId === produto.id);
    const nova = (atual?.quantidade ?? 0) + quantidade;
    if (nova > produto.estoque) return false;

    if (atual) {
      this.alterarQuantidade(produto.id, nova);
    } else {
      this._itens.update((lista) => [
        ...lista,
        {
          produtoId: produto.id,
          nome: produto.nome,
          imagemUrl: produto.imagemUrl,
          precoUnitario: produto.preco,
          quantidade,
          estoqueDisponivel: produto.estoque,
        },
      ]);
    }
    return true;
  }

  alterarQuantidade(produtoId: number, quantidade: number): void {
    if (quantidade < 1) return this.remover(produtoId);
    this._itens.update((lista) =>
      lista.map((i) => (i.produtoId === produtoId ? { ...i, quantidade } : i)),
    );
  }

  remover(produtoId: number): void {
    this._itens.update((lista) => lista.filter((i) => i.produtoId !== produtoId));
  }

  limpar(): void {
    this._itens.set([]);
  }

  private carregar(): ItemCarrinho[] {
    try {
      return JSON.parse(localStorage.getItem(CHAVE) ?? '[]') as ItemCarrinho[];
    } catch {
      return [];
    }
  }
}
