const transportModes = [
  {
    id: "taxi",
    label: "Taxi",
    pricePerKm: 15,
    speedKmh: 35,
    description: "Fast, expensive",
    icon: "🚖",
  },
  {
    id: "bus",
    label: "Bus",
    pricePerKm: 2,
    speedKmh: 20,
    description: "Cheap, slow",
    icon: "🚌",
  },
  {
    id: "walk",
    label: "Walk",
    pricePerKm: 0,
    speedKmh: 5,
    description: "Free, very slow",
    icon: "🚶",
  },
];

export default transportModes;
