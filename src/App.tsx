import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { introspectSchema, Schema } from "./lib/schema";
import "./App.css";

function App() {
  const [status, setStatus] = useState<string>("No file selected");
  const [schema, setSchema] = useState<Schema | null>(null);

  async function openFile() {
    const path = await invoke<string | null>("pick_file");
    if (!path) {
      setStatus("No file selected");
      setSchema(null);
      return;
    }

    setStatus("Loading: " + path);
    try {
      const s = await introspectSchema(path);
      setStatus("Loaded: " + path);
      setSchema(s);
    } catch (e) {
      setStatus("Error: " + String(e));
      setSchema(null);
    }
  }

  return (
    <main className="container">
      <h1>Visual SQLite Explorer</h1>
      <button onClick={openFile}>Open SQLite File</button>
      <p>{status}</p>
      {schema && <pre>{JSON.stringify(schema, null, 2)}</pre>}
    </main>
  );
}

export default App;
