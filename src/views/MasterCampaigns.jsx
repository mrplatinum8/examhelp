import React, { useState } from 'react';
import { Target, CheckCircle2, Circle, Calendar, Trophy, Plus, ArrowUpRight, Award, Zap, Sparkles, Check } from 'lucide-react';
import { lifeOsStorage } from '../lib/lifeOsStorage';
import { useData } from '../contexts/DataContext';

export default function MasterCampaignsView() {
  const [campaigns, setCampaigns] = useState(() => lifeOsStorage.getCampaigns());
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [activeCampaignId, setActiveCampaignId] = useState(campaigns[0]?.id || 'gate-2027');
  const { showToast } = useData();

  const handleToggleMilestone = (campaignId, milestoneId) => {
    const updated = lifeOsStorage.toggleCampaignMilestone(campaignId, milestoneId);
    setCampaigns([...updated]);
    showToast('Milestone status updated! 🎯');
  };

  const handleAddMilestone = (campaignId) => {
    if (!newMilestoneText.trim()) return;
    const updated = campaigns.map((c) => {
      if (c.id === campaignId) {
        return {
          ...c,
          milestones: [
            ...c.milestones,
            { id: `m_${Date.now()}`, title: newMilestoneText.trim(), done: false },
          ],
        };
      }
      return c;
    });
    setCampaigns(updated);
    lifeOsStorage.saveCampaigns(updated);
    setNewMilestoneText('');
    showToast('New milestone added to campaign!');
  };

  const currentCamp = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];
  const completedCount = currentCamp.milestones.filter((m) => m.done).length;
  const totalCount = currentCamp.milestones.length;
  const percent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
              LIFE OS PRIME MODULE
            </span>
            <span className="text-xs font-mono text-gray-500">Strategic Campaigns</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>🎯 Master Campaigns</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Multi-month roadmaps for GATE CS 2027, Software Job Acquisition, and Global Master's Applications.
          </p>
        </div>
      </div>

      {/* Campaign Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {campaigns.map((camp) => {
          const comp = camp.milestones.filter((m) => m.done).length;
          const tot = camp.milestones.length;
          const pct = tot ? Math.round((comp / tot) * 100) : 0;
          const isSelected = camp.id === activeCampaignId;

          return (
            <div
              key={camp.id}
              onClick={() => setActiveCampaignId(camp.id)}
              className={`glass rounded-2xl p-5 cursor-pointer transition-all border ${
                isSelected
                  ? 'border-violet-500/50 bg-violet-500/[0.08] shadow-lg shadow-violet-500/10 scale-[1.02]'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-xl">
                  {camp.icon}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400 border border-white/10 font-bold">
                  {camp.badge}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mb-1">{camp.title}</h2>
              <p className="text-xs text-gray-500 line-clamp-2 mb-4">{camp.description}</p>

              {/* Mini progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">{comp} / {tot} Milestones</span>
                  <span className="text-violet-400 font-bold">{pct}%</span>
                </div>
                <div className="w-full bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Campaign Detail & Checklist */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl btn-gradient flex items-center justify-center text-2xl shadow-lg">
              {currentCamp.icon}
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{currentCamp.title}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Target Deadline: <span className="text-violet-300 font-mono font-bold">{currentCamp.targetDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium">Sprint Completion</p>
              <p className="text-2xl font-black font-mono text-emerald-400">{percent}%</p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center relative">
              <span className="text-xs font-bold text-white">{completedCount}/{totalCount}</span>
            </div>
          </div>
        </div>

        {/* Milestones Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-400" /> Strategic Roadmap & Milestones
          </h3>

          <div className="space-y-2">
            {currentCamp.milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => handleToggleMilestone(currentCamp.id, m.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  m.done
                    ? 'bg-emerald-500/[0.05] border-emerald-500/20 text-gray-400'
                    : 'bg-white/[0.02] border-white/5 hover:border-violet-500/30 text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      m.done
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-white/20 text-transparent hover:border-violet-400'
                    }`}
                  >
                    {m.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      m.done ? 'line-through text-gray-500' : 'text-gray-200'
                    }`}
                  >
                    {m.title}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold shrink-0 ${
                    m.done
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-white/[0.05] text-gray-500'
                  }`}
                >
                  {m.done ? 'COMPLETED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>

          {/* Add custom milestone */}
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
            <input
              type="text"
              placeholder={`Add custom milestone to ${currentCamp.title}…`}
              value={newMilestoneText}
              onChange={(e) => setNewMilestoneText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(currentCamp.id)}
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
            />
            <button
              onClick={() => handleAddMilestone(currentCamp.id)}
              className="px-4 py-2.5 rounded-xl btn-gradient text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
