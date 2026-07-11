import { ModuleConfig } from '../components/UniversalCrudEngine';

export const LEADS_CONFIG: ModuleConfig = {
  moduleKey: 'leads',
  moduleName: 'Corporate Sales Leads',
  iconName: 'Users',
  primaryKey: 'id',
  fields: [
    { key: 'name', label: 'Lead Name', type: 'text', required: true, searchable: true },
    { key: 'company', label: 'Company Name', type: 'text', required: true, searchable: true },
    { key: 'value', label: 'Est. Deal Value (BDT)', type: 'currency', required: true, sortable: true },
    { key: 'email', label: 'Corporate Email', type: 'email', required: true, searchable: true },
    { key: 'phone', label: 'Phone Number', type: 'phone', required: true, searchable: true },
    {
      key: 'assignedRep',
      label: 'Assigned Representative',
      type: 'select',
      required: true,
      options: [
        { label: 'Al-Amin Rahman', value: 'Al-Amin Rahman' },
        { label: 'Kamal Uddin', value: 'Kamal Uddin' },
        { label: 'Siam Hossain', value: 'Siam Hossain' },
        { label: 'Rony Mia', value: 'Rony Mia' }
      ]
    },
    {
      key: 'campaign',
      label: 'Origin Campaign',
      type: 'select',
      options: [
        { label: 'None', value: 'None' },
        { label: 'Q3 Discount Promo', value: 'Q3 Discount' },
        { label: 'Summer Ad Campaigns', value: 'Summer Promo' }
      ]
    },
    { key: 'notes', label: 'Lead Requirements & Notes', type: 'textarea' }
  ],
  workflowStatuses: ['Draft', 'Submitted', 'Pending Approval', 'Approved']
};

export const EMPLOYEES_CONFIG: ModuleConfig = {
  moduleKey: 'employees',
  moduleName: 'Employee Directory',
  iconName: 'Briefcase',
  primaryKey: 'id',
  fields: [
    { key: 'name', label: 'Full Name', type: 'text', required: true, searchable: true },
    {
      key: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: [
        { label: 'Engineering', value: 'Engineering' },
        { label: 'HR & Operations', value: 'HR' },
        { label: 'Sales & Marketing', value: 'Sales' },
        { label: 'Finance & Ledger', value: 'Accounts' },
        { label: 'Logistics', value: 'Logistics' }
      ]
    },
    { key: 'designation', label: 'Official Designation', type: 'text', required: true, searchable: true },
    { key: 'salary', label: 'Basic Salary (BDT)', type: 'currency', required: true, sortable: true },
    { key: 'email', label: 'Corporate Email', type: 'email', required: true, searchable: true, unique: true },
    { key: 'phone', label: 'Mobile Number', type: 'phone', required: true },
    {
      key: 'workStatus',
      label: 'Work Status',
      type: 'select',
      defaultValue: 'Active',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'On Leave', value: 'On Leave' },
        { label: 'Suspended', value: 'Suspended' },
        { label: 'Resigned', value: 'Resigned' }
      ]
    },
    { key: 'joiningDate', label: 'Date of Joining', type: 'date', required: true }
  ],
  workflowStatuses: ['Draft', 'Submitted', 'Pending Approval', 'Approved']
};

