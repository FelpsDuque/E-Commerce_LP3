import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Mensagem exibida quando uma listagem não tem registros. */
@Component({
  selector: 'app-estado-vazio',
  imports: [MatIconModule],
  template: `
    <div class="estado-vazio" role="status">
      <mat-icon aria-hidden="true">{{ icone() }}</mat-icon>
      <p>{{ mensagem() }}</p>
      <ng-content />
    </div>
  `,
})
export class EstadoVazio {
  readonly mensagem = input('Nenhum registro encontrado.');
  readonly icone = input('inbox');
}
