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

ipcMain.handle("ollama:generate", async (_, { prompt, model = "llama3" }) => {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        system: "Jesteś złośliwym, ale zabawnym asystentem w stylu Cyberpunk. Odpowiadaj zawsze po polsku. Twoje odpowiedzi mają być typu 'roast', pełne humoru, sarkazmu i anegdot. Nie bój się dogryzać użytkownikowi."
      })
    });
    if (!response.ok) return { error: `Ollama error: ${response.statusText}` };
    const data = await response.json();
    return { response: data.response };
  } catch (e) {
    return { error: "Brak połączenia z Ollama. Upewnij się, że działa na porcie 11434." };
  }
});
