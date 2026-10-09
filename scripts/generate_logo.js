import fs from 'node:fs';

// Let's create high-end geometric paths for BUILD 553
// ViewBox: 0 0 180 30
// Height: 30, baseline: ~22, cap-height: ~8 to 22 (height 14)

// 1. EMBLEM: Futuristic Isometric Hexagonal Prism / 7-DOF Kinematic Joint
// Center: (16, 15), Radius: 12
// Points: (16, 3), (27, 9.5), (27, 20.5), (16, 27), (5, 20.5), (5, 9.5)
const emblemOuter = "M16 3 L27 9.5 L27 20.5 L16 27 L5 20.5 L5 9.5 Z";
// Inner cutout:
const emblemInner = "M16 6 L24 11 L24 19 L16 24 L8 19 L8 11 Z";
// Combined compound path with thickness:
const emblemFrame = "M16 3 L27 9.5 L27 20.5 L16 27 L5 20.5 L5 9.5 Z M16 6.5 L8 11.2 L8 18.8 L16 23.5 L24 18.8 L24 11.2 Z";
// Center articulated core & crosshair:
const emblemCore = "M16 11 L21 14 L21 16 L16 19 L11 16 L11 14 Z";
const emblemDot = "M16 13.5 A1.5 1.5 0 1 0 16 16.5 A1.5 1.5 0 1 0 16 13.5 Z";

// 2. LETTER "B" (x: 36 to 48, y: 7 to 23)
const letterB = "M36 7 L45 7 Q48.5 7 48.5 11 Q48.5 13.2 46.8 14.3 Q49 15.5 49 18.5 Q49 23 45 23 L36 23 Z M39 9.5 L39 13.5 L44 13.5 Q46 13.5 46 11.5 Q46 9.5 44 9.5 Z M39 16 L39 20.5 L44.5 20.5 Q46.5 20.5 46.5 18.2 Q46.5 16 44.5 16 Z";

// 3. LETTER "U" (x: 52 to 64, y: 7 to 23)
const letterU = "M52 7 L55 7 L55 18 Q55 20.5 58 20.5 Q61 20.5 61 18 L61 7 L64 7 L64 18 Q64 23 58 23 Q52 23 52 18 Z";

// 4. LETTER "I" (x: 68 to 71, y: 7 to 23)
const letterI = "M68 7 L71 7 L71 23 L68 23 Z";

// 5. LETTER "L" (x: 75 to 86, y: 7 to 23)
const letterL = "M75 7 L78 7 L78 20.2 L86 20.2 L86 23 L75 23 Z";

// 6. LETTER "D" (x: 90 to 102, y: 7 to 23)
const letterD = "M90 7 L97 7 Q102 7 102 15 Q102 23 97 23 L90 23 Z M93 9.7 L93 20.3 L96.5 20.3 Q99 20.3 99 15 Q99 9.7 96.5 9.7 Z";

// 7. CYBER SEPARATOR (x: 108, y: 15)
const separator = "M107 14 L109 12 L111 14 L109 16 Z";

// 8. NUMERAL "5" #1 (x: 116 to 128, y: 7 to 23)
const num5_1 = "M116 7 L127.5 7 L127.5 9.7 L119 9.7 L118.5 13.2 Q121 12.5 123.5 12.5 Q128 12.5 128 17.5 Q128 23 123 23 Q118 23 116 19.5 L118.5 17.8 Q119.8 20.5 123 20.5 Q125 20.5 125 17.5 Q125 14.8 122.5 14.8 Q120.2 14.8 119 16 L116 14.8 Z";

// 9. NUMERAL "5" #2 (x: 133 to 145, y: 7 to 23)
const num5_2 = "M133 7 L144.5 7 L144.5 9.7 L136 9.7 L135.5 13.2 Q138 12.5 140.5 12.5 Q145 12.5 145 17.5 Q145 23 140 23 Q135 23 133 19.5 L135.5 17.8 Q136.8 20.5 140 20.5 Q142 20.5 142 17.5 Q142 14.8 139.5 14.8 Q137.2 14.8 136 16 L133 14.8 Z";

// 10. NUMERAL "3" (x: 150 to 162, y: 7 to 23)
const num3 = "M150 7 L161 7 L161 9.5 L155 14 Q161.5 14.5 161.5 18.5 Q161.5 23 156 23 Q151.5 23 150 19.5 L152.5 17.8 Q153.5 20.5 156 20.5 Q158.5 20.5 158.5 18.5 Q158.5 16.5 155 16.5 L153 16.5 L153 14.2 L157.5 10 L150 10 Z";

const svg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 166 30" xml:space="preserve"><style type="text/css">.st0{fill:#FFFFFF;}</style><g fill="#FFFFFF"><path class="st0" d="${emblemFrame}"/><path class="st0" d="${emblemCore}"/><path class="st0" d="${emblemDot}"/><path class="st0" d="${letterB}"/><path class="st0" d="${letterU}"/><path class="st0" d="${letterI}"/><path class="st0" d="${letterL}"/><path class="st0" d="${letterD}"/><path class="st0" d="${separator}"/><path class="st0" d="${num5_1}"/><path class="st0" d="${num5_2}"/><path class="st0" d="${num3}"/></g></svg>`;

console.log("SVG Length:", svg.length);
fs.writeFileSync('D:/ui/rebuild/public/build553_logo.svg', svg);
console.log("Saved to public/build553_logo.svg");
