const fs = require('fs');
const path = require('path');
const fse = require('fs-extra'); // npm install fs-extra
const { sendEmailNotif } = require('./send-email-notif');

const sourceRoot = 'X:\\';
const targetRoot = 'D:\\GIT\\test\\';

// Map hari ke nomor dan nama
const dayMap = {
  0: { num: 7, name: 'Minggu' },
  1: { num: 1, name: 'Senin' },
  2: { num: 2, name: 'Selasa' },
  3: { num: 3, name: 'Rabu' },
  4: { num: 4, name: 'Kamis' },
  5: { num: 5, name: 'Jumat' },
  6: { num: 6, name: 'Sabtu' },
};

const now = new Date();
const dayInfo = dayMap[now.getDay()];
const year = now.getFullYear();
const month = now.getMonth(); // 0-based

// Hitung minggu ke berapa dalam bulan
const firstDay = new Date(year, month, 1);
let weekCount = 0;
for (let d = 1; d <= now.getDate(); d++) {
  const current = new Date(year, month, d);
  if (current.getDay() === 1) { // Senin
    weekCount++;
  }
}

// Cek ganjil/genap
const weekType = (weekCount % 2 === 0) ? '2 - 4' : '1 - 3';

// Nama folder
const folderName = `${dayInfo.num} ${dayInfo.name} ${weekType}`;
const sourceFolder = path.join(sourceRoot, folderName);
const targetFolder = path.join(targetRoot, folderName);

console.log(`[INFO] Hari ini: ${dayInfo.name}, minggu ke-${weekCount} (${weekType.includes('1') ? 'ganjil' : 'genap'})`);
console.log(`[STEP 1] Mencari folder: ${folderName}`);

// Validasi folder ada
if (!fs.existsSync(sourceFolder)) {
  console.error(`[ERROR] Folder tidak ditemukan: ${sourceFolder}`);
  process.exit(1);
}

console.log(`[STEP 2] Menyalin folder dari ${sourceFolder} ke ${targetFolder}...`);

try {
  fse.copySync(sourceFolder, targetFolder, { overwrite: true });
  console.log('[DONE] Folder berhasil disalin.');

  // ✅ Email Notifikasi Berhasil
  sendEmailNotif({
    subject: 'COPY FOLDER DRC IFCA BERHASIL',
    html: `
      <p>Dear ICT Team,</p>
      <p>Berhasil menyalin folder <b>${folderName}</b> dari X (QNAP) ke D (DRC).</p>
      <p>Waktu: ${new Date()}</p>
      <p>Status DRC EARCHIVE: ✅ AMAN</p>
      <p>Terima kasih.</p>
    `
  });
} catch (err) {
  console.error('[ERROR] Gagal menyalin folder:', err);

  // ❌ Email Notifikasi Gagal
  sendEmailNotif({
    subject: 'COPY FOLDER DRC IFCA GAGAL',
    html: `
      <p>Dear ICT Team,</p>
      <p>Gagal menyalin folder <b>${folderName}</b> dari X (QNAP) ke D (DRC).</p>
      <p>Error:</p>
      <pre>${err.toString()}</pre>
      <p>Waktu: ${new Date()}</p>
      <p>Status DRC EARCHIVE: ❌ BERMASALAH</p>
      <br>
      <p>MOHON SEGERA DI TINDAK LANJUTI.</p>
      <br>
      <p>Terima Kasih</p>
    `
  });
}