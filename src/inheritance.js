export function hesaplaPaylar({ es, cocuklar, anne, baba, kardesler, hasDeadChild = false, deadChildHeirs = 0 }) {
  const m = [];

  // Eğer ölen bir çocuk varsa, per stirpes kuralı uygula
  if (hasDeadChild && deadChildHeirs > 0 && cocuklar.length > 0) {
    // Ölü olmayan çocukları hesapla
    const aliveCocuklar = cocuklar.length - 1;
    
    if (es) {
      m.push({ ad: "Eş", pay: 25 });
      
      // Ölü çocuğun payını hesapla (yaşasaydı alacağı pay)
      const deceasedChildShare = 75 / cocuklar.length;
      
      // Yaşayan çocuklara pay dağıt
      const livingChildShare = 75 / cocuklar.length;
      cocuklar.slice(0, aliveCocuklar).forEach(c => {
        m.push({ ad: c, pay: livingChildShare });
      });
      
      // Ölen çocuğun payını torununlara dağıt (per stirpes)
      const heirSharePerChild = deceasedChildShare / deadChildHeirs;
      for (let i = 1; i <= deadChildHeirs; i++) {
        m.push({ ad: `Torun ${i} (Çocuk'dan)`, pay: heirSharePerChild });
      }
    } else {
      // Eş yoksa, ölen çocuğun payı torununlara gider
      const deceasedChildShare = 100 / cocuklar.length;
      
      // Yaşayan çocuklara pay dağıt
      const livingChildShare = 100 / cocuklar.length;
      cocuklar.slice(0, aliveCocuklar).forEach(c => {
        m.push({ ad: c, pay: livingChildShare });
      });
      
      // Ölen çocuğun payını torununlara dağıt (per stirpes)
      const heirSharePerChild = deceasedChildShare / deadChildHeirs;
      for (let i = 1; i <= deadChildHeirs; i++) {
        m.push({ ad: `Torun ${i} (Çocuk'dan)`, pay: heirSharePerChild });
      }
    }
    return m;
  }

  if (cocuklar.length > 0) {
    if (es) {
      m.push({ ad: "Eş", pay: 25 });
      const p = 75 / cocuklar.length;
      cocuklar.forEach(c => m.push({ ad: c, pay: p }));
    } else {
      const p = 100 / cocuklar.length;
      cocuklar.forEach(c => m.push({ ad: c, pay: p }));
    }
    return m;
  }

  if (es && (anne || baba)) {
    m.push({ ad: "Eş", pay: 50 });
    const ebeveyn = (anne ? 1 : 0) + (baba ? 1 : 0);
    if (anne) m.push({ ad: "Anne", pay: 50 / ebeveyn });
    if (baba) m.push({ ad: "Baba", pay: 50 / ebeveyn });
    return m;
  }

  if (es) return [{ ad: "Eş", pay: 100 }];

  if (anne || baba) {
    const ebeveyn = (anne ? 1 : 0) + (baba ? 1 : 0);
    if (anne) m.push({ ad: "Anne", pay: 100 / ebeveyn });
    if (baba) m.push({ ad: "Baba", pay: 100 / ebeveyn });
    return m;
  }

  if (kardesler.length > 0) {
    if (es) {
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
