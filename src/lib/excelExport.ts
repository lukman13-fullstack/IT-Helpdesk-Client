import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  MasterDocumentIndex,
  FormMasterIndexData,
} from "@/services/api/types/documents.types";

const EXCEL_FONT = { name: "Arial", size: 9 };
const EXCEL_FONT_BOLD = { name: "Arial", size: 9, bold: true };
const BORDER_THIN = {
  top: { style: "thin" as const },
  left: { style: "thin" as const },
  bottom: { style: "thin" as const },
  right: { style: "thin" as const },
};

export const exportMasterIndexToExcel = async (
  data: MasterDocumentIndex,
  isInternal: boolean | null
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Master Index");

  const isInternalBool = isInternal === true;
  // const isExternalBool = isInternal === false; // Removed as it's redundant with isInternal === false

  // Column Widths
  worksheet.columns = [
    { width: 10 }, // A: No
    { width: 40 }, // B: Nama Dokumen
    { width: 25 }, // C: Nomor Dokumen
    { width: 12 }, // D: Nomor Revisi
    { width: 18 }, // E: Tanggal Terbit
    { width: 18 }, // F: Tanggal Revisi
  ];

  data.departments.forEach((dept, deptIndex) => {
    const startRow = worksheet.lastRow
      ? worksheet.lastRow.number + (deptIndex === 0 ? 1 : 2)
      : 1;

    // Header Section - Bordered Outer Box
    // Row 1 & 2: Logo and Title
    const titleRow = worksheet.getRow(startRow);
    titleRow.height = 35;

    // Merge for Logo
    worksheet.mergeCells(`A${startRow}:A${startRow + 1}`);
    const logoCell = worksheet.getCell(`A${startRow}`);
    logoCell.value = "artience";
    logoCell.alignment = { vertical: "middle", horizontal: "center" };
    logoCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF005555" } };
    logoCell.border = BORDER_THIN;

    // Merge for Title
    worksheet.mergeCells(`B${startRow}:F${startRow}`);
    const titleCell = worksheet.getCell(`B${startRow}`);
    titleCell.value = `DAFTAR INDUK DOKUMEN ${
      isInternalBool
        ? "INTERNAL"
        : isInternal === false
        ? "EKSTERNAL"
        : "INTERNAL & EKSTERNAL"
    } / LIST OF ${
      isInternalBool
        ? "INTERNAL"
        : isInternal === false
        ? "EXTERNAL"
        : "INTERNAL & EXTERNAL"
    } MASTER DOCUMENTS`;
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.font = EXCEL_FONT_BOLD;
    titleCell.border = BORDER_THIN;

    // Subtitle Row
    worksheet.mergeCells(`B${startRow + 1}:F${startRow + 1}`);
    const subtitleCell = worksheet.getCell(`B${startRow + 1}`);
    subtitleCell.value = "PT. TOYO INK INDONESIA";
    subtitleCell.alignment = { vertical: "middle", horizontal: "center" };
    subtitleCell.font = EXCEL_FONT_BOLD;
    subtitleCell.border = BORDER_THIN;

    // Row 3: Meta Info (4 columns)
    const metaRow = startRow + 2;
    worksheet.getCell(`A${metaRow}`).value = "No. Dokumen : FRM / III / MR / 03";
    worksheet.mergeCells(`A${metaRow}:B${metaRow}`);
    
    worksheet.mergeCells(`C${metaRow}:D${metaRow}`);
    worksheet.getCell(`C${metaRow}`).value = `Tanggal Efektif: 5 April  2026`;
    
    worksheet.getCell(`E${metaRow}`).value = "Status Revisi: 05";
    worksheet.getCell(`F${metaRow}`).value = "Hal: 1 dari 1";

    ["A", "B", "C", "D", "E", "F"].forEach((col) => {
      const cell = worksheet.getCell(`${col}${metaRow}`);
      cell.border = BORDER_THIN;
      cell.font = { ...EXCEL_FONT, size: 8 };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Row 4-6: Info Rows
    const infoStart = startRow + 3;
    const labels = [
      { label: "Tahun / Year", value: data.year.toString() },
      { label: "Departemen / Department", value: dept.department.name },
      { label: "Jenis Dokumen / Document Type", value: dept.documentType },
    ];

    const STAMP_BORDER: Partial<ExcelJS.Borders> = {
      top: { style: "medium" as const, color: { argb: "FF2563EB" } },
      bottom: { style: "medium" as const, color: { argb: "FF2563EB" } },
      left: { style: "medium" as const, color: { argb: "FF2563EB" } },
      right: { style: "medium" as const, color: { argb: "FF2563EB" } },
    };

    labels.forEach((item, idx) => {
      const rowNum = infoStart + idx;
      worksheet.mergeCells(`A${rowNum}:B${rowNum}`);
      const labelCell = worksheet.getCell(`A${rowNum}`);
      labelCell.value = item.label;
      labelCell.font = EXCEL_FONT_BOLD;
      labelCell.border = BORDER_THIN;

      worksheet.mergeCells(`C${rowNum}:D${rowNum}`);
      const valueCell = worksheet.getCell(`C${rowNum}`);
      valueCell.value = `: ${item.value}`;
      valueCell.font = EXCEL_FONT;
      valueCell.border = BORDER_THIN;
    });

    // MASTER Stamp (merged E:F across info rows)
    const stampStart = infoStart;
    const stampEnd = infoStart + 2;
    worksheet.mergeCells(`E${stampStart}:F${stampEnd}`);
    const stampCell = worksheet.getCell(`E${stampStart}`);
    stampCell.value = { richText: [
      { text: "PT. TOYO INK INDONESIA\n", font: { name: "Arial", size: 7, bold: true, color: { argb: "FF2563EB" } } },
      { text: "MASTER", font: { name: "Arial", size: 20, bold: true, color: { argb: "FF2563EB" } } },
    ]};
    stampCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    stampCell.border = STAMP_BORDER;

    // Data Table
    dept.categories.forEach((cat, catIdx) => {
      const catRow = worksheet.lastRow!.number + 1;
      worksheet.mergeCells(`A${catRow}:F${catRow}`);
      const catCell = worksheet.getCell(`A${catRow}`);
      catCell.value = `${catIdx + 1}. ${cat.label}`;
      catCell.font = EXCEL_FONT_BOLD;

      const headRow = worksheet.lastRow!.number + 1;
      const headers = [
        "No.",
        "Nama Dokumen / Document Name",
        "Nomor Dokumen / Document Number",
        "Nomor Revisi / Rev. No.",
        "Tanggal Terbit / Issue Date",
        "Tanggal Revisi / Revision Date",
      ];
      headers.forEach((h, i) => {
        const cell = worksheet.getCell(headRow, i + 1);
        cell.value = h;
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };
        cell.font = EXCEL_FONT_BOLD;
        cell.border = BORDER_THIN;
        cell.alignment = {
          wrapText: true,
          vertical: "middle",
          horizontal: "center",
        };
      });

      cat.documents.forEach((doc) => {
        const row = worksheet.addRow([
          doc.no,
          doc.name,
          doc.documentCode,
          doc.revision.toString().padStart(2, "0"),
          doc.dateOfIssue
            ? new Date(doc.dateOfIssue).toLocaleDateString("id-ID")
            : "-",
          doc.releaseDate
            ? new Date(doc.releaseDate).toLocaleDateString("id-ID")
            : "-",
        ]);
        row.eachCell((cell: ExcelJS.Cell) => {
          cell.border = BORDER_THIN;
          cell.font = EXCEL_FONT;
          cell.alignment = { vertical: "middle" };
        });
      });

      if (cat.documents.length === 0) {
        const row = worksheet.addRow(["", "No documents", "", "", "", ""]);
        worksheet.mergeCells(`B${row.number}:F${row.number}`);
        row.eachCell((cell: ExcelJS.Cell) => {
          cell.border = BORDER_THIN;
          cell.font = EXCEL_FONT;
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Master_Induk_Dokumen_${data.year}.xlsx`);
};

export const exportFormMasterIndexToExcel = async (
  data: FormMasterIndexData
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Form Master Index");

  // const isInternalBool = isInternal === true; // Removed as it's not used in the titleCell.value logic

  worksheet.columns = [
    { width: 10 }, // A: No
    { width: 40 }, // B: Nama Dokumen
    { width: 25 }, // C: Nomor Dokumen
    { width: 20 }, // D: Bentuk Dokumen
    { width: 18 }, // E: Standar Masa Simpan
    { width: 20 }, // F: Lokasi Penyimpanan
    { width: 15 }, // G: Keterangan
  ];

  const startRow = 1;
  const titleRow = worksheet.getRow(startRow);
  titleRow.height = 35;

  worksheet.mergeCells(`A${startRow}:A${startRow + 1}`);
  const logoCell = worksheet.getCell(`A${startRow}`);
  logoCell.value = "artience";
  logoCell.alignment = { vertical: "middle", horizontal: "center" };
  logoCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF005555" } };
  logoCell.border = BORDER_THIN;

  worksheet.mergeCells(`B${startRow}:G${startRow}`);
  const titleCell = worksheet.getCell(`B${startRow}`);
  titleCell.value = `DAFTAR INDUK CATATAN / MASTER LIST OF RECORD`;
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  titleCell.font = EXCEL_FONT_BOLD;
  titleCell.border = BORDER_THIN;

  worksheet.mergeCells(`B${startRow + 1}:G${startRow + 1}`);
  const subtitleCell = worksheet.getCell(`B${startRow + 1}`);
  subtitleCell.value = "PT. TOYO INK INDONESIA";
  subtitleCell.alignment = { vertical: "middle", horizontal: "center" };
  subtitleCell.font = EXCEL_FONT_BOLD;
  subtitleCell.border = BORDER_THIN;

  const metaRow = startRow + 2;
  worksheet.getCell(`A${metaRow}`).value = "No. Dokumen : FRM / III / MR / 12";
  worksheet.mergeCells(`A${metaRow}:B${metaRow}`);
  worksheet.mergeCells(`C${metaRow}:D${metaRow}`);
  worksheet.getCell(`C${metaRow}`).value = `Tanggal Efektif: 5 April 2026`;
  
  worksheet.mergeCells(`E${metaRow}:F${metaRow}`);
  worksheet.getCell(`E${metaRow}`).value = "Status Revisi: 05";
  worksheet.getCell(`G${metaRow}`).value = "Hal: 1 dari 1";

  ["A", "B", "C", "D", "E", "F", "G"].forEach((col) => {
    const cell = worksheet.getCell(`${col}${metaRow}`);
    cell.border = BORDER_THIN;
    cell.font = { ...EXCEL_FONT, size: 8 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  const infoStart = startRow + 3;

  const FORM_STAMP_BORDER: Partial<ExcelJS.Borders> = {
    top: { style: "medium" as const, color: { argb: "FF2563EB" } },
    bottom: { style: "medium" as const, color: { argb: "FF2563EB" } },
    left: { style: "medium" as const, color: { argb: "FF2563EB" } },
    right: { style: "medium" as const, color: { argb: "FF2563EB" } },
  };

  // Spacer row above stamp area
  const spacerAboveRow = infoStart;
  worksheet.getRow(spacerAboveRow).height = 10;
  ["A", "B", "C", "D", "E", "F", "G"].forEach((col) => {
    worksheet.getCell(`${col}${spacerAboveRow}`).border = {
      top: { style: "thin" as const },
      left: col === "A" ? { style: "thin" as const } : undefined,
      right: col === "G" ? { style: "thin" as const } : undefined,
    };
  });

  // Tahun / Year row
  const yearRow = infoStart + 1;
  worksheet.getRow(yearRow).height = 25;
  worksheet.mergeCells(`A${yearRow}:B${yearRow}`);
  worksheet.getCell(`A${yearRow}`).value = "Tahun / Year";
  worksheet.getCell(`A${yearRow}`).font = EXCEL_FONT_BOLD;
  worksheet.mergeCells(`C${yearRow}:E${yearRow}`);
  worksheet.getCell(`C${yearRow}`).value = `: ${data.year.toString()}`;
  worksheet.getCell(`C${yearRow}`).font = EXCEL_FONT;
  
  ["A", "B", "C", "D", "E"].forEach((col) => {
    worksheet.getCell(`${col}${yearRow}`).border = {
      left: col === "A" ? { style: "thin" as const } : undefined,
    };
  });
  worksheet.getCell(`G${yearRow}`).border = { right: { style: "thin" as const } };

  // Departments
  data.departments.forEach((dept) => {
    const deptInfoRow = worksheet.lastRow!.number + 1;
    worksheet.getRow(deptInfoRow).height = 25;
    worksheet.mergeCells(`A${deptInfoRow}:B${deptInfoRow}`);
    worksheet.getCell(`A${deptInfoRow}`).value = "Departemen / Department";
    worksheet.mergeCells(`C${deptInfoRow}:E${deptInfoRow}`);
    worksheet.getCell(`C${deptInfoRow}`).value = `: ${dept.department.name}`;
    
    worksheet.getCell(`A${deptInfoRow}`).font = EXCEL_FONT_BOLD;
    worksheet.getCell(`C${deptInfoRow}`).font = EXCEL_FONT_BOLD;

    ["A", "B", "C", "D", "E"].forEach((col) => {
      worksheet.getCell(`${col}${deptInfoRow}`).border = {
        left: col === "A" ? { style: "thin" as const } : undefined,
      };
    });
    worksheet.getCell(`G${deptInfoRow}`).border = { right: { style: "thin" as const } };

    // MASTER Stamp (only column F, column G is empty padding)
    const lastDeptRow = worksheet.lastRow!.number;
    worksheet.mergeCells(`F${yearRow}:F${lastDeptRow}`);
    const stampCell = worksheet.getCell(`F${yearRow}`);
    stampCell.value = { richText: [
      { text: "PT. TOYO INK INDONESIA\n", font: { name: "Arial", size: 6, bold: true, color: { argb: "FF2563EB" } } },
      { text: "MASTER", font: { name: "Arial", size: 14, bold: true, color: { argb: "FF2563EB" } } },
    ]};
    stampCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    stampCell.border = FORM_STAMP_BORDER;

    // Spacer row below stamp area
    const spacerBelowRow = worksheet.lastRow!.number + 1;
    worksheet.getRow(spacerBelowRow).height = 10;
    ["A", "B", "C", "D", "E", "F", "G"].forEach((col) => {
      worksheet.getCell(`${col}${spacerBelowRow}`).border = {
        bottom: { style: "thin" as const },
        left: col === "A" ? { style: "thin" as const } : undefined,
        right: col === "G" ? { style: "thin" as const } : undefined,
      };
    });


    const headRow = worksheet.lastRow!.number + 1;
    const headers = [
      "No.",
      "Nama Dokumen / Document Name",
      "Nomor Dokumen / Document Number",
      "Bentuk Dokumen / Document Form",
      "Standar Masa Simpan / Shelf Life Standards",
      "Lokasi Penyimpanan / Storage Location",
      "Keterangan / Remark",
    ];
    headers.forEach((h, i) => {
      const cell = worksheet.getCell(headRow, i + 1);
      cell.value = h;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
      cell.font = EXCEL_FONT_BOLD;
      cell.border = BORDER_THIN;
      cell.alignment = {
        wrapText: true,
        vertical: "middle",
        horizontal: "center",
      };
    });

    dept.documents.forEach((doc) => {
      const row = worksheet.addRow([
        doc.no,
        doc.name,
        doc.documentCode,
        doc.documentTypeLabel || "-",
        doc.retentionPeriod || "-",
        doc.storageLocation || "-",
        "-",
      ]);
      row.eachCell((cell: ExcelJS.Cell) => {
        cell.border = BORDER_THIN;
        cell.font = EXCEL_FONT;
        cell.alignment = { vertical: "middle" };
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Form_Master_Index_${data.year}.xlsx`);
};

// Import type for External Master Index
import type { ExternalMasterIndexData } from "@/services/api/documents";

export const exportExternalMasterIndexToExcel = async (
  data: ExternalMasterIndexData
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("External Master Index");

  // Column Widths
  worksheet.columns = [
    { width: 10 }, // A: No
    { width: 40 }, // B: Nama Dokumen
    { width: 28 }, // C: Lembaga Penerbit
    { width: 20 }, // D: Bentuk Dokumen
    { width: 18 }, // E: Tanggal Terbit
    { width: 18 }, // F: Tanggal Kadaluarsa
  ];

  data.departments.forEach((dept, deptIndex) => {
    const startRow = worksheet.lastRow
      ? worksheet.lastRow.number + (deptIndex === 0 ? 1 : 2)
      : 1;

    // Header Section - Bordered Outer Box
    // Row 1 & 2: Logo and Title
    const titleRow = worksheet.getRow(startRow);
    titleRow.height = 35;

    // Merge for Logo
    worksheet.mergeCells(`A${startRow}:A${startRow + 1}`);
    const logoCell = worksheet.getCell(`A${startRow}`);
    logoCell.value = "artience";
    logoCell.alignment = { vertical: "middle", horizontal: "center" };
    logoCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF005555" } };
    logoCell.border = BORDER_THIN;

    // Merge for Title
    worksheet.mergeCells(`B${startRow}:F${startRow}`);
    const titleCell = worksheet.getCell(`B${startRow}`);
    titleCell.value =
      "DAFTAR INDUK DOKUMEN EKSTERNAL / LIST OF EXTERNAL MASTER DOCUMENTS";
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.font = EXCEL_FONT_BOLD;
    titleCell.border = BORDER_THIN;

    // Subtitle Row
    worksheet.mergeCells(`B${startRow + 1}:F${startRow + 1}`);
    const subtitleCell = worksheet.getCell(`B${startRow + 1}`);
    subtitleCell.value = "PT. TOYO INK INDONESIA";
    subtitleCell.alignment = { vertical: "middle", horizontal: "center" };
    subtitleCell.font = EXCEL_FONT_BOLD;
    subtitleCell.border = BORDER_THIN;

    // Row 3: Meta Info (4 columns)
    const metaRow = startRow + 2;
    worksheet.getCell(`A${metaRow}`).value = "No. Dokumen : FRM / III / MR / 03";
    worksheet.mergeCells(`A${metaRow}:B${metaRow}`);
    worksheet.mergeCells(`C${metaRow}:D${metaRow}`);
    worksheet.getCell(
      `C${metaRow}`
    ).value = `Tanggal Efektif: 5 April 2026`;
    
    worksheet.getCell(`E${metaRow}`).value = "Status Revisi: 05";
    worksheet.getCell(`F${metaRow}`).value = "Hal: 1 dari 1";

    ["A", "B", "C", "D", "E", "F"].forEach((col) => {
      const cell = worksheet.getCell(`${col}${metaRow}`);
      cell.border = BORDER_THIN;
      cell.font = { ...EXCEL_FONT, size: 8 };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Row 4-6: Info Rows
    const infoStart = startRow + 3;
    const labels = [
      { label: "Tahun / Year", value: data.year.toString() },
      { label: "Departemen / Department", value: dept.department.name },
      { label: "Jenis Dokumen / Document Type", value: dept.documentType },
    ];

    const EXT_STAMP_BORDER: Partial<ExcelJS.Borders> = {
      top: { style: "medium" as const, color: { argb: "FF2563EB" } },
      bottom: { style: "medium" as const, color: { argb: "FF2563EB" } },
      left: { style: "medium" as const, color: { argb: "FF2563EB" } },
      right: { style: "medium" as const, color: { argb: "FF2563EB" } },
    };

    labels.forEach((item, idx) => {
      const rowNum = infoStart + idx;
      worksheet.mergeCells(`A${rowNum}:B${rowNum}`);
      const labelCell = worksheet.getCell(`A${rowNum}`);
      labelCell.value = item.label;
      labelCell.font = EXCEL_FONT_BOLD;
      labelCell.border = BORDER_THIN;

      worksheet.mergeCells(`C${rowNum}:D${rowNum}`);
      const valueCell = worksheet.getCell(`C${rowNum}`);
      valueCell.value = `: ${item.value}`;
      valueCell.font = EXCEL_FONT;
      valueCell.border = BORDER_THIN;
    });

    // MASTER Stamp (merged E:F across info rows)
    const extStampStart = infoStart;
    const extStampEnd = infoStart + 2;
    worksheet.mergeCells(`E${extStampStart}:F${extStampEnd}`);
    const extStampCell = worksheet.getCell(`E${extStampStart}`);
    extStampCell.value = { richText: [
      { text: "PT. TOYO INK INDONESIA\n", font: { name: "Arial", size: 7, bold: true, color: { argb: "FF2563EB" } } },
      { text: "MASTER", font: { name: "Arial", size: 20, bold: true, color: { argb: "FF2563EB" } } },
    ]};
    extStampCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    extStampCell.border = EXT_STAMP_BORDER;

    // Table Header
    const headRow = worksheet.lastRow!.number + 1;
    const headers = [
      "No.",
      "Nama Dokumen / Document Name",
      "Lembaga Penerbit / Publishing Institution",
      "Bentuk Dokumen / Document Form",
      "Tanggal Terbit / Date of Issue",
      "Tanggal Kadaluarsa / Expired Date",
    ];
    headers.forEach((h, i) => {
      const cell = worksheet.getCell(headRow, i + 1);
      cell.value = h;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
      cell.font = EXCEL_FONT_BOLD;
      cell.border = BORDER_THIN;
      cell.alignment = {
        wrapText: true,
        vertical: "middle",
        horizontal: "center",
      };
    });

    // Data Rows
    dept.documents.forEach((doc) => {
      const row = worksheet.addRow([
        doc.no,
        doc.name,
        doc.publishingInstitution || "-",
        doc.documentFormat || "-",
        doc.dateOfIssue
          ? new Date(doc.dateOfIssue).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "-",
        doc.expiredDate
          ? new Date(doc.expiredDate).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "-",
      ]);
      row.eachCell((cell: ExcelJS.Cell) => {
        cell.border = BORDER_THIN;
        cell.font = EXCEL_FONT;
        cell.alignment = { vertical: "middle" };
      });
    });

    if (dept.documents.length === 0) {
      const row = worksheet.addRow([
        "",
        "No external documents",
        "",
        "",
        "",
        "",
      ]);
      worksheet.mergeCells(`B${row.number}:F${row.number}`);
      row.eachCell((cell: ExcelJS.Cell) => {
        cell.border = BORDER_THIN;
        cell.font = EXCEL_FONT;
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    `External_Master_Index_${data.year}.xlsx`
  );
};
