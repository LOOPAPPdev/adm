import {readFile, readdir, stat} from 'node:fs/promises';
import {resolve} from 'node:path';

const root=resolve(new URL('../',import.meta.url).pathname);
const text=async p=>readFile(resolve(root,p),'utf8');
const errors=[];
const ensure=(c,msg)=>{if(!c)errors.push(msg);};
let manifest={},config={};
try {manifest=JSON.parse(await text('.claude-plugin/plugin.json'));}catch(e){errors.push('invalid manifest: '+e.message);}
try {config=JSON.parse(await text('.mcp.json'));}catch(e){errors.push('invalid MCP config: '+e.message);}
ensure(manifest.name==='loop-engineering-partner','plugin name invalid');
ensure(/^\d+\.\d+\.\d+$/.test(manifest.version||''),'semver required');
ensure(config.mcpServers?.['loop-project-memory']?.command==='node','MCP command not local node');
ensure(config.mcpServers?.['loop-project-memory']?.args?.[0]==='${CLAUDE_PLUGIN_ROOT}/server/memory-mcp.mjs','MCP server path invalid');
for(const [dir,suffix] of [['agents','.md'],['skills',null]]){
 const entries=await readdir(resolve(root,dir),{withFileTypes:true});
 ensure(entries.length >= (dir==='agents'?6:6),dir+' minimum count not met');
 for(const entry of entries){
  const path=dir+'/'+entry.name+(suffix||'/SKILL.md');
  try {
   const s=await text(path);
   ensure(s.startsWith('---\n')&&s.indexOf('\n---\n',4)>0,path+' missing YAML frontmatter');
   ensure(/\nname: [a-z0-9-]+\n/.test(s),path+' missing name');
   ensure(s.includes('description:'),path+' missing description');
  }catch(e){errors.push(path+' unreadable: '+e.message);}
 }
}
for(const p of ['README.md','memory/PROJECT_MEMORY.md','references/RESPONSE_SCHEMA.md','references/UNIFIED_APP_ADR.md','scripts/memory-search.mjs','server/memory-mcp.mjs']){
 try{ensure((await stat(resolve(root,p))).isFile(),p+' missing');}catch(e){errors.push(p+' missing');}
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('PASS: plugin manifest, 6 agents, 6 skills, MCP config and project memory validated.');
