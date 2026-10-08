import { Component, OnInit, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { OrganisationService } from '../../core/services/organisation.service';
import { Organisation } from '../../shared/models';

@Component({
  selector: 'app-organisations-page',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './organisations-page.component.html',
})
export class OrganisationsPageComponent implements OnInit {
  private readonly service = inject(OrganisationService);

  organisations: Organisation[] = [];
  filter: 'ALL' | 'EN_ATTENTE' | 'APPROUVEE' | 'SUSPENDUE' = 'ALL';
  error = '';
  loading = true;

  ngOnInit(): void {
    this.service.lister().subscribe({
      next: (items) => {
        this.organisations = items ?? [];
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les organisations.';
        this.loading = false;
      },
    });
  }

  get filteredOrganisations(): Organisation[] {
    if (this.filter === 'ALL') return this.organisations;
    return this.organisations.filter((item) => item.statut === this.filter);
  }
}
