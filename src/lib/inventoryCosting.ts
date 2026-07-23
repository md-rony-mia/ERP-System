export interface Batch {
  id: string;
  productId: string;
  productName?: string;
  batchNo: string;
  qty: number;
  cost: number;
  mfgDate: string;
  expiryDate?: string;
  warehouse?: string;
  status?: string;
}

export const DEFAULT_BATCHES: Batch[] = [
  { id: 'b1', productId: 'p1', productName: 'Standard Premium cement', batchNo: 'B-CEM-902', qty: 70, cost: 400, mfgDate: '2026-01-10', expiryDate: '2026-12-10', warehouse: 'Main Warehouse' },
  { id: 'b2', productId: 'p1', productName: 'Standard Premium cement', batchNo: 'B-CEM-903', qty: 50, cost: 424, mfgDate: '2026-02-15', expiryDate: '2027-02-15', warehouse: 'Main Warehouse' },
  { id: 'b3', productId: 'p2', productName: 'Deformed Steel Bar 60G (12mm)', batchNo: 'B-ST-12-A', qty: 10, cost: 77500, mfgDate: '2026-03-01', expiryDate: '2031-03-01', warehouse: 'Main Warehouse' },
  { id: 'b4', productId: 'p2', productName: 'Deformed Steel Bar 60G (12mm)', batchNo: 'B-ST-12-B', qty: 5, cost: 79000, mfgDate: '2026-04-10', expiryDate: '2031-04-10', warehouse: 'Main Warehouse' },
  { id: 'b5', productId: 'p3', productName: 'Deformed Steel Bar 60G (16mm)', batchNo: 'B-ST-16-X', qty: 2, cost: 79000, mfgDate: '2026-02-20', expiryDate: '2031-02-20', warehouse: 'Yard B' },
];

/**
 * Calculates ending inventory valuation under FIFO method.
 * Ending inventory consists of the NEWEST batches (sorted by mfgDate descending).
 */
export function calculateFIFOValuation(
  prodId: string,
  currentStock: number,
  defaultCost: number,
  batches: Batch[]
): number {
  const prodBatches = (batches || []).filter((b) => b.productId === prodId);
  if (prodBatches.length === 0) {
    return currentStock * defaultCost;
  }
  // Sort batches by mfgDate descending (newest first for remaining ending inventory)
  const sortedBatches = [...prodBatches].sort(
    (a, b) => new Date(b.mfgDate || 0).getTime() - new Date(a.mfgDate || 0).getTime()
  );

  let remainingToValue = currentStock;
  let totalValuation = 0;

  for (const batch of sortedBatches) {
    if (remainingToValue <= 0) break;
    const takeQty = Math.min(remainingToValue, batch.qty);
    totalValuation += takeQty * (batch.cost ?? defaultCost);
    remainingToValue -= takeQty;
  }

  if (remainingToValue > 0) {
    totalValuation += remainingToValue * defaultCost;
  }
  return totalValuation;
}

/**
 * Calculates ending inventory valuation under LIFO method.
 * Ending inventory consists of the OLDEST batches (sorted by mfgDate ascending).
 */
export function calculateLIFOValuation(
  prodId: string,
  currentStock: number,
  defaultCost: number,
  batches: Batch[]
): number {
  const prodBatches = (batches || []).filter((b) => b.productId === prodId);
  if (prodBatches.length === 0) {
    return currentStock * defaultCost;
  }
  // Sort batches by mfgDate ascending (oldest first for remaining ending inventory)
  const sortedBatches = [...prodBatches].sort(
    (a, b) => new Date(a.mfgDate || 0).getTime() - new Date(b.mfgDate || 0).getTime()
  );

  let remainingToValue = currentStock;
  let totalValuation = 0;

  for (const batch of sortedBatches) {
    if (remainingToValue <= 0) break;
    const takeQty = Math.min(remainingToValue, batch.qty);
    totalValuation += takeQty * (batch.cost ?? defaultCost);
    remainingToValue -= takeQty;
  }

  if (remainingToValue > 0) {
    totalValuation += remainingToValue * defaultCost;
  }
  return totalValuation;
}

