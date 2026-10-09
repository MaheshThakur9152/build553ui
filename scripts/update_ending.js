import fs from 'node:fs';

let s = fs.readFileSync('D:/ui/rebuild/__game-scripts.js', 'utf8');

const targetStr = 'l.innerHTML=\'<a class="ec-logo" href="https://www.vertex3d.asia/" target="_blank" rel="noopener">\'+EndingCredits.LOGO_SVG+\'</a><div class="ec-tagline"><span class="reg">Now</span> <span class="bold">imagine your own.</span></div><a class="ec-email" href="mailto:studio@vertex3d.asia">[ STUDIO@VERTEX3D.ASIA ]</a>\';';

const replacementStr = 'l.innerHTML=\'<div class="ec-tagline"><span class="bold" style="letter-spacing:0.15em;text-transform:uppercase;">COMING SOON</span></div>\';';

if (s.includes(targetStr)) {
  s = s.replace(targetStr, replacementStr);
  fs.writeFileSync('D:/ui/rebuild/__game-scripts.js', s);
  console.log('Successfully updated ending screen in __game-scripts.js');
} else {
  console.error('Target string not found in __game-scripts.js');
}
