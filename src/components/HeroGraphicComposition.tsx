import React from 'react';

/**
 * HeroGraphicComposition
 * 
 * Custom visual identity graphic composition for the LEVELUP hero section.
 * Inspired by high-end creative-agency branding:
 * - Bold green background container (#26422e to #1e3624)
 * - Central dark-green graphic panel (#0c1910 / #102216)
 * - Large architectural geometric shapes (stepped ascension staircase, 45° growth chevrons, concentric graduation arcs)
 * - Minimal Swiss typography with strong visual contrast
 * - Authentic LEVELUP product integration via floating micro-telemetry cards
 * - Subtle, high-performance ambient floating animations
 */
export const HeroGraphicComposition: React.FC = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-10 sm:mt-14 select-none">
      {/* Soft ambient atmospheric glow beneath the composition */}
      <div
        className="absolute -inset-2 sm:-inset-4 bg-gradient-to-b from-[#26422e]/25 via-[#3d5a44]/15 to-transparent rounded-[36px] blur-2xl opacity-80 pointer-events-none"
        aria-hidden="true"
      />

      {/* 1. BOLD GREEN BACKGROUND CONTAINER (Agency Frame) */}
      <div className="relative bg-[#203927] border-2 border-[#2f5238] rounded-2xl sm:rounded-[32px] p-3 sm:p-5 lg:p-7 shadow-2xl overflow-hidden text-[#faf9f6]">
        
        {/* Subtle geometric agency corner crosshairs & coordinates */}
        <div className="absolute top-3 left-4 text-[10px] font-mono text-[#aecfb3]/60 tracking-wider hidden sm:block">
          + 001 // LEVELUP SYSTEM
        </div>
        <div className="absolute top-3 right-4 text-[10px] font-mono text-[#aecfb3]/60 tracking-wider hidden sm:block">
          SCALE: 1:1 · CORE
        </div>
        <div className="absolute bottom-3 left-4 text-[10px] font-mono text-[#aecfb3]/40 tracking-wider hidden sm:block">
          4 PILLARS // INTEGRATED
        </div>
        <div className="absolute bottom-3 right-4 text-[10px] font-mono text-[#aecfb3]/40 tracking-wider hidden sm:block">
          SYS // OPTIMAL
        </div>

        {/* 2. CENTRAL DARK-GREEN GRAPHIC PANEL */}
        <div className="relative bg-[#0b170e] border border-[#213a27] rounded-xl sm:rounded-2xl shadow-inner overflow-hidden">
          
          {/* Top Panel Terminal / Monospace Bar */}
          <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-[#1a3220] bg-[#071009]/80 backdrop-blur-md text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#26422e] border border-[#3d5a44]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#1b3223]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#14261a]" />
              </div>
              <span className="text-[#caebce] font-semibold text-[11px] sm:text-xs tracking-wider uppercase ml-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#caebce] animate-pulse" />
                <span>LEVELUP // UNIFIED OPERATING SYSTEM</span>
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
              <span className="hidden md:inline text-[#727972] tracking-widest uppercase">
                FITNESS · NUTRITION · CAREER · FOCUS
              </span>
              <span className="px-2 py-0.5 rounded bg-[#1e3826] border border-[#31563c] text-[#caebce] font-semibold">
                ACTIVE PIPELINE
              </span>
            </div>
          </div>

          {/* Canvas Area: Large Geometric Shapes + Dashboard Previews */}
          <div className="relative px-4 sm:px-8 py-8 sm:py-14 min-h-[500px] sm:min-h-[560px] flex flex-col justify-between overflow-hidden">
            
            {/* LARGE GEOMETRIC SHAPES BACKDROP */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
              
              {/* Geometric Agency Grid */}
              <svg
                className="absolute inset-0 w-full h-full opacity-20"
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
              >
                <defs>
                  <pattern id="agency-hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                    <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#caebce" strokeWidth="0.6" strokeDasharray="2 4" />
                    <circle cx="48" cy="48" r="1.2" fill="#caebce" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#agency-hero-grid)" />
              </svg>

              {/* Central Architectural Ascending Staircase & Large Geometric Shapes */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] flex items-center justify-center">
                
                {/* Large Concentric Calibration Rings */}
                <div className="absolute w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full border border-[#1b3422]/60 flex items-center justify-center">
                  <div className="w-[240px] sm:w-[380px] h-[240px] sm:h-[380px] rounded-full border border-dashed border-[#294c32]/50" />
                </div>

                {/* Ascending Geometric Staircase & Chevron Vectors SVG */}
                <svg
                  viewBox="0 0 500 500"
                  className="w-full h-full opacity-70"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="stair1" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#142618" />
                      <stop offset="100%" stopColor="#1b3422" />
                    </linearGradient>
                    <linearGradient id="stair2" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#1c3724" />
                      <stop offset="100%" stopColor="#254a30" />
                    </linearGradient>
                    <linearGradient id="stair3" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#285235" />
                      <stop offset="100%" stopColor="#356a45" />
                    </linearGradient>
                    <linearGradient id="stair4" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3e7a50" />
                      <stop offset="100%" stopColor="#55996b" />
                    </linearGradient>
                  </defs>

                  {/* Level 01: Baseline Block */}
                  <polygon
                    points="70,400 160,400 160,340 70,340"
                    fill="url(#stair1)"
                    stroke="#23422a"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="70,340 160,340 190,310 100,310"
                    fill="#1e3a26"
                    stroke="#2b5034"
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <text x="80" y="375" fill="#727972" fontSize="10" fontFamily="monospace" letterSpacing="1">
                    01 BASELINE
                  </text>

                  {/* Level 02: Momentum Block */}
                  <polygon
                    points="160,340 250,340 250,260 160,260"
                    fill="url(#stair2)"
                    stroke="#2e5437"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="160,260 250,260 280,230 190,230"
                    fill="#2a5033"
                    stroke="#3d6c48"
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <text x="170" y="305" fill="#aecfb3" fontSize="10" fontFamily="monospace" letterSpacing="1">
                    02 MOMENTUM
                  </text>

                  {/* Level 03: Overload Block */}
                  <polygon
                    points="250,260 340,260 340,170 250,170"
                    fill="url(#stair3)"
                    stroke="#3e6f49"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="250,170 340,170 370,140 280,140"
                    fill="#396c46"
                    stroke="#4e8c5d"
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <text x="260" y="220" fill="#caebce" fontSize="10" fontFamily="monospace" letterSpacing="1">
                    03 OVERLOAD
                  </text>

                  {/* Level 04: Zenith / LevelUp Monolith */}
                  <polygon
                    points="340,170 430,170 430,70 340,70"
                    fill="url(#stair4)"
                    stroke="#caebce"
                    strokeWidth="2"
                  />
                  <polygon
                    points="340,70 430,70 460,40 370,40"
                    fill="#62aa7a"
                    stroke="#caebce"
                    strokeWidth="1.5"
                  />
                  <text x="350" y="125" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
                    04 LEVELUP
                  </text>

                  {/* Dynamic Trajectory Vector Arrow with Gradient */}
                  <path
                    d="M 60,420 L 160,340 L 250,260 L 340,170 L 440,55"
                    stroke="#caebce"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                  />
                  {/* Glowing Arrowhead / Zenith Coordinates */}
                  <circle cx="440" cy="55" r="6" fill="#caebce" />
                  <circle cx="440" cy="55" r="12" stroke="#caebce" strokeWidth="1.5" opacity="0.5" />
                  <circle cx="440" cy="55" r="18" stroke="#caebce" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.3" />
                </svg>
              </div>

              {/* Radial Core Glow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-[#26422e]/40 rounded-full blur-[80px] pointer-events-none" />
            </div>

            {/* PRODUCT INTEGRATION: FLOATING TELEMETRY CARDS */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
              
              {/* Left Column: Fitness & Nutrition Telemetry */}
              <div className="md:col-span-4 flex flex-col gap-3.5 sm:gap-5">
                
                {/* 1. Fitness Card (Floating) */}
                <div
                  className="bg-[#122416]/95 backdrop-blur-md border border-[#26492e] rounded-xl sm:rounded-2xl p-4 shadow-2xl hover:border-[#3e724a] transition-all transform hover:-translate-y-1"
                  style={{ animation: 'floatSlow 7s ease-in-out infinite' }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#1e3c25] border border-[#2d5836] flex items-center justify-center text-[#caebce]">
                        <span className="material-symbols-outlined text-[17px]">fitness_center</span>
                      </span>
                      <span className="text-xs font-semibold text-white tracking-wide">Workout Routine</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#caebce] bg-[#1a3521] border border-[#2b5435] px-2 py-0.5 rounded-full">
                      5-DAY STREAK 🔥
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#1d3923] flex items-baseline justify-between">
                    <div>
                      <p className="text-base sm:text-lg font-bold text-white tracking-tight">82.5 kg Bench</p>
                      <p className="text-xs text-[#aecfb3] font-normal">4 sets × 8 reps</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#caebce] bg-[#22442a] px-2 py-1 rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>
                      +2.5 kg PR
                    </span>
                  </div>

                  {/* Volume Overload Progression Indicator */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-mono text-[#727972] mb-1">
                      <span>PROGRESSIVE OVERLOAD</span>
                      <span className="text-[#caebce]">100% TARGET</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 h-1.5">
                      <div className="rounded bg-[#203f27]" />
                      <div className="rounded bg-[#254d30]" />
                      <div className="rounded bg-[#2d5c3a]" />
                      <div className="rounded bg-[#387349]" />
                      <div className="rounded bg-[#caebce] shadow-[0_0_8px_#caebce]" />
                    </div>
                  </div>
                </div>

                {/* 2. Nutrition Card (Floating Delayed) */}
                <div
                  className="bg-[#122416]/95 backdrop-blur-md border border-[#26492e] rounded-xl sm:rounded-2xl p-4 shadow-2xl hover:border-[#3e724a] transition-all transform hover:-translate-y-1"
                  style={{ animation: 'floatSlowDelayed 8s ease-in-out infinite' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#1e3c25] border border-[#2d5836] flex items-center justify-center text-[#caebce]">
                        <span className="material-symbols-outlined text-[17px]">restaurant</span>
                      </span>
                      <span className="text-xs font-semibold text-white tracking-wide">Daily Nutrition</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#caebce]">91%</span>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-sm font-bold text-white">145g <span className="text-xs text-[#727972] font-normal">/ 160g protein</span></span>
                      <span className="text-[11px] text-[#aecfb3] font-mono">2,240 / 2,400 kcal</span>
                    </div>
                    <div className="w-full bg-[#172e1c] h-2 rounded-full mt-2 overflow-hidden border border-[#214128]">
                      <div className="bg-gradient-to-r from-[#3d7a4f] to-[#caebce] h-full rounded-full transition-all duration-700" style={{ width: '91%' }} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Center: Hero Identity Focal Badge */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center my-6 md:my-0 py-2">
                <div className="relative group cursor-default">
                  {/* Subtle Aura */}
                  <div className="absolute -inset-4 bg-[#caebce]/20 rounded-full blur-xl animate-pulse" />
                  
                  {/* Geometric Octagon / Rounded Emblem */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#25472e] via-[#152a1b] to-[#0c1810] border-2 border-[#caebce] shadow-[0_0_30px_rgba(202,235,206,0.25)] flex flex-col items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
                    <span className="material-symbols-outlined text-4xl sm:text-5xl text-[#caebce] drop-shadow-[0_2px_10px_rgba(202,235,206,0.4)]">
                      stat_3
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-[#caebce] font-bold uppercase mt-1">
                      LEVELUP
                    </span>
                  </div>
                </div>

                {/* Agency Minimalist Micro-Typography */}
                <div className="mt-5">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#aecfb3] uppercase block font-semibold">
                    GROWTH ARCHITECTURE
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                    Compound Progress
                  </h3>
                  <p className="text-xs text-[#aecfb3]/85 max-w-[240px] mx-auto mt-1.5 leading-relaxed font-sans">
                    Fitness, nutrition, career, and productivity unified into one daily rhythm.
                  </p>
                </div>
              </div>

              {/* Right Column: Career & Focus Telemetry */}
              <div className="md:col-span-4 flex flex-col gap-3.5 sm:gap-5">
                
                {/* 3. Career Card (Floating Delayed) */}
                <div
                  className="bg-[#122416]/95 backdrop-blur-md border border-[#26492e] rounded-xl sm:rounded-2xl p-4 shadow-2xl hover:border-[#3e724a] transition-all transform hover:-translate-y-1"
                  style={{ animation: 'floatSlowDelayed 7.5s ease-in-out infinite' }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#1e3c25] border border-[#2d5836] flex items-center justify-center text-[#caebce]">
                        <span className="material-symbols-outlined text-[17px]">business_center</span>
                      </span>
                      <span className="text-xs font-semibold text-white tracking-wide">Career Pipeline</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#caebce] bg-[#1a3521] border border-[#2b5435] px-2 py-0.5 rounded-full">
                      ATS 94%
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#1d3923]">
                    <p className="text-sm font-bold text-white truncate">12 Applications Active</p>
                    <p className="text-xs text-[#aecfb3] mt-0.5">2 upcoming interviews scheduled</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#727972] mt-3 pt-2 border-t border-[#172e1c]">
                    <span>STATUS: INTERVIEW STAGE</span>
                    <span className="text-[#caebce] font-semibold">HIGH MATCH</span>
                  </div>
                </div>

                {/* 4. Focus & Planner Card (Floating) */}
                <div
                  className="bg-[#122416]/95 backdrop-blur-md border border-[#26492e] rounded-xl sm:rounded-2xl p-4 shadow-2xl hover:border-[#3e724a] transition-all transform hover:-translate-y-1"
                  style={{ animation: 'floatSlow 6.5s ease-in-out infinite' }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#1e3c25] border border-[#2d5836] flex items-center justify-center text-[#caebce]">
                        <span className="material-symbols-outlined text-[17px]">schedule</span>
                      </span>
                      <span className="text-xs font-semibold text-white tracking-wide">Time-Block Focus</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#caebce] bg-[#1a3521] border border-[#2b5435] px-2 py-0.5 rounded-full">
                      FLOW STATE
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#1d3923] flex items-baseline justify-between">
                    <div>
                      <p className="text-base sm:text-lg font-bold text-white tracking-tight">4.5 Hours</p>
                      <p className="text-xs text-[#aecfb3]">Deep work completed today</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#caebce]">3/3 TASKS</span>
                  </div>

                  <div className="w-full bg-[#172e1c] h-2 rounded-full mt-2.5 overflow-hidden border border-[#214128]">
                    <div className="bg-[#aecfb3] h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

              </div>

            </div>

            {/* INTEGRATED BOTTOM METRIC STRIP */}
            <div className="relative z-10 mt-8 sm:mt-10 pt-4 border-t border-[#1a3220] bg-[#071009]/70 -mx-4 sm:-mx-8 -mb-8 sm:-mb-14 px-4 sm:px-8 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                <span className="text-[#727972] text-[11px]">01 // FITNESS</span>
                <span className="text-[#caebce] font-semibold text-[11px]">92% OVERLOAD</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                <span className="text-[#727972] text-[11px]">02 // NUTRITION</span>
                <span className="text-[#caebce] font-semibold text-[11px]">145G PROTEIN</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                <span className="text-[#727972] text-[11px]">03 // CAREER</span>
                <span className="text-[#caebce] font-semibold text-[11px]">2 INTERVIEWS</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                <span className="text-[#727972] text-[11px]">04 // FOCUS</span>
                <span className="text-[#caebce] font-semibold text-[11px]">4.5H LOGGED</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
