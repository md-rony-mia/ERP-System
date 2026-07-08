import { useState } from 'react';
import {
  Invoice,
  Product,
  Supplier,
  Customer,
} from '../types';
import {
  TrendingUp,
  FileText,
  Boxes,
  AlertTriangle,
  ArrowRightLeft,
  ArrowUpRight,
  PlusCircle,
  ShoppingBag,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Palette,
  EyeOff as EyeHidden,
  RefreshCw,
  Edit3,
  Check,
  X,
} from 'lucide-react';

interface DashboardViewProps {
  invoices: Invoice[];
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  onTabChange: (tab: string, subTab?: string) => void;
  isVisualEditMode?: boolean;
}

export default function DashboardView({
  invoices,
  products,
  suppliers,
  customers,
  onTabChange,
  isVisualEditMode = false,
}: DashboardViewProps) {
  // Balance mask state matching the hide-reveal behavior in the image
  const [showValues, setShowValues] = useState(false);

  // Layout states customizable by user in Visual Edit Mode
  const [layoutOrder, setLayoutOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('axiom_dashboard_order');
    return saved ? JSON.parse(saved) : ['welcome', 'kpis', 'analytics', 'shortcuts_recent', 'alerts_outstanding'];
  });

  const [hiddenSections, setHiddenSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('axiom_dashboard_hidden');
    return saved ? JSON.parse(saved) : [];
  });

  const [cardThemes, setCardThemes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('axiom_dashboard_themes');
    return saved ? JSON.parse(saved) : {
      welcome: 'bg-[#0d1c38] text-white',
      today_revenue: 'bg-white border-slate-200/80 text-slate-800',
      analytics_perf: 'bg-white border-slate-200/80',
      analytics_mix: 'bg-white border-slate-200/80',
      recent_sales: 'bg-white border-slate-200/80',
      shortcuts: 'bg-white border-slate-200/80',
      low_stock: 'bg-white border-slate-200/80',
      outstanding: 'bg-white border-slate-200/80'
    };
  });

  const [customTitles, setCustomTitles] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('axiom_dashboard_titles');
    return saved ? JSON.parse(saved) : {
      welcome: "Here's your store at a glance today.",
      today_revenue: "Today's Revenue",
      recent_sales: "Recent Sales",
      shortcuts: "Quick Actions",
      low_stock: "Low Stock Alert",
      outstanding: "Outstanding Payments"
    };
  });

  const [editingTitleKey, setEditingTitleKey] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState<string>('');

  // Save utility helpers
  const saveLayoutOrder = (newOrder: string[]) => {
    setLayoutOrder(newOrder);
    localStorage.setItem('axiom_dashboard_order', JSON.stringify(newOrder));
  };

  const saveHiddenSections = (newHidden: string[]) => {
    setHiddenSections(newHidden);
    localStorage.setItem('axiom_dashboard_hidden', JSON.stringify(newHidden));
  };

  const saveCardThemes = (newThemes: Record<string, string>) => {
    setCardThemes(newThemes);
    localStorage.setItem('axiom_dashboard_themes', JSON.stringify(newThemes));
  };

  const saveCustomTitles = (newTitles: Record<string, string>) => {
    setCustomTitles(newTitles);
    localStorage.setItem('axiom_dashboard_titles', JSON.stringify(newTitles));
  };

  // Re-ordering logic
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...layoutOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx >= 0 && targetIdx < newOrder.length) {
      const temp = newOrder[index];
      newOrder[index] = newOrder[targetIdx];
      newOrder[targetIdx] = temp;
      saveLayoutOrder(newOrder);
    }
  };

  // Color theme cycling
  const cycleTheme = (key: string) => {
    const themesList = [
      'bg-white border-slate-200/80 text-slate-800',
      'bg-[#0d1c38] text-white border-slate-800',
      'bg-indigo-900 text-white border-indigo-800',
      'bg-emerald-950 text-emerald-100 border-emerald-900',
      'bg-rose-950 text-rose-100 border-rose-900',
      'bg-amber-50 text-amber-900 border-amber-200',
    ];
    const currentTheme = cardThemes[key] || themesList[0];
    const nextIdx = (themesList.indexOf(currentTheme) + 1) % themesList.length;
    const newThemes = { ...cardThemes, [key]: themesList[nextIdx] };
    saveCardThemes(newThemes);
  };

  // Title edit save
  const saveTitleEdit = (key: string) => {
    const updated = { ...customTitles, [key]: editingTitleValue };
    saveCustomTitles(updated);
    setEditingTitleKey(null);
  };

  // Reset all layout settings
  const resetLayoutToDefaults = () => {
    localStorage.removeItem('axiom_dashboard_order');
    localStorage.removeItem('axiom_dashboard_hidden');
    localStorage.removeItem('axiom_dashboard_themes');
    localStorage.removeItem('axiom_dashboard_titles');
    setLayoutOrder(['welcome', 'kpis', 'analytics', 'shortcuts_recent', 'alerts_outstanding']);
    setHiddenSections([]);
    setCardThemes({
      welcome: 'bg-[#0d1c38] text-white',
      today_revenue: 'bg-white border-slate-200/80 text-slate-800',
      analytics_perf: 'bg-white border-slate-200/80',
      analytics_mix: 'bg-white border-slate-200/80',
      recent_sales: 'bg-white border-slate-200/80',
      shortcuts: 'bg-white border-slate-200/80',
      low_stock: 'bg-white border-slate-200/80',
      outstanding: 'bg-white border-slate-200/80'
    });
    setCustomTitles({
      welcome: "Here's your store at a glance today.",
      today_revenue: "Today's Revenue",
      recent_sales: "Recent Sales",
      shortcuts: "Quick Actions",
      low_stock: "Low Stock Alert",
      outstanding: "Outstanding Payments"
    });
    alert('Dashboard layout successfully restored to enterprise defaults!');
  };

  // Stats derivations
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.isPaid ? inv.total : 0), 0);
  const totalReceivables = customers.reduce((sum, cust) => sum + cust.outstandingBalance, 0);
  const totalPayables = suppliers.reduce((sum, sup) => sum + sup.outstandingBalance, 0);
  const lowStockItems = products.filter((p) => p.stock <= p.alertQty);
  
  // Custom tooltips state for charts
  const [salesHoverIndex, setSalesHoverIndex] = useState<number | null>(null);

  // 7 days sales data matching screenshot
  const sales7Days = [
    { date: '30 Jun', sales: 0 },
    { date: '01 Jul', sales: 0 },
    { date: '02 Jul', sales: 0 },
    { date: '03 Jul', sales: 0 },
    { date: '04 Jul', sales: 0 },
    { date: '05 Jul', sales: 0 },
    { date: '06 Jul', sales: invoices.length > 4 ? invoices[invoices.length - 1].total : 21518 }, // Use actual loaded data
  ];

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    }).format(val).replace('BDT', '৳');
  };

  const displayVal = (val: number) => {
    if (!showValues) return '৳ ••••••';
    return formatCurrency(val);
  };

  // Controls toolbar component
  const renderControls = (sectionId: string, index: number) => {
    if (!isVisualEditMode) return null;
    return (
      <div className="absolute top-2 right-2 bg-slate-900/95 text-white p-1 rounded-lg flex items-center gap-1 z-30 shadow-lg text-[10px] select-none pointer-events-auto">
        <button
          onClick={() => moveSection(index, 'up')}
          disabled={index === 0}
          className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded cursor-pointer"
          title="Move Section Up"
        >
          <ArrowUp className="h-3 w-3" />
        </button>
        <button
          onClick={() => moveSection(index, 'down')}
          disabled={index === layoutOrder.length - 1}
          className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded cursor-pointer"
          title="Move Section Down"
        >
          <ArrowDown className="h-3 w-3" />
        </button>
        <button
          onClick={() => cycleTheme(sectionId)}
          className="p-1 hover:bg-slate-800 rounded cursor-pointer text-amber-400"
          title="Cycle Theme Style"
        >
          <Palette className="h-3 w-3" />
        </button>
        <button
          onClick={() => {
            const updated = [...hiddenSections, sectionId];
            saveHiddenSections(updated);
          }}
          className="p-1 hover:bg-slate-800 rounded cursor-pointer text-red-400"
          title="Hide Section"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Visual Customize Toolbar */}
      {isVisualEditMode && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between gap-4 text-amber-800 select-none">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span>🔧</span>
            <span><span className="font-bold">ERP Dashboard Visual Editor Active</span>: Shift panels, cycle theme paint brushes, or double-click headers to rewrite widget labels to match NetSuite-grade flexibility!</span>
          </div>
          <button
            onClick={resetLayoutToDefaults}
            className="px-3 py-1.5 bg-amber-500 text-white hover:bg-amber-600 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset Layout
          </button>
        </div>
      )}

      {/* Render layout items recursively based on customizable sequence order */}
      {layoutOrder.map((sectionId, index) => {
        if (hiddenSections.includes(sectionId)) return null;

        if (sectionId === 'welcome') {
          return (
            <div key="welcome" className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative group border border-transparent hover:border-indigo-400/30 rounded-2xl p-1">
              {renderControls('welcome', index)}
              {/* Welcome message card */}
              <div className={`${cardThemes['welcome'] || 'bg-[#0d1c38] text-white'} p-6 rounded-2xl flex flex-col justify-between shadow-xs relative overflow-hidden flex-1 lg:col-span-2 min-h-[220px]`}>
                <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">
                    Good Evening
                  </span>
                  {editingTitleKey === 'welcome' ? (
                    <div className="flex items-center gap-2 mt-1 z-50 relative">
                      <input
                        type="text"
                        value={editingTitleValue}
                        onChange={(e) => setEditingTitleValue(e.target.value)}
                        className="bg-slate-800 text-white text-xl font-bold rounded p-1.5 focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => saveTitleEdit('welcome')} className="p-1 bg-emerald-500 text-white rounded"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditingTitleKey(null)} className="p-1 bg-slate-700 text-white rounded"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <h1
                      onDoubleClick={() => {
                        if (isVisualEditMode) {
                          setEditingTitleKey('welcome');
                          setEditingTitleValue(customTitles['welcome']);
                        }
                      }}
                      className="text-2xl font-bold font-display tracking-tight mt-1 flex items-center gap-2 cursor-pointer"
                    >
                      <span>{customTitles['welcome']}</span>
                      {isVisualEditMode && <Edit3 className="h-4 w-4 text-indigo-400 opacity-50" />}
                    </h1>
                  )}
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                    <span>Monday, 06 July 2026</span>
                    <span className="h-1 w-1 rounded-full bg-slate-600"></span>
                    <span>{invoices.length} invoices today</span>
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <p className="text-[10px] text-slate-400 font-medium">Daily Target</p>
                      <p className="text-sm font-bold text-indigo-300 mt-1">65% Reached</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <p className="text-[10px] text-slate-400 font-medium">Active Warehouse</p>
                      <p className="text-sm font-bold text-emerald-400 mt-1">All Operational</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's revenue display with hide option */}
              <div className={`${cardThemes['today_revenue'] || 'bg-white border-slate-200/80'} border p-6 rounded-2xl shadow-sm flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                  <div>
                    {editingTitleKey === 'today_revenue' ? (
                      <div className="flex items-center gap-1 z-50 relative">
                        <input
                          type="text"
                          value={editingTitleValue}
                          onChange={(e) => setEditingTitleValue(e.target.value)}
                          className="bg-slate-100 text-xs font-bold rounded p-1 text-slate-700"
                        />
                        <button onClick={() => saveTitleEdit('today_revenue')} className="p-0.5 bg-emerald-500 text-white rounded"><Check className="h-3 w-3" /></button>
                      </div>
                    ) : (
                      <span
                        onDoubleClick={() => {
                          if (isVisualEditMode) {
                            setEditingTitleKey('today_revenue');
                            setEditingTitleValue(customTitles['today_revenue']);
                          }
                        }}
                        className="text-xs font-semibold text-slate-400 cursor-pointer flex items-center gap-1"
                      >
                        <span>{customTitles['today_revenue']}</span>
                        {isVisualEditMode && <Edit3 className="h-3 w-3 text-slate-400 opacity-40" />}
                      </span>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-2xl font-bold font-display">
                        {displayVal(totalRevenue)}
                      </span>
                      <button
                        onClick={() => setShowValues(!showValues)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title={showValues ? 'Hide values' : 'Show values'}
                      >
                        {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>0.0% vs yesterday</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-6">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">
                    Last 7 days trend
                  </span>
                  {/* Visual Mini Sparkline */}
                  <div className="h-10 w-full flex items-end gap-1.5 pt-2">
                    {sales7Days.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            i === sales7Days.length - 1 ? 'bg-indigo-600 h-8' : 'bg-slate-200 h-1.5 hover:bg-indigo-300'
                          }`}
                        ></div>
                        <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[9px] rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {d.date}: {formatCurrency(d.sales)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (sectionId === 'kpis') {
          return (
            <div key="kpis" className="relative group border border-transparent hover:border-indigo-400/30 rounded-2xl p-1">
              {renderControls('kpis', index)}
              {/* KPI Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Card 1 */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Today</span>
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-bold text-slate-800">{invoices.length}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Invoices Today</p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">This Month</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-bold text-slate-800">{displayVal(totalRevenue)}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Sales This Month</p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Catalog</span>
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-bold text-slate-800">{products.length}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Total Products</p>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Alert</span>
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  </div>
                  <div className="mt-3">
                    <p className={`text-xl font-bold ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {lowStockItems.length}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Low Stock Items</p>
                  </div>
                </div>

                {/* Card 5 */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Receivable</span>
                    <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-bold text-slate-800">{displayVal(totalReceivables)}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">To Collect</p>
                  </div>
                </div>

                {/* Card 6 */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Payable</span>
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-bold text-slate-800">{displayVal(totalPayables)}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">To Pay</p>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (sectionId === 'analytics') {
          return (
            <div key="analytics" className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative group border border-transparent hover:border-indigo-400/30 rounded-2xl p-1">
              {renderControls('analytics', index)}
              {/* Sales Trend Curved Line Chart */}
              <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-display">Performance</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Sales — Last 7 Days</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                    <span>Sales Value (৳)</span>
                  </div>
                </div>

                {/* Elegant Custom Vector Line Chart */}
                <div className="relative h-64 w-full">
                  <svg viewBox="0 0 700 240" className="w-full h-full">
                    <line x1="40" y1="20" x2="680" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <text x="30" y="24" className="text-[10px] font-mono fill-slate-400" textAnchor="end">৳25k</text>

                    <line x1="40" y1="70" x2="680" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                    <text x="30" y="74" className="text-[10px] font-mono fill-slate-400" textAnchor="end">৳20k</text>

                    <line x1="40" y1="120" x2="680" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                    <text x="30" y="124" className="text-[10px] font-mono fill-slate-400" textAnchor="end">৳15k</text>

                    <line x1="40" y1="170" x2="680" y2="170" stroke="#f1f5f9" strokeWidth="1" />
                    <text x="30" y="174" className="text-[10px] font-mono fill-slate-400" textAnchor="end">৳5k</text>

                    <line x1="40" y1="210" x2="680" y2="210" stroke="#cbd5e1" strokeWidth="1" />
                    <text x="30" y="214" className="text-[10px] font-mono fill-slate-400" textAnchor="end">৳0</text>

                    <path
                      d="M 40 210 C 146.6 210, 146.6 210, 253.2 210 C 359.8 210, 466.4 210, 573 210 C 620 210, 640 100, 680 100"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    <path
                      d="M 40 210 C 146.6 210, 146.6 210, 253.2 210 C 359.8 210, 466.4 210, 573 210 C 620 210, 640 100, 680 100 L 680 210 Z"
                      fill="url(#salesGrad)"
                      opacity="0.08"
                    />

                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {[
                      { x: 40, y: 210, val: 0, date: '30 Jun' },
                      { x: 146.6, y: 210, val: 0, date: '01 Jul' },
                      { x: 253.2, y: 210, val: 0, date: '02 Jul' },
                      { x: 359.8, y: 210, val: 0, date: '03 Jul' },
                      { x: 466.4, y: 210, val: 0, date: '04 Jul' },
                      { x: 573, y: 210, val: 0, date: '05 Jul' },
                      { x: 680, y: 100, val: totalRevenue, date: '06 Jul' },
                    ].map((pt, idx) => (
                      <g key={idx} className="cursor-pointer" onMouseEnter={() => setSalesHoverIndex(idx)} onMouseLeave={() => setSalesHoverIndex(null)}>
                        {salesHoverIndex === idx && (
                          <circle cx={pt.x} cy={pt.y} r="10" fill="#4f46e5" opacity="0.15" />
                        )}
                        <circle cx={pt.x} cy={pt.y} r="4.5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
                        <text x={pt.x} y="230" className="text-[10px] font-sans fill-slate-400 text-center" textAnchor="middle">
                          {pt.date}
                        </text>
                      </g>
                    ))}
                  </svg>

                  {salesHoverIndex !== null && (
                    <div
                      className="absolute bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-800 pointer-events-none transition-all duration-150 z-10"
                      style={{
                        left: `${(salesHoverIndex / 6) * 90 + 4}%`,
                        bottom: salesHoverIndex === 6 ? '55%' : '15%',
                      }}
                    >
                      <p className="font-bold text-slate-300">
                        {salesHoverIndex === 6 ? '06 Jul (Today)' : `${30 + salesHoverIndex} Jun`}
                      </p>
                      <p className="text-indigo-400 font-semibold mt-0.5">
                        {salesHoverIndex === 6 ? formatCurrency(totalRevenue) : '৳0.00'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Methods Circular Chart */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-display">Mix</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Payment Methods — 30d</p>
                </div>

                <div className="flex items-center justify-center py-6 relative">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="55" fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
                    <circle
                      cx="80"
                      cy="80"
                      r="55"
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="18"
                      strokeDasharray="345.5"
                      strokeDashoffset="69.1"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="55"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="18"
                      strokeDasharray="345.5"
                      strokeDashoffset="310.9"
                      className="transform rotate-72 origin-center"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center mt-3">
                    <span className="text-2xl font-bold text-slate-800 font-display">80%</span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Cash Pref</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-medium">Cash</span>
                      <span className="font-bold text-slate-800">80.0%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-medium">Credit</span>
                      <span className="font-bold text-slate-800">20.0%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (sectionId === 'shortcuts_recent') {
          return (
            <div key="shortcuts_recent" className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative group border border-transparent hover:border-indigo-400/30 rounded-2xl p-1">
              {renderControls('shortcuts_recent', index)}
              {/* Recent Sales table */}
              <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase">Activity</span>
                      {editingTitleKey === 'recent_sales' ? (
                        <div className="flex items-center gap-1 z-50 relative mt-1">
                          <input
                            type="text"
                            value={editingTitleValue}
                            onChange={(e) => setEditingTitleValue(e.target.value)}
                            className="bg-slate-50 text-xs font-bold rounded p-1 text-slate-700"
                          />
                          <button onClick={() => saveTitleEdit('recent_sales')} className="p-0.5 bg-emerald-500 text-white rounded"><Check className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <h3
                          onDoubleClick={() => {
                            if (isVisualEditMode) {
                              setEditingTitleKey('recent_sales');
                              setEditingTitleValue(customTitles['recent_sales']);
                            }
                          }}
                          className="text-sm font-bold text-slate-800 font-display mt-0.5 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{customTitles['recent_sales']}</span>
                          {isVisualEditMode && <Edit3 className="h-3.5 w-3.5 text-indigo-500 opacity-40" />}
                        </h3>
                      )}
                    </div>
                    <button
                      onClick={() => onTabChange('sales', 'invoices')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View all</span>
                      <span className="text-lg">→</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                          <th className="pb-3 uppercase tracking-wider">Invoice</th>
                          <th className="pb-3 uppercase tracking-wider">Customer</th>
                          <th className="pb-3 uppercase tracking-wider">Date</th>
                          <th className="pb-3 uppercase tracking-wider text-right">Amount</th>
                          <th className="pb-3 uppercase tracking-wider text-right">Payment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {invoices.slice(-4).reverse().map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 font-mono font-semibold text-indigo-600">{inv.invoiceNo}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-slate-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center border border-slate-200">
                                  {inv.customerName.charAt(0)}
                                </div>
                                <span className="font-medium text-slate-700">{inv.customerName}</span>
                              </div>
                            </td>
                            <td className="py-3 text-slate-500">{inv.date}</td>
                            <td className="py-3 text-right font-bold text-slate-800">{formatCurrency(inv.total)}</td>
                            <td className="py-3 text-right">
                              <span
                                className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                  inv.paymentMethod === 'Cash'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : inv.paymentMethod === 'Credit'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                }`}
                              >
                                {inv.paymentMethod}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {invoices.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                              No sales recorded yet today. Click "New Sale" to begin!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
                <span className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase">Shortcuts</span>
                {editingTitleKey === 'shortcuts' ? (
                  <div className="flex items-center gap-1 z-50 relative mt-1">
                    <input
                      type="text"
                      value={editingTitleValue}
                      onChange={(e) => setEditingTitleValue(e.target.value)}
                      className="bg-slate-50 text-xs font-bold rounded p-1 text-slate-700"
                    />
                    <button onClick={() => saveTitleEdit('shortcuts')} className="p-0.5 bg-emerald-500 text-white rounded"><Check className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <h3
                    onDoubleClick={() => {
                      if (isVisualEditMode) {
                        setEditingTitleKey('shortcuts');
                        setEditingTitleValue(customTitles['shortcuts']);
                      }
                    }}
                    className="text-sm font-bold text-slate-800 font-display mt-0.5 mb-5 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{customTitles['shortcuts']}</span>
                    {isVisualEditMode && <Edit3 className="h-3.5 w-3.5 text-indigo-500 opacity-40" />}
                  </h3>
                )}

                <div className="space-y-3">
                  <button
                    onClick={() => onTabChange('sales', 'pos')}
                    className="w-full flex items-center justify-between p-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-indigo-500/10 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-4.5 w-4.5" />
                      <span>New Sale (POS)</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => onTabChange('inventory', 'products')}
                    className="w-full flex items-center justify-between p-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-emerald-500/10 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <PlusCircle className="h-4.5 w-4.5" />
                      <span>Add Product</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => onTabChange('purchase', 'purchase_orders')}
                    className="w-full flex items-center justify-between p-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-sky-500/10 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <ArrowRightLeft className="h-4.5 w-4.5" />
                      <span>New Purchase Order</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => onTabChange('sales', 'customers')}
                    className="w-full flex items-center justify-between p-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-amber-500/10 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <UserPlus className="h-4.5 w-4.5" />
                      <span>Add Customer</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        }

        if (sectionId === 'alerts_outstanding') {
          return (
            <div key="alerts_outstanding" className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative group border border-transparent hover:border-indigo-400/30 rounded-2xl p-1">
              {renderControls('alerts_outstanding', index)}
              {/* Low Stock Alert */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Inventory</span>
                    {editingTitleKey === 'low_stock' ? (
                      <div className="flex items-center gap-1 z-50 relative mt-1">
                        <input
                          type="text"
                          value={editingTitleValue}
                          onChange={(e) => setEditingTitleValue(e.target.value)}
                          className="bg-slate-50 text-xs font-bold rounded p-1 text-slate-700"
                        />
                        <button onClick={() => saveTitleEdit('low_stock')} className="p-0.5 bg-emerald-500 text-white rounded"><Check className="h-3 w-3" /></button>
                      </div>
                    ) : (
                      <h3
                        onDoubleClick={() => {
                          if (isVisualEditMode) {
                            setEditingTitleKey('low_stock');
                            setEditingTitleValue(customTitles['low_stock']);
                          }
                        }}
                        className="text-sm font-bold text-slate-800 font-display mt-0.5 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{customTitles['low_stock']}</span>
                        {isVisualEditMode && <Edit3 className="h-3.5 w-3.5 text-indigo-500 opacity-40" />}
                      </h3>
                    )}
                  </div>
                  <span className="bg-slate-50 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
                    {lowStockItems.length} items
                  </span>
                </div>

                {lowStockItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle className="h-12 w-12 text-emerald-500 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-slate-700 mt-3">All items are well stocked!</p>
                    <p className="text-[10px] text-slate-400 mt-1">Excellent stock replenishment management.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                    {lowStockItems.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {p.sku} • {p.warehouse}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded">
                            {p.stock} {p.unit} left
                          </span>
                          <p className="text-[9px] text-slate-400 mt-1">Alert threshold: {p.alertQty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ledger / Outstanding Payments */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Ledger</span>
                    {editingTitleKey === 'outstanding' ? (
                      <div className="flex items-center gap-1 z-50 relative mt-1">
                        <input
                          type="text"
                          value={editingTitleValue}
                          onChange={(e) => setEditingTitleValue(e.target.value)}
                          className="bg-slate-50 text-xs font-bold rounded p-1 text-slate-700"
                        />
                        <button onClick={() => saveTitleEdit('outstanding')} className="p-0.5 bg-emerald-500 text-white rounded"><Check className="h-3 w-3" /></button>
                      </div>
                    ) : (
                      <h3
                        onDoubleClick={() => {
                          if (isVisualEditMode) {
                            setEditingTitleKey('outstanding');
                            setEditingTitleValue(customTitles['outstanding']);
                          }
                        }}
                        className="text-sm font-bold text-slate-800 font-display mt-0.5 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{customTitles['outstanding']}</span>
                        {isVisualEditMode && <Edit3 className="h-3.5 w-3.5 text-indigo-500 opacity-40" />}
                      </h3>
                    )}
                  </div>
                  <HelpCircle className="h-4 w-4 text-slate-300 hover:text-slate-400 cursor-pointer" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold">Receivable</span>
                    </div>
                    <p className="text-xl font-black text-slate-800 font-display mt-3">
                      {displayVal(totalReceivables)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Amount to collect from customers</p>
                  </div>

                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl">
                    <div className="flex items-center gap-2 text-rose-700">
                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                      <span className="text-xs font-bold">Payable</span>
                    </div>
                    <p className="text-xl font-black text-slate-800 font-display mt-3">
                      {displayVal(totalPayables)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Amount to pay suppliers</p>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}

      {/* Invisible spacer row at the very bottom to allow scrolling when toolbar is active */}
      <div className="h-10"></div>
    </div>
  );
}
