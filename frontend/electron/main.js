const { app, BrowserWindow } = require('electron');
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: "REGIS CYBERDECK",
    frame: true,
    autoHideMenuBar: true
  });

  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
  win.loadURL(startUrl);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
