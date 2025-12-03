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

ipcMain.handle("agent:status", async () => {
  const candidates = [
    path.join(process.cwd(), "status_report.json"),
    path.join(__dirname, "../../status_report.json"),
    path.join(__dirname, "../../../status_report.json")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return await fs.promises.readFile(p, "utf-8");
  }
  return null;
});

ipcMain.handle("agent:run", async () => {
  return new Promise((resolve, reject) => {
    // Determine where regis.py is
    const candidates = [
      path.join(process.cwd(), "regis.py"),
      path.join(__dirname, "../../regis.py"),
      path.join(__dirname, "../../../regis.py")
    ];

    const scriptPath = candidates.find(p => fs.existsSync(p));
    if (!scriptPath) {
      resolve({ success: false, error: "regis.py not found" });
      return;
    }

    const python = spawn("python", [scriptPath], {
      cwd: path.dirname(scriptPath)
    });

    python.on('close', (code) => {
      resolve({ success: code === 0, code });
    });

    python.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
});
