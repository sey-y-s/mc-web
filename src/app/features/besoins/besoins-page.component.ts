import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, tap, of } from 'rxjs';
import { RouterLink } from '@angular/router';
import {
  PageHeaderComponent,
  EmptyStateComponent,
  LoadingComponent,
  StatusBadgeComponent,
} from '../../shared/components';
import { BesoinService } from '../../core/services/besoin.service';

@Component({
  selector: 'app-besoins-page',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    LoadingComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
  ],
  templateUrl: './besoins-page.component.html',
})
export class BesoinsPageComponent {
  private readonly service = inject(BesoinService);

  loading = signal(true);
  error = signal('');

  // Conversion propre en Signal avec gestion du chargement et des erreurs
  besoins = toSignal(
    this.service.lister().pipe(
      tap(() => this.loading.set(false)),
      catchError((e) => {
        this.error.set(e?.error?.message ?? 'Les besoins ne sont pas encore exposés par le backend.');
        this.loading.set(false);
        return of([]);
      })
    ),
    { initialValue: [] }
  );
}