const GENERIC_LANDMARKS = [
  { name: "Entoto Natural Park", distanceKm: 5.2, category: "Park", icon: "🌿" },
  { name: "National Museum of Ethiopia", distanceKm: 3.1, category: "Museum", icon: "🏛️" },
  { name: "Merkato Market", distanceKm: 2.8, category: "Market", icon: "🛒" },
];

const recommendations = {
  kality: [
    { name: "Kality Market", distanceKm: 0.3, category: "Market", icon: "🛒" },
    { name: "Kality Park", distanceKm: 0.8, category: "Park", icon: "🌿" },
    { name: "Kality Restaurant", distanceKm: 0.5, category: "Restaurant", icon: "🍽️" },
    { name: "Kality Hotel", distanceKm: 1.1, category: "Hotel", icon: "🏨" },
  ],
  megenagna: [
    { name: "Friendship Park", distanceKm: 0.4, category: "Park", icon: "🌿" },
    { name: "Megenagna Mall", distanceKm: 0.2, category: "Market", icon: "🛒" },
    { name: "Yod Abyssinia Restaurant", distanceKm: 0.6, category: "Restaurant", icon: "🍽️" },
    { name: "National Museum of Ethiopia", distanceKm: 2.1, category: "Museum", icon: "🏛️" },
    { name: "Megenagna Skylight Hotel", distanceKm: 0.9, category: "Hotel", icon: "🏨" },
  ],
  sarbet: [
    { name: "Sarbet Square Restaurant", distanceKm: 0.3, category: "Restaurant", icon: "🍽️" },
    { name: "Sarbet Park", distanceKm: 0.7, category: "Park", icon: "🌿" },
    { name: "Sarbet Market", distanceKm: 0.5, category: "Market", icon: "🛒" },
    { name: "Sarbet Guest House", distanceKm: 0.4, category: "Hotel", icon: "🏨" },
  ],
  bole: [
    { name: "Bole International Hotel", distanceKm: 0.5, category: "Hotel", icon: "🏨" },
    { name: "Bole Coffee House", distanceKm: 0.3, category: "Restaurant", icon: "🍽️" },
    { name: "Edna Mall", distanceKm: 0.8, category: "Market", icon: "🛒" },
    { name: "Bole Park", distanceKm: 1.0, category: "Park", icon: "🌿" },
    { name: "Ethiopian Aviation Museum", distanceKm: 1.5, category: "Museum", icon: "🏛️" },
  ],
  piassa: [
    { name: "Piassa Market", distanceKm: 0.2, category: "Market", icon: "🛒" },
    { name: "St. George Cathedral Museum", distanceKm: 0.4, category: "Museum", icon: "🏛️" },
    { name: "Taitu Hotel", distanceKm: 0.3, category: "Hotel", icon: "🏨" },
    { name: "Piassa Restaurant", distanceKm: 0.5, category: "Restaurant", icon: "🍽️" },
    { name: "Piassa Cultural Park", distanceKm: 0.9, category: "Park", icon: "🌿" },
  ],
  merkato: [
    { name: "Merkato Open Market", distanceKm: 0.1, category: "Market", icon: "🛒" },
    { name: "Merkato Restaurant Row", distanceKm: 0.3, category: "Restaurant", icon: "🍽️" },
    { name: "Addis Merkato Hotel", distanceKm: 0.6, category: "Hotel", icon: "🏨" },
    { name: "Merkato Heritage Museum", distanceKm: 0.8, category: "Museum", icon: "🏛️" },
    { name: "Merkato Community Park", distanceKm: 1.2, category: "Park", icon: "🌿" },
  ],
  kazanchis: [
    { name: "Kazanchis Business Hotel", distanceKm: 0.4, category: "Hotel", icon: "🏨" },
    { name: "Kazanchis Restaurant", distanceKm: 0.3, category: "Restaurant", icon: "🍽️" },
    { name: "Kazanchis Park", distanceKm: 0.7, category: "Park", icon: "🌿" },
    { name: "Kazanchis Craft Market", distanceKm: 0.5, category: "Market", icon: "🛒" },
  ],
  mexico: [
    { name: "Mexico Square Market", distanceKm: 0.2, category: "Market", icon: "🛒" },
    { name: "Mexico Restaurant", distanceKm: 0.4, category: "Restaurant", icon: "🍽️" },
    { name: "Mexico Park", distanceKm: 0.6, category: "Park", icon: "🌿" },
    { name: "Mexico Plaza Hotel", distanceKm: 0.5, category: "Hotel", icon: "🏨" },
    { name: "Addis Ababa Museum", distanceKm: 1.3, category: "Museum", icon: "🏛️" },
  ],
  arat_kilo: [
    { name: "Arat Kilo Market", distanceKm: 0.3, category: "Market", icon: "🛒" },
    { name: "Addis Ababa University Museum", distanceKm: 0.5, category: "Museum", icon: "🏛️" },
    { name: "Arat Kilo Restaurant", distanceKm: 0.4, category: "Restaurant", icon: "🍽️" },
    { name: "Arat Kilo Park", distanceKm: 0.8, category: "Park", icon: "🌿" },
    { name: "Arat Kilo Guest Hotel", distanceKm: 0.6, category: "Hotel", icon: "🏨" },
  ],
  lebu: [
    { name: "Lebu Market", distanceKm: 0.2, category: "Market", icon: "🛒" },
    { name: "Lebu Park", distanceKm: 0.6, category: "Park", icon: "🌿" },
    { name: "Lebu Restaurant", distanceKm: 0.4, category: "Restaurant", icon: "🍽️" },
    { name: "Lebu Community Hotel", distanceKm: 0.7, category: "Hotel", icon: "🏨" },
  ],
};

/**
 * Returns place recommendations near a given hub.
 * @param {{ id: string }} destinationHub - Hub object with an `id` field
 * @param {number} count - Number of recommendations to return (default 3)
 * @returns {{ name: string, distanceKm: number, category: string, icon: string }[]}
 */
export function getRecommendations(destinationHub, count = 3) {
  const places = recommendations[destinationHub?.id] ?? [];
  const result = places.slice(0, count);

  if (result.length < count) {
    const needed = count - result.length;
    const padding = GENERIC_LANDMARKS.slice(0, needed);
    return [...result, ...padding];
  }

  return result;
}
