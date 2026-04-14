import { useEffect, useRef } from 'react';
import TransportCard from './TransportCard';
import RecommendationCard from './RecommendationCard';

export default function ResultsPanel({ result, selectedMode, onSelectMode, onRecommendationClick }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (result && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  if (!result) return null;

  return (
    <div
      ref={panelRef}
      className="animate-slide-up fixed bottom-0 left-0 right-0 z-20 max-h-[70vh] overflow-y-auto rounded-t-2xl md:relative md:rounded-2xl bg-[#0F172A]/95 backdrop-blur-md border border-white/10"
    >
      {/* Drag handle — mobile only */}
      <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mt-3 mb-1 md:hidden" />

      {/* Section 1: Route Summary */}
      <div className="p-4 border-b border-white/10">
        <p className="text-lg font-semibold text-white">
          {result.origin.name} → {result.destination.name}
        </p>
        <p className="text-sm text-white/60 mt-0.5">{result.route.name}</p>
        <p className="text-sm text-white/50 mt-0.5">{result.route.distanceKm.toFixed(1)} km</p>
      </div>

      {/* Section 2: Transport Options */}
      <div className="p-4 border-b border-white/10">
        <p className="text-base font-semibold text-white mb-0.5">Choose Your Transport</p>
        <p className="text-xs text-white/50 mb-3">Select the option that works best for you</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.options.map((option) => (
            <TransportCard
              key={option.mode.id}
              option={option}
              isSelected={option.mode.id === selectedMode}
              onSelect={() => onSelectMode(option.mode.id)}
            />
          ))}
        </div>
      </div>

      {/* Section 3: Why This Route */}
      <div className="p-4 border-b border-white/10 bg-[#10B981]/5">
        <p className="text-base font-semibold text-white mb-2">💡 Why this route was chosen</p>
        <p className="text-sm text-white/70 leading-relaxed">{result.explanation}</p>
      </div>

      {/* Section 4: Next Destinations */}
      <div className="p-4">
        <p className="text-base font-semibold text-white mb-0.5">🗺️ Where to go next?</p>
        <p className="text-xs text-white/50 mb-3">Recommended places near your destination</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {result.recommendations.slice(0, 3).map((rec) => (
            <RecommendationCard
              key={rec.name}
              recommendation={rec}
              onSelect={onRecommendationClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
