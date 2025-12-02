import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("api", {
  readProtocol: () => ipcRenderer.invoke("protocol:read"),
  saveProtocol: (c: string) => ipcRenderer.invoke("protocol:save", c),
  generateAI: (prompt: string) => ipcRenderer.invoke("ollama:generate", { prompt })
});
