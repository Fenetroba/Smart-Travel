/**
 * Route scoring helper.
 *
 * score = (time * 0.5) + (cost * 0.3) + (trafficFactor * 10) + transferPenalty
 *
 * Lower score = better route.
 *
 * @param {object} params
 * @param {number} params.time          - estimated travel time in minutes
 * @param {number} params.cost          - estimated cost in ETB
 * @param {number} params.trafficFactor - 0–1 traffic severity
 * @param {number} params.transfers     - number of hub transfers
 * @returns {number} composite score
 */
function scoreRoute({ time, cost, trafficFactor, transfers }) {
  const transferPenalty = transfers * 5; // 5-point penalty per transfer
  return time * 0.5 + cost * 0.3 + trafficFactor * 10 + transferPenalty;
}

/**
 * Generates a human-readable explanation for the chosen route.
 *
 * @param {object} best - the best-scored route option
 * @returns {string}
 */
function buildExplanation(best) {
  const parts = [];

  if (best.transfers === 0) {
    parts.push('direct route with no transfers');
  } else {
    parts.push(`route via ${best.transfers} hub${best.transfers > 1 ? 's' : ''}`);
  }

  parts.push(`estimated ${Math.round(best.time)} min travel time`);
  parts.push(`cost of ${Math.round(best.cost)} ETB`);

  return `Selected because it offers a ${parts.join(', ')}, balancing speed and affordability.`;
}

module.exports = { scoreRoute, buildExplanation };
