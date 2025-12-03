import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("api", {
  readProtocol: () => ipcRenderer.invoke("protocol:read"),
  saveProtocol: (c: string) => ipcRenderer.invoke("protocol:save", c),
  startJulesTask: (payload: { repoName: string, taskDescription: string }) => ipcRenderer.invoke("jules:start-task", payload),
});
