import fs from 'node:fs';

const svg = fs.readFileSync('D:/ui/rebuild/public/build553_logo.svg', 'utf8');
const escapedSvg = svg.replace(/"/g, '\\"');

// 1. Update __game-scripts.js
let gameScripts = fs.readFileSync('D:/ui/rebuild/__game-scripts.js', 'utf8');
const gsIdx = gameScripts.indexOf('OverlayManager.LOGO_SVG="');
if (gsIdx !== -1) {
  const gsEnd = gameScripts.indexOf('",OverlayManager.SOUND_SVG', gsIdx);
  gameScripts = gameScripts.slice(0, gsIdx + 'OverlayManager.LOGO_SVG="'.length) +
                escapedSvg +
                gameScripts.slice(gsEnd);
  fs.writeFileSync('D:/ui/rebuild/__game-scripts.js', gameScripts);
  console.log('Updated OverlayManager.LOGO_SVG in __game-scripts.js');
} else {
  console.warn('OverlayManager.LOGO_SVG not found in __game-scripts.js');
}

// 2. Update __loading__.js
let loading = fs.readFileSync('D:/ui/rebuild/__loading__.js', 'utf8');
const loadIdx = loading.indexOf("logo.id = 'custom-splash-logo';");
if (loadIdx !== -1) {
  const htmlStart = loading.indexOf('logo.innerHTML = [', loadIdx);
  const htmlEnd = loading.indexOf('].join("");', htmlStart);
  loading = loading.slice(0, htmlStart) +
            'logo.innerHTML = ["' + escapedSvg + '"].join("");' +
            loading.slice(htmlEnd + '].join("");'.length);
  fs.writeFileSync('D:/ui/rebuild/__loading__.js', loading);
  console.log('Updated custom-splash-logo in __loading__.js');
} else {
  console.warn('custom-splash-logo not found in __loading__.js');
}
