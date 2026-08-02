import type { Schema } from "./schema";

function sanitizeType(type: string): string {
  return (type || "UNKNOWN").replace(/\s+/g, "_");
}

function isForeignKey(schema: Schema, table: string, column: string): boolean {
  const t = schema.tables.find((t) => t.name === table);
  return t?.foreignKeys.some((fk) => fk.from === column) ?? false;
}

export function schemaToErDiagram(schema: Schema): string {
  const lines = ["erDiagram"];

  for (const table of schema.tables) {
    lines.push(`  ${table.name} {`);
    for (const col of table.columns) {
      const flags: string[] = [];
      if (col.pk > 0) flags.push("PK");
      if (isForeignKey(schema, table.name, col.name)) flags.push("FK");
      const type = sanitizeType(col.type);
      const flagString = flags.length > 0 ? " " + flags.join(" ") : "";
      lines.push(`    ${type} ${col.name}${flagString}`);
    }
    lines.push("  }");
  }

  for (const table of schema.tables) {
    for (const fk of table.foreignKeys) {
      lines.push(
        `  ${table.name} }|--|| ${fk.table} : "${fk.from}"`
      );
    }
  }

  return lines.join("\n");
}
