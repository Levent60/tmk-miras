#!/usr/bin/env node

/**
 * sync-versions.js
 * Desktop ve Mobile uygulamalarının version'larını senkronize eder
 * 
 * Kullanım: node sync-versions.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Version Sinkronizasyonu Başlatılıyor...\n');

try {
  // Desktop package.json'dan version oku
  const desktopPkgPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(desktopPkgPath)) {
    throw new Error('Desktop package.json bulunamadı');
  }

  const desktopPkg = JSON.parse(fs.readFileSync(desktopPkgPath, 'utf-8'));
  const desktopVersion = desktopPkg.version;

  if (!desktopVersion) {
    throw new Error('Desktop package.json\'da version bulunamadı');
  }

  console.log(`📦 Desktop Sürümü: ${desktopVersion}`);

  // Mobile app-trial.json güncelle
  const appTrialPath = path.join(__dirname, 'tkm-miras-mobile', 'app-trial.json');
  if (!fs.existsSync(appTrialPath)) {
    throw new Error('tkm-miras-mobile/app-trial.json bulunamadı');
  }

  const appTrial = JSON.parse(fs.readFileSync(appTrialPath, 'utf-8'));
  const oldTrialVersion = appTrial.version;
  appTrial.version = desktopVersion;
  fs.writeFileSync(appTrialPath, JSON.stringify(appTrial, null, 2) + '\n');
  console.log(`📱 Mobile Trial Sürümü Güncellendi: ${oldTrialVersion} → ${desktopVersion}`);

  // Mobile app-free.json güncelle
  const appFreePath = path.join(__dirname, 'tkm-miras-mobile', 'app-free.json');
  if (!fs.existsSync(appFreePath)) {
    throw new Error('tkm-miras-mobile/app-free.json bulunamadı');
  }

  const appFree = JSON.parse(fs.readFileSync(appFreePath, 'utf-8'));
  const oldFreeVersion = appFree.version;
  appFree.version = desktopVersion;
  fs.writeFileSync(appFreePath, JSON.stringify(appFree, null, 2) + '\n');
  console.log(`📱 Mobile Free Sürümü Güncellendi: ${oldFreeVersion} → ${desktopVersion}`);

  // Mobile package.json de güncelle
  const mobilePkgPath = path.join(__dirname, 'tkm-miras-mobile', 'package.json');
  if (fs.existsSync(mobilePkgPath)) {
    const mobilePkg = JSON.parse(fs.readFileSync(mobilePkgPath, 'utf-8'));
    const oldMobileVersion = mobilePkg.version;
    mobilePkg.version = desktopVersion;
    fs.writeFileSync(mobilePkgPath, JSON.stringify(mobilePkg, null, 2) + '\n');
    console.log(`📱 Mobile package.json Sürümü Güncellendi: ${oldMobileVersion} → ${desktopVersion}`);
  }

  console.log('\n✅ Tüm versiyonlar senkronize edildi!');
  console.log(`\n📝 Senkronize Edilen Sürüm: ${desktopVersion}`);
  console.log('📂 Dosyalar:');
  console.log('   • package.json');
  console.log('   • tkm-miras-mobile/app-trial.json');
  console.log('   • tkm-miras-mobile/app-free.json');
  console.log('   • tkm-miras-mobile/package.json');

} catch (error) {
  console.error('\n❌ Hata:', error.message);
  console.error('\n💡 Çözüm:');
  console.error('   - Dosya yollarını kontrol et');
  console.error('   - package.json\'da version alanının varlığını kontrol et');
  console.error('   - Mobile app json dosyalarının varlığını kontrol et');
  process.exit(1);
}
