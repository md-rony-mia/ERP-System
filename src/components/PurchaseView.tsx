import React, { useState } from 'react';
import { Supplier, PurchaseOrder, Product, POItem, formatBoxQty } from '../types';
import {
  ShoppingCart,
  Search,
  Plus,
  Filter,
  PackageCheck,
  AlertTriangle,
  FolderOpen,
  ArrowRightLeft,
  DollarSign,
  Briefcase,
  Users,
} from 'lucide-react';

interface PurchaseViewProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'outstandingBalance'>) => void;
  onAddPurchaseOrder: (po: PurchaseOrder) => void;
  onReceivePurchaseOrder: (poId: string) => void;
  activeSubTab?: string;
}

export default function PurchaseView({
  suppliers,
  purchaseOrders,
  products,
  onAddSupplier,
  onAddPurchaseOrder,
  onReceivePurchaseOrder,
  activeSubTab = 'purchase_orders',
}: PurchaseViewProps) {
  // Bind current selected view directly to activeSubTab
  const currentTab = ['suppliers', 'supplier_groups', 'purchase_orders', 'goods_receipt', 'purchase_returns', 'purchase_payments'].includes(activeSubTab)
    ? activeSubTab
    : 'purchase_orders';

  const [poSearch, setPoSearch] = useState('');
  const [supSearch, setSupSearch] = useState('');

  // --- LOCAL CONFIGURATION DATA ---
  const [supplierGroups, setSupplierGroups] = useState<string[]>([
    'Local Producer',
    'Primary Importer',
    'Wholesale Distributor',
    'Brokerage House',
    'Corporate Supplier',
  ]);

  const [purchaseReturns, setPurchaseReturns] = useState([
    { id: 'ret_1', poNo: 'PO-2026-001', supplierName: 'Siam Glass Ltd.', date: '2026-07-01', value: 12000, reason: 'Transit breakage' },
    { id: 'ret_2', poNo: 'PO-2026-002', supplierName: 'Bengal Plastics PLC', date: '2026-07-04', value: 4500, reason: 'Specification mismatch' },
  ]);

  const [supplierPayments, setSupplierPayments] = useState([
    { id: 'pay_1', supplierName: 'Siam Glass Ltd.', date: '2026-07-02', amount: 45000, method: 'MTB Current Account' },
    { id: 'pay_2', supplierName: 'Bengal Plastics PLC', date: '2026-07-05', amount: 80000, method: 'Bkash Merchant Wallet' },
  ]);

  // --- MODAL / FORM STATES ---
  const [showPoModal, setShowPoModal] = useState(false);
  const [showSupModal, setShowSupModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // --- FORM VALUES ---
  // --- ERP ACTIVE PROCUREMENT THEME STATES ---
  const [poInvoiceNo, setPoInvoiceNo] = useState(`PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [poProductId, setPoProductId] = useState(products[0]?.id || '');
  const [poQty, setPoQty] = useState(1);
  const [poCost, setPoCost] = useState(products[0]?.cost || 0);
  const [poCart, setPoCart] = useState<any[]>([]);
  const [poDiscount, setPoDiscount] = useState(0);
  const [poTransport, setPoTransport] = useState(0);
  const [poLabour, setPoLabour] = useState(0);

  // --- ERP ACTIVE PROCUREMENT RETURNS STATES ---
  const [pretId, setPretId] = useState(`PRET-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [pretDate, setPretDate] = useState(new Date().toISOString().split('T')[0]);
  const [pretSupplierId, setPretSupplierId] = useState('');
  const [pretPoRef, setPretPoRef] = useState('');
  const [pretReason, setPretReason] = useState('Transit damage');
  const [pretProductId, setPretProductId] = useState('');
  const [pretQty, setPretQty] = useState(1);
  const [pretCost, setPretCost] = useState(0);
  const [pretCart, setPretCart] = useState<any[]>([]);

  const handleSelectProductForPO = (id: string) => {
    setPoProductId(id);
    const p = products.find((prod) => prod.id === id);
    if (p) {
      setPoCost(p.cost);
    }
  };

  const handleAddPOItemToGrid = () => {
    if (!poProductId) {
      alert('Please select a product first!');
      return;
    }
    const p = products.find((prod) => prod.id === poProductId);
    if (!p) return;

    const existingIndex = poCart.findIndex((item) => item.productId === poProductId);
    if (existingIndex > -1) {
      const newCart = [...poCart];
      newCart[existingIndex].qty += poQty;
      newCart[existingIndex].subtotal = newCart[existingIndex].qty * poCost;
      setPoCart(newCart);
    } else {
      setPoCart([
        ...poCart,
        {
          productId: poProductId,
          sku: p.sku,
          name: p.name,
          qty: poQty,
          cost: poCost,
          subtotal: poQty * poCost,
        },
      ]);
    }
    setPoQty(1);
  };

  const handleSavePurchaseOrder = () => {
    if (poCart.length === 0) {
      alert('Procurement cart is empty! Add products first.');
      return;
    }
    if (!selectedSupplierId) {
      alert('Please select a supplier entity!');
      return;
    }
    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!supplier) return;

    const subtotal = poCart.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal + poLabour + poTransport - poDiscount;

    const newPO: PurchaseOrder = {
      id: `po_dynamic_${Date.now()}`,
      poNo: poInvoiceNo,
      supplierId: selectedSupplierId,
      supplierName: supplier.name,
      date: poDate,
      items: poCart.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.qty,
        cost: item.cost,
        subtotal: item.subtotal,
      })),
      subtotal,
      total,
      status: 'Ordered',
    };

    onAddPurchaseOrder(newPO);
    alert(`Purchase order ${poInvoiceNo} successfully logged and sent to ${supplier.name}! Ready for Goods Receipt (GRN).`);
    setPoCart([]);
    setPoDiscount(0);
    setPoLabour(0);
    setPoTransport(0);
    setPoInvoiceNo(`PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSelectProductForPret = (id: string) => {
    setPretProductId(id);
    const p = products.find((prod) => prod.id === id);
    if (p) {
      setPretCost(p.cost);
    }
  };

  const handleAddPretRow = () => {
    if (!pretProductId) {
      alert('Select product to return.');
      return;
    }
    const p = products.find((prod) => prod.id === pretProductId);
    if (!p) return;

    const existingIndex = pretCart.findIndex((item) => item.productId === pretProductId);
    if (existingIndex > -1) {
      const newCart = [...pretCart];
      newCart[existingIndex].qty += pretQty;
      newCart[existingIndex].subtotal = newCart[existingIndex].qty * pretCost;
      setPretCart(newCart);
    } else {
      setPretCart([
        ...pretCart,
        {
          productId: pretProductId,
          sku: p.sku,
          name: p.name,
          qty: pretQty,
          cost: pretCost,
          subtotal: pretQty * pretCost,
        },
      ]);
    }
    setPretQty(1);
  };

  const handleSavePurchaseReturn = () => {
    if (pretCart.length === 0) {
      alert('Return items list is empty.');
      return;
    }
    if (!pretSupplierId) {
      alert('Please select supplier.');
      return;
    }
    const sup = suppliers.find((s) => s.id === pretSupplierId);
    if (!sup) return;

    const totalVal = pretCart.reduce((sum, item) => sum + item.subtotal, 0);

    const newReturn = {
      id: pretId,
      poNo: pretPoRef || 'PO-2026-101',
      supplierName: sup.name,
      date: pretDate,
      value: totalVal,
      reason: pretReason,
    };

    setPurchaseReturns((prev) => [newReturn, ...prev]);
    alert(`Purchase Return ${pretId} logged successfully! Debit Note value of ৳${totalVal.toLocaleString()} registered against ${sup.name}.`);
    setPretCart([]);
    setPretId(`PRET-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setPretPoRef('');
  };

  // PO Form fallback states
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number; cost: number }[]>([
    { productId: products[0]?.id || '', quantity: 1, cost: products[0]?.cost || 0 },
  ]);

  // Supplier Form
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supCompany, setSupCompany] = useState('');
  const [supGroup, setSupGroup] = useState('Local Producer');

  // New Group Form
  const [newGroup, setNewGroup] = useState('');

  // Return Form
  const [retPoNo, setRetPoNo] = useState('');
  const [retSupplier, setRetSupplier] = useState('');
  const [retValue, setRetValue] = useState('');
  const [retReason, setRetReason] = useState('Transit damage');

  // Supplier Payment Form
  const [paySupplierName, setPaySupplierName] = useState('');
  const [payAmt, setPayAmt] = useState('');
  const [payMethod, setPayMethod] = useState('MTB Current Account');

  // --- ACTION HANDLERS ---
  const handleAddPoItemLine = () => {
    setPoItems([...poItems, { productId: products[0]?.id || '', quantity: 1, cost: products[0]?.cost || 0 }]);
  };

  const handleUpdatePoItemField = (index: number, field: 'productId' | 'quantity' | 'cost', value: any) => {
    const updated = [...poItems];
    if (field === 'productId') {
      const p = products.find((prod) => prod.id === value);
      updated[index] = {
        productId: value,
        quantity: updated[index].quantity,
        cost: p ? p.cost : 0,
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    setPoItems(updated);
  };

  const handleRemovePoItemLine = (index: number) => {
    setPoItems(poItems.filter((_, idx) => idx !== index));
  };

  const handlePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0 || !selectedSupplierId) return;

    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    if (!sup) return;

    const itemsFormatted: POItem[] = poItems.map((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      return {
        productId: item.productId,
        name: p ? p.name : 'Unknown Product',
        quantity: item.quantity,
        cost: item.cost,
        subtotal: item.quantity * item.cost,
      };
    });

    const subtotal = itemsFormatted.reduce((sum, item) => sum + item.subtotal, 0);

    const newPO: PurchaseOrder = {
      id: `po_dynamic_${Date.now()}`,
      poNo: `PO-2026-00${3 + purchaseOrders.length}`,
      supplierId: selectedSupplierId,
      supplierName: sup.name,
      date: new Date().toISOString().split('T')[0],
      items: itemsFormatted,
      subtotal: subtotal,
      total: subtotal,
      status: 'Ordered',
    };

    onAddPurchaseOrder(newPO);
    setShowPoModal(false);
    setPoItems([{ productId: products[0]?.id || '', quantity: 1, cost: products[0]?.cost || 0 }]);
  };

  const handleSupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supPhone || !supCompany) return;

    onAddSupplier({
      name: supName,
      phone: supPhone,
      email: supEmail || 'info@supplier.com',
      companyName: supCompany,
      group: supGroup,
    });

    setSupName('');
    setSupPhone('');
    setSupEmail('');
    setSupCompany('');
    setShowSupModal(false);
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup) return;
    setSupplierGroups([...supplierGroups, newGroup]);
    setNewGroup('');
    setShowGroupModal(false);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retPoNo || !retSupplier || !retValue) return;

    const newRet = {
      id: `ret_dyn_${Date.now()}`,
      poNo: retPoNo,
      supplierName: retSupplier,
      date: new Date().toISOString().split('T')[0],
      value: parseFloat(retValue),
      reason: retReason,
    };

    setPurchaseReturns([...purchaseReturns, newRet]);
    setRetPoNo('');
    setRetSupplier('');
    setRetValue('');
    setShowReturnModal(false);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paySupplierName || !payAmt) return;

    const newPay = {
      id: `pay_dyn_${Date.now()}`,
      supplierName: paySupplierName,
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(payAmt),
      method: payMethod,
    };

    setSupplierPayments([...supplierPayments, newPay]);
    setPaySupplierName('');
    setPayAmt('');
    setShowPayModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">

      {/* =========================================================
          TAB 1: SUPPLIERS DIRECTORY
          ========================================================= */}
      {currentTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">Suppliers Directory</h2>
              <p className="text-xs text-slate-400 mt-1">Review verified supplier contact lines, corporate entities, and groups.</p>
            </div>
            <button
              onClick={() => setShowSupModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register Supplier</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/20">
              <div className="max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter registered suppliers..."
                  value={supSearch}
                  onChange={(e) => setSupSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Supplier info</th>
                  <th className="py-3.5 px-6">Company Entity</th>
                  <th className="py-3.5 px-6">Contact Channels</th>
                  <th className="py-3.5 px-6">Supplier Segment</th>
                  <th className="py-3.5 px-6 text-right">Ledger Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers
                  .filter((s) => s.name.toLowerCase().includes(supSearch.toLowerCase()) || s.companyName.toLowerCase().includes(supSearch.toLowerCase()))
                  .map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800">{sup.name}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium">{sup.companyName}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col font-mono">
                          <span className="text-slate-700 font-bold">{sup.phone}</span>
                          <span className="text-[10px] text-slate-400">{sup.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {sup.group}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-rose-600">৳{sup.outstandingBalance.toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: SUPPLIERS GROUPS
          ========================================================= */}
      {currentTab === 'supplier_groups' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">Suppliers Categories & Groups</h2>
              <p className="text-xs text-slate-400 mt-1">Classify your corporate suppliers into procurement market structures.</p>
            </div>
            <button
              onClick={() => setShowGroupModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Supplier Group</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supplierGroups.map((grp, index) => {
              const matchedCount = suppliers.filter((s) => s.group === grp).length;
              return (
                <div key={grp} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />
                  <div className="flex justify-between items-start">
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-mono">
                      {index + 1}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">Active</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{grp} Group</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Standard commercial channel segment</p>
                  </div>

                  <div className="border-t border-slate-50 pt-3 flex justify-between text-xs">
                    <span className="text-slate-400">Total Suppliers</span>
                    <span className="font-bold text-indigo-600">{matchedCount} Entities Registered</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: PURCHASE ORDERS
          ========================================================= */}
      {currentTab === 'purchase_orders' && (
        <div className="bg-[#f0f0f0] p-3 rounded-lg border-2 border-emerald-600 shadow-md text-slate-800 font-sans space-y-4">
          
          <div className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-300 pb-1 flex items-center justify-between">
            <span>Procurement & Purchase Order Entry Terminal</span>
            <span className="text-emerald-700 font-black">WAREHOUSE INCOMING SUPPLIES</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            
            {/* Left side: Supplier info, Product config, Grid, Maroon red total */}
            <div className="lg:col-span-4 space-y-3">
              
              {/* Supplier Procurement Information Box */}
              <div className="bg-[#f5f5f5] border border-slate-300 p-2 rounded shadow-sm">
                <div className="text-[11px] font-bold text-emerald-800 border-b border-slate-200 pb-1 mb-2 uppercase tracking-wider">
                  Supplier Entity Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">PO Ref No</label>
                    <input
                      type="text"
                      readOnly
                      value={poInvoiceNo}
                      className="w-full bg-[#ffffe2] text-slate-700 font-bold border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Order Date</label>
                    <input
                      type="date"
                      value={poDate}
                      onChange={(e) => setPoDate(e.target.value)}
                      className="w-full bg-[#ffffe2] text-slate-800 font-semibold border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Supplier Name</label>
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      className="w-full bg-[#ffffe2] text-slate-800 font-bold border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    >
                      <option value="">-- Select Supplier --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.companyName || 'Factory Producer'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Configuration Box */}
              <div className="bg-[#f5f5f5] border border-slate-300 p-2 rounded shadow-sm">
                <div className="text-[11px] font-bold text-emerald-800 border-b border-slate-200 pb-1 mb-2 uppercase tracking-wider">
                  Product Selection & Purchasing Rates
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Product Name</label>
                    <select
                      value={poProductId}
                      onChange={(e) => handleSelectProductForPO(e.target.value)}
                      className="w-full bg-[#ffffe2] text-slate-800 font-bold border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Cost: ৳{p.cost}/unit, Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Order Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={poQty}
                      onChange={(e) => setPoQty(parseInt(e.target.value) || 1)}
                      className="w-full bg-white text-slate-800 border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Base Unit Cost</label>
                    <input
                      type="number"
                      value={poCost}
                      onChange={(e) => setPoCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#ffffe2] text-slate-800 font-bold border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* PO Line Items Grid Table */}
              <div className="border border-slate-300 rounded overflow-hidden bg-white shadow-sm">
                <div className="bg-[#3f3f46] text-white px-2 py-1 text-[11px] font-mono flex items-center justify-between select-none">
                  <span>Procurement Booking Grid</span>
                  <span className="text-[10px] text-slate-300">Live subtotal math</span>
                </div>
                
                <div className="overflow-x-auto max-h-[180px]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-[#eeeeee] border-b border-slate-300 text-slate-600 font-bold">
                        <th className="py-1 px-2 border-r border-slate-300 w-16">No</th>
                        <th className="py-1 px-2 border-r border-slate-300">SKU Code</th>
                        <th className="py-1 px-2 border-r border-slate-300">Product Name</th>
                        <th className="py-1 px-2 border-r border-slate-300 text-right">Qty</th>
                        <th className="py-1 px-2 border-r border-slate-300 text-right">Unit Cost</th>
                        <th className="py-1 px-2 text-right">Line Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {poCart.map((item, idx) => {
                        const p = products.find((prod) => prod.id === item.productId);
                        return (
                          <tr key={idx} className="hover:bg-slate-50 text-slate-700">
                            <td className="py-1 px-2 border-r border-slate-200">0{idx + 1}</td>
                            <td className="py-1 px-2 border-r border-slate-200">{item.sku}</td>
                            <td className="py-1 px-2 border-r border-slate-200 font-bold">{item.name}</td>
                            <td className="py-1 px-2 border-r border-slate-200 text-right font-bold text-emerald-800">
                              <div>{item.qty}</div>
                              {p?.pcsPerBox && p.pcsPerBox > 1 && (
                                <div className="text-[9px] text-indigo-600 font-semibold leading-tight">
                                  ({formatBoxQty(item.qty, p.pcsPerBox)})
                                </div>
                              )}
                            </td>
                            <td className="py-1 px-2 border-r border-slate-200 text-right">৳{item.cost.toLocaleString()}</td>
                            <td className="py-1 px-2 text-right font-bold">৳{item.subtotal.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                      {poCart.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-bold bg-[#fafafa]">
                            Procurement items grid is empty. Select item above and click 'Add Row'
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Maroon Total Bar */}
              <div className="bg-[#800000] text-white p-2 rounded shadow-inner text-center font-black tracking-wider text-xs select-none">
                Grand Procurement Total (including Overheads): {(
                  poCart.reduce((sum, item) => sum + item.subtotal, 0) + poLabour + poTransport - poDiscount
                ).toLocaleString()} BDT
              </div>

            </div>

            {/* Right side: Actions Sidebar */}
            <div className="space-y-3 lg:col-span-1 flex flex-col justify-between">
              
              {/* Cost Factors / Overhead Inputs (Cream Yellow bg) */}
              <div className="bg-[#f5f5f5] border border-slate-300 rounded p-2 shadow-sm text-xs space-y-2">
                <div className="font-bold text-emerald-800 border-b border-slate-200 pb-0.5 uppercase text-[10px]">
                  Overheads & Discounts
                </div>
                
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Transport Cost</label>
                  <input
                    type="number"
                    value={poTransport}
                    onChange={(e) => setPoTransport(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#ffffe2] text-slate-800 font-bold border border-slate-300 px-2 py-0.5 rounded-sm focus:outline-none text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Labour Charge</label>
                  <input
                    type="number"
                    value={poLabour}
                    onChange={(e) => setPoLabour(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#ffffe2] text-slate-800 font-bold border border-slate-300 px-2 py-0.5 rounded-sm focus:outline-none text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Negotiated Discount</label>
                  <input
                    type="number"
                    value={poDiscount}
                    onChange={(e) => setPoDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#ffffe2] text-slate-800 font-bold border border-slate-300 px-2 py-0.5 rounded-sm focus:outline-none text-[11px]"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleAddPOItemToGrid}
                  className="w-full bg-gradient-to-b from-[#fdfdfd] to-[#d6d6d6] hover:from-white hover:to-[#e1e1e1] border border-[#a6a6a6] text-slate-800 text-xs font-black py-2 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.15)] active:shadow-inner cursor-pointer text-center uppercase tracking-wider"
                >
                  Add PO Row
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPoCart([]);
                    alert('Procurement card grid cleared.');
                  }}
                  className="w-full bg-gradient-to-b from-[#fdfdfd] to-[#d6d6d6] hover:from-white hover:to-[#e1e1e1] border border-[#a6a6a6] text-slate-800 text-xs font-black py-2 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.15)] active:shadow-inner cursor-pointer text-center uppercase tracking-wider"
                >
                  Clear Fields
                </button>

                <button
                  type="button"
                  onClick={handleSavePurchaseOrder}
                  className="w-full bg-gradient-to-b from-[#fbfbfb] to-[#c5c5c5] hover:from-white hover:to-[#dbdbdb] border border-[#9b9b9b] text-emerald-900 text-xs font-black py-2.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_4px_rgba(0,0,0,0.2)] active:shadow-inner cursor-pointer text-center uppercase tracking-widest border-2"
                >
                  Save & Book PO
                </button>
              </div>

            </div>

          </div>

          {/* Historical Purchase Orders Log Book */}
          <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
            <div className="p-3 bg-[#3f3f46] text-white font-mono text-[11px] font-bold flex items-center justify-between">
              <span>Purchase Orders Ledger Archive</span>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300" />
                <input
                  type="text"
                  placeholder="Quick Filter..."
                  value={poSearch}
                  onChange={(e) => setPoSearch(e.target.value)}
                  className="pl-6 pr-2 py-0.5 bg-zinc-700 text-white placeholder-zinc-400 border border-zinc-600 rounded text-[10px] focus:outline-none"
                />
              </div>
            </div>

            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#f1f1f1] border-b border-slate-300 text-slate-600 font-bold">
                  <th className="py-2 px-3 border-r border-slate-200">PO Number</th>
                  <th className="py-2 px-3 border-r border-slate-200">Supplier Entity</th>
                  <th className="py-2 px-3 border-r border-slate-200">Order Date</th>
                  <th className="py-2 px-3 border-r border-slate-200">Items Ordered</th>
                  <th className="py-2 px-3 border-r border-slate-200 text-right">Subtotal</th>
                  <th className="py-2 px-3 border-r border-slate-200 text-right">Grand Total</th>
                  <th className="py-2 px-3 text-center">Receipt Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {purchaseOrders
                  .filter((po) => po.poNo.toLowerCase().includes(poSearch.toLowerCase()) || po.supplierName.toLowerCase().includes(poSearch.toLowerCase()))
                  .map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 border-r border-slate-200 font-bold text-indigo-700">{po.poNo}</td>
                      <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-800">{po.supplierName}</td>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-500">{po.date}</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-600">{po.items.length} Products</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right">৳{po.subtotal.toLocaleString()}</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right font-bold text-slate-800">৳{po.total.toLocaleString()}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${po.status === 'Received' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* =========================================================
          TAB 4: GOODS RECEIPT (GRN)
          ========================================================= */}
      {currentTab === 'goods_receipt' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-display">Goods Receipt Note (GRN) Register</h2>
            <p className="text-xs text-slate-400 mt-1">Verify incoming supply deliveries, matching shipping quantities against open purchase orders.</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50 uppercase tracking-wider">
                  <th className="py-3.5 px-6">PO Number</th>
                  <th className="py-3.5 px-6">Supplier Entity</th>
                  <th className="py-3.5 px-6 text-right">Order Valuation</th>
                  <th className="py-3.5 px-6 text-center">Fulfillment Status</th>
                  <th className="py-3.5 px-6 text-right">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => {
                  const isReceived = po.status === 'Received';
                  return (
                    <tr key={po.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-indigo-600">{po.poNo}</td>
                      <td className="py-4 px-6 font-bold text-slate-800">{po.supplierName}</td>
                      <td className="py-4 px-6 text-right font-black text-slate-800">৳{po.total.toLocaleString()}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${isReceived ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                          {isReceived ? 'Inventory Stocked' : 'Pending Receipt'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          disabled={isReceived}
                          onClick={() => {
                            onReceivePurchaseOrder(po.id);
                            alert(`Stock replenishment complete! Received inventory for PO: ${po.poNo}`);
                          }}
                          className={`px-3.5 py-1.5 font-bold rounded-lg text-[10px] cursor-pointer transition-colors ${isReceived ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}`}
                        >
                          {isReceived ? 'Stock Received' : 'Approve Delivery (GRN)'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: PURCHASE RETURNS
          ========================================================= */}
      {currentTab === 'purchase_returns' && (
        <div className="bg-[#f0f0f0] p-3 rounded-lg border-2 border-emerald-600 shadow-md text-slate-800 font-sans space-y-4">
          
          <div className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-300 pb-1 flex items-center justify-between">
            <span>Purchase Return / Debit Note Entry Terminal</span>
            <span className="text-emerald-700 font-black">WAREHOUSE OUTGOING DEVIATIONS</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            
            {/* Left side: Supplier info, Product config, Grid, Maroon red total */}
            <div className="lg:col-span-4 space-y-3">
              
              {/* Return Supplier Information Box */}
              <div className="bg-[#f5f5f5] border border-slate-300 p-2 rounded shadow-sm">
                <div className="text-[11px] font-bold text-emerald-800 border-b border-slate-200 pb-1 mb-2 uppercase tracking-wider">
                  Vendor Return Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Return ID</label>
                    <input
                      type="text"
                      readOnly
                      value={pretId}
                      className="w-full bg-[#ffffe2] text-slate-700 font-bold border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Return Date</label>
                    <input
                      type="date"
                      value={pretDate}
                      onChange={(e) => setPretDate(e.target.value)}
                      className="w-full bg-[#ffffe2] text-slate-800 font-semibold border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Supplier Name</label>
                    <select
                      value={pretSupplierId}
                      onChange={(e) => setPretSupplierId(e.target.value)}
                      className="w-full bg-[#ffffe2] text-slate-800 font-bold border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    >
                      <option value="">-- Select Supplier --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Source PO Ref</label>
                    <input
                      type="text"
                      value={pretPoRef}
                      onChange={(e) => setPretPoRef(e.target.value)}
                      placeholder="PO-2026-XXX"
                      className="w-full bg-white text-slate-850 border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Reason for return</label>
                    <select
                      value={pretReason}
                      onChange={(e) => setPretReason(e.target.value)}
                      className="w-full bg-[#ffffe2] text-slate-850 border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    >
                      <option value="Transit damage">Transit damage</option>
                      <option value="Specification mismatch">Specification mismatch</option>
                      <option value="Defective Finish">Defective Finish</option>
                      <option value="Expired stock">Expired stock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Return Configuration Box */}
              <div className="bg-[#f5f5f5] border border-slate-300 p-2 rounded shadow-sm">
                <div className="text-[11px] font-bold text-emerald-800 border-b border-slate-200 pb-1 mb-2 uppercase tracking-wider">
                  Returned Product Selection
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Product Name</label>
                    <select
                      value={pretProductId}
                      onChange={(e) => handleSelectProductForPret(e.target.value)}
                      className="w-full bg-[#ffffe2] text-slate-800 font-bold border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (৳{p.cost}/unit, Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Return Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={pretQty}
                      onChange={(e) => setPretQty(parseInt(e.target.value) || 1)}
                      className="w-full bg-white text-slate-800 border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Returned Unit Cost</label>
                    <input
                      type="number"
                      value={pretCost}
                      onChange={(e) => setPretCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#ffffe2] text-slate-850 border border-slate-300 px-2 py-1 rounded-sm focus:outline-none text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Purchase Return Items Grid Table */}
              <div className="border border-slate-300 rounded overflow-hidden bg-white shadow-sm">
                <div className="bg-[#3f3f46] text-white px-2 py-1 text-[11px] font-mono flex items-center justify-between select-none">
                  <span>Outgoing Return Line Items</span>
                  <span className="text-[10px] text-slate-300">Settle outstanding balances</span>
                </div>
                
                <div className="overflow-x-auto max-h-[180px]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-[#eeeeee] border-b border-slate-300 text-slate-600 font-bold">
                        <th className="py-1 px-2 border-r border-slate-300 w-16">No</th>
                        <th className="py-1 px-2 border-r border-slate-300">SKU Code</th>
                        <th className="py-1 px-2 border-r border-slate-300">Product Name</th>
                        <th className="py-1 px-2 border-r border-slate-300 text-right">Return Qty</th>
                        <th className="py-1 px-2 border-r border-slate-300 text-right">Unit Rate</th>
                        <th className="py-1 px-2 text-right">Debit Valuation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {pretCart.map((item, idx) => {
                        const p = products.find((prod) => prod.id === item.productId);
                        return (
                          <tr key={idx} className="hover:bg-slate-50 text-slate-700">
                            <td className="py-1 px-2 border-r border-slate-200">0{idx + 1}</td>
                            <td className="py-1 px-2 border-r border-slate-200">{item.sku}</td>
                            <td className="py-1 px-2 border-r border-slate-200 font-bold">{item.name}</td>
                            <td className="py-1 px-2 border-r border-slate-200 text-right font-bold text-emerald-800">
                              <div>{item.qty}</div>
                              {p?.pcsPerBox && p.pcsPerBox > 1 && (
                                <div className="text-[9px] text-indigo-600 font-semibold leading-tight">
                                  ({formatBoxQty(item.qty, p.pcsPerBox)})
                                </div>
                              )}
                            </td>
                            <td className="py-1 px-2 border-r border-slate-200 text-right">৳{item.cost.toLocaleString()}</td>
                            <td className="py-1 px-2 text-right font-bold">৳{item.subtotal.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                      {pretCart.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-bold bg-[#fafafa]">
                            Outgoing returns list is empty. Set return values above and click 'Add Row'
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Maroon Total Bar */}
              <div className="bg-[#800000] text-white p-2 rounded shadow-inner text-center font-black tracking-wider text-xs select-none">
                Total Debit Note Value : {pretCart.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString()} BDT
              </div>

            </div>

            {/* Right side: Actions Sidebar */}
            <div className="space-y-3 lg:col-span-1 flex flex-col justify-between">
              
              <div className="bg-[#f5f5f5] border border-slate-300 rounded p-2 shadow-sm text-xs space-y-2">
                <div className="font-bold text-slate-600 border-b border-slate-200 pb-0.5 uppercase text-[10px]">
                  Procurement Returns Policy
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Debit note adjustment automatically deducts outstanding ledger balances from the specified vendor ledger.
                </p>
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-850 p-1 rounded border border-amber-100 text-[10px]">
                  <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                  <span>Deducts raw materials stock count!</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleAddPretRow}
                  className="w-full bg-gradient-to-b from-[#fdfdfd] to-[#d6d6d6] hover:from-white hover:to-[#e1e1e1] border border-[#a6a6a6] text-slate-800 text-xs font-black py-2 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.15)] active:shadow-inner cursor-pointer text-center uppercase tracking-wider"
                >
                  Add Return Row
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPretCart([]);
                    alert('Debit Note items cleared successfully.');
                  }}
                  className="w-full bg-gradient-to-b from-[#fdfdfd] to-[#d6d6d6] hover:from-white hover:to-[#e1e1e1] border border-[#a6a6a6] text-slate-800 text-xs font-black py-2 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.15)] active:shadow-inner cursor-pointer text-center uppercase tracking-wider"
                >
                  Clear Fields
                </button>

                <button
                  type="button"
                  onClick={handleSavePurchaseReturn}
                  className="w-full bg-gradient-to-b from-[#fbfbfb] to-[#c5c5c5] hover:from-white hover:to-[#dbdbdb] border border-[#9b9b9b] text-emerald-900 text-xs font-black py-2.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_4px_rgba(0,0,0,0.2)] active:shadow-inner cursor-pointer text-center uppercase tracking-widest border-2"
                >
                  Save Return (Debit Note)
                </button>
              </div>

            </div>

          </div>

          {/* Historical Purchase Returns Table Log */}
          <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
            <div className="bg-[#3f3f46] text-white px-3 py-1 font-mono text-[11px] font-bold flex items-center justify-between">
              <span>Purchase Returns History Log (Debit Notes Ledger)</span>
              <span className="text-[10px] text-slate-300">Comprehensive Debit Logs</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#f1f1f1] border-b border-slate-300 text-slate-600 font-bold">
                    <th className="py-2 px-3 border-r border-slate-200">Return ID</th>
                    <th className="py-2 px-3 border-r border-slate-200">Source PO</th>
                    <th className="py-2 px-3 border-r border-slate-200">Supplier Name</th>
                    <th className="py-2 px-3 border-r border-slate-200">Return Date</th>
                    <th className="py-2 px-3 border-r border-slate-200">Reason for Return</th>
                    <th className="py-2 px-3 text-right">Value (Debit Credit)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {purchaseReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 border-r border-slate-200 font-bold text-indigo-700">{ret.id.toUpperCase()}</td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-slate-700">{ret.poNo}</td>
                      <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-800">{ret.supplierName}</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-500 font-medium">{ret.date}</td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        <span className="font-bold text-rose-600 flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span>{ret.reason}</span>
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-black text-rose-600">৳{ret.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================
          TAB 6: SUPPLIER PAYMENTS
          ========================================================= */}
      {currentTab === 'purchase_payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">Supplier Payments Ledger</h2>
              <p className="text-xs text-slate-400 mt-1">Audit historic payments disbursed to suppliers to maintain healthy vendor ledgers.</p>
            </div>
            <button
              onClick={() => setShowPayModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Record Payment Voucher</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Payment ID</th>
                  <th className="py-3.5 px-6">Supplier Entity</th>
                  <th className="py-3.5 px-6">Disbursement Date</th>
                  <th className="py-3.5 px-6">Settlement Account</th>
                  <th className="py-3.5 px-6 text-right">Disbursed Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-indigo-600">{pay.id.toUpperCase()}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">{pay.supplierName}</td>
                    <td className="py-4 px-6 text-slate-500 font-medium">{pay.date}</td>
                    <td className="py-4 px-6 text-slate-500 font-semibold">{pay.method}</td>
                    <td className="py-4 px-6 text-right font-black text-emerald-600">৳{pay.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          MODALS & OVERLAY FORMS
          ========================================================= */}

      {/* Create Purchase Order Modal */}
      {showPoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Generate Purchase Order</h3>
              <button onClick={() => setShowPoModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handlePoSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Supplier *</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer font-bold text-slate-800"
                >
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.companyName})</option>)}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Items & Unit Costs</label>
                  <button type="button" onClick={handleAddPoItemLine} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer">
                    <Plus className="h-3 w-3" /> Add Item Line
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select
                        value={item.productId}
                        onChange={(e) => handleUpdatePoItemField(idx, 'productId', e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                      >
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (৳{p.cost})</option>)}
                      </select>
                      <input
                        type="number" required min="1" placeholder="Qty" value={item.quantity}
                        onChange={(e) => handleUpdatePoItemField(idx, 'quantity', parseInt(e.target.value))}
                        className="w-16 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-center focus:outline-none font-bold"
                      />
                      <input
                        type="number" required min="1" placeholder="Cost" value={item.cost}
                        onChange={(e) => handleUpdatePoItemField(idx, 'cost', parseFloat(e.target.value))}
                        className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-right focus:outline-none font-bold text-indigo-600"
                      />
                      <button type="button" onClick={() => handleRemovePoItemLine(idx)} className="text-slate-400 hover:text-rose-600 font-bold p-1 cursor-pointer" disabled={poItems.length === 1}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowPoModal(false)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Generate PO Voucher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Supplier Modal */}
      {showSupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Register Supplier Entity</h4>
              <button onClick={() => setShowSupModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSupSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Supplier Representative Name *</label>
                <input
                  type="text" required placeholder="e.g. Kamal Uddin" value={supName}
                  onChange={(e) => setSupName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company Entity *</label>
                  <input
                    type="text" required placeholder="e.g. Siam Glass Ltd." value={supCompany}
                    onChange={(e) => setSupCompany(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Supplier segment</label>
                  <select value={supGroup} onChange={(e) => setSupGroup(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer">
                    {supplierGroups.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number *</label>
                  <input
                    type="text" required placeholder="01712-XXXXXX" value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email" placeholder="kamal@siamglass.com" value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowSupModal(false)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add Supplier segment Group</h4>
              <button onClick={() => setShowGroupModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleGroupSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Group Title *</label>
                <input
                  type="text" required placeholder="e.g. Cross-border Importer" value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowGroupModal(false)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-md text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold cursor-pointer">Save Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Purchase Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Record Return (Debit Note)</h4>
              <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleReturnSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Source PO No *</label>
                <input
                  type="text" required placeholder="e.g. PO-2026-001" value={retPoNo}
                  onChange={(e) => setRetPoNo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Supplier Entity Name *</label>
                <input
                  type="text" required placeholder="e.g. Siam Glass Ltd." value={retSupplier}
                  onChange={(e) => setRetSupplier(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Returned Value (৳) *</label>
                  <input
                    type="number" required placeholder="5000" value={retValue}
                    onChange={(e) => setRetValue(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none text-rose-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reason Category</label>
                  <select value={retReason} onChange={(e) => setRetReason(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer text-slate-600">
                    <option>Transit damage</option>
                    <option>Specification mismatch</option>
                    <option>Expired batch</option>
                    <option>Excess shipment</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowReturnModal(false)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Save Return Voucher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Voucher Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Record Payment Voucher</h4>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handlePaySubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Supplier Entity Name *</label>
                <input
                  type="text" required placeholder="e.g. Bengal Plastics PLC" value={paySupplierName}
                  onChange={(e) => setPaySupplierName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Disbursed Amount (৳) *</label>
                  <input
                    type="number" required placeholder="15000" value={payAmt}
                    onChange={(e) => setPayAmt(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-extrabold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Settlement Account</label>
                  <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer">
                    <option>MTB Current Account</option>
                    <option>DBBL Corporate Fund</option>
                    <option>Bkash Merchant Wallet</option>
                    <option>Nagad Business Pay</option>
                    <option>Petty Cash Vault</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowPayModal(false)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Authorize Disbursement</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