/**
 * Calculates the unit cost for a sale based on valuation method.
 * - FIFO: Consumes from the OLDEST batches first (ascending mfgDate).
 * - LIFO: Consumes from the NEWEST batches first (descending mfgDate).
 * - WAC / Weighted Average: Uses current average cost (product.cost).
 * - Standard Cost: Uses standard cost threshold (product.cost * 1.05).
 */
export function getUnitCostForSale(
  productId: string,
  quantitySold: number,
  valuationMethod: string,
  batches: Batch[],
  product?: any
): number {
  const defaultCost = product?.cost ?? 0;
  if (quantitySold <= 0) return defaultCost;

  const method = (valuationMethod === 'Weighted Average' ? 'WAC' : valuationMethod) || 'WAC';

  if (method === 'WAC') {
    return defaultCost;
  }

  if (method === 'Standard Cost') {
    return defaultCost * 1.05;
  }

  const prodBatches = (batches || []).filter((b) => b.productId === productId && b.qty > 0);
  if (prodBatches.length === 0) {
    return defaultCost;
  }

  let sortedBatches: Batch[] = [];
  if (method === 'FIFO') {
    // FIFO sale: consume OLDEST batches first (ascending mfgDate)
    sortedBatches = [...prodBatches].sort(
      (a, b) => new Date(a.mfgDate || 0).getTime() - new Date(b.mfgDate || 0).getTime()
    );
  } else if (method === 'LIFO') {
    // LIFO sale: consume NEWEST batches first (descending mfgDate)
    sortedBatches = [...prodBatches].sort(
      (a, b) => new Date(b.mfgDate || 0).getTime() - new Date(a.mfgDate || 0).getTime()
    );
  } else {
    return defaultCost;
  }

  let remainingToDeduct = quantitySold;
  let totalCost = 0;

  for (const batch of sortedBatches) {
    if (remainingToDeduct <= 0) break;
    const takeQty = Math.min(remainingToDeduct, batch.qty);
    totalCost += takeQty * (batch.cost ?? defaultCost);
    remainingToDeduct -= takeQty;
  }

  // If quantity sold exceeds total batch quantity, remaining units use defaultCost
  if (remainingToDeduct > 0) {
    totalCost += remainingToDeduct * defaultCost;
  }

  return totalCost / quantitySold;
}

/**
 * Calculates sale cost and updates batch quantities accordingly.
 */
export function consumeBatchesForSale(
  productId: string,
  quantitySold: number,
  valuationMethod: string,
  batches: Batch[],
  product?: any
): { updatedBatches: Batch[]; unitCost: number; totalCOGS: number } {
  const unitCost = getUnitCostForSale(productId, quantitySold, valuationMethod, batches, product);
  const totalCOGS = unitCost * quantitySold;

  if (!batches || batches.length === 0 || quantitySold <= 0) {
    return { updatedBatches: batches || [], unitCost, totalCOGS };
  }

  const method = (valuationMethod === 'Weighted Average' ? 'WAC' : valuationMethod) || 'WAC';

  const prodBatches = batches.filter((b) => b.productId === productId && b.qty > 0);
  if (prodBatches.length === 0) {
    return { updatedBatches: batches, unitCost, totalCOGS };
  }

  let targetOrder: string[] = [];
  if (method === 'LIFO') {
    // LIFO sale: consume newest first
    targetOrder = [...prodBatches]
      .sort((a, b) => new Date(b.mfgDate || 0).getTime() - new Date(a.mfgDate || 0).getTime())
      .map((b) => b.id);
  } else {
    // FIFO / WAC / Standard Cost sale: consume oldest first
    targetOrder = [...prodBatches]
      .sort((a, b) => new Date(a.mfgDate || 0).getTime() - new Date(b.mfgDate || 0).getTime())
      .map((b) => b.id);
  }

  let remaining = quantitySold;
  const deductMap: Record<string, number> = {};

  for (const bId of targetOrder) {
    if (remaining <= 0) break;
    const batch = batches.find((b) => b.id === bId);
    if (!batch) continue;
    const take = Math.min(remaining, batch.qty);
    deductMap[bId] = take;
    remaining -= take;
  }

  const updatedBatches = batches.map((b) => {
    if (deductMap[b.id]) {
      return {
        ...b,
        qty: Math.max(0, b.qty - deductMap[b.id]),
      };
    }
    return b;
  });

  return { updatedBatches, unitCost, totalCOGS };
}
