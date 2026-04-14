const floatingDots = [
  { size: 80, top: '10%', left: '5%', delay: '0s', duration: '6s' },
  { size: 120, top: '60%', left: '85%', delay: '2s', duration: '8s' },
  { size: 50, top: '75%', left: '15%', delay: '1s', duration: '7s' },
  { size: 90, top: '20%', left: '75%', delay: '3s', duration: '9s' },
];

const floatKeyframes = `
  @keyframes floatDot {
    0%, 100% { transform: translateY(0px) scale(1); opacity: 0.15; }
    50% { transform: translateY(-20px) scale(1.05); opacity: 0.25; }
  }
`;

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 px-4 text-center bg-gradient-to-br from-[#0f2a11] via-[#1E3A5F] to-[#0F172A]">
      <style>{floatKeyframes}</style>

      {/* Floating background dots */}
      {floatingDots.map((dot, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: dot.size,
            height: dot.size,
            top: dot.top,
            left: dot.left,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, rgba(37,99,235,0) 70%)',
            animation: `floatDot ${dot.duration} ease-in-out ${dot.delay} infinite`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full backdrop-blur-md bg-white/1 border border-white/10 text-sm text-slate-300">
          🗺️ AI-Powered Travel Assistant
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
          Find the{' '}
          <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Smartest Route
          </span>{' '}
          in Addis Ababa
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-400">
          Compare transport, cost, and time instantly
        </p>
      </div>
    </section>
  );
}
