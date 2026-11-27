import { Injectable, signal } from '@angular/core';

/** Estado de UI: painel lateral do carrinho (mat-sidenav no app.html) aberto ou fechado. */
@Injectable({ providedIn: 'root' })
export class CarrinhoPainelService {
  private readonly _aberto = signal(false);
  readonly aberto = this._aberto.asReadonly();

  abrir(): void {
    this._aberto.set(true);
  }

  fechar(): void {
    this._aberto.set(false);
  }
}
