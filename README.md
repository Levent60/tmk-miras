# TKM Miras Hesaplayıcı — Ticari Yayına Hazırlık

## Özellikler
- 30 gün ücretsiz deneme, sonrası parola veya lisans anahtarı ile açılır
- Lisans: RSA imzalı offline doğrulama (public key uygulamada)
- PDF/Excel/CSV çıktıları, çoklu dil ve para birimi

## Kurulum
```powershell
npm install
npm start
```

## Ortam Değişkenleri (.env)
- `APP_PASSWORD`: Deneme sonrası giriş parolası
- `LICENSE_PUBLIC_KEY`: RSA public key (PEM) — lisans doğrulaması için
- `SENTRY_DSN`: (opsiyonel) Sentry hata takibi
- `AUTO_UPDATE`: `1` ise güncellemeleri kontrol et

## Lisans Aktivasyonu
- Satıcıdan aldığınız lisans anahtarını Lock ekranına girin ve “Aktivasyon” butonuna basın.
- Lisans anahtarı formatı (JSON): `{ "licensee": "Firma/Ad", "expiry": "YYYY-MM-DD", "sig": "base64" }`
- İmza: RSA-SHA256 ile `licensee|expiry` stringinin imzası

## Dağıtım ve İmzalama
- `electron-builder` NSIS kurulumu: `build/license.txt` EULA gösterilir
- Kod imzalama için Windows Code Signing sertifikanızı CI/CD veya lokal ortamda tanımlayın
- Detaylı bilgi: [DEVELOPMENT.md](./DEVELOPMENT.md) → "Code Signing" bölümü

## Güncelleme
- `electron-updater` ile güncellemeler; provider tanımlı olduğunda `AUTO_UPDATE=1` ile aktif olur
- GitHub Releases'dan otomatik olarak indirilir

## 📦 Kullanılan Kütüphaneler (Lisans Bilgisi)

### Açık Kaynak Kütüphaneler
| Kütüphane | Lisans | Açıklama |
|-----------|--------|----------|
| **Electron** | MIT | Masaüstü uygulaması framework'ü |
| **electron-builder** | MIT | EXE installer oluşturma |
| **electron-updater** | MIT | Otomatik güncelleme |
| **dotenv** | BSD-2 | Environment değişkenleri |
| **intro.js** | AGPL-3.0 | Rehber turu (kütüphanesi) |
| **Sentry** | Proprietary/Free | Hata izleme (opsiyonel) |

### Komersyal Lisans Gerektiren Kütüphaneler

⚠️ **Aşağıdaki kütüphaneler komersyal kullanım için ek lisans gerektirebilir:**

#### **jsPDF** (MPL-2.0 / Proprietary)
- **Kullanım:** PDF dosyaları oluşturma
- **Komersyal Lisans:** Gerekli olabilir
- **Website:** https://github.com/parallax/jsPDF
- **Çözüm:** 
  - Açık kaynak sürüm kullanabilirsiniz (MPL-2.0)
  - Veya ticari lisans satın alın
  - Alternatif: `pdfkit` veya `html2pdf.js`

#### **jsPDF-AutoTable** (MIT)
- **Kullanım:** PDF'de tablo oluşturma
- **Lisans:** MIT (Özgür)
- **Not:** jsPDF ile birlikte kullanılır

#### **XLSX (SheetJS)** (Proprietary/Community)
- **Kullanım:** Excel dosyaları okuma/yazma
- **Komersyal Lisans:** Gerekli olabilir
- **Website:** https://sheetjs.com
- **Çözüm:**
  - Community Edition: Sınırlı özellikler
  - Pro Lisans: Tüm özellikler
  - Alternatif: `exceljs` (MIT)

### Öneriler

**Üretim öncesi:**
1. ✅ MIT, BSD, Apache lisanslı kütüphaneleri rahatça kullanabilirsiniz
2. ⚠️ jsPDF ve XLSX için ticari lisans satın alın veya alternatif bulun
3. 📝 LICENSE dosyasında tüm kütüphane lisanslarını belirtin

**Lisans Dosyası Oluşturma:**
```bash
npm install -g license-checker
license-checker --production > LICENSE_THIRD_PARTY.txt
```

## Destek
- Gizlilik ve kullanım koşulları için `build/license.txt` temel metin; üretimde kendi EULA'nızla değiştirin.
- Daha fazla bilgi için [DEVELOPMENT.md](./DEVELOPMENT.md) ve [LICENSE_KEYS.md](./LICENSE_KEYS.md) dosyalarını okuyun.
