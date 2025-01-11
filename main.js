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

// Escuchar el evento de actualizar proyecto
ipcMain.on('actualizar-proyecto', (event, proyectoActual) => {
  fs.readFile('proyectos.json', (err, data) => {
    if (err) {
      console.error('Error al leer proyectos.json:', err);
      return;
    }
    // Leer el archivo de proyectos
    let proyectos = JSON.parse(data);
    // Buscar el índice del proyecto a actualizar por nombre
    const index = proyectos.findIndex(p => p.nombre === proyectoActual.nombre);
    if (index === -1) {
      console.error('No se encontró un proyecto con el nombre:', proyectoActual.nombre);
      return;
    }
    // Actualizar el proyecto
    proyectos[index] = proyectoActual;

    // Guardar el archivo con el proyecto actualizado
    fs.writeFile('proyectos.json', JSON.stringify(proyectos, null, 2), (err) => {
      if (err) {
        console.error('Error al guardar proyectos.json:', err);
        return;
      }
      console.log(`Proyecto "${proyectoActual.nombre}" actualizado exitosamente.`);
    });
  });
});

ipcMain.on('eliminar-proyecto', (event, proyectoActual) => {
  fs.readFile('proyectos.json', (err, data) => {
    if (err) {
      console.error('Error al leer proyectos.json:', err);
      return;
    }
    // Leer el archivo de proyectos
    let proyectos = JSON.parse(data);
    // Buscar el índice del proyecto a eliminar por nombre
    const index = proyectos.findIndex(p => p.nombre === proyectoActual.nombre);
    if (index === -1) {
      console.error('No se encontró un proyecto con el nombre:', proyectoActual.nombre);
      return;
    }
    // Eliminar el proyecto
    proyectos.splice(index, 1);

    // Guardar el archivo con el proyecto eliminado
    fs.writeFile('proyectos.json', JSON.stringify(proyectos, null, 2), (err) => {
      if (err) {
        console.error('Error al guardar proyectos.json:', err);
        return;
      }
      console.log(`Proyecto "${proyectoActual.nombre}" eliminado exitosamente.`);
    })
  })
})



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
