# Development & Production Guide

## 📚 Başlangıç

### Test Lisans Anahtarını Kullan

Test için bkz: [LICENSE_KEYS.md](./LICENSE_KEYS.md)

1. Uygulamayı başlat: `npm start`
2. Banner'ı tıkla
3. LICENSE_KEYS.md'deki JSON'ı yapıştır
4. ✅ Aktivasyon başarılı olacak

---

## 🔧 Development Build

### Trial Sürümü (30 gün deneme + Lisans)

```bash
npm run build:trial
```

**Çıktı:** `dist-trial/TKM Miras Hesaplayıcı Setup 3.0.0.exe`

**Özellikleri:**
- ✅ 30 gün deneme süresi
- ✅ Banner ile gün sayısı gösterimi
- ✅ Lisans aktivasyonu modal
- ✅ Trial bitince şifre koruması

---

### Free Sürümü (Lisans gerekli değil)

```bash
npm run build:free
```

**Çıktı:** `dist-free/TKM Miras Hesaplayıcı SERBEST Setup 3.0.0.exe`

**Özellikleri:**
- ✅ Trial banner yok
- ✅ Limitsiz kullanım
- ⚠️ License sistem aktif ama 30 gün koşulu yok

---

## 🔐 RSA License Sistemi

### Key Pair Yapısı

```
PUBLIC KEY (Uygulamada kullanılır)
↓
.env / .env.trial / .env.free → LICENSE_PUBLIC_KEY
↓
src/license.js → verifyLicenseString()

PRIVATE KEY (Server'de saklı)
↓
license-issuance-service
↓
Müşteriye lisans anahtarı dağıt
```

### Test Key Pair (Development)

**Public Key:** `.env` / `.env.trial` / `.env.free` dosyalarında

**Private Key:** `private-key.pem` (repository'de yok, manuel backup alınmış)

### Lisans Anahtarı Format

```javascript
{
  "licensee": "Müşteri Adı",
  "expiry": "2030-12-31",
  "sig": "RSA-SHA256 imzası (base64)"
}
```

---

## 📦 Production Deployment

### 1. Production RSA Key Pair Oluştur

```bash
node create-test-license.js
```

Bu script:
- ✅ Yeni 2048-bit RSA key pair oluşturur
- ✅ Public key'i gösterir (`.env` dosyasına yapıştıracaksın)
- ✅ Private key'i gösterir (güvenli yerde sakla!)

### 2. Environment Dosyalarını Güncelle

```bash
# .env (production'a gidecek)
TRIAL_ENABLED=0
LICENSE_PUBLIC_KEY="<yeni-public-key>"

# .env.trial (trial version'ı için)
TRIAL_ENABLED=1
APP_PASSWORD=4haneli-kod
LICENSE_PUBLIC_KEY="<yeni-public-key>"

# .env.free (free version'ı için)
TRIAL_ENABLED=0
LICENSE_PUBLIC_KEY="<yeni-public-key>"
```

### 3. License Issuance Backend Oluştur

Müşteriye lisans dağıtmak için bir API endpoint'i yap:

```javascript
// POST /api/license/issue
// Body: { licensee, email, days: 365 }
// Response: { license_key: "{ licensee, expiry, sig }" }

const crypto = require('crypto');
const privateKey = fs.readFileSync('private-key.pem', 'utf-8');

function issueLicense(licensee, expiry) {
  const data = `${licensee}|${expiry}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(data);
  signer.end();
  const signature = signer.sign(privateKey, 'base64');
  
  return JSON.stringify({
    licensee,
    expiry,
    sig: signature
  });
}
```

### 4. Code Signing (Windows EXE)

SmartScreen reputation için Windows Code Signing sertifikası gerekir:

#### 4.1 Sertifika Satın Al

- **DigiCert** https://www.digicert.com/code-signing
- **GlobalSign** https://www.globalsign.com/code-signing
- **Sectigo** https://sectigo.com/ssl-certificates/code-signing

Seçilen sertifikayı `.pfx` formatında indir.

#### 4.2 GitHub Secrets'a Ekle

Sertifikayı base64'e dönüştür:

```powershell
# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("certificate.pfx")) | Set-Clipboard
```

GitHub Repository Settings → Secrets → Yeni secret ekle:
- **CSC_LINK**: Base64 certificate content
- **CSC_KEY_PASSWORD**: Sertifika parolası

#### 4.3 package.json'da Yapılandır

```json
"build": {
  "win": {
    "signingHashAlgorithms": ["sha256"],
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "${CSC_KEY_PASSWORD}"
  }
}
```

#### 4.4 Build İşleminde

`.github/workflows/release.yml` dosyasında:

```yaml
- name: Build (Signed)
  env:
    CSC_LINK: ${{ secrets.CSC_LINK }}
    CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
  run: |
    npm run build:trial
    npm run build:free
