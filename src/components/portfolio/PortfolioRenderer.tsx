import React, { useState } from 'react';
import { PortfolioItem, PortfolioProject } from '../../types';
import { MinimalPortfolioTemplate } from './templates/MinimalPortfolioTemplate';
import { DesignerPortfolioTemplate } from './templates/DesignerPortfolioTemplate';
import { DeveloperPortfolioTemplate } from './templates/DeveloperPortfolioTemplate';
import { CreativePortfolioTemplate } from './templates/CreativePortfolioTemplate';
import { ProfessionalPortfolioTemplate } from './templates/ProfessionalPortfolioTemplate';
import { EditorialPortfolioTemplate } from './templates/EditorialPortfolioTemplate';
import { CaseStudyModal } from './CaseStudyModal';

interface PortfolioRendererProps {
  portfolio: PortfolioItem;
  isStandalone?: boolean;
}

export const PortfolioRenderer: React.FC<PortfolioRendererProps> = ({ portfolio, isStandalone = false }) => {
  const [activeCaseStudyProject, setActiveCaseStudyProject] = useState<PortfolioProject | null>(null);

  const handleOpenCaseStudy = (project: PortfolioProject) => {
    setActiveCaseStudyProject(project);
  };

  const handleCloseCaseStudy = () => {
    setActiveCaseStudyProject(null);
  };

  const renderSelectedTemplate = () => {
    switch (portfolio.template) {
      case 'designer':
        return <DesignerPortfolioTemplate portfolio={portfolio} onOpenCaseStudy={handleOpenCaseStudy} isStandalone={isStandalone} />;
      case 'developer':
        return <DeveloperPortfolioTemplate portfolio={portfolio} onOpenCaseStudy={handleOpenCaseStudy} isStandalone={isStandalone} />;
      case 'creative':
        return <CreativePortfolioTemplate portfolio={portfolio} onOpenCaseStudy={handleOpenCaseStudy} isStandalone={isStandalone} />;
      case 'professional':
        return <ProfessionalPortfolioTemplate portfolio={portfolio} onOpenCaseStudy={handleOpenCaseStudy} isStandalone={isStandalone} />;
      case 'editorial':
        return <EditorialPortfolioTemplate portfolio={portfolio} onOpenCaseStudy={handleOpenCaseStudy} isStandalone={isStandalone} />;
      case 'minimal':
      default:
        return <MinimalPortfolioTemplate portfolio={portfolio} onOpenCaseStudy={handleOpenCaseStudy} isStandalone={isStandalone} />;
    }
  };

  return (
    <div className="w-full relative">
      {renderSelectedTemplate()}

      {/* Case Study Modal */}
      {activeCaseStudyProject && (
        <CaseStudyModal
          project={activeCaseStudyProject}
          design={portfolio.design}
          onClose={handleCloseCaseStudy}
        />
      )}
    </div>
  );
};
