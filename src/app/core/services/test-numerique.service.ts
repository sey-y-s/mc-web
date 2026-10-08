import { Injectable, inject } from '@angular/core';
import { throwError } from 'rxjs';
import { ApiService } from './api.service';
import { TestNumerique } from '../../shared/models';
import { AdminTestNumerique } from './admin.service';

interface TestRequest {
  competenceId?: string;
  titre?: string;
  description?: string;
  actif?: boolean;
  questions?: Array<{
    texte: string;
    type: 'CHOIX_UNIQUE' | 'TEXTE_LIBRE';
    ordre: number;
    propositions: Array<{ texte: string; correcte: boolean }>;
  }>;
}

@Injectable({ providedIn: 'root' })
export class TestNumeriqueService {
  private readonly api = inject(ApiService);

  lister() {
    return this.api.get<AdminTestNumerique[]>('/api/admin/tests-numeriques');
  }

  creer(body: Partial<TestNumerique>) {
    if (!body.competenceId || !body.titre?.trim()) {
      return throwError(() => new Error('Une compétence et un titre sont obligatoires.'));
    }
    return this.api.post<AdminTestNumerique>('/api/admin/tests-numeriques', this.toRequest(body));
  }

  modifier(id: string, body: Partial<TestNumerique>) {
    return this.api.put<AdminTestNumerique>(`/api/admin/tests-numeriques/${id}`, this.toRequest(body));
  }

  supprimer(id: string) {
    return this.api.delete<void>(`/api/admin/tests-numeriques/${id}`);
  }

  private toRequest(body: Partial<TestNumerique>): TestRequest {
    return {
      competenceId: body.competenceId,
      titre: body.titre,
      description: body.description,
      actif: body.statut === undefined ? undefined : body.statut === 'PUBLIQUE',
      questions: body.questions?.map((question, index) => ({
        texte: question.libelle,
        type: question.type === 'OUVERT' ? 'TEXTE_LIBRE' : 'CHOIX_UNIQUE',
        ordre: index + 1,
        propositions: (question.propositions ?? []).map((proposition) => ({
          texte: proposition.libelle,
          correcte: proposition.estCorrecte ?? false,
        })),
      })),
    };
  }
}
