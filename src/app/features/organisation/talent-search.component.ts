import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components';
import { TalentService } from '../../core/services/talent.service';
import { Talent } from '../../shared/models';

@Component({
  selector: 'app-talent-search',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './talent-search.component.html',
})
export class TalentSearchComponent implements OnInit {
  private readonly service = inject(TalentService);

  filters = {
    competence: '',
    metier: '',
    localisation: '',
    disponibilite: '',
  };

  resultats: Talent[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.search();
  }

  search(): void {
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
