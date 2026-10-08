import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Organisation, Talent, Validation, TestNumerique, Opportunite } from '../../shared/models';

export interface AdminTestNumerique extends Omit<TestNumerique, 'questions'> {
  questions?: Array<{
    id: string;
    libelle: string;
    type: 'QCM' | 'OUVERT';
    ordre: number;
    propositions: Array<{ id: string; libelle: string; estCorrecte: boolean }>;
  }>;
}

export interface AdminUser {
  id: string;
  email?: string;
  telephone: string;
  role: 'CITOYEN' | 'ORGANISATION' | 'EVALUATEUR' | 'ADMIN' | 'SUPER_ADMIN';
  actif: boolean;
  dateCreation: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  dashboard() {
    return this.api.get<Record<string, number>>('/api/admin/dashboard');
  }

  citoyens() {
    return this.api.get<Talent[]>('/api/admin/citoyens');
  }

  organisations() {
    return this.api.get<Organisation[]>('/api/admin/organisations');
  }

  modifierStatutOrganisation(id: string, statut: NonNullable<Organisation['statut']>) {
    return this.api.patch<Organisation>(`/api/admin/organisations/${id}/statut`, { statut });
  }

  validations() {
    return this.api.get<Validation[]>('/api/admin/validations');
  }

  modifierStatutValidation(id: string, statut: Validation['statut'], commentaire?: string) {
    return this.api.patch<Validation>(`/api/admin/validations/${id}/statut`, { statut, commentaire });
  }

  testsNumeriques() {
    return this.api.get<AdminTestNumerique[]>('/api/admin/tests-numeriques');
  }

  opportunites() {
    return this.api.get<Opportunite[]>('/api/admin/opportunites');
  }

  centres() {
    return this.api.get<Array<{ id: string; nom: string; adresse?: string; telephone?: string }>>('/api/admin/centres');
  }

  competences() {
    return this.api.get<Array<{ id: string; nom: string }>>('/api/admin/competences');
  }

  users() {
    return this.api.get<AdminUser[]>('/api/admin/users');
  }

  modifierRole(id: string, role: AdminUser['role']) {
    return this.api.put<AdminUser>(`/api/admin/users/${id}/role`, { role });
  }
}
