function escapeCsv(value: unknown): string {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(
  columns: string[],
  rows: Record<string, unknown>[]
): string {
  const lines: string[] = [columns.map(escapeCsv).join(",")];
  for (const row of rows) {
    lines.push(columns.map((col) => escapeCsv(row[col])).join(","));
  }
  return lines.join("\n");
}

export function downloadCsv(
  filename: string,
  columns: string[],
  rows: Record<string, unknown>[]
): void {
  const csv = toCsv(columns, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
