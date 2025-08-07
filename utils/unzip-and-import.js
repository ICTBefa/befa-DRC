const AdmZip = require('adm-zip');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

async function unzipAndImport(zipPath) {
  const unzipDir = zipPath.replace(/\.zip$/, '');
  const zip = new AdmZip(zipPath);

  console.log('[STEP 4] Unzipping file to:', unzipDir);
  zip.extractAllTo(unzipDir, true);

  const sqlFileName = path.basename(zipPath, '.zip') + '.sql';
  const sqlFilePath = path.join(unzipDir, sqlFileName);

  if (!fs.existsSync(sqlFilePath)) {
    throw new Error(`SQL file ${sqlFileName} tidak ditemukan.`);
  }

  console.log('[STEP 4] Menjalankan MySQL import...');
  const mysqlDir = 'C:\\xampp\\mysql\\bin';
  const command = `cmd /c ".\\mysql.exe -u root < \"${sqlFilePath}\""`;

    // Jalankan MySQL import dengan redirection
    execSync(command, {
        cwd: mysqlDir,
        stdio: 'inherit',
    });
}

module.exports = { unzipAndImport };