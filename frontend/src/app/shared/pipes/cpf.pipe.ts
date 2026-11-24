import { Pipe, PipeTransform } from '@angular/core';

/** 11122233344 -> 111.222.333-44 */
@Pipe({ name: 'cpf' })
export class CpfPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor || valor.length !== 11) return valor ?? '';
    return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
