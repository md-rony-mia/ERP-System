import React, { useState } from 'react';
import { Employee, Attendance } from '../types';
import {
  Users,
  CalendarDays,
  Plus,
  UserCheck,
  Phone,
  Mail,
  DollarSign,
  Clock,
  Briefcase,
  Layers,
  FileText,
  TrendingUp,
} from 'lucide-react';

interface EmployeeViewProps {
  employees: Employee[];
  attendances: Attendance[];
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onUpdateAttendance: (employeeId: string, status: Attendance['status']) => void;
  activeSubTab?: string;
}

export default function EmployeeView({
  employees,
  attendances,
  onAddEmployee,
  onUpdateAttendance,
  activeSubTab = 'employees_list',
}: EmployeeViewProps) {
  // Map activeSubTab to internal views
  const currentTab = ['employees_list', 'departments', 'designations', 'attendance', 'employee_report'].includes(activeSubTab)
    ? activeSubTab
    : 'employees_list';

  // --- LOCAL PERSISTED CONFIGURATIONS ---
  const [departments, setDepartments] = useState<string[]>([
    'Sales',
    'Procurement',
    'Accounts',
    'Logistics',
    'Administration',
  ]);

  const [designations, setDesignations] = useState<string[]>([
    'Sales Executive',
    'Procurement Specialist',
    'Senior Accountant',
    'Inventory Manager',
    'General Manager',
    'CEO',
  ]);

  // --- MODAL / FORM STATES ---
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDesigModal, setShowDesigModal] = useState(false);

  // --- INPUT STATES ---
  // Employee Form
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('Sales Executive');
  const [department, setDepartment] = useState('Sales');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState('');

  // Department / Designation Form
  const [newDept, setNewDept] = useState('');
  const [newDesig, setNewDesig] = useState('');

  // --- FORM HANDLERS ---
  const handleEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !salary) return;

    onAddEmployee({
      name,
      designation,
      department,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@axiom.com`,
      phone,
      joiningDate: new Date().toISOString().split('T')[0],
      salary: parseFloat(salary),
      status: 'Active',
    });

    setName('');
    setEmail('');
    setPhone('');
    setSalary('');
    setShowEmpModal(false);
  };

  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept) return;
    setDepartments([...departments, newDept]);
    setNewDept('');
    setShowDeptModal(false);
  };

  const handleDesigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesig) return;
    setDesignations([...designations, newDesig]);
    setNewDesig('');
    setShowDesigModal(false);
  };

  // --- DERIVE GENERAL HRM STATS ---
  const totalEmployees = employees.length;
  const activeCount = employees.filter((e) => e.status === 'Active').length;
  const presentTodayCount = attendances.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate = totalEmployees > 0 ? ((presentTodayCount / totalEmployees) * 100).toFixed(0) : '0';
  const totalMonthlyPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* HRM TOP SUMMARY BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Staff Strength</span>
            <span className="text-lg font-bold text-slate-800 mt-1 block">{totalEmployees} Employees</span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Roster</span>
            <span className="text-lg font-bold text-slate-800 mt-1 block">{activeCount} Personnel</span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Daily Attendance</span>
            <span className="text-lg font-bold text-slate-800 mt-1 block">{presentTodayCount} Present</span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-indigo-600 text-white rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-indigo-200 font-bold uppercase block">Monthly Payroll</span>
            <span className="text-lg font-bold block mt-1">৳{totalMonthlyPayroll.toLocaleString()}</span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-indigo-500 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* =========================================
          TAB 1: EMPLOYEES LIST
          ========================================= */}
      {currentTab === 'employees_list' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">Personnel Directory</h2>
              <p className="text-xs text-slate-400 mt-1">Review contact information, designations, assigned departments, and salaries.</p>
            </div>
            <button
              onClick={() => setShowEmpModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Personnel</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Staff name</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Designation</th>
                  <th className="py-3.5 px-6">Contact / Phone</th>
                  <th className="py-3.5 px-6 text-right">Basic Salary</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{emp.name}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{emp.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">{emp.department}</td>
                    <td className="py-4 px-6 text-indigo-600 font-bold">{emp.designation}</td>
                    <td className="py-4 px-6 font-mono text-slate-600 font-semibold">{emp.phone}</td>
                    <td className="py-4 px-6 text-right font-bold text-slate-800">৳{emp.salary.toLocaleString()}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 2: DEPARTMENTS
          ========================================= */}
      {currentTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">Corporate Departments</h2>
              <p className="text-xs text-slate-400 mt-1">Structure company workforce into administrative functional departments.</p>
            </div>
            <button
              onClick={() => setShowDeptModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {departments.map((dept, idx) => {
              const deptEmployees = employees.filter((e) => e.department === dept);
              const deptPayroll = deptEmployees.reduce((sum, e) => sum + e.salary, 0);

              return (
                <div key={dept} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />
                  <div className="flex justify-between items-start">
                    <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold font-mono">
                      {idx + 1}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">Active</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{dept} Department</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Global headquarter division</p>
                  </div>

                  <div className="space-y-2 border-t border-slate-50 pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Assigned Staff</span>
                      <span className="font-bold text-indigo-600">{deptEmployees.length} Personnel</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Division Payroll</span>
                      <span className="font-bold text-slate-800">৳{deptPayroll.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================
          TAB 3: DESIGNATIONS
          ========================================= */}
      {currentTab === 'designations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">Corporate Positions & Designations</h2>
              <p className="text-xs text-slate-400 mt-1">Assign company authority bands, duties, and designations.</p>
            </div>
            <button
              onClick={() => setShowDesigModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Designation</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Designation Title</th>
                  <th className="py-3.5 px-6">Internal Grade Band</th>
                  <th className="py-3.5 px-6 text-center">Assigned Employees Count</th>
                  <th className="py-3.5 px-6 text-right">Average Basic Salary</th>
                  <th className="py-3.5 px-6 text-center">Roster Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {designations.map((desig) => {
                  const matchingCount = employees.filter((e) => e.designation === desig).length;
                  const matchingSalaries = employees.filter((e) => e.designation === desig).map((e) => e.salary);
                  const avgSalary = matchingSalaries.length > 0 ? matchingSalaries.reduce((sum, s) => sum + s, 0) / matchingSalaries.length : 0;

                  return (
                    <tr key={desig} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800">{desig}</td>
                      <td className="py-4 px-6 font-mono text-indigo-600 uppercase font-bold">Grade-{(desig.length % 5) + 1}</td>
                      <td className="py-4 px-6 text-center font-medium">{matchingCount} active staff</td>
                      <td className="py-4 px-6 text-right font-black text-slate-800">৳{avgSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-bold">Active</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 4: ATTENDANCE LOGGING
          ========================================= */}
      {currentTab === 'attendance' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-display">Daily Attendance Register</h2>
            <p className="text-xs text-slate-400 mt-1">Log present, absent, or late statuses for staff personnel for payroll validation.</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40 flex justify-between items-center">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider font-display flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-600" />
                <span>Duty Date: {new Date().toISOString().split('T')[0]}</span>
              </span>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 px-2.5 py-0.5 rounded-full">
                {attendanceRate}% Roster Rate
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/20">
                  <th className="py-3.5 px-6">Staff Member</th>
                  <th className="py-3.5 px-6">Department / Position</th>
                  <th className="py-3.5 px-6">Attendance Status Check</th>
                  <th className="py-3.5 px-6 text-center">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const att = attendances.find((a) => a.employeeId === emp.id);
                  const currentStatus = att ? att.status : 'Absent';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800">{emp.name}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-semibold">
                        {emp.department} • {emp.designation}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          currentStatus === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          currentStatus === 'Late' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onUpdateAttendance(emp.id, 'Present')}
                            className={`px-3 py-1 text-[10px] font-bold rounded border cursor-pointer transition-colors ${currentStatus === 'Present' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => onUpdateAttendance(emp.id, 'Late')}
                            className={`px-3 py-1 text-[10px] font-bold rounded border cursor-pointer transition-colors ${currentStatus === 'Late' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => onUpdateAttendance(emp.id, 'Absent')}
                            className={`px-3 py-1 text-[10px] font-bold rounded border cursor-pointer transition-colors ${currentStatus === 'Absent' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 5: EMPLOYEE REPORTS & PAYROLL
          ========================================= */}
      {currentTab === 'employee_report' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-display">Personnel Performance & Payroll</h2>
            <p className="text-xs text-slate-400 mt-1">Audit departmental salary expenditures, average wages, and roster health.</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">payroll ledger summaries</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Wages Expenditure by Division</span>
                <div className="space-y-2 text-xs">
                  {departments.map((dept) => {
                    const matched = employees.filter(e => e.department === dept);
                    const cost = matched.reduce((sum, e) => sum + e.salary, 0);
                    const pct = totalMonthlyPayroll > 0 ? ((cost / totalMonthlyPayroll) * 100).toFixed(0) : '0';

                    return (
                      <div key={dept} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>{dept} Division</span>
                          <span>৳{cost.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">HRM Health Indexes</span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Avg Monthly Salary</span>
                    <span className="text-base font-bold text-slate-800 mt-1 block">
                      ৳{totalEmployees > 0 ? (totalMonthlyPayroll / totalEmployees).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Presenteeism Ratio</span>
                    <span className="text-base font-bold text-indigo-600 mt-1 block">{attendanceRate}% Today</span>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl col-span-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Annual Projected Payroll</span>
                    <span className="text-base font-bold text-slate-800 mt-1 block">
                      ৳{(totalMonthlyPayroll * 12).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODALS & FORM REGISTERS
          ========================================= */}

      {/* Add Employee Modal */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Add New Personnel</h3>
              <button onClick={() => setShowEmpModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleEmpSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Staff Member Name *</label>
                <input
                  type="text" required placeholder="e.g. Arif Hossain" value={name}
                  onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer">
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Designation</label>
                  <select value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer text-indigo-600 font-bold">
                    {designations.map((ds) => (
                      <option key={ds} value={ds}>{ds}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Phone *</label>
                  <input
                    type="text" required placeholder="01712-XXXXXX" value={phone}
                    onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Basic Salary (৳) *</label>
                  <input
                    type="number" required placeholder="18000" value={salary}
                    onChange={(e) => setSalary(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 font-extrabold text-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company Email</label>
                <input
                  type="email" placeholder="arif@axiom.com (Optional)" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowEmpModal(false)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow">Save Personnel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add Department</h4>
              <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleDeptSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department Division Name *</label>
                <input
                  type="text" required placeholder="e.g. Human Resources" value={newDept}
                  onChange={(e) => setNewDept(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowDeptModal(false)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-md text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold cursor-pointer">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Designation Modal */}
      {showDesigModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add Position Title</h4>
              <button onClick={() => setShowDesigModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleDesigSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Designation Title *</label>
                <input
                  type="text" required placeholder="e.g. Senior Marketing Manager" value={newDesig}
                  onChange={(e) => setNewDesig(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowDesigModal(false)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-md text-xs hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold cursor-pointer">Save Position</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
