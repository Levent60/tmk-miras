export function hesaplaPaylar({ es, cocuklar, anne, baba, kardesler, olmusCocuklar = [], mirascıRedAlanlar = [] }) {
  const m = [];

  // Mirasçı red durumunu kontrol et
  let esVar = es && !mirascıRedAlanlar.includes('es');
  let anneVar = anne && !mirascıRedAlanlar.includes('anne');
  let babaVar = baba && !mirascıRedAlanlar.includes('baba');
  
  // Rededen mirasçıların payı diğerlerine dağılır
  let redEdenPayOrani = 0;
  if (es && mirascıRedAlanlar.includes('es')) redEdenPayOrani += 1; // Eş reddiyse payı artar
  if (anne && mirascıRedAlanlar.includes('anne')) redEdenPayOrani += 1;
  if (baba && mirascıRedAlanlar.includes('baba')) redEdenPayOrani += 1;

  // Eğer ölen çocuklar varsa, per stirpes kuralı uygula
  if (olmusCocuklar && olmusCocuklar.length > 0 && cocuklar.length > 0) {
    // Yaşayan çocukları belirle
    const yaşayanCocukIndeksleri = new Set();
    for (let i = 1; i <= cocuklar.length; i++) {
      if (!olmusCocuklar.some(oc => oc.cocukIndex === i)) {
        yaşayanCocukIndeksleri.add(i);
      }
    }
    const yaşayanCocukSayisi = yaşayanCocukIndeksleri.size;

    if (esVar) {
      m.push({ ad: "Eş", pay: 25 });
      
      // Her yaşayan çocuğa eşit pay dağıt (toplam çocuk sayısına göre 75%)
      const yaşayanPayi = 75 / cocuklar.length;
      for (const index of yaşayanCocukIndeksleri) {
        m.push({ ad: cocuklar[index - 1], pay: yaşayanPayi });
      }
      
      // Ölen her çocuğun payını torununlara dağıt (per stirpes)
      olmusCocuklar.forEach((oc, idx) => {
        const deceasedShare = 75 / cocuklar.length;
        const heirShare = deceasedShare / oc.varisCount;
        for (let j = 1; j <= oc.varisCount; j++) {
          m.push({ ad: `Torun ${j} (Çocuk ${oc.cocukIndex}'den)`, pay: heirShare });
        }
      });
    } else {
      // Eş yoksa
      const yaşayanPayi = 100 / cocuklar.length;
      for (const index of yaşayanCocukIndeksleri) {
        m.push({ ad: cocuklar[index - 1], pay: yaşayanPayi });
      }
      
      // Ölen her çocuğun payını torununlara dağıt (per stirpes)
      olmusCocuklar.forEach((oc, idx) => {
        const deceasedShare = 100 / cocuklar.length;
        const heirShare = deceasedShare / oc.varisCount;
        for (let j = 1; j <= oc.varisCount; j++) {
          m.push({ ad: `Torun ${j} (Çocuk ${oc.cocukIndex}'den)`, pay: heirShare });
        }
      });
    }
    return m;
  }

  if (cocuklar.length > 0) {
    if (esVar) {
      m.push({ ad: "Eş", pay: 25 });
      const p = 75 / cocuklar.length;
      cocuklar.forEach(c => m.push({ ad: c, pay: p }));
    } else {
      const p = 100 / cocuklar.length;
      cocuklar.forEach(c => m.push({ ad: c, pay: p }));
    }
    return m;
  }

  if (esVar && (anneVar || babaVar)) {
    m.push({ ad: "Eş", pay: 50 });
    const ebeveyn = (anneVar ? 1 : 0) + (babaVar ? 1 : 0);
    if (anneVar) m.push({ ad: "Anne", pay: 50 / ebeveyn });
    if (babaVar) m.push({ ad: "Baba", pay: 50 / ebeveyn });
    return m;
  }

  if (esVar) return [{ ad: "Eş", pay: 100 }];

  if (anneVar || babaVar) {
    const ebeveyn = (anneVar ? 1 : 0) + (babaVar ? 1 : 0);
    if (anneVar) m.push({ ad: "Anne", pay: 100 / ebeveyn });
    if (babaVar) m.push({ ad: "Baba", pay: 100 / ebeveyn });
    return m;
  }

  if (kardesler.length > 0) {
    if (esVar) {
      m.push({ ad: "Eş", pay: 50 });
      const p = 50 / kardesler.length;
      kardesler.forEach(k => m.push({ ad: k, pay: p }));
    } else {
      const p = 100 / kardesler.length;
      kardesler.forEach(k => m.push({ ad: k, pay: p }));
    }
    return m;
  }

  return [{ ad: "Hazine", pay: 100 }];
}
