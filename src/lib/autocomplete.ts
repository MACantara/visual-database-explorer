import type { Schema } from "./schema";

/**
 * Convert the introspected Schema into the shape CodeMirror's
 * SQL language mode expects for schema-aware completion.
 */
export function schemaToCodeMirror(schema: Schema | null): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  if (!schema) return map;

  for (const table of schema.tables) {
    map[table.name] = table.columns.map((col) => col.name);
  }

  return map;
}
