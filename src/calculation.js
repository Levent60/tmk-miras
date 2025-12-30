import { hesaplaPaylar } from "./inheritance.js";

export function varlikBazliDagitim(varliklar, mirascilar) {
  const tumSonuclar = [];

  varliklar.forEach(varlik => {
    const degerTl = varlik.degerTl != null ? varlik.degerTl : varlik.deger;
    const borcTl = varlik.borcTl != null ? varlik.borcTl : (varlik.borc || 0);
    const netDeger = degerTl - borcTl;
    const paylar = hesaplaPaylar(mirascilar);

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
