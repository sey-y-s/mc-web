import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, AdminUser } from '../../core/services/admin.service';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmationService } from '../../core/ui/confirmation.service';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [FormsModule, DatePipe, PageHeaderComponent],
  template: `
    <mc-page-header
      title="Utilisateurs et rôles"
      description="Gérer les rôles et l’état des comptes utilisateurs."
    />
    <section class="mc-card p-5 sm:p-6">
      <p class="mb-4 rounded-md border border-base-300 bg-base-200/50 px-4 py-3 text-sm text-base-content/70">Le rôle Gestionnaire de centre se donne depuis la fiche d’un centre. Le compte doit déjà posséder le profil correspondant à son type.</p>
      @if (usersResource.error() || actionError()) {
        <p class="mb-4 text-sm text-red-700" role="alert">{{ errorMessage() }}</p>
      }
      @if (message()) {
        <p class="mb-4 text-sm text-emerald-800" role="status">{{ message() }}</p>
      }
      <input
        class="mc-input mb-4 max-w-md"
        type="search"
        [ngModel]="query()"
        (ngModelChange)="query.set($event); page.set(1)"
        placeholder="Rechercher par e-mail ou téléphone"
        aria-label="Rechercher un utilisateur"
      />
      @if (usersResource.isLoading()) {
        <p class="py-8 text-sm text-slate-500">Chargement des utilisateurs…</p>
      } @else if (!filtered().length) {
        <p class="py-8 text-sm text-slate-500">Aucun utilisateur correspondant.</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Compte</th>
                <th>Rôle</th>
                <th>État</th>
                <th>Actions</th>
                <th>Créé le</th>
              </tr>
            </thead>
            <tbody>
              @for (u of pageItems(); track u.id) {
                <tr>
                  <td>
                    <div class="font-medium">{{ u.email || u.telephone }}</div>
                    <div class="text-xs text-slate-500">{{ u.telephone }}</div>
                  </td>
                  <td>
                    @if (u.role === 'CENTRE_ADMIN') {
                      <span class="badge badge-outline">Gestionnaire de centre</span>
                      <p class="mt-1 max-w-52 text-xs text-base-content/60">Le rôle se gère depuis la fiche du centre.</p>
                    } @else {
                    <select
                      class="mc-input min-w-40"
                      [ngModel]="u.role"
                      (ngModelChange)="changerRole(u, $event)"
                      [disabled]="pending.has(u.id) || bloqueChangement(u)"
                      [attr.aria-label]="'Rôle de ' + (u.email || u.telephone)"
                    >
                      @for (r of roles; track r) {
                        <option [value]="r">{{ libelleRole(r) }}</option>
                      }
                    </select>
                    }
                    <!-- @if (bloqueChangement(u)) {
                      <p class="mt-1 max-w-56 text-xs text-amber-800">
                        Votre propre rôle Super Admin ne peut pas être retiré.
                      </p>
                    } -->
                  </td>
                  <td>{{ u.actif ? 'Actif' : 'Désactivé' }}</td>
                  <td>
                    <button
                      class="btn btn-sm btn-secondary"
                      type="button"
                      [disabled]="pending.has(u.id) || bloqueChangement(u)"
                      (click)="changerStatut(u)"
                    >
                      {{ u.actif ? 'Désactiver' : 'Réactiver' }}
                    </button>
                  </td>
                  <td>{{ u.dateCreation | date: 'dd/MM/yyyy' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>{{ filtered().length }} compte(s) · Page {{ page() }} / {{ totalPages() }}</span>
          <div class="flex gap-2">
            <button
              class="btn btn-sm btn-secondary"
              type="button"
              [disabled]="page() <= 1"
              (click)="page.set(page() - 1)"
            >
              Précédent</button
            ><button
              class="btn btn-sm btn-secondary"
              type="button"
              [disabled]="page() >= totalPages()"
              (click)="page.set(page() + 1)"
            >
              Suivant
            </button>
          </div>
        </div>
      }
    </section>
  `,
})
export class UsersAdminComponent {
  private readonly service = inject(AdminService);
  private readonly auth = inject(AuthService);
  private readonly confirmation = inject(ConfirmationService);

