import { Component } from '@angular/core';
import { PageHeaderComponent, EmptyStateComponent } from '../../shared/components';
@Component({
  selector: 'app-tests-numeriques-page',
  standalone: true,
  imports: [PageHeaderComponent, EmptyStateComponent],
  templateUrl: './tests-numeriques-page.component.html',
})
export class TestsNumeriquesPageComponent {}
