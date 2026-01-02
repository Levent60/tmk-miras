import { varlikEkle, varlikSil, varliklar } from "./assets.js";
import { varlikBazliDagitim } from "./calculation.js";

// ==========================
// GLOBAL SONUÇ VERİSİ
// ==========================
let sonucData = [];
window.sonucData = [];
let currentLang = 'tr';
let currentCurrency = 'TRY';
let currentRate = 1;
let vergiOrani = 5;
let currentFilter = 'all';
let currentSort = 'name-asc';


// ==========================
// DENEME SÜRESİ KONTROL (IPC)
// ==========================
(async () => {
  try {
    const ipcRenderer = window.api?.ipcRenderer;
    if (!ipcRenderer) {
      console.warn('⚠️ ipcRenderer expose edilmemiş');
      return;
    }
    const trialInfo = await ipcRenderer.invoke('trial:info');
    console.log('🔍 Trial Info:', trialInfo); // DEBUG
    if (trialInfo && trialInfo.daysElapsed !== undefined) {
      const daysLeft = Math.max(0, 30 - trialInfo.daysElapsed);
      console.log('📅 Days Left:', daysLeft); // DEBUG
      const banner = document.getElementById('trialBanner');
      const daysSpan = document.getElementById('trialDays');
      const trialText = document.getElementById('trialText');
      
      console.log('📍 Banner Element:', banner); // DEBUG
      
      if (banner && daysSpan && trialText) {
        // Deneme süresi bittiyse: banner gizle ve app'i kilitle
        if (daysLeft === 0) {
          banner.style.display = 'none';
          // App'i kilitlemek için auth window'u talep et
          await ipcRenderer.invoke('lock:app');
          document.body.style.opacity = '0.5';
          document.body.style.pointerEvents = 'none';
          return; // Geri kalan code'u çalıştırma
        }
        
        banner.style.display = 'block';
        daysSpan.textContent = daysLeft;
        
        // Son 5 gün uyarısı: kırmızı renk
        if (daysLeft <= 5) {
          banner.style.background = '#f8d7da';
          banner.style.borderColor = '#f5c6cb';
          banner.style.color = '#721c24';
          trialText.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i> <strong>UYARI:</strong> Deneme süresi bitecek - <strong>${daysLeft}</strong> gün kaldı`;
        } else {
          trialText.innerHTML = `<i class="fa-solid fa-hourglass-end"></i> 30 gün deneme süresi - <strong>${daysLeft}</strong> gün kaldı`;
        }
        console.log('✅ Banner gösterildi'); // DEBUG
      } else {
        console.warn('⚠️ Banner elementleri bulunamadı', { banner, daysSpan, trialText }); // DEBUG
      }
    } else {
      console.warn('⚠️ Trial info eksik:', trialInfo); // DEBUG
    }
  } catch (e) {
    console.log('Trial bilgisi alınamadı:', e);
  }
})();

// ==========================
// LISANS MODAL İŞLEVLERİ
// ==========================
const licenseModal = document.getElementById('licenseModal');
const trialBanner = document.getElementById('trialBanner');
const licenseKeyInput = document.getElementById('licenseKeyInput');
const activateLicenseBtn = document.getElementById('activateLicenseBtn');
const cancelLicense = document.getElementById('cancelLicense');
const closeLicense = document.getElementById('closeLicense');
const licenseMsg = document.getElementById('licenseMsg');

console.log('📋 Modal Elementleri:', { licenseModal, trialBanner, licenseKeyInput, activateLicenseBtn }); // DEBUG

// Modal aç/kapat
const openLicenseModal = () => {
  console.log('🔓 Modal açılıyor...'); // DEBUG
  licenseModal.style.display = 'flex';
  licenseKeyInput.focus();
  licenseMsg.textContent = '';
  console.log('✅ Modal açıldı'); // DEBUG
};

const closeLicenseModal = () => {
  console.log('🔒 Modal kapatılıyor...'); // DEBUG
  licenseModal.style.display = 'none';
  licenseKeyInput.value = '';
  licenseMsg.textContent = '';
};

// Banner tıklaması → Modal aç
if (trialBanner) {
  console.log('🎯 Banner onclick event listener ekleniyor...'); // DEBUG
  trialBanner.onclick = openLicenseModal;
} else {
  console.warn('⚠️ trialBanner element bulunamadı!'); // DEBUG
}

// Modal kapatma butonları
if (closeLicense) closeLicense.onclick = closeLicenseModal;
if (cancelLicense) cancelLicense.onclick = closeLicenseModal;

// Modal dışına tıklanırsa kapat
if (licenseModal) {
  licenseModal.onclick = (e) => {
    if (e.target === licenseModal) closeLicenseModal();
  };
}

// Lisans aktivasyonu
activateLicenseBtn.onclick = async () => {
  licenseMsg.textContent = '';
  const key = (licenseKeyInput.value || '').trim();
  
  if (!key) {
    licenseMsg.textContent = 'Lisans anahtarı boş olamaz';
    return;
  }
  
  try {
    const ipcRenderer = window.api?.ipcRenderer;
    
    if (!ipcRenderer) {
      licenseMsg.textContent = 'IPC hatası: ipcRenderer bulunamadı';
      return;
    }
    
    activateLicenseBtn.disabled = true;
    activateLicenseBtn.textContent = 'Kontrol ediliyor...';
    
    const res = await ipcRenderer.invoke('license:activate', key);
    
    if (res && res.ok) {
      licenseMsg.style.color = '#16a34a';
      licenseMsg.textContent = '✅ Lisans başarıyla aktivasyon!';
      setTimeout(() => {
        closeLicenseModal();
        // Banner'ı gizle
        if (trialBanner) trialBanner.style.display = 'none';
        licenseMsg.style.color = '#dc2626';
      }, 1500);
    } else {
      licenseMsg.textContent = res?.message || 'Lisans geçersiz';
      licenseKeyInput.focus();
    }
  } catch (e) {
    console.error('Lisans aktivasyonu hatası:', e);
    licenseMsg.textContent = 'Hata: ' + e.message;
  } finally {
    activateLicenseBtn.disabled = false;
    activateLicenseBtn.textContent = 'Aktivasyon Yap';
  }
};

// ==========================
// DOM REFERANSLARI
// ==========================
const btnVarlik = document.getElementById("btnVarlik");
const varlikTip = document.getElementById("varlikTip");
const varlikAdi = document.getElementById("varlikAdi");
const varlikDeger = document.getElementById("varlikDeger");
const varlikListe = document.getElementById("varlikListe");
const paraBirimiSelect = document.getElementById("paraBirimi");
const kurInput = document.getElementById("kurInput");

const btnHesapla = document.getElementById("hesapla");

// PDF – EXCEL
const btnAvukatPDF = document.getElementById("btnPDF");
const btnEdevletPDF = document.getElementById("btnEDP");
const btnExcel = document.getElementById("btnExcel");
const btnCSV = document.getElementById("btnCSV");
const btnKaydet = document.getElementById("btnKaydet");
const btnYukle = document.getElementById("btnYukle");
const yukleInput = document.getElementById("yukleInput");
const vergiSecici = document.getElementById("vergiSecici");
const senaryoSecici = document.getElementById("senaryoSecici");
const mirasciFiltre = document.getElementById("mirasciFiltre");
const sonucSirala = document.getElementById("sonucSirala");

// --- Görsel iyileştirmeler: butonlara ikon ve sınıf ekle
if (btnVarlik) btnVarlik.innerHTML = '<i class="fa-solid fa-plus"></i> <span data-key="ekle">+ EKLE</span>';
if (btnHesapla) btnHesapla.innerHTML = '<i class="fa-solid fa-calculator"></i> <span data-key="hesapla">HESAPLA</span>';
if (btnAvukatPDF) btnAvukatPDF.innerHTML = '<i class="fa-solid fa-file-pdf"></i> <span data-key="avukatPdf">PDF RAPOR</span>';
if (btnEdevletPDF) btnEdevletPDF.innerHTML = '<i class="fa-solid fa-print"></i> <span data-key="edevletPdf">YAZDIR</span>';
if (btnExcel) btnExcel.innerHTML = '<i class="fa-solid fa-file-excel"></i> <span data-key="excel">EXCEL</span>';
if (btnKaydet) btnKaydet.innerHTML = '<i class="fa-solid fa-save"></i> <span data-key="kaydet">KAYDET</span>';
if (btnYukle) btnYukle.innerHTML = '<i class="fa-solid fa-upload"></i> <span data-key="yukle">YÜKLE</span>';

// Tema toggle (basit)
const themeToggle = document.getElementById("themeToggle");
const temaSecici = document.getElementById("temaSecici");
const dilSecici = document.getElementById("dilSecici");


const translations = {
  tr: {
    title: "Türk Medeni Kanunu Miras Hesaplayıcı",
    subtitle: "TMK Hükümlerine Göre Miras Dağılımını Hesapla",
    varliklar: "Varlıklar",
    mirascilar: "Mirasçılar",
    sonuclar: "Sonuçlar",
    esYasiyorMu: "Eş yaşıyor mu?",
    cocukSayisi: "Çocuk sayısı",
    anne: "Anne:",
    baba: "Baba:",
    kardesSayisi: "Kardeş sayısı",
    ekle: "+ EKLE",
    hesapla: "HESAPLA",
    avukatPdf: "PDF RAPOR",
    excel: "EXCEL",
    edevletPdf: "YAZDIR",
    kaydet: "KAYDET",
    yukle: "YÜKLE",
    varlikAdiPlaceholder: "Varlık Adı (Örn: Ev, Banka)",
    tutarPlaceholder: "Tutar (₺)",
    borcPlaceholder: "Borç (₺)",
    dosyaNoPlaceholder: "Dosya No",
    mirasBirakanPlaceholder: "Miras Bırakan",
    tcKimlikPlaceholder: "TC Kimlik",
    borcText: "Borç:",
    netText: "Net:",
    silText: "Sil",
    alertVarlik: "Varlık adı ve geçerli tutar giriniz",
    tasinmaz: "Taşınmaz",
    nakit: "Nakit",
    menkul: "Menkul",
    arac: "Araç",
    taki: "Takı",
    hisseSenedi: "Hisse Senedi",
    diger: "Diğer",
    mirasci: "Mirasçı",
    pay: "Pay (%)",
    tutar: "Tutar (₺)",
    genelToplam: "Genel Toplam",
    vergi: "Vergi",
    toplamVergili: "Vergi Dahil Toplam",
    evet: "Evet",
    hayir: "Hayır",
    // Tema seçenekleri
    themeLight: "Açık",
    themeDark: "Koyu",
    themeBlue: "Mavi",
    themeGreen: "Yeşil",
    filterAll: "Tümü",
    sortNameAsc: "İsim A-Z",
    sortNameDesc: "İsim Z-A",
    sortPayDesc: "Pay ↓",
    sortPayAsc: "Pay ↑",
    sortTutarDesc: "Tutar ↓",
    sortTutarAsc: "Tutar ↑",
    scenario: "Senaryo",
    scenarioSelect: "Seçin",
    scenario1: "Eş + 2 Çocuk",
    scenario2: "Eş + Anne & Baba",
    scenario3: "Eş Yok + 3 Kardeş",
    currency: "Para Birimi",
    rate: "Kur (TL)",
    taxPlaceholder: "Vergi % (isteğe bağlı)",
    csv: "CSV",
    licenseActivation: "Lisans Aktivasyonu",
    licenseDesc: "Lisans anahtarınızı girerek uygulamayı etkinleştirin",
    activateBtn: "Aktivasyon Yap",
    cancel: "İptal"
  },
  en: {
    title: "Turkish Civil Code Inheritance Calculator",
    subtitle: "Calculate Inheritance Distribution According to TCC Provisions",
    varliklar: "Assets",
    mirascilar: "Heirs",
    sonuclar: "Results",
    esYasiyorMu: "Is the spouse alive?",
    cocukSayisi: "Number of children",
    anne: "Mother:",
    baba: "Father:",
    kardesSayisi: "Number of siblings",
    ekle: "+ ADD",
    hesapla: "CALCULATE",
    avukatPdf: "PDF REPORT",
    excel: "EXCEL",
    edevletPdf: "PRINT",
    kaydet: "SAVE",
    yukle: "LOAD",
    varlikAdiPlaceholder: "Asset Name (e.g. House, Bank)",
    tutarPlaceholder: "Amount (₺)",
    borcPlaceholder: "Debt (₺)",
    dosyaNoPlaceholder: "File No",
    mirasBirakanPlaceholder: "Deceased",
    tcKimlikPlaceholder: "ID Number",
    borcText: "Debt:",
    netText: "Net:",
    silText: "Delete",
    alertVarlik: "Please enter asset name and valid amount",
    tasinmaz: "Real Estate",
    nakit: "Cash",
    menkul: "Securities",
    arac: "Vehicle",
    taki: "Jewelry",
    hisseSenedi: "Stock",
    diger: "Other",
    mirasci: "Heir",
    pay: "Share (%)",
    tutar: "Amount (₺)",
    genelToplam: "General Total",
    vergi: "Tax",
    toplamVergili: "Total (Tax Included)",
    evet: "Yes",
    hayir: "No",
    borcText: "Debt:",
    netText: "Net:",
    silText: "Delete",
    alertVarlik: "Please enter asset name and valid amount",
    // Theme options
    themeLight: "Light",
    themeDark: "Dark",
    themeBlue: "Blue",
    themeGreen: "Green",
    filterAll: "All",
    sortNameAsc: "Name A-Z",
    sortNameDesc: "Name Z-A",
    sortPayDesc: "Share ↓",
    sortPayAsc: "Share ↑",
    sortTutarDesc: "Amount ↓",
    sortTutarAsc: "Amount ↑",
    scenario: "Scenario",
    scenarioSelect: "Select",
    scenario1: "Spouse + 2 Children",
    scenario2: "Spouse + Mother & Father",
    scenario3: "No Spouse + 3 Siblings",
    currency: "Currency",
    rate: "Rate (TRY)",
    taxPlaceholder: "Tax % (optional)",
    csv: "CSV",
    licenseActivation: "License Activation",
    licenseDesc: "Enter your license key to activate the application",
    activateBtn: "Activate",
    cancel: "Cancel"
  }
};

const currencySymbols = {
  "TRY": "₺",
  "USD": "$",
  "EUR": "€"
};

if (themeToggle) {
  themeToggle.onclick = () => document.body.classList.toggle("dark");
}
if (temaSecici) {
  temaSecici.onchange = () => {
    const tema = temaSecici.value;
    document.body.className = tema === 'light' ? '' : tema;
  };
}
if (dilSecici) {
  dilSecici.onchange = () => {
    const lang = dilSecici.value;
    currentLang = lang;
    document.querySelectorAll('[data-key]').forEach(el => {
      const key = el.dataset.key;
      if (translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
    // Placeholder çevirileri
    document.querySelectorAll('[data-placeholder-key]').forEach(el => {
      const key = el.dataset.placeholderKey;
      if (translations[lang][key]) {
        el.placeholder = translations[lang][key];
      }
    });
    // Placeholder'ları güncelle
    document.getElementById('varlikAdi').placeholder = translations[lang].varlikAdiPlaceholder;
    document.getElementById('varlikDeger').placeholder = translations[lang].tutarPlaceholder;
    document.getElementById('varlikBorc').placeholder = translations[lang].borcPlaceholder;
    document.getElementById('dosyaNo').placeholder = translations[lang].dosyaNoPlaceholder;
    document.getElementById('mirasBirakan').placeholder = translations[lang].mirasBirakanPlaceholder;
    document.getElementById('tcKimlik').placeholder = translations[lang].tcKimlikPlaceholder;
    // Varlık tipi seçeneklerini güncelle
    const varlikTipSelect = document.getElementById('varlikTip');
    varlikTipSelect.options[0].textContent = translations[lang].tasinmaz;
    varlikTipSelect.options[1].textContent = translations[lang].nakit;
    varlikTipSelect.options[2].textContent = translations[lang].menkul;
    varlikTipSelect.options[3].textContent = translations[lang].arac;
    varlikTipSelect.options[4].textContent = translations[lang].taki;
    varlikTipSelect.options[5].textContent = translations[lang].hisseSenedi;
    varlikTipSelect.options[6].textContent = translations[lang].diger;
    // Tema seçeneklerini güncelle
    const temaSelect = document.getElementById('temaSecici');
    if (temaSelect && temaSelect.options.length >= 4) {
      temaSelect.options[0].textContent = translations[lang].themeLight;
      temaSelect.options[1].textContent = translations[lang].themeDark;
      temaSelect.options[2].textContent = translations[lang].themeBlue;
      temaSelect.options[3].textContent = translations[lang].themeGreen;
    }
    // Sıralama seçenekleri
    const sonucSiralaSelect = document.getElementById('sonucSirala');
    if (sonucSiralaSelect && sonucSiralaSelect.options.length >= 6) {
      sonucSiralaSelect.options[0].textContent = translations[lang].sortNameAsc;
      sonucSiralaSelect.options[1].textContent = translations[lang].sortNameDesc;
      sonucSiralaSelect.options[2].textContent = translations[lang].sortPayDesc;
      sonucSiralaSelect.options[3].textContent = translations[lang].sortPayAsc;
      sonucSiralaSelect.options[4].textContent = translations[lang].sortTutarDesc;
      sonucSiralaSelect.options[5].textContent = translations[lang].sortTutarAsc;
    }
    // Filtre 'Tümü'
    const mirasciFiltreSelect = document.getElementById('mirasciFiltre');
    if (mirasciFiltreSelect && mirasciFiltreSelect.options.length > 0) {
      mirasciFiltreSelect.options[0].textContent = translations[lang].filterAll;
    }

    // Senaryo seçicisini güncelle
    const senaryoSecici = document.getElementById('senaryoSecici');
    if (senaryoSecici && senaryoSecici.options.length >= 4) {
      senaryoSecici.options[0].textContent = translations[lang].scenarioSelect;
      senaryoSecici.options[1].textContent = translations[lang].scenario1;
      senaryoSecici.options[2].textContent = translations[lang].scenario2;
      senaryoSecici.options[3].textContent = translations[lang].scenario3;
      // Dil değişiminde dropdown'ı sıfırla
      senaryoSecici.value = 'none';
    }

    // Select option'larını güncelle
    document.querySelectorAll('select option[value="evet"]').forEach(opt => opt.textContent = translations[lang].evet);
    document.querySelectorAll('select option[value="hayir"]').forEach(opt => opt.textContent = translations[lang].hayir);
    // Varlık listesini yeniden çiz
    varlikListesiniGuncelle();
    // Eğer sonuç varsa tabloyu yeniden çiz
    if (sonucData.length > 0) {
      const mirascilar = mirasciBilgileriniTopla();
      tabloCiz(mirascilar);
    }
  };
  // Başlangıçta Türkçe'yi uygula
  dilSecici.value = 'tr';
  dilSecici.onchange();
}

// Para birimi seçimi
if (paraBirimiSelect) {
  paraBirimiSelect.onchange = () => {
    currentCurrency = paraBirimiSelect.value;
    if (currentCurrency === 'TRY') {
      kurInput.value = 1;
      kurInput.disabled = true;
    } else {
      kurInput.disabled = false;
      if (!kurInput.value || Number(kurInput.value) <= 0) {
        kurInput.value = 1;
      }
    }
  };
  paraBirimiSelect.value = 'TRY';
  currentCurrency = 'TRY';
  kurInput.value = 1;
  kurInput.disabled = true;
}

// Vergi seçici
if (vergiSecici) {
  vergiSecici.onchange = () => {
    const raw = vergiSecici.value;
    if (raw === "" || raw === null || raw === undefined) {
      vergiOrani = 0;
    } else {
      const val = Number(raw);
      vergiOrani = isNaN(val) ? 0 : Math.max(0, val);
    }
    if (sonucData.length) {
      const mirascilar = mirasciBilgileriniTopla();
      tabloCiz(mirascilar);
    }
  };
  // Başlangıç değeri 5, ama boş bırakılırsa 0 kabul edilir
  vergiSecici.value = "5";
}

// Senaryo şablonları
if (senaryoSecici) {
  senaryoSecici.onchange = () => {
    const v = senaryoSecici.value;
    if (v === 'es2cocuk') {
      document.getElementById("es").value = "evet";
      document.getElementById("cocukSayisi").value = 2;
      document.getElementById("cocukSayisi").dispatchEvent(new Event('input'));
      document.getElementById("anne").value = "hayir";
      document.getElementById("baba").value = "hayir";
      document.getElementById("kardesSayisi").value = 0;
      document.getElementById("kardesSayisi").dispatchEvent(new Event('input'));
    } else if (v === 'esAnneBaba') {
      document.getElementById("es").value = "evet";
      document.getElementById("cocukSayisi").value = 0;
      document.getElementById("cocukSayisi").dispatchEvent(new Event('input'));
      document.getElementById("anne").value = "evet";
      document.getElementById("baba").value = "evet";
      document.getElementById("kardesSayisi").value = 0;
      document.getElementById("kardesSayisi").dispatchEvent(new Event('input'));
    } else if (v === 'kardes3') {
      document.getElementById("es").value = "hayir";
      document.getElementById("cocukSayisi").value = 0;
      document.getElementById("cocukSayisi").dispatchEvent(new Event('input'));
      document.getElementById("anne").value = "hayir";
      document.getElementById("baba").value = "hayir";
      document.getElementById("kardesSayisi").value = 3;
      document.getElementById("kardesSayisi").dispatchEvent(new Event('input'));
    }
  };
}

// ==========================
// VARLIK EKLE
// ==========================
btnVarlik.onclick = () => {
  const tip = varlikTip.value;
  const ad = varlikAdi.value.trim();
  const deger = Number(varlikDeger.value);
  const borc = Number(varlikBorc.value) || 0;
  const kur = Number(kurInput?.value || 1) || 1;
  currentRate = kur;

  if (!ad || !deger || deger <= 0) {
    alert(translations[currentLang].alertVarlik);
    return;
  }

  varlikEkle(tip, ad, deger, borc, currentCurrency, kur);

  varlikAdi.value = "";
  varlikDeger.value = "";
  varlikBorc.value = "";

  varlikListesiniGuncelle();
};

function getTranslatedTip(tip) {
  const keyMap = {
    "Taşınmaz": "tasinmaz",
    "Nakit": "nakit",
    "Menkul": "menkul",
    "Araç": "arac",
    "Takı": "taki",
    "Hisse Senedi": "hisseSenedi",
    "Diğer": "diger"
  };
  return translations[currentLang][keyMap[tip]] || tip;
}

function getCurrencySymbol(code) {
  return currencySymbols[code] || code || "";
}
function getIconForTip(tip) {
  switch(tip) {
    case "Taşınmaz": return "fa-home";
    case "Nakit": return "fa-money-bill-wave";
    case "Menkul": return "fa-gem";
    case "Araç": return "fa-car";
    case "Takı": return "fa-ring";
    case "Hisse Senedi": return "fa-chart-line";
    case "Diğer": return "fa-box";
    default: return "fa-box";
  }
}

function varlikListesiniGuncelle() {
  varlikListe.innerHTML = "";

  varliklar.forEach(v => {
    // Eski kayıtlarda kur olmayabilir
    const kur = v.kur || 1;
    const degerTl = v.degerTl != null ? v.degerTl : (v.deger * kur);
    const borcTl = v.borcTl != null ? v.borcTl : (v.borc * kur);
    const netDeger = degerTl - borcTl;
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="info"><i class="fa-solid ${getIconForTip(v.tip)}"></i> <strong>${getTranslatedTip(v.tip)}</strong> - ${v.ad}
      <span class="muted">(${v.deger.toLocaleString("tr-TR")} ${getCurrencySymbol(v.paraBirimi || currentCurrency)}${v.borc ? ` - ${translations[currentLang].borcText} ${v.borc.toLocaleString("tr-TR")} ${getCurrencySymbol(v.paraBirimi || currentCurrency)}` : ''})</span>
      <br><small>${translations[currentLang].netText} ${netDeger.toLocaleString("tr-TR")} ₺</small></div>
      <div>
        <button class="btn small" data-id="${v.id}"><i class="fa-solid fa-trash-can"></i> ${translations[currentLang].silText}</button>
      </div>
    `;

    li.querySelector("button").onclick = () => {
      varlikSil(v.id);
      varlikListesiniGuncelle();
    };

    varlikListe.appendChild(li);
  });
}

// ==========================
// HESAPLA
// ==========================
btnHesapla.onclick = () => {
  const mirascilar = mirasciBilgileriniTopla();
  tabloCiz(mirascilar);
};

// ==========================
// MİRASÇI VERİLERİ
// ==========================
function mirasciBilgileriniTopla() {
  const es = document.getElementById("es").value === "evet";
  const anne = document.getElementById("anne").value === "evet";
  const baba = document.getElementById("baba").value === "evet";

  const cocukSayisi = Number(document.getElementById("cocukSayisi").value);
  const cocuklar = [];

  for (let i = 1; i <= cocukSayisi; i++) {
    const ad =
      document.getElementById(`cocukAdi${i}`)?.value || `Çocuk ${i}`;
    cocuklar.push(ad);
  }

  const kardesSayisi = Number(document.getElementById("kardesSayisi").value);
  const kardesler = [];

  for (let i = 1; i <= kardesSayisi; i++) {
    const ad =
      document.getElementById(`kardesAdi${i}`)?.value || `Kardeş ${i}`;
    kardesler.push(ad);
  }

  // Ölen çocuklar ve varisleri
  const olmusCocuklar = [];
  for (let i = 1; i <= cocukSayisi; i++) {
    const checkbox = document.getElementById(`cocukOlu${i}`);
    const varisInput = document.getElementById(`cocukVaris${i}`);
    if (checkbox && checkbox.checked) {
      const varisCount = Number(varisInput?.value || 1);
      olmusCocuklar.push({ cocukIndex: i, varisCount });
    }
  }

  // Mirasçı red bilgileri
  const mirascıRedCheckbox = document.getElementById('mirascıRedCheckbox');
  const mirascıRedSecimi = document.getElementById('mirascıRedSecimi');
  const mirascıRedAlanlar = [];
  if (mirascıRedCheckbox?.checked && mirascıRedSecimi) {
    for (let option of mirascıRedSecimi.selectedOptions) {
      mirascıRedAlanlar.push(option.value);
    }
  }

  // Vasiyetname bilgileri
  const vasiyetnameCheckbox = document.getElementById('vasiyetnameCheckbox');
  const vasiyetnamelerArray = vasiyetnameCheckbox?.checked ? vasiyetnameler : [];

  return { es, anne, baba, cocuklar, kardesler, olmusCocuklar, mirascıRedAlanlar, vasiyetnamelerArray };
}

function populateMirasciFiltre(data) {
  if (!mirasciFiltre) return;
  const unique = Array.from(new Set(data.map(d => d.mirasci)));
  mirasciFiltre.innerHTML = `<option value="all">${translations[currentLang].filterAll}</option>` +
    unique.map(n => `<option value="${n}">${n}</option>`).join('');
  // Seçimi koru; mevcut seçim yoksa 'all' yap
  if (unique.includes(currentFilter)) {
    mirasciFiltre.value = currentFilter;
  } else {
    currentFilter = 'all';
    mirasciFiltre.value = 'all';
  }
}

function applyFilterAndSort(data) {
  let list = [...data];
  if (currentFilter !== 'all') {
    list = list.filter(r => r.mirasci === currentFilter);
  }
  switch (currentSort) {
    case 'name-asc': list.sort((a,b)=>a.mirasci.localeCompare(b.mirasci)); break;
    case 'name-desc': list.sort((a,b)=>b.mirasci.localeCompare(a.mirasci)); break;
    case 'pay-asc': list.sort((a,b)=>Number(a.pay)-Number(b.pay)); break;
    case 'pay-desc': list.sort((a,b)=>Number(b.pay)-Number(a.pay)); break;
    case 'tutar-asc': list.sort((a,b)=>Number(a.tutar)-Number(b.tutar)); break;
    case 'tutar-desc': list.sort((a,b)=>Number(b.tutar)-Number(a.tutar)); break;
    default: break;
  }
  return list;
}

// ==========================
// VARLIK BAZLI TABLO ÇİZİMİ
// ==========================
function formatPay3(val) {
  const n = Number(val);
  if (isNaN(n)) return val;
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function tabloCiz(mirascilar) {
  const alan = document.getElementById("sonucAlan");
  alan.innerHTML = "";

  sonucData = varlikBazliDagitim(varliklar, mirascilar, 'TR');
  window.sonucData = sonucData; // 🔴 KRİTİK EKLEME

   // Filtre/sıralama için listeyi hazırla
  const gosterilecek = applyFilterAndSort(sonucData);
  populateMirasciFiltre(sonucData);

  const gruplu = {};

  gosterilecek.forEach(r => {
    const key = `${r.varlikTip} - ${r.varlikAdi}`;
    if (!gruplu[key]) gruplu[key] = [];
    gruplu[key].push(r);
  });

  Object.keys(gruplu).forEach(grup => {
    const h = document.createElement("h3");
    h.textContent = grup;
    alan.appendChild(h);

    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>${translations[currentLang].mirasci}</th>
          <th>${translations[currentLang].pay}</th>
          <th>${translations[currentLang].tutar}</th>
        </tr>
      </thead>
      <tbody>
        ${gruplu[grup].map(r => `
          <tr>
            <td>${r.mirasci}</td>
            <td>${formatPay3(r.pay)}</td>
            <td>${Number(r.tutar).toLocaleString("tr-TR")} ₺</td>
          </tr>
        `).join("")}
      </tbody>
    `;
    alan.appendChild(table);
  });

  genelToplam();
}

// ==========================
// GENEL TOPLAM TABLOSU
// ==========================
function genelToplam() {
  const tbody = document.querySelector("#toplamTablo tbody");
  tbody.innerHTML = "";

  const toplamlar = {};

  const list = applyFilterAndSort(sonucData);
  list.forEach(r => {
    toplamlar[r.mirasci] =
      (toplamlar[r.mirasci] || 0) + Number(r.tutar);
  });

  Object.keys(toplamlar).forEach(ad => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ad}</td>
      <td>${toplamlar[ad].toLocaleString("tr-TR")} ₺</td>
    `;
    tbody.appendChild(tr);
  });

  // Vergi hesaplaması
  const toplamTutar = Object.values(toplamlar).reduce((a, b) => a + b, 0);
  const vergi = toplamTutar * vergiOrani / 100;
  const toplamVergili = toplamTutar + vergi;

  // Vergi satırı
  const vergiTr = document.createElement("tr");
  vergiTr.innerHTML = `
    <td><strong>${translations[currentLang].vergi} (%${vergiOrani})</strong></td>
    <td><strong>${vergi.toLocaleString("tr-TR")} ₺</strong></td>
  `;
  tbody.appendChild(vergiTr);

  // Toplam Vergili satırı
  const toplamTr = document.createElement("tr");
  toplamTr.innerHTML = `
    <td><strong>${translations[currentLang].toplamVergili}</strong></td>
    <td><strong>${toplamVergili.toLocaleString("tr-TR")} ₺</strong></td>
  `;
  tbody.appendChild(toplamTr);
}

// ==========================
// PDF / EXCEL BUTONLARI (GÜVENLİ)
// ==========================
btnAvukatPDF.onclick = () => {
  const meta = {
    dosyaNo: document.getElementById("dosyaNo").value || "—",
    mirasBirakan: document.getElementById("mirasBirakan").value || "—",
    tc: document.getElementById("tcKimlik").value || "",
    tarih: new Date().toLocaleDateString("tr-TR")
  };

  window.api.exportAvukatPDF({
    meta,
    sonucData
  });
};


btnEdevletPDF.onclick = () => {
  if (!window.sonucData || window.sonucData.length === 0) {
    alert("Önce hesaplama yapmalısınız");
    return;
  }
  window.api.exportEdevletPDF(window.sonucData);
};

btnExcel.onclick = () => {
  if (!window.sonucData || window.sonucData.length === 0) {
    alert("Önce hesaplama yapmalısınız");
    return;
  }
  window.api.exportExcel(window.sonucData);
};

// Filtre ve sıralama
if (mirasciFiltre) {
  mirasciFiltre.onchange = () => {
    currentFilter = mirasciFiltre.value;
    if (sonucData.length) {
      const mirascilar = mirasciBilgileriniTopla();
      tabloCiz(mirascilar);
    }
  };
}

if (sonucSirala) {
  sonucSirala.onchange = () => {
    currentSort = sonucSirala.value;
    if (sonucData.length) {
      const mirascilar = mirasciBilgileriniTopla();
      tabloCiz(mirascilar);
    }
  };
}

// CSV çıktı (filtre/sıralama uygulanmış veriyle)
if (btnCSV) {
  btnCSV.onclick = () => {
    if (!window.sonucData || window.sonucData.length === 0) {
      alert("Önce hesaplama yapmalısınız");
      return;
    }
    const data = applyFilterAndSort(window.sonucData);
    const headers = ["Varlık Tipi", "Varlık Adı", "Mirasçı", "Pay (%)", "Tutar (TL)"];
    const rows = data.map(r => [r.varlikTip, r.varlikAdi, r.mirasci, formatPay3(r.pay), Number(r.tutar).toFixed(2)]);
    const csv = [headers.join(";")].concat(rows.map(row => row.join(";"))).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'miras-sonuc.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
}

// ==========================
// ÇOCUK İSİM ALANLARI
// ==========================
const cocukSayisiInput = document.getElementById("cocukSayisi");
const cocuklarDiv = document.getElementById("cocuklar");
const cocukOlumDiv = document.getElementById("cocukOlumKontrolleri");

cocukSayisiInput.oninput = () => {
  const sayi = Number(cocukSayisiInput.value);
  cocuklarDiv.innerHTML = "";
  cocukOlumDiv.innerHTML = "";
  
  if (sayi > 0) {
    cocukOlumDiv.style.display = "block";
    const baslik = document.createElement("p");
    baslik.style.fontWeight = "600";
    baslik.style.marginBottom = "8px";
    baslik.textContent = "Ölen Çocuklar (Varisleri Belirtin):";
    cocukOlumDiv.appendChild(baslik);

    for (let i = 1; i <= sayi; i++) {
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.alignItems = "center";
      container.style.gap = "10px";
      container.style.marginBottom = "8px";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `cocukOlu${i}`;
      
      const label = document.createElement("label");
      label.style.display = "flex";
      label.style.alignItems = "center";
      label.style.gap = "8px";
      label.style.margin = "0";
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(`Çocuk ${i} öldü`));
      
      const varisInput = document.createElement("input");
      varisInput.type = "number";
      varisInput.id = `cocukVaris${i}`;
      varisInput.min = "1";
      varisInput.value = "1";
      varisInput.placeholder = "Varis sayısı";
      varisInput.style.width = "80px";
      varisInput.style.display = "none";
      
      // Checkbox değiştiğinde varis input'unu göster/gizle
      checkbox.addEventListener("change", () => {
        varisInput.style.display = checkbox.checked ? "inline-block" : "none";
      });
      
      container.appendChild(label);
      container.appendChild(varisInput);
      cocukOlumDiv.appendChild(container);
    }
  }

  const p = document.createElement("p");
  p.textContent = "Çocuk İsimleri (opsiyonel):";
  cocuklarDiv.appendChild(p);

  for (let i = 1; i <= sayi; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.id = `cocukAdi${i}`;
    input.placeholder = `Çocuk ${i} Adı`;
    cocuklarDiv.appendChild(input);
  }
};

// ==========================
// KARDEŞ İSİM ALANLARI
// ==========================
const kardesSayisiInput = document.getElementById("kardesSayisi");
const kardeslerDiv = document.getElementById("kardesler");

kardesSayisiInput.oninput = () => {
  const sayi = Number(kardesSayisiInput.value);
  kardeslerDiv.innerHTML = "";

  if (sayi > 0) {
    const p = document.createElement("p");
    p.textContent = "Kardeş İsimleri (opsiyonel):";
    kardeslerDiv.appendChild(p);

    for (let i = 1; i <= sayi; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.id = `kardesAdi${i}`;
      input.placeholder = `Kardeş ${i} Adı`;
      kardeslerDiv.appendChild(input);
    }
  }
};

// ==========================
// KAYDET / YÜKLE
// ==========================
btnKaydet.onclick = () => {
  const mirascilar = mirasciBilgileriniTopla();
  const data = {
    varliklar,
    mirascilar,
    sonucData
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'miras-verisi.json';
  a.click();
  URL.revokeObjectURL(url);
};

btnYukle.onclick = () => {
  yukleInput.click();
};

yukleInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      // Varlıkları yükle
      varliklar.length = 0;
      data.varliklar.forEach(v => {
        const kur = v.kur || 1;
        varliklar.push({
          ...v,
          paraBirimi: v.paraBirimi || 'TRY',
          kur,
          degerTl: v.degerTl != null ? v.degerTl : (v.deger * kur),
          borcTl: v.borcTl != null ? v.borcTl : (v.borc * kur)
        });
      });
      varlikListesiniGuncelle();
      // Mirasçıları set et
      if (data.mirascilar) {
        document.getElementById("es").value = data.mirascilar.es ? "evet" : "hayir";
        document.getElementById("anne").value = data.mirascilar.anne ? "evet" : "hayir";
        document.getElementById("baba").value = data.mirascilar.baba ? "evet" : "hayir";
        document.getElementById("cocukSayisi").value = data.mirascilar.cocuklar.length;
        document.getElementById("cocukSayisi").dispatchEvent(new Event('input'));
        data.mirascilar.cocuklar.forEach((ad, i) => {
          const input = document.getElementById(`cocukAdi${i+1}`);
          if (input) input.value = ad;
        });
        document.getElementById("kardesSayisi").value = data.mirascilar.kardesler.length;
        document.getElementById("kardesSayisi").dispatchEvent(new Event('input'));
        data.mirascilar.kardesler.forEach((ad, i) => {
          const input = document.getElementById(`kardesAdi${i+1}`);
          if (input) input.value = ad;
        });
      }
      // Hesapla
      if (data.varliklar.length > 0) {
        const mirascilar = mirasciBilgileriniTopla();
        tabloCiz(mirascilar);
      }
      alert("Veri yüklendi!");
    } catch (err) {
      alert("Geçersiz dosya: " + err.message);
    }
  };
  reader.readAsText(file);
};

// ==========================
// ONBOARDING TURU (Intro.js)
// ==========================
const tourTexts = {
  tr: {
    helpTitle: "Kılavuz",
    next: "İleri",
    prev: "Geri",
    done: "Bitti",
    skip: "Atla",
    welcome: "TKM Miras'a hoş geldiniz. Kısa bir tur ile temel adımları gösterelim.",
    asset: "Buradan varlık adını girersiniz (ör. Ev, Banka).",
    type: "Varlık tipini seçin (Taşınmaz, Nakit, Menkul, vb.).",
    currency: "Varlık para birimini seçin (TRY, USD, EUR).",
    rate: "Seçtiğiniz para birimi için TL kurunu girin.",
    amount: "Varlığın tutarını giriniz (₺ cinsinden).",
    debt: "Varlığa bağlı borç varsa giriniz (opsiyonel).",
    addAsset: "Varlığı listeye eklemek için bu butonu kullanın.",
    scenario: "Hızlı giriş için hazır senaryo şablonlarından birini seçebilirsiniz.",
    calculate: "Dağılımı hesaplamak için Hesapla butonuna basın.",
    filterSort: "Sonuçları filtreleyebilir ve farklı ölçütlere göre sıralayabilirsiniz.",
    export: "PDF, Excel veya CSV olarak çıktı alabilir; veriyi kaydedip yükleyebilirsiniz."
  },
  en: {
    helpTitle: "Help",
    next: "Next",
    prev: "Back",
    done: "Done",
    skip: "Skip",
    welcome: "Welcome to TKM Inheritance. Let's take a quick tour.",
    asset: "Enter the asset name here (e.g., House, Bank).",
    type: "Select the asset type (Real Estate, Cash, Securities, etc.).",
    currency: "Select the asset currency (TRY, USD, EUR).",
    rate: "Enter the TRY exchange rate for the selected currency.",
    amount: "Enter the asset amount (in ₺).",
    debt: "If there is debt on the asset, enter it here (optional).",
    addAsset: "Click to add the asset to the list.",
    scenario: "Use preset scenarios for quick input.",
    calculate: "Press Calculate to compute the distribution.",
    filterSort: "Filter and sort the results as needed.",
    export: "Export to PDF, Excel, or CSV; you can also save/load data."
  }
};

function startOnboarding(auto = false) {
  if (!window.introJs) return;
  const lang = currentLang || 'tr';
  const t = tourTexts[lang] || tourTexts.tr;
  const steps = [
    { element: document.querySelector('.app-header .brand'), intro: t.welcome },
    { element: document.getElementById('varlikAdi'), intro: t.asset },
    { element: document.getElementById('varlikTip'), intro: t.type },
    { element: document.getElementById('paraBirimi'), intro: t.currency },
    { element: document.getElementById('kurInput'), intro: t.rate },
    { element: document.getElementById('varlikDeger'), intro: t.amount },
    { element: document.getElementById('varlikBorc'), intro: t.debt },
    { element: document.getElementById('btnVarlik'), intro: t.addAsset },
    { element: document.getElementById('senaryoSecici'), intro: t.scenario },
    { element: document.getElementById('hesapla'), intro: t.calculate },
    { element: document.querySelector('.filters'), intro: t.filterSort },
    { element: document.querySelector('.actions-row'), intro: t.export }
  ].filter(s => s.element);

  const intro = window.introJs();
  intro.setOptions({
    steps,
    nextLabel: t.next,
    prevLabel: t.prev,
    doneLabel: t.done,
    skipLabel: t.skip
  });
  intro.oncomplete(() => { if (auto) localStorage.setItem('onboardingDone', '1'); });
  intro.onexit(() => { if (auto) localStorage.setItem('onboardingDone', '1'); });
  intro.start();
}

const helpBtn = document.getElementById('helpTour');
if (helpBtn) {
  helpBtn.addEventListener('click', () => startOnboarding(false));
  // Başlangıç title
  helpBtn.title = (tourTexts[currentLang] || tourTexts.tr).helpTitle;
}

const langSelectForTour = document.getElementById('dilSecici');
if (langSelectForTour) {
  langSelectForTour.addEventListener('change', () => {
    const tl = tourTexts[langSelectForTour.value] || tourTexts.tr;
    const hb = document.getElementById('helpTour');
    if (hb) hb.title = tl.helpTitle;
  });
}

// İlk açılışta otomatik tur (bir kez)
try {
  if (localStorage.getItem('onboardingDone') !== '1') {
    setTimeout(() => startOnboarding(true), 700);
  }
} catch {}

// Ölen mirasçı checkbox event listener'ı
const deadChildCheckbox = document.getElementById('deadChildCheckbox');
const deadChildHeirsLabel = document.getElementById('deadChildHeirsLabel');

if (deadChildCheckbox && deadChildHeirsLabel) {
  deadChildCheckbox.addEventListener('change', (e) => {
    deadChildHeirsLabel.style.display = e.target.checked ? 'block' : 'none';
  });
}

// ==========================
// MIRASÇI RED KONTROLÜ
// ==========================
const mirascıRedCheckbox = document.getElementById('mirascıRedCheckbox');
const mirascıRedKontrolleri = document.getElementById('mirascıRedKontrolleri');

if (mirascıRedCheckbox && mirascıRedKontrolleri) {
  mirascıRedCheckbox.addEventListener('change', (e) => {
    mirascıRedKontrolleri.style.display = e.target.checked ? 'block' : 'none';
  });
}

// ==========================
// VASİYETNAME KONTROLÜ
// ==========================
const vasiyetnameCheckbox = document.getElementById('vasiyetnameCheckbox');
const vasiyetnameKontrolleri = document.getElementById('vasiyetnameKontrolleri');
const btnVasiyetnameEkle = document.getElementById('btnVasiyetnameEkle');
const vasiyetnameListe = document.getElementById('vasiyetnameListe');
let vasiyetnameler = [];

if (vasiyetnameCheckbox && vasiyetnameKontrolleri) {
  vasiyetnameCheckbox.addEventListener('change', (e) => {
    vasiyetnameKontrolleri.style.display = e.target.checked ? 'block' : 'none';
  });
}

if (btnVasiyetnameEkle) {
  btnVasiyetnameEkle.addEventListener('click', () => {
    const id = Date.now();
    vasiyetnameler.push({ id, ad: '', tutar: 0, tip: 'TL' });
    renderVasiyetnameler();
  });
}

function renderVasiyetnameler() {
  vasiyetnameListe.innerHTML = '';
  vasiyetnameler.forEach((v, idx) => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; gap:8px; margin-bottom:8px; align-items:center;';
    
    const input1 = document.createElement('input');
    input1.type = 'text';
    input1.placeholder = 'Kişi adı';
    input1.value = v.ad;
    input1.style.flex = '1';
    input1.addEventListener('change', (e) => { v.ad = e.target.value; });
    
    const input2 = document.createElement('input');
    input2.type = 'number';
    input2.placeholder = 'Tutar/Pay';
    input2.value = v.tutar;
    input2.min = '0';
    input2.style.width = '100px';
    input2.addEventListener('change', (e) => { v.tutar = Number(e.target.value); });
    
    const select = document.createElement('select');
    select.innerHTML = '<option value="TL">₺ (TL)</option><option value="%">% (Pay)</option>';
    select.value = v.tip;
    select.style.width = '80px';
    select.addEventListener('change', (e) => { v.tip = e.target.value; });
    
    const btnSil = document.createElement('button');
    btnSil.textContent = '✕';
    btnSil.className = 'btn outline';
    btnSil.style.cssText = 'padding:4px 8px; font-size:0.9em; cursor:pointer;';
    btnSil.addEventListener('click', () => {
      vasiyetnameler.splice(idx, 1);
      renderVasiyetnameler();
    });
    
    div.appendChild(input1);
    div.appendChild(input2);
    div.appendChild(select);
    div.appendChild(btnSil);
    vasiyetnameListe.appendChild(div);
  });
}
