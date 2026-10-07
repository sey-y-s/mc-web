import { Component } from '@angular/core';
import { PageHeaderComponent, EmptyStateComponent } from '../../shared/components';
@Component({
  selector: 'app-administration-page',
  standalone: true,
  imports: [PageHeaderComponent, EmptyStateComponent],
  templateUrl: './administration-page.component.html',
})
export class AdministrationPageComponent {}
