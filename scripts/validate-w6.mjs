import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const assert = (condition, message) => {
  if (!condition) { console.error(`FAIL: ${message}`); process.exitCode = 1; }
  else console.log(`PASS: ${message}`);
};
const routes = read('src/app/app.routes.ts');
for (const route of ['institution/tableau-de-bord', 'institution/skills-gap', 'institution/carte']) {
  assert(routes.includes(`path: '${route}'`), `route exists: ${route}`);
}
assert(routes.includes("roleGuard([UserRole.INSTITUTION])"), 'Institution routes require the INSTITUTION role');
assert(read('src/app/core/auth/user-role.enum.ts').includes("INSTITUTION = 'INSTITUTION'"), 'INSTITUTION role is aligned with backend');
const nav = read('src/app/core/navigation/navigation.config.ts');
assert(nav.includes("path: '/app/institution/tableau-de-bord'"), 'Institution workspace appears in role-based navigation');
const api = read('src/app/core/services/admin.service.ts');
for (const endpoint of ['/api/v1/institution/skills-gap', '/api/v1/institution/tableau-de-bord', '/api/v1/territoires/indicateurs', '/api/v1/admin/audit-logs', '/api/v1/admin/referentiel/secteurs']) {
  assert(api.includes(endpoint), `API client contains ${endpoint}`);
}
assert(api.includes("'/api/v1/territoires'"), 'stable territory endpoint is wired');
assert(read('src/app/features/institution/institution-skills-gap.component.ts').includes("'Masqué'"), 'null indicator values are presented as masked');
assert(read('src/app/features/institution/institution-skills-gap.component.ts').includes('trimestreValide'), 'institution periods are checked as complete calendar quarters');
const map = read('src/app/features/dashboard/mali-map.component.ts');
assert(!/tileLayer\(|tile\.openstreetmap\.org/.test(map), 'no external map tile provider');
assert(map.includes("'/geo/mali-regions.geojson'"), 'map reads only the local GeoJSON path');
assert(map.includes('collection.features.length !== 20'), 'map blocks unless exactly 20 features are present');
assert(map.includes('new Set(codes).size !== 20'), 'map blocks absent or duplicate stable codes');
assert(map.includes("properties?.niveau === 'REGION'") && map.includes("properties?.niveau === 'DISTRICT'"), 'map distinguishes 19 regions from Bamako district');
assert(read('src/app/features/institution/institution-map-page.component.ts').includes('[institutionItems]=\"items\"'), 'institution map receives privacy-safe indicator rows');
const institutionMap = read('src/app/features/institution/institution-map-page.component.ts');
assert(institutionMap.includes("privacy.includes('supprim')") && institutionMap.includes("return v==null||protectedCell?'Masqué'"), 'institution table masks values marked as suppressed');
assert(institutionMap.includes('periodeTrimestreValide'), 'institution map only requests full calendar quarters');
const geoPath = path.join(root, 'public/geo/mali-regions.geojson');
if (!fs.existsSync(geoPath)) {
  assert(false, 'local GeoJSON file is included');
} else {
  const geo = JSON.parse(fs.readFileSync(geoPath, 'utf8'));
  const features = geo.features ?? [];
  const codes = features.map(f => f.properties?.codeStable ?? f.properties?.code ?? '');
  assert(geo.type === 'FeatureCollection' && features.length === 20, 'GeoJSON is a 20-feature FeatureCollection');
  assert(codes.every(c => typeof c === 'string' && c.trim()) && new Set(codes).size === 20, 'GeoJSON codes are non-empty and unique');
  assert(features.filter(f => f.properties?.niveau === 'REGION').length === 19 && features.filter(f => f.properties?.niveau === 'DISTRICT').length === 1, 'GeoJSON contains 19 regions and the Bamako district');
  assert(features.every(f => ['Polygon', 'MultiPolygon'].includes(f.geometry?.type)), 'all territories have polygonal geometries');
  assert(features.every(f => typeof f.properties?.sourcePcode === 'string' && f.properties.sourcePcode.length > 0), 'source OCHA p-codes are preserved for traceability');
}
