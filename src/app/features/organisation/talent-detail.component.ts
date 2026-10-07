import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components';
import { TalentService } from '../../core/services/talent.service';
import { Talent } from '../../shared/models';

@Component({
  selector: 'app-talent-detail',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './talent-detail.component.html',
})
export class TalentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TalentService);

  talent: Talent | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Identifiant du talent manquant.';
      this.loading = false;
      return;
    }

    this.service.obtenir(id).subscribe({
      next: (item) => {
        this.talent = item;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger ce profil.';
        this.loading = false;
      },
    });
  }
}
