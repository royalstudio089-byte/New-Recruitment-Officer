import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SecurityOfficer } from '../types';

/**
 * Builds the jsPDF instance for the Security Officers Roster
 */
export function buildSecurityOfficersPdfDoc(officers: SecurityOfficer[]): {
  doc: jsPDF;
  filename: string;
} {
  // Initialize jsPDF in A4 landscape mode ('l', 'mm', 'a4': 297mm x 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const margin = 14;

  // 1. Top Merged Title Banner (Corporate Deep Navy #1e3a8a)
  doc.setFillColor(30, 58, 138); // #1e3a8a
  doc.rect(margin, 12, pageWidth - margin * 2, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('NEW RECRUITMENT – SECURITY OFFICERS', pageWidth / 2, 22, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(219, 234, 254);
  doc.text(
    'OFFICIAL CENTRAL RECRUITMENT DATABASE • OPERATIONAL ROSTER • AUTO-NUMBERED RECORDS',
    pageWidth / 2,
    27,
    { align: 'center' }
  );

  // 2. Sub-strip Info (Date, Document ID, Format)
  doc.setFillColor(15, 23, 42); // slate-900 #0f172a
  doc.rect(margin, 30, pageWidth - margin * 2, 8, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('STATUS: ACTIVE RECRUITMENT ROSTER', margin + 4, 35.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  doc.text(`DATE GENERATED: ${dateStr}`, pageWidth / 2, 35.5, { align: 'center' });
  doc.text('PRINT FORMAT: A4 LANDSCAPE (EXCEL STANDARD)', pageWidth - margin - 4, 35.5, { align: 'right' });

  // 3. KPI Summary Statistics Cards
  const totalOfficers = officers.length;
  const students = officers.filter(o => o.status === 'Student').length;
  const fullTimer = officers.filter(o => o.status === 'Full timer').length;
  const eVisa = officers.filter(o => o.status === 'E-Visa').length;
  const withCar = officers.filter(o => o.car === 'Yes').length;
  const dogHandlers = officers.filter(o => o.dogHandler === 'Yes').length;

  const kpis = [
    { label: 'TOTAL OFFICERS', value: `${totalOfficers}`, color: [15, 23, 42] },
    { label: 'STUDENTS', value: `${students}`, color: [180, 83, 9] },
    { label: 'FULL TIMER', value: `${fullTimer}`, color: [51, 65, 85] },
    { label: 'E-VISA', value: `${eVisa}`, color: [21, 128, 61] },
    { label: 'WITH CAR', value: `${withCar}`, color: [2, 132, 199] },
    { label: 'DOG HANDLERS (K9)', value: `${dogHandlers}`, color: [124, 58, 237] }
  ];

  const kpiY = 41;
  const kpiHeight = 13;
  const kpiWidth = (pageWidth - margin * 2 - (kpis.length - 1) * 3) / kpis.length;

  kpis.forEach((kpi, idx) => {
    const kpiX = margin + idx * (kpiWidth + 3);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(kpiX, kpiY, kpiWidth, kpiHeight, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.label, kpiX + kpiWidth / 2, kpiY + 4.5, { align: 'center' });

    doc.setFontSize(10);
    doc.text(kpi.value, kpiX + kpiWidth / 2, kpiY + 10.5, { align: 'center' });
  });

  // 4. Table Rows
  const tableData = officers.map((o) => [
    o.srNo.toString(),
    o.name,
    o.city,
    o.phoneNumber || '-',
    o.status,
    o.car,
    o.dogHandler || 'No'
  ]);

  autoTable(doc, {
    startY: 57,
    margin: { left: margin, right: margin },
    head: [['Sr. No.', 'Officer Name', 'City', 'Phone Number', 'Status', 'Car', 'Dog Handler']],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: { top: 2.2, bottom: 2.2, left: 3, right: 3 },
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [15, 23, 42], // #0f172a slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 16, fontStyle: 'bold' }, // Sr. No.
      1: { halign: 'left', cellWidth: 68, fontStyle: 'bold' },    // Officer Name
      2: { halign: 'left', cellWidth: 42 },                       // City
      3: { halign: 'center', cellWidth: 42, font: 'courier' },     // Phone Number (preserve text format)
      4: { halign: 'center', cellWidth: 40, fontStyle: 'bold' },  // Status
      5: { halign: 'center', cellWidth: 26, fontStyle: 'bold' },  // Car
      6: { halign: 'center', cellWidth: 35, fontStyle: 'bold' }   // Dog Handler
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    },
    didParseCell: (data) => {
      // Highlight Status column
      if (data.section === 'body' && data.column.index === 4) {
        const val = data.cell.raw as string;
        if (val === 'Student') {
          data.cell.styles.fillColor = [254, 243, 199]; // amber-100
          data.cell.styles.textColor = [180, 83, 9];    // amber-700
        } else if (val === 'E-Visa') {
          data.cell.styles.fillColor = [220, 252, 231]; // emerald-100
          data.cell.styles.textColor = [21, 128, 61];   // emerald-700
        } else if (val === 'Full timer') {
          data.cell.styles.fillColor = [241, 245, 249]; // slate-100
          data.cell.styles.textColor = [51, 65, 85];    // slate-700
        }
      }
      // Highlight Car column
      if (data.section === 'body' && data.column.index === 5) {
        const val = data.cell.raw as string;
        if (val === 'Yes') {
          data.cell.styles.textColor = [2, 132, 199];   // sky-600
        } else {
          data.cell.styles.textColor = [100, 116, 139]; // slate-500
        }
      }
      // Highlight Dog Handler column
      if (data.section === 'body' && data.column.index === 6) {
        const val = data.cell.raw as string;
        if (val === 'Yes') {
          data.cell.styles.fillColor = [243, 232, 255]; // purple-100
          data.cell.styles.textColor = [126, 34, 206];  // purple-700
        } else {
          data.cell.styles.textColor = [100, 116, 139]; // slate-500
        }
      }
    }
  });

  // 5. Verification Sign-off Box at Bottom
  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  const signY = Math.min(finalY + 12, 185);

  const signCols = [
    { title: 'PREPARED BY', role: 'Recruitment Officer', x: margin },
    { title: 'VERIFIED BY', role: 'Operations Supervisor', x: margin + 92 },
    { title: 'APPROVED BY', role: 'Head of Security Operations', x: margin + 184 }
  ];

  signCols.forEach((col) => {
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.setLineWidth(0.4);
    doc.line(col.x, signY, col.x + 75, signY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(col.title, col.x + 37.5, signY + 4, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(col.role, col.x + 37.5, signY + 8, { align: 'center' });
  });

  // Footer: Page Number & Audit Hash
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Security Recruitment Roster • Official Document • Page 1 of 1 • System ID: ed9d654b-5299-4c43-9a84-176f8b238983`,
    pageWidth / 2,
    204,
    { align: 'center' }
  );

  const filename = `NEW_RECRUITMENT_SECURITY_OFFICERS_${new Date().toISOString().slice(0, 10)}.pdf`;
  return { doc, filename };
}

/**
 * Generate and download an executive-grade A4 Landscape PDF for the recruitment roster
 */
export async function exportSecurityOfficersPdf(officers: SecurityOfficer[]): Promise<void> {
  const { doc, filename } = buildSecurityOfficersPdfDoc(officers);
  doc.save(filename);
}

/**
 * Generates a File object of the PDF for Web Share API / WhatsApp attachment
 */
export async function generateSecurityOfficersPdfFile(officers: SecurityOfficer[]): Promise<{
  file: File;
  blob: Blob;
  filename: string;
}> {
  const { doc, filename } = buildSecurityOfficersPdfDoc(officers);
  const blob = doc.output('blob');
  const file = new File([blob], filename, { type: 'application/pdf' });
  return { file, blob, filename };
}

/**
 * Formats a clean, structured WhatsApp summary message for the recruitment roster
 */
export function formatRosterWhatsAppMessage(officers: SecurityOfficer[]): string {
  const totalOfficers = officers.length;
  const students = officers.filter(o => o.status === 'Student').length;
  const fullTimer = officers.filter(o => o.status === 'Full timer').length;
  const eVisa = officers.filter(o => o.status === 'E-Visa').length;
  const withCar = officers.filter(o => o.car === 'Yes').length;
  const dogHandlers = officers.filter(o => o.dogHandler === 'Yes').length;
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    `📋 *NEW RECRUITMENT – SECURITY OFFICERS ROSTER*\n` +
    `📅 Date: ${dateStr}\n` +
    `🏢 Total Officers: *${totalOfficers}*\n\n` +
    `📊 *Recruitment Status Breakdown:*\n` +
    `• Full Timer: ${fullTimer}\n` +
    `• Student: ${students}\n` +
    `• E-Visa: ${eVisa}\n` +
    `🚗 Officers with Car: *${withCar}*\n` +
    `🐕 K9 Dog Handlers: *${dogHandlers}*\n\n` +
    `📄 *Official A4 Landscape PDF Report Generated*\n` +
    `Attached: NEW_RECRUITMENT_SECURITY_OFFICERS.pdf`
  );
}
