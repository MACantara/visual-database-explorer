import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
import { schemaToCodeMirror } from "../lib/autocomplete";
import type { Schema } from "../lib/schema";

interface SqlEditorProps {
  schema: Schema | null;
  value: string;
  onChange: (value: string) => void;
}

export default function SqlEditor({ schema, value, onChange }: SqlEditorProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const cmSchema = schemaToCodeMirror(schema);
  const extensions = [sql({ schema: cmSchema, upperCaseKeywords: true })];
  if (isDark) {
    extensions.push(oneDark);
  }

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
