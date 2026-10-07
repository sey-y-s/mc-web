import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { SkillsGap } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class SkillsGapService {
  private readonly api = inject(ApiService);
  lister() {
    return this.api.get<SkillsGap[]>('/indicateurs/skills-gap');
  }
  parRegion(regionId: string) {
    return this.api.get<SkillsGap[]>(`/indicateurs/skills-gap/region/${regionId}`);
  }
}
