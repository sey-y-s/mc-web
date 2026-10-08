import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, AdminUser } from '../../core/services/admin.service';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Utilisateurs" description="Administrer les comptes utilisateurs et leurs rôles." />
    <section class="mc-card p-6">
      @if (error) { <p class="mb-4 text-sm text-red-700" role="alert">{{ error }}</p> }
      @if (loading) {
        <p class="text-sm text-slate-500">Chargement des utilisateurs…</p>
      } @else if (users.length === 0) {
        <p class="text-sm text-slate-500">Aucun compte utilisateur.</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead><tr><th>Email / téléphone</th><th>Rôle</th><th>État</th><th>Créé le</th></tr></thead>
            <tbody>
              @for (user of users; track user.id) {
                <tr>
                  <td>{{ user.email || user.telephone }}</td>
                  <td>
                    <select class="mc-input" [ngModel]="user.role" (ngModelChange)="changerRole(user, $event)" [disabled]="pending.has(user.id)" [attr.aria-label]="'Rôle de ' + (user.email || user.telephone)">
                      @for (role of roles; track role) { <option [value]="role">{{ role }}</option> }
                    </select>
                  </td>
                  <td>{{ user.actif ? 'Actif' : 'Désactivé' }}</td>
                  <td>{{ user.dateCreation }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class UsersAdminComponent {
  private readonly service = inject(AdminService);
  readonly roles: AdminUser['role'][] = ['CITOYEN', 'ORGANISATION', 'EVALUATEUR', 'ADMIN', 'SUPER_ADMIN'];
  users: AdminUser[] = [];
  loading = true;
  error = '';
  readonly pending = new Set<string>();

  constructor() {
    this.service.users().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les utilisateurs.';
        this.loading = false;
      },
    });
  }

  changerRole(user: AdminUser, role: AdminUser['role']): void {
    if (role === user.role || this.pending.has(user.id)) return;
    const ancienRole = user.role;
    user.role = role;
    this.pending.add(user.id);
    this.error = '';
    this.service.modifierRole(user.id, role).subscribe({
      next: (updated) => {
        user.role = updated.role;
        this.pending.delete(user.id);
      },
      error: (error: Error) => {
        user.role = ancienRole;
        this.pending.delete(user.id);
        this.error = error.message || 'Impossible de modifier le rôle.';
      },
    });
  }
}
