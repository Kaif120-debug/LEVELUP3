import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';

interface FeatureItem {
  id: string;
  title: string;
  detail: string;
  metric: string;
  icon: string;
  tag: string;
  path?: string;
}

interface StairStep {
  stepIndex: number;
  level: string;
  coordY: string;
  blockName: string;
  category: string;
  tagline: string;
  colorTheme: {
    treadBg: string;
    riserBg: string;
    borderLight: string;
    borderDark: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
  };
  pixelIcon: string;
  features: FeatureItem[];
}

export const MinecraftFeatureStairs: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isClimbing, setIsClimbing] = useState<boolean>(false);

  // 5 Ascending Minecraft-styled stair steps covering ALL website features
  const stairSteps: StairStep[] = [
    {
      stepIndex: 0,
      level: 'LVL 01',
      coordY: 'Y: 64',
      blockName: 'OAK & STONE STAIR',
      category: 'Fitness & Physical Foundation',
      tagline: 'Build strength, volume, and bodily resilience',
      colorTheme: {
        treadBg: 'bg-[#2E5E41]',
        riserBg: 'bg-[#1E3F2D]',
        borderLight: '#55B978',
        borderDark: '#12261B',
        accent: '#55B978',
        badgeBg: 'bg-[#55B978]/20',
        badgeText: 'text-[#6FE89D]',
      },
      pixelIcon: 'fitness_center',
      features: [
        {
          id: 'fit-1',
          title: 'Push / Pull / Legs Logging',
          detail: '4-day split · Log sets, reps & RPE in 3 taps',
          metric: '+2.5 kg PR',
          icon: 'fitness_center',
          tag: 'Workouts',
          path: '/fitness',
        },
        {
          id: 'fit-2',
          title: 'Progressive Overload Engine',
          detail: 'Auto-calculates optimal weight increases each week',
          metric: '12-Day Streak',
          icon: 'trending_up',
          tag: 'Strength',
          path: '/fitness',
        },
        {
          id: 'fit-3',
          title: '300+ Exercise Library',
          detail: 'Biomechanical cues, anatomy targets & video demos',
          metric: '320+ Moves',
          icon: 'sports_gymnastics',
          tag: 'Exercises',
          path: '/fitness',
        },
        {
          id: 'fit-4',
          title: 'Smart Rest Countdown Timer',
          detail: 'Automatic 60s/90s rest alert between heavy working sets',
          metric: 'Set 3 of 4',
          icon: 'timer',
          tag: 'Live Gym',
          path: '/fitness',
        },
        {
          id: 'fit-5',
          title: 'Readiness & Soreness Check',
          detail: 'Prevents overtraining with sleep & recovery scoring',
          metric: '94% Ready',
          icon: 'monitor_heart',
          tag: 'Recovery',
          path: '/fitness',
        },
      ],
    },
    {
      stepIndex: 1,
      level: 'LVL 02',
      coordY: 'Y: 70',
      blockName: 'PRISMARINE STAIR',
      category: 'Metabolic Fuel & Nutrition',
      tagline: 'Fuel your energy, hit daily protein, and manage weight',
      colorTheme: {
        treadBg: 'bg-[#285741]',
        riserBg: 'bg-[#1A3B2B]',
        borderLight: '#4ECA92',
        borderDark: '#0F241A',
        accent: '#4ECA92',
        badgeBg: 'bg-[#4ECA92]/20',
        badgeText: 'text-[#8BF3C3]',
      },
      pixelIcon: 'restaurant',
      features: [
        {
          id: 'nut-1',
          title: 'Calorie Deficit & Surplus Target',
          detail: 'Dynamic TDEE calculator calibrated to your goals',
          metric: '2,150 / 2,300 kcal',
          icon: 'local_fire_department',
          tag: 'Diet Pace',
          path: '/nutrition',
        },
        {
          id: 'nut-2',
          title: 'Protein & Macro Split Log',
          detail: '145g of 160g completed today with macro breakdown',
          metric: '91% Goal Met',
          icon: 'pie_chart',
          tag: 'Macros',
          path: '/nutrition',
        },
        {
          id: 'nut-3',
          title: 'Rapid Meal & Food Logger',
          detail: 'Fast food search, barcode scan, and custom meal templates',
          metric: '3 Meals Logged',
          icon: 'restaurant_menu',
          tag: 'Meals',
          path: '/nutrition',
        },
        {
          id: 'nut-4',
          title: 'Hydration & Water Intake',
          detail: 'Visual 3.5L water jug tracker with reminder intervals',
          metric: '2.8L / 3.5L',
          icon: 'water_drop',
          tag: 'Hydration',
          path: '/nutrition',
        },
        {
          id: 'nut-5',
          title: 'Smart Grocery Fuel Checklist',
          detail: 'Auto-generates clean grocery lists based on your weekly meals',
          metric: '18 Items',
          icon: 'shopping_bag',
          tag: 'Pantry',
          path: '/nutrition',
        },
      ],
    },
    {
      stepIndex: 2,
      level: 'LVL 03',
      coordY: 'Y: 76',
      blockName: 'IRON & EMERALD STAIR',
      category: 'Career & Professional Edge',
      tagline: 'Build resume leverage, land dream roles, and showcase work',
      colorTheme: {
        treadBg: 'bg-[#315340]',
        riserBg: 'bg-[#1E3729]',
        borderLight: '#F28A4B',
        borderDark: '#122017',
        accent: '#F28A4B',
        badgeBg: 'bg-[#F28A4B]/20',
        badgeText: 'text-[#FFA876]',
      },
      pixelIcon: 'work',
      features: [
        {
          id: 'car-1',
          title: 'ATS Resume Builder',
          detail: 'Google XYZ bullet format with real-time keyword scoring',
          metric: '94% ATS Score',
          icon: 'description',
          tag: 'Resume',
          path: '/career',
        },
        {
          id: 'car-2',
          title: 'Job Pipeline Kanban',
          detail: 'Drag-and-drop tracker for Stripe, Linear, Figma & 12 apps',
          metric: '2 Interviews',
          icon: 'view_kanban',
          tag: 'Pipeline',
          path: '/career/tracker',
        },
        {
          id: 'car-3',
          title: 'Published Portfolio Showcase',
          detail: 'Custom live URL with 6 aesthetic themes and zero code',
          metric: 'Live Portfolio',
          icon: 'language',
          tag: 'Showcase',
          path: '/career/portfolio',
        },
        {
          id: 'car-4',
          title: 'AI STAR Mock Interview',
          detail: 'Real-time roleplay for behavioral & technical questions',
          metric: 'AI Ready',
          icon: 'record_voice_over',
          tag: 'Interview Prep',
          path: '/career/interview-prep',
        },
        {
          id: 'car-5',
          title: 'Freelance CRM & Invoicing',
          detail: 'Client contracts, proposal signatures and ₹45,000 invoices',
          metric: '₹45,000 Paid',
          icon: 'receipt_long',
          tag: 'Business',
          path: '/business',
        },
      ],
    },
    {
      stepIndex: 3,
      level: 'LVL 04',
      coordY: 'Y: 82',
      blockName: 'REDSTONE & GOLD STAIR',
      category: 'Focus & Productivity',
      tagline: 'Execute deep work sessions with visual time blocking',
      colorTheme: {
        treadBg: 'bg-[#2E4A3B]',
        riserBg: 'bg-[#1D3227]',
        borderLight: '#55B978',
        borderDark: '#101C15',
        accent: '#55B978',
        badgeBg: 'bg-[#55B978]/20',
        badgeText: 'text-[#6FE89D]',
      },
      pixelIcon: 'schedule',
      features: [
        {
          id: 'pro-1',
          title: '24-Hour Time Blocking',
          detail: 'Color-coded morning, deep work, and evening time boxes',
          metric: '4.5h Deep Work',
          icon: 'schedule',
          tag: 'Daily Schedule',
          path: '/planner',
        },
        {
          id: 'pro-2',
          title: 'Deep Work Pomodoro Timer',
          detail: '50/10 focus intervals with lo-fi soundscapes and streak counter',
          metric: 'Flow State',
          icon: 'timelapse',
          tag: 'Focus Timer',
          path: '/planner',
        },
        {
          id: 'pro-3',
          title: 'Eisenhower Priority Matrix',
          detail: 'Sort tasks into Urgent/Important quadrants instantly',
          metric: '3 Priority Tasks',
          icon: 'grid_view',
          tag: 'Task Sprints',
          path: '/planner',
        },
        {
          id: 'pro-4',
          title: 'Distraction Shield & Log',
          detail: 'Log intrusive thoughts without breaking current focus sprint',
          metric: 'Zero Context Loss',
          icon: 'shield',
          tag: 'Flow Shield',
          path: '/planner',
        },
        {
          id: 'pro-5',
          title: 'Weekly Retrospective & Audit',
          detail: 'Visual heatmap showing planned vs actual hours spent',
          metric: '88% Efficiency',
          icon: 'insights',
          tag: 'Analytics',
          path: '/planner',
        },
      ],
    },
    {
      stepIndex: 4,
      level: 'LVL 05',
      coordY: 'Y: 88',
      blockName: 'NETHERITE & DIAMOND STAIR',
      category: 'Mastery: Habits, Goals & Life',
      tagline: 'The summit of life alignment—streaks, finance & big dreams',
      colorTheme: {
        treadBg: 'bg-[#274635]',
        riserBg: 'bg-[#182F23]',
        borderLight: '#E8A338',
        borderDark: '#0D1A13',
        accent: '#E8A338',
        badgeBg: 'bg-[#E8A338]/20',
        badgeText: 'text-[#FFD782]',
      },
      pixelIcon: 'hotel_class',
      features: [
        {
          id: 'mas-1',
          title: 'Daily Habit Streak Chains',
          detail: 'Morning mobility, reading, deep work & hydration chains',
          metric: '14-Day Streak',
          icon: 'check_circle',
          tag: 'Habit Engine',
          path: '/dashboard',
        },
        {
          id: 'mas-2',
          title: 'Quarterly Life Milestones (OKRs)',
          detail: 'Keep all 4 life pillars aligned in one cohesive mission dashboard',
          metric: '82% Achieved',
          icon: 'flag',
          tag: 'Quarterly OKRs',
          path: '/dashboard',
        },
        {
          id: 'mas-3',
          title: 'Student Semester & Exam Tracker',
          detail: 'Course syllabus pacing, GPA forecasting, and test countdowns',
          metric: 'GPA 3.9',
          icon: 'school',
          tag: 'Academics',
          path: '/student',
        },
        {
          id: 'mas-4',
          title: 'Personal Budget & Savings Target',
          detail: 'Track emergency funds, investments, and discretionary burn',
          metric: '₹24,500 Saved',
          icon: 'account_balance_wallet',
          tag: 'Finance',
          path: '/finance',
        },
        {
          id: 'mas-5',
          title: 'LevelUp Synergy Score',
          detail: 'Unified daily metric rewarding balance across all 5 life steps',
          metric: '920 / 1000 XP',
          icon: 'military_tech',
          tag: 'Overall Level',
          path: '/dashboard',
        },
      ],
    },
  ];

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsClimbing(true);
    setTimeout(() => setIsClimbing(false), 350);
    trackEvent('feature_section_viewed', {
      category: stairSteps[index].category,
      source: 'minecraft_stair_step',
    });
  };

  const handleClimbNext = () => {
    const next = (activeStep + 1) % stairSteps.length;
    handleStepClick(next);
  };

  const handleStepDown = () => {
    const prev = activeStep === 0 ? stairSteps.length - 1 : activeStep - 1;
    handleStepClick(prev);
  };

  const currentStepData = stairSteps[activeStep];
  const progressPercent = ((activeStep + 1) / stairSteps.length) * 100;

  return (
    <section className="relative w-full py-12 sm:py-16 bg-[#162E20] border-y border-[#264E37] text-white overflow-hidden pointer-events-auto select-none shadow-2xl">
      {/* Minecraft Voxel Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      {/* Ambient Lighting Orbs */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#55B978]/15 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER: MINECRAFT-INSPIRED RETRO-MODERN BADGE & TITLE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10 pb-6 border-b border-[#28533C]">
          <div>
            {/* Minecraft Pixel Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#102419] border-2 border-[#386F4E] shadow-[2px_2px_0px_#0A1710] mb-3">
              <span className="w-2 h-2 bg-[#55B978] shadow-[0_0_8px_#55B978]" />
              <span className="text-[11px] font-mono tracking-widest text-[#8DE0A9] font-bold uppercase">
                MINECRAFT-STYLE ASCENT // ALL FEATURES STEP-BY-STEP
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Climb the Stairs.</span>
              <span className="text-[#55B978] drop-shadow-[0_2px_10px_rgba(85,185,120,0.3)]">
                Master Every Pillar.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#BDD1C4] mt-2 max-w-xl font-normal leading-relaxed">
              Ascend block by block. Every step represents a vital domain of your life—complete with all tools, trackers, and AI engines built in.
            </p>
          </div>

          {/* CLIMB CONTROLS & STEP COUNTER */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleStepDown}
              className="px-3.5 py-2 bg-[#204430] hover:bg-[#2A593E] active:bg-[#163022] border-2 border-t-[#3D7755] border-l-[#3D7755] border-b-[#0F2217] border-r-[#0F2217] text-xs font-mono font-bold text-white flex items-center gap-1.5 shadow-[2px_2px_0px_#0A1710] cursor-pointer transition-transform active:translate-y-0.5"
              title="Previous Step"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>STEP DOWN</span>
            </button>

            <button
              onClick={handleClimbNext}
              className="px-4 py-2 bg-[#55B978] hover:bg-[#62CD87] active:bg-[#439660] border-2 border-t-[#8DE0A9] border-l-[#8DE0A9] border-b-[#1C512F] border-r-[#1C512F] text-xs font-mono font-bold text-[#0D2115] flex items-center gap-1.5 shadow-[2px_2px_0px_#0A1710] cursor-pointer transition-transform active:translate-y-0.5"
              title="Next Step"
            >
              <span>ASCEND NEXT</span>
              <span className="material-symbols-outlined text-base font-bold">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* MINECRAFT EXP PROGRESS BAR */}
        <div className="mb-10 sm:mb-12 bg-[#0F2217] p-3 sm:p-4 border-2 border-t-[#224A34] border-l-[#224A34] border-b-[#07130C] border-r-[#07130C] shadow-[3px_3px_0px_#07130C]">
          <div className="flex flex-wrap items-center justify-between text-xs font-mono mb-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#55B978] font-bold">CURRENT POSITION:</span>
              <span className="px-2 py-0.5 bg-[#234B36] text-white border border-[#3E7A57] font-bold text-[11px]">
                {currentStepData.level} · {currentStepData.coordY}
              </span>
              <span className="text-[#BDD1C4] hidden sm:inline">[{currentStepData.blockName}]</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#9ECBB0]">
                ASCENT PROGRESS: <strong className="text-white">{progressPercent}%</strong>
              </span>
              <span className="text-xs px-2 py-0.5 bg-[#55B978]/25 text-[#7EF0AD] border border-[#55B978]/40 font-bold">
                EXP: {((activeStep + 1) * 200)} / 1000
              </span>
            </div>
          </div>

          {/* Minecraft Pixelated Green Segments Bar */}
          <div className="relative w-full h-4 sm:h-5 bg-[#0A1710] border-2 border-black p-0.5 flex gap-1">
            {stairSteps.map((step, idx) => {
              const isFilled = idx <= activeStep;
              const isCurrent = idx === activeStep;
              return (
                <div
                  key={`seg-${idx}`}
                  onClick={() => handleStepClick(idx)}
                  className={`flex-1 h-full cursor-pointer transition-all relative overflow-hidden ${
                    isFilled
                      ? 'bg-gradient-to-b from-[#8DE0A9] via-[#55B978] to-[#2B6D43]'
                      : 'bg-[#152B1F] hover:bg-[#1C3A2A]'
                  } ${isCurrent ? 'ring-1 ring-white' : ''}`}
                  title={`Step ${idx + 1}: ${step.category}`}
                >
                  {/* Subtle pixel segmented bevel */}
                  <div className="absolute inset-0 border-t border-white/30 border-b border-black/40 pointer-events-none" />
                </div>
              );
            })}

            {/* Glowing Level Badge in Center */}
            <div className="absolute left-1/2 -top-3.5 -translate-x-1/2 px-2.5 py-0.5 bg-[#102419] border-2 border-[#55B978] text-[#8DE0A9] font-mono text-[11px] font-black shadow-[0_0_10px_rgba(85,185,120,0.5)]">
              Lv. {activeStep + 1}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* THE MINECRAFT STAIRS ARCHITECTURE (ASCENDING STEPS VIEW)      */}
        {/* ============================================================ */}
        <div className="mb-10 sm:mb-14">
          
          {/* DESKTOP & TABLET PANORAMIC STAIRCASE */}
          <div className="hidden lg:grid grid-cols-5 gap-3.5 items-end pt-12 pb-6 px-2">
            {stairSteps.map((step, idx) => {
              const isSelected = idx === activeStep;
              // Ascending vertical elevation like real stairs!
              // Step 0 is lowest (offset 0), Step 4 is highest (+96px elevation upward)
              const stepElevations = [
                'translate-y-[96px]',
                'translate-y-[72px]',
                'translate-y-[48px]',
                'translate-y-[24px]',
                'translate-y-0',
              ];

              return (
                <div
                  key={step.level}
                  onClick={() => handleStepClick(idx)}
                  className={`group relative flex flex-col transition-all duration-300 cursor-pointer ${stepElevations[idx]}`}
                >
                  {/* PLAYER AVATAR PIN WHEN ON THIS STEP */}
                  {isSelected && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 animate-bounce">
                      <div className="px-2 py-0.5 bg-[#55B978] text-[#0D2115] text-[10px] font-mono font-black uppercase border border-white shadow-[0_0_8px_#55B978]">
                        YOU ARE HERE ▲
                      </div>
                      <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-[#55B978]" />
                    </div>
                  )}

                  {/* 3D MINECRAFT STAIR BLOCK STRUCTURE */}
                  <div
                    className={`relative rounded-none transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-[#55B978] shadow-[0_0_24px_rgba(85,185,120,0.35)] -translate-y-1'
                        : 'opacity-85 hover:opacity-100 hover:-translate-y-0.5'
                    }`}
                  >
                    {/* STEP TREAD (FLAT TOP FACE) */}
                    <div
                      className={`p-3 border-t-4 border-l-4 border-r-4 ${
                        isSelected
                          ? 'border-t-[#8DE0A9] border-l-[#8DE0A9] border-r-[#1E4E32] bg-[#2E6845]'
                          : 'border-t-[#4A8561] border-l-[#4A8561] border-r-[#153021] bg-[#224A33] group-hover:bg-[#28573D]'
                      } border-b-2 border-b-[#142B1D]`}
                    >
                      {/* Step Header info */}
                      <div className="flex items-center justify-between font-mono text-[11px] mb-2">
                        <span
                          className={`font-black px-1.5 py-0.5 ${
                            isSelected
                              ? 'bg-[#55B978] text-[#0A1710]'
                              : 'bg-[#102419] text-[#8DE0A9]'
                          } border border-black/40`}
                        >
                          {step.level}
                        </span>
                        <span className="text-[#8DE0A9] text-[10px]">{step.coordY}</span>
                      </div>

                      {/* Step Title */}
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-6 h-6 bg-[#102419] border border-[#3E7754] flex items-center justify-center shrink-0"
                          style={{
                            boxShadow: isSelected ? '0 0 8px rgba(85,185,120,0.5)' : 'none',
                          }}
                        >
                          <span
                            className="material-symbols-outlined text-sm"
                            style={{ color: step.colorTheme.accent }}
                          >
                            {step.pixelIcon}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white tracking-tight leading-snug line-clamp-1">
                          {step.category.split('·')[0]}
                        </h4>
                      </div>

                      <div className="text-[10px] font-mono text-[#8DE0A9] truncate">
                        {step.blockName}
                      </div>
                    </div>

                    {/* STEP RISER (VERTICAL FRONT FACE WITH VOXEL BRICK TEXTURE) */}
                    <div
                      className={`p-3 border-b-4 border-l-4 border-r-4 ${
                        isSelected
                          ? 'border-b-[#0A1810] border-l-[#224E33] border-r-[#0A1810] bg-[#163323]'
                          : 'border-b-[#0A1810] border-l-[#183925] border-r-[#0A1810] bg-[#12281C]'
                      }`}
                    >
                      {/* Feature previews embedded directly on the step */}
                      <div className="space-y-1.5">
                        {step.features.slice(0, 3).map((feat) => (
                          <div
                            key={feat.id}
                            className={`p-1.5 text-left border ${
                              isSelected
                                ? 'bg-[#1E432E] border-[#366E4B]'
                                : 'bg-[#183525] border-[#224832]'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-semibold text-white">
                              <span className="truncate pr-1">{feat.title.split('·')[0]}</span>
                              <span
                                className="text-[9px] font-mono px-1 py-0.2 shrink-0 rounded-xs"
                                style={{
                                  backgroundColor: isSelected ? 'rgba(85,185,120,0.2)' : 'rgba(0,0,0,0.3)',
                                  color: isSelected ? '#8DE0A9' : '#BDD1C4',
                                }}
                              >
                                {feat.metric}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer Badge on Step */}
                      <div className="mt-2.5 pt-2 border-t border-[#234A34] flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#8DE0A9]">5 FEATURES</span>
                        <span className="text-white font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          VIEW <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                        </span>
                      </div>
                    </div>

                    {/* MINECRAFT STEP CORNER BEVEL CUTOUT (Simulates 3D Voxel Stair Notch) */}
                    <div className="h-2 w-full bg-[#0D1D14] border-x-4 border-b-2 border-black/60" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* MOBILE & TABLET STEPPING TABS */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-3 mb-4 no-scrollbar">
              {stairSteps.map((step, idx) => {
                const isSelected = idx === activeStep;
                return (
                  <button
                    key={`mob-step-${idx}`}
                    onClick={() => handleStepClick(idx)}
                    className={`px-3 py-2 text-xs font-mono font-bold shrink-0 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#55B978] text-[#0A1710] border-t-white border-l-white border-b-[#1C512F] border-r-[#1C512F] shadow-[2px_2px_0px_#0A1710]'
                        : 'bg-[#1E432E] text-white border-t-[#3A7552] border-l-[#3A7552] border-b-[#0D1E14] border-r-[#0D1E14]'
                    }`}
                  >
                    <span>{step.level}</span>
                    <span className="ml-1 text-[10px] opacity-80">{step.coordY}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* ACTIVE STAIR STEP DETAILED FEATURE VAULT                     */}
        {/* ============================================================ */}
        <div className={`relative bg-[#1A3828] border-4 border-t-[#3E7D56] border-l-[#3E7D56] border-b-[#0A1810] border-r-[#0A1810] p-5 sm:p-7 shadow-[4px_4px_0px_#0A1810] transition-all duration-300 ${isClimbing ? 'scale-[1.008] ring-2 ring-[#55B978]' : ''}`}>
          
          {/* Header of Active Step */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b-2 border-[#29543C]">
            <div className="flex items-start sm:items-center gap-3.5">
              {/* Voxel Icon Box */}
              <div
                className="w-12 h-12 bg-[#102419] border-2 border-t-[#4E9367] border-l-[#4E9367] border-b-[#0A1810] border-r-[#0A1810] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#0A1810]"
              >
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ color: currentStepData.colorTheme.accent }}
                >
                  {currentStepData.pixelIcon}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-black text-[#55B978]">
                    {currentStepData.level} // STEP 0{currentStepData.stepIndex + 1}
                  </span>
                  <span className="text-[#9ECBB0]">· {currentStepData.coordY}</span>
                  <span className="px-2 py-0.5 bg-[#0F2217] text-[#BDD1C4] border border-[#2B573D] text-[10px] font-bold">
                    {currentStepData.blockName}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
                  {currentStepData.category}
                </h3>
                <p className="text-xs sm:text-sm text-[#BDD1C4] mt-0.5">
                  {currentStepData.tagline}
                </p>
              </div>
            </div>

            {/* Step Quick Navigation */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-[#9ECBB0]">STEP {activeStep + 1} OF 5</span>
              <div className="flex gap-1">
                {stairSteps.map((_, i) => (
                  <button
                    key={`dot-${i}`}
                    onClick={() => handleStepClick(i)}
                    className={`w-3 h-3 border border-black transition-all ${
                      i === activeStep
                        ? 'bg-[#55B978] shadow-[0_0_6px_#55B978]'
                        : i < activeStep
                        ? 'bg-[#316847]'
                        : 'bg-[#102217]'
                    }`}
                    title={`Go to Step ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* THE 5 FEATURES ON THIS STAIR STEP */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {currentStepData.features.map((feature, fIdx) => (
              <div
                key={feature.id}
                className="group p-4 bg-[#142B1F] border-2 border-t-[#2E5E41] border-l-[#2E5E41] border-b-[#0A160F] border-r-[#0A160F] hover:border-t-[#55B978] hover:border-l-[#55B978] hover:bg-[#1A3828] transition-all flex flex-col justify-between shadow-[2px_2px_0px_#0A160F]"
              >
                <div>
                  {/* Top Metadata Row */}
                  <div className="flex items-center justify-between mb-2 font-mono">
                    <span className="text-[11px] font-bold text-[#8DE0A9] px-2 py-0.5 bg-[#0B1A12] border border-[#224A34]">
                      {feature.tag}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#55B978]/20 text-[#7EF0AD] border border-[#55B978]/40">
                      {feature.metric}
                    </span>
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-start gap-2.5 mb-2">
                    <span className="material-symbols-outlined text-lg text-[#55B978] shrink-0 mt-0.5">
                      {feature.icon}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#8DE0A9] transition-colors leading-snug">
                      {feature.title}
                    </h4>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#BDD1C4] leading-relaxed pl-7">
                    {feature.detail}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="mt-3 pt-2.5 border-t border-[#224A34] flex items-center justify-between text-xs pl-7">
                  <span className="text-[11px] font-mono text-[#749982]">INCLUDED IN SUITE</span>
                  {feature.path && (
                    <Link
                      to={feature.path}
                      onClick={() => trackEvent('feature_section_viewed', { category: feature.tag, source: 'minecraft_step_card' })}
                      className="text-[#8DE0A9] group-hover:text-white font-mono text-[11px] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>OPEN</span>
                      <span className="material-symbols-outlined text-xs">arrow_outward</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {/* 6th Slot: Step Summary / Action Card */}
            <div className="p-4 bg-[#102419] border-2 border-dashed border-[#386F4E] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 font-mono text-xs text-[#55B978]">
                  <span className="material-symbols-outlined text-sm">construction</span>
                  <span className="font-bold">CRAFTED FOR PEAK EXECUTION</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Ready to level up this domain?
                </h4>
                <p className="text-xs text-[#9ECBB0] leading-relaxed">
                  Every tool on this step connects directly into your central LEVELUP dashboard and syncs with all other pillars.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#224A34] flex items-center justify-between">
                <Link
                  to="/signup"
                  onClick={() => trackEvent('signup_button_clicked', { source: `minecraft_stairs_step_${activeStep}` })}
                  className="w-full py-2 bg-[#55B978] hover:bg-[#62CD87] text-[#0A1810] text-xs font-mono font-bold text-center border-2 border-t-white border-l-white border-b-[#1A4B2C] border-r-[#1A4B2C] shadow-[2px_2px_0px_#07130C] cursor-pointer"
                >
                  START FREE ON THIS STEP ➔
                </Link>
              </div>
            </div>

          </div>

          {/* Bottom Footer Ribbon of Staircase */}
          <div className="mt-6 pt-4 border-t-2 border-[#29543C] flex flex-wrap items-center justify-between text-xs font-mono text-[#8DE0A9] gap-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#55B978] inline-block" />
                <span>5 TIERS</span>
              </span>
              <span>·</span>
              <span>25+ CORE FEATURES</span>
              <span>·</span>
              <span>ZERO APP SWITCHING</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#BDD1C4]">NEXT LEVEL:</span>
              <button
                onClick={handleClimbNext}
                className="text-[#55B978] hover:underline cursor-pointer font-bold flex items-center gap-1"
              >
                <span>STEP {((activeStep + 1) % 5) + 1}: {stairSteps[(activeStep + 1) % 5].category.split('·')[0]}</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
