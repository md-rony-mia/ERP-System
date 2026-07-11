import React, { useState, useEffect } from 'react';
import {
  FileUp,
  FileDown,
  Code,
  Globe,
  Radio,
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  AlertTriangle,
  Send,
  Download,
  Copy,
  Terminal,
  RefreshCw,
  Cpu
} from 'lucide-react';

interface IntegrationViewProps {
  activeSubTab?: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  triggerEvent: string;
  status: 'Active' | 'Inactive';
}

interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
}

export default function IntegrationView({ activeSubTab = 'import' }: IntegrationViewProps) {
  const currentTab = ['import', 'export', 'rest_api', 'graphql', 'webhook', 'marketplace'].includes(activeSubTab)
    ? activeSubTab
    : 'import';

  // --- LOCAL PERSISTED STATES ---
  const [webhooks, setWebhooks] = useState<Webhook[]>(() => {
    const saved = localStorage.getItem('axiom_integrations_webhooks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'wh1', name: 'Invoice Paid Event Stream', url: 'https://api.yourcompany.com/webhooks/invoice-paid', triggerEvent: 'Invoice Paid', status: 'Active' },
      { id: 'wh2', name: 'Low Stock Slack Alert', url: 'https://hooks.slack.com/services/T00/B00/X00', triggerEvent: 'Inventory Low Stock', status: 'Active' }
    ];
  });

  const [marketplaceApps, setMarketplaceApps] = useState<MarketplaceApp[]>(() => {
    const saved = localStorage.getItem('axiom_integrations_apps');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'app1', name: 'Stripe Payment Gateway', description: 'Reconcile invoice payments instantly via secure credit cards.', category: 'Fintech', connected: true },
      { id: 'app2', name: 'Twilio SMS Broadcaster', description: 'Send low stock and employee pay slip notifications.', category: 'Telecom', connected: false },
      { id: 'app3', name: 'Google Workspace Sync', description: 'Synchronize meetings and calendars with engineering schedules.', category: 'Utility', connected: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem('axiom_integrations_webhooks', JSON.stringify(webhooks));
  }, [webhooks]);

  useEffect(() => {
    localStorage.setItem('axiom_integrations_apps', JSON.stringify(marketplaceApps));
  }, [marketplaceApps]);

  // --- BATCH IMPORT STATES ---
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'validating' | 'completed'>('idle');
  const [importLogs, setImportLogs] = useState<string[]>([]);

  // --- REST API DEMO STATES ---
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET /api/v1/products');
  const [apiResponse, setApiResponse] = useState<any>(null);

  // --- MODAL STATES ---
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookForm, setWebhookForm] = useState({
    name: '', url: '', triggerEvent: 'Invoice Paid'
  });

  // --- BATCH IMPORT TRIGGER ---
  const handleBatchImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) {
      alert('Please paste valid JSON array to import.');
      return;
    }
    setImportStatus('validating');
    setImportLogs([]);
    setTimeout(() => {
      try {
        const parsed = JSON.parse(importJsonText);
        if (!Array.isArray(parsed)) {
          throw new Error('Root level element must be a JSON array.');
        }
        setImportStatus('completed');
        setImportLogs([
          'Starting batch import job...',
          `Validating schema for ${parsed.length} raw data records...`,
          'Validation complete! Insertion into local database successful.',
          `Successfully synchronized ${parsed.length} items with Axiom ERP ledger.`
        ]);
        // Merge into corresponding local storage based on dummy keys inside items
        if (parsed[0] && parsed[0].name && parsed[0].sku) {
          // If product
          const existing = JSON.parse(localStorage.getItem('axiom_products') || '[]');
          const updated = [...parsed, ...existing];
          localStorage.setItem('axiom_products', JSON.stringify(updated));
        }
      } catch (err: any) {
        setImportStatus('completed');
        setImportLogs([
          'CRITICAL EXCEPTION REPORTED DURING PARSE PHASE',
          `Cause: ${err.message || 'Malformed JSON syntax'}`
        ]);
      }
    }, 1500);
  };

  // --- REST ENDPOINT TEST TRIGGER ---
  const handleTestEndpoint = () => {
    if (selectedEndpoint === 'GET /api/v1/products') {
      setApiResponse({
        status: 'success',
        results: 3,
        data: [
          { sku: 'STL-12MM-TMT', name: 'TMT Steel Bar 12mm', stock: 1250 },
          { sku: 'CMT-PCC-50KG', name: 'Portland Composite Cement', stock: 840 }
        ]
      });
    } else {
      setApiResponse({
        status: 'success',
        totalOutstandingBDT: 1170000,
        leadsCount: 4,
        synchronizedWithCRM: true
      });
    }
  };

  // --- WEBHOOK ACTIONS ---
  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookForm.name || !webhookForm.url) return;
    const newWH: Webhook = {
      id: `wh_${Date.now()}`,
      name: webhookForm.name,
      url: webhookForm.url,
      triggerEvent: webhookForm.triggerEvent,
      status: 'Active'
    };
    setWebhooks([...webhooks, newWH]);
    setWebhookForm({ name: '', url: '', triggerEvent: 'Invoice Paid' });
    setShowWebhookModal(false);
  };

  const handleDeleteWebhook = (id: string) => {
    if (confirm('Are you sure you want to delete this webhook stream?')) {
      setWebhooks(webhooks.filter(w => w.id !== id));
    }
  };

  const handleToggleApp = (id: string) => {
    setMarketplaceApps(marketplaceApps.map(app => app.id === id ? { ...app, connected: !app.connected } : app));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">System Integration & REST Webhooks</h2>
          <p className="text-xs text-slate-400 mt-1">Configure batch data imports, view available REST and GraphQL API structures, configure active webhook pings, and connect financial extensions.</p>
        </div>
      </div>

      {/* CORE MATRIX RENDERS */}
      {currentTab === 'import' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Batch JSON Data Import</h3>
            <form onSubmit={handleBatchImport} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">Raw JSON Array Payload *</label>
                <textarea
                  required
                  rows={10}
                  value={importJsonText}
                  onChange={e => setImportJsonText(e.target.value)}
                  placeholder={`[\n  { "name": "Bulk Deformed Bar", "sku": "STL-BULK-X", "category": "Steel", "price": 68000, "stock": 450 }\n]`}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 font-mono text-[11px] focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={importStatus === 'validating'}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded transition-colors cursor-pointer"
              >
                {importStatus === 'validating' ? 'Validating schema...' : 'Run Validation & Batch Import'}
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1">
              <Terminal className="h-4 w-4 text-indigo-500" />
              <span>Import Process Output Log</span>
            </h3>
            {importStatus === 'idle' && (
              <p className="text-xs text-slate-400 text-center py-12">Submit raw parameters to initiate the batch parse phase.</p>
            )}
            {importStatus === 'validating' && (
              <div className="space-y-3 animate-pulse py-12 text-center">
                <div className="h-2 bg-slate-200 rounded-full max-w-[140px] mx-auto"></div>
                <div className="h-2 bg-slate-200 rounded-full max-w-[100px] mx-auto"></div>
              </div>
            )}
            {importStatus === 'completed' && (
              <div className="bg-slate-950 p-3.5 border border-slate-900 rounded-xl font-mono text-[11px] space-y-1 max-h-[300px] overflow-y-auto">
                {importLogs.map((log, idx) => (
                  <p key={idx} className={log.startsWith('Successfully') ? 'text-emerald-400' : log.startsWith('Cause') ? 'text-rose-400' : 'text-slate-300'}>
                    &gt; {log}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {currentTab === 'export' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4 text-center py-12">
          <FileDown className="h-10 w-10 text-indigo-600 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Bulk Data Downloader</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Securely pull full tabular raw JSON and CSV assets for regional tax and corporate compliance audits.
          </p>
          <div className="flex justify-center gap-2 text-xs pt-2">
            <button
              onClick={() => alert('Downloading product catalog...')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer"
            >
              Export Product Catalog
            </button>
            <button
              onClick={() => alert('Downloading invoice registers...')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer"
            >
              Export Invoice Register
            </button>
          </div>
        </div>
      )}

      {currentTab === 'rest_api' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Active REST Endpoints</h3>
            <div className="space-y-3">
              {['GET /api/v1/products', 'GET /api/v1/leads'].map(ep => (
                <button
                  key={ep}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3 border rounded-xl flex justify-between items-center transition-colors cursor-pointer ${
                    selectedEndpoint === ep ? 'bg-indigo-50/50 border-indigo-400 text-indigo-900' : 'bg-slate-50 border-slate-100 text-slate-600'
                  }`}
                >
                  <span className="font-mono text-xs font-bold">{ep}</span>
                  <Code className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>

            <div className="bg-slate-950 p-3.5 border border-slate-900 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-mono font-bold block mb-1">CURL COMMAND LINE</span>
              <p className="font-mono text-[10px] text-emerald-400 select-all leading-normal">
                curl -H "Authorization: Bearer test_token_xyz" https://axiom-erp.ai{selectedEndpoint.split(' ')[1]}
              </p>
            </div>

            <button
              onClick={handleTestEndpoint}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Cpu className="h-4 w-4" />
              <span>Test Selected Endpoint</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 flex flex-col">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">API Response Payload</h3>
            {!apiResponse ? (
              <p className="text-xs text-slate-400 text-center py-12 my-auto">Press 'Test Selected Endpoint' to trigger mock visual payloads.</p>
            ) : (
              <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl font-mono text-[11px] text-slate-300 overflow-y-auto max-h-[350px] my-auto select-all leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(apiResponse, null, 2)}
              </div>
            )}
          </div>
        </div>
      )}

      {currentTab === 'graphql' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-center py-12 space-y-3">
          <Code className="h-10 w-10 text-indigo-600 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">GraphQL Query Playground</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Harness GraphQL to fetch only the raw material specifications required. Playground synchronization requires GraphQL master credentials.
          </p>
        </div>
      )}

      {currentTab === 'webhook' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Active Webhook Integrations</h3>
            <button
              onClick={() => setShowWebhookModal(true)}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register Webhook</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-4">Webhook Description</th>
                  <th className="py-2.5 px-4">Target Payload URL</th>
                  <th className="py-2.5 px-4">Trigger System Event</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map(w => (
                  <tr key={w.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 text-xs text-slate-600">
                    <td className="py-3 px-4 font-bold text-slate-800">{w.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] max-w-[200px] truncate">{w.url}</td>
                    <td className="py-3 px-4 font-semibold text-indigo-600">{w.triggerEvent}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteWebhook(w.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentTab === 'marketplace' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Marketplace App Directory</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketplaceApps.map(app => (
              <div key={app.id} className="border border-slate-150 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-indigo-500 transition-colors bg-slate-50/10">
                <div className="space-y-1">
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    {app.category} Extension
                  </span>
                  <h4 className="font-bold text-slate-800 text-xs mt-1.5">{app.name}</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">{app.description}</p>
                </div>
                <button
                  onClick={() => handleToggleApp(app.id)}
                  className={`w-full font-bold text-xs py-1.5 rounded transition-colors cursor-pointer ${
                    app.connected ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {app.connected ? 'Disconnect App' : 'Connect Extension'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WEBHOOK MODAL */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateWebhook} className="bg-white border border-slate-200 rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Register Secure Webhook Stream</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Webhook Friendly Name *</label>
                <input
                  type="text"
                  required
                  value={webhookForm.name}
                  onChange={e => setWebhookForm({ ...webhookForm, name: e.target.value })}
                  placeholder="e.g., Slack stock alarm stream"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Target Payload Destination URL *</label>
                <input
                  type="url"
                  required
                  value={webhookForm.url}
                  onChange={e => setWebhookForm({ ...webhookForm, url: e.target.value })}
                  placeholder="https://yourserver.com/hooks"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Trigger System Event</label>
                <select
                  value={webhookForm.triggerEvent}
                  onChange={e => setWebhookForm({ ...webhookForm, triggerEvent: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:outline-none"
                >
                  <option value="Invoice Paid">On Invoice Paid Successful</option>
                  <option value="Inventory Low Stock">On Inventory Low Stock Alert</option>
                  <option value="New Lead">On New Corporate Lead Acquired</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setShowWebhookModal(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
