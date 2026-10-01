import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  Sparkles, 
  Car, 
  FileSpreadsheet, 
  CheckCircle2, 
  PieChart, 
  ArrowUpRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { SecurityOfficer } from '../types';

interface RecruitmentSummaryViewProps {
  officers: SecurityOfficer[];
  onSwitchToDatabase: () => void;
}

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
              Automated executive figures and deployment readiness metrics linked dynamically to the Officer Database.
            </p>
          </div>

          <button
            onClick={onSwitchToDatabase}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <span>View Officer Database</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 Primary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Officers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Officers
            </span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalOfficers}</span>
            <span className="text-xs font-medium text-slate-500">enrolled</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            =COUNTA('Officer Database'!B4:B)
          </div>
        </div>

        {/* Students */}
        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs hover:border-amber-300 transition-all bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Students
            </span>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-700">{students}</span>
            <span className="text-xs font-medium text-amber-600">({calcPct(students)})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            =COUNTIF(E4:E, "Student")
          </div>
        </div>

        {/* Full Timer */}
        <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-all bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Full Timer
            </span>
            <div className="p-2 bg-slate-200 rounded-lg text-slate-700">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800">{fullTimer}</span>
            <span className="text-xs font-medium text-slate-600">({calcPct(fullTimer)})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            =COUNTIF(E4:E, "Full timer")
          </div>
        </div>

        {/* E-Visa */}
        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs hover:border-emerald-300 transition-all bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              E-Visa
            </span>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-700">{eVisa}</span>
            <span className="text-xs font-medium text-emerald-600">({calcPct(eVisa)})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            =COUNTIF(E4:E, "E-Visa")
          </div>
        </div>

        {/* Officers With Car */}
        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs hover:border-blue-300 transition-all bg-blue-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
              Officers With Car
            </span>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-700">{officersWithCar}</span>
            <span className="text-xs font-medium text-blue-600">({calcPct(officersWithCar)})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            =COUNTIF(F4:F, "Yes")
          </div>
        </div>

        {/* Dog Handlers */}
        <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-xs hover:border-purple-300 transition-all bg-purple-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider">
              Dog Handlers
            </span>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-700">{dogHandlers}</span>
            <span className="text-xs font-medium text-purple-600">({calcPct(dogHandlers)})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            =COUNTIF(G4:G, "Yes")
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
                <th className="py-3 px-6 font-semibold">Visual Treatment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50/80 transition-colors font-medium">
                <td className="py-3.5 px-6 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Total Officers</span>
                </td>
                <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                  =COUNTA('Officer Database'!B4:B{totalOfficers + 3})
                </td>
                <td className="py-3.5 px-6 text-center font-bold text-slate-900">{totalOfficers}</td>
                <td className="py-3.5 px-6 text-center font-semibold text-slate-700">100%</td>
                <td className="py-3.5 px-6">
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded-md">
                    Base Roster
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-6 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-slate-900">Students</span>
                </td>
                <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!E4:E{totalOfficers + 3}, "Student")
                </td>
                <td className="py-3.5 px-6 text-center font-bold text-amber-700">{students}</td>
                <td className="py-3.5 px-6 text-center font-medium text-slate-700">{calcPct(students)}</td>
                <td className="py-3.5 px-6">
                  <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                    Noticeable Highlight (Amber)
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-6 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-600" />
                  <span className="font-medium text-slate-900">Full Timer</span>
                </td>
                <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!E4:E{totalOfficers + 3}, "Full timer")
                </td>
                <td className="py-3.5 px-6 text-center font-bold text-slate-800">{fullTimer}</td>
                <td className="py-3.5 px-6 text-center font-medium text-slate-700">{calcPct(fullTimer)}</td>
                <td className="py-3.5 px-6">
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-200 text-slate-700 rounded-md border border-slate-300">
                    Neutral Standard
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-6 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-slate-900">E-Visa</span>
                </td>
                <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!E4:E{totalOfficers + 3}, "E-Visa")
                </td>
                <td className="py-3.5 px-6 text-center font-bold text-emerald-700">{eVisa}</td>
                <td className="py-3.5 px-6 text-center font-medium text-slate-700">{calcPct(eVisa)}</td>
                <td className="py-3.5 px-6">
                  <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                    Positive Highlight (Emerald)
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-6 flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-900">Officers With Car</span>
                </td>
                <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!F4:F{totalOfficers + 3}, "Yes")
                </td>
                <td className="py-3.5 px-6 text-center font-bold text-blue-700">{officersWithCar}</td>
                <td className="py-3.5 px-6 text-center font-medium text-slate-700">{calcPct(officersWithCar)}</td>
                <td className="py-3.5 px-6">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-md">
                    Mobile Patrol Ready
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-6 flex items-center gap-2">
                  <Car className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-900">Officers Without Car</span>
                </td>
                <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!F4:F{totalOfficers + 3}, "No")
                </td>
                <td className="py-3.5 px-6 text-center font-bold text-slate-600">{officersWithoutCar}</td>
                <td className="py-3.5 px-6 text-center font-medium text-slate-700">{calcPct(officersWithoutCar)}</td>
                <td className="py-3.5 px-6">
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">
                    Static / Fixed Site
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-6 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-slate-900">Dog Handlers (K9 Units)</span>
                </td>
                <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!G4:G{totalOfficers + 3}, "Yes")
                </td>
                <td className="py-3.5 px-6 text-center font-bold text-purple-700">{dogHandlers}</td>
                <td className="py-3.5 px-6 text-center font-medium text-slate-700">{calcPct(dogHandlers)}</td>
                <td className="py-3.5 px-6">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-md border border-purple-200">
                    K9 Certified Deployment
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-6 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-900">Standard Patrol (Non-Dog Handlers)</span>
                </td>
                <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                  =COUNTIF('Officer Database'!G4:G{totalOfficers + 3}, "No")
                </td>
                <td className="py-3.5 px-6 text-center font-bold text-slate-700">{nonDogHandlers}</td>
                <td className="py-3.5 px-6 text-center font-medium text-slate-700">{calcPct(nonDogHandlers)}</td>
                <td className="py-3.5 px-6">
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
                    Standard Security Patrol
                  </span>
                </td>
              </tr>

              {otherStatuses > 0 && (
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-900">Other Recruitment Stages</span>
                  </td>
                  <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                    Various Pipeline Stages
                  </td>
                  <td className="py-3.5 px-6 text-center font-bold text-slate-700">{otherStatuses}</td>
                  <td className="py-3.5 px-6 text-center font-medium text-slate-700">{calcPct(otherStatuses)}</td>
                  <td className="py-3.5 px-6">
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

      {/* Deployment & Geographical Readiness Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Mobility Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="font-bold text-slate-900 text-base mb-1">
            Vehicle & Mobility Deployment
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

        {/* City Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="font-bold text-slate-900 text-base mb-1">
            City / Location Distribution
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Recruitment concentration across operational hubs
          </p>

          <div className="grid grid-cols-2 gap-3">
            {sortedCities.slice(0, 6).map(([cityName, count]) => (
              <div key={cityName} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">{cityName}</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-900">
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
