const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

// Leer inventario desde inventario.json
ipcMain.on('obtener-productos', (event) => {
  fs.readFile('inventario.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer inventario.json:', err);
      return;
    }

    const productos = JSON.parse(data);
    event.reply('productos-recibidos', productos);  // Enviar productos al frontend
  });
});

// Escuchar el evento de agregar proyecto
ipcMain.on('agregar-proyecto', (event, nuevoProyecto) => {
  fs.readFile('proyectos.json', (err, data) => {
    if (err) {
      console.error('Error al leer proyectos.json:', err);
      return;
    }

    let proyectos = [];
    if (data.length > 0) {
      proyectos = JSON.parse(data);
    }

    // Agregar el nuevo proyecto al array
    proyectos.push(nuevoProyecto);

    // Escribir de nuevo el archivo proyectos.json con el nuevo proyecto agregado
    fs.writeFile('proyectos.json', JSON.stringify(proyectos, null, 2), (err) => {
      if (err) {
        console.error('Error al guardar proyectos.json:', err);
        return;
      }
      console.log('Nuevo proyecto agregado exitosamente.');
    });
  });
});

// Escuchar el evento de agregar proyecto
ipcMain.on('guardar-inventario', (event, productosConNuevo) => {
  fs.readFile('inventario.json', (err, data) => {
    if (err) {
      console.error('Error al leer inventario.json:', err);
      return;
    }

    // Escribir de nuevo el archivo inventario.json con el nuevo producto agregado
    fs.writeFile('inventario.json', JSON.stringify(productosConNuevo, null, 2), (err) => {
      if (err) {
        console.error('Error al guardar inventario.json:', err);
        return;
      }
      console.log('Inventario guardado exitosamente.');
    });
  });
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
