import React, { useState, useEffect } from 'react';
import { validatePositiveNumber } from '../lib/validation';
import { Supplier, PurchaseOrder, Product, POItem, formatBoxQty } from '../types';
import ExcelImportModal, { FieldSchema } from './ExcelImportModal';
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
  CheckCircle,
  XCircle,
  Award,
  FileCheck,
  ClipboardList,
  Scale,
  TrendingUp,
  Percent,
  Star,
  Eye,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface PurchaseViewProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'outstandingBalance'>) => void;
  onUpdateSuppliers?: (suppliers: Supplier[]) => void;
  onAddPurchaseOrder: (po: PurchaseOrder) => void;
  onReceivePurchaseOrder: (poId: string) => void;
  activeSubTab?: string;
  onTabChange?: (tab: string, subTab?: string) => void;
}

export default function PurchaseView({
  suppliers,
  purchaseOrders,
  products,
  onAddSupplier,
  onUpdateSuppliers,
  onAddPurchaseOrder,
  onReceivePurchaseOrder,
  activeSubTab = 'purchase_orders',
  onTabChange,
}: PurchaseViewProps) {
  // Bind current selected view directly to activeSubTab
  const currentTab = [
    'suppliers',
    'supplier_groups',
    'purchase_requisitions',
    'request_quotations',
    'purchase_orders',
    'goods_receipt',
    'threeway_matching',
    'purchase_returns',
    'purchase_payments',
    'supplier_scorecard'
  ].includes(activeSubTab)
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

  // --- SAP PR-TO-PO WORKFLOW STATES ---
  const [requisitions, setRequisitions] = useState<any[]>(() => {
    const saved = localStorage.getItem('axiom_purchase_requisitions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'PR-2026-001',
        department: 'Engineering Department',
        productId: products[0]?.id || 'p1',
        productName: products[0]?.name || 'Standard Premium cement',
        quantity: 150,
        unit: products[0]?.unit || 'Bags',
        requestedDate: '2026-07-12',
        priority: 'High',
        justification: 'Foundation mixture for Tower 2 basement slab concrete casting.',
        status: 'Approved',
        dateCreated: '2026-07-07',
        poReference: ''
      },
      {
        id: 'PR-2026-002',
        department: 'Production Yard',
        productId: products[2]?.id || 'p3',
        productName: products[2]?.name || 'Deformed Steel Bar 60G (16mm)',
        quantity: 8,
        unit: products[2]?.unit || 'Tons',
        requestedDate: '2026-07-18',
        priority: 'Medium',
        justification: 'Reinforced columns assembly for warehouse expansion project.',
        status: 'Pending',
        dateCreated: '2026-07-08',
        poReference: ''
      },
      {
        id: 'PR-2026-003',
        department: 'Commercial Logistics',
        productId: products[1]?.id || 'p2',
        productName: products[1]?.name || 'Deformed Steel Bar 60G (12mm)',
        quantity: 5,
        unit: products[1]?.unit || 'Tons',
        requestedDate: '2026-07-20',
        priority: 'Low',
        justification: 'Ancillary frame testing for drainage duct grates.',
        status: 'Rejected',
        dateCreated: '2026-07-06',
        poReference: ''
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('axiom_purchase_requisitions', JSON.stringify(requisitions));
  }, [requisitions]);

  const [showPrModal, setShowPrModal] = useState(false);
  const [prDept, setPrDept] = useState('Engineering Department');
  const [prProductId, setPrProductId] = useState(products[0]?.id || '');
  const [prQty, setPrQty] = useState(10);
  const [prRequiredDate, setPrRequiredDate] = useState(new Date().toISOString().split('T')[0]);
  const [prPriority, setPrPriority] = useState('Medium');
  const [prJustification, setPrJustification] = useState('');

  // --- SAP RFQ WORKFLOW STATES ---
  const [rfqs, setRfqs] = useState<any[]>(() => {
    const saved = localStorage.getItem('axiom_sourcing_rfqs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'RFQ-2026-901',
        productId: products[0]?.id || 'p1',
        productName: products[0]?.name || 'Standard Premium cement',
        quantity: 300,
        unit: products[0]?.unit || 'Bags',
        targetDate: '2026-07-16',
        status: 'Sourcing',
        bids: [
          { supplierId: 's1', supplierName: 'Siam Glass Ltd.', price: 410, delivery: '2 Days', qualityRating: 98, overallScore: 94 },
          { supplierId: 's2', supplierName: 'Bengal Plastics PLC', price: 425, delivery: '1 Day', qualityRating: 95, overallScore: 91 },
          { supplierId: 's3', supplierName: 'Padma Cement Mills', price: 395, delivery: '5 Days', qualityRating: 91, overallScore: 89 }
        ]
      },
      {
        id: 'RFQ-2026-902',
        productId: products[1]?.id || 'p2',
        productName: products[1]?.name || 'Deformed Steel Bar 60G (12mm)',
        quantity: 12,
        unit: products[1]?.unit || 'Tons',
        targetDate: '2026-07-22',
        status: 'Sourcing',
        bids: [
          { supplierId: 's1', supplierName: 'Siam Glass Ltd.', price: 77500, delivery: '3 Days', qualityRating: 98, overallScore: 95 },
          { supplierId: 's2', supplierName: 'Bengal Plastics PLC', price: 76500, delivery: '5 Days', qualityRating: 94, overallScore: 90 },
          { supplierId: 's4', supplierName: 'Anwar Galvanizing Ltd.', price: 78000, delivery: '2 Days', qualityRating: 99, overallScore: 96 }
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('axiom_sourcing_rfqs', JSON.stringify(rfqs));
  }, [rfqs]);

  const [showRfqModal, setShowRfqModal] = useState(false);
  const [rfqProductId, setRfqProductId] = useState(products[0]?.id || '');
  const [rfqQty, setRfqQty] = useState(5);
  const [rfqTargetDate, setRfqTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [rfqSuppliers, setRfqSuppliers] = useState<string[]>([]);

  // --- SAP 3-WAY MATCHING STATES ---
  const [matchingRecords, setMatchingRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem('axiom_3way_matching');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'MATCH-2026-01',
        poNo: 'PO-2026-001',
        supplierName: 'Siam Glass Ltd.',
        productName: 'Standard Premium cement',
        poQty: 100,
        poRate: 400,
        poTotal: 40000,
        grnQty: 100,
        grnDate: '2026-07-02',
        grnStatus: 'Perfect Match',
        invNo: 'INV-SG-9901',
        invQty: 100,
        invRate: 400,
        invTotal: 40000,
        status: 'Matched',
        mismatchDetails: [],
        resolutionNotes: ''
      },
      {
        id: 'MATCH-2026-02',
        poNo: 'PO-2026-002',
        supplierName: 'Bengal Plastics PLC',
        productName: 'Deformed Steel Bar 60G (12mm)',
        poQty: 10,
        poRate: 78000,
        poTotal: 780000,
        grnQty: 9,
        grnDate: '2026-07-04',
        grnStatus: 'Short Received (1 Ton missing)',
        invNo: 'INV-BP-3012',
        invQty: 10,
        invRate: 78000,
        invTotal: 780000,
        status: 'Discrepancy',
        mismatchDetails: ['GRN Qty (9 Tons) does not match PO & Invoice Qty (10 Tons). Supply shortfall of 1 Ton detected.'],
        resolutionNotes: ''
      },
      {
        id: 'MATCH-2026-03',
        poNo: 'PO-2026-003',
        supplierName: 'Yard B Supplier Co.',
        productName: 'Deformed Steel Bar 60G (16mm)',
        poQty: 5,
        poRate: 75000,
        poTotal: 375000,
        grnQty: 5,
        grnDate: '2026-07-05',
        grnStatus: 'Perfect Match',
        invNo: 'INV-YB-1192',
        invQty: 5,
        invRate: 79000,
        invTotal: 395000,
        status: 'Discrepancy',
        mismatchDetails: ['Supplier Invoice Unit Rate (৳79,000/Ton) exceeds approved PO Price (৳75,000/Ton). Total price variance: +৳20,000.'],
        resolutionNotes: ''
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('axiom_3way_matching', JSON.stringify(matchingRecords));
  }, [matchingRecords]);

  const [selectedMatchForResolve, setSelectedMatchForResolve] = useState<any>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveAction, setResolveAction] = useState('Approve Variance');
  const [resolveNotes, setResolveNotes] = useState('');

  // --- SUPPLIER PERFORMANCE RATINGS STATE ---
  const [supplierRatings, setSupplierRatings] = useState<any[]>(() => {
    const saved = localStorage.getItem('axiom_supplier_ratings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        supplierId: 's1',
        supplierName: 'Siam Glass Ltd.',
        onTimeRate: 97.4,
        qualityRatio: 99.1,
        priceVariance: 100.0,
        rejectionRate: 0.9,
        activeOrders: 4,
        leadTimeDays: 2.1
      },
      {
        supplierId: 's2',
        supplierName: 'Bengal Plastics PLC',
        onTimeRate: 89.5,
        qualityRatio: 94.6,
        priceVariance: 98.2,
        rejectionRate: 5.4,
        activeOrders: 2,
        leadTimeDays: 4.5
      },
      {
        supplierId: 's3',
        supplierName: 'Padma Cement Mills',
        onTimeRate: 91.2,
        qualityRatio: 92.0,
        priceVariance: 100.0,
        rejectionRate: 8.0,
        activeOrders: 1,
        leadTimeDays: 3.8
      },
      {
        supplierId: 's4',
        supplierName: 'Anwar Galvanizing Ltd.',
        onTimeRate: 98.5,
        qualityRatio: 99.8,
        priceVariance: 97.5,
        rejectionRate: 0.2,
        activeOrders: 3,
        leadTimeDays: 1.8
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('axiom_supplier_ratings', JSON.stringify(supplierRatings));
  }, [supplierRatings]);

  // Advisor product category states
  const [advisingProductCategory, setAdvisingProductCategory] = useState('Cement');

  const [purchaseReturns, setPurchaseReturns] = useState([
    { id: 'ret_1', poNo: 'PO-2026-001', supplierName: 'Siam Glass Ltd.', date: '2026-07-01', value: 12000, reason: 'Transit breakage' },
    { id: 'ret_2', poNo: 'PO-2026-002', supplierName: 'Bengal Plastics PLC', date: '2026-07-04', value: 4500, reason: 'Specification mismatch' },
  ]);

  const [supplierPayments, setSupplierPayments] = useState([
    { id: 'pay_1', supplierName: 'Siam Glass Ltd.', date: '2026-07-02', amount: 45000, method: 'MTB Current Account' },
    { id: 'pay_2', supplierName: 'Bengal Plastics PLC', date: '2026-07-05', amount: 80000, method: 'Bkash Merchant Wallet' },
  ]);

  // --- SAP PR-TO-PO WORKFLOW HELPERS ---
  const [activeRFQId, setActiveRFQId] = useState<string>('RFQ-2026-901');

  const handleApprovePR = (id: string) => {
    setRequisitions(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  };
  
  const handleRejectPR = (id: string) => {
    setRequisitions(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  };

  const handleConvertToPO = (req: any) => {
    const firstSup = suppliers[0]?.id || '';
    setSelectedSupplierId(firstSup);
    setPoProductId(req.productId);
    setPoQty(req.quantity);
    
    const prod = products.find(p => p.id === req.productId);
    const unitCost = prod ? prod.cost : 0;
    setPoCost(unitCost);
    
    if (prod) {
      setPoCart([
        {
          productId: req.productId,
          sku: prod.sku,
          name: prod.name,
          qty: req.quantity,
          cost: unitCost,
          subtotal: req.quantity * unitCost,
        }
      ]);
    }
    
    setRequisitions(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Converted to PO', poReference: poInvoiceNo } : r));
    alert(`Purchase Requisition ${req.id} converted successfully! PO Form is prefilled with ${req.quantity} ${req.unit} of ${req.productName}. Choose a Supplier and click Save.`);
    
    if (onTabChange) {
      onTabChange('purchase', 'purchase_orders');
    }
  };

  const handlePrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prProductId) {
      alert('Select product to purchase.');
      return;
    }
    const p = products.find(prod => prod.id === prProductId);
    if (!p) return;
    
    const newPR = {
      id: `PR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      department: prDept,
      productId: prProductId,
      productName: p.name,
      quantity: prQty,
      unit: p.unit,
      requestedDate: prRequiredDate,
      priority: prPriority,
      justification: prJustification || 'No justification provided.',
      status: 'Pending',
      dateCreated: new Date().toISOString().split('T')[0],
      poReference: ''
    };
    
    setRequisitions(prev => [newPR, ...prev]);
    setShowPrModal(false);
    setPrJustification('');
    alert(`Purchase Requisition ${newPR.id} has been raised successfully by ${prDept}!`);
  };

  const handleRfqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqProductId) {
      alert('Select product for quotation request.');
      return;
    }
    const p = products.find(prod => prod.id === rfqProductId);
    if (!p) return;
    
    const bidPrices = [p.cost * 0.96, p.cost * 1.01, p.cost * 0.98];
    const deliveryTimes = ['2 Days', '1 Day', '4 Days'];
    const qualityRatios = [98, 95, 99];
    
    const calculatedBids = suppliers.slice(0, 3).map((sup, idx) => {
      const bidPrice = Math.round(bidPrices[idx % bidPrices.length]);
      const bidDeliv = deliveryTimes[idx % deliveryTimes.length];
      const bidQual = qualityRatios[idx % qualityRatios.length];
      const overallScore = Math.round((bidQual * 0.45) + ((p.cost / bidPrice) * 35) + (100 - parseInt(bidDeliv) * 6));
      return {
        supplierId: sup.id,
        supplierName: sup.name,
        price: bidPrice,
        delivery: bidDeliv,
        qualityRating: bidQual,
        overallScore: Math.min(100, overallScore)
      };
    });

    const newRFQ = {
      id: `RFQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      productId: rfqProductId,
      productName: p.name,
      quantity: rfqQty,
      unit: p.unit,
      targetDate: rfqTargetDate,
      status: 'Sourcing',
      bids: calculatedBids
    };

    setRfqs(prev => [newRFQ, ...prev]);
    setShowRfqModal(false);
    setActiveRFQId(newRFQ.id);
    alert(`Request for Quotation ${newRFQ.id} raised! Live bids from top registered suppliers have arrived.`);
  };

  const handleAwardRFQBid = (rfqId: string, bid: any) => {
    setSelectedSupplierId(bid.supplierId);
    
    const rfq = rfqs.find(r => r.id === rfqId);
    if (!rfq) return;
    
    setPoProductId(rfq.productId);
    setPoQty(rfq.quantity);
    setPoCost(bid.price);
    
    const p = products.find(prod => prod.id === rfq.productId);
    if (p) {
      setPoCart([
        {
          productId: rfq.productId,
          sku: p.sku,
          name: p.name,
          qty: rfq.quantity,
          cost: bid.price,
          subtotal: rfq.quantity * bid.price
        }
      ]);
    }
    
    setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, status: 'Awarded' } : r));
    alert(`Contract awarded to ${bid.supplierName} at ৳${bid.price.toLocaleString()} per unit! PO prefilled.`);
    
    if (onTabChange) {
      onTabChange('purchase', 'purchase_orders');
    }
  };

  const handleResolveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForResolve) return;
    
    setMatchingRecords(prev => prev.map(m => 
      m.id === selectedMatchForResolve.id 
        ? { ...m, status: `Resolved (${resolveAction})`, resolutionNotes: resolveNotes } 
        : m
    ));
    
    setShowResolveModal(false);
    setSelectedMatchForResolve(null);
    setResolveNotes('');
    alert(`Reconciliation logged! Case ${selectedMatchForResolve.id} has been resolved via "${resolveAction}".`);
  };

  // --- MODAL / FORM STATES ---
  const [showPoModal, setShowPoModal] = useState(false);
  const [showSupModal, setShowSupModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // --- FORM VALUES ---
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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

    const errors: Record<string, string> = {};
    const qtyVal = validatePositiveNumber(poQty, 'Quantity', 'পরিমাণ', false);
    if (!qtyVal.isValid) errors.poQty = qtyVal.message;

    const costVal = validatePositiveNumber(poCost, 'Unit Cost', 'ইউনিট খরচ', true);
    if (!costVal.isValid) errors.poCost = costVal.message;

    if (Object.keys(errors).length > 0) {
      setFormErrors(prev => ({ ...prev, ...errors }));
      return;
    }

    setFormErrors(prev => {
      const copy = { ...prev };
      delete copy.poQty;
      delete copy.poCost;
      return copy;
    });

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

    const errors: Record<string, string> = {};
    const transportVal = validatePositiveNumber(poTransport, 'Transport Cost', 'পরিবহন খরচ', true);
    if (!transportVal.isValid) errors.poTransport = transportVal.message;

    const labourVal = validatePositiveNumber(poLabour, 'Labour Charge', 'শ্রমিক খরচ', true);
    if (!labourVal.isValid) errors.poLabour = labourVal.message;

    const discountVal = validatePositiveNumber(poDiscount, 'Negotiated Discount', 'ডিসকাউন্ট', true);
    if (!discountVal.isValid) errors.poDiscount = discountVal.message;

    if (Object.keys(errors).length > 0) {
      setFormErrors(prev => ({ ...prev, ...errors }));
      alert('Please fix overhead/discount validation errors before saving.');
      return;
    }

    setFormErrors(prev => {
      const copy = { ...prev };
      delete copy.poTransport;
      delete copy.poLabour;
      delete copy.poDiscount;
      return copy;
    });

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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-all"
                title="Bulk import suppliers from Excel/CSV / এক্সেল/সিএসভি থেকে সরবরাহকারী বাল্ক ইমপোর্ট করুন"
              >
                <Plus className="h-4 w-4" />
                <span>Import from Excel / ইমপোর্ট</span>
              </button>
              <button
                onClick={() => setShowSupModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Register Supplier</span>
              </button>
            </div>
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
                      onChange={(e) => setPoQty(parseInt(e.target.value) || 0)}
                      className={`w-full bg-white text-slate-800 border px-2 py-1 rounded-sm focus:outline-none text-[11px] ${formErrors.poQty ? 'border-rose-500' : 'border-slate-300'}`}
                    />
                    {formErrors.poQty && (
                      <span className="block text-[9px] text-rose-600 font-bold mt-0.5 leading-tight">{formErrors.poQty}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Base Unit Cost</label>
                    <input
                      type="number"
                      value={poCost}
                      onChange={(e) => setPoCost(parseFloat(e.target.value) || 0)}
                      className={`w-full bg-[#ffffe2] text-slate-800 font-bold border px-2 py-1 rounded-sm focus:outline-none text-[11px] ${formErrors.poCost ? 'border-rose-500' : 'border-slate-300'}`}
                    />
                    {formErrors.poCost && (
                      <span className="block text-[9px] text-rose-600 font-bold mt-0.5 leading-tight">{formErrors.poCost}</span>
                    )}
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
                    className={`w-full bg-[#ffffe2] text-slate-800 font-bold border px-2 py-0.5 rounded-sm focus:outline-none text-[11px] ${formErrors.poTransport ? 'border-rose-500' : 'border-slate-300'}`}
                  />
                  {formErrors.poTransport && (
                    <span className="block text-[9px] text-rose-600 font-bold mt-0.5 leading-tight">{formErrors.poTransport}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Labour Charge</label>
                  <input
                    type="number"
                    value={poLabour}
                    onChange={(e) => setPoLabour(parseFloat(e.target.value) || 0)}
                    className={`w-full bg-[#ffffe2] text-slate-800 font-bold border px-2 py-0.5 rounded-sm focus:outline-none text-[11px] ${formErrors.poLabour ? 'border-rose-500' : 'border-slate-300'}`}
                  />
                  {formErrors.poLabour && (
                    <span className="block text-[9px] text-rose-600 font-bold mt-0.5 leading-tight">{formErrors.poLabour}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Negotiated Discount</label>
                  <input
                    type="number"
                    value={poDiscount}
                    onChange={(e) => setPoDiscount(parseFloat(e.target.value) || 0)}
                    className={`w-full bg-[#ffffe2] text-slate-800 font-bold border px-2 py-0.5 rounded-sm focus:outline-none text-[11px] ${formErrors.poDiscount ? 'border-rose-500' : 'border-slate-300'}`}
                  />
                  {formErrors.poDiscount && (
                    <span className="block text-[9px] text-rose-600 font-bold mt-0.5 leading-tight">{formErrors.poDiscount}</span>
                  )}
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
          TAB 7: PURCHASE REQUISITIONS (PR)
          ========================================================= */}
      {currentTab === 'purchase_requisitions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">Departmental Purchase Requisitions (PR)</h2>
              <p className="text-xs text-slate-400 mt-1">Raise, audit, and approve internal product procurement requests from cross-functional divisions.</p>
            </div>
            <button
              onClick={() => setShowPrModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Raise Requisition (PR)</span>
            </button>
          </div>

          {/* PR Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Filed PRs</span>
              <span className="text-xl font-extrabold text-slate-700 mt-1 block">{requisitions.length} Cases</span>
            </div>
            <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Pending Review</span>
              <span className="text-xl font-extrabold text-amber-600 mt-1 block">
                {requisitions.filter(r => r.status === 'Pending').length} Pending
              </span>
            </div>
            <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Approved PRs</span>
              <span className="text-xl font-extrabold text-emerald-600 mt-1 block">
                {requisitions.filter(r => r.status === 'Approved').length} Approved
              </span>
            </div>
            <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Procured (Converted)</span>
              <span className="text-xl font-extrabold text-indigo-600 mt-1 block">
                {requisitions.filter(r => r.status === 'Converted to PO').length} Active POs
              </span>
            </div>
          </div>

          {/* Requisitions List */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Internal Requisition Ledger</span>
              <span className="text-[10px] text-slate-400 font-medium">SAP workflow matching</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50 uppercase tracking-wider">
                    <th className="py-3 px-6">PR ID</th>
                    <th className="py-3 px-6">Division / Dept</th>
                    <th className="py-3 px-6">Product / Material</th>
                    <th className="py-3 px-6 text-right">Req. Qty</th>
                    <th className="py-3 px-6 text-center">Required Date</th>
                    <th className="py-3 px-6 text-center">Priority</th>
                    <th className="py-3 px-6">Justification Notes</th>
                    <th className="py-3 px-6 text-center">Workflow Status</th>
                    <th className="py-3 px-6 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requisitions.map((req) => {
                    const isPending = req.status === 'Pending';
                    const isApproved = req.status === 'Approved';
                    const isConverted = req.status === 'Converted to PO';
                    const isRejected = req.status === 'Rejected';

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-slate-800">{req.id}</td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-700 block">{req.department}</span>
                          <span className="text-[9px] text-slate-400 block font-mono mt-0.5">Filed: {req.dateCreated}</span>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-800">{req.productName}</td>
                        <td className="py-4 px-6 text-right font-extrabold text-slate-700">
                          {req.quantity} {req.unit}
                        </td>
                        <td className="py-4 px-6 text-center text-slate-500 font-medium font-mono">{req.requestedDate}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            req.priority === 'High' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                              : req.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {req.priority}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 max-w-xs font-medium italic truncate" title={req.justification}>
                          {req.justification}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isPending 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                              : isApproved 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : isConverted
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isPending && <RefreshCw className="h-3 w-3 animate-spin text-amber-500" />}
                            {isApproved && <CheckCircle className="h-3 w-3 text-emerald-600" />}
                            {isConverted && <FileCheck className="h-3 w-3 text-indigo-600" />}
                            {isRejected && <XCircle className="h-3 w-3 text-rose-600" />}
                            <span>{req.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApprovePR(req.id)}
                                  className="p-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                                  title="Approve Requisition"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectPR(req.id)}
                                  className="p-1 rounded bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 cursor-pointer"
                                  title="Reject Requisition"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {isApproved && (
                              <button
                                onClick={() => handleConvertToPO(req)}
                                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-[10px] font-extrabold rounded-md shadow-sm cursor-pointer"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                <span>Convert to PO</span>
                              </button>
                            )}
                            {isConverted && (
                              <span className="font-mono text-[10px] text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                PO Generated ({req.poReference || 'Active'})
                              </span>
                            )}
                            {isRejected && (
                              <span className="text-[10px] text-slate-400 italic">No action required</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 8: REQUEST FOR QUOTATION (RFQ)
          ========================================================= */}
      {currentTab === 'request_quotations' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">SAP Request for Quotation (RFQ)</h2>
              <p className="text-xs text-slate-400 mt-1">Consolidate multiple supplier bids side-by-side to guarantee premium market pricing and delivery covenants.</p>
            </div>
            <button
              onClick={() => setShowRfqModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Launch Sourcing Event (RFQ)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* RFQ Events List (Left) */}
            <div className="lg:col-span-1 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Open Sourcing Events</span>
              
              <div className="space-y-3">
                {rfqs.map((rfq) => {
                  const isActive = activeRFQId === rfq.id;
                  return (
                    <div
                      key={rfq.id}
                      onClick={() => setActiveRFQId(rfq.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white relative overflow-hidden ${
                        isActive 
                          ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/10' 
                          : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                      }`}
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[10px] text-slate-400 font-bold">{rfq.id}</span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          rfq.status === 'Sourcing' 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {rfq.status}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <h4 className="font-extrabold text-slate-800 text-xs">{rfq.productName}</h4>
                        <span className="text-[10px] text-slate-400 block mt-1">Sourcing Qty: <strong className="text-slate-600">{rfq.quantity} {rfq.unit}</strong></span>
                        <span className="text-[10px] text-slate-400 block">Required by: <strong className="text-slate-600">{rfq.targetDate}</strong></span>
                      </div>

                      <div className="border-t border-slate-50 mt-3 pt-3 flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Received Offers</span>
                        <span className="font-bold text-indigo-600">{rfq.bids.length} Live Bids</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Side-by-side Bidding Comparison Grid (Right) */}
            <div className="lg:col-span-2 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Bidding Comparison Matrix</span>

              {(() => {
                const activeRfq = rfqs.find(r => r.id === activeRFQId);
                if (!activeRfq) {
                  return (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-400 font-bold">
                      Select an RFQ sourcing event on the left to compare live bidder quotation sheets.
                    </div>
                  );
                }

                // Identify bid metrics
                const prices = activeRfq.bids.map((b: any) => b.price);
                const minPrice = Math.min(...prices);
                const maxScore = Math.max(...activeRfq.bids.map((b: any) => b.overallScore));

                return (
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden space-y-6">
                    <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <span className="font-mono text-[9px] text-indigo-600 font-bold uppercase tracking-wider block">Event Active Evaluation</span>
                        <h3 className="font-bold text-sm text-slate-800 mt-0.5">{activeRfq.productName} ({activeRfq.quantity} {activeRfq.unit})</h3>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                        RFQ-Ref: {activeRfq.id}
                      </span>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl">
                          <span className="text-[9px] text-emerald-800 font-bold uppercase block tracking-wider">Best Price Yield</span>
                          <span className="text-lg font-black text-emerald-800 mt-1 block">৳{minPrice.toLocaleString()}</span>
                          <span className="text-[10px] text-emerald-600 block mt-0.5">Approved supplier offer</span>
                        </div>
                        <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl">
                          <span className="text-[9px] text-indigo-800 font-bold uppercase block tracking-wider">Top SAP Score</span>
                          <span className="text-lg font-black text-indigo-800 mt-1 block">{maxScore}% Score</span>
                          <span className="text-[10px] text-indigo-600 block mt-0.5">Quality & delivery index</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">Required Date</span>
                          <span className="text-lg font-black text-slate-700 mt-1 block font-mono">{activeRfq.targetDate}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Target lead timeframe</span>
                        </div>
                      </div>

                      {/* Side-by-side Matrix Table */}
                      <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/10">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider">
                              <th className="py-2.5 px-4">Supplier Entity / Bidder</th>
                              <th className="py-2.5 px-4 text-right">Quoted Unit Rate</th>
                              <th className="py-2.5 px-4 text-center">Lead Time</th>
                              <th className="py-2.5 px-4 text-center">Quality Rating</th>
                              <th className="py-2.5 px-4 text-center">Weighted Score</th>
                              <th className="py-2.5 px-4 text-right">Procurement Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150">
                            {activeRfq.bids.map((bid: any) => {
                              const isLowestPrice = bid.price === minPrice;
                              const isBestScore = bid.overallScore === maxScore;
                              const isAwarded = activeRfq.status === 'Awarded';

                              return (
                                <tr key={bid.supplierId} className="hover:bg-slate-50/30 transition-colors">
                                  <td className="py-3.5 px-4">
                                    <div className="flex flex-col">
                                      <span className="font-extrabold text-slate-800">{bid.supplierName}</span>
                                      <div className="flex gap-1.5 mt-1">
                                        {isLowestPrice && (
                                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Lowest Bid</span>
                                        )}
                                        {isBestScore && (
                                          <span className="bg-indigo-100 text-indigo-800 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Best Performance</span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <span className="font-extrabold text-slate-800 font-mono">৳{bid.price.toLocaleString()}</span>
                                    <span className="text-[9px] text-slate-400 block mt-0.5">Est. Total: ৳{(bid.price * activeRfq.quantity).toLocaleString()}</span>
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-bold text-slate-600 font-mono">{bid.delivery}</td>
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                      <span className="font-mono font-bold text-slate-700">{bid.qualityRating}%</span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="inline-flex items-center gap-1.5">
                                      <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${isBestScore ? 'bg-indigo-600' : 'bg-slate-400'}`} style={{ width: `${bid.overallScore}%` }} />
                                      </div>
                                      <span className="font-bold text-slate-800 font-mono text-[10px]">{bid.overallScore}%</span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <button
                                      disabled={isAwarded}
                                      onClick={() => handleAwardRFQBid(activeRfq.id, bid)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 border cursor-pointer transition-all ml-auto ${
                                        isAwarded 
                                          ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
                                          : 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 shadow-sm'
                                      }`}
                                    >
                                      <Award className="h-3.5 w-3.5 shrink-0" />
                                      <span>{isAwarded ? 'Event Awarded' : 'Award & Create PO'}</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          TAB 9: 3-WAY MATCHING SYSTEM
          ========================================================= */}
      {currentTab === 'threeway_matching' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">SAP Automated 3-Way Matching</h2>
              <p className="text-xs text-slate-400 mt-1">Cross-check Purchase Order values, Goods Received counts, and Supplier Invoices to flag quantity or price discrepancies.</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-emerald-600" /> Continuous Auto-Auditing Active
            </span>
          </div>

          {/* Educational matching framework diagram */}
          <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-800/50 rounded-bl-full flex items-center justify-end pr-8 pt-8 text-indigo-600/30">
              <Scale className="h-20 w-20" />
            </div>
            
            <div className="max-w-xl">
              <h4 className="font-extrabold text-sm font-display">How Enterprise 3-Way Matching Works</h4>
              <p className="text-xs text-indigo-200 mt-1 leading-relaxed">The system locks data sets across three transactional states to prevent over-billing, vendor theft, or warehouse short-shipments before payments are authorized.</p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 font-mono text-[10px]">
                <div className="bg-indigo-800/80 border border-indigo-700 px-3.5 py-2 rounded-lg text-center w-full sm:w-auto">
                  <span className="font-bold block">1. Purchase Order (PO)</span>
                  <span className="text-[9px] text-indigo-300 block mt-0.5">Agreed rates & quantities</span>
                </div>
                <div className="text-indigo-400 font-black">➔</div>
                <div className="bg-indigo-800/80 border border-indigo-700 px-3.5 py-2 rounded-lg text-center w-full sm:w-auto">
                  <span className="font-bold block">2. Goods Receipt (GRN)</span>
                  <span className="text-[9px] text-indigo-300 block mt-0.5">Physical goods count received</span>
                </div>
                <div className="text-indigo-400 font-black">➔</div>
                <div className="bg-indigo-800/80 border border-indigo-700 px-3.5 py-2 rounded-lg text-center w-full sm:w-auto">
                  <span className="font-bold block">3. Supplier Invoice</span>
                  <span className="text-[9px] text-indigo-300 block mt-0.5">Billed rate & quantity amount</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Ledger table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Automated Audit Matrix</span>
              <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-100">
                {matchingRecords.filter(m => m.status === 'Discrepancy').length} Active Discrepancies
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Case Reference</th>
                    <th className="py-3.5 px-6">Linked Supplier</th>
                    <th className="py-3.5 px-6">Product / Material</th>
                    <th className="py-3.5 px-6 text-right">1. PO parameters</th>
                    <th className="py-3.5 px-6 text-right">2. GRN parameters</th>
                    <th className="py-3.5 px-6 text-right">3. Invoice parameters</th>
                    <th className="py-3.5 px-6 text-center">Match Audit</th>
                    <th className="py-3.5 px-6 text-right">Action Handler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matchingRecords.map((match) => {
                    const isPerfect = match.status === 'Matched';
                    const isDiscrepancy = match.status === 'Discrepancy';

                    return (
                      <tr key={match.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-mono font-bold text-slate-800 block">{match.id}</span>
                          <span className="font-mono text-[10px] text-indigo-600 font-extrabold mt-0.5 block">{match.poNo}</span>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-800">{match.supplierName}</td>
                        <td className="py-4 px-6 font-bold text-slate-800">{match.productName}</td>
                        <td className="py-4 px-6 text-right font-mono">
                          <span className="font-bold text-slate-700">{match.poQty} Units</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Rate: ৳{match.poRate.toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-slate-500 block">Val: ৳{match.poTotal.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono">
                          <span className="font-bold text-slate-700">{match.grnQty} Units</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Date: {match.grnDate}</span>
                          <span className="text-[10px] font-bold text-slate-500 block">{match.grnStatus}</span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono">
                          <span className="font-bold text-slate-700">{match.invQty} Units</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Inv Ref: {match.invNo}</span>
                          <span className="text-[10px] font-bold text-slate-500 block">Billed: ৳{match.invTotal.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            isPerfect 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : isDiscrepancy 
                              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {isPerfect && <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                            {isDiscrepancy && <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />}
                            {!isPerfect && !isDiscrepancy && <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />}
                            <span>{match.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {isDiscrepancy ? (
                            <button
                              onClick={() => {
                                setSelectedMatchForResolve(match);
                                setShowResolveModal(true);
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm cursor-pointer"
                            >
                              Resolve Discrepancy
                            </button>
                          ) : (
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 italic block">Audited & Verified</span>
                              {match.resolutionNotes && (
                                <span className="text-[9px] text-slate-500 block truncate max-w-[120px] font-medium" title={match.resolutionNotes}>
                                  Note: {match.resolutionNotes}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 10: SUPPLIER PERFORMANCE SCORECARD
          ========================================================= */}
      {currentTab === 'supplier_scorecard' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-display">SAP Supplier Performance Scorecard</h2>
            <p className="text-xs text-slate-400 mt-1">Real-time performance rating calculated from shipment promptness, return indices, and actual contract billing variance.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sourcing Advisor Bento Widget */}
            <div className="lg:col-span-1 bg-gradient-to-br from-indigo-900 to-slate-950 text-white p-6 rounded-2xl shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-300">SAP Smart Sourcing Advisor</h3>
                  <span className="text-[9px] text-slate-400">Algorithmic vendor matching</span>
                </div>
              </div>

              <div className="border-t border-indigo-800/40 pt-3.5 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Target Procurement Material Category</label>
                  <select
                    value={advisingProductCategory}
                    onChange={(e) => setAdvisingProductCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="Cement">Cement Products Sourcing</option>
                    <option value="Steel Bars">Deformed Steel Reinforcements</option>
                    <option value="Chemicals">Industrial Resin & Chemicals</option>
                  </select>
                </div>

                {/* Sourcing calculation logic */}
                {(() => {
                  let recommendedSupplier = '';
                  let overallScore = 0;
                  let highlightMetric = '';

                  if (advisingProductCategory === 'Cement') {
                    recommendedSupplier = 'Siam Glass Ltd.';
                    overallScore = 98.8;
                    highlightMetric = '97.4% On-time delivery rate & 2-day short lead time';
                  } else if (advisingProductCategory === 'Steel Bars') {
                    recommendedSupplier = 'Anwar Galvanizing Ltd.';
                    overallScore = 98.6;
                    highlightMetric = '99.8% Perfect Quality acceptance ratio with zero defects';
                  } else {
                    recommendedSupplier = 'Bengal Plastics PLC';
                    overallScore = 90.7;
                    highlightMetric = 'Outstanding Price Variance matching at 98.2%';
                  }

                  return (
                    <div className="bg-indigo-950/80 border border-indigo-800/50 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="bg-amber-400/20 text-amber-300 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                          🏆 Best Match Candidate
                        </span>
                        <span className="font-mono text-xs text-amber-400 font-black">{overallScore}%</span>
                      </div>
                      
                      <div>
                        <span className="font-extrabold text-white text-sm block">{recommendedSupplier}</span>
                        <span className="text-[10px] text-indigo-300 block mt-1">{highlightMetric}</span>
                      </div>

                      <div className="border-t border-indigo-900 pt-2 flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>Lead-Time: 1.8-2.1 Days</span>
                        <span>Rejection: &lt;0.5%</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Performance List Scorecard (Right) */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Supplier Performance Index</span>
                <span className="text-[10px] text-slate-400">Weights: Quality (40%), Promptness (40%), Price Variance (20%)</span>
              </div>

              <div className="space-y-6">
                {supplierRatings.map((rating) => {
                  const scoreTotal = (rating.onTimeRate * 0.4) + (rating.qualityRatio * 0.4) + (rating.priceVariance * 0.2);
                  let grade = 'B';
                  let gradeColor = 'text-amber-500 bg-amber-50 border-amber-100';
                  
                  if (scoreTotal >= 96) {
                    grade = 'A+';
                    gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
                  } else if (scoreTotal >= 90) {
                    grade = 'A';
                    gradeColor = 'text-indigo-700 bg-indigo-50 border-indigo-100';
                  } else if (scoreTotal >= 80) {
                    grade = 'B';
                    gradeColor = 'text-amber-700 bg-amber-50 border-amber-100';
                  } else {
                    grade = 'F';
                    gradeColor = 'text-rose-700 bg-rose-50 border-rose-100';
                  }

                  return (
                    <div key={rating.supplierId} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="space-y-1 w-full sm:w-1/4">
                        <h4 className="font-extrabold text-slate-800 text-sm">{rating.supplierName}</h4>
                        <div className="flex items-center gap-1 font-mono text-[9px] text-slate-400">
                          <span>Active orders: {rating.activeOrders}</span>
                          <span>•</span>
                          <span>Lead Time: {rating.leadTimeDays} Days</span>
                        </div>
                      </div>

                      {/* Score metrics sliders */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        {/* On-Time */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-medium text-slate-400">
                            <span>On-Time Delivery</span>
                            <span className="font-bold text-slate-700 font-mono">{rating.onTimeRate}%</span>
                          </div>
                          <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${rating.onTimeRate}%` }} />
                          </div>
                        </div>

                        {/* Quality */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-medium text-slate-400">
                            <span>Quality Ratio</span>
                            <span className="font-bold text-slate-700 font-mono">{rating.qualityRatio}%</span>
                          </div>
                          <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${rating.qualityRatio}%` }} />
                          </div>
                        </div>

                        {/* Price variance */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-medium text-slate-400">
                            <span>Price Contract Variance</span>
                            <span className="font-bold text-slate-700 font-mono">{rating.priceVariance}%</span>
                          </div>
                          <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${rating.priceVariance}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Score Grade Card */}
                      <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-3.5 sm:pt-0 shrink-0">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold">Overall Score</span>
                          <span className="text-base font-black text-slate-800 block font-mono">{scoreTotal.toFixed(1)}%</span>
                        </div>
                        <div className={`h-11 w-11 rounded-xl border flex items-center justify-center font-black text-base shrink-0 ${gradeColor}`}>
                          {grade}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

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

      {/* Raise Purchase Requisition Modal */}
      {showPrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 text-xs text-left">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-left">Raise Departmental Requisition (PR)</h4>
              <button onClick={() => setShowPrModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handlePrSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Requesting Division *</label>
                  <select
                    value={prDept}
                    onChange={(e) => setPrDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold text-slate-800"
                  >
                    <option>Engineering Department</option>
                    <option>Production Yard</option>
                    <option>Commercial Logistics</option>
                    <option>IT Administration</option>
                    <option>Site Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Priority Class *</label>
                  <select
                    value={prPriority}
                    onChange={(e) => setPrPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold text-slate-800"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Material / Product *</label>
                <select
                  value={prProductId}
                  onChange={(e) => setPrProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold text-slate-800"
                >
                  <option value="">-- Choose Material --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Required Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={prQty}
                    onChange={(e) => setPrQty(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold text-slate-800 text-left"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Required By Date *</label>
                  <input
                    type="date"
                    required
                    value={prRequiredDate}
                    onChange={(e) => setPrRequiredDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Commercial Justification *</label>
                <textarea
                  required
                  rows={2}
                  value={prJustification}
                  onChange={(e) => setPrJustification(e.target.value)}
                  placeholder="Explain why this purchase is required for site operations..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none text-left"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowPrModal(false)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">File Requisition</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Launch Sourcing Event (RFQ) Modal */}
      {showRfqModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 text-xs text-left">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-left">Launch Sourcing Event (RFQ)</h4>
              <button onClick={() => setShowRfqModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleRfqSubmit} className="p-5 space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Material to Source *</label>
                <select
                  value={rfqProductId}
                  onChange={(e) => setRfqProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold text-slate-800"
                >
                  <option value="">-- Choose Material --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Quantity to Purchase *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={rfqQty}
                    onChange={(e) => setRfqQty(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold text-slate-800 text-left"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Quotation Deadline *</label>
                  <input
                    type="date"
                    required
                    value={rfqTargetDate}
                    onChange={(e) => setRfqTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Invite Sourcing Suppliers *</label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                  {suppliers.map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded text-indigo-600 border-slate-300"
                      />
                      <span>{s.name} ({s.companyName})</span>
                    </label>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1 text-left">Invited vendors receive automatic SAP pricing sheet submission triggers.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowRfqModal(false)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Publish RFQ Bidding</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve 3-Way Match Discrepancy Modal */}
      {showResolveModal && selectedMatchForResolve && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 text-xs text-left">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-left">Log SAP Discrepancy Reconciliation</h4>
              <button onClick={() => { setShowResolveModal(false); setSelectedMatchForResolve(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleResolveMatch} className="p-5 space-y-4">
              <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-rose-800 space-y-1.5 font-medium text-left">
                <span className="font-bold text-[10px] uppercase tracking-wider text-rose-500 block text-left">Flagged Discrepancy Details</span>
                <p className="text-xs leading-relaxed text-left">{selectedMatchForResolve.mismatchDetails[0]}</p>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Reconciliation Resolution Action *</label>
                <select
                  value={resolveAction}
                  onChange={(e) => setResolveAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none font-bold text-slate-800 cursor-pointer"
                >
                  <option value="Approve Variance">Approve price/quantity variance (Enterprise Exception Allowed)</option>
                  <option value="Request Credit Note">Request Supplier Credit Note (Debit Supplier Ledger)</option>
                  <option value="Force Match">Force Match (Force override)</option>
                </select>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Audit Resolution Notes / Comments *</label>
                <textarea
                  required
                  rows={3}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Write compliance override notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none text-left"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => { setShowResolveModal(false); setSelectedMatchForResolve(null); }} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Commit Reconciliation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Excel/CSV Bulk Import Modal */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        schema={[
          { key: 'name', labelEn: 'Supplier Representative Name', labelBn: 'সরবরাহকারী প্রতিনিধির নাম', type: 'string', required: true },
          { key: 'companyName', labelEn: 'Company Entity', labelBn: 'প্রতিষ্ঠানের নাম', type: 'string', required: true },
          { key: 'group', labelEn: 'Supplier Segment', labelBn: 'সরবরাহকারী গ্রুপ', type: 'string', required: true },
          { key: 'phone', labelEn: 'Phone Number', labelBn: 'ফোন নম্বর', type: 'string', required: true, validationType: 'phone' },
          { key: 'email', labelEn: 'Email Address', labelBn: 'ইমেল ঠিকানা', type: 'string', required: false, validationType: 'email' },
          { key: 'outstandingBalance', labelEn: 'Outstanding Balance (৳)', labelBn: 'বকেয়া ব্যালেন্স', type: 'number', required: false, validationType: 'positiveNumber' },
        ]}
        existingData={suppliers}
        uniqueKey="phone" // Let's use phone as unique identifier for suppliers too
        collectionNameEn="Suppliers"
        collectionNameBn="সরবরাহকারী"
        onSave={(updatedSuppliers) => {
          if (onUpdateSuppliers) {
            onUpdateSuppliers(updatedSuppliers);
          }
          setIsImportModalOpen(false);
        }}
      />

    </div>
  );
}
