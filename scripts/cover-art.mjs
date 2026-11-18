import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// A stack of closed contours forms a solid. The edge of each layer stays visible at thumbnail size.
const palettes = {
  ember: ['#221411','#6e3427','#ffb382','#ff7140','#67281d'],
  iris: ['#d6cfff','#a99deb','#fff0ff','#8768ed','#3c2672'],
  tide: ['#c4e7f7','#8cbbdb','#eefaff','#4096c8','#17466d'],
  citron: ['#eff0a6','#cdd782','#fbffd7','#b6cf50','#596121'],
  cobalt: ['#143caa','#487be8','#d5ebff','#78a4ff','#142f85'],
  rose: ['#ffd7c7','#e5a7a5','#ffeae2','#e97372','#742c40'],
  steel: ['#dedfdc','#b1b7ba','#fafbf8','#99a9b5','#414b57'],
};

const turn = Math.PI * 2;
const point = (x,y) => x.toFixed(1) + ' ' + y.toFixed(1);

function contour(form, layer, phase) {
  const vertices = [];
  for (let n=0; n<96; n++) {
    const a = turn*n/96;
    let x, y;
    if (form === 'fold') {
      const r = 188 + 65*Math.cos(3*a + layer*1.8 + phase);
      x = r*Math.cos(a); y = r*Math.sin(a);
    } else if (form === 'gate') {
      const power = 0.42;
      x = 210*Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**power;
      y = 172*Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**power;
    } else if (form === 'wave') {
      x = 235*Math.cos(a); y = 154*Math.sin(a) + 73*Math.sin(2*a + layer*2.4 + phase);
    } else {
      x = 198*Math.cos(a); y = 198*Math.sin(a);
    }
    const angle = phase*.3 + (form==='gate' ? layer*1.9 : layer*.51);
    const px = x*Math.cos(angle)-y*Math.sin(angle);
    const py = x*Math.sin(angle)+y*Math.cos(angle);
    vertices.push(point(px + 110*layer, py*.54 - 173*layer));
  }
  return 'M'+vertices.join('L')+'Z';
}

export async function makeCover(stem, form, palette, phase = 0) {
  const [ground, horizon, light, mid, shadow] = palettes[palette];
  const layers = [];
  for (let n=0; n<42; n++) {
    const t = n/41;
    const edge = n===41 ? light : shadow;
    let shape = contour(form,t,phase);
    if (form==='orbit') {
      // Hollow layers expose the back wall of the ring through the central opening.
      const cx=110*t, cy=-173*t;
      shape += 'M'+point(cx-115,cy)+'a115 62 0 1 0 230 0a115 62 0 1 0 -230 0Z';
    }
    layers.push('<path d="'+shape+'" fill-rule="evenodd" fill="url(#metal)" stroke="'+edge+'" stroke-width="1.8"/>');
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
    <defs>
      <radialGradient id="paper" cx="30%" cy="8%" r="102%"><stop stop-color="${ground}"/><stop offset="1" stop-color="${horizon}"/></radialGradient>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2=".4" gradientUnits="objectBoundingBox"><stop stop-color="${mid}"/><stop offset=".32" stop-color="${light}"/><stop offset=".62" stop-color="${mid}"/><stop offset="1" stop-color="${shadow}"/></linearGradient>
      <radialGradient id="shade"><stop stop-color="${shadow}" stop-opacity=".35"/><stop offset="1" stop-color="${shadow}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1200" height="750" fill="url(#paper)"/>
    <ellipse cx="648" cy="570" rx="334" ry="63" fill="url(#shade)"/>
    <g transform="translate(543 468) rotate(-16) scale(1.28)">${layers.join('')}</g>
  </svg>`;
  await mkdir(path.dirname(stem), {recursive:true});
  await writeFile(stem+'.svg',svg);
  const source = Buffer.from(svg);
  await sharp(source).png({palette:true, colours:192}).toFile(stem+'.png');
  for (const width of [520,1200]) {
    await sharp(source).resize(width).webp({quality:83}).toFile(stem+'-'+width+'.webp');
  }
}
