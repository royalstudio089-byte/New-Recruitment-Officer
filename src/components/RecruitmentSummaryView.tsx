import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  Sparkles, 
  Car, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  Award,
  Move,
  BarChart3,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { SecurityOfficer } from '../types';

interface RecruitmentSummaryViewProps {
  officers: SecurityOfficer[];
  onSwitchToDatabase: () => void;
}

// Color map for status categories matching the design system
const STATUS_COLORS: Record<string, string> = {
  'Full timer': '#334155', // Slate-700 (Neutral)
  'Student': '#d97706',    // Amber-600 (Noticeable highlight)
  'E-Visa': '#059669',     // Emerald-600 (Positive highlight)
  'New Applicant': '#2563eb', // Blue-600
  'Interview Scheduled': '#7c3aed', // Purple-600
  'Interviewed': '#9333ea', // Violet-600
  'Selected': '#0891b2',    // Cyan-600
  'Active': '#0284c7',      // Sky-600
  'On Hold': '#e11d48',     // Rose-600
  'Rejected': '#dc2626',    // Red-600
  'Inactive': '#94a3b8'     // Slate-400
};

export const RecruitmentSummaryView: React.FC<RecruitmentSummaryViewProps> = ({
  officers,
  onSwitchToDatabase
}) => {
  const totalOfficers = officers.length;
  const students = officers.filter(o => o.status === 'Student').length;
  const fullTimer = officers.filter(o => o.status === 'Full timer').length;
  const eVisa = officers.filter(o => o.status === 'E-Visa').length;
  const officersWithCar = officers.filter(o => o.car === 'Yes').length;
  const officersWithoutCar = officers.filter(o => o.car === 'No').length;
  const dogHandlers = officers.filter(o => o.dogHandler === 'Yes').length;
  const nonDogHandlers = officers.filter(o => o.dogHandler !== 'Yes').length;
  const easyToMoveCount = officers.filter(o => (o.easyToMove || 'Yes') === 'Yes').length;
  const notEasyToMoveCount = officers.filter(o => o.easyToMove === 'No').length;

  const otherStatuses = officers.filter(
    o => !['Student', 'Full timer', 'E-Visa'].includes(o.status)
  ).length;

  // City distribution
  const cityMap = officers.reduce((acc, curr) => {
    acc[curr.city] = (acc[curr.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);

  const calcPct = (count: number) => {
    if (!totalOfficers) return '0%';
    return `${Math.round((count / totalOfficers) * 100)}%`;
  };

  // -------------------------------------------------------------
  // Data for Recharts Bar Chart: Status Categories Distribution
  // -------------------------------------------------------------
  // Group all counts dynamically
  const statusDistributionMap = officers.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Ensure default primary visa statuses always exist in list
  const primaryOrder = ['Full timer', 'Student', 'E-Visa'];
  const allUniqueStatuses = Array.from(
    new Set([...primaryOrder, ...Object.keys(statusDistributionMap)])
  );

  const statusChartData = allUniqueStatuses
    .map(statusName => {
      const count = statusDistributionMap[statusName] || 0;
      const pct = totalOfficers ? Math.round((count / totalOfficers) * 100) : 0;
      return {
        category: statusName,
        count,
        percentage: pct,
        color: STATUS_COLORS[statusName] || '#64748b'
      };
    })
    .filter(item => item.count > 0 || primaryOrder.includes(item.category));

  // Custom Tooltip for Recharts
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs font-sans min-w-[170px]">
          <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-700/80">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: data.color }} 
            />
            <span className="font-bold text-slate-100 text-sm">{data.category}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300 py-0.5">
            <span>Headcount:</span>
            <span className="font-bold text-white text-sm">{data.count} officers</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 py-0.5">
            <span>Share of Roster:</span>
            <span className="font-semibold text-emerald-400">{data.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Worksheet Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-blue-600/10 via-emerald-600/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Worksheet 2: Recruitment Summary
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              SECURITY OFFICERS – RECRUITMENT SUMMARY
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Automated executive figures, interactive Recharts analytics, and deployment metrics linked dynamically to the Officer Database.
            </p>
          </div>

          <button
            onClick={onSwitchToDatabase}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <span>View Officer Database</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Primary Summary Cards (Includes Easy to Move) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* Total Officers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Officers
            </span>
            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalOfficers}</span>
            <span className="text-xs font-medium text-slate-500">enrolled</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-400 font-mono">
            =COUNTA('Officer Database'!B4:B)
          </div>
        </div>

        {/* Full Timer */}
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-all bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Full Timer
            </span>
            <div className="p-1.5 bg-slate-200 rounded-lg text-slate-700">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{fullTimer}</span>
            <span className="text-xs font-medium text-slate-600">({calcPct(fullTimer)})</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-400 font-mono">
            =COUNTIF(E4:E, "Full timer")
          </div>
        </div>

        {/* Students */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs hover:border-amber-300 transition-all bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Students
            </span>
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700">{students}</span>
            <span className="text-xs font-medium text-amber-600">({calcPct(students)})</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-400 font-mono">
            =COUNTIF(E4:E, "Student")
          </div>
        </div>

        {/* E-Visa */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs hover:border-emerald-300 transition-all bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              E-Visa
            </span>
            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{eVisa}</span>
            <span className="text-xs font-medium text-emerald-600">({calcPct(eVisa)})</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-400 font-mono">
            =COUNTIF(E4:E, "E-Visa")
          </div>
        </div>

        {/* Officers With Car */}
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs hover:border-blue-300 transition-all bg-blue-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
              With Car
            </span>
            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-700">{officersWithCar}</span>
            <span className="text-xs font-medium text-blue-600">({calcPct(officersWithCar)})</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-400 font-mono">
            =COUNTIF(F4:F, "Yes")
          </div>
        </div>

        {/* Easy to Move */}
        <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-xs hover:border-teal-300 transition-all bg-teal-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
              Easy to Move
            </span>
            <div className="p-1.5 bg-teal-100 rounded-lg text-teal-700">
              <Move className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-teal-700">{easyToMoveCount}</span>
            <span className="text-xs font-medium text-teal-600">({calcPct(easyToMoveCount)})</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-400 font-mono">
            =COUNTIF(H4:H, "Yes")
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RECHARTS DATA VISUALIZATION SECTION: STATUS CATEGORIES CHART  */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-2xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Officer Distribution by Status Category</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-blue-100 text-blue-700 border border-blue-200">
                  Recharts Dynamic Visualizer
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Comparative bar chart highlighting work authorization, visa status, and recruitment pipeline proportions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-600">
              Active Records: <strong className="text-slate-900">{totalOfficers}</strong>
            </span>
          </div>
        </div>

        {/* Chart Content & Breakdown Cards */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Main Recharts Bar Chart (Spans 2 columns on wide screens) */}
          <div className="lg:col-span-2 h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusChartData}
                margin={{ top: 20, right: 25, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  dy={8}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  dx={-4}
                />
                <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={55}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Breakdown Sidebar Cards */}
          <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Category Summary
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Headcount</span>
            </div>

            <div className="space-y-2.5 max-h-[230px] overflow-y-auto pr-1">
              {statusChartData.map((item) => (
                <div 
                  key={item.category}
                  className="p-2.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }} 
                    />
                    <div className="truncate">
                      <span className="text-xs font-semibold text-slate-900 block truncate">
                        {item.category}
                      </span>
                      <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="text-sm font-bold text-slate-900">{item.count}</span>
                    <span className="text-[11px] text-slate-500 ml-1">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Executive Summary Table (Formatted as Excel Table) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Executive Metrics Breakdown & Formula Map
            </h3>
            <p className="text-xs text-slate-500">
              Standard spreadsheet formulas configured in exported Microsoft Excel and Google Sheets workbooks
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            Live Calculation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6 font-semibold">Metric / Category</th>
                <th className="py-3 px-6 font-semibold">Excel Formula</th>
                <th className="py-3 px-6 font-semibold text-center">Current Count</th>
                <th className="py-3 px-6 font-semibold text-center">Share (%)</th>
                <th className="py-3 px-6 font-semibold">Visual Treatment / Operational Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Total Officers */}
              <tr className="hover:bg-slate-50/80 transition-colors font-medium">
                <td className="py-3 px-6 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Total Officers</span>
                </td>
                <td className="py-3 px-6 font-mono text-xs text-slate-600">
                  =COUNTA('Officer Database'!B4:B{totalOfficers + 3})
                </td>
                <td className="py-3 px-6 text-center font-bold text-slate-900">{totalOfficers}</td>
                <td className="py-3 px-6 text-center font-semibold text-slate-700">100%</td>
                <td className="py-3 px-6">
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded-md">
                    Base Roster
                  </span>
                </td>
              </tr>

              {/* Full Timer */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-6 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-600" />
                  <span className="font-medium text-slate-900">Full Timer</span>
                </td>
                <td className="py-3 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!E4:E{totalOfficers + 3}, "Full timer")
                </td>
                <td className="py-3 px-6 text-center font-bold text-slate-800">{fullTimer}</td>
                <td className="py-3 px-6 text-center font-medium text-slate-700">{calcPct(fullTimer)}</td>
                <td className="py-3 px-6">
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-200 text-slate-700 rounded-md border border-slate-300">
                    Neutral Standard
                  </span>
                </td>
              </tr>

              {/* Students */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-6 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-slate-900">Students</span>
                </td>
                <td className="py-3 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!E4:E{totalOfficers + 3}, "Student")
                </td>
                <td className="py-3 px-6 text-center font-bold text-amber-700">{students}</td>
                <td className="py-3 px-6 text-center font-medium text-slate-700">{calcPct(students)}</td>
                <td className="py-3 px-6">
                  <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                    Noticeable Highlight (Amber)
                  </span>
                </td>
              </tr>

              {/* E-Visa */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-6 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-slate-900">E-Visa</span>
                </td>
                <td className="py-3 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!E4:E{totalOfficers + 3}, "E-Visa")
                </td>
                <td className="py-3 px-6 text-center font-bold text-emerald-700">{eVisa}</td>
                <td className="py-3 px-6 text-center font-medium text-slate-700">{calcPct(eVisa)}</td>
                <td className="py-3 px-6">
                  <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                    Positive Highlight (Emerald)
                  </span>
                </td>
              </tr>

              {/* Officers With Car */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-6 flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-900">Officers With Car</span>
                </td>
                <td className="py-3 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!F4:F{totalOfficers + 3}, "Yes")
                </td>
                <td className="py-3 px-6 text-center font-bold text-blue-700">{officersWithCar}</td>
                <td className="py-3 px-6 text-center font-medium text-slate-700">{calcPct(officersWithCar)}</td>
                <td className="py-3 px-6">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-md">
                    Mobile Patrol Ready
                  </span>
                </td>
              </tr>

              {/* Officers Without Car */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-6 flex items-center gap-2">
                  <Car className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-900">Officers Without Car</span>
                </td>
                <td className="py-3 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!F4:F{totalOfficers + 3}, "No")
                </td>
                <td className="py-3 px-6 text-center font-bold text-slate-600">{officersWithoutCar}</td>
                <td className="py-3 px-6 text-center font-medium text-slate-700">{calcPct(officersWithoutCar)}</td>
                <td className="py-3 px-6">
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">
                    Static / Fixed Site
                  </span>
                </td>
              </tr>

              {/* Dog Handlers */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-6 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-slate-900">Dog Handlers (K9 Units)</span>
                </td>
                <td className="py-3 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!G4:G{totalOfficers + 3}, "Yes")
                </td>
                <td className="py-3 px-6 text-center font-bold text-purple-700">{dogHandlers}</td>
                <td className="py-3 px-6 text-center font-medium text-slate-700">{calcPct(dogHandlers)}</td>
                <td className="py-3 px-6">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-md border border-purple-200">
                    K9 Certified Deployment
                  </span>
                </td>
              </tr>

              {/* Standard Patrol (Non-Dog Handlers) */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-6 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-900">Standard Patrol (Non-Dog Handlers)</span>
                </td>
                <td className="py-3 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!G4:G{totalOfficers + 3}, "No")
                </td>
                <td className="py-3 px-6 text-center font-bold text-slate-700">{nonDogHandlers}</td>
                <td className="py-3 px-6 text-center font-medium text-slate-700">{calcPct(nonDogHandlers)}</td>
                <td className="py-3 px-6">
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
                    Standard Security Patrol
                  </span>
                </td>
              </tr>

              {/* Easy to Move */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-6 flex items-center gap-2">
                  <Move className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-slate-900">Easy to Move (High Mobility Units)</span>
                </td>
                <td className="py-3 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!H4:H{totalOfficers + 3}, "Yes")
                </td>
                <td className="py-3 px-6 text-center font-bold text-teal-700">{easyToMoveCount}</td>
                <td className="py-3 px-6 text-center font-medium text-slate-700">{calcPct(easyToMoveCount)}</td>
                <td className="py-3 px-6">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-teal-100 text-teal-800 rounded-md border border-teal-200">
                    High Mobility / Multi-Site Allocation
                  </span>
                </td>
              </tr>

              {/* Not Easy to Move */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-6 flex items-center gap-2">
                  <Move className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-900">Not Easy to Move (Fixed Site Deployments)</span>
                </td>
                <td className="py-3 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!H4:H{totalOfficers + 3}, "No")
                </td>
                <td className="py-3 px-6 text-center font-bold text-slate-600">{notEasyToMoveCount}</td>
                <td className="py-3 px-6 text-center font-medium text-slate-700">{calcPct(notEasyToMoveCount)}</td>
                <td className="py-3 px-6">
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">
                    Stationary Single Site
                  </span>
                </td>
              </tr>

              {otherStatuses > 0 && (
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-6 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-900">Other Recruitment Stages</span>
                  </td>
                  <td className="py-3 px-6 font-mono text-xs text-slate-600">
                    Various Pipeline Stages
                  </td>
                  <td className="py-3 px-6 text-center font-bold text-slate-700">{otherStatuses}</td>
                  <td className="py-3 px-6 text-center font-medium text-slate-700">{calcPct(otherStatuses)}</td>
                  <td className="py-3 px-6">
                    <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
                      Pipeline Active
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deployment & Geographical Readiness Grid (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vehicle Mobility Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-600" />
            <span>Vehicle Mobility</span>
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Analysis for mobile response and emergency patrol allocations
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-700">Has Own Car ({officersWithCar})</span>
                <span className="text-slate-600">{calcPct(officersWithCar)}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: calcPct(officersWithCar) }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">No Car ({officersWithoutCar})</span>
                <span className="text-slate-600">{calcPct(officersWithoutCar)}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-400 rounded-full transition-all duration-500"
                  style={{ width: calcPct(officersWithoutCar) }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Easy to Move Readiness Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
            <Move className="w-4 h-4 text-teal-600" />
            <span>Relocation Readiness</span>
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Willingness and flexibility to relocate or move between operational sites
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-teal-700">Easy to Move ({easyToMoveCount})</span>
                <span className="text-slate-600">{calcPct(easyToMoveCount)}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-600 rounded-full transition-all duration-500"
                  style={{ width: calcPct(easyToMoveCount) }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Fixed Location ({notEasyToMoveCount})</span>
                <span className="text-slate-600">{calcPct(notEasyToMoveCount)}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-400 rounded-full transition-all duration-500"
                  style={{ width: calcPct(notEasyToMoveCount) }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* City Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>City Distribution</span>
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Recruitment concentration across operational hubs
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {sortedCities.slice(0, 6).map(([cityName, count]) => (
              <div key={cityName} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 truncate mr-1">{cityName}</span>
                <span className="text-xs font-bold px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-900 shrink-0">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
