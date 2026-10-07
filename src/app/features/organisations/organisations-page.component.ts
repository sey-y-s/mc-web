import { Component } from '@angular/core';
import { PageHeaderComponent, EmptyStateComponent } from '../../shared/components';
@Component({
  selector: 'app-organisations-page',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './organisations-page.component.html',
})
export class OrganisationsPageComponent {}
