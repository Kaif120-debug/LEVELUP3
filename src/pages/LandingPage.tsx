import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';
import { AestheticHeroSection } from '../components/AestheticHeroSection';
import { VerticalFeatureStory } from '../components/VerticalFeatureStory';

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
    <div className="bg-[#F8F7F2] text-[#1C211D] min-h-screen flex flex-col font-sans selection:bg-[#DDF3E4] selection:text-[#234B36]">
      {/* Top Navigation Bar - Clean, Minimal Light Design */}
      <header className="fixed z-40 bg-[#F8F7F2]/90 backdrop-blur-md top-0 w-full border-b border-[#E8E9E2] h-16 sm:h-20 transition-all">
        <div className="flex justify-between items-center h-full px-4 sm:px-8 max-w-6xl mx-auto">
          {/* Brand Wordmark with subtle green icon */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight text-[#234B36] whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            <span className="w-7 h-7 rounded-lg bg-[#DDF3E4] text-[#234B36] flex items-center justify-center font-bold text-sm">
              ↗
            </span>
            <span>LEVELUP</span>
          </Link>

          {/* Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#6D756E]">
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="hover:text-[#234B36] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Features
            </a>
            <a
              href="#demo"
              onClick={(e) => scrollToSection(e, 'demo')}
              className="hover:text-[#234B36] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Product Preview
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="hover:text-[#234B36] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={(e) => scrollToSection(e, 'pricing')}
              className="hover:text-[#234B36] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={(e) => scrollToSection(e, 'faq')}
              className="hover:text-[#234B36] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              FAQ
            </a>
          </nav>

          {/* Log In & Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-medium text-[#6D756E] hover:text-[#234B36] px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              onClick={() => trackEvent('signup_button_clicked', { source: 'navbar_cta' })}
              className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#234B36] rounded-xl hover:bg-[#1a3828] transition-colors shadow-xs whitespace-nowrap shrink-0"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-16 sm:pt-20 flex-1">
        {/* AESTHETIC CLEAN HERO SECTION */}
        <AestheticHeroSection onScrollToFeatures={(e) => scrollToSection(e, 'features')} />

        {/* VERTICAL FEATURE STORY SECTION (Editorial progression without horizontal scrolling) */}
        <VerticalFeatureStory />

        {/* PHASE 4: PRODUCT DEMONSTRATION SECTION */}
        <section id="demo" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[#E8E9E2] scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F28A4B] mb-2 font-mono">
              Interactive Product Demo
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1C211D] tracking-tight mb-3">
              See What You Can Do With LEVELUP.
            </h2>
            <p className="text-sm sm:text-base text-[#6D756E] leading-relaxed">
              Explore the actual interface before creating your account. Try clicking through modules below to see how your day is organized.
            </p>
          </div>

          {/* Interactive Demo Container */}
          <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
            {/* Demo Tabs Bar */}
            <div className="bg-[#F8F7F2] border-b border-[#E8E9E2] p-2 sm:p-3 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDemoTabChange('dashboard')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    demoTab === 'dashboard'
                      ? 'bg-[#234B36] text-white shadow-xs'
                      : 'text-[#6D756E] hover:text-[#1C211D]'
                  }`}
                >
                  Dashboard View
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoTabChange('fitness')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    demoTab === 'fitness'
                      ? 'bg-[#234B36] text-white shadow-xs'
                      : 'text-[#6D756E] hover:text-[#1C211D]'
                  }`}
                >
                  Workout Log
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoTabChange('nutrition')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    demoTab === 'nutrition'
                      ? 'bg-[#234B36] text-white shadow-xs'
                      : 'text-[#6D756E] hover:text-[#1C211D]'
                  }`}
                >
                  Macros & Diet
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoTabChange('career')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    demoTab === 'career'
                      ? 'bg-[#234B36] text-white shadow-xs'
                      : 'text-[#6D756E] hover:text-[#1C211D]'
                  }`}
                >
                  Job Tracker
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoTabChange('planner')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    demoTab === 'planner'
                      ? 'bg-[#234B36] text-white shadow-xs'
                      : 'text-[#6D756E] hover:text-[#1C211D]'
                  }`}
                >
                  Daily Planner
                </button>
              </div>

              <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#234B36] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#55B978]"></span>
                Interactive Sandbox Preview
              </div>
            </div>

            {/* Demo Screen Contents */}
            <div className="p-4 sm:p-8 bg-[#FFFFFF] min-h-[420px]">
              {/* TAB 1: DASHBOARD PREVIEW */}
              {demoTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#E8E9E2]">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#1C211D]">
                        Good morning, Alex.
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6D756E]">
                        Here is your day at a glance · Tuesday, 24 October
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FFE1CC] text-[#F28A4B]">
                        Streak: 12 Days 🔥
                      </span>
                    </div>
                  </div>

                  {/* Today's Focus Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-5 hover:border-[#55B978]/40 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-[#F28A4B] uppercase tracking-wider">
                          Today's Training
                        </span>
                        <span className="material-symbols-outlined text-[#234B36] text-lg">fitness_center</span>
                      </div>
                      <h4 className="text-base font-bold text-[#1C211D]">Push Day A · Chest & Triceps</h4>
                      <p className="text-xs text-[#6D756E] mt-1">45 min duration · Barbell Bench, Incline DB, Dips</p>
                      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#E8E9E2]">
                        <span className="text-[#6D756E]">Progressive Overload Target</span>
                        <span className="font-semibold text-[#234B36]">+2.5kg (82.5 kg × 8)</span>
                      </div>
                    </div>

                    <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-5 hover:border-[#55B978]/40 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-[#F28A4B] uppercase tracking-wider">
                          Primary Deep Work Focus
                        </span>
                        <span className="material-symbols-outlined text-[#234B36] text-lg">task_alt</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => setDemoTaskCompleted(!demoTaskCompleted)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-colors ${
                            demoTaskCompleted
                              ? 'bg-[#234B36] border-[#234B36] text-white'
                              : 'border-[#E8E9E2] bg-white hover:border-[#234B36]'
                          }`}
                        >
                          {demoTaskCompleted && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                        </button>
                        <div>
                          <p className={`text-sm font-semibold text-[#1C211D] ${demoTaskCompleted ? 'line-through opacity-50' : ''}`}>
                            Finalize Q4 Product Roadmap & Portfolio Case Study
                          </p>
                          <p className="text-xs text-[#6D756E] mt-1">Due today · High Priority · 2 hours allocated</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#E8E9E2]">
                        <span className="text-[#6D756E]">Status</span>
                        <span className="font-semibold text-[#234B36]">
                          {demoTaskCompleted ? 'Completed ✓' : 'In Progress (Click check to complete)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Metrics Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-4">
                      <span className="text-xs font-semibold text-[#6D756E] uppercase">DAILY PROTEIN</span>
                      <p className="text-lg font-bold text-[#1C211D] mt-1">{demoProteinCurrent}g / 160g</p>
                      <p className="text-[11px] text-[#234B36] font-medium mt-1">15g remaining for dinner</p>
                    </div>

                    <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-4">
                      <span className="text-xs font-semibold text-[#6D756E] uppercase">JOB APPLICATIONS</span>
                      <p className="text-lg font-bold text-[#1C211D] mt-1">14 tracked</p>
                      <p className="text-[11px] text-[#F28A4B] font-medium mt-1">Next interview: Thursday 10:00 AM</p>
                    </div>

                    <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-4">
                      <span className="text-xs font-semibold text-[#6D756E] uppercase">DEEP WORK LOGGED</span>
                      <p className="text-lg font-bold text-[#1C211D] mt-1">3.5 hrs / 4.0 hrs target</p>
                      <p className="text-[11px] text-[#234B36] font-medium mt-1">88% of daily focus goal</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FITNESS & WORKOUT LOG */}
              {demoTab === 'fitness' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-[#E8E9E2]">
                    <div>
                      <h3 className="text-lg font-bold text-[#1C211D]">Push Day Hypertrophy · Active Log</h3>
                      <p className="text-xs text-[#6D756E]">Rest timer: 90 seconds between working sets</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-[#DDF3E4] text-[#234B36] rounded-lg">
                      In Progress
                    </span>
                  </div>

                  {/* Table of sets */}
                  <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-xl overflow-hidden shadow-xs">
                    <div className="p-4 bg-[#F8F7F2] border-b border-[#E8E9E2] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1C211D]">1. Barbell Flat Bench Press</span>
                      <span className="text-xs text-[#6D756E]">Target: Chest / Triceps</span>
                    </div>

                    <div className="divide-y divide-[#E8E9E2] text-xs">
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
                                  ? 'bg-[#234B36] border-[#234B36] text-white'
                                  : 'border-[#E8E9E2] bg-white hover:border-[#234B36]'
                              }`}
                            >
                              {demoWorkoutChecked[idx] && (
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                              )}
                            </button>
                            <span className="font-semibold text-[#1C211D]">Set {item.set}</span>
                          </div>

                          <span className="text-xs text-[#1C211D] font-medium">{item.weight}</span>
                          <span className="text-xs text-[#6D756E]">{item.reps}</span>
                          <span className="text-[#6D756E] hidden sm:inline">{item.rpe}</span>

                          <span
                            className={`text-[11px] font-semibold ${
                              demoWorkoutChecked[idx] ? 'text-[#234B36]' : 'text-[#6D756E]'
                            }`}
                          >
                            {demoWorkoutChecked[idx] ? 'Completed ✓' : 'Tap box to check'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-4 flex items-center justify-between text-xs">
                    <span className="text-[#6D756E]">Next Exercise in Split:</span>
                    <span className="font-bold text-[#1C211D]">Incline Dumbbell Press (3 Sets × 10 Reps)</span>
                  </div>
                </div>
              )}

              {/* TAB 3: MACROS & NUTRITION */}
              {demoTab === 'nutrition' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-[#E8E9E2]">
                    <div>
                      <h3 className="text-lg font-bold text-[#1C211D]">Daily Nutrition Targets</h3>
                      <p className="text-xs text-[#6D756E]">High-Protein Lean Bulk · Target: 2,400 kcal</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDemoProteinCurrent((p) => (p >= 160 ? 120 : p + 15))}
                      className="text-xs font-semibold px-3 py-1.5 bg-[#234B36] text-white rounded-lg hover:bg-[#1a3828] transition-colors cursor-pointer shadow-xs"
                    >
                      + Quick Log Protein (15g)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-4">
                      <span className="text-xs font-semibold text-[#6D756E] uppercase">CALORIES</span>
                      <p className="text-2xl font-bold text-[#1C211D] mt-1">2,180 / 2,400</p>
                      <p className="text-[11px] text-[#234B36] font-medium mt-1">220 kcal remaining</p>
                    </div>

                    <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-4">
                      <span className="text-xs font-semibold text-[#6D756E] uppercase">PROTEIN TARGET</span>
                      <p className="text-2xl font-bold text-[#234B36] mt-1">{demoProteinCurrent}g / 160g</p>
                      <p className="text-[11px] text-[#6D756E] mt-1">
                        {Math.max(0, 160 - demoProteinCurrent)}g remaining
                      </p>
                    </div>

                    <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-4">
                      <span className="text-xs font-semibold text-[#6D756E] uppercase">CARBS / FATS</span>
                      <p className="text-2xl font-bold text-[#1C211D] mt-1">240g / 65g</p>
                      <p className="text-[11px] text-[#6D756E] mt-1">Balanced macro ratio</p>
                    </div>
                  </div>

                  {/* Meals checklist */}
                  <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-[#F28A4B] uppercase tracking-wider">
                      Logged Meals Today
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1.5 border-b border-[#E8E9E2]">
                        <span className="text-[#1C211D]">Breakfast: 4 Eggs, Oats & Blueberries</span>
                        <strong className="text-[#234B36]">38g protein · 540 kcal</strong>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-[#E8E9E2]">
                        <span className="text-[#1C211D]">Lunch: Grilled Chicken Breast, Quinoa & Avocado</span>
                        <strong className="text-[#234B36]">52g protein · 720 kcal</strong>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-[#1C211D]">Post-Workout Shake & Banana</span>
                        <strong className="text-[#234B36]">30g protein · 320 kcal</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CAREER & JOB TRACKER */}
              {demoTab === 'career' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-[#E8E9E2]">
                    <div>
                      <h3 className="text-lg font-bold text-[#1C211D]">Job Application Pipeline</h3>
                      <p className="text-xs text-[#6D756E]">Organized application funnel with live follow-up alerts</p>
                    </div>
                    <span className="text-xs font-semibold text-[#234B36] bg-[#DDF3E4] px-3 py-1 rounded-lg">
                      14 Applications Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Column 1: Applied */}
                    <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#6D756E]">
                        <span>APPLIED (6)</span>
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      </div>
                      <div className="space-y-2.5">
                        <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-lg p-3 text-xs shadow-xs">
                          <p className="font-bold text-[#1C211D]">Product Designer</p>
                          <p className="text-[#6D756E] text-[11px]">Linear · Remote</p>
                          <div className="mt-2 text-[10px] text-[#6D756E] flex justify-between">
                            <span>Applied: 3d ago</span>
                            <span className="text-[#234B36] font-medium">Resume: Tech Clean</span>
                          </div>
                        </div>
                        <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-lg p-3 text-xs shadow-xs">
                          <p className="font-bold text-[#1C211D]">Frontend Engineer</p>
                          <p className="text-[#6D756E] text-[11px]">Stripe · Hybrid</p>
                          <div className="mt-2 text-[10px] text-[#6D756E] flex justify-between">
                            <span>Applied: 5d ago</span>
                            <span className="text-[#234B36] font-medium">ATS: 95%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Interviewing */}
                    <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#F28A4B]">
                        <span>INTERVIEW (2)</span>
                        <span className="w-2 h-2 rounded-full bg-[#F28A4B]"></span>
                      </div>
                      <div className="space-y-2.5">
                        <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-lg p-3 text-xs shadow-xs">
                          <p className="font-bold text-[#1C211D]">Full-Stack Developer</p>
                          <p className="text-[#6D756E] text-[11px]">Vercel · Remote</p>
                          <div className="mt-2 pt-2 border-t border-[#E8E9E2] text-[10.5px]">
                            <span className="font-semibold text-[#F28A4B] bg-[#FFE1CC] px-2 py-0.5 rounded">
                              Round 2: Technical Live Coding
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Offers */}
                    <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#234B36]">
                        <span>OFFER (1)</span>
                        <span className="w-2 h-2 rounded-full bg-[#55B978]"></span>
                      </div>
                      <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-lg p-3 text-xs shadow-xs">
                        <p className="font-bold text-[#1C211D]">Software Engineer II</p>
                        <p className="text-[#6D756E] text-[11px]">Supabase · Remote</p>
                        <div className="mt-2 pt-2 border-t border-[#E8E9E2] text-[10.5px] text-[#234B36] font-semibold">
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
                  <div className="flex justify-between items-center pb-3 border-b border-[#E8E9E2]">
                    <div>
                      <h3 className="text-lg font-bold text-[#1C211D]">24-Hour Time-Blocking Engine</h3>
                      <p className="text-xs text-[#6D756E]">Visual blocks ensuring uninterrupted focus time</p>
                    </div>
                    <span className="text-xs font-semibold text-[#234B36] bg-[#DDF3E4] px-3 py-1 rounded-lg">
                      Schedule Locked
                    </span>
                  </div>

                  <div className="bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl p-4 space-y-2 text-xs">
                    {[
                      { time: '06:30 - 08:00', title: 'Morning Routine & Push Workout', category: 'Workout', color: 'bg-[#DDF3E4] text-[#234B36]' },
                      { time: '09:00 - 12:30', title: 'Deep Work: Core Feature Engineering', category: 'Deep Work', color: 'bg-[#FFE1CC] text-[#F28A4B]' },
                      { time: '13:30 - 15:00', title: 'Team Sync & Candidate Pipeline Review', category: 'Meeting', color: 'bg-blue-50 text-blue-700' },
                      { time: '16:00 - 17:30', title: 'Interview Preparation & System Design Practice', category: 'Study', color: 'bg-amber-50 text-amber-700' },
                    ].map((block, idx) => (
                      <div key={idx} className="p-3 bg-[#FFFFFF] border border-[#E8E9E2] rounded-lg flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-medium text-[#6D756E] w-28 shrink-0">{block.time}</span>
                          <span className="font-semibold text-[#1C211D]">{block.title}</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md shrink-0 ${block.color}`}>
                          {block.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Demo Bar with CTA */}
            <div className="p-4 sm:p-5 bg-[#F8F7F2] border-t border-[#E8E9E2] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs sm:text-sm text-[#6D756E] text-center sm:text-left">
                Ready to manage your fitness, career, and productivity in one clean workspace?
              </span>
              <Link
                to="/signup"
                onClick={() => trackEvent('signup_button_clicked', { source: 'demo_bottom_cta' })}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#234B36] hover:bg-[#1a3828] transition-colors whitespace-nowrap cursor-pointer shadow-xs"
              >
                Create Your Account Free
              </Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION (Phase 2 & 8) */}
        <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[#E8E9E2] scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F28A4B] mb-2 font-mono">
              Three Simple Steps
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1C211D] tracking-tight mb-3">
              How LEVELUP Works
            </h2>
            <p className="text-sm sm:text-base text-[#6D756E] leading-relaxed">
              No complex setup. You can be up and running with your personalized routine in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-[#55B978]/40 shadow-xs hover:shadow-sm transition-all">
              <div>
                <span className="text-xs font-bold text-[#234B36] bg-[#DDF3E4] px-3 py-1 rounded-md uppercase tracking-wider inline-block mb-4 font-mono">
                  Step 01
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#1C211D] mb-2">
                  Set Your Baselines
                </h3>
                <p className="text-xs sm:text-sm text-[#6D756E] leading-relaxed">
                  Choose your focus areas: workout frequency, target protein goals, career objectives, and daily priorities. LEVELUP adapts your initial dashboard immediately.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E9E2] text-[11px] text-[#6D756E]">
                Takes 60 seconds · Fully customizable
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-[#55B978]/40 shadow-xs hover:shadow-sm transition-all">
              <div>
                <span className="text-xs font-bold text-[#234B36] bg-[#DDF3E4] px-3 py-1 rounded-md uppercase tracking-wider inline-block mb-4 font-mono">
                  Step 02
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#1C211D] mb-2">
                  Execute From One Workspace
                </h3>
                <p className="text-xs sm:text-sm text-[#6D756E] leading-relaxed">
                  Check off exercises set-by-set in the gym, log daily protein and meals, track job applications, and protect your uninterrupted focus hours.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E9E2] text-[11px] text-[#6D756E]">
                Zero app switching · Accessible anywhere
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-[#55B978]/40 shadow-xs hover:shadow-sm transition-all">
              <div>
                <span className="text-xs font-bold text-[#234B36] bg-[#DDF3E4] px-3 py-1 rounded-md uppercase tracking-wider inline-block mb-4 font-mono">
                  Step 03
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#1C211D] mb-2">
                  Review & Level Up
                </h3>
                <p className="text-xs sm:text-sm text-[#6D756E] leading-relaxed">
                  Watch your progressive overload lift numbers rise, build compounding habit streaks, and land interviews with polished ATS resumes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E9E2] text-[11px] text-[#6D756E]">
                Compounding momentum · Tangible outcomes
              </div>
            </div>
          </div>
        </section>

        {/* PHASE 7: IMPROVE TRUST & TRANSPARENCY SECTION */}
        <section id="trust" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[#E8E9E2]">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#234B36] mb-2 font-mono">
              Honest & Transparent
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1C211D] tracking-tight mb-3">
              Why People Choose LEVELUP
            </h2>
            <p className="text-sm sm:text-base text-[#6D756E] leading-relaxed">
              Clear answers about what we offer, who benefits, and how your data is handled.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-2xl p-6 shadow-xs hover:border-[#55B978]/40 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#DDF3E4] text-[#234B36] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl">hub</span>
              </div>
              <h3 className="text-base font-bold text-[#1C211D] mb-2">What LEVELUP Offers</h3>
              <p className="text-xs sm:text-sm text-[#6D756E] leading-relaxed">
                An all-in-one personal operating system that replaces five or more disjointed subscription apps for fitness, nutrition, career tracking, and productivity.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-2xl p-6 shadow-xs hover:border-[#55B978]/40 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#DDF3E4] text-[#234B36] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl">group</span>
              </div>
              <h3 className="text-base font-bold text-[#1C211D] mb-2">Who Benefits Most</h3>
              <p className="text-xs sm:text-sm text-[#6D756E] leading-relaxed">
                College students balancing classes and job searches, young professionals building their career and physique, and self-directed builders wanting daily discipline.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-2xl p-6 shadow-xs hover:border-[#55B978]/40 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#DDF3E4] text-[#234B36] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl">devices</span>
              </div>
              <h3 className="text-base font-bold text-[#1C211D] mb-2">Instant Web Access</h3>
              <p className="text-xs sm:text-sm text-[#6D756E] leading-relaxed">
                No bulky app downloads or App Store approval delays. Open LEVELUP in any modern browser on iOS, Android, macOS, or Windows seamlessly.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-2xl p-6 shadow-xs hover:border-[#55B978]/40 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#DDF3E4] text-[#234B36] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl">lock</span>
              </div>
              <h3 className="text-base font-bold text-[#1C211D] mb-2">Data Privacy & Security</h3>
              <p className="text-xs sm:text-sm text-[#6D756E] leading-relaxed">
                Your data is protected by Supabase PostgreSQL Row Level Security. Only your authenticated user ID can view or update your logs. We never sell your data.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-2xl p-6 shadow-xs hover:border-[#55B978]/40 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#DDF3E4] text-[#234B36] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl">price_check</span>
              </div>
              <h3 className="text-base font-bold text-[#1C211D] mb-2">Free vs. Pro Clarity</h3>
              <p className="text-xs sm:text-sm text-[#6D756E] leading-relaxed">
                You can use our core tracking tools completely free. If you want unlimited AI intelligence and unlimited records, Pro is just ₹129/month with instant 1-click cancellation.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-2xl p-6 shadow-xs hover:border-[#55B978]/40 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#DDF3E4] text-[#234B36] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl">support_agent</span>
              </div>
              <h3 className="text-base font-bold text-[#1C211D] mb-2">Direct Support</h3>
              <p className="text-xs sm:text-sm text-[#6D756E] leading-relaxed">
                Have questions or need assistance? Our support team is directly reachable via email at <span className="font-medium text-[#234B36]">support@levelup.app</span>.
              </p>
            </div>
          </div>
        </section>

        {/* PHASE 9: REVIEW PRICING (HONEST FREE VS. PRO BREAKDOWN) */}
        <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[#E8E9E2] scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F28A4B] mb-2 font-mono">
              Transparent Pricing
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1C211D] tracking-tight mb-3">
              Start Free. Upgrade Anytime.
            </h2>
            <p className="text-sm sm:text-base text-[#6D756E] leading-relaxed">
              Experience the core platform for free. Upgrade to Pro whenever you want unconstrained capacity and AI power.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* Free Tier Card */}
            <div className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex justify-between items-baseline mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#1C211D]">LEVELUP Free</h3>
                    <p className="text-xs text-[#6D756E] mt-0.5">Core tools for personal growth</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-[#1C211D]">₹0</span>
                    <span className="text-xs text-[#6D756E] block">Forever free</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E9E2] space-y-3 text-xs text-[#1C211D]">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check</span>
                    <span>Up to 3 Workout Plans & live exercise logging</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check</span>
                    <span>Up to 2 Diet Plans & daily protein tracking</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check</span>
                    <span>Up to 20 Job Applications in pipeline tracker</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check</span>
                    <span>2 ATS Resume Blueprints with PDF export</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check</span>
                    <span>1 Published Personal Portfolio website</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check</span>
                    <span>24-Hour Time-Blocking Daily Planner</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check</span>
                    <span>Habit consistency streaks and daily priority tasks</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check</span>
                    <span>Student courses, exam countdowns & finance budget tracking</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  to="/signup"
                  onClick={() => trackEvent('signup_button_clicked', { source: 'pricing_free' })}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-semibold text-[#1C211D] bg-[#F8F7F2] hover:bg-[#E8E9E2] border border-[#E8E9E2] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Get Started Free</span>
                </Link>
                <p className="text-[11px] text-[#6D756E] text-center mt-2">
                  No credit card required
                </p>
              </div>
            </div>

            {/* Pro Plan Card */}
            <div className="bg-[#FFFFFF] border-2 border-[#55B978] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FFE1CC] text-[#F28A4B] text-[11px] font-semibold uppercase tracking-wider px-3.5 py-1 rounded-bl-xl">
                Most Popular
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#1C211D] flex items-center gap-2">
                      <span>LEVELUP Pro</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#DDF3E4] text-[#234B36] font-semibold">UNLIMITED</span>
                    </h3>
                    <p className="text-xs text-[#6D756E] mt-0.5">Unlimited AI & unrestricted capacity</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#234B36]">₹129</span>
                    <span className="text-xs text-[#6D756E] block">per month</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E9E2] space-y-3 text-xs text-[#1C211D]">
                  <div className="flex items-start gap-2.5 font-semibold text-[#F28A4B]">
                    <span className="material-symbols-outlined text-base shrink-0 mt-0.5">auto_awesome</span>
                    <span>Everything in Free, plus:</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>Unlimited AI Workout & Hypertrophy Split Generation</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>Unlimited AI Diet & Macro Meal Plan Generation</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>Gemini ATS Resume Scoring & Google XYZ Bullet Optimization</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>AI Mock Interview Coach with technical question reviews</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>Unlimited Workout Plans, Diet Plans & Job Applications</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>Business CRM: Unlimited Clients, Proposals & Automated Invoices</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#55B978] text-base shrink-0 mt-0.5">check_circle</span>
                    <span>Advanced Progressive Overload & Macro Trend Analytics</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  to="/signup"
                  onClick={() => trackEvent('signup_button_clicked', { source: 'pricing_pro' })}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#234B36] hover:bg-[#1a3828] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Start with LEVELUP Pro</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
                <p className="text-[11px] text-[#6D756E] text-center mt-2">
                  ₹129/month · Cancel anytime with 1 click
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-16 sm:py-24 px-4 sm:px-8 max-w-3xl mx-auto border-t border-[#E8E9E2] scroll-mt-20">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F28A4B] mb-2 font-mono">
              Frequently Asked Questions
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C211D]">
              Common Inquiries
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-xl overflow-hidden hover:border-[#55B978]/40 shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 sm:p-5 flex justify-between items-center text-sm font-semibold text-[#1C211D] hover:text-[#234B36] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-[#6D756E] transition-transform">
                    {openFaq === idx ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#6D756E] leading-relaxed border-t border-[#E8E9E2] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CONVERSION CALL-TO-ACTION (Phase 8) */}
        <section className="py-20 sm:py-24 px-4 sm:px-8 bg-gradient-to-b from-[#F8F7F2] to-[#FFFFFF] border-t border-[#E8E9E2] text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDF3E4] text-[#234B36] text-xs font-medium mb-4">
              <span>✦</span>
              <span>TRANSFORM YOUR AMBITIONS INTO HABITS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1C211D] tracking-tight mb-3">
              Your Next Level Starts Here.
            </h2>
            <p className="text-sm sm:text-base text-[#6D756E] mb-8 leading-relaxed max-w-lg mx-auto">
              Bring your fitness, career, nutrition, and daily focus together today. Create your workspace in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                onClick={() => trackEvent('signup_button_clicked', { source: 'final_cta' })}
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#234B36] hover:bg-[#1a3828] transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Started Free</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-medium text-[#234B36] bg-[#FFFFFF] hover:bg-[#F8F7F2] border border-[#E8E9E2] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              >
                <span>Explore Features</span>
              </a>
            </div>
            <p className="text-xs text-[#6D756E] mt-4">
              Your goals · Your progress · Your growth
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="legal" className="bg-[#F8F7F2] border-t border-[#E8E9E2] py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
            <Link to="/" className="text-xl font-bold text-[#234B36] flex items-center gap-1.5">
              <span className="text-[#55B978]">↗</span>
              <span>LEVELUP</span>
            </Link>
            <span className="text-xs text-[#6D756E] sm:border-l sm:border-[#E8E9E2] sm:pl-4">
              The Unified Personal Performance Workspace
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[#6D756E]">
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="hover:text-[#234B36] transition-colors"
            >
              Features
            </a>
            <a
              href="#demo"
              onClick={(e) => scrollToSection(e, 'demo')}
              className="hover:text-[#234B36] transition-colors"
            >
              Preview
            </a>
            <a
              href="#pricing"
              onClick={(e) => scrollToSection(e, 'pricing')}
              className="hover:text-[#234B36] transition-colors"
            >
              Pricing
            </a>
            <button
              type="button"
              onClick={() => setActiveLegalModal('privacy')}
              className="hover:text-[#234B36] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-[#234B36] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('contact')}
              className="hover:text-[#234B36] transition-colors cursor-pointer"
            >
              Contact Support
            </button>
            <Link to="/login" className="hover:text-[#234B36] transition-colors">
              Log In
            </Link>
          </div>

          <p className="text-xs text-[#6D756E]">
            © {new Date().getFullYear()} LEVELUP. All rights reserved.
          </p>
        </div>
      </footer>

      {/* LEGAL & CONTACT MODAL */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className="bg-[#FFFFFF] border border-[#E8E9E2] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden text-[#1C211D]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#E8E9E2] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1C211D]">
                {activeLegalModal === 'privacy' && 'Privacy Policy'}
                {activeLegalModal === 'terms' && 'Terms of Service'}
                {activeLegalModal === 'contact' && 'Contact Support'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="p-1 rounded-lg text-[#6D756E] hover:text-[#1C211D] hover:bg-[#F8F7F2] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#6D756E] leading-relaxed">
              {activeLegalModal === 'privacy' && (
                <>
                  <p>
                    <strong className="text-[#1C211D]">1. Commitment to Privacy:</strong> At LEVELUP, your personal data is treated with utmost security and privacy. We only collect the necessary credentials (email and password) to authenticate your access.
                  </p>
                  <p>
                    <strong className="text-[#1C211D]">2. Data Storage & Encryption:</strong> All account data, workouts, nutrition profiles, job applications, and personal records are stored in Supabase with PostgreSQL Row Level Security (RLS) and encrypted at rest.
                  </p>
                  <p>
                    <strong className="text-[#1C211D]">3. Zero Data Selling:</strong> We do not sell, rent, or monetize your personal information or training records to advertisers or third parties.
                  </p>
                  <p>
                    <strong className="text-[#1C211D]">4. Account Deletion:</strong> You retain complete ownership of your data and can request complete account deletion at any time by contacting support.
                  </p>
                </>
              )}

              {activeLegalModal === 'terms' && (
                <>
                  <p>
                    <strong className="text-[#1C211D]">1. Service Usage:</strong> LEVELUP provides an all-in-one personal productivity and tracking workspace. You are responsible for maintaining the confidentiality of your login credentials.
                  </p>
                  <p>
                    <strong className="text-[#1C211D]">2. Subscriptions & Billing:</strong> The Free tier provides core functionality at no cost. The Pro membership is billed at ₹129 per month and can be canceled at any time from your settings.
                  </p>
                  <p>
                    <strong className="text-[#1C211D]">3. Health & Fitness Disclaimer:</strong> Workout logs and nutrition suggestions are intended for informational self-tracking purposes and do not replace personalized medical advice from certified physicians.
                  </p>
                  <p>
                    <strong className="text-[#1C211D]">4. Service Modifications:</strong> We continuously improve the platform with regular feature updates and performance optimizations.
                  </p>
                </>
              )}

              {activeLegalModal === 'contact' && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-[#DDF3E4] text-[#234B36] flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-2xl">mail</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1C211D] text-base">We're here to help</h4>
                    <p className="text-xs text-[#6D756E] mt-1">
                      Whether you have questions, feedback, or need account help:
                    </p>
                  </div>
                  <div className="p-3 bg-[#F8F7F2] border border-[#E8E9E2] rounded-xl font-mono text-sm font-semibold text-[#234B36]">
                    support@levelup.app
                  </div>
                  <p className="text-xs text-[#6D756E]">
                    Typical response time: within 24 hours.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#F8F7F2] border-t border-[#E8E9E2] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#234B36] text-white rounded-lg hover:bg-[#1a3828] transition-colors cursor-pointer"
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
