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

export const ATTENDANCE_CONFIG: ModuleConfig = {
  moduleKey: 'attendance',
  moduleName: 'Attendance & Leave Logs',
  iconName: 'Calendar',
  primaryKey: 'id',
  fields: [
    { key: 'employeeName', label: 'Employee Name', type: 'text', required: true, searchable: true },
    {
      key: 'department',
      label: 'Department',
      type: 'select',
      options: [
        { label: 'Engineering', value: 'Engineering' },
        { label: 'HR & Operations', value: 'HR' },
        { label: 'Sales & Marketing', value: 'Sales' },
        { label: 'Finance & Ledger', value: 'Accounts' },
        { label: 'Logistics', value: 'Logistics' }
      ]
    },
    { key: 'date', label: 'Attendance Date', type: 'date', required: true, sortable: true },
    {
      key: 'attendanceStatus',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'Present',
      options: [
        { label: 'Present', value: 'Present' },
        { label: 'Absent', value: 'Absent' },
        { label: 'Late', value: 'Late' },
        { label: 'On Leave', value: 'On Leave' }
      ]
    },
    { key: 'checkIn', label: 'Check-In Time', type: 'time' },
    { key: 'checkOut', label: 'Check-Out Time', type: 'time' },
    { key: 'remarks', label: 'Remarks', type: 'textarea' }
  ],
  workflowStatuses: ['Draft', 'Submitted', 'Approved']
};

export const LEAVE_CONFIG: ModuleConfig = {
  moduleKey: 'leave',
  moduleName: 'Leave Register',
  iconName: 'Calendar',
  primaryKey: 'id',
  fields: [
    { key: 'employeeName', label: 'Employee Name', type: 'text', required: true, searchable: true },
    {
      key: 'leaveType',
      label: 'Leave Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Casual Leave', value: 'Casual' },
        { label: 'Sick Leave', value: 'Sick' },
        { label: 'Earned Leave', value: 'Earned' },
        { label: 'Unpaid Leave', value: 'Unpaid' }
      ]
    },
    { key: 'fromDate', label: 'From Date', type: 'date', required: true },
    { key: 'toDate', label: 'To Date', type: 'date', required: true },
    { key: 'daysCount', label: 'Total Days', type: 'number', required: true, sortable: true },
    { key: 'reason', label: 'Reason for Leave', type: 'textarea' }
  ],
  workflowStatuses: ['Draft', 'Submitted', 'Pending Approval', 'Approved']
};

export const PAYROLL_CONFIG: ModuleConfig = {
  moduleKey: 'payroll',
  moduleName: 'Payroll & Payslips',
  iconName: 'Briefcase',
  primaryKey: 'id',
  fields: [
    { key: 'employeeName', label: 'Employee Name', type: 'text', required: true, searchable: true },
    { key: 'payMonth', label: 'Pay Period (e.g. July 2026)', type: 'text', required: true, sortable: true },
    { key: 'basicSalary', label: 'Basic Salary (BDT)', type: 'currency', required: true },
    { key: 'allowances', label: 'Allowances (BDT)', type: 'currency', defaultValue: 0 },
    { key: 'deductions', label: 'Deductions (BDT)', type: 'currency', defaultValue: 0 },
    { key: 'netPay', label: 'Net Payable (BDT)', type: 'currency', required: true, sortable: true },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      type: 'select',
      defaultValue: 'Pending',
      options: [
        { label: 'Paid', value: 'Paid' },
        { label: 'Pending', value: 'Pending' }
      ]
    },
    { key: 'paymentDate', label: 'Payment Date', type: 'date' }
  ],
  workflowStatuses: ['Draft', 'Submitted', 'Approved']
};

export const RECRUITMENT_CONFIG: ModuleConfig = {
  moduleKey: 'recruitment',
  moduleName: 'Recruitment & ATS',
  iconName: 'Users',
  primaryKey: 'id',
  fields: [
    { key: 'jobTitle', label: 'Job Opening Title', type: 'text', required: true, searchable: true },
    {
      key: 'department',
      label: 'Department',
      type: 'select',
      options: [
        { label: 'Engineering', value: 'Engineering' },
        { label: 'HR & Operations', value: 'HR' },
        { label: 'Sales & Marketing', value: 'Sales' },
        { label: 'Finance & Ledger', value: 'Accounts' },
        { label: 'Logistics', value: 'Logistics' }
      ]
    },
    { key: 'candidateName', label: 'Candidate Name', type: 'text', searchable: true },
    {
      key: 'applicationStage',
      label: 'Application Stage',
      type: 'select',
      defaultValue: 'Applied',
      options: [
        { label: 'Applied', value: 'Applied' },
        { label: 'Screening', value: 'Screening' },
        { label: 'Interview', value: 'Interview' },
        { label: 'Offer Extended', value: 'Offer' },
        { label: 'Hired', value: 'Hired' },
        { label: 'Rejected', value: 'Rejected' }
      ]
    },
    { key: 'expectedSalary', label: 'Expected Salary (BDT)', type: 'currency' },
    { key: 'contactEmail', label: 'Contact Email', type: 'email' },
    { key: 'contactPhone', label: 'Contact Phone', type: 'phone' },
    { key: 'notes', label: 'Interview Notes', type: 'textarea' }
  ],
  workflowStatuses: ['Draft', 'Submitted', 'Approved']
};

