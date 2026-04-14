export default function LoadingOverlay({ isVisible, message = 'Analyzing route...' }) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-10 h-10 border-4 border-white/20 border-t-[#2563EB] rounded-full animate-spin mb-3" />
      <p className="text-white/80 text-sm">{message}</p>
    </div>
  );
}
