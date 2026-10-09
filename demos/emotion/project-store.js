/* 项目总控台存储：本浏览器独立项目；字段级恢复；不包含 API 密钥。 */
(() => {
'use strict';
const KEY='designer-experience-projects-v211', V1_KEY='designer-experience-unused-catalog-v1', V1_SINGLE_KEY='designer-experience-unused-single-v1', LEGACY_KEY='designer-experience-unused-legacy-v2', clone=x=>JSON.parse(JSON.stringify(x));
const editable={
 project:['name','targetUsers','product','emotion','notes'],
 events:['displayTitle','title','context','trigger','response','emotionEvidence','causeTitle','reason','evaluationObject','userConcern','emotionCategory',...window.PrototypeAppraisals.dimensions.flatMap(d=>['status','judgment','evidence','note'].map(key=>'appraisals.'+d.key+'.'+key))],
 patterns:['patternTitle','emotionCategory','checkItems','reviewChecks','title','summary','scope','uncertainty'],
 directions:['title','proposal','task','concern','assumptions','limits','productBasis',...(window.PrototypeTranslations?.planFields||window.PrototypeAppraisals.dimensions.flatMap(d=>['adoption','properties','capability','boundary'].map(key=>'dimensionPlans.'+d.key+'.'+key)))],
 strategies:['title','mechanism','measure','response','feasibility','burden','limits']
};
function readPath(object,path){
 const keys=String(path).split('.');if(keys.some(key=>['__proto__','prototype','constructor'].includes(key)))return undefined;
 return keys.reduce((value,key)=>value&&Object.prototype.hasOwnProperty.call(value,key)?value[key]:undefined,object);
}
function writePath(object,path,value){
 const keys=String(path).split('.');if(keys.some(key=>['__proto__','prototype','constructor'].includes(key)))throw new Error('无效字段路径。');
 const last=keys.pop();let target=object;
 for(const key of keys){if(!target[key]||typeof target[key]!=='object')target[key]={};target=target[key];}
 target[last]=value;
}
function migrateCauseFields(state){
 const legacy=state.legacyCauseFields||{},drafts=state.legacyCauseDrafts||{};
 for(const event of state.events||[]){
  for(const key of ['concern','appraisal','alternative'])if(Object.prototype.hasOwnProperty.call(event,key)){
   legacy[event.id]=legacy[event.id]||{};if(!Object.prototype.hasOwnProperty.call(legacy[event.id],key))legacy[event.id][key]=event[key];
   delete event[key];if(state.fieldTouched?.events?.[event.id])delete state.fieldTouched.events[event.id][key];
  }
 }
 for(const [draftKey,draft] of Object.entries(state.drafts||{})){
  if(!draftKey.startsWith('events:')||!draftKey.endsWith(':cause'))continue;
  for(const key of ['concern','appraisal','alternative'])if(Object.prototype.hasOwnProperty.call(draft.values||{},key)){
   drafts[draftKey]=drafts[draftKey]||{};drafts[draftKey][key]=draft.values[key];delete draft.values[key];
  }
 }
 if(Object.keys(legacy).length)state.legacyCauseFields=legacy;
 if(Object.keys(drafts).length)state.legacyCauseDrafts=drafts;
 return state;
}

// Presentation fields are separate from the full event overview and candidate reason.
// Add only missing fields; authored empty values and archived old inputs stay intact.
const eventPresentationFields=['displayTitle','causeTitle','evaluationObject','userConcern','emotionCategory'];
const patternPresentationFields=['patternTitle','emotionCategory','checkItems','reviewChecks'];
const hasOwn=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function migrateMeasureFields(state){
 if(!state||typeof state!=='object'||Array.isArray(state))return state;
 if(window.PrototypeMeasures)return window.PrototypeMeasures.migrate(state);
 // Older local verification/runtime loaders still receive the additive format.
 if(!hasOwn(state,'designMeasures'))state.designMeasures=[];
 if(!hasOwn(state,'measureSelections'))state.measureSelections=[];
 if(!hasOwn(state,'measureDrafts'))state.measureDrafts={};
 if(!hasOwn(state,'strategyDirectionIndex'))state.strategyDirectionIndex=0;
 if(!hasOwn(state,'measureFormatVersion'))state.measureFormatVersion=1;
 const max=Math.max(0,(Array.isArray(state.directions)?state.directions.length:0)-1);
 for(const key of ['directionIndex','strategyDirectionIndex']){const value=Number(state[key]);state[key]=Math.max(0,Math.min(Number.isFinite(value)?Math.trunc(value):0,max));}
 return state;
}
function eventPresentationDefaults(event,seed){
 const same=keys=>!!seed&&seed.id===event.id&&seed.sourceId===event.sourceId&&keys.every(k=>event[k]===seed[k]);
 const short=(value,fallback)=>window.PrototypePatterns?.shortTitle(value,fallback)||String(value||'').trim().split(/[，,。；;\n]/)[0].slice(0,18)||fallback;
 return {
  displayTitle:same(['title','context'])?seed.displayTitle:short(event.title,'未命名事件'),
  causeTitle:same(['reason','context','trigger','response'])?seed.causeTitle:(String(event.reason||'').trim()?'原因解释':'待补充原因'),
  evaluationObject:same(['trigger'])?seed.evaluationObject:String(event.trigger||''),
  userConcern:same(['context','trigger','response','emotionEvidence'])?seed.userConcern:'',
  emotionCategory:same(['emotion','emotionEvidence','evidenceType'])?seed.emotionCategory:''
 };
}
function migratePresentationFields(state,demoData=window.PROTOTYPE_DATA||{}){
 if(!state||typeof state!=='object')return state;
 for(const event of state.events||[]){
  const defaults=eventPresentationDefaults(event,(demoData.events||[]).find(e=>e.id===event.id));
  const archived=state.legacyCauseFields?.[event.id];
  for(const key of eventPresentationFields)if(!hasOwn(event,key)){
   if(key==='userConcern'&&archived&&hasOwn(archived,'concern'))event[key]=clone(archived.concern);
   else event[key]=clone(defaults[key]===undefined?'':defaults[key]);
  }
 }
 for(const pattern of state.patterns||[]){
  const seed=(demoData.patterns||[]).find(p=>p.id===pattern.id);
  const related=(state.events||[]).filter(e=>(pattern.eventIds||[]).includes(e.id));
  const groups=[...new Set(related.filter(e=>!['meaning','insufficient'].includes(e.evidenceType)&&e.emotionCategory).map(e=>e.emotionCategory))];
  const category=groups.length===1?groups[0]:'';
  const defaults={emotionCategory:category,patternTitle:category?(category.endsWith('感')?category:category+'感'):(window.PrototypePatterns?.shortTitle(pattern.title,'未命名评价模式')||String(pattern.title||'未命名评价模式').slice(0,18)),checkItems:seed&&category===seed.emotionCategory?seed.checkItems:'',reviewChecks:{}};
  for(const key of patternPresentationFields)if(!hasOwn(pattern,key))pattern[key]=clone(defaults[key]===undefined?'':defaults[key]);
 }

 if(Number(state.patternAggregationVersion)<1||state.patternAggregationVersion===undefined){
  const changed=[];
  for(const pattern of state.patterns||[])if(pattern.status==='confirmed'){
   state.legacyPatternReviews=state.legacyPatternReviews||{};
   if(!hasOwn(state.legacyPatternReviews,pattern.id))state.legacyPatternReviews[pattern.id]={
    status:pattern.status,validation:pattern.validation||'unvalidated',
    title:pattern.title||'',summary:pattern.summary||'',scope:pattern.scope||'',uncertainty:pattern.uncertainty||'',
    eventIds:clone(pattern.eventIds||[]),reason:'评价模式改为同情感七维统计，旧确认需重新检查。'
   };
   state.flags=state.flags||{};
   state.flags[pattern.id]=[...new Set([...(state.flags[pattern.id]||[]),'评价模式改为同情感七维统计，请重新检查。'])];
   changed.push(pattern.id);
  }
  const affectedDirections=(state.directions||[]).filter(d=>changed.includes(d.patternId));
  for(const item of [...affectedDirections,...(state.strategies||[]).filter(s=>affectedDirections.some(d=>d.id===s.directionId))]){
   state.flags=state.flags||{};
   state.flags[item.id]=[...new Set([...(state.flags[item.id]||[]),'来源评价模式已改为七维统计，请复查对应关系。'])];
  }
  state.patternAggregationVersion=1;
 }
 // Old actual concern drafts were intentionally archived by the previous format.
 // Restore a copy under the new field name; keep the archive for audit/history.
 for(const [draftKey,old] of Object.entries(state.legacyCauseDrafts||{})){
  if(!hasOwn(old,'concern'))continue;
  const [kind,id]=draftKey.split(':');
  if(kind!=='events'||!(state.events||[]).some(e=>e.id===id))continue;
  const draft=state.drafts?.[draftKey];
  if(draft?.values&&!hasOwn(draft.values,'userConcern'))draft.values.userConcern=clone(old.concern);
 }
 state.presentationFormatVersion=1;
 return state;
}
function upgradePresentationBaseline(p,demoData){
 if(Number(p.baseState.presentationFormatVersion)>=1&&Number(p.state.presentationFormatVersion)>=1&&Number(p.baseState.patternAggregationVersion)>=1&&Number(p.state.patternAggregationVersion)>=1)return p;
 // Infer against the old baseline before adding defaults, so absence is not
 // mistaken for an intentional clear and edited old fields are retained.
 p.state=inferFields(p.baseState,p.state);
 const oldState=clone(p.state);
 migratePresentationFields(p.baseState,demoData);
 migratePresentationFields(p.state,demoData);
 for(const kind of ['events','patterns']){
  const fields=kind==='events'?eventPresentationFields:patternPresentationFields;
  for(const item of p.state[kind]||[]){
   const before=(oldState[kind]||[]).find(x=>x.id===item.id),base=(p.baseState[kind]||[]).find(x=>x.id===item.id);
   if(!before||!base)continue;
   const flags=p.state.fieldTouched[kind][item.id]=p.state.fieldTouched[kind][item.id]||{};
   for(const key of fields){
    // Existing actual values/drafts differ from the upgraded baseline; retain
    // them even for catalogs that lacked the new touched-field flag.
    const draftEntries=Object.entries(p.state.drafts||{}).filter(([draftKey])=>draftKey.startsWith(kind+':'+item.id));
    const drafted=draftEntries.some(([,draft])=>hasOwn(draft.values||{},key)&&JSON.stringify(draft.values[key])!==JSON.stringify(base[key]));
    const differs=JSON.stringify(item[key])!==JSON.stringify(base[key]);
    if(differs)flags[key]=true;
    if(drafted)flags[key]=true;
   }
  }
 }
 return p;
}


// A dimension plan is authored product work. A historical example may receive
// the new example only when every old direction field and its product still match.
const legacyDirectionFields=['title','proposal','task','concern','assumptions','limits','patternId'];
function migrateTranslationFields(state,demoData=window.PROTOTYPE_DATA||{}){
 if(!state||typeof state!=='object'||!window.PrototypeTranslations)return state;
 const T=window.PrototypeTranslations;
 const changed=[];
 for(const direction of state.directions||[]){
  const previous=clone(direction),seed=(demoData.directions||[]).find(item=>item.id===direction.id);
  const touched=state.fieldTouched?.directions?.[direction.id]||{};
  const drafts=Object.entries(state.drafts||{}).filter(([key])=>key.startsWith('directions:'+direction.id+':')).map(([,draft])=>draft);
  const customDraft=drafts.some(draft=>Object.entries(draft.values||{}).some(([key,value])=>editable.directions.includes(key)&&JSON.stringify(value)!==JSON.stringify(readPath(direction,key))));
  const untouched=!legacyDirectionFields.some(key=>touched[key])&&!T.planFields.some(key=>touched[key])&&!touched.productBasis&&!customDraft;
  const match=seed&&legacyDirectionFields.every(key=>JSON.stringify(direction[key])===JSON.stringify(seed[key]))&&state.project?.product===demoData.project?.product;
  if(!(Number(direction.translationVersion)>=1)){
   if(!hasOwn(direction,'dimensionPlans')&&match&&untouched&&hasOwn(seed,'dimensionPlans'))direction.dimensionPlans=clone(seed.dimensionPlans);
   if(!hasOwn(direction,'productBasis')&&match&&untouched&&hasOwn(seed,'productBasis'))direction.productBasis=clone(seed.productBasis);
   direction.translationVersion=1;
   if(previous.status==='confirmed'){
    state.legacyDirectionReviews=state.legacyDirectionReviews||{};
    if(!hasOwn(state.legacyDirectionReviews,direction.id))state.legacyDirectionReviews[direction.id]={record:previous,reason:'设计转译改为按评价维度核对产品性质与承接能力，旧确认需重新检查。'};
    state.flags=state.flags||{};
    state.flags[direction.id]=[...new Set([...(state.flags[direction.id]||[]),'设计转译已改为七维产品性质，请重新检查产品能力与承接范围。'])];
    changed.push(direction.id);
   }
  }
  Object.assign(direction,T.normalizeDirection(direction));
 }
 for(const strategy of state.strategies||[])if(changed.includes(strategy.directionId)){
  state.flags=state.flags||{};
  state.flags[strategy.id]=[...new Set([...(state.flags[strategy.id]||[]),'来源设计转译已改为七维产品性质，请复查策略与承接范围。'])];
 }
 state.translationFormatVersion=1;
 return state;
}
function upgradeTranslationBaseline(p,demoData=window.PROTOTYPE_DATA||{}){
 if(!window.PrototypeTranslations)return p;
 if(Number(p.baseState.translationFormatVersion)>=1&&Number(p.state.translationFormatVersion)>=1&&[p.baseState,p.state].every(state=>(state.directions||[]).every(direction=>Number(direction.translationVersion)>=1)))return p;
 // Compare old actual edits before filling baseline plans, then compare the
 // migrated actual fields to the new baseline. Explicit clears remain touched.
 p.state=inferFields(p.baseState,{...p.state,_inferFields:true});
 migrateTranslationFields(p.baseState,demoData);
 migrateTranslationFields(p.state,demoData);
 for(const item of p.state.directions||[]){
  const base=(p.baseState.directions||[]).find(direction=>direction.id===item.id);if(!base)continue;
  const flags=p.state.fieldTouched.directions[item.id]=p.state.fieldTouched.directions[item.id]||{};
  for(const key of editable.directions){
   if(JSON.stringify(readPath(item,key))!==JSON.stringify(readPath(base,key)))flags[key]=true;
   const drafted=Object.entries(p.state.drafts||{}).filter(([draftKey])=>draftKey.startsWith('directions:'+item.id+':')).some(([,draft])=>hasOwn(draft.values||{},key)&&JSON.stringify(draft.values[key])!==JSON.stringify(readPath(base,key)));
   if(drafted)flags[key]=true;
  }
 }
 return p;
}

function pruneDeletedAppraisalDrafts(state){
 const deleted=new Set(state.deletedEventIds||[]);
 for(const key of Object.keys(state.legacyAppraisalDraftStates||{}))if(key.startsWith('events:')&&deleted.has(key.split(':')[1]))delete state.legacyAppraisalDraftStates[key];
 if(state.legacyAppraisalDraftStates&&!Object.keys(state.legacyAppraisalDraftStates).length)delete state.legacyAppraisalDraftStates;
}
function migrateAppraisalEvidence(state,options={}){
 const respectEdits=options.respectEdits!==false;
 for(const event of state.events||[]){
  const drafts=respectEdits?Object.entries(state.drafts||{}).filter(([key])=>key.startsWith('events:'+event.id+':')).map(([,draft])=>draft):[];
  const touched=respectEdits?(state.fieldTouched?.events?.[event.id]||{}):{};
  const result=window.PrototypeAppraisals.migrateSatisfaction(event,state.sources||[],{touched,drafts});
  const archive=event.legacyAppraisalStates&&typeof event.legacyAppraisalStates==='object'&&!Array.isArray(event.legacyAppraisalStates)?event.legacyAppraisalStates:{};
  const references=event.legacyAppraisalReferences&&typeof event.legacyAppraisalReferences==='object'&&!Array.isArray(event.legacyAppraisalReferences)?event.legacyAppraisalReferences:{};
  for(const [key,previous] of Object.entries(result.previousStates)){
   if(!Object.prototype.hasOwnProperty.call(archive,key))archive[key]=clone(previous);
   // Keep the older source-reference archive available to the existing history UI.
   if(result.migrated.includes(key)){
    references[key]=references[key]&&typeof references[key]==='object'&&!Array.isArray(references[key])?references[key]:{};
    for(const field of ['evidence','judgment'])if(previous[field]!==result.appraisals[key][field]&&!Object.prototype.hasOwnProperty.call(references[key],field))references[key][field]=previous[field];
   }
  }
  event.appraisals=result.appraisals;
  if(Object.keys(archive).length)event.legacyAppraisalStates=archive;
  if(Object.keys(references).length)event.legacyAppraisalReferences=references;
  // A retained custom comparison must not regain a baseline "satisfied" status
  // when untouched fields are restored on the next project entry.
  if(respectEdits&&result.protectedStatuses.length){
   state.fieldTouched=state.fieldTouched||{};
   state.fieldTouched.events=state.fieldTouched.events||{};
   const flags=state.fieldTouched.events[event.id]=state.fieldTouched.events[event.id]||{};
   for(const key of result.protectedStatuses){
    flags['appraisals.'+key+'.status']=true;
    // This entire old comparison is uncertain. Retain its actual wording,
    // rather than mixing a new default explanation into the retained record.
    for(const field of ['judgment','evidence','note'])if(typeof result.appraisals[key][field]==='string')flags['appraisals.'+key+'.'+field]=true;
   }
  }
 }
 // Old editor drafts may still contain a removed state even after the saved
 // record was upgraded. Preserve the old draft state separately, and keep the
 // draft's actual comparison/basis/note in place.
 for(const [draftKey,draft] of Object.entries(state.drafts||{})){
  if(!draftKey.startsWith('events:')||!draft||typeof draft.values!=='object'||!draft.values)continue;
  for(const dimension of window.PrototypeAppraisals.dimensions){
   const path='appraisals.'+dimension.key+'.status',value=draft.values[path];
   if(typeof value!=='string'||Object.prototype.hasOwnProperty.call(window.PrototypeAppraisals.statusLabels,value))continue;
   state.legacyAppraisalDraftStates=state.legacyAppraisalDraftStates||{};
   state.legacyAppraisalDraftStates[draftKey]=state.legacyAppraisalDraftStates[draftKey]||{};
   if(!Object.prototype.hasOwnProperty.call(state.legacyAppraisalDraftStates[draftKey],dimension.key)){
    const before={};for(const field of ['status','judgment','evidence','note']){
     const oldPath='appraisals.'+dimension.key+'.'+field;
     if(Object.prototype.hasOwnProperty.call(draft.values,oldPath))before[field]=clone(draft.values[oldPath]);
    }
    state.legacyAppraisalDraftStates[draftKey][dimension.key]=before;
   }
   draft.values[path]='insufficient';
   if(respectEdits){
    const id=draftKey.split(':')[1];
    state.fieldTouched=state.fieldTouched||{};state.fieldTouched.events=state.fieldTouched.events||{};
    state.fieldTouched.events[id]=state.fieldTouched.events[id]||{};
    state.fieldTouched.events[id][path]=true;
   }
  }
 }
 pruneDeletedAppraisalDrafts(state);
 state.causeFormatVersion=3;
 return state;
}
let catalog={schema:1,projects:[],preferences:{view:'cards',sort:'updated'}}, writable=true,committed=null;
let migration={source:null,result:'not-needed',message:''};
function parseCatalog(raw){
 const parsed=JSON.parse(raw);
 if(!parsed||parsed.schema!==1||!Array.isArray(parsed.projects)||parsed.projects.some(p=>!p||!validId(p.id)||!p.baseState?.project||!p.state?.project))throw new Error('项目数据无效');
 const ids=new Set();
 for(const p of parsed.projects){
  if(ids.has(p.id))throw new Error('项目标识重复');ids.add(p.id);
  for(const state of [p.baseState,p.state]){
   if(typeof state.project!=='object'||Array.isArray(state.project))throw new Error('任务数据无效');
   if(!state.workflow||typeof state.workflow!=='object'||Array.isArray(state.workflow)||!['guided','demo'].includes(state.workflow.mode)||!Number.isInteger(state.workflow.unlocked)||state.workflow.unlocked<0||state.workflow.unlocked>6||!Array.isArray(state.workflow.completed))throw new Error('流程记录无效');
   for(const key of ['events','sources','patterns','directions','strategies'])if(!Array.isArray(state[key])||state[key].some(item=>!item||typeof item!=='object'||Array.isArray(item)||typeof item.id!=='string'))throw new Error('研究记录无效');
   for(const key of ['designMeasures','measureSelections'])if(state[key]!==undefined&&(!Array.isArray(state[key])||state[key].some(item=>!item||typeof item!=='object'||Array.isArray(item))))throw new Error('设计措施记录无效');
   for(const key of ['drafts','fieldTouched','taskTouched','projectDrafts','measureDrafts','flags'])if(state[key]!==undefined&&(!state[key]||typeof state[key]!=='object'||Array.isArray(state[key])))throw new Error('字段记录无效');
  }
 }
 if(parsed.preferences!==undefined&&(!parsed.preferences||typeof parsed.preferences!=='object'||Array.isArray(parsed.preferences)))throw new Error('视图偏好无效');
 if(parsed.removedProjectIds!==undefined&&(!Array.isArray(parsed.removedProjectIds)||parsed.removedProjectIds.some(id=>!validId(id))))throw new Error('删除记录无效');
 return parsed;
}
const now=()=>new Date().toISOString();
const validId=id=>id==='demo'||id==='legacy'||/^p-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
function write(){if(!writable)throw new Error('原有项目存储无法读取，未覆盖原数据。');try{localStorage.setItem(KEY,JSON.stringify(catalog));committed=clone(catalog);}catch(error){if(committed)catalog=clone(committed);throw new Error('本浏览器未能保存项目，请保留当前页面并检查存储空间。');}}
function inferFields(base,saved){
 const out=migrateMeasureFields(clone(saved)), infer=!out.fieldTouched||out._inferFields;
 out.fieldTouched=out.fieldTouched||{project:{},events:{},patterns:{},directions:{},strategies:{},selection:{}};
 for(const kind of ['project','events','patterns','directions','strategies','selection'])out.fieldTouched[kind]=out.fieldTouched[kind]||{};
 if(infer){
  out.fieldTouched.project={...out.fieldTouched.project,...out.taskTouched};
  for(const kind of ['events','patterns','directions','strategies']){
   for(const item of out[kind]||[]){
    const original=(base[kind]||[]).find(x=>x.id===item.id);if(!original)continue;
    const touched=out.fieldTouched[kind][item.id]||{};
    for(const key of [...editable[kind],'status',...(kind==='events'?['eventStatus']:[])])
     if(JSON.stringify(readPath(item,key))!==JSON.stringify(readPath(original,key)))touched[key]=true;
    out.fieldTouched[kind][item.id]=touched;
   }
  }
  // Older records may have actual textarea drafts without fieldTouched flags.
  // Compare draft values with their record baseline, so only real differences
  // (including deliberate empty values) are carried into field-level restore.
  for(const [draftKey,draft] of Object.entries(out.drafts||{})){
   const [kind,id]=draftKey.split(':');
   if(!['events','patterns','directions','strategies'].includes(kind))continue;
   const original=(base[kind]||[]).find(item=>item.id===id);
   const touched=out.fieldTouched[kind][id]||{};
   for(const [key,value] of Object.entries(draft.values||{})){
    if(editable[kind].includes(key)&&(!original||JSON.stringify(value)!==JSON.stringify(readPath(original,key))))touched[key]=true;
   }
   out.fieldTouched[kind][id]=touched;
  }

  if(out.selectionReason!==base.selectionReason)out.fieldTouched.selection.selectionReason=true;
  if(out.compatibility!==base.compatibility)out.fieldTouched.selection.compatibility=true;
  for(const key of ['designMeasures','measureSelections'])if(JSON.stringify(out[key])!==JSON.stringify(base[key]||[]))out.fieldTouched.selection[key]=true;
  if(JSON.stringify(out.measureDrafts)!==JSON.stringify(base.measureDrafts||{}))out.fieldTouched.selection.measureDrafts=true;
 }
 delete out._inferFields;return out;
}
function restoreState(base,saved){
 migrateMeasureFields(base);migrateMeasureFields(saved||base);
 const translationPair={baseState:base,state:saved||base};upgradeTranslationBaseline(translationPair);base=translationPair.baseState;saved=translationPair.state;
 migratePresentationFields(base);migratePresentationFields(saved||base);
 const out=inferFields(base,saved||base), deleted=new Set(out.deletedEventIds||[]);
 for(const key of editable.project){
  if(!out.fieldTouched.project[key]&&!out.taskTouched?.[key]){
   out.project[key]=clone(base.project[key]??'');
   if(out.projectDrafts)delete out.projectDrafts[key];
  }
 }
 for(const kind of ['events','patterns','directions','strategies']){
  out[kind]=(out[kind]||[]).filter(x=>kind!=='events'||!deleted.has(x.id));
  for(const item of out[kind]){
   const original=(base[kind]||[]).find(x=>x.id===item.id);if(!original)continue;
   const touched=out.fieldTouched[kind][item.id]||{};
   for(const key of [...editable[kind],'status',...(kind==='events'?['eventStatus']:[])])
    if(!key.startsWith('appraisals.')&&!touched[key]&&readPath(original,key)!==undefined)writePath(item,key,clone(readPath(original,key)));
   if(kind==='events'){
    const changed=['title','context','trigger','response','emotionEvidence','sourceId','paragraphId'].some(key=>item[key]!==original[key])||JSON.stringify((out.sources||[]).find(x=>x.id===item.sourceId))!==JSON.stringify((base.sources||[]).find(x=>x.id===original.sourceId));
    const baseline=changed?window.PrototypeAppraisals.seed(item,out.sources||[]):window.PrototypeAppraisals.forEvent(original,base.sources||[]);
    item.appraisals=item.appraisals||{};
    for(const key of editable.events.filter(key=>key.startsWith('appraisals.')))if(!touched[key])writePath(item,key,clone(readPath({appraisals:baseline},key)));
   }
  }
 }
 for(const key of ['selectionReason','compatibility'])if(!out.fieldTouched.selection[key])out[key]=base[key]||'';
 for(const [key,draft] of Object.entries(out.drafts||{})){
  const [kind,id]=key.split(':'), flags=out.fieldTouched[kind]?.[id]||{};
  draft.values=Object.fromEntries(Object.entries(draft.values||{}).filter(([name])=>flags[name]));
 }
 for(const item of out.patterns||[])for(const key of ['eventIds','counterEventIds','boundaryEventIds'])item[key]=(item[key]||[]).filter(id=>!deleted.has(id));
 for(const [kind,index] of [['events','eventIndex'],['events','causeIndex'],['patterns','patternIndex'],['directions','directionIndex'],['directions','strategyDirectionIndex']])
  out[index]=Math.max(0,Math.min(Number(out[index])||0,Math.max(0,out[kind].length-1)));
 pruneDeletedAppraisalDrafts(out);
 out.schema=4;return out;
}
function record(id,kind,base,state,archived=false){
 const stamp=now();return {id,kind,name:state.project.name||'未命名项目',createdAt:stamp,updatedAt:stamp,lastOpenedAt:null,lastStage:'task',archived,baseState:clone(base),state:inferFields(base,state)};
}
function upgradeEventBaseline(p,demoBase){
 if(!['sample','legacy'].includes(p.kind)||Number(p.baseState.eventFormatVersion)>=2||Number(demoBase.eventFormatVersion)<2)return;
 const oldBase=clone(p.baseState);
 p.state=inferFields(oldBase,{...p.state,_inferFields:true});
 for(const event of p.baseState.events||[]){
  const updated=(demoBase.events||[]).find(item=>item.id===event.id&&item.sourceId===event.sourceId);
  if(!updated)continue;
  for(const key of ['context','title','response'])if(updated[key]!==undefined)event[key]=clone(updated[key]);
 }
 p.baseState.eventFormatVersion=2;
}
function upgradeCauseBaseline(p){
 // Infer real differences against the old baseline before changing defaults.
 p.state=inferFields(p.baseState,p.state);
 const raw=clone(p.state),oldBase=clone(p.baseState);
 migrateCauseFields(p.baseState);migrateCauseFields(p.state);
 migrateAppraisalEvidence(p.baseState,{respectEdits:false});
 for(const event of p.baseState.events||[])event.appraisals=window.PrototypeAppraisals.forEvent(event,p.baseState.sources||[]);
 for(const event of p.state.events||[]){
  const before=(raw.events||[]).find(x=>x.id===event.id),original=(oldBase.events||[]).find(x=>x.id===event.id);
  if(before&&Object.prototype.hasOwnProperty.call(before,'appraisals')&&(!original||!Object.prototype.hasOwnProperty.call(original,'appraisals'))){
   const flags=p.state.fieldTouched.events[event.id]||{};
   const baseline=(p.baseState.events||[]).find(x=>x.id===event.id);
   for(const key of editable.events.filter(key=>key.startsWith('appraisals.')))if(readPath(before,key)!==undefined&&JSON.stringify(readPath(before,key))!==JSON.stringify(readPath(baseline,key)))flags[key]=true;
   p.state.fieldTouched.events[event.id]=flags;
  }
 }
 migrateAppraisalEvidence(p.state);
 for(const event of p.state.events||[])event.appraisals=window.PrototypeAppraisals.forEvent(event,p.state.sources||[]);
 p.baseState.causeFormatVersion=3;p.state.causeFormatVersion=3;
}
function initialize(demoBase,legacy){
 migrateMeasureFields(demoBase);if(legacy)migrateMeasureFields(legacy);
 migrateTranslationFields(demoBase);if(legacy)migrateTranslationFields(legacy);
 writable=true;committed=null;migration={source:null,result:'not-needed',message:''};
 catalog={schema:1,projects:[],preferences:{view:'cards',sort:'updated'}};
 try{
  const raw=localStorage.getItem(KEY);
  if(raw!==null){catalog=parseCatalog(raw);migration.source='v2';}
  // This isolated copy does not import any older catalog.
  committed=clone(catalog);
  for(const p of catalog.projects){migrateMeasureFields(p.baseState);migrateMeasureFields(p.state);upgradeEventBaseline(p,demoBase);upgradeCauseBaseline(p);upgradePresentationBaseline(p,demoBase);upgradeTranslationBaseline(p,demoBase);}
  catalog.preferences={view:'cards',sort:'updated',...(catalog.preferences||{})};
  if(['v1','v1-single'].includes(migration.source))catalog.migration={from:migration.source==='v1'?V1_KEY:V1_SINGLE_KEY,to:KEY,at:now(),version:2};
 }catch(error){
  writable=false;migration.result='blocked';migration.message='体验项目数据无法读取，未覆盖当前浏览器中的记录。';
  catalog=committed?clone(committed):{schema:1,projects:[],preferences:{view:'cards',sort:'updated'}};
 }
 const existingDemo=catalog.projects.find(p=>p.id==='demo');
 if(existingDemo){existingDemo.baseState=clone(demoBase);existingDemo.state=clone(demoBase);existingDemo.name=demoBase.project.name;}
 else catalog.projects.unshift(record('demo','demo',demoBase,demoBase));
 if(writable&&legacy&&!catalog.legacyImported&&!(catalog.removedProjectIds||[]).includes('legacy')){
  catalog.projects.push(record('legacy','legacy',demoBase,legacy,true));catalog.legacyImported=true;
 }
 if(writable){
  // The only persistent commit targets v2. A failed commit keeps the old key
  // untouched and prevents a later blank initialization from replacing it.
  const beforeCommit=clone(catalog);
  try{write();if(migration.result==='pending')migration.result='copied';}
  catch(error){writable=false;catalog=beforeCommit;migration.result='blocked';migration.message=error.message;}
 }
 return api;
}
function get(id){const p=catalog.projects.find(p=>p.id===id);return p?clone(p):null;}
function list(){return catalog.projects.map(clone);}
function create(name,base,template='blank'){
 if(!writable)throw new Error('本浏览器目前不能保存新项目，未创建项目。');
 if(!name.trim())throw new Error('请填写项目名称。');
 const id='p-'+crypto.randomUUID(),state=clone(base);
 state.project.id=id;state.project.name=name.trim();
 state.taskTouched.name=true;state.fieldTouched.project.name=true;state.projectDrafts.name=name.trim();
 const p=record(id,template==='sample'?'sample':'project',base,state);catalog.projects.unshift(p);write();return clone(p);
}
function open(id){
 const p=catalog.projects.find(p=>p.id===id);if(!p)throw new Error('项目不存在。');
 if(p.archived)throw new Error('请先在已归档中恢复这个项目。');
 if(!writable&&p.kind==='demo'){const temporary=clone(p);temporary.state=clone(p.baseState);return temporary;}
 if(!writable)throw new Error('本浏览器无法保存项目，请先检查存储。');
 p.state=p.kind==='demo'?clone(p.baseState):restoreState(p.baseState,p.state);p.name=p.state.projectDrafts?.name!==undefined?p.state.projectDrafts.name:p.state.project.name;p.lastOpenedAt=now();write();return clone(p);
}
function update(id,state,stage){
 const p=catalog.projects.find(p=>p.id===id);if(!p)throw new Error('项目不存在。');
 if(p.kind==='demo')return clone(p);
 if(!writable)throw new Error('当前修改未能保存。');
 p.state=migrateMeasureFields(clone(state));p.updatedAt=now();
 p.name=(state.projectDrafts?.name!==undefined?state.projectDrafts.name:state.project.name)||'未命名项目';
 if(stage)p.lastStage=stage;
 write();return clone(p);
}
function rename(id,name){
 if(!writable)throw new Error('本浏览器目前不能保存修改，原项目未改变。');
 const p=catalog.projects.find(p=>p.id===id);if(!p)throw new Error('项目不存在。');
 const value=name.trim();if(!value)throw new Error('请填写项目名称。');
 p.state.project.name=value;p.state.projectDrafts.name=value;p.state.taskTouched.name=true;
 p.state.fieldTouched=p.state.fieldTouched||{project:{}};p.state.fieldTouched.project=p.state.fieldTouched.project||{};p.state.fieldTouched.project.name=true;
 p.name=value;p.updatedAt=now();write();return clone(p);
}
function archive(id,value){
 if(!writable)throw new Error('本浏览器目前不能保存归档状态，原项目未改变。');
 const p=catalog.projects.find(p=>p.id===id);if(!p)throw new Error('项目不存在。');
 p.archived=!!value;p.updatedAt=now();write();return clone(p);
}
function removableProject(id){
 if(!writable)throw new Error('本浏览器目前不能保存删除操作，项目记录未删除。');
 if(id==='demo')throw new Error('内置演示项目不能永久删除。');
 const p=catalog.projects.find(p=>p.id===id);if(!p)throw new Error('项目不存在或已经删除。');
 return p;
}
function checkRemoval(id){
 const p=removableProject(id);
 if(id==='legacy')localStorage.getItem(LEGACY_KEY);
 write();return {id:p.id,name:p.name,archived:!!p.archived};
}
function remove(id){
 const p=removableProject(id),removed=clone(p);
 const oldLegacy=id==='legacy'?localStorage.getItem(LEGACY_KEY):null;
 if(oldLegacy!==null){
  try{localStorage.removeItem(LEGACY_KEY);}catch(error){throw new Error('旧版迁移来源未能删除，项目记录仍保留，请重试。');}
 }
 catalog.projects=catalog.projects.filter(item=>item.id!==id);
 catalog.removedProjectIds=[...new Set([...(catalog.removedProjectIds||[]),id])];
 if(id==='legacy')catalog.legacyImported=true;
 try{write();}catch(error){
  if(oldLegacy!==null){
   try{localStorage.setItem(LEGACY_KEY,oldLegacy);}catch(recoveryError){
    error.message+=' 旧迁移来源键未能恢复，但项目记录仍保留完整整理内容。';
    error.code='LEGACY_CLEANUP_ROLLBACK_PARTIAL';
   }
  }
  throw error;
 }
 return removed;
}
function preferences(change){
 if(change){if(!writable)throw new Error('当前视图偏好未保存。');Object.assign(catalog.preferences,change);write();}
 return clone(catalog.preferences);
}
const api={initialize,list,get,create,open,update,rename,archive,checkRemoval,remove,preferences,restoreState,inferFields,readPath,writePath,migrateCauseFields,migrateAppraisalEvidence,migratePresentationFields,upgradePresentationBaseline,migrateTranslationFields,upgradeTranslationBaseline,migrateMeasureFields,isWritable:()=>writable,migrationStatus:()=>clone(migration),key:KEY};
window.PrototypeProjects=api;
})();
