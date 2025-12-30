const { app, BrowserWindow, ipcMain, dialog } = require("electron");
require('dotenv').config();
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require('electron-updater');
const Sentry = require('@sentry/electron/main');
const { verifyLicenseString } = require('./src/license.js');

function getAppIcon() {
  const candidates = [
    path.join(__dirname, "assets", "icon.ico"),
    path.join(__dirname, "assets", "icon.png"),
    path.join(__dirname, "assets", "icon.svg")
  ];
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch {}
  }
  return null;
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: getAppIcon() || undefined,
    webPreferences: {
      preload: path.join(__dirname, "src", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, "src", "index.html"));
  return win;
}

function createAuthWindow() {
  const authWin = new BrowserWindow({
    width: 420,
    height: 320,
    resizable: false,
    title: 'Giriş',
    icon: getAppIcon() || undefined,
    webPreferences: {
      preload: path.join(__dirname, "src", "preload-auth.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  authWin.loadFile(path.join(__dirname, "src", "lock.html"));
  return authWin;
}

app.whenReady().then(() => {
  // Sentry opsiyonel
  if (process.env.SENTRY_DSN) {
    try { Sentry.init({ dsn: process.env.SENTRY_DSN }); } catch {}
  }

  // Auto-update yalnızca paketli iken ve açık ise
  if (app.isPackaged && process.env.AUTO_UPDATE === '1') {
    try { autoUpdater.checkForUpdatesAndNotify(); } catch {}
  }
  // Deneme süresi 30 gün: userData içindeki license.json'da startDate tutulur
  function getTrialInfo() {
    const licensePath = path.join(app.getPath('userData'), 'license.json');
    try {
      if (!fs.existsSync(licensePath)) {
        const data = { startDate: new Date().toISOString() };
        fs.writeFileSync(licensePath, JSON.stringify(data, null, 2));
        return { startDate: new Date(data.startDate), daysElapsed: 0, path: licensePath };
      }
      const raw = fs.readFileSync(licensePath, 'utf-8');
      const data = JSON.parse(raw);
      const start = new Date(data.startDate);
      const days = Math.floor((Date.now() - start.getTime()) / 86400000);
      return { startDate: start, daysElapsed: days, path: licensePath };
    } catch (e) {
      return { startDate: new Date(), daysElapsed: 0, path: licensePath };
    }
  }

  const { daysElapsed } = getTrialInfo();
  const TRIAL_ENABLED = process.env.TRIAL_ENABLED !== '0'; // Trial açık/kapalı (varsayılan açık)
  const trialActive = TRIAL_ENABLED && daysElapsed <= 30; // 30 gün ücretsiz
  
  console.log('🔐 Sistem Kontrol:', {
    TRIAL_ENABLED,
    daysElapsed,
    trialActive,
    APP_PASSWORD: process.env.APP_PASSWORD ? 'SET' : 'NOT SET'
  });
  const requiredPassword = process.env.APP_PASSWORD || '';
  // Lisans anahtarı kontrolü: userData\license.key varsa doğrula
  const licenseKeyPath = path.join(app.getPath('userData'), 'license.key');
  let licenseValid = false;
  let mainWindow = null;
  let authWin = null;
  
  try {
    if (fs.existsSync(licenseKeyPath)) {
      const keyText = fs.readFileSync(licenseKeyPath, 'utf-8');
      const res = verifyLicenseString(keyText);
      licenseValid = !!(res && res.ok);
    }
  } catch {}

  if (trialActive || licenseValid) {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      icon: getAppIcon() || undefined,
      webPreferences: {
        preload: path.join(__dirname, "src", "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    });
    mainWindow.loadFile(path.join(__dirname, "src", "index.html"));
  }

  // IPC handler: trial bilgisini her zaman gönder
  ipcMain.handle('trial:info', () => ({ daysElapsed }));

  // IPC handler: app'i kilitle (deneme bitince)
  ipcMain.handle('lock:app', async () => {
    if (!authWin) {
      authWin = createAuthWindow();
    }
  });

  // Parola kontrol handler
  ipcMain.handle('auth:check', async (event, entered) => {
    const ok = typeof entered === 'string' && entered === requiredPassword;
    if (ok) {
      if (authWin) authWin.close();
      authWin = null;
      if (!mainWindow) {
        mainWindow = createMainWindow();
      }
      return { ok: true };
    }
    return { ok: false, message: 'Parola geçersiz' };
  });

  // Lisans aktivasyonu
  ipcMain.handle('license:activate', async (event, licenseString) => {
    const res = verifyLicenseString(licenseString);
    
    if (res && res.ok) {
      try {
        fs.writeFileSync(licenseKeyPath, licenseString);
        console.log('✅ Lisans başarıyla kaydedildi:', licenseKeyPath);
      } catch (e) {
        console.error('❌ Lisans kaydedilemiyor:', e.message);
        return { ok: false, message: 'Lisans kaydedilemedi' };
      }
      if (authWin) authWin.close();
      authWin = null;
      if (!mainWindow) {
        mainWindow = createMainWindow();
      }
      return { ok: true, licensee: res.licensee, expiry: res.expiry };
    }
    return { ok: false, message: res?.message || 'Lisans geçersiz' };
  });
  
  // Başlangıçta deneme dolmuşsa auth window'u aç
  if (!trialActive && !licenseValid) {
    authWin = createAuthWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });

  // PDF/Export gibi işlemler için renderer'dan kaydetme diyalogu talebi
  ipcMain.handle('show-save-dialog', async (event, options) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender);
      const result = await dialog.showSaveDialog(win, options || {});
      if (result.canceled) return null;
      return result.filePath || null;
    } catch (e) {
      return null;
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
