import {
  InterviewExperienceLevel,
  InterviewType,
  InterviewPrepPlan,
  DayByDayRoadmapItem,
  JobDescriptionAnalysis,
  InterviewQuestionItem,
  InterviewHrTopicItem,
} from '../types';

interface GeneratePlanParams {
  targetRole: string;
  experienceLevel: InterviewExperienceLevel;
  interviewType: InterviewType;
  skills: string[];
  targetCompany?: string;
  jobDescription?: string;
  userProjects?: any[];
  userExperience?: any[];
  userProfileSummary?: string;
  candidateSummary?: string;
  projects?: any[];
  experience?: any[];
  candidateSkills?: string[];
}

export function generateLocalInterviewPrepPlan({
  targetRole,
  experienceLevel,
  interviewType,
  skills,
  targetCompany,
  jobDescription,
  userProjects = [],
  userExperience = [],
  projects = [],
  experience = [],
}: GeneratePlanParams): InterviewPrepPlan {
  const effectiveProjects = projects.length > 0 ? projects : userProjects;
  const effectiveExperience = experience.length > 0 ? experience : userExperience;
  const isSenior = experienceLevel === '3+ years';
  const isFresher = experienceLevel === 'Fresher' || experienceLevel === '0–1 years';
  const difficultyLevel = isSenior ? 'Senior/Staff Bar' : isFresher ? 'Entry' : 'Intermediate';
  const companyLabel = targetCompany ? ` at ${targetCompany}` : '';
  const skillsList = skills.length > 0 ? skills : ['Core Domain Knowledge', 'Problem Solving', 'Structured Communication'];
  const primarySkill = skillsList[0] || (targetRole.includes('Design') ? 'Figma & Design Systems' : targetRole.includes('Data') ? 'SQL & Analytics' : 'Architecture & Code');
  const secondarySkill = skillsList[1] || (targetRole.includes('Design') ? 'User Research' : targetRole.includes('Data') ? 'Python / Pandas' : 'Clean Code & Testing');
  const tertiarySkill = skillsList[2] || (targetRole.includes('Design') ? 'Prototyping' : targetRole.includes('Data') ? 'Data Visualization' : 'System Design');

  const planId = `plan_${Date.now()}`;
  const nowIso = new Date().toISOString();

  // Role-specific customized questions
  const questions: InterviewQuestionItem[] = [
    {
      id: 'q_1',
      question: targetRole.toLowerCase().includes('frontend')
        ? 'How do you optimize React rendering performance, minimize re-renders, and manage complex state architecture in large-scale web applications?'
        : targetRole.toLowerCase().includes('designer') || targetRole.toLowerCase().includes('ui/ux')
        ? 'Walk me through your end-to-end design process when building a scalable Design System from scratch across cross-functional engineering teams.'
        : targetRole.toLowerCase().includes('data')
        ? 'How do you design an analytical SQL query to calculate 30-day cohort retention and identify data anomalies in high-volume event streams?'
        : targetRole.toLowerCase().includes('backend')
        ? 'How would you design a distributed caching and rate-limiting tier to protect downstream PostgreSQL databases from sudden traffic spikes?'
        : `Walk me through an end-to-end project where you leveraged ${primarySkill} to solve a complex business or user challenge.`,
      category: 'Technical',
      type: 'Technical',
      difficulty: isSenior ? 'Hard' : 'Medium',
      evaluates: 'Technical depth, architectural clarity, and business context alignment',
      sampleFramework: 'STAR Framework + Architectural Walkthrough (Context -> Core Technical Bottleneck -> Architecture/Design Choice -> Measurable Business Outcome)',
      keyPointsToCover: [
        `Explain the high-level architecture and why you chose ${primarySkill} over alternatives.`,
        'Highlight constraints (latency, scalability, user friction, or deadlines).',
        'Quantify results with real metrics (% speed boost, adoption rate, error reduction).',
      ],
    },
    {
      id: 'q_2',
      question: `Describe a time when you experienced a major roadblock or disagreement with a cross-functional teammate or lead. How did you resolve it?`,
      category: 'Behavioral',
      type: 'Behavioral',
      difficulty: 'Medium',
      evaluates: 'Emotional intelligence, conflict resolution, and objective alignment',
      sampleFramework: 'Situation -> Task -> Action -> Objective Evidence -> Long-term Relationship Outcome',
      keyPointsToCover: [
        'Frame the disagreement objectively focusing on user/business impact, never personal differences.',
        'Detail how you gathered data or prototypes to test hypotheses neutrally.',
        'Reflect on the long-term collaboration relationship established afterward.',
      ],
    },
    {
      id: 'q_3',
      question: `How do you diagnose and debug performance, memory, or throughput bottlenecks in a production environment using ${secondarySkill}?`,
      category: 'Technical',
      type: 'Technical',
      difficulty: isSenior ? 'Hard' : 'Medium',
      evaluates: 'Root-cause analysis, production observability, and systematic debugging',
      sampleFramework: 'Hypothesis Formulation -> Telemetry/Profiling Tooling -> Isolation & Reproduction -> Remediation & Regression Testing',
      keyPointsToCover: [
        'Mention standard diagnostic tools, APM metrics, profiling logs, and reproduction steps.',
        'Discuss short-term mitigation (failover, caching, rate-limiting) vs. root-cause refactoring.',
        'Explain post-mortem mechanisms to prevent future regressions.',
      ],
    },
    {
      id: 'q_4',
      question: `Why do you want to join ${targetCompany || 'our team'} in this specific ${targetRole} capacity, and what value will you deliver in your first 90 days?`,
      category: 'HR',
      type: 'HR',
      difficulty: 'Easy',
      evaluates: 'Company alignment, proactive initiative, and 30-60-90 day strategic vision',
      sampleFramework: 'Company Mission Resonance -> Core Skill Intersection -> 30/60/90 Day Execution Plan',
      keyPointsToCover: [
        `Demonstrate specific understanding of ${targetCompany || 'the organization'}'s market challenges and products.`,
        'Map your previous wins directly to current company growth vectors.',
        'Articulate a structured 30/60/90 onboarding framework (Listen & Map -> Execute & Ship -> Scale & Optimize).',
      ],
    },
  ];

  // Project-specific questions from user resume / portfolio
  if (userProjects && userProjects.length > 0) {
    userProjects.slice(0, 2).forEach((proj: any, idx: number) => {
      questions.push({
        id: `q_proj_${idx + 1}`,
        question: `In your project "${proj.name || 'Featured Project'}", what was the most difficult architectural trade-off you made regarding ${Array.isArray(proj.technologies) ? proj.technologies.slice(0, 2).join(' & ') : 'your chosen technology stack'}, and what would you improve with more time?`,
        category: 'Project',
        type: 'Technical',
        difficulty: isSenior ? 'Hard' : 'Medium',
        evaluates: 'Hands-on architectural ownership, reflection on trade-offs, and critical thinking.',
        sampleFramework: 'Project Stakes -> Architectural Choice & Rejected Alternatives -> Bottlenecks Encountered -> Lessons Learned',
        keyPointsToCover: [
          `Discuss the trade-offs of ${Array.isArray(proj.technologies) ? proj.technologies.join(', ') : 'the stack'}.`,
          'Explain the edge cases or performance bottlenecks.',
          'Quantify user impact or development speed gains.',
        ],
        projectRef: proj.name,
      });
    });
  }

  // Job description question if JD provided
  if (jobDescription) {
    questions.push({
      id: 'q_jd_1',
      question: `How have you previously executed deliverables matching the core requirements and scale of this ${targetRole} job specification?`,
      category: 'Job-Specific',
      type: 'Technical',
      difficulty: 'Medium',
      evaluates: 'Direct alignment with target job requirements and hands-on competence.',
      sampleFramework: 'Target Job Requirement -> Specific Past Example -> Quantified Results',
      keyPointsToCover: [
        'Directly address the primary responsibilities highlighted in the job description.',
        'Cite concrete metrics and past execution patterns.',
      ],
    });
  }

  // 14-day roadmap
  const dayByDayRoadmap: DayByDayRoadmapItem[] = [
    { day: 1, phase: 'Phase 1: Foundations & Diagnostics', title: 'Role Fundamentals & Competency Audit', focus: `Audit core principles of ${primarySkill} and baseline diagnostic assessment.`, tasks: [`Review core lifecycle and internals of ${primarySkill}`, 'Draft a 1-page cheatsheet of core definitions and paradigms', 'Audit top 3 strengths and top 3 growth areas'], estimatedMinutes: 60, category: 'Fundamentals' },
    { day: 2, phase: 'Phase 1: Foundations & Diagnostics', title: 'Core Technical Concepts & Execution', focus: `Master the essential execution model and performance pillars of ${secondarySkill}.`, tasks: [`Deep dive into ${secondarySkill} best practices and common pitfalls`, 'Solve 3 fundamental implementation exercises', 'Review standard conventions and design patterns'], estimatedMinutes: 75, category: 'Technical' },
    { day: 3, phase: 'Phase 1: Foundations & Diagnostics', title: 'Tools, Frameworks & Modern Ecosystem', focus: `Review the key tools, libraries, and ecosystem standards for modern ${targetRole}.`, tasks: [`Practice with ${tertiarySkill} workflows`, 'Review ecosystem trade-offs and alternative tooling', 'Refine hotkeys and live-interview problem setup'], estimatedMinutes: 60, category: 'Technical' },
    { day: 4, phase: 'Phase 2: In-Depth Domain Drills', title: 'Live Problem Solving & Logic Drills', focus: 'Develop structured verbal thinking and methodical problem breakdown.', tasks: ['Solve 2 complex domain scenarios with a 30-minute timer', 'Vocalize assumptions, time/space trade-offs, and edge cases', 'Review optimal solutions and refactor for elegance'], estimatedMinutes: 90, category: 'Technical' },
    { day: 5, phase: 'Phase 2: In-Depth Domain Drills', title: 'Project & Portfolio Deep Dive', focus: 'Prepare comprehensive architectural walkthroughs of your top 2 resume projects.', tasks: ['Map out the architecture diagram and data flow for your primary project', 'Prepare answers for: "Why this tech?", "Biggest mistake?", "Scale bottlenecks?"', 'Practice a crisp 90-second project elevator pitch'], estimatedMinutes: 75, category: 'Projects' },
    { day: 6, phase: 'Phase 2: In-Depth Domain Drills', title: 'Advanced Technical Inquiries & Edge Cases', focus: `Tackle deep-dive technical questions on ${primarySkill} and ${secondarySkill}.`, tasks: ['Answer 5 tough domain questions without referencing notes', 'Document memory management, security, and caching strategies', 'Practice live whiteboarding / diagramming solutions'], estimatedMinutes: 90, category: 'Technical' },
    { day: 7, phase: 'Phase 2: In-Depth Domain Drills', title: 'HR & STAR Behavioral Story Vault', focus: 'Construct and refine 5 core STAR behavioral stories for culture fit rounds.', tasks: ['Draft Story 1: Handling technical or personal conflict', 'Draft Story 2: Leading through ambiguity or crisis', 'Draft Story 3: Proudest measurable business impact', 'Record voice notes to eliminate filler words'], estimatedMinutes: 60, category: 'Behavioral' },
    { day: 8, phase: 'Phase 3: Targeted Reinforcement', title: 'Weak Area Remediation & Practice', focus: 'Target the specific areas you felt least confident in during Days 1–7.', tasks: ['Re-test concepts from your lowest-confidence topics', 'Write concise summary notes for rapid recall', 'Do a speed drill on technical edge cases'], estimatedMinutes: 75, category: 'Technical' },
    { day: 9, phase: 'Phase 3: Targeted Reinforcement', title: 'Practical Application & Scenario Cases', focus: `Solve practical real-world situational cases for ${targetRole}.`, tasks: ['Analyze a full end-to-end case study from prompt to solution', 'Structure non-functional requirements (SLA, scalability, accessibility)', 'Review industry post-mortems and failure mitigation'], estimatedMinutes: 90, category: 'Case Study' },
    { day: 10, phase: 'Phase 3: Targeted Reinforcement', title: 'Advanced Topics & System Trade-offs', focus: 'Discuss scalability, architecture decoupling, and high-load failure modes.', tasks: ['Draft a complete system architecture diagram', 'Explain trade-offs between consistency, availability, and latency', 'Address observability, telemetry, and automated alerting'], estimatedMinutes: 90, category: 'Technical' },
    { day: 11, phase: 'Phase 4: Company & Final Simulation', title: `${targetCompany || 'Company'} & Job-Specific Preparation`, focus: `Deeply research ${targetCompany || 'the target company'} and role-specific expectations.`, tasks: [`Research ${targetCompany || 'target employer'}'s product suite and engineering blog`, 'Prepare 4 high-impact questions to ask interviewers', 'Align your resume achievements with the job description requirements'], estimatedMinutes: 60, category: 'Review' },
    { day: 12, phase: 'Phase 4: Company & Final Simulation', title: 'Mock Interview Prep & Setup Verification', focus: 'Prepare interview environment, pacing, and executive presentation.', tasks: ['Verify camera, microphone, screen share, and backup hot-spot', 'Review your 90-second "Tell me about yourself" introduction', 'Do a dry run of rapid-fire technical questions'], estimatedMinutes: 60, category: 'Mock' },
    { day: 13, phase: 'Phase 4: Company & Final Simulation', title: 'Full Timed Mock Interview Simulation', focus: 'Conduct a full 60-minute simulated interview under realistic exam conditions.', tasks: ['Complete a 45-minute technical/case section + 15-minute behavioral', 'Grade your performance across Clarity, Structure, and Technical Depth', 'Review recordings and tighten any rambling answers'], estimatedMinutes: 90, category: 'Mock' },
    { day: 14, phase: 'Phase 4: Company & Final Simulation', title: 'Final Revision & Calm Alignment', focus: 'Light review of high-yield summary sheets and mental relaxation.', tasks: ['Review your 1-page core cheatsheet', 'Review STAR stories and company questions', 'Rest well, hydrate, and prepare attire for interview day'], estimatedMinutes: 45, category: 'Review' },
  ];

  // Job description analysis
  const jdAnalysis: JobDescriptionAnalysis | undefined = jobDescription
    ? {
        isJdTargeted: true,
        focusSummary: `Preparation calibrated specifically for this ${targetRole} opening at ${targetCompany || 'the hiring organization'}. Key emphasis on hands-on execution with ${skillsList.join(', ')}, cross-functional delivery, and domain ownership.`,
        requiredSkills: skillsList.slice(0, 5),
        preferredSkills: skillsList.slice(5, 8).length > 0 ? skillsList.slice(5, 8) : ['System Design', 'Cloud Infrastructure', 'Mentorship'],
        likelyTechnicalTopics: [
          `Core ${primarySkill} implementation and architecture`,
          'Production observability, error handling, and performance tuning',
          'Cross-functional collaboration and API contract design',
        ],
        likelyBehavioralTopics: [
          'Managing tight timelines and ambiguous stakeholder requirements',
          'Demonstrating ownership during critical delivery blockers',
          'Collaborating effectively with product managers and engineers',
        ],
        importantTools: skillsList.slice(0, 4),
        experienceExpectations: isSenior ? 'Senior leadership, architectural autonomy, and cross-team mentorship.' : isFresher ? 'Solid foundation in fundamentals, curiosity, and rapid execution.' : 'Independent feature ownership, clean code craftsmanship, and team collaboration.',
        potentialInterviewRounds: [
          { round: 'Round 1: Recruiter / Initial Screen', focus: 'Career narrative, motivation, and high-level role fit', duration: '30 min' },
          { round: 'Round 2: Technical / Domain Deep Dive', focus: `Practical problem solving, ${primarySkill}, and coding/design`, duration: '60 min' },
          { round: 'Round 3: System Design / Case Study', focus: 'Architectural scalability, trade-off analysis, and product thinking', duration: '45–60 min' },
          { round: 'Round 4: Behavioral & Executive Alignment', focus: 'STAR scenarios, culture values, and mutual Q&A', duration: '45 min' },
        ],
      }
    : undefined;

  const hrTopics: InterviewHrTopicItem[] = [
    {
      topic: 'Career Trajectory & Growth',
      keyQuestions: [
        'Where do you see yourself technically and professionally in the next 2-3 years?',
        'What type of management style allows you to do your best work?',
      ],
      cultureFitPrompt: 'Align your personal growth goals with the team\'s engineering velocity and mentorship culture.',
      growthCompensationTips: 'Focus on continuous skill expansion, impact scope, and team enablement rather than purely title progression.',
    },
    {
      topic: 'Company Values & Culture Alignment',
      keyQuestions: [
        `What makes you excited about ${targetCompany || 'our product'} over other opportunities in the market?`,
        'How do you handle giving and receiving constructive critical feedback?',
      ],
      cultureFitPrompt: 'Demonstrate genuine enthusiasm for the customer problem and show humility when receiving feedback.',
      growthCompensationTips: 'Express clear interest in building a sustainable, high-trust relationship with peers.',
    },
  ];

  return {
    id: planId,
    targetRole,
    experienceLevel,
    interviewType,
    skills: skillsList,
    targetCompany: targetCompany || undefined,
    jobDescription: jobDescription || undefined,
    createdAt: nowIso,
    summary: `Structured ${experienceLevel} interview preparation masterplan for ${targetRole}${companyLabel}. Designed to maximize technical mastery, structured STAR communication, and company alignment across a 14-day execution sprint.`,
    recommendedDifficulty: {
      level: difficultyLevel,
      description: isSenior
        ? `Interviewers will evaluate high-level system trade-offs, architecture, technical ownership, and your ability to lead complex cross-functional initiatives under ambiguous constraints.`
        : isFresher
        ? `Evaluations will emphasize strong domain fundamentals, core problem-solving logic, willingness to learn, and structured verbal reasoning.`
        : `Expect a balanced assessment of practical hands-on execution (${primarySkill}, ${secondarySkill}), code craftsmanship, debugging instincts, and collaborative STAR storytelling.`,
      pitfallsToAvoid: [
        'Jumping into solutions before clarifying assumptions, functional constraints, and edge cases.',
        'Speaking in vague generalizations instead of backing statements with quantifiable metrics.',
        'Neglecting to vocalize your thought process during live technical or case study rounds.',
        'Failing to prepare 3 insightful, strategic questions tailored to the interviewer and company.',
      ],
      evaluationRubric: [
        { criteria: 'Technical & Domain Depth', weight: '40%', targetBehavior: 'Clear mastery of internal runtime, edge cases, and performance implications.' },
        { criteria: 'Structured Communication', weight: '30%', targetBehavior: 'Uses STAR framework, thinks aloud, and structures ideas methodically.' },
        { criteria: 'Problem Solving & Trade-offs', weight: '20%', targetBehavior: 'Clarifies requirements and evaluates alternative solutions with clear pros/cons.' },
        { criteria: 'Culture & Alignment', weight: '10%', targetBehavior: 'Demonstrates enthusiasm, humility, and positive collaboration.' },
      ],
    },
    preparationPriorities: [
      {
        priority: 1,
        title: interviewType === 'HR' || interviewType === 'Behavioral' ? 'STAR Story Vault & Leadership Principles' : `Core Technical Mastery (${primarySkill})`,
        description: `Deep-dive into foundational principles, internal mechanisms, and practical implementation patterns for ${primarySkill}.`,
        weight: '40% of Total Prep',
        keyFocusAreas: [`Deep dive into ${primarySkill}`, 'Edge-case debugging', 'Hands-on drills'],
      },
      {
        priority: 2,
        title: interviewType === 'Technical' ? 'System Architecture & Edge-Case Problem Solving' : 'Behavioral & Cross-Functional Collaboration',
        description: 'Prepare high-impact STAR narratives emphasizing conflict resolution, cross-functional synergy, and measurable ROI.',
        weight: '30% of Total Prep',
        keyFocusAreas: ['Component boundaries', 'Data flow & APIs', 'Failure mitigation'],
      },
      {
        priority: 3,
        title: 'Live Mock Drills & Whiteboarding',
        description: 'Conduct timed practice sessions speaking out loud and documenting thought processes in real-time.',
        weight: '20% of Total Prep',
        keyFocusAreas: ['STAR narratives', 'Resume project walkthroughs', '30-60-90 day plan'],
      },
      {
        priority: 4,
        title: targetCompany ? `${targetCompany} Company Deep-Dive & Vision` : 'Company & Product Alignment',
        description: `Research recent product launches, engineering blog posts, market rivals, and architectural challenges.`,
        weight: '10% of Total Prep',
        keyFocusAreas: ['Product teardown', 'Engineering blog review', 'Questions for interviewer'],
      },
    ],
    roadmap: [
      {
        phase: 'Phase 1: Diagnostic & Foundation',
        timeline: 'Days 1 – 3',
        focus: `Audit core strengths in ${primarySkill} and build your foundational STAR narrative vault.`,
        milestones: [
          `Map out the top 5 core principles and architectural patterns of ${primarySkill}.`,
          'Write down 4 comprehensive STAR stories: 1 Leadership/Impact, 1 Technical Failure/Learning, 1 Cross-functional Conflict, 1 Complex Delivery.',
          `Review official documentation and latest industry best practices for ${secondarySkill}.`,
          'Set up your live interview coding/ideation environment with clean hotkeys and minimal friction.',
        ],
      },
      {
        phase: 'Phase 2: Deep Technical & Scenario Drills',
        timeline: 'Days 4 – 8',
        focus: `Intense practice covering ${skillsList.slice(0, 3).join(', ')} under realistic interview constraints.`,
        milestones: [
          `Solve 6 domain problem sets or design scenarios focusing on ${primarySkill} and ${tertiarySkill}.`,
          'Practice explaining complex technical concepts out loud to a non-technical peer or AI coach.',
          'Review error handling, asymptotic complexity, caching, and state management trade-offs.',
          'Conduct 1 timed end-to-end mock interview (45 minutes technical + 15 minutes behavioral).',
        ],
      },
      {
        phase: 'Phase 3: System Design & Cross-Functional Alignment',
        timeline: 'Days 9 – 11',
        focus: 'Elevate higher-level architecture, scalability bottlenecks, and business context.',
        milestones: [
          `Formulate a 30-60-90 day impact roadmap tailored to the ${targetRole} position.`,
          'Deep-dive into 2 real-world architectural case studies relevant to the industry.',
          'Refine behavioral responses to ensure every answer wraps up with clear, quantified business impact.',
          'Compile a cheat-sheet of edge cases, failover strategies, and diagnostic commands.',
        ],
      },
      {
        phase: 'Phase 4: High-Stakes Simulation & Polish',
        timeline: 'Days 12 – 14',
        focus: 'Full dress-rehearsal mocks, strategic question preparation, and cognitive readiness.',
        milestones: [
          'Run a 60-minute simulated live panel interview without notes.',
          'Prepare 5 high-impact questions for the hiring manager, technical lead, and peer interviewer.',
          'Test audio, webcam lighting, screen-sharing layout, and backup internet tethering.',
          'Conduct a final review of key numbers, resume bullet points, and project milestones.',
        ],
      },
    ],
    dayByDayRoadmap,
    jobDescriptionAnalysis: jdAnalysis,
    importantTopics: [
      {
        topic: `${primarySkill} Architecture & Internals`,
        category: 'Technical',
        importance: 'Critical',
        keyConcepts: [
          'Underlying execution runtime and memory management',
          'Component lifecycle, concurrency, and async workflows',
          'Optimization, caching, and payload minimization',
        ],
        tips: 'Always explain the "Why" behind your choices rather than just stating what API or method you used.',
      },
      {
        topic: 'Structured Behavioral Communication (STAR)',
        category: 'HR/Behavioral',
        importance: 'Critical',
        keyConcepts: [
          'Situation (15%): Set the stage crisply with scale and stakes',
          'Task (10%): Specify your direct responsibility',
          'Action (55%): The meat—decisions, collaboration, technical actions',
          'Result (20%): Quantified ROI, team impact, and retrospective learning',
        ],
        tips: 'Keep answers between 90 and 150 seconds. Avoid getting bogged down in minor tactical trivia.',
      },
      {
        topic: `${secondarySkill} & Scalable Workflows`,
        category: 'System Design',
        importance: 'High',
        keyConcepts: [
          'Modularity, clean abstraction layers, and maintainability',
          'Error boundaries, telemetry, and fault-tolerance',
          'CI/CD, automated testing, and rollout safety',
        ],
        tips: 'Draw diagrams or structure notes cleanly before writing any implementation code.',
      },
      {
        topic: `${targetCompany || 'Company'} Business Model & Product Strategy`,
        category: 'Domain',
        importance: 'High',
        keyConcepts: [
          'Target user personas and monetization mechanics',
          'Key competitive differentiators vs. market rivals',
          'Current tech stack challenges and scaling vectors',
        ],
        tips: `Reference specific features or engineering blogs published by ${targetCompany || 'top tier companies'} to stand out.`,
      },
    ],
    recommendedQuestions: questions,
    technicalTopics: [
      {
        category: `${primarySkill} Deep Dive`,
        topics: [
          `Core internal lifecycle and execution model`,
          `Memory profiling, leak prevention, and garbage collection`,
          `State synchronization, concurrency, and event-driven paradigms`,
          `Securing inputs, dependency isolation, and vulnerability scanning`,
        ],
        deepDivePrompt: `Explain how you would architect a mission-critical subsystem in ${primarySkill} handling high concurrent traffic with sub-100ms response targets.`,
        masteryBenchmark: 'Able to articulate memory trade-offs and explain execution lifecycle without hesitation.',
      },
      {
        category: `${secondarySkill} & System Architecture`,
        topics: [
          'Designing for high availability and zero-downtime deployments',
          'Data normalization vs. denormalization trade-offs',
          'API contract design (REST, GraphQL, gRPC) and versioning strategies',
          'Observability: Metrics, structured logging, and distributed tracing',
        ],
        deepDivePrompt: 'How do you establish alerting thresholds and circuit breakers to prevent cascading system failures during sudden traffic surges?',
        masteryBenchmark: 'Can write clean profiling steps and explain metrics (P95/P99 latency).',
      },
    ],
    behavioralTopics: [
      {
        theme: 'Executive Ownership & Ambiguity',
        starSituationPrompt: 'Describe a project where requirements were vague or constantly shifting. How did you drive clarity and deliver results?',
        suggestedStoryAngle: 'Focus on your proactive stakeholder interviews, rapid wireframing/prototyping, and establishing clear milestone checkpoints.',
        redFlagsToAvoid: ['Blaming leadership for shifting priorities', 'Waiting passively for someone else to write requirements'],
      },
      {
        theme: 'High-Stakes Crisis Management',
        starSituationPrompt: 'Walk through the most critical production outage or delivery blocker you encountered. How did you lead the resolution?',
        suggestedStoryAngle: 'Highlight calm triage under pressure, clear communication to leadership, swift stabilization, and the blameless post-mortem.',
        redFlagsToAvoid: ['Pointing fingers at junior team members', 'Skipping automated regression safeguards after the fire is out'],
      },
      {
        theme: 'Technical Influence & Mentorship',
        starSituationPrompt: 'Tell me about a time you persuaded your team to adopt a new technical standard or architectural paradigm against initial resistance.',
        suggestedStoryAngle: 'Emphasize empathetic listening, creating objective comparison benchmarks, and running an incremental pilot to prove value.',
        redFlagsToAvoid: ['Forcing changes via authority without team buy-in', 'Ignoring existing architectural constraints'],
      },
    ],
    hrTopics,
    suggestedPracticeAreas: [
      {
        area: 'Live Whiteboard & Solution Framing',
        actionableExercise: 'Pick a prominent product feature and sketch the complete data flow, component boundaries, and edge cases in 20 minutes.',
        suggestedTools: ['Excalidraw', 'Miro', 'Blank Code Editor'],
        expectedOutput: 'A clean, high-level architectural diagram with clear API boundaries and failure mitigation notes.',
      },
      {
        area: 'Rapid STAR Story Audio Recording',
        actionableExercise: 'Record yourself answering the top 3 behavioral questions using your phone or voice memo app. Listen back for clarity and pacing.',
        suggestedTools: ['Voice Memos', 'Otter.ai', 'Loom'],
        expectedOutput: 'Crisp 2-minute answers with zero filler words, strong active verbs, and quantified business impact metrics.',
      },
      {
        area: 'Hands-on Timed Implementation',
        actionableExercise: `Build a clean, robust mini-module from scratch using ${primarySkill} incorporating unit tests and error handling in under 40 minutes.`,
        suggestedTools: ['StackBlitz', 'CodeSandbox', 'Local IDE'],
        expectedOutput: 'Production-grade code featuring type safety, modular design, edge-case handling, and unit test coverage.',
      },
    ],
  };
}
