import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  CheckSquare,
  Zap,
  Clock,
  Plus,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  UserCheck,
  TrendingUp,
  FileText
} from 'lucide-react';
import { seedCollectionIfEmpty, syncCollectionToFirestore } from '../lib/firebase';

interface WorkflowViewProps {
  activeSubTab?: string;
}

interface ApprovalRule {
  id: string;
  name: string;
  triggerEvent: string;
  conditionThreshold: number; // e.g. amount > 500000 BDT
  approverRole: string;
  status: 'Active' | 'Inactive';
}

interface AutomationRule {
  id: string;
  name: string;
  eventTrigger: 'Stock Alert' | 'Invoice Generated' | 'New Lead';
  actionChannel: 'Email' | 'SMS' | 'Webhook';
  status: 'Active' | 'Inactive';
}

interface PendingApproval {
  id: string;
  documentNo: string;
  documentType: 'Purchase Order' | 'Invoice' | 'Asset Requisition';
  amount: number;
  requestedBy: string;
  dateRequested: string;
  status: 'Awaiting Sign-off' | 'Approved' | 'Rejected';
  notes?: string;
}

export default function WorkflowView({ activeSubTab = 'pending_approval' }: WorkflowViewProps) {
  const currentTab = ['designer', 'approval_rules', 'automation_rules', 'pending_approval'].includes(activeSubTab)
    ? activeSubTab
    : 'pending_approval';

  // --- LOCAL PERSISTED STATES ---
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. approvalRules
        const legacyRules = localStorage.getItem('axiom_wf_rules');
        let initialRules = [
          { id: 'ar1', name: 'High Value PO Overrides', triggerEvent: 'Purchase Order Total', conditionThreshold: 500000, approverRole: 'Managing Director', status: 'Active' as const },
          { id: 'ar2', name: 'Credit Sale Authorization', triggerEvent: 'Credit Invoice Total', conditionThreshold: 200000, approverRole: 'CFO', status: 'Active' as const }
        ];
        if (legacyRules) {
          try { initialRules = JSON.parse(legacyRules); } catch (e) {}
        }
        const seededRules = await seedCollectionIfEmpty('wfRules', initialRules);
        setApprovalRules(seededRules || []);
        if (legacyRules) {
          localStorage.removeItem('axiom_wf_rules');
        }

        // 2. automationRules
        const legacyAutos = localStorage.getItem('axiom_wf_automations');
        let initialAutos = [
          { id: 'atr1', name: 'Low Stock Supervisor Email Alert', eventTrigger: 'Stock Alert' as const, actionChannel: 'Email' as const, status: 'Active' as const },
          { id: 'atr2', name: 'Sales Lead Webhook Payload', eventTrigger: 'New Lead' as const, actionChannel: 'Webhook' as const, status: 'Inactive' as const }
        ];
        if (legacyAutos) {
          try { initialAutos = JSON.parse(legacyAutos); } catch (e) {}
        }
        const seededAutos = await seedCollectionIfEmpty('wfAutomations', initialAutos);
        setAutomationRules(seededAutos || []);
        if (legacyAutos) {
          localStorage.removeItem('axiom_wf_automations');
        }

        // 3. pendingApprovals
        const legacyPending = localStorage.getItem('axiom_wf_pending');
        let initialPending = [
          { id: 'pa1', documentNo: 'PO-2026-9021', documentType: 'Purchase Order' as const, amount: 820000, requestedBy: 'Tasnim Ahmed', dateRequested: '2026-07-08', status: 'Awaiting Sign-off' as const },
          { id: 'pa2', documentNo: 'INV-2026-0412', documentType: 'Invoice' as const, amount: 450000, requestedBy: 'Rony Mia', dateRequested: '2026-07-09', status: 'Awaiting Sign-off' as const }
        ];
        if (legacyPending) {
          try { initialPending = JSON.parse(legacyPending); } catch (e) {}
        }
        const seededPending = await seedCollectionIfEmpty('wfPending', initialPending);
        setPendingApprovals(seededPending || []);
        if (legacyPending) {
          localStorage.removeItem('axiom_wf_pending');
        }
      } catch (err) {
        console.error("Workflow migration failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (loading) return;
    syncCollectionToFirestore('wfRules', approvalRules);
  }, [approvalRules, loading]);

  useEffect(() => {
    if (loading) return;
    syncCollectionToFirestore('wfAutomations', automationRules);
  }, [automationRules, loading]);

  useEffect(() => {
    if (loading) return;
    syncCollectionToFirestore('wfPending', pendingApprovals);
  }, [pendingApprovals, loading]);

  // --- MODALS FORM STATES ---
  const [showApprovalRuleModal, setShowApprovalRuleModal] = useState(false);
  const [approvalRuleForm, setApprovalRuleForm] = useState({
    name: '', triggerEvent: 'Purchase Order Total', threshold: '', role: 'CFO'
  });

  const [showAutomationRuleModal, setShowAutomationRuleModal] = useState(false);
  const [automationRuleForm, setAutomationRuleForm] = useState({
    name: '', eventTrigger: 'Stock Alert' as AutomationRule['eventTrigger'], actionChannel: 'Email' as AutomationRule['actionChannel']
  });

  // --- ACTIONS ---
  const handleCreateApprovalRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalRuleForm.name || !approvalRuleForm.threshold) return;
    const newRule: ApprovalRule = {
      id: `ar_${Date.now()}`,
      name: approvalRuleForm.name,
      triggerEvent: approvalRuleForm.triggerEvent,
      conditionThreshold: parseFloat(approvalRuleForm.threshold) || 0,
      approverRole: approvalRuleForm.role,
      status: 'Active'
    };
    setApprovalRules([...approvalRules, newRule]);
    setApprovalRuleForm({ name: '', triggerEvent: 'Purchase Order Total', threshold: '', role: 'CFO' });
    setShowApprovalRuleModal(false);
  };

  const handleCreateAutomationRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!automationRuleForm.name) return;
    const newAuto: AutomationRule = {
      id: `atr_${Date.now()}`,
      name: automationRuleForm.name,
      eventTrigger: automationRuleForm.eventTrigger,
      actionChannel: automationRuleForm.actionChannel,
      status: 'Active'
    };
    setAutomationRules([...automationRules, newAuto]);
    setAutomationRuleForm({ name: '', eventTrigger: 'Stock Alert', actionChannel: 'Email' });
    setShowAutomationRuleModal(false);
  };

  const handleProcessApproval = (id: string, action: 'Approved' | 'Rejected', notes: string = 'Approved on system audit') => {
    setPendingApprovals(pendingApprovals.map(p => p.id === id ? {
      ...p,
      status: action,
      notes: notes
    } : p));
  };

  const toggleApprovalRule = (id: string) => {
    setApprovalRules(approvalRules.map(a => a.id === id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a));
  };

  const toggleAutomationRule = (id: string) => {
    setAutomationRules(automationRules.map(a => a.id === id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">Enterprise Workflow Designer & Approvals Queue</h2>
          <p className="text-xs text-slate-400 mt-1">Nurture and customize multi-phase document sign-off pathways, configure triggers, and approve active corporate expenses.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentTab === 'approval_rules' && (
            <button
              onClick={() => setShowApprovalRuleModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Define Approval Rule</span>
            </button>
          )}
          {currentTab === 'automation_rules' && (
            <button
              onClick={() => setShowAutomationRuleModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Define Automation</span>
            </button>
          )}
        </div>
      </div>

      {/* CORE PENDING QUEUE */}
      {currentTab === 'pending_approval' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Active Approvals Queue</h3>
          <div className="space-y-3">
            {pendingApprovals.filter(p => p.status === 'Awaiting Sign-off').length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                All document requisitions have been processed. Queue empty!
              </div>
            ) : (
              pendingApprovals.filter(p => p.status === 'Awaiting Sign-off').map(p => (
                <div key={p.id} className="border border-slate-100 p-4 rounded-xl space-y-3 bg-slate-50/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{p.documentType} Req</span>
                      <h4 className="font-bold text-xs text-slate-800 mt-0.5">{p.documentNo}</h4>
                    </div>
                    <span className="text-sm font-extrabold text-indigo-600">৳{p.amount.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Requested by: <strong className="text-slate-600">{p.requestedBy}</strong></span>
                    <span>Date: <strong className="font-mono">{p.dateRequested}</strong></span>
                  </div>
                  <div className="border-t border-slate-100/60 pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => handleProcessApproval(p.id, 'Rejected')}
                      className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] px-3 py-1 rounded cursor-pointer transition-colors"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => handleProcessApproval(p.id, 'Approved')}
                      className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-150 text-emerald-700 font-bold text-[11px] px-3 py-1 rounded cursor-pointer transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Approve Sign-off
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {currentTab === 'designer' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-center py-12 space-y-3">
          <GitBranch className="h-10 w-10 text-indigo-600 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Approval Workflow Designer</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Drag and drop workflow stages (CFO Auditing, MD Overrides, Vault Archiving) to customize transaction pathways. Requires structural administration tokens configured in settings.
          </p>
        </div>
      )}

      {currentTab === 'approval_rules' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Active Document Approval Rules</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-4">Rule Name</th>
                  <th className="py-2.5 px-4">Trigger Action Event</th>
                  <th className="py-2.5 px-4 text-right font-bold">BDT Deflection Threshold</th>
                  <th className="py-2.5 px-4">Authorized Approver</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {approvalRules.map(ar => (
                  <tr key={ar.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 text-xs text-slate-600">
                    <td className="py-3 px-4 font-bold text-slate-800">{ar.name}</td>
                    <td className="py-3 px-4 text-slate-600">{ar.triggerEvent}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-800">৳{ar.conditionThreshold.toLocaleString()} BDT</td>
                    <td className="py-3 px-4 font-semibold text-indigo-600">{ar.approverRole}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleApprovalRule(ar.id)}
                        className={`font-bold text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                          ar.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {ar.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentTab === 'automation_rules' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Active Automated Triggers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-4">Automation Name</th>
                  <th className="py-2.5 px-4">Trigger Core Event</th>
                  <th className="py-2.5 px-4">System Notification Channel</th>
                  <th className="py-2.5 px-4">Automation Status</th>
                </tr>
              </thead>
              <tbody>
                {automationRules.map(atr => (
                  <tr key={atr.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 text-xs text-slate-600">
                    <td className="py-3 px-4 font-bold text-slate-800">{atr.name}</td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">{atr.eventTrigger}</td>
                    <td className="py-3 px-4 font-bold text-indigo-600">{atr.actionChannel}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleAutomationRule(atr.id)}
                        className={`font-bold text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                          atr.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {atr.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPROVAL RULE MODAL */}
      {showApprovalRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateApprovalRule} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Create Document Approval Rule</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Approval Rule Name *</label>
                <input
                  type="text"
                  required
                  value={approvalRuleForm.name}
                  onChange={e => setApprovalRuleForm({ ...approvalRuleForm, name: e.target.value })}
                  placeholder="e.g., Heavy Raw Supply Invoices"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Trigger Event</label>
                  <select
                    value={approvalRuleForm.triggerEvent}
                    onChange={e => setApprovalRuleForm({ ...approvalRuleForm, triggerEvent: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                  >
                    <option value="Purchase Order Total">Purchase Order Total</option>
                    <option value="Credit Invoice Total">Credit Invoice Total</option>
                    <option value="Asset Requisition">Asset Requisition</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Threshold (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={approvalRuleForm.threshold}
                    onChange={e => setApprovalRuleForm({ ...approvalRuleForm, threshold: e.target.value })}
                    placeholder="e.g., 500000"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Authorized Signatory</label>
                <select
                  value={approvalRuleForm.role}
                  onChange={e => setApprovalRuleForm({ ...approvalRuleForm, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                >
                  <option value="CFO">Chief Financial Officer (CFO)</option>
                  <option value="Managing Director">Managing Director</option>
                  <option value="Logistics Head">Logistics Head</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowApprovalRuleModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Save Rule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AUTOMATION RULE MODAL */}
      {showAutomationRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateAutomationRule} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Define Event Automation Rule</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Automation Rule Name *</label>
                <input
                  type="text"
                  required
                  value={automationRuleForm.name}
                  onChange={e => setAutomationRuleForm({ ...automationRuleForm, name: e.target.value })}
                  placeholder="e.g., Email alerts when cement low"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Core Event Trigger</label>
                  <select
                    value={automationRuleForm.eventTrigger}
                    onChange={e => setAutomationRuleForm({ ...automationRuleForm, eventTrigger: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                  >
                    <option value="Stock Alert">Inventory Low Stock Alert</option>
                    <option value="Invoice Generated">Sales Invoice Generated</option>
                    <option value="New Lead">New Lead Registered</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Notification Channel</label>
                  <select
                    value={automationRuleForm.actionChannel}
                    onChange={e => setAutomationRuleForm({ ...automationRuleForm, actionChannel: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                  >
                    <option value="Email">Email SMTP Push</option>
                    <option value="SMS">SMS Gateway Broadcast</option>
                    <option value="Webhook">JSON Webhook Payload</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowAutomationRuleModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Save Automation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
