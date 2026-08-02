import Database from "@tauri-apps/plugin-sql";

export interface Column {
  name: string;
  type: string;
  notnull: boolean;
  dflt_value: string | null;
  pk: number;
}

export interface Index {
  name: string;
  columns: string[];
  unique: boolean;
}

export interface ForeignKey {
  from: string;
  to: string;
  table: string;
}

export interface Table {
  name: string;
  columns: Column[];
  indexes: Index[];
  foreignKeys: ForeignKey[];
}

export interface Schema {
  tables: Table[];
}

function quoteSqlString(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

export async function introspectSchema(path: string): Promise<Schema> {
  const db = await Database.load("sqlite:" + path);
  try {
    const tableRows = await db.select<Record<string, any>[]>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );

    const tables: Table[] = [];
    for (const row of tableRows) {
      const table = row.name as string;

      const colRows = await db.select<Record<string, any>[]>(
        `PRAGMA table_info(${quoteSqlString(table)})`
      );

      const idxRows = await db.select<Record<string, any>[]>(
        `PRAGMA index_list(${quoteSqlString(table)})`
      );

      const indexes: Index[] = [];
      for (const idx of idxRows) {
        const name = idx.name as string;
        const infoRows = await db.select<Record<string, any>[]>(
          `PRAGMA index_info(${quoteSqlString(name)})`
        );
        indexes.push({
          name,
          unique: idx.unique === 1,
          columns: infoRows.map((r) => r.name as string).filter(Boolean),
        });
      }

      const fkRows = await db.select<Record<string, any>[]>(
        `PRAGMA foreign_key_list(${quoteSqlString(table)})`
      );

      tables.push({
        name: table,
        columns: colRows.map((c) => ({
          name: c.name as string,
          type: (c.type as string) ?? "UNKNOWN",
          notnull: c.notnull === 1,
          dflt_value: c.dflt_value !== undefined ? String(c.dflt_value) : null,
          pk: (c.pk as number) ?? 0,
        })),
        indexes,
        foreignKeys: fkRows.map((f) => ({
          from: f.from as string,
          to: f.to as string,
          table: f.table as string,
        })),
      });
    }

    return { tables };
  } finally {
    await db.close();
  }
}
