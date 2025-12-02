import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("api", {
  readProtocol: () => ipcRenderer.invoke("protocol:read"),
  saveProtocol: (c: string) => ipcRenderer.invoke("protocol:save", c),
  readAgentStatus: () => ipcRenderer.invoke("agent:status"),
  runAgent: () => ipcRenderer.invoke("agent:run")
});
