const fs = require('fs');
const path = require('path');

// SVG dosyasını oku
const svgPath = path.join(__dirname, 'assets', 'icon.svg');
const pngPath = path.join(__dirname, 'assets', 'icon.png');
const icoPath = path.join(__dirname, 'assets', 'icon.ico');

// node-canvas kullanarak SVG'yi PNG'ye dönüştür
try {
  // Canvas yükle (built-in Node.js Canvas)
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');

  // Arka plan: mavi
  ctx.fillStyle = '#0078D4';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillRect(0, 0, 256, 256); // Yuvarlatılmış köşeler için (manuel)

  // Terazi çizim
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;

  // Orta noktaya taşı
  const centerX = 128;
  const centerY = 128;

  // Terazi çubuğu (yatay çizgi)
  ctx.beginPath();
  ctx.moveTo(centerX - 80, centerY);
  ctx.lineTo(centerX + 80, centerY);
  ctx.stroke();

  // Sol kefe (daire)
  ctx.beginPath();
  ctx.arc(centerX - 80, centerY - 40, 20, 0, Math.PI * 2);
  ctx.fill();

  // Sağ kefe (daire)
  ctx.beginPath();
  ctx.arc(centerX + 80, centerY - 40, 20, 0, Math.PI * 2);
  ctx.fill();

  // Orta destek (dikey çizgi)
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX, centerY + 60);
  ctx.stroke();

  // PNG olarak kaydet
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(pngPath, buffer);
  console.log('✓ Icon PNG olarak oluşturuldu:', pngPath);

  // ICO üret (png-to-ico)
  try {
    import('png-to-ico')
      .then(mod => mod.default ? mod.default(pngPath) : mod(pngPath))
      .then(buf => {
        fs.writeFileSync(icoPath, buf);
        console.log('✓ Icon ICO olarak oluşturuldu:', icoPath);
      })
      .catch(err => {
        console.error('ICO oluşturulamadı:', err && err.message ? err.message : err);
      });
  } catch (e) {
    console.error('png-to-ico yüklü değil veya yüklenemedi. Kurmak için: npm install png-to-ico');
    console.error(e && e.message);
  }
} catch (error) {
  console.error('Canvas yüklenemiyor. npm install canvas ile kurabilirsin.');
  console.error(error.message);
}
