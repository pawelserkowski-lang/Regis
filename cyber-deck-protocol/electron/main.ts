import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? "";
const isDev = devServerUrl !== "";
const isMac = process.platform === "darwin";
const dist = path.join(__dirname, "../dist");
const preload = path.join(__dirname, "../dist-electron/preload.js");
const protocolPath = path.join(process.cwd(), "GEMINI.md");
const statusPath = path.join(process.cwd(), "status_report.json");

let win: BrowserWindow | null = null;

function createWindow() {
  const window = new BrowserWindow({
    width: 1500,
    height: 960,
    backgroundColor: "#050a0f",
    show: false,
    webPreferences: { preload, contextIsolation: true, nodeIntegration: false }
  });

  if (isDev && devServerUrl) {
    window.loadURL(devServerUrl);
    window.webContents.openDevTools({ mode: "detach" });
  } else {
    window.loadFile(path.join(dist, "index.html"));
  }

  window.once("ready-to-show", () => window.show());
  window.on("closed", () => {
    win = null;
  });

  win = window;
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else BrowserWindow.getAllWindows()[0].focus();
  });
});

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});

ipcMain.handle("protocol:read", async () => {
  const candidates = [
    protocolPath,
    path.join(__dirname, "../../GEMINI.md")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return await fs.promises.readFile(p, "utf-8");
  }
  return "# PROTOCOL NOT FOUND";
});

ipcMain.handle("protocol:save", async (_, content: string) => {
  await fs.promises.writeFile(protocolPath, content, "utf-8");
  return true;
});

ipcMain.handle("agent:status", async () => {
  const candidates = [
    statusPath,
    path.join(__dirname, "../../status_report.json")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return await fs.promises.readFile(p, "utf-8");
  }
  return JSON.stringify({ status: "Offline", error: "No status report found" });
});

ipcMain.handle("jules:run", async (_, { context, file }) => {
  // Determine path to jules_cli.py
  // Assuming repo root is 2 levels up from dist-electron or similar.
  // In dev: process.cwd() is usually repo root.
  // In prod: tricky, but for now we assume process.cwd() works or relative path.

  const scriptPath = path.join(process.cwd(), "jules_cli.py");

  console.log("Spawning Jules:", scriptPath, "with file:", file);

  const pythonProcess = spawn("python", [
    scriptPath,
    "--command", "analyze",
    ...(file ? ["--file", file] : []),
    ...(context ? ["--context", context] : [])
  ]);

  pythonProcess.stdout.on("data", (data) => {
    console.log(`Jules Output: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Jules Error: ${data}`);
  });

  return { success: true, pid: pythonProcess.pid };
});
