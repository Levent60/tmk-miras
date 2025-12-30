const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Trial PORTABLE sürümü build ediliyor...\n');

const envPath = path.join(__dirname, '.env');
const envTrialPath = path.join(__dirname, '.env.trial');
const envBackupPath = path.join(__dirname, '.env.backup');
const packageJsonPath = path.join(__dirname, 'package.json');
let packageJson = null;
let originalTarget = null;

try {
  // Dosyaların var olup olmadığını kontrol et
  if (!fs.existsSync(envTrialPath)) {
    throw new Error('.env.trial dosyası bulunamadı');
  }
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json dosyası bulunamadı');
  }

  // .env.trial'ı .env olarak kopyala
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, envBackupPath);
  }
  fs.copyFileSync(envTrialPath, envPath);
  console.log('✅ .env.trial → .env kopyalandı');

  // package.json'ı oku
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (e) {
    throw new Error(`package.json okunamadı: ${e.message}`);
  }

  originalTarget = (packageJson.build?.win?.target) || 'nsis';
  
  // Win config'ini portable olarak ayarla
  if (!packageJson.build) packageJson.build = {};
  if (!packageJson.build.win) packageJson.build.win = {};
  packageJson.build.win.target = 'portable';
  
  // Artifact name'i de portable exe olarak ayarla
  packageJson.build.artifactName = 'TKM Miras Hesaplayıcı Trial Portable ${version}.exe';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json (portable) ayarlandı');

  // electron-builder portable'ı çağır (trial .env ile)
  console.log('\n🔨 electron-builder (portable) çalıştırılıyor...');
  try {
    execSync('npx electron-builder', {
      cwd: __dirname,
      stdio: 'inherit'
    });
  } catch (e) {
    throw new Error(`electron-builder başarısız: ${e.message}`);
  }
  
  console.log('\n✅ Trial PORTABLE sürümü başarıyla build edildi!');

} catch (error) {
  console.error('\n❌ HATA:', error.message);
  process.exit(1);

} finally {
  // Temizlik: dist-trial-portable'ye yeniden adlandır
  try {
    const distPath = path.join(__dirname, 'dist');
    const distTrialPortablePath = path.join(__dirname, 'dist-trial-portable');
    if (fs.existsSync(distPath)) {
      if (fs.existsSync(distTrialPortablePath)) {
        fs.rmSync(distTrialPortablePath, { recursive: true, force: true });
      }
      fs.renameSync(distPath, distTrialPortablePath);
      console.log('✅ dist → dist-trial-portable olarak kaydedildi');
    }
  } catch (e) {
    console.error('⚠️  dist yeniden adlandırılamadı:', e.message);
  }

  // Temizlik: package.json'ı eski haline döndür
  try {
    if (packageJson && originalTarget !== null) {
      packageJson.build.win.target = originalTarget;
      delete packageJson.build.artifactName;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ package.json restore edildi');
    }
  } catch (e) {
    console.error('⚠️  package.json restore edilemedi:', e.message);
  }

  // Temizlik: .env'yi eski haline döndür
  try {
    if (fs.existsSync(envBackupPath)) {
      fs.copyFileSync(envBackupPath, envPath);
      fs.unlinkSync(envBackupPath);
      console.log('✅ .env restore edildi');
    }
  } catch (e) {
    console.error('⚠️  .env restore edilemedi:', e.message);
  }
}
