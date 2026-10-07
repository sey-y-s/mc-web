import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Competence } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ReferentielService {
  private readonly api = inject(ApiService);
  competences() {
    return this.api.get<Competence[]>('/competences');
  }
}
