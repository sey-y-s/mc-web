import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mc-bogolan-pattern',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      class="w-full h-full opacity-[0.07] pointer-events-none select-none text-primary"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      fill="none"
    >
      <pattern id="bogolan-grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M0 30L30 0L60 30L30 60Z" stroke="currentColor" stroke-width="1.2" fill="none" />
        <path d="M30 15L45 30L30 45L15 30Z" stroke="currentColor" stroke-width="0.8" fill="none" />
        <circle cx="30" cy="30" r="2" fill="currentColor" />
        <path
          d="M0 0L10 10M50 50L60 60M50 10L60 0M0 60L10 50"
          stroke="currentColor"
          stroke-width="1"
        />
      </pattern>
      <rect width="100%" height="100%" fill="url(#bogolan-grid)" />
    </svg>
  `,
})
export class McBogolanPatternComponent {}
