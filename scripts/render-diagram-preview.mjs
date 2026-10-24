// Raster QA only: resolve custom properties for Sharp's SVG renderer.
// Browser delivery continues to use the original theme-aware SVGs.
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');
const css=await readFile(path.join(root,'src/styles/diagram-theme.css'),'utf8');
const light=css.match(/\.dg\s*\{([^}]+)\}/)[1];
const dark=css.match(/:root\[data-theme='dark'\]\s*\.dg\s*\{([^}]+)\}/)[1];
const samples=['timeout-deadline/time-budget.svg','timeout-deadline/time-budget-mobile.svg','ai-pipeline-risk-gates/01-before-after.svg','retro/03-ev-branch-timeline.svg'];
const output=path.join(root,'docs/mockups/article-diagrams');
await mkdir(output,{recursive:true});
for(const appearance of ['light','dark']) {
  const variables=Object.fromEntries([...`${light};${appearance==='dark'?dark:''}`.matchAll(/--([\w-]+):([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
  for(const sample of samples) {
    let svg=await readFile(path.join(root,'public/images',sample),'utf8');
    svg=svg.replace(/\/\* diagram-theme:start \*\/[\s\S]*?\/\* diagram-theme:end \*\//,'');
    for(let i=0;i<5;i++) svg=svg.replace(/var\(--([\w-]+)\)/g,(_,key)=>variables[key]??'');
    const file=path.join(output,`${sample.replaceAll('/','-').replace('.svg','')}-${appearance}.png`);
    await sharp(Buffer.from(svg)).flatten({background:appearance==='dark'?'#202329':'#f2f4f6'}).png().toFile(file);
    console.log(path.relative(root,file));
  }
}
