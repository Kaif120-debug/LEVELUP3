import React from 'react';

export const VerticalFeatureStory: React.FC = () => {
  return (
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto border-t border-[#E8E9E2] scroll-mt-20">
      
      {/* SECTION HEADER: Creative, Minimal, Oversized Typography */}
      <div className="text-center max-w-3xl mx-auto mb-20 sm:mb-28">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E8E9E2] text-xs font-semibold uppercase tracking-wider text-[#F28A4B] mb-5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F28A4B]" />
          <span>The Vertical Progression Story</span>
        </div>
        
        <h2 className="text-3xl sm:text-5xl lg:text-[56px] font-extrabold text-[#1C211D] tracking-tight leading-[1.08] mb-5">
          <span>One Workspace.</span>
          <span className="block text-[#234B36] mt-1">Every Part of Your Life.</span>
        </h2>
        
        <p className="text-base sm:text-lg text-[#6D756E] max-w-xl mx-auto leading-relaxed font-normal">
          No horizontal scrolling, no hidden cards. Explore all five pillars naturally as you scroll down—each designed to keep your momentum moving forward.
        </p>
      </div>

      {/* VERTICAL STORY STEPS: 5 Distinct Editorial Compositions */}
      <div className="space-y-24 sm:space-y-36">

        {/* ============================================================== */}
        {/* STEP 01 — FITNESS: Left Headline, Right Abstract Green 3D Visual */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left: Typography & Value Proposition */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#234B36] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#55B978]" />
              <span>Step 01 — Fitness</span>
            </div>
            
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C211D] tracking-tight leading-[1.12] mb-4">
              Build Your Stronger Self.
            </h3>
            
            <p className="text-base sm:text-lg text-[#4E564F] leading-relaxed mb-6 max-w-lg">
              Track workouts, exercises, sets, reps, body measurements, and weight progress without clunky gym notebooks.
            </p>

            <ul className="space-y-2.5 text-sm font-medium text-[#234B36]">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#DDF3E4] text-[#234B36] flex items-center justify-center text-xs font-bold">✓</span>
                Evidence-based PPL, Upper/Lower, and custom weekly splits
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#DDF3E4] text-[#234B36] flex items-center justify-center text-xs font-bold">✓</span>
                Live set logging with working weight, rep targets, and rest timers
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#DDF3E4] text-[#234B36] flex items-center justify-center text-xs font-bold">✓</span>
                Progressive overload verification so you never plateau
              </li>
            </ul>
          </div>

          {/* Right: Abstract Green 3D Gradient Sphere with Subtle Interface Element */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* Ambient Green Radial Light */}
            <div className="absolute w-[280px] h-[280px] bg-[#55B978]/25 rounded-full blur-[70px] pointer-events-none -z-10" />

            <div className="w-full max-w-[420px] bg-[#FFFFFF] border border-[#E8E9E2] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              {/* Floating Green 3D Sphere in Top Corner */}
              <div
                className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #85E1A5 0%, #55B978 45%, #234B36 85%, #0E2417 100%)',
                  boxShadow: 'inset -6px -8px 18px rgba(14, 36, 23, 0.5), inset 5px 6px 12px rgba(255, 255, 255, 0.7), 0 16px 28px rgba(35, 75, 54, 0.22)',
                }}
              />
              
              {/* Small Orange Geometric Accent */}
              <div
                className="absolute top-16 right-24 w-6 h-6 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #FFA86E, #F28A4B, #9E3D12)',
                  boxShadow: '0 4px 10px rgba(242, 138, 75, 0.3)',
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#DDF3E4] text-[#234B36] flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">fitness_center</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1C211D]">Push Split · Day A</div>
                      <div className="text-[11px] text-[#6D756E]">Upper Body Strength</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#DDF3E4] text-[#234B36] text-[11px] font-semibold">
                    +2.5 kg PR
                  </span>
                </div>

                {/* Workout Exercise Preview */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F2] border border-[#E8E9E2]">
                    <span className="text-xs font-semibold text-[#1C211D]">Barbell Bench Press</span>
                    <span className="text-xs font-mono font-medium text-[#234B36]">82.5 kg × 4 sets</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F2] border border-[#E8E9E2]">
                    <span className="text-xs font-semibold text-[#1C211D]">Incline Dumbbell Press</span>
                    <span className="text-xs font-mono font-medium text-[#234B36]">28 kg × 3 sets</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F2] border border-[#E8E9E2]">
                    <span className="text-xs font-semibold text-[#1C211D]">Overhead Press (OHP)</span>
                    <span className="text-xs font-mono font-medium text-[#234B36]">50 kg × 3 sets</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E9E2] flex items-center justify-between text-xs text-[#6D756E]">
                  <span>Rest timer: 90s</span>
                  <span className="text-[#234B36] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">trending_up</span> 12-Day Streak
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* STEP 02 — NUTRITION: Left Visual & Macro Ring, Right Headline */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left: Soft Orange & Green 3D Gradient Shapes + Nutrition Snapshot */}
          <div className="lg:col-span-6 order-2 lg:order-1 relative flex justify-center items-center">
            {/* Ambient Orange Radial Light */}
            <div className="absolute w-[280px] h-[280px] bg-[#F28A4B]/20 rounded-full blur-[70px] pointer-events-none -z-10" />

            <div className="w-full max-w-[420px] bg-[#FFFFFF] border border-[#E8E9E2] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              {/* Floating Orange 3D Sphere */}
              <div
                className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #FFA86E 0%, #F28A4B 45%, #D66127 80%, #9E3D12 100%)',
                  boxShadow: 'inset -6px -8px 20px rgba(158, 61, 18, 0.45), inset 6px 7px 14px rgba(255, 255, 255, 0.7), 0 16px 30px rgba(242, 138, 75, 0.25)',
                }}
              />
              
              {/* Floating Green Accent Sphere */}
              <div
                className="absolute top-4 left-6 w-8 h-8 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #85E1A5, #55B978, #234B36)',
                  boxShadow: '0 4px 10px rgba(35, 75, 54, 0.25)',
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FFE1CC] text-[#F28A4B] flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">restaurant</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1C211D]">Daily Protein Goal</div>
                      <div className="text-[11px] text-[#6D756E]">Muscle Recovery Target</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#FFE1CC] text-[#F28A4B] text-[11px] font-semibold">
                    91% Completed
                  </span>
                </div>

                {/* Progress Bar & Numerical Target */}
                <div className="mb-5">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl font-extrabold text-[#1C211D]">145g <span className="text-xs font-normal text-[#6D756E]">/ 160g target</span></span>
                    <span className="text-xs font-semibold text-[#F28A4B]">15g remaining</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F8F7F2] rounded-full overflow-hidden border border-[#E8E9E2]">
                    <div className="h-full bg-gradient-to-r from-[#F28A4B] to-[#EE6422] rounded-full w-[91%]" />
                  </div>
                </div>

                {/* Macro Breakdown Chips */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#E8E9E2]">
                    <div className="text-[10px] font-semibold text-[#6D756E]">Calories</div>
                    <div className="text-xs font-bold text-[#1C211D] mt-0.5">2,150 kcal</div>
                    <div className="text-[9px] text-[#55B978] font-medium">Deficit Met</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#E8E9E2]">
                    <div className="text-[10px] font-semibold text-[#6D756E]">Carbs</div>
                    <div className="text-xs font-bold text-[#1C211D] mt-0.5">220g</div>
                    <div className="text-[9px] text-[#6D756E]">Fuel Target</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#E8E9E2]">
                    <div className="text-[10px] font-semibold text-[#6D756E]">Fats</div>
                    <div className="text-xs font-bold text-[#1C211D] mt-0.5">58g</div>
                    <div className="text-[9px] text-[#6D756E]">Balanced</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Typography & Value Proposition */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#F28A4B] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#F28A4B]" />
              <span>Step 02 — Nutrition</span>
            </div>
            
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C211D] tracking-tight leading-[1.12] mb-4">
              Fuel Your Progress.
            </h3>
            
            <p className="text-base sm:text-lg text-[#4E564F] leading-relaxed mb-6 max-w-lg">
              Track calories, protein, carbohydrates, fats, meals, food quantities, and nutrition goals tailored to your metabolic rate.
            </p>

            <ul className="space-y-2.5 text-sm font-medium text-[#234B36]">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFE1CC] text-[#F28A4B] flex items-center justify-center text-xs font-bold">✓</span>
                Real-time daily protein countdown for optimal recovery
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFE1CC] text-[#F28A4B] flex items-center justify-center text-xs font-bold">✓</span>
                Targeted deficit or surplus calculations matched to your body goals
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFE1CC] text-[#F28A4B] flex items-center justify-center text-xs font-bold">✓</span>
                Ingredient quantities and grocery lists for clean meal planning
              </li>
            </ul>
          </div>

        </div>

        {/* ============================================================== */}
        {/* STEP 03 — CAREER: Wide Editorial Layout with Subtle Green 3D */}
        {/* ============================================================== */}
        <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-3xl p-8 sm:p-12 lg:p-14 shadow-xs relative overflow-hidden">
          {/* Subtle 3D Ambient Gradient in Background */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#DDF3E4]/50 via-[#FFE1CC]/25 to-transparent rounded-full blur-[80px] pointer-events-none -z-10" />
          
          <div className="max-w-3xl mb-10 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#234B36] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#55B978]" />
              <span>Step 03 — Career Development</span>
            </div>

            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C211D] tracking-tight leading-[1.12] mb-4">
              Build Your Future.
            </h3>

            <p className="text-base sm:text-lg text-[#4E564F] leading-relaxed max-w-2xl">
              Manage your resume, portfolio, career preparation, interview practice, and job applications in one dedicated career hub.
            </p>
          </div>

          {/* Three Career Capability Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-[#F8F7F2] border border-[#E8E9E2] hover:border-[#55B978]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#DDF3E4] text-[#234B36] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl">description</span>
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-base font-bold text-[#1C211D]">ATS Resume Builder</h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DDF3E4] text-[#234B36]">94% Match</span>
              </div>
              <p className="text-xs sm:text-sm text-[#6D756E] leading-relaxed">
                Google XYZ bullet optimization, clean recruiter templates, and instant high-res PDF downloads.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F7F2] border border-[#E8E9E2] hover:border-[#F28A4B]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FFE1CC] text-[#F28A4B] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl">view_kanban</span>
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-base font-bold text-[#1C211D]">Application Pipeline</h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFE1CC] text-[#F28A4B]">12 Tracked</span>
              </div>
              <p className="text-xs sm:text-sm text-[#6D756E] leading-relaxed">
                Visual Kanban board tracking jobs from Saved and Applied through to Interview and Offer stages.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F7F2] border border-[#E8E9E2] hover:border-[#55B978]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#DDF3E4] text-[#234B36] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl">language</span>
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-base font-bold text-[#1C211D]">Live Portfolio</h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DDF3E4] text-[#234B36]">Shareable URL</span>
              </div>
              <p className="text-xs sm:text-sm text-[#6D756E] leading-relaxed">
                Showcase case studies and projects with 6 curated design themes and a custom public link.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* STEP 04 — PERSONAL FINANCE: Minimal Editorial Layout */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left: Typography */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#F28A4B] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#F28A4B]" />
              <span>Step 04 — Personal Finance</span>
            </div>
            
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C211D] tracking-tight leading-[1.12] mb-4">
              Take Control of Your Money.
            </h3>
            
            <p className="text-base sm:text-lg text-[#4E564F] leading-relaxed mb-6 max-w-lg">
              Manage your budget, savings goals, expenses, and financial progress with zero clutter or complicated spreadsheets.
            </p>

            <ul className="space-y-2.5 text-sm font-medium text-[#234B36]">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFE1CC] text-[#F28A4B] flex items-center justify-center text-xs font-bold">✓</span>
                Monthly savings targets with clear milestone completion percentages
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFE1CC] text-[#F28A4B] flex items-center justify-center text-xs font-bold">✓</span>
                Expense categorizations across essentials, growth, and investments
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFE1CC] text-[#F28A4B] flex items-center justify-center text-xs font-bold">✓</span>
                Clear runway indicators so you build lasting financial peace of mind
              </li>
            </ul>
          </div>

          {/* Right: Soft Orange Gradient Minimal Graphic Element */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* Ambient Orange Glow */}
            <div className="absolute w-[280px] h-[280px] bg-[#F28A4B]/20 rounded-full blur-[70px] pointer-events-none -z-10" />

            <div className="w-full max-w-[420px] bg-[#FFFFFF] border border-[#E8E9E2] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFE1CC] text-[#F28A4B] flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1C211D]">Monthly Savings Target</div>
                    <div className="text-[11px] text-[#6D756E]">Financial Security Fund</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#FFE1CC] text-[#F28A4B] text-[11px] font-semibold">
                  82% Saved
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E8E9E2] mb-4">
                <div className="text-[11px] font-semibold text-[#6D756E] uppercase tracking-wider mb-1">Current Progress</div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-[#1C211D]">₹24,500 <span className="text-xs font-normal text-[#6D756E]">/ ₹30,000 target</span></span>
                  <span className="text-xs font-bold text-[#55B978]">+₹4,200 this month</span>
                </div>
                <div className="w-full h-2 bg-[#E8E9E2] rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-gradient-to-r from-[#F28A4B] to-[#55B978] rounded-full w-[82%]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F8F7F2] border border-[#E8E9E2]">
                  <span className="text-[10px] text-[#6D756E] block font-medium">Essentials Ratio</span>
                  <span className="font-bold text-[#1C211D] text-sm">48% of Income</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F7F2] border border-[#E8E9E2]">
                  <span className="text-[10px] text-[#6D756E] block font-medium">Emergency Runway</span>
                  <span className="font-bold text-[#234B36] text-sm">6.5 Months</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* STEP 05 — PRODUCTIVITY: Creative Geometric Composition */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left: Creative Geometric Composition (Green & Orange Floating Spheres + Time Block) */}
          <div className="lg:col-span-6 order-2 lg:order-1 relative flex justify-center items-center">
            {/* Ambient Dual Radial Light */}
            <div className="absolute top-0 left-10 w-[240px] h-[240px] bg-[#55B978]/25 rounded-full blur-[65px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-10 w-[240px] h-[240px] bg-[#F28A4B]/20 rounded-full blur-[65px] pointer-events-none -z-10" />

            <div className="w-full max-w-[420px] bg-[#FFFFFF] border border-[#E8E9E2] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#DDF3E4] text-[#234B36] flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1C211D]">24-Hour Time Blocking</div>
                    <div className="text-[11px] text-[#6D756E]">Deep Work & Flow State</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#DDF3E4] text-[#234B36] text-[11px] font-semibold">
                  4.5h Focus Block
                </span>
              </div>

              {/* Day Time-Blocking Schedule */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F2] border-l-4 border-l-[#234B36] border border-[#E8E9E2]">
                  <div>
                    <div className="text-xs font-bold text-[#1C211D]">Deep Work: System Design</div>
                    <div className="text-[10px] text-[#6D756E]">09:00 — 11:30 · Flow State</div>
                  </div>
                  <span className="material-symbols-outlined text-sm text-[#55B978]">check_circle</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F2] border-l-4 border-l-[#F28A4B] border border-[#E8E9E2]">
                  <div>
                    <div className="text-xs font-bold text-[#1C211D]">Upper Push Split Workout</div>
                    <div className="text-[10px] text-[#6D756E]">12:00 — 13:15 · Physical Pillar</div>
                  </div>
                  <span className="material-symbols-outlined text-sm text-[#55B978]">check_circle</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F2] border-l-4 border-l-[#55B978] border border-[#E8E9E2]">
                  <div>
                    <div className="text-xs font-bold text-[#1C211D]">STAR Behavioral Mock Prep</div>
                    <div className="text-[10px] text-[#6D756E]">16:00 — 17:00 · Career Pillar</div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#234B36] bg-[#DDF3E4] px-2 py-0.5 rounded-md">Next Up</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8E9E2] flex items-center justify-between text-xs text-[#6D756E]">
                <span>Daily Habit Streak</span>
                <span className="text-[#F28A4B] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">local_fire_department</span> 14 Days Active
                </span>
              </div>
            </div>
          </div>

          {/* Right: Typography & Value Proposition */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#234B36] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#55B978]" />
              <span>Step 05 — Productivity</span>
            </div>
            
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C211D] tracking-tight leading-[1.12] mb-4">
              Make Every Day Count.
            </h3>
            
            <p className="text-base sm:text-lg text-[#4E564F] leading-relaxed mb-6 max-w-lg">
              Organize your schedule, manage your time, plan your tasks, and build productive daily routines that stick.
            </p>

            <ul className="space-y-2.5 text-sm font-medium text-[#234B36]">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#DDF3E4] text-[#234B36] flex items-center justify-center text-xs font-bold">✓</span>
                24-Hour visual time blocking with priority color-coding
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#DDF3E4] text-[#234B36] flex items-center justify-center text-xs font-bold">✓</span>
                Daily habit streak tracking (reading, mobility, deep work)
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#DDF3E4] text-[#234B36] flex items-center justify-center text-xs font-bold">✓</span>
                Milestone alignment connecting your daily actions to annual goals
              </li>
            </ul>
          </div>

        </div>

      </div>

    </section>
  );
};
