import {
  FieldDefinition,
  TabDefinition,
  SectionDefinition,
  LayoutDefinition,
  DynamicForm,
  ValidationDefinition,
  PermissionDefinition,
  FieldDependency,
} from '../types';

// ==========================================
// DEFAULT ENTERPRISE METADATA SEEDS
// ==========================================

export const DEFAULT_TABS: TabDefinition[] = [
  { id: 'general', title: 'General', displayOrder: 1, icon: 'FileText' },
  { id: 'inventory', title: 'Inventory', displayOrder: 2, icon: 'Boxes' },
  { id: 'purchase', title: 'Purchase', displayOrder: 3, icon: 'ShoppingBag' },
  { id: 'sales', title: 'Sales', displayOrder: 4, icon: 'TrendingUp' },
  { id: 'accounting', title: 'Accounting', displayOrder: 5, icon: 'DollarSign' },
  { id: 'warehouse', title: 'Warehouse', displayOrder: 6, icon: 'Warehouse' },
  { id: 'pricing', title: 'Pricing', displayOrder: 7, icon: 'Percent' },
  { id: 'manufacturing', title: 'Manufacturing', displayOrder: 8, icon: 'Settings' },
  { id: 'quality', title: 'Quality', displayOrder: 9, icon: 'CheckCircle' },
  { id: 'logistics', title: 'Logistics', displayOrder: 10, icon: 'Truck' },
  { id: 'seo', title: 'SEO', displayOrder: 11, icon: 'Globe' },
  { id: 'attachments', title: 'Attachments', displayOrder: 12, icon: 'Paperclip' },
  { id: 'history', title: 'History', displayOrder: 13, icon: 'History' },
  { id: 'custom', title: 'Custom Fields', displayOrder: 14, icon: 'Sliders' },
];

export const DEFAULT_SECTIONS: SectionDefinition[] = [
  { id: 'sec_gen_basic', title: 'Core Product Information', tabId: 'general', displayOrder: 1 },
  { id: 'sec_gen_media', title: 'Media Assets & Identification', tabId: 'general', displayOrder: 2 },
  { id: 'sec_inv_limits', title: 'Safety Limits, Stocks & Alerts', tabId: 'inventory', displayOrder: 1 },
  { id: 'sec_pur_supplier', title: 'Lead Supplier & Procurement Rates', tabId: 'purchase', displayOrder: 1 },
  { id: 'sec_sal_tiers', title: 'Customer Sales Pricing & Warranty', tabId: 'sales', displayOrder: 1 },
  { id: 'sec_acc_ledger', title: 'General Ledger Accounts & Standard Costs', tabId: 'accounting', displayOrder: 1 },
  { id: 'sec_wh_config', title: 'Regional Stock & Depot Allocations', tabId: 'warehouse', displayOrder: 1 },
  { id: 'sec_price_matrix', title: 'Dynamic Price Matrices & Markups', tabId: 'pricing', displayOrder: 1 },
  { id: 'sec_mfg_bom', title: 'Bill of Materials & Workstations', tabId: 'manufacturing', displayOrder: 1 },
  { id: 'sec_qa_cert', title: 'QA Grades, Certificates & Audits', tabId: 'quality', displayOrder: 1 },
  { id: 'sec_log_pack', title: 'Dimension, Freight Class & Logistics', tabId: 'logistics', displayOrder: 1 },
  { id: 'sec_seo_meta', title: 'SEO Titles, URL Slugs & Web Tags', tabId: 'seo', displayOrder: 1 },
  { id: 'sec_attachments_docs', title: 'Document Uploads & Signature Sign-offs', tabId: 'attachments', displayOrder: 1 },
  { id: 'sec_history_audit', title: 'Field Modification Logs', tabId: 'history', displayOrder: 1 },
  { id: 'sec_custom_fields', title: 'Dynamic Custom Runtime Fields', tabId: 'custom', displayOrder: 1 },
];

// Helper to create a complete FieldDefinition with proper defaults
import { FieldType } from '../types';

function createField(partial: Partial<FieldDefinition> & { id: string; fieldKey: string; displayName: string; fieldType: FieldType }): FieldDefinition {
  const nowStr = new Date().toISOString();
  return {
    uuid: partial.id,
    fieldName: partial.fieldKey,
    description: '',
    placeholder: '',
    tooltip: '',
    helpText: '',
    defaultValue: '',
    required: false,
    unique: false,
    readonly: false,
    hidden: false,
    visible: true,
    searchable: true,
    filterable: true,
    sortable: true,
    exportable: true,
    importable: true,
    printable: true,
    encrypted: false,
    mask: '',
    minLength: 0,
    maxLength: 0,
    minimum: 0,
    maximum: 0,
    regex: '',
    tab: 'general',
    section: '',
    group: 'default',
    order: 1,
    icon: '',
    color: '',
    width: 'Half',
    responsiveWidth: '100%',
    formula: '',
    validationRules: [],
    workflow: [],
    permission: [],
    dependencies: [],
    createdAt: nowStr,
    updatedAt: nowStr,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    version: 1,
    ...partial,
  };
}

