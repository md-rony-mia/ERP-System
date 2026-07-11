import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ShieldAlert,
  ClipboardList,
  Users,
  Plus,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar,
  Clock,
  Phone
} from 'lucide-react';

interface ServiceViewProps {
  activeSubTab?: string;
}

interface WarrantyClaim {
  id: string;
  serialNumber: string;
  productName: string;
  customerName: string;
  startDate: string;
  expiryDate: string;
  status: 'Under Warranty' | 'Expired' | 'Voided';
}

interface RepairJob {
  id: string;
  ticketNo: string;
  productName: string;
  customerName: string;
  issueDescription: string;
  assignedTechnician: string;
  estimatedCost: number;
  status: 'In Queue' | 'Assigned' | 'In Progress' | 'Repaired' | 'Delivered';
  partsReplaced: string[];
}

interface ComplaintTicket {
  id: string;
  customerName: string;
  phone: string;
  subject: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Assigned' | 'Resolved';
  createdAt: string;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  activeJobs: number;
  rating: number; // e.g. 4.8
}

interface AMCContract {
  id: string;
  contractNo: string;
  clientName: string;
  startDate: string;
  endDate: string;
  value: number;
  visitsPerYear: number;
  status: 'Active' | 'Pending Renewal' | 'Terminated';
}

