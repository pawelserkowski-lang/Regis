import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("api", {
  readProtocol: (filename?: string) => ipcRenderer.invoke("protocol:read", filename),
  saveProtocol: (c: string) => ipcRenderer.invoke("protocol:save", c)
});
