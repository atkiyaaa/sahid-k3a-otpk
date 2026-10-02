/**
 * Kebumen International Container Terminal (KICT) - Terminal Operating System
 * Export Service (Excel .xlsx and Formal PDF Generator)
 */

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

export interface ExportColumnDef<T> {
  header: string;
  accessor: (item: T) => string | number | boolean;
  width?: number;
}

export function exportToExcel<T>(
  data: T[],
  columns: ExportColumnDef<T>[],
  fileNamePrefix: string,
  sheetName: string = 'KICT_Data'
) {
  const rows = data.map((item, index) => {
    const rowObj: Record<string, string | number | boolean> = {
      'No.': index + 1,
    };
    columns.forEach(col => {
      rowObj[col.header] = col.accessor(item);
    });
    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto column widths
  const colWidths = [{ wch: 6 }, ...columns.map(c => ({ wch: c.width || Math.max(c.header.length + 4, 16) }))];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const timestamp = new Date().toISOString().slice(0, 10);
  const fullFileName = `${fileNamePrefix}_${timestamp}.xlsx`;
  XLSX.writeFile(workbook, fullFileName);
}

export function exportToPdfDocument(
  title: string,
  subTitle: string,
  tableHeaders: string[],
  tableData: (string | number)[][],
  fileNamePrefix: string
) {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [88, 28, 135]; // Deep Purple #581C87

    // Header Band
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 297, 24, 'F');

    // Title text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('KEBUMEN INTERNATIONAL CONTAINER TERMINAL (KICT)', 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('TOS OPERATIONAL REPORTING SYSTEM · ISO 9001:2015 & ISPS CODE CERTIFIED', 14, 18);

    // Document Meta
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(title.toUpperCase(), 14, 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Keterangan: ${subTitle}`, 14, 40);
    doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')} | Dicetak oleh: Sistem KICT Live TOS`, 14, 45);

    // Simple robust table drawing
    let startY = 52;
    const colWidth = 270 / Math.max(tableHeaders.length, 1);
    const rowHeight = 7.5;

    // Header row
    doc.setFillColor(243, 232, 255); // Purple tint
    doc.rect(14, startY, 269, rowHeight, 'F');
    doc.setTextColor(88, 28, 135);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    tableHeaders.forEach((h, i) => {
      doc.text(String(h), 16 + i * colWidth, startY + 5);
    });

    startY += rowHeight;

    // Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);

    tableData.slice(0, 22).forEach((row, rowIdx) => {
      if (rowIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, startY, 269, rowHeight, 'F');
      }

      row.forEach((cell, cIdx) => {
        const strVal = String(cell ?? '-');
        const truncated = strVal.length > 25 ? strVal.substring(0, 23) + '..' : strVal;
        doc.text(truncated, 16 + cIdx * colWidth, startY + 5);
      });
      startY += rowHeight;
    });

    // Footer signature
    const footerY = 180;
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('Kebumen, ' + new Date().toLocaleDateString('id-ID', { dateStyle: 'long' }), 220, footerY);
    doc.text('Duty Operations Manager KICT,', 220, footerY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text('( Capt. Ardiansyah, M.Mar )', 220, footerY + 22);

    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`${fileNamePrefix}_${timestamp}.pdf`);
  } catch (error) {
    console.error('PDF export fallback triggered:', error);
    // Fallback printable view
    window.print();
  }
}