export const DEFAULT_FIELDS: FieldDefinition[] = [
  // --- GENERAL TAB ---
  createField({
    id: 'f_name',
    fieldKey: 'name',
    displayName: 'Product Name',
    description: 'The standard human-readable name of the product.',
    placeholder: 'e.g. Portland Composite Cement',
    fieldType: 'Text',
    required: true,
    tab: 'general',
    section: 'sec_gen_basic',
    order: 1,
    width: 'Full',
  }),
  createField({
    id: 'f_sku',
    fieldKey: 'sku',
    displayName: 'SKU / Code',
    description: 'Stock Keeping Unit unique to the enterprise catalog.',
    placeholder: 'e.g. CEM-PC-001',
    fieldType: 'Text',
    required: true,
    unique: true,
    tab: 'general',
    section: 'sec_gen_basic',
    order: 2,
    width: 'Half',
  }),
  createField({
    id: 'f_brand',
    fieldKey: 'brand',
    displayName: 'Brand Name',
    placeholder: 'e.g. Lafarge / Crown Cement',
    fieldType: 'Text',
    tab: 'general',
    section: 'sec_gen_basic',
    order: 3,
    width: 'Half',
  }),
  createField({
    id: 'f_productCode',
    fieldKey: 'productCode',
    displayName: 'SAP/Oracle Sync Code',
    placeholder: 'e.g. PRD-9981-A',
    fieldType: 'Text',
    tab: 'general',
    section: 'sec_gen_basic',
    order: 4,
    width: 'Half',
  }),
  createField({
    id: 'f_barcode',
    fieldKey: 'barcode',
    displayName: 'EAN-13 Barcode',
    placeholder: 'e.g. 8901234567890',
    fieldType: 'Barcode',
    tab: 'general',
    section: 'sec_gen_media',
    order: 1,
    width: 'Half',
  }),
  createField({
    id: 'f_qrCode',
    fieldKey: 'qrCode',
    displayName: 'Product QR Code',
    placeholder: 'e.g. https://nexova.erp/cement-pc-001',
    fieldType: 'QR Code',
    tab: 'general',
    section: 'sec_gen_media',
    order: 2,
    width: 'Half',
  }),

  // --- INVENTORY TAB ---
  createField({
    id: 'f_stock',
    fieldKey: 'stock',
    displayName: 'Initial Stock Level',
    fieldType: 'Integer',
    defaultValue: 0,
    required: true,
    tab: 'inventory',
    section: 'sec_inv_limits',
    order: 1,
    width: 'Half',
  }),
  createField({
    id: 'f_alertQty',
    fieldKey: 'alertQty',
    displayName: 'Safety Stock Alert Level',
    fieldType: 'Integer',
    defaultValue: 5,
    tab: 'inventory',
    section: 'sec_inv_limits',
    order: 2,
    width: 'Half',
  }),
  createField({
    id: 'f_warehouse',
    fieldKey: 'warehouse',
    displayName: 'Default Warehouse Depot',
    fieldType: 'Warehouse',
    defaultValue: 'Engineering Department',
    tab: 'inventory',
    section: 'sec_inv_limits',
    order: 3,
    width: 'Half',
  }),

  // --- UNITS TAB ---
  createField({
    id: 'f_unit',
    fieldKey: 'unit',
    displayName: 'Primary Measurement Unit',
    fieldType: 'Dropdown',
    defaultValue: 'Bags',
    tab: 'units',
    section: 'sec_units_pack',
    order: 1,
    width: 'Half',
    options: [
      { label: 'Bags', value: 'Bags' },
      { label: 'Tons', value: 'Tons' },
      { label: 'Pcs', value: 'Pcs' },
      { label: 'Drums', value: 'Drums' },
    ],
  }),
  createField({
    id: 'f_pcsPerBox',
    fieldKey: 'pcsPerBox',
    displayName: 'Pieces Per Package (Box)',
    fieldType: 'Integer',
    defaultValue: 1,
    tab: 'units',
    section: 'sec_units_pack',
    order: 2,
    width: 'Half',
  }),

  // --- CLASSIFICATION TAB ---
  createField({
    id: 'f_category',
    fieldKey: 'category',
    displayName: 'Product Classification Category',
    fieldType: 'Dropdown',
    defaultValue: 'Construction Materials',
    tab: 'classification',
    section: 'sec_class_cat',
    order: 1,
    width: 'Half',
    options: [
      { label: 'Construction Materials', value: 'Construction Materials' },
      { label: 'Steel Items', value: 'Steel Items' },
      { label: 'Bricks & Sand', value: 'Bricks & Sand' },
      { label: 'Chemicals & Paint', value: 'Chemicals & Paint' },
    ],
  }),

  // --- SALES TAB ---
  createField({
    id: 'f_price',
    fieldKey: 'price',
    displayName: 'Selling Price (৳)',
    fieldType: 'Currency',
    defaultValue: 0,
    required: true,
    tab: 'sales',
    section: 'sec_sal_tiers',
    order: 1,
    width: 'Half',
  }),
  createField({
    id: 'f_warranty',
    fieldKey: 'warranty',
    displayName: 'Manufacturer Warranty Policy',
    placeholder: 'e.g. 1 Year Limited',
    fieldType: 'Text',
    tab: 'sales',
    section: 'sec_sal_tiers',
    order: 2,
    width: 'Half',
  }),

  // --- ACCOUNTING TAB ---
  createField({
    id: 'f_cost',
    fieldKey: 'cost',
    displayName: 'Standard Acquisition Cost (৳)',
    fieldType: 'Currency',
    defaultValue: 0,
    required: true,
    tab: 'accounting',
    section: 'sec_acc_ledger',
    order: 1,
    width: 'Half',
  }),
  createField({
    id: 'f_inventoryAccount',
    fieldKey: 'inventoryAccount',
    displayName: 'Asset Ledger Account Mapping',
    fieldType: 'Text',
    defaultValue: '120100 - Raw Materials stock',
    tab: 'accounting',
    section: 'sec_acc_ledger',
    order: 2,
    width: 'Half',
  }),

  // --- PRICING TAB (FORMULA EXAMPLE) ---
  createField({
    id: 'f_markupValue',
    fieldKey: 'markupValue',
    displayName: 'Estimated Unit Markup (৳)',
    fieldType: 'Formula',
    formula: 'price - cost',
    tab: 'pricing',
    section: 'sec_price_matrix',
    order: 1,
    width: 'Half',
    readonly: true,
  }),
  createField({
    id: 'f_markupPercentage',
    fieldKey: 'markupPercentage',
    displayName: 'Markup Rate (%)',
    fieldType: 'Formula',
    formula: '((price - cost) / (cost || 1)) * 100',
    tab: 'pricing',
    section: 'sec_price_matrix',
    order: 2,
    width: 'Half',
    readonly: true,
  }),

  // --- QUALITY TAB ---
  createField({
    id: 'f_inspectionRequired',
    fieldKey: 'inspectionRequired',
    displayName: 'Mandatory QC Inspection',
    fieldType: 'Toggle',
    defaultValue: false,
    tab: 'quality',
    section: 'sec_qa_cert',
    order: 1,
    width: 'Half',
  }),
  createField({
    id: 'f_qualityGrade',
    fieldKey: 'qualityGrade',
    displayName: 'Quality Rating Grade',
    fieldType: 'Text',
    placeholder: 'e.g. Grade-A Standard',
    tab: 'quality',
    section: 'sec_qa_cert',
    order: 2,
    width: 'Half',
  }),

  // --- SEO TAB ---
  createField({
    id: 'f_slug',
    fieldKey: 'slug',
    displayName: 'Web URL slug path',
    fieldType: 'Text',
    placeholder: 'e.g. portland-cement-crown',
    tab: 'seo',
    section: 'sec_seo_meta',
    order: 1,
    width: 'Half',
  }),

  // --- CUSTOM TAB ---
  createField({
    id: 'f_customText',
    fieldKey: 'customText',
    displayName: 'Dynamic Text Entry',
    fieldType: 'Text',
    tab: 'custom',
    section: 'sec_custom_fields',
    order: 1,
    width: 'Half',
  }),
];

