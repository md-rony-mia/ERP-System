export type FieldType =
  | 'Text'
  | 'Textarea'
  | 'Rich Text'
  | 'Integer'
  | 'Decimal'
  | 'Currency'
  | 'Percentage'
  | 'Boolean'
  | 'Date'
  | 'Time'
  | 'DateTime'
  | 'Dropdown'
  | 'Multi Select'
  | 'Radio'
  | 'Checkbox'
  | 'Toggle'
  | 'Image'
  | 'Gallery'
  | 'File'
  | 'PDF'
  | 'Video'
  | 'Signature'
  | 'Barcode'
  | 'QR Code'
  | 'Color'
  | 'Icon'
  | 'Lookup'
  | 'Tree'
  | 'JSON'
  | 'Formula'
  | 'User'
  | 'Warehouse'
  | 'Supplier'
  | 'Customer'
  | 'Employee'
  | 'Branch'
  | 'Company'
  | 'Product Relation';

export interface FieldOption {
  label: string;
  value: string;
  icon?: string;
  color?: string;
}

export interface FieldDependency {
  targetFieldKey: string;
  conditionType: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'empty' | 'notEmpty';
  conditionValue?: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional';
}

export interface ValidationDefinition {
  ruleType: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'regex' | 'custom';
  errorMessage: string;
  ruleValue?: any;
}

export interface PermissionDefinition {
  role: string;
  access: 'None' | 'View' | 'Edit';
}

export interface WorkflowDefinition {
  triggerStatus?: string;
  nextStatus?: string;
  approvers?: string[];
  autoApprove?: boolean;
}

export interface FieldDefinition {
  id: string;
  uuid: string;
  fieldKey: string;
  fieldName: string;
  displayName: string;
  description: string;
  placeholder: string;
  tooltip: string;
  helpText: string;
  fieldType: FieldType;
  defaultValue: any;
  required: boolean;
  unique: boolean;
  readonly: boolean;
  hidden: boolean;
  visible: boolean;
  searchable: boolean;
  filterable: boolean;
  sortable: boolean;
  exportable: boolean;
  importable: boolean;
  printable: boolean;
  encrypted: boolean;
  mask: string;
  minLength: number;
  maxLength: number;
  minimum: number;
  maximum: number;
  regex: string;
  tab: string;
  section: string;
  group: string;
  order: number;
  icon: string;
  color: string;
  width: 'Full' | 'Half' | 'Third' | 'Quarter' | string;
  responsiveWidth: string;
  formula: string;
  validationRules: ValidationDefinition[];
  workflow: WorkflowDefinition[];
  permission: PermissionDefinition[];
  dependencies: FieldDependency[];
  options?: FieldOption[];
  customProperties?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

export interface TabDefinition {
  id: string;
  title: string;
  displayOrder: number;
  icon?: string;
  description?: string;
}

export interface SectionDefinition {
  id: string;
  title: string;
  tabId: string;
  displayOrder: number;
  icon?: string;
}

export interface FieldGroup {
  id: string;
  title: string;
  sectionId: string;
  displayOrder: number;
}

export interface LayoutDefinition {
  tabs: TabDefinition[];
  sections: SectionDefinition[];
  groups: FieldGroup[];
}

export interface DynamicForm {
  formId: string;
  moduleKey: string; // e.g. 'products', 'customers', etc.
  fields: FieldDefinition[];
  layout: LayoutDefinition;
}

export interface FieldHistory {
  timestamp: string;
  fieldKey: string;
  displayName: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
  reason?: string;
}

export interface AuditRecord {
  id: string;
  moduleKey: string;
  recordId: string;
  timestamp: string;
  user: string;
  role: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RECONCILE';
  details: string;
  changes: FieldHistory[];
  ipAddress?: string;
  browser?: string;
}
