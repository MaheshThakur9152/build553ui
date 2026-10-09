import fs from 'node:fs';

const s = fs.readFileSync('D:/ui/rebuild/__game-scripts.js', 'utf8');
let pos = 0;
while ((pos = s.indexOf('this._el.logo', pos)) !== -1) {
  console.log(pos, s.slice(pos - 50, pos + 100));
  pos += 12;
}
pos = 0;
while ((pos = s.indexOf('this._el.email', pos)) !== -1) {
  console.log(pos, s.slice(pos - 50, pos + 100));
  pos += 13;
}
