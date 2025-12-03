import { spawn, type ChildProcess } from 'node:child_process';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';

const skipElectron = process.env.SKIP_ELECTRON === '1' || process.env.SKIP_ELECTRON === 'true';
let electronProcess: ChildProcess | null = null;
let electronLaunchFailed = false;

const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';

function launchElectron() {
  if (skipElectron || electronProcess || electronLaunchFailed) return;

  let electronPath: string;
  try {
    electronPath = (require('electron') as unknown) as string;
  } catch (error) {
    electronLaunchFailed = true;
    console.error(
      `Electron dependency is missing or failed to resolve. UI is still available at ${devServerUrl}.`
    );
    console.error(error);
    console.info('Set SKIP_ELECTRON=1 to suppress Electron auto-launch while using the browser preview.');
    console.info('Alternatively, run `npm run dev:web` to start the renderer without Electron.');
    return;
  }

  const child = spawn(electronPath, ['--no-sandbox', '.'], { stdio: 'inherit' });

  electronProcess = child;
  child.on('error', (error) => {
    electronProcess = null;
    electronLaunchFailed = true;
    console.error(`Electron failed to start. UI is still available at ${devServerUrl}.`);
    console.error(error);
    console.info('Set SKIP_ELECTRON=1 to suppress Electron auto-launch while using the browser preview.');
  });
  child.on('exit', (code, signal) => {
    electronProcess = null;
    if (code !== 0) {
      electronLaunchFailed = true;
      console.error(
        `Electron exited with code ${code ?? 'unknown'}${signal ? ` (signal: ${signal})` : ''}. UI is still available at ${devServerUrl}.`
      );
      console.info('Set SKIP_ELECTRON=1 to suppress Electron auto-launch while using the browser preview.');
    }
  });
}

process.on('exit', () => {
  electronProcess?.kill();
});

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    electron({
      main: {
        entry: "electron/main.ts",
        onstart() {
          if (skipElectron) {
            console.info(`Skipping Electron launch. Open the renderer at ${devServerUrl}.`);
            return;
          }

          launchElectron();
        }
      },
      preload: { input: "electron/preload.ts" }
    })
  ]
});