```

---

## 📡 Sentry.io Hata Takibi (Opsiyonel)

Üretimde hataları izlemek için Sentry.io kullan:

### 1. Sentry Hesabı Oluştur

1. https://sentry.io → Kayıt ol
2. Yeni project oluştur (Electron seç)
3. DSN (Data Source Name) kopyala

### 2. .env Dosyalarına Ekle

```dotenv
# .env (production)
SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id

# .env.trial (trial version)
SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id

# .env.free (free version)
# SENTRY_DSN=  (boş bırak veya kullanma)
```

### 3. GitHub Actions'da

```yaml
env:
  SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
  SENTRY_ORG: your-org
  SENTRY_PROJECT: tkm-miras
```

### 4. Production Build'inde

main.js zaten entegre:

```javascript
if (process.env.SENTRY_DSN) {
  try {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
  } catch (e) {
    console.warn('Sentry init failed:', e);
  }
}
```

Hatalar otomatik olarak Sentry'ye gönderilecek.

### 3. Code Signing (Windows EXE)

`.github/workflows/release.yml` dosyasında:

```yaml
- name: Build & Sign
  env:
    CSC_LINK: ${{ secrets.CSC_LINK }}
    CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
  run: npm run build:trial && npm run build:free

- name: Upload to Release
  uses: softprops/action-gh-release@v1
  with:
    files: |
      dist-trial/*.exe
      dist-free/*.exe
```

---

## 🧪 Test Checklist

### Trial Version
- [ ] 30 gün deneme banner gösteriliyor mu?
- [ ] Banner 25 gün sonra sarı olarak gösteriliyor mu?
- [ ] Banner 5 gün kaldığında kırmızı olarak gösteriliyor mu?
- [ ] 30 gün sonra şifre ekranı çıkıyor mu?
- [ ] Lisans aktivasyonu modalı açılıyor mu?
- [ ] Test lisans anahtarı çalışıyor mu?

### Free Version
- [ ] Banner yok mu?
- [ ] Uygulama sınırsız çalışıyor mu?
- [ ] Lisans aktivasyonu modal var mı?

### Installer
- [ ] Windows defender uyarısı yok mu?
- [ ] EULA doğru gösteriliyor mu?
- [ ] Turkish/English seçimi çalışıyor mu?

---

## 🚨 Troubleshooting

### License Verification Error

```
error:09000064:PEM routines:OPENSSL_internal:BAD_BASE64_DECODE
```

**Çözüm:** .env dosyasındaki `\n` karakterleri gerçek newline'a dönüştür:

```javascript
// src/license.js'de:
PUBLIC_KEY_PEM = PUBLIC_KEY_PEM.replace(/\\n/g, '\n');
```

### License Modal Açılmıyor

1. F12 → Console check et
2. `window.api.ipcRenderer` var mı?
3. Modal CSS `display:flex` var mı?

### License Key Geçerli Değil

1. Tarih geçmiş mi? (Expiry kontrol et)
2. Signature doğru mu? (Private key doğru key'le imzalanmış mı?)
3. Licensee adı doğru yazılı mı?

---

## 📄 Dosya Yapısı

```
.
├── LICENSE_KEYS.md          ← Test lisans anahtarı ve format
├── DEVELOPMENT.md           ← Bu dosya (setup guide)
├── .env                     ← Production env (free version)
├── .env.trial               ← Trial version env
├── .env.free                ← Free version build için
├── private-key.pem          ← ⚠️ GİZLİ (gitignore'da)
├── src/
│   ├── license.js           ← RSA verification
│   ├── ui.js                ← License modal
│   ├── index.html           ← License modal HTML
│   └── ...
├── create-test-license.js   ← Key pair ve test license generator
├── build-free.js            ← Free version build script
└── main.js                  ← IPC handlers (license:activate)
```

---

## 🎯 Next Steps

1. ✅ Test sürümü oluşturuldu
2. ✅ Lisans sistemi çalışıyor
3. ⏳ Production RSA key pair oluştur
4. ⏳ License issuance backend yap
5. ⏳ Code signing sertifikası al
6. ⏳ GitHub Actions entegrasyon

