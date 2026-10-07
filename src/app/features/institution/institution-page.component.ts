import { Component } from '@angular/core';
import { PageHeaderComponent, EmptyStateComponent } from '../../shared/components';
@Component({
  selector: 'app-institution-page',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './institution-page.component.html',
})
export class InstitutionPageComponent {}
