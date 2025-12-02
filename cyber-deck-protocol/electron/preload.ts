import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("api", {
  readProtocol: () => ipcRenderer.invoke("protocol:read"),
  saveProtocol: (c: string) => ipcRenderer.invoke("protocol:save", c),
  askAI: (provider: string, messages: any[]) => ipcRenderer.invoke("ai:ask", { provider, messages })
});
