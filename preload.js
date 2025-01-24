const { contextBridge, ipcRenderer } = require('electron');

// Exponer funciones específicas a la ventana del navegador
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => {
      const validChannels = ['asegurar-archivo', 'guardar-inventario', 
        'agregar-proyecto', 'actualizar-proyecto', 'eliminar-proyecto', 'generar-excel-resumen'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    on: (channel, callback) => {
      const validChannels = ['guardar-inventario-exito', 'guardar-inventario-error', 'excel-generado', 'excel-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
      }
    },
    once: (channel, callback) => {
      const validChannels = ['guardar-inventario-exito', 'guardar-inventario-error', 'excel-generado', 'excel-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.once(channel, (event, ...args) => callback(...args));
      }
    },
  },
  dialog: {
    showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
    // Exponer la función confirm
    confirm: (message) => ipcRenderer.invoke('show-confirm-dialog', message),
  },
});
