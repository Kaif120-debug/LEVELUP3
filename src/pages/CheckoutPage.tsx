import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const CheckoutPage: React.FC = () => {
  const { state, subscribeUser } = useApp();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [billingName, setBillingName] = useState(state.profile.name || 'Alexander Chen');
  const [billingEmail, setBillingEmail] = useState(state.profile.email || 'alexander.chen@example.com');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const rlsFixSql = `ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage subscriptions" ON public.subscriptions 
FOR ALL TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(rlsFixSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    const res = await subscribeUser({
      name: billingName.trim(),
      email: billingEmail.trim(),
      upiId: paymentMethod === 'upi' ? upiId.trim() : undefined,
      method: paymentMethod,
    });
    setIsProcessing(false);
    if (res?.success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else if (res?.error) {
      setErrorMessage(res.error);
    }
  };

  const includedPerks = [
    'Unlimited personalized workouts & exercise library',
    'Custom macro & nutrition plans with instant swaps',
    'Full access to LEVELUP AI Copilot',
    'ATS Resume Builder with 4 templates & PDF export',
    'Interactive Job, Internship & Application Tracker',
    '24-Hour Time-Blocking Daily Planner & Habit Streaks',
    'Student OS with Assignment Trackers & Exam Countdown',
    'Creator Studio with multi-platform content calendar',
    'Business & Freelance invoice, pitch & client manager',
    'Finance budget tracker with expense categorization',
    'All premium resources, blueprints & future updates',
  ];

  return (
    <div className="bg-background min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary">
      {/* Top Navigation */}
      <header className="bg-surface border-b border-outline-variant h-20 flex items-center">
        <div className="max-w-container-max mx-auto px-margin-desktop w-full flex justify-between items-center">
          <Link to="/" className="font-display-lg text-2xl text-primary font-bold">
            LEVELUP
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">lock</span>
              256-bit Encrypted Checkout
            </span>
            <Link
              to="/"
              className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="flex-1 py-12 px-margin-desktop max-w-5xl mx-auto w-full">
        {isSuccess ? (
          <div className="bg-surface-container-lowest border-2 border-primary rounded-3xl p-10 max-w-md mx-auto text-center shadow-xl animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-3xl fill-icon">check_circle</span>
            </div>
            <h2 className="font-headline-lg text-2xl text-on-surface font-bold mb-2">
              Subscription Active!
            </h2>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              Welcome to the LEVELUP Membership. Your account now has unrestricted access to all tools.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-mono bg-surface-container-high px-4 py-2 rounded-lg text-primary font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              Redirecting to your Dashboard...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Subscription Plan Summary */}
            <div className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 shadow-sm">
              <div className="pb-6 border-b border-outline-variant">
                <span className="font-label-caps text-xs uppercase tracking-widest text-primary font-bold block mb-1">
                  Selected Subscription
                </span>
                <h1 className="font-headline-lg text-3xl text-on-surface font-bold mb-2">
                  LEVELUP MEMBERSHIP
                </h1>
                <div className="flex items-baseline gap-2">
                  <span className="font-display-xl text-4xl font-bold text-on-surface">
                    ₹129
                  </span>
                  <span className="text-on-surface-variant font-body-md text-sm">
                    / month
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Everything included. Billed monthly in INR.
                </p>
              </div>

              <div className="py-6 border-b border-outline-variant">
                <h3 className="font-label-caps text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-4">
                  What's Included:
                </h3>
                <ul className="space-y-3">
                  {includedPerks.map((perk, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-on-surface">
                      <span className="material-symbols-outlined text-primary text-base flex-shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span className="leading-tight">{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 flex justify-between items-center text-xs text-on-surface-variant">
                <span>Auto-renewal</span>
                <span className="font-medium text-on-surface">Monthly • Cancel anytime</span>
              </div>
            </div>

            {/* Right: Payment Method & Execution */}
            <div className="lg:col-span-6 bg-surface-container-lowest border-2 border-primary/40 rounded-3xl p-8 shadow-md">
              <h2 className="font-headline-sm text-xl text-on-surface font-bold mb-1">
                Complete Your Subscription
              </h2>
              <p className="text-xs text-on-surface-variant mb-6">
                Secure transaction processed via Razorpay gateway architecture.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-5">
                {/* User Information */}
                <div>
                  <label className="font-label-caps text-xs uppercase block text-on-surface mb-1.5">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={billingName}
                    onChange={(e) => setBillingName(e.target.value)}
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-xs uppercase block text-on-surface mb-1.5">
                    Billing Email
                  </label>
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Payment Selection Tabs */}
                <div>
                  <label className="font-label-caps text-xs uppercase block text-on-surface mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-primary bg-surface-container-high text-primary'
                          : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">qr_code_2</span>
                      UPI (GPay / PhonePe)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-primary bg-surface-container-high text-primary'
                          : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">credit_card</span>
                      Debit / Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'netbanking'
                          ? 'border-primary bg-surface-container-high text-primary'
                          : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">account_balance</span>
                      Net Banking
                    </button>
                  </div>
                </div>

                {/* Conditional Payment Inputs */}
                {paymentMethod === 'upi' && (
                  <div>
                    <label className="font-label-caps text-xs uppercase block text-on-surface mb-1.5">
                      VPA / UPI ID
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okaxis / mobile@upi"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                    />
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      A payment request will be sent to your UPI app for authorization.
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="font-label-caps text-xs uppercase block text-on-surface mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        maxLength={19}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-label-caps text-xs uppercase block text-on-surface mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-label-caps text-xs uppercase block text-on-surface mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div>
                    <label className="font-label-caps text-xs uppercase block text-on-surface mb-1.5">
                      Select Popular Bank
                    </label>
                    <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none">
                      <option>HDFC Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                      <option>Other Bank</option>
                    </select>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-error-container/40 border border-error/40 text-on-error-container text-xs space-y-2 animate-in fade-in">
                    {/row-level security|rls|policy|42501/i.test(errorMessage) ? (
                      <>
                        <div className="flex items-center gap-2 font-bold text-error">
                          <span className="material-symbols-outlined text-base">error</span>
                          Subscription Write Blocked (RLS Policy Missing)
                        </div>
                        <p className="text-[11px] text-on-error-container opacity-90 leading-relaxed">
                          PostgreSQL Row Level Security (RLS) requires an INSERT/UPDATE policy on table <code className="bg-surface/50 px-1 py-0.5 rounded font-mono">public.subscriptions</code>.
                        </p>
                        <div className="p-2.5 rounded-xl bg-surface/80 border border-outline-variant font-mono text-[10.5px] text-on-surface overflow-x-auto space-y-2">
                          <div className="flex items-center justify-between gap-2 border-b border-outline-variant pb-1.5">
                            <span className="font-bold text-[10px] uppercase text-on-surface-variant font-sans">Run in Supabase SQL Editor</span>
                            <button
                              type="button"
                              onClick={handleCopySql}
                              className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[12px]">{copiedSql ? 'check' : 'content_copy'}</span>
                              {copiedSql ? 'Copied!' : 'Copy SQL'}
                            </button>
                          </div>
                          <pre className="whitespace-pre-wrap">{rlsFixSql}</pre>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-start gap-2 text-error">
                        <span className="material-symbols-outlined text-base mt-0.5 shrink-0">info</span>
                        <div>
                          <div className="font-bold">Checkout Action Required</div>
                          <p className="text-[11px] text-on-error-container opacity-90 mt-0.5 leading-relaxed">
                            {errorMessage}
                          </p>
                        </div>
                      </div>
                    )}
                    {/row-level security|rls|policy|42501/i.test(errorMessage) && (
                      <pre className="font-mono text-[10px] whitespace-pre-wrap break-all opacity-80 pt-1 border-t border-error/20">
                        {errorMessage}
                      </pre>
                    )}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="bg-surface-container-low rounded-2xl p-4 space-y-2 text-xs border border-outline-variant">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Monthly Subscription</span>
                    <span>₹129.00</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>GST (Included)</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="border-t border-outline-variant pt-2 flex justify-between font-bold text-on-surface text-sm">
                    <span>Total Due Today</span>
                    <span>₹129.00</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-primary-container text-on-primary py-4 px-6 rounded-xl font-label-caps uppercase text-sm font-bold hover:bg-primary transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <span>SUBSCRIBE FOR ₹129/MONTH</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-on-surface-variant">
                  🔒 Encrypted with 256-bit SSL • Instant Activation • Cancel Anytime
                </p>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Checkout Footer */}
      <footer className="bg-surface border-t border-outline-variant py-6 text-center text-xs text-on-surface-variant">
        LEVELUP Secure Billing • ₹129 / month • No hidden charges
      </footer>
    </div>
  );
};
