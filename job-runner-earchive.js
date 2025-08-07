const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { unzipAndImport } = require('./utils/unzip-and-import');
const { sendEmailNotif } = require('./send-email-notif');

// Step 1: Git Pull
console.log('[STEP 1] Git pull...');
const gitDir = 'D:\\GIT\\earchive';
execSync('git pull', {
  cwd: gitDir,
  stdio: 'inherit'
});

// Step 2: Detect file
const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const filePrefix = `befa_earchive${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
const wDrive = 'W:\\';
const targetDir = 'D:\\GIT\\test\\';

// Cari semua file zip hari ini
const zipFilesToday = fs.readdirSync(wDrive)
    .filter(name => name.startsWith(filePrefix) && name.endsWith('.zip'));

// Kalau tidak ada file
if (zipFilesToday.length === 0) {
    console.error('[ERROR] Tidak ada file ZIP untuk hari ini.');
    process.exit(1);
}

// Ambil file terbaru berdasarkan waktu modifikasi (mtime)
const zipFileName = zipFilesToday
    .map(name => ({
        name,
        time: fs.statSync(path.join(wDrive, name)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)[0].name;

console.log('[STEP 2] File ditemukan:', zipFileName);

// Step 3: Copy ke target
const src = path.join(wDrive, zipFileName);
const dest = path.join(targetDir, zipFileName);
fs.copyFileSync(src, dest);
console.log('[STEP 3] File berhasil dicopy ke', dest);

// Step 4: Unzip & Import SQL
unzipAndImport(dest)
  .then(() => {
    // Step 5: PM2 Restart
    console.log('[STEP 5] Restarting PM2...');
    execSync('pm2 restart earchive', { stdio: 'inherit' });
    console.log('[DONE] Semua proses selesai.');

    // ✅ Email Notifikasi Berhasil
    sendEmailNotif({
      subject: `[BERHASIL] JobRunner DRC Earchive - ${zipFileName}`,
      html: `
        <p>Dear Group ICT,</p>
        <p><strong>JobRunner EARCHIVE berhasil</strong> dijalankan pada <strong>${new Date().toLocaleString()}</strong>.</p>
        <p>File: <code>${zipFileName}</code></p>
        <p>Folder tujuan: <code>${dest}</code></p>
        <p>Status DRC EARCHIVE: ✅ AMAN</p>
        <br><p>👍</p>
        <br>
        <p>Terima Kasih</p>
      `
    });
  })
  .catch(err => {
    console.error('[ERROR] Gagal dalam unzip/import:', err);

    // ❌ Email Notifikasi Gagal
    sendEmailNotif({
      subject: `[GAGAL] JobRunner DRC EARCHIVE - ${zipFileName}`,
      html: `
        <p>Dear Group ICT,</p>
        <p><strong>JobRunner EARCHIVE gagal</strong> dijalankan pada <strong>${new Date().toLocaleString()}</strong>.</p>
        <p>File: <code>${zipFileName}</code></p>
        <p>Error:</p>
        <pre>${err}</pre>
        <p>Status DRC EARCHIVE: ❌ BERMASALAH</p>
        <br><p>❌</p>
        <br>
        <p>MOHON SEGERA DI TINDAK LANJUTI.</p>
        <br>
        <p>Terima Kasih</p>
      `,
      isError: true
    });
  });
