import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [filePath, setFilePath] = useState<string | null>(null);

  async function openFile() {
    const path = await invoke<string | null>("pick_file");
    setFilePath(path);
  }

  return (
    <main className="container">
      <h1>Visual SQLite Explorer</h1>
      <button onClick={openFile}>Open SQLite File</button>
      {filePath && <p>Selected: {filePath}</p>}
    </main>
  );
}

export default App;
