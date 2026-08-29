import React, { useState } from 'react';
import { SideNavBar } from '../components/SideNavBar';
import { useApp } from '../context/AppContext';
import { ContentPost } from '../types';

export const CreatorCalendarPage: React.FC = () => {
  const { state, addPost, openAIModal } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDay, setPostDay] = useState(15);
  const [postPlatform, setPostPlatform] = useState<ContentPost['platform']>('X');
  const [postStatus, setPostStatus] = useState<ContentPost['status']>('Draft');

  const [showAiIdeasModal, setShowAiIdeasModal] = useState(false);
  const [aiIdeas, setAiIdeas] = useState<{ title: string; hook: string; platform: string }[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    let colorTag = 'bg-surface-variant';
    if (postPlatform === 'Instagram') colorTag = 'bg-tertiary-container text-on-tertiary-container';
    else if (postPlatform === 'YouTube') colorTag = 'bg-error-container';
    else if (postPlatform === 'LinkedIn') colorTag = 'bg-primary-fixed/40';
    else if (postPlatform === 'TikTok') colorTag = 'bg-secondary-container';

    addPost({
      day: Number(postDay),
      title: postTitle,
      platform: postPlatform,
      status: postStatus,
      colorTag,
    });

    setPostTitle('');
    setShowAddModal(false);
  };

  const handleGenerateAiIdeas = async () => {
    setShowAiIdeasModal(true);
    setIsGeneratingIdeas(true);
    try {
      const res = await fetch('/api/ai/creator-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Product Design Systems & High-Performance SaaS',
          platform: 'X & YouTube',
        }),
      });
      const data = await res.json();
      setAiIdeas(data.ideas || []);
    } catch (e) {
      console.warn('AI ideas error:', e);
      setAiIdeas([
        {
          title: '3 Design System mistakes that cost teams 200+ engineering hours',
          hook: 'Most teams over-tokenize colors before nailing layout primitives. Here is the 2024 playbook:',
          platform: 'X',
        },
        {
          title: 'A Day in the Life of a Senior Product Designer in SF',
          hook: 'How I manage 4 design sprints, daily hypertrophy workouts, and side projects without burning out.',
          platform: 'YouTube',
        },
      ]);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <SideNavBar active="creator" />
      <main className="lg:ml-[280px] ml-0 flex-1 flex flex-col bg-surface-container-lowest min-h-screen w-full overflow-x-hidden">
        {/* Header */}
        <header className="min-h-[5rem] py-3 border-b border-outline-variant flex justify-between items-center px-4 sm:px-margin-desktop bg-surface/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex gap-stack-md hidden lg:flex">
            <span className="text-primary border-b-2 border-primary font-headline-sm pb-1 font-bold">
              Dashboard
            </span>
            <span className="text-on-surface-variant font-headline-sm pb-1">Analytics</span>
          </div>
          <div className="flex gap-4 items-center ml-auto">
            <button
              onClick={handleGenerateAiIdeas}
              className="px-4 py-2 border border-primary text-primary rounded-lg font-label-caps uppercase text-xs hover:bg-primary-fixed/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              AI Content Hooks
            </button>
            <img
              className="w-10 h-10 rounded-full border border-outline-variant object-cover"
              src={state.profile.avatar}
              alt="User"
            />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-margin-desktop max-w-[1600px] mx-auto w-full flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
            <div>
              <h2 className="font-headline-lg text-primary">
                {state.creator.month} {state.creator.year}
              </h2>
              <p className="text-secondary font-body-md text-sm">Content & Strategy Overview</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-container text-on-primary px-5 sm:px-6 py-2.5 sm:py-3 rounded font-label-caps uppercase text-xs flex items-center gap-2 hover:bg-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              NEW POST
            </button>
          </div>

          {/* Calendar Grid with responsive horizontal scroll */}
          <div className="border border-outline-variant rounded-xl overflow-x-auto bg-outline-variant shadow-sm">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-7 gap-px">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="bg-surface py-3 text-center uppercase text-xs font-bold text-on-surface-variant">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px min-h-[520px]">
              {daysInMonth.map((dayNum) => {
                const postsOnDay = state.creator.posts.filter((p) => p.day === dayNum);
                return (
                  <div
                    key={dayNum}
                    onClick={() => {
                      setPostDay(dayNum);
                      setShowAddModal(true);
                    }}
                    className="bg-surface-container-lowest p-2.5 min-h-[120px] hover:bg-surface-container-low transition-colors cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-on-surface">{dayNum}</span>
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] text-primary font-bold">+</span>
                    </div>

                    <div className="space-y-1.5 my-1">
                      {postsOnDay.map((p) => (
                        <div
                          key={p.id}
                          className={`${p.colorTag || 'bg-surface-variant'} p-1.5 rounded text-[10px] font-bold border border-outline-variant/40 leading-tight truncate shadow-xs`}
                          title={p.title}
                        >
                          <span className="opacity-70 font-semibold mr-1">[{p.platform}]</span>
                          {p.title}
                        </div>
                      ))}
                    </div>

                    <div></div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>

        {/* Add Post Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full animate-fade-up shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-primary">Schedule Content Post</h3>
                <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleAddPost} className="space-y-4">
                <div>
                  <label className="font-label-caps text-xs block mb-1">Post Title / Topic</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="E.g. X Thread: Design Tokens Breakdown"
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-label-caps text-xs block mb-1">Calendar Day</label>
                    <select
                      value={postDay}
                      onChange={(e) => setPostDay(Number(e.target.value))}
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface-container-lowest"
                    >
                      {daysInMonth.map((d) => (
                        <option key={d} value={d}>
                          Oct {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-label-caps text-xs block mb-1">Platform</label>
                    <select
                      value={postPlatform}
                      onChange={(e) => setPostPlatform(e.target.value as any)}
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface-container-lowest"
                    >
                      <option value="X">X (Twitter)</option>
                      <option value="Instagram">Instagram</option>
                      <option value="YouTube">YouTube</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Blog">Blog</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-label-caps text-xs block mb-1">Status</label>
                  <select
                    value={postStatus}
                    onChange={(e) => setPostStatus(e.target.value as any)}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-sm bg-surface-container-lowest"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded font-label-caps text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase hover:bg-primary transition-colors"
                  >
                    Schedule Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI Ideas Modal */}
        {showAiIdeasModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-lg w-full animate-fade-up shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
                  <h3 className="font-headline-sm text-primary">Viral Content Hooks</h3>
                </div>
                <button onClick={() => setShowAiIdeasModal(false)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {isGeneratingIdeas ? (
                <div className="py-12 text-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-on-surface-variant">Generating viral hooks with Gemini 3.7 Flash...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiIdeas.map((idea, idx) => (
                    <div key={idx} className="p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs bg-primary-fixed text-primary px-2 py-0.5 rounded">
                          {idea.platform}
                        </span>
                        <button
                          onClick={() => {
                            setPostTitle(idea.title);
                            setShowAiIdeasModal(false);
                            setShowAddModal(true);
                          }}
                          className="text-xs font-label-caps text-primary hover:underline uppercase"
                        >
                          + Add to Calendar
                        </button>
                      </div>
                      <h4 className="font-headline-sm text-sm font-bold text-on-surface">{idea.title}</h4>
                      <p className="text-xs text-on-surface-variant italic leading-relaxed bg-surface-container-lowest p-2.5 rounded border border-outline-variant/30">
                        "{idea.hook}"
                      </p>
                    </div>
                  ))}

                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={() => setShowAiIdeasModal(false)}
                      className="px-6 py-2 bg-primary-container text-on-primary rounded font-label-caps text-xs uppercase"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