export const FIXED_ASSETS_CONFIG: ModuleConfig = {
  moduleKey: 'assets',
  moduleName: 'Fixed Asset Ledger',
  iconName: 'Building',
  primaryKey: 'id',
  fields: [
    { key: 'code', label: 'Asset Identifier Code', type: 'text', required: true, unique: true, searchable: true },
    { key: 'name', label: 'Asset Name', type: 'text', required: true, searchable: true },
    {
      key: 'category',
      label: 'Asset Category',
      type: 'select',
      required: true,
      options: [
        { label: 'Industrial Machinery', value: 'Machinery' },
        { label: 'IT Equipment', value: 'IT Equipment' },
        { label: 'Land & Buildings', value: 'Land & Buildings' },
        { label: 'Vehicles', value: 'Vehicles' }
      ]
    },
    { key: 'purchasePrice', label: 'Purchase Cost (BDT)', type: 'currency', required: true, sortable: true },
    { key: 'purchaseDate', label: 'Acquisition Date', type: 'date', required: true },
    { key: 'usefulLife', label: 'Useful Life (Years)', type: 'number', required: true },
    {
      key: 'depreciationMethod',
      label: 'Depreciation Method',
      type: 'select',
      defaultValue: 'Straight Line',
      options: [
        { label: 'Straight Line', value: 'Straight Line' },
        { label: 'Double Declining Balance', value: 'Double Declining' }
      ]
    },
    {
      key: 'condition',
      label: 'Operational Status',
      type: 'select',
      defaultValue: 'Active',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'In Maintenance', value: 'In Maintenance' },
        { label: 'Retired', value: 'Retired' }
      ]
    }
  ],
  workflowStatuses: ['Draft', 'Pending Approval', 'Approved']
};

export const PROJECTS_CONFIG: ModuleConfig = {
  moduleKey: 'projects',
  moduleName: 'Project Board Registry',
  iconName: 'Calendar',
  primaryKey: 'id',
  fields: [
    { key: 'code', label: 'Project Code', type: 'text', required: true, unique: true, searchable: true },
    { key: 'projectName', label: 'Project Name', type: 'text', required: true, searchable: true },
    { key: 'clientFirm', label: 'Client Firm', type: 'text', required: true, searchable: true },
    { key: 'budget', label: 'Total Allocated Budget (BDT)', type: 'currency', required: true, sortable: true },
    { key: 'manager', label: 'Project Manager', type: 'text', required: true, searchable: true },
    {
      key: 'priority',
      label: 'Priority Level',
      type: 'select',
      defaultValue: 'Medium',
      options: [
        { label: 'High Priority', value: 'High' },
        { label: 'Medium Priority', value: 'Medium' },
        { label: 'Low Priority', value: 'Low' }
      ]
    },
    {
      key: 'stage',
      label: 'Project Stage',
      type: 'select',
      defaultValue: 'Planned',
      options: [
        { label: 'Planned / Ideation', value: 'Planned' },
        { label: 'Active Development', value: 'Active' },
        { label: 'Under Review', value: 'Review' },
        { label: 'Completed & Delivered', value: 'Completed' }
      ]
    }
  ],
  workflowStatuses: ['Draft', 'Submitted', 'Pending Approval', 'Approved']
};

export const SERVICES_CONFIG: ModuleConfig = {
  moduleKey: 'service',
  moduleName: 'Aftermarket Services & SLA Support',
  iconName: 'Wrench',
  primaryKey: 'id',
  fields: [
    { key: 'ticketNo', label: 'SLA Support Ticket No', type: 'text', required: true, unique: true, searchable: true },
    { key: 'clientName', label: 'Client Organization', type: 'text', required: true, searchable: true },
    { key: 'productRef', label: 'Product Reference', type: 'text', required: true },
    { key: 'issueType', label: 'Issue Description', type: 'textarea', required: true },
    {
      key: 'urgency',
      label: 'Ticket Urgency',
      type: 'select',
      defaultValue: 'Medium',
      options: [
        { label: 'Critical / Immediate', value: 'High' },
        { label: 'Medium Response SLA', value: 'Medium' },
        { label: 'Standard / Deferred', value: 'Low' }
      ]
    },
    { key: 'assignedTech', label: 'Lead Specialist Assigned', type: 'text', required: true },
    { key: 'costEstimate', label: 'Estimated Remediation Cost (BDT)', type: 'currency', required: true },
    {
      key: 'completionStage',
      label: 'Remediation Stage',
      type: 'select',
      defaultValue: 'Active',
      options: [
        { label: 'Under Assessment', value: 'Planned' },
        { label: 'Remediation Active', value: 'Active' },
        { label: 'Final QA Review', value: 'Review' },
        { label: 'Completed Case', value: 'Completed' }
      ]
    }
  ],
  workflowStatuses: ['Draft', 'Submitted', 'Pending Approval', 'Approved']
};

