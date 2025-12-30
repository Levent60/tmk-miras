# TKM Miras Hesaplayıcı - Sürüm Yönetimi

## 📦 Kurulu Sürümler

### 1. Trial Sürümü (Deneme) 
**Dosya:** `dist-trial/TKM Miras Hesaplayıcı Setup 3.0.0.exe`
- **Özellikler:**
  - 30 gün ücretsiz deneme süresi
  - Sarı banner: "30 gün deneme süresi - X gün kaldı"
  - Son 5 gün: Kırmızı uyarı "⚠️ UYARI: Deneme süresi bitecek - X gün kaldı"
  - 30 gün sonra: Şifre koruması ile kilitlenir
  - Varsayılan şifre: `1234` (`.env`'de değiştirilebilir)

### 2. Serbest Sürüm (Free)
**Dosya:** `dist-free/TKM Miras Hesaplayıcı SERBEST Setup 3.0.0.exe`
- **Özellikler:**
  - Trial logic yok
  - Banner gösterilmez
  - Şifre koruması yok (açık kaynak versiyonu)
  - Sınırsız kullanım

---

## 🔨 Build Komutları

### Trial Sürümü Build
```bash
npm run build:trial
```
→ Çıkış: `dist/` → `dist-trial/`

### Serbest Sürüm Build
```bash
npm run build:free
```
→ Çıkış: `dist/` → `dist-free/`

---

## 🔧 Yapılandırma

### .env Dosyaları
- **`.env.trial`** - Trial sürümü için ayarlar
  ```
  APP_PASSWORD=1234
  TRIAL_ENABLED=1
  ```

- **`.env.free`** - Serbest sürüm için ayarlar
  ```
  TRIAL_ENABLED=0
  ```

### TRIAL_ENABLED Parametresi
- `TRIAL_ENABLED=1` → Trial özelliği **aktif**
- `TRIAL_ENABLED=0` → Trial özelliği **kapalı** (serbest sürüm)

---

## 📋 Banner Davranışı (Trial Sürümü)

| Durumu | Banner Görünümü | İşlem |
|--------|-----------------|-------|
| **0-25 gün** | Sarı renk, normal metin | Çalışır |
| **26-30 gün** | Sarı renk, normal metin | Çalışır |
| **Son 5 gün** | Kırmızı renk, ⚠️ UYARI | Çalışır |
| **30+ gün (bitmiş)** | Banner kaybolur | Şifre kilitlemesi |

---

## 🔐 Kilit Mekanizması

Trial sürümünde 30 gün sonra:
1. Ana window kapanır
2. Kilit window açılır
3. Kullanıcı şifre girmelidir
4. Doğru şifre: APP_PASSWORD (default: "1234")
5. Veya lisans key ile kilidi açabilir

---

## � Mobile Uygulaması Sürüm Sinkronizasyonu

Masaüstü ve mobil versiyonları senkron tutmak için:

### 1. Version Numarasını Güncelle

**Desktop (package.json):**
```json
{
  "version": "3.0.0"
}
```

**Mobile (tkm-miras-mobile/app-trial.json ve app-free.json):**
```json
{
  "version": "3.0.0"
}
```

### 2. Sürüm Güncelleme Prosedürü

Yeni versiyon çıkarmak için sırasıyla yapılacaklar:

1. **Desktop sürümünü güncelle:**
   ```bash
   # package.json'da version: "3.0.1" yap
   npm run build:trial
   npm run build:free
   ```

2. **Mobile sürümünü güncelle:**
   ```bash
   cd tkm-miras-mobile
   
   # app-trial.json ve app-free.json'da version: "3.0.1" yap
   npm run build:trial:apk
   npm run build:free:apk
   
   # iOS için (EAS Build)
   npm run build:trial:ios
   npm run build:free:ios
   ```

3. **Documentation'ı güncelle:**
   - README.md'de sürüm numarasını güncelle
   - CHANGELOG.md'ye notları ekle (opsiyonel)

### 3. Changelog Tutmanın Avantajları

`CHANGELOG.md` dosyası oluştur:

```markdown
# Changelog

## [3.0.1] - 2025-12-29
### Added
- Lisans aktivasyonu iyileştirmeleri
- Sentry.io hata izleme entegrasyonu

### Fixed
- Windows Code Signing desteği
- Build process hata yönetimi

### Changed
- Error messages daha détaylı hale getirildi

## [3.0.0] - 2025-01-01
### Released
- İlk yayın sürümü
```

### 4. Version Compatibility Check

Masaüstü ve mobil arasında uyumluluk sorunu olmamak için:

- Miras hesaplama algoritmaları aynı olmalı
- JSON export formatı tutarlı olmalı
- License sistem her ikisinde de geçerli olmalı

`lib/calculation.js` ve `tkm-miras-mobile/App.js` dosyaları senkron tutul.

### 5. Automated Version Sync Script (Opsiyonel)

Versiyonları otomatik senkronize etmek için `sync-versions.js` script'i:

```javascript
const fs = require('fs');
const path = require('path');

// package.json'dan sürüm oku
const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const newVersion = pkg.version;

// Mobile app-trial.json güncelle
const appTrialPath = path.join(__dirname, 'tkm-miras-mobile', 'app-trial.json');
const appTrial = JSON.parse(fs.readFileSync(appTrialPath, 'utf-8'));
appTrial.version = newVersion;
fs.writeFileSync(appTrialPath, JSON.stringify(appTrial, null, 2));

// Mobile app-free.json güncelle
const appFreePath = path.join(__dirname, 'tkm-miras-mobile', 'app-free.json');
const appFree = JSON.parse(fs.readFileSync(appFreePath, 'utf-8'));
appFree.version = newVersion;
fs.writeFileSync(appFreePath, JSON.stringify(appFree, null, 2));

console.log(`✅ Versiyonlar sinkronize edildi: ${newVersion}`);
```

Çalıştırmak için:
```bash
node sync-versions.js
```

---

## �📝 Notlar

- Her build sürümü kendisine ait `.env` dosyasını kullanır
- Build sonrası `.env` otomatik trial sürümüne geri dönüştürülür
- İki sürüm de aynı uygulama kodu kullanır (TRIAL_ENABLED parametresiyle kontrol edilir)
- Installer dosyaları bağımsız olarak dağıtılabilir

---

## 🚀 Dağıtım

1. **Trial sürümü:** `dist-trial/TKM Miras Hesaplayıcı Setup 3.0.0.exe`
2. **Serbest sürüm:** `dist-free/TKM Miras Hesaplayıcı SERBEST Setup 3.0.0.exe`

Her sürümün açıklamalı adı vardır, kullanıcılar hangisini indirdiklerini netlik anlarlar.
