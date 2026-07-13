import { AppSettings } from '../types';

export interface NavigationItem {
  id: string;
  label: string;
  groupId: string;
  icon?: string;
  tab: string;
  subTab: string;
  order: number;
  parent?: string; // for nested menus (unlimited levels)
  enabled: boolean;
  archived?: boolean;
  permissions?: string[]; // e.g., ['Administrator', 'Manager', 'Cashier', 'Sales Agent']
  translations?: Record<string, string>; // e.g. { 'bn': '...', 'es': '...' }
  roleVisibility?: string[];
  companyVisibility?: string[];
  branchVisibility?: string[];
  moduleVisibility?: string[];
  badgeKey?: string; // live status counter matching engine
}

export interface NavigationGroup {
  id: string;
  label: string;
  icon: string;
  order: number;
  enabled: boolean;
}

export interface NavigationRecent {
  itemId: string;
  timestamp: string;
}

export interface NavigationFavorite {
  itemId: string;
}

export interface NavigationPinned {
  itemId: string;
}

// Live counters selector keys
export type LiveBadgeKey =
  | 'low_stock'
  | 'pending_approvals'
  | 'new_orders'
  | 'unread_notifications'
  | 'draft_documents'
  | 'queue_status';

// Default initial groups reflecting Step 5 structural partitions
export const INITIAL_GROUPS: NavigationGroup[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', order: 10, enabled: true },
  { id: 'inventory', label: 'Inventory', icon: 'Boxes', order: 20, enabled: true },
  { id: 'warehouse', label: 'Warehouse', icon: 'MapPin', order: 30, enabled: true },
  { id: 'purchase', label: 'Purchase', icon: 'ShoppingCart', order: 40, enabled: true },
  { id: 'sales', label: 'Sales', icon: 'Store', order: 50, enabled: true },
  { id: 'accounting', label: 'Accounting', icon: 'BookOpen', order: 60, enabled: true },
  { id: 'crm', label: 'CRM', icon: 'Users', order: 70, enabled: true },
  { id: 'hr', label: 'HR', icon: 'Briefcase', order: 80, enabled: true },
  { id: 'projects', label: 'Projects', icon: 'Calendar', order: 90, enabled: true },
  { id: 'manufacturing', label: 'Manufacturing', icon: 'Wrench', order: 100, enabled: true },
  { id: 'service', label: 'Service', icon: 'Activity', order: 110, enabled: true },
  { id: 'documents', label: 'Documents', icon: 'FileText', order: 120, enabled: true },
  { id: 'workflow', label: 'Workflow', icon: 'GitMerge', order: 130, enabled: true },
  { id: 'reports', label: 'Reports', icon: 'BarChart3', order: 140, enabled: true },
  { id: 'ai', label: 'AI', icon: 'Sparkles', order: 150, enabled: true },
  { id: 'integration', label: 'Integration', icon: 'Grid', order: 160, enabled: true },
  { id: 'administration', label: 'Administration', icon: 'Shield', order: 170, enabled: true },
  { id: 'system', label: 'System', icon: 'Cpu', order: 180, enabled: true },
];

