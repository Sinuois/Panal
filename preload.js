const { contextBridge, ipcRenderer } = require('electron');

// Exponer funciones específicas a la ventana del navegador
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => {
      // Define los canales permitidos
      const validChannels = ['guardar-inventario', 'agregar-proyecto', 'actualizar-proyecto', 'eliminar-proyecto'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    on: (channel, callback) => {
      const validChannels = ['guardar-inventario-exito', 'guardar-inventario-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
      }
    },
    once: (channel, callback) => {
      const validChannels = ['guardar-inventario-exito', 'guardar-inventario-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.once(channel, (event, ...args) => callback(...args));
      }
    },
  },
});
