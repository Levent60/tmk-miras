const crypto = require('crypto');

// PUBLIC_KEY'i .env'den al ve `\n` string'ini gerçek newline'a dönüştür
let PUBLIC_KEY_PEM = process.env.LICENSE_PUBLIC_KEY || `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwK+placeholderkeyKQIDAQAB\n-----END PUBLIC KEY-----`;

// Whitespace'i temizle (başındaki/sonundaki boşluklar, tab'lar)
PUBLIC_KEY_PEM = PUBLIC_KEY_PEM.trim();

// .env'deki tırnak içindeki `\n` string'ini (literal 2 karakter) gerçek newline'a dönüştür
PUBLIC_KEY_PEM = PUBLIC_KEY_PEM.replace(/\\n/g, '\n');

/**
 * Lisans anahtar metnini doğrular.
 * Beklenen format (JSON string):
 * { "licensee": "Firma/Ad", "expiry": "2030-12-31", "sig": "base64" }
 * Sig, RSA-SHA256 ile (licensee + "|" + expiry) concat stringinin imzasıdır.
 */
function verifyLicenseString(licenseString) {
  try {
    if (!licenseString || typeof licenseString !== 'string') {
      return { ok: false, message: 'Lisans anahtarı geçersiz (string değil)' };
    }

    const trimmedString = licenseString.trim();
    if (!trimmedString) {
      return { ok: false, message: 'Lisans anahtarı boş' };
    }

    let obj;
    try {
      obj = JSON.parse(trimmedString);
    } catch (e) {
      return { ok: false, message: 'Lisans formatı geçersiz (JSON parse hatası)' };
    }

    // Zorunlu alanları kontrol et
    if (!obj || typeof obj !== 'object') {
      return { ok: false, message: 'Lisans anahtarı bir nesne değil' };
    }

    if (!obj.licensee || typeof obj.licensee !== 'string') {
      return { ok: false, message: 'Lisans sahibi (licensee) eksik veya geçersiz' };
    }

    if (!obj.expiry || typeof obj.expiry !== 'string') {
      return { ok: false, message: 'Geçerlilik tarihi (expiry) eksik veya geçersiz' };
    }

    if (!obj.sig || typeof obj.sig !== 'string') {
      return { ok: false, message: 'İmza (sig) eksik veya geçersiz' };
    }

    // İmza kontrolü yap
    const data = `${obj.licensee}|${obj.expiry}`;
    
    try {
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(data);
      verifier.end();
      const sigBuffer = Buffer.from(obj.sig, 'base64');
      const ok = verifier.verify(PUBLIC_KEY_PEM, sigBuffer);
      
      if (!ok) {
        return { ok: false, message: 'İmza doğrulaması başarısız (signature mismatch)' };
      }
    } catch (e) {
      return { ok: false, message: `İmza doğrulaması hatası: ${e.message}` };
    }

    // Tarih formatını kontrol et
    const exp = new Date(obj.expiry);
    if (isNaN(exp.getTime())) {
      return { ok: false, message: 'Geçerlilik tarihi geçersiz (YYYY-MM-DD formatında olmalı)' };
    }

    // Lisansın süresi dolmuş mı?
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    exp.setHours(0, 0, 0, 0);
    
    if (today > exp) {
      const expireDate = obj.expiry;
      return { ok: false, message: `Lisans süresi dolmuş (${expireDate})` };
    }

    // Başarı durumu
    const daysLeft = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return { 
      ok: true, 
      licensee: obj.licensee, 
      expiry: obj.expiry,
      daysLeft: daysLeft,
      message: `✅ Lisans başarıyla doğrulandı (${daysLeft} gün geçerli)`
    };

  } catch (e) {
    console.error('🔴 License verification error:', e);
    return { ok: false, message: `Beklenmeyen hata: ${e.message || 'Bilinmeyen hata'}` };
  }
}

module.exports = { verifyLicenseString };
