import React, { useState, useEffect } from 'react';
import { Employee, Attendance } from '../types';
import {
  Users,
  UserCheck,
  Clock,
  DollarSign,
  TrendingUp,
  Briefcase,
  Award,
} from 'lucide-react';
import PageStandardsWrapper from './PageStandardsWrapper';
import UniversalCrudEngine from './UniversalCrudEngine';
import {
  EMPLOYEES_CONFIG,
  ATTENDANCE_CONFIG,
  LEAVE_CONFIG,
  PAYROLL_CONFIG,
  RECRUITMENT_CONFIG,
  APPRAISAL_CONFIG,
} from '../metadata/configs';

interface EmployeeViewProps {
  employees?: Employee[];
  attendances?: Attendance[];
  onAddEmployee?: (emp: Omit<Employee, 'id'>) => void;
  onUpdateAttendance?: (employeeId: string, status: Attendance['status']) => void;
  activeSubTab?: string;
  currentUser?: {
    name?: string;
    role?: string;
    email?: string;
  };
}

// Maps each HR sidebar sub-tab to the module config that should render for it.
// 'employees_list' intentionally has no entry here — it uses EMPLOYEES_CONFIG directly below.
const HR_SUBTAB_CONFIG: Record<string, { config: typeof EMPLOYEES_CONFIG; title: string; subtitle: string }> = {
  attendance: {
    config: ATTENDANCE_CONFIG,
    title: 'Attendance & Leave Logs',
    subtitle: 'Track daily check-in/check-out records, lateness, and on-leave status across departments.',
  },
  leave: {
    config: LEAVE_CONFIG,
    title: 'Leave Register',
    subtitle: 'Register, review, and approve casual, sick, earned, and unpaid leave requests.',
  },
  payroll: {
    config: PAYROLL_CONFIG,
    title: 'Payroll & Payslips',
    subtitle: 'Compute basic pay, allowances, deductions, and net payable amounts per pay period.',
  },
  recruitment: {
    config: RECRUITMENT_CONFIG,
    title: 'Recruitment & ATS',
    subtitle: 'Track open job requisitions and candidates through screening, interview, and offer stages.',
  },
  appraisal: {
    config: APPRAISAL_CONFIG,
    title: 'Performance & Appraisals',
    subtitle: 'Log periodic performance reviews, scores, strengths, and improvement areas per employee.',
  },
};

export default function EmployeeView({
  employees = [],
  attendances = [],
  onAddEmployee,
  onUpdateAttendance,
  activeSubTab = 'employees_list',
  currentUser
}: EmployeeViewProps) {
  const [metrics, setMetrics] = useState({
    totalEmployees: 4,
    activeCount: 4,
    presentToday: 4,
    payroll: 335000
  });

  const loadMetrics = () => {
    try {
      const raw = localStorage.getItem('axiom_crud_employees');
      const emps = raw ? JSON.parse(raw) : [];

      const totalEmployees = emps.length || 4;
      const activeCount = emps.filter((e: any) => e.workStatus === 'Active').length || totalEmployees;
      const presentToday = emps.filter((e: any) => e.workStatus === 'Active').length || totalEmployees;
      const payroll = emps.reduce((sum: number, emp: any) => sum + (Number(emp.salary) || 0), 0) || 335000;

      setMetrics({
        totalEmployees,
        activeCount,
        presentToday,
        payroll
      });
    } catch (e) {
      // Fallback
    }
  };

  useEffect(() => {
    loadMetrics();
    window.addEventListener('storage', loadMetrics);
    return () => window.removeEventListener('storage', loadMetrics);
  }, []);

  // --- HR & Wage Allocations report (rep_hr / 'employee_report') ---
  // Built from the real Firestore-backed `employees` prop rather than a CRUD config,
  // since this is a read-only analytical rollup, not a record-entry screen.
  const renderEmployeeReport = () => {
    const source = employees.length > 0 ? employees : [];
    const deptMap = new Map<string, { count: number; totalSalary: number }>();
    source.forEach((e) => {
      const dept = (e as any).department || 'Unassigned';
      const entry = deptMap.get(dept) || { count: 0, totalSalary: 0 };
      entry.count += 1;
      entry.totalSalary += Number(e.salary) || 0;
      deptMap.set(dept, entry);
    });
    const rows = Array.from(deptMap.entries());
    const totalHeadcount = source.length;
    const totalWage = source.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Headcount</span>
            <span className="text-xl font-extrabold text-slate-800 mt-1 block">{totalHeadcount} Employees</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Monthly Wage Bill</span>
            <span className="text-xl font-extrabold text-slate-800 mt-1 block">৳{totalWage.toLocaleString()}</span>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-10 text-sm text-slate-400">
            No employee records available yet. Add employees under "Employees List" to see wage allocations here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="py-2 pr-4">Department</th>
                  <th className="py-2 pr-4">Headcount</th>
                  <th className="py-2 pr-4">Wage Allocation (BDT)</th>
                  <th className="py-2 pr-4">% of Total Wage Bill</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([dept, data]) => (
                  <tr key={dept} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-semibold text-slate-700">{dept}</td>
                    <td className="py-3 pr-4">{data.count}</td>
                    <td className="py-3 pr-4 font-bold text-slate-800">৳{data.totalSalary.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-indigo-600 font-semibold">
                      {totalWage > 0 ? ((data.totalSalary / totalWage) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const isEmployeesList = activeSubTab === 'employees_list' || !HR_SUBTAB_CONFIG[activeSubTab] && activeSubTab !== 'employee_report';
  const subTabMeta = HR_SUBTAB_CONFIG[activeSubTab];

  const pageTitle = activeSubTab === 'employee_report'
    ? 'HR & Wage Allocations Report'
    : subTabMeta?.title || 'HRM Personnel & Payroll Ledger';

  const pageSubtitle = activeSubTab === 'employee_report'
    ? 'Department-wise headcount and wage bill breakdown, computed from live employee records.'
    : subTabMeta?.subtitle || 'Govern full-time workforce registries, departments, salaries, security clearance classifications, and contracts.';

  return (
    <PageStandardsWrapper
      title={pageTitle}
      subtitle={pageSubtitle}
      loading={false}
      error={null}
      currentUser={currentUser}
      permissionRoles={['Administrator', 'Manager']}
      breadcrumbs={[
        { label: 'Axiom ERP', onClick: () => {} },
        { label: pageTitle, active: true },
      ]}
    >
      <div className="space-y-6">
        {/* HRM TOP SUMMARY BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Staff Strength</span>
              <span className="text-lg font-bold text-slate-800 mt-1 block">{metrics.totalEmployees} Employees</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Roster</span>
              <span className="text-lg font-bold text-slate-800 mt-1 block">{metrics.activeCount} Personnel</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Daily Attendance</span>
              <span className="text-lg font-bold text-slate-800 mt-1 block">{metrics.presentToday} Present</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-indigo-600 text-white rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-indigo-200 font-bold uppercase block">Monthly Payroll</span>
              <span className="text-lg font-bold block mt-1">৳{metrics.payroll.toLocaleString()}</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-indigo-500 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* CORE RENDERER - routes on activeSubTab instead of always showing the Employees grid */}
        {activeSubTab === 'employee_report' ? (
          renderEmployeeReport()
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4">
            <UniversalCrudEngine
              config={isEmployeesList ? EMPLOYEES_CONFIG : subTabMeta.config}
              currentUser={currentUser}
              onDataChange={loadMetrics}
            />
          </div>
        )}
      </div>
    </PageStandardsWrapper>
  );
}
