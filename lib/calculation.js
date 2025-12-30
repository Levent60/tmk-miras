import { hesaplaPaylar } from "./inheritance.js";

/**
 * Calculates per-asset inheritance distribution
 * @param {Array} varliklar - Assets array with properties: tip, ad, deger/degerTl, borc/borcTl
 * @param {Object} mirascilar - Heir object with properties: es, cocuklar[], anne, baba, kardesler[]
 * @returns {Array} Detailed distribution results with varlikTip, varlikAdi, mirasci, pay, tutar
 */
export function varlikBazliDagitim(varliklar, mirascilar) {
  const tumSonuclar = [];

  varliklar.forEach(varlik => {
    // Handle both TL (Turkish Lira) and regular value fields
    const degerTl = varlik.degerTl != null ? varlik.degerTl : varlik.deger;
    const borcTl = varlik.borcTl != null ? varlik.borcTl : (varlik.borc || 0);
    
    // Net value = value - debt
    const netDeger = degerTl - borcTl;
    
    // Get inheritance shares for this asset
    const paylar = hesaplaPaylar(mirascilar);

    // Calculate amount each heir receives
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
