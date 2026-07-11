import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  CheckSquare,
  Kanban,
  Calendar,
  Flag,
  Clock,
  Plus,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Users
} from 'lucide-react';

interface ProjectsViewProps {
  activeSubTab?: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
  client: string;
  manager: string;
  startDate: string;
  endDate: string;
  budget: number;
  progress: number; // 0 to 100
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Delayed';
}

interface ProjectTask {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  assignee: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  dueDate: string;
}

interface Milestone {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'Achieved' | 'Delayed';
}

interface Timesheet {
  id: string;
  employeeName: string;
  projectName: string;
  date: string;
  hours: number;
  activityDescription: string;
  billingStatus: 'Billable' | 'Non-Billable';
}

export default function ProjectsView({ activeSubTab = 'projects' }: ProjectsViewProps) {
  const currentTab = ['projects', 'tasks', 'kanban', 'calendar', 'milestones', 'timesheets'].includes(activeSubTab)
    ? activeSubTab
    : 'projects';

  // --- STATE ENGINES ---
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('axiom_projects');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'proj1', name: 'Madani Tower Foundation', code: 'PRJ-MDT-01', client: 'Baitul Mukarram Builders', manager: 'Rashedul Islam', startDate: '2026-06-01', endDate: '2026-09-30', budget: 1200000, progress: 65, status: 'In Progress' },
      { id: 'proj2', name: 'Narayanganj Warehouse Extension', code: 'PRJ-NYW-02', client: 'Axiom Logistics', manager: 'Farhana Yasmin', startDate: '2026-07-10', endDate: '2026-11-15', budget: 850000, progress: 10, status: 'In Progress' },
      { id: 'proj3', name: 'Purbachal Green City Complex', code: 'PRJ-PGC-03', client: 'Purbachal Housing Ltd', manager: 'Asaduzzaman Khan', startDate: '2026-08-01', endDate: '2027-04-30', budget: 4500000, progress: 0, status: 'Planning' },
    ];
  });

  const [tasks, setTasks] = useState<ProjectTask[]>(() => {
    const saved = localStorage.getItem('axiom_project_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 't1', projectId: 'proj1', projectName: 'Madani Tower Foundation', title: 'Excavation and Soil Hardening', assignee: 'Rashedul Islam', priority: 'High', status: 'Done', dueDate: '2026-06-20' },
      { id: 't2', projectId: 'proj1', projectName: 'Madani Tower Foundation', title: 'Cement Mixture and Pouring', assignee: 'Asaduzzaman Khan', priority: 'High', status: 'In Progress', dueDate: '2026-07-25' },
      { id: 't3', projectId: 'proj2', projectName: 'Narayanganj Warehouse Extension', title: 'Boundary Wall Bricklaying', assignee: 'Farhana Yasmin', priority: 'Medium', status: 'To Do', dueDate: '2026-08-15' },
    ];
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('axiom_project_milestones');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'm1', projectId: 'proj1', projectName: 'Madani Tower Foundation', title: 'Soil Testing Approved', dueDate: '2026-06-10', status: 'Achieved' },
      { id: 'm2', projectId: 'proj1', projectName: 'Madani Tower Foundation', title: 'Basement Casting Finished', dueDate: '2026-08-15', status: 'Pending' },
    ];
  });

  const [timesheets, setTimesheets] = useState<Timesheet[]>(() => {
    const saved = localStorage.getItem('axiom_project_timesheets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'ts1', employeeName: 'Rashedul Islam', projectName: 'Madani Tower Foundation', date: '2026-07-08', hours: 8, activityDescription: 'On-site monitoring of standard steel bar reinforcement.', billingStatus: 'Billable' },
      { id: 'ts2', employeeName: 'Asaduzzaman Khan', projectName: 'Narayanganj Warehouse Extension', date: '2026-07-09', hours: 6, activityDescription: 'Supervising yard foundation piling excavation.', billingStatus: 'Billable' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('axiom_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('axiom_project_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('axiom_project_milestones', JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem('axiom_project_timesheets', JSON.stringify(timesheets));
  }, [timesheets]);

  // --- FILTER & SEARCH ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // --- MODALS FORM STATES ---
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '', code: '', client: '', manager: 'Rashedul Islam', startDate: '', endDate: '', budget: '', status: 'Planning' as Project['status']
  });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    projectId: '', title: '', assignee: 'Rashedul Islam', priority: 'Medium' as ProjectTask['priority'], dueDate: ''
  });

  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    projectId: '', title: '', dueDate: ''
  });

  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [timesheetForm, setTimesheetForm] = useState({
    employeeName: '', projectName: '', hours: '', activityDescription: '', billingStatus: 'Billable' as Timesheet['billingStatus']
  });

  // --- ACTIONS ---
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name || !projectForm.code) return;
    const newProj: Project = {
      id: `proj_dynamic_${Date.now()}`,
      name: projectForm.name,
      code: projectForm.code,
      client: projectForm.client || 'General Client',
      manager: projectForm.manager,
      startDate: projectForm.startDate || new Date().toISOString().split('T')[0],
      endDate: projectForm.endDate || new Date().toISOString().split('T')[0],
      budget: parseFloat(projectForm.budget) || 0,
      progress: 0,
      status: projectForm.status
    };
    setProjects([newProj, ...projects]);
    setProjectForm({ name: '', code: '', client: '', manager: 'Rashedul Islam', startDate: '', endDate: '', budget: '', status: 'Planning' });
    setShowProjectModal(false);
  };

  const handleAddProjectTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.projectId || !taskForm.title) return;
    const targetProj = projects.find(p => p.id === taskForm.projectId);
    const newT: ProjectTask = {
      id: `t_dynamic_${Date.now()}`,
      projectId: taskForm.projectId,
      projectName: targetProj ? targetProj.name : 'Unknown Project',
      title: taskForm.title,
      assignee: taskForm.assignee,
      priority: taskForm.priority,
      status: 'To Do',
      dueDate: taskForm.dueDate || new Date().toISOString().split('T')[0]
    };
    setTasks([newT, ...tasks]);
    setTaskForm({ projectId: '', title: '', assignee: 'Rashedul Islam', priority: 'Medium', dueDate: '' });
    setShowTaskModal(false);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: ProjectTask['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneForm.projectId || !milestoneForm.title) return;
    const targetProj = projects.find(p => p.id === milestoneForm.projectId);
    const newM: Milestone = {
      id: `m_dynamic_${Date.now()}`,
      projectId: milestoneForm.projectId,
      projectName: targetProj ? targetProj.name : 'Unknown Project',
      title: milestoneForm.title,
      dueDate: milestoneForm.dueDate || new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setMilestones([newM, ...milestones]);
    setMilestoneForm({ projectId: '', title: '', dueDate: '' });
    setShowMilestoneModal(false);
  };

  const handleAddTimesheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timesheetForm.employeeName || !timesheetForm.projectName || !timesheetForm.hours) return;
    const newTs: Timesheet = {
      id: `ts_dynamic_${Date.now()}`,
      employeeName: timesheetForm.employeeName,
      projectName: timesheetForm.projectName,
      date: new Date().toISOString().split('T')[0],
      hours: parseFloat(timesheetForm.hours) || 0,
      activityDescription: timesheetForm.activityDescription,
      billingStatus: timesheetForm.billingStatus
    };
    setTimesheets([newTs, ...timesheets]);
    setTimesheetForm({ employeeName: '', projectName: '', hours: '', activityDescription: '', billingStatus: 'Billable' });
    setShowTimesheetModal(false);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  // --- FILTERS ---
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBudget = filteredProjects.reduce((acc, curr) => acc + curr.budget, 0);

  // --- EXPORT TO CSV ---
  const handleExportCSV = () => {
    const headers = 'Project Code,Project Name,Client,Manager,Start Date,End Date,Budget (BDT),Progress (%),Status';
    const rows = filteredProjects.map(p => {
      return `"${p.code}","${p.name}","${p.client}","${p.manager}","${p.startDate}","${p.endDate}",${p.budget},${p.progress},"${p.status}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `axiom_projects_list_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">Projects & Operations Command</h2>
          <p className="text-xs text-slate-400 mt-1">Supervise infrastructure development, track engineering milestones, and log billing timesheets.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentTab === 'projects' && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs px-3.5 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setShowProjectModal(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Project</span>
              </button>
            </>
          )}
          {currentTab === 'tasks' && (
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Project Task</span>
            </button>
          )}
          {currentTab === 'milestones' && (
            <button
              onClick={() => setShowMilestoneModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Define Milestone</span>
            </button>
          )}
          {currentTab === 'timesheets' && (
            <button
              onClick={() => setShowTimesheetModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Hours Worked</span>
            </button>
          )}
        </div>
      </div>

      {/* STATISTICS PANELS */}
      {currentTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Portfolio Value</div>
            <div className="text-xl font-extrabold text-slate-800">৳{totalBudget.toLocaleString()} BDT</div>
            <div className="text-[11px] text-emerald-600 font-medium">Auto-reconciled with accounts</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Active Projects</div>
            <div className="text-xl font-extrabold text-slate-800">
              {projects.filter(p => p.status === 'In Progress').length} Projects
            </div>
            <div className="text-[11px] text-indigo-500 font-semibold font-mono">Operations on schedule</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Tasks</div>
            <div className="text-xl font-extrabold text-slate-800">{tasks.length} Assigned</div>
            <div className="text-[11px] text-slate-400">With {tasks.filter(t => t.status === 'Done').length} finished</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Timesheets Logged</div>
            <div className="text-xl font-extrabold text-emerald-600">
              {timesheets.reduce((acc, curr) => acc + curr.hours, 0)} Hrs
            </div>
            <div className="text-[11px] text-slate-400">Labor efficiency index</div>
          </div>
        </div>
      )}

      {/* SUB-TABS RENDER */}
      {currentTab === 'projects' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects, client names, managers or codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-slate-600 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-4">Code / Project Name</th>
                  <th className="py-2.5 px-4">Client Firm</th>
                  <th className="py-2.5 px-4 text-right">Budget (BDT)</th>
                  <th className="py-2.5 px-4">Completion Progress</th>
                  <th className="py-2.5 px-4">Manager</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                      No active operational projects found.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map(p => (
                    <tr key={p.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 text-xs text-slate-600">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-400 font-mono text-[10px]">{p.code}</div>
                        <div className="font-bold text-slate-800 mt-0.5">{p.name}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{p.client}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">৳{p.budget.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-2" style={{ width: `${p.progress}%` }}></div>
                          </div>
                          <span className="font-bold font-mono text-[10px] text-slate-500">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-semibold">{p.manager}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold text-[10px] px-2 py-0.5 rounded-full ${
                          p.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          p.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentTab === 'tasks' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Operational Tasks Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-4">Task Information</th>
                  <th className="py-2.5 px-4">Associated Project</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Assignee</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Execution Phase</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 text-xs text-slate-600">
                    <td className="py-3 px-4 font-bold text-slate-800">{t.title}</td>
                    <td className="py-3 px-4 font-medium text-slate-500">{t.projectName}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold text-[9px] px-1.5 py-0.5 rounded ${
                        t.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{t.assignee}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{t.dueDate}</td>
                    <td className="py-3 px-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 text-[11px] rounded px-2 py-0.5 font-semibold text-slate-600"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Done">Done</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['To Do', 'In Progress', 'Review', 'Done'] as const).map(status => {
            const statusTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-bold text-xs text-slate-700">{status}</span>
                  <span className="bg-slate-200 text-slate-600 font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                    {statusTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {statusTasks.length === 0 ? (
                    <div className="py-6 text-center text-[10px] text-slate-400 bg-white border border-dashed border-slate-200 rounded-lg">
                      No assignments
                    </div>
                  ) : (
                    statusTasks.map(t => (
                      <div key={t.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-slate-800 leading-snug">{t.title}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold">{t.projectName}</p>
                        <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100 mt-1">
                          <span className="text-slate-500 font-medium">{t.assignee}</span>
                          <button
                            onClick={() => {
                              const nextMap: Record<string, ProjectTask['status']> = {
                                'To Do': 'In Progress',
                                'In Progress': 'Review',
                                'Review': 'Done',
                                'Done': 'To Do'
                              };
                              handleUpdateTaskStatus(t.id, nextMap[status]);
                            }}
                            className="p-1 hover:bg-slate-50 text-indigo-600 rounded cursor-pointer"
                            title="Advance Stage"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {currentTab === 'calendar' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-center py-12 space-y-3">
          <Calendar className="h-10 w-10 text-indigo-600 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Dynamic Schedule Calibrator</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Operational deadlines and material delivery milestones are synchronized on the shared enterprise ledger. Ensure product quantities are allocated inside Warehouse master settings.
          </p>
        </div>
      )}

      {currentTab === 'milestones' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Civil Engineering Milestones Tracker</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-4">Milestone Target</th>
                  <th className="py-2.5 px-4">Operation Scope</th>
                  <th className="py-2.5 px-4">Due Target Date</th>
                  <th className="py-2.5 px-4">Validation Status</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map(m => (
                  <tr key={m.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 text-xs text-slate-600">
                    <td className="py-3 px-4 font-bold text-slate-800">{m.title}</td>
                    <td className="py-3 px-4 font-semibold text-slate-500">{m.projectName}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{m.dueDate}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setMilestones(milestones.map(mil => mil.id === m.id ? { ...mil, status: mil.status === 'Achieved' ? 'Pending' : 'Achieved' } : mil));
                        }}
                        className={`font-bold text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                          m.status === 'Achieved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {m.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentTab === 'timesheets' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Staff Timesheets Register</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-4">Officer Name</th>
                  <th className="py-2.5 px-4">Assigned Task Site</th>
                  <th className="py-2.5 px-4">Log Date</th>
                  <th className="py-2.5 px-4 text-center">Hours Worked</th>
                  <th className="py-2.5 px-4">Detailed Activity Description</th>
                  <th className="py-2.5 px-4">Billing Phase</th>
                </tr>
              </thead>
              <tbody>
                {timesheets.map(t => (
                  <tr key={t.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 text-xs text-slate-600">
                    <td className="py-3 px-4 font-bold text-slate-800">{t.employeeName}</td>
                    <td className="py-3 px-4 font-semibold text-slate-500">{t.projectName}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{t.date}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{t.hours} Hours</td>
                    <td className="py-3 px-4 text-slate-600">{t.activityDescription}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                        t.billingStatus === 'Billable' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {t.billingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROJECT MODAL */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddProject} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-md shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Launch Operational Project</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 col-span-2">
                <label className="font-bold text-slate-500">Project Name *</label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="e.g., Madani Tower Piling Site"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Project Code *</label>
                <input
                  type="text"
                  required
                  value={projectForm.code}
                  onChange={e => setProjectForm({ ...projectForm, code: e.target.value })}
                  placeholder="e.g., PRJ-MDT-01"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Client Organization</label>
                <input
                  type="text"
                  value={projectForm.client}
                  onChange={e => setProjectForm({ ...projectForm, client: e.target.value })}
                  placeholder="Firm Name"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Assigned Manager</label>
                <select
                  value={projectForm.manager}
                  onChange={e => setProjectForm({ ...projectForm, manager: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Rashedul Islam">Rashedul Islam</option>
                  <option value="Farhana Yasmin">Farhana Yasmin</option>
                  <option value="Asaduzzaman Khan">Asaduzzaman Khan</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Total Budget Amount (BDT)</label>
                <input
                  type="number"
                  value={projectForm.budget}
                  onChange={e => setProjectForm({ ...projectForm, budget: e.target.value })}
                  placeholder="1200000"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Start Target</label>
                <input
                  type="date"
                  value={projectForm.startDate}
                  onChange={e => setProjectForm({ ...projectForm, startDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">End Target</label>
                <input
                  type="date"
                  value={projectForm.endDate}
                  onChange={e => setProjectForm({ ...projectForm, endDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Launch Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddProjectTask} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Add Operational Task</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Select Project *</label>
                <select
                  required
                  value={taskForm.projectId}
                  onChange={e => setTaskForm({ ...taskForm, projectId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g., Concrete Reinforcement Audit"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Assignee</label>
                  <select
                    value={taskForm.assignee}
                    onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Rashedul Islam">Rashedul Islam</option>
                    <option value="Farhana Yasmin">Farhana Yasmin</option>
                    <option value="Asaduzzaman Khan">Asaduzzaman Khan</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Due Target Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Assign Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MILESTONE MODAL */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddMilestone} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Define Project Milestone</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Select Project *</label>
                <select
                  required
                  value={milestoneForm.projectId}
                  onChange={e => setMilestoneForm({ ...milestoneForm, projectId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Milestone Title *</label>
                <input
                  type="text"
                  required
                  value={milestoneForm.title}
                  onChange={e => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  placeholder="e.g., First Floor Slab Pour Completed"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Due Target Date</label>
                <input
                  type="date"
                  value={milestoneForm.dueDate}
                  onChange={e => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowMilestoneModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Define Milestone
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TIMESHEET MODAL */}
      {showTimesheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddTimesheet} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Log Hours Worked</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={timesheetForm.employeeName}
                  onChange={e => setTimesheetForm({ ...timesheetForm, employeeName: e.target.value })}
                  placeholder="e.g., Rashedul Islam"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Task Site / Project *</label>
                <select
                  required
                  value={timesheetForm.projectName}
                  onChange={e => setTimesheetForm({ ...timesheetForm, projectName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Hours Logged *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={timesheetForm.hours}
                    onChange={e => setTimesheetForm({ ...timesheetForm, hours: e.target.value })}
                    placeholder="e.g., 8"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Billing Status</label>
                  <select
                    value={timesheetForm.billingStatus}
                    onChange={e => setTimesheetForm({ ...timesheetForm, billingStatus: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Billable">Billable</option>
                    <option value="Non-Billable">Non-Billable</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Activity Summary</label>
                <textarea
                  value={timesheetForm.activityDescription}
                  onChange={e => setTimesheetForm({ ...timesheetForm, activityDescription: e.target.value })}
                  placeholder="Record what was done during these hours..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowTimesheetModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Save Timesheet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
