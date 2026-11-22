#!/usr/bin/env node
// Browser regression: local static gateway, mocked AI API, no production calls.
// npm install --no-save playwright && npx playwright install chromium
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const adapter=fs.readFileSync(path.join(root,'worksheets/ai-coach-adapters-v1.js'),'utf8');
const block=adapter.slice(adapter.indexOf('const specs={'),adapter.indexOf('root.TWO_COACH_ADAPTERS='));
const ids=[...block.matchAll(/^"([^"]+)":\s*\{/gm)].map(m=>m[1]);
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 let file;
 if(url.pathname==='/ai-coach-adapters-v1.js'||url.pathname==='/ai-ownership-coach-v1.js'||url.pathname==='/persistence-autosave-v1.js')file=path.join(root,'worksheets',url.pathname.slice(1));
 else if(/^\/[a-z0-9-]+\/?$/.test(url.pathname))file=path.join(root,'worksheets',url.pathname.split('/')[1],'index.html');
 else {res.writeHead(404);res.end('not found');return;}
 if(!file.startsWith(path.join(root,'worksheets')+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end('not found');return;}
 res.writeHead(200,{'content-type':file.endsWith('.js')?'application/javascript; charset=utf-8':'text/html; charset=utf-8','cache-control':'no-store'});fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 const failures=[],passes=[];
 try{
  for(const id of ids){
   const page=await browser.newPage();
   try{
    await page.goto(base+'/'+id+'/',{waitUntil:'domcontentloaded',timeout:15000});
    await page.locator('#two-coach-launch').waitFor({timeout:8000});
    await page.locator('#two-coach-launch').click();
    assert.equal(await page.locator('#two-coach-panel').getAttribute('data-open'),'true');
    const style=page.locator('#two-coach-style');
    assert.equal(await style.inputValue(),'balanced');
    await style.selectOption('direct');
    assert.equal(await style.inputValue(),'direct');
    await page.locator('#two-coach-close').click();
    assert.equal(await page.locator('#two-coach-panel').getAttribute('data-open'),'false');
    passes.push(id);
   }catch(e){failures.push(id+': '+String(e.message).slice(0,240));}
   finally{await page.close();}
  }
  // Reproduce the original culture regression and test Worksheet 44's actual API payload.
  for(const id of ['two-building-culture','managing-small-team']){
   const page=await browser.newPage();
   try{
    await page.goto(base+'/'+id+'/',{waitUntil:'domcontentloaded'});
    await page.locator('#two-coach-launch').click();
    await page.locator('#two-coach-style').selectOption('socratic');
    await page.evaluate(()=>{if(typeof useExample!=='function')throw Error('Missing useExample');window.confirm=()=>true;useExample();});
    assert.equal(await page.locator('#two-coach-style').inputValue(),'socratic');
    passes.push(id+' example preserves style');
   }catch(e){failures.push(id+' example: '+String(e.message).slice(0,240));}
   finally{await page.close();}
  }
  const page=await browser.newPage();
  try{
   const payloads=[];
   await page.route('**/api/coach',async route=>{
    const body=route.request().postDataJSON();payloads.push(body);
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'Identify the decision boundary and test independent judgment.'})});
   });
   await page.goto(base+'/managing-small-team/',{waitUntil:'domcontentloaded'});
   await page.locator('#report-name').fill('PRIVATE PERSON NAME');
   await page.locator('#report-role').fill('Account Management Lead');
   await page.locator('#del-outcome').fill('Own Q3 retention reviews');
   await page.locator('#del-rights').fill('Decide which accounts need intervention');
   await page.locator('#two-coach-launch').click();
   await page.locator('#two-coach-consent').check();
   await page.locator('#two-coach-question').fill('What is the biggest risk?');
   await page.locator('#two-coach-send').click();
   await page.waitForFunction(()=>document.querySelectorAll('.two-coach-msg.assistant').length>=2,{timeout:10000});
   assert.equal(payloads.length,1);
   assert.equal(payloads[0].worksheetId,'managing-small-team');
   assert.equal(payloads[0].snapshot.kind,'batch8-managing-small-team');
   assert.equal(payloads[0].coachingStyle,'balanced');
   assert.equal(payloads[0].narrativeConsent,true);
   assert.ok(!JSON.stringify(payloads[0].snapshot).includes('PRIVATE PERSON NAME'),'Name leaked');
   await page.locator('#two-coach-question').fill('Tell me more');
   await page.locator('#two-coach-send').click();
   await page.waitForFunction(()=>document.querySelectorAll('.two-coach-msg.assistant').length>=3,{timeout:10000});
   assert.equal(payloads.length,2);
   assert.ok(payloads[1].history.some(x=>x.role==='assistant'),'Follow-up history missing');
   passes.push('44 mocked API initial + follow-up + privacy');
  }catch(e){failures.push('44 API: '+String(e.message).slice(0,300));}
  finally{await page.close();}
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
 console.log('Browser regression '+passes.length+'/'+(passes.length+failures.length)+' checks passed');
 failures.forEach(e=>console.error('FAIL '+e));
 console.log('Scope: local browser + mocked API. No live Cloudflare, auth, or model-quality verification.');
 if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
