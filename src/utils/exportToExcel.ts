import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportToExcel = async (
  data: any[],
  columns: { header: string; key: string; width?: number }[],
  fileName: string
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(fileName);

  // Define columns
  worksheet.columns = columns;

  // Add data rows
  data.forEach((row) => {
    worksheet.addRow(row);
  });

  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0284C7" }, // primary blue color used in headers
  };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  // Generate and save file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`);
};
