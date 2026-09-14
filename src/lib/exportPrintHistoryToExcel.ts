import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";

const EXCEL_FONT = { name: "Arial", size: 10 };
const EXCEL_FONT_BOLD = { name: "Arial", size: 10, bold: true };
const BORDER_THIN = {
  top: { style: "thin" as const, color: { argb: "FFDDDDDD" } },
  left: { style: "thin" as const, color: { argb: "FFDDDDDD" } },
  bottom: { style: "thin" as const, color: { argb: "FFDDDDDD" } },
  right: { style: "thin" as const, color: { argb: "FFDDDDDD" } },
};

export const exportPrintHistoryToExcel = async (
  requests: any[],
  t: (key: string) => string
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Print History", {
    views: [{ showGridLines: false }], // Cleaner look without default gridlines
  });

  // Define Columns
  worksheet.columns = [
    { key: "no", width: 6 },
    { key: "docName", width: 45 },
    { key: "docCode", width: 25 },
    { key: "department", width: 20 },
    { key: "revisionStatus", width: 15 },
    { key: "requester", width: 25 },
    { key: "distribution", width: 20 },
    { key: "picTaken", width: 20 },
    { key: "takenAt", width: 22 },
    { key: "status", width: 15 },
    { key: "dateRequested", width: 22 },
    { key: "copies", width: 10 },
  ];

  // 1. Add Main Title
  worksheet.mergeCells('A1:L2');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'DATA PRINT HISTORY DOCUMENT';
  titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF333333" } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Add blank row
  worksheet.addRow([]);

  // 2. Style Header Row (Row 4)
  const headerTitles = [
    t("printHistory.columns.no") || "No",
    t("printHistory.columns.documentName") || "Document Name",
    t("printHistory.columns.documentCode") || "Document Code",
    "Departemen",
    "Status Revisi",
    t("printHistory.columns.requester") || "Requester",
    t("printHistory.columns.distribution") || "Distribution",
    t("printHistory.columns.picTaken") || "PIC Taken",
    t("printHistory.columns.takenAt") || "Taken At",
    t("printHistory.columns.status") || "Status",
    t("printHistory.columns.dateRequested") || "Date Requested",
    t("printHistory.columns.copies") || "Copies"
  ];
  
  const headerRow = worksheet.addRow(headerTitles);
  headerRow.height = 25; // Taller header
  headerRow.font = EXCEL_FONT_BOLD;
  
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E293B" }, // Tailwind slate-900 (Dark nice color)
    };
    cell.font = { ...EXCEL_FONT_BOLD, color: { argb: "FFFFFFFF" } };
    cell.border = {
      top: { style: "thin", color: { argb: "FF333333" } },
      bottom: { style: "thin", color: { argb: "FF333333" } },
      left: { style: "thin", color: { argb: "FF333333" } },
      right: { style: "thin", color: { argb: "FF333333" } },
    };
    // Center everything in header
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  // 3. Populate Data
  requests.forEach((req, index) => {
    const isInternal = req.isInternal;
    const doc = req.document || {};
    const reqStatus = req.status || "-";
    const dateRequested = req.createdAt ? format(new Date(req.createdAt), "dd MMM yyyy HH:mm") : "-";
    const takenAt = req.takenAt ? format(new Date(req.takenAt), "dd MMM yyyy HH:mm") : "-";
    const distText = isInternal ? (t("printHistory.internalPti") || "Internal PTI") : (t("printHistory.externalPti") || "External PTI");

    const row = worksheet.addRow([
      index + 1,
      doc.name || "-",
      doc.documentCode || "-",
      doc.department?.name || "-",
      doc.revision !== undefined ? `Rev ${doc.revision}` : "-",
      req.requester?.fullName || "-",
      distText,
      req.picTaken || "-",
      takenAt,
      reqStatus.charAt(0).toUpperCase() + reqStatus.slice(1),
      dateRequested,
      req.copies || 0,
    ]);

    // Apply styles to data rows
    row.height = 20; // Give rows some breathing room
    row.font = { ...EXCEL_FONT, color: { argb: "FF475569" } }; // Tailwind slate-600

    row.eachCell((cell, colNumber) => {
      cell.border = BORDER_THIN;
      
      // Default alignment is left, but center specific columns
      if ([1, 4, 5, 7, 9, 10, 11, 12].includes(colNumber)) {
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      } else {
        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true, indent: 1 };
      }
    });
  });

  // Alternating row colors for readability (zebra striping)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 4) { // Data rows start at 5
      if (rowNumber % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' } // Tailwind slate-50 (Very light gray)
          };
        });
      }
    }
  });

  // Save File
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `Print_History_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`);
};
