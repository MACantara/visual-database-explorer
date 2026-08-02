import Database from "@tauri-apps/plugin-sql";

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
}

function isSelectLike(sql: string): boolean {
  return /^\s*(SELECT|PRAGMA)\b/i.test(sql);
}

export async function runQuery(
  db: Database,
  sql: string
): Promise<QueryResult> {
  const trimmed = sql.trim();
  if (!trimmed) {
    return { columns: [], rows: [] };
  }

  if (isSelectLike(trimmed)) {
    const rows = await db.select<Record<string, any>[]>(trimmed);
    if (rows.length === 0) {
      return { columns: [], rows: [] };
    }
    const columns = Object.keys(rows[0]);
    return { columns, rows };
  } else {
    const result = await db.execute(trimmed);
    return {
      columns: ["Rows affected"],
      rows: [{ "Rows affected": result.rowsAffected }],
    };
  }
}
