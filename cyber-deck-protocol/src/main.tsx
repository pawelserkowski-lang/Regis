// src/main.ts
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Dla ES modules w Electronie
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'CYBERDECK v27.5.1',
    icon: path.join(__dirname, '../../public/icon.png'), // jeśli masz ikonę
    backgroundColor: '#000',
    show: false, // pokażemy po załadowaniu
    webPreferences: {
      preload: path.join(__dirname, 'preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // potrzebne do fs w preload
      webSecurity: false, // tylko w dev! w produkcji lepiej włączyć
    },
  });

  // W dev: ładuj z Vite, w produkcji: z dist
  if (import.meta.env.DEV) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  // Otwieraj linki zewnętrzne w przeglądarce
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Start aplikacji
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Opcjonalnie: wycisz te głupie warnigi Autofill (jak chcesz ciszę w konsoli)
app.on('ready', () => {
  const originalEmit = process.emit;
  // @ts-ignore
  process.emit = function (name: any, data: any, ...args: any[]) {
    if (
      name === 'warning' &&
      typeof data === 'object' &&
      data.name === 'DeprecationWarning' &&
      data.message.includes('Autofill')
    ) {
      return false;
    }
    // @ts-ignore
    return originalEmit.apply(process, arguments);
  };
});