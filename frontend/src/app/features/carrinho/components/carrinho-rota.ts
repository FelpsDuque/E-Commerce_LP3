import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CarrinhoPainelService } from '../services/carrinho-painel.service';

/** A rota /carrinho continua existindo: abre o painel lateral e mostra o catálogo por baixo. */
@Component({ selector: 'app-carrinho-rota', template: '' })
export class CarrinhoRota implements OnInit {
  private readonly painel = inject(CarrinhoPainelService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.painel.abrir();
    this.router.navigate(['/catalogo'], { replaceUrl: true });
  }
}
