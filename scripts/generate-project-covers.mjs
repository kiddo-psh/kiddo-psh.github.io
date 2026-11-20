import { makeCover } from './cover-art.mjs';
import { fileURLToPath } from 'node:url';

const projects = {
  baro:['gate','cobalt',1.6],
  feelm:['wave','iris',4],
  'ai-dev-harness':['gate','steel',4.5],
  kkugi:['orbit','tide',2],
};
for (const [id, design] of Object.entries(projects)) {
  await makeCover(fileURLToPath(new URL('../public/images/projects/'+id+'/cover',import.meta.url)),...design);
}
