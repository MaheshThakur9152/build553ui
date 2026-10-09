import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');

console.log('Building static site in public/...');

// Clean & create public directory
if (fs.existsSync(PUBLIC)) {
  fs.rmSync(PUBLIC, { recursive: true, force: true });
}
fs.mkdirSync(PUBLIC, { recursive: true });

// Files to copy from root
const rootFiles = [
  'index.html',
  'styles.css',
  'manifest.json',
  'config.json',
  '2509662.json',
  'playcanvas-stable.min.js',
  '__settings__.js',
  '__modules__.js',
  '__start__.js',
  '__loading__.js',
  '__game-scripts.js'
];

for (const f of rootFiles) {
  const src = path.join(ROOT, f);
  const dst = path.join(PUBLIC, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
  }
}

// Copy files/ directory recursively (delivering all 78 authentic binary assets)
function copyDir(srcDir, dstDir) {
  fs.mkdirSync(dstDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const dstPath = path.join(dstDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

if (fs.existsSync(path.join(ROOT, 'files'))) {
  copyDir(path.join(ROOT, 'files'), path.join(PUBLIC, 'files'));
}

console.log('Build complete. All authentic assets copied to public/.');
