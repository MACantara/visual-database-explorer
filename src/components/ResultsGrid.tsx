import { useMemo, useState } from "react";
import { downloadCsv } from "../lib/csv";

interface ResultsGridProps {
  columns: string[];
  rows: Record<string, unknown>[];
}

type SortDirection = "asc" | "desc" | null;

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  const sa = String(a);
  const sb = String(b);
  return sa.localeCompare(sb);
}

export default function ResultsGrid({ columns, rows }: ResultsGridProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  function handleSort(column: string) {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortColumn(null);
      setSortDirection(null);
    }
  }

  const sortedRows = useMemo(() => {
    if (!sortColumn || !sortDirection) return rows;
    const sorted = [...rows];
    sorted.sort((a, b) => {
      const result = compareValues(a[sortColumn], b[sortColumn]);
      return sortDirection === "asc" ? result : -result;
    });
    return sorted;
  }, [rows, sortColumn, sortDirection]);

  if (rows.length === 0) {
    return <p className="results-empty">No rows returned.</p>;
  }

  return (
    <div className="results-grid">
      <div className="results-header">
        <h3>Results ({rows.length})</h3>
        <button onClick={() => downloadCsv("export.csv", columns, rows)}>
          Export CSV
        </button>
      </div>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                onClick={() => handleSort(col)}
                className={
                  sortColumn === col
                    ? `sorted-${sortDirection === "asc" ? "asc" : "desc"}`
                    : ""
                }
              >
                {col}
                {sortColumn === col && (sortDirection === "asc" ? " ^" : " v")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col}>{String(row[col] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
