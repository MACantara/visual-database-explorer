import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import SchemaTree from "./components/SchemaTree";
import SqlEditor from "./components/SqlEditor";
import { introspectSchema, Schema } from "./lib/schema";
import "./App.css";

function App() {
  const [status, setStatus] = useState<string>("No file selected");
  const [schema, setSchema] = useState<Schema | null>(null);
  const [selected, setSelected] = useState<unknown>(null);
  const [sql, setSql] = useState<string>("SELECT * FROM data LIMIT 10;");

  async function openFile() {
    const path = await invoke<string | null>("pick_file");
    if (!path) {
      setStatus("No file selected");
      setSchema(null);
      setSelected(null);
      setSql("");
      return;
    }

    setStatus("Loading: " + path);
    try {
      const s = await introspectSchema(path);
      setStatus("Loaded: " + path);
      setSchema(s);
      setSelected(null);
      setSql("SELECT * FROM " + s.tables[0]?.name + " LIMIT 10;");
    } catch (e) {
      setStatus("Error: " + String(e));
      setSchema(null);
      setSelected(null);
      setSql("");
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Visual SQLite Explorer</h1>
        <button onClick={openFile}>Open SQLite File</button>
        <p>{status}</p>
        {schema && <SchemaTree schema={schema} onSelect={setSelected} />}
      </aside>
      <main className="detail">
        <SqlEditor schema={schema} value={sql} onChange={setSql} />
        {selected ? (
          <pre>{JSON.stringify(selected, null, 2)}</pre>
        ) : (
          <p>Click a schema node for details</p>
        )}
      </main>
    </div>
  );
}

export default App;
