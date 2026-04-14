import { useState } from "react";
import ValidationError from "../shared/ValidationError";

export default function LocationInputPanel({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onAnalyze,
  onGeoDetect,
  isAnalyzing,
  geoError,
  hubs = [],
}) {
  const [originError, setOriginError] = useState("");
  const [destinationError, setDestinationError] = useState("");

  function handleAnalyze() {
    const oErr = origin.trim() ? "" : "Origin is required";
    const dErr = destination.trim() ? "" : "Destination is required";
    setOriginError(oErr);
    setDestinationError(dErr);
    if (oErr || dErr) return;
    onAnalyze();
  }

  return (
    <div className="glass-card p-6 sticky bottom-4 md:static">
      <datalist id="hub-list">
        {hubs.map((hub) => (
          <option key={hub.id} value={hub.name} />
        ))}
      </datalist>

      {/* Origin */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">From</label>
        <div className="flex gap-2">
          <input
            type="text"
            list="hub-list"
            value={origin}
            onChange={(e) => onOriginChange(e.target.value)}
            placeholder="Enter origin"
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={onGeoDetect}
            title="Auto-detect location"
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            📍
          </button>
        </div>
        {originError && <ValidationError message={originError} />}
        {geoError && <ValidationError message={geoError} />}
      </div>

      {/* Destination */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">To</label>
        <input
          type="text"
          list="hub-list"
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
          placeholder="Enter destination"
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {destinationError && <ValidationError message={destinationError} />}
      </div>

      {/* Analyze button */}
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl w-full transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          "Analyze Route"
        )}
      </button>
    </div>
  );
}
