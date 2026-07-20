import { Invoice, Customer, Supplier, Product, PurchaseOrder, BankAccount } from '../types';

// Helper to normalize dates to local YYYY-MM-DD
export function getLocalDateString(dateInput: any): string {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    // Extract YYYY-MM-DD
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return match[0];
    const parsed = new Date(dateInput);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return dateInput.split('T')[0];
  }
  if (dateInput instanceof Date) {
    const y = dateInput.getFullYear();
    const m = String(dateInput.getMonth() + 1).padStart(2, '0');
    const d = String(dateInput.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
}

// 1. getSalesByDateRange
export function getSalesByDateRange(
  invoices: Invoice[],
  startDate: string,
  endDate: string
) {
  const startStr = getLocalDateString(startDate);
  const endStr = getLocalDateString(endDate);

  const filtered = invoices.filter(inv => {
    const invDateStr = getLocalDateString(inv.date);
    if (!invDateStr) return false;
    return invDateStr >= startStr && invDateStr <= endStr;
  });

  const totalAmount = filtered.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const invoiceCount = filtered.length;

  return {
    startDate: startStr,
    endDate: endStr,
    totalAmount,
    invoiceCount,
    invoices: filtered.map(inv => ({
      invoiceNo: inv.invoiceNo,
      customerName: inv.customerName,
      date: getLocalDateString(inv.date),
      total: inv.total,
      isPaid: inv.isPaid
    }))
  };
}

// 2. getCustomerLedger
export function getCustomerLedger(
  customers: Customer[],
  invoices: Invoice[],
  customerNameOrId: string
) {
  const query = customerNameOrId.trim().toLowerCase();
  
  // Find customer
  const matchedCustomer = customers.find(c => 
    c.id.toLowerCase() === query || 
    c.name.toLowerCase().includes(query)
  );

  if (!matchedCustomer) {
    return {
      error: `Customer "${customerNameOrId}" not found.`
    };
  }

  const customerInvoices = invoices.filter(inv => inv.customerId === matchedCustomer.id);

  return {
    customerId: matchedCustomer.id,
    customerName: matchedCustomer.name,
    phone: matchedCustomer.phone,
    outstandingBalance: matchedCustomer.outstandingBalance,
    invoiceCount: customerInvoices.length,
    invoices: customerInvoices.map(inv => ({
      date: getLocalDateString(inv.date),
      invoiceNo: inv.invoiceNo,
      total: inv.total,
      isPaid: inv.isPaid
    }))
  };
}

// 3. getSupplierLedger
export function getSupplierLedger(
  suppliers: Supplier[],
  purchaseOrders: PurchaseOrder[],
  supplierNameOrId: string
) {
  const query = supplierNameOrId.trim().toLowerCase();

  const matchedSupplier = suppliers.find(s => 
    s.id.toLowerCase() === query || 
    s.name.toLowerCase().includes(query) ||
    s.companyName.toLowerCase().includes(query)
  );

  if (!matchedSupplier) {
    return {
      error: `Supplier "${supplierNameOrId}" not found.`
    };
  }

  const supplierPOs = purchaseOrders.filter(po => po.supplierId === matchedSupplier.id);

  return {
    supplierId: matchedSupplier.id,
    supplierName: matchedSupplier.name,
    companyName: matchedSupplier.companyName,
    outstandingBalance: matchedSupplier.outstandingBalance,
    purchaseOrderCount: supplierPOs.length,
    purchaseOrders: supplierPOs.map(po => ({
      date: getLocalDateString(po.date),
      poNo: po.poNo,
      total: po.total,
      status: po.status
    }))
  };
}

// 4. getProductStock
export function getProductStock(
  products: Product[],
  invoices: Invoice[],
  purchaseOrders: PurchaseOrder[],
  productNameOrId: string
) {
  const query = productNameOrId.trim().toLowerCase();

  const matchedProduct = products.find(p => 
    p.id.toLowerCase() === query || 
    p.sku.toLowerCase() === query ||
    p.name.toLowerCase().includes(query)
  );

  if (!matchedProduct) {
    return {
      error: `Product "${productNameOrId}" not found.`
    };
  }

  // Find recent sale activity (last 5 sales)
  const recentSales: any[] = [];
  invoices.forEach(inv => {
    const item = inv.items.find(i => i.productId === matchedProduct.id);
    if (item) {
      recentSales.push({
        date: getLocalDateString(inv.date),
        invoiceNo: inv.invoiceNo,
        quantity: item.quantity,
        price: item.price,
        customerName: inv.customerName
      });
    }
  });
  recentSales.sort((a, b) => b.date.localeCompare(a.date));

  // Find recent purchase activity (last 5 purchases)
  const recentPurchases: any[] = [];
  purchaseOrders.forEach(po => {
    const item = po.items.find(i => i.productId === matchedProduct.id);
    if (item) {
      recentPurchases.push({
        date: getLocalDateString(po.date),
        poNo: po.poNo,
        quantity: item.quantity,
        cost: item.cost,
        supplierName: po.supplierName,
        status: po.status
      });
    }
  });
  recentPurchases.sort((a, b) => b.date.localeCompare(a.date));

  return {
    id: matchedProduct.id,
    name: matchedProduct.name,
    sku: matchedProduct.sku,
    category: matchedProduct.category,
    unit: matchedProduct.unit,
    stock: matchedProduct.stock,
    cost: matchedProduct.cost,
    price: matchedProduct.price,
    recentSales: recentSales.slice(0, 5),
    recentPurchases: recentPurchases.slice(0, 5)
  };
}

// 5. getTopProducts
export function getTopProducts(
  invoices: Invoice[],
  products: Product[],
  period: 'today' | 'this_week' | 'this_month' | 'this_year' | 'all',
  limit: number = 5
) {
  const today = new Date();
  const todayStr = getLocalDateString(today);
  
  // Set date ranges
  let startStr = '';
  let endStr = todayStr;

  if (period === 'today') {
    startStr = todayStr;
  } else if (period === 'this_week') {
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    startStr = getLocalDateString(start);
  } else if (period === 'this_month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    startStr = getLocalDateString(start);
  } else if (period === 'this_year') {
    const start = new Date(today.getFullYear(), 0, 1);
    startStr = getLocalDateString(start);
  }

  const filteredInvoices = invoices.filter(inv => {
    const invDateStr = getLocalDateString(inv.date);
    if (!invDateStr) return false;
    if (startStr && (invDateStr < startStr || invDateStr > endStr)) return false;
    return true;
  });

  // Aggregate quantities and revenues
  const productTotals: Record<string, { id: string; name: string; sku: string; totalRevenue: number; totalQuantity: number }> = {};

  filteredInvoices.forEach(inv => {
    inv.items.forEach(item => {
      if (!productTotals[item.productId]) {
        const prod = products.find(p => p.id === item.productId);
        productTotals[item.productId] = {
          id: item.productId,
          name: item.name || prod?.name || 'Unknown Product',
          sku: prod?.sku || '',
          totalRevenue: 0,
          totalQuantity: 0
        };
      }
      productTotals[item.productId].totalRevenue += (item.subtotal || 0);
      productTotals[item.productId].totalQuantity += (item.quantity || 0);
    });
  });

  const sortedList = Object.values(productTotals)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);

  return {
    period,
    limit,
    topProducts: sortedList
  };
}

