import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import SchemaTree from "./components/SchemaTree";
import SqlEditor from "./components/SqlEditor";
import ResultsGrid from "./components/ResultsGrid";
import { openDatabase, Schema } from "./lib/schema";
import { runQuery, QueryResult } from "./lib/query";
import "./App.css";

function App() {
  const [status, setStatus] = useState<string>("No file selected");
  const [schema, setSchema] = useState<Schema | null>(null);
  const [selected, setSelected] = useState<unknown>(null);
  const [sql, setSql] = useState<string>("");
  const [db, setDb] = useState<Database | null>(null);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openFile() {
    const path = await invoke<string | null>("pick_file");
    if (!path) {
      setStatus("No file selected");
      setSchema(null);
      setSelected(null);
      setSql("");
      setDb(null);
      setResult(null);
      setError(null);
      return;
    }

    setStatus("Loading: " + path);
    try {
      if (db) {
        await db.close();
      }
      const { db: newDb, schema: s } = await openDatabase(path);
      setDb(newDb);
      setSchema(s);
      setStatus("Loaded: " + path);
      setSql("SELECT * FROM " + s.tables[0]?.name + " LIMIT 10;");
      setSelected(null);
      setResult(null);
      setError(null);
    } catch (e) {
      setStatus("Error: " + String(e));
      setDb(null);
      setSchema(null);
      setSelected(null);
      setSql("");
      setResult(null);
      setError(null);
    }
  }

  async function handleRun() {
    if (!db || !sql.trim()) return;
    try {
      const r = await runQuery(db, sql);
      setResult(r);
      setError(null);
    } catch (e) {
      setError(String(e));
      setResult(null);
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
        {schema && (
          <>
            <SqlEditor
              schema={schema}
              value={sql}
              onChange={(value) => setSql(value)}
            />
            <button onClick={handleRun} className="run-button">
              Run
            </button>
          </>
        )}
        {error && <p className="error">{error}</p>}
        {result && <ResultsGrid columns={result.columns} rows={result.rows} />}
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
