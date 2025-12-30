export const varliklar = [];

export function varlikEkle(tip, ad, deger, borc = 0, paraBirimi = "TRY", kur = 1) {
  const numericDeger = Number(deger) || 0;
  const numericBorc = Number(borc) || 0;
  varliklar.push({
    id: Date.now(),
    tip,
    ad,
    deger: numericDeger,
    borc: numericBorc,
    paraBirimi,
    kur,
    degerTl: numericDeger * kur,
    borcTl: numericBorc * kur
  });
}

export function varlikSil(id) {
  const i = varliklar.findIndex(v => v.id === id);
  if (i !== -1) varliklar.splice(i, 1);
}
