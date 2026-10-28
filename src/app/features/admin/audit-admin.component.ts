import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, AuditLog } from '../../core/services/admin.service';
import { LibellePipe } from '../../shared/libelle.pipe';

@Component({
  selector: 'app-audit-admin',
  standalone: true,
  imports: [LibellePipe, DatePipe, PageHeaderComponent],
  template: `
    <mc-page-header title="Audit" description="Journal paginé des événements administratifs et des mutations importantes." />
    <section class="mc-card p-5 sm:p-6">
      @if (auditResource.error()) { <p class="mb-4 text-sm text-error" role="alert">{{ errorMessage() }}</p> }
      @if (auditResource.isLoading()) { <p class="py-8" role="status">Chargement du journal…</p> }
      @else if (!items().length) { <p class="py-8 text-sm opacity-70">Aucun événement dans cette page.</p> }
      @else { <div class="overflow-x-auto"><table class="table w-full"><thead><tr><th>Date</th><th>Action</th><th>Entité</th><th>Identifiant</th><th>Résultat</th></tr></thead><tbody>
        @for (item of items(); track item.id) { <tr><td>{{ item.createdAt | date:'short' }}</td><td class="font-medium">{{ item.action | libelle }}</td><td>{{ item.targetType || '—' }}</td><td class="font-mono text-xs">{{ item.targetId || '—' }}</td><td>{{ item.resultCode | libelle }}</td></tr> }
      </tbody></table></div> }
      <div class="mt-4 flex items-center justify-between gap-3"><span class="text-sm opacity-70">Page {{ page() + 1 }}@if (totalPages()) { / {{ totalPages() }} }</span><div class="flex gap-2"><button class="btn btn-secondary" [disabled]="page() === 0 || auditResource.isLoading()" (click)="page.set(page() - 1)">Précédente</button><button class="btn btn-secondary" [disabled]="auditResource.isLoading() || (totalPages() !== null && page() + 1 >= totalPages()!) || items().length < size" (click)="page.set(page() + 1)">Suivante</button></div></div>
    </section>
  `,
})
export class AuditAdminComponent {
  private readonly service = inject(AdminService);

  readonly page = signal(0);
  readonly size = 25;

  readonly auditResource = rxResource({
    params: () => this.page(),
    stream: ({ params }) => this.service.auditLogs(params, this.size),
  });

  readonly items = computed<AuditLog[]>(() => {
    const res = this.auditResource.value();
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return (
      (res as { content?: AuditLog[]; items?: AuditLog[] }).content ??
      (res as { items?: AuditLog[] }).items ??
      []
    );
  });

  readonly totalPages = computed<number | null>(() => {
    const res = this.auditResource.value();
    if (!res || Array.isArray(res)) return null;
    return (res as { totalPages?: number }).totalPages ?? null;
  });

  errorMessage(): string {
    const err = this.auditResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    return err?.error?.message ?? err?.message ?? 'Impossible de charger le journal d’audit.';
  }
}
