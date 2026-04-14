/**
 * Simulates a traffic multiplier based on the current hour.
 * Rush hours (7–9 AM and 5–7 PM) increase travel time.
 *
 * @param {Date} [now=new Date()] - optional date for testing
 * @returns {number} multiplier (1.0 = normal, up to 1.6 = heavy traffic)
 */
function getTrafficMultiplier(now = new Date()) {
  const hour = now.getHours();

  // Morning rush: 7–9 AM
  if (hour >= 7 && hour < 9) return 1.5;

  // Evening rush: 5–7 PM
  if (hour >= 17 && hour < 19) return 1.6;

  // Midday moderate: 11 AM – 1 PM
  if (hour >= 11 && hour < 13) return 1.2;

  // Late night: low traffic
  if (hour >= 22 || hour < 5) return 0.9;

  return 1.0;
}

/**
 * Returns a numeric traffic factor (0–1 scale) used in route scoring.
 * Higher = worse traffic.
 */
function getTrafficFactor(now = new Date()) {
  const multiplier = getTrafficMultiplier(now);
  // Normalise to 0–1 range (max multiplier is 1.6)
  return (multiplier - 0.9) / 0.7;
}

module.exports = { getTrafficMultiplier, getTrafficFactor };
