import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Local vector artwork: regenerate PNG covers with `node scripts/generate-post-covers.mjs`.
// Keep illustrations distinct by subject; the white/gray/green palette is shared.
const root = path.resolve(import.meta.dirname, '..');
const destination = path.join(root, 'public/images/covers');
await mkdir(destination, { recursive: true });
const green = '#246b50', dark = '#333d4b', gray = '#b0b8c1', soft = '#e5e8eb';
const rect = (x,y,w,h,fill='#fff',r=24,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const text = (x,y,t,size=28,fill=dark,extra='') => `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-family="Arial, sans-serif" ${extra}>${t}</text>`;
const line = (d,color=gray,width=5,extra='') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const circle = (x,y,r,fill=green,extra='') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const check = (x,y,scale=1) => `<g transform="translate(${x} ${y}) scale(${scale})">${line('M-17 0 L-4 13 L21 -15',green,7)}</g>`;
const paper = (x,y,w=140,h=180) => `${rect(x,y,w,h,'#fff',16,'filter="url(#shadow)"')}${line(`M${x+26} ${y+42} h${w-52}`,gray,7)}${line(`M${x+26} ${y+70} h${w-52}`,soft,7)}${line(`M${x+26} ${y+98} h${w-68}`,soft,7)}`;
const arrow = (x1,y1,x2,y2,color=gray,extra='') => line(`M${x1} ${y1} L${x2} ${y2}`,color,5,`marker-end="url(#arrow)" ${extra}`);

const covers = {
  'timeout-deadline': {
    label:'TIMEOUT / DEADLINE', subtitle:'ONE REQUEST. ONE TIME BUDGET.', bg:'#eaf4ee',
    art: `${circle(600,365,176,'none',`stroke="#d4e6da" stroke-width="30"`)}${circle(600,365,176,'none',`stroke="${green}" stroke-width="30" stroke-dasharray="820 1106" transform="rotate(-90 600 365)" stroke-linecap="round"`)}${text(600,397,'5',132,dark,'text-anchor="middle" font-weight="700"')}${text(674,395,'s',52,green)}${rect(420,591,290,16,green,8)}${rect(722,591,58,16,'#92b9a2',8)}${text(420,645,'CALL BUDGET',21,green)}${text(780,645,'RETURN',21,green,'text-anchor="end"')}${circle(600,143,8,green)}`,
  },
  'retry-policy-experiment': {
    label:'RETRY POLICY / EXPERIMENT', subtitle:'SAME RETRIES. BETTER TIMING.', bg:'#f2f4f6',
    art: `${text(230,236,'NO JITTER',21,gray)}${line('M230 400 H970',soft,3)}${[300,560,880].map((cx,c)=>[0,1,2,3,4].map(i=>rect(cx-45+i*19,400-[70,135,160,110,60][(i+c)%5],15,[70,135,160,110,60][(i+c)%5],'#c3cad2',5)).join('')).join('')}${line('M230 352 H970','#4f9699',3,'stroke-dasharray="10 9"')}${text(230,470,'FULL JITTER',21,green)}${line('M230 610 H970',soft,3)}${Array.from({length:30},(_,i)=>rect(238+i*24.4,610-(26+((i*37)%5)*6),15,26+((i*37)%5)*6,green,5)).join('')}${line('M230 562 H970','#4f9699',3,'stroke-dasharray="10 9"')}${text(970,548,'CAPACITY',19,'#4f9699','text-anchor="end"')}`,
  },
  'backoff-jitter': {
    label:'BACKOFF / JITTER', subtitle:'SPREAD THE RETRIES.', bg:'#f2f4f6',
    art: `${line('M230 548 H970',soft,3)}${[60,108,165,230,300].map((h,i)=>rect(280+i*135,545-h,58,h,['#c9ded2','#a9cdb8','#7eae91','#508966',green][i],16)).join('')}${[0,1,2,3,4].map((i)=>`${circle(308+i*135,205+i*13,10,green)}${circle(332+i*130,256-i*14,7,'#93b69f')}${line(`M${308+i*135} ${240+i*13} V${520-[60,108,165,230,300][i]}`,gray,2,'stroke-dasharray="5 10"')}`).join('')}${text(235,606,'RETRY',23,gray)}${text(970,606,'TIME →',23,gray,'text-anchor="end"')}`,
  },
  'http-idempotency': {
    label:'IDEMPOTENCY', subtitle:'MANY REQUESTS. ONE EFFECT.', bg:'#f2f4f6',
    art: `${[240,365,490].map(y=>`${rect(190,y,160,74,'#fff',18,'filter="url(#shadow)"')}${text(270,y+46,'POST',28,gray,'text-anchor="middle"')}${line(`M370 ${y+37} C510 ${y+37} 470 402 590 402`,gray,4)}`).join('')}${rect(580,292,205,220,'#e3efe8',36)}${text(682,420,'1',108,green,'text-anchor="middle" font-weight="700"')}${arrow(805,402,887,402,green)}${rect(915,345,112,112,'#fff',25,'filter="url(#shadow)"')}${check(971,401,1.3)}`,
  },
  'http-request-response': {
    label:'HTTP / REQUEST &amp; RESPONSE', subtitle:'NO RESPONSE ≠ NO EFFECT.', bg:'#f2f4f6',
    art: `${rect(198,244,236,284,'#fff',28,'filter="url(#shadow)"')}${rect(766,244,236,284,'#fff',28,'filter="url(#shadow)"')}${text(316,407,'CLIENT',32,dark,'text-anchor="middle" font-weight="700"')}${text(884,407,'SERVER',32,dark,'text-anchor="middle" font-weight="700"')}${arrow(466,320,729,320,green)}${text(600,285,'REQUEST',22,green,'text-anchor="middle"')}${line('M734 455 H655 M555 455 H466',gray,5,'stroke-dasharray="8 12"')}${circle(600,455,36,'#eaf4ee')}${text(600,469,'?',40,green,'text-anchor="middle" font-weight="700"')}${text(600,544,'RESPONSE?',22,gray,'text-anchor="middle"')}${circle(931,293,21,'#eaf4ee')}${check(931,293,.55)}`,
  },
  'ai-pipeline-risk-gates': {
    label:'RISK-BASED REVIEW', subtitle:'MATCH THE REVIEW TO THE RISK.', bg:'#edf3ef',
    art: `${rect(168,320,150,120,'#fff',25,'filter="url(#shadow)"')}${text(243,391,'CHANGE',25,dark,'text-anchor="middle" font-weight="700"')}${line('M340 380 C440 380 415 260 520 260 H925',gray,5)}${line('M340 380 C440 380 415 505 520 505 H925',green,5)}${text(520,215,'SMALL CHANGE',21,gray)}${text(520,625,'HIGHER RISK',21,green)}${circle(830,260,43,'#fff')}${check(830,260,1.1)}${[610,820].map(x=>`${rect(x-48,431,96,145,'#fff',20,'filter="url(#shadow)"')}${rect(x-29,447,58,115,'#eaf4ee',13)}${check(x,504,.8)}`).join('')}`,
  },
  'ai-rule-docs-cleanup': {
    label:'GUARDRAILS / AUTONOMY', subtitle:'CLEAR BOUNDARIES. ROOM TO MOVE.', bg:'#f2f4f6',
    art: `${paper(210,270,155,205)}${paper(245,300,155,205)}${paper(280,330,155,205)}${arrow(468,416,631,416)}${rect(678,240,260,300,'#eaf4ee',30)}${line('M730 300 V480 M888 300 V480',green,8)}${line('M766 451 C772 405 821 421 811 369 C804 335 835 333 849 313',green,8,'marker-end="url(#arrow)"')}${text(809,596,'GUARDRAILS',23,green,'text-anchor="middle"')}`,
  },
  'ai-agent-rules': {
    label:'AGENT RULES', subtitle:'FEWER RULES. CLEARER SIGNAL.', bg:'#f2f4f6',
    art: `${rect(216,228,337,332,'#fff',28,'filter="url(#shadow)"')}${[0,1,2,3,4,5].map(i=>line(`M254 ${277+i*45} H${[510,450,494,462,510,430][i]}`,i===2?green:soft,12)).join('')}${arrow(586,395,663,395)}${rect(705,279,278,232,'#fff',28,'filter="url(#shadow)"')}${[0,1,2].map(i=>`${circle(743,333+i*61,6,green)}${line(`M769 ${333+i*61} H938`,green,10)}`).join('')}`,
  },
  'claude-code-retrospective': {
    label:'SAME TOOL / DIFFERENT OUTCOMES', subtitle:'THE WORKFLOW MAKES A DIFFERENCE.', bg:'#eef2f0',
    art: `${rect(174,320,174,134,'#fff',26,'filter="url(#shadow)"')}${text(261,404,'&lt;/&gt;',52,green,'text-anchor="middle" font-weight="700"')}${line('M370 387 C495 387 438 263 566 263 H710',gray,5)}${line('M370 387 C495 387 438 501 566 501 H710',green,5)}${rect(735,177,280,167,'#fff',22,'filter="url(#shadow)"')}${line('M770 219 h48 l-16 38 h86 l-25 42 h104',gray,8)}${rect(735,415,280,167,'#fff',22,'filter="url(#shadow)"')}${[0,1,2].map(i=>line(`M770 ${456+i*40} H${[965,930,965][i]}`,green,9)).join('')}`,
  },
  'seven-person-team-retrospective': {
    label:'TEAM / DECISION MAKING', subtitle:'SEVEN PEOPLE. A SHARED DIRECTION.', bg:'#f2f4f6',
    art: `${[0,1,2,3,4,5,6].map(i=>{const a=i*Math.PI*2/7-Math.PI/2,x=600+Math.cos(a)*185,y=385+Math.sin(a)*185;return `${line(`M${x} ${y} L600 385`,soft,3)}${circle(x,y,35,i%2===0?'#c1d9cb':'#dde6e1')}${circle(x,y-5,10,green)}${line(`M${x-15} ${y+16} Q${x} ${y+1} ${x+15} ${y+16}`,green,5)}`;}).join('')}${circle(600,385,73,'#fff','filter="url(#shadow)"')}${line('M572 412 L626 358 M596 358 H626 V388',green,8)}`,
  },
};

const files = (await readdir(path.join(root,'src/content/posts'))).filter(f=>f.endsWith('.md')).sort();
const previews = [];
for (const file of files) {
  const id = file.replace(/^\d{4}-\d{2}-\d{2}-/,'').replace(/\.md$/,'');
  const design = covers[id];
  if (!design) throw new Error(`Missing cover design: ${id}`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750" role="img" aria-labelledby="title desc"><title id="title">${design.label}</title><desc id="desc">${design.subtitle}</desc><defs><filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#333d4b" flood-opacity=".055"/></filter><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L8 4 L0 8" fill="none" stroke="${green}" stroke-width="2"/></marker></defs>${rect(0,0,1200,750,design.bg,0)}${text(64,84,design.label,25,green,'font-weight="700" letter-spacing="2"')}${text(64,130,design.subtitle,18,'#6b7684','letter-spacing="1.5"')}${design.art}${text(64,708,'kiddo-psh',19,'#6b7684')}${circle(1120,700,8,green)}</svg>`;
  await writeFile(path.join(destination,`${id}.svg`),svg);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(path.join(destination,`${id}.png`),png);
  const filename = path.join(root,'src/content/posts',file);
  const markdown = await readFile(filename,'utf8');
  const cover = `cover: "/images/covers/${id}.png"`;
  const updated = /^cover:.*$/m.test(markdown) ? markdown.replace(/^cover:.*$/m,cover) : markdown.replace(/^(category:.*)$/m,`$1\n${cover}`);
  if (updated === markdown && !markdown.includes(cover)) throw new Error(`Cannot attach cover to ${file}`);
  await writeFile(filename,updated);
  previews.push({input:await sharp(png).resize(400,250).png().toBuffer(),left:(previews.length%3)*400,top:Math.floor(previews.length/3)*250});
  console.log(`${id}: ${Math.round(png.length/1024)} KB`);
}
await mkdir(path.join(root,'docs/mockups'),{recursive:true});
await sharp({create:{width:1200,height:Math.ceil(previews.length/3)*250,channels:3,background:'#ffffff'}}).composite(previews).png().toFile(path.join(root,'docs/mockups/thumbnail-sheet.png'));
console.log(`${files.length} post covers generated and attached.`);
