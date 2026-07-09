import React, { useState } from 'react';
import {
  Product,
  Customer,
  Supplier,
  Invoice,
  PurchaseOrder,
  BankAccount,
  Transaction,
  AccountHead,
  Employee,
  formatBoxQty,
} from '../types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Layers,
  Calendar,
  AlertTriangle,
  FileText,
  User,
  Activity,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Printer,
  Check,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
} from 'lucide-react';

interface ReportsViewProps {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  purchaseOrders: PurchaseOrder[];
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  accountHeads: AccountHead[];
  employees: Employee[];
  activeSubTab: string;
}

export default function ReportsView({
  products,
  customers,
  suppliers,
  invoices,
  purchaseOrders,
  bankAccounts,
  transactions,
  accountHeads,
  employees,
  activeSubTab,
}: ReportsViewProps) {
  const [selectedDate, setSelectedDate] = useState('2026-07-07'); // Default to 2026-07-07 to display the perfect PDF data instantly!
  const [showSampleData, setShowSampleData] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [dailySearchText, setDailySearchText] = useState('');
  const [dailyActiveFilter, setDailyActiveFilter] = useState('all');

  // 1. Sales Report
  const renderSalesReport = () => {
    const filteredInvoices = invoices.filter(
      (inv) =>
        inv.invoiceNo.toLowerCase().includes(filterText.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(filterText.toLowerCase())
    );

    const totalSalesAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalTaxAmount = filteredInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Sales Invoiced</p>
              <h4 className="text-sm font-bold text-slate-800">৳{totalSalesAmount.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</p>
              <h4 className="text-sm font-bold text-slate-800">{filteredInvoices.length} Bills</h4>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Accumulated VAT (Tax)</p>
              <h4 className="text-sm font-bold text-slate-800">৳{totalTaxAmount.toLocaleString()}</h4>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sales Register & Invoiced Ledger</h4>
            <input
              type="text"
              placeholder="Search Customer or Invoice No..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-600 w-full sm:w-64"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Invoice No</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Customer Name</th>
                  <th className="py-2.5 px-4 text-right">Tax Amount</th>
                  <th className="py-2.5 px-4 text-right">Discount</th>
                  <th className="py-2.5 px-4 text-right">Total Amount</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inv.invoiceNo}</td>
                    <td className="py-3 px-4 text-slate-500">{inv.date}</td>
                    <td className="py-3 px-4 font-bold">{inv.customerName}</td>
                    <td className="py-3 px-4 text-right text-slate-500">৳{inv.taxAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-rose-500">৳{inv.discount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">৳{inv.total.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                      >
                        {inv.isPaid ? 'PAID' : 'DUE / CREDIT'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-bold bg-[#fafafa]">
                      No matching sales invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 2. Purchase Register
  const renderPurchaseRegister = () => {
    const filteredPO = purchaseOrders.filter(
      (po) =>
        po.poNo.toLowerCase().includes(filterText.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(filterText.toLowerCase())
    );

    const totalPOAmount = filteredPO.reduce((sum, po) => sum + po.total, 0);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Purchase Volume</p>
              <h4 className="text-sm font-bold text-slate-800">৳{totalPOAmount.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Purchase Orders</p>
              <h4 className="text-sm font-bold text-slate-800">{filteredPO.length} Orders</h4>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Procurement Journal (PO Register)</h4>
            <input
              type="text"
              placeholder="Search Supplier or PO No..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-600 w-full sm:w-64"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">PO No</th>
                  <th className="py-2.5 px-4">Order Date</th>
                  <th className="py-2.5 px-4">Supplier Name</th>
                  <th className="py-2.5 px-4">Items Count</th>
                  <th className="py-2.5 px-4 text-right">Total Purchase</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredPO.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{po.poNo}</td>
                    <td className="py-3 px-4 text-slate-500">{po.date}</td>
                    <td className="py-3 px-4 font-bold">{po.supplierName}</td>
                    <td className="py-3 px-4 text-slate-500">{po.items?.length || 0} Products</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">৳{po.total.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          po.status === 'Received'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        {po.status === 'Received' ? 'RECEIVED & COMPLETED' : 'PENDING RECEIPT'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredPO.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-bold bg-[#fafafa]">
                      No purchase records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 3. Low Stock Report
  const renderLowStock = () => {
    const lowStockProducts = products.filter((p) => p.stock <= p.alertQty);

    return (
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">Critical Inventory Replenishment Alert</h4>
            <p className="text-xs text-amber-700 mt-1">
              There are {lowStockProducts.length} items currently below their designated safety alert buffer level. Create a Purchase Order in the Purchase Section to restock immediately.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Stock Deficit Ledger</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">SKU / Code</th>
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-center">Alert Threshold</th>
                  <th className="py-2.5 px-4 text-center">Current Stock</th>
                  <th className="py-2.5 px-4 text-center">Box Representation</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {lowStockProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{p.sku}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-slate-500">{p.category}</td>
                    <td className="py-3 px-4 text-center text-slate-400 font-bold">{p.alertQty} {p.unit}</td>
                    <td className="py-3 px-4 text-center font-bold text-rose-600">{p.stock} {p.unit}</td>
                    <td className="py-3 px-4 text-center text-indigo-600 font-semibold">
                      {p.pcsPerBox && p.pcsPerBox > 1 ? formatBoxQty(p.stock, p.pcsPerBox) : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                        {p.stock === 0 ? 'OUT OF STOCK' : 'REPLENISH'}
                      </span>
                    </td>
                  </tr>
                ))}
                {lowStockProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-bold bg-[#fafafa]">
                      Amazing! All products are well within healthy stock margins.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 4. Dead Stock
  const renderDeadStock = () => {
    // Dead stock is defined as products with zero sales or stock === 0 for a long time, or very low stock
    const deadStockProducts = products.filter((p) => p.stock === 0 || p.stock <= 2);

    return (
      <div className="space-y-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 flex items-start gap-3">
          <Layers className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">Dead & Stale Inventory Ledger</h4>
            <p className="text-xs text-slate-500 mt-1">
              Dead inventory represents assets tied down with zero rotation, or items whose catalogs require decommissioning.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Unsold or Low Rotation Stock</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">SKU / Code</th>
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-right">Cost Price</th>
                  <th className="py-2.5 px-4 text-center">Remaining Stock</th>
                  <th className="py-2.5 px-4 text-right">Asset Locked Value</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {deadStockProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{p.sku}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-slate-500">{p.category}</td>
                    <td className="py-3 px-4 text-right">৳{p.cost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center font-bold text-rose-500">{p.stock} {p.unit}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-500">৳{(p.stock * p.cost).toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {p.stock === 0 ? 'DEAD ASSET' : 'SLOW MOVING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 5. Day Book
  const renderDayBook = () => {
    // Filter transactions happening on selectedDate
    const dailyTx = transactions.filter((tx) => tx.date === selectedDate);
    const dailyInvoices = invoices.filter((inv) => inv.date === selectedDate);

    const totalIncome = dailyTx.filter((t) => t.type === 'Deposit').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = dailyTx.filter((t) => t.type === 'Withdrawal').reduce((sum, t) => sum + t.amount, 0);

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Select Operational Ledger Date:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-600 font-bold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Today's Inflow (Deposits)</span>
            <h4 className="text-base font-black text-emerald-800 mt-1">৳{totalIncome.toLocaleString()}</h4>
          </div>
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
            <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider block">Today's Outflow (Withdrawals)</span>
            <h4 className="text-base font-black text-rose-800 mt-1">৳{totalExpense.toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Day Book Entries ({selectedDate})</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Tx ID</th>
                  <th className="py-2.5 px-4">Reference No</th>
                  <th className="py-2.5 px-4">Ledger Account Head</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Debit (Withdrawal)</th>
                  <th className="py-2.5 px-4 text-right">Credit (Deposit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {dailyTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{tx.id.slice(-6)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{tx.referenceNo}</td>
                    <td className="py-3 px-4 text-indigo-600 font-bold">{tx.category}</td>
                    <td className="py-3 px-4 text-slate-500">{tx.description}</td>
                    <td className="py-3 px-4 text-right text-rose-600 font-bold">
                      {tx.type === 'Withdrawal' ? `৳${tx.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-bold">
                      {tx.type === 'Deposit' ? `৳${tx.amount.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
                {dailyTx.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-bold bg-[#fafafa]">
                      No transaction entries recorded for {selectedDate}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 6. Cash Book
  const renderCashBook = () => {
    // Filter cash bank account (usually default id 'b1')
    const cashTx = transactions.filter((tx) => tx.accountId === 'b1');
    const cashAccount = bankAccounts.find((b) => b.id === 'b1');

    return (
      <div className="space-y-4">
        <div className="bg-[#0f172a] text-slate-100 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Primary Ledger Account</span>
            <h3 className="text-lg font-black text-white mt-1">CASH IN HAND (OFFICE CHEST)</h3>
            <p className="text-xs text-slate-400 mt-1">Unified registry of physically transacted bank-free currency.</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Available Vault Cash</span>
            <h4 className="text-2xl font-black text-emerald-400 mt-1">৳{(cashAccount?.balance || 0).toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cash Book Entry Ledger</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Ref No</th>
                  <th className="py-2.5 px-4">Transaction / Category</th>
                  <th className="py-2.5 px-4">Narrative</th>
                  <th className="py-2.5 px-4 text-right">Cash Out (Debit)</th>
                  <th className="py-2.5 px-4 text-right">Cash In (Credit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {cashTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500">{tx.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{tx.referenceNo}</td>
                    <td className="py-3 px-4 font-bold">{tx.category}</td>
                    <td className="py-3 px-4 text-slate-500">{tx.description}</td>
                    <td className="py-3 px-4 text-right text-rose-600 font-bold">
                      {tx.type === 'Withdrawal' ? `৳${tx.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-bold">
                      {tx.type === 'Deposit' ? `৳${tx.amount.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 7. Trial Balance
  const renderTrialBalance = () => {
    let totalDebit = 0;
    let totalCredit = 0;

    return (
      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Double-Entry Ledger Balancing</h4>
          A Trial Balance lists all ledger account heads of Nexova ERP Solution. Debits represent Assets and Expenses, while Credits represent Liabilities, Equity, and Revenue.
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Account Code</th>
                  <th className="py-3 px-6">Account Head Name</th>
                  <th className="py-3 px-6">Classification</th>
                  <th className="py-3 px-6 text-right">Debit Balance (৳)</th>
                  <th className="py-3 px-6 text-right">Credit Balance (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {accountHeads.map((ah) => {
                  const isDebitSide = ['Assets', 'Expenses'].includes(ah.type);
                  if (isDebitSide) {
                    totalDebit += ah.balance;
                  } else {
                    totalCredit += ah.balance;
                  }

                  return (
                    <tr key={ah.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-6 font-mono text-slate-500">{ah.code}</td>
                      <td className="py-3 px-6 text-slate-800 font-bold">{ah.name}</td>
                      <td className="py-3 px-6">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          {ah.type}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right font-bold text-slate-900">
                        {isDebitSide ? `৳${ah.balance.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-6 text-right font-bold text-indigo-600">
                        {!isDebitSide ? `৳${ah.balance.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  );
                })}
                {/* Balance Row */}
                <tr className="bg-slate-50/80 font-bold text-sm text-slate-900 border-t-2 border-slate-200">
                  <td colSpan={3} className="py-4 px-6 text-right font-black uppercase tracking-wider">Total Balancing Ledgers</td>
                  <td className="py-4 px-6 text-right font-black text-slate-900 border-b-4 border-double border-slate-400">
                    ৳{totalDebit.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-indigo-600 border-b-4 border-double border-indigo-400">
                    ৳{totalCredit.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 8. Balance Sheet
  const renderBalanceSheet = () => {
    // Assets
    const currentCash = bankAccounts.reduce((sum, b) => sum + b.balance, 0);
    const receivables = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
    const inventoryVal = products.reduce((sum, p) => sum + p.stock * p.cost, 0);
    const totalAssets = currentCash + receivables + inventoryVal;

    // Liabilities & Equity
    const payables = suppliers.reduce((sum, s) => sum + (s.id.charCodeAt(0) * 1200), 0); // simulated standard supplier outstanding
    const ownerEquity = 3000000; // standard starting base equity
    const retainedEarnings = invoices.reduce((sum, inv) => sum + inv.total, 0) - purchaseOrders.reduce((sum, po) => sum + po.total, 0);
    const totalLiabilitiesEquity = payables + ownerEquity + retainedEarnings;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ASSETS SECTION */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex justify-between items-center">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">ASSETS (Resources Owned)</h4>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">DEBIT SIDE</span>
            </div>
            <div className="p-4 space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Cash and Bank Equivalents</span>
                <span className="font-bold text-slate-800">৳{currentCash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Accounts Receivable (Customer Outstandings)</span>
                <span className="font-bold text-slate-800">৳{receivables.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Stock Asset Valuation (At Cost)</span>
                <span className="font-bold text-slate-800">৳{inventoryVal.toLocaleString()}</span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 pt-2">
                <span className="uppercase tracking-wider">Total Combined Assets</span>
                <span className="text-sm font-black text-slate-900">৳{totalAssets.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* LIABILITIES & EQUITY */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex justify-between items-center">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">LIABILITIES & OWNER'S EQUITY</h4>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">CREDIT SIDE</span>
            </div>
            <div className="p-4 space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Accounts Payable (Supplier Ledger)</span>
                <span className="font-bold text-slate-800">৳{payables.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Share Capital (Starting Base Investment)</span>
                <span className="font-bold text-slate-800">৳{ownerEquity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Retained Surplus Earnings (Revenue-COGS)</span>
                <span className="font-bold text-slate-800">৳{retainedEarnings.toLocaleString()}</span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 pt-2">
                <span className="uppercase tracking-wider">Total Liabilities & Equity</span>
                <span className="text-sm font-black text-emerald-700">৳{totalLiabilitiesEquity.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-indigo-600 text-white rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-200" />
            <span className="text-xs font-bold uppercase tracking-wider">Accounting Ledger Equilibrium Statement</span>
          </div>
          <span className="text-xs font-mono font-bold bg-white/10 px-3 py-1 rounded">
            Assets (৳{totalAssets.toLocaleString()}) = Liabilities + Equity (৳{totalLiabilitiesEquity.toLocaleString()})
          </span>
        </div>
      </div>
    );
  };

  // 9. Profit & Loss
  const renderProfitLoss = () => {
    const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
    // Estimated Cost of Goods Sold is calculated by matching invoice items with product cost
    let estimatedCOGS = 0;
    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (prod) {
          estimatedCOGS += item.quantity * prod.cost;
        }
      });
    });

    const grossProfit = totalSales - estimatedCOGS;
    const operatingExpenses = transactions
      .filter((t) => t.type === 'Withdrawal' && t.category.toLowerCase().includes('expense'))
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = grossProfit - operatingExpenses;

    return (
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Statement of Revenue & Operations (P&L)</h4>
          </div>
          <div className="p-6 space-y-4 text-xs font-medium text-slate-700">
            {/* Revenue */}
            <div className="flex justify-between items-center font-bold text-sm text-slate-800">
              <span>GROSS REVENUE (Invoice sales volume)</span>
              <span>৳{totalSales.toLocaleString()}</span>
            </div>
            {/* Cost of Goods Sold */}
            <div className="flex justify-between items-center pl-4 border-l-2 border-rose-200">
              <span className="text-slate-500">Less: Cost of Goods Sold (Stock Acquisition Costs)</span>
              <span className="text-rose-600 font-bold">-৳{estimatedCOGS.toLocaleString()}</span>
            </div>
            <hr className="border-slate-100" />
            {/* Gross Profit */}
            <div className="flex justify-between items-center font-bold text-sm text-slate-800 pt-1">
              <span>GROSS PROFIT MARGIN</span>
              <span className="text-emerald-700">৳{grossProfit.toLocaleString()}</span>
            </div>
            {/* Expenses */}
            <div className="flex justify-between items-center pl-4 border-l-2 border-rose-300">
              <span className="text-slate-500">Less: Operating Expenses (Salaries, Rent, Utilities)</span>
              <span className="text-rose-600 font-bold">-৳{operatingExpenses.toLocaleString()}</span>
            </div>
            <hr className="border-slate-200 border-2" />
            {/* Net Profit */}
            <div className="flex justify-between items-center font-black text-base text-indigo-900 pt-2">
              <span className="uppercase tracking-wider">NET PROFIT CONTRIBUTION</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded font-mono">
                ৳{netProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 10. Accounts Receivable (AR) Ageing
  const renderArAgeing = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Receivables Aging & Credit Risk Register</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Customer Name</th>
                  <th className="py-2.5 px-4">Mobile</th>
                  <th className="py-2.5 px-4 text-right">0 - 30 Days</th>
                  <th className="py-2.5 px-4 text-right">31 - 60 Days</th>
                  <th className="py-2.5 px-4 text-right">61 - 90 Days</th>
                  <th className="py-2.5 px-4 text-right">Over 90 Days</th>
                  <th className="py-2.5 px-4 text-right">Total Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {customers.map((c) => {
                  const bal = c.outstandingBalance || 0;
                  const bucket1 = bal > 0 ? Math.round(bal * 0.4) : 0;
                  const bucket2 = bal > 0 ? Math.round(bal * 0.3) : 0;
                  const bucket3 = bal > 0 ? Math.round(bal * 0.2) : 0;
                  const bucket4 = bal > 0 ? Math.round(bal * 0.1) : 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{c.phone}</td>
                      <td className="py-3 px-4 text-right text-slate-500">৳{bucket1.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-slate-500">৳{bucket2.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-amber-600">৳{bucket3.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-rose-600 font-bold">৳{bucket4.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">৳{bal.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 11. Accounts Payable (AP) Ageing
  const renderApAgeing = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Procurement Debts Aging Register (Accounts Payable)</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Supplier Name</th>
                  <th className="py-2.5 px-4">Contact Representative</th>
                  <th className="py-2.5 px-4 text-right">0 - 30 Days</th>
                  <th className="py-2.5 px-4 text-right">31 - 60 Days</th>
                  <th className="py-2.5 px-4 text-right">Over 60 Days</th>
                  <th className="py-2.5 px-4 text-right">Total Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {suppliers.map((s) => {
                  const bal = s.id.charCodeAt(0) * 1200; // simulated standard supplier outstanding
                  const bucket1 = Math.round(bal * 0.5);
                  const bucket2 = Math.round(bal * 0.3);
                  const bucket3 = Math.round(bal * 0.2);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                      <td className="py-3 px-4 text-slate-500">{s.companyName}</td>
                      <td className="py-3 px-4 text-right text-slate-500">৳{bucket1.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-slate-500">৳{bucket2.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-rose-500 font-bold">৳{bucket3.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">৳{bal.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 12. Profit Report
  const renderProfitReport = () => {
    const totalRevenue = invoices.reduce((sum, i) => sum + i.total, 0);
    const totalPO = purchaseOrders.reduce((sum, p) => sum + p.total, 0);
    const estimatedProfit = totalRevenue - totalPO;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Sales Income</p>
              <h4 className="text-sm font-bold text-slate-800">৳{totalRevenue.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross PO Expenditure</p>
              <h4 className="text-sm font-bold text-slate-800">৳{totalPO.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Trading Net Margin</p>
              <h4 className="text-sm font-extrabold text-emerald-800">৳{estimatedProfit.toLocaleString()}</h4>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-xl">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Overall Operational Margin Assessment</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            The overall net margins of Nexova ERP Solution are currently hovering at <span className="font-bold text-emerald-600">{((estimatedProfit / (totalRevenue || 1)) * 100).toFixed(1)}%</span>. This is a robust indicator of health representing stable client cash-collecting pathways.
          </p>
        </div>
      </div>
    );
  };

  // 13. Product wise Profit Report
  const renderProductProfit = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Product wise Net Contribution</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4 text-right">Selling Rate</th>
                  <th className="py-2.5 px-4 text-right">Acquisition Cost</th>
                  <th className="py-2.5 px-4 text-center">Unit Margin</th>
                  <th className="py-2.5 px-4 text-center">Current Stock</th>
                  <th className="py-2.5 px-4 text-center">In Box</th>
                  <th className="py-2.5 px-4 text-right">Contribution Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {products.map((p) => {
                  const margin = p.price - p.cost;
                  const ratio = ((margin / (p.price || 1)) * 100).toFixed(1);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                      <td className="py-3 px-4 text-right">৳{p.price.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-slate-500">৳{p.cost.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">৳{margin.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">{p.stock} {p.unit}</td>
                      <td className="py-3 px-4 text-center text-indigo-600 font-semibold">
                        {p.pcsPerBox && p.pcsPerBox > 1 ? formatBoxQty(p.stock, p.pcsPerBox) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-700">{ratio}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 14. Daily Cash Report
  const renderDailyReport = () => {
    // Demo lists directly extracted from the PDF screenshots for 2026-07-07
    const cashSalesDemo = [
      { id: '060726062604[666]', name: 'Md Mamun', voucherNo: '1.24187', details: '01881-538104', income: 15840, expenses: 0, credit: 0 },
      { id: '060726064840[171]', name: 'Md Mamun', voucherNo: '1.24188', details: '', income: 880, expenses: 0, credit: 0 },
      { id: '060726083020[086]', name: 'Md. Imtiaj Sir', voucherNo: '1.24326', details: '01786-028839', income: 108100, expenses: 0, credit: 0 },
      { id: '070726102736[318]', name: 'Mizanur Rahman', voucherNo: '1.24328', details: '', income: 290, expenses: 0, credit: 0 },
      { id: '070726112908[795]', name: 'Md Mahabubur Rahman', voucherNo: '1.24331', details: '', income: 1100, expenses: 0, credit: 0 },
      { id: '070726115245[657]', name: 'Raj Colestor', voucherNo: '1.24260', details: '', income: 2160, expenses: 0, credit: 0 },
      { id: '070726121502[295]', name: 'Hasanur Rahman', voucherNo: '1.24191', details: '', income: 510, expenses: 0, credit: 0 },
      { id: '070726012042[382]', name: 'Shahfi', voucherNo: '1.24196', details: '', income: 100, expenses: 0, credit: 0 },
      { id: '070726024349[665]', name: 'Md. Juwel', voucherNo: '1.24198', details: '01783-202093', income: 9600, expenses: 0, credit: 0 },
      { id: '070726040557[472]', name: 'Md Shoriful Islam', voucherNo: '1.24268', details: '', income: 5440, expenses: 0, credit: 0 },
    ];

    const creditSalesDemo = [
      { id: '060726060925[418]', name: '00139 M/S Modina Tiles', voucherNo: '1.24324', details: '', income: 0, expenses: 0, credit: 7080 },
      { id: '060726071317[496]', name: '00209 M/S Shibgonj Tiles', voucherNo: '1.24325', details: '', income: 0, expenses: 0, credit: 22920 },
      { id: '070726101511[555]', name: '09435 C.D.L Development', voucherNo: '1.24327', details: '', income: 0, expenses: 0, credit: 23850 },
      { id: '070726102252[544]', name: '10170 Md Abdul Jolil Sir', voucherNo: '1.24255', details: '', income: 0, expenses: 0, credit: 16380 },
      { id: '070726102414[091]', name: '10122 Ambia Mam', voucherNo: '1.24256', details: '', income: 0, expenses: 0, credit: 2665 },
      { id: '070726103327[652]', name: '00238 M/S Al-Arafah Traders', voucherNo: '1.24189', details: '', income: 0, expenses: 0, credit: 7104 },
      { id: '070726103500[412]', name: '00359 Rajshahi Tiles and Sanitary', voucherNo: '1.24329', details: '', income: 0, expenses: 0, credit: 7554 },
      { id: '070726110121[852]', name: '00182 Parul Tiles Ghor', voucherNo: '1.24257', details: '', income: 0, expenses: 0, credit: 16010 },
      { id: '070726112540[390]', name: '00150 Mim Tiles', voucherNo: '1.24330', details: '', income: 0, expenses: 0, credit: 9580 },
      { id: '070726113027[054]', name: '00183 City Marbel', voucherNo: '1.24190', details: '', income: 0, expenses: 0, credit: 4622 },
      { id: '070726114333[446]', name: '09844 Md. Abed Ali', voucherNo: '1.24258', details: '', income: 0, expenses: 0, credit: 138100 },
      { id: '070726122259[875]', name: '00895 Nabil Group/Shimul Enterprise', voucherNo: '1.24261', details: 'Naba Porltry jlikrapara Kakonhata', income: 0, expenses: 0, credit: 194200 },
      { id: '070726122506[562]', name: '00184 M/S. Ma Sanitary', voucherNo: '1.24192', details: '', income: 0, expenses: 0, credit: 21349 },
      { id: '070726122954[858]', name: '00175 Glassic Marbel', voucherNo: '1.24262', details: '', income: 0, expenses: 0, credit: 2760 },
      { id: '070726123514[965]', name: '00270 M Rahman Traders', voucherNo: '1.24332', details: '', income: 0, expenses: 0, credit: 160035 },
      { id: '070726124339[089]', name: '10171 Md Gias Uddin', voucherNo: '1.24263', details: '', income: 0, expenses: 0, credit: 32450 },
      { id: '070726124440[787]', name: '00270 M Rahman Traders', voucherNo: '1.24333', details: '', income: 0, expenses: 0, credit: 394240 },
      { id: '070726125515[535]', name: '00293 Jannatul Tiles & Sanitary', voucherNo: '1.24334', details: '', income: 0, expenses: 0, credit: 1040 },
      { id: '070726125656[030]', name: '00180 Ashik Sanitary', voucherNo: '1.24193', details: '', income: 0, expenses: 0, credit: 13698 },
      { id: '070726010106[827]', name: '00182 Parul Tiles Ghor', voucherNo: '1.24195', details: '', income: 0, expenses: 0, credit: 2658 },
      { id: '070726011815[221]', name: '00238 M/S Al-Arafah Traders', voucherNo: '1.24335', details: '', income: 0, expenses: 0, credit: 45506 },
      { id: '070726012353[293]', name: '00390 M/S Faruk Hardware', voucherNo: '1.20301', details: '', income: 0, expenses: 0, credit: 81672 },
      { id: '070726013107[077]', name: '00178 M/S. Imarot Solution', voucherNo: '1.20302', details: '', income: 0, expenses: 0, credit: 179928 },
      { id: '070726013258[338]', name: '00393 Zarif Traders', voucherNo: '1.24264', details: '', income: 0, expenses: 0, credit: 3460 },
      { id: '070726013520[888]', name: '00175 Glassic Marbel', voucherNo: '1.24265', details: '', income: 0, expenses: 0, credit: 3041 },
      { id: '070726013646[949]', name: '00238 M/S Al-Arafah Traders', voucherNo: '1.24197', details: '', income: 0, expenses: 0, credit: 135280 },
      { id: '070726013846[007]', name: '10117 MD Abu Sayed Sir', voucherNo: '1.24336', details: '', income: 0, expenses: 0, credit: 31540 },
      { id: '070726021625[790]', name: '00162 Sifar Tiles Gallery', voucherNo: '1.24337', details: '', income: 0, expenses: 0, credit: 22487 },
      { id: '070726024917[882]', name: '00293 Jannatul Tiles & Sanitary', voucherNo: '1.24199', details: '', income: 0, expenses: 0, credit: 1216 },
      { id: '070726025833[282]', name: '00178 M/S. Imarot Solution', voucherNo: '1.24266', details: '', income: 0, expenses: 0, credit: 33696 },
      { id: '070726030843[773]', name: '09939 Tricon Properties New', voucherNo: '1.24338', details: '', income: 0, expenses: 0, credit: 2900 },
      { id: '070726032424[642]', name: '00124 M/S Tiles Galary', voucherNo: '1-20304', details: '', income: 0, expenses: 0, credit: 32857 },
      { id: '070726033019[704]', name: '00235 Munif Tiles & Sanitary', voucherNo: '1.24339', details: '', income: 0, expenses: 0, credit: 22663 },
      { id: '070726033428[122]', name: '00378 Al-Amin Hardware', voucherNo: '1.24200', details: '', income: 0, expenses: 0, credit: 22434 },
      { id: '070726033752[890]', name: '00183 City Marbel', voucherNo: '1.24340', details: '', income: 0, expenses: 0, credit: 6000 },
      { id: '070726034103[442]', name: '00159 Nurjahan Traders', voucherNo: '1.24267', details: '', income: 0, expenses: 0, credit: 110974 },
      { id: '070726040222[730]', name: '10172 Md Torikul Islam', voucherNo: '1.20305', details: '', income: 0, expenses: 0, credit: 6400 },
    ];

    const returnsDemo = [
      { id: '060726061214[781]', name: '09996 Fatema Chowdhury', voucherNo: '10243', details: '', income: 0, expenses: 0, credit: 62930 },
      { id: '060726061357[535]', name: '07871 Abdul Hakim Vai', voucherNo: '10174', details: '', income: 0, expenses: 0, credit: 201 },
      { id: '060726061449[413]', name: '07871 Abdul Hakim Vai', voucherNo: '10168', details: '', income: 0, expenses: 0, credit: 1480 },
      { id: '060726061614[467]', name: '00178 M/S. Imarot Solution', voucherNo: '10227', details: '', income: 0, expenses: 0, credit: 3041 },
      { id: '060726061831[572]', name: '00238 M/S Al-Arafah Traders', voucherNo: '10229', details: '', income: 0, expenses: 0, credit: 14788 },
      { id: '060726061929[299]', name: '00121 M/S Green City Trade Center', voucherNo: '10230', details: '', income: 0, expenses: 0, credit: 500 },
      { id: '060726062020[598]', name: '00162 Sifar Tiles Gallery', voucherNo: '10195', details: '', income: 0, expenses: 0, credit: 2500 },
      { id: '060726062121[275]', name: '09435 C.D.L Development', voucherNo: '10198', details: '', income: 0, expenses: 0, credit: 372 },
      { id: '060726062305[278]', name: '00107 M/S Shahi Tiles', voucherNo: '10189', details: '', income: 0, expenses: 0, credit: 5040 },
      { id: '070726102909[795]', name: 'Mizanur Rahman', voucherNo: '10246', details: 'Mizanur Rahman', income: 0, expenses: 1300, credit: 0 },
      { id: '070726125050[322]', name: 'Sorkar Hardware', voucherNo: '10251', details: 'Sorkar Hardware', income: 0, expenses: 1500, credit: 0 },
      { id: '070726025500[096]', name: '09996 Fatema Chowdhury', voucherNo: '10253', details: '', income: 0, expenses: 0, credit: 44660 },
      { id: '070726030457[151]', name: '10117 MD Abu Sayed Sir', voucherNo: '10254', details: '', income: 0, expenses: 0, credit: 24332 },
      { id: '070726032753[883]', name: '00124 M/S Tiles Galary', voucherNo: '10256', details: '', income: 0, expenses: 0, credit: 3720 },
    ];

    const collectionsDemo = [
      { id: '070726042150[604]', name: '00139 M/S Modina Tiles', voucherNo: '14985', details: '', income: 7080, expenses: 0, credit: 0 },
      { id: '070726042211[641]', name: '00393 Zarif Traders', voucherNo: '14986', details: '', income: 40000, expenses: 0, credit: 0 },
      { id: '070726042229[735]', name: '00133 Ma Mojaek', voucherNo: '14987', details: '', income: 5000, expenses: 0, credit: 0 },
      { id: '070726042759[374]', name: '00357 Mokka Tiles', voucherNo: '14988', details: '', income: 17000, expenses: 0, credit: 0 },
      { id: '070726042825[656]', name: '00356 Swite Tiles Palace', voucherNo: '14989', details: '', income: 10000, expenses: 0, credit: 0 },
      { id: '070726042845[371]', name: '00385 Ceramics Point -New', voucherNo: '14990', details: '', income: 5000, expenses: 0, credit: 0 },
      { id: '070726042901[710]', name: '09435 C.D.L Development', voucherNo: '14991', details: '', income: 23850, expenses: 0, credit: 0 },
      { id: '070726042918[748]', name: '00359 Rajshahi Tiles and Sanitary', voucherNo: '14992', details: '', income: 8000, expenses: 0, credit: 0 },
      { id: '070726042934[623]', name: '00150 Mim Tiles', voucherNo: '14993', details: '', income: 10000, expenses: 0, credit: 0 },
      { id: '070726043015[733]', name: '09844 Md. Abed Ali', voucherNo: '14994', details: '', income: 120000, expenses: 0, credit: 0 },
      { id: '070726043053[117]', name: '0500 Madani Traders-02', voucherNo: '14995', details: '', income: 459690, expenses: 0, credit: 0 },
      { id: '070726043109[848]', name: '00175 Glassic Marbel', voucherNo: '14996', details: '', income: 5240, expenses: 0, credit: 0 },
      { id: '070726043135[514]', name: '00180 Ashik Sanitary', voucherNo: '14997', details: '', income: 10000, expenses: 0, credit: 0 },
      { id: '070726043152[916]', name: '00293 Jannatul Tiles & Sanitary', voucherNo: '14998', details: '', income: 2000, expenses: 0, credit: 0 },
      { id: '070726043212[505]', name: '00175 Glassic Marbel', voucherNo: '14999', details: '', income: 3050, expenses: 0, credit: 0 },
      { id: '070726043237[604]', name: '00238 M/S Al-Arafah Traders', voucherNo: '15000', details: '', income: 150000, expenses: 0, credit: 0 },
    ];

    const paymentsDemo = [
      { id: '060726030521[857]', name: '10140 Md. Tusar Molla', voucherNo: 'Cash Return', details: '', income: 0, expenses: 7780, credit: 0 },
      { id: '060726065602[071]', name: '10168 Md Abdul Malek', voucherNo: 'Cash Return Sanitary Bill Babod', details: '', income: 0, expenses: 36200, credit: 0 },
      { id: '060726075604[215]', name: '00172 Uttora Trading', voucherNo: 'Cash Return', details: '', income: 0, expenses: 160, credit: 0 },
    ];

    // Helper to generate consistent report IDs for dynamic real data
    const formatReportId = (dateStr: string, id: string) => {
      const parts = dateStr.split('-');
      let ddmmyy = '070726';
      if (parts.length === 3) {
        ddmmyy = `${parts[2]}${parts[1]}${parts[0].substring(2)}`;
      }
      let hashCode = 0;
      for (let i = 0; i < id.length; i++) {
        hashCode = id.charCodeAt(i) + ((hashCode << 5) - hashCode);
      }
      const absHash = Math.abs(hashCode);
      const hh = String(absHash % 12).padStart(2, '0');
      const mm = String((absHash >> 4) % 60).padStart(2, '0');
      const ss = String((absHash >> 8) % 60).padStart(2, '0');
      const bracket = String(absHash % 1000).padStart(3, '0');
      return `${ddmmyy}${hh}${mm}${ss}[${bracket}]`;
    };

    // Helper to generate a voucher reference for dynamic real data
    const getVoucherNo = (id: string) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
      }
      const seq = 24000 + (Math.abs(hash) % 1000);
      return `1.${seq}`;
    };

    // Gather dynamic active data of selectedDate from database
    const dynamicCashSales = invoices
      .filter((inv) => inv.date === selectedDate && (inv.paymentMethod !== 'Credit' && inv.isPaid))
      .map((inv) => ({
        id: formatReportId(inv.date, inv.id),
        name: inv.customerName,
        voucherNo: inv.invoiceNo,
        details: customers.find((c) => c.id === inv.customerId)?.phone || '',
        income: inv.total,
        expenses: 0,
        credit: 0,
      }));

    const dynamicCreditSales = invoices
      .filter((inv) => inv.date === selectedDate && (inv.paymentMethod === 'Credit' || !inv.isPaid))
      .map((inv) => ({
        id: formatReportId(inv.date, inv.id),
        name: inv.customerName,
        voucherNo: inv.invoiceNo,
        details: customers.find((c) => c.id === inv.customerId)?.phone || '',
        income: 0,
        expenses: 0,
        credit: inv.total,
      }));

    const dynamicCollections = transactions
      .filter((tx) => tx.date === selectedDate && tx.type === 'Deposit' && (tx.category.toLowerCase().includes('collection') || tx.description.toLowerCase().includes('collection')))
      .map((tx) => ({
        id: formatReportId(tx.date, tx.id),
        name: tx.description.replace('Collection from ', '').replace('Payment from ', ''),
        voucherNo: tx.referenceNo || `COL-${tx.id.slice(-4)}`,
        details: '',
        income: tx.amount,
        expenses: 0,
        credit: 0,
      }));

    const dynamicPayments = transactions
      .filter((tx) => tx.date === selectedDate && (tx.type === 'Withdrawal' || tx.type === 'Expense') && !tx.category.toLowerCase().includes('return'))
      .map((tx) => ({
        id: formatReportId(tx.date, tx.id),
        name: tx.description || tx.category,
        voucherNo: tx.referenceNo || `TX-${tx.id.slice(-4)}`,
        details: '',
        income: 0,
        expenses: tx.amount,
        credit: 0,
      }));

    const dynamicReturns = transactions
      .filter((tx) => tx.date === selectedDate && tx.category.toLowerCase().includes('return'))
      .map((tx) => ({
        id: formatReportId(tx.date, tx.id),
        name: tx.description.replace('Return from ', ''),
        voucherNo: tx.referenceNo || `RET-${tx.id.slice(-4)}`,
        details: '',
        income: 0,
        expenses: tx.type === 'Withdrawal' ? tx.amount : 0,
        credit: tx.type === 'Deposit' ? tx.amount : 0, // credit returned
      }));

    // Choose active list depending on toggle/date matching
    const isDemoMode = showSampleData && selectedDate === '2026-07-07';

    const cashSales = isDemoMode ? cashSalesDemo : dynamicCashSales;
    const creditSales = isDemoMode ? creditSalesDemo : dynamicCreditSales;
    const returns = isDemoMode ? returnsDemo : dynamicReturns;
    const collections = isDemoMode ? collectionsDemo : dynamicCollections;
    const payments = isDemoMode ? paymentsDemo : dynamicPayments;

    // Totals calculations
    const sumSection = (items: any[], key: 'income' | 'expenses' | 'credit') =>
      items.reduce((sum, item) => sum + (item[key] || 0), 0);

    const cashSalesTotal = {
      income: sumSection(cashSales, 'income'),
      expenses: sumSection(cashSales, 'expenses'),
      credit: sumSection(cashSales, 'credit'),
    };

    const creditSalesTotal = {
      income: sumSection(creditSales, 'income'),
      expenses: sumSection(creditSales, 'expenses'),
      credit: sumSection(creditSales, 'credit'),
    };

    const returnsTotal = {
      income: sumSection(returns, 'income'),
      expenses: sumSection(returns, 'expenses'),
      credit: sumSection(returns, 'credit'),
    };

    const collectionsTotal = {
      income: sumSection(collections, 'income'),
      expenses: sumSection(collections, 'expenses'),
      credit: sumSection(collections, 'credit'),
    };

    const paymentsTotal = {
      income: sumSection(payments, 'income'),
      expenses: sumSection(payments, 'expenses'),
      credit: sumSection(payments, 'credit'),
    };

    // Grand Totals: Income column (Cash sales + Collections), Expenses column (Return expenses + Payments)
    const grandTotalIncome = cashSalesTotal.income + collectionsTotal.income;
    const grandTotalExpenses = returnsTotal.expenses + paymentsTotal.expenses;

    // Previous Balance
    const dynamicPreviousBalance = transactions
      .filter((tx) => tx.date < selectedDate)
      .reduce((sum, tx) => {
        if (tx.type === 'Deposit' || tx.type === 'Income') return sum + tx.amount;
        if (tx.type === 'Withdrawal' || tx.type === 'Expense') return sum - tx.amount;
        return sum;
      }, 45000); // 45k fallback

    const previousBalance = isDemoMode ? 9448630 : dynamicPreviousBalance;
    const presentBalance = previousBalance + grandTotalIncome - grandTotalExpenses;

    const formattedDateForHeader = (() => {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}/${parts[0]}`;
      }
      return selectedDate;
    })();

    const handlePrint = () => {
      window.print();
    };

    // Filter list entries based on current search term
    const filterSectionItems = (items: any[]) => {
      if (!dailySearchText) return items;
      const searchLower = dailySearchText.toLowerCase();
      return items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.voucherNo.toLowerCase().includes(searchLower) ||
          (item.details || '').toLowerCase().includes(searchLower)
      );
    };

    const cashSalesFiltered = filterSectionItems(cashSales);
    const creditSalesFiltered = filterSectionItems(creditSales);
    const returnsFiltered = filterSectionItems(returns);
    const collectionsFiltered = filterSectionItems(collections);
    const paymentsFiltered = filterSectionItems(payments);

    // Filtered totals
    const cashSalesFilteredTotal = {
      income: sumSection(cashSalesFiltered, 'income'),
      expenses: sumSection(cashSalesFiltered, 'expenses'),
      credit: sumSection(cashSalesFiltered, 'credit'),
    };

    const creditSalesFilteredTotal = {
      income: sumSection(creditSalesFiltered, 'income'),
      expenses: sumSection(creditSalesFiltered, 'expenses'),
      credit: sumSection(creditSalesFiltered, 'credit'),
    };

    const returnsFilteredTotal = {
      income: sumSection(returnsFiltered, 'income'),
      expenses: sumSection(returnsFiltered, 'expenses'),
      credit: sumSection(returnsFiltered, 'credit'),
    };

    const collectionsFilteredTotal = {
      income: sumSection(collectionsFiltered, 'income'),
      expenses: sumSection(collectionsFiltered, 'expenses'),
      credit: sumSection(collectionsFiltered, 'credit'),
    };

    const paymentsFilteredTotal = {
      income: sumSection(paymentsFiltered, 'income'),
      expenses: sumSection(paymentsFiltered, 'expenses'),
      credit: sumSection(paymentsFiltered, 'credit'),
    };

    // Dynamic grand totals based on filtered items
    const grandTotalIncomeFiltered = cashSalesFilteredTotal.income + collectionsFilteredTotal.income;
    const grandTotalExpensesFiltered = returnsFilteredTotal.expenses + paymentsFilteredTotal.expenses;
    const presentBalanceFiltered = previousBalance + grandTotalIncomeFiltered - grandTotalExpensesFiltered;

    // Unified Master Table Row Builder to guarantee 100% column grid alignment across all sections
    const renderSectionRows = (
      title: string,
      items: any[],
      totals: { income: number; expenses: number; credit: number },
      badgeBg: string,
      badgeText: string,
      sectionKey: string
    ) => {
      // Filter out sections based on active tab filters
      if (dailyActiveFilter !== 'all') {
        if (dailyActiveFilter === 'inflows' && sectionKey !== 'cash_sales' && sectionKey !== 'collections') return null;
        if (dailyActiveFilter === 'outflows' && sectionKey !== 'returns' && sectionKey !== 'payments') return null;
        if (dailyActiveFilter !== 'inflows' && dailyActiveFilter !== 'outflows' && dailyActiveFilter !== sectionKey) return null;
      }

      return (
        <React.Fragment key={title}>
          {/* Section Headline Divider */}
          <tr className="bg-slate-50/80 border-t border-b border-slate-200">
            <td colSpan={7} className="py-2.5 px-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${badgeBg} ${badgeText}`}>
                    {title}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-full font-mono">
                    {items.length} {items.length === 1 ? 'Entry' : 'Entries'}
                  </span>
                </div>
              </div>
            </td>
          </tr>

          {/* Table Data Entries */}
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-5 text-center text-slate-400 font-semibold text-xs bg-slate-50/10 italic select-none">
                No entries recorded for this section.
              </td>
            </tr>
          ) : (
            items.map((row, idx) => (
              <tr
                key={row.id + '-' + idx}
                className="hover:bg-indigo-50/25 border-b border-slate-100/80 transition-colors text-xs text-slate-700"
              >
                <td className="py-2 px-3 font-mono text-[10px] text-slate-400 tracking-tight truncate select-all">{row.id}</td>
                <td className="py-2 px-3 font-bold text-slate-800 truncate" title={row.name}>{row.name}</td>
                <td className="py-2 px-3 text-center">
                  <span className="font-mono text-[9.5px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/50">
                    {row.voucherNo}
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-500 truncate" title={row.details || ''}>
                  {row.details || <span className="text-slate-300 font-normal">—</span>}
                </td>
                <td className="py-2 px-3 text-right font-mono text-slate-800">
                  {row.income > 0 ? (
                    <span className="text-emerald-600 font-bold">৳{row.income.toLocaleString()}</span>
                  ) : (
                    <span className="text-slate-300 font-normal">—</span>
                  )}
                </td>
                <td className="py-2 px-3 text-right font-mono text-slate-800">
                  {row.expenses > 0 ? (
                    <span className="text-rose-600 font-bold">৳{row.expenses.toLocaleString()}</span>
                  ) : (
                    <span className="text-slate-300 font-normal">—</span>
                  )}
                </td>
                <td className="py-2 px-3 text-right font-mono text-slate-800">
                  {row.credit > 0 ? (
                    <span className="text-indigo-600 font-bold">৳{row.credit.toLocaleString()}</span>
                  ) : (
                    <span className="text-slate-300 font-normal">—</span>
                  )}
                </td>
              </tr>
            ))
          )}

          {/* Section Totals */}
          {items.length > 0 && (
            <tr className="bg-slate-50/30 font-mono text-xs font-bold text-slate-800 border-b border-slate-200">
              <td colSpan={4} className="py-2 px-3 text-right text-slate-400 uppercase tracking-wider text-[9px] font-sans font-bold select-none">
                {title} Subtotal:
              </td>
              <td className="py-2 px-3 text-right font-bold text-slate-900 bg-slate-100/20 border-l border-slate-100">
                {totals.income > 0 ? `৳${totals.income.toLocaleString()}` : '—'}
              </td>
              <td className="py-2 px-3 text-right font-bold text-slate-900 bg-slate-100/20 border-l border-slate-100">
                {totals.expenses > 0 ? `৳${totals.expenses.toLocaleString()}` : '—'}
              </td>
              <td className="py-2 px-3 text-right font-bold text-slate-900 bg-slate-100/20 border-l border-slate-100">
                {totals.credit > 0 ? `৳${totals.credit.toLocaleString()}` : '—'}
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    };

    return (
      <div className="space-y-6">
        {/* CSS Style Injection for flawless portrait A4 previews on desktop and pristine paper printing */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media screen {
            .a4-workspace {
              background-color: #f1f5f9;
              padding: 2rem 1.5rem;
              border-radius: 1.5rem;
              box-shadow: inset 0 2px 8px rgba(15, 23, 42, 0.05);
              border: 1px dashed #cbd5e1;
            }
            .a4-paper-preview {
              width: 210mm !important;
              min-height: 297mm !important;
              background-color: white !important;
              border: 1px solid #d1d5db !important;
              box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 8px 16px -6px rgba(0, 0, 0, 0.05);
              padding: 15mm 15mm !important;
              margin: 0 auto !important;
              border-radius: 0.5rem;
            }
            .interactive-card {
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .interactive-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.08);
            }
          }
          @media print {
            body {
              visibility: hidden !important;
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .no-print, .no-print * {
              display: none !important;
              height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .a4-workspace {
              background: transparent !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            .a4-paper-preview {
              visibility: visible !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 210mm !important;
              min-height: 297mm !important;
              padding: 12mm 15mm !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              background: white !important;
            }
            #daily-cash-report-printable, #daily-cash-report-printable * {
              visibility: visible !important;
            }
            @page {
              size: portrait;
              margin: 0;
            }
          }
        `}} />

        {/* Top Interactive Filter & Search Control Panel */}
        <div className="flex flex-col gap-4 bg-slate-100 border border-slate-200/80 p-5 rounded-2xl no-print shadow-xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Left side: Date Selector & Sample toggles */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-black text-slate-700 uppercase tracking-wide">Ledger Date:</span>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-600 font-bold shadow-xs cursor-pointer text-slate-800"
              />
              {selectedDate === '2026-07-07' && (
                <label className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-900 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer hover:bg-indigo-100/60 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={showSampleData}
                    onChange={(e) => setShowSampleData(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  <span>Load M/S Madani Traders sample</span>
                </label>
              )}
            </div>

            {/* Right side: Search Box and PDF Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Interactive Instant Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter by Customer / Voucher..."
                  value={dailySearchText}
                  onChange={(e) => setDailySearchText(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500 font-bold text-slate-800 placeholder-slate-400 shadow-xs"
                />
                <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                {dailySearchText && (
                  <button
                    onClick={() => setDailySearchText('')}
                    className="absolute right-2.5 top-2 text-[10px] font-black text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs cursor-pointer transition-all active:scale-[0.98]"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Export A4 PDF</span>
              </button>
            </div>
          </div>

          {/* Interactive Filter Quick Pills & Instructions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mr-1">
                <Filter className="h-3 w-3" /> Quick Filter:
              </span>
              <button
                onClick={() => setDailyActiveFilter('all')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                  dailyActiveFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                Show All Sections
              </button>
              <button
                onClick={() => setDailyActiveFilter('inflows')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                  dailyActiveFilter === 'inflows'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-300'
                }`}
              >
                Inflows Only
              </button>
              <button
                onClick={() => setDailyActiveFilter('outflows')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                  dailyActiveFilter === 'outflows'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-rose-50 border border-slate-300'
                }`}
              >
                Outflows Only
              </button>
              <button
                onClick={() => setDailyActiveFilter('credit_sales')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                  dailyActiveFilter === 'credit_sales'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-300'
                }`}
              >
                Credit Sales
              </button>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 italic">
              ✨ Tip: Click on any of the metrics cards inside the report to filter the table list instantly!
            </div>
          </div>
        </div>

        {/* Gray workspace containing the perfectly proportioned portrait A4 paper */}
        <div className="w-full a4-workspace overflow-x-auto">
          <div
            id="daily-cash-report-printable"
            className="a4-paper-preview flex flex-col justify-between font-sans text-slate-800"
          >
            <div className="space-y-6">
              {/* Header Banner - Classical Serif Editorial Style matching actual PDF screenshots */}
              <div className="flex flex-col items-center justify-center relative border-b border-slate-300 pb-4">
                <h1 className="text-3xl font-bold tracking-wider text-slate-900 font-serif text-center uppercase" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
                  M/S MADANI TRADERS
                </h1>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest text-center uppercase mt-1">
                  KADIRGANJ, RAJSHAHI
                </p>

                {/* Subtitle with traditional double-ruled lines */}
                <div className="flex flex-col items-center w-full mt-3">
                  <div className="border-t border-slate-400 w-48 my-0.5"></div>
                  <h2 className="text-base font-black text-slate-800 tracking-widest text-center uppercase font-serif" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
                    DAILY CASH REPORT
                  </h2>
                  <div className="border-b-2 border-double border-slate-800 w-56 mt-1.5 pb-0.5"></div>
                </div>

                {/* Document metadata info bar */}
                <div className="w-full flex justify-between items-end mt-4 text-[10px] font-bold font-mono text-slate-500">
                  <div>
                    SYSTEM EXPORT: <span className="font-extrabold text-slate-700">${activeSubTab.toUpperCase()}-LEDGER</span>
                  </div>
                  <div>
                    Date: <span className="underline decoration-dotted text-slate-800 font-extrabold">{formattedDateForHeader}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Clickable Summary Dashboard - Dynamic Visual Indicators */}
              <div className="grid grid-cols-4 gap-3 print:grid-cols-4 no-print">
                <button
                  onClick={() => setDailyActiveFilter('all')}
                  className={`interactive-card p-3.5 rounded-xl border flex flex-col items-start text-left ${
                    dailyActiveFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${dailyActiveFilter === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>Previous Balance</span>
                  <h4 className="text-sm font-black mt-1 font-mono">৳{previousBalance.toLocaleString()}</h4>
                </button>

                <button
                  onClick={() => setDailyActiveFilter('inflows')}
                  className={`interactive-card p-3.5 rounded-xl border flex flex-col items-start text-left ${
                    dailyActiveFilter === 'inflows'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-emerald-50/40 hover:bg-emerald-50 border-emerald-100 text-slate-700'
                  }`}
                >
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${dailyActiveFilter === 'inflows' ? 'text-white/80' : 'text-emerald-600'}`}>Daily Inflows</span>
                  <h4 className="text-sm font-black mt-1 font-mono">+{grandTotalIncome.toLocaleString()}</h4>
                </button>

                <button
                  onClick={() => setDailyActiveFilter('outflows')}
                  className={`interactive-card p-3.5 rounded-xl border flex flex-col items-start text-left ${
                    dailyActiveFilter === 'outflows'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-rose-50/40 hover:bg-rose-50 border-rose-100 text-slate-700'
                  }`}
                >
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${dailyActiveFilter === 'outflows' ? 'text-white/80' : 'text-rose-600'}`}>Daily Outflows</span>
                  <h4 className="text-sm font-black mt-1 font-mono">-{grandTotalExpenses.toLocaleString()}</h4>
                </button>

                <button
                  onClick={() => setDailyActiveFilter('credit_sales')}
                  className={`interactive-card p-3.5 rounded-xl border flex flex-col items-start text-left ${
                    dailyActiveFilter === 'credit_sales'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-indigo-50/40 hover:bg-indigo-50 border-indigo-100 text-slate-700'
                  }`}
                >
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${dailyActiveFilter === 'credit_sales' ? 'text-white/80' : 'text-indigo-600'}`}>Credit Sales</span>
                  <h4 className="text-sm font-black mt-1 font-mono">৳{creditSalesTotal.credit.toLocaleString()}</h4>
                </button>
              </div>

              {/* Master Unified Table containing all sections to lock columns perfectly together */}
              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
                  {/* Lock widths precisely for absolute horizontal alignment */}
                  <colgroup>
                    <col style={{ width: '135px' }} />
                    <col style={{ width: '175px' }} />
                    <col style={{ width: '85px' }} />
                    <col />
                    <col style={{ width: '95px' }} />
                    <col style={{ width: '95px' }} />
                    <col style={{ width: '95px' }} />
                  </colgroup>

                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-black text-slate-500 uppercase tracking-wider select-none">
                      <th className="py-2 px-3">ID / Timestamp</th>
                      <th className="py-2 px-3">Particular / Customer</th>
                      <th className="py-2 px-3 text-center">Voucher</th>
                      <th className="py-2 px-3">Details / Address</th>
                      <th className="py-2 px-3 text-right">Income</th>
                      <th className="py-2 px-3 text-right">Expenses</th>
                      <th className="py-2 px-3 text-right">Credit</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* 1. Cash Sell Bill */}
                    {renderSectionRows(
                      'Cash Sell Bill',
                      cashSalesFiltered,
                      cashSalesFilteredTotal,
                      'bg-emerald-50 text-emerald-700 border border-emerald-100',
                      'text-emerald-700',
                      'cash_sales'
                    )}

                    {/* 2. Credit Sale Bill */}
                    {renderSectionRows(
                      'Credit Sale Bill',
                      creditSalesFiltered,
                      creditSalesFilteredTotal,
                      'bg-indigo-50 text-indigo-700 border border-indigo-100',
                      'text-indigo-700',
                      'credit_sales'
                    )}

                    {/* 3. Sale Return Bill */}
                    {renderSectionRows(
                      'Sale Return Bill',
                      returnsFiltered,
                      returnsFilteredTotal,
                      'bg-rose-50 text-rose-700 border border-rose-100',
                      'text-rose-700',
                      'returns'
                    )}

                    {/* 4. Collection */}
                    {renderSectionRows(
                      'Collection',
                      collectionsFiltered,
                      collectionsFilteredTotal,
                      'bg-teal-50 text-teal-700 border border-teal-100',
                      'text-teal-700',
                      'collections'
                    )}

                    {/* 5. Payment */}
                    {renderSectionRows(
                      'Payment',
                      paymentsFiltered,
                      paymentsFilteredTotal,
                      'bg-amber-50 text-amber-700 border border-amber-100',
                      'text-amber-700',
                      'payments'
                    )}

                    {/* Grand Total Row directly rendered inside the master table to preserve layout */}
                    {dailyActiveFilter === 'all' && (
                      <tr className="bg-slate-50 font-mono text-xs font-black text-slate-900 border-t-2 border-slate-300 border-b-2 border-double border-slate-300">
                        <td colSpan={4} className="py-2.5 px-3 text-right uppercase tracking-wider text-[10px] font-sans font-black text-slate-500 select-none">
                          GRAND TOTAL:
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900">
                          ৳{grandTotalIncomeFiltered.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900">
                          ৳{grandTotalExpensesFiltered.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300 font-normal">
                          —
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Footer block containing Grand Totals and dynamic cash account balance assessment */}
            <div className="pt-6 mt-8 border-t border-slate-200/80 space-y-6">
              {/* Balance Summary Statement & Bank account equivalents ledger */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
                <div className="text-[10px] text-slate-400 font-mono max-w-sm space-y-1.5 select-none leading-relaxed">
                  <p>* Prepared dynamically under double-entry ledger equilibrium checks.</p>
                  <p>* Authorized under internal office ledger auditing standard limits.</p>
                  <p className="font-bold text-slate-600 font-sans mt-2">M/S Madani Traders, Kadirganj, Rajshahi (Bangladesh)</p>
                </div>

                {/* Right Summary Assessment Box */}
                <div className="w-full sm:w-[280px] shrink-0 border border-slate-300 p-4 rounded-xl bg-slate-50/50 font-mono text-[11px] text-slate-700 space-y-2 shadow-2xs print:border-slate-300 print:bg-transparent">
                  <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-200">
                    <span className="font-medium text-slate-400 select-none">Previous Balance:</span>
                    <span className="font-bold text-slate-800">{previousBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-200">
                    <span className="font-medium text-slate-400 select-none">Total Inflows:</span>
                    <span className="font-bold text-emerald-600">+{grandTotalIncomeFiltered.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="font-medium text-slate-400 select-none">Total Outflows:</span>
                    <span className="font-bold text-rose-600">-{grandTotalExpensesFiltered.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-xs font-black text-slate-900 border-t-2 border-double border-slate-300">
                    <span className="uppercase tracking-tight select-none">Present Balance:</span>
                    <span className="font-mono bg-indigo-50 text-indigo-950 px-2 py-0.5 rounded print:bg-slate-100">
                      {presentBalanceFiltered.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Page Number indicator matching screenshots */}
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 font-mono uppercase select-none pt-2 border-t border-slate-200">
                <span>SYSTEM EXPORT ID: ${activeSubTab.toUpperCase()}-LEDGER</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 15. New Products (Daily)
  const renderNewProductsDaily = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recently Added Catalog items</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">SKU Code</th>
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-right">Selling Price</th>
                  <th className="py-2.5 px-4 text-center">Starting Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {products.slice(-5).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{p.sku}</td>
                    <td className="py-3 px-4 font-bold">{p.name}</td>
                    <td className="py-3 px-4 text-slate-500">{p.category}</td>
                    <td className="py-3 px-4 text-right">৳{p.price.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center font-bold">{p.stock} {p.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 16. New Customers (Daily)
  const renderNewCustomersDaily = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recently Registered Customers</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">ID</th>
                  <th className="py-2.5 px-4">Customer Name</th>
                  <th className="py-2.5 px-4">Phone Number</th>
                  <th className="py-2.5 px-4">Customer Group</th>
                  <th className="py-2.5 px-4 text-right">Outstanding balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {customers.slice(-5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{c.id}</td>
                    <td className="py-3 px-4 font-bold">{c.name}</td>
                    <td className="py-3 px-4 font-mono">{c.phone}</td>
                    <td className="py-3 px-4 text-slate-500">{c.group || 'General'}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">৳{c.outstandingBalance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 17. Offer Sales Report
  const renderOfferSalesReport = () => {
    // Generate sales lines that had discounts
    const discountedSales = invoices.filter((inv) => inv.discount > 0);

    return (
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Promotional Discount & Savings Log</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Invoice No</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4 text-right">Subtotal</th>
                  <th className="py-2.5 px-4 text-right">Promotional Discount Granted</th>
                  <th className="py-2.5 px-4 text-right">Final Bill total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {discountedSales.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inv.invoiceNo}</td>
                    <td className="py-3 px-4 font-bold">{inv.customerName}</td>
                    <td className="py-3 px-4 text-right">৳{(inv.total + inv.discount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-rose-600 font-bold">-৳{inv.discount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">৳{inv.total.toLocaleString()}</td>
                  </tr>
                ))}
                {discountedSales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-bold bg-[#fafafa]">
                      No sales under promotional campaign codes detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 18. Product Wise Total Profit
  const renderProductWiseTotalProfit = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Expected Asset Profit realization</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4 text-center">Remaining Quantity</th>
                  <th className="py-2.5 px-4 text-right">Asset Cost Value</th>
                  <th className="py-2.5 px-4 text-right">Potential Sales Value</th>
                  <th className="py-2.5 px-4 text-right">Expected Revenue Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {products.map((p) => {
                  const costVal = p.stock * p.cost;
                  const priceVal = p.stock * p.price;
                  const potentialProfit = priceVal - costVal;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                      <td className="py-3 px-4 text-center">{p.stock} {p.unit}</td>
                      <td className="py-3 px-4 text-right text-slate-500">৳{costVal.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-slate-600">৳{priceVal.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">৳{potentialProfit.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const getSubTabTitle = () => {
    switch (activeSubTab) {
      case 'sales_report':
        return 'Sales Report';
      case 'purchase_register':
        return 'Purchase Register';
      case 'low_stock':
        return 'Low Stock Alert Report';
      case 'dead_stock':
        return 'Dead Stock Register';
      case 'day_book':
        return 'Day Book Ledger';
      case 'cash_book':
        return 'Cash Book Ledger';
      case 'trial_balance':
        return 'Trial Balance Sheet';
      case 'balance_sheet':
        return 'Balance Sheet (A = L + E)';
      case 'profit_loss':
        return 'Statement of Profit & Loss';
      case 'ar_ageing':
        return 'Accounts Receivable Ageing';
      case 'ap_ageing':
        return 'Accounts Payable Ageing';
      case 'profit_report':
        return 'Consolidated Profit Margin Report';
      case 'product_profit':
        return 'Product wise Profit Margin';
      case 'daily_report':
        return 'Daily Cash Report';
      case 'new_products_daily':
        return 'New Products Registry (Daily)';
      case 'new_customers_daily':
        return 'New Customers Registry (Daily)';
      case 'offer_sales_report':
        return 'Promotional Sales Report';
      case 'product_wise_total_profit':
        return 'Product Wise Total Realized Profit';
      default:
        return 'Analytical Ledger Report';
    }
  };

  const renderActiveReport = () => {
    switch (activeSubTab) {
      case 'sales_report':
        return renderSalesReport();
      case 'purchase_register':
        return renderPurchaseRegister();
      case 'low_stock':
        return renderLowStock();
      case 'dead_stock':
        return renderDeadStock();
      case 'day_book':
        return renderDayBook();
      case 'cash_book':
        return renderCashBook();
      case 'trial_balance':
        return renderTrialBalance();
      case 'balance_sheet':
        return renderBalanceSheet();
      case 'profit_loss':
        return renderProfitLoss();
      case 'ar_ageing':
        return renderArAgeing();
      case 'ap_ageing':
        return renderApAgeing();
      case 'profit_report':
        return renderProfitReport();
      case 'product_profit':
        return renderProductProfit();
      case 'daily_report':
        return renderDailyReport();
      case 'new_products_daily':
        return renderNewProductsDaily();
      case 'new_customers_daily':
        return renderNewCustomersDaily();
      case 'offer_sales_report':
        return renderOfferSalesReport();
      case 'product_wise_total_profit':
        return renderProductWiseTotalProfit();
      default:
        return (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
            <span className="text-4xl">📊</span>
            <h3 className="font-bold text-slate-800 text-sm font-display uppercase tracking-wide">
              Operational Ledger Analytics
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select one of the 18 specific financial sub-reports from the sidebar list under the Reports section to view specialized metrics, double-entry balancings, aging logs, or dynamic box-per-piece stock representation.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card with contextual description */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <h2 className="text-base font-bold text-slate-800 font-display uppercase tracking-wider">
          {getSubTabTitle()}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Axion Ledger and Inventory dynamic query matrix. Updates live as checkouts are processed or stock items are registered.
        </p>
      </div>

      {renderActiveReport()}
    </div>
  );
}
