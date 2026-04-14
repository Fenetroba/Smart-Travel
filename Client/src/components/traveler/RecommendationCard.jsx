export default function RecommendationCard({ recommendation, onSelect }) {
  const { name, distanceKm, category, icon } = recommendation;

  return (
    <div
      className="glass-card p-4 cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-xl hover:bg-white/10"
      onClick={() => onSelect(name)}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-semibold text-white">{name}</div>
      <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full">
        {category}
      </span>
      <div className="text-sm text-white/50 mt-1">
        {distanceKm.toFixed(1)} km away
      </div>
    </div>
  );
}
