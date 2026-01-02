# TKM Miras Hesaplayıcı v3.3.1 - FINAL RELEASE

**Yayın Tarihi:** 2 Ocak 2026  
**Durumu:** STABLE - Final Release ✅

---

## 📋 Sürüm Özeti

v3.3.1 Türk Medeni Kanunu Miras Hesaplayıcı'nın en güncel ve kapsamlı sürümüdür. TMK'ya uygun olarak hukuki senaryoları destekleyen geliştirilmiş bir irsaliye sistemidir.

---

## ✨ Temel Özellikler

### **1. TMK Miras Hesaplaması** 
- ✅ Eş, çocuk, anne, baba ve kardeş kombinasyonları
- ✅ TMK Hükümlerine göre otomatik pay hesaplama
- ✅ Çoklu varlık türü desteği (Taşınmaz, Nakit, Menkul, Araç, Takı, Hisse Senedi, Diğer)
- ✅ Borç kesintisi otomatik
- ✅ Net değer hesaplaması

### **2. Per Stirpes (Soyut Hak) - Ölen Çocuk Senaryosu** ⭐
- ✅ Bir, iki veya daha fazla çocuk ölü olabilir
- ✅ Her ölen çocuk için torunu/varisi sayısı belirtme
- ✅ Ölen çocuğun payı torununlara otomatik dağılım
- ✅ TMK hukuki kurallarına uygun

### **3. Mirasçı Red (Vasiyetnameyi Reddedenlerin Payı)**
- ✅ Eş, Anne, Baba'nın mirası reddetme senaryosu
- ✅ Çoklu mirasçı seçimi (Ctrl+Click)
- ✅ Reddeden kişinin payı otomatik olarak diğer mirasçılara dağılır
- ✅ Tüm senaryolarla uyumlu

### **4. Vasiyetname (Will) Desteği**
- ✅ Dinamik vasiyetname alıcı ekleme/silme
- ✅ TL (Sabit Tutar) ve % (Oransal) destek
- ✅ Vasiyetname kesintisi yapıldıktan sonra TMK dağılımı
- ✅ Vasiyetname alıcıları ayrı satırda gösterilir

### **5. Gelişmiş Arayüz Özellikleri**
- ✅ Dinamik senaryo yükleyici (Eş + 2 Çocuk, vb.)
- ✅ Otomatik çocuk/kardeş isim alanları
- ✅ Vergi oranı ayarlanabilir (%0-100)
- ✅ Dil seçeneği (Türkçe/English)
- ✅ Tema seçimi (Light/Dark/Blue/Green)

### **6. Veri Yönetimi**
- ✅ PDF rapor oluşturma
- ✅ Excel (.xlsx) export
- ✅ CSV export
- ✅ JSON dosya yükleme/kaydetme
- ✅ Dosya No, TC Kimlik numarası kaydı

---

## 🔄 Sürüm Geçmişi (Değişiklikler)

### v3.3.1 (Current - Final Release)
- ✅ UI stil iyileştirmeleri (Vasiyetname ve Mirasçı Red bölümleri)
- ✅ Button stilleri düzeltildi
- ✅ Responsive tasarım iyileştirildi

### v3.3.0
- ✅ Vasiyetname (Will) desteği eklendi
- ✅ Mirasçı Red (Heir Rejection) desteği eklendi
- ✅ Dinamik vasiyetname form sistemi
- ✅ TL ve % bazlı vasiyetname seçeneği

### v3.2.0
- ✅ Çoklu ölen çocuk desteği (1, 2 veya hepsi)
- ✅ Her ölen çocuk için dinamik varis sayısı
- ✅ Per stirpes mantığı genişletildi
- ✅ UI iyileştirmeleri

### v3.1.1
- ✅ Kanun sistemi seçicisi kaldırıldı (TMK Only)
- ✅ USA seçeneği tamamen silindu
- ✅ Tasarım basitleştirildi

### v3.1.0
- ✅ Per stirpes (Soyut Hak) desteği
- ✅ Ölen çocuk için varis sayısı
- ✅ Dinamik checkbox ve input alanları

### v3.0.0
- ✅ Temel TMK miras hesaplaması
- ✅ Eş, çocuk, anne, baba, kardeş kombinasyonları
- ✅ Varlık yönetimi (CRUD)
- ✅ Dil ve Tema desteği
- ✅ PDF/Excel/CSV export

---

## 🧪 Test Edilen Senaryolar

### ✅ Senaryo 1: Basit Dağılım
```
Eş: Evet
Çocuk: 2
Sonuç: Eş %25, Her çocuk %37.5
```

### ✅ Senaryo 2: Ölen Çocuk
```
Eş: Evet
Çocuk: 3 (1'i ölü, 2 torunu var)
Sonuç: Eş %25, 2 çocuk %25 (each), 2 torun %12.5 (each)
```

### ✅ Senaryo 3: Mirasçı Red
```
Eş: Evet, Anne: Evet, Baba: Evet
Baba mirası reddetti
Sonuç: Eş %50, Anne %50, Baba: Herhangibir pay yok
```

### ✅ Senaryo 4: Vasiyetname
```
Temel: 1.000.000 TL
Vasiyetname: Arkadaş 100.000 TL
Sonuç: Arkadaş 100.000, Diğerleri 900.000 TMK'ya göre böler
```

### ✅ Senaryo 5: Tüm Özelliklerin Kombinasyonu
```
- 3 Çocuk (1'i ölü, 2 torunu)
- Baba mirası red etti
- Vasiyetname var (Kuruş Derneği %5)
- %10 vergi
```

---

## 🛠️ Teknik Bilgiler

- **Framework:** Electron v22.3.27
- **UI:** Vanilla JavaScript + HTML/CSS
- **Build Tool:** electron-builder v24.13.3
- **Font Awesome:** v6.4.0
- **Dosya Boyutu:** ~150 MB (Portable EXE)
- **Sistem Gereksinimleri:** Windows 7+, 64-bit

---

## 📦 Kurulum

### Portable (En Basit)
```
TKM Miras Hesaplayıcı Trial Portable 3.3.1.exe
```
Çift tıkla ve çalıştır. Kurulum gerekmiyor.

### Installer
```
TKM Miras Hesaplayıcı Setup 3.3.1.exe
```
Kurulum sihirbazı ile yükle.

### Ücretsiz Sürüm
```
TKM Miras Hesaplayıcı SERBEST Setup 3.3.1.exe
```

---

## 🐛 Bilinen Sınırlamalar

- Mirasçı redlilerin payının otomatik dağılımı henüz tam olarak uygulanmadı (temel red işlevi çalışıyor)
- Yaşlılık nafakası hesaplaması v3.4.0'a ertelendi
- Medenî ortaklık seçeneği v3.4.0'a ertelendi

---

## 📞 Destek ve Geri Bildirim

**GitHub Repository:** https://github.com/Levent60/tmk-miras

---

## 📄 Lisans

MIT License - Kamu kullanımı için özgür

---

**🎉 v3.3.1 FINAL RELEASE STABLE VERSİON 🎉**
