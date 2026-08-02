import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import SchemaTree from "./components/SchemaTree";
import { introspectSchema, Schema } from "./lib/schema";
import "./App.css";

function App() {
  const [status, setStatus] = useState<string>("No file selected");
  const [schema, setSchema] = useState<Schema | null>(null);
  const [selected, setSelected] = useState<unknown>(null);

  async function openFile() {
    const path = await invoke<string | null>("pick_file");
    if (!path) {
      setStatus("No file selected");
      setSchema(null);
      setSelected(null);
      return;
    }

    setStatus("Loading: " + path);
    try {
      const s = await introspectSchema(path);
      setStatus("Loaded: " + path);
      setSchema(s);
      setSelected(null);
    } catch (e) {
      setStatus("Error: " + String(e));
      setSchema(null);
      setSelected(null);
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
        {selected ? (
          <pre>{JSON.stringify(selected, null, 2)}</pre>
        ) : (
          <p>Select a schema node to see details</p>
        )}
      </main>
    </div>
  );
}

export default App;
