import { Component } from '@angular/core';
import { PageHeaderComponent, EmptyStateComponent } from '../../shared/components';
@Component({
  selector: 'app-citoyens-page',
  standalone: true,
  imports: [PageHeaderComponent, EmptyStateComponent],
  templateUrl: './citoyens-page.component.html',
})
export class CitoyensPageComponent {}
