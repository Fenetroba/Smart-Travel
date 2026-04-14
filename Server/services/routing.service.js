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
const RouteHistory = require('../models/RouteHistory');
const { haversineKm } = require('../utils/haversine');
const { getTrafficFactor, getTrafficMultiplier } = require('../utils/traffic');
const { scoreRoute, buildExplanation } = require('../utils/scoring');

// Default transport speeds (km/h) — overridden by DB values when available
const DEFAULT_SPEEDS = { taxi: 35, bus: 20, walk: 5 };
const DEFAULT_PRICES = { taxi: 15, bus: 2, walk: 0 }; // ETB per km

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
  // Load all hubs
  const allHubs = await Hub.find({});
  if (!allHubs.length) {
    throw new Error('No hubs found. Run the seed script first.');
  }

  // Build a case-insensitive lookup map
  const hubMap = new Map(allHubs.map((h) => [h.name.toLowerCase(), h]));

  const startHub = hubMap.get(startName.toLowerCase());
  if (!startHub) throw new Error(`Hub not found: "${startName}"`);

  const destHub = hubMap.get(destinationName.toLowerCase());
  if (!destHub) throw new Error(`Hub not found: "${destinationName}"`);

  if (startHub.name === destHub.name) {
    throw new Error('Start and destination must be different');
  }

  // Transport config — use override or fall back to defaults
  const transportConfig = transportOverride || {
    pricePerKm: DEFAULT_PRICES.bus,
    speedKmPerHour: DEFAULT_SPEEDS.bus,
  };

  // Generate and score candidates
  const candidates = buildCandidateRoutes(startHub, destHub, allHubs);
  const scored = scoreCandidates(candidates, hubMap, transportConfig);

  const best = scored[0];
  const alternatives = scored.slice(1, 4); // return up to 3 alternatives

  // Persist to RouteHistory for analytics
  await RouteHistory.create({
    start: startHub.name,
    destination: destHub.name,
    selectedRoute: best.route,
    totalTime: best.timeMin,
    totalCost: best.cost,
    score: best.score,
  });

  return {
    bestRoute: best.route,
    distance: best.distance,
    time: Math.round(best.timeMin),
    cost: Math.round(best.cost),
    score: best.score,
    reason: buildExplanation(best),
    alternatives: alternatives.map((alt) => ({
      route: alt.route,
      distance: alt.distance,
      time: Math.round(alt.timeMin),
      cost: Math.round(alt.cost),
      score: alt.score,
    })),
  };
}

module.exports = { calculateRoute };
