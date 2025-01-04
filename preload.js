const { contextBridge, ipcRenderer } = require('electron');

// Exponer ipcRenderer de forma segura al proceso de renderizado
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, callback) => ipcRenderer.on(channel, callback)
  }
});
