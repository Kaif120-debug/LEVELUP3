import React, { useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';

const Hero3DCharacter = lazy(() =>
  import('../components/Hero3DCharacter').then((module) => ({
    default: module.Hero3DCharacter,
  }))
);

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const featuresList = [
    {
      icon: 'fitness_center',
      title: 'Fitness & Nutrition OS',
      desc: 'Log progressive overload, hypertrophy workout splits, track daily protein and calories, and generate custom diet plans with smart food replacements.',
    },
    {
      icon: 'description',
      title: 'ATS Resume & Career OS',
      desc: 'Interactive 2-column resume builder with 4 recruiter-vetted templates, real-time Gemini ATS scoring, Google XYZ bullet polish, and high-res PDF export.',
    },
    {
      icon: 'calendar_today',
      title: 'Daily Planner & Time-Blocking',
      desc: 'Structure deep work routines with 24-hour visual time blocks, priority task checklists, and daily habit consistency streak counters.',
    },
    {
      icon: 'school',
      title: 'Student & Academic OS',
      desc: 'Track assignment deadlines, monitor course progress, and stay ahead of upcoming exam milestones with real-time countdowns.',
    },
    {
      icon: 'campaign',
      title: 'Creator & Brand Studio',
      desc: 'Plan cross-platform content across X, YouTube, LinkedIn and TikTok, brainstorm viral hooks, and organize your core brand typography and colors.',
    },
    {
      icon: 'account_balance_wallet',
      title: 'Business & Finance OS',
      desc: 'Track client pipelines, generate client proposals and invoices with automatic tax and subtotal calculations, and manage monthly expense budgets.',
    },
  ];

  const planFeatures = [
    'Unlimited personalized workouts',
    'Custom nutrition plans',
    'LEVELUP AI assistant',
    'ATS resume builder',
    'Portfolio builder',
    'Job & internship tracker',
    'Productivity tools',
    'Student tools',
    'Creator tools',
    'Business & freelance tools',
    'Finance tools',
    'Premium templates & resources',
    'Progress tracking',
    'Future feature updates',
  ];

  const faqs = [
    {
      q: 'Is there any free tier or multiple pricing plans?',
      a: 'No. We believe in complete transparency and maximum value: exactly one plan with every single tool, feature, and future update unlocked for ₹129/month.',
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Yes, you can cancel your subscription at any time with a single click in your settings. There are no lock-in periods or cancellation fees.',
    },
    {
      q: 'How does the ATS Resume Builder work?',
      a: 'Our editor adheres to strict ATS readability guidelines. It syncs live typing into 4 clean typography templates, provides Gemini AI bullet point optimization, and exports real high-resolution PDFs.',
    },
    {
      q: 'Are all tools included in the ₹129/month membership?',
      a: 'Yes! Your subscription gives you full, unrestricted access to the Fitness OS, Nutrition Planner, Career Tracker, Daily Time-Blocker, Student Dashboard, Creator Studio, Business Hub, and Gemini AI assistant.',
    },
  ];

  return (
    <div className="bg-background min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary">
      {/* Header / Navbar */}
      <header className="fixed z-50 bg-surface/95 backdrop-blur-md top-0 w-full border-b border-outline-variant h-20">
        <div className="flex justify-between items-center h-full px-margin-desktop max-w-container-max mx-auto">
          <Link to="/" className="font-display-lg text-2xl md:text-3xl text-primary font-bold tracking-tight">
            LEVELUP
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="font-label-caps text-on-surface-variant hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="font-label-caps text-on-surface-variant hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#resources" className="font-label-caps text-on-surface-variant hover:text-primary transition-colors">
              Resources
            </a>
            <a href="#pricing" className="font-label-caps text-primary font-bold hover:text-primary-container transition-colors">
              Pricing
            </a>
            <Link
              to="/login"
              className="font-label-caps text-on-surface hover:text-primary px-3 py-2 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/checkout"
              className="font-label-caps bg-primary-container text-on-primary px-5 py-2.5 rounded-lg hover:bg-primary transition-colors text-xs font-semibold shadow-sm"
            >
              Start LevelUp — ₹129/mo
            </Link>
          </nav>

          {/* Mobile CTA */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              to="/login"
              className="font-label-caps text-xs text-on-surface px-2 py-1"
            >
              Login
            </Link>
            <Link
              to="/checkout"
              className="font-label-caps text-xs bg-primary-container text-on-primary px-3 py-2 rounded-lg"
            >
              ₹129/mo
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 flex-1">
        {/* Hero Section */}
        <section className="pt-12 md:pt-16 lg:pt-20 pb-12 px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Hero Copy & CTA */}
            <div className="lg:col-span-6 xl:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant text-on-surface-variant text-xs font-label-caps uppercase mb-6 animate-fade-up">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Unified Life Performance OS • ₹129 / Month
              </div>
              
              <h1 className="font-display-xl text-4xl sm:text-5xl md:text-6xl xl:text-7xl mb-6 text-on-surface tracking-tight leading-[1.1] animate-fade-up">
                BUILD YOURSELF.
                <br />
                <span className="text-primary">BETTER EVERY DAY.</span>
              </h1>
              
              <p className="font-body-lg text-lg sm:text-xl text-on-surface-variant mb-8 animate-fade-up max-w-2xl leading-relaxed">
                One intelligent workspace for your fitness, career trajectory, deep work productivity, academics, and personal growth.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 animate-fade-up w-full sm:w-auto">
                <Link
                  to="/checkout"
                  className="w-full sm:w-auto bg-primary-container text-on-primary px-8 py-4 rounded-xl font-label-caps uppercase text-sm font-bold hover:bg-primary transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>START LEVELUP — ₹129/MONTH</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto border border-outline text-on-surface px-8 py-4 rounded-xl font-label-caps uppercase text-sm font-semibold hover:bg-surface-container-high transition-colors inline-flex items-center justify-center cursor-pointer"
                >
                  Explore Workspace
                </Link>
              </div>

              {/* Feature highlights chips */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-on-surface-variant font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <span>Fitness & Nutrition</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <span>ATS Resume Builder</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <span>Creator & Student Hub</span>
                </div>
              </div>
            </div>

            {/* Right Column: Premium 3D LEVELUP Hero Avatar */}
            <div className="lg:col-span-6 xl:col-span-5 w-full flex justify-center items-center">
              <Suspense
                fallback={
                  <div className="w-full h-[460px] sm:h-[540px] flex items-center justify-center bg-surface-container-low/50 rounded-3xl border border-outline-variant animate-pulse">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                      <span className="text-xs font-mono text-on-surface-variant uppercase">Loading 3D Visualizer...</span>
                    </div>
                  </div>
                }
              >
                <Hero3DCharacter />
              </Suspense>
            </div>
          </div>

          {/* Workspace Preview Showcase */}
          <div className="mt-16 md:mt-20 border border-outline-variant rounded-2xl overflow-hidden shadow-xl animate-fade-up bg-surface-container-low p-2">
            <div className="rounded-xl overflow-hidden border border-outline-variant/60 bg-surface">
              <img
                className="w-full h-auto max-h-[620px] object-cover object-top"
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&auto=format&fit=crop&q=80"
                alt="LEVELUP Workspace Interface Preview"
              />
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="py-20 px-margin-desktop max-w-container-max mx-auto border-t border-outline-variant scroll-mt-20">
          <div className="text-center mb-14">
            <p className="font-label-caps text-xs uppercase tracking-widest text-primary font-bold mb-2">Architected for Consistency</p>
            <h2 className="font-headline-lg text-3xl md:text-4xl text-on-surface mb-3">Integrated High Performance</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto text-base">
              Replace a dozen disjointed subscriptions with one cohesive operating system designed for compounding mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((f, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 hover:border-primary transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary mb-5">
                    <span className="material-symbols-outlined text-2xl">{f.icon}</span>
                  </div>
                  <h3 className="font-headline-sm text-xl text-on-surface mb-2.5">{f.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-margin-desktop max-w-container-max mx-auto border-t border-outline-variant bg-surface-container-low/40 rounded-3xl my-10 scroll-mt-20">
          <div className="text-center mb-14">
            <p className="font-label-caps text-xs uppercase tracking-widest text-primary font-bold mb-2">The Methodology</p>
            <h2 className="font-headline-lg text-3xl md:text-4xl text-on-surface mb-3">How LEVELUP Works</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto text-base">
              A structured, three-step engine turning daily inputs into compounding career and physical momentum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8">
              <div className="font-mono text-xs font-bold text-primary px-3 py-1 rounded bg-surface-container-high inline-block mb-4">
                STEP 01
              </div>
              <h3 className="font-headline-sm text-xl text-on-surface mb-2">Set Your Baselines</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Establish your training goals, calorie targets, academic priorities, and target job roles in our intuitive onboarding protocol.
              </p>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8">
              <div className="font-mono text-xs font-bold text-primary px-3 py-1 rounded bg-surface-container-high inline-block mb-4">
                STEP 02
              </div>
              <h3 className="font-headline-sm text-xl text-on-surface mb-2">Operate Your Unified OS</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Execute your day using clean time-blocks, check off workouts with set-by-set volume tracking, and polish your live resume in one unified tab.
              </p>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8">
              <div className="font-mono text-xs font-bold text-primary px-3 py-1 rounded bg-surface-container-high inline-block mb-4">
                STEP 03
              </div>
              <h3 className="font-headline-sm text-xl text-on-surface mb-2">Accelerate with AI</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Leverage Gemini AI to analyze ATS keyword match rates, re-balance workout volume, draft personalized cover letters, and generate viral content angles.
              </p>
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section id="resources" className="py-20 px-margin-desktop max-w-container-max mx-auto border-t border-outline-variant scroll-mt-20">
          <div className="text-center mb-14">
            <p className="font-label-caps text-xs uppercase tracking-widest text-primary font-bold mb-2">Curated Frameworks</p>
            <h2 className="font-headline-lg text-3xl md:text-4xl text-on-surface mb-3">Premium Resources Included</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto text-base">
              Every LEVELUP subscription grants unrestricted access to our growing library of blueprints and frameworks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <span className="material-symbols-outlined text-3xl text-primary mb-3">article</span>
              <h4 className="font-headline-sm text-lg mb-1">ATS Resume Blueprints</h4>
              <p className="text-on-surface-variant text-xs leading-relaxed">4 clean typography systems calibrated for recruiter ATS parsers.</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <span className="material-symbols-outlined text-3xl text-primary mb-3">fitness_center</span>
              <h4 className="font-headline-sm text-lg mb-1">Hypertrophy Protocols</h4>
              <p className="text-on-surface-variant text-xs leading-relaxed">Evidence-based PPL, Upper/Lower, and Full Body progression schedules.</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <span className="material-symbols-outlined text-3xl text-primary mb-3">restaurant</span>
              <h4 className="font-headline-sm text-lg mb-1">Macro & Diet Systems</h4>
              <p className="text-on-surface-variant text-xs leading-relaxed">High-protein meal frameworks with instant ingredient substitution.</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <span className="material-symbols-outlined text-3xl text-primary mb-3">schedule</span>
              <h4 className="font-headline-sm text-lg mb-1">Deep Work Planners</h4>
              <p className="text-on-surface-variant text-xs leading-relaxed">Time-blocking structures designed to protect 4+ hours of uninterrupted focus.</p>
            </div>
          </div>
        </section>

        {/* PRICING SECTION - DEDICATED ONE PLAN */}
        <section id="pricing" className="py-24 px-margin-desktop max-w-container-max mx-auto border-t border-outline-variant scroll-mt-20">
          <div className="text-center mb-12">
            <p className="font-label-caps text-xs uppercase tracking-widest text-primary font-bold mb-2">Transparent Pricing</p>
            <h2 className="font-display-lg text-3xl md:text-5xl text-on-surface mb-3 tracking-tight font-bold">
              ONE PLAN.
              <br />
              EVERYTHING INCLUDED.
            </h2>
            <p className="text-on-surface-variant max-w-md mx-auto text-lg">
              Get full access to LEVELUP for ₹129/month.
            </p>
          </div>

          {/* ONE LARGE CENTERED PRICING CARD */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-surface-container-lowest border-2 border-primary rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary-container text-on-primary text-[11px] font-label-caps uppercase px-4 py-1.5 rounded-bl-xl font-bold tracking-wider">
                Full Access
              </div>

              <div className="text-center pb-8 border-b border-outline-variant">
                <span className="font-label-caps uppercase text-xs tracking-widest text-primary font-bold block mb-2">
                  LEVELUP MEMBERSHIP
                </span>
                <div className="flex items-baseline justify-center gap-1 my-2">
                  <span className="font-display-xl text-5xl sm:text-6xl font-bold text-on-surface">
                    ₹129
                  </span>
                  <span className="text-on-surface-variant font-body-lg text-lg">
                    /month
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Everything included. All modules unlocked.
                </p>
              </div>

              {/* Checklist */}
              <div className="py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                  {planFeatures.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-primary text-lg flex-shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span className="text-on-surface text-sm font-medium leading-snug">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary CTA */}
              <div className="pt-4 text-center">
                <Link
                  to="/checkout"
                  className="w-full bg-primary-container text-on-primary py-4 px-8 rounded-xl font-label-caps uppercase text-sm font-bold hover:bg-primary transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
                >
                  <span>START LEVELUP — ₹129/MONTH</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
                <p className="text-xs text-on-surface-variant mt-3 font-medium">
                  Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-margin-desktop max-w-3xl mx-auto border-t border-outline-variant">
          <div className="text-center mb-12">
            <p className="font-label-caps text-xs uppercase tracking-widest text-primary font-bold mb-2">Got Questions?</p>
            <h2 className="font-headline-lg text-2xl md:text-3xl text-on-surface">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-5 flex justify-between items-center font-headline-sm text-base text-on-surface hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-on-surface-variant transition-transform">
                    {openFaq === index ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-24 px-margin-desktop bg-surface-container-high/60 border-t border-outline-variant text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display-lg text-3xl md:text-5xl text-on-surface font-bold tracking-tight mb-4">
              YOUR NEXT LEVEL STARTS HERE.
            </h2>
            <p className="font-body-lg text-on-surface-variant text-base sm:text-lg mb-8 max-w-lg mx-auto">
              Build your system. Track your progress. Keep improving.
            </p>
            <Link
              to="/checkout"
              className="bg-primary-container text-on-primary px-10 py-4 rounded-xl font-label-caps uppercase text-sm font-bold hover:bg-primary transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2"
            >
              <span>START LEVELUP — ₹129/MONTH</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-outline-variant py-12 px-margin-desktop">
        <div className="max-w-container-max mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display-lg text-2xl text-primary font-bold">
              LEVELUP
            </Link>
            <span className="text-xs text-on-surface-variant border-l border-outline-variant pl-4">
              The Comprehensive Self-Mastery OS
            </span>
          </div>

          <div className="flex items-center gap-6 font-label-caps text-xs text-on-surface-variant">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#resources" className="hover:text-primary transition-colors">Resources</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
          </div>

          <p className="text-xs text-on-surface-variant">
            © {new Date().getFullYear()} LEVELUP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
