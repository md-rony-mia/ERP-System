import { FieldDefinition, PermissionDefinition } from '../types';

/**
 * Checks a specific user role's access permission for a given metadata field.
 * Returns:
 *   - 'Edit': User can view and modify the field.
 *   - 'View': User can view but cannot edit (renders read-only).
 *   - 'None': User cannot see the field (renders hidden).
 */
export function getFieldPermission(
  field: FieldDefinition,
  role: string = 'Administrator'
): 'None' | 'View' | 'Edit' {
  // If the user is an Administrator, they always have Edit access by default
  if (role === 'Administrator') {
    return 'Edit';
  }

  // 1. Check if the field definition has explicit permissions
  if (field.permission && field.permission.length > 0) {
    const explicitPerm = field.permission.find(p => p.role === role);
    if (explicitPerm) {
      return explicitPerm.access;
    }
  }

  // 2. Fallback default roles mapping matching Enterprise standard permissions
  switch (role) {
    case 'Manager':
      return 'Edit';
    case 'Cashier':
      // Cashiers can see prices, stocks, but cannot edit standard costs/acquisition costs
      if (['cost', 'standardCost', 'purchasePrice'].includes(field.fieldKey)) {
        return 'None';
      }
      if (['price', 'stock', 'name', 'sku', 'category'].includes(field.fieldKey)) {
        return 'View';
      }
      return 'View';
    case 'Sales Agent':
      // Sales Agents can see stock and details, edit Selling Price, but cannot view/edit actual costs
      if (['cost', 'standardCost', 'purchaseCost'].includes(field.fieldKey)) {
        return 'None';
      }
      if (field.fieldKey === 'price') {
        return 'Edit';
      }
      return 'View';
    case 'Warehouse Staff':
      // Warehouse staff can edit stocks, but cannot see/edit selling prices or costs
      if (['price', 'cost', 'standardCost'].includes(field.fieldKey)) {
        return 'None';
      }
      if (field.fieldKey === 'stock') {
        return 'Edit';
      }
      return 'View';
    default:
      return 'View';
  }
}
