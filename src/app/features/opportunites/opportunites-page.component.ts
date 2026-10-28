import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../../shared/components';

@Component({
  selector: 'app-opportunites-page',
  standalone: true,
  imports: [EmptyStateComponent, RouterLink],
  templateUrl: './opportunites-page.component.html',
})
export class OpportunitesPageComponent {}
