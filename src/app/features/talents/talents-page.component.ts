import { Component } from '@angular/core';
import { PageHeaderComponent, EmptyStateComponent } from '../../shared/components';
@Component({
  selector: 'app-talents-page',
  standalone: true,
  imports: [PageHeaderComponent, EmptyStateComponent],
  templateUrl: './talents-page.component.html',
})
export class TalentsPageComponent {}
