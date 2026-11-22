#!/usr/bin/env node
// AI Ownership Coach regression baseline: offline, dependency-free, read-only.
// Run: node tests/coach-regression.js
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const adapter=read('worksheets/ai-coach-adapters-v1.js');
const gateway=read('src/index.js');
const backend=read('backend/worker.js');
const checks=[],errors=[],warnings=[];
const report=(id,ok,detail)=>{checks.push({id,ok,detail});if(!ok)errors.push(id+': '+detail)};
const section=(source,start,end)=>{const a=source.indexOf(start);assert(a>=0,'Missing '+start);const z=source.indexOf(end,a+start.length);assert(z>a,'Missing end '+end);return source.slice(a,z)};
const adapterBlock=section(adapter,'const specs={','root.TWO_COACH_ADAPTERS=');
const gatewayBlock=section(gateway,'const worksheetSchemas = {','};');
const backendKinds=section(backend,'const batch1Kinds = Object.freeze({','});');
const backendRules=section(backend,'const lessonRules = {','};');
const ids=[...adapterBlock.matchAll(/^"([^"]+)":\s*\{/gm)].map(m=>m[1]);
report('adapter inventory',ids.length>=30,ids.length+' registered adapters');
for(const id of ids){
 const htmlPath='worksheets/'+id+'/index.html';
 const exists=fs.existsSync(path.join(root,htmlPath));
 report(id+' HTML',exists,'worksheet file '+(exists?'exists':'missing'));
 const inGateway=gatewayBlock.includes('"'+id+'":')||gatewayBlock.includes("'"+id+"':");
 report(id+' gateway',inGateway,'gateway registration '+(inGateway?'present':'missing'));
 const inRules=backendRules.includes("'"+id+"':")||backendRules.includes('"'+id+'":');
 report(id+' backend lesson rules',inRules,'lesson-specific rules '+(inRules?'present':'missing'));
 if(!exists)continue;
 const html=read(htmlPath);
 report(id+' coach scripts',html.includes('/ai-coach-adapters-v1.js')&&html.includes('/ai-ownership-coach-v1.js'),'both coach scripts required');
 if(/function resetAllFields\s*\(/.test(html)&&/querySelectorAll\(["']input\[type=['"]text['"]\], select, textarea["']\)/.test(html)&&!/closest\(["']#two-coach-panel["']\)/.test(html)){
  report(id+' reset isolation',false,'resetAllFields may erase injected coaching-style select');
 }
}
for(const m of gatewayBlock.matchAll(/"([^"]+)":\s*\{kind:"([^"]+)",keys:\["kind","values"\],batch1:true\}/g)){
 const [_,id,kind]=m;
 report(id+' backend kind',backendKinds.includes("'"+id+"':'"+kind+"'"),'gateway kind '+kind+' must match backend batch1Kinds');
}
const management=read('worksheets/managing-small-team/index.html');
const managementAdapter=section(adapter,'"managing-small-team":{','"two-building-culture":{');
report('management coach integration',management.includes('src="/ai-coach-adapters-v1.js"')&&management.includes('src="/ai-ownership-coach-v1.js"'),'both scripts installed');
report('management reset isolation',management.includes('if (!el.closest("#two-coach-panel")) el.value = "";'),'worked example must not erase coach style');
report('management privacy',!managementAdapter.includes('"report-name"'),'direct report name excluded from AI snapshot');
report('management schema bounds',managementAdapter.includes('slice(0,300)')&&backend.includes('fields.length<=45')&&backend.includes('bounded(v,300)'),'adapter fields match backend limits');
report('culture reset regression',/if \(!el\.closest\("#two-coach-panel"\)\)/.test(read('worksheets/two-building-culture/index.html')),'worked-example reset must preserve coaching style');
console.log('AI Coach static regression: '+checks.filter(x=>x.ok).length+'/'+checks.length+' checks passed; '+ids.length+' adapter IDs');
for(const e of errors)console.error('FAIL '+e);
if(warnings.length)for(const w of warnings)console.warn('WARN '+w);
console.log('Scope: static integration contracts only. Does NOT verify live Cloudflare deployments, browser interactions, auth, or AI answer quality.');
if(errors.length)process.exitCode=1;
