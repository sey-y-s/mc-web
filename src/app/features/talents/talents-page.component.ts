import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components';
import { TalentService } from '../../core/services/talent.service';
import { Talent, TalentSearchFilters } from '../../shared/models';

@Component({
  selector: 'app-talents-page',
  standalone: true,
  imports: [FormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './talents-page.component.html',
})
export class TalentsPageComponent {
  private readonly service = inject(TalentService);

  filters: TalentSearchFilters = {
    competence: '',
    metier: '',
    localisation: '',
    disponibilite: '',
  };

  resultats: Talent[] = [];
  error = '';
  loading = false;

  rechercher(): void {
    this.loading = true;
    this.error = '';
    this.service.rechercher(this.filters).subscribe({
      next: (items) => {
        this.resultats = items ?? [];
        this.loading = false;
      },
      error: (error: Error) => {
        this.resultats = [];
        this.error = error.message || 'La recherche de talents a échoué.';
        this.loading = false;
      },
    });
  }
}
