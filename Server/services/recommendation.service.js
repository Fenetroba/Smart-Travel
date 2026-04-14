/**
 * Recommendation Engine
 *
 * Finds nearby places relative to a hub location and ranks them
 * using a score that balances popularity and proximity.
 *
 * score = popularityScore - (distanceKm * DISTANCE_PENALTY)
 */

const Hub = require('../models/Hub');
const Place = require('../models/Place');
const { haversineKm } = require('../utils/haversine');

const SEARCH_RADIUS_KM = 5;
const DISTANCE_PENALTY = 0.8; // deduct 0.8 points per km
const DEFAULT_RESULT_COUNT = 3;

/**
 * Get place recommendations near a named hub.
 *
 * @param {string} locationName - hub name
 * @param {number} [count=3]    - number of results to return
 * @returns {Promise<Array>}
 */
async function getRecommendations(locationName, count = DEFAULT_RESULT_COUNT) {
  // Resolve hub coordinates
  const hub = await Hub.findOne({ name: new RegExp(`^${locationName}$`, 'i') });
  if (!hub) throw new Error(`Hub not found: "${locationName}"`);

  // Fetch all places (small dataset — no need for geospatial index here)
  const places = await Place.find({});

  // Filter by radius and compute score
  const nearby = places
    .map((place) => {
      const distanceKm = parseFloat(
        haversineKm(hub.latitude, hub.longitude, place.latitude, place.longitude).toFixed(2)
      );
      return { place, distanceKm };
    })
    .filter(({ distanceKm }) => distanceKm <= SEARCH_RADIUS_KM)
    .map(({ place, distanceKm }) => ({
      name: place.name,
      category: place.category,
      distanceKm,
      popularityScore: place.popularityScore,
      entryFee: place.entryFee,
      description: place.description || '',
      score: parseFloat((place.popularityScore - distanceKm * DISTANCE_PENALTY).toFixed(3)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  return nearby;
}

module.exports = { getRecommendations };
