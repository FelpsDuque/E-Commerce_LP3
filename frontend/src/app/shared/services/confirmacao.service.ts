import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from '../components/confirm-dialog';

/** Atalho para abrir o ConfirmDialog e receber true/false. */
@Injectable({ providedIn: 'root' })
export class ConfirmacaoService {
  private readonly dialog = inject(MatDialog);

  confirmar(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialog, { data, width: '420px', maxWidth: '95vw' })
      .afterClosed()
      .pipe(map((r) => r === true));
  }
}
