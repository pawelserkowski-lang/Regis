"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  readProtocol: () => electron.ipcRenderer.invoke("protocol:read"),
  saveProtocol: (c) => electron.ipcRenderer.invoke("protocol:save", c),
  readAgentStatus: () => electron.ipcRenderer.invoke("agent:status"),
  runJules: (payload) => electron.ipcRenderer.invoke("jules:run", payload)
});
