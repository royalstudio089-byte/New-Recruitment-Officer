import { SecurityOfficer } from '../types';

export interface GoogleSpreadsheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheets: { sheetId: number; title: string }[];
}

/**
 * Creates a formatted Google Spreadsheet with 'Officer Database' and 'Recruitment Summary' tabs
 */
export async function createGoogleSheetRoster(
  accessToken: string,
  officers: SecurityOfficer[],
  title = 'NEW RECRUITMENT – SECURITY OFFICERS'
): Promise<GoogleSpreadsheetResult> {
  // 1. Create Spreadsheet with two sheets
  const createPayload = {
    properties: {
      title,
      locale: 'en_US',
      autoRecalc: 'ON_CHANGE'
    },
    sheets: [
      {
        properties: {
          title: 'Officer Database',
          gridProperties: {
            frozenRowCount: 3,
            rowCount: Math.max(officers.length + 20, 50),
            columnCount: 8
          }
        }
      },
      {
        properties: {
          title: 'Recruitment Summary',
          gridProperties: {
            rowCount: 30,
            columnCount: 8
          }
        }
      }
    ]
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createPayload)
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Spreadsheet: ${createRes.status} ${errText}`);
  }

  const createdData = await createRes.json();
  const spreadsheetId: string = createdData.spreadsheetId;
  const spreadsheetUrl: string = createdData.spreadsheetUrl;
  const officerSheetId: number = createdData.sheets[0].properties.sheetId;
  const summarySheetId: number = createdData.sheets[1].properties.sheetId;

  // 2. Prepare Values for Officer Database
  const officerValues: (string | number)[][] = [
    ['NEW RECRUITMENT – SECURITY OFFICERS', '', '', '', '', '', '', ''],
    [`Recruitment Roster | Generated: ${new Date().toLocaleDateString()}`, '', '', '', '', '', '', ''],
    ['Sr. No.', 'Officer Name', 'City', 'Phone Number', 'Status', 'Car', 'Dog Handler', 'Easy to Move']
  ];

  officers.forEach((o, index) => {
    officerValues.push([
      index + 1,
      o.name,
      o.city,
      `'${o.phoneNumber}`, // Apostrophe prefix ensures Sheets stores as text preserving leading zeros
      o.status,
      o.car,
      o.dogHandler || 'No',
      o.easyToMove || 'Yes'
    ]);
  });

  // 3. Write Officer Database Values
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Officer Database'!A1:H${officerValues.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: officerValues })
    }
  );

  // 4. Prepare & Write Summary Values
  const lastRow = officerValues.length;
  const summaryValues = [
    ['SECURITY OFFICERS – RECRUITMENT SUMMARY', '', '', ''],
    [`Automated Key Metrics | Total: ${officers.length}`, '', '', ''],
    [],
    ['Metric / Category', 'Formula', 'Count', '% of Total'],
    ['Total Officers', `="Total: " & COUNTA('Officer Database'!B4:B${lastRow})`, `=COUNTA('Officer Database'!B4:B${lastRow})`, '100%'],
    ['Students', `="Student count"`, `=COUNTIF('Officer Database'!E4:E${lastRow}, "Student")`, `=IFERROR(COUNTIF('Officer Database'!E4:E${lastRow}, "Student")/COUNTA('Officer Database'!B4:B${lastRow}), 0)`],
    ['Full Timer', `="Full timer count"`, `=COUNTIF('Officer Database'!E4:E${lastRow}, "Full timer")`, `=IFERROR(COUNTIF('Officer Database'!E4:E${lastRow}, "Full timer")/COUNTA('Officer Database'!B4:B${lastRow}), 0)`],
    ['E-Visa', `="E-Visa count"`, `=COUNTIF('Officer Database'!E4:E${lastRow}, "E-Visa")`, `=IFERROR(COUNTIF('Officer Database'!E4:E${lastRow}, "E-Visa")/COUNTA('Officer Database'!B4:B${lastRow}), 0)`],
    ['Officers With Car', `="Car: Yes"`, `=COUNTIF('Officer Database'!F4:F${lastRow}, "Yes")`, `=IFERROR(COUNTIF('Officer Database'!F4:F${lastRow}, "Yes")/COUNTA('Officer Database'!B4:B${lastRow}), 0)`],
    ['Officers Without Car', `="Car: No"`, `=COUNTIF('Officer Database'!F4:F${lastRow}, "No")`, `=IFERROR(COUNTIF('Officer Database'!F4:F${lastRow}, "No")/COUNTA('Officer Database'!B4:B${lastRow}), 0)`],
    ['Dog Handlers (K9 Units)', `="Dog Handler: Yes"`, `=COUNTIF('Officer Database'!G4:G${lastRow}, "Yes")`, `=IFERROR(COUNTIF('Officer Database'!G4:G${lastRow}, "Yes")/COUNTA('Officer Database'!B4:B${lastRow}), 0)`],
    ['Standard Patrol (Non-Dog Handlers)', `="Dog Handler: No"`, `=COUNTIF('Officer Database'!G4:G${lastRow}, "No")`, `=IFERROR(COUNTIF('Officer Database'!G4:G${lastRow}, "No")/COUNTA('Officer Database'!B4:B${lastRow}), 0)`]
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Recruitment Summary'!A1:D${summaryValues.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: summaryValues })
    }
  );

  // 5. Batch formatting via batchUpdate:
  // - Merge A1:F1 (title)
  // - Format title: Deep navy background, bold white text, 15pt
  // - Header formatting on row 3: slate background, bold white text
  // - Column widths
  // - Alignments
  const requests: any[] = [
    // Merge Title row A1:F1
    {
      mergeCells: {
        range: {
          sheetId: officerSheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 6
        },
        mergeType: 'MERGE_ALL'
      }
    },
    // Merge Subtitle row A2:F2
    {
      mergeCells: {
        range: {
          sheetId: officerSheetId,
          startRowIndex: 1,
          endRowIndex: 2,
          startColumnIndex: 0,
          endColumnIndex: 6
        },
        mergeType: 'MERGE_ALL'
      }
    },
    // Format Title Cell A1
    {
      repeatCell: {
        range: {
          sheetId: officerSheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 6
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.12, green: 0.23, blue: 0.54 }, // Navy #1e3a8a
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            textFormat: {
              bold: true,
              fontSize: 14,
              foregroundColor: { red: 1, green: 1, blue: 1 }
            }
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
      }
    },
    // Format Subtitle Cell A2
    {
      repeatCell: {
        range: {
          sheetId: officerSheetId,
          startRowIndex: 1,
          endRowIndex: 2,
          startColumnIndex: 0,
          endColumnIndex: 6
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.95, green: 0.96, blue: 0.98 },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            textFormat: {
              italic: true,
              fontSize: 9,
              foregroundColor: { red: 0.3, green: 0.35, blue: 0.42 }
            }
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
      }
    },
    // Format Header Row 3
    {
      repeatCell: {
        range: {
          sheetId: officerSheetId,
          startRowIndex: 2,
          endRowIndex: 3,
          startColumnIndex: 0,
          endColumnIndex: 6
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.06, green: 0.09, blue: 0.16 }, // Slate #0f172a
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            textFormat: {
              bold: true,
              fontSize: 10,
              foregroundColor: { red: 1, green: 1, blue: 1 }
            }
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
      }
    },
    // Alignments for data columns: Sr No, Status, Car centered
    {
      repeatCell: {
        range: {
          sheetId: officerSheetId,
          startRowIndex: 3,
          endRowIndex: officerValues.length,
          startColumnIndex: 0,
          endColumnIndex: 1
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE'
          }
        },
        fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment)'
      }
    },
    {
      repeatCell: {
        range: {
          sheetId: officerSheetId,
          startRowIndex: 3,
          endRowIndex: officerValues.length,
          startColumnIndex: 3,
          endColumnIndex: 6
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            numberFormat: { type: 'TEXT' }
          }
        },
        fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,numberFormat)'
      }
    },
    // Set Column Widths
    {
      updateDimensionProperties: {
        range: {
          sheetId: officerSheetId,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: 1
        },
        properties: { pixelSize: 70 },
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: officerSheetId,
          dimension: 'COLUMNS',
          startIndex: 1,
          endIndex: 2
        },
        properties: { pixelSize: 220 },
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: officerSheetId,
          dimension: 'COLUMNS',
          startIndex: 2,
          endIndex: 3
        },
        properties: { pixelSize: 150 },
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: officerSheetId,
          dimension: 'COLUMNS',
          startIndex: 3,
          endIndex: 4
        },
        properties: { pixelSize: 150 },
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: officerSheetId,
          dimension: 'COLUMNS',
          startIndex: 4,
          endIndex: 5
        },
        properties: { pixelSize: 150 },
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: officerSheetId,
          dimension: 'COLUMNS',
          startIndex: 5,
          endIndex: 6
        },
        properties: { pixelSize: 90 },
        fields: 'pixelSize'
      }
    },
    // Merge Summary Sheet Title
    {
      mergeCells: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 4
        },
        mergeType: 'MERGE_ALL'
      }
    },
    {
      repeatCell: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 4
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.12, green: 0.23, blue: 0.54 },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            textFormat: { bold: true, fontSize: 13, foregroundColor: { red: 1, green: 1, blue: 1 } }
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
      }
    },
    {
      repeatCell: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: 3,
          endRowIndex: 4,
          startColumnIndex: 0,
          endColumnIndex: 4
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.06, green: 0.09, blue: 0.16 },
            horizontalAlignment: 'CENTER',
            textFormat: { bold: true, fontSize: 10, foregroundColor: { red: 1, green: 1, blue: 1 } }
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
      }
    }
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
    sheets: [
      { sheetId: officerSheetId, title: 'Officer Database' },
      { sheetId: summarySheetId, title: 'Recruitment Summary' }
    ]
  };
}

/**
 * Sync updates to an existing Google Spreadsheet
 */
export async function syncToGoogleSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  officers: SecurityOfficer[]
): Promise<void> {
  const officerValues: (string | number)[][] = [
    ['NEW RECRUITMENT – SECURITY OFFICERS', '', '', '', '', '', '', ''],
    [`Recruitment Roster | Synced: ${new Date().toLocaleDateString()}`, '', '', '', '', '', '', ''],
    ['Sr. No.', 'Officer Name', 'City', 'Phone Number', 'Status', 'Car', 'Dog Handler', 'Easy to Move']
  ];

  officers.forEach((o, index) => {
    officerValues.push([
      index + 1,
      o.name,
      o.city,
      `'${o.phoneNumber}`,
      o.status,
      o.car,
      o.dogHandler || 'No',
      o.easyToMove || 'Yes'
    ]);
  });

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Officer Database'!A1:H${officerValues.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: officerValues })
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Sync failed: ${res.status} ${errText}`);
  }
}
