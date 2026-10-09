import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');

// 1x1 transparent PNG
const TRANSPARENT_PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

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

// Copy files/ directory recursively
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

// Create 1x1 fallback images in public for any textures referenced in config.json that lack a file
const configPath = path.join(ROOT, 'config.json');
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  let fallbackCount = 0;
  for (const asset of Object.values(config.assets || {})) {
    if (asset.file && asset.file.url) {
      const pubFilePath = path.join(PUBLIC, asset.file.url);
      if (!fs.existsSync(pubFilePath)) {
        const ext = path.extname(pubFilePath).toLowerCase();
        if (['.webp', '.png', '.jpg', '.jpeg'].includes(ext)) {
          fs.mkdirSync(path.dirname(pubFilePath), { recursive: true });
          fs.writeFileSync(pubFilePath, TRANSPARENT_PNG_1X1);
          fallbackCount++;
        }
      }
    }
  }
  console.log(`Generated ${fallbackCount} fallback textures.`);
}

console.log('Build complete. Public folder ready for Vercel static deployment.');
