import ExcelJS from 'exceljs';
import { SecurityOfficer } from '../types';

export async function exportSecurityOfficersWorkbook(officers: SecurityOfficer[]): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Security Recruitment Management System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Primary Sheet: Officer Database
  const sheet = workbook.addWorksheet('Officer Database', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
      }
    }
  });

  // Row 1: Merged Title Header
  sheet.mergeCells('A1:G1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'NEW RECRUITMENT – SECURITY OFFICERS';
  titleCell.font = {
    name: 'Calibri',
    size: 16,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };
  titleCell.alignment = {
    vertical: 'middle',
    horizontal: 'center'
  };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' } // Deep corporate navy
  };
  sheet.getRow(1).height = 36;

  // Row 2: Subtitle / Timestamp
  sheet.mergeCells('A2:G2');
  const subCell = sheet.getCell('A2');
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  subCell.value = `Official Recruitment Roster | Generated: ${dateStr} | Print Format: A4 Landscape`;
  subCell.font = {
    name: 'Calibri',
    size: 9,
    italic: true,
    color: { argb: 'FF475569' }
  };
  subCell.alignment = {
    vertical: 'middle',
    horizontal: 'center'
  };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' }
  };
  sheet.getRow(2).height = 18;

  // Row 3: Table Column Headers
  const headers = ['Sr. No.', 'Officer Name', 'City', 'Phone Number', 'Status', 'Car', 'Dog Handler'];
  const headerRow = sheet.getRow(3);
  headerRow.values = headers;
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' } // Dark charcoal slate
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF334155' } }
    };
  });

  // Center or left specific headers
  sheet.getCell('B3').alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getCell('C3').alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  // Populate Officer Data Rows
  const startRowIndex = 4;
  officers.forEach((officer, index) => {
    const rowNumber = startRowIndex + index;
    const row = sheet.getRow(rowNumber);
    row.height = 24;

    const isEven = index % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC'; // Soft alternating striping

    // Sr. No.
    const c1 = row.getCell(1);
    c1.value = index + 1;
    c1.alignment = { vertical: 'middle', horizontal: 'center' };
    c1.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };

    // Officer Name
    const c2 = row.getCell(2);
    c2.value = officer.name;
    c2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    c2.font = { name: 'Calibri', size: 10, color: { argb: 'FF0F172A' } };

    // City
    const c3 = row.getCell(3);
    c3.value = officer.city;
    c3.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    c3.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };

    // Phone Number (Explicitly as Text `@`)
    const c4 = row.getCell(4);
    c4.value = officer.phoneNumber || '';
    c4.numFmt = '@'; // Force text format to preserve leading zeros
    c4.alignment = { vertical: 'middle', horizontal: 'center' };
    c4.font = { name: 'Calibri', size: 10, color: { argb: 'FF0F172A' } };

    // Status (with conditional highlight fill)
    const c5 = row.getCell(5);
    c5.value = officer.status;
    c5.alignment = { vertical: 'middle', horizontal: 'center' };
    c5.font = { name: 'Calibri', size: 10, bold: true };

    // Car (Yes / No)
    const c6 = row.getCell(6);
    c6.value = officer.car;
    c6.alignment = { vertical: 'middle', horizontal: 'center' };
    c6.font = { name: 'Calibri', size: 10, bold: true };

    // Dog Handler (Yes / No)
    const c7 = row.getCell(7);
    c7.value = officer.dogHandler || 'No';
    c7.alignment = { vertical: 'middle', horizontal: 'center' };
    c7.font = { name: 'Calibri', size: 10, bold: true };

    // Apply baseline background & border
    for (let c = 1; c <= 7; c++) {
      const cell = row.getCell(c);
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBg }
      };
    }

    // Apply visual conditional formatting per prompt requirement:
    // Full Timer -> neutral
    // Student -> noticeable/highlighted (amber)
    // E-Visa -> positive highlight (emerald)
    if (officer.status === 'Student') {
      c5.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFEF3C7' } // Light amber
      };
      c5.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFB45309' } };
    } else if (officer.status === 'E-Visa') {
      c5.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDCFCE7' } // Light emerald
      };
      c5.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF15803D' } };
    } else if (officer.status === 'Full timer') {
      c5.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' } // Neutral slate
      };
      c5.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };
    }

    // Car styling
    if (officer.car === 'Yes') {
      c6.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0284C7' } }; // Soft blue
    } else {
      c6.font = { name: 'Calibri', size: 10, color: { argb: 'FF64748B' } };
    }

    // Dog Handler styling
    if (officer.dogHandler === 'Yes') {
      c7.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF7C3AED' } }; // Violet
    } else {
      c7.font = { name: 'Calibri', size: 10, color: { argb: 'FF64748B' } };
    }
  });

  const lastDataRow = Math.max(startRowIndex + officers.length - 1, startRowIndex);

  // Set column widths
  sheet.columns = [
    { key: 'srNo', width: 10 },
    { key: 'name', width: 32 },
    { key: 'city', width: 22 },
    { key: 'phone', width: 20 },
    { key: 'status', width: 22 },
    { key: 'car', width: 14 },
    { key: 'dogHandler', width: 16 }
  ];

  // Enable AutoFilter on header row
  sheet.autoFilter = {
    from: { row: 3, column: 1 },
    to: { row: lastDataRow, column: 7 }
  };

  // Data Validation for City, Status, Car & Dog Handler columns
  const cityValidationList = '"London,Brighton,Birmingham,Glasgow,Manchester,Sunderland,Cardiff,Swindon,Scotland,Watford,Ilford,Barrats,Peterborough,Bristol,Gateshead,Barnkingside London,Tooting, London,Southall,Slough,Telford"';

  for (let r = startRowIndex; r <= Math.max(lastDataRow, 50); r++) {
    sheet.getCell(`C${r}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [cityValidationList],
      showErrorMessage: true,
      errorTitle: 'Invalid City',
      error: 'Please choose an approved location from the city dropdown list.'
    };

    sheet.getCell(`E${r}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"Student,Full timer,E-Visa,New Applicant,Interview Scheduled,Interviewed,Selected,Rejected,On Hold,Active,Inactive"'],
      showErrorMessage: true,
      errorTitle: 'Invalid Status',
      error: 'Please choose an approved recruitment status from the list.'
    };

    sheet.getCell(`F${r}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"Yes,No"'],
      showErrorMessage: true,
      errorTitle: 'Invalid Selection',
      error: 'Please select Yes or No for vehicle status.'
    };

    sheet.getCell(`G${r}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"Yes,No"'],
      showErrorMessage: true,
      errorTitle: 'Invalid Selection',
      error: 'Please select Yes or No for dog handler status.'
    };
  }

  // -------------------------------------------------------------
  // Sheet 2: Recruitment Summary Worksheet
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Recruitment Summary', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1
    }
  });

  // Summary Title
  summarySheet.mergeCells('B2:E2');
  const sumTitle = summarySheet.getCell('B2');
  sumTitle.value = 'SECURITY OFFICERS – RECRUITMENT SUMMARY';
  sumTitle.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  sumTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  sumTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' }
  };
  summarySheet.getRow(2).height = 32;

  // Summary Subheader
  summarySheet.mergeCells('B3:E3');
  const sumSub = summarySheet.getCell('B3');
  sumSub.value = `Automated Overview & Key Recruitment Metrics | Updated: ${dateStr}`;
  sumSub.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF475569' } };
  sumSub.alignment = { vertical: 'middle', horizontal: 'center' };
  sumSub.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' }
  };
  summarySheet.getRow(3).height = 18;

  // Header row for summary table
  const sumHeaderRow = summarySheet.getRow(5);
  sumHeaderRow.getCell(2).value = 'Metric / Category';
  sumHeaderRow.getCell(3).value = 'Count (Excel Formula)';
  sumHeaderRow.getCell(4).value = 'Current Value';
  sumHeaderRow.getCell(5).value = '% of Total';
  sumHeaderRow.height = 24;

  [2, 3, 4, 5].forEach((c) => {
    const cell = sumHeaderRow.getCell(c);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' }
    };
    cell.alignment = { vertical: 'middle', horizontal: c === 2 ? 'left' : 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF0F172A' } },
      bottom: { style: 'thin', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } }
    };
  });

  const totalCount = officers.length;
  const studentCount = officers.filter(o => o.status === 'Student').length;
  const fullTimerCount = officers.filter(o => o.status === 'Full timer').length;
  const eVisaCount = officers.filter(o => o.status === 'E-Visa').length;
  const withCarCount = officers.filter(o => o.car === 'Yes').length;
  const withoutCarCount = officers.filter(o => o.car === 'No').length;
  const dogHandlerCount = officers.filter(o => o.dogHandler === 'Yes').length;
  const nonDogHandlerCount = officers.filter(o => o.dogHandler !== 'Yes').length;

  const summaryData = [
    { label: 'Total Officers', formula: `=COUNTA('Officer Database'!B4:B${lastDataRow})`, val: totalCount, pct: '100%' },
    { label: 'Students', formula: `=COUNTIF('Officer Database'!E4:E${lastDataRow}, "Student")`, val: studentCount, pct: totalCount ? `${Math.round((studentCount / totalCount) * 100)}%` : '0%' },
    { label: 'Full Timer', formula: `=COUNTIF('Officer Database'!E4:E${lastDataRow}, "Full timer")`, val: fullTimerCount, pct: totalCount ? `${Math.round((fullTimerCount / totalCount) * 100)}%` : '0%' },
    { label: 'E-Visa', formula: `=COUNTIF('Officer Database'!E4:E${lastDataRow}, "E-Visa")`, val: eVisaCount, pct: totalCount ? `${Math.round((eVisaCount / totalCount) * 100)}%` : '0%' },
    { label: 'Officers With Car (Vehicle Available)', formula: `=COUNTIF('Officer Database'!F4:F${lastDataRow}, "Yes")`, val: withCarCount, pct: totalCount ? `${Math.round((withCarCount / totalCount) * 100)}%` : '0%' },
    { label: 'Officers Without Car', formula: `=COUNTIF('Officer Database'!F4:F${lastDataRow}, "No")`, val: withoutCarCount, pct: totalCount ? `${Math.round((withoutCarCount / totalCount) * 100)}%` : '0%' },
    { label: 'Dog Handlers (K9 Units)', formula: `=COUNTIF('Officer Database'!G4:G${lastDataRow}, "Yes")`, val: dogHandlerCount, pct: totalCount ? `${Math.round((dogHandlerCount / totalCount) * 100)}%` : '0%' },
    { label: 'Standard Patrol (Non-Dog Handlers)', formula: `=COUNTIF('Officer Database'!G4:G${lastDataRow}, "No")`, val: nonDogHandlerCount, pct: totalCount ? `${Math.round((nonDogHandlerCount / totalCount) * 100)}%` : '0%' }
  ];

  summaryData.forEach((item, idx) => {
    const rowNum = 6 + idx;
    const row = summarySheet.getRow(rowNum);
    row.height = 22;

    const cLabel = row.getCell(2);
    cLabel.value = item.label;
    cLabel.font = { name: 'Calibri', size: 10, bold: idx === 0 };
    cLabel.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    const cFormula = row.getCell(3);
    cFormula.value = item.formula;
    cFormula.font = { name: 'Consolas', size: 9, color: { argb: 'FF475569' } };
    cFormula.alignment = { vertical: 'middle', horizontal: 'center' };

    const cVal = row.getCell(4);
    cVal.value = item.val;
    cVal.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E3A8A' } };
    cVal.alignment = { vertical: 'middle', horizontal: 'center' };

    const cPct = row.getCell(5);
    cPct.value = item.pct;
    cPct.font = { name: 'Calibri', size: 10, color: { argb: 'FF334155' } };
    cPct.alignment = { vertical: 'middle', horizontal: 'center' };

    const rowBg = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC';
    [2, 3, 4, 5].forEach((c) => {
      const cell = row.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  });

  // Set widths for Summary Sheet
  summarySheet.getColumn(1).width = 4;
  summarySheet.getColumn(2).width = 36;
  summarySheet.getColumn(3).width = 45;
  summarySheet.getColumn(4).width = 16;
  summarySheet.getColumn(5).width = 16;

  // Generate buffer and return as Blob
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}
