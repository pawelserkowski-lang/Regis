const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROJECT = "cyber-deck-protocol";
const ROOT = path.join(process.cwd(), PROJECT);

console.log("\nCYBERDECK v27.5.1 — FINAL FIX (fs + Monaco działa)\n");

if (fs.existsSync(ROOT)) fs.rmSync(ROOT, { recursive: true, force: true });
fs.mkdirSync(ROOT, { recursive: true });

const FILES = {
  "package.json": `{
  "name": "${PROJECT}",
  "version": "27.5.1",
  "main": "dist-electron/main.js",
  "scripts": { "dev": "vite", "build": "tsc && vite build && electron-builder" },
  "dependencies": {
    "react": "^18.3.1", "react-dom": "^18.3.1", "react-markdown": "^9.0.1",
    "clsx": "^2.1.1", "tailwind-merge": "^2.5.2",
    "@monaco-editor/react": "^4.6.0", "lucide-react": "^0.447.0"
  },
  "devDependencies": {
    "vite": "^5.4.8", "electron": "^32.1.2", "electron-builder": "^25.1.8",
    "vite-plugin-electron": "^0.29.0", "vite-plugin-electron-renderer": "^0.14.5",
    "typescript": "^5.6.2", "tailwindcss": "^3.4.14", "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20", "@types/react": "^18.3.11", "@vitejs/plugin-react": "^4.3.2"
  }
}`,

  "vite.config.ts": `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
export default defineConfig({
  base: "./",
  plugins: [ react(), electron({
    main: { entry: "electron/main.ts" },
    preload: { input: "electron/preload.ts", output: { filename: "preload.js" } }
  })]
});`,

  "tailwind.config.js": `module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {
    colors: { cyber: { bg: "#050a0f", panel: "#0f172a", primary: "#2dd4bf", accent: "#f59e0b" }},
    boxShadow: { neon: "0 0 30px rgba(45,212,191,0.5)" }
  }}
};`,

  "tsconfig.json": `{"compilerOptions":{"target":"ES2022","lib":["ES2023","DOM","DOM.Iterable"],"module":"ESNext","moduleResolution":"bundler","jsx":"react-jsx","strict":true,"skipLibCheck":true,"noEmit":false,"esModuleInterop":true,"resolveJsonModule":true,"baseUrl":".","paths":{"@/*":["src/*"]}},"include":["src","electron","vite.config.ts"]}`,

  "GEMINI.md": `# CYBERDECK v27.5.1 — ONLINE
**Neural Engine active**
No hallucinations • Live editing • Neon interface

Edytuj ten tekst → naciśnij "Zapisz protokół" → odświeża się automatycznie.

> Ready to jack in, runner?`,

  "electron/main.ts": `import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";  // ← TERAZ JEST!

const isDev = !!process.env.VITE_DEV_SERVER_URL;
const dist = path.join(__dirname, "../dist");
const preload = path.join(__dirname, "../dist-electron/preload.js");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1500, height: 960,
    backgroundColor: "#050a0f",
    show: false,
    webPreferences: { preload, contextIsolation: true, nodeIntegration: false }
  });
  isDev ? win.loadURL(process.env.VITE_DEV_SERVER_URL) : win.loadFile(path.join(dist, "index.html"));
  win.once("ready-to-show", () => win.show());
  if (isDev) win.webContents.openDevTools({ mode: "detach" });
}

app.whenReady().then(createWindow);

ipcMain.handle("protocol:read", async () => {
  const candidates = [
    path.join(process.cwd(), "GEMINI.md"),
    path.join(__dirname, "../../GEMINI.md")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return await fs.promises.readFile(p, "utf-8");
  }
  return "# PROTOCOL NOT FOUND";
});

ipcMain.handle("protocol:save", async (_, content) => {
  await fs.promises.writeFile(path.join(process.cwd(), "GEMINI.md"), content);
  return true;
});
`,

  "electron/preload.ts": `import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("api", {
  readProtocol: () => ipcRenderer.invoke("protocol:read"),
  saveProtocol: (c) => ipcRenderer.invoke("protocol:save", c)
});`,

  "src/components/GlassCard.tsx": `import { twMerge } from "tailwind-merge";
import clsx from "clsx";
export const GlassCard = ({ children, className }) => (
  <div className={twMerge(clsx("bg-cyber-panel/70 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-neon p-8", className))}>
    {children}
  </div>
);`,

  "src/App.tsx": `import React, { useEffect, useState } from "react";
import { GlassCard } from "./components/GlassCard";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { Cpu, Save, Sparkles } from "lucide-react";

export default function App() {
  const [protocol, setProtocol] = useState("Ładowanie protokołu...");
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    window.api.readProtocol().then(setProtocol).catch(() => setProtocol("# Błąd ładowania"));
  }, []);

  const save = () => window.api.saveProtocol(protocol).then(() => setEdit(false));

  return (
    <div className="h-screen w-screen bg-cyber-bg text-white flex">
      <div className="w-1/2 p-8">
        <GlassCard className="h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Cpu className="text-cyber-primary" size={40} />
              <h1 className="text-4xl font-bold text-cyber-primary tracking-widest">CYBERDECK v27.5.1</h1>
            </div>
            <button onClick={() => setEdit(!edit)} className="px-5 py-3 bg-cyber-primary/20 hover:bg-cyber-primary/40 rounded-lg flex items-center gap-2 transition">
              <Sparkles size={22} /> {edit ? "Podgląd" : "Edytuj"}
            </button>
          </div>

          {edit ? (
            <div className="flex-1 flex flex-col">
              <Editor height="100%" defaultLanguage="markdown" value={protocol} onChange={setProtocol}
                theme="vs-dark" options={{ fontSize: 16, minimap: { enabled: false }, wordWrap: "on" }} />
              <button onClick={save} className="mt-4 self-end px-8 py-3 bg-cyber-primary text-black font-bold rounded-lg hover:scale-105 transition flex items-center gap-2">
                <Save size={22} /> Zapisz
              </button>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none overflow-y-auto h-full pb-20 text-lg">
              <ReactMarkdown>{protocol}</ReactMarkdown>
            </div>
          )}
        </GlassCard>
      </div>
      <div className="w-1/2 bg-gradient-to-br from-cyber-primary/5 via-transparent to-cyber-accent/5 flex items-center justify-center">
        <div className="text-cyber-primary/30 text-9xl font-bold select-none">NEON</div>
      </div>
    </div>
  );
}`,

  "src/index.css": `@tailwind base; @tailwind components; @tailwind utilities;
html,body,#root{height:100%;margin:0;overflow:hidden;background:#050a0f}
::-webkit-scrollbar{width:8px}::-webkit-scrollbar-thumb{background:rgba(45,212,191,0.6);border-radius:4px}`,

  "src/main.tsx": `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
createRoot(document.getElementById("root")!).render(<App />);`,

  "index.html": `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CYBERDECK v27.5.1</title></head>
<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`
};

for (const [f, c] of Object.entries(FILES)) {
  const p = path.join(ROOT, f);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, c.trim() + "\n");
  console.log("OK", f);
}

console.log("\nInstalacja zależności...\n");
execSync("npm install", { cwd: ROOT, stdio: "inherit" });
