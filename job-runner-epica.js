const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { unzipAndImportEpica } = require('./utils/unzip-and-import-epica');

// Step 1: Git Pull
console.log('[STEP 1] Git pull...');
execSync('git pull', { stdio: 'inherit' });

// Step 2: Detect file
const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const filePrefix = `befa_epica${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
const zDrive = 'Z:\\';
const targetDir = 'D:\\GIT\\test\\';

// Cari semua file zip hari ini
const zipFilesToday = fs.readdirSync(zDrive)
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
        time: fs.statSync(path.join(zDrive, name)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)[0].name;

console.log('[STEP 2] File ditemukan:', zipFileName);

// Step 3: Copy ke target
const src = path.join(zDrive, zipFileName);
const dest = path.join(targetDir, zipFileName);
fs.copyFileSync(src, dest);
console.log('[STEP 3] File berhasil dicopy ke', dest);

// Step 4: Unzip & Import SQL
unzipAndImportEpica(dest)
  .then(() => {
    // Step 5: PM2 Restart
    console.log('[STEP 5] Restarting PM2...');
    execSync('pm2 restart epica', { stdio: 'inherit' });
    console.log('[DONE] Semua proses selesai.');
  })
  .catch(err => {
    console.error('[ERROR] Gagal dalam unzip/import:', err);
  });
