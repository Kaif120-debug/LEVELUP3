import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<'fitness' | 'nutrition' | 'career' | 'growth'>('fitness');
  const [demoTab, setDemoTab] = useState<'dashboard' | 'fitness' | 'nutrition' | 'career' | 'planner'>('dashboard');
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  // Demo interactive state
  const [demoWorkoutChecked, setDemoWorkoutChecked] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [demoProteinCurrent, setDemoProteinCurrent] = useState<number>(145);
  const [demoTaskCompleted, setDemoTaskCompleted] = useState<boolean>(false);

  useEffect(() => {
    trackEvent('homepage_visit');
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCategoryChange = (category: 'fitness' | 'nutrition' | 'career' | 'growth') => {
    setActiveCategory(category);
    trackEvent('feature_section_viewed', { category });
  };

  const handleDemoTabChange = (tab: 'dashboard' | 'fitness' | 'nutrition' | 'career' | 'planner') => {
    setDemoTab(tab);
    trackEvent('product_demo_tab_changed', { tab });
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'Can I start using LEVELUP for free?',
      a: 'Yes. You can create an account and immediately start using LEVELUP on the Free tier. It includes workout planning, macro and calorie tracking, the ATS resume builder, the job application tracker, and the daily time-blocking planner.',
    },
    {
      q: 'What is included in the ₹129/month Pro plan?',
      a: 'The ₹129/month Pro subscription unlocks unlimited Gemini AI features: AI Workout Generator, AI Diet & Macro Coach, ATS Resume Optimization, AI Mock Interview Coach, plus unlimited workout plans, diet plans, job tracker entries, and client proposals.',
    },
    {
      q: 'Do I need to download an app from the App Store or Google Play?',
      a: 'No. LEVELUP is an ultra-fast web application designed specifically for mobile and desktop browsers. You can access it directly from your phone’s browser or add it to your home screen with zero storage overhead.',
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Yes. You can cancel your subscription at any time with a single click in your account settings. There are no lock-in periods, cancellation fees, or questions asked.',
    },
    {
      q: 'How does LEVELUP keep my personal information private?',
      a: 'Your data is secured with PostgreSQL Row-Level Security and 256-bit encryption through Supabase. We do not sell your personal data or track your activity for advertisers.',
    },
  ];

  return (
    <div className="bg-[#faf9f6] text-[#1a1c1a] min-h-screen flex flex-col font-sans selection:bg-[#caebce] selection:text-[#04210f]">
      {/* Top Navigation Bar - Strict 3-zone Top Bar Contract */}
      <header className="fixed z-40 bg-[#faf9f6]/95 backdrop-blur-md top-0 w-full border-b border-[#e3e3df] h-16 sm:h-20">
        <div className="flex justify-between items-center h-full px-4 sm:px-8 max-w-6xl mx-auto">
          {/* Zone 1: Single text element wordmark */}
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold tracking-tight text-[#26422e] whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            LEVELUP
          </Link>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#424842]">
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="hover:text-[#26422e] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Features
            </a>
            <a
              href="#demo"
              onClick={(e) => scrollToSection(e, 'demo')}
              className="hover:text-[#26422e] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Product Preview
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="hover:text-[#26422e] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={(e) => scrollToSection(e, 'pricing')}
              className="hover:text-[#26422e] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={(e) => scrollToSection(e, 'faq')}
              className="hover:text-[#26422e] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              FAQ
            </a>
          </nav>

          {/* Zone 3: Primary action + Log In */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-medium text-[#424842] hover:text-[#26422e] px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              onClick={() => trackEvent('signup_button_clicked', { source: 'navbar_cta' })}
              className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-semibold text-white bg-[#26422e] rounded-lg hover:bg-[#3d5a44] transition-colors shadow-xs whitespace-nowrap shrink-0"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-16 sm:pt-20 flex-1">
        {/* HERO SECTION (Phase 2) */}
        <section className="pt-10 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 px-4 sm:px-8 max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            {/* Supporting Kicker */}
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#3d5a44] mb-3 sm:mb-4">
              Your goals · Your progress · Your growth · All in one place
            </p>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1a1c1a] leading-[1.15] mb-5 sm:mb-6">
              Everything You Need to Level Up Your Life.
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg lg:text-xl text-[#424842] leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto">
              Manage your fitness, career, nutrition, and personal growth from one platform. Spend less time switching between apps and more time working toward your goals.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
              <Link
                to="/signup"
                onClick={() => trackEvent('signup_button_clicked', { source: 'hero_primary' })}
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl text-sm font-bold text-white bg-[#26422e] hover:bg-[#3d5a44] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Started</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>

              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-xl text-sm font-semibold text-[#1a1c1a] bg-white hover:bg-[#f4f4f0] border border-[#c2c8c0] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Features</span>
              </a>
            </div>

            {/* Reassurance text */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#5f5e5e]">
              <span>Free tier available</span>
              <span aria-hidden="true">·</span>
              <span>No credit card required to start</span>
              <span aria-hidden="true">·</span>
              <span>Works directly on your phone</span>
            </div>
          </div>

          {/* Hero Visual: Authentic Workspace Snapshot */}
          <div className="mt-12 sm:mt-16 bg-white border border-[#e3e3df] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm overflow-hidden">
            {/* Browser frame bar */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#e3e3df] text-xs text-[#727972] mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e3e3df]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#e3e3df]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#e3e3df]"></span>
                <span className="ml-2 font-mono text-[11px] hidden sm:inline">app.levelup.internal / dashboard</span>
              </div>
              <span className="text-[11px] font-medium text-[#26422e] bg-[#caebce]/60 px-2.5 py-0.5 rounded-full">
                Active Session
              </span>
            </div>

            {/* Quick Multi-Module Glance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Fitness & Volume */}
              <div className="bg-[#faf9f6] border border-[#e3e3df] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#424842]">Workout Routine</span>
                  <span className="material-symbols-outlined text-[#26422e] text-lg">fitness_center</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a1c1a]">Push Day Hypertrophy</p>
                  <p className="text-xs text-[#5f5e5e] mt-0.5">4 of 5 exercises logged</p>
                </div>
                <div className="mt-3 pt-3 border-t border-[#e3e3df] flex items-center justify-between text-[11px]">
                  <span className="text-[#5f5e5e]">Overload Streak</span>
                  <span className="font-bold text-[#26422e]">5-Day Streak 🔥</span>
                </div>
              </div>

              {/* Card 2: Nutrition & Macros */}
              <div className="bg-[#faf9f6] border border-[#e3e3df] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#424842]">Daily Nutrition</span>
                  <span className="material-symbols-outlined text-[#26422e] text-lg">restaurant</span>
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-[#1a1c1a]">145g / 160g</span>
                    <span className="text-xs text-[#26422e] font-semibold">91%</span>
                  </div>
                  <div className="w-full bg-[#e3e3df] h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#26422e] h-full rounded-full" style={{ width: '91%' }}></div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#e3e3df] flex items-center justify-between text-[11px]">
                  <span className="text-[#5f5e5e]">Target Calories</span>
                  <span className="font-semibold text-[#1a1c1a]">2,240 / 2,400 kcal</span>
                </div>
              </div>

              {/* Card 3: Career & ATS Resume */}
              <div className="bg-[#faf9f6] border border-[#e3e3df] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#424842]">Career Pipeline</span>
                  <span className="material-symbols-outlined text-[#26422e] text-lg">business_center</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a1c1a]">12 Applications Active</p>
                  <p className="text-xs text-[#5f5e5e] mt-0.5">2 upcoming interviews scheduled</p>
                </div>
                <div className="mt-3 pt-3 border-t border-[#e3e3df] flex items-center justify-between text-[11px]">
                  <span className="text-[#5f5e5e]">ATS Match Score</span>
                  <span className="font-bold text-[#26422e]">94% Optimal</span>
                </div>
              </div>

              {/* Card 4: Daily Planner & Focus */}
              <div className="bg-[#faf9f6] border border-[#e3e3df] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#424842]">Time-Block Routine</span>
                  <span className="material-symbols-outlined text-[#26422e] text-lg">schedule</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a1c1a]">Deep Work: 4.5 Hours</p>
                  <p className="text-xs text-[#5f5e5e] mt-0.5">3 priorities completed today</p>
                </div>
                <div className="mt-3 pt-3 border-t border-[#e3e3df] flex items-center justify-between text-[11px]">
                  <span className="text-[#5f5e5e]">Focus Efficiency</span>
                  <span className="font-semibold text-[#26422e]">High Focus</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PHASE 3: SHOW THE ACTUAL PRODUCT IN ORGANIZED CATEGORIES */}
        <section id="features" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[#e3e3df] scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-wider text-[#26422e] mb-2">
              Everything You Need. One Platform.
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1a1c1a] tracking-tight mb-3">
              Built for Every Pillar of Your Life
            </h2>
            <p className="text-sm sm:text-base text-[#424842] leading-relaxed">
              Stop juggling four different apps. LEVELUP connects your gym logs, nutrition targets, career materials, and daily routines into one coherent daily flow.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center mb-8 sm:mb-12">
            <div className="inline-flex p-1 bg-[#f4f4f0] rounded-xl border border-[#e3e3df] overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => handleCategoryChange('fitness')}
                className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategory === 'fitness'
                    ? 'bg-white text-[#26422e] shadow-xs'
                    : 'text-[#424842] hover:text-[#1a1c1a]'
                }`}
              >
                Fitness
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('nutrition')}
                className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategory === 'nutrition'
                    ? 'bg-white text-[#26422e] shadow-xs'
                    : 'text-[#424842] hover:text-[#1a1c1a]'
                }`}
              >
                Nutrition
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('career')}
                className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategory === 'career'
                    ? 'bg-white text-[#26422e] shadow-xs'
                    : 'text-[#424842] hover:text-[#1a1c1a]'
                }`}
              >
                Career
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('growth')}
                className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategory === 'growth'
                    ? 'bg-white text-[#26422e] shadow-xs'
                    : 'text-[#424842] hover:text-[#1a1c1a]'
                }`}
              >
                Personal Growth
              </button>
            </div>
          </div>

          {/* Category Content Grids */}
          {activeCategory === 'fitness' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">event_repeat</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Workout Planning</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Build custom weekly workout splits or choose evidence-based Push/Pull/Legs and Upper/Lower schedules with target muscles and rest intervals.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  Push / Pull / Legs · Upper / Lower · Custom splits
                </div>
              </div>

              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">exercise</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Exercise Tracking</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Full exercise directory with form cues, target muscle groups, and alternative movements for gym or home setups.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  Form cues · Muscle targets · Exercise substitutions
                </div>
              </div>

              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">replay</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Sets and Repetitions</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Log every set in real-time with exact weight used, completed reps, and built-in rest timers between sets.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  Live weight input · Rep counts · Rest countdowns
                </div>
              </div>

              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">history_edu</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Workout Logs</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Keep a complete history of every session. Track progressive overload trends week over week so you never stall.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  Progressive overload · Total volume · Session notes
                </div>
              </div>

              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between md:col-span-2 lg:col-span-2">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">straighten</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Weight & Body Tracking</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Monitor bodyweight weigh-ins alongside chest, waist, arm, and thigh circumference measurements to verify physical body recomposition accurately.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  Daily weigh-ins · Circumference logs · Historical charts
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'nutrition' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">local_fire_department</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Calorie Tracking</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Monitor daily caloric surplus or deficit with automatic calculations matched to your basal metabolic rate and physical activity levels.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  Deficit & surplus targets · Daily consumption rings
                </div>
              </div>

              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">egg_alt</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Protein Tracking</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Prioritize muscle recovery with dedicated protein intake meters, quick meal additions, and real-time grams remaining for the day.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  Gram targets · Quick-add logged protein · Macro distribution
                </div>
              </div>

              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">menu_book</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Nutrition Planning</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Organize high-protein meal plans aligned with vegetarian, non-vegetarian, vegan, or keto preferences with automatic grocery shopping lists.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  Structured meal plans · Dietary filters · Grocery checklists
                </div>
              </div>

              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">kitchen</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Meal Tracking</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Log breakfast, lunch, dinner, and post-workout fuel with specific quantities, carb, fat, and protein breakdowns for each dish.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  Multi-meal schedule · Ingredient quantities · Macro totals
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'career' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">language</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Portfolio Tools</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Generate and host your personal portfolio website with custom case studies, project links, contact forms, and a shareable public URL.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  Custom slug · 6 portfolio themes · Case study layouts
                </div>
              </div>

              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">view_kanban</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Job Tracking</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Visual Kanban board and pipeline to track your job and internship applications from Saved and Applied through to Interview and Offer stages.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  Kanban stages · Follow-up dates · Interview round records
                </div>
              </div>

              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">description</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Resume Assistance</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Interactive ATS resume builder with 4 recruiter-vetted templates, XYZ bullet point phrasing, live preview, and high-resolution PDF download.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  4 ATS templates · Google XYZ bullet guidance · Instant PDF export
                </div>
              </div>

              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">record_voice_over</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Interview Preparation</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Practice role-specific technical and behavioral questions with structured STAR-method breakdowns and mock interview sessions.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  STAR method guidance · Technical question banks · Mock rounds
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'growth' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-200">
              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">flag</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Goal Tracking</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Set tangible quarterly and annual goals across your career, health, and finances with target completion dates and milestone checklists.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  Milestone dates · Sub-goal progress · Target tracking
                </div>
              </div>

              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">trending_up</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Progress Tracking</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Build unwavering habits with daily streak counters, visual consistency indicators, and weekly reflection overviews.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  Habit streaks · Daily completion checks · Momentum charts
                </div>
              </div>

              <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#caebce]/50 text-[#26422e] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">view_timeline</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1c1a] mb-1.5">Personal Productivity</h3>
                  <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                    Structure uninterrupted deep work sessions using 24-hour visual time blocks, priority to-do checklists, and focus categories.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                  24-Hour time blocking · Priority tasks · Category color-coding
                </div>
              </div>
            </div>
          )}

          {/* Section CTA */}
          <div className="mt-10 sm:mt-14 text-center">
            <Link
              to="/signup"
              onClick={() => trackEvent('signup_button_clicked', { source: 'features_section' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#26422e] hover:bg-[#3d5a44] transition-colors shadow-xs"
            >
              <span>Get Started with LEVELUP</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* PHASE 4: PRODUCT DEMONSTRATION SECTION */}
        <section id="demo" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[#e3e3df] scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-[#26422e] mb-2">
              Interactive Product Demo
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1a1c1a] tracking-tight mb-3">
              See What You Can Do With LEVELUP.
            </h2>
            <p className="text-sm sm:text-base text-[#424842] leading-relaxed">
              Explore the actual interface before creating your account. Try clicking through modules below to see how your day is organized.
            </p>
          </div>

          {/* Interactive Demo Container */}
          <div className="bg-white border border-[#e3e3df] rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
            {/* Demo Tabs Bar */}
            <div className="bg-[#f4f4f0] border-b border-[#e3e3df] p-2 sm:p-3 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDemoTabChange('dashboard')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    demoTab === 'dashboard'
                      ? 'bg-white text-[#26422e] shadow-xs'
                      : 'text-[#424842] hover:text-[#1a1c1a]'
                  }`}
                >
                  Dashboard View
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoTabChange('fitness')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    demoTab === 'fitness'
                      ? 'bg-white text-[#26422e] shadow-xs'
                      : 'text-[#424842] hover:text-[#1a1c1a]'
                  }`}
                >
                  Workout Log
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoTabChange('nutrition')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    demoTab === 'nutrition'
                      ? 'bg-white text-[#26422e] shadow-xs'
                      : 'text-[#424842] hover:text-[#1a1c1a]'
                  }`}
                >
                  Macros & Diet
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoTabChange('career')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    demoTab === 'career'
                      ? 'bg-white text-[#26422e] shadow-xs'
                      : 'text-[#424842] hover:text-[#1a1c1a]'
                  }`}
                >
                  Job Tracker
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoTabChange('planner')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    demoTab === 'planner'
                      ? 'bg-white text-[#26422e] shadow-xs'
                      : 'text-[#424842] hover:text-[#1a1c1a]'
                  }`}
                >
                  Daily Planner
                </button>
              </div>

              <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#5f5e5e] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#26422e]"></span>
                Interactive Sandbox Preview
              </div>
            </div>

            {/* Demo Screen Contents */}
            <div className="p-4 sm:p-8 bg-[#faf9f6] min-h-[420px]">
              {/* TAB 1: DASHBOARD PREVIEW */}
              {demoTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#e3e3df]">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#1a1c1a]">
                        Good morning, Alex.
                      </h3>
                      <p className="text-xs sm:text-sm text-[#424842]">
                        Here is your day at a glance · Tuesday, 24 October
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#caebce] text-[#04210f]">
                        Streak: 12 Days
                      </span>
                    </div>
                  </div>

                  {/* Today's Focus Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-[#e3e3df] rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-[#5f5e5e] uppercase tracking-wider">
                          Today's Training
                        </span>
                        <span className="material-symbols-outlined text-[#26422e] text-lg">fitness_center</span>
                      </div>
                      <h4 className="text-base font-bold text-[#1a1c1a]">Push Day A · Chest & Triceps</h4>
                      <p className="text-xs text-[#424842] mt-1">45 min duration · Barbell Bench, Incline DB, Dips</p>
                      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#e3e3df]">
                        <span className="text-[#5f5e5e]">Progressive Overload Target</span>
                        <span className="font-semibold text-[#26422e]">82.5 kg × 8 reps</span>
                      </div>
                    </div>

                    <div className="bg-white border border-[#e3e3df] rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-[#5f5e5e] uppercase tracking-wider">
                          Primary Deep Work Focus
                        </span>
                        <span className="material-symbols-outlined text-[#26422e] text-lg">task_alt</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => setDemoTaskCompleted(!demoTaskCompleted)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-colors ${
                            demoTaskCompleted
                              ? 'bg-[#26422e] border-[#26422e] text-white'
                              : 'border-[#c2c8c0] hover:border-[#26422e]'
                          }`}
                        >
                          {demoTaskCompleted && <span className="material-symbols-outlined text-sm">check</span>}
                        </button>
                        <div>
                          <p className={`text-sm font-semibold text-[#1a1c1a] ${demoTaskCompleted ? 'line-through opacity-60' : ''}`}>
                            Finalize Q4 Product Roadmap & Portfolio Case Study
                          </p>
                          <p className="text-xs text-[#5f5e5e] mt-1">Due today · High Priority · 2 hours allocated</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#e3e3df]">
                        <span className="text-[#5f5e5e]">Status</span>
                        <span className="font-semibold text-[#26422e]">
                          {demoTaskCompleted ? 'Completed ✓' : 'In Progress (Click check to complete)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Metrics Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-[#e3e3df] rounded-xl p-4">
                      <span className="text-xs text-[#5f5e5e]">Daily Protein</span>
                      <p className="text-lg font-bold text-[#1a1c1a] mt-1">{demoProteinCurrent}g / 160g</p>
                      <p className="text-[11px] text-[#26422e] mt-1">15g remaining for dinner</p>
                    </div>

                    <div className="bg-white border border-[#e3e3df] rounded-xl p-4">
                      <span className="text-xs text-[#5f5e5e]">Job Applications</span>
                      <p className="text-lg font-bold text-[#1a1c1a] mt-1">14 tracked</p>
                      <p className="text-[11px] text-[#26422e] mt-1">Next interview: Thursday 10:00 AM</p>
                    </div>

                    <div className="bg-white border border-[#e3e3df] rounded-xl p-4">
                      <span className="text-xs text-[#5f5e5e]">Deep Work Logged</span>
                      <p className="text-lg font-bold text-[#1a1c1a] mt-1">3.5 hrs / 4.0 hrs target</p>
                      <p className="text-[11px] text-[#26422e] mt-1">88% of daily focus goal</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FITNESS & WORKOUT LOG */}
              {demoTab === 'fitness' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-[#e3e3df]">
                    <div>
                      <h3 className="text-lg font-bold text-[#1a1c1a]">Push Day Hypertrophy · Active Log</h3>
                      <p className="text-xs text-[#424842]">Rest timer: 90 seconds between working sets</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-[#26422e] text-white rounded-lg">
                      In Progress
                    </span>
                  </div>

                  {/* Table of sets */}
                  <div className="bg-white border border-[#e3e3df] rounded-xl overflow-hidden shadow-xs">
                    <div className="p-4 bg-[#f4f4f0] border-b border-[#e3e3df] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1a1c1a]">1. Barbell Flat Bench Press</span>
                      <span className="text-xs text-[#5f5e5e]">Target: Chest / Triceps</span>
                    </div>

                    <div className="divide-y divide-[#e3e3df] text-xs">
                      {[
                        { set: 1, weight: '80.0 kg', reps: '10 reps', rpe: 'RPE 8' },
                        { set: 2, weight: '82.5 kg', reps: '8 reps', rpe: 'RPE 8.5' },
                        { set: 3, weight: '82.5 kg', reps: '7 reps', rpe: 'RPE 9' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 sm:px-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setDemoWorkoutChecked((prev) => ({
                                  ...prev,
                                  [idx]: !prev[idx],
                                }))
                              }
                              className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                                demoWorkoutChecked[idx]
                                  ? 'bg-[#26422e] border-[#26422e] text-white'
                                  : 'border-[#c2c8c0] hover:border-[#26422e]'
                              }`}
                            >
                              {demoWorkoutChecked[idx] && (
                                <span className="material-symbols-outlined text-sm">check</span>
                              )}
                            </button>
                            <span className="font-semibold text-[#1a1c1a]">Set {item.set}</span>
                          </div>

                          <span className="font-mono text-xs">{item.weight}</span>
                          <span className="font-mono text-xs">{item.reps}</span>
                          <span className="text-[#5f5e5e] hidden sm:inline">{item.rpe}</span>

                          <span
                            className={`text-[11px] font-semibold ${
                              demoWorkoutChecked[idx] ? 'text-[#26422e]' : 'text-[#727972]'
                            }`}
                          >
                            {demoWorkoutChecked[idx] ? 'Completed ✓' : 'Tap box to check'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-[#e3e3df] rounded-xl p-4 flex items-center justify-between text-xs">
                    <span className="text-[#424842]">Next Exercise in Split:</span>
                    <span className="font-bold text-[#1a1c1a]">Incline Dumbbell Press (3 Sets × 10 Reps)</span>
                  </div>
                </div>
              )}

              {/* TAB 3: MACROS & NUTRITION */}
              {demoTab === 'nutrition' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-[#e3e3df]">
                    <div>
                      <h3 className="text-lg font-bold text-[#1a1c1a]">Daily Nutrition Targets</h3>
                      <p className="text-xs text-[#424842]">High-Protein Lean Bulk · Target: 2,400 kcal</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDemoProteinCurrent((p) => (p >= 160 ? 120 : p + 15))}
                      className="text-xs font-semibold px-3 py-1.5 bg-[#26422e] text-white rounded-lg hover:bg-[#3d5a44] transition-colors cursor-pointer"
                    >
                      + Quick Log Protein (15g)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-[#e3e3df] rounded-xl p-4">
                      <span className="text-xs text-[#5f5e5e]">Calories</span>
                      <p className="text-2xl font-bold text-[#1a1c1a] mt-1">2,180 / 2,400</p>
                      <p className="text-[11px] text-[#26422e] mt-1">220 kcal remaining</p>
                    </div>

                    <div className="bg-white border border-[#e3e3df] rounded-xl p-4">
                      <span className="text-xs text-[#5f5e5e]">Protein Target</span>
                      <p className="text-2xl font-bold text-[#26422e] mt-1">{demoProteinCurrent}g / 160g</p>
                      <p className="text-[11px] text-[#5f5e5e] mt-1">
                        {Math.max(0, 160 - demoProteinCurrent)}g remaining
                      </p>
                    </div>

                    <div className="bg-white border border-[#e3e3df] rounded-xl p-4">
                      <span className="text-xs text-[#5f5e5e]">Carbs / Fats</span>
                      <p className="text-2xl font-bold text-[#1a1c1a] mt-1">240g / 65g</p>
                      <p className="text-[11px] text-[#26422e] mt-1">Balanced macro ratio</p>
                    </div>
                  </div>

                  {/* Meals checklist */}
                  <div className="bg-white border border-[#e3e3df] rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-[#1a1c1a] uppercase tracking-wider">
                      Logged Meals Today
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1.5 border-b border-[#e3e3df]">
                        <span>Breakfast: 4 Eggs, Oats & Blueberries</span>
                        <strong className="text-[#26422e]">38g protein · 540 kcal</strong>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-[#e3e3df]">
                        <span>Lunch: Grilled Chicken Breast, Quinoa & Avocado</span>
                        <strong className="text-[#26422e]">52g protein · 720 kcal</strong>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span>Post-Workout Shake & Banana</span>
                        <strong className="text-[#26422e]">30g protein · 320 kcal</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CAREER & JOB TRACKER */}
              {demoTab === 'career' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-[#e3e3df]">
                    <div>
                      <h3 className="text-lg font-bold text-[#1a1c1a]">Job Application Pipeline</h3>
                      <p className="text-xs text-[#424842]">Organized application funnel with live follow-up alerts</p>
                    </div>
                    <span className="text-xs font-semibold text-[#26422e] bg-[#caebce]/60 px-3 py-1 rounded-lg">
                      14 Applications Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Column 1: Applied */}
                    <div className="bg-white border border-[#e3e3df] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#5f5e5e]">
                        <span>APPLIED (6)</span>
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      </div>
                      <div className="space-y-2.5">
                        <div className="bg-[#faf9f6] border border-[#e3e3df] rounded-lg p-3 text-xs">
                          <p className="font-bold text-[#1a1c1a]">Product Designer</p>
                          <p className="text-[#5f5e5e] text-[11px]">Linear · Remote</p>
                          <div className="mt-2 text-[10px] text-[#727972] flex justify-between">
                            <span>Applied: 3d ago</span>
                            <span className="text-[#26422e]">Resume: Tech Clean</span>
                          </div>
                        </div>
                        <div className="bg-[#faf9f6] border border-[#e3e3df] rounded-lg p-3 text-xs">
                          <p className="font-bold text-[#1a1c1a]">Frontend Engineer</p>
                          <p className="text-[#5f5e5e] text-[11px]">Stripe · Hybrid</p>
                          <div className="mt-2 text-[10px] text-[#727972] flex justify-between">
                            <span>Applied: 5d ago</span>
                            <span className="text-[#26422e]">ATS: 95%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Interviewing */}
                    <div className="bg-white border border-[#e3e3df] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#26422e]">
                        <span>INTERVIEW (2)</span>
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      </div>
                      <div className="space-y-2.5">
                        <div className="bg-[#faf9f6] border border-[#26422e]/40 rounded-lg p-3 text-xs shadow-xs">
                          <p className="font-bold text-[#1a1c1a]">Full-Stack Developer</p>
                          <p className="text-[#5f5e5e] text-[11px]">Vercel · Remote</p>
                          <div className="mt-2 pt-2 border-t border-[#e3e3df] text-[10.5px]">
                            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              Round 2: Technical Live Coding
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Offers */}
                    <div className="bg-white border border-[#e3e3df] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3 text-xs font-bold text-emerald-800">
                        <span>OFFER (1)</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                      <div className="bg-[#faf9f6] border border-emerald-300 rounded-lg p-3 text-xs">
                        <p className="font-bold text-[#1a1c1a]">Software Engineer II</p>
                        <p className="text-[#5f5e5e] text-[11px]">Supabase · Remote</p>
                        <div className="mt-2 pt-2 border-t border-[#e3e3df] text-[10.5px] text-emerald-700 font-semibold">
                          Decision Deadline: 10 Nov
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DAILY TIME-BLOCKER */}
              {demoTab === 'planner' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-[#e3e3df]">
                    <div>
                      <h3 className="text-lg font-bold text-[#1a1c1a]">24-Hour Time-Blocking Engine</h3>
                      <p className="text-xs text-[#424842]">Visual blocks ensuring uninterrupted focus time</p>
                    </div>
                    <span className="text-xs font-semibold text-[#26422e] bg-[#caebce]/60 px-3 py-1 rounded-lg">
                      Schedule Locked
                    </span>
                  </div>

                  <div className="bg-white border border-[#e3e3df] rounded-xl p-4 space-y-2 text-xs">
                    {[
                      { time: '06:30 - 08:00', title: 'Morning Routine & Push Workout', category: 'Workout', color: 'bg-emerald-100 text-emerald-800' },
                      { time: '09:00 - 12:30', title: 'Deep Work: Core Feature Engineering', category: 'Deep Work', color: 'bg-[#26422e] text-white' },
                      { time: '13:30 - 15:00', title: 'Team Sync & Candidate Pipeline Review', category: 'Meeting', color: 'bg-blue-100 text-blue-800' },
                      { time: '16:00 - 17:30', title: 'Interview Preparation & System Design Practice', category: 'Study', color: 'bg-amber-100 text-amber-800' },
                    ].map((block, idx) => (
                      <div key={idx} className="p-3 bg-[#faf9f6] border border-[#e3e3df] rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[11px] text-[#5f5e5e] w-28 shrink-0">{block.time}</span>
                          <span className="font-semibold text-[#1a1c1a]">{block.title}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shrink-0 ${block.color}`}>
                          {block.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Demo Bar with CTA */}
            <div className="p-4 sm:p-5 bg-white border-t border-[#e3e3df] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#5f5e5e] text-center sm:text-left">
                Ready to manage your fitness, career, and productivity in one place?
              </span>
              <Link
                to="/signup"
                onClick={() => trackEvent('signup_button_clicked', { source: 'demo_bottom_cta' })}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#26422e] hover:bg-[#3d5a44] transition-colors whitespace-nowrap cursor-pointer shadow-xs"
              >
                Create Your Account Free
              </Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION (Phase 2 & 8) */}
        <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[#e3e3df] scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-bold uppercase tracking-wider text-[#26422e] mb-2">
              Three Simple Steps
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1a1c1a] tracking-tight mb-3">
              How LEVELUP Works
            </h2>
            <p className="text-sm sm:text-base text-[#424842] leading-relaxed">
              No complex setup. You can be up and running with your personalized routine in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#26422e] bg-[#caebce]/60 px-3 py-1 rounded-md uppercase tracking-wider inline-block mb-4">
                  Step 01
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#1a1c1a] mb-2">
                  Set Your Baselines
                </h3>
                <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                  Choose your focus areas: workout frequency, target protein goals, career objectives, and daily priorities. LEVELUP adapts your initial dashboard immediately.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                Takes 60 seconds · Fully customizable
              </div>
            </div>

            <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#26422e] bg-[#caebce]/60 px-3 py-1 rounded-md uppercase tracking-wider inline-block mb-4">
                  Step 02
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#1a1c1a] mb-2">
                  Execute From One Workspace
                </h3>
                <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                  Check off exercises set-by-set in the gym, log daily protein and meals, track job applications, and protect your uninterrupted focus hours.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                Zero app switching · Accessible anywhere
              </div>
            </div>

            <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#26422e] bg-[#caebce]/60 px-3 py-1 rounded-md uppercase tracking-wider inline-block mb-4">
                  Step 03
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#1a1c1a] mb-2">
                  Review & Level Up
                </h3>
                <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                  Watch your progressive overload lift numbers rise, build compounding habit streaks, and land interviews with polished ATS resumes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#e3e3df] text-[11px] text-[#5f5e5e]">
                Compounding momentum · Tangible outcomes
              </div>
            </div>
          </div>
        </section>

        {/* PHASE 7: IMPROVE TRUST & TRANSPARENCY SECTION */}
        <section id="trust" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[#e3e3df]">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-wider text-[#26422e] mb-2">
              Honest & Transparent
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1a1c1a] tracking-tight mb-3">
              Why People Choose LEVELUP
            </h2>
            <p className="text-sm sm:text-base text-[#424842] leading-relaxed">
              Clear answers about what we offer, who benefits, and how your data is handled.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-[#e3e3df] rounded-2xl p-6">
              <span className="material-symbols-outlined text-[#26422e] text-2xl mb-3">hub</span>
              <h3 className="text-base font-bold text-[#1a1c1a] mb-2">What LEVELUP Offers</h3>
              <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                An all-in-one personal operating system that replaces five or more disjointed subscription apps for fitness, nutrition, career tracking, and productivity.
              </p>
            </div>

            <div className="bg-white border border-[#e3e3df] rounded-2xl p-6">
              <span className="material-symbols-outlined text-[#26422e] text-2xl mb-3">group</span>
              <h3 className="text-base font-bold text-[#1a1c1a] mb-2">Who Benefits Most</h3>
              <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                College students balancing classes and job searches, young professionals building their career and physique, and self-directed builders wanting daily discipline.
              </p>
            </div>

            <div className="bg-white border border-[#e3e3df] rounded-2xl p-6">
              <span className="material-symbols-outlined text-[#26422e] text-2xl mb-3">devices</span>
              <h3 className="text-base font-bold text-[#1a1c1a] mb-2">Instant Web Access</h3>
              <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                No bulky app downloads or App Store approval delays. Open LEVELUP in any modern browser on iOS, Android, macOS, or Windows seamlessly.
              </p>
            </div>

            <div className="bg-white border border-[#e3e3df] rounded-2xl p-6">
              <span className="material-symbols-outlined text-[#26422e] text-2xl mb-3">lock</span>
              <h3 className="text-base font-bold text-[#1a1c1a] mb-2">Data Privacy & Security</h3>
              <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                Your data is protected by Supabase PostgreSQL Row Level Security. Only your authenticated user ID can view or update your logs. We never sell your data.
              </p>
            </div>

            <div className="bg-white border border-[#e3e3df] rounded-2xl p-6">
              <span className="material-symbols-outlined text-[#26422e] text-2xl mb-3">price_check</span>
              <h3 className="text-base font-bold text-[#1a1c1a] mb-2">Free vs. Pro Clarity</h3>
              <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                You can use our core tracking tools completely free. If you want unlimited AI intelligence and unlimited records, Pro is just ₹129/month with instant 1-click cancellation.
              </p>
            </div>

            <div className="bg-white border border-[#e3e3df] rounded-2xl p-6">
              <span className="material-symbols-outlined text-[#26422e] text-2xl mb-3">support_agent</span>
              <h3 className="text-base font-bold text-[#1a1c1a] mb-2">Direct Support</h3>
              <p className="text-xs sm:text-sm text-[#424842] leading-relaxed">
                Have questions or need assistance? Our support team is directly reachable via email at <span className="font-mono text-[#26422e]">support@levelup.app</span>.
              </p>
            </div>
          </div>
        </section>

        {/* PHASE 9: REVIEW PRICING (HONEST FREE VS. PRO BREAKDOWN) */}
        <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[#e3e3df] scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-bold uppercase tracking-wider text-[#26422e] mb-2">
              Transparent Pricing
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1a1c1a] tracking-tight mb-3">
              Start Free. Upgrade Anytime.
            </h2>
            <p className="text-sm sm:text-base text-[#424842] leading-relaxed">
              Experience the core platform for free. Upgrade to Pro whenever you want unlimited AI generation and unconstrained limits.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* Free Tier Card */}
            <div className="bg-white border border-[#e3e3df] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex justify-between items-baseline mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#1a1c1a]">LEVELUP Free</h3>
                    <p className="text-xs text-[#5f5e5e] mt-0.5">Core tools for personal growth</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-[#1a1c1a]">₹0</span>
                    <span className="text-xs text-[#5f5e5e] block">Forever free</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e3e3df] space-y-3 text-xs text-[#424842]">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check</span>
                    <span>Up to 3 Workout Plans & live exercise logging</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check</span>
                    <span>Up to 2 Diet Plans & daily protein tracking</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check</span>
                    <span>Up to 20 Job Applications in pipeline tracker</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check</span>
                    <span>2 ATS Resume Blueprints with PDF export</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check</span>
                    <span>1 Published Personal Portfolio website</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check</span>
                    <span>24-Hour Time-Blocking Daily Planner</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check</span>
                    <span>Habit consistency streaks and daily priority tasks</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check</span>
                    <span>Student courses, exam countdowns & finance budget tracking</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  to="/signup"
                  onClick={() => trackEvent('signup_button_clicked', { source: 'pricing_free' })}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-semibold text-[#1a1c1a] bg-[#f4f4f0] hover:bg-[#e3e3df] border border-[#c2c8c0] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Get Started Free</span>
                </Link>
                <p className="text-[11px] text-[#727972] text-center mt-2">
                  No credit card required
                </p>
              </div>
            </div>

            {/* Pro Plan Card */}
            <div className="bg-white border-2 border-[#26422e] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#26422e] text-white text-[10.5px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-bl-xl">
                Most Popular
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#1a1c1a]">LEVELUP Pro</h3>
                    <p className="text-xs text-[#5f5e5e] mt-0.5">Unlimited AI & unrestricted capacity</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#26422e]">₹129</span>
                    <span className="text-xs text-[#5f5e5e] block">per month</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e3e3df] space-y-3 text-xs text-[#1a1c1a]">
                  <div className="flex items-start gap-2.5 font-semibold text-[#26422e]">
                    <span className="material-symbols-outlined text-base shrink-0 mt-0.5">auto_awesome</span>
                    <span>Everything in Free, plus:</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>Unlimited AI Workout & Hypertrophy Split Generation</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>Unlimited AI Diet & Macro Meal Plan Generation</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>Gemini ATS Resume Scoring & Google XYZ Bullet Optimization</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>AI Mock Interview Coach with technical question reviews</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>Unlimited Workout Plans, Diet Plans & Job Applications</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>Business CRM: Unlimited Clients, Proposals & Automated Invoices</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#26422e] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>Advanced Progressive Overload & Macro Trend Analytics</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  to="/signup"
                  onClick={() => trackEvent('signup_button_clicked', { source: 'pricing_pro' })}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-[#26422e] hover:bg-[#3d5a44] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Start with LEVELUP Pro</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
                <p className="text-[11px] text-[#727972] text-center mt-2">
                  ₹129/month · Cancel anytime with 1 click
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-16 sm:py-24 px-4 sm:px-8 max-w-3xl mx-auto border-t border-[#e3e3df] scroll-mt-20">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-wider text-[#26422e] mb-2">
              Frequently Asked Questions
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1c1a]">
              Common Inquiries
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#e3e3df] rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 sm:p-5 flex justify-between items-center text-sm font-semibold text-[#1a1c1a] hover:text-[#26422e] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-[#727972] transition-transform">
                    {openFaq === idx ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#424842] leading-relaxed border-t border-[#e3e3df]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CONVERSION CALL-TO-ACTION (Phase 8) */}
        <section className="py-20 sm:py-24 px-4 sm:px-8 bg-white border-t border-[#e3e3df] text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1c1a] tracking-tight mb-3">
              Your Next Level Starts Here.
            </h2>
            <p className="text-sm sm:text-base text-[#424842] mb-8 leading-relaxed max-w-lg mx-auto">
              Bring your fitness, career, nutrition, and daily focus together today. Create your workspace in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                onClick={() => trackEvent('signup_button_clicked', { source: 'final_cta' })}
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#26422e] hover:bg-[#3d5a44] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Started Free</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-semibold text-[#1a1c1a] bg-[#faf9f6] hover:bg-[#f4f4f0] border border-[#c2c8c0] transition-colors flex items-center justify-center cursor-pointer"
              >
                <span>Explore Features</span>
              </a>
            </div>
            <p className="text-xs text-[#727972] mt-4">
              Your goals · Your progress · Your growth
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="legal" className="bg-[#faf9f6] border-t border-[#e3e3df] py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
            <Link to="/" className="text-xl font-bold text-[#26422e]">
              LEVELUP
            </Link>
            <span className="text-xs text-[#5f5e5e] sm:border-l sm:border-[#c2c8c0] sm:pl-4">
              The Unified Personal Performance Workspace
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[#5f5e5e]">
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="hover:text-[#26422e] transition-colors"
            >
              Features
            </a>
            <a
              href="#demo"
              onClick={(e) => scrollToSection(e, 'demo')}
              className="hover:text-[#26422e] transition-colors"
            >
              Preview
            </a>
            <a
              href="#pricing"
              onClick={(e) => scrollToSection(e, 'pricing')}
              className="hover:text-[#26422e] transition-colors"
            >
              Pricing
            </a>
            <button
              type="button"
              onClick={() => setActiveLegalModal('privacy')}
              className="hover:text-[#26422e] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-[#26422e] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('contact')}
              className="hover:text-[#26422e] transition-colors cursor-pointer"
            >
              Contact Support
            </button>
            <Link to="/login" className="hover:text-[#26422e] transition-colors">
              Log In
            </Link>
          </div>

          <p className="text-xs text-[#727972]">
            © {new Date().getFullYear()} LEVELUP. All rights reserved.
          </p>
        </div>
      </footer>

      {/* LEGAL & CONTACT MODAL */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className="bg-white border border-[#e3e3df] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#e3e3df] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1a1c1a]">
                {activeLegalModal === 'privacy' && 'Privacy Policy'}
                {activeLegalModal === 'terms' && 'Terms of Service'}
                {activeLegalModal === 'contact' && 'Contact Support'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="p-1 rounded-lg text-[#727972] hover:text-[#1a1c1a] hover:bg-[#f4f4f0] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#424842] leading-relaxed">
              {activeLegalModal === 'privacy' && (
                <>
                  <p>
                    <strong>1. Commitment to Privacy:</strong> At LEVELUP, your personal data is treated with utmost security and privacy. We only collect the necessary credentials (email and password) to authenticate your access.
                  </p>
                  <p>
                    <strong>2. Data Storage & Encryption:</strong> All account data, workouts, nutrition profiles, job applications, and personal records are stored in Supabase with PostgreSQL Row Level Security (RLS) and encrypted at rest.
                  </p>
                  <p>
                    <strong>3. Zero Data Selling:</strong> We do not sell, rent, or monetize your personal information or training records to advertisers or third parties.
                  </p>
                  <p>
                    <strong>4. Account Deletion:</strong> You retain complete ownership of your data and can request complete account deletion at any time by contacting support.
                  </p>
                </>
              )}

              {activeLegalModal === 'terms' && (
                <>
                  <p>
                    <strong>1. Service Usage:</strong> LEVELUP provides an all-in-one personal productivity and tracking workspace. You are responsible for maintaining the confidentiality of your login credentials.
                  </p>
                  <p>
                    <strong>2. Subscriptions & Billing:</strong> The Free tier provides core functionality at no cost. The Pro membership is billed at ₹129 per month and can be canceled at any time from your settings.
                  </p>
                  <p>
                    <strong>3. Health & Fitness Disclaimer:</strong> Workout logs and nutrition suggestions are intended for informational self-tracking purposes and do not replace personalized medical advice from certified physicians.
                  </p>
                  <p>
                    <strong>4. Service Modifications:</strong> We continuously improve the platform with regular feature updates and performance optimizations.
                  </p>
                </>
              )}

              {activeLegalModal === 'contact' && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-[#caebce] text-[#26422e] flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-2xl">mail</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a1c1a] text-base">We're here to help</h4>
                    <p className="text-xs text-[#5f5e5e] mt-1">
                      Whether you have questions, feedback, or need account help:
                    </p>
                  </div>
                  <div className="p-3 bg-[#faf9f6] border border-[#e3e3df] rounded-xl font-mono text-sm font-semibold text-[#26422e]">
                    support@levelup.app
                  </div>
                  <p className="text-xs text-[#727972]">
                    Typical response time: within 24 hours.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#faf9f6] border-t border-[#e3e3df] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#26422e] text-white rounded-lg hover:bg-[#3d5a44] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
