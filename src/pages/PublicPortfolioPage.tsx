import React from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PortfolioRenderer } from '../components/portfolio/PortfolioRenderer';

export const PublicPortfolioPage: React.FC = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const { state } = useApp();

  const portfolios = state.career.portfolios || [];
  
  // Find matching portfolio by slug or id
  const portfolio = portfolios.find(
    (p) =>
      (slug && (p.settings?.slug === slug || p.id === slug)) ||
      (id && p.id === id)
  ) || portfolios[0];

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 text-stone-800 p-6 font-sans">
        <div className="text-center space-y-3 max-w-md">
          <h1 className="text-2xl font-bold font-serif">Portfolio Not Found</h1>
          <p className="text-sm text-stone-600">
            The requested portfolio does not exist or has not been published yet.
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-5 py-2.5 rounded-lg bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider"
          >
            Return to LEVELUP
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <PortfolioRenderer portfolio={portfolio} isStandalone={true} />
    </div>
  );
};
