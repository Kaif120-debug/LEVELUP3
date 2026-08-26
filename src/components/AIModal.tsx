import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../hooks/useSubscription';
import { ProBadge } from './ProBadge';

export const AIModal: React.FC = () => {
  const { isAIModalOpen, closeAIModal, aiModalInitialPrompt, state } = useApp();
  const { isPro, openUpgradeModal } = useSubscription();
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: `Hello ${state.profile.name}! I am your LEVELUP Executive Coach. I can help with workouts, ATS resume optimization, day scheduling, academic milestones, and content creation strategy. What would you like to level up today?`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aiModalInitialPrompt) {
      setInput(aiModalInitialPrompt);
    }
  }, [aiModalInitialPrompt]);

  useEffect(() => {
    if (isAIModalOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAIModalOpen]);

  if (!isAIModalOpen) return null;

  const quickPrompts = [
    'Generate my Upper Body workout',
    'Review my resume for Staff Designer role',
    'Optimize my daily time blocks',
    'Viral content hook for X thread',
    'Study strategy for Calculus II',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    if (!isPro) {
      openUpgradeModal('LEVELUP AI Copilot & AI Generations');
      return;
    }

    const userMessage = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: {
            name: state.profile.name,
            title: state.profile.title,
            focus: state.profile.selectedFocus,
            weight: state.fitness.weight,
            targetWeight: state.fitness.targetWeight,
            pendingAssignments: state.student.assignments.filter((a) => a.status !== 'Completed').length,
          },
        }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || 'LEVELUP Coach: Focus on your highest priority objective today and maintain momentum!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `LEVELUP Assistant: Here is a quick strategy for "${query}": prioritize your top 3 daily objectives, drink water to maintain focus, and execute single-task deep work blocks.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-2xl h-[90vh] sm:h-[640px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-outline-variant flex justify-between items-center bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-primary leading-tight text-base sm:text-lg">LEVELUP AI Copilot</h3>
                <ProBadge featureName="AI Copilot & Intelligence" size="xs" />
              </div>
              <p className="text-[11px] sm:text-xs text-on-surface-variant line-clamp-1">Powered by Gemini 3.7 Flash • Executive Growth Coach</p>
            </div>
          </div>
          <button
            onClick={closeAIModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Pro Banner for Free Users */}
        {!isPro && (
          <div className="px-4 sm:px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 text-amber-800">
              <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">lock</span>
              <span>Free tier limit: 0 AI generations. Upgrade to Pro for unlimited Gemini coaching.</span>
            </div>
            <button
              onClick={() => openUpgradeModal('LEVELUP AI Copilot')}
              className="px-2.5 py-1 rounded-md bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-surface-container-low border-b border-outline-variant flex gap-2 overflow-x-auto text-xs whitespace-nowrap shrink-0">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="bg-surface-container-lowest border border-outline-variant hover:border-primary px-3 py-1.5 rounded-full text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface-bright">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 shadow-sm text-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary-container text-on-primary rounded-br-none'
                    : 'bg-surface-container-lowest border border-outline-variant text-on-surface rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                <span
                  className={`text-[10px] block mt-2 ${
                    msg.sender === 'user' ? 'text-on-primary/70 text-right' : 'text-on-surface-variant'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-xs text-on-surface-variant ml-2 font-medium">LEVELUP AI is reasoning...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-surface border-t border-outline-variant flex items-center gap-2 sm:gap-3 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about workouts, resume, tasks..."
            className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-primary text-on-surface"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-primary-container text-on-primary px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-label-caps uppercase flex items-center gap-1.5 sm:gap-2 hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs"
          >
            <span>Send</span>
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
