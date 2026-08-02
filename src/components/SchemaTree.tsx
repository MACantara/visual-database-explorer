import type { Schema } from "../lib/schema";

interface SchemaTreeProps {
  schema: Schema;
  onSelect: (item: unknown) => void;
}

export default function SchemaTree({ schema, onSelect }: SchemaTreeProps) {
  return (
    <div className="schema-tree">
      {schema.tables.map((table) => (
        <details key={table.name} className="schema-tree-node">
          <summary onClick={() => onSelect(table)}>{table.name}</summary>
          <div className="schema-tree-children">
            <details>
              <summary onClick={() => onSelect(table.columns)}>
                Columns ({table.columns.length})
              </summary>
              <ul>
                {table.columns.map((col) => (
                  <li key={col.name} onClick={() => onSelect(col)}>
                    {col.name} ({col.type})
                    {col.notnull && " NOT NULL"}
                    {col.pk > 0 && ` PK ${col.pk}`}
                  </li>
                ))}
              </ul>
            </details>
            <details>
              <summary onClick={() => onSelect(table.indexes)}>
                Indexes ({table.indexes.length})
              </summary>
              <ul>
                {table.indexes.map((idx) => (
                  <li key={idx.name} onClick={() => onSelect(idx)}>
                    {idx.name}
                    {idx.unique && " UNIQUE"}
                    {idx.columns.length > 0 && ` (${idx.columns.join(", ")})`}
                  </li>
                ))}
              </ul>
            </details>
            <details>
              <summary onClick={() => onSelect(table.foreignKeys)}>
                Foreign Keys ({table.foreignKeys.length})
              </summary>
              <ul>
                {table.foreignKeys.map((fk, i) => (
                  <li key={i} onClick={() => onSelect(fk)}>
                    {fk.from} &rarr; {fk.table}({fk.to})
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </details>
      ))}
    </div>
  );
}