export const SUPPLIERS_CONFIG: ModuleConfig = {
  moduleKey: 'suppliers',
  moduleName: 'Registered Suppliers Registry',
  iconName: 'Database',
  primaryKey: 'id',
  fields: [
    { key: 'name', label: 'Supplier Org Name', type: 'text', required: true, searchable: true },
    { key: 'contactPerson', label: 'Point of Contact', type: 'text', required: true, searchable: true },
    { key: 'email', label: 'Business Email', type: 'email', required: true, searchable: true },
    { key: 'phone', label: 'Phone No', type: 'phone', required: true },
    { key: 'materials', label: 'Supplied Raw Materials', type: 'text', required: true, placeholder: 'e.g., Gypsum, Limestone, Fly Ash' },
    { key: 'creditLimit', label: 'Outstanding Credit Limit (BDT)', type: 'currency', required: true },
    {
      key: 'status',
      label: 'Verification Status',
      type: 'select',
      defaultValue: 'Approved',
      options: [
        { label: 'Verified & Approved', value: 'Approved' },
        { label: 'Evaluation Phase', value: 'Pending Approval' },
        { label: 'Unverified / Draft', value: 'Draft' }
      ]
    }
  ],
  workflowStatuses: ['Draft', 'Pending Approval', 'Approved']
};

export const CAMPAIGNS_CONFIG: ModuleConfig = {
  moduleKey: 'campaigns',
  moduleName: 'Marketing Campaigns Console',
  iconName: 'Sparkles',
  primaryKey: 'id',
  fields: [
    { key: 'name', label: 'Campaign Title', type: 'text', required: true, searchable: true },
    {
      key: 'channel',
      label: 'Marketing Channel',
      type: 'select',
      required: true,
      options: [
        { label: 'Email Outreach', value: 'Email' },
        { label: 'Google Search Ads', value: 'Google Ads' },
        { label: 'Social Media Campaign', value: 'Social Media' },
        { label: 'Offline / Billboard', value: 'Offline' }
      ]
    },
    { key: 'budget', label: 'Assigned Budget (BDT)', type: 'currency', required: true, sortable: true },
    { key: 'leadsGenerated', label: 'Leads Generated', type: 'number', defaultValue: 0 },
    { key: 'revenueGenerated', label: 'Revenue Generated (BDT)', type: 'currency', defaultValue: 0 },
    { key: 'startDate', label: 'Launch Date', type: 'date', required: true }
  ],
  workflowStatuses: ['Draft', 'Active', 'Completed']
};

export const MEETINGS_CONFIG: ModuleConfig = {
  moduleKey: 'meetings',
  moduleName: 'Sales Meetings Planner',
  iconName: 'Calendar',
  primaryKey: 'id',
  fields: [
    { key: 'title', label: 'Meeting Subject', type: 'text', required: true, searchable: true },
    { key: 'leadName', label: 'Client Lead Participant', type: 'text', required: true, searchable: true },
    { key: 'date', label: 'Scheduled Date', type: 'date', required: true, sortable: true },
    { key: 'time', label: 'Time', type: 'time', required: true },
    {
      key: 'duration',
      label: 'Duration',
      type: 'select',
      defaultValue: '1 Hour',
      options: [
        { label: '30 Minutes', value: '30 Mins' },
        { label: '1 Hour', value: '1 Hour' },
        { label: '2 Hours', value: '2 Hours' }
      ]
    }
  ],
  workflowStatuses: ['Scheduled', 'Completed', 'Cancelled']
};