export const APPRAISAL_CONFIG: ModuleConfig = {
  moduleKey: 'appraisal',
  moduleName: 'Performance & Appraisals',
  iconName: 'Sparkles',
  primaryKey: 'id',
  fields: [
    { key: 'employeeName', label: 'Employee Name', type: 'text', required: true, searchable: true },
    { key: 'reviewPeriod', label: 'Review Period (e.g. H1 2026)', type: 'text', required: true },
    { key: 'reviewer', label: 'Reviewer Name', type: 'text', required: true },
    { key: 'performanceScore', label: 'Performance Score (0-100)', type: 'number', required: true, sortable: true },
    { key: 'strengths', label: 'Key Strengths', type: 'textarea' },
    { key: 'improvementAreas', label: 'Areas for Improvement', type: 'textarea' }
  ],
  workflowStatuses: ['Draft', 'Submitted', 'Pending Approval', 'Approved']
};

export const FIXED_ASSETS_CONFIG: ModuleConfig = {
  moduleKey: 'assets',
  moduleName: 'Fixed Asset Ledger',
  iconName: 'Building',
  primaryKey: 'id',
  fields: [
    { key: 'code', label: 'Asset Identifier Code', type: 'text', required: true, unique: true, searchable: true, autocompletePresets: ['EQ-IT-101', 'EQ-MCH-202', 'EQ-VEH-303'] },
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
    { key: 'taxRate', label: 'Applicable Tax Rate', type: 'number', helpText: 'Multiplier (e.g. 0.15 for 15%)', defaultValue: 0.15 },
    { key: 'totalValueWithTax', label: 'Total Value With Tax (BDT)', type: 'number', formula: 'purchasePrice * taxRate', helpText: 'Computed automatically from formula: purchasePrice * taxRate' },
    { key: 'purchaseDate', label: 'Acquisition Date', type: 'date', required: true },
    { key: 'usefulLife', label: 'Useful Life (Years)', type: 'number', required: true },
    
    // Conditional Field: Show only if Useful Life is greater than 5 years
    { 
      key: 'extendedWarrantyVendor', 
      label: 'Extended Warranty Vendor Details', 
      type: 'text', 
      dependsOn: { field: 'usefulLife', value: '10' }, 
      helpText: 'Conditional: Shows only if Useful Life is set exactly to 10 years.' 
    },

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
    },

    // Rich Custom Fields
    { key: 'brandColor', label: 'Custom Brand Coding Color', type: 'colorPicker', helpText: 'Select or pick corporate category color.' },
    { key: 'customSpecs', label: 'Structured Specification Specs (JSON)', type: 'jsonEditor', helpText: 'Compliant with enterprise hardware models.' },
    { key: 'assessmentNotes', label: 'SLA Engineering Assessment', type: 'richText', helpText: 'Supports real-time rich layout markdown annotations.' },
    { key: 'barcode', label: 'Asset Barcode Identifier', type: 'barcode', helpText: 'Enter code or click Scan to scan barcode tag.' },
    { key: 'qrcode', label: 'Asset QR Identity Redirect', type: 'qr', helpText: 'Scan or insert redirect tracking URL.' },
    { key: 'gps', label: 'Asset GPS Geolocation coordinates', type: 'gps', helpText: 'Track physical assets using integrated device satellite signals.' },
    { key: 'signature', label: 'Authorized Inspector Sign-off', type: 'signature', helpText: 'Sign securely on the digital signature canvas.' },
    { key: 'attachments', label: 'Associated Service SLAs', type: 'attachment', helpText: 'Attach official PDF / invoice clearances.' },
    {
      key: 'maintenanceLogs',
      label: 'Chronological Maintenance Runs Log',
      type: 'repeatable',
      subFields: [
        { key: 'date', label: 'Service Date', type: 'date' },
        { key: 'technician', label: 'Field Engineer Name', type: 'text' },
        { key: 'cost', label: 'Cost estimate (BDT)', type: 'number' }
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
