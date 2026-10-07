import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, input } from '@angular/core';
import * as L from 'leaflet';
import { SkillsGap } from '../../shared/models';

@Component({ selector: 'app-mali-map', standalone: true, templateUrl: './mali-map.component.html' })
export class MaliMapComponent implements AfterViewInit, OnDestroy {
  items = input<SkillsGap[]>([]);
  @ViewChild('map', { static: true }) mapElement!: ElementRef<HTMLDivElement>;
  private map?: L.Map;
  ngAfterViewInit(): void {
    this.map = L.map(this.mapElement.nativeElement, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([17.57, -4.0], 5.4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
    const points = [
      ['Kayes', 14.44, -11.44],
      ['Koulikoro', 12.86, -8.0],
      ['Bamako', 12.64, -8.0],
      ['Sikasso', 11.32, -5.67],
      ['Ségou', 13.44, -6.26],
      ['Mopti', 14.49, -4.18],
      ['Tombouctou', 16.77, -3.0],
      ['Gao', 16.27, -0.04],
      ['Kidal', 18.44, 1.41],
    ] as const;
    points.forEach(([name, lat, lng]) =>
      L.circleMarker([lat, lng], { radius: 7, weight: 2, fillOpacity: 0.75 })
        .addTo(this.map!)
        .bindPopup(`<strong>${name}</strong><br>Vue régionale à connecter aux indicateurs.`),
    );
  }
  ngOnDestroy(): void {
    this.map?.remove();
  }
}
