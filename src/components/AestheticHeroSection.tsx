import React from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';

interface AestheticHeroSectionProps {
  onScrollToFeatures: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const AestheticHeroSection: React.FC<AestheticHeroSectionProps> = ({ onScrollToFeatures }) => {
  // Signature Brand Palette: Cadmium Orange Arrow & Deep Forest Green
  const arrowFill = '#F28A4B';
  const shelfTextColor = 'text-[#1C211D]';
  const levelUpColor = 'text-[#234B36]';

  // ROW 1: Fitness, Workout tracking, Nutrition, Calorie tracking
  const row1Features = [
    {
      category: 'Workout Tracking',
      icon: 'fitness_center',
      title: 'Push Split · Day A',
      detail: 'Bench 82.5 kg · 4 sets logged',
      metric: '+2.5 kg PR',
      badge: 'Fitness',
      iconBg: 'bg-[#DDF3E4]',
      iconColor: 'text-[#234B36]',
      badgeStyle: 'bg-[#DDF3E4] text-[#234B36]',
    },
    {
      category: 'Nutrition & Macros',
      icon: 'restaurant',
      title: 'Daily Protein Target',
      detail: '145g of 160g completed today',
      metric: '91% Goal',
      badge: 'Nutrition',
      iconBg: 'bg-[#FFE1CC]',
      iconColor: 'text-[#E06725]',
      badgeStyle: 'bg-[#FFE1CC] text-[#E06725]',
    },
    {
      category: 'Progressive Overload',
      icon: 'trending_up',
      title: 'Strength Progression',
      detail: 'Squat & Deadlift volume climbing',
      metric: '12-Day Streak',
      badge: 'Strength',
      iconBg: 'bg-[#DDF3E4]',
      iconColor: 'text-[#234B36]',
      badgeStyle: 'bg-[#DDF3E4] text-[#234B36]',
    },
    {
      category: 'Calorie Tracking',
      icon: 'local_fire_department',
      title: 'Fuel & Calorie Deficit',
      detail: '2,150 / 2,300 kcal target',
      metric: 'Deficit Met',
      badge: 'Diet',
      iconBg: 'bg-[#DDF3E4]',
      iconColor: 'text-[#234B36]',
      badgeStyle: 'bg-[#DDF3E4] text-[#234B36]',
    },
    {
      category: 'Rest & Timer',
      icon: 'timer',
      title: 'Set Rest Countdown',
      detail: '90s timer between working sets',
      metric: 'Set 3 of 4',
      badge: 'Live Log',
      iconBg: 'bg-[#FFE1CC]',
      iconColor: 'text-[#E06725]',
      badgeStyle: 'bg-[#FFE1CC] text-[#E06725]',
    },
  ];

  // ROW 2: Career, Portfolio, Job tracking, Resume assistance
  const row2Features = [
    {
      category: 'Resume Assistance',
      icon: 'description',
      title: 'ATS Resume Builder',
      detail: 'Google XYZ bullet optimization',
      metric: '94% ATS Match',
      badge: 'Career',
      iconBg: 'bg-[#DDF3E4]',
      iconColor: 'text-[#234B36]',
      badgeStyle: 'bg-[#DDF3E4] text-[#234B36]',
    },
    {
      category: 'Job Tracking',
      icon: 'view_kanban',
      title: 'Application Pipeline',
      detail: 'Stripe, Figma, Linear · 12 tracked',
      metric: '2 Interviews',
      badge: 'Pipeline',
      iconBg: 'bg-[#FFE1CC]',
      iconColor: 'text-[#E06725]',
      badgeStyle: 'bg-[#FFE1CC] text-[#E06725]',
    },
    {
      category: 'Personal Portfolio',
      icon: 'language',
      title: 'Published Portfolio',
      detail: 'Clean showcase · 6 elegant themes',
      metric: 'Live URL',
      badge: 'Portfolio',
      iconBg: 'bg-[#DDF3E4]',
      iconColor: 'text-[#234B36]',
      badgeStyle: 'bg-[#DDF3E4] text-[#234B36]',
    },
    {
      category: 'AI Career Coach',
      icon: 'record_voice_over',
      title: 'STAR Mock Interview',
      detail: 'Behavioral & technical feedback',
      metric: 'AI Ready',
      badge: 'AI Coach',
      iconBg: 'bg-[#DDF3E4]',
      iconColor: 'text-[#234B36]',
      badgeStyle: 'bg-[#DDF3E4] text-[#234B36]',
    },
    {
      category: 'Client Proposals',
      icon: 'receipt_long',
      title: 'Freelance CRM & Invoicing',
      detail: 'Proposal approved · ₹45,000 sent',
      metric: 'Paid',
      badge: 'Business',
      iconBg: 'bg-[#FFE1CC]',
      iconColor: 'text-[#E06725]',
      badgeStyle: 'bg-[#FFE1CC] text-[#E06725]',
    },
  ];

  // ROW 3: Productivity, Personal growth, Goal tracking, Progress tracking
  const row3Features = [
    {
      category: 'Productivity',
      icon: 'schedule',
      title: '24-Hour Time Blocking',
      detail: '4.5 hours deep work scheduled',
      metric: 'Flow State',
      badge: 'Planner',
      iconBg: 'bg-[#DDF3E4]',
      iconColor: 'text-[#234B36]',
      badgeStyle: 'bg-[#DDF3E4] text-[#234B36]',
    },
    {
      category: 'Personal Growth',
      icon: 'check_circle',
      title: 'Daily Habit Streaks',
      detail: 'Morning mobility, reading, focus',
      metric: '14-Day Streak',
      badge: 'Growth',
      iconBg: 'bg-[#FFE1CC]',
      iconColor: 'text-[#E06725]',
      badgeStyle: 'bg-[#FFE1CC] text-[#E06725]',
    },
    {
      category: 'Goal Tracking',
      icon: 'flag',
      title: 'Quarterly Milestones',
      detail: '4 life pillars aligned in one place',
      metric: '82% Achieved',
      badge: 'Goals',
      iconBg: 'bg-[#DDF3E4]',
      iconColor: 'text-[#234B36]',
      badgeStyle: 'bg-[#DDF3E4] text-[#234B36]',
    },
    {
      category: 'Student Academics',
      icon: 'school',
      title: 'Course & Exam Prep',
      detail: 'System Design exam in 12 days',
      metric: 'GPA 3.9',
      badge: 'Academics',
      iconBg: 'bg-[#DDF3E4]',
      iconColor: 'text-[#234B36]',
      badgeStyle: 'bg-[#DDF3E4] text-[#234B36]',
    },
    {
      category: 'Personal Finance',
      icon: 'account_balance_wallet',
      title: 'Budget & Savings Goal',
      detail: '₹24,500 saved towards monthly target',
      metric: '82% Saved',
      badge: 'Finance',
      iconBg: 'bg-[#FFE1CC]',
      iconColor: 'text-[#E06725]',
      badgeStyle: 'bg-[#FFE1CC] text-[#E06725]',
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[#F8F7F2] text-[#1C211D] pt-8 sm:pt-14 pb-16 sm:pb-24">
      {/* Subtle Ambient Lighting Gradients */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-[#FFE1CC]/30 rounded-full blur-[110px] pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-28 left-1/4 w-[450px] h-[450px] bg-[#DDF3E4]/35 rounded-full blur-[100px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* EDITORIAL HERO CANVAS (Centered Geometric Arrow Composition) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-14 sm:mb-20">
        
        {/* HERO COMPOSITION WRAPPER: Centered Graphic Canvas */}
        <div className="relative w-full min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] xl:min-h-[680px] flex flex-col justify-between">
          
          {/* THE OVERSIZED GEOMETRIC ARROW GRAPHIC (PLACED EXACTLY IN THE CENTRE) */}
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 sm:top-2 w-[340px] sm:w-[480px] md:w-[580px] lg:w-[680px] xl:w-[720px] h-full z-0 select-none transition-all duration-500"
            aria-hidden="true"
          >
            {/* 45° ASCENT ARROW (TrendBible Reference, Centered) */}
            <svg
              viewBox="0 0 640 760"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full object-contain object-center drop-shadow-sm transition-all duration-500"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Main Architectural Arrow Silhouette */}
              <path
                d="M 0 120 
                   L 160 120 
                   L 160 220 
                   L 380 0 
                   L 520 0 
                   L 640 120 
                   L 520 240 
                   L 420 240 
                   L 280 380 
                   L 280 460 
                   L 620 460 
                   L 620 760 
                   L 0 760 
                   Z"
                fill={arrowFill}
              />

              {/* 45° Accent Guideline */}
              <line
                x1="160"
                y1="220"
                x2="380"
                y2="0"
                stroke="#FFFFFF"
                strokeOpacity="0.28"
                strokeWidth="2"
                strokeDasharray="6 6"
              />

              {/* Swiss Typography Coordinate Detail */}
              <text
                x="24"
                y="735"
                fill="#FFFFFF"
                fillOpacity="0.45"
                fontSize="12"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                letterSpacing="0.18em"
              >
                LEVELUP // ASCENT VECTOR · 45°
              </text>

              {/* System Stamp */}
              <text
                x="24"
                y="155"
                fill="#FFFFFF"
                fillOpacity="0.45"
                fontSize="11"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                letterSpacing="0.14em"
              >
                ▲ SYS.01
              </text>
            </svg>
          </div>

          {/* TOP QUADRANT: Confident Grotesque Typography */}
          {/* Sweeps across the centered arrow graphic */}
          <div className="relative z-10 pt-2 sm:pt-4">
            <h1 className="flex flex-col select-none">
              {/* Line 1: Everything */}
              <span className="text-[clamp(2.75rem,7vw,6.4rem)] font-extrabold text-[#1C211D] tracking-tighter leading-[0.92] drop-shadow-2xs">
                Everything
              </span>

              {/* Line 2: You Need */}
              <span className="text-[clamp(2.75rem,7vw,6.4rem)] font-extrabold text-[#1C211D] tracking-tighter leading-[0.92] mt-0.5 sm:mt-1 drop-shadow-2xs">
                You Need
              </span>

              {/* Line 3: to Level Up */}
              <span className="flex items-baseline gap-x-2.5 sm:gap-x-4 text-[clamp(2.75rem,7vw,6.4rem)] font-extrabold tracking-tighter leading-[0.92] mt-0.5 sm:mt-1 drop-shadow-2xs">
                <span className="text-[#6D756E] font-medium text-[0.8em]">to</span>
                <span className={levelUpColor}>
                  Level Up
                </span>
              </span>

              {/* Line 4: Your Life. (On mobile phone preview only: sits directly below 'to Level Up') */}
              <span className="block sm:hidden text-[clamp(2.5rem,7vw,6.4rem)] font-extrabold text-[#1C211D] tracking-tighter leading-[0.92] mt-0.5 drop-shadow-2xs">
                Your Life.
              </span>
            </h1>
          </div>

          {/* BOTTOM SPLIT: Lower-Left CTA & Lower-Right Grounding Shelf */}
          <div className="relative z-10 mt-8 sm:mt-12 lg:mt-16 pt-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 sm:gap-10">
            
            {/* LOWER-LEFT NEGATIVE SPACE: Product Promise & Compact CTAs */}
            <div className="w-full sm:max-w-md xl:max-w-lg space-y-4 sm:space-y-6">
              {/* Supporting Subheadline: In phone preview, this line is a little bold as requested */}
              <p className="text-sm sm:text-base lg:text-lg text-[#1C211D] sm:text-[#4E564F] leading-relaxed font-semibold sm:font-normal max-w-md">
                Manage your fitness, career, nutrition, and personal growth from one clean workspace. Spend less time switching between apps and more time building momentum.
              </p>

              {/* Call-to-Action Buttons: Shortened & Compact in Phone Preview */}
              <div className="flex flex-row flex-wrap items-center gap-2.5 sm:gap-4">
                <Link
                  to="/signup"
                  onClick={() => trackEvent('signup_button_clicked', { source: 'hero_primary_editorial' })}
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-7 py-2 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#234B36] hover:bg-[#1a3828] transition-all shadow-sm hover:shadow cursor-pointer group shrink-0"
                >
                  <span>Get Started Free</span>
                  <span className="material-symbols-outlined text-sm sm:text-base group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </Link>

                <a
                  href="#features"
                  onClick={onScrollToFeatures}
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-[#234B36] bg-[#FFFFFF] hover:bg-[#F4F3EE] border border-[#E8E9E2] transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <span>Explore Platform</span>
                  <span className="material-symbols-outlined text-sm sm:text-base text-[#6D756E]">
                    expand_more
                  </span>
                </a>
              </div>
            </div>

            {/* LOWER-RIGHT NOTCH ANCHOR: "Your Life." on Laptop / Desktop (Exactly where it was) */}
            <div className="hidden sm:block select-none pt-4 sm:pt-0">
              <div
                className={`text-[clamp(3.5rem,7.8vw,7.2rem)] font-extrabold tracking-tighter leading-[0.88] ${shelfTextColor}`}
              >
                Your Life.
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* THREE CONTINUOUS HORIZONTAL SCROLLING FEATURE ROWS (CLEAN CRISP WHITE THEME) */}
      <div className="relative w-full py-6 sm:py-7 bg-[#FFFFFF] border-y border-[#E8E9E2] space-y-3.5 sm:space-y-4 overflow-hidden pointer-events-auto shadow-2xs">
        
        {/* Soft edge fade masks for seamless horizontal bleeding */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-36 bg-gradient-to-r from-[#FFFFFF] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-36 bg-gradient-to-l from-[#FFFFFF] to-transparent z-20 pointer-events-none" />

        {/* ROW 1: Fitness & Nutrition (Moves Left) */}
        <div className="overflow-hidden">
          <div className="animate-marquee-left flex gap-3.5 sm:gap-4 py-1">
            {[...row1Features, ...row1Features, ...row1Features].map((item, idx) => (
              <div
                key={`r1-${idx}`}
                className="flex items-center gap-3.5 px-4 sm:px-5 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E8E9E2] shadow-2xs hover:border-[#55B978]/60 hover:shadow-xs transition-all shrink-0 cursor-default"
              >
                <div className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined text-lg ${item.iconColor}`}>{item.icon}</span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold text-[#6D756E]">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${item.badgeStyle}`}>
                      {item.metric}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#1C211D] whitespace-nowrap">
                    {item.title} <span className="font-normal text-[#6D756E] ml-1">· {item.detail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 2: Career, Portfolio, Job tracking, Resume assistance (Moves Right) */}
        <div className="overflow-hidden">
          <div className="animate-marquee-right flex gap-3.5 sm:gap-4 py-1">
            {[...row2Features, ...row2Features, ...row2Features].map((item, idx) => (
              <div
                key={`r2-${idx}`}
                className="flex items-center gap-3.5 px-4 sm:px-5 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E8E9E2] shadow-2xs hover:border-[#F28A4B]/60 hover:shadow-xs transition-all shrink-0 cursor-default"
              >
                <div className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined text-lg ${item.iconColor}`}>{item.icon}</span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold text-[#6D756E]">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${item.badgeStyle}`}>
                      {item.metric}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#1C211D] whitespace-nowrap">
                    {item.title} <span className="font-normal text-[#6D756E] ml-1">· {item.detail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 3: Productivity, Personal growth, Goal tracking, Progress tracking (Moves Left) */}
        <div className="overflow-hidden">
          <div className="animate-marquee-left flex gap-3.5 sm:gap-4 py-1">
            {[...row3Features, ...row3Features, ...row3Features].map((item, idx) => (
              <div
                key={`r3-${idx}`}
                className="flex items-center gap-3.5 px-4 sm:px-5 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E8E9E2] shadow-2xs hover:border-[#55B978]/60 hover:shadow-xs transition-all shrink-0 cursor-default"
              >
                <div className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined text-lg ${item.iconColor}`}>{item.icon}</span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold text-[#6D756E]">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${item.badgeStyle}`}>
                      {item.metric}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#1C211D] whitespace-nowrap">
                    {item.title} <span className="font-normal text-[#6D756E] ml-1">· {item.detail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
