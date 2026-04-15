/**
 * AI Routing Engine
 *
 * Generates candidate routes between two hubs, scores each one,
 * and returns the best option with alternatives.
 *
 * Scoring formula:
 *   score = (time * 0.5) + (cost * 0.3) + (trafficFactor * 10) + transferPenalty
 */

const Hub = require('../models/Hub');
const Place = require('../models/Place');
const RouteHistory = require('../models/RouteHistory');
const { haversineKm } = require('../utils/haversine');
const { getTrafficFactor, getTrafficMultiplier } = require('../utils/traffic');
const { scoreRoute, buildExplanation } = require('../utils/scoring');

// Default transport speeds (km/h) — overridden by DB values when available
const DEFAULT_SPEEDS = { taxi: 35, bus: 20, walk: 5 };
const DEFAULT_PRICES = { taxi: 15, bus: 2, walk: 0 }; // ETB per km

/**
 * Find a location (hub or place) by name.
 * Returns { name, latitude, longitude, type: 'hub'|'place' }
 */
async function findLocation(name) {
  // Try to find in hubs first
  const hub = await Hub.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (hub) {
    return { name: hub.name, latitude: hub.latitude, longitude: hub.longitude, type: 'hub' };
  }

  // Try to find in places
  const place = await Place.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (place) {
    return { name: place.name, latitude: place.latitude, longitude: place.longitude, type: 'place' };
  }

  return null;
}

/**
 * Calculate the total distance along a sequence of hub names.
 *
 * @param {string[]} hubNames
 * @param {Map<string, object>} hubMap - name → hub document
 * @returns {number} total distance in km
 */
function routeDistance(hubNames, hubMap) {
  let total = 0;
  for (let i = 0; i < hubNames.length - 1; i++) {
    const a = hubMap.get(hubNames[i].toLowerCase());
    const b = hubMap.get(hubNames[i + 1].toLowerCase());
    if (a && b) {
      total += haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
    }
  }
  return parseFloat(total.toFixed(2));
}

/**
 * Build candidate routes between start and destination.
 * Returns: direct route + routes via each intermediate hub.
 *
 * @param {object} startHub
 * @param {object} destHub
 * @param {object[]} allHubs
 * @returns {string[][]} array of hub-name arrays
 */
function buildCandidateRoutes(startHub, destHub, allHubs) {
  const candidates = [];

  // 1. Direct route
  candidates.push([startHub.name, destHub.name]);

  // 2. Via each intermediate hub (sorted by importance descending)
  const intermediates = allHubs
    .filter(
      (h) =>
        h.name !== startHub.name &&
        h.name !== destHub.name &&
        h.importanceScore >= 1
    )
    .sort((a, b) => b.importanceScore - a.importanceScore)
    .slice(0, 5); // limit to top 5 hubs to keep response fast

  for (const hub of intermediates) {
    candidates.push([startHub.name, hub.name, destHub.name]);
  }

  // 3. Via two hubs (only top 2 importance hubs to avoid combinatorial explosion)
  const top2 = intermediates.slice(0, 2);
  if (top2.length === 2) {
    candidates.push([startHub.name, top2[0].name, top2[1].name, destHub.name]);
    candidates.push([startHub.name, top2[1].name, top2[0].name, destHub.name]);
  }

  return candidates;
}

/**
 * Score and rank all candidate routes.
 *
 * @param {string[][]} candidates
 * @param {Map<string, object>} hubMap
 * @param {object} transportConfig - { pricePerKm, speedKmPerHour }
 * @returns {object[]} scored route objects, sorted best-first
 */
