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
// Exercise the deterministic diagnosis with two contrasting worksheet scenarios.
const vm=require('node:vm');
const diagnosticSource=section(backend,'function distributedWorkDiagnosis(snapshot,followUp){','const json = (data, status=200');
const diagnose=vm.runInNewContext(diagnosticSource+'; distributedWorkDiagnosis');
const expansion={values:{geo_approach:'Open a Phoenix office alongside Denver',ml_leader:'Appoint Phoenix local lead for 90 days',found_decisions:'DRIs document decisions and dissent'}};
const singleTeam={values:{found_decisions:'A single remote team names a DRI for every customer escalation',found_sync:'Weekly meeting only for decisions'}};
const initial=diagnose(expansion,false),followup=diagnose(expansion,true),remote=diagnose(singleTeam,false);
report('distributed expansion diagnosis',initial.includes('cross_location_authority')&&initial.includes('contested client')&&!initial.includes('remote-work trial'),'expansion prioritizes local authority over presence');
report('distributed follow-up differentiation',followup.includes('SECOND-ORDER')&&followup.includes('bypassing')&&!followup.includes('INITIAL DIAGNOSIS'),'follow-up explores authority bypass, not the initial challenge');
report('distributed unrelated scenario',remote.includes('decision_rights')&&!remote.includes('cross_location_authority'),'single remote team does not inherit multi-office diagnosis');
report('distributed prompt wiring',backend.includes('hiringModeInstruction+distributedDiagnosis'),'diagnosis included in model instructions');
// Financial reasoning guardrails for Worksheet 46 (static prompt contract, not model-quality test).
const twoDecisionsRule=backendRules.match(/'owers-posture':"([^"]+)"/)?.[1]||'';
report('two decisions separates affordability tests',twoDecisionsRule.includes('THREE SEPARATE tests')&&twoDecisionsRule.includes('incremental contribution profit')&&twoDecisionsRule.includes('available business cash'),'distinguish market pay, recurring company affordability and household adequacy');
report('two decisions avoids revenue and profit proxies',twoDecisionsRule.includes('not treat revenue, accounting profit, and distributable cash as interchangeable'),'draw increase requires cash evidence');
report('two decisions household runway',twoDecisionsRule.includes('household liquid savings')&&twoDecisionsRule.includes('household deadline')&&twoDecisionsRule.includes('does NOT prove'),'household funding gap is not proof of inadequate company cash');
report('two decisions follow-up distinct',twoDecisionsRule.includes('Recommend a different action from the initial answer'),'follow-up should advance beyond initial test');
// Exercise the Worksheet 46 diagnosis against contrasting cash/household cases.
const financialSource=section(backend,'function twoDecisionsDiagnosis(snapshot,followUp){','function distributedWorkDiagnosis(snapshot,followUp){');
const diagnoseFinance=vm.runInNewContext(financialSource+'; twoDecisionsDiagnosis');
const constrained={values:{draw_current:'75000',draw_needed:'140000',gap_context:'Spouse income and savings cover the household gap',underpaid_action:'M.J. raise of $17K to market midpoint',dec_team:'Reallocate profit share and temporarily reduce owner draw',dec_household:'Increase draw to $85K after Q3 revenue growth'}};
const healthy={values:{draw_current:'75000',draw_needed:'140000',gap_context:'Spouse salary covers household expenses; no savings withdrawal',underpaid_action:'Market adjustment for key role',dec_team:'Business has ample cash reserves',dec_household:'No draw increase planned'}};
const fInitial=diagnoseFinance(constrained,false),fFollow=diagnoseFinance(constrained,true),fHealthy=diagnoseFinance(healthy,true);
report('two decisions diagnosis wired',backend.includes('distributedDiagnosis+financialDiagnosis'),'financial diagnosis passed to model instructions');
report('two decisions initial cash over revenue',fInitial.includes('AVAILABLE CASH')&&fInitial.includes('reject revenue growth'),'initial response prioritizes cash affordability over revenue');
report('two decisions follow-up household runway',fFollow.includes('NET gap')&&fFollow.includes('household runway')&&!fFollow.includes('Propose ONE forward-looking business cash test'),'follow-up is a different household test');
report('two decisions cash healthy household',fHealthy.includes('does NOT show the company cannot afford')&&fHealthy.includes('subtract other household income'),'household needs not equated with business cash weakness');
console.log('AI Coach static regression: '+checks.filter(x=>x.ok).length+'/'+checks.length+' checks passed; '+ids.length+' adapter IDs');
for(const e of errors)console.error('FAIL '+e);
if(warnings.length)for(const w of warnings)console.warn('WARN '+w);
console.log('Scope: static integration contracts only. Does NOT verify live Cloudflare deployments, browser interactions, auth, or AI answer quality.');
if(errors.length)process.exitCode=1;