// 6. compareRevenuePeriods
export function compareRevenuePeriods(
  invoices: Invoice[],
  period1Start: string,
  period1End: string,
  period2Start: string,
  period2End: string
) {
  const p1Res = getSalesByDateRange(invoices, period1Start, period1End);
  const p2Res = getSalesByDateRange(invoices, period2Start, period2End);

  const varianceAmount = p1Res.totalAmount - p2Res.totalAmount;
  const variancePercent = p2Res.totalAmount === 0 
    ? (p1Res.totalAmount > 0 ? 100 : 0)
    : (varianceAmount / p2Res.totalAmount) * 100;

  return {
    period1: {
      startDate: period1Start,
      endDate: period1End,
      totalAmount: p1Res.totalAmount,
      invoiceCount: p1Res.invoiceCount
    },
    period2: {
      startDate: period2Start,
      endDate: period2End,
      totalAmount: p2Res.totalAmount,
      invoiceCount: p2Res.invoiceCount
    },
    varianceAmount,
    variancePercent: parseFloat(variancePercent.toFixed(2))
  };
}

// 7. getAccountsSummary
export function getAccountsSummary(
  customers: Customer[],
  suppliers: Supplier[],
  bankAccounts: BankAccount[]
) {
  const totalReceivables = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);
  const totalPayables = suppliers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);
  const totalBankBalance = bankAccounts.reduce((sum, b) => sum + (b.balance || 0), 0);
  const netCashPosition = totalBankBalance + totalReceivables - totalPayables;

  return {
    totalReceivables,
    totalPayables,
    totalBankBalance,
    netCashPosition
  };
}

