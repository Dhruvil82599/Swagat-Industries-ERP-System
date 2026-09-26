/**
 * Export tabular data to a CSV/Excel downloadable file
 * @param {string} filename - Filename for download (e.g. "Attendance_Report_2026-09")
 * @param {Array<string>} headers - Array of header titles
 * @param {Array<Array<any>>} rows - 2D array of row data values
 */
export function exportToCSV(filename, headers, rows) {
  if (!headers || !rows) return;

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename.endsWith(".csv") ? filename : filename + ".csv"}`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Trigger print dialog cleanly
 */
export function printCurrentReport() {
  window.print();
}
