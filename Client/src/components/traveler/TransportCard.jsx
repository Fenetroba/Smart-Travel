export default function TransportCard({ option, isSelected, onSelect }) {
  const { mode, distanceKm, durationMin, price, isBest } = option;

  const ringClass = isBest
    ? 'ring-2 ring-[#10B981]'
    : isSelected
    ? 'ring-2 ring-[#2563EB]'
    : '';

  return (
    <div
      onClick={onSelect}
      className={`glass-card p-4 relative cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-xl ${ringClass}`}
    >
      {isBest && (
        <span className="absolute top-3 right-3 bg-[#10B981] text-white text-xs font-bold px-2 py-0.5 rounded-full">
          BEST OPTION
        </span>
      )}

      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{mode.icon}</span>
        <div>
          <p className="text-lg font-semibold">{mode.label}</p>
          <p className="text-sm text-white/60">{mode.description}</p>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <div>
          <p className="text-white/50 text-xs">💰 Price</p>
          <p className="font-medium">{price === 0 ? 'Free' : `${price.toFixed(0)} ETB`}</p>
        </div>
        <div>
          <p className="text-white/50 text-xs">⏱ Time</p>
          <p className="font-medium">{durationMin.toFixed(0)} min</p>
        </div>
        <div>
          <p className="text-white/50 text-xs">📏 Distance</p>
          <p className="font-medium">{distanceKm.toFixed(1)} km</p>
        </div>
      </div>
    </div>
  );
}
