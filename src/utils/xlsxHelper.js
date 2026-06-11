import * as XLSX from 'xlsx';

// Avoid Vite/ESM bundling issues where XLSX properties might be nested under default
const xlsxLib = XLSX && XLSX.utils ? XLSX : (XLSX[String('default')] || XLSX);

/**
 * Export any array of objects to an .xlsx file
 * @param {Array} data - Array of flat objects
 * @param {string} fileName - Output file name (without extension)
 * @param {string} sheetName - Name of the worksheet
 */
export function exportToXLSX(data, fileName = 'export', sheetName = 'Sheet1') {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }
  try {
    const worksheet = xlsxLib.utils.json_to_sheet(data);
    const workbook = xlsxLib.utils.book_new();
    xlsxLib.utils.book_append_sheet(workbook, worksheet, sheetName);
    xlsxLib.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error('XLSX Export Error:', error);
    alert('حدث خطأ أثناء تصدير الملف. يرجى المحاولة مرة أخرى.');
  }
}

/**
 * Export multiple sheets to a single .xlsx file
 * @param {Array} sheets - Array of { data: Array, sheetName: string }
 * @param {string} fileName - Output file name (without extension)
 */
export function exportMultiSheetToXLSX(sheets, fileName = 'export') {
  if (!sheets || sheets.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }
  try {
    const workbook = xlsxLib.utils.book_new();
    sheets.forEach(sheet => {
      const worksheet = xlsxLib.utils.json_to_sheet(sheet.data);
      xlsxLib.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
    });
    xlsxLib.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error('XLSX Export Error:', error);
    alert('حدث خطأ أثناء تصدير الملف. يرجى المحاولة مرة أخرى.');
  }
}


/**
 * Import data from an xlsx file, returns a Promise resolving to array of objects
 * @param {File} file - File object from input[type="file"]
 */
export function importFromXLSX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = xlsxLib.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsxLib.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (err) {
        console.error('XLSX Import Error:', err);
        reject(err);
      }
    };
    reader.onerror = (err) => {
      console.error('File Reading Error:', err);
      reject(err);
    };
    reader.readAsArrayBuffer(file);
  });
}

