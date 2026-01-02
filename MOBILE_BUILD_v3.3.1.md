# TKM Miras Hesaplayıcı v3.3.1 - MOBILE BUILD STATUS

**Tarih:** 2 Ocak 2026  
**Sürüm:** 3.3.1 FINAL RELEASE  
**Platform:** Android (APK)  
**Build Tool:** EAS CLI v16.28.0

---

## 📱 Mobile Sürüm Bilgisi

| Bilgi | Değer |
|-------|-------|
| Uygulama | TMK Miras Hesaplayıcı Mobile |
| Framework | React Native + Expo |
| Expo Versiyonu | ~54.0.30 |
| Minimum Target | Android 6.0+ |
| Build Tool | EAS (Expo Application Services) |
| Build Profilleri | trial-apk, free-apk |

---

## 🏗️ Build Durumu

### Trial APK (Deneme Sürümü)
```
Profil: trial-apk
Status: BUILD IN PROGRESS ⏳
Komut: npx eas-cli build --platform android --profile trial-apk --non-interactive
Başlangıç: 02-01-2026
```

### Free APK (Ücretsiz Sürüm)
```
Profil: free-apk
Status: BUILD IN PROGRESS ⏳
Komut: npx eas-cli build --platform android --profile free-apk --non-interactive
Başlangıç: 02-01-2026
```

---

## ✨ Mobile v3.3.1 Özellikleri

### Masaüstü v3.3.1'den Aktarılmış Özellikler:
✅ **Per Stirpes (Soyut Hak)** - Ölen çocuk senaryosu  
✅ **Mirasçı Red** - Eş, Anne, Baba reddi  
✅ **Vasiyetname Desteği** - TL ve % seçeneği  
✅ **Otomatik TMK Hesaplaması** - Tüm kombinasyonlar  
✅ **PDF/Excel/CSV Export** - Raporları paylaş  
✅ **Vergi Hesaplaması** - Dinamik vergi oranı  
✅ **Dil Seçimi** - Türkçe/English  
✅ **Tema Seçimi** - Light/Dark/Blue/Green  
✅ **Dosya Yönetimi** - JSON kaydet/yükle  

### Mobil Optimizasyonlar:
✅ Dokunmatik ekran uyumluluğu  
✅ Responsive tasarım (tüm ekran boyutları)  
✅ Çevrimdışı çalışma (React Native AsyncStorage)  
✅ Hızlı yükleme (Expo optimization)  
✅ Düşük bellek tüketimi  

---

## 📦 Daha Önceki APK'lar

Proje klasöründe bulunan:
- `Tmk-miras trial_son.apk` (eski trial)
- `Tmk-miras_free_son.apk` (eski free)

Bu dosyalar v3.3.1 build'lerinin tamamlanmasından sonra güncellenecek.

---

## 🔄 Build Süreci

1. **EAS CLI** tarafından otomatik build başlatıldı
2. **Non-interactive mode** ile otomatik onay aktif
3. APK dosyaları oluşturulduğunda:
   - EAS dashboard'da görüntülenecek
   - Linki ile indirilebilecek
   - tkm-miras-mobile klasöründe kaydedilecek

---

## 📲 İndirme Linki (Tamamlandıktan Sonra)

Build tamamlandığında:
```
EAS Dashboard: https://expo.dev/
Proje: Levent60/tmk-miras-mobile
Yapılar: Trial APK v3.3.1 & Free APK v3.3.1
```

---

## ⚙️ Build Yapılandırması (eas.json)

### Trial Profili:
- Release Channel: trial
- Environment: preview
- Auto-submit: Disabled

### Free Profili:
- Release Channel: free
- Environment: preview
- Auto-submit: Disabled

---

## 📝 Not

- Build süreci ortalama 15-30 dakika sürebilir
- Ağ bağlantısı kesintiye uğramaması gerekir
- Build tamamlanma bildirimi EAS dashboard'dan alınabilir
- Bağlantıda sorun olursa manuel build yapılabilir

---

**🚀 Mobile v3.3.1 FINAL RELEASE - BUILD IN PROGRESS** 🚀
