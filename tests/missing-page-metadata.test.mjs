import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import {fileURLToPath} from 'node:url';

// Executes each real generateMetadata function in isolation, with an in-memory
// DB boundary. No Next render, network, credentials or production data is used.
const root=process.env.PMWIKI_TEST_ROOT||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const routes=[
 {name:'Korean model',file:'app/(ko)/models/[slug]/page.tsx',prefix:'/models/'},
 {name:'English model',file:'app/en/models/[slug]/page.tsx',prefix:'/en/models/'},
 {name:'Korean blog',file:'app/(ko)/blog/[slug]/page.tsx',prefix:'/blog/'},
];
function metadataFunction(route,response){
 const source=fs.readFileSync(path.join(root,route.file),'utf8');
 const start=source.indexOf('export async function generateMetadata(');
 const end=source.indexOf('\nexport default ',start);
 assert.ok(start>=0&&end>start,'Real metadata function bounds must be found');
 const functionSource=stripTypeScriptTypes(source.slice(start,end).replace('export async function','async function'),{mode:'strip'});
 const reads=[];
 const client={from(table){reads.push(table);return this},select(){return this},eq(){return this},async maybeSingle(){return response}};
 const context=vm.createContext({
  getSupabase:()=>client,createClient:async()=>client,
  decodeSlugParam:s=>decodeURIComponent(s),
  absoluteUrl:p=>'https://www.pmwiki.kr'+p,
  modelPath:(slug,locale)=>(locale==='en'?'/en':'')+'/models/'+encodeURIComponent(slug),
  brandedModelTitle:data=>data.model_name,
  buildModelDescription:()=> 'Fixture summary',buildModelDescriptionEn:()=> 'Fixture summary',
  hreflangLanguages:(ko,en)=>({ko:'https://www.pmwiki.kr'+ko,en:'https://www.pmwiki.kr'+en}),
 });
 const fn=new vm.Script(functionSource+'; generateMetadata;',{filename:route.file}).runInContext(context);
 return{run:slug=>fn({params:Promise.resolve({slug})}),reads};
}
for(const route of routes){
 test(route.name+': missing URL explicitly clears inherited canonical and language alternates',async()=>{
  const subject=metadataFunction(route,{data:null,error:null});
  const metadata=await subject.run('fixture-not-found');
  assert.equal(metadata.robots.index,false,'Missing page remains excluded from indexing');
  assert.equal(metadata.robots.follow,true,'Existing follow behavior is retained');
  assert.equal(metadata.alternates,null,'Must clear root homepage canonical/alternate inheritance');
  assert.equal(subject.reads.length,1,'Only one in-memory data read');
 });
 test(route.name+': temporary read error still throws instead of becoming missing page',async()=>{
  const subject=metadataFunction(route,{data:null,error:{message:'fixture temporary read failure'}});
  await assert.rejects(subject.run('fixture-unavailable'),/query failed: fixture temporary read failure/);
 });
 test(route.name+': existing page retains its own canonical and is not noindexed',async()=>{
  const row={title:'Fixture article',model_name:'Fixture model',manufacturer:'Fixture',image_url:null};
  const subject=metadataFunction(route,{data:row,error:null});
  const metadata=await subject.run('fixture-existing');
  assert.equal(metadata.alternates.canonical,'https://www.pmwiki.kr'+route.prefix+'fixture-existing');
  assert.notEqual(metadata.robots?.index,false,'Valid page must not inherit missing-page noindex');
 });
}
