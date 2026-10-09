import fs from 'node:fs';

const s = fs.readFileSync('D:/ui/_backup_edolus_clone/__game-scripts.js', 'utf8');
const idx = s.indexOf('OverlayManager.LOGO_SVG=');
const end = s.indexOf('",OverlayManager.SOUND_SVG');
const logoSvg = s.slice(idx + 'OverlayManager.LOGO_SVG="'.length, end);
console.log('Logo SVG:');
console.log(logoSvg);
