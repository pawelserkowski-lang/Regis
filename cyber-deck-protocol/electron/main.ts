import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";

const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? "";
const isDev = devServerUrl !== "";
const isMac = process.platform === "darwin";
const dist = path.join(__dirname, "../dist");
const preload = path.join(__dirname, "../dist-electron/preload.js");
const protocolPath = path.join(process.cwd(), "GEMINI.md");

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
