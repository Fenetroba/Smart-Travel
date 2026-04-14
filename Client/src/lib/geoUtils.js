const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the Haversine distance in km between two lat/lng coordinates.
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Returns the total distance in km along a sequence of hub ids.
 * Returns 0 if hubSequence has fewer than 2 items.
 */
export function totalDistance(hubSequence, hubs) {
  if (!hubSequence || hubSequence.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < hubSequence.length - 1; i++) {
    const a = hubs.find((h) => h.id === hubSequence[i]);
    const b = hubs.find((h) => h.id === hubSequence[i + 1]);
    if (a && b) total += haversineKm(a.lat, a.lng, b.lat, b.lng);
  }
  return total;
}

/**
 * Returns the hub object closest to the given coordinates.
 * Returns null if hubs is empty.
 */
export function nearestHub(lat, lng, hubs) {
  if (!hubs || hubs.length === 0) return null;
  return hubs.reduce((closest, hub) => {
    const d = haversineKm(lat, lng, hub.lat, hub.lng);
    const dClosest = haversineKm(lat, lng, closest.lat, closest.lng);
    return d < dClosest ? hub : closest;
  });
}
