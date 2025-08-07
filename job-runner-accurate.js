const fs = require('fs');
const path = require('path');
const fse = require('fs-extra'); // npm install fs-extra
const { sendEmailNotif } = require('./send-email-notif');

// Setup direktori sumber dan tujuan
const sourceRoot = 'Y:\\';
const targetRoot = 'D:\\GIT\\test\\';

// Format tanggal hari ini: YYYY-MM-DD
const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

// Cek isi direktori Y:\
const folders = fs.readdirSync(sourceRoot, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name === todayStr)
  .map(dirent => dirent.name);

if (folders.length === 0) {
  console.error(`[ERROR] Folder dengan nama ${todayStr} tidak ditemukan di ${sourceRoot}`);
  process.exit(1);
}

const folderName = folders[0];
const sourceFolder = path.join(sourceRoot, folderName);
const targetFolder = path.join(targetRoot, folderName);

console.log(`[STEP 1] Folder ditemukan: ${folderName}`);
console.log(`[STEP 2] Menyalin dari ${sourceFolder} ke ${targetFolder}...`);

try {
  fse.copySync(sourceFolder, targetFolder, { overwrite: true });
  console.log('[DONE] Folder berhasil disalin.');

  // ✅ Email Notifikasi Berhasil
  sendEmailNotif({
    subject: 'COPY FOLDER DRC ACCURATE BERHASIL',
    html: `
      <p>Dear ICT Team,</p>
      <p>Berhasil menyalin folder <b>${folderName}</b> dari Y (QNAP) ke D (DRC).</p>
      <p>Waktu: ${new Date()}</p>
      <p>Status DRC EARCHIVE: ✅ AMAN</p>
      <br>
      <p>Terima kasih.</p>
    `
  });
} catch (err) {
  console.error('[ERROR] Gagal menyalin folder:', err);

  // ❌ Email Notifikasi Gagal
  sendEmailNotif({
    subject: 'COPY FOLDER DRC ACCURATE GAGAL',
    html: `
      <p>Dear ICT Team,</p>
      <p>Gagal menyalin folder <b>${folderName}</b> dari Y (QNAP) ke D (DRC).</p>
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