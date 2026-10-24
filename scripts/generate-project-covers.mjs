import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Original vector artwork using docs/design-seed.md. No generated UI or evidence.
const green = '#246b50', gray = '#a6afb9', teal = '#4f9699';
const box = (x,y,w,h,stroke=green) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="white" stroke="${stroke}" stroke-width="4"/>`;
const line = (d,color=green) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
const dot = (x,y,r=14,color=green) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const label = (x,y,text,size=22) => `<text x="${x}" y="${y}" fill="${green}" font-family="Arial,sans-serif" font-size="${size}" letter-spacing="2">${text}</text>`;
const designs = {
  baro: {
    title: 'BARO / FROM DETECTION TO ACTION',
    art: `${[0,1,2].map(i=>box(220+i*190,250,155,250,gray)).join('')}${box(245,310,105,155)}${box(435,310,105,155)}${box(625,310,105,155)}${line('M220 550 H800 V440 H950')}${box(850,265,155,130)}${dot(928,330,30,teal)}${line('M910 330 l13 13 25 -27','#fff')}${label(240,610,'OBSERVE     /     DECIDE     /     VERIFY')}`,
  },
  yumyum: {
    title: 'YUMYUM / ROUTE BEFORE GENERATION',
    art: `${box(135,320,210,145)}${[0,1,2].map(i=>line(`M345 392 H440 V${270+i*125} H560`,i===1?gray:green)).join('')}${[0,1,2].map(i=>box(560,215+i*125,230,100,i===1?gray:green)).join('')}${dot(675,265,20)}${line('M650 390 h50',gray)}${dot(675,515,20,teal)}${line('M790 265 H865 V390 H920')}${line('M790 515 H865 V390')}${box(920,325,150,130)}${label(165,405,'RECORDS')}${label(440,610,'SELECT     /     SKIP     /     EXPLAIN')}`,
  },
  feelm: {
    title: 'FEELM / CONTRACTS AT THE BOUNDARY',
    art: `${box(155,280,220,240)}${[0,1,2].map(i=>line(`M185 ${330+i*65} H345`,gray)).join('')}${line('M375 400 H520')}${box(520,250,200,290)}${line('M570 365 v-40 a50 50 0 0 1 100 0 v40')}${box(560,365,120,105)}${dot(620,407,10)}${line('M720 400 H875')}${box(875,280,170,240,teal)}${line('M910 410 l25 25 55 -65',teal)}${label(230,610,'REQUEST     /     VALIDATE     /     CONNECT')}`,
  },
  'ai-dev-harness': {
    title: 'AI DEV HARNESS / RULES INTO EVIDENCE',
    art: `${box(155,270,225,260)}${[0,1,2,3].map(i=>line(`M195 ${320+i*50} H340`,i===1?teal:gray)).join('')}${line('M380 400 H500')}${box(500,310,200,180)}${line('M545 400 l30 30 80 -85')}${line('M700 400 H820')}${box(820,250,230,290)}${[0,1,2].map(i=>`<rect x="${855+i*55}" y="${460-i*55}" width="32" height="${40+i*55}" rx="8" fill="${i===1?teal:green}"/>`).join('')}${label(180,610,'INSTALL     /     CHECK     /     OBSERVE')}`,
  },
  kkugi: {
    title: 'KKUGI / CORRECTIONS BECOME DATA',
    art: `${box(160,250,170,250)}${dot(245,345,38,gray)}${dot(245,345,18)}${line('M330 375 H440')}${[0,1,2].map(i=>box(440,215+i*110,260,85,i===1?green:gray)).join('')}${[0,1,2].map(i=>line(`M475 ${257+i*110} H${i===1?600:580}`,i===1?green:gray)).join('')}${dot(650,367,22,teal)}${line('M639 367 l8 8 14 -16','#fff')}${line('M700 367 H820')}${box(820,295,200,145,teal)}${[0,1,2].map(i=>`<rect x="${865+i*45}" y="${395-i*30}" width="26" height="${20+i*30}" rx="6" fill="${i===2?green:teal}"/>`).join('')}${line('M920 440 V530 H245 V500',teal)}${label(220,610,'SUGGEST     /     CONFIRM     /     RETRAIN')}`,
  },
};
const previews = [];
for (const [id, design] of Object.entries(designs)) {
  const dir = new URL(`../public/images/projects/${id}/`, import.meta.url);
  await mkdir(dir, { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750"><rect width="1200" height="750" fill="#f2f4f6"/>${label(64,90,design.title,26)}${design.art}${label(64,705,'kiddo-psh / PROJECT NOTES',18)}</svg>`;
  await writeFile(new URL('cover.svg', dir), svg);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(new URL('cover.png', dir), png);
  previews.push({input: await sharp(png).resize(600,375).toBuffer(),left:(previews.length%2)*600,top:Math.floor(previews.length/2)*375});
}
await mkdir(new URL('../docs/mockups/',import.meta.url),{recursive:true});
await sharp({create:{width:1200,height:750,channels:3,background:'#ffffff'}}).composite(previews).png().toFile(new URL('../docs/mockups/project-covers.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'));
