"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? "";
const isDev = devServerUrl !== "";
const isMac = process.platform === "darwin";
const dist = path.join(__dirname, "../dist");
const preload = path.join(__dirname, "../dist-electron/preload.js");
const protocolPath = path.join(process.cwd(), "GEMINI.md");
const statusPath = path.join(process.cwd(), "status_report.json");
function createWindow() {
  const window = new electron.BrowserWindow({
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
  });
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
    else electron.BrowserWindow.getAllWindows()[0].focus();
  });
});
electron.app.on("window-all-closed", () => {
  if (!isMac) electron.app.quit();
});
electron.ipcMain.handle("protocol:read", async () => {
  const candidates = [
    protocolPath,
    path.join(__dirname, "../../GEMINI.md"),
    path.join(process.cwd(), "../GEMINI.md")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return await fs.promises.readFile(p, "utf-8");
  }
  return "# PROTOCOL NOT FOUND";
});
electron.ipcMain.handle("protocol:save", async (_, content) => {
  const rootPath = path.join(process.cwd(), "../GEMINI.md");
  if (fs.existsSync(rootPath)) {
    await fs.promises.writeFile(rootPath, content, "utf-8");
    return true;
  }
  await fs.promises.writeFile(protocolPath, content, "utf-8");
  return true;
});
electron.ipcMain.handle("agent:status", async () => {
  const candidates = [
    statusPath,
    path.join(__dirname, "../../status_report.json"),
    path.join(process.cwd(), "../status_report.json")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return await fs.promises.readFile(p, "utf-8");
  }
  return JSON.stringify({ status: "Offline", error: "No status report found" });
});
electron.ipcMain.handle("jules:run", async (_, { context, file }) => {
  const scriptPath = path.join(process.cwd(), "jules_cli.py");
  console.log("Spawning Jules:", scriptPath, "with file:", file);
  const pythonProcess = child_process.spawn("python", [
    scriptPath,
    "--command",
    "analyze",
    ...file ? ["--file", file] : [],
    ...context ? ["--context", context] : []
  ]);
  pythonProcess.stdout.on("data", (data) => {
    console.log(`Jules Output: ${data}`);
  });
  pythonProcess.stderr.on("data", (data) => {
    console.error(`Jules Error: ${data}`);
  });
  return { success: true, pid: pythonProcess.pid };
});