export default function ServiceView({ activeSubTab = 'warranty' }: ServiceViewProps) {
  const currentTab = ['warranty', 'repairs', 'complaints', 'technicians', 'amc'].includes(activeSubTab)
    ? activeSubTab
    : 'warranty';

  // --- LOCAL PERSISTED STATES ---
  const [claims, setClaims] = useState<WarrantyClaim[]>(() => {
    const saved = localStorage.getItem('axiom_srv_claims');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'clm1', serialNumber: 'SRL-STL-2026-098', productName: 'Structural Steel Column H-Beam', customerName: 'Baitul Mukarram Builders', startDate: '2026-01-10', expiryDate: '2031-01-10', status: 'Under Warranty' },
      { id: 'clm2', serialNumber: 'SRL-CMT-2025-145', productName: 'Precast Cement Pile Ring', customerName: 'Purbachal Housing Ltd', startDate: '2025-05-15', expiryDate: '2026-05-15', status: 'Expired' }
    ];
  });

  const [repairs, setRepairs] = useState<RepairJob[]>(() => {
    const saved = localStorage.getItem('axiom_srv_repairs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'rep1', ticketNo: 'REP-2601', productName: 'Deformed Bar Tensile Recalibration', customerName: 'Mirpur Cement Traders', issueDescription: 'Slight deflection reported during load audit.', assignedTechnician: 'Mizanur Rahman', estimatedCost: 15000, status: 'In Progress', partsReplaced: ['Tensile Spring', 'Grip Clamp'] }
    ];
  });

  const [complaints, setComplaints] = useState<ComplaintTicket[]>(() => {
    const saved = localStorage.getItem('axiom_srv_complaints');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'cmp1', customerName: 'Al-Amin Rahman', phone: '01819203910', subject: 'Casting core setting slower than specified', urgency: 'High', status: 'Open', createdAt: '2026-07-08' }
    ];
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('axiom_srv_technicians');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'tech1', name: 'Mizanur Rahman', phone: '01719283910', specialty: 'Metallurgy & Structural Calibration', activeJobs: 1, rating: 4.9 },
      { id: 'tech2', name: 'Jahangir Alam', phone: '01511293810', specialty: 'Concrete Density Audits', activeJobs: 0, rating: 4.7 }
    ];
  });

  const [amcs, setAmcs] = useState<AMCContract[]>(() => {
    const saved = localStorage.getItem('axiom_srv_amcs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'amc1', contractNo: 'AMC-2026-009', clientName: 'Baitul Mukarram Builders', startDate: '2026-01-01', endDate: '2026-12-31', value: 120000, visitsPerYear: 6, status: 'Active' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('axiom_srv_claims', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem('axiom_srv_repairs', JSON.stringify(repairs));
  }, [repairs]);

  useEffect(() => {
    localStorage.setItem('axiom_srv_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('axiom_srv_technicians', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('axiom_srv_amcs', JSON.stringify(amcs));
  }, [amcs]);

  // --- SEARCH QUERY ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- MODAL FORM STATES ---
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({
    serialNumber: '', productName: '', customerName: '', durationYears: '5'
  });

  const [showRepairModal, setShowRepairModal] = useState(false);
  const [repairForm, setRepairForm] = useState({
    productName: '', customerName: '', issueDescription: '', assignedTechnician: 'Mizanur Rahman', estimatedCost: ''
  });

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    customerName: '', phone: '', subject: '', urgency: 'Medium' as ComplaintTicket['urgency']
  });

  const [showAMCModal, setShowAMCModal] = useState(false);
  const [amcForm, setAmcForm] = useState({
    clientName: '', value: '', visits: '4', durationMonths: '12'
  });

  // --- ACTIONS ---
  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimForm.serialNumber || !claimForm.productName) return;
    const start = new Date();
    const expiry = new Date();
    expiry.setFullYear(start.getFullYear() + parseInt(claimForm.durationYears));
    const newClaim: WarrantyClaim = {
      id: `clm_${Date.now()}`,
      serialNumber: claimForm.serialNumber,
      productName: claimForm.productName,
      customerName: claimForm.customerName || 'Walk-in Client',
      startDate: start.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      status: 'Under Warranty'
    };
    setClaims([newClaim, ...claims]);
    setClaimForm({ serialNumber: '', productName: '', customerName: '', durationYears: '5' });
    setShowClaimModal(false);
  };

  const handleCreateRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairForm.productName || !repairForm.customerName) return;
    const newRep: RepairJob = {
      id: `rep_${Date.now()}`,
      ticketNo: `REP-${Math.floor(2000 + Math.random() * 8000)}`,
      productName: repairForm.productName,
      customerName: repairForm.customerName,
      issueDescription: repairForm.issueDescription,
      assignedTechnician: repairForm.assignedTechnician,
      estimatedCost: parseFloat(repairForm.estimatedCost) || 0,
      status: 'Assigned',
      partsReplaced: []
    };
    setRepairs([newRep, ...repairs]);
    setRepairForm({ productName: '', customerName: '', issueDescription: '', assignedTechnician: 'Mizanur Rahman', estimatedCost: '' });
    setShowRepairModal(false);
  };

  const handleUpdateRepairStatus = (id: string, nextStatus: RepairJob['status']) => {
    setRepairs(repairs.map(r => r.id === id ? { ...r, status: nextStatus } : r));
  };

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintForm.customerName || !complaintForm.subject) return;
    const newCmp: ComplaintTicket = {
      id: `cmp_${Date.now()}`,
      customerName: complaintForm.customerName,
      phone: complaintForm.phone || 'N/A',
      subject: complaintForm.subject,
      urgency: complaintForm.urgency,
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setComplaints([newCmp, ...complaints]);
    setComplaintForm({ customerName: '', phone: '', subject: '', urgency: 'Medium' });
    setShowComplaintModal(false);
  };

  const handleResolveComplaint = (id: string) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: 'Resolved' as const } : c));
  };

  const handleCreateAMC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amcForm.clientName || !amcForm.value) return;
    const start = new Date();
    const expiry = new Date();
    expiry.setMonth(start.getMonth() + parseInt(amcForm.durationMonths));
    const newAmc: AMCContract = {
      id: `amc_${Date.now()}`,
      contractNo: `AMC-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName: amcForm.clientName,
      startDate: start.toISOString().split('T')[0],
      endDate: expiry.toISOString().split('T')[0],
      value: parseFloat(amcForm.value) || 0,
      visitsPerYear: parseInt(amcForm.visits),
      status: 'Active'
    };
    setAmcs([newAmc, ...amcs]);
    setAmcForm({ clientName: '', value: '', visits: '4', durationMonths: '12' });
    setShowAMCModal(false);
  };

  // --- FILTERED CLAIMS ---
  const filteredClaims = claims.filter(c =>
    c.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">After-Sales Service & Maintenance</h2>
          <p className="text-xs text-slate-400 mt-1">Audit customer warranty coverage, register engineering repair logs, track open complaint tickets, and supervise AMC contracts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentTab === 'warranty' && (
            <button
              onClick={() => setShowClaimModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register Warranty</span>
            </button>
          )}
          {currentTab === 'repairs' && (
            <button
              onClick={() => setShowRepairModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Repair Order</span>
            </button>
          )}
          {currentTab === 'complaints' && (
            <button
              onClick={() => setShowComplaintModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Open Complaint Ticket</span>
            </button>
          )}
          {currentTab === 'amc' && (
            <button
              onClick={() => setShowAMCModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create AMC Contract</span>
            </button>
          )}
        </div>
      </div>

      {/* CORE WARRANTY TAB */}
      {currentTab === 'warranty' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Look up serial number, product specifications or client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-4">Serial ID</th>
                  <th className="py-2.5 px-4">Product Specifications</th>
                  <th className="py-2.5 px-4">Client Firm</th>
                  <th className="py-2.5 px-4">Start Target</th>
                  <th className="py-2.5 px-4">Expiry Target</th>
                  <th className="py-2.5 px-4">Coverage Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      No warranty coverages found.
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map(c => (
                    <tr key={c.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 text-xs text-slate-600">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{c.serialNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{c.productName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{c.customerName}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{c.startDate}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{c.expiryDate}</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                          c.status === 'Under Warranty' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentTab === 'repairs' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Active Engineering Repairs</h3>
          <div className="space-y-3">
            {repairs.map(r => (
              <div key={r.id} className="border border-slate-100 p-4 rounded-xl space-y-3 bg-slate-50/20">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">Ticket: {r.ticketNo}</span>
                    <h4 className="font-bold text-xs text-slate-800 mt-0.5">{r.productName}</h4>
                  </div>
                  <span className="text-xs font-bold text-slate-700">Cost Estimate: ৳{r.estimatedCost.toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">Issue Reported: {r.issueDescription}</p>
                <div className="border-t border-slate-100/60 pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="text-[11px] text-slate-500 font-medium">
                    Technician Assigned: <strong className="text-slate-700">{r.assignedTechnician}</strong>
                  </div>
                  <div className="flex gap-2">
                    {r.status !== 'Delivered' && (
                      <button
                        onClick={() => {
                          const nextMap: Record<RepairJob['status'], RepairJob['status']> = {
                            'In Queue': 'Assigned',
                            'Assigned': 'In Progress',
                            'In Progress': 'Repaired',
                            'Repaired': 'Delivered',
                            'Delivered': 'Delivered'
                          };
                          handleUpdateRepairStatus(r.id, nextMap[r.status] || 'Delivered');
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] px-2.5 py-1 rounded cursor-pointer"
                      >
                        Advance Phase ({r.status})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentTab === 'complaints' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Urgent Customer Tickets</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-4">Contact customer</th>
                  <th className="py-2.5 px-4">Subject Issue</th>
                  <th className="py-2.5 px-4">Urgency</th>
                  <th className="py-2.5 px-4">Open Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 text-xs text-slate-600">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{c.customerName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-slate-300" /> {c.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{c.subject}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold text-[9px] px-1.5 py-0.5 rounded ${
                        c.urgency === 'Critical' || c.urgency === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {c.urgency}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{c.createdAt}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold text-[10px] px-2 py-0.5 rounded-full ${
                        c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {c.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolveComplaint(c.id)}
                          className="flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-1 rounded hover:bg-emerald-100 transition-colors ml-auto cursor-pointer"
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>Resolve</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentTab === 'technicians' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Field Engineers Roster</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicians.map(t => (
              <div key={t.id} className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/20 flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">{t.name}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{t.specialty}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Mobile: {t.phone}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    Active repairs: {t.activeJobs}
                  </span>
                  <p className="text-xs text-amber-500 font-bold">⭐ {t.rating} Rating</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentTab === 'amc' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Annual Maintenance Contracts (AMC)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-4">Contract ID</th>
                  <th className="py-2.5 px-4">Client Firm</th>
                  <th className="py-2.5 px-4 text-right">Contract Value (BDT)</th>
                  <th className="py-2.5 px-4 text-center">Scheduled Visits / Yr</th>
                  <th className="py-2.5 px-4">Start Target</th>
                  <th className="py-2.5 px-4">Expiry Target</th>
                  <th className="py-2.5 px-4">Contract Status</th>
                </tr>
              </thead>
              <tbody>
                {amcs.map(a => (
                  <tr key={a.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 text-xs text-slate-600">
                    <td className="py-3 px-4 font-mono font-bold text-slate-850">{a.contractNo}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{a.clientName}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-800">৳{a.value.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600">{a.visitsPerYear} Visits</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{a.startDate}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{a.endDate}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WARRANTY MODAL */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateClaim} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Register Warranty Coverage</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Serial Identification Number *</label>
                <input
                  type="text"
                  required
                  value={claimForm.serialNumber}
                  onChange={e => setClaimForm({ ...claimForm, serialNumber: e.target.value })}
                  placeholder="e.g., SRL-STL-2026-999"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Product Specifications *</label>
                <input
                  type="text"
                  required
                  value={claimForm.productName}
                  onChange={e => setClaimForm({ ...claimForm, productName: e.target.value })}
                  placeholder="e.g., Steel H-Beam 60G"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Corporate Customer Firm *</label>
                <input
                  type="text"
                  required
                  value={claimForm.customerName}
                  onChange={e => setClaimForm({ ...claimForm, customerName: e.target.value })}
                  placeholder="e.g., Baitul Mukarram Builders"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Coverage Duration (Years)</label>
                <select
                  value={claimForm.durationYears}
                  onChange={e => setClaimForm({ ...claimForm, durationYears: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="1">1 Year</option>
                  <option value="3">3 Years</option>
                  <option value="5">5 Years</option>
                  <option value="10">10 Years</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowClaimModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Register Coverage
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REPAIR MODAL */}
      {showRepairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateRepair} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Register Repair Order</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Product / Commodity *</label>
                <input
                  type="text"
                  required
                  value={repairForm.productName}
                  onChange={e => setRepairForm({ ...repairForm, productName: e.target.value })}
                  placeholder="e.g., Concrete Core Piles"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Customer Organization *</label>
                <input
                  type="text"
                  required
                  value={repairForm.customerName}
                  onChange={e => setRepairForm({ ...repairForm, customerName: e.target.value })}
                  placeholder="e.g., Mirpur Cement Traders"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Deflection / Issue Description *</label>
                <textarea
                  required
                  value={repairForm.issueDescription}
                  onChange={e => setRepairForm({ ...repairForm, issueDescription: e.target.value })}
                  placeholder="Reported cracks, weight deviations, micro deflection..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Assigned Expert</label>
                  <select
                    value={repairForm.assignedTechnician}
                    onChange={e => setRepairForm({ ...repairForm, assignedTechnician: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                  >
                    {technicians.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Estimated Cost (BDT)</label>
                  <input
                    type="number"
                    value={repairForm.estimatedCost}
                    onChange={e => setRepairForm({ ...repairForm, estimatedCost: e.target.value })}
                    placeholder="15000"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowRepairModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Save Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COMPLAINT MODAL */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateComplaint} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Open Complaint Ticket</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Client Contact Person *</label>
                <input
                  type="text"
                  required
                  value={complaintForm.customerName}
                  onChange={e => setComplaintForm({ ...complaintForm, customerName: e.target.value })}
                  placeholder="e.g., Al-Amin Rahman"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={complaintForm.phone}
                  onChange={e => setComplaintForm({ ...complaintForm, phone: e.target.value })}
                  placeholder="e.g., 01712..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Urgency Level</label>
                <select
                  value={complaintForm.urgency}
                  onChange={e => setComplaintForm({ ...complaintForm, urgency: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                >
                  <option value="Low">Low - standard billing cycle</option>
                  <option value="Medium">Medium - 48 hours response</option>
                  <option value="High">High - 24 hours response</option>
                  <option value="Critical">Critical - Immediate deployment</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Incident Details *</label>
                <textarea
                  required
                  value={complaintForm.subject}
                  onChange={e => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                  placeholder="Specify what raw properties failed specifications..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowComplaintModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Save Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AMC CONTRACT MODAL */}
      {showAMCModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateAMC} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Log Annual Maintenance Contract (AMC)</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Corporate Client Firm *</label>
                <input
                  type="text"
                  required
                  value={amcForm.clientName}
                  onChange={e => setAmcForm({ ...amcForm, clientName: e.target.value })}
                  placeholder="e.g., Baitul Mukarram Builders"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Contract Value (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={amcForm.value}
                    onChange={e => setAmcForm({ ...amcForm, value: e.target.value })}
                    placeholder="e.g., 120000"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Scheduled Audits / Yr</label>
                  <select
                    value={amcForm.visits}
                    onChange={e => setAmcForm({ ...amcForm, visits: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                  >
                    <option value="2">2 Visits (Semi-Annual)</option>
                    <option value="4">4 Visits (Quarterly)</option>
                    <option value="6">6 Visits (Bi-Monthly)</option>
                    <option value="12">12 Visits (Monthly)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Contract Duration (Months)</label>
                <select
                  value={amcForm.durationMonths}
                  onChange={e => setAmcForm({ ...amcForm, durationMonths: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                >
                  <option value="6">6 Months</option>
                  <option value="12">12 Months (Standard)</option>
                  <option value="24">24 Months (Long Term)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowAMCModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Save AMC
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
