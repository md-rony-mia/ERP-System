import { Product, Branch, Invoice, PurchaseOrder } from '../types';

/**
 * Checks whether a product should be visible in the current branch context.
 * - Shared branches see central/shared products (including main branch products).
 * - Independent branches see their own distinct branch products or products configured for them.
 */
export function isProductVisibleInBranch(
  p: Product,
  currentBranchId: string | undefined,
  branches: Branch[]
): boolean {
  if (!currentBranchId || currentBranchId === 'all') {
    return true;
  }

  const activeBranch = branches.find((b) => b.id === currentBranchId);
  const isIndependentBranch = activeBranch?.stockMode === 'independent';
  const prodBranch = branches.find((b) => b.id === p.branchId);

  // If active branch is Independent Stock:
  if (isIndependentBranch) {
    if (p.branchStocks && p.branchStocks[currentBranchId] !== undefined) {
      return true;
    }
    if (p.branchId === currentBranchId) {
      return true;
    }
    // Shared global products can be visible to independent branches if explicitly allowed,
    // but independent branch has its own isolated stock levels.
    if (!p.branchId || p.branchId === 'all') {
      return true;
    }
    return false;
  }

  // Active branch is Shared Stock:
  // Shared branches see central/shared inventory (global products, main branch products, or shared branch products).
  if (!p.branchId || p.branchId === 'all' || p.branchId === currentBranchId) {
    return true;
  }

  // Exclude if product is assigned exclusively to a DIFFERENT Independent branch
  if (prodBranch && prodBranch.stockMode === 'independent' && prodBranch.id !== currentBranchId) {
    return false;
  }

  return true;
}

/**
 * Retrieves the effective stock quantity for a product given the current active branch.
 * - For Shared branches: Returns central main stock (`p.stock`).
 * - For Independent branches: Returns branch-specific stock (`p.branchStocks[branchId]`).
 */
export function getEffectiveStock(
  p: Product,
  currentBranchId: string | undefined,
  branches: Branch[]
): number {
  if (!currentBranchId || currentBranchId === 'all') {
    return p.stock;
  }

  const activeBranch = branches.find((b) => b.id === currentBranchId);
  const isIndependentBranch = activeBranch?.stockMode === 'independent';

  if (p.branchStocks && p.branchStocks[currentBranchId] !== undefined) {
    return p.branchStocks[currentBranchId];
  }

  if (p.branchId === currentBranchId) {
    return p.stock;
  }

  if (isIndependentBranch) {
    // Independent branch without custom stock entry defaults to 0
    return 0;
  }

  // Shared stock branch defaults to central main stock
  return p.stock;
}

/**
 * Filters invoices by branch context.
 * Independent branches see only their own invoices.
 * Shared branches or 'all' see invoices matching context.
 */
export function filterInvoicesByBranch(
  invoices: Invoice[],
  currentBranchId: string | undefined,
  branches: Branch[]
): Invoice[] {
  if (!currentBranchId || currentBranchId === 'all') {
    return invoices;
  }
  const activeBranch = branches.find((b) => b.id === currentBranchId);
  return invoices.filter((inv) => {
    if (inv.branchId) {
      return inv.branchId === currentBranchId;
    }
    // If invoice has no branchId, associate with main branch or shared context
    return activeBranch?.isMainBranch;
  });
}

/**
 * Filters purchase orders by branch context.
 */
export function filterPurchaseOrdersByBranch(
  purchaseOrders: PurchaseOrder[],
  currentBranchId: string | undefined,
  branches: Branch[]
): PurchaseOrder[] {
  if (!currentBranchId || currentBranchId === 'all') {
    return purchaseOrders;
  }
  const activeBranch = branches.find((b) => b.id === currentBranchId);
  return purchaseOrders.filter((po) => {
    if (po.branchId) {
      return po.branchId === currentBranchId;
    }
    return activeBranch?.isMainBranch;
  });
}