  readonly roles: AdminUser['role'][] = [
    'CITOYEN',
    'ORGANISATION',
    'ADMIN',
    'SUPER_ADMIN',
    'INSTITUTION',
  ];
  readonly query = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly message = signal('');
  readonly actionError = signal('');
  readonly pending = new Set<string>();

  readonly usersResource = rxResource({
    stream: () => this.service.users(),
    defaultValue: [] as AdminUser[],
  });

  readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase();
    const list = this.usersResource.value() ?? [];
    return list.filter(
      (u) =>
        !q || `${u.email ?? ''} ${u.telephone ?? ''} ${u.role}`.toLocaleLowerCase().includes(q),
    );
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );

  readonly pageItems = computed(() => {
    const p = Math.min(this.page(), this.totalPages());
    return this.filtered().slice((p - 1) * this.pageSize, p * this.pageSize);
  });

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = this.usersResource.error() as Error | undefined;
    return err?.message || 'Impossible de charger les utilisateurs.';
  }

  libelleRole(role: AdminUser['role']): string {
    return ({ CITOYEN: 'Citoyen', ORGANISATION: 'Organisation', ADMIN: 'Administrateur', SUPER_ADMIN: 'Super administrateur', INSTITUTION: 'Institution' } as Partial<Record<AdminUser['role'], string>>)[role] ?? role;
  }

  bloqueChangement(u: AdminUser): boolean {
    return u.id === this.auth.getCurrentUser()?.id && u.role === 'SUPER_ADMIN';
  }

  async changerRole(u: AdminUser, role: AdminUser['role']): Promise<void> {
    if (role === u.role || role === 'CENTRE_ADMIN' || this.pending.has(u.id)) return;
    if (
      u.id === this.auth.getCurrentUser()?.id &&
      u.role === 'SUPER_ADMIN' &&
      role !== 'SUPER_ADMIN'
    ) {
      this.actionError.set('Le rôle Super Admin ne peut pas être retiré.');
      return;
    }
    const ok = await this.confirmation.confirm(`Le compte ${u.email || u.telephone} passera au rôle ${role}. Vérifiez que ce rôle correspond bien à son profil et à ses accès.`, { title: 'Modifier le rôle', confirmLabel: 'Modifier le rôle', danger: true });
    if (!ok) return;
    const old = u.role;
    this.pending.add(u.id);
    this.actionError.set('');
    this.message.set('');
    this.service.modifierRole(u.id, role).subscribe({
      next: (saved) => {
        u.role = saved.role;
        this.pending.delete(u.id);
        this.message.set('Le rôle a été modifié.');
        this.usersResource.reload();
      },
      error: (e: Error) => {
        u.role = old;
        this.pending.delete(u.id);
        this.actionError.set(e.message || 'Impossible de modifier le rôle.');
      },
    });
  }

  async changerStatut(u: AdminUser): Promise<void> {
    if (
      (u.id === this.auth.getCurrentUser()?.id && u.role === 'SUPER_ADMIN') ||
      this.pending.has(u.id)
    )
      return;
    const actif = !u.actif;
    const ok = await this.confirmation.confirm(`${actif ? 'Réactiver' : 'Désactiver'} le compte ${u.email || u.telephone} ?`, { title: actif ? 'Réactiver le compte' : 'Désactiver le compte', confirmLabel: actif ? 'Réactiver' : 'Désactiver', danger: !actif });
    if (!ok) return;
    const old = u.actif;
    this.pending.add(u.id);
    this.actionError.set('');
    this.message.set('');
    this.service.modifierStatutUtilisateur(u.id, actif).subscribe({
      next: (saved) => {
        u.actif = saved.actif;
        this.pending.delete(u.id);
        this.message.set(`Le compte est maintenant ${u.actif ? 'actif' : 'désactivé'}.`);
        this.usersResource.reload();
      },
      error: (e: Error) => {
        u.actif = old;
        this.pending.delete(u.id);
        this.actionError.set(e.message || 'Impossible de modifier le statut du compte.');
      },
    });
  }
}
