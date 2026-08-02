import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { schemaToCodeMirror } from "../lib/autocomplete";
import type { Schema } from "../lib/schema";

interface SqlEditorProps {
  schema: Schema | null;
  value: string;
  onChange: (value: string) => void;
}

export default function SqlEditor({ schema, value, onChange }: SqlEditorProps) {
  const cmSchema = schemaToCodeMirror(schema);
  const extensions = [sql({ schema: cmSchema, upperCaseKeywords: true })];

  return (
    <CodeMirror
      value={value}
      height="300px"
      className="sql-editor"
      extensions={extensions}
      onChange={onChange}
    />
  );
}
