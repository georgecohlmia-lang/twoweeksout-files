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
report('two decisions no false business subsidy',fInitial.includes('NOT a transfer to the company')&&fInitial.includes('Never say the household is covering business shortfalls'),'household savings not interpreted as business deficit');
report('two decisions follow-up topic exclusion',fFollow.includes('MANDATORY FOLLOW-UP TOPIC: household savings runway')&&fFollow.includes('DO NOT recommend monitoring company cash'),'follow-up must not repeat initial cash advice');
report('two decisions market claim not verified',fInitial.includes('not independently verified fairness'),'market midpoint remains unverified worksheet claim');
report('two decisions annual savings unit',fFollow.includes('$20K ANNUAL savings withdrawal')&&fFollow.includes('NEVER call $20K a monthly gap'),'annual withdrawal cannot be described as monthly');
report('two decisions monthly conversion',fFollow.includes('$1,667 PER MONTH')&&fFollow.includes('$20,000 / 12')&&fFollow.includes('$833 per month'),'monthly savings figures preserve /12 conversion');
report('two decisions runway needs savings balance',fFollow.includes('only if comfortably usable liquid savings balance is supplied')&&fFollow.includes('Never invent a savings balance or runway duration'),'runway duration not invented');
// Worksheet 47: verify economic priority, separate follow-up, and compensation terminology.
const compSource=section(backend,'function compensationDesignDiagnosis(snapshot,followUp){','function twoDecisionsDiagnosis(snapshot,followUp){');
const diagnoseComp=vm.runInNewContext(compSource+'; compensationDesignDiagnosis');
const compScenario={values:{role_tier:'Senior account leader',var_influence:'Account expansion',var_math:'10% on expansion revenue above $200K plus NPS quality bonus',eq_vehicle:'Annual profit sharing',eq_specifics:'Paid if company EBITDA clears threshold; employee must remain employed'}};
const compInitial=diagnoseComp(compScenario,false),compFollow=diagnoseComp(compScenario,true);
const compMargin=diagnoseComp({values:{var_math:'10% expansion revenue above $200K subject to minimum contribution margin of 35%',eq_vehicle:'Annual EBITDA profit sharing'}},false);
const compEquity=diagnoseComp({values:{var_math:'Revenue expansion bonus',eq_vehicle:'Stock options'}},true);
report('compensation diagnosis wired',backend.includes('financialDiagnosis+compensationDiagnosis'),'Worksheet 47 diagnosis passed to model instructions');
report('compensation initial prioritizes contribution profit',compInitial.includes('PRIORITY 1 — INCENTIVE ECONOMICS')&&compInitial.includes('after delivery/support costs AND the incentive payout')&&compInitial.includes('deal-level contribution-margin'),'revenue commission tested for economic value');
report('compensation follow-up distinct conflict',compFollow.includes('PRIORITY 2 — SECOND-ORDER INCENTIVE CONFLICT')&&compFollow.includes('Do NOT repeat the initial deal-level profitability test')&&compFollow.includes('who controls price, discounts, delivery costs and EBITDA'),'follow-up addresses incentive interaction and controllability');
report('compensation recognizes margin protection',compMargin.includes('margin_protection_stated=true')&&compMargin.includes('acknowledge that protection'),'do not assume missing margin safeguard');
report('compensation distinguishes profit sharing from equity',compFollow.includes('Profit sharing based on EBITDA is NOT equity')&&compFollow.includes('Annual profit-sharing timing alone does NOT prove'),'no false equity or budgeting claims');
report('compensation distinguishes genuine equity',compEquity.includes('equity_stated=true')&&compEquity.includes('profit_sharing_stated=false'),'genuine stock options recognized separately');
// Worksheet 48: verified cash arithmetic and distinct ownership decisions.
const cash13Source=section(backend,'function thirteenWeekCashAnalysis(snapshot){','function compensationDesignDiagnosis(snapshot,followUp){');
const cash13Fns=vm.runInNewContext(cash13Source+'; ({thirteenWeekCashAnalysis,thirteenWeekCashDiagnosis})');
const cash13Values={openingBalance:45000,threshold:20000,thresholdProvided:1,entered:4};
let cash13Balance=45000;
for(let w=1;w<=13;w++){
 const receipts=w===2?8000:w===4?30000:0;
 const payments=w===2?38000:w===4?26200:0;
 const entries=w===2||w===4?2:0;
 const closing=cash13Balance+receipts-payments;
 cash13Values['week'+w]='opening '+cash13Balance+'; receipts '+receipts+'; payments '+payments+'; closing '+closing+'; populated cells '+entries;
 cash13Balance=closing;
}
const cash13Valid=cash13Fns.thirteenWeekCashAnalysis({values:cash13Values});
const cash13Initial=cash13Fns.thirteenWeekCashDiagnosis(cash13Valid,false);
const cash13Follow=cash13Fns.thirteenWeekCashDiagnosis(cash13Valid,true);
report('cash13 verified numeric trough',cash13Valid?.lowestWeek===2&&cash13Valid?.lowestClosing===15000&&cash13Valid?.endingBalance===18800,'week 2 trough and week 4 closing must be calculated');
report('cash13 reserve breaches',cash13Valid?.breaches.some(b=>b.week===2&&b.shortfall===5000)&&cash13Valid?.breaches.some(b=>b.week===4&&b.shortfall===1200),'below-reserve shortfall uses explicit threshold');
report('cash13 blank weeks distinguished',cash13Valid?.lastPopulatedWeek===4&&cash13Valid?.unpopulatedWeeks.includes(13),'missing entries not treated as proof of zero obligations');
report('cash13 initial ownership priority',cash13Initial.includes('INITIAL PRIORITY — VERIFIED LIQUIDITY POSITION')&&cash13Initial.includes('positive cash is NOT automatically sufficient'),'first response states verified trough and reserve');
report('cash13 follow-up distinct commitment decision',cash13Follow.includes('FOLLOW-UP PRIORITY — DISTINCT OWNER DECISION')&&cash13Follow.includes('temporary commitment gate')&&cash13Follow.includes('No invented refunds'),'second response moves to discretionary commitment discipline');
report('cash13 wired to backend',backend.includes('numeric.verifiedCash13=cash13')&&backend.includes('compensationDiagnosis+cash13Diagnosis'),'backend passes verified analysis and instructions');
report('cash13 threshold presence transmitted',adapter.includes('thresholdProvided:t?.value.trim()?1:0'),'missing threshold distinguishable from entered zero');
const cash13Tampered={...cash13Values,week3:'opening 15000; receipts 0; payments 0; closing 999999; populated cells 0'};
report('cash13 rejects inconsistent weekly arithmetic',cash13Fns.thirteenWeekCashAnalysis({values:cash13Tampered})===null,'server rejects tampered closing');
const cash13NoThreshold=cash13Fns.thirteenWeekCashAnalysis({values:{...cash13Values,threshold:0,thresholdProvided:0}});
report('cash13 does not invent minimum threshold',cash13NoThreshold?.threshold===null&&cash13NoThreshold?.breaches.length===0,'unset threshold must not become zero reserve');
const cash13CoachingSource=section(backend,'function thirteenWeekCashCoaching(analysis,followUp){','function thirteenWeekCashDiagnosis(analysis,followUp){');
const cash13Coach=vm.runInNewContext(cash13CoachingSource+'; thirteenWeekCashCoaching');
const cash13First=cash13Coach(cash13Valid,false),cash13Second=cash13Coach(cash13Valid,true);
report('cash13 enforced verified initial',cash13First.includes('$15,000')&&cash13First.includes('Week 2')&&cash13First.includes('$5,000')&&cash13First.includes('$20,000'),'initial uses exact verified trough and threshold');
report('cash13 enforced distinct follow-up',cash13Second.includes('not the same as')&&cash13Second.includes('separate approval')&&!/refund|warranty/i.test(cash13Second),'follow-up gates discretionary commitments without invented obligations');
report('cash13 no invented buffer',!cash13Second.includes('$15,000 reserve')&&cash13Second.includes('existing $20,000 reserve'),'retain owner reserve');
report('cash13 missing threshold handled',cash13Coach(cash13NoThreshold,false).includes('not entered a minimum cash reserve')&&cash13Coach(cash13NoThreshold,true).includes('do not substitute an arbitrary example'),'no arbitrary cash buffer');
report('cash13 deterministic standard path',backend.includes('return json({reply:thirteenWeekCashCoaching(cash13,history.some'),'first response and tell me more use deterministic response');
console.log('AI Coach static regression: '+checks.filter(x=>x.ok).length+'/'+checks.length+' checks passed; '+ids.length+' adapter IDs');
for(const e of errors)console.error('FAIL '+e);
if(warnings.length)for(const w of warnings)console.warn('WARN '+w);
console.log('Scope: static integration contracts only. Does NOT verify live Cloudflare deployments, browser interactions, auth, or AI answer quality.');
if(errors.length)process.exitCode=1;
