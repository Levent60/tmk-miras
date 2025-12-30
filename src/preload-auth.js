const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('auth', {
  check: async (password) => {
    try {
      const res = await ipcRenderer.invoke('auth:check', password);
      return res;
    } catch (e) {
      return { ok: false, message: e?.message || 'Hata' };
    }
  },
  trialInfo: async () => {
    try { return await ipcRenderer.invoke('trial:info'); } catch { return { daysElapsed: 0 }; }
  },
  activateLicense: async (licenseString) => {
    try { return await ipcRenderer.invoke('license:activate', licenseString); }
    catch (e) { return { ok: false, message: e?.message || 'Hata' }; }
  }
});