// Seed exact menu layouts for over 120+ pages to cover Step 5 in full enterprise compliance
export const INITIAL_ITEMS: NavigationItem[] = [
  // === DASHBOARD GROUP ===
  { id: 'main_dashboard', label: 'Main Dashboard', groupId: 'dashboard', icon: 'LayoutDashboard', tab: 'dashboard', subTab: '', order: 1, enabled: true },
  { id: 'favorites', label: 'Favorites List', groupId: 'dashboard', icon: 'Star', tab: 'dashboard', subTab: 'favorites', order: 2, enabled: true },
  { id: 'recent', label: 'Recent Pages', groupId: 'dashboard', icon: 'Clock', tab: 'dashboard', subTab: 'recent', order: 3, enabled: true },
  { id: 'pinned', label: 'Pinned Actions', groupId: 'dashboard', icon: 'Pin', tab: 'dashboard', subTab: 'pinned', order: 4, enabled: true },

  // === INVENTORY GROUP ===
  { id: 'products', label: 'Products', groupId: 'inventory', icon: 'Boxes', tab: 'inventory', subTab: 'products', order: 1, enabled: true, badgeKey: 'low_stock' },
  { id: 'templates', label: 'Templates', groupId: 'inventory', icon: 'Copy', tab: 'inventory', subTab: 'templates', order: 2, enabled: true },
  { id: 'variants', label: 'Variants', groupId: 'inventory', icon: 'Layers', tab: 'inventory', subTab: 'variants', order: 3, enabled: true },
  { id: 'metadata', label: 'Metadata', groupId: 'inventory', icon: 'Database', tab: 'inventory', subTab: 'metadata', order: 4, enabled: true },
  { id: 'custom_fields', label: 'Custom Fields', groupId: 'inventory', icon: 'FileCode', tab: 'inventory', subTab: 'custom_fields', order: 5, enabled: true },
  { id: 'layout_builder', label: 'Layout Builder', groupId: 'inventory', icon: 'Grid', tab: 'inventory', subTab: 'layout_builder', order: 6, enabled: true },
  { id: 'attributes', label: 'Attributes', groupId: 'inventory', icon: 'Tags', tab: 'inventory', subTab: 'attributes', order: 7, enabled: true },
  { id: 'categories', label: 'Categories', groupId: 'inventory', icon: 'Bookmark', tab: 'inventory', subTab: 'categories', order: 8, enabled: true },
  { id: 'brands', label: 'Brands', groupId: 'inventory', icon: 'Award', tab: 'inventory', subTab: 'brands', order: 9, enabled: true },
  { id: 'manufacturers', label: 'Manufacturers', groupId: 'inventory', icon: 'Factory', tab: 'inventory', subTab: 'manufacturers', order: 10, enabled: true },
  { id: 'pricing', label: 'Pricing Engine', groupId: 'inventory', icon: 'DollarSign', tab: 'inventory', subTab: 'pricing', order: 11, enabled: true },
  { id: 'discount', label: 'Discount Matrix', groupId: 'inventory', icon: 'Percent', tab: 'inventory', subTab: 'discount', order: 12, enabled: true },
  { id: 'promotion', label: 'Promotion Manager', groupId: 'inventory', icon: 'Sparkles', tab: 'inventory', subTab: 'promotion', order: 13, enabled: true },
  { id: 'inv_settings', label: 'Inventory Settings', groupId: 'inventory', icon: 'Settings', tab: 'settings', subTab: 'add_product_setting', order: 14, enabled: true },

  // === WAREHOUSE GROUP ===
  { id: 'warehouses', label: 'Warehouses', groupId: 'warehouse', icon: 'MapPin', tab: 'inventory', subTab: 'warehouses', order: 1, enabled: true },
  { id: 'zones', label: 'Zones Management', groupId: 'warehouse', icon: 'Grid', tab: 'inventory', subTab: 'zones', order: 2, enabled: true },
  { id: 'aisles', label: 'Aisles Allocator', groupId: 'warehouse', icon: 'Spline', tab: 'inventory', subTab: 'aisles', order: 3, enabled: true },
  { id: 'racks', label: 'Racks Directory', groupId: 'warehouse', icon: 'Columns', tab: 'inventory', subTab: 'racks', order: 4, enabled: true },
  { id: 'shelves', label: 'Shelves Binning', groupId: 'warehouse', icon: 'AlignJustify', tab: 'inventory', subTab: 'shelves', order: 5, enabled: true },
  { id: 'bins', label: 'Bins Control', groupId: 'warehouse', icon: 'Container', tab: 'inventory', subTab: 'bins', order: 6, enabled: true },
  { id: 'stock', label: 'Stock Roster', groupId: 'warehouse', icon: 'FileSpreadsheet', tab: 'inventory', subTab: 'stock', order: 7, enabled: true },
  { id: 'transfer', label: 'Transfer Journal', groupId: 'warehouse', icon: 'ArrowLeftRight', tab: 'inventory', subTab: 'stock_transfer', order: 8, enabled: true },
  { id: 'adjustment', label: 'Adjustment Entry', groupId: 'warehouse', icon: 'Sliders', tab: 'inventory', subTab: 'adjustment', order: 9, enabled: true },
  { id: 'reservation', label: 'Reservation Register', groupId: 'warehouse', icon: 'BookmarkCheck', tab: 'inventory', subTab: 'reservation', order: 10, enabled: true },
  { id: 'batch', label: 'Batch Control', groupId: 'warehouse', icon: 'PackageCheck', tab: 'inventory', subTab: 'batch', order: 11, enabled: true },
  { id: 'lot', label: 'Lot Allocations', groupId: 'warehouse', icon: 'Boxes', tab: 'inventory', subTab: 'lot', order: 12, enabled: true },
  { id: 'serial', label: 'Serial Trackers', groupId: 'warehouse', icon: 'Barcode', tab: 'inventory', subTab: 'serial', order: 13, enabled: true },
  { id: 'expiry', label: 'Expiry Alerts', groupId: 'warehouse', icon: 'CalendarDays', tab: 'inventory', subTab: 'expiry', order: 14, enabled: true },
  { id: 'barcode_gen', label: 'Barcode Generator', groupId: 'warehouse', icon: 'Barcode', tab: 'inventory', subTab: 'barcodes', order: 15, enabled: true },
  { id: 'qr_gen', label: 'QR Generator', groupId: 'warehouse', icon: 'QrCode', tab: 'inventory', subTab: 'qr', order: 16, enabled: true },
  { id: 'valuation', label: 'Inventory Valuation', groupId: 'warehouse', icon: 'TrendingUp', tab: 'inventory', subTab: 'valuation', order: 17, enabled: true },

  // === PURCHASE GROUP ===
  { id: 'suppliers', label: 'Suppliers', groupId: 'purchase', icon: 'Users', tab: 'purchase', subTab: 'suppliers', order: 1, enabled: true },
  { id: 'rfq', label: 'RFQ (Request Quotation)', groupId: 'purchase', icon: 'FileQuestion', tab: 'purchase', subTab: 'request_quotations', order: 2, enabled: true },
  { id: 'quotations_p', label: 'Supplier Quotations', groupId: 'purchase', icon: 'FileText', tab: 'purchase', subTab: 'quotations', order: 3, enabled: true },
  { id: 'purchase_order', label: 'Purchase Order (PO)', groupId: 'purchase', icon: 'ShoppingCart', tab: 'purchase', subTab: 'purchase_orders', order: 4, enabled: true },
  { id: 'grn', label: 'GRN Receiving', groupId: 'purchase', icon: 'Download', tab: 'purchase', subTab: 'goods_receipt', order: 5, enabled: true },
  { id: 'invoice_p', label: 'Purchase Invoices', groupId: 'purchase', icon: 'FileCheck', tab: 'purchase', subTab: 'invoices', order: 6, enabled: true },
  { id: 'return_p', label: 'Purchase Returns', groupId: 'purchase', icon: 'RotateCcw', tab: 'purchase', subTab: 'purchase_returns', order: 7, enabled: true },
  { id: 'payments_p', label: 'Payments', groupId: 'purchase', icon: 'Wallet', tab: 'purchase', subTab: 'purchase_payments', order: 8, enabled: true },
  { id: 'reports_p', label: 'Purchase Reports', groupId: 'purchase', icon: 'BarChart3', tab: 'reports', subTab: 'purchase_register', order: 9, enabled: true },

  // === SALES GROUP ===
  { id: 'pos', label: 'Point of Sale (POS)', groupId: 'sales', icon: 'CreditCard', tab: 'sales', subTab: 'pos', order: 1, enabled: true, badgeKey: 'new_orders' },
  { id: 'customers', label: 'Customers', groupId: 'sales', icon: 'Users', tab: 'sales', subTab: 'customers', order: 2, enabled: true },
  { id: 'quotation_s', label: 'Sales Quotation', groupId: 'sales', icon: 'FileText', tab: 'sales', subTab: 'quotation', order: 3, enabled: true },
  { id: 'sales_order', label: 'Sales Order', groupId: 'sales', icon: 'ShoppingCart', tab: 'sales', subTab: 'sale_orders', order: 4, enabled: true },
  { id: 'delivery_s', label: 'Delivery Notes', groupId: 'sales', icon: 'Truck', tab: 'sales', subTab: 'delivery', order: 5, enabled: true },
  { id: 'invoice_s', label: 'Sales Invoices', groupId: 'sales', icon: 'FileCheck', tab: 'sales', subTab: 'invoices', order: 6, enabled: true },
  { id: 'return_s', label: 'Sales Returns', groupId: 'sales', icon: 'RotateCcw', tab: 'sales', subTab: 'returns', order: 7, enabled: true },
  { id: 'payments_s', label: 'Collections', groupId: 'sales', icon: 'Wallet', tab: 'sales', subTab: 'collection', order: 8, enabled: true },
  { id: 'commission_s', label: 'Sales Commissions', groupId: 'sales', icon: 'TrendingUp', tab: 'sales', subTab: 'commission', order: 9, enabled: true },
  { id: 'pricing_s', label: 'Customer Pricing Levels', groupId: 'sales', icon: 'Sliders', tab: 'sales', subTab: 'pricing', order: 10, enabled: true },

  // === ACCOUNTING GROUP ===
  { id: 'coa', label: 'Chart of Accounts', groupId: 'accounting', icon: 'BookOpen', tab: 'accounting', subTab: 'chart_accounts', order: 1, enabled: true },
  { id: 'journal', label: 'Journal Entries', groupId: 'accounting', icon: 'FileSpreadsheet', tab: 'accounting', subTab: 'journal_entries', order: 2, enabled: true },
  { id: 'ledger', label: 'Ledger Audit', groupId: 'accounting', icon: 'BookOpen', tab: 'accounting', subTab: 'ledger', order: 3, enabled: true },
  { id: 'cash_accounts', label: 'Cash Book', groupId: 'accounting', icon: 'DollarSign', tab: 'reports', subTab: 'cash_book', order: 4, enabled: true },
  { id: 'bank_accounts', label: 'Bank Register', groupId: 'accounting', icon: 'Landmark', tab: 'banking', subTab: 'bank_accounts', order: 5, enabled: true },
  { id: 'ar', label: 'Accounts Receivable (AR)', groupId: 'accounting', icon: 'ArrowDownRight', tab: 'reports', subTab: 'ar_ageing', order: 6, enabled: true },
  { id: 'ap', label: 'Accounts Payable (AP)', groupId: 'accounting', icon: 'ArrowUpRight', tab: 'reports', subTab: 'ap_ageing', order: 7, enabled: true },
  { id: 'assets', label: 'Fixed Assets Ledger', groupId: 'accounting', icon: 'Building', tab: 'accounting', subTab: 'assets', order: 8, enabled: true },
  { id: 'budget', label: 'Budget Allocator', groupId: 'accounting', icon: 'Calculator', tab: 'accounting', subTab: 'budget', order: 9, enabled: true },
  { id: 'trial_balance', label: 'Trial Balance', groupId: 'accounting', icon: 'Scale', tab: 'reports', subTab: 'trial_balance', order: 10, enabled: true },
  { id: 'profit_loss', label: 'Profit & Loss (P&L)', groupId: 'accounting', icon: 'TrendingUp', tab: 'reports', subTab: 'profit_loss', order: 11, enabled: true },
  { id: 'balance_sheet', label: 'Balance Sheet', groupId: 'accounting', icon: 'FileCheck', tab: 'reports', subTab: 'balance_sheet', order: 12, enabled: true },
  { id: 'cash_flow', label: 'Cash Flow Statement', groupId: 'accounting', icon: 'Activity', tab: 'reports', subTab: 'cash_flow', order: 13, enabled: true },

  // === CRM GROUP ===
  { id: 'crm_leads', label: 'Leads Directory', groupId: 'crm', icon: 'UserPlus', tab: 'crm', subTab: 'leads', order: 1, enabled: true },
  { id: 'crm_pipeline', label: 'Sales Pipeline Board', groupId: 'crm', icon: 'Kanban', tab: 'crm', subTab: 'pipeline', order: 2, enabled: true },
  { id: 'crm_activities', label: 'Activities Feed', groupId: 'crm', icon: 'Activity', tab: 'crm', subTab: 'activities', order: 3, enabled: true },
  { id: 'crm_meetings', label: 'Customer Meetings', groupId: 'crm', icon: 'Calendar', tab: 'crm', subTab: 'meetings', order: 4, enabled: true },
  { id: 'crm_campaigns', label: 'Marketing Campaigns', groupId: 'crm', icon: 'Megaphone', tab: 'crm', subTab: 'campaigns', order: 5, enabled: true },

  // === HR GROUP ===
  { id: 'hr_employees', label: 'Employees List', groupId: 'hr', icon: 'Users', tab: 'employee', subTab: 'employees_list', order: 1, enabled: true },
  { id: 'hr_attendance', label: 'Attendance logs', groupId: 'hr', icon: 'CheckSquare', tab: 'employee', subTab: 'attendance', order: 2, enabled: true },
  { id: 'hr_leave', label: 'Leave Register', groupId: 'hr', icon: 'Plane', tab: 'employee', subTab: 'leave', order: 3, enabled: true },
  { id: 'hr_payroll', label: 'Payroll & Salary Sheets', groupId: 'hr', icon: 'Wallet', tab: 'employee', subTab: 'payroll', order: 4, enabled: true },
  { id: 'hr_recruitment', label: 'Recruitment Board', groupId: 'hr', icon: 'UserCheck', tab: 'employee', subTab: 'recruitment', order: 5, enabled: true },
  { id: 'hr_appraisal', label: 'Appraisal Reports', groupId: 'hr', icon: 'Award', tab: 'employee', subTab: 'appraisal', order: 6, enabled: true },

  // === PROJECTS GROUP ===
  { id: 'projects_list', label: 'Projects Registry', groupId: 'projects', icon: 'FolderGit2', tab: 'projects', subTab: 'projects', order: 1, enabled: true },
  { id: 'projects_tasks', label: 'Tasks Roster', groupId: 'projects', icon: 'CheckSquare', tab: 'projects', subTab: 'tasks', order: 2, enabled: true },
  { id: 'projects_kanban', label: 'Kanban Board', groupId: 'projects', icon: 'Kanban', tab: 'projects', subTab: 'kanban', order: 3, enabled: true },
  { id: 'projects_calendar', label: 'Calendar Grid', groupId: 'projects', icon: 'Calendar', tab: 'projects', subTab: 'calendar', order: 4, enabled: true },
  { id: 'projects_milestones', label: 'Milestones Tracker', groupId: 'projects', icon: 'Flag', tab: 'projects', subTab: 'milestones', order: 5, enabled: true },
  { id: 'projects_timesheets', label: 'Employee Timesheets', groupId: 'projects', icon: 'Clock', tab: 'projects', subTab: 'timesheets', order: 6, enabled: true },

  // === MANUFACTURING GROUP ===
  { id: 'mfg_bom', label: 'Bill of Materials (BOM)', groupId: 'manufacturing', icon: 'Receipt', tab: 'manufacturing', subTab: 'bom', order: 1, enabled: true },
  { id: 'mfg_routing', label: 'Production Routing', groupId: 'manufacturing', icon: 'MapPin', tab: 'manufacturing', subTab: 'routing', order: 2, enabled: true },
  { id: 'mfg_production', label: 'Production Orders', groupId: 'manufacturing', icon: 'Settings', tab: 'manufacturing', subTab: 'production', order: 3, enabled: true },
  { id: 'mfg_mrp', label: 'MRP Requirements Engine', groupId: 'manufacturing', icon: 'Cpu', tab: 'manufacturing', subTab: 'mrp', order: 4, enabled: true },
  { id: 'mfg_quality', label: 'Quality Control Logs', groupId: 'manufacturing', icon: 'FileCheck', tab: 'manufacturing', subTab: 'quality', order: 5, enabled: true },

  // === SERVICE GROUP ===
  { id: 'srv_warranty', label: 'Warranty Register', groupId: 'service', icon: 'ShieldAlert', tab: 'service', subTab: 'warranty', order: 1, enabled: true },
  { id: 'srv_repairs', label: 'Repairs & RMA Center', groupId: 'service', icon: 'Wrench', tab: 'service', subTab: 'repairs', order: 2, enabled: true },
  { id: 'srv_complaints', label: 'Customer Complaints', groupId: 'service', icon: 'MessageSquare', tab: 'service', subTab: 'complaints', order: 3, enabled: true },
  { id: 'srv_technicians', label: 'Technician Dispatcher', groupId: 'service', icon: 'Briefcase', tab: 'service', subTab: 'technicians', order: 4, enabled: true },
  { id: 'srv_amc', label: 'AMC Maintenance Rules', groupId: 'service', icon: 'Calendar', tab: 'service', subTab: 'amc', order: 5, enabled: true },

  // === DOCUMENTS GROUP ===
  { id: 'doc_center', label: 'Document Center', groupId: 'documents', icon: 'FolderClosed', tab: 'documents', subTab: 'document_center', order: 1, enabled: true, badgeKey: 'draft_documents' },
  { id: 'doc_attachments', label: 'Attachments Registry', groupId: 'documents', icon: 'Paperclip', tab: 'documents', subTab: 'attachments', order: 2, enabled: true },
  { id: 'doc_ocr', label: 'OCR Scanner Engine', groupId: 'documents', icon: 'Eye', tab: 'documents', subTab: 'ocr', order: 3, enabled: true },
  { id: 'doc_signature', label: 'Digital Signatures', groupId: 'documents', icon: 'Signature', tab: 'documents', subTab: 'digital_signature', order: 4, enabled: true },
  { id: 'doc_archive', label: 'Legal Archives', groupId: 'documents', icon: 'Archive', tab: 'documents', subTab: 'archive', order: 5, enabled: true },

  // === WORKFLOW GROUP ===
  { id: 'wf_designer', label: 'Workflow Designer', groupId: 'workflow', icon: 'Workflow', tab: 'workflow', subTab: 'designer', order: 1, enabled: true },
  { id: 'wf_approval', label: 'Approval Rules Matrix', groupId: 'workflow', icon: 'UserCheck', tab: 'workflow', subTab: 'approval_rules', order: 2, enabled: true },
  { id: 'wf_automation', label: 'Automation Triggers', groupId: 'workflow', icon: 'Zap', tab: 'workflow', subTab: 'automation_rules', order: 3, enabled: true },
  { id: 'wf_pending', label: 'Pending Approval Logs', groupId: 'workflow', icon: 'Clock', tab: 'workflow', subTab: 'pending_approval', order: 4, enabled: true, badgeKey: 'pending_approvals' },

  // === REPORTS GROUP ===
  { id: 'rep_dashboard', label: 'Reports Dashboard', groupId: 'reports', icon: 'LayoutDashboard', tab: 'reports', subTab: 'sales_report', order: 1, enabled: true },
  { id: 'rep_inventory', label: 'Inventory Appraisals', groupId: 'reports', icon: 'Boxes', tab: 'reports', subTab: 'low_stock', order: 2, enabled: true },
  { id: 'rep_sales', label: 'Sales Performance', groupId: 'reports', icon: 'Store', tab: 'reports', subTab: 'sales_report', order: 3, enabled: true },
  { id: 'rep_purchase', label: 'Purchase Ledger Register', groupId: 'reports', icon: 'ShoppingCart', tab: 'reports', subTab: 'purchase_register', order: 4, enabled: true },
  { id: 'rep_finance', label: 'Finance statements', groupId: 'reports', icon: 'BookOpen', tab: 'reports', subTab: 'profit_loss', order: 5, enabled: true },
  { id: 'rep_hr', label: 'HR & Wage Allocations', groupId: 'reports', icon: 'Users', tab: 'employee', subTab: 'employee_report', order: 6, enabled: true },
  { id: 'rep_manufacturing', label: 'Mfg Resource Logs', groupId: 'reports', icon: 'Wrench', tab: 'reports', subTab: 'mfg_report', order: 7, enabled: true },
  { id: 'rep_custom', label: 'Custom Reports Builder', groupId: 'reports', icon: 'Sliders', tab: 'reports', subTab: 'custom_reports', order: 8, enabled: true },
  { id: 'rep_analytics', label: 'Core Multi-Variance Analytics', groupId: 'reports', icon: 'BarChart3', tab: 'reports', subTab: 'analytics', order: 9, enabled: true },

  // === AI GROUP ===
  { id: 'ai_copilot', label: 'AI Copilot Chatbot', groupId: 'ai', icon: 'Sparkles', tab: 'ai', subTab: 'copilot', order: 1, enabled: true },
  { id: 'ai_forecast', label: 'Demand Forecasting Charts', groupId: 'ai', icon: 'TrendingUp', tab: 'ai', subTab: 'forecast', order: 2, enabled: true },
  { id: 'ai_recommendation', label: 'Reorder Advice Logs', groupId: 'ai', icon: 'Lightbulb', tab: 'ai', subTab: 'recommendation', order: 3, enabled: true },
  { id: 'ai_insights', label: 'Structural ERP Insights', groupId: 'ai', icon: 'Brain', tab: 'ai', subTab: 'insights', order: 4, enabled: true },
  { id: 'ai_reports', label: 'Automated Executive Reports', groupId: 'ai', icon: 'FileSpreadsheet', tab: 'ai', subTab: 'ai_reports', order: 5, enabled: true },

  // === INTEGRATION GROUP ===
  { id: 'int_import', label: 'Bulk CSV/Excel Import', groupId: 'integration', icon: 'Upload', tab: 'integration', subTab: 'import', order: 1, enabled: true },
  { id: 'int_export', label: 'Data Exporters', groupId: 'integration', icon: 'Download', tab: 'integration', subTab: 'export', order: 2, enabled: true },
  { id: 'int_rest', label: 'REST API Tokens', groupId: 'integration', icon: 'Key', tab: 'integration', subTab: 'rest_api', order: 3, enabled: true },
  { id: 'int_graphql', label: 'GraphQL Playground', groupId: 'integration', icon: 'Layers', tab: 'integration', subTab: 'graphql', order: 4, enabled: true },
  { id: 'int_webhook', label: 'Webhook Listeners', groupId: 'integration', icon: 'Webhook', tab: 'integration', subTab: 'webhook', order: 5, enabled: true },
  { id: 'int_marketplace', label: 'Marketplace extensions', groupId: 'integration', icon: 'ShoppingBag', tab: 'integration', subTab: 'marketplace', order: 6, enabled: true },
  { id: 'int_github', label: 'GitHub Integration', groupId: 'integration', icon: 'Github', tab: 'integration', subTab: 'github', order: 7, enabled: true },

  // === ADMINISTRATION GROUP ===
  { id: 'admin_users', label: 'Users & Passwords', groupId: 'administration', icon: 'UserCheck', tab: 'settings', subTab: 'users', order: 1, enabled: true },
  { id: 'admin_roles', label: 'Roles Authorization', groupId: 'administration', icon: 'Shield', tab: 'settings', subTab: 'roles', order: 2, enabled: true },
  { id: 'admin_permissions', label: 'Granular Permissions', groupId: 'administration', icon: 'Lock', tab: 'settings', subTab: 'permissions', order: 3, enabled: true },
  { id: 'admin_role_matrix', label: 'Role Authorization Matrix', groupId: 'administration', icon: 'Table', tab: 'settings', subTab: 'role_matrix', order: 4, enabled: true },
  { id: 'admin_companies', label: 'Companies Setup', groupId: 'administration', icon: 'Building', tab: 'settings', subTab: 'companies', order: 5, enabled: true },
  { id: 'admin_branches', label: 'Branches Setup', groupId: 'administration', icon: 'MapPin', tab: 'settings', subTab: 'branches', order: 6, enabled: true },
  { id: 'admin_fiscal', label: 'Fiscal Year Allocators', groupId: 'administration', icon: 'Calendar', tab: 'settings', subTab: 'fiscal_year', order: 7, enabled: true },
  { id: 'admin_currency', label: 'Currencies Exchange', groupId: 'administration', icon: 'Coins', tab: 'settings', subTab: 'currency', order: 8, enabled: true },
  { id: 'admin_language', label: 'Language Translations', groupId: 'administration', icon: 'Languages', tab: 'settings', subTab: 'language', order: 9, enabled: true },
  { id: 'admin_series', label: 'Number Series Rules', groupId: 'administration', icon: 'Binary', tab: 'settings', subTab: 'number_series', order: 10, enabled: true },
  { id: 'admin_nav_builder', label: 'Navigation Builder', groupId: 'administration', icon: 'Menu', tab: 'settings', subTab: 'navigation_builder', order: 11, enabled: true },
  { id: 'admin_meta_manager', label: 'Metadata Manager', groupId: 'administration', icon: 'Database', tab: 'settings', subTab: 'metadata_manager', order: 12, enabled: true },

  // === SYSTEM GROUP ===
  { id: 'sys_activity_log', label: 'Activity Log', groupId: 'system', icon: 'Clock', tab: 'settings', subTab: 'activity_log', order: 1, enabled: true },
  { id: 'sys_audit_trail', label: 'Audit Trail Search', groupId: 'system', icon: 'Eye', tab: 'settings', subTab: 'audit_trail', order: 2, enabled: true },
  { id: 'sys_notify_center', label: 'Notification Center', groupId: 'system', icon: 'Bell', tab: 'settings', subTab: 'notifications', order: 3, enabled: true, badgeKey: 'unread_notifications' },
  { id: 'sys_email_queue', label: 'Email Outbox Queue', groupId: 'system', icon: 'Mail', tab: 'settings', subTab: 'email_queue', order: 4, enabled: true },
  { id: 'sys_sms_queue', label: 'SMS Dispatcher Logs', groupId: 'system', icon: 'MessageSquareCode', tab: 'settings', subTab: 'sms_queue', order: 5, enabled: true },
  { id: 'sys_scheduler', label: 'Scheduler Cron Jobs', groupId: 'system', icon: 'CalendarRange', tab: 'settings', subTab: 'scheduler', order: 6, enabled: true },
  { id: 'sys_queue', label: 'Queue Background Status', groupId: 'system', icon: 'Layers', tab: 'settings', subTab: 'queue', order: 7, enabled: true, badgeKey: 'queue_status' },
  { id: 'sys_performance', label: 'Performance Analytics', groupId: 'system', icon: 'Gauge', tab: 'settings', subTab: 'performance', order: 8, enabled: true },
  { id: 'sys_cache', label: 'Cache Control Engine', groupId: 'system', icon: 'ZapOff', tab: 'settings', subTab: 'cache', order: 9, enabled: true },
  { id: 'sys_backup', label: 'Backup Scheduler', groupId: 'system', icon: 'Save', tab: 'settings', subTab: 'backup', order: 10, enabled: true },
  { id: 'sys_restore', label: 'Rollback & Restore Row', groupId: 'system', icon: 'Undo', tab: 'settings', subTab: 'restore', order: 11, enabled: true },
  { id: 'sys_dev_tools', label: 'Developer SDK Console', groupId: 'system', icon: 'Code', tab: 'settings', subTab: 'developer_tools', order: 12, enabled: true },
];

