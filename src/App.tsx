import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import SchemaTree from "./components/SchemaTree";
import SqlEditor from "./components/SqlEditor";
import ResultsGrid from "./components/ResultsGrid";
import { openDatabase, Schema } from "./lib/schema";
import { runQuery, QueryResult } from "./lib/query";
import "./App.css";

interface SavedQuery {
  name: string;
  sql: string;
}

const RECENT_FILES_KEY = "vse:recentFiles";
const SAVED_QUERIES_KEY = "vse:savedQueries";

function App() {
  const [status, setStatus] = useState<string>("No file selected");
  const [schema, setSchema] = useState<Schema | null>(null);
  const [selected, setSelected] = useState<unknown>(null);
  const [sql, setSql] = useState<string>("");
  const [db, setDb] = useState<Database | null>(null);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [queryName, setQueryName] = useState<string>("");

  useEffect(() => {
    try {
      const savedFiles = localStorage.getItem(RECENT_FILES_KEY);
      if (savedFiles) setRecentFiles(JSON.parse(savedFiles));
      const saved = localStorage.getItem(SAVED_QUERIES_KEY);
      if (saved) setSavedQueries(JSON.parse(saved));
    } catch {
      // ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(recentFiles));
  }, [recentFiles]);

  useEffect(() => {
    localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(savedQueries));
  }, [savedQueries]);

  async function loadAndOpen(path: string) {
    setStatus("Loading: " + path);
    setRecentFiles((prev) =>
      [path, ...prev.filter((p) => p !== path)].slice(0, 10)
    );

    try {
      if (db) {
        await db.close();
      }
      const { db: newDb, schema: s } = await openDatabase(path);
      setDb(newDb);
      setSchema(s);
      setStatus("Loaded: " + path);
      setSql("SELECT * FROM " + (s.tables[0]?.name ?? "") + " LIMIT 10;");
      setSelected(null);
      setResult(null);
      setError(null);
    } catch (e) {
      setStatus("Error: " + String(e));
      setDb(null);
      setSchema(null);
      setSql("");
      setResult(null);
      setError(null);
    }
  }

  async function openFile() {
    const path = await invoke<string | null>("pick_file");
    if (!path) {
      setStatus("No file selected");
      return;
    }
    await loadAndOpen(path);
  }

  async function openRecentFile(path: string) {
    await loadAndOpen(path);
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

  function saveQuery() {
    const name = queryName.trim();
    if (!name || !sql.trim()) return;
    setSavedQueries((prev) =>
      [{ name, sql }, ...prev.filter((q) => q.name !== name)].slice(0, 20)
    );
    setQueryName("");
  }

  function basename(path: string): string {
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1] || path;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Visual SQLite Explorer</h1>
        <button onClick={openFile}>Open SQLite File</button>
        <p>{status}</p>
        {schema && <SchemaTree schema={schema} onSelect={setSelected} />}

        <h2 className="sidebar-section">Recent files</h2>
        <ul className="sidebar-list">
          {recentFiles.map((path) => (
            <li key={path} onClick={() => openRecentFile(path)}>
              {basename(path)}
            </li>
          ))}
          {recentFiles.length === 0 && (
            <li className="empty">No recent files</li>
          )}
        </ul>

        <h2 className="sidebar-section">Saved queries</h2>
        <ul className="sidebar-list">
          {savedQueries.map((q) => (
            <li key={q.name} onClick={() => setSql(q.sql)}>
              {q.name}
            </li>
          ))}
          {savedQueries.length === 0 && (
            <li className="empty">No saved queries</li>
          )}
        </ul>
        <div className="save-query">
          <input
            type="text"
            placeholder="Query name"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
          />
          <button onClick={saveQuery}>Save</button>
        </div>
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