function scoreCandidates(candidates, hubMap, transportConfig) {
  const trafficFactor = getTrafficFactor();
  const trafficMultiplier = getTrafficMultiplier();

  const { pricePerKm, speedKmPerHour } = transportConfig;

  return candidates
    .map((route) => {
      const distance = routeDistance(route, hubMap);
      const transfers = route.length - 2; // hubs between start and end
      const baseTimeMin = (distance / speedKmPerHour) * 60;
      const timeMin = parseFloat((baseTimeMin * trafficMultiplier).toFixed(1));
      const cost = parseFloat((pricePerKm * distance).toFixed(2));
      const score = scoreRoute({ time: timeMin, cost, trafficFactor, transfers });

      return {
        route,
        distance,
        timeMin,
        cost,
        transfers,
        score: parseFloat(score.toFixed(3)),
      };
    })
    .sort((a, b) => a.score - b.score);
}

/**
 * Main route calculation function.
 *
 * @param {string} startName
 * @param {string} destinationName
 * @param {object} [transportOverride] - optional { pricePerKm, speedKmPerHour }
 * @returns {Promise<object>} route result
 */
async function calculateRoute(startName, destinationName, transportOverride = null) {
  // Find start and destination locations (hubs or places)
  const startLocation = await findLocation(startName);
  const destLocation = await findLocation(destinationName);

  if (!startLocation) {
    throw new Error(`Location not found: "${startName}"`);
  }
  if (!destLocation) {
    throw new Error(`Location not found: "${destinationName}"`);
  }

  if (startLocation.name.toLowerCase() === destLocation.name.toLowerCase()) {
    throw new Error('Start and destination must be different');
  }

  // Calculate direct distance between the two locations
  const distance = parseFloat(haversineKm(
    startLocation.latitude,
    startLocation.longitude,
    destLocation.latitude,
    destLocation.longitude
  ).toFixed(2));

  // Transport config — use override or fall back to defaults
  const transportConfig = transportOverride || {
    pricePerKm: DEFAULT_PRICES.bus,
    speedKmPerHour: DEFAULT_SPEEDS.bus,
  };

  const trafficFactor = getTrafficFactor();
  const trafficMultiplier = getTrafficMultiplier();

  // Calculate time and cost for direct route
  const baseTimeMin = (distance / transportConfig.speedKmPerHour) * 60;
  const timeMin = parseFloat((baseTimeMin * trafficMultiplier).toFixed(1));
  const cost = parseFloat((transportConfig.pricePerKm * distance).toFixed(2));
  const score = scoreRoute({ time: timeMin, cost, trafficFactor, transfers: 0 });

  // Build the route result
  const bestRoute = [startLocation.name, destLocation.name];

  // If both are hubs, try to find intermediate routes
  let alternatives = [];
  if (startLocation.type === 'hub' && destLocation.type === 'hub') {
    const allHubs = await Hub.find({});
    const hubMap = new Map(allHubs.map((h) => [h.name.toLowerCase(), h]));
    const startHub = hubMap.get(startName.toLowerCase());
    const destHub = hubMap.get(destinationName.toLowerCase());

    if (startHub && destHub && allHubs.length > 2) {
      const candidates = buildCandidateRoutes(startHub, destHub, allHubs);
      const scored = scoreCandidates(candidates, hubMap, transportConfig);
      
      // Get alternatives (skip the first one which is the direct route)
      alternatives = scored
        .filter(s => s.route.length > 2) // Only routes with intermediate hubs
        .slice(0, 3)
        .map((alt) => ({
          route: alt.route,
          distance: alt.distance,
          time: Math.round(alt.timeMin),
          cost: Math.round(alt.cost),
          score: alt.score,
        }));
    }
  }

  // Persist to RouteHistory for analytics
  await RouteHistory.create({
    start: startLocation.name,
    destination: destLocation.name,
    selectedRoute: bestRoute,
    totalTime: timeMin,
    totalCost: cost,
    score: score,
  });

  return {
    bestRoute,
    distance,
    time: Math.round(timeMin),
    cost: Math.round(cost),
    score: parseFloat(score.toFixed(3)),
    reason: buildExplanation({ distance, timeMin, cost, score, transfers: 0 }),
    alternatives,
  };
}

module.exports = { calculateRoute };
