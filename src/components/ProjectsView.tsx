import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  FolderGit2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import PageStandardsWrapper from './PageStandardsWrapper';
import UniversalCrudEngine from './UniversalCrudEngine';
import { PROJECTS_CONFIG } from '../metadata/configs';

interface ProjectsViewProps {
  activeSubTab?: string;
  currentUser?: {
    name?: string;
    role?: string;
    email?: string;
  };
}

export default function ProjectsView({ activeSubTab = 'projects', currentUser }: ProjectsViewProps) {
  const [metrics, setMetrics] = useState({
    totalBudget: 6550000,
    totalProjects: 3,
    highPriority: 1,
    activeStage: 2
  });

  const loadMetrics = () => {
    try {
      const raw = localStorage.getItem('axiom_crud_projects');
      const projects = raw ? JSON.parse(raw) : [];

      const totalBudget = projects.reduce((sum: number, p: any) => sum + (Number(p.budget) || 0), 0);
      const totalProjects = projects.length || 3;
      const highPriority = projects.filter((p: any) => p.priority === 'High').length || 1;
      const activeStage = projects.filter((p: any) => p.stage === 'Active' || p.stage === 'Review').length || 2;

      setMetrics({
        totalBudget: totalBudget || 6550000,
        totalProjects,
        highPriority,
        activeStage
      });
    } catch (e) {
      // Fallback
    }
  };

  useEffect(() => {
    loadMetrics();
    window.addEventListener('storage', loadMetrics);
    return () => window.removeEventListener('storage', loadMetrics);
  }, []);

  return (
    <PageStandardsWrapper
      title="Corporate Project Board Registry"
      subtitle="Register, analyze, track milestones, and govern your project lifecycles and contract budgets."
      loading={false}
      error={null}
      currentUser={currentUser}
      permissionRoles={['Administrator', 'Manager', 'Sales Agent']}
      breadcrumbs={[
        { label: 'Axiom ERP', onClick: () => {} },
        { label: 'Project Board Registry', active: true },
      ]}
    >
      <div className="space-y-6">
        {/* PROJECTS METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Project Portfolios</div>
            <div className="text-xl font-extrabold text-slate-800">{metrics.totalProjects} Portfolios</div>
            <div className="text-[11px] text-indigo-500 font-medium">Under active tracking</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Aggregated Budgets</div>
            <div className="text-xl font-extrabold text-slate-800">৳{metrics.totalBudget.toLocaleString()} BDT</div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Fully governed capitals
            </div>
          </div>
          <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">High Priority Criticals</div>
            <div className="text-xl font-extrabold text-rose-600">{metrics.highPriority} Tasks</div>
            <div className="text-[11px] text-rose-500 font-medium">Require executive reviews</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Active Board Stages</div>
            <div className="text-xl font-extrabold text-indigo-600">{metrics.activeStage} In-Progress</div>
            <div className="text-[11px] text-slate-400">Daily deployments</div>
          </div>
        </div>

        {/* CORE RENDERER */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4">
          <UniversalCrudEngine
            config={PROJECTS_CONFIG}
            currentUser={currentUser}
            onDataChange={loadMetrics}
          />
        </div>
      </div>
    </PageStandardsWrapper>
  );
}
