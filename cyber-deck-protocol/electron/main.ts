import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";  // ← TERAZ JEST!
import { JulesClient } from "./src/jules-client";

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

let julesClient: JulesClient | null = null;

app.whenReady().then(async () => {
  createWindow();
  julesClient = new JulesClient();
  try {
    await julesClient.connect();
  } catch (err) {
    console.error("Failed to initialize Jules Client:", err);
  }
});

ipcMain.handle("jules:start-task", async (_, { repoName, taskDescription }) => {
  if (!julesClient) {
    throw new Error("Jules Client not initialized");
  }
  return await julesClient.startTask(repoName, taskDescription);
});

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
