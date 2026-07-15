import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  TrendingUp,
  Brain,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Plus,
  Send,
  Download,
  Percent,
  Calendar,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface AIViewProps {
  activeSubTab?: string;
  products?: any[];
  customers?: any[];
  suppliers?: any[];
  invoices?: any[];
  purchaseOrders?: any[];
  bankAccounts?: any[];
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface Recommendation {
  id: string;
  material: string;
  currentSafety: number;
  suggestedSafety: number;
  reason: string;
  status: 'Pending' | 'Applied';
}

export default function AIView({
  activeSubTab = 'copilot',
  products = [],
  customers = [],
  suppliers = [],
  invoices = [],
  purchaseOrders = [],
  bankAccounts = [],
}: AIViewProps) {
  const currentTab = ['copilot', 'forecast', 'recommendation', 'insights', 'ai_reports'].includes(activeSubTab)
    ? activeSubTab
    : 'copilot';

  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => {
        if (typeof data.aiEnabled === "boolean") {
          setAiEnabled(data.aiEnabled);
        } else {
          setAiEnabled(true);
        }
      })
      .catch(err => {
        console.error("AI check error:", err);
        setAiEnabled(true);
      });
  }, []);

  // --- LOCAL PERSISTED / MOCK STATES ---
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'assistant', text: 'আসসালামু আলাইকুম! আমি নেক্সোভা ইআরপি এআই অ্যাসিস্ট্যান্ট। কীভাবে আমি আপনার উৎপাদন কার্যকারিতা বাড়াতে, সাপ্লাই সংকট অনুমান করতে বা আর্থিক সামঞ্জস্য নিরীক্ষণ করতে সাহায্য করতে পারি?', timestamp: '10:00 AM' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    { id: 'rec1', material: 'Gypsum Cement Stabilizer', currentSafety: 5, suggestedSafety: 15, reason: 'Q3 regional concrete demands are projected to surge by 32%. Increasing safety reserves prevents blending stoppages.', status: 'Pending' },
    { id: 'rec2', material: 'Coal Coke Catalyst', currentSafety: 10, suggestedSafety: 25, reason: 'Port raw-unloading delays reported in Chittagong may affect delivery lead times by 12 days.', status: 'Pending' }
  ]);

  // --- CHART DATA FOR AI FORECAST ---
  const revenueForecastData = [
    { month: 'May 2026', Actual: 2400000, Forecast: 2400000 },
    { month: 'Jun 2026', Actual: 2850000, Forecast: 2850000 },
    { month: 'Jul 2026', Actual: 3100000, Forecast: 3200000 },
    { month: 'Aug 2026', Forecast: 3500000 },
    { month: 'Sep 2026', Forecast: 3950000 },
    { month: 'Oct 2026', Forecast: 4100000 }
  ];

  const steelPriceTrendData = [
    { week: 'Wk 24', price: 68000 },
    { week: 'Wk 25', price: 67200 },
    { week: 'Wk 26', price: 66500 },
    { week: 'Wk 27', price: 65800 },
    { week: 'Wk 28', price: 65000 },
    { week: 'Wk 29', price: 64100 } // price is dropping, perfect buy recommendation!
  ];

  const generateSystemInstruction = () => {
    const stockSummary = products.length > 0 
      ? products.slice(0, 10).map(p => `${p.name}: stock=${p.stock}, cost=৳${p.cost}`).join(', ') 
      : 'No product data available';
    const totalReceivables = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);
    const totalPayables = suppliers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const bankBalance = bankAccounts.reduce((sum, b) => sum + (b.balance || 0), 0);

    return `You are Nexova ERP AI assistant, a highly professional AI agent designed to help optimize manufacturing, supply chains, sales, and financial margins for Nexova ERP Solution.
You have access to the current live ERP state:
- Top Products Stock: [${stockSummary}]
- Accounts Receivable: ৳${totalReceivables.toLocaleString()} BDT
- Accounts Payable: ৳${totalPayables.toLocaleString()} BDT
- Total Invoiced Revenue: ৳${totalRevenue.toLocaleString()} BDT
- Bank Balances: ৳${bankBalance.toLocaleString()} BDT

Respond professionally, helpfully and constructively in Bengali and keep responses brief and focused on actionable business insights. Use BDT or BDT symbol ৳ where appropriate.`;
  };

  // --- ACTIONS ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    const userText = inputText;
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsGenerating(true);

    // Place placeholder message for loading feedback
    const placeholderId = `a_loading_${Date.now()}`;
    const botPlaceholderMsg: Message = {
      id: placeholderId,
      sender: 'assistant',
      text: 'AI চিন্তা করছে...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, botPlaceholderMsg]);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          systemInstruction: generateSystemInstruction(),
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      const reply = data.text || "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।";

      setMessages(prev =>
        prev.map(m => m.id === placeholderId ? { ...m, text: reply } : m)
      );
    } catch (err) {
      console.error("AI View error calling Gemini proxy:", err);
      setMessages(prev =>
        prev.map(m => m.id === placeholderId ? { ...m, text: "AI সার্ভিস সাময়িকভাবে অনুপলব্ধ আছে।" } : m)
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyRecommendation = (id: string) => {
    setRecommendations(recommendations.map(r => r.id === id ? { ...r, status: 'Applied' as const } : r));
    // Simulated stock adjustments confirmation
    const match = recommendations.find(r => r.id === id);
    if (match) {
      alert(`Applied Stock Reconfiguration: Safety stock limit of ${match.material} raised to ${match.suggestedSafety} units.`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display flex items-center gap-2">
            <Sparkles className="text-indigo-600 h-5 w-5" />
            <span>AI & Intelligence Command</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Harness predictive intelligence, view automated revenue and price trend forecasts, and audit smart business recommendations.</p>
        </div>
      </div>

      {/* VIEW RENDERERS */}
      {currentTab === 'copilot' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm h-[520px] flex flex-col overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-indigo-600" />
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Nexova ERP Copilot Terminal</span>
              </div>
              {aiEnabled === false ? (
                <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                  <span className="h-2 w-2 rounded-full bg-slate-300"></span> AI Disabled
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Offline AI Model Active
                </span>
              )}
            </div>

            {/* MESSAGE CONTAINER */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex gap-3 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'assistant' && (
                    <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-indigo-600" />
                    </div>
                  )}
                  <div className={`p-3 rounded-xl max-w-[80%] space-y-1 ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-slate-50 border border-slate-100 text-slate-600 leading-relaxed font-medium'
                  }`}>
                    <p>{m.text}</p>
                    <span className={`text-[9px] block text-right font-mono ${
                      m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}>{m.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* QUICK PRESET INQUIRIES */}
            {aiEnabled !== false && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setInputText('What is the price trend of steel?')}
                  className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 text-slate-600 hover:border-indigo-400 cursor-pointer"
                >
                  📊 Price trend of steel?
                </button>
                <button
                  onClick={() => setInputText('Give me August revenue forecast')}
                  className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 text-slate-600 hover:border-indigo-400 cursor-pointer"
                >
                  💰 August revenue forecast?
                </button>
                <button
                  onClick={() => setInputText('How are raw cement stocks?')}
                  className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 text-slate-600 hover:border-indigo-400 cursor-pointer"
                >
                  🏗️ Cement stocks?
                </button>
              </div>
            )}

            {/* INPUT PANEL */}
            {aiEnabled === false ? (
              <div className="p-5 border-t border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center gap-1.5">
                <Brain className="h-7 w-7 text-slate-400 animate-pulse" />
                <p className="text-xs text-slate-600 font-semibold font-sans">
                  এআই অ্যাসিস্ট্যান্ট বর্তমানে নিষ্ক্রিয় রয়েছে। এটি সক্রিয় করতে অনুগ্রহ করে অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  AI Assistant is currently turned off. Contact your administrator to enable it.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
                <input
                  type="text"
                  placeholder="Ask ERP Copilot..."
                  value={inputText}
                  disabled={aiEnabled === null}
                  onChange={e => setInputText(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={aiEnabled === null}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Intelligent Capabilities</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nexova AI scans raw material specifications in Warehouse registries and ledger margins in Accounting daily to detect system bottlenecks automatically.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1">
                <Lightbulb className="h-4 w-4 text-indigo-500" />
                <span>Smart Daily Hint</span>
              </h3>
              <p className="text-xs text-slate-600 leading-normal font-medium">
                Iron Ore Billets are experiencing price drops across Chittagong trading hubs. Consider creating a bulk purchase agreement to secure the lowest rates of 2026.
              </p>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'forecast' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">6-Month Predictive Revenue Forecast (BDT)</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueForecastData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [value ? `৳${Number(value).toLocaleString()}` : '', 'BDT']} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="Actual" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Billet Raw Steel Purchase Price Trend (Ton)</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={steelPriceTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} domain={[60000, 70000]} />
                  <Tooltip formatter={(value) => [value ? `৳${Number(value).toLocaleString()}` : '', 'BDT']} />
                  <Bar dataKey="price" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'recommendation' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Safety Stock Optimization Alarms</h3>
          <div className="space-y-4">
            {recommendations.map(r => (
              <div key={r.id} className="border border-slate-100 p-4 rounded-xl bg-slate-50/20 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-indigo-600 font-mono font-bold">Category: Reserve Rebalancing</span>
                    <h4 className="font-bold text-xs text-slate-800 mt-0.5">{r.material}</h4>
                  </div>
                  <span className={`font-semibold text-[10px] px-2 py-0.5 rounded-full ${
                    r.status === 'Applied' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{r.reason}</p>
                <div className="border-t border-slate-100/60 pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="text-[11px] text-slate-500 font-medium">
                    Current Safety Limit: <strong className="text-slate-700">{r.currentSafety} Units</strong> &rarr; Suggesting: <strong className="text-slate-700">{r.suggestedSafety} Units</strong>
                  </div>
                  {r.status === 'Pending' && (
                    <button
                      onClick={() => handleApplyRecommendation(r.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-1 rounded cursor-pointer transition-colors"
                    >
                      Apply Reconfiguration
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentTab === 'insights' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">AI Generated Insights</h3>
          <div className="space-y-3">
            <div className="bg-amber-50/30 border border-amber-100/80 p-3 rounded-lg flex gap-2.5">
              <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 space-y-1">
                <strong className="text-slate-800 font-bold block">Credit Over-Limit Exposure detected</strong>
                <p className="font-medium">Purbachal Housing Ltd has an outstanding balance of ৳820,000, which reaches 95% of their configured credit margin. Consider holding further cement shipments until payment reconciles.</p>
              </div>
            </div>
            <div className="bg-indigo-50/30 border border-indigo-100/80 p-3 rounded-lg flex gap-2.5">
              <Brain className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 space-y-1">
                <strong className="text-slate-800 font-bold block">Supplier Delivery Lead Time Optimization</strong>
                <p className="font-medium">Chowdhury Coal Supplier is matching delivery targets 14% faster than standard regional traders. Suggested primary supplier prioritization inside purchase rules.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'ai_reports' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-center py-12 space-y-3">
          <FileText className="h-10 w-10 text-indigo-600 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">AI Executive Briefings</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Generate summarized executive reports analyzing monthly production overheads, customer payment delays, and warehouse scrap margins in seconds.
          </p>
          <button
            onClick={() => alert('Generating PDF Summary Briefing...')}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg mx-auto cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Generate Executive Summary</span>
          </button>
        </div>
      )}
    </div>
  );
}
