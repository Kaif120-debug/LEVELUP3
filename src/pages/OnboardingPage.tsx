import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateProfile } = useApp();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>(state.profile.selectedFocus || ['fitness', 'career', 'productivity']);
  const [primaryGoal, setPrimaryGoal] = useState('Senior Product Designer');
  const [fitnessGoal, setFitnessGoal] = useState('Gain Muscle & Hypertrophy');

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const options = [
    { id: 'fitness', label: 'Fitness', icon: 'fitness_center' },
    { id: 'career', label: 'Career', icon: 'work' },
    { id: 'productivity', label: 'Productivity', icon: 'bolt' },
    { id: 'student', label: 'Student', icon: 'school' },
    { id: 'creator', label: 'Creator', icon: 'edit_note' },
    { id: 'business', label: 'Business', icon: 'business_center' },
    { id: 'finance', label: 'Finance', icon: 'payments' },
  ];

  const handleNext = () => {
    if (step === 1) {
      updateProfile({ selectedFocus: selected });
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      updateProfile({ selectedFocus: selected });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-20 border-b border-outline-variant flex justify-between items-center px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="font-display-lg text-display-lg text-primary">LEVELUP</div>
        <div className="flex items-center gap-3">
          <span className="font-label-caps text-on-surface-variant uppercase">Step {step} of 3</span>
          <div className="flex gap-1.5">
            <div className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-outline-variant'}`}></div>
            <div className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-outline-variant'}`}></div>
            <div className={`h-1.5 w-8 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-outline-variant'}`}></div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-margin-desktop py-section-gap w-full max-w-container-max mx-auto">
        {step === 1 && (
          <>
            <div className="text-center mb-stack-lg max-w-3xl">
              <h1 className="font-display-lg text-display-lg mb-stack-sm">What are you focused on?</h1>
              <p className="font-body-lg text-on-surface-variant">Select all areas you want to improve.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-gutter w-full mb-stack-lg max-w-4xl">
              {options.map((opt) => {
                const isSelected = selected.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggle(opt.id)}
                    className={`selection-card flex flex-col items-center justify-center p-8 bg-surface-container-lowest border rounded-xl relative aspect-square transition-all cursor-pointer ${
                      isSelected
                        ? 'selected ring-2 ring-primary border-primary bg-surface-container-low'
                        : 'border-outline-variant hover:border-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-4xl text-primary mb-stack-md">
                      {opt.icon}
                    </span>
                    <span className="font-headline-sm text-center">{opt.label}</span>
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <span className="material-symbols-outlined text-primary fill-icon text-xl">
                          check_circle
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-xl p-10 space-y-6">
            <div className="text-center mb-6">
              <h1 className="font-display-lg text-display-lg mb-2">Set Your Primary Targets</h1>
              <p className="font-body-lg text-on-surface-variant">Customize your initial benchmarks.</p>
            </div>

            <div>
              <label className="font-label-caps text-on-surface text-xs block mb-2 uppercase">Career Target Role</label>
              <input
                type="text"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="w-full bg-transparent border-b border-outline-variant py-2 text-sm focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="font-label-caps text-on-surface text-xs block mb-2 uppercase">Fitness Goal</label>
              <input
                type="text"
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                className="w-full bg-transparent border-b border-outline-variant py-2 text-sm focus:border-primary outline-none"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-xl p-10 text-center space-y-6">
            <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mx-auto text-primary">
              <span className="material-symbols-outlined text-3xl fill-icon">verified</span>
            </div>
            <h1 className="font-display-lg text-display-lg mb-2">Workspace Ready!</h1>
            <p className="font-body-lg text-on-surface-variant max-w-md mx-auto">
              Your customized dashboard is primed with hypertrophy logs, ATS resume optimizer, time blocking, and AI intelligence.
            </p>
          </div>
        )}

        <div className="w-full max-w-3xl flex justify-between mt-stack-md pt-stack-md border-t border-outline-variant">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="border border-outline-variant font-label-caps px-6 py-4 rounded hover:bg-surface-container-high transition-colors"
            >
              BACK
            </button>
          ) : <div></div>}
          
          <button
            onClick={handleNext}
            className="bg-primary-container text-on-primary font-label-caps px-8 py-4 rounded hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer"
          >
            {step === 3 ? 'ENTER DASHBOARD' : 'CONTINUE'}{' '}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </main>
    </div>
  );
};
