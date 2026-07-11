import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  UserPlus,
  TrendingUp,
  Activity,
  Calendar,
  Megaphone,
  Trash2,
  Edit3,
  CheckCircle,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Briefcase,
  AlertCircle
} from 'lucide-react';

interface CRMViewProps {
  activeSubTab?: string;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Closed Won' | 'Closed Lost';
  value: number;
  assignedTo: string;
  createdAt: string;
  notes: string;
}

interface ActivityItem {
  id: string;
  leadName: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note';
  description: string;
  date: string;
  user: string;
}

interface Meeting {
  id: string;
  title: string;
  leadName: string;
  date: string;
  time: string;
  duration: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

interface Campaign {
  id: string;
  name: string;
  channel: 'Email' | 'Google Ads' | 'Social Media' | 'Offline';
  budget: number;
  leadsGenerated: number;
  revenueGenerated: number;
  status: 'Draft' | 'Active' | 'Completed';
  startDate: string;
}

export default function CRMView({ activeSubTab = 'leads' }: CRMViewProps) {
  const currentTab = ['leads', 'pipeline', 'activities', 'meetings', 'campaigns'].includes(activeSubTab)
    ? activeSubTab
    : 'leads';

  // --- CRM STATES ---
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('axiom_crm_leads');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'l1', name: 'Al-Amin Rahman', company: 'Baitul Mukarram Builders', email: 'alamin@builders.com', phone: '01829103819', status: 'Proposal Sent', value: 350000, assignedTo: 'Rony Mia', createdAt: '2026-07-01', notes: 'Interested in structural steel deformed bars 60G.' },
      { id: 'l2', name: 'Zobaer Al Mahmud', company: 'Purbachal Housing Ltd', email: 'zobaer@purbachal.com', phone: '01711209381', status: 'Contacted', value: 820000, assignedTo: 'Tasnim Ahmed', createdAt: '2026-07-03', notes: 'Requested quotation for 500 bags of Premium Cement.' },
      { id: 'l3', name: 'Mustafizur Rahman', company: 'Mirpur Cement Traders', email: 'mustafiz@mirpur.com', phone: '01511293810', status: 'Qualified', value: 120000, assignedTo: 'Sabbir Rahman', createdAt: '2026-07-05', notes: 'Distributor level negotiation for paint and chemicals.' },
      { id: 'l4', name: 'Nusrat Jahan', company: 'Green City Architecture', email: 'nusrat@greencity.com', phone: '01928391029', status: 'New', value: 450000, assignedTo: 'Rony Mia', createdAt: '2026-07-08', notes: 'Inquired about custom layouts for structural design.' },
    ];
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem('axiom_crm_activities');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'act1', leadName: 'Al-Amin Rahman', type: 'Call', description: 'Discussed initial raw material specs and prices.', date: '2026-07-02 10:30 AM', user: 'Rony Mia' },
      { id: 'act2', leadName: 'Zobaer Al Mahmud', type: 'Email', description: 'Sent official catalogue and quotation spreadsheet.', date: '2026-07-04 02:15 PM', user: 'Tasnim Ahmed' },
      { id: 'act3', leadName: 'Al-Amin Rahman', type: 'Meeting', description: 'In-person meeting at Baitul Mukarram Builders.', date: '2026-07-06 04:00 PM', user: 'Rony Mia' },
    ];
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('axiom_crm_meetings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'm1', title: 'Steel Order Contract Signature', leadName: 'Al-Amin Rahman', date: '2026-07-12', time: '11:00 AM', duration: '1 Hour', status: 'Scheduled' },
      { id: 'm2', title: 'Cement Sample Presentation', leadName: 'Zobaer Al Mahmud', date: '2026-07-15', time: '02:30 PM', duration: '30 Mins', status: 'Scheduled' },
    ];
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('axiom_crm_campaigns');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'cmp1', name: 'Q3 Concrete Promotion', channel: 'Email', budget: 15000, leadsGenerated: 24, revenueGenerated: 1250000, status: 'Active', startDate: '2026-07-01' },
      { id: 'cmp2', name: 'Steel Traders Summit 2026', channel: 'Offline', budget: 85000, leadsGenerated: 42, revenueGenerated: 3400000, status: 'Completed', startDate: '2026-05-15' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('axiom_crm_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('axiom_crm_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('axiom_crm_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('axiom_crm_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  // --- FILTER & SEARCH ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // --- MODALS FORM STATES ---
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '', company: '', email: '', phone: '', status: 'New' as Lead['status'], value: '', assignedTo: 'Rony Mia', notes: ''
  });

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState({
    leadName: '', type: 'Call' as ActivityItem['type'], description: ''
  });

  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '', leadName: '', date: '', time: '', duration: '1 Hour'
  });

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '', channel: 'Email' as Campaign['channel'], budget: '', status: 'Active' as Campaign['status'], startDate: ''
  });

  // --- ACTIONS ---
  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.company) return;
    const newLead: Lead = {
      id: `l_dynamic_${Date.now()}`,
      name: leadForm.name,
      company: leadForm.company,
      email: leadForm.email || 'N/A',
      phone: leadForm.phone || 'N/A',
      status: leadForm.status,
      value: parseFloat(leadForm.value) || 0,
      assignedTo: leadForm.assignedTo,
      createdAt: new Date().toISOString().split('T')[0],
      notes: leadForm.notes
    };
    setLeads([newLead, ...leads]);
    setLeadForm({ name: '', company: '', email: '', phone: '', status: 'New', value: '', assignedTo: 'Rony Mia', notes: '' });
    setShowLeadModal(false);
  };

  const handleDeleteLead = (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      setLeads(leads.filter(l => l.id !== id));
    }
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    // Log auto activity
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      const log: ActivityItem = {
        id: `act_auto_${Date.now()}`,
        leadName: lead.name,
        type: 'Note',
        description: `Lead status updated to ${newStatus}`,
        date: new Date().toLocaleString(),
        user: 'System Auditor'
      };
      setActivities([log, ...activities]);
    }
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.leadName || !activityForm.description) return;
    const newAct: ActivityItem = {
      id: `act_dynamic_${Date.now()}`,
      leadName: activityForm.leadName,
      type: activityForm.type,
      description: activityForm.description,
      date: new Date().toLocaleString(),
      user: 'Rony Mia'
    };
    setActivities([newAct, ...activities]);
    setActivityForm({ leadName: '', type: 'Call', description: '' });
    setShowActivityModal(false);
  };

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.title || !meetingForm.leadName || !meetingForm.date) return;
    const newMtg: Meeting = {
      id: `m_dynamic_${Date.now()}`,
      title: meetingForm.title,
      leadName: meetingForm.leadName,
      date: meetingForm.date,
      time: meetingForm.time || '10:00 AM',
      duration: meetingForm.duration,
      status: 'Scheduled'
    };
    setMeetings([newMtg, ...meetings]);
    setMeetingForm({ title: '', leadName: '', date: '', time: '', duration: '1 Hour' });
    setShowMeetingModal(false);
  };

  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.name || !campaignForm.startDate) return;
    const newCmp: Campaign = {
      id: `cmp_dynamic_${Date.now()}`,
      name: campaignForm.name,
      channel: campaignForm.channel,
      budget: parseFloat(campaignForm.budget) || 0,
      leadsGenerated: 0,
      revenueGenerated: 0,
      status: campaignForm.status,
      startDate: campaignForm.startDate
    };
    setCampaigns([newCmp, ...campaigns]);
    setCampaignForm({ name: '', channel: 'Email', budget: '', status: 'Active', startDate: '' });
    setShowCampaignModal(false);
  };

  // --- FILTERED LEADS ---
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = filteredLeads.reduce((acc, curr) => acc + curr.value, 0);

  // --- EXPORT TO CSV ---
  const handleExportCSV = () => {
    const headers = 'Lead Name,Company,Email,Phone,Status,Estimated Value (BDT),Assigned To,Created At,Notes';
    const rows = filteredLeads.map(l => {
      return `"${l.name}","${l.company}","${l.email}","${l.phone}","${l.status}",${l.value},"${l.assignedTo}","${l.createdAt}","${l.notes.replace(/"/g, '""')}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `axiom_leads_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">Customer Relationship Management (CRM)</h2>
          <p className="text-xs text-slate-400 mt-1">Acquire and nurture corporate business deals, track sales interactions, and analyze marketing campaigns.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentTab === 'leads' && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs px-3.5 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setShowLeadModal(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Register New Lead</span>
              </button>
            </>
          )}
          {currentTab === 'activities' && (
            <button
              onClick={() => setShowActivityModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Action</span>
            </button>
          )}
          {currentTab === 'meetings' && (
            <button
              onClick={() => setShowMeetingModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule Meeting</span>
            </button>
          )}
          {currentTab === 'campaigns' && (
            <button
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Megaphone className="h-3.5 w-3.5" />
              <span>Launch Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* CRM BENTO WIDGETS */}
      {currentTab === 'leads' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Pipeline Value</div>
            <div className="text-xl font-extrabold text-slate-800">৳{totalValue.toLocaleString()} BDT</div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Active pipeline potential
            </div>
          </div>
          <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Leads</div>
            <div className="text-xl font-extrabold text-slate-800">{filteredLeads.length} Accounts</div>
            <div className="text-[11px] text-slate-400">Registered opportunities</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Won Opportunities</div>
            <div className="text-xl font-extrabold text-slate-800">
              {leads.filter(l => l.status === 'Closed Won').length} Deals
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">Auto-synced with ERP Revenue</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Conversion Rate</div>
            <div className="text-xl font-extrabold text-indigo-600">38.4%</div>
            <div className="text-[11px] text-indigo-500 font-medium">Top industry standard</div>
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENTS */}
      {currentTab === 'leads' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads name, company, or assigned representative..."
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
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-4">Contact Person / Company</th>
                  <th className="py-2.5 px-4">Deal Status</th>
                  <th className="py-2.5 px-4 text-right">Deal Value</th>
                  <th className="py-2.5 px-4">Contact details</th>
                  <th className="py-2.5 px-4">Assigned To</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      No active leads match the search queries.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((l) => (
                    <tr key={l.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 text-xs text-slate-600">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{l.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <Briefcase className="h-3 w-3 text-slate-300" /> {l.company}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={l.status}
                          onChange={(e) => handleUpdateLeadStatus(l.id, e.target.value as any)}
                          className={`font-semibold text-[10px] px-2 py-1 rounded-full border focus:outline-none ${
                            l.status === 'Closed Won' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            l.status === 'Closed Lost' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                            l.status === 'Proposal Sent' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            l.status === 'Qualified' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Proposal Sent">Proposal Sent</option>
                          <option value="Closed Won">Closed Won</option>
                          <option value="Closed Lost">Closed Lost</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        ৳{l.value.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Mail className="h-3 w-3 text-slate-300" /> {l.email}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                          <Phone className="h-3 w-3 text-slate-300" /> {l.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-700">{l.assignedTo}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{l.createdAt}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteLead(l.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Archive Lead"
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

      {currentTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['New', 'Contacted', 'Qualified', 'Proposal Sent'] as const).map(status => {
            const statusLeads = leads.filter(l => l.status === status);
            return (
              <div key={status} className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-bold text-xs text-slate-700">{status}</span>
                  <span className="bg-slate-200 text-slate-600 font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                    {statusLeads.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-[450px] overflow-y-auto">
                  {statusLeads.length === 0 ? (
                    <div className="py-6 text-center text-[10px] text-slate-400 bg-white border border-dashed border-slate-200 rounded-lg">
                      No active opportunities
                    </div>
                  ) : (
                    statusLeads.map(l => (
                      <div key={l.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm space-y-2 hover:border-indigo-400 transition-colors">
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{l.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{l.company}</p>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                          <span>৳{l.value.toLocaleString()}</span>
                          <button
                            onClick={() => {
                              const nextMap: Record<string, Lead['status']> = {
                                'New': 'Contacted',
                                'Contacted': 'Qualified',
                                'Qualified': 'Proposal Sent',
                                'Proposal Sent': 'Closed Won'
                              };
                              handleUpdateLeadStatus(l.id, nextMap[status] || 'Closed Won');
                            }}
                            className="p-1 hover:bg-slate-50 rounded text-indigo-600 cursor-pointer"
                            title="Move to Next Phase"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
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

      {currentTab === 'activities' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Historical Interaction Trail</h3>
            <span className="text-[10px] text-indigo-600 font-semibold font-mono">Total logs: {activities.length} entries</span>
          </div>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No customer logs reported yet.
              </div>
            ) : (
              activities.map((a, idx) => (
                <div key={a.id} className="flex gap-3 text-xs text-slate-600 border-l-2 border-slate-100 pl-4 relative">
                  <div className="absolute -left-1.5 top-0.5 h-3 w-3 rounded-full bg-indigo-500 border-2 border-white"></div>
                  <div className="flex-1 space-y-1 bg-slate-50/50 border border-slate-100 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-800">{a.leadName}</span>
                        <span className={`ml-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          a.type === 'Call' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          a.type === 'Email' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          a.type === 'Meeting' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {a.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {a.date}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium mt-1">{a.description}</p>
                    <div className="text-[10px] text-slate-400 mt-1.5">Logged by: <strong className="text-slate-500">{a.user}</strong></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {currentTab === 'meetings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Scheduled Conferences</h3>
            <div className="space-y-3">
              {meetings.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No scheduled meetings found.
                </div>
              ) : (
                meetings.map(m => (
                  <div key={m.id} className="bg-slate-50 border border-slate-100 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{m.title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">With: {m.leadName}</p>
                      </div>
                      <span className="bg-indigo-50 text-indigo-700 font-bold text-[9px] px-1.5 py-0.5 rounded">
                        {m.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium border-t border-slate-100/60 pt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {m.date}
                      </span>
                      <span>{m.time} ({m.duration})</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Calendar Quick Tips</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use meetings and digital CRM appointments to secure long-term raw supply raw agreements with regional construction firms. Ensure pricing models align with dynamic inflation indexes configured in Accounting settings.
            </p>
            <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg flex gap-2">
              <AlertCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-indigo-700 leading-normal font-medium">
                Meetings integrate automatically with the global Axiom ERP calendars used by engineering supervisors and warehouse managers.
              </p>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'campaigns' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Marketing Campaigns Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-4">Campaign Name</th>
                  <th className="py-2.5 px-4">Channel</th>
                  <th className="py-2.5 px-4 text-right">Budget</th>
                  <th className="py-2.5 px-4 text-center">Leads Generated</th>
                  <th className="py-2.5 px-4 text-right">Revenue Generated</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Start Date</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 text-xs text-slate-600">
                    <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{c.channel}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">৳{c.budget.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{c.leadsGenerated || Math.floor(c.budget / 1200)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600">৳{c.revenueGenerated ? c.revenueGenerated.toLocaleString() : '৳0'}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${
                        c.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{c.startDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddLead} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-md shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Add New Corporate Lead</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 col-span-2">
                <label className="font-bold text-slate-500">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={leadForm.name}
                  onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                  placeholder="e.g., Al-Amin Rahman"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="font-bold text-slate-500">Corporate Company Name *</label>
                <input
                  type="text"
                  required
                  value={leadForm.company}
                  onChange={e => setLeadForm({ ...leadForm, company: e.target.value })}
                  placeholder="e.g., Baitul Mukarram Builders"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Email Address</label>
                <input
                  type="email"
                  value={leadForm.email}
                  onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Phone / Mobile</label>
                <input
                  type="text"
                  value={leadForm.phone}
                  onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                  placeholder="01712..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Estimated Deal Value (BDT)</label>
                <input
                  type="number"
                  value={leadForm.value}
                  onChange={e => setLeadForm({ ...leadForm, value: e.target.value })}
                  placeholder="e.g., 350000"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Phase Status</label>
                <select
                  value={leadForm.status}
                  onChange={e => setLeadForm({ ...leadForm, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                </select>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="font-bold text-slate-500">Deal Requirements & Notes</label>
                <textarea
                  value={leadForm.notes}
                  onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Specify material grades, timelines, payment modalities..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Register Lead
              </button>
            </div>
          </form>
        </div>
      )}

      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddActivity} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Log Interaction Activity</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Select Lead Person *</label>
                <select
                  required
                  value={activityForm.leadName}
                  onChange={e => setActivityForm({ ...activityForm, leadName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Account --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.name}>{l.name} ({l.company})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Activity Type</label>
                <select
                  value={activityForm.type}
                  onChange={e => setActivityForm({ ...activityForm, type: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Call">Phone Call</option>
                  <option value="Email">Email Sent</option>
                  <option value="Meeting">Meeting Conference</option>
                  <option value="Note">External Note</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Interaction Description *</label>
                <textarea
                  required
                  value={activityForm.description}
                  onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                  placeholder="Record summary of call or email reply received..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowActivityModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Log Activity
              </button>
            </div>
          </form>
        </div>
      )}

      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddMeeting} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Schedule Customer Meeting</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={meetingForm.title}
                  onChange={e => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  placeholder="e.g., Quotation Negotiation"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Customer Opportunity *</label>
                <select
                  required
                  value={meetingForm.leadName}
                  onChange={e => setMeetingForm({ ...meetingForm, leadName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Account --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.name}>{l.name} ({l.company})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Meeting Date *</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={e => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Time *</label>
                  <input
                    type="text"
                    required
                    value={meetingForm.time}
                    onChange={e => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    placeholder="e.g., 03:30 PM"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Meeting Duration</label>
                <select
                  value={meetingForm.duration}
                  onChange={e => setMeetingForm({ ...meetingForm, duration: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="30 Mins">30 Mins</option>
                  <option value="1 Hour">1 Hour</option>
                  <option value="2 Hours">2 Hours</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowMeetingModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddCampaign} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Launch Marketing Campaign</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={campaignForm.name}
                  onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  placeholder="e.g., Q3 Cement Discount"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Marketing Channel</label>
                <select
                  value={campaignForm.channel}
                  onChange={e => setCampaignForm({ ...campaignForm, channel: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Email">Bulk Email Marketing</option>
                  <option value="Google Ads">Google Ads SEM</option>
                  <option value="Social Media">Social Media Ads</option>
                  <option value="Offline">Offline Trade Summits</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Allocated Budget *</label>
                  <input
                    type="number"
                    required
                    value={campaignForm.budget}
                    onChange={e => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                    placeholder="BDT Amount"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={campaignForm.startDate}
                    onChange={e => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowCampaignModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Launch
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
