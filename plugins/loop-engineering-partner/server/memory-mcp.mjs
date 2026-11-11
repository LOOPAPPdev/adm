import { createInterface } from 'node:readline';
import { searchMemory } from '../scripts/memory-search.mjs';

const versions=new Set(['2024-11-05','2025-03-26','2025-06-18']);
const tool={name:'memory_search',description:'Search curated LOOP engineering context locally. Lexical matches only; verify cited source lines against the current repo.',inputSchema:{type:'object',additionalProperties:false,properties:{query:{type:'string',minLength:1,maxLength:400},limit:{type:'integer',minimum:1,maximum:10}},required:['query']}};
function respond(id,result,error) {
  if (id===undefined) return;
  const msg={jsonrpc:'2.0',id};
  if(error) msg.error={code:-32603,message:String(error)};
  else msg.result=result;
  process.stdout.write(JSON.stringify(msg)+'\n');
}
async function handle(m) {
  if (!m||m.jsonrpc!=='2.0'||typeof m.method!=='string') return;
  const p=m.params||{};
  try{
    switch(m.method){
      case 'initialize':
        return respond(m.id,{protocolVersion:versions.has(p.protocolVersion)?p.protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'loop-project-memory',version:'0.1.0'}});
      case 'notifications/initialized': return;
      case 'ping': return respond(m.id,{});
      case 'tools/list': return respond(m.id,{tools:[tool]});
      case 'tools/call':
        if(p.name!=='memory_search') return respond(m.id,null,'Unknown tool');
        const entries=await searchMemory(p.arguments?.query,{limit:p.arguments?.limit??5});
        return respond(m.id,{content:[{type:'text',text:JSON.stringify({retrieval:'local-lexical',results:entries})}],isError:false});
      default: return respond(m.id,null,'Method not found: '+m.method);
    }
  } catch(e){respond(m.id,null,e.message);}
}
const rl=createInterface({input:process.stdin,crlfDelay:Infinity});
rl.on('line',line=>{try {void handle(JSON.parse(line));}catch(e){process.stderr.write('Invalid JSON request\n');}});
