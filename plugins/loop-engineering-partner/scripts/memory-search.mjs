import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(new URL('../memory/', import.meta.url).pathname);
const STOP = new Set(['a','as','o','os','de','do','da','dos','das','e','em','no','na','nos','nas','para','por','um','uma','com','que','ao','se','ou','the','and','for','with','from','this','that','not','are','is','to','of','in','on','be','an']);
function tokens(s) {
  return [...new Set(String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().match(/[a-z0-9]{2,}/g)?.filter(x=>!STOP.has(x)) || [])];
}
async function markdownFiles(dir, depth=0) {
  if (depth>3) return [];
  const items=await readdir(dir,{withFileTypes:true});
  const out=[];
  for (const item of items) {
    const path=join(dir,item.name);
    if (item.isDirectory()) out.push(...await markdownFiles(path,depth+1));
    else if (item.isFile() && item.name.endsWith('.md')) out.push(path);
  }
  return out.sort();
}
function chunks(content, source_path) {
  const lines=content.split(/\r?\n/), blocks=[];
  let first=1, label='Introduction', buf=[];
  function save(last) {
    const text=buf.join('\n').trim();
    if(text) blocks.push({source_path,start_line:first,end_line:last,heading:label,text});
    buf=[];
  }
  for (let i=0;i<lines.length;i++) {
    const h=lines[i].match(/^#{1,3} (.*)$/);
    if(h) {save(i);first=i+1;label=h[1];}
    buf.push(lines[i]);
  }
  save(lines.length);
  return blocks;
}
export async function searchMemory(query, {limit=5}={}) {
  if(typeof query!=='string'||!query.trim()||query.length>400) throw new Error('query must be 1..400 characters');
  if(!Number.isInteger(limit)||limit<1||limit>10) throw new Error('limit must be 1..10');
  const wanted=tokens(query);
  if(!wanted.length) return [];
  const all=[];
  for(const file of await markdownFiles(ROOT)){
    const rel=relative(ROOT,file).replaceAll('\\','/');
    const safe='memory/'+rel;
    for (const b of chunks(await readFile(file,'utf8'),safe)) {
      const heading=tokens(b.heading), found=tokens(b.text), hits=wanted.filter(w=>found.some(t=>t===w|| (w.length>=5&&t.startsWith(w))));
      if (!hits.length) continue;
      const score=hits.reduce((n,w)=>n+(heading.includes(w)?4:1),0)/Math.sqrt(1+found.length/80);
      all.push({...b,score:Number(score.toFixed(4))});
    }
  }
  return all.sort((a,b)=>b.score-a.score||a.source_path.localeCompare(b.source_path)||a.start_line-b.start_line).slice(0,limit);
}
const isMain=process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href;
if(isMain) {
  const [mode,...args]=process.argv.slice(2);
  const idx=args.indexOf('--limit');let limit=5;
  if(idx>=0){limit=Number(args[idx+1]);args.splice(idx,2);}
  if(mode!=='search'){console.error('Usage: node scripts/memory-search.mjs search "query" [--limit 5]');process.exitCode=2;}
  else searchMemory(args.join(' '),{limit}).then(v=>console.log(JSON.stringify({results:v},null,2))).catch(e=>{console.error(e.message);process.exitCode=1;});
}
