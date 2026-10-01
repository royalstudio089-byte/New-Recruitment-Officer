import React from 'react';
import { SecurityOfficer } from '../types';

interface PrintViewProps {
  officers: SecurityOfficer[];
  onClose: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({ officers, onClose }) => {
  const totalOfficers = officers.length;
  const students = officers.filter(o => o.status === 'Student').length;
  const fullTimer = officers.filter(o => o.status === 'Full timer').length;
  const eVisa = officers.filter(o => o.status === 'E-Visa').length;
  const officersWithCar = officers.filter(o => o.car === 'Yes').length;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto p-8 print:p-0">
      {/* Non-print controls bar */}
      <div className="print:hidden max-w-5xl mx-auto mb-6 p-4 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm">A4 Landscape Print Preview</h3>
          <p className="text-xs text-slate-300">
            Optimized for printing on A4 landscape paper with clear borders and standard Excel margins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            Print Now
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
          >
            Close Preview
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="max-w-[1050px] mx-auto bg-white p-6 border border-slate-300 print:border-none shadow-sm rounded-lg print:shadow-none print:p-2 text-slate-900 font-sans">
        {/* MERGED TITLE AT TOP */}
        <div className="border-2 border-slate-900 mb-4">
          <div className="bg-[#1e3a8a] text-white py-3 px-4 text-center font-bold text-xl tracking-wider">
            NEW RECRUITMENT – SECURITY OFFICERS
          </div>
          <div className="bg-slate-100 py-1 px-4 text-center text-xs text-slate-600 border-t border-slate-300 flex justify-between items-center">
            <span>OFFICIAL RECRUITMENT ROSTER</span>
            <span>DATE: {new Date().toLocaleDateString('en-GB')}</span>
            <span>FORMAT: A4 LANDSCAPE</span>
          </div>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="grid grid-cols-5 gap-2 mb-4 text-xs font-semibold text-center border border-slate-300 p-2 bg-slate-50">
          <div className="border-r border-slate-300">
            <span className="text-slate-500 block text-[10px]">TOTAL OFFICERS</span>
            <span className="text-sm font-bold text-slate-900">{totalOfficers}</span>
          </div>
          <div className="border-r border-slate-300">
            <span className="text-amber-800 block text-[10px]">STUDENTS</span>
            <span className="text-sm font-bold text-amber-700">{students}</span>
          </div>
          <div className="border-r border-slate-300">
            <span className="text-slate-700 block text-[10px]">FULL TIMER</span>
            <span className="text-sm font-bold text-slate-800">{fullTimer}</span>
          </div>
          <div className="border-r border-slate-300">
            <span className="text-emerald-800 block text-[10px]">E-VISA</span>
            <span className="text-sm font-bold text-emerald-700">{eVisa}</span>
          </div>
          <div>
            <span className="text-blue-800 block text-[10px]">OFFICERS WITH CAR</span>
            <span className="text-sm font-bold text-blue-700">{officersWithCar}</span>
          </div>
        </div>

        {/* OFFICER DATA TABLE */}
        <table className="w-full text-xs border-collapse border border-slate-900">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="border border-slate-700 py-2 px-2 text-center w-14">Sr. No.</th>
              <th className="border border-slate-700 py-2 px-3 text-left">Officer Name</th>
              <th className="border border-slate-700 py-2 px-3 text-left w-36">City</th>
              <th className="border border-slate-700 py-2 px-3 text-center w-36">Phone Number</th>
              <th className="border border-slate-700 py-2 px-3 text-center w-32">Status</th>
              <th className="border border-slate-700 py-2 px-2 text-center w-20">Car</th>
            </tr>
          </thead>
          <tbody>
            {officers.map((officer, index) => {
              const isEven = index % 2 === 0;
              let statusBg = isEven ? 'bg-white' : 'bg-slate-50';
              let statusText = 'text-slate-800';

              if (officer.status === 'Student') {
                statusBg = 'bg-amber-100 font-bold';
                statusText = 'text-amber-900';
              } else if (officer.status === 'E-Visa') {
                statusBg = 'bg-emerald-100 font-bold';
                statusText = 'text-emerald-900';
              } else if (officer.status === 'Full timer') {
                statusBg = 'bg-slate-200 font-semibold';
                statusText = 'text-slate-900';
              }

              return (
                <tr key={officer.id} className={isEven ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="border border-slate-300 py-1.5 px-2 text-center font-bold text-slate-700">
                    {index + 1}
                  </td>
                  <td className="border border-slate-300 py-1.5 px-3 font-medium text-slate-900">
                    {officer.name}
                  </td>
                  <td className="border border-slate-300 py-1.5 px-3 text-slate-800">
                    {officer.city}
                  </td>
                  <td className="border border-slate-300 py-1.5 px-3 text-center font-mono text-slate-800">
                    {officer.phoneNumber}
                  </td>
                  <td className={`border border-slate-300 py-1.5 px-3 text-center ${statusBg} ${statusText}`}>
                    {officer.status}
                  </td>
                  <td className={`border border-slate-300 py-1.5 px-2 text-center font-bold ${officer.car === 'Yes' ? 'text-blue-700' : 'text-slate-500'}`}>
                    {officer.car}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Signature & Verification Footer */}
        <div className="mt-8 grid grid-cols-3 gap-6 text-center text-xs text-slate-600 print:mt-12">
          <div className="border-t border-slate-400 pt-2">
            <span className="font-semibold block text-slate-800">Prepared By</span>
            Recruitment Officer
          </div>
          <div className="border-t border-slate-400 pt-2">
            <span className="font-semibold block text-slate-800">Verified By</span>
            Operations Supervisor
          </div>
          <div className="border-t border-slate-400 pt-2">
            <span className="font-semibold block text-slate-800">Approved By</span>
            Head of Security Operations
          </div>
        </div>
      </div>
    </div>
  );
};
