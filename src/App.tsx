import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [status, setStatus] = useState<string>("No file selected");

  async function openFile() {
    const path = await invoke<string | null>("pick_file");
    setStatus(path ?? "No file selected");
  }

  return (
    <main className="container">
      <h1>Visual SQLite Explorer</h1>
      <button onClick={openFile}>Open SQLite File</button>
      <p>{status}</p>
    </main>
  );
}

export default App;
