import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';
import { ConfirmacaoService } from '../../../../shared/services/confirmacao.service';
import { EstadoVazio } from '../../../../shared/components/estado-vazio';
import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone.pipe';

@Component({
  selector: 'app-cliente-lista',
  imports: [
    ReactiveFormsModule, RouterLink, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule, EstadoVazio, CpfPipe, TelefonePipe,
  ],
  templateUrl: './cliente-lista.html',
})
export class ClienteLista implements OnInit {
  private readonly service = inject(ClienteService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly confirmacao = inject(ConfirmacaoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly clientes = signal<Cliente[]>([]);
  readonly total = signal(0);
  readonly carregando = signal(false);
  readonly colunas = ['nome', 'email', 'cpf', 'telefone', 'acoes'];
  readonly busca = new FormControl('', { nonNullable: true });
  pagina = 0;
  tamanho = 10;

  ngOnInit(): void {
    this.busca.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pagina = 0;
        this.carregar();
      });
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.service
      .listar(this.busca.value, this.pagina, this.tamanho)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (p) => {
          this.clientes.set(p.conteudo);
          this.total.set(p.totalElementos);
        },
        error: (e) => this.notificacao.erro(e, 'Erro ao carregar clientes.'),
      });
  }

  mudarPagina(e: PageEvent): void {
    this.pagina = e.pageIndex;
    this.tamanho = e.pageSize;
    this.carregar();
  }

  excluir(c: Cliente): void {
    this.confirmacao
      .confirmar({ titulo: 'Excluir cliente', mensagem: `Deseja excluir "${c.nome}"?`, textoConfirmar: 'Excluir', perigo: true })
      .subscribe((ok) => {
        if (!ok) return;
        this.service.excluir(c.id).subscribe({
          next: () => {
            this.notificacao.sucesso('Cliente excluído.');
            this.carregar();
          },
          error: (e) => this.notificacao.erro(e),
        });
      });
  }
}