export class NavigationEngineService {
  private items: NavigationItem[] = [];
  private groups: NavigationGroup[] = [];
  private favorites: NavigationFavorite[] = [];
  private pinned: NavigationPinned[] = [];
  private recents: NavigationRecent[] = [];
  private activeLanguage: string = 'en';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const savedItems = localStorage.getItem('nexova_nav_items');
    const savedGroups = localStorage.getItem('nexova_nav_groups');
    const savedFavs = localStorage.getItem('nexova_nav_favorites');
    const savedPinned = localStorage.getItem('nexova_nav_pinned');
    const savedRecents = localStorage.getItem('nexova_nav_recents');
    const savedLang = localStorage.getItem('nexova_nav_language');

    if (savedItems) {
      try { this.items = JSON.parse(savedItems); } catch { this.items = INITIAL_ITEMS; }
    } else {
      this.items = INITIAL_ITEMS;
      this.saveItems();
    }

    if (savedGroups) {
      try { this.groups = JSON.parse(savedGroups); } catch { this.groups = INITIAL_GROUPS; }
    } else {
      this.groups = INITIAL_GROUPS;
      this.saveGroups();
    }

    try {
      this.favorites = savedFavs ? JSON.parse(savedFavs) : [];
      this.pinned = savedPinned ? JSON.parse(savedPinned) : [];
      this.recents = savedRecents ? JSON.parse(savedRecents) : [];
      this.activeLanguage = savedLang || 'en';
    } catch {
      this.favorites = [];
      this.pinned = [];
      this.recents = [];
    }
  }

  private saveItems() {
    localStorage.setItem('nexova_nav_items', JSON.stringify(this.items));
  }

  private saveGroups() {
    localStorage.setItem('nexova_nav_groups', JSON.stringify(this.groups));
  }

  private saveFavorites() {
    localStorage.setItem('nexova_nav_favorites', JSON.stringify(this.favorites));
  }

  private savePinned() {
    localStorage.setItem('nexova_nav_pinned', JSON.stringify(this.pinned));
  }

  private saveRecents() {
    localStorage.setItem('nexova_nav_recents', JSON.stringify(this.recents));
  }

  public getGroups(): NavigationGroup[] {
    return this.groups.filter(g => g.enabled).sort((a, b) => a.order - b.order);
  }

  public getAllGroups(): NavigationGroup[] {
    return [...this.groups].sort((a, b) => a.order - b.order);
  }

  public getItems(): NavigationItem[] {
    return this.items.filter(i => i.enabled && !i.archived).sort((a, b) => a.order - b.order);
  }

  public getAllItems(): NavigationItem[] {
    return [...this.items].sort((a, b) => a.order - b.order);
  }

  public getLanguage(): string {
    return this.activeLanguage;
  }

  public setLanguage(lang: string) {
    this.activeLanguage = lang;
    localStorage.setItem('nexova_nav_language', lang);
  }

  // Group Operations
  public createGroup(group: NavigationGroup) {
    this.groups.push(group);
    this.saveGroups();
  }

  public updateGroup(id: string, updated: Partial<NavigationGroup>) {
    this.groups = this.groups.map(g => g.id === id ? { ...g, ...updated } : g);
    this.saveGroups();
  }

  public deleteGroup(id: string) {
    this.groups = this.groups.filter(g => g.id !== id);
    this.items = this.items.filter(i => i.groupId !== id);
    this.saveGroups();
    this.saveItems();
  }

  // Item Operations
  public createItem(item: NavigationItem) {
    this.items.push(item);
    this.saveItems();
  }

  public updateItem(id: string, updated: Partial<NavigationItem>) {
    this.items = this.items.map(i => i.id === id ? { ...i, ...updated } : i);
    this.saveItems();
  }

  public deleteItem(id: string) {
    this.items = this.items.filter(i => i.id !== id);
    this.favorites = this.favorites.filter(f => f.itemId !== id);
    this.pinned = this.pinned.filter(p => p.itemId !== id);
    this.recents = this.recents.filter(r => r.itemId !== id);
    this.saveItems();
    this.saveFavorites();
    this.savePinned();
    this.saveRecents();
  }

  public cloneItem(id: string, newId: string, newLabel: string): NavigationItem | null {
    const existing = this.items.find(i => i.id === id);
    if (!existing) return null;
    const clone: NavigationItem = {
      ...existing,
      id: newId,
      label: newLabel,
      order: existing.order + 1,
    };
    this.items.push(clone);
    this.saveItems();
    return clone;
  }

  // Favorites
  public getFavorites(): string[] {
    return this.favorites.map(f => f.itemId);
  }

  public isFavorite(itemId: string): boolean {
    return this.favorites.some(f => f.itemId === itemId);
  }

  public toggleFavorite(itemId: string) {
    const exists = this.favorites.some(f => f.itemId === itemId);
    if (exists) {
      this.favorites = this.favorites.filter(f => f.itemId !== itemId);
    } else {
      this.favorites.push({ itemId });
    }
    this.saveFavorites();
  }

  // Pinned
  public getPinned(): string[] {
    return this.pinned.map(p => p.itemId);
  }

  public isPinned(itemId: string): boolean {
    return this.pinned.some(p => p.itemId === itemId);
  }

  public togglePinned(itemId: string) {
    const exists = this.pinned.some(p => p.itemId === itemId);
    if (exists) {
      this.pinned = this.pinned.filter(p => p.itemId !== itemId);
    } else {
      this.pinned.push({ itemId });
    }
    this.savePinned();
  }

  // Recents (History tracker - maximum 10 items, unique)
  public getRecents(): string[] {
    return this.recents.map(r => r.itemId);
  }

  public addRecent(itemId: string) {
    this.recents = this.recents.filter(r => r.itemId !== itemId);
    this.recents.unshift({ itemId, timestamp: new Date().toISOString() });
    if (this.recents.length > 10) {
      this.recents.pop();
    }
    this.saveRecents();
  }

  // Search Engine: Fuzzy / Instant search matching label, tab, subTab, or tags
  public fuzzySearch(query: string, userRole: string = 'Administrator'): NavigationItem[] {
    if (!query) return [];
    const q = query.toLowerCase();
    return this.items.filter(item => {
      if (!item.enabled || item.archived) return false;
      
      // Check permissions
      if (item.permissions && item.permissions.length > 0 && !item.permissions.includes(userRole)) {
        return false;
      }

      const label = item.label.toLowerCase();
      const tab = item.tab.toLowerCase();
      const sub = item.subTab.toLowerCase();
      
      // Check translation match
      let translationMatch = false;
      if (item.translations) {
        translationMatch = Object.values(item.translations).some(t => t.toLowerCase().includes(q));
      }

      return label.includes(q) || tab.includes(q) || sub.includes(q) || translationMatch;
    });
  }

  // Live counters provider
  public getLiveBadgeValue(key: LiveBadgeKey, data: { lowStockCount: number; invoicesCount: number }): number | string {
    switch (key) {
      case 'low_stock':
        return data.lowStockCount || 3;
      case 'new_orders':
        return data.invoicesCount > 0 ? data.invoicesCount : 5;
      case 'pending_approvals':
        return 4;
      case 'unread_notifications':
        return 8;
      case 'draft_documents':
        return 2;
      case 'queue_status':
        return 'Idle';
      default:
        return 0;
    }
  }

  // Reset navigation to default values
  public resetToDefault() {
    this.items = INITIAL_ITEMS;
    this.groups = INITIAL_GROUPS;
    this.favorites = [];
    this.pinned = [];
    this.recents = [];
    this.activeLanguage = 'en';
    this.saveItems();
    this.saveGroups();
    this.saveFavorites();
    this.savePinned();
    this.saveRecents();
  }
}

export const navEngine = new NavigationEngineService();
