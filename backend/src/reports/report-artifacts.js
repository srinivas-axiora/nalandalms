import PDFDocument from "pdfkit";
import { strToU8, zipSync } from "fflate";

const columns = [
  ["User ID", "userId"], ["Employee", "employeeName"], ["Team", "team"],
  ["Department", "department"], ["Course ID", "courseId"], ["Course", "courseTitle"],
  ["Progress %", "progress"], ["Chapter seconds", "chapterTimeSeconds"],
  ["Assessment seconds", "assessmentTimeSeconds"], ["Course seconds", "courseTimeSeconds"],
];

const xml = (value) => String(value ?? "")
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const columnName = (index) => {
  let name = "";
  for (let value = index + 1; value > 0; value = Math.floor((value - 1) / 26)) {
    name = String.fromCharCode(65 + ((value - 1) % 26)) + name;
  }
  return name;
};

const cell = (value, row, column) => {
  const ref = `${columnName(column)}${row}`;
  if (typeof value === "number" && Number.isFinite(value)) return `<c r="${ref}"><v>${value}</v></c>`;
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
};

export function createXlsxArtifact(rows) {
  const sheetRows = [columns.map(([label]) => label), ...rows.map((row) => columns.map(([, key]) => row[key]))];
  const sheet = sheetRows.map((values, index) =>
    `<row r="${index + 1}">${values.map((value, column) => cell(value, index + 1, column)).join("")}</row>`).join("");
  const files = {
    "[Content_Types].xml": strToU8('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'),
    "_rels/.rels": strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
    "xl/workbook.xml": strToU8('<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Report" sheetId="1" r:id="rId1"/></sheets></workbook>'),
    "xl/_rels/workbook.xml.rels": strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'),
    "xl/worksheets/sheet1.xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheet}</sheetData></worksheet>`),
  };
  return Buffer.from(zipSync(files, { level: 6 }));
}

const printable = (value, max = 34) => String(value ?? "").replace(/[\r\n\t]+/g, " ").slice(0, max);

export function createPdfArtifact({ report, rows, generatedAt = new Date() }) {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({ size: "A4", layout: "landscape", margin: 36, info: { Title: `Nalanda ${report.reportType} report`, Author: "Nalanda" } });
    const chunks = [];
    document.on("data", (chunk) => chunks.push(chunk));
    document.on("error", reject);
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.fontSize(16).text(`Nalanda ${report.reportType} report`);
    document.fontSize(8).fillColor("#444").text(`Report ${report.id} | Generated ${generatedAt.toISOString()} | Rows ${rows.length}`);
    document.moveDown().fillColor("#000");
    rows.forEach((row, index) => {
      if (document.y > 540) document.addPage({ size: "A4", layout: "landscape", margin: 36 });
      document.fontSize(7).text([
        `${index + 1}. ${printable(row.employeeName)} (${printable(row.userId, 20)})`,
        `${printable(row.courseTitle)} (${printable(row.courseId, 20)})`,
        `team=${printable(row.team, 18)} dept=${printable(row.department, 18)}`,
        `progress=${Number(row.progress || 0)}% chapter=${Number(row.chapterTimeSeconds || 0)}s assessment=${Number(row.assessmentTimeSeconds || 0)}s course=${Number(row.courseTimeSeconds || 0)}s`,
      ].join(" | "), { width: 770 });
    });
    if (!rows.length) document.fontSize(9).text("No rows matched the authorized report scope.");
    document.end();
  });
}

export async function createReportArtifact({ report, rows }) {
  if (report.format === "PDF") {
    return { buffer: await createPdfArtifact({ report, rows }), extension: "pdf", contentType: "application/pdf" };
  }
  if (report.format === "Excel") {
    return { buffer: createXlsxArtifact(rows), extension: "xlsx", contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
  }
  throw new TypeError("Unsupported report format");
}
