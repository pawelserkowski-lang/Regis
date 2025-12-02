import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";  // ← TERAZ JEST!

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

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (isDev && devServerUrl) {
    win.loadURL(devServerUrl);
  } else {
    win.loadFile(path.join(dist, "index.html"));
  }

  win.once("ready-to-show", () => win?.show());
  if (isDev) win.webContents.openDevTools({ mode: "detach" });
}

app.whenReady().then(() => {
  console.log('[Main] App ready, creating window...');
  createWindow();
});

function getProtocolPath() {
  // W wersji dev: katalog projektu (process.cwd() lub obok kodu)
  // W wersji prod: katalog danych użytkownika (userData), aby uniknąć problemów z uprawnieniami/cwd
  if (isDev) {
    const devPath = path.join(process.cwd(), "GEMINI.md");
    console.log('[Main] Dev mode detected. Using path:', devPath);
    return devPath;
  } else {
    const prodPath = path.join(app.getPath("userData"), "GEMINI.md");
    console.log('[Main] Production mode. Using userData path:', prodPath);
    return prodPath;
  }
}

ipcMain.handle("protocol:read", async () => {
  try {
    const targetPath = getProtocolPath();
    console.log('[Main] Reading protocol from:', targetPath);

    // Próba odczytu z docelowej ścieżki
    if (fs.existsSync(targetPath)) {
      console.log('[Main] File found at target path.');
      return await fs.promises.readFile(targetPath, "utf-8");
    }

    console.log('[Main] File not found at target path. Checking candidates...');

    // Fallback dla dev (wsteczna kompatybilność/szukanie w źródłach)
    const candidates = [
      path.join(__dirname, "../../GEMINI.md"),
      path.join(process.cwd(), "GEMINI.md")
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        console.log('[Main] File found at candidate path:', p);
        return await fs.promises.readFile(p, "utf-8");
      }
    }

    // Jeśli nie ma nigdzie, stwórz domyślny w bezpiecznym miejscu (dla produkcji)
    if (!isDev) {
        console.log('[Main] Creating default protocol file at:', targetPath);
        const defaultContent = "# CYBERDECK v27.5.1\n\nProtocol initialized.";
        await fs.promises.writeFile(targetPath, defaultContent);
        return defaultContent;
    }

    console.warn('[Main] Protocol file not found anywhere.');
    return "# PROTOCOL NOT FOUND";
  } catch (error) {
    console.error('[Main] Error reading protocol:', error);
    throw error;
  }
});

ipcMain.handle("protocol:save", async (_, content) => {
  try {
    const targetPath = getProtocolPath();
    console.log('[Main] Saving protocol to:', targetPath);
    await fs.promises.writeFile(targetPath, content);
    console.log('[Main] Save successful.');
    return true;
  } catch (error) {
    console.error('[Main] Error saving protocol:', error);
    throw error;
  }
});
