const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Free (Serbest) PORTABLE sürümü build ediliyor...\n');

// .env.free'yi .env olarak kopyala
const envFree = path.join(__dirname, '.env.free');
const envMain = path.join(__dirname, '.env');
const envBackup = path.join(__dirname, '.env.backup');
const packageJsonPath = path.join(__dirname, 'package.json');
let packageJson = null;
let originalName = null;
let originalTarget = null;

try {
  // Dosyaların var olup olmadığını kontrol et
  if (!fs.existsSync(envFree)) {
    throw new Error('.env.free dosyası bulunamadı');
  }
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json dosyası bulunamadı');
  }
  
  // Eğer .env varsa backup al
  if (fs.existsSync(envMain)) {
    fs.copyFileSync(envMain, envBackup);
  }
  
  // .env.free'yi .env olarak ayarla
  fs.copyFileSync(envFree, envMain);
  console.log('✅ .env.free → .env kopyalandı');
  
  // package.json'ı oku
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (e) {
    throw new Error(`package.json okunamadı: ${e.message}`);
  }
  
  // Gerekli property'leri kontrol et
  if (!packageJson.build) packageJson.build = {};
  if (!packageJson.build.win) packageJson.build.win = {};
  
  // Free PORTABLE sürümü için artifactName'i değiştir
  originalName = packageJson.build.artifactName;
  packageJson.build.artifactName = "TKM Miras Hesaplayıcı SERBEST Portable ${version}.exe";
  
  // win.target'i 'portable' olarak geçici ayarla
  originalTarget = packageJson.build.win.target || 'nsis';
  packageJson.build.win.target = 'portable';
  
  // package.json'ı yazma
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json (portable) ayarlandı');

  // electron-builder portable'ı çağır
  console.log('\n🔨 electron-builder (portable) çalıştırılıyor...');
  try {
    execSync('npx electron-builder', {
      cwd: __dirname,
      stdio: 'inherit'
    });
  } catch (e) {
    throw new Error(`electron-builder başarısız: ${e.message}`);
  }
  
  console.log('\n✅ Free PORTABLE sürümü başarıyla build edildi!');

} catch (error) {
  console.error('\n❌ HATA:', error.message);
  process.exit(1);

} finally {
  // Temizlik: package.json'ı orijinal haline geri dön
  try {
    if (packageJson && packageJsonPath && originalName !== null && originalTarget !== null) {
      packageJson.build.artifactName = originalName;
      packageJson.build.win.target = originalTarget;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ package.json restore edildi');
    }
  } catch (e) {
    console.error('⚠️  package.json restore edilemedi:', e.message);
  }
  
  // Temizlik: .env'yi geri dön
  try {
    if (fs.existsSync(envBackup)) {
      fs.copyFileSync(envBackup, envMain);
      fs.unlinkSync(envBackup);
      console.log('✅ .env restore edildi');
    }
  } catch (e) {
    console.error('⚠️  .env restore edilemedi:', e.message);
  }
  
  // dist'i dist-free-portable'ye yeniden adlandır
  try {
    const distPath = path.join(__dirname, 'dist');
    const distFreePortablePath = path.join(__dirname, 'dist-free-portable');
    if (fs.existsSync(distPath)) {
      if (fs.existsSync(distFreePortablePath)) {
        fs.rmSync(distFreePortablePath, { recursive: true, force: true });
      }
      fs.renameSync(distPath, distFreePortablePath);
      console.log('✅ dist → dist-free-portable olarak kaydedildi');
    }
  } catch (e) {
    console.error('⚠️  dist yeniden adlandırılamadı:', e.message);
  }
}
} catch (error) {
  console.error('❌ Hata:', error.message);
  
  // Hata durumunda .env'yi geri dön
  try {
    if (fs.existsSync(envBackup)) {
      fs.copyFileSync(envBackup, envMain);
      fs.unlinkSync(envBackup);
    }
  } catch (e) {}
  
  process.exit(1);
}