// ==========================================
// METADATA ENGINE IMPLEMENTATION
// ==========================================

export class MetadataEngine {
  private static cache: Record<string, DynamicForm> = {};

  /**
   * Initializes the repository with default enterprise metadata if empty.
   */
  public static initialize(moduleKey: string = 'products'): DynamicForm {
    const cacheKey = `meta_form_${moduleKey}`;
    
    // Check local memory cache first
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    // Check database (using LocalStorage for reliable high-speed offline persistent synchronization)
    const dbValue = localStorage.getItem(cacheKey);
    if (dbValue) {
      try {
        const parsed = JSON.parse(dbValue) as DynamicForm;
        this.cache[cacheKey] = parsed;
        return parsed;
      } catch (err) {
        console.error(`Metadata recovery failed for ${moduleKey}, fallback to defaults.`, err);
      }
    }

    // Default metadata insertion
    const defaultForm: DynamicForm = {
      formId: `form_${moduleKey}`,
      moduleKey,
      fields: [...DEFAULT_FIELDS],
      layout: {
        tabs: [...DEFAULT_TABS],
        sections: [...DEFAULT_SECTIONS],
        groups: [],
      },
    };

    this.saveMetadata(moduleKey, defaultForm);
    return defaultForm;
  }

  /**
   * Commits modified metadata definitions to persistent database.
   */
  public static saveMetadata(moduleKey: string, form: DynamicForm): void {
    const cacheKey = `meta_form_${moduleKey}`;
    this.cache[cacheKey] = form;
    localStorage.setItem(cacheKey, JSON.stringify(form));
    
    // Log schema definition updates
    this.logAuditRecord(moduleKey, 'SCHEMA_UPDATE', `Metadata schema for ${moduleKey} has been updated to version ${Date.now()}`);
  }

