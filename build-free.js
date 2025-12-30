const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Free (Serbest) sürümü build ediliyor...\n');

// .env.free'yi .env olarak kopyala
const envFree = path.join(__dirname, '.env.free');
const envMain = path.join(__dirname, '.env');
const envTrialBackup = path.join(__dirname, '.env.backup');

try {
  // Eğer .env varsa backup al
  if (fs.existsSync(envMain)) {
    fs.copyFileSync(envMain, envTrialBackup);
  }
  
  // .env.free'yi .env olarak ayarla
  fs.copyFileSync(envFree, envMain);
  
  // package.json'ı oku
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Free sürümü için artifactName'i değiştir
  const originalName = packageJson.build.artifactName;
  packageJson.build.artifactName = "TKM Miras Hesaplayıcı SERBEST Setup ${version}.exe";
  
  // package.json'ı geçici olarak değiştir
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  // electron-builder'ı çağır
  console.log('electron-builder çalıştırılıyor...');
  execSync('npx electron-builder', {
    cwd: __dirname,
    stdio: 'inherit'
  });
  
  console.log('\n✅ Free sürümü başarıyla build edildi!');
  
  // package.json'ı orijinal haline geri dön
  packageJson.build.artifactName = originalName;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  // .env'yi trial sürümüne geri dön
  if (fs.existsSync(envTrialBackup)) {
    fs.copyFileSync(envTrialBackup, envMain);
    fs.unlinkSync(envTrialBackup);
    console.log('✅ .env trial sürümüne geri dönüştürüldü');
  }
  
  // dist-free'ye yeniden adlandır
  const distPath = path.join(__dirname, 'dist');
  const distFreePath = path.join(__dirname, 'dist-free');
  if (fs.existsSync(distPath)) {
    if (fs.existsSync(distFreePath)) {
      fs.rmSync(distFreePath, { recursive: true, force: true });
    }
    fs.renameSync(distPath, distFreePath);
    console.log('✅ dist → dist-free olarak kaydedildi');
  }
  
  console.log('\n📂 Sürümler:\n  • dist-trial  (deneme sürümü - 30 gün trial)\n  • dist-free   (serbest sürüm - trial yok)');
  
} catch (error) {
  console.error('❌ Hata:', error.message);
  
  // Hata durumunda .env'yi geri dön
  try {
    if (fs.existsSync(envTrialBackup)) {
      fs.copyFileSync(envTrialBackup, envMain);
      fs.unlinkSync(envTrialBackup);
    }
  } catch (e) {}
  
  process.exit(1);
}
