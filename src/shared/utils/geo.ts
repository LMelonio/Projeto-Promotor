/**
 * Utilitários de geolocalização usados no check-in georreferenciado.
 * Mantidos pequenos e puros (fáceis de testar isoladamente).
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;

/** Distância em km entre duas coordenadas (fórmula de Haversine). */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Formata distância em texto curto: metros abaixo de 1km, "X.X km" a partir de 1km. */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