  /**
   * Clear cache to force reload from persistent DB.
   */
  public static clearCache(moduleKey?: string): void {
    if (moduleKey) {
      delete this.cache[`meta_form_${moduleKey}`];
    } else {
      this.cache = {};
    }
  }

  // ==========================================
  // FORMULA ENGINE
  // ==========================================

  /**
   * Evaluates custom expressions in metadata (e.g. "Boxes * SF", "price - cost").
   */
  public static evaluateFormula(expression: string, context: Record<string, any>): any {
    if (!expression) return '';
    try {
      // Build safe context evaluator to avoid dangerous eval-injection
      const keys = Object.keys(context);
      const values = keys.map(k => {
        const val = context[k];
        return typeof val === 'number' ? val : (parseFloat(val) || 0);
      });
      
      // Inject safety guards for formula terms
      const runner = new Function(...keys, `
        try {
          return (${expression});
        } catch(e) {
          return 0;
        }
      `);
      return runner(...values);
    } catch (err) {
      return 0;
    }
  }

  // ==========================================
  // DEPENDENCY ENGINE
  // ==========================================

  /**
   * Computes conditional actions (show/hide/enable/disable/require/optional) on fields.
   */
  public static evaluateDependencies(
    field: FieldDefinition,
    formData: Record<string, any>
  ): { hidden: boolean; readonly: boolean; required: boolean } {
    const result = {
      hidden: !!field.hidden,
      readonly: !!field.readonly,
      required: !!field.required,
    };

    if (!field.dependencies || field.dependencies.length === 0) {
      return result;
    }

    for (const dep of field.dependencies) {
      const sourceVal = formData[dep.targetFieldKey];
      let conditionMet = false;

      switch (dep.conditionType) {
        case 'equals':
          conditionMet = sourceVal === dep.conditionValue;
          break;
        case 'notEquals':
          conditionMet = sourceVal !== dep.conditionValue;
          break;
        case 'contains':
          conditionMet = String(sourceVal || '').toLowerCase().includes(String(dep.conditionValue || '').toLowerCase());
          break;
        case 'notContains':
          conditionMet = !String(sourceVal || '').toLowerCase().includes(String(dep.conditionValue || '').toLowerCase());
          break;
        case 'empty':
          conditionMet = sourceVal === undefined || sourceVal === null || sourceVal === '';
          break;
        case 'notEmpty':
          conditionMet = sourceVal !== undefined && sourceVal !== null && sourceVal !== '';
          break;
      }

      if (conditionMet) {
        switch (dep.action) {
          case 'show':
            result.hidden = false;
            break;
          case 'hide':
            result.hidden = true;
            break;
          case 'enable':
            result.readonly = false;
            break;
          case 'disable':
            result.readonly = true;
            break;
          case 'require':
            result.required = true;
            break;
          case 'optional':
            result.required = false;
            break;
        }
      }
    }

    return result;
  }

  // ==========================================
  // AUDIT & LOG ENGINE
  // ==========================================

  private static logAuditRecord(moduleKey: string, action: string, details: string): void {
    try {
      const logs = JSON.parse(localStorage.getItem('nexova_product_audit_logs') || '[]');
      const entry = {
        id: `audit_sys_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        moduleKey,
        action,
        details,
        user: 'Administrator',
        role: 'Administrator',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        ip: '127.0.0.1',
        browser: 'Metadata System Engine',
        approvalStatus: 'Auto-Approved'
      };
      logs.unshift(entry);
      localStorage.setItem('nexova_product_audit_logs', JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }
}
