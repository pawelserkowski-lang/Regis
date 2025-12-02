import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";

const isDev = !!process.env.VITE_DEV_SERVER_URL;
const dist = path.join(__dirname, "../dist");
const preload = path.join(__dirname, "../dist-electron/preload.js");

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1500, height: 960,
    backgroundColor: "#050a0f",
    show: false,
    webPreferences: { preload, contextIsolation: true, nodeIntegration: false }
  });
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
      win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
      win.loadFile(path.join(dist, "index.html"));
  }
  win.once("ready-to-show", () => win?.show());
  if (isDev) win.webContents.openDevTools({ mode: "detach" });
}

app.whenReady().then(createWindow);

// Helper to find GEMINI.md
const getProtocolPath = () => {
  const candidates = [
    path.join(process.cwd(), "GEMINI.md"),
    path.join(__dirname, "../../GEMINI.md")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  // Default to cwd if not found (will be created on save)
  return path.join(process.cwd(), "GEMINI.md");
};

// Helper to get history directory
const getHistoryDir = () => {
  const historyDir = path.join(process.cwd(), "history");
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir);
  }
  return historyDir;
};

ipcMain.handle("protocol:read", async () => {
  const p = getProtocolPath();
  if (fs.existsSync(p)) return await fs.promises.readFile(p, "utf-8");
  return "# PROTOCOL NOT FOUND";
});

ipcMain.handle("protocol:save", async (_, content) => {
  const p = getProtocolPath();
  await fs.promises.writeFile(p, content);

  // Save to history
  try {
    const historyDir = getHistoryDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const historyPath = path.join(historyDir, `chat_${timestamp}.md`);
    await fs.promises.writeFile(historyPath, content);
  } catch (err) {
    console.error("Failed to save history:", err);
  }

  return true;
});

ipcMain.handle("history:list", async () => {
  try {
    const historyDir = getHistoryDir();
    const files = await fs.promises.readdir(historyDir);
    // Filter for .md files and sort reverse (newest first)
    return files
      .filter(f => f.endsWith(".md"))
      .sort()
      .reverse();
  } catch (e) {
    return [];
  }
});

ipcMain.handle("history:read", async (_, filename) => {
  try {
    const historyDir = getHistoryDir();
    // Basic security check to prevent directory traversal
    const safeFilename = path.basename(filename);
    const p = path.join(historyDir, safeFilename);
    if (fs.existsSync(p)) {
      return await fs.promises.readFile(p, "utf-8");
    }
  } catch (e) {
    console.error("Error reading history file:", e);
  }
  return "# HISTORY LOAD ERROR";
});
