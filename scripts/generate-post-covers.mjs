import { makeCover } from './cover-art.mjs';
import { fileURLToPath } from 'node:url';

const covers = {
  'async-def-blocking-io':['orbit','ember',0],
  'semaphore-per-worker':['gate','iris',1.2],
  'redis-incr-race':['fold','rose',1.2],
  'lease-expiry-llm-work':['wave','cobalt',3],
  'ste-writing-rules':['gate','steel',2.6],
  'retry-policy-experiment':['wave','citron',1.3],
  'timeout-deadline':['orbit','tide',3],
  'backoff-jitter':['fold','iris',3],
  'http-idempotency':['orbit','steel',4],
  'http-request-response':['wave','rose',2],
  'ai-pipeline-risk-gates':['gate','ember',2.5],
  'ai-rule-docs-cleanup':['gate','citron',3.5],
  'ai-agent-rules':['fold','cobalt',4],
  'claude-code-retrospective':['wave','tide',.8],
  'seven-person-team-retrospective':['fold','rose',4.5],
};
const selected = new Set(process.argv.slice(2));
for (const [id, design] of Object.entries(covers)) {
  if (selected.size && !selected.has(id)) continue;
  await makeCover(fileURLToPath(new URL('../public/images/covers/'+id,import.meta.url)),...design);
}
