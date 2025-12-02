import { app, BrowserWindow, ipcMain } from "electron";
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

function getProtocolPath() {
  // W wersji dev: katalog projektu (process.cwd() lub obok kodu)
  // W wersji prod: katalog danych użytkownika (userData), aby uniknąć problemów z uprawnieniami/cwd
  if (isDev) {
    return path.join(process.cwd(), "GEMINI.md");
  } else {
    return path.join(app.getPath("userData"), "GEMINI.md");
  }
}

ipcMain.handle("protocol:read", async () => {
  const targetPath = getProtocolPath();

  // Próba odczytu z docelowej ścieżki
  if (fs.existsSync(targetPath)) {
    return await fs.promises.readFile(targetPath, "utf-8");
  }

  // Fallback dla dev (wsteczna kompatybilność/szukanie w źródłach)
  const candidates = [
    path.join(__dirname, "../../GEMINI.md"),
    path.join(process.cwd(), "GEMINI.md")
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return await fs.promises.readFile(p, "utf-8");
  }

  // Jeśli nie ma nigdzie, stwórz domyślny w bezpiecznym miejscu (dla produkcji)
  if (!isDev) {
      const defaultContent = "# CYBERDECK v27.5.1\n\nProtocol initialized.";
      await fs.promises.writeFile(targetPath, defaultContent);
      return defaultContent;
  }

  return "# PROTOCOL NOT FOUND";
});

ipcMain.handle("status:read", async () => {
  // Ścieżka do status_report.json (w root projektu)
  // W dev: ../status_report.json (relatywnie do cyber-deck-protocol)
  // W prod: userData/status_report.json (zakładając że tam trafi)

  let targetPath;
  if (isDev) {
    targetPath = path.join(process.cwd(), "../status_report.json");
  } else {
    targetPath = path.join(app.getPath("userData"), "status_report.json");
  }

  if (fs.existsSync(targetPath)) {
    return await fs.promises.readFile(targetPath, "utf-8");
  }
  return "{}";
});

ipcMain.handle("protocol:save", async (_, content) => {
  const targetPath = getProtocolPath();
  await fs.promises.writeFile(targetPath, content);
  return true;
});
