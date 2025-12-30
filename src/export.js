console.log("EXPORT.JS BAŞTAN YÜKLENDİ");

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { jsPDF } = require("jspdf");
require("jspdf-autotable");

// Export fonksiyonlarını ipcRenderer ile başlatmak için factory pattern kullan
module.exports = function(ipcRenderer) {
  // =============================
  // FONT YÜKLEME
  // =============================
  function loadFont(doc) {
    const fontPath = path.join(__dirname, "fonts", "DejaVuSans.ttf");
    const font = fs.readFileSync(fontPath).toString("base64");

    doc.addFileToVFS("DejaVuSans.ttf", font);
    doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
    doc.setFont("DejaVu");
  }

  // =============================
  // NORMALIZE
  // =============================
  function normalize(data = []) {
    return data.map(r => ({
      varlikTip: r.varlikTip || r.tip || "",
      varlikAdi: r.varlikAdi || r.ad || "",
      mirasci: r.mirasci || "",
      pay: r.pay || r.oran || "",
      tutar: Number(r.tutar || 0)
    }));
  }

  // =============================
  // AVUKAT PDF
  // =============================
  async function exportAvukatPDF(payload) {
    const { meta, sonucData: rawData } = payload;
    const sonucData = normalize(rawData);

    if (!sonucData.length) {
      alert("PDF için veri bulunamadı");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    loadFont(doc);

  // =============================
  // BAŞLIK
  // =============================
  doc.setFontSize(14);
  doc.text(
    "TÜRK MEDENİ KANUNU\nMİRAS DAĞILIM RAPORU",
    105,
    15,
    { align: "center" }
  );

  doc.setFontSize(10);
  doc.text(`Dosya No: ${meta.dosyaNo}`, 14, 30);
  doc.text(`Düzenleme Tarihi: ${meta.tarih}`, 140, 30);

  doc.text(`Miras Bırakan: ${meta.mirasBirakan}`, 14, 36);
  if (meta.tc) {
    doc.text(`T.C. Kimlik No: ${meta.tc}`, 14, 42);
  }

  let y = meta.tc ? 50 : 46;

  // =============================
  // VARLIK BAZLI TABLOLAR
  // =============================
  const gruplu = {};
  sonucData.forEach(r => {
    const key = `${r.varlikTip} - ${r.varlikAdi}`;
    if (!gruplu[key]) gruplu[key] = [];
    gruplu[key].push(r);
  });

  Object.keys(gruplu).forEach(grup => {
    doc.setFontSize(11);
    doc.text(grup, 14, y);
    y += 4;

    doc.autoTable({
      startY: y,
      head: [["Mirasçı", "Pay (%)", "Tutar (₺)"]],
      body: gruplu[grup].map(r => [
        r.mirasci,
        Number(r.pay).toLocaleString("tr-TR", { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
        r.tutar.toLocaleString("tr-TR")
      ]),
      theme: "grid",
      styles: { font: "DejaVu", fontSize: 9 },
      headStyles: { font: "DejaVu" }
    });

    y = doc.lastAutoTable.finalY + 8;

    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  });

  // =============================
  // GENEL TOPLAM
  // =============================
  const toplamlar = {};
  sonucData.forEach(r => {
    toplamlar[r.mirasci] =
      (toplamlar[r.mirasci] || 0) + r.tutar;
  });

  doc.addPage();
  doc.text("GENEL TOPLAM", 14, 15);

  doc.autoTable({
    startY: 20,
    head: [["Mirasçı", "Toplam Tutar (₺)"]],
    body: Object.keys(toplamlar).map(ad => [
      ad,
      toplamlar[ad].toLocaleString("tr-TR")
    ]),
    theme: "grid",
    styles: { font: "DejaVu" },
    headStyles: { font: "DejaVu" }
  });

  // =============================
  // AÇIKLAMA + FOOTER
  // =============================
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFontSize(8);
    doc.text(
      "Bu rapor Türk Medeni Kanunu’nun 495–682. maddeleri dikkate alınarak bilgilendirme amacıyla oluşturulmuştur.",
      14,
      285
    );

    doc.text(
      `Sayfa ${i} / ${pageCount}`,
      190,
      285,
      { align: "right" }
    );
  }

  // Kaydetme konumu sor ve dosyayı yaz
  const savePath = await ipcRenderer.invoke('show-save-dialog', {
    title: "PDF Kaydet",
    defaultPath: "miras-avukat.pdf",
    filters: [{ name: "PDF", extensions: ["pdf"] }]
  });
  if (savePath) {
    const pdfArrayBuffer = doc.output('arraybuffer');
    fs.writeFileSync(savePath, Buffer.from(pdfArrayBuffer));
  }
}


  // =============================
  // E-DEVLET PDF
  // =============================
  async function exportEdevletPDF(rawData) {
    const sonucData = normalize(rawData);
    if (!sonucData.length) return;

    const doc = new jsPDF("p", "mm", "a4");
    loadFont(doc);

    doc.setFontSize(13);
    doc.text("MİRAS PAYLAŞIM ÖZETİ", 105, 20, { align: "center" });

    const toplamlar = {};
    sonucData.forEach(r => {
      toplamlar[r.mirasci] =
        (toplamlar[r.mirasci] || 0) + r.tutar;
    });

    doc.autoTable({
      startY: 30,
      head: [["Mirasçı", "Toplam Tutar (₺)"]],
      body: Object.keys(toplamlar).map(ad => [
        ad,
        toplamlar[ad].toLocaleString("tr-TR")
      ]),
      theme: "grid",
      styles: { font: "DejaVu" }
    });

    const savePath = await ipcRenderer.invoke('show-save-dialog', {
      title: "PDF Kaydet",
      defaultPath: "miras-edevlet.pdf",
      filters: [{ name: "PDF", extensions: ["pdf"] }]
    });
    if (savePath) {
      const pdfArrayBuffer = doc.output('arraybuffer');
      fs.writeFileSync(savePath, Buffer.from(pdfArrayBuffer));
    }
  }

  // =============================
  // EXCEL
  // =============================
  function exportExcel(rawData) {
    const sonucData = normalize(rawData);

    const ws = XLSX.utils.json_to_sheet(sonucData);
    // Pay sütununu 3 ondalıkla formatla
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      // Başlık satırında 'pay' sütununu bul
      let payCol = null;
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r: range.s.r, c });
        const cell = ws[addr];
        if (cell && String(cell.v).toLowerCase() === 'pay') {
          payCol = c;
          break;
        }
      }
      if (payCol !== null) {
        for (let r = range.s.r + 1; r <= range.e.r; r++) {
          const addr = XLSX.utils.encode_cell({ r, c: payCol });
          const cell = ws[addr];
          if (cell) {
            const val = Number(cell.v);
            if (!isNaN(val)) {
              cell.v = val;
              cell.t = 'n';
              cell.z = '0.000';
            }
          }
        }
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Miras");

    XLSX.writeFile(wb, "miras.xlsx");
  }

  // Export fonksiyonlarını return et
  return {
    exportAvukatPDF,
    exportEdevletPDF,
    exportExcel
  };
