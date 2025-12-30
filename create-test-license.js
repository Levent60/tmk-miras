const crypto = require('crypto');

/**
 * Test lisans anahtarı oluşturma script'i
 * Kullanım: node create-test-license.js
 */

console.log('🔐 RSA Key Pair & Test Lisans Anahtarı Oluşturuluyor...\n');

// RSA key pair oluştur (2048-bit)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

console.log('✅ RSA Key Pair Oluşturuldu\n');

// Test lisans datası
const licensee = 'Test Lisansı';
const expiry = '2026-12-31'; // 1 yıl sonra
const data = `${licensee}|${expiry}`;

// İmzala (RSA-SHA256)
const signer = crypto.createSign('RSA-SHA256');
signer.update(data);
signer.end();
const signature = signer.sign(privateKey, 'base64');

// Lisans nesnesi oluştur
const licenseObj = {
  licensee,
  expiry,
  sig: signature
};

const licenseString = JSON.stringify(licenseObj);

console.log('📋 Test Lisans Anahtarı (JSON formatı):');
console.log('─'.repeat(60));
console.log(licenseString);
console.log('─'.repeat(60));
console.log();

// Doğrulama testi
console.log('🔍 Doğrulama Testi...');
const verifier = crypto.createVerify('RSA-SHA256');
verifier.update(data);
verifier.end();
const isValid = verifier.verify(publicKey, Buffer.from(signature, 'base64'));
console.log(isValid ? '✅ İmza GEÇERLI' : '❌ İmza GEÇERSİZ');
console.log();

console.log('🔑 PUBLIC KEY (.env dosyasına eklenecek):');
console.log('─'.repeat(60));
console.log('LICENSE_PUBLIC_KEY="' + publicKey.replace(/\n/g, '\\n') + '"');
console.log('─'.repeat(60));
console.log();

console.log('📝 PRIVATE KEY (güvenli bir yerde sakla):');
console.log('─'.repeat(60));
console.log(privateKey);
console.log('─'.repeat(60));
console.log();

console.log('💾 .env dosyanızı şu şekilde güncelleyin:');
console.log(`LICENSE_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"`);