// --- GEMINI FUNCTION DECLARATIONS ---
export const AI_TOOL_DECLARATIONS = [
  {
    functionDeclarations: [
      {
        name: 'getSalesByDateRange',
        description: 'Get sales invoice total, invoice count, and specific invoices within a date range (inclusive). Use this for queries about sales/revenue for today, a specific day, week, month, or a custom range.',
        parameters: {
          type: 'OBJECT',
          properties: {
            startDate: { type: 'STRING', description: 'Start date in YYYY-MM-DD format' },
            endDate: { type: 'STRING', description: 'End date in YYYY-MM-DD format' }
          },
          required: ['startDate', 'endDate']
        }
      },
      {
        name: 'getCustomerLedger',
        description: 'Get outstanding balance and transaction invoice history of a specific customer. Supports name search or ID.',
        parameters: {
          type: 'OBJECT',
          properties: {
            customerNameOrId: { type: 'STRING', description: 'The customer name or ID' }
          },
          required: ['customerNameOrId']
        }
      },
      {
        name: 'getSupplierLedger',
        description: 'Get outstanding balance and purchase orders of a specific supplier. Supports name/company-name search or ID.',
        parameters: {
          type: 'OBJECT',
          properties: {
            supplierNameOrId: { type: 'STRING', description: 'The supplier name, company name, or ID' }
          },
          required: ['supplierNameOrId']
        }
      },
      {
        name: 'getProductStock',
        description: 'Get product stock level, cost, price, and its recent sales and purchase history. Supports fuzzy name search, SKU, or ID.',
        parameters: {
          type: 'OBJECT',
          properties: {
            productNameOrId: { type: 'STRING', description: 'Product name, SKU, or product ID' }
          },
          required: ['productNameOrId']
        }
      },
      {
        name: 'getTopProducts',
        description: 'Get top selling products by revenue within a specific period (today, this_week, this_month, this_year, or all).',
        parameters: {
          type: 'OBJECT',
          properties: {
            period: { type: 'STRING', enum: ['today', 'this_week', 'this_month', 'this_year', 'all'], description: 'The time period to analyze' },
            limit: { type: 'INTEGER', description: 'Number of top products to return (default 5)' }
          },
          required: ['period']
        }
      },
      {
        name: 'compareRevenuePeriods',
        description: 'Compare sales revenues of two different date periods and calculate growth rate and variance percentage.',
        parameters: {
          type: 'OBJECT',
          properties: {
            period1Start: { type: 'STRING', description: 'Period 1 start date (YYYY-MM-DD)' },
            period1End: { type: 'STRING', description: 'Period 1 end date (YYYY-MM-DD)' },
            period2Start: { type: 'STRING', description: 'Period 2 start date (YYYY-MM-DD)' },
            period2End: { type: 'STRING', description: 'Period 2 end date (YYYY-MM-DD)' }
          },
          required: ['period1Start', 'period1End', 'period2Start', 'period2End']
        }
      },
      {
        name: 'getAccountsSummary',
        description: 'Get high-level live financial accounts summary including total accounts receivable, total accounts payable, total bank balance, and net cash position.',
        parameters: {
          type: 'OBJECT',
          properties: {}
        }
      }
    ]
  }
];
