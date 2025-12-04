// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

// Ładujemy nasz krytyczny fix Monaco workerów
import './monaco-config';

// Eksponujemy bezpieczne API do renderera (App.tsx)
contextBridge.exposeInMainWorld('api', {
  readProtocol: (): Promise<string> => ipcRenderer.invoke('protocol:read'),
  saveProtocol: (content: string): Promise<boolean> => ipcRenderer.invoke('protocol:save', content),
  readAgentStatus: (): Promise<string> => ipcRenderer.invoke('agent:status'),
});
