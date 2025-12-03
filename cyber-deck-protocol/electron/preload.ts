import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  readProtocol: () => ipcRenderer.invoke("protocol:read"),
  saveProtocol: (content: string) => ipcRenderer.invoke("protocol:save", content),
  listHistory: () => ipcRenderer.invoke("history:list"),
  readHistory: (filename: string) => ipcRenderer.invoke("history:read", filename),
});
