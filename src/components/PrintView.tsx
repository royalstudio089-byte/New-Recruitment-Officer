import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { SecurityOfficer } from '../types';
import { exportSecurityOfficersPdf } from '../services/pdfExport';
import { exportSecurityOfficersWorkbook } from '../services/excelExport';
import { WhatsAppShareModal } from './WhatsAppShareModal';

interface PrintViewProps {
  officers: SecurityOfficer[];
  onClose: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({ officers, onClose }) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const totalOfficers = officers.length;
  const students = officers.filter(o => o.status === 'Student').length;
  const fullTimer = officers.filter(o => o.status === 'Full timer').length;
  const eVisa = officers.filter(o => o.status === 'E-Visa').length;
  const officersWithCar = officers.filter(o => o.car === 'Yes').length;
  const dogHandlers = officers.filter(o => o.dogHandler === 'Yes').length;
  const easyToMove = officers.filter(o => (o.easyToMove || 'Yes') === 'Yes').length;

  const showMsg = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Direct Vector PDF Download
  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportSecurityOfficersPdf(officers);
      showMsg('A4 Landscape PDF generated and downloaded successfully!');
    } catch (e: any) {
      console.error('PDF Export Error:', e);
      showMsg(e.message || 'Failed to generate PDF.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Direct Excel (.xlsx) Download
  const handleDownloadExcel = async () => {
    try {
      setIsExportingExcel(true);
      const blob = await exportSecurityOfficersWorkbook(officers);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NEW_RECRUITMENT_SECURITY_OFFICERS_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showMsg('Microsoft Excel (.xlsx) workbook downloaded successfully!');
    } catch (e: any) {
      console.error('Excel Export Error:', e);
      showMsg(e.message || 'Failed to export Excel workbook.', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Print with Iframe safety fallback
  const handlePrint = () => {
    try {
      // In browser iframes, window.print() can fail silently or throw.
      // We attempt window.print(), and if it doesn't open within 500ms or fails, we offer/trigger PDF download.
      window.print();
      showMsg('Print command sent. If your browser blocks iframe printing, use "Export PDF" instead.', 'info');
    } catch (err) {
      console.warn('Window print failed in iframe, falling back to PDF download:', err);
      showMsg('Browser blocked iframe printing. Downloading official PDF document instead...', 'info');
      handleDownloadPdf();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto p-4 sm:p-8 print:p-0">
      {/* Non-print controls bar */}
      <div className="print:hidden max-w-5xl mx-auto mb-6 p-4 bg-slate-900 text-white rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span>A4 Landscape Document & Print Center</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                A4 Landscape Compliant
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Export high-resolution PDF, download native Excel spreadsheet, or trigger printer.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. WhatsApp PDF Share */}
            <button
              onClick={() => setIsWhatsAppOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
              title="Send A4 PDF Report via WhatsApp"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>WhatsApp PDF</span>
            </button>

            {/* 2. Export PDF (Primary Action) */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
              title="Download official vector PDF report formatted for A4 landscape paper"
            >
              <FileText className="w-4 h-4" />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Export to PDF'}</span>
            </button>

            {/* 3. Export Excel (.xlsx) */}
            <button
              onClick={handleDownloadExcel}
              disabled={isExportingExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
              title="Download Microsoft Excel workbook (.xlsx) with both worksheets"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isExportingExcel ? 'Exporting...' : 'Export to XLSX'}</span>
            </button>

            {/* 4. System Print */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
              title="Send to physical printer or browser print dialog"
            >
              <Printer className="w-4 h-4" />
              <span>Print Dialog</span>
            </button>

            {/* 5. Close Preview */}
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700 cursor-pointer"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informative message / Notification */}
        {message && (
          <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' 
              : message.type === 'error'
              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
              : 'bg-blue-950/80 text-blue-300 border border-blue-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-blue-400" />
            )}
            <span>{message.text}</span>
          </div>
        )}
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
        <div className="grid grid-cols-7 gap-2 mb-4 text-xs font-semibold text-center border border-slate-300 p-2 bg-slate-50">
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
          <div className="border-r border-slate-300">
            <span className="text-blue-800 block text-[10px]">OFFICERS WITH CAR</span>
            <span className="text-sm font-bold text-blue-700">{officersWithCar}</span>
          </div>
          <div className="border-r border-slate-300">
            <span className="text-purple-800 block text-[10px]">DOG HANDLERS</span>
            <span className="text-sm font-bold text-purple-700">{dogHandlers}</span>
          </div>
          <div>
            <span className="text-teal-800 block text-[10px]">EASY TO MOVE</span>
            <span className="text-sm font-bold text-teal-700">{easyToMove}</span>
          </div>
        </div>

        {/* OFFICER DATA TABLE */}
        <table className="w-full text-xs border-collapse border border-slate-900">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="border border-slate-700 py-2 px-2 text-center w-14">Sr. No.</th>
              <th className="border border-slate-700 py-2 px-3 text-left">Officer Name</th>
              <th className="border border-slate-700 py-2 px-3 text-left w-32">City</th>
              <th className="border border-slate-700 py-2 px-3 text-center w-36">Phone Number</th>
              <th className="border border-slate-700 py-2 px-3 text-center w-28">Status</th>
              <th className="border border-slate-700 py-2 px-2 text-center w-16">Car</th>
              <th className="border border-slate-700 py-2 px-2 text-center w-24">Dog Handler</th>
              <th className="border border-slate-700 py-2 px-2 text-center w-24">Easy to Move</th>
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
                  <td className={`border border-slate-300 py-1.5 px-2 text-center font-bold ${officer.dogHandler === 'Yes' ? 'text-purple-700 bg-purple-50' : 'text-slate-500'}`}>
                    {officer.dogHandler || 'No'}
                  </td>
                  <td className={`border border-slate-300 py-1.5 px-2 text-center font-bold ${(officer.easyToMove || 'Yes') === 'Yes' ? 'text-teal-700 bg-teal-50/50' : 'text-slate-500'}`}>
                    {officer.easyToMove || 'Yes'}
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

      {/* WhatsApp Share Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        officers={officers}
      />
    </div>
  );
};
