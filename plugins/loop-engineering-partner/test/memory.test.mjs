import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {searchMemory} from '../scripts/memory-search.mjs';

test('memory search finds architecture with citations',async()=>{
 const results=await searchMemory('Cloudflare Next.js Worker single app',{limit:5});
 assert.ok(results.length>0);
 assert.ok(results.some(x=>x.text.includes('apps/web')));
 assert.ok(results.every(x=>x.source_path.startsWith('memory/')&&x.start_line>0&&x.end_line>=x.start_line));
});
test('memory search has bounded input and output',async()=>{
 await assert.rejects(()=>searchMemory('',{limit:1}),/query/);
 await assert.rejects(()=>searchMemory('LOOP',{limit:100}),/limit/);
 assert.ok((await searchMemory('LOOP',{limit:2})).length<=2);
});
test('local MCP server supports initialize, tools/list and search',async()=>{
 const child=spawn(process.execPath,[new URL('../server/memory-mcp.mjs',import.meta.url).pathname],{stdio:['pipe','pipe','pipe']});
 let output='',stderr='';
 child.stdout.setEncoding('utf8');
 child.stdout.on('data',data=>{output+=data;});
 child.stderr.on('data',data=>{stderr+=data;});
 const req=(id,method,params={})=>child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');
 try{
  req(1,'initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'test',version:'1'}});
  req(2,'tools/list');
  req(3,'tools/call',{name:'memory_search',arguments:{query:'tenant authentication',limit:3}});
  const deadline=Date.now()+3000;
  while(output.trim().split('\n').filter(Boolean).length<3 && Date.now()<deadline) await new Promise(r=>setTimeout(r,25));
  const messages=output.trim().split('\n').filter(Boolean).map(JSON.parse);
  assert.equal(messages.length,3,'MCP responses missing: '+stderr);
  assert.equal(messages[0].result.serverInfo.name,'loop-project-memory');
  assert.equal(messages[1].result.tools[0].name,'memory_search');
  const search=JSON.parse(messages[2].result.content[0].text);
  assert.equal(search.retrieval,'local-lexical');
  assert.ok(search.results.length>=1);
 } finally {child.kill();}
});
