const { contextBridge, ipcRenderer } = require("electron");
const exportModule = require("./export.js");

console.log("PRELOAD ÇALIŞTI, EXPORT YÜKLENDİ");

// Export fonksiyonlarını ipcRenderer ile başlat
const exportFuncs = exportModule(ipcRenderer);

contextBridge.exposeInMainWorld("api", {
  exportAvukatPDF: exportFuncs.exportAvukatPDF,
  exportEdevletPDF: exportFuncs.exportEdevletPDF,
  exportExcel: exportFuncs.exportExcel,
  ipcRenderer: ipcRenderer
});
