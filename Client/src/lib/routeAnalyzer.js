/**
 * Pure route analysis functions for Smart Travel Addis Ababa.
 */

/**
 * Analyzes travel options between two hubs across all transport modes.
 *
 * @param {string} origin - Origin hub name (case-insensitive)
 * @param {string} destination - Destination hub name (case-insensitive)
 * @param {Hub[]} hubs - Array of hub objects
 * @param {Route[]} routes - Array of route objects
 * @param {TransportMode[]} transportModes - Array of transport mode objects
 * @returns {AnalysisResult}
 */
export function analyze(origin, destination, hubs, routes, transportModes) {
  // 1. Hub resolution
  const originHub = hubs.find(
    (h) => h.name.toLowerCase() === origin.toLowerCase()
  );
  if (!originHub) throw new Error(`Hub not found: ${origin}`);

  const destinationHub = hubs.find(
    (h) => h.name.toLowerCase() === destination.toLowerCase()
  );
  if (!destinationHub) throw new Error(`Hub not found: ${destination}`);

  // 2. Route matching — prefer routes where origin comes before destination
  const orderedMatches = routes.filter((r) => {
    const oi = r.hubSequence.indexOf(originHub.id);
    const di = r.hubSequence.indexOf(destinationHub.id);
    return oi !== -1 && di !== -1 && oi < di;
  });

  let candidates = orderedMatches;

  if (candidates.length === 0) {
    // Fallback: any route containing both hubs in any order
    candidates = routes.filter((r) => {
      return (
        r.hubSequence.includes(originHub.id) &&
        r.hubSequence.includes(destinationHub.id)
      );
    });
  }

  if (candidates.length === 0) {
    throw new Error(`No route found between ${origin} and ${destination}`);
  }

  // 3. Best route selection — shortest hubSequence first
  const sorted = [...candidates].sort(
    (a, b) => a.hubSequence.length - b.hubSequence.length
  );
  const route = sorted[0];

  // 4. Distance from route's existing field
  const distanceKm = route.distanceKm;

  // 5. Per-mode computation
  const rawOptions = transportModes.map((mode) => {
    const durationMin = (distanceKm / mode.speedKmh) * 60;
    const price = mode.id === "walk" ? 0 : distanceKm * mode.pricePerKm;
    return { mode, distanceKm, durationMin, price };
  });

  // 6. Min-max normalization
  const prices = rawOptions.map((o) => o.price);
  const durations = rawOptions.map((o) => o.durationMin);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  const priceRange = maxPrice - minPrice;
  const durationRange = maxDuration - minDuration;

  // 7. Score computation
  const options = rawOptions.map((o) => {
    const normalizedPrice = priceRange === 0 ? 0 : (o.price - minPrice) / priceRange;
    const normalizedDuration =
      durationRange === 0 ? 0 : (o.durationMin - minDuration) / durationRange;
    const score = 0.5 * normalizedPrice + 0.5 * normalizedDuration;
    return { ...o, score, isBest: false };
  });

  // 8. Best selection — lowest score
  const minScore = Math.min(...options.map((o) => o.score));
  const bestIndex = options.findIndex((o) => o.score === minScore);
  options[bestIndex] = { ...options[bestIndex], isBest: true };

  const bestOption = options[bestIndex];

  // 9. Explanation
  const explanation = `${bestOption.mode.label} was chosen because it offers the best balance of cost (${bestOption.price.toFixed(0)} ETB) and travel time (${bestOption.durationMin.toFixed(0)} min).`;

  // 10. Return AnalysisResult
  return {
    origin: originHub,
    destination: destinationHub,
    route,
    options,
    bestOption,
    explanation,
  };
}

/**
 * Async wrapper around analyze() with a simulated 200–800ms delay.
 *
 * @param {string} origin
 * @param {string} destination
 * @param {Hub[]} hubs
 * @param {Route[]} routes
 * @param {TransportMode[]} transportModes
 * @returns {Promise<AnalysisResult>}
 */
export function analyzeWithDelay(origin, destination, hubs, routes, transportModes) {
  const delay = Math.random() * 600 + 200;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(analyze(origin, destination, hubs, routes, transportModes));
      } catch (err) {
        reject(err);
      }
    }, delay);
  });
}
