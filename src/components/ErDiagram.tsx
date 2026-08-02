import { useEffect, useRef, useState } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import mermaid from "mermaid";

interface ErDiagramProps {
  definition: string;
}

export default function ErDiagram({ definition }: ErDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    mermaid.initialize({ startOnLoad: false });
    const id = `er-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    mermaid
      .render(id, definition)
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      })
      .catch(() => {
        if (!cancelled) setSvg("");
      });
    return () => {
      cancelled = true;
    };
  }, [definition]);

  async function handleSaveSvg() {
    const path = await save({
      defaultPath: "er-diagram.svg",
      filters: [{ name: "SVG", extensions: ["svg"] }],
    });
    if (!path || !svg) return;
    await invoke("save_text", { path, content: svg });
  }

  return (
    <div className="er-diagram">
      <div className="er-diagram-toolbar">
        <button onClick={handleSaveSvg}>Save SVG</button>
      </div>
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
