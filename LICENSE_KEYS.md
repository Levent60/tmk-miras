# Lisans Anahtarları

Bu dosya test ve production lisans anahtarlarını içerir.

## Test Lisans Anahtarı (Development)

**Geçerlilik:** 2027-12-31
**Durum:** ✅ Aktif

### JSON Format (Uygulamada kullanılacak format)

Aşağıdaki JSON'u kopyala, uygulamada **Lisans Aktivasyonu** modal'ında yapıştır:

```json
{"licensee":"Test Lisansı","expiry":"2026-12-31","sig":"Q7D5XhxLtrmGEmA62vbVZuloWJySP/vHUJ7H1ngHA46hZq5jR3A7s7JVr8tbnF7f2fOF+YSQO8UlEas2z5v7WeL7uXkMtd4eXB4OjqHjzJyBAwNq0bnPvCIJ0UB0Ga8IdINcdhcaRf+oydf9Xi5ZFauSBeDd7wUJ1FjAPWeFEhCp1FEhX2gxBXERfg6tJKuOvcXTC6gYMa3IIoOTLh4R1OaEVzhGgrM0ApzDPF0r7C545cJhAQqtSV8MLdqrLOOEUxXOOManCDWko4T+SYF8bS+0WEC1lzLAcRRpnAfUOdVkG28sm+EddLIcIU6q5SJbVcRC6Cy0ZAk7QzInpx/0pQ=="}
```

### Kullanım Adımları

1. **Uygulamayı başlat** (trial banner görünecek)
2. **Banner'ı tıkla** (Lisans Aktivasyonu modal'ı açılacak)
3. **Yukarıdaki JSON'u kopyala ve input'a yapıştır**
4. **"Aktivasyon Yap" butonuna tıkla**
5. ✅ **"Lisans başarıyla aktivasyon!" mesajı göreceksin**

---

## Lisans Bilgileri

| Alan | Değer |
|------|-------|
| **Lisans Sahibi** | Test Lisansı |
| **Geçerlilik Tarihi** | 2026-12-31 |
| **İmza Algoritması** | RSA-SHA256 |
| **Kullanılacak Env** | `.env` (LICENSE_PUBLIC_KEY değişkeni) |

---

## Production Lisans Anahtarları

> ⚠️ **Şu anda boş** - Production RSA key pair oluşturduktan sonra burada eklenecek

Production için lisans anahtarları:
- Private key: Güvenli sunucuda saklanacak (lisans issuance service'te)
- Public key: `.env.trial` ve `.env` dosyalarında `LICENSE_PUBLIC_KEY` değişkeninde

---

## Lisans Anahtarı Oluşturma (Admin)

Test lisans anahtarı oluşturmak için:

```bash
node create-test-license.js
```

Bu script:
1. ✅ RSA key pair oluşturur (2048-bit)
2. ✅ Test lisans anahtarı imzalar
3. ✅ `.env.trial` ve `.env` güncelleme için public key yazdırır

---

## Lisans Format Detayları

### JSON Yapısı

```javascript
{
  "licensee": "String - Lisans sahibi adı/firma",
  "expiry": "YYYY-MM-DD format - Geçerlilik bitiş tarihi",
  "sig": "Base64 - RSA-SHA256 ile imzalanan veri"
}
```

### İmza Hesaplaması

İmzalanan veri: `{licensee}|{expiry}`

Örnek: `Test Lisansı|2026-12-31`

Node.js ile doğrulama:
```javascript
const crypto = require('crypto');
const publicKey = process.env.LICENSE_PUBLIC_KEY;
const verifier = crypto.createVerify('RSA-SHA256');
verifier.update(`${licensee}|${expiry}`);
const isValid = verifier.verify(publicKey, Buffer.from(sig, 'base64'));
```

---

## Not

- Test lisans anahtarı sadece **development ve testing** için geçerlidir
- Production'a geçerken **yeni RSA key pair** oluştur ve private key'i güvenli sakla
- Her müşteri için **farklı bir lisans anahtarı** oluştur

