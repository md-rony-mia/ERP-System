import { describe, it, expect } from 'vitest';
import {
  calculateFIFOValuation,
  calculateLIFOValuation,
  getUnitCostForSale,
  consumeBatchesForSale,
  Batch,
} from '../lib/inventoryCosting';

describe('Inventory Costing & COGS Engine', () => {
  const testProduct = { id: 'p1', cost: 410 };

  const sampleBatches: Batch[] = [
    {
      id: 'b1',
      productId: 'p1',
      batchNo: 'B1',
      qty: 70,
      cost: 400,
      mfgDate: '2026-01-10',
    },
    {
      id: 'b2',
      productId: 'p1',
      batchNo: 'B2',
      qty: 50,
      cost: 424,
      mfgDate: '2026-02-15',
    },
  ];

  it('calculates different COGS for FIFO vs LIFO vs WAC for the same sale', () => {
    const qtySold = 80;

    // FIFO: consumes 70 units @ 400 (b1) + 10 units @ 424 (b2) = 28000 + 4240 = 32240 (unit cost 403)
    const fifoUnitCost = getUnitCostForSale('p1', qtySold, 'FIFO', sampleBatches, testProduct);
    const fifoCOGS = fifoUnitCost * qtySold;

    // LIFO: consumes 50 units @ 424 (b2) + 30 units @ 400 (b1) = 21200 + 12000 = 33200 (unit cost 415)
    const lifoUnitCost = getUnitCostForSale('p1', qtySold, 'LIFO', sampleBatches, testProduct);
    const lifoCOGS = lifoUnitCost * qtySold;

    // WAC: uses product.cost = 410 => 80 * 410 = 32800 (unit cost 410)
    const wacUnitCost = getUnitCostForSale('p1', qtySold, 'WAC', sampleBatches, testProduct);
    const wacCOGS = wacUnitCost * qtySold;

    expect(fifoCOGS).toBe(32240);
    expect(fifoUnitCost).toBe(403);

    expect(lifoCOGS).toBe(33200);
    expect(lifoUnitCost).toBe(415);

    expect(wacCOGS).toBe(32800);
    expect(wacUnitCost).toBe(410);

    // Verify all 3 methods produce distinctly different COGS amounts for the exact same sale!
    expect(fifoCOGS).not.toEqual(lifoCOGS);
    expect(fifoCOGS).not.toEqual(wacCOGS);
    expect(lifoCOGS).not.toEqual(wacCOGS);
  });

  it('supports Weighted Average name alias correctly', () => {
    const unitCost = getUnitCostForSale('p1', 10, 'Weighted Average', sampleBatches, testProduct);
    expect(unitCost).toBe(410);
  });

  it('deducts batch quantities properly under FIFO vs LIFO', () => {
    const qtySold = 80;

    // FIFO consume: deducts 70 from b1 (leaves 0), deducts 10 from b2 (leaves 40)
    const fifoRes = consumeBatchesForSale('p1', qtySold, 'FIFO', sampleBatches, testProduct);
    const b1Fifo = fifoRes.updatedBatches.find((b) => b.id === 'b1');
    const b2Fifo = fifoRes.updatedBatches.find((b) => b.id === 'b2');

    expect(b1Fifo?.qty).toBe(0);
    expect(b2Fifo?.qty).toBe(40);

    // LIFO consume: deducts 50 from b2 (leaves 0), deducts 30 from b1 (leaves 40)
    const lifoRes = consumeBatchesForSale('p1', qtySold, 'LIFO', sampleBatches, testProduct);
    const b1Lifo = lifoRes.updatedBatches.find((b) => b.id === 'b1');
    const b2Lifo = lifoRes.updatedBatches.find((b) => b.id === 'b2');

    expect(b1Lifo?.qty).toBe(40);
    expect(b2Lifo?.qty).toBe(0);
  });

  it('handles ending inventory valuation calculations for FIFO and LIFO', () => {
    const currentStock = 120;
    const defaultCost = 410;

    const fifoValuation = calculateFIFOValuation('p1', currentStock, defaultCost, sampleBatches);
    const lifoValuation = calculateLIFOValuation('p1', currentStock, defaultCost, sampleBatches);

    // FIFO ending inventory has newest first: 50 @ 424 + 70 @ 400 = 21200 + 28000 = 49200
    expect(fifoValuation).toBe(49200);

    // LIFO ending inventory has oldest first: 70 @ 400 + 50 @ 424 = 28000 + 21200 = 49200
    expect(lifoValuation).toBe(49200);
  });
});
