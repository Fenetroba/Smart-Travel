/**
 * Transport Calculation Service
 *
 * Computes cost and travel time for each transport mode
 * given a distance in kilometres.
 */

const Transport = require('../models/Transport');
const { getTrafficMultiplier } = require('../utils/traffic');

/**
 * Analyse all transport modes for a given distance.
 *
 * @param {number} distanceKm
 * @returns {Promise<Array>} array of { type, cost, timeMin, label, description }
 */
async function analyzeTransport(distanceKm) {
  if (!distanceKm || distanceKm <= 0) {
    throw new Error('Distance must be a positive number');
  }

  const modes = await Transport.find({});
  if (!modes.length) {
    throw new Error('No transport modes configured. Run the seed script first.');
  }

  const trafficMultiplier = getTrafficMultiplier();

  return modes.map((mode) => {
    const cost = mode.type === 'walk' ? 0 : parseFloat((mode.pricePerKm * distanceKm).toFixed(2));

    // Apply traffic multiplier to travel time
    const baseTimeHours = distanceKm / mode.speedKmPerHour;
    const timeMin = parseFloat((baseTimeHours * 60 * trafficMultiplier).toFixed(1));

    return {
      type: mode.type,
      label: mode.label || mode.type,
      description: mode.description || '',
      cost,
      timeMin,
      pricePerKm: mode.pricePerKm,
      speedKmPerHour: mode.speedKmPerHour,
    };
  });
}

/**
 * Get a single transport mode's cost and time.
 *
 * @param {string} type - 'taxi' | 'bus' | 'walk'
 * @param {number} distanceKm
 * @returns {Promise<object>}
 */
async function getTransportOption(type, distanceKm) {
  const mode = await Transport.findOne({ type });
  if (!mode) throw new Error(`Transport type '${type}' not found`);

  const trafficMultiplier = getTrafficMultiplier();
  const cost = type === 'walk' ? 0 : parseFloat((mode.pricePerKm * distanceKm).toFixed(2));
  const timeMin = parseFloat(((distanceKm / mode.speedKmPerHour) * 60 * trafficMultiplier).toFixed(1));

  return { type, cost, timeMin };
}

module.exports = { analyzeTransport, getTransportOption };
