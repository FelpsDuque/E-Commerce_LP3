import { Pipe, PipeTransform } from '@angular/core';
import { StatusPedido } from '../../features/pedidos/models/pedido';

const ROTULOS: Record<StatusPedido, string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

/** Converte o enum do backend (PENDENTE) em texto amigável (Pendente). */
@Pipe({ name: 'statusPedido' })
export class StatusPedidoPipe implements PipeTransform {
  transform(status: StatusPedido | null | undefined): string {
    return status ? ROTULOS[status] : '';
  }
}
