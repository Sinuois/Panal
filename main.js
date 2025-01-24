const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("index.html");

  // Maximiza la ventana después de cargar el archivo
  mainWindow.maximize();
}

// Manejar el diálogo de mensaje
ipcMain.handle("show-message-box", async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options); // Cambia ventana por mainWindow
  return result;
});

// Manejar el diálogo de confirmación
ipcMain.handle("show-confirm-dialog", async (event, message) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: "question",
    buttons: ["Sí", "No"],
    defaultId: 1,
    title: "Confirmación",
    message: message,
  });
  return result.response === 0; // Retorna 'true' si 'Sí' fue seleccionado, 'false' si 'No'
});

ipcMain.on("asegurar-archivo", (event, archivo) => {
  if (!fs.existsSync(archivo)) {
    fs.writeFileSync(archivo, JSON.stringify([], null, 2), "utf8");
    console.log(`Archivo creado: ${archivo}`);
  }
});

// Escuchar el evento de agregar proyecto
ipcMain.on("agregar-proyecto", (event, nuevoProyecto) => {
  fs.readFile("proyectos.json", (err, data) => {
    if (err) {
      console.error("Error al leer proyectos.json:", err);
      return;
    }

    let proyectos = [];
    if (data.length > 0) {
      proyectos = JSON.parse(data);
    }

    // Agregar el nuevo proyecto al array
    proyectos.push(nuevoProyecto);

    // Escribir de nuevo el archivo proyectos.json con el nuevo proyecto agregado
    fs.writeFile(
      "proyectos.json",
      JSON.stringify(proyectos, null, 2),
      (err) => {
        if (err) {
          console.error("Error al guardar proyectos.json:", err);
          return;
        }
        console.log("Nuevo proyecto agregado exitosamente.");
      }
    );
  });
});

// Escuchar el evento de guardar inventario
ipcMain.on("guardar-inventario", (event, productosConNuevo) => {
  fs.readFile("inventario.json", (err, data) => {
    if (err) {
      console.error("Error al leer inventario.json:", err);
      return;
    }

    // Escribir de nuevo el archivo inventario.json con el nuevo producto agregado
    fs.writeFile(
      "inventario.json",
      JSON.stringify(productosConNuevo, null, 2),
      (err) => {
        if (err) {
          console.error("Error al guardar inventario.json:", err);
          return;
        }
        console.log("Inventario guardado exitosamente.");
      }
    );
  });
});

// Escuchar el evento de actualizar proyecto
ipcMain.on("actualizar-proyecto", (event, proyectoActual) => {
  fs.readFile("proyectos.json", (err, data) => {
    if (err) {
      console.error("Error al leer proyectos.json:", err);
      return;
    }
    // Leer el archivo de proyectos
    let proyectos = JSON.parse(data);
    // Buscar el índice del proyecto a actualizar por nombre
    const index = proyectos.findIndex(
      (p) => p.nombre === proyectoActual.nombre
    );
    if (index === -1) {
      console.error(
        "No se encontró un proyecto con el nombre:",
        proyectoActual.nombre
      );
      return;
    }
    // Actualizar el proyecto
    proyectos[index] = proyectoActual;

    // Guardar el archivo con el proyecto actualizado
    fs.writeFile(
      "proyectos.json",
      JSON.stringify(proyectos, null, 2),
      (err) => {
        if (err) {
          console.error("Error al guardar proyectos.json:", err);
          return;
        }
        console.log(
          `Proyecto "${proyectoActual.nombre}" actualizado exitosamente.`
        );
      }
    );
  });
});

// Escuchar el evento de eliminar proyecto
ipcMain.on("eliminar-proyecto", (event, proyectoActual) => {
  fs.readFile("proyectos.json", (err, data) => {
    if (err) {
      console.error("Error al leer proyectos.json:", err);
      return;
    }
    // Leer el archivo de proyectos
    let proyectos = JSON.parse(data);
    // Buscar el índice del proyecto a eliminar por nombre
    const index = proyectos.findIndex(
      (p) => p.nombre === proyectoActual.nombre
    );
    if (index === -1) {
      console.error(
        "No se encontró un proyecto con el nombre:",
        proyectoActual.nombre
      );
      return;
    }
    // Eliminar el proyecto
    proyectos.splice(index, 1);

    // Guardar el archivo con el proyecto eliminado
    fs.writeFile(
      "proyectos.json",
      JSON.stringify(proyectos, null, 2),
      (err) => {
        if (err) {
          console.error("Error al guardar proyectos.json:", err);
          return;
        }
        console.log(
          `Proyecto "${proyectoActual.nombre}" eliminado exitosamente.`
        );
      }
    );
  });
});

ipcMain.on("generar-excel-resumen", (event) => {
  fs.readFile(path.join(__dirname, "proyectos.json"), "utf8", (err, data) => {
    if (err) {
      console.error("Error al leer proyectos.json:", err);
      event.reply("excel-error");
      return;
    }

    const proyectos = JSON.parse(data);
    const workbook = new ExcelJS.Workbook();

    proyectos.forEach((proyecto) => {
      const worksheet = workbook.addWorksheet(proyecto.nombre);

      // Estilos personalizados
      const tituloStyle = {
        font: { bold: true, size: 14, color: { argb: "FFFFFFFF" } },
        alignment: { vertical: "middle", horizontal: "center" },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E8B57" } }, // Verde oscuro
      };

      const cantidadStyle = {
        font: { bold: true, size: 12, color: { argb: "FFFFFFFF" } },
        alignment: { vertical: "middle", horizontal: "center" },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4682B4" } }, // Azul acero
      };

      const encabezadoStyle = {
        font: { bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF8B0000" } }, // Rojo oscuro
        alignment: { vertical: "middle", horizontal: "center" },
      };

      // Fila: Título del proyecto
      const tituloRow = worksheet.getRow(1);
      tituloRow.getCell(1).value = `Proyecto: ${proyecto.nombre}`;
      worksheet.mergeCells(1, 1, 1, 3);
      tituloRow.getCell(1).style = tituloStyle;
      tituloRow.commit();

      // Fila: Cantidad de productos
      const cantidadRow = worksheet.getRow(2);
      cantidadRow.getCell(1).value = `Cantidad de elementos de inventario: ${proyecto.productos.length}`;
      worksheet.mergeCells(2, 1, 2, 3);
      cantidadRow.getCell(1).style = cantidadStyle;
      cantidadRow.commit();

      // Espacio antes de la tabla
      worksheet.addRow([]);

      // Encabezados de la tabla
      const headers = ["Item", "Modelo", "Marca"];
      const headerRow = worksheet.addRow(headers);

      // Aplicar estilo a los encabezados
      headerRow.eachCell((cell) => (cell.style = encabezadoStyle));

      // Agregar los productos a la tabla
      proyecto.productos.forEach((producto) => {
        worksheet.addRow([producto.item, producto.modelo, producto.marca]);
      });

      // Ajustar el ancho de las columnas al final
      worksheet.getColumn(1).width = 40; // Ancho para la columna "Item"
      worksheet.getColumn(2).width = 40; // Ancho para la columna "Modelo"
      worksheet.getColumn(3).width = 40; // Ancho para la columna "Marca"
    });

    const archivoExcel = path.join(__dirname, "Detalle de proyectos.xlsx");
    workbook.xlsx
      .writeFile(archivoExcel)
      .then(() => {
        console.log("Excel generado exitosamente");
        event.reply("excel-generado");
      })
      .catch((error) => {
        console.error("Error al generar el Excel:", error);
        event.reply("excel-error");
      });
  });
});







app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
