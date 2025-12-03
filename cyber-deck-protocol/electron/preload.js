import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("api", {
    readProtocol: () => ipcRenderer.invoke("protocol:read"),
    saveProtocol: (c) => ipcRenderer.invoke("protocol:save", c)
});
