import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const theme = (await readFile(path.join(root,'src/styles/diagram-theme.css'),'utf8')).trim();
let count=0;
async function walk(directory) {
  for (const entry of await readdir(directory,{withFileTypes:true})) {
    const file=path.join(directory,entry.name);
    if(entry.isDirectory()) { if(entry.name!=='covers') await walk(file); continue; }
    if(!entry.name.endsWith('.svg')) continue;
    const svg=await readFile(file,'utf8');
    if(!/class="dg"/.test(svg)) continue;
    const block=`/* diagram-theme:start */\n${theme}\n/* diagram-theme:end */`;
    let updated=svg.includes('/* diagram-theme:start */')
      ? svg.replace(/\/\* diagram-theme:start \*\/[\s\S]*?\/\* diagram-theme:end \*\//,block)
      : svg.replace(/\.dg\s*\{[^}]*\}\s*:root\[data-theme='dark'\]\s*\.dg\s*\{[^}]*\}/,block);
    if(!updated.includes(block)) throw Error(`Cannot migrate palette: ${file}`);
    updated=updated.replace('9장이 같은 규칙을 쓴다.','모든 본문 도식이 같은 규칙을 쓴다.')
      .replace('v 보라','v 청록').replace('t 주황','t 연초록');
    // Quantitative fills are independent of text colors: lighter bars, readable labels.
    updated=updated.replace(/\.dg \.bar\.([gvtq])\s*\{[^}]*\}/g,(rule,tone)=>
      rule.replace(/fill:var\(--(?:[gvtq]-text|[gvtq])\)/,`fill:var(--${tone}-bar)`));
    if(updated!==svg) await writeFile(file,updated);
    count++;
  }
}
await walk(path.join(root,'public/images'));
console.log(`Diagram theme synchronized: ${count} SVGs.`);
