import { hesaplaPaylar } from "./inheritance.js";

export function varlikBazliDagitim(varliklar, mirascilar) {
  const tumSonuclar = [];
  const paylar = hesaplaPaylar(mirascilar);

  varliklar.forEach(varlik => {
    const degerTl = varlik.degerTl != null ? varlik.degerTl : varlik.deger;
    const borcTl = varlik.borcTl != null ? varlik.borcTl : (varlik.borc || 0);
    const netDeger = degerTl - borcTl;

    paylar.forEach(p => {
      tumSonuclar.push({
        varlikTip: varlik.tip,
        varlikAdi: varlik.ad,
        mirasci: p.ad,
        pay: p.pay,
        tutar: (netDeger * p.pay / 100).toFixed(2)
      });
    });
  });

  return tumSonuclar;
}

/**
 * USA Intestate Succession (Uniform Probate Code based)
 * Rules vary by state, this follows typical UPC model
 */
export function hesaplaPaylarUSA({ es, cocuklar, anne, baba, kardesler }) {
  const m = [];

  // Priority 1: Children
  if (cocuklar.length > 0) {
    if (es) {
      // Spouse gets 1/3, children split 2/3
      m.push({ ad: "Spouse", pay: 33.33 });
      const childShare = 66.67 / cocuklar.length;
      cocuklar.forEach(c => m.push({ ad: c, pay: childShare }));
    } else {
      // Children split estate equally
      const childShare = 100 / cocuklar.length;
      cocuklar.forEach(c => m.push({ ad: c, pay: childShare }));
    }
    return m;
  }

  // Priority 2: Spouse + Parents
  if (es && (anne || baba)) {
    // Spouse gets 3/4, parents get 1/4
    m.push({ ad: "Spouse", pay: 75 });
    const parentCount = (anne ? 1 : 0) + (baba ? 1 : 0);
    const parentShare = 25 / parentCount;
    if (anne) m.push({ ad: "Mother", pay: parentShare });
    if (baba) m.push({ ad: "Father", pay: parentShare });
    return m;
  }

  // Priority 3: Spouse only
  if (es) return [{ ad: "Spouse", pay: 100 }];

  // Priority 4: Parents
  if (anne || baba) {
    const parentCount = (anne ? 1 : 0) + (baba ? 1 : 0);
    const parentShare = 100 / parentCount;
    if (anne) m.push({ ad: "Mother", pay: parentShare });
    if (baba) m.push({ ad: "Father", pay: parentShare });
    return m;
  }

  // Priority 5: Siblings (if no spouse, parents, or children)
  if (kardesler && kardesler.length > 0) {
    const siblingShare = 100 / kardesler.length;
    kardesler.forEach(k => m.push({ ad: k, pay: siblingShare }));
    return m;
  }

  // If no heirs, estate goes to state
  return [{ ad: "State", pay: 100 }];
}
