(() => {
'use strict';
const D=window.PROTOTYPE_DATA, A=window.PrototypeAppraisals, P=window.PrototypePatterns, W=window.PrototypeWorkflow, T=window.PrototypeTranslations, M=window.PrototypeMeasures, X=window.PrototypeExport, ExportView=window.PrototypeExportView, Fields=window.PrototypeProjects;
const readPath=(o,key)=>Fields.readPath(o,key),writePath=(o,key,value)=>Fields.writePath(o,key,value);
const $=id=>document.getElementById(id), copy=o=>JSON.parse(JSON.stringify(o));
if(!D||!A||!P||!W||!T||!M||!X||!ExportView){$('content').textContent='资料未加载，请重新打开项目入口。';return;}
const KEY='designer-experience-unused-legacy-v211';
const defaults=()=>ensureEmotionGroups({schema:4,eventFormatVersion:2,presentationFormatVersion:1,patternAggregationVersion:1,measureFormatVersion:1,measureDrafts:{},strategyDirectionIndex:0,fieldTouched:{project:{},events:{},patterns:{},directions:{},strategies:{},selection:{}},deletedEventIds:[],workflow:{mode:'guided',unlocked:0,completed:[]},taskTouched:{},projectDrafts:{},taskConfirmed:false,causeIndex:0,project:copy(D.project),sources:copy(D.sources),events:copy(D.events).map(e=>({...e,eventStatus:e.status,appraisals:A.forEvent(e,D.sources)})),patterns:copy(D.patterns),directions:copy(D.directions).map(T.normalizeDirection),strategies:copy(D.strategies),designMeasures:copy(D.designMeasures||[]),measureSelections:[],selection:[],selectionReason:'',compatibility:'',revisions:[],flags:{},drafts:{},eventIndex:0,patternIndex:0,directionIndex:0,savedAt:null});
let S=defaults(),canSave=true,activeProjectId=null,activeRecord=null;
function normalizeState(value){
 const S=copy(value||defaults());
 Fields.migrateCauseFields(S);
 M.migrate(S);
 if(!S.fieldTouched)S._inferFields=true;
 S.fieldTouched=S.fieldTouched||{project:{},events:{},patterns:{},directions:{},strategies:{},selection:{}};
 for(const kind of ['project','events','patterns','directions','strategies','selection'])S.fieldTouched[kind]=S.fieldTouched[kind]||{};
 const previousSchema=S.schema;S.schema=4;S.workflow=Object.assign({mode:'guided',unlocked:0,completed:[]},S.workflow||{});
S.workflow.mode=S.workflow.mode==='demo'?'demo':'guided';
S.workflow.unlocked=Math.max(0,Math.min(6,Number(S.workflow.unlocked)||0));
S.workflow.completed=Array.isArray(S.workflow.completed)?S.workflow.completed:[];
S.taskTouched=S.taskTouched||{};S.projectDrafts=S.projectDrafts||{};
S.taskConfirmed=!!S.taskConfirmed;S.causeIndex=Number.isInteger(S.causeIndex)?S.causeIndex:0;
const oldTaskDefaults={"id": "PR-01", "name": "烹饪中的安心体验", "targetUsers": "示例：刚开始独立下厨、希望了解操作是否正确的成年人。", "product": "示例：带有数字操作界面的家用空气炸锅。", "emotion": "安心", "emotionScope": "围绕烹饪出错的不确定性，探索放心、踏实及相反的担心表达。不将“专业、可靠”等意义判断直接视为安心情绪。", "task": "设定一次烹饪，理解当前进展，处理过程变化，判断食物是否完成并安全结束。", "constraints": "保留机身基本操作；通知克制且可关闭；不以界面提示代替食品安全判断；照顾不熟悉术语的使用者。", "origin": "原型演示任务，由设计者构造。空气炸锅仅用于说明跨情境转译，不是已确定的论文研究课题。", "status": "pending", "validation": "unvalidated"};
if(previousSchema<3){
 const extra=[];
 for(const [key,label] of [['emotionScope','体验范围'],['task','产品任务'],['constraints','设计约束'],['origin','任务来源']]){
  const value=S.projectDrafts[key]===undefined?S.project[key]:S.projectDrafts[key];
  if(value&&value!==oldTaskDefaults[key])extra.push(label+'：'+value);
 }
 if(extra.length&&!S.project.notes){S.project.notes=extra.join('\n');S.taskTouched.notes=true;}
 for(const key of ['name','targetUsers','product','emotion']){
  if(S.taskTouched[key]&&S.projectDrafts[key]===''&&S.project[key]===oldTaskDefaults[key]){delete S.taskTouched[key];delete S.projectDrafts[key];}
 }
}
S.project.notes=S.project.notes||'';
for(const key of ['emotionScope','task','constraints','origin']){delete S.project[key];delete S.projectDrafts[key];delete S.taskTouched[key];}
for(const list of [S.events,S.patterns,S.directions,S.strategies])for(const item of list){
 if(item.status==='deferred')item.status='pending';
 if(item.eventStatus==='deferred')item.eventStatus='pending';
}
const eventOriginals={
 'E-04':{previous:'片段只有“清楚、专业”等评价，没有直接表达安心、放心或踏实。',text:'客服把步骤解释得很清楚，我觉得他们做得很专业。'},
 'E-05':{previous:'“终于结束了。”可能表达释然、疲惫或不满，无法从短句确定。',text:'“终于结束了。”'}
};
for(const e of S.events){const original=eventOriginals[e.id];if(original&&e.emotionEvidence===original.previous)e.emotionEvidence=original.text;}

if(S.eventFormatVersion!==2){
 const previousEvents={"E-01": {"sourceId": "S-01", "title": "交付前能够核对，感到放心", "context": "多人协作完成文件，使用者准备把最终版本交给负责人。", "response": "查看最终版本，确认后完成交付。"}, "E-02": {"sourceId": "S-02", "title": "安排被再次确认，感到踏实", "context": "使用者正在准备出行，接送方再次确认安排。", "response": "出发前查看确认消息；出现变化时知道向谁询问。"}, "E-03": {"sourceId": "S-03", "title": "维修没有进展消息，越等越担心", "context": "维修方承诺当天完成，使用者等待过程中没有收到进展。", "response": "持续等待，并反复考虑机器是否能按时修好。"}, "E-04": {"sourceId": "S-04", "title": "“专业”是评价，安心尚不明确", "context": "使用者听取客服解释处理步骤，但问题尚未解决。", "response": "评价服务流程专业，同时保留对最终结果的疑问。"}, "E-05": {"sourceId": "S-05", "title": "只知道结束，原因证据不足", "context": "资料未提供活动、参与者或发生经过。", "response": "只留下一句结束的表达，没有行为记录。"}};
 for(const event of S.events){
  const old=previousEvents[event.id],current=D.events.find(item=>item.id===event.id&&item.sourceId===event.sourceId);
  if(!old||!current||old.sourceId!==event.sourceId)continue;
  for(const key of ['title','context','response']){
   const dirty=S.fieldTouched.events?.[event.id]?.[key]||Object.entries(S.drafts||{}).some(([draftKey,draft])=>draftKey.startsWith('events:'+event.id+':')&&Object.prototype.hasOwnProperty.call(draft.values||{},key));
   if(!dirty&&event[key]===old[key])event[key]=current[key];
  }
 }
 S.eventFormatVersion=2;
}

Fields.migrateAppraisalEvidence(S);
Fields.migratePresentationFields(S,D);
Fields.migrateTranslationFields(S,D);
for(const e of S.events||[])e.appraisals=A.forEvent(e,S.sources||[]);
S.deletedEventIds=Array.isArray(S.deletedEventIds)?S.deletedEventIds:[];
S.events=S.events.filter(e=>!S.deletedEventIds.includes(e.id));
for(const pattern of S.patterns)for(const key of ['eventIds','counterEventIds','boundaryEventIds'])pattern[key]=(pattern[key]||[]).filter(id=>!S.deletedEventIds.includes(id));
if(S._inferFields)Object.keys(S.project).forEach(k=>{if(D.project[k]!==undefined&&S.project[k]!==D.project[k])S.taskTouched[k]=true;});
 ensureEmotionGroups(S);return S;
}
let legacyState=null;
// Experience copy never imports the original project's browser storage.
const demoBase=defaults();demoBase.workflow.mode='demo';
const Projects=window.PrototypeProjects.initialize(demoBase,legacyState);
const Hub={filter:'all',query:'',...Projects.preferences()};
function blankDefaults(){const state=defaults();state.project={id:'',name:'',targetUsers:'',product:'',emotion:'',notes:'',status:'pending',validation:'unvalidated'};for(const key of ['sources','events','patterns','directions','strategies','designMeasures','measureSelections'])state[key]=[];return state;}
function touch(kind,id,key){
 if(kind==='project'){S.fieldTouched.project[key]=true;S.taskTouched[key]=true;}
 else if(kind==='selection')S.fieldTouched.selection[key]=true;
 else{S.fieldTouched[kind]=S.fieldTouched[kind]||{};S.fieldTouched[kind][id]=S.fieldTouched[kind][id]||{};S.fieldTouched[kind][id][key]=true;}
}
function filesForProject(){return window.PrototypeFiles?.forProject(activeProjectId||'legacy');}

const U={view:'hub',previewOrigin:null,measureDeletion:null,measureDeletePrompt:null,uploading:false,deletingProject:null,pendingEvent:null,recordSwitch:null,linkedBrowsers:{},linkSets:{},measureBrowsers:{},flow:null,appraisalSelection:{},stage:'task',editing:null,open:new Set(),scroll:{},timer:null,renderingStage:null,suspend:false,scrollFrame:null,scrollTarget:null,scrollToken:0},content=$('content');
const stages={
task:['01','TASK BRIEF','当前任务 / 界定研究任务','先明确，<br>为谁而设计。','记录项目、目标产品与情感体验，再把生活资料带入研究。'],
events:['02','EMOTION EVENTS','当前任务 / 检查情感事件','从生活片段，<br>找到情感事件。','核对情境、触发、反应和情感证据，再进入原因解释。'],
causes:['03','CAUSE REVIEW','当前任务 / 检查情感原因','读懂感受，<br>再写下判断。','检查候选解释。你可以修改，有疑问时再打开原始依据。'],
patterns:['04','APPRAISAL PATTERNS','当前任务 / 归纳同类情感','从同类感受，<br>归纳评价模式。','比较七维在同类情感事件中的涉及次数，再回查事件与用户关切。'],
directions:['05','DESIGN TRANSLATION','当前任务 / 转译产品性质','让评价关系，<br>在产品中重新成立。','逐维检查原评价关系、产品需要具备的性质，以及能力与边界。'],
strategies:['06','DESIGN MEASURES','当前任务 / 选择具体设计措施','从产品性质，<br>选择具体措施。','每条产品性质可不选，也可选择多项；所选措施记录在对应评价维度下。']};
const status={pending:'待检查',confirmed:'设计师确认',discarded:'已放弃'};
const relations={support:'支持材料',counter:'相反情感材料',ambiguous:'歧义材料',insufficient:'证据不足'};
const evidence={direct:'直接情绪表达',inferred:'情感推断',meaning:'意义判断 · 不能等同情绪',insufficient:'缺少情感证据'};
const h=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const obj=(k,id)=>S[k].find(o=>o.id===id),flag=o=>!!o&&!!(S.flags[o.id]&&S.flags[o.id].length),rawApproved=o=>!!o&&o.status==='confirmed'&&!flag(o),approved=o=>rawApproved(o)&&(!S.patterns.some(p=>p.id===o.id)||patternGroup(o).records.every(rawApproved));
const badge=t=>'<span class="badge'+(['局部假设','目标用户：待验证'].includes(t)?' validation-badge':'')+'">'+h(t)+'</span>';
const stamp=(o,ev=false)=>'<span class="stamp '+(!ev&&flag(o)?'review-warning':(ev?o.eventStatus:o.status)==='confirmed'?'confirmed':'')+'">'+h(!ev&&flag(o)?'需复查':status[ev?o.eventStatus:o.status])+'</span>';
const b=(label,action,attrs='',cls='secondary')=>'<button type="button" class="'+cls+'" data-action="'+action+'" '+attrs+'>'+label+'</button>';
const fld=(label,value,cls='')=>'<div class="field '+cls+'"><label>'+h(label)+'</label><p>'+h(value)+'</p></div>';
const paper=(tab,body,note='')=>'<div class="paper-wrap"><div class="tab-label">'+h(tab)+'</div><article class="paper">'+body+'</article></div>'+(note?'<div class="next-note">'+note+'</div>':'');
const dt=(key,title,body,cls='')=>{key=(U.renderingStage||U.stage)+'-'+key;return '<details class="evidence'+(cls?' '+cls:'')+'" data-open-key="'+h(key)+'" '+(U.open.has(key)?'open':'')+'><summary>'+title+'</summary><div class="detail-body">'+body+'</div></details>'};
function save(){
 S.savedAt=new Date().toISOString();
 if(activeRecord?.kind==='demo'){$('save-status').textContent='演示文稿 · 本次修改不保存';return;}
 if(!activeProjectId)return;
 try{activeRecord=Projects.update(activeProjectId,S,U.stage);canSave=true;}catch(error){canSave=false;}
 $('save-status').textContent=canSave?'当前项目已保存在本浏览器':'当前修改仅在会话中 · 未能保存';
}

function toast(t,action=null){$('toast').innerHTML=h(t)+(action?b('撤销','measure-delete-undo','','text-button'):'');$('toast').hidden=false;clearTimeout(U.timer);U.timer=setTimeout(()=>$('toast').hidden=true,action?10000:4500);}
function log(k,id,action,before,after,reason=''){S.revisions.unshift({time:new Date().toISOString(),kind:k,id,action,before:copy(before),after:copy(after),reason});S.revisions=S.revisions.slice(0,150);}
function downstream(k,id,reason){
 const affected=new Set(),mark=o=>{if(!o||affected.has(o.id))return;affected.add(o.id);S.flags[o.id]=[...new Set([...(S.flags[o.id]||[]),reason])];};
 if(k==='events')S.patterns.forEach(mark); // Source/category edits invalidate review status; legacy checks remain historical.
 if(k==='patterns')S.directions.filter(d=>d.patternId===id).forEach(mark);
 if(k==='directions')S.strategies.filter(s=>s.directionId===id).forEach(mark);
 S.directions.filter(d=>affected.has(d.patternId)).forEach(mark);S.strategies.filter(s=>affected.has(s.directionId)).forEach(mark);
 return affected.size;
}
function warn(o,k){return !flag(o)?'':'<div class="warning"><b>前级内容已变化，当前结果需要复查。</b><p>'+h(S.flags[o.id].join('；'))+'</p><div class="actions-left">'+b('保留当前内容，重新检查','retain','data-kind="'+k+'" data-id="'+o.id+'"')+(D[k].some(item=>item.id===o.id)?b('重载初始示例候选','reload','data-kind="'+k+'" data-id="'+o.id+'"','text-button'):'')+'</div><p class="small">重载只恢复演示候选，不会调用真实 AI；当前版本保留在修订记录。</p></div>';}
function raw(e,prefix='raw'){
 const s=obj('sources',e.sourceId);if(!s)return '<p class="notice">尚未关联原始资料，需要补充来源。</p>';
 const p=(s.paragraphs||[]).find(p=>p.id===e.paragraphId);
 if(!p&&s.attachmentId)return dt(prefix+'-'+e.id,'⌕　打开原始依据 · '+h(s.id)+' 原文件','<div class="source-body"><p>'+h(s.title)+'</p><p class="form-note">该事件关联原文件，尚未指定文字片段。</p>'+originalFileButton(s)+'</div>');

 return dt(prefix+'-'+e.id,'⌕　打开原始依据 · '+h(s.id)+' 段落 '+h(e.paragraphId),
 '<div class="source-body"><p class="small">'+h(s.title)+' · '+h(s.type)+'</p><blockquote>'+h(p?p.text:'关联片段缺失')+'</blockquote>'+
 dt('context-'+prefix+'-'+e.id,'展开前后文',s.paragraphs.filter(p=>p.id!==e.paragraphId).map(p=>'<p class="small">段落 '+h(p.id)+'</p><p>'+h(p.text)+'</p>').join('')||'<p>没有更多上下文。</p>')+
 '<p class="form-note">'+h(s.provenance)+'</p>'+originalFileButton(s)+'</div>');
}

function eventTitle(e){return String(e?.displayTitle===undefined?P.shortTitle(e?.title,'未命名事件'):e.displayTitle||'未命名事件');}
function causeTitle(e){return String(e?.causeTitle===undefined?'原因解释':e.causeTitle||'未命名原因');}
function patternTitle(p){return String(p?.patternTitle===undefined?(p?.emotionCategory||P.shortTitle(p?.title,'未命名评价模式')):p.patternTitle||'未命名评价模式');}
function defaultPatternChecks(){return D.patterns[0]?.checkItems||'同组事件是否有明确的情感表达？\n七维判断是否有事件内容作为依据？\n是否检查满足程度、证据不足与事件之间的差异？\n是否保留统计与迁移的局限？';}
function ensureEmotionGroups(state){
 const deleted=new Set(state.deletedEventIds||[]),categories=new Map();
 for(const e of state.events||[]){
  const category=String(e.emotionCategory||'').trim();
  if(!category||['未确定','尚不能判断','未分组','未知'].includes(category)||deleted.has(e.id)||e.status==='discarded'||e.eventStatus==='discarded'||['meaning','insufficient'].includes(e.evidenceType)||!String(e.emotionEvidence||'').trim())continue;
  if(!categories.has(category))categories.set(category,[]);categories.get(category).push(e.id);
 }
 state.patterns=state.patterns||[];
 let next=Math.max(0,...state.patterns.map(p=>/^P-\d+$/.test(p.id)?Number(p.id.slice(2)):0));
 for(const [category,ids] of categories)if(!state.patterns.some(p=>String(p.emotionCategory||'').trim()===category)){
  state.patterns.push({id:'P-'+String(++next).padStart(2,'0'),patternTitle:category.endsWith('感')?category:category+'感',emotionCategory:category,checkItems:'',reviewChecks:{},
   title:category+'的评价模式',summary:'',scope:'',uncertainty:'',eventIds:[...new Set(ids)],counterEventIds:[],boundaryEventIds:[],contentType:'同情感统计候选',status:'pending',validation:'unvalidated',generatedBy:'local-statistics'});
 }
 return state;
}
function patternGroups(){
 const map=new Map();
 for(const p of S.patterns){const category=String(p.emotionCategory||'').trim(),key=category?'emotion:'+category:'record:'+p.id;
  if(!map.has(key))map.set(key,{key,category,records:[],primary:p});map.get(key).records.push(p);
 }
 return [...map.values()];
}
function patternGroup(p){return patternGroups().find(g=>g.records.some(item=>item.id===p?.id))||{key:'record:'+p?.id,category:p?.emotionCategory||'',primary:p,records:p?[p]:[]};}
function currentPatternGroup(){
 const groups=patternGroups(),record=S.patterns[S.patternIndex],group=groups.find(g=>g.records.some(p=>p.id===record?.id))||groups[0];
 if(group)S.patternIndex=S.patterns.findIndex(p=>p.id===group.primary.id);return group;
}
function groupStatus(group){
 if(group.records.some(flag))return 'review';
 if(group.records.length&&group.records.every(p=>p.status==='confirmed'))return 'confirmed';
 if(group.records.length&&group.records.every(p=>p.status==='discarded'))return 'discarded';
 return 'pending';
}
function groupStamp(group){const value=groupStatus(group);return '<span class="stamp '+(value==='review'?'review-warning':value==='confirmed'?'confirmed':'')+'">'+h(value==='review'?'需复查':status[value])+'</span>';}
function aggregatePattern(p){return P.aggregate(p,S.events,{deletedEventIds:S.deletedEventIds,reviewFlags:S.flags});}
function frequentDimensions(aggregate){
 const ranked=aggregate.rankedDimensions.filter(d=>d.count>0),threshold=ranked[Math.min(1,ranked.length-1)]?.count;
 return threshold?ranked.filter(d=>d.count>=threshold):[];
}
function patternSummary(p,aggregate=aggregatePattern(p)){
 const names=frequentDimensions(aggregate).map(d=>d.label+'（'+d.count+'/'+aggregate.eligibleCount+'）');
 if(!aggregate.eligibleCount)return '当前没有可纳入“'+(p.emotionCategory||'未分组')+'”的事件。请补充情感分组与事件依据。';
 return '当前'+aggregate.eligibleCount+'条“'+aggregate.emotionCategory+'”事件中，'+(names.length?names.join('、')+'涉及较多。':'尚无可汇总的七维判断。')+(aggregate.reviewedEventCount<aggregate.eligibleCount?'其中'+aggregate.candidateEventCount+'条仍待检查。':'')+'次数用于比较当前资料，不代表已经验证的因果规律。';
}
function patternReferences(group,key){return [...new Set(group.records.flatMap(p=>p[key]||[]))];}
function patternNavigationIndex(){const groups=patternGroups(),g=currentPatternGroup();return groups.findIndex(item=>item.key===g?.key);}
function links(ids,label='支持事件',prefix='linked',compact=false){
 const stage=U.renderingStage||U.stage,key=encodeURIComponent(stage+'|'+prefix+'|'+label);
 U.linkSets[key]={ids:[...new Set(ids||[])],label,prefix,stage,compact};U.linkedBrowsers[key]=U.linkedBrowsers[key]||{query:'',page:0,selectedId:null};
 return '<section class="linked-browser'+(compact?' linked-browser-compact':'')+'" id="linked-browser-'+key+'" data-linked-browser="'+key+'" aria-label="'+h(label)+'">'+linkedMarkup(key)+'</section>';
}
function linkedMarkup(key){
 const set=U.linkSets[key],state=U.linkedBrowsers[key];if(!set||!state)return '';
 const query=String(state.query||'').trim().toLocaleLowerCase(),all=set.ids.map(id=>obj('events',id)).filter(Boolean);
 const matches=all.filter(e=>!query||[e.id,eventTitle(e),causeTitle(e),e.title,e.reason,e.context,e.userConcern,e.emotionCategory].join(' ').toLocaleLowerCase().includes(query));
 const pages=Math.max(1,Math.ceil(matches.length/6));state.page=Math.max(0,Math.min(pages-1,Number(state.page)||0));
 const rows=matches.slice(state.page*6,state.page*6+6);if(!rows.some(e=>e.id===state.selectedId))state.selectedId=rows[0]?.id||null;
 const selected=rows.find(e=>e.id===state.selectedId),attrs='data-browser="'+key+'"';
 const toolbar='<div class="linked-toolbar"><label><span class="small">'+h(set.label)+'</span><input type="search" data-linked-search="'+key+'" aria-label="搜索'+h(set.label)+'" placeholder="搜索标题、原因或事件内容" value="'+h(state.query)+'"></label><span class="small">'+matches.length+' / '+all.length+' 条</span></div>';
 const list='<div class="linked-list" role="group" aria-label="'+h(set.label)+'列表">'+(rows.length?rows.map(e=>b('<span class="linked-option-meta"><span>'+h(e.id)+'</span><span>'+h(flag(e)?'原因需复查':status[e.status]||'待检查')+'</span></span><span class="linked-option-title">'+h(eventTitle(e))+'</span><span class="linked-option-summary">'+h(causeTitle(e))+'</span>','select-linked-event',attrs+' data-id="'+h(e.id)+'" aria-pressed="'+(e.id===state.selectedId)+'"','linked-option')).join(''):'<p class="form-note">'+(all.length?'没有匹配事件。':'目前没有关联事件。')+'</p>')+'</div>';
 const detail=selected?'<article class="linked-detail" aria-label="'+h(eventTitle(selected))+'详情"><div class="linked-detail-head"><div><p class="small">'+h(selected.id)+' · '+h(set.label)+'</p><h3>'+h(eventTitle(selected))+'</h3></div>'+stamp(selected)+'</div><h4>'+h(causeTitle(selected))+'</h4>'+(set.compact?'':'<div class="linked-facts">'+fld('评价对象',selected.evaluationObject||'尚未补充')+fld('用户关切',selected.userConcern||'尚未补充')+'</div>')+'<div class="actions-left">'+b('回到原因解释','jump',attrs+' data-target="causes" data-id="'+h(selected.id)+'"','text-button')+b('核对事件','jump',attrs+' data-target="events" data-id="'+h(selected.id)+'"','text-button')+'</div></article>':'<div class="linked-detail"><p class="form-note">'+(set.compact?'从列表选择标题，回到对应记录检查。':'从列表选择一条事件，查看其关切与对应原因。')+'</p></div>';
 const pagination='<div class="linked-pagination">'+b('上一页','linked-page',attrs+' data-step="-1" '+(state.page===0?'disabled':''),'text-button')+'<span class="small">第 '+(state.page+1)+' / '+pages+' 页 · 每页6条</span>'+b('下一页','linked-page',attrs+' data-step="1" '+(state.page>=pages-1?'disabled':''),'text-button')+'</div>';
 return toolbar+'<div class="linked-columns">'+list+detail+'</div>'+pagination;
}
function refreshLinked(key,preserveSearch=false){
 const holder=$('linked-browser-'+key),set=U.linkSets[key];if(!holder||!set)return;
 const top=content.scrollTop,left=content.scrollLeft,focused=document.activeElement,search=preserveSearch?holder.querySelector('[data-linked-search]'):null,range=search?[search.selectionStart,search.selectionEnd]:null;
 const previousStage=U.renderingStage;U.renderingStage=set.stage;holder.innerHTML=linkedMarkup(key);U.renderingStage=previousStage;
 const focus=preserveSearch?holder.querySelector('[data-linked-search]'):focused?.dataset.action==='linked-page'?holder.querySelector('[data-action="linked-page"][data-step="'+focused.dataset.step+'"]'):holder.querySelector('[data-action="select-linked-event"][aria-pressed="true"]');
 if(focus&&!focus.disabled){focus.focus({preventScroll:true});if(range)try{focus.setSelectionRange(...range);}catch(error){}}
 content.scrollLeft=left;content.scrollTop=top;if(!preserveSearch)window.PrototypeMotion?.revealCard(holder.querySelector('.linked-detail'));
}

function updateApiStatus(){
 const button=document.querySelector('[data-action="api-settings"]');
 if(button)button.textContent='API 配置'+(window.PrototypeApiSettings?.getStatus().configured?' · 已配置':'');
}
function projectLabel(project){return project.kind==='demo'?'演示文稿':project.kind==='sample'?'演示资料副本':project.kind==='legacy'?'旧版迁移记录':'研究项目';}
function day(value){return value?new Date(value).toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'}):'尚未打开';}
function emptyStage(title,note){return paper('RESEARCH / EMPTY','<div class="empty"><h2>'+h(title)+'</h2><p>'+h(note)+'</p>'+b('返回任务界定','stage','data-target="task"')+'</div>');}
function projectMenu(project){
 if(project.kind==='demo')return '';
 const attrs=' data-project-id="'+h(project.id)+'"';
 return '<details class="project-menu"><summary aria-label="项目菜单 '+h(project.name)+'" title="项目菜单">···</summary><div class="project-menu-panel">'+
 (project.archived?'':b('重命名','rename-project',attrs,'text-button')+b('归档项目','archive-project',attrs,'text-button'))+
 b('删除项目','delete-project',attrs,'text-button destructive')+'</div></details>';
}
function filteredProjects(){
 let rows=Projects.list().filter(project=>Hub.filter==='archived'?project.archived:!project.archived);
 if(Hub.filter==='recent')rows=rows.filter(project=>project.lastOpenedAt).sort((a,b)=>String(b.lastOpenedAt).localeCompare(String(a.lastOpenedAt)));
 if(Hub.query.trim()){const query=Hub.query.trim().toLocaleLowerCase();rows=rows.filter(project=>(project.name+' '+(project.state.project.product||'')+' '+(project.state.project.emotion||'')).toLocaleLowerCase().includes(query));}
 if(Hub.filter!=='recent')rows.sort((a,b)=>Hub.sort==='name'?a.name.localeCompare(b.name,'zh-CN'):Hub.sort==='created'?String(b.createdAt).localeCompare(String(a.createdAt)):String(b.updatedAt).localeCompare(String(a.updatedAt)));
 return rows;
}

function deleteProjectDialog(id){
 const project=Projects.get(id);if(!project||project.kind==='demo'){toast('内置演示文稿不能删除。');return;}
 dialog('<h2>永久删除这个项目？</h2><p><b>'+h(project.name)+'</b></p><p>将永久删除这个项目的任务、事件、草稿、审核进度、修订。</p><p>删除后无法恢复，项目归档也不会保留副本。</p><p id="project-delete-status" class="form-note" role="status"></p><div class="actions">'+b('取消','close-dialog')+b('永久删除项目','confirm-delete-project','data-project-id="'+h(id)+'"','primary')+'</div>');
}
async function deleteProject(id){
 if(U.deletingProject)return;
 let filesDeleted=false;
 try{
  Projects.checkRemoval(id);
  U.deletingProject=id;
  $('dialog').setAttribute('aria-busy','true');
  $('dialog').querySelectorAll('button').forEach(button=>button.disabled=true);
  const notice=$('project-delete-status');if(notice)notice.textContent='正在删除当前浏览器中的体验项目……';
  // This trial contains browser records and text only; no original files are deleted.
  Projects.remove(id);
  U.deletingProject=null;$('dialog').removeAttribute('aria-busy');$('dialog').close();
  if(activeProjectId===id){activeProjectId=null;activeRecord=null;U.view='hub';}
  renderHub();toast('当前浏览器中的体验项目已永久删除。');
 }catch(error){
  const message=filesDeleted?'项目原文件已删除，但项目记录未能删除。请保留页面并重试。 '+error.message:(error.message||'项目未能完成删除，请重试。');
  const notice=$('project-delete-status');if(notice)notice.textContent=message;
  toast(message);
 }finally{
  U.deletingProject=null;$('dialog').removeAttribute('aria-busy');
  $('dialog').querySelectorAll('button').forEach(button=>button.disabled=false);
 }
}

function projectSummary(project){
 const state=project.state,progress=state.workflow.mode==='demo'?'可自由查看六阶段':Math.min(6,(state.workflow.unlocked||0)+1)+' / 6 阶段已开放';
 return {progress,product:state.project.product||'尚未界定目标产品',emotion:state.project.emotion||'尚未界定目标体验',stage:stageNames[project.lastStage]||'任务界定'};
}
function renderProjectList(){
 const rows=filteredProjects(),list=$('project-list');if(!list)return;
 const count=$('hub-count');if(count)count.textContent=rows.length+' 个项目';
 const open=project=>b(project.archived?'恢复项目':'打开项目 →',project.archived?'restore-project':'open-project','data-project-id="'+h(project.id)+'"','text-button project-open');
 if(!rows.length){list.innerHTML='<div class="hub-empty"><p class="eyebrow">PROJECTS / EMPTY</p><h2>'+h(Hub.query?'没有匹配的项目':Hub.filter==='recent'?'还没有最近项目':Hub.filter==='archived'?'没有归档项目':'从第一个项目开始')+'</h2><p>'+h(Hub.query?'尝试项目名称、目标产品或目标体验。':Hub.filter==='archived'?'归档是可恢复的，不会删除项目内容。':'新建项目，或打开演示文稿了解研究流程。')+'</p>'+(Hub.filter==='all'?b('新建项目','new-project','','primary'):'')+'</div>';return;}
 if(Hub.view==='table'){
  list.innerHTML='<div class="project-table-wrap"><table class="project-table"><thead><tr><th scope="col">项目</th><th scope="col">目标产品</th><th scope="col">目标体验</th><th scope="col">研究进度</th><th scope="col">最近修改</th><th scope="col">操作</th></tr></thead><tbody>'+rows.map(project=>{const info=projectSummary(project);return '<tr><th scope="row"><button type="button" class="text-button project-open" data-action="open-project" data-project-id="'+h(project.id)+'" '+(project.archived?'disabled':'')+'>'+h(project.name)+'</button><span class="project-label">'+h(projectLabel(project))+'</span></th><td>'+h(info.product)+'</td><td>'+h(info.emotion)+'</td><td>'+h(info.progress)+'</td><td>'+h(day(project.updatedAt))+'</td><td><div class="project-row-actions">'+open(project)+projectMenu(project)+'</div></td></tr>';}).join('')+'</tbody></table></div>';
 }else{
  list.innerHTML='<div class="project-grid">'+rows.map((project,index)=>{const info=projectSummary(project);return '<article class="project-card" aria-label="'+h(project.name)+'"><div class="project-card-head"><span class="project-number">'+String(index+1).padStart(2,'0')+'</span><span class="project-label">'+h(projectLabel(project))+'</span>'+projectMenu(project)+'</div><h2><button type="button" class="project-open text-button" data-action="open-project" data-project-id="'+h(project.id)+'" '+(project.archived?'disabled':'')+'>'+h(project.name)+'</button></h2><p class="project-description">'+h(project.kind==='demo'?'用虚构资料演示六阶段，修改不会保存。':project.kind==='sample'?'包含虚构示例资料的副本，可修改并保存自己的内容。':project.kind==='legacy'?'保留从旧版单项目迁入的内容与进度。':'从自己的任务和资料开始，记录每一步设计判断。')+'</p><div class="project-fields"><div><span>目标产品</span><p>'+h(info.product)+'</p></div><div><span>目标体验</span><p>'+h(info.emotion)+'</p></div></div><div class="project-card-meta"><span>'+h(info.progress)+'</span><span>'+h(day(project.updatedAt))+'</span></div><div class="project-card-footer"><span class="small">'+h(info.stage)+'</span><div class="project-actions">'+open(project)+'</div></div></article>';}).join('')+'</div>';
 }
}
function renderHub(){
 cancelScroll();U.view='hub';U.suspend=true;document.body.classList.add('is-hub');
 content.setAttribute('aria-label','当前研究内容');
 $('home-nav').hidden=false;$('stage-nav').hidden=true;$('back-to-hub').hidden=true;
 $('sidebar-label').textContent='项目空间 / WORKSPACE';
 $('chapter-number').textContent='PR';$('chapter-number').classList.add('hub-mark');$('chapter-caption').textContent='PROJECTS';
 $('page-eyebrow').textContent='项目工作台 / '+({all:'我的项目',recent:'最近项目',archived:'已归档'}[Hub.filter]);
 $('page-title').innerHTML='AI辅助情感体验<br>设计系统原型';
 $('page-note').textContent='从生活资料出发，把情感理解连接到有依据的设计。';
 $('project-name').textContent='独立体验空间 · 本浏览器';
 $('save-status').textContent=Projects.isWritable()?'项目保存于本浏览器':'当前存储不可写 · 未覆盖原数据';
 document.querySelectorAll('#home-nav [data-hub-view]').forEach(button=>{button.classList.toggle('active',button.dataset.hubView===Hub.filter);button.setAttribute('aria-current',button.dataset.hubView===Hub.filter?'page':'false');});
 document.querySelectorAll('.sidebar-tools [data-stage],[data-action="history"]').forEach(button=>{button.hidden=true;});
 const heading={all:'把研究，放进各自的项目。',recent:'接着上次，继续研究。',archived:'留存完成的研究。'}[Hub.filter];
 content.innerHTML='<section class="hub-content" aria-label="项目列表"><div class="experience-welcome notice"><div><p class="eyebrow">DESIGNER TRIAL / 设计师体验版</p><h2>从同一份示例开始体验</h2><p>阅读与修改六阶段内容、选择具体措施，并查看策略方案。示例为虚构材料，本轮未连接真实AI；演示刷新或重入会恢复默认。</p></div><div class="actions">'+b('打开演示文稿','open-project','data-project-id="demo"','primary')+b('体验说明','help','','text-button')+'</div></div><div class="hub-toolbar"><div class="hub-toolbar-title"><p class="eyebrow">PROJECTS / '+Hub.filter.toUpperCase()+'</p><h2>'+heading+'</h2><p id="hub-count" class="small" aria-live="polite"></p></div><div class="hub-toolbar-actions">'+b('+ 新建项目','new-project','','primary')+'</div></div><div class="hub-controls"><label class="hub-search"><span aria-hidden="true">⌕</span><input data-hub-search aria-label="搜索项目" placeholder="搜索项目、目标产品或体验" value="'+h(Hub.query)+'"></label><label class="hub-sort"><span>排序</span><select data-hub-sort aria-label="项目排序"><option value="updated" '+(Hub.sort==='updated'?'selected':'')+'>最近修改</option><option value="created" '+(Hub.sort==='created'?'selected':'')+'>创建时间</option><option value="name" '+(Hub.sort==='name'?'selected':'')+'>项目名称</option></select></label><div class="hub-view-switch" aria-label="项目视图">'+b('卡片','hub-view','data-view="cards" aria-pressed="'+(Hub.view==='cards')+'"',Hub.view==='cards'?'active':'text-button')+b('表格','hub-view','data-view="table" aria-pressed="'+(Hub.view==='table')+'"',Hub.view==='table'?'active':'text-button')+'</div></div><div id="project-list"></div><p class="hub-section-note">项目中的资料、修改和进度各自独立。内置演示文稿只用于了解流程，重新进入后恢复默认。</p></section>';
 renderProjectList();updateApiStatus();updateReturnButton();content.scrollTop=0;U.suspend=false;
}
function showHub(filter='all'){
 cancelRecordSwitch();
 if(U.uploading){toast('请等待文件保存完成后返回项目台。');return;}
 if(activeProjectId&&activeRecord?.kind!=='demo')save();
 closeFilePreview();$('dialog').close();cancelScroll();U.editing=null;U.open.clear();U.flow?.clearHistory();U.linkedBrowsers={};U.linkSets={};U.measureBrowsers={};U.previewOrigin=null;U.measureDeletion=null;activeProjectId=null;activeRecord=null;
 Hub.filter=['all','recent','archived'].includes(filter)?filter:'all';Hub.query='';
 history.replaceState(null,'','#'+(Hub.filter==='all'?'projects':Hub.filter));
 renderHub();updateReturnButton();
}
function newProjectDialog(){
 dialog('<h2>新建研究项目</h2><form data-form="create-project" class="project-form"><label>项目名称<input name="name" aria-label="新项目名称" required maxlength="150" placeholder="为这次设计研究命名"></label><label>起始内容<select name="template" aria-label="项目起始内容"><option value="blank">空白项目</option><option value="sample">复制演示资料，自己继续修改</option></select></label><p class="form-note">空白项目从自己的资料开始；演示副本包含虚构资料。自己创建的项目会保留人工修改的字段和已解锁进度。</p><div class="actions">'+b('取消','close-dialog')+'<button type="submit" class="primary">创建项目</button></div></form>');
}
function openProject(id,requested){
 cancelRecordSwitch();
 if(U.uploading){toast('请等待当前文件保存完成。');return;}
 try{
  const project=Projects.open(id);
  closeFilePreview();$('dialog').close();cancelScroll();activeProjectId=id;activeRecord=project;S=normalizeState(project.state);
  const preferred=resolveStage(requested==='preview'?'strategies':requested||project.lastStage);
  U.view='workflow';U.editing=null;U.open.clear();U.stage=stages[preferred]&&allowed(preferred)?preferred:'task';
  U.flow=W.create({order,activeStage:U.stage,maxHistory:10});U.linkedBrowsers={};U.linkSets={};U.measureBrowsers={};
  U.previewOrigin=null;U.measureDeletion=null;
  document.body.classList.remove('is-hub');$('chapter-number').classList.remove('hub-mark');
  content.setAttribute('aria-label','当前研究内容');
  $('home-nav').hidden=true;$('stage-nav').hidden=false;$('back-to-hub').hidden=false;$('sidebar-label').textContent='研究流程 / WORKFLOW';
  document.querySelectorAll('.sidebar-tools [data-stage],[data-action="history"]').forEach(button=>{button.hidden=false;});
  render({motion:'none'});moveToStage(U.stage,false);syncMaterialLibrary();
  if(requested==='preview'&&allowed('strategies'))openExportPreview();
 }catch(error){toast(error.message||'暂时无法打开项目。');}
}

function newEventDialog(){
 if(!S.sources.length){toast('请先准备生活资料。');return;}
 dialog('<h2>整理一个情感事件</h2><form data-form="new-event"><div class="fields">'+ef.map(([key,label])=>editField(key,label,'')).join('')+'<label class="full">原始资料<select name="sourceId" aria-label="事件原始资料">'+S.sources.map(source=>'<option value="'+h(source.id)+'">'+h(source.title)+'</option>').join('')+'</select></label></div><div class="actions">'+b('取消','close-dialog')+'<button type="submit" class="primary">添加事件</button></div></form>');
}

function route(){
 const hash=location.hash.slice(1),match=/^project\/(demo|legacy|p-[0-9a-f-]+)\/([a-z]+)$/i.exec(hash);
 if(match){if(activeProjectId===match[1]&&['workflow','export'].includes(U.view)){if(match[2]==='preview')openExportPreview();else if(U.view==='export')closeExportPreview(resolveStage(match[2]),false);else go(match[2],true);}else openProject(match[1],match[2]);return;}
 showHub(['recent','archived'].includes(hash)?hash:'all');
}

const order=['task','events','causes','patterns','directions','strategies'];
const stageNames={task:'任务界定',events:'情感事件',causes:'原因解释',patterns:'评价模式',directions:'设计转译',strategies:'策略比较'};
function resolveStage(stage){return stage==='output'?'strategies':stage;}
function allowed(stage){return order.includes(stage)&&(S.workflow.mode==='demo'||order.indexOf(stage)<=S.workflow.unlocked);}
function invalidate(stage){const index=order.indexOf(stage);S.workflow.completed=S.workflow.completed.filter(k=>order.indexOf(k)<index);}
function sectionTop(el){return el.getBoundingClientRect().top-content.getBoundingClientRect().top+content.scrollTop;}
function visibleSections(){return order.filter(k=>allowed(k));}
function updateHeading(stage,animate=true){
 if(!stages[stage])return;const changed=U.stage!==stage;U.stage=stage;
 const m=stages[stage];$('project-name').textContent=(S.project.name||'未命名项目')+' · '+(activeRecord?.kind==='demo'?'演示文稿':'当前项目');$('chapter-number').textContent=m[0];$('chapter-caption').textContent=m[1];$('page-eyebrow').textContent=m[2];$('page-title').innerHTML=m[3];$('page-note').textContent=m[4];
 document.querySelectorAll('#stage-nav [data-stage],.sidebar-tools [data-stage]').forEach(el=>{
  const k=el.dataset.stage,active=k===stage,locked=!allowed(k);
  el.classList.toggle('active',!!active);el.disabled=locked;
  el.setAttribute('aria-label',stageNames[k]+(locked?'，未开放':''));
  el.title=locked?'完成当前阶段并点击下一步后开放':'查看'+stageNames[k];
  if(active)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');
  const lock=el.querySelector('.stage-lock');if(lock)lock.hidden=!locked;
 });
 $('save-status').textContent=activeRecord?.kind==='demo'?'演示文稿 · 修改不保存':canSave?(S.savedAt?'当前项目已保存在本浏览器':'当前项目 · 尚未修改'):'当前修改仅在会话中';
 history.replaceState(null,'','#project/'+activeProjectId+'/'+stage);
 updateApiStatus();
 if(changed&&animate&&!reduceMotion()){
  window.PrototypeMotion?.effect(document.querySelector('.page-heading'),[{opacity:.65},{opacity:1}],{duration:120});
 }
}
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const reduceMotion=()=>motionPreference.matches;
function animateChange(stage,kind='refresh',selector='.paper-wrap'){
 if(reduceMotion()||kind==='none')return;
 const section=content.querySelector('[data-flow-stage="'+stage+'"]');
 const direction=kind==='next'?16:kind==='prev'?-16:0;
 section?.querySelectorAll(selector).forEach(el=>window.PrototypeMotion?.effect(el,
  direction?[{opacity:.35,transform:'translateX('+direction+'px)'},{opacity:1,transform:'translateX(0)'}]:[{opacity:.65},{opacity:1}],
  {duration:direction?200:120,channel:'record-switch'}));
}
function clearRecordSwitch(entry){
 if(U.recordSwitch!==entry)return;
 U.recordSwitch=null;
 if(entry.section?.isConnected){entry.section.removeAttribute('aria-busy');entry.section.dataset.recordMotion='idle';}
}
function cancelRecordSwitch(){
 const entry=U.recordSwitch;if(!entry)return;
 clearRecordSwitch(entry);
 window.PrototypeMotion?.dismiss(entry.paper,false);
}
function recordSwitchValid(entry){
 return U.recordSwitch===entry&&entry.state===S&&entry.projectId===activeProjectId&&U.view==='workflow'&&U.stage===entry.activeStage&&S[entry.key]===entry.previous&&S[entry.kind][entry.previous]?.id===entry.sourceId;
}
function restoreRecordFocus(entry,section){
 if(!entry.focus)return;
 const control=entry.focus.selectId?document.getElementById(entry.focus.selectId):section?.querySelector('[data-action="'+entry.focus.action+'"][data-kind="'+entry.kind+'"]');
 const target=control&&!control.disabled?control:section?.querySelector('.record-switch select')||section?.querySelector('.record-nav button:not(:disabled)');
 target?.focus({preventScroll:true});
}
function commitRecordSwitch(entry,immediate=false){
 if(!recordSwitchValid(entry)){if(U.recordSwitch===entry)cancelRecordSwitch();return;}
 const next=S[entry.kind].findIndex(item=>item.id===entry.targetId);if(next<0){cancelRecordSwitch();return;}
 // Invalidate the exit callback before cancelling effects or replacing its DOM.
 clearRecordSwitch(entry);window.PrototypeMotion?.dismiss(entry.paper,false);
 S[entry.key]=next;U.editing=null;save();go(entry.stage,true,'auto','none');
 const section=content.querySelector('[data-flow-stage="'+entry.stage+'"]'),paper=section?.querySelector('.paper-wrap');
 restoreRecordFocus(entry,section);entry.after?.();
 if(immediate||reduceMotion()||!paper)return;
 entry.phase='enter';entry.section=section;entry.paper=paper;U.recordSwitch=entry;
 section.dataset.recordMotion='enter';section.setAttribute('aria-busy','true');
 const animation=window.PrototypeMotion?.effect(paper,[{opacity:0,transform:'translateX('+entry.direction+'px)'},{opacity:1,transform:'translateX(0)'}],{duration:100,channel:'record-switch',settle:()=>clearRecordSwitch(entry)});
 if(!animation)clearRecordSwitch(entry);
}
function switchRecord(kind,stage,next,feedback,trigger=null,after=null){
 if(U.recordSwitch||!Array.isArray(S[kind])||!stages[stage]||!allowed(stage))return false;
 const key=indexKey(kind,stage),previous=S[key];
 if(!Number.isInteger(next)||next<0||next>=S[kind].length||next===previous)return false;
 cancelScroll();cancelEventReturn(false);
 const section=content.querySelector('[data-flow-stage="'+stage+'"]'),paper=section?.querySelector('.paper-wrap');
 const focus=trigger?(trigger.matches('select')?{selectId:trigger.id}:{action:trigger.dataset.action}):null;
 const entry={kind,stage,key,previous,sourceId:S[kind][previous]?.id,targetId:S[kind][next].id,state:S,projectId:activeProjectId,activeStage:U.stage,section,paper,direction:feedback==='prev'?-16:16,phase:'exit',focus,after};
 U.recordSwitch=entry;
 if(reduceMotion()||!paper||!window.PrototypeMotion){commitRecordSwitch(entry,true);return true;}
 section.dataset.recordMotion='exit';section.setAttribute('aria-busy','true');
 const animation=window.PrototypeMotion.effect(paper,[{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX('+(-entry.direction)+'px)'}],{duration:100,channel:'record-switch',settle:()=>commitRecordSwitch(entry)});
 if(!animation&&U.recordSwitch===entry)commitRecordSwitch(entry,true);
 return true;
}
function cancelScroll(){
 if(U.scrollFrame!==null)cancelAnimationFrame(U.scrollFrame);
 U.scrollFrame=null;U.scrollTarget=null;U.scrollToken++;
 content.dataset.motionScroll='idle';
}
function moveToStage(stage,smooth=true,onSettled=null){
 const section=content.querySelector('[data-flow-stage="'+stage+'"]');if(!section)return;
 cancelScroll();
 const start=content.scrollTop,end=Math.max(0,Math.min(sectionTop(section),content.scrollHeight-content.clientHeight)),distance=end-start;
 if(!smooth||reduceMotion()||Math.abs(distance)<2){content.scrollTop=end;syncStage();onSettled?.();return;}
 const token=U.scrollToken,duration=Math.min(720,Math.max(420,Math.abs(distance)*.18)),began=performance.now();
 U.scrollTarget=stage;content.dataset.motionScroll='running';
 function frame(now){
  if(token!==U.scrollToken)return;
  const t=Math.min(1,(now-began)/duration),eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  content.scrollTop=start+distance*eased;
  if(t<1)U.scrollFrame=requestAnimationFrame(frame);
  else{U.scrollFrame=null;U.scrollTarget=null;content.dataset.motionScroll='idle';syncStage();onSettled?.();}
 }
 U.scrollFrame=requestAnimationFrame(frame);
}
const evidenceMotion=new WeakMap();
motionPreference.addEventListener?.('change',ev=>{
 if(!ev.matches)return;
 const recordSwitch=U.recordSwitch;
 if(recordSwitch?.phase==='exit')commitRecordSwitch(recordSwitch,true);else cancelRecordSwitch();
 cancelScroll();
 for(const el of document.querySelectorAll('details.evidence')){
  const motion=evidenceMotion.get(el);if(!motion)continue;
  motion.animation.cancel();evidenceMotion.delete(el);
  const body=el.querySelector(':scope > .detail-body');if(body)body.style.overflow='';
  el.open=motion.opening;el.dataset.motionDisclosure='idle';
 }
 syncStage();
});
function toggleEvidence(el){
 const body=el.querySelector(':scope > .detail-body');if(!body){el.open=!el.open;return;}
 const previous=evidenceMotion.get(el),opening=previous?!previous.opening:!el.open;
 const height=el.open?body.getBoundingClientRect().height:0;
 if(previous){previous.animation.cancel();evidenceMotion.delete(el);}
 const key=el.dataset.openKey;if(opening)U.open.add(key);else U.open.delete(key);
 if(reduceMotion()){
  body.style.overflow='';el.open=opening;el.dataset.motionDisclosure='idle';return;
 }
 if(opening)el.open=true;
 const end=opening?body.scrollHeight:0;
 body.style.overflow='hidden';el.dataset.motionDisclosure=opening?'opening':'closing';
 const animation=body.animate([{height:height+'px',opacity:height?1:0,transform:opening?'translateY(-3px)':'translateY(0)'},{height:end+'px',opacity:opening?1:0,transform:opening?'translateY(0)':'translateY(-3px)'}],{duration:opening?200:160,easing:'cubic-bezier(.2,.7,.2,1)'});
 const motion={animation,opening};evidenceMotion.set(el,motion);
 animation.finished.then(()=>{
  if(evidenceMotion.get(el)!==motion)return;
  evidenceMotion.delete(el);body.style.overflow='';
  if(el.isConnected){el.open=opening;el.dataset.motionDisclosure='idle';}
 }).catch(()=>{});
}
function interruptScroll(){
 if(U.scrollTarget){cancelScroll();syncStage();}
}
content.addEventListener('wheel',interruptScroll,{passive:true});
content.addEventListener('wheel',cancelRecordSwitch,{passive:true});
content.addEventListener('wheel',()=>closeMeasureDeletePrompt(false),{passive:true});
content.addEventListener('touchstart',interruptScroll,{passive:true});
content.addEventListener('touchmove',cancelRecordSwitch,{passive:true});
content.addEventListener('touchmove',()=>closeMeasureDeletePrompt(false),{passive:true});
content.addEventListener('pointerdown',interruptScroll,{passive:true});
content.addEventListener('keydown',ev=>{if(['PageDown','PageUp','Home','End','ArrowDown','ArrowUp',' '].includes(ev.key)&&!ev.target.matches('input,textarea,select')){cancelRecordSwitch();interruptScroll();}});

function syncStage(){
 if(U.view!=='workflow'||U.suspend||U.scrollTarget)return;
 const active=W.pickStage(content,content.querySelectorAll('.stage-section'),U.stage,{minShare:.55,margin:.10});
 if(active&&active!==U.stage){cancelRecordSwitch();U.flow?.setActive(active);updateHeading(active);}
}
function go(stage,reset=false,behavior='smooth',motion='refresh'){
 cancelRecordSwitch();
 stage=resolveStage(stage);
 if(U.view!=='workflow'||!activeProjectId||!stages[stage])return false;
 if(!allowed(stage)){toast('请先完成当前阶段，并点击下一步开放“'+stageNames[stage]+'”。');history.replaceState(null,'','#'+U.stage);return false;}
 const previousTop=content.scrollTop;cancelScroll();U.pendingEvent=null;U.editing=null;U.flow?.activate(stage);updateHeading(stage,motion!=='none');
 const switching=motion==='next'||motion==='prev';
 render({scrollTop:previousTop,motionStage:stage,motion:switching?'none':motion});
 moveToStage(stage,switching?false:behavior!=='auto');if(switching)animateChange(stage,motion);return true;
}
function gate(stage){
 if(stage==='strategies')return '';
 const next=order[order.indexOf(stage)+1],done=S.workflow.completed.includes(stage),open=allowed(next);
 const labels={task:'保存任务，开始检查情感事件 →',events:'事件检查完成，继续原因解释 →',causes:'原因检查完成，进入评价模式 →',patterns:'模式检查完成，进入设计转译 →',directions:'方向检查完成，进入策略比较 →',strategies:'完成策略比较'};
 const note=!next?(done?'策略比较已完成；仍可修改和回查。':'选择策略并保存理由后，完成本阶段。'):S.workflow.mode==='demo'?'演示浏览中可直接往下查看各页，不代表审核已经完成。':open?(done?'本阶段已完成；可以继续向下滚动，也可以返回修订。':'后续阶段已经开放；当前修改仍需检查。'):'下一阶段尚未开放。完成本阶段后，点击下一步继续。';
 return '<div class="stage-gate"><p class="small">'+note+'</p>'+b(labels[stage],'advance','data-from="'+stage+'"','primary')+'</div>';
}
function render(options={}){
 cancelRecordSwitch();
 closeMeasureDeletePrompt(false);
 if(U.view==='hub'){renderHub();return;}
 if(U.view==='export'){renderExportPreview();return;}
 cancelScroll();
 const current=content.querySelector('[data-flow-stage="'+U.stage+'"]'),offset=current?content.scrollTop-sectionTop(current):0;
 const views={task:taskView,events:()=>eventView(false),causes:()=>eventView(true),patterns:patternView,directions:directionView,strategies:strategyView};
 U.suspend=true;
 content.innerHTML=(activeRecord?.kind==='demo'?'<div class="project-context-note notice" role="note"><b>这是演示文稿。</b> 修改、审核及修订记录只在本次预览中有效；重新进入或刷新将全部恢复默认。要保存研究工作，请创建自己的项目。</div>':'')+visibleSections().map((stage,index)=>{
  U.renderingStage=stage;
  let html=views[stage]();
  html=html.replace(/<button[^>]*data-action="stage"[^>]*>[\s\S]*?<\/button>/g,'').replace(/<div class="actions">\s*<\/div>/g,'');
  return '<section class="stage-section'+(U.flow?.isOpen(stage)?'':' is-collapsed')+'" data-flow-stage="'+stage+'" aria-label="'+h(stageNames[stage])+'">'+stageChrome(stage)+'<div class="stage-body" id="stage-body-'+stage+'"'+(U.flow?.isOpen(stage)?'':' hidden')+'>'+html+gate(stage)+'</div></section>';
 }).join('');
 U.renderingStage=null;
 const section=content.querySelector('[data-flow-stage="'+U.stage+'"]');
 if(options.scrollTop!==undefined)content.scrollTop=options.scrollTop;
 else if(section){
  const probe=Math.min(80,content.clientHeight*.15);
  const next=section.nextElementSibling,maxOffset=next?Math.max(0,sectionTop(next)-sectionTop(section)-probe-2):Math.max(0,section.scrollHeight-probe-2);
  content.scrollTop=Math.max(0,sectionTop(section)+Math.min(Math.max(0,offset),maxOffset));
 }
 updateHeading(U.stage);U.suspend=false;updateReturnButton();
 animateChange(options.motionStage||U.stage,options.motion||'refresh');
}
function stageChrome(stage){
 const open=!!U.flow?.isOpen(stage),pinned=!!U.flow?.isPinned(stage);
 return '<div class="stage-chrome">'+b('<span class="stage-chevron" aria-hidden="true">›</span><span>'+stages[stage][0]+' / '+h(stageNames[stage])+'</span>'+(stage!=='strategies'&&S.workflow.completed.includes(stage)?'<span class="small">已检查</span>':''),'toggle-stage','data-target="'+stage+'" aria-expanded="'+open+'" aria-controls="stage-body-'+stage+'"','stage-heading-toggle')+b('<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3h8l-1 5 3 3v2H4v-2l3-3-1-5ZM10 13v5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>','pin-stage','id="stage-pin-'+stage+'" data-target="'+stage+'" aria-pressed="'+pinned+'" aria-label="'+(pinned?'取消固定':'保持展开')+h(stageNames[stage])+'" title="'+(pinned?'取消固定':'保持展开')+'"','stage-pin')+'</div>';
}
function updateStageFold(stage,onSettled=null){
 const section=content.querySelector('[data-flow-stage="'+stage+'"]'),body=section?.querySelector('.stage-body');if(!body)return;
 const open=U.flow.isOpen(stage),pinned=U.flow.isPinned(stage),stable=body.hidden===!open&&body.dataset.motionFold!=='running';
 // Keep the live heading node so focus and the reversing chevron transition survive.
 const toggle=section.querySelector('[data-action="toggle-stage"]'),pin=section.querySelector('[data-action="pin-stage"]');
 toggle?.setAttribute('aria-expanded',String(open));pin?.setAttribute('aria-pressed',String(pinned));
 pin?.setAttribute('aria-label',(pinned?'取消固定':'保持展开')+stageNames[stage]);pin?.setAttribute('title',pinned?'取消固定':'保持展开');
 section.classList.toggle('is-collapsed',!open);if(stable){body.inert=!open;onSettled?.();return;}
 const start=body.hidden?0:body.getBoundingClientRect().height,opacity=body.hidden?0:Number(window.getComputedStyle?.(body)?.opacity??1);
 window.PrototypeMotion?.dismiss(body,false);body.hidden=false;const end=open?body.scrollHeight:0;body.inert=!open;body.style.overflow='hidden';body.dataset.motionFold='running';
 const finish=()=>{body.hidden=!U.flow.isOpen(stage);body.inert=body.hidden;body.style.removeProperty('overflow');body.dataset.motionFold='idle';syncStage();onSettled?.();};
 if(reduceMotion()||!window.PrototypeMotion){finish();return;}
 window.PrototypeMotion.effect(body,[{height:start+'px',opacity},{height:end+'px',opacity:open?1:0}],{duration:180,channel:'stage-fold',settle:finish,cleanup:()=>body.style.removeProperty('overflow')});
}
function currentRecords(){return {events:S.events[S.eventIndex]?.id,causes:S.events[S.causeIndex]?.id,patterns:S.patterns[S.patternIndex]?.id,directions:S.directions[S.directionIndex]?.id,strategies:S.directions[S.strategyDirectionIndex]?.id};}
function returnEntryValid(entry){
 const list=entry.stage==='causes'?'events':entry.stage==='strategies'?'directions':entry.stage;
 return allowed(entry.stage)&&(!entry.records?.[entry.stage]||!!obj(list,entry.records[entry.stage]));
}
function updateReturnButton(){const el=$('return-to-origin');if(el)el.hidden=U.view!=='workflow'||!U.flow?.canBack({projectId:activeProjectId,validate:returnEntryValid});}
function captureOrigin(trigger){
 const stage=trigger?.closest('.stage-section')?.dataset.flowStage||U.stage,section=content.querySelector('[data-flow-stage="'+stage+'"]');
 U.flow.capture({projectId:activeProjectId,stage,records:currentRecords(),offsetX:content.scrollLeft,offsetY:section?content.scrollTop-sectionTop(section):0,
 focusId:trigger?.id||null,focus:trigger?{action:trigger.dataset.action,id:trigger.dataset.id,target:trigger.dataset.target,browser:trigger.dataset.browser}:null});
}
function jumpToRecord(target,id,trigger,immediate=false){
 if(!allowed(target)){toast('请先完成前序阶段，再回查这条内容。');return false;}
 const list=['causes','events'].includes(target)?'events':target==='patterns'?'patterns':'directions',index=S[list].findIndex(x=>x.id===id);
 if(index<0){toast('关联记录已不存在。');return false;}
 captureOrigin(trigger);S[indexKey(list,target)]=index;save();go(target,true,immediate?'auto':'smooth',immediate?'none':'refresh');$('dialog').close();return true;
}
function returnToOrigin(){
 const entry=U.flow?.back({projectId:activeProjectId,validate:returnEntryValid});if(!entry){updateReturnButton();return;}
 cancelScroll();U.editing=null;U.pendingEvent=null;
 for(const [stage,id] of Object.entries(entry.records||{})){const list=stage==='causes'?'events':stage==='strategies'?'directions':stage,index=S[list]?.findIndex(x=>x.id===id);if(index>=0)S[indexKey(list,stage)]=index;}
 U.flow.restore(entry.workflow);U.flow.setActive(entry.stage);updateHeading(entry.stage,false);render({motion:'none'});
 const section=content.querySelector('[data-flow-stage="'+entry.stage+'"]');content.scrollLeft=entry.offsetX;content.scrollTop=Math.max(0,(section?sectionTop(section):0)+entry.offsetY);
 const d=entry.focus,focus=entry.focusId?$(entry.focusId):d?[...section.querySelectorAll('button')].find(el=>el.dataset.action===d.action&&el.dataset.id===d.id&&el.dataset.target===d.target&&el.dataset.browser===d.browser):null;
 focus?.focus({preventScroll:true});save();updateReturnButton();syncStage();
}
function processed(o,eventOnly=false){const value=eventOnly?o.eventStatus:o.status;return value==='discarded'||(value==='confirmed'&&(eventOnly||!flag(o)));}
function stageProblem(stage){
 if(U.editing&&U.editing.stage===stage)return '请先保存修改，或返回阅读后再继续。';
 if(stage==='task')return projectProblem();
 if(stage==='events'){if(!S.events.length)return '目前没有情感事件，请返回任务界定准备资料。';const pending=S.events.filter(e=>!processed(e,true));if(pending.length)return '请检查并确认事件：'+pending.map(e=>e.id).join('、')+'。';}
 if(stage==='causes'){
  const pending=S.events.filter(e=>!processed(e));
  if(pending.length)return '请检查并确认原因：'+pending.map(e=>e.id).join('、')+'。';
  if(!S.events.some(e=>e.relation==='support'&&approved(e)&&e.eventStatus==='confirmed'))return '尚无确认的支持材料，请返回事件与原因补充检查。';
 }
 if(stage==='patterns'){
  const pending=S.patterns.filter(p=>!processed(p));if(pending.length)return '请检查并确认评价模式：'+pending.map(p=>p.id).join('、')+'。';
  if(!S.patterns.some(approved))return '尚无可用于转译的模式，请先确认至少一个有依据的模式或局部假设。';
 }
 if(stage==='directions'){
  const pending=S.directions.filter(d=>!processed(d));if(pending.length)return '请检查方向，确认或放弃：'+pending.map(d=>d.id).join('、')+'。';
  if(!S.directions.some(approved))return '尚无确认的设计方向，请先检查至少一个方向。';
 }
 return '';
}
function advance(stage){
 if(!order.includes(stage)||stage==='strategies')return;
 const next=order[order.indexOf(stage)+1];
 if(S.workflow.mode==='demo'&&next){go(next,true,'smooth');return;}
 const problem=stageProblem(stage);if(problem){toast(problem);if(stage==='task')focusInvalidProject();return;}
 if(stage==='task'&&!commitProject(false))return;
 S.workflow.completed=[...new Set([...S.workflow.completed,stage])];if(next)S.workflow.unlocked=Math.max(S.workflow.unlocked,order.indexOf(next));save();
 if(next)go(next,true,'smooth');else{render({motion:'none'});toast('策略比较已完成，选择与理由已保留。');}
}
content.addEventListener('scroll',syncStage,{passive:true});
window.addEventListener('resize',()=>{cancelScroll();requestAnimationFrame(syncStage);},{passive:true});

const taskFields=[['name','项目名称'],['targetUsers','目标用户'],['product','目标产品'],['emotion','目标情感体验'],['notes','备注']];
const requiredTaskFields=new Set(['name','product','emotion']);
const taskHints={name:'例如：烹饪中的安心体验',targetUsers:'例如：刚开始独立下厨的成年人（选填）',product:'例如：家用空气炸锅',emotion:'例如：安心',notes:'补充需要说明的情况（选填）'};
const fileSize=size=>size<1024?size+' B':size<1024*1024?(size/1024).toFixed(1)+' KB':(size/1024/1024).toFixed(1)+' MB';
function originalFileButton(){return '';}
function materials(){
 const rows=S.sources.map(source=>{
  const file=source.file;
  const info=file?'<div class="source-file-row"><div class="file-info"><b>'+h(file.name)+'</b><span class="small">'+h(file.kind||source.type)+' · '+fileSize(file.size)+'</span></div>'+originalFileButton(source)+'</div><p class="form-note">原始文件已保存；尚未整理为情感事件。</p>':'<div class="source-body"><p class="small">'+h(source.type)+' · '+h(source.provenance)+'</p>'+(source.paragraphs||[]).map(p=>'<div class="revision"><p class="small">段落 '+h(p.id)+'</p><p>'+h(p.text)+'</p></div>').join('')+'</div>';
  const related=S.events.filter(e=>e.sourceId===source.id).map(e=>b('查看关联事件','jump','data-target="events" data-id="'+e.id+'"','text-button')).join('');
  return dt('source-'+source.id,h(source.id)+'　'+h(source.title),info+related);
 }).join('');
 return '<div class="event-head"><div><p class="eyebrow">生活资料 / MATERIALS</p><h2>阅读示例，或输入生活资料。</h2></div>'+badge(S.sources.length+' 份资料')+'</div>'+
 '<div class="upload-zone experience-materials"><div><p class="eyebrow">DESIGNER TRIAL</p><h3>本轮体验使用示例与文字资料</h3><p>文件上传与原文件查看暂未开放。可以阅读下方虚构示例，或手动输入文字体验整理流程。</p></div><div class="upload-actions">'+b('手动输入','manual-source','','secondary')+'</div></div>'+
 '<p id="upload-status" class="form-note" role="status">自建项目仅保存在当前浏览器；演示文稿刷新或重新进入后恢复默认。</p><div class="source-file-list record-list">'+rows+'</div>';
}
function projectValues(){
 const form=content.querySelector('form[data-form="project"]'),values=form?Object.fromEntries(new FormData(form)):{};
 return Object.fromEntries(taskFields.map(([key])=>[key,String(S.taskTouched[key]?(values[key]===undefined?(S.projectDrafts[key]===undefined?S.project[key]:S.projectDrafts[key]):values[key]):S.project[key]||'').trim()]));
}
function projectProblem(){
 const values=projectValues(),missing=taskFields.filter(([key])=>requiredTaskFields.has(key)&&!values[key]);
 if(missing.length)return '请填写必填项：'+missing.map(([,label])=>label).join('、')+'。';
 if(!S.sources.length)return '请先添加至少一份生活资料。';
 return '';
}
function focusInvalidProject(){
 const values=projectValues(),missing=taskFields.find(([key])=>requiredTaskFields.has(key)&&!values[key]);
 if(missing)content.querySelector('form[data-form="project"] [name="'+missing[0]+'"]')?.focus();
}
function commitProject(notify=true){
 const problem=projectProblem();if(problem){toast(problem);focusInvalidProject();return false;}
 const before=copy(S.project),values=projectValues();Object.assign(S.project,values);
 const changed=JSON.stringify(before)!==JSON.stringify(S.project);
 if(changed){[...S.patterns,...S.directions,...S.strategies].forEach(o=>S.flags[o.id]=[...new Set([...(S.flags[o.id]||[]),'任务简报已修改，需要检查与任务的对应关系'])]);invalidate('events');log('project',S.project.id,'修改任务简报',before,S.project);}
 S.taskConfirmed=true;save();if(notify){render();toast(activeRecord?.kind==='demo'?'演示任务已确认；重新进入后恢复默认。':changed?'任务已保存，关联结果需复查。':'任务已保存，可以点击下一步。');}return true;
}
function taskInput(key,label){
 const touched=!!S.taskTouched[key],value=touched?(S.projectDrafts[key]===undefined?S.project[key]:S.projectDrafts[key]):'';
 const placeholder=!touched&&S.project[key]?S.project[key]:taskHints[key];
 const required=requiredTaskFields.has(key),attrs=' name="'+key+'" aria-label="'+h(label)+'" placeholder="'+h(placeholder)+'" '+(required&&touched?'required ':'')+' aria-required="'+required+'"';
 return key==='notes'?'<textarea'+attrs+' rows="2" maxlength="2000">'+h(value)+'</textarea>':'<input'+attrs+' value="'+h(value)+'" maxlength="300">';
}
function taskView(){
 const body='<div class="event-head"><div><p class="small">设计任务'+(S.project.id.startsWith('p-')?'':' · '+h(S.project.id))+'</p><h2>'+h(S.project.name||'未命名项目')+'</h2></div>'+badge(activeRecord?.kind==='demo'?'演示文稿':activeRecord?.kind==='sample'?'演示资料副本':'研究项目')+'</div><form data-form="project"><div class="fields">'+taskFields.map(([key,label])=>'<label class="'+(key==='notes'?'full':'')+'">'+'<span class="field-label"><span>'+label+'</span><span class="requirement-marker '+(requiredTaskFields.has(key)?'required':'optional')+'">'+(requiredTaskFields.has(key)?'必填':'选填')+'</span></span>'+taskInput(key,label)+'</label>').join('')+'</div><div class="form-note"><p>'+(activeRecord?.kind==='project'?'填写提示在点入时隐藏；没有输入就离开时恢复。必填内容需要填写，提示不作为输入。':'示例在点入时隐藏；没有输入就离开时恢复。未修改的示例可直接沿用。')+'</p><p>只有项目名称、目标产品和目标情感体验必填，'+(activeRecord?.kind==='demo'?'演示修改仅在本次预览有效。':'草稿随输入保存。')+'</p></div><div class="actions"><span class="small task-draft-notice">'+(activeRecord?.kind==='demo'?(S.taskConfirmed?'本次任务已确认，重新进入后恢复默认。':'可检查演示任务，本次修改不会保存。'):(S.taskConfirmed?'任务已保存。':'下一步会检查并保存任务。'))+'</span><button type="submit" class="secondary">保存任务简报</button></div></form>';
 return paper('PROJECT / BRIEF',body)+paper('SOURCE / MATERIALS',materials());
}

function selector(k,i){
 const stage=U.renderingStage||U.stage,id='selector-'+stage,label='切换'+(k==='events'?'事件':k==='patterns'?'情感组':'方向');
 const records=k==='patterns'?patternGroups().map(g=>g.primary):S[k],current=k==='patterns'?currentPatternGroup()?.primary.id:S[k][i]?.id;
 return '<label class="record-switch" for="'+id+'"><span>'+label+'</span><select id="'+id+'" aria-label="'+label+'" data-select-kind="'+k+'" data-select-stage="'+stage+'">'+records.map(o=>'<option value="'+S[k].findIndex(item=>item.id===o.id)+'" '+(o.id===current?'selected':'')+'>'+h(o.id)+' · '+h(k==='events'?(stage==='causes'?causeTitle(o):eventTitle(o)):k==='patterns'?patternTitle(o):o.title)+'</option>').join('')+'</select></label>';
}

const trashIcon='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const addEventIcon='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
function recordNav(k,i,removable=false,addable=false){
 const position=k==='patterns'?patternNavigationIndex():i,length=k==='patterns'?patternGroups().length:S[k].length;
 return '<div class="record-nav"><div class="actions-left">'+b('← 上一条','previous','data-kind="'+k+'" '+(position===0?'disabled':''),'text-button')+b('下一条 →','next','data-kind="'+k+'" '+(position===length-1?'disabled':''),'text-button')+'</div>'+((removable||addable)?'<div class="record-actions">'+(addable?b(addEventIcon,'new-event','aria-label="添加新的情感事件" title="添加新的情感事件"','add-event text-button'):'')+(removable?b(trashIcon,'delete-event','data-id="'+S[k][i].id+'" aria-label="删除事件" title="删除事件"','delete-event text-button'):'')+'</div>':'')+'</div>';
}
function indexKey(k,stage){return k==='events'?(stage==='causes'?'causeIndex':'eventIndex'):k==='patterns'?'patternIndex':stage==='strategies'?'strategyDirectionIndex':'directionIndex';}


const ef=[['displayTitle','事件标题'],['title','事件概述'],['context','事件介绍'],['trigger','诱发对象 / 事件'],['response','用户反应与表达'],['emotionEvidence','情感证据'],['emotionCategory','情感分组'],['evidenceType','情感证据类型']],
cf=[['causeTitle','原因标题'],['reason','情感原因解释'],['evaluationObject','评价对象'],['userConcern','用户关切']],
pf=[['patternTitle','模式标题'],['emotionCategory','情感分组']],
df=[['title','方向名称'],['task','对应产品任务'],['concern','目标任务中的用户关切'],['assumptions','转译假设'],['limits','产品不能或不应承接的要求']],
sf=[['title','策略名称'],['mechanism','实现机制'],['measure','具体设计措施'],['response','如何回应方向'],['feasibility','实现条件'],['burden','使用负担'],['limits','实施限制']];
const optionalRecordFields=new Set(['emotionCategory','evaluationObject','userConcern']);
function editField(name,label,value=''){
 if(name==='evidenceType')return '<label class="full"><span class="field-label"><span>'+h(label)+'</span><span class="requirement-marker required">必填</span></span><select name="'+name+'" aria-label="'+h(label)+'">'+Object.entries(evidence).map(([key,title])=>'<option value="'+key+'" '+(String(value||'direct')===key?'selected':'')+'>'+h(title)+'</option>').join('')+'</select></label>';
 const optional=optionalRecordFields.has(name),rows=name==='context'?5:name==='reason'?3:['displayTitle','causeTitle','patternTitle','emotionCategory'].includes(name)?1:2;
 const note=name==='emotionCategory'?'<p class="small">有明确情感表达时填写同类分组；“清楚、专业”等意义判断不等同情绪。</p>':name==='userConcern'?'<p class="small">用户希望实现的目标、标准或偏好；缺少依据时可留空。</p>':'';
 return '<label class="full"><span class="field-label"><span>'+h(label)+'</span><span class="requirement-marker '+(optional?'optional':'required')+'">'+(optional?'选填':'必填')+'</span></span><textarea aria-label="'+h(label)+'" name="'+name+'" rows="'+rows+'" '+(optional?'':'required ')+'maxlength="3000">'+h(value)+'</textarea>'+note+'</label>';
}
function editor(k,o,fields,mode=''){
 const key=k+':'+o.id+':'+mode,draft=S.drafts[key]||{values:{},reason:''};
 return '<form class="edit-form" data-form="edit" data-kind="'+k+'" data-id="'+o.id+'" data-mode="'+mode+'" data-draft-key="'+key+'"><p class="eyebrow">修订候选 / EDIT</p><div class="fields">'+fields.map(([name,t])=>editField(name,t,draft.values[name]===undefined?readPath(o,name):draft.values[name])).join('')+'<label class="full">修改备注（选填）<textarea aria-label="修改备注" name="_reason" rows="2" maxlength="1000" placeholder="可补充本次修改的说明。">'+h(draft.reason)+'</textarea></label></div>'+(mode==='cause'?appraisalEditor(o,draft):'')+'<p class="form-note">'+(activeRecord?.kind==='demo'?'草稿只在本次预览有效；':'草稿随输入保存；')+'保存修改后转为待检查，关联结果提示复查。</p><div class="actions"><div class="actions-left">'+b('返回阅读，保留草稿','cancel-edit')+b('放弃本次草稿','discard-draft','data-key="'+key+'"','text-button')+'</div><button type="submit" class="primary">保存修改</button></div></form>';
}

function legacyAppraisalBasis(value){
 return !/^\s*E-\d+\s*[·:：]/.test(String(value||''))&&/(^|[^A-Za-z0-9_-])S-\d+(?![A-Za-z0-9_-])/.test(String(value||''));
}
const appraisalEventFields=[['context','事件介绍'],['trigger','诱发对象 / 事件'],['response','用户反应与表达'],['emotionEvidence','情感证据'],['evaluationObject','评价对象'],['userConcern','用户关切']];
function appraisalBasisSummary(e,value,legacy){
 if(legacy||!String(value||'').trim())return '事件依据 · '+e.id+' · 待补充';
 const lines=String(value).split(/\r?\n/).map(line=>line.trim());
 const count=appraisalEventFields.filter(([,label])=>lines.some(line=>line.startsWith(e.id+' · '+label+'：')||line.startsWith(e.id+' · '+label+':'))).length;
 return '事件依据 · '+e.id+(count?' · '+count+'处内容':' · 查看记录');
}
function appraisalText(e){
 return A.dimensions.map(d=>{
  const v=e.appraisals[d.key],legacy=legacyAppraisalBasis(v.evidence),supported=A.isSupported(v.status)&&!legacy;
  return d.label+'：'+(supported?A.statusLabels[v.status]+' — '+v.judgment+'；事件依据：'+v.evidence:'证据不足'+(legacy?' — 旧版判断，待关联情感事件：'+v.judgment+'；旧来源引用：'+v.evidence:v.evidence?'；事件依据：'+v.evidence:''));
 }).join('\n');
}
function appraisalColumns(key){
 return A.dimensions.map(d=>d.key===key?'minmax(0, 12fr)':'minmax(46px, 1fr)').join(' ');
}
function appraisalCardHeading(e,d,index,expanded){
 const v=e.appraisals[d.key],state=legacyAppraisalBasis(v.evidence)?'insufficient':v.status,label=A.statusLabels[state]||A.statusLabels.insufficient;
 const title='<span class="appraisal-card-heading"><span class="appraisal-number">'+String(index+1).padStart(2,'0')+'</span><span class="appraisal-card-name">'+h(d.label)+'</span></span><span class="appraisal-state">'+h(label)+'</span>';
 return expanded?'<div class="appraisal-card-static">'+title+'</div>':'<button type="button" class="appraisal-card-toggle" data-action="select-appraisal-dimension" data-id="'+h(e.id)+'" data-appraisal-key="'+d.key+'" aria-expanded="false" aria-controls="appraisal-detail-'+h(e.id)+'-'+d.key+'">'+title+'</button>';
}
function appraisalView(e){
 const active=A.dimensions.filter(d=>A.isSupported(e.appraisals[d.key].status)&&!legacyAppraisalBasis(e.appraisals[d.key].evidence)).length;
 const selectionKey=(activeProjectId||'')+':'+e.id,preferred=U.appraisalSelection[selectionKey];
 const selected=A.dimensions.find(d=>d.key===preferred)||A.dimensions[0];
 const overview=A.dimensions.map(d=>{
  const v=e.appraisals[d.key],state=legacyAppraisalBasis(v.evidence)?'insufficient':v.status,label=A.statusLabels[state]||A.statusLabels.insufficient;
  return '<button type="button" class="appraisal-overview-item '+state+'" data-action="select-appraisal-dimension" data-id="'+h(e.id)+'" data-appraisal-key="'+d.key+'" aria-pressed="'+(selected?.key===d.key)+'" aria-controls="appraisal-detail-'+h(e.id)+'-'+d.key+'"><span class="appraisal-overview-name">'+h(d.label)+'</span><span class="appraisal-state">'+h(label)+'</span></button>';
 }).join('');
 const cards=A.dimensions.map((d,index)=>{
  const expanded=selected?.key===d.key,v=e.appraisals[d.key],legacy=legacyAppraisalBasis(v.evidence),state=legacy?'insufficient':v.status,label=A.statusLabels[state]||A.statusLabels.insufficient,text=A.isSupported(state)?(v.judgment||'尚未记录具体评价。'):'当前事件信息不足，暂不能判断。';
  const basis=legacy?'尚未补充当前情感事件的依据。':v.evidence||('情感事件 '+e.id+' 尚未提供这项判断所需的信息。'),detailId='appraisal-detail-'+e.id+'-'+d.key;
  return '<article class="appraisal-panel '+state+' '+(expanded?'is-expanded':'is-collapsed')+'" data-appraisal-key="'+d.key+'" role="listitem" aria-label="'+h(d.label)+'"><header class="appraisal-panel-head">'+appraisalCardHeading(e,d,index,expanded)+'</header><div id="'+h(detailId)+'" class="appraisal-panel-body" data-appraisal-key="'+d.key+'" aria-hidden="'+(!expanded)+'"'+(expanded?'':' hidden')+'><div class="appraisal-result"><span class="appraisal-label">评价内容</span><p class="appraisal-content">'+h(text)+'</p></div><div class="appraisal-basis">'+dt('appraisal-basis-'+e.id+'-'+d.key,appraisalBasisSummary(e,v.evidence,legacy),'<p class="appraisal-body-text">'+h(basis)+'</p>','appraisal-evidence')+'</div>'+(legacy?dt('legacy-basis-'+e.id+'-'+d.key,'旧版来源引用',fld('历史引用，需重新关联情感事件',v.evidence)):'')+'</div></article>';
 }).join('');
 return '<section class="appraisal-section" aria-label="七维评价判断"><div class="appraisal-section-heading"><h3>认知评价 · 七个维度</h3><span class="small">'+active+' 项已有评价</span></div><p class="form-note">默认展开动机一致性。点击标签或卡片切换，七张卡片始终保持原顺序。</p><div class="appraisal-overview" role="group" aria-label="七维评价总览">'+overview+'</div><div class="appraisal-grid '+(selected?'has-selection':'')+'" role="list" aria-label="七维评价卡片" style="grid-template-columns:'+appraisalColumns(selected?.key)+'">'+cards+'</div></section>';
}
function selectAppraisalDimension(id,key,stage,section,trigger){
 const event=obj('events',id);if(!event||!A.dimensions.some(d=>d.key===key)||!section)return;
 const current=section.querySelector('.appraisal-panel.is-expanded')?.dataset.appraisalKey,next=key,scrollTop=content.scrollTop;
 const grid=section.querySelector('.appraisal-grid'),motion=window.PrototypeMotion;
 const desktop=motion&&!motion.isReduced()&&current!==next&&grid.getBoundingClientRect().width>760;
 const before=desktop?{columns:getComputedStyle(grid).gridTemplateColumns,height:grid.getBoundingClientRect().height}:null;
 if(before){motion.dismiss(grid);grid.classList.add('is-motion-sizing');}
 U.appraisalSelection[(activeProjectId||'')+':'+id]=next;
 for(const item of section.querySelectorAll('.appraisal-overview-item'))item.setAttribute('aria-pressed',String(item.dataset.appraisalKey===next));
 grid.classList.add('has-selection');grid.style.gridTemplateColumns=appraisalColumns(next);
 let activeBody=null,activeHead=null;
 for(const card of section.querySelectorAll('.appraisal-panel')){
  const expanded=card.dataset.appraisalKey===next,body=card.querySelector('.appraisal-panel-body'),wasExpanded=card.classList.contains('is-expanded');
  if(wasExpanded!==expanded){
   const index=A.dimensions.findIndex(d=>d.key===card.dataset.appraisalKey);
   card.querySelector('.appraisal-panel-head').innerHTML=appraisalCardHeading(event,A.dimensions[index],index,expanded);
  }
  card.classList.toggle('is-expanded',expanded);card.classList.toggle('is-collapsed',!expanded);
  body.hidden=!expanded;body.setAttribute('aria-hidden',String(!expanded));
  if(expanded){activeBody=body;activeHead=card.querySelector('.appraisal-panel-head');}
 }
 if(before){
  // Keep text at its settled width while the card is resized, avoiding transient narrow-column wrapping.
  const columns=getComputedStyle(grid).gridTemplateColumns,bodyWidth=activeBody.getBoundingClientRect().width,headWidth=activeHead.getBoundingClientRect().width;
  activeBody.style.width=bodyWidth+'px';activeHead.style.width=headWidth+'px';
  const height=grid.getBoundingClientRect().height;
  motion.effect(grid,[{gridTemplateColumns:before.columns,height:before.height+'px'},{gridTemplateColumns:columns,height:height+'px'}],{
   duration:240,easing:'cubic-bezier(.22,.68,.25,1)',channel:'appraisal-layout',
   cleanup(){activeBody.style.width='';activeHead.style.width='';grid.classList.remove('is-motion-sizing');}
  });
 }
 if(current!==next)motion?.revealCard(activeBody);
 const focus=trigger?.isConnected?trigger:section.querySelector('.appraisal-overview-item[data-appraisal-key="'+key+'"]');
 focus?.focus({preventScroll:true});content.scrollTop=scrollTop;
}

function appraisalEditor(e,draft){
 const val=path=>draft.values[path]===undefined?readPath(e,path):draft.values[path];
 return '<section class="appraisal-edit-section" aria-label="编辑七维评价"><h3>七维评价判断</h3><p class="form-note">先说明用户希望或原本预期什么，再说明实际发生什么及满足程度。希望或实际情况缺少依据时，保留证据不足。</p>'+A.dimensions.map(d=>{
 const prefix='appraisals.'+d.key+'.',rawStatus=val(prefix+'status'),state=Object.prototype.hasOwnProperty.call(A.statusLabels,rawStatus)?rawStatus:'insufficient',legacy=legacyAppraisalBasis(val(prefix+'evidence'));
 return '<details class="appraisal-edit" '+(A.isSupported(state)?'open':'')+'><summary>'+h(d.label)+'</summary><p class="appraisal-question">'+h(d.question)+'</p><div class="fields"><label class="full">满足程度<select name="'+prefix+'status" aria-label="'+h(d.label)+' · 满足程度">'+Object.entries(A.statusLabels).map(([key,label])=>'<option value="'+key+'" '+(state===key?'selected':'')+'>'+h(label)+'</option>').join('')+'</select></label>'+[['judgment','评价内容',3],['evidence','事件依据（字段与内容）',3]].map(([key,label,rows])=>'<label class="full">'+label+'<textarea name="'+prefix+key+'" aria-label="'+h(d.label)+' · '+label+'" rows="'+rows+'" maxlength="3000" placeholder="'+(key==='evidence'?'引用当前情感事件的字段与内容，例如 '+e.id+' · 事件介绍。':'例如：用户希望衣服已经干燥，但实际仍湿，没有满足这个目标。')+'">'+h(key==='evidence'&&legacy?'':val(prefix+key)||'')+'</textarea>'+(key==='evidence'?'<div class="appraisal-evidence-tools"><span class="appraisal-label">引用 '+h(e.id)+' 的内容</span>'+appraisalEventFields.map(([field,title])=>b(h(title),'cite-event-field','data-kind="events" data-id="'+h(e.id)+'" data-appraisal-key="'+d.key+'" data-event-field="'+field+'"','text-button')).join('')+'</div>'+(legacy?dt('edit-legacy-basis-'+e.id+'-'+d.key,'查看保留的旧来源引用',fld('尚未关联事件内容',val(prefix+'evidence'))):''):'')+'</label>').join('')+'</div></details>';
 }).join('')+'</section>';
}

function recordReturn(target,id,title,label){
 const origin=U.renderingStage||U.stage,controlId='record-return-'+encodeURIComponent(origin+'|'+target+'|'+id),confirmId=controlId+'-reveal';
 return b('<span class="event-reference-label">'+h(title)+'</span><span id="'+confirmId+'" class="event-return-reveal" aria-hidden="true">'+h(label)+'</span>','request-event-return','id="'+controlId+'" data-target="'+h(target)+'" data-id="'+h(id)+'" data-return-title="'+h(title)+'" data-return-label="'+h(label)+'" aria-expanded="false" aria-controls="'+confirmId+'" aria-label="'+h(title)+'，点击展开回查入口"','event-return-control text-button');
}
function eventReference(e){
 return '<section class="cause-event-reference" aria-label="关联的情感事件"><p class="small">正在检查的生活事件 · '+h(e.id)+'</p>'+recordReturn('events',e.id,eventTitle(e),'查看情感事件')+'</section>';
}
function eventView(cause){
 const key=cause?'causeIndex':'eventIndex';S[key]=Math.max(0,Math.min(S[key],S.events.length-1));
 if(!S.events.length)return paper('EVENTS / EMPTY','<div class="empty"><h2>目前没有情感事件。</h2><p>准备资料后可手动整理事件；本轮未接入自动提取。</p>'+(!cause&&S.sources.length?b('添加事件','new-event','','primary'):'')+b('返回任务界定','stage','data-target="task"')+'</div>');
 const e=S.events[S[key]],mode=cause?'cause':'event',editing=U.editing&&U.editing.id===e.id&&U.editing.stage===U.renderingStage;
 const tools='<div class="event-tools">'+stamp(e,!cause)+selector('events',S[key])+'</div>';
 const head=cause?'<div class="cause-head"><div><p class="eyebrow">候选原因 · '+h(e.id)+'</p><h2 class="cause-lead">'+h(causeTitle(e))+'</h2></div>'+tools+'</div>':'<div class="event-head"><div><p class="small">生活事件 · '+h(e.id)+'</p><h2>'+h(eventTitle(e))+'</h2></div>'+tools+'</div>';
 const recheck=cause&&flag(e)?'<p class="notice">事件记录已变化，请重新检查原因与七维判断。</p>':'';
 const body=cause?fld('候选原因',e.reason||'尚未记录原因解释','cause-summary')+'<div class="concern-strip">'+fld('评价对象',e.evaluationObject||'尚未补充')+fld('用户关切',e.userConcern||'尚未补充')+'</div>'+appraisalView(e):
  fld('事件概述',e.title,'record-summary')+'<div class="event-introduction">'+fld('事件介绍',e.context)+'</div><div class="event-facts">'+[['trigger','诱发对象 / 事件'],['response','用户反应与表达'],['emotionEvidence','情感证据'],['emotionCategory','情感分组']].map(([k,label])=>fld(label,e[k]||'尚未补充')).join('')+'</div><p class="small">'+h(evidence[e.evidenceType]||'情感证据类型待核对')+'</p>';
 const attrs='data-kind="events" data-id="'+e.id+'" data-mode="'+mode+'"';
 const acts='<div class="review-footer actions"><div class="actions-left">'+b(cause?'修改解释':'修改事件','edit',attrs)+'</div>'+b(cause?'确认并检查下一条 →':'确认事件，继续检查 →','confirm',attrs,'primary')+'</div>';
 const forward=patternGroups().filter(g=>g.category===e.emotionCategory||g.records.some(p=>[...(p.eventIds||[]),...(p.counterEventIds||[]),...(p.boundaryEventIds||[])].includes(e.id))),count=S.events.filter(x=>cause?rawApproved(x):(x.eventStatus==='confirmed')).length;
 return paper((cause?'CAUSE ':'EVENT ')+String(S[key]+1).padStart(2,'0')+' / '+String(S.events.length).padStart(2,'0'),head+recheck+(editing?editor('events',e,cause?cf:ef,mode):body)+(cause?eventReference(e):'')+'<div class="source-pocket">'+raw(e)+'</div>'+(!editing?acts:'')+'<div class="review-meta meta-row">'+badge(cause?'候选解释':'事件记录')+'<span class="small">'+count+' / '+S.events.length+' 条已确认</span></div>'+(cause?dt('forward-'+e.id,'查看后续关联',forward.map(g=>'<div class="record-row"><h3>'+h(patternTitle(g.primary))+'</h3>'+groupStamp(g)+b('打开评价模式','jump','data-target="patterns" data-id="'+g.primary.id+'"','text-button')+'</div>').join('')||'<p>尚无关联模式。</p>'):'')+recordNav('events',S[key],true,!cause),'<b>本轮完成后</b>　'+(cause?'比较同情感事件中的七维判断，归纳评价模式。':'核对事件记录之后，进入原因解释。'));
}

function cancelEventReturn(restoreFocus=true){
 const pending=U.pendingEvent;if(!pending)return;
 const control=pending.trigger,reveal=document.getElementById(control.getAttribute('aria-controls'));
 control.classList.remove('is-immediate');control.classList.add('is-retracting');control.classList.remove('is-expanded');
 control.setAttribute('aria-expanded','false');
 control.setAttribute('aria-label',control.dataset.returnTitle+'，点击展开回查入口');
 if(reveal)reveal.setAttribute('aria-hidden','true');
 U.pendingEvent=null;
 if(restoreFocus&&control.isConnected)control.focus({preventScroll:true});
}
function confirmEventReturn(id,stage){
 if(!U.pendingEvent||U.pendingEvent.id!==id||U.pendingEvent.origin!==stage)return;
 const target=U.pendingEvent.target,list=['events','causes'].includes(target)?'events':target;
 if(!S[list]?.some(record=>record.id===id)){cancelEventReturn();return;}
 const trigger=U.pendingEvent.trigger;cancelEventReturn(false);jumpToRecord(target,id,trigger,true);
}
function enterEditor(kind,id,mode,stage){
 cancelRecordSwitch();
 cancelScroll();U.pendingEvent=null;U.flow?.activate(stage);U.editing={kind,id,mode,stage};updateHeading(stage,false);
 render({motion:'none'});content.scrollLeft=0;moveToStage(stage,false);
 const field=content.querySelector('[data-flow-stage="'+stage+'"]')?.querySelector('.edit-form textarea');
 field?.focus({preventScroll:true});
}
function reviewButtons(k,o,discard=false){
 const a='data-kind="'+k+'" data-id="'+o.id+'"';
 return '<div class="review-footer actions"><div class="actions-left">'+b('修改候选','edit',a)+(k==='patterns'?b('放弃本组','discard',a,'text-button'):discard?b('放弃该方向','discard',a,'text-button'):'')+'</div>'+b('确认'+(k==='patterns'?'模式':'方向'),'confirm',a,'primary')+'</div>';
}
function patternWarning(group){
 const flags=[...new Set(group.records.flatMap(p=>S.flags[p.id]||[]))];if(!flags.length)return '';
 return '<div class="notice"><b>前级内容已变化，请重新检查本组。</b><p>'+h(flags.join('；'))+'</p>'+b('保留本组内容，重新检查','retain','data-kind="patterns" data-id="'+h(group.primary.id)+'"')+'</div>';
}
function patternDimension(d){
 const ratio=Math.round(d.frequency*100),total=Math.max(1,d.denominator);
 const stateNames={satisfied:'满足',partial:'部分满足',unsatisfied:'不满足',insufficient:'证据不足'};
 return '<article class="pattern-dimension"><div class="pattern-dimension-heading"><h4>'+h(d.label)+'</h4><strong>'+d.count+' / '+d.denominator+'</strong></div><div class="pattern-frequency-bar" aria-label="涉及比例 '+ratio+'%"><span style="width:'+ratio+'%"></span></div><p class="small">已检查 '+d.reviewedCount+' · 待检查 '+d.candidateCount+'</p><div class="pattern-state-distribution" aria-label="四种评价状态分布">'+Object.keys(stateNames).map(key=>'<span class="'+key+'" style="flex:'+d.statusCounts[key]+'" title="'+stateNames[key]+' '+d.statusCounts[key]+'"></span>').join('')+'</div><div class="pattern-state-counts">'+Object.keys(stateNames).map(key=>'<span>'+stateNames[key]+' '+d.statusCounts[key]+'</span>').join('')+'</div></article>';
}
function patternConclusion(p,stats){
 const summary=P.describePattern(stats),id='pattern-conclusion-'+p.id;
 return '<section class="pattern-conclusion" aria-labelledby="'+h(id)+'"><h3 id="'+h(id)+'">模式总结</h3><p class="pattern-conclusion-lead">'+h(summary.headline)+'</p>'+
 (summary.relations.length?'<dl class="pattern-relations">'+summary.relations.map(d=>'<div><dt>'+h(d.label)+'<span class="pattern-relation-count">'+d.count+' / '+d.denominator+'</span></dt><dd>'+h(d.text)+'</dd></div>').join('')+'</dl>':'')+'<p class="form-note">'+h(summary.note)+'</p></section>';
}
function patternView(){
 const group=currentPatternGroup();if(!group)return emptyStage('评价模式','尚无可统计的情感分组。请在情感事件中补充情感分组与表达依据。');
 const p=group.primary,stats=aggregatePattern(p),groups=patternGroups(),position=patternNavigationIndex(p),editing=U.editing&&U.editing.id===p.id&&U.editing.stage===U.renderingStage;
 const insufficientEvents=stats.eventIds.filter(id=>{const e=obj('events',id);return !A.dimensions.some(d=>A.isSupported(e?.appraisals?.[d.key]?.status)&&P.hasEventBasis(e,e.appraisals[d.key]));}).length;
 const metrics='<div class="pattern-metrics">'+[[stats.eligibleCount,'同组事件'],[stats.reviewedEventCount,'事件与原因已检查'],[stats.candidateEventCount,'待检查事件'],[insufficientEvents,'无充分维度依据']].map(([n,label])=>'<div class="pattern-metric"><strong>'+n+'</strong><span>'+label+'</span></div>').join('')+'</div>';
 const chain=dt('pattern-chain-'+p.id,'查看同组、相反与边界事件',links(stats.eventIds,'同组情感事件','pattern-'+p.id)+dt('pattern-counter-'+p.id,'相反情感材料 · '+patternReferences(group,'counterEventIds').length+' 条',links(patternReferences(group,'counterEventIds'),'相反情感材料','pattern-'+p.id)+'<p class="form-note">相反情感材料用于比较；出现次数不能直接说明因果关系。</p>')+dt('pattern-boundary-'+p.id,'边界材料 · '+patternReferences(group,'boundaryEventIds').length+' 条',links(patternReferences(group,'boundaryEventIds'),'边界 / 不纳入支持','pattern-'+p.id)));
 return paper('PATTERN '+String(position+1).padStart(2,'0')+' / '+groups.length,'<div class="event-head"><div><p class="small">同情感评价模式 · '+h(group.records.map(record=>record.id).join(' / '))+'</p><h2>'+h(patternTitle(p))+'</h2></div><div class="event-tools">'+groupStamp(group)+selector('patterns',S.patternIndex)+'</div></div>'+patternWarning(group)+
 (editing?editor('patterns',p,pf):patternConclusion(p,stats)+metrics+'<section class="pattern-dimensions"><h3>认知评价 · 七个维度</h3><p class="form-note">每个维度按不同事件计数；同一事件可涉及多个维度。满足、部分满足、不满足计入涉及，证据不足单独保留。</p><div class="pattern-dimension-grid">'+stats.dimensions.map(patternDimension).join('')+'</div></section>')+chain+(!editing?reviewButtons('patterns',p):'')+'<div class="review-meta meta-row">'+badge('同组统计候选')+'<span class="small">设计师检查用于核对本组记录。</span></div>'+recordNav('patterns',S.patternIndex),'<b>下一步</b>　把本组观察放回目标产品任务中，检查迁移条件。　'+b('进入设计转译 →','stage','data-target="directions"','text-button'));
}
const translationRelationLabels={
 motivation:['实际情况符合用户的目标','目标只得到部分满足','实际情况未达到目标'],
 pleasantness:['事件本身符合用户的感官喜好','感官喜好只得到部分满足','事件本身不符合用户的感官喜好'],
 expectation:['实际结果符合原先预期','实际结果只部分符合预期','实际结果违背原先预期'],
 agency:['起因或责任归属符合用户希望','归属只部分符合用户希望','归属不符合用户希望'],
 norm:['实际情况符合用户采用的标准','实际情况只部分符合标准','实际情况未达到标准'],
 coping:['用户知道遇到变化时如何应对','用户有部分应对办法','用户缺少可行的应对办法'],
 certainty:['重要信息、条件或结果能够确认','部分信息仍不确定','用户在意的信息仍不确定']
};
function translationModel(d){const p=obj('patterns',d.patternId);return T.describe(d,p?aggregatePattern(p):null,S.project);}
function directionPropertiesText(d){
 const model=translationModel(d);
 return model.activeRows.map(row=>row.label+'：'+row.propertyLines.join('；')).join('；')||'当前尚无经过来源和产品能力检查的可承接性质。';
}
function translationSourceText(row){
 return ['satisfied','partial','unsatisfied'].map((key,index)=>row.sourceStatusCounts[key]?translationRelationLabels[row.key][index]+'（'+row.sourceStatusCounts[key]+'条）':'').filter(Boolean).join('；');
}
function translationRows(d,model){
 const layout=T.layout(model),p=obj('patterns',d.patternId),sourcePattern=p?patternGroup(p).primary:null,hasExcluded=layout.compact.some(row=>row.adoption==='excluded');
 const card=(row,compact=false)=>{
  const index=A.dimensions.findIndex(dim=>dim.key===row.key);
  const valid=['candidate','limited'].includes(row.state),hasText=row.propertyLines.length;
  const source=row.sourceCount?'<p class="translation-source"><span>原评价关系 · '+row.sourceCount+' / '+row.denominator+'条</span>'+h(translationSourceText(row))+'</p>':'<p class="translation-source">当前同组事件尚未支持这一维度的评价关系。</p>';
  const propertyBody='<div class="translation-properties '+(valid?'':'needs-review')+'"><span class="translation-label">'+(valid?'产品性质':'已记录性质 · 待重新检查')+'</span><ul>'+row.propertyLines.map(line=>'<li>'+h(line)+'</li>').join('')+'</ul></div>';
  const properties=hasText?(compact?dt('translation-retained-'+d.id+'-'+row.key,'已记录性质 · 来源待复查',propertyBody,'translation-evidence'):propertyBody):row.sourceCount?'<p class="translation-empty">尚未提出可由目标产品承接的性质。</p>':'';
  const detail=(row.capability||row.sourceCount)?dt('translation-basis-'+d.id+'-'+row.key,'能力条件与转译依据',fld('目标产品能够提供的能力',row.capability||'尚未说明')+fld('来源评价模式',sourcePattern?patternTitle(sourcePattern)+' · '+row.sourceCount+' / '+row.denominator+'条涉及该维度':'来源模式尚未支持'),'translation-evidence'):'';
  return '<article class="translation-card '+(compact?'translation-compact-card ':'')+(valid?'is-supported':'is-inactive')+'" data-translation-key="'+row.key+'" data-translation-state="'+row.state+'"><header><h4><span>'+String(index+1).padStart(2,'0')+'</span>'+h(row.label)+'</h4><span class="translation-adoption '+row.state+'">'+h(row.statusLabel)+'</span></header>'+(row.adoption==='excluded'?'':(!compact||row.sourceCount?source:'')+properties+detail)+'</article>';
 };
 return '<section class="translation-section" aria-label="七维产品性质"><div class="translation-section-head"><h3>产品需要具备哪些性质？</h3><span class="small">七个评价维度 · 按当前信息分列</span></div><p class="form-note">已有来源与性质的维度在前，其他维度集中在后；具体实现方式在下一步比较。</p><div class="translation-workspace">'+layout.wide.map(row=>'<div class="translation-column" style="--translation-weight:'+row.layoutWeight+'">'+card(row)+'</div>').join('')+(layout.compact.length?'<section class="translation-column translation-pending-column" style="--translation-weight:'+layout.compactWeight+'" aria-label="其他维度"><h4>'+(hasExcluded?'其他维度':'待补充维度')+'</h4><p class="form-note">'+(hasExcluded?'保留各维度的来源与承接状态。':'缺少来源时先补充依据，已有来源时继续转译。')+'</p>'+layout.compact.map(row=>card(row,true)).join('')+'</section>':'')+'</div></section>';
}
function directionLimitsText(d){
 const seed=D.directions.find(item=>item.id===d.id);
 return d.id==='D-02'&&d.limits===seed?.limits?String(d.limits||'').replace('模式目前是单事件局部假设；',''):String(d.limits||'');
}
function directionEditor(d){
 const key='directions:'+d.id+':',draft=S.drafts[key]||{values:{},reason:''},value=name=>draft.values[name]===undefined?(name==='limits'?directionLimitsText(d):readPath(d,name)):draft.values[name];
 return '<form class="edit-form translation-edit" data-form="edit" data-kind="directions" data-id="'+h(d.id)+'" data-mode="" data-draft-key="'+key+'"><p class="eyebrow">修订产品性质 / EDIT</p><input type="hidden" name="productBasis" value="'+h(S.project.product)+'"><div class="fields">'+df.slice(0,3).map(([name,label])=>editField(name,label,value(name))).join('')+'</div><p class="form-note">逐维检查来源是否支持、产品能否承接。产品性质按行填写；来源不足时可保留待论证，不必填满七维。</p>'+A.dimensions.map((dim,index)=>{
 const prefix='dimensionPlans.'+dim.key+'.',selected=value(prefix+'adoption')||'pending';
 return '<fieldset class="translation-edit-dimension"><legend>'+String(index+1).padStart(2,'0')+' · '+h(dim.label)+'</legend><label>承接结论<select name="'+prefix+'adoption" aria-label="'+h(dim.label)+' · 承接结论">'+Object.entries(T.adoptionLabels).map(([k,label])=>'<option value="'+k+'" '+(selected===k?'selected':'')+'>'+h(label)+'</option>').join('')+'</select></label><div class="fields">'+[['properties','产品需要具备的性质'],['capability','目标产品能够提供的能力'],['boundary','能力边界或排除理由']].map(([field,label])=>'<label class="full">'+h(label)+'<textarea name="'+prefix+field+'" aria-label="'+h(dim.label)+' · '+h(label)+'" rows="'+(field==='properties'?3:2)+'" maxlength="3000">'+h(value(prefix+field))+'</textarea></label>').join('')+'</div></fieldset>';
 }).join('')+'<div class="fields">'+df.slice(3).map(([name,label])=>'<label class="full">'+h(label)+'<textarea name="'+name+'" aria-label="'+h(label)+'" rows="2" maxlength="3000">'+h(value(name))+'</textarea></label>').join('')+'<label class="full">修改备注（选填）<textarea aria-label="修改备注" name="_reason" rows="2" maxlength="1000">'+h(draft.reason)+'</textarea></label></div><p class="form-note">保存保留实际填写与主动清空。确认方向时再检查来源、产品能力与承接性质。</p><div class="actions"><div class="actions-left">'+b('返回阅读，保留草稿','cancel-edit')+b('放弃本次草稿','discard-draft','data-key="'+key+'"','text-button')+'</div><button type="submit" class="primary">保存修改</button></div></form>';
}
function directionView(){
 if(!S.directions.length)return emptyStage('设计转译','尚未形成设计方向。请先完成前级依据。');
 const d=S.directions[S.directionIndex],p=obj('patterns',d.patternId),group=p?patternGroup(p):null,model=translationModel(d),editing=U.editing&&U.editing.id===d.id&&U.editing.stage===U.renderingStage;
 const source=p?'<section class="direction-pattern-reference" aria-label="来源评价模式"><p class="small">来源评价模式 · '+h(group.primary.id)+'</p><div class="direction-pattern-row">'+recordReturn('patterns',group.primary.id,patternTitle(group.primary),'返回评价模式')+groupStamp(group)+'</div></section>':'<p class="notice">原来源模式目前不存在，请重新检查引用。</p>';
 return paper('DIRECTION '+String(S.directionIndex+1).padStart(2,'0')+' / '+S.directions.length,'<div class="event-head"><div><p class="small">产品性质转译 · '+h(d.id)+(p?' · 来源：'+h(patternTitle(group.primary)):'')+'</p><h2>'+h(d.title)+'</h2></div><div class="event-tools">'+stamp(d)+selector('directions',S.directionIndex)+'</div></div>'+warn(d,'directions')+'<p class="form-note">目标产品：'+h(S.project.product)+'　｜　目标体验：'+h(S.project.emotion)+'</p>'+(model.productChanged?'<div class="warning"><b>目标产品已变化，请重新检查各维度的承接能力。</b><p>已记录性质保留。修改并保存当前方向后，再确认是否适合新的产品。</p></div>':'')+
 (editing?directionEditor(d):translationRows(d,model)+dt('translation-assumptions-'+d.id,'转译假设',fld('需要在目标任务中核对的关系',d.assumptions||'尚未记录')))+
 source+(!editing?reviewButtons('directions',d,true):'')+'<div class="review-meta meta-row">'+badge('产品性质候选')+'<span class="small">承接条件与目标任务中的有效性需核对。</span></div>'+recordNav('directions',S.directionIndex),
 '<b>下一步</b>　围绕产品需要具备的性质，比较不同实现策略。　'+b('进入策略比较 →','stage','data-target="strategies"','text-button'));
}

function measureUi(key){return U.measureBrowsers[key]||(U.measureBrowsers[key]={page:0,adding:false});}
function measureBinding(key){
 let values;try{values=JSON.parse(key);}catch(error){return null;}
 if(!Array.isArray(values)||values.length!==3)return null;
 const d=obj('directions',values[0]);if(!d)return null;
 const dimension=M.workspace(d,translationModel(d),S).dimensions.find(dim=>dim.key===values[1]);
 const index=dimension?.properties.findIndex(property=>property.key===key);return index>=0?{d,dimension,property:dimension.properties[index],index}:null;
}
function measurePropertyView(d,dimension,property,index){
 const ui=measureUi(property.key),page=M.page(property.candidates,ui.page,6);ui.page=page.page;
 const draft=S.measureDrafts[property.key]?.text||'',formId='measure-add-'+d.id+'-'+dimension.key+'-'+index;
 const choices=page.items.length?page.items.map(candidate=>'<div class="measure-option-row"><label class="measure-option'+(candidate.selected?' selected':'')+'"><input type="checkbox" data-measure-choice="'+h(candidate.id)+'" '+(candidate.selected?'checked':'')+'><span>'+h(candidate.measureText)+'</span></label>'+measureDeleteControl(candidate,property.key)+'</div>').join(''):'<p class="small">尚无具体措施。</p>';
 const pager=page.pages>1?'<div class="measure-page-nav"><small class="small">第 '+(page.page+1)+' / '+page.pages+' 页 · 共 '+page.total+' 条</small><div class="measure-page-actions">'+b('← 上一页','measure-page','data-property-key="'+h(property.key)+'" data-delta="-1" '+(page.page===0?'disabled':''),'text-button')+b('下一页 →','measure-page','data-property-key="'+h(property.key)+'" data-delta="1" '+(page.page===page.pages-1?'disabled':''),'text-button')+'</div></div>':'';
 const form=ui.adding?'<form class="measure-add-form" data-form="measure-add" data-property-key="'+h(property.key)+'"><label for="'+formId+'">新的具体设计措施</label><textarea class="measure-add-text" id="'+formId+'" name="measureText" rows="3" maxlength="2000" required placeholder="描述界面如何呈现信息，或用户可以执行什么操作。">'+h(draft)+'</textarea><p class="small" data-measure-draft-count>'+Array.from(draft).length+' / 1000 字</p><div class="measure-add-actions">'+b('收起','measure-add-close','data-property-key="'+h(property.key)+'"','text-button')+'<button type="submit" class="secondary">添加措施</button></div></form>':'';
 return '<article class="measure-property" data-measure-property="'+h(property.key)+'"><div class="measure-property-heading"><span>性质 '+String(index+1).padStart(2,'0')+'</span><p>'+h(property.text)+'</p></div><p class="measure-option-label">具体设计措施</p><div class="measure-options">'+choices+'</div>'+pager+'<div class="measure-selected-summary" data-measure-property-count="'+h(property.key)+'">已选 '+property.selectedCount+' / '+property.candidates.length+' 项</div>'+(ui.adding?form:b('＋ 添加新设计措施','measure-add-open','data-property-key="'+h(property.key)+'"','measure-add-toggle text-button'))+'</article>';
}
function measureDirectionView(d){
 const model=M.workspace(d,translationModel(d),S);
 const dimensions=model.dimensions.map(dim=>'<section class="measure-dimension" data-measure-dimension="'+h(dim.key)+'" aria-label="'+h(dim.label)+'"><div class="measure-dimension-heading"><h4>'+h(dim.label)+'</h4><small class="small" data-measure-dimension-count="'+h(dim.key)+'">已选 '+dim.selectedCount+' 项</small></div><div class="measure-properties">'+dim.properties.map((property,index)=>measurePropertyView(d,dim,property,index)).join('')+'</div></section>').join('');
 const review=model.reviewDimensions.length?'<p class="notice">'+model.reviewDimensions.map(dim=>h(dim.label)+'：'+h(dim.reason)).join('<br>')+'</p>':'';
 const stale=model.staleSelections.length?'<details class="measure-stale"><summary>需检查的旧选择 · '+model.staleSelections.length+' 项</summary><p class="small">原性质或来源已变化，以下选择保留原对应关系；取消勾选可移出当前选择。</p>'+model.staleSelections.map(item=>'<label class="measure-stale-option"><input type="checkbox" checked data-measure-stale="'+h(item.selectionKey)+'"><span>'+h(item.measureText)+'<small>'+h(A.dimensions.find(dim=>dim.key===item.dimensionKey)?.label||item.dimensionKey)+' · 原性质：'+h(item.propertyText)+'</small></span></label>').join('')+'</details>':'';
 return '<section class="measure-direction" data-measure-direction="'+h(d.id)+'" aria-label="设计方向 '+h(d.id)+'"><header class="measure-direction-heading"><div><p class="small">设计方向 · '+h(d.id)+'　'+(S.strategyDirectionIndex+1)+' / '+S.directions.length+'</p><h3>'+h(d.title)+'</h3></div>'+b('回查设计方向','jump','data-target="directions" data-id="'+h(d.id)+'"','text-button')+'</header><div class="measure-direction-meta">'+model.dimensions.map(dim=>'<span class="measure-dimension-tag">'+h(dim.label)+'</span>').join('')+'<span class="small" data-measure-direction-count>已选 '+model.selectedCount+' 项</span></div><div class="measure-dimensions">'+(dimensions||'<p class="notice">当前没有可承接的产品性质，请回设计转译检查。</p>')+'</div>'+review+stale+'</section>';
}
function strategyView(){
 if(!S.directions.length)return emptyStage('策略比较','尚无设计方向。先在设计转译中记录产品性质，再考虑具体措施。');
 S.strategyDirectionIndex=Math.max(0,Math.min(S.directions.length-1,Number(S.strategyDirectionIndex)||0));
 return paper('DESIGN MEASURES',measureDirectionView(S.directions[S.strategyDirectionIndex])+recordNav('directions',S.strategyDirectionIndex)+strategyExportEntry())+'<p class="next-note">'+(activeRecord?.kind==='demo'?'以下措施为演示候选；添加与选择只在本次预览有效。':'添加的措施与选择保存在本浏览器。')+'</p>';
}
function strategyExportEntry(){
 const model=X.build(S),selected=model.totals.measureCount,unresolved=model.totals.unresolvedCount,available=selected+unresolved>0;
 return '<div class="strategy-export-entry" data-export-entry><div><h3>整理策略方案</h3><p>'+h(available?'共选择 '+selected+' 条有效措施，涉及 '+model.totals.directionCount+' 个设计方向。'+(unresolved?'另有 '+unresolved+' 条选择需要核对。':''):'选择具体措施后，可预览任务、研究依据与设计方案。')+'</p></div>'+b('预览策略方案 →','export-preview','id="preview-strategy-button" '+(available?'':'disabled'),'primary')+'</div>';
}
function refreshStrategyExportEntry(){
 const holder=content.querySelector('[data-export-entry]');if(holder){const template=document.createElement('template');template.innerHTML=strategyExportEntry();holder.replaceWith(template.content.firstElementChild);}
}
function openExportPreview(trigger=null){
 if(U.view==='export')return true;
 if(U.view!=='workflow'||!allowed('strategies')){toast('请先进入策略比较，再整理方案。');return false;}
 cancelRecordSwitch();cancelScroll();cancelEventReturn(false);closeMeasureDeletePrompt(false);
 const originStage=trigger?.closest('.stage-section')?.dataset.flowStage||U.stage,section=content.querySelector('[data-flow-stage="'+originStage+'"]');
 U.previewOrigin={projectId:activeProjectId,stage:originStage,workflow:U.flow.snapshot(),offsetX:content.scrollLeft,offsetY:section?content.scrollTop-sectionTop(section):0,focusId:trigger?.id||null};
 U.view='export';renderExportPreview();content.scrollTop=0;content.scrollLeft=0;
 content.querySelector('.export-toolbar button')?.focus({preventScroll:true});return true;
}
function renderExportPreview(){
 cancelScroll();U.suspend=true;
 updateHeading('strategies',false);
 $('chapter-caption').textContent='STRATEGY PREVIEW';$('page-eyebrow').textContent='策略方案 / 输出预览';$('page-title').innerHTML='把设计选择，<br>整理成一份方案。';$('page-note').textContent='从任务界定到已选具体措施，沿来源关系呈现同一份连续文档。';
 const model=X.build(S),date=new Date().toLocaleDateString('zh-CN');
 content.setAttribute('aria-label','策略方案预览');content.innerHTML='<div class="export-toolbar">'+b('← 返回策略比较','export-back','','text-button')+'<span>方案预览 · 连续长文档</span></div>'+ExportView.render(model,{demo:activeRecord?.kind==='demo',date});
 history.replaceState(null,'','#project/'+activeProjectId+'/preview');U.suspend=false;updateReturnButton();
}
function closeExportPreview(stage='strategies',restore=true){
 if(U.view!=='export')return false;
 const origin=U.previewOrigin&&U.previewOrigin.projectId===activeProjectId?U.previewOrigin:null;
 U.previewOrigin=null;U.view='workflow';content.setAttribute('aria-label','当前研究内容');
 if(restore&&origin&&allowed(origin.stage)){
  U.flow.restore(origin.workflow);U.flow.setActive(origin.stage);updateHeading(origin.stage,false);render({motion:'none'});
  const section=content.querySelector('[data-flow-stage="'+origin.stage+'"]');content.scrollLeft=origin.offsetX;content.scrollTop=Math.max(0,(section?sectionTop(section):0)+origin.offsetY);
  if(origin.focusId)$(origin.focusId)?.focus({preventScroll:true});syncStage();return true;
 }
 U.flow.activate(allowed(stage)?stage:'strategies');updateHeading(allowed(stage)?stage:'strategies',false);render({motion:'none'});moveToStage(U.stage,false);return true;
}
function measureDeleteControl(candidate,key){
 const panelId='measure-delete-confirm-'+candidate.id;
 return '<div class="measure-delete-zone" data-measure-delete-zone="'+h(candidate.id)+'">'+b('<span class="measure-delete-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/></svg></span><span class="measure-delete-label" aria-hidden="true">删除</span>','measure-delete','data-measure-id="'+h(candidate.id)+'" data-property-key="'+h(key)+'" aria-expanded="false" aria-controls="'+h(panelId)+'" aria-label="删除具体措施，点击展开" title="展开删除操作"','measure-delete-trigger')+'<div class="measure-delete-confirm" id="'+h(panelId)+'" role="group" aria-label="确认删除具体措施" hidden><p>删除这条具体措施？</p><div class="measure-delete-confirm-actions">'+b('取消','measure-delete-cancel','','text-button')+b('确认删除','measure-delete-confirm','data-measure-id="'+h(candidate.id)+'"','danger')+'</div></div></div>';
}
function closeMeasureDeletePrompt(restoreFocus=false){
 const prompt=U.measureDeletePrompt;if(!prompt)return;U.measureDeletePrompt=null;
 if(prompt.zone?.isConnected){
  prompt.trigger.classList.remove('is-expanded');prompt.trigger.setAttribute('aria-expanded','false');prompt.trigger.setAttribute('aria-label','删除具体措施，点击展开');
  prompt.panel.hidden=true;window.PrototypeMotion?.dismiss(prompt.panel,false);prompt.zone.classList.remove('is-above');
  if(restoreFocus)prompt.trigger.focus({preventScroll:true});
 }
}
function requestMeasureDelete(trigger){
 const id=trigger.dataset.measureId,key=trigger.dataset.propertyKey,binding=measureBinding(key);
 if(!binding||!binding.property.candidates.some(item=>item.id===id)){closeMeasureDeletePrompt(false);toast('当前措施或来源已变化，请先检查。');return;}
 const current=U.measureDeletePrompt;
 if(current&&current.trigger===trigger&&current.phase==='expanded'){
  current.phase='confirm';current.panel.hidden=false;
  const bottom=content.getBoundingClientRect().bottom,top=content.getBoundingClientRect().top,anchor=current.zone.getBoundingClientRect();
  current.zone.classList.toggle('is-above',bottom-anchor.bottom<150&&anchor.top-top>150);
  window.PrototypeMotion?.effect(current.panel,[{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,channel:'measure-delete'});
  current.panel.querySelector('[data-action="measure-delete-cancel"]')?.focus({preventScroll:true});return;
 }
 if(current&&current.trigger===trigger&&current.phase==='confirm')return;
 closeMeasureDeletePrompt(false);
 const zone=trigger.closest('.measure-delete-zone'),panel=zone.querySelector('.measure-delete-confirm');
 U.measureDeletePrompt={projectId:activeProjectId,id,key,zone,trigger,panel,phase:'expanded'};
 trigger.classList.add('is-expanded');trigger.setAttribute('aria-expanded','true');trigger.setAttribute('aria-label','删除');
}
function confirmMeasureDelete(id){
 const prompt=U.measureDeletePrompt;
 if(!prompt||prompt.phase!=='confirm'||prompt.id!==id||prompt.projectId!==activeProjectId||!prompt.zone.isConnected)return;
 const binding=measureBinding(prompt.key);if(!binding?.property.candidates.some(item=>item.id===id)){closeMeasureDeletePrompt(false);toast('当前措施或来源已变化，请先检查。');return;}
 closeMeasureDeletePrompt(false);deleteMeasure(id);
}
function deleteMeasure(id){
 try{
  const deletion=M.removeCandidate(S,id),key=M.propertyKey(deletion.candidate.directionId,deletion.candidate.dimensionKey,deletion.candidate.propertyText);
  S.designMeasures=deletion.state.designMeasures;S.measureSelections=deletion.state.measureSelections;
  U.measureDeletion={projectId:activeProjectId,candidate:deletion.candidate,removedSelections:deletion.removedSelections,position:deletion.position};
  touch('selection','','designMeasures');touch('selection','','measureSelections');invalidate('strategies');log('designMeasures',id,'删除具体设计措施',U.measureDeletion,{deleted:true});save();
  refreshMeasureProperty(key,measureUi(key).adding?'input':{action:'measure-add-open'});const d=obj('directions',deletion.candidate.directionId);if(d)refreshMeasureCounts(d);
  toast(deletion.removedSelections.length?'已删除措施，并移出对应选择。':'已删除措施。',true);
 }catch(error){toast(error.message||'暂时无法删除措施。');}
}
function undoMeasureDelete(deletion=U.measureDeletion){
 if(!deletion||deletion.projectId!==activeProjectId){toast('这次删除已不能在当前项目撤销。');return;}
 try{
  const restored=M.restoreCandidate(S,deletion);S.designMeasures=restored.designMeasures;S.measureSelections=restored.measureSelections;
  touch('selection','','designMeasures');touch('selection','','measureSelections');invalidate('strategies');log('designMeasures',deletion.candidate.id,'撤销措施删除',{deleted:true},deletion);save();if(U.measureDeletion?.candidate.id===deletion.candidate.id)U.measureDeletion=null;
  const key=M.propertyKey(deletion.candidate.directionId,deletion.candidate.dimensionKey,deletion.candidate.propertyText),binding=measureBinding(key);
  if(binding)measureUi(key).page=M.page(binding.property.candidates,Math.floor(binding.property.candidates.findIndex(item=>item.id===deletion.candidate.id)/6),6).page;
  if(U.view==='export'){const top=content.scrollTop;renderExportPreview();content.scrollTop=top;}else{refreshMeasureProperty(key,{measureId:deletion.candidate.id});if(binding)refreshMeasureCounts(binding.d);else refreshStrategyExportEntry();}
  toast('已撤销删除，恢复原措施及原选择。');
 }catch(error){toast(error.message||'暂时无法撤销删除。');}
}
function refreshMeasureProperty(key,focus=null){
 if(U.measureDeletePrompt?.key===key)closeMeasureDeletePrompt(false);
 const binding=measureBinding(key),holder=[...content.querySelectorAll('[data-measure-property]')].find(el=>el.dataset.measureProperty===key);if(!binding||!holder)return null;
 const top=holder.getBoundingClientRect().top,template=document.createElement('template');template.innerHTML=measurePropertyView(binding.d,binding.dimension,binding.property,binding.index);
 const next=template.content.firstElementChild;holder.replaceWith(next);content.scrollTop+=next.getBoundingClientRect().top-top;
 const control=focus?.measureId?[...next.querySelectorAll('[data-measure-choice]')].find(el=>el.dataset.measureChoice===focus.measureId):focus?.action?[...next.querySelectorAll('[data-action]')].find(el=>el.dataset.action===focus.action&&!el.disabled&&(!focus.delta||el.dataset.delta===focus.delta)):focus==='input'?next.querySelector('textarea'):null;
 (control||next.querySelector('.measure-page-actions button:not(:disabled)'))?.focus({preventScroll:true});return next;
}
function refreshMeasureCounts(d){
 const holder=[...content.querySelectorAll('[data-measure-direction]')].find(el=>el.dataset.measureDirection===d.id);if(!holder)return;
 const model=M.workspace(d,translationModel(d),S);
 holder.querySelector('[data-measure-direction-count]').textContent='已选 '+model.selectedCount+' 项';
 for(const dimension of model.dimensions){
  const counter=[...holder.querySelectorAll('[data-measure-dimension-count]')].find(el=>el.dataset.measureDimensionCount===dimension.key);
  if(counter)counter.textContent='已选 '+dimension.selectedCount+' 项';
  for(const property of dimension.properties){
   const count=[...holder.querySelectorAll('[data-measure-property-count]')].find(el=>el.dataset.measurePropertyCount===property.key);
   if(count)count.textContent='已选 '+property.selectedCount+' / '+property.candidates.length+' 项';
  }
 }
 refreshStrategyExportEntry();
}

function dialog(html){
 const box=$('dialog-content'),wasOpen=$('dialog').open;
 const template=document.createElement('template');template.innerHTML=html;
 template.content.querySelectorAll('button[data-action="close-dialog"]').forEach(button=>{if(button.textContent.trim()==='关闭')button.remove();});
 template.content.querySelectorAll('.actions').forEach(row=>{if(!row.children.length&&!row.textContent.trim())row.remove();});
 html=template.innerHTML;
 box.innerHTML='<div class="dialog-head"><span class="eyebrow">EXPERIENCE RESEARCH / PROTOTYPE</span>'+b('关闭','close-dialog','','dialog-close')+'</div>'+html;
 if(!wasOpen)$('dialog').showModal();
 else window.PrototypeMotion?.revealDialogContent(box);
}
function historicalAppraisalLabel(value){return A.statusLabels[value]||({candidate:'旧版候选判断','not-applicable':'旧版不适用'}[value]||'旧版状态：'+value);}
function revisionDiff(r){
 const deletion=r.before?.candidate?r.before:r.after?.candidate?r.after:null;
 if(deletion&&['删除具体设计措施','撤销措施删除'].includes(r.action))return fld('具体设计措施',deletion.candidate.measureText)+fld('设计方向',deletion.candidate.directionId)+fld('评价维度',A.dimensions.find(item=>item.key===deletion.candidate.dimensionKey)?.label||deletion.candidate.dimensionKey)+fld('产品性质',deletion.candidate.propertyText)+fld('删除前选择',deletion.removedSelections?.length?'已选，恢复时保留原选择':'未选择');
 if([...Array.isArray(r.before)?r.before:[],...Array.isArray(r.after)?r.after:[]].some(item=>item&&typeof item==='object'&&item.measureId)){
  const measures=items=>Array.isArray(items)&&items.length?items.map(item=>'<div class="revision"><p class="small">'+h(item.measureId)+' · '+h(item.directionId)+' · '+h(A.dimensions.find(dim=>dim.key===item.dimensionKey)?.label||item.dimensionKey)+'</p>'+fld('产品性质',item.propertyText)+fld('具体设计措施',item.measureText)+'</div>').join(''):'<p class="small">未选择措施。</p>';
  return '<div class="supports"><div><h3>此前选择</h3>'+measures(r.before)+'</div><div><h3>本次选择</h3>'+measures(r.after)+'</div></div>';
 }
 const names={directionId:'设计方向',dimensionKey:'评价维度',propertyText:'产品性质',measureText:'具体设计措施',createdBy:'添加者',displayTitle:'事件标题',causeTitle:'原因标题',evaluationObject:'评价对象',userConcern:'用户关切',emotionCategory:'情感分组',patternTitle:'模式标题',checkItems:'检查事项',reviewChecks:'检查记录',title:r.kind==='events'?'事件概述':'名称',name:'项目名称',targetUsers:'目标用户',product:'目标产品',emotion:'目标体验',notes:'备注',task:'产品任务',context:'事件介绍',trigger:'诱发对象',response:'用户反应 / 响应关系',emotionEvidence:'情感证据',reason:r.kind==='selection'?'选择理由':'原因解释',concern:r.kind==='events'?'旧版用户关切':'用户关切',appraisal:'旧版评价判断',alternative:'旧版其他解释',appraisals:'七维评价判断',legacyAppraisalReferences:'旧版评价依据存档',legacyAppraisalStates:'旧版评价状态存档',summary:'评价关系',scope:'适用范围',uncertainty:'边界与未确定内容',proposal:'旧版设计方向',dimensionPlans:'七维产品性质',productBasis:'承接目标产品',translationVersion:'产品性质格式',adoption:'承接结论',properties:'产品性质',capability:'产品能力',boundary:'能力边界或排除理由',assumptions:'转译假设',limits:'限制',mechanism:'实现机制',measure:'设计措施',feasibility:'实现条件',burden:'使用负担',status:'设计师审核',eventStatus:'事件审核',compatibility:'冲突处理',ids:'选中策略',provenance:'资料来源',paragraphs:'资料原文'};
 const format=(k,v)=>{if(v==null)return '尚未记录';if(k==='dimensionKey')return A.dimensions.find(dim=>dim.key===v)?.label||v;if(k==='createdBy')return v==='designer'?'设计师':v;if(k==='status'||k==='eventStatus')return status[v]||(v==='deferred'?'旧版处理状态':v);if(k==='dimensionPlans')return A.dimensions.map(d=>{const plan=v[d.key];return plan?d.label+' · '+(T.adoptionLabels[plan.adoption]||'待论证')+'\n产品性质：'+(plan.properties||'尚未记录')+'\n产品能力：'+(plan.capability||'尚未记录')+'\n能力边界或排除理由：'+(plan.boundary||'尚未记录'):'';}).filter(Boolean).join('\n\n');if(k==='legacyAppraisalStates')return A.dimensions.map(d=>{const item=v[d.key];return item?d.label+'：'+historicalAppraisalLabel(item.status)+' '+(item.judgment||'')+'；原依据：'+(item.evidence||'')+'；原说明：'+(item.note||''):'';}).filter(Boolean).join('\n');if(k==='legacyAppraisalReferences')return A.dimensions.map(d=>{const item=v[d.key];return item?d.label+'：'+(item.evidence||'')+(item.judgment?'；旧评价内容：'+item.judgment:''):'';}).filter(Boolean).join('\n');if(k==='appraisals')return A.dimensions.map(d=>{const item=v[d.key];return item?d.label+'：'+historicalAppraisalLabel(item.status)+' '+item.judgment+'；'+(legacyAppraisalBasis(item.evidence)?'旧版来源引用（待关联事件）：':'事件依据：')+item.evidence+(item.note?'；旧版补充文字：'+item.note:''):'';}).join('\n');if(k==='reviewChecks')return Object.entries(v).map(([item,checked])=>{let name=item;try{name=decodeURIComponent(item.replace(/^check:/,''));}catch(error){}return name+'：'+(checked?'已检查':'未检查');}).join('\n');if(Array.isArray(v))return v.map(x=>typeof x==='object'?(x.text||x.id||''):x).join('、');return String(v);};
 if(Array.isArray(r.before)||Array.isArray(r.after))return '<div class="supports">'+fld('此前选择',format('ids',r.before))+fld('本次选择',format('ids',r.after))+'</div>';
 const keys=[...new Set([...Object.keys(r.before||{}),...Object.keys(r.after||{})])].filter(k=>names[k]&&JSON.stringify(r.before[k])!==JSON.stringify(r.after[k]));
 return keys.length?keys.map(k=>'<div class="revision"><h3>'+h(names[k])+'</h3><div class="supports">'+fld('修改前',format(k,r.before[k]))+fld('修改后',format(k,r.after[k]))+'</div></div>').join(''):'<p class="form-note">本次记录的是处理状态，内容未变化。</p>';
}
function legacyCauseHistory(){
 const fields=S.legacyCauseFields||{},drafts=S.legacyCauseDrafts||{};
 if(!Object.keys(fields).length&&!Object.keys(drafts).length)return '';
 return dt('legacy-cause-fields','查看旧版原因字段存档','<p class="form-note">旧栏目已退出当前编辑，不自动换成七维判断。以下保留此前内容。</p>'+Object.entries(fields).map(([id,value])=>'<div class="revision"><h3>'+h(id)+'</h3>'+Object.entries(value).map(([key,text])=>fld({concern:'旧版用户关切',appraisal:'旧版评价判断',alternative:'旧版其他解释'}[key]||key,text)).join('')+'</div>').join('')+Object.entries(drafts).map(([id,value])=>'<div class="revision"><h3>'+h(id)+' · 旧草稿</h3>'+Object.entries(value).map(([key,text])=>fld(key,text)).join('')+'</div>').join(''));
}
function legacyAppraisalHistory(){
 const records=(S.events||[]).filter(e=>e.legacyAppraisalReferences&&Object.keys(e.legacyAppraisalReferences).length);
 if(!records.length)return '';
 return dt('legacy-appraisal-references','查看旧版评价依据存档','<p class="form-note">未修改的演示默认依据已改为事件字段。以下保留升级前的文字，不作为当前事件判断依据。</p>'+records.map(e=>'<div class="revision"><h3>'+h(e.id)+'</h3>'+A.dimensions.map(d=>{const item=e.legacyAppraisalReferences[d.key];return item?fld(d.label+' · 旧来源引用',item.evidence)+(item.judgment?fld(d.label+' · 旧评价内容',item.judgment):''):'';}).join('')+'</div>').join(''));
}
function legacyAppraisalStatusHistory(){
 const records=(S.events||[]).filter(e=>e.legacyAppraisalStates&&Object.keys(e.legacyAppraisalStates).length),drafts=S.legacyAppraisalDraftStates||{};
 if(!records.length&&!Object.keys(drafts).length)return '';
 const entries=value=>A.dimensions.map(d=>{const item=value[d.key];return item?'<h4>'+h(d.label)+'</h4>'+fld('原状态',historicalAppraisalLabel(item.status))+fld('原评价内容',item.judgment||'尚未记录')+fld('原依据',item.evidence||'尚未记录')+(item.note?fld('原补充文字',item.note):''):'';}).join('');
 return dt('legacy-appraisal-states','查看旧版评价状态存档','<p class="form-note">旧状态不能自动等同满足程度。以下保存原记录；无法确定比较目标的旧评价当前按证据不足处理，待设计师补充。</p>'+records.map(e=>'<div class="revision"><h3>'+h(e.id)+'</h3>'+entries(e.legacyAppraisalStates)+'</div>').join('')+Object.entries(drafts).map(([key,value])=>'<div class="revision"><h3>'+h(key)+' · 旧草稿</h3>'+entries(value)+'</div>').join(''));
}
function historyView(){dialog('<h2>修订记录</h2>'+legacyCauseHistory()+legacyAppraisalHistory()+legacyAppraisalStatusHistory()+'<p class="form-note">人工操作与初始候选分开记录，保留最近 150 条。</p>'+(S.revisions.length?S.revisions.map(r=>'<section class="revision"><div class="meta-row"><b>'+h(r.action)+' · '+h(r.id)+'</b><span>'+h(new Date(r.time).toLocaleString('zh-CN'))+'</span></div><p>操作者：设计师</p>'+(r.reason?'<p>理由：'+h(r.reason)+'</p>':'')+dt('revision-'+r.time+r.id,'查看修改前后',revisionDiff(r))+(r.kind==='designMeasures'&&r.action==='删除具体设计措施'&&M.validCandidate(r.before?.candidate)&&!S.designMeasures.some(item=>item.id===r.before.candidate.id)?b('恢复这条措施','measure-delete-restore','data-revision-time="'+h(r.time)+'" data-measure-id="'+h(r.id)+'"','text-button'):'')+'</section>').join(''):'<p class="empty">尚无修订。修改、审核与选择后会在这里留下记录。</p>'));}

function deps(k,o){
 if(k==='patterns')return aggregatePattern(o).eventIds.map(id=>obj('events',id)).filter(e=>e&&(!approved(e)||e.eventStatus!=='confirmed'));
 if(k==='directions'){const p=obj('patterns',o.patternId);return approved(p)?[]:[p];}return [];
}
function review(k,o,action,mode,stage,trigger=null){
 if(U.recordSwitch)return;
 const isEvent=k==='events'&&mode==='event';
 if(action==='confirm'){
  if(k==='events'&&!isEvent&&!String(o.reason||'').trim()){toast('请先补充原因解释，再确认。');return;}
  if(k==='events'&&!isEvent&&A.dimensions.some(d=>A.isSupported(o.appraisals[d.key].status)&&legacyAppraisalBasis(o.appraisals[d.key].evidence))){toast('请先修改解释，补充当前情感事件依据后再确认。旧来源引用仍保留。');return;}
  if(k==='directions'){const p=obj('patterns',o.patternId),check=T.validate(o,p?aggregatePattern(p):null,S.project);if(!check.valid){toast(check.errors[0].message);return;}}
  if(k==='patterns'){
   const stats=aggregatePattern(o);
   if(!stats.eligibleCount||!stats.dimensions.some(d=>d.count)){toast('本组尚无有依据的七维评价，请补充事件判断，或放弃本组。');return;}
  }
  if(k==='events'&&!isEvent&&o.eventStatus!=='confirmed'){toast('请先回到情感事件核对并确认 '+o.id+'，再确认其原因。');return;}
  const missing=deps(k,o);if(missing.length){toast('请先检查并确认前级依据：'+missing.map(x=>x?x.id:'未关联').join('、')+'。');return;}
 }
 const next=action==='confirm'?'confirmed':'discarded';
 if(k==='patterns'){
  const group=patternGroup(o),before=copy(group.records);
  for(const record of group.records){const prior=record.status;record.status=next;touch(k,record.id,'status');delete S.flags[record.id];if(action==='discard'||prior!==next)downstream(k,record.id,record.id+' 的同情感模式已改为'+status[next]);}
  invalidate(stage);log(k,o.id,status[next]+'（本组）',before,group.records);save();go(stage,true);toast(action==='confirm'?'本组确认已记录。':'本组已放弃，原记录仍保留。');return;
 }
 const before={status:o.status,eventStatus:o.eventStatus},prior=isEvent?before.eventStatus:before.status;
 if(isEvent){o.eventStatus=next;touch(k,o.id,'eventStatus');}else{o.status=next;touch(k,o.id,'status');}
 if(!isEvent&&action==='confirm')delete S.flags[o.id];
 if(isEvent&&prior==='confirmed'&&next!=='confirmed'){o.status='pending';S.flags[o.id]=[o.id+' 的事件审核已变化'];downstream('events',o.id,o.id+' 的事件已改为'+status[next]);}
 else if(action==='discard')downstream(k,o.id,o.id+' 已改为'+status[next]);
 invalidate(stage);log(k,o.id,status[next],before,{status:o.status,eventStatus:o.eventStatus});save();
 const key=k==='events'?indexKey('events',stage):null;
 if(key&&S[key]<S.events.length-1){switchRecord('events',stage,S[key]+1,'next',trigger,()=>toast((action==='confirm'?'已确认':'已放弃')+'，继续检查下一条。'));}
 else{go(stage,true);toast(action==='confirm'?'设计师确认已记录；目标用户仍待验证。':'已记录处理状态。');}
}


function resetDemo(){
 const addedSources=copy(S.sources.filter(source=>source.attachmentId||!D.sources.some(original=>original.id===source.id)));
 const deleted=copy(S.deletedEventIds||[]);
 S=defaults();S.deletedEventIds=deleted;S.events=S.events.filter(event=>!deleted.includes(event.id));
 for(const pattern of S.patterns)for(const key of ['eventIds','counterEventIds','boundaryEventIds'])pattern[key]=(pattern[key]||[]).filter(id=>!deleted.includes(id));
 S.sources.push(...addedSources);
}
function removeEvent(id,stage){
 const event=obj('events',id);if(!event)return;
 const currentKey=indexKey('events',stage),previousIndex=S[currentKey];
 const count=downstream('events',id,id+' 的事件已删除，需要重新检查依据');
 for(const pattern of S.patterns)for(const key of ['eventIds','counterEventIds','boundaryEventIds'])pattern[key]=(pattern[key]||[]).filter(value=>value!==id);
 S.events=S.events.filter(e=>e.id!==id);S.deletedEventIds=[...new Set([...S.deletedEventIds,id])];
 delete S.flags[id];
 for(const key of Object.keys(S.drafts))if(key.startsWith('events:'+id+':'))delete S.drafts[key];
 if(S.legacyCauseFields)delete S.legacyCauseFields[id];
 for(const key of Object.keys(S.legacyCauseDrafts||{}))if(key.startsWith('events:'+id+':'))delete S.legacyCauseDrafts[key];
 for(const key of Object.keys(S.legacyAppraisalDraftStates||{}))if(key.startsWith('events:'+id+':'))delete S.legacyAppraisalDraftStates[key];
 S.revisions=S.revisions.filter(r=>!(r.kind==='events'&&r.id===id));
 for(const key of ['eventIndex','causeIndex'])S[key]=Math.max(0,Math.min(S[key],S.events.length-1));
 U.editing=null;invalidate('events');log('events',id,'永久删除事件',{},{});save();$('dialog').close();go(stage,true,'smooth',S.events.length?(S[currentKey]<previousIndex?'prev':'next'):'refresh');
 toast('事件已永久删除。'+(count?count+' 项关联结果需要复查。':'')+'原始资料仍保留。');
}
function sourceFromFile(file){
 const id='S-'+String(Math.max(0,...S.sources.map(s=>Number(s.id.slice(2))||0))+1).padStart(2,'0');
 return {id,title:file.name,type:file.kind||'文件',provenance:'用户上传原始文件',paragraphs:[],attachmentId:file.id,file};
}
async function uploadFiles(files){
 toast('本轮体验未开放文件上传，请使用示例或手动输入文字。');return;
 if(!files.length)return;
 if(activeRecord?.kind==='demo'){toast('演示文稿不保存原件。请创建自己的项目后上传资料。');return;}
 if(U.uploading){toast('请等待当前文件保存完成。');return;}
 const projectId=activeProjectId,state=S,client=filesForProject();
 U.uploading=true;
 const status=$('upload-status'),zone=content.querySelector('[data-upload-zone]');
 zone?.setAttribute('aria-busy','true');if(status)status.textContent='正在保存 '+files.length+' 个文件……';
 try{
  if(!window.PrototypeFiles)throw new Error('文件功能未加载，请刷新页面。');
  const saved=await client.saveFiles(files);
  if(activeProjectId!==projectId||S!==state)return;
  for(const file of saved){const source=sourceFromFile(file);S.sources.push(source);log('sources',source.id,'添加原文件',{},source);}
  save();render({motion:'none'});toast('已添加 '+saved.length+' 个原文件，可在资料中打开。');
 }catch(error){
  if(activeProjectId!==projectId||S!==state)return;
  if(error.retainedFiles?.length){for(const file of error.retainedFiles)if(!S.sources.some(s=>s.attachmentId===file.id))S.sources.push(sourceFromFile(file));save();render({motion:'none'});}
  toast(error.message||'文件没有成功保存，请重试。');if($('upload-status'))$('upload-status').textContent=error.message||'文件没有成功保存。';
 }finally{U.uploading=false;content.querySelector('[data-upload-zone]')?.removeAttribute('aria-busy');}
}
function manualSource(){
 dialog('<h2>手动输入生活资料</h2><form data-form="source"><div class="fields"><label class="full">资料名称<input name="title" maxlength="150" placeholder="资料名称（选填）"></label><label class="full">原文内容<textarea name="text" rows="8" required maxlength="200000" placeholder="粘贴或输入生活资料原文"></textarea></label><label class="full">来源链接或备注<input name="provenance" maxlength="600" placeholder="出处、链接或备注（选填）"></label></div><div class="actions">'+b('取消','close-dialog')+'<button type="submit" class="primary">保存资料</button></div></form>');
}
let previewURL=null,previewToken=0;
function closeFilePreview(){previewToken++;if(previewURL){window.PrototypeFiles?.releaseURL(previewURL);previewURL=null;}}
async function showOriginal(id){
 closeFilePreview();
 const token=previewToken,projectId=activeProjectId,state=S,client=filesForProject();
 const current=()=>token===previewToken&&projectId===activeProjectId&&state===S;
 try{
  const result=await client.createObjectURL(id),file=result.metadata;
  if(!current()){window.PrototypeFiles?.releaseURL(result.url);return;}
  previewURL=result.url;
  let preview='';
  if(result.mode==='image')preview='<img src="'+h(result.url)+'" alt="'+h(file.name)+'">';
  else if(result.mode==='pdf')preview='<iframe src="'+h(result.url)+'" title="'+h(file.name)+'"></iframe>';
  else if(result.mode==='video')preview='<video src="'+h(result.url)+'" controls preload="metadata"></video>';
  else if(result.mode==='audio')preview='<audio src="'+h(result.url)+'" controls preload="metadata"></audio>';
  else if(result.mode==='text'){const text=await client.readText(id);if(!current())return;preview='<pre>'+h(text.text)+'</pre>'+(text.truncated?'<p class="form-note">这里只预览前一部分，下载可查看完整原文。</p>':'');}
  else preview='<p>这个格式请下载后用对应应用打开。</p>';
  dialog('<h2>'+h(file.name)+'</h2><p class="form-note">'+h(file.kind||file.type)+' · '+fileSize(file.size)+'</p><div class="file-preview">'+preview+'</div><div class="actions">'+b('关闭','close-dialog')+'<a class="secondary" href="'+h(result.url)+'" download="'+h(file.name)+'">下载原文件</a></div>');
 }catch(error){if(current()){closeFilePreview();toast(error.message||'暂时无法打开原文件。');}}
}
$('dialog').addEventListener('close',closeFilePreview);
$('dialog').addEventListener('cancel',ev=>{if(U.deletingProject)ev.preventDefault();});

document.addEventListener('click',async ev=>{
 const target=ev.target instanceof Element?ev.target:ev.target?.parentElement;if(!target)return;
 if(U.pendingEvent&&!U.pendingEvent.trigger.closest('.event-return-control')?.contains(target))cancelEventReturn(false);
 if(U.measureDeletePrompt&&!U.measureDeletePrompt.zone.contains(target))closeMeasureDeletePrompt(false);
 const summary=target.closest('details.evidence > summary');
 if(summary){ev.preventDefault();cancelRecordSwitch();toggleEvidence(summary.parentElement);return;}
 const el=target.closest('button');if(!el||el.disabled)return;
 if(U.recordSwitch&&['previous','next','confirm','discard'].includes(el.dataset.action))return;
 if(U.recordSwitch)cancelRecordSwitch();
 if(U.deletingProject){toast('请等待项目删除完成。');return;}
 if(U.uploading&&(el.dataset.stage||el.dataset.hubView||['open-project','back-to-hub'].includes(el.dataset.action))){toast('请等待当前文件保存完成后切换。');return;}
 if(el.dataset.hubView){showHub(el.dataset.hubView);return;}
 if(el.dataset.stage){if(U.view==='export')closeExportPreview(el.dataset.stage,false);else go(el.dataset.stage,true);return;}
 if(el.dataset.action==='back-to-hub'){showHub();return;}
 if(el.dataset.action==='api-settings'){toast('本轮体验未连接真实AI，无需填写API或密钥。');return;}
 if(el.dataset.action==='open-project'){openProject(el.dataset.projectId);return;}
 if(el.dataset.action==='new-project'){newProjectDialog();return;}
 if(el.dataset.action==='delete-project'){deleteProjectDialog(el.dataset.projectId);return;}
 if(el.dataset.action==='confirm-delete-project'){await deleteProject(el.dataset.projectId);return;}
 if(el.dataset.action==='rename-project'){const project=Projects.get(el.dataset.projectId);dialog('<h2>重命名项目</h2><form data-form="rename-project" data-project-id="'+h(project.id)+'"><label>项目名称<input name="name" value="'+h(project.name)+'" required maxlength="150"></label><div class="actions">'+b('取消','close-dialog')+'<button type="submit" class="primary">保存名称</button></div></form>');return;}
 if(el.dataset.action==='archive-project'||el.dataset.action==='restore-project'){try{Projects.archive(el.dataset.projectId,el.dataset.action==='archive-project');renderHub();toast(el.dataset.action==='archive-project'?'项目已归档，可在已归档中恢复。':'项目已恢复。');}catch(error){toast(error.message);}return;}
 if(el.dataset.action==='hub-view'){Hub.view=el.dataset.view;try{Projects.preferences({view:Hub.view});}catch(error){}renderHub();return;}

 const stage=el.closest('.stage-section')?.dataset.flowStage||U.stage;
 const a=el.dataset.action,k=el.dataset.kind,id=el.dataset.id,o=k&&id?obj(k,id):null;
 if(a==='export-preview'){openExportPreview(el);}
 else if(a==='export-back'){closeExportPreview();}
 else if(a==='measure-delete'){requestMeasureDelete(el);}
 else if(a==='measure-delete-confirm'){confirmMeasureDelete(el.dataset.measureId);}
 else if(a==='measure-delete-cancel'){closeMeasureDeletePrompt(true);}
 else if(a==='measure-delete-undo'){undoMeasureDelete();}
 else if(a==='measure-delete-restore'){const revision=S.revisions.find(item=>item.time===el.dataset.revisionTime&&item.id===el.dataset.measureId&&item.action==='删除具体设计措施');if(revision?.before?.candidate){undoMeasureDelete({...copy(revision.before),projectId:activeProjectId});historyView();}}
 else if(a==='measure-add-open'||a==='measure-add-close'){
  const binding=measureBinding(el.dataset.propertyKey);if(!binding){toast('当前产品性质已变化，请先检查。');return;}
  measureUi(binding.property.key).adding=a==='measure-add-open';refreshMeasureProperty(binding.property.key,a==='measure-add-open'?'input':{action:'measure-add-open'});
 }
 else if(a==='measure-page'){
  const binding=measureBinding(el.dataset.propertyKey);if(!binding)return;
  const ui=measureUi(binding.property.key),page=M.page(binding.property.candidates,ui.page+Number(el.dataset.delta),6);
  if(page.page===ui.page)return;ui.page=page.page;refreshMeasureProperty(binding.property.key,{action:'measure-page',delta:el.dataset.delta});
 }
 else if(a==='toggle-stage'){
  const target=el.dataset.target;cancelScroll();const headingToken=U.scrollToken;
  if(U.flow.isOpen(target)){U.flow.toggle(target);updateStageFold(target);}
  else{
   U.flow.activate(target);updateHeading(target,false);
   content.querySelectorAll('.stage-section').forEach(section=>updateStageFold(section.dataset.flowStage,
    section.dataset.flowStage===target?()=>{if(U.flow.isOpen(target)&&U.scrollToken===headingToken)moveToStage(target,false);}:null));
  }
 }
 else if(a==='pin-stage'){U.flow.pin(el.dataset.target);updateStageFold(el.dataset.target);}
 else if(a==='back-reference')returnToOrigin();
 else if(a==='select-linked-event'){const state=U.linkedBrowsers[el.dataset.browser];if(state&&state.selectedId!==id){state.selectedId=id;refreshLinked(el.dataset.browser);}}
 else if(a==='linked-page'){const state=U.linkedBrowsers[el.dataset.browser];if(state){state.page+=Number(el.dataset.step);state.selectedId=null;refreshLinked(el.dataset.browser);}}
 else if(a==='select-appraisal-dimension'){selectAppraisalDimension(id,el.dataset.appraisalKey,stage,el.closest('.appraisal-section'),el);}
 else if(a==='request-event-return'){
  if(U.pendingEvent?.trigger===el){confirmEventReturn(id,stage);return;}
  const target=el.dataset.target||'events',list=['events','causes'].includes(target)?'events':target;
  if(!S[list]?.some(record=>record.id===id))return;
  cancelEventReturn(false);U.pendingEvent={id,target,trigger:el,origin:stage};
  const reveal=document.getElementById(el.getAttribute('aria-controls'));
  el.classList.remove('is-immediate','is-retracting');
  el.classList.add('is-expanded');el.setAttribute('aria-expanded','true');
  el.setAttribute('aria-label',el.dataset.returnTitle+'，'+el.dataset.returnLabel);
  reveal?.setAttribute('aria-hidden','false');
 }else if(a==='cancel-event-return')cancelEventReturn();
 else if(a==='confirm-event-return')confirmEventReturn(id,stage);
 else if(a==='cite-event-field'){
  const d=el.dataset.appraisalKey,field=el.dataset.eventField,form=el.closest('form');
  if(!o||!form||!A.dimensions.some(item=>item.key===d)||!appraisalEventFields.some(([key])=>key===field))return;
  const text=String(o[field]||'').trim();if(!text){toast('该情感事件字段目前没有内容。');return;}
  const label=appraisalEventFields.find(([key])=>key===field)[1],input=form.elements.namedItem('appraisals.'+d+'.evidence'),quote=o.id+' · '+label+'：'+text;
  if(input){const added=!input.value.includes(quote);if(added){input.value=(input.value?input.value+'\n':'')+quote;input.dispatchEvent(new Event('input',{bubbles:true}));}input.focus({preventScroll:true});toast(added?'已引用情感事件内容，请检查它是否支持这项评价。':'该事件内容已在依据中，不重复添加。');}
 }else if(a==='new-event')newEventDialog();
 else if(a==='toggle-mode'){S.workflow.mode=S.workflow.mode==='demo'?'guided':'demo';const target=allowed(U.stage)?U.stage:order[S.workflow.unlocked];save();go(target,true);toast(S.workflow.mode==='demo'?'演示浏览：可自由查看全部页面，审核状态保持不变。':'已返回流程体验，未开放的阶段需要逐步完成。');}
 else if(a==='advance')advance(el.dataset.from);
 else if(a==='upload-files'){toast('本轮体验未开放文件上传，请手动输入文字。');}
 else if(a==='manual-source')manualSource();
 else if(a==='open-original')await showOriginal(el.dataset.fileId);
 else if(a==='delete-event')dialog('<h2>永久删除这个事件？</h2><p>将删除事件记录及其原因、编辑草稿和历史修订，关联结果需要重新检查。</p><p>删除后无法恢复。原始资料文件仍保留。</p><div class="actions">'+b('取消','close-dialog')+b('永久删除','confirm-delete-event','data-id="'+id+'" data-origin-stage="'+stage+'"','primary')+'</div>');
 else if(a==='confirm-delete-event')removeEvent(id,el.dataset.originStage);
 else if(a==='stage'){if(order.indexOf(el.dataset.target)>order.indexOf(stage))advance(stage);else go(el.dataset.target,true);}
 else if(a==='jump')jumpToRecord(el.dataset.target,id,el);

 else if(a==='previous'||a==='next'){const key=indexKey(k,stage),previous=S[key],records=k==='patterns'?patternGroups().map(g=>g.primary):S[k],position=k==='patterns'?patternNavigationIndex():previous,nextPosition=Math.max(0,Math.min(records.length-1,position+(a==='next'?1:-1))),next=S[k].findIndex(item=>item.id===records[nextPosition]?.id);switchRecord(k,stage,next,a==='next'?'next':'prev',el);}
 else if(a==='edit')enterEditor(k,id,el.dataset.mode||'',stage);
 else if(a==='cancel-edit'){const origin=U.editing?.stage||stage;U.editing=null;go(origin,true,'auto','none');toast('已返回阅读，草稿仍保留。');}
 else if(a==='discard-draft'){const origin=U.editing?.stage||stage;delete S.drafts[el.dataset.key];U.editing=null;save();go(origin,true,'auto','none');toast('草稿已放弃，已保存内容未变。');}
 else if(['confirm','discard'].includes(a)&&o)review(k,o,a,el.dataset.mode,stage,el);
 else if(a==='retain'){const records=k==='patterns'?patternGroup(o).records:[o],before=copy(records);for(const record of records){delete S.flags[record.id];record.status='pending';touch(k,record.id,'status');}invalidate(stage);log(k,id,'保留内容，重新检查',before,records,'保留当前人工内容，重新检查后再确认。');save();go(stage,true);toast('当前内容已保留，转为待检查。');}
 else if(a==='reload')dialog('<h2>重载初始示例候选？</h2><p>将替换 '+h(id)+' 内容，并提醒关联结果复查。当前版本保留在修订记录。</p><p class="form-note">只读取内置示例，不调用真实 AI。</p><div class="actions">'+b('取消','close-dialog')+b('重载示例','confirm-reload','data-kind="'+k+'" data-id="'+id+'" data-origin-stage="'+stage+'"','primary')+'</div>');
 else if(a==='confirm-reload'){const before=copy(o),original=D[k].find(x=>x.id===id);if(!original){toast('当前记录没有内置示例可重载。');return;}Object.assign(o,copy(original),{status:'pending'});if(k==='events'){o.appraisals=A.seed(o,S.sources);for(const d of A.dimensions)for(const key of ['status','judgment','evidence','note'])touch(k,id,'appraisals.'+d.key+'.'+key);}for(const key of Object.keys(original))touch(k,id,key);touch(k,id,'status');delete S.flags[id];if(k==='patterns'){const deleted=new Set(S.deletedEventIds);for(const key of ['eventIds','counterEventIds','boundaryEventIds'])o[key]=(o[key]||[]).filter(eventId=>!deleted.has(eventId));}downstream(k,id,id+' 重载了初始示例候选');invalidate(el.dataset.originStage);log(k,id,'重载初始示例',before,o,'不是真实 AI 生成。');save();$('dialog').close();go(el.dataset.originStage,true);toast('初始示例已重载，等待检查。');}
 else if(a==='history')historyView();
 else if(a==='close-dialog')$('dialog').close();
 else if(a==='help')dialog('<h2>设计师体验说明</h2><p>本轮体验用于了解研究流程与界面是否有助于设计判断。内置资料、原因与措施都是虚构候选，系统尚未调用真实AI。</p><ol class="summary-list"><li>打开演示文稿，从任务界定了解背景；六阶段可以自由查看。</li><li>阅读一个情感事件及原因解释，尝试切换记录、修改判断与回查来源。</li><li>检查评价模式与设计转译，选择或添加具体措施，再打开策略方案预览。</li><li>请记录不理解、操作受阻或需要补充信息的位置，体验后将意见交给邀请你的研究者。</li></ol><p class="notice">演示文稿的修改仅本次有效，刷新或重新进入会恢复默认。自建项目仅保存在当前浏览器，清除网站数据会丢失；不跨设备同步，也不会自动传给研究者。</p><p>本轮文件上传与原文件查看暂未开放，可手动输入文字。建议使用电脑体验。</p><div class="actions">'+b('关闭','close-dialog')+'</div>');
 else if(a==='reset-prompt')dialog('<h2>重置演示项目？</h2><p>会恢复内置演示任务，清除本浏览器的编辑、草稿、开放进度和策略选择。已添加的生活资料与原文件保留；已永久删除的事件不会恢复。</p><div class="actions">'+b('取消','close-dialog')+b('确认重置','reset-confirm','','primary')+'</div>');
 else if(a==='reset-confirm'){resetDemo();U.editing=null;U.pendingEvent=null;U.open.clear();U.flow?.reset({activeStage:'task'});U.linkedBrowsers={};U.linkSets={};U.measureBrowsers={};save();$('dialog').close();go('task',true);toast('演示已重置，当前只开放任务界定。');}
});


document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&U.pendingEvent){ev.preventDefault();cancelEventReturn();}if(ev.key==='Escape'&&U.measureDeletePrompt){ev.preventDefault();closeMeasureDeletePrompt(true);}});
document.addEventListener('change',ev=>{
 const el=ev.target;
 if(el.id==='material-files'){uploadFiles([...el.files]);return;}
 const editForm=el.closest('form[data-form="edit"]');
 if(editForm&&editForm.dataset.kind==='directions'&&el.matches('select[name]')){const key=editForm.dataset.draftKey,draft=S.drafts[key]||{values:{},reason:''};touch('directions',editForm.dataset.id,el.name);draft.values[el.name]=el.value;S.drafts[key]=draft;save();}
 if(el.dataset.selectKind){const k=el.dataset.selectKind,stage=el.dataset.selectStage,key=indexKey(k,stage),next=Number(el.value),previous=S[key];el.value=String(previous);switchRecord(k,stage,next,next<previous?'prev':'next',el);}
 if(el.dataset.measureChoice){
  const candidate=S.designMeasures.find(item=>item.id===el.dataset.measureChoice),d=candidate&&obj('directions',candidate.directionId),before=copy(S.measureSelections);
  if(!d){el.checked=false;toast('设计方向目前不存在，请检查对应关系。');return;}
  try{S.measureSelections=M.setSelection(S,candidate.id,el.checked,d,translationModel(d)).measureSelections;}
  catch(error){el.checked=!el.checked;toast(error.message);return;}
  if(JSON.stringify(before)===JSON.stringify(S.measureSelections))return;
  touch('selection','','measureSelections');invalidate('strategies');log('selection',candidate.id,el.checked?'选择具体措施':'取消具体措施',before,S.measureSelections);save();
  const label=el.closest('.measure-option');label.classList.toggle('selected',el.checked);refreshMeasureCounts(d);window.PrototypeMotion?.selection(label);
  toast('已'+(el.checked?'记录到':'从')+'“'+A.dimensions.find(dim=>dim.key===candidate.dimensionKey).label+'”'+(el.checked?'。':'移出。'));
 }
 if(el.dataset.measureStale){
  const before=copy(S.measureSelections);S.measureSelections=M.removeSelection(S,el.dataset.measureStale).measureSelections;
  if(JSON.stringify(before)===JSON.stringify(S.measureSelections))return;
  touch('selection','','measureSelections');invalidate('strategies');log('selection','MEASURES','移出旧措施选择',before,S.measureSelections);save();
  const holder=el.closest('.measure-stale');el.closest('.measure-stale-option').remove();const count=holder.querySelectorAll('.measure-stale-option').length;
  if(count)holder.querySelector('summary').textContent='需检查的旧选择 · '+count+' 项';else holder.remove();toast('旧措施已移出当前选择，修改历史保留。');
 }
});
const placeholderMemory=new WeakMap();
document.addEventListener('focusin',ev=>{
 if(U.measureDeletePrompt&&!U.measureDeletePrompt.zone.contains(ev.target))closeMeasureDeletePrompt(false);
 const el=ev.target;if(!el.matches?.('input[placeholder],textarea[placeholder]'))return;
 if(!placeholderMemory.has(el))placeholderMemory.set(el,el.placeholder);
 if(!el.value)el.placeholder='';
});
document.addEventListener('focusout',ev=>{
 const el=ev.target;if(placeholderMemory.has(el))el.placeholder=placeholderMemory.get(el);
});
content.addEventListener('dragover',ev=>{const zone=ev.target.closest?.('[data-upload-zone]');if(zone){ev.preventDefault();zone.classList.add('is-dragover');}});
content.addEventListener('dragleave',ev=>{const zone=ev.target.closest?.('[data-upload-zone]');if(zone&&!zone.contains(ev.relatedTarget))zone.classList.remove('is-dragover');});
content.addEventListener('drop',ev=>{const zone=ev.target.closest?.('[data-upload-zone]');if(zone){ev.preventDefault();zone.classList.remove('is-dragover');uploadFiles([...ev.dataTransfer.files]);}});
document.addEventListener('input',ev=>{
 if(ev.target.dataset.linkedSearch){const key=ev.target.dataset.linkedSearch,state=U.linkedBrowsers[key];if(state){state.query=ev.target.value;state.page=0;state.selectedId=null;refreshLinked(key,true);}return;}
 const form=ev.target.closest('form');if(!form)return;
 if(ev.target.matches('[data-hub-search]'))return;
 if(form.dataset.form==='measure-add'){
  const binding=measureBinding(form.dataset.propertyKey);if(!binding)return;
  S.measureDrafts[binding.property.key]={directionId:binding.d.id,dimensionKey:binding.dimension.key,propertyText:binding.property.text,text:ev.target.value};
  touch('selection','','measureDrafts');save();form.querySelector('[data-measure-draft-count]').textContent=Array.from(ev.target.value).length+' / 1000 字';
 }
 else if(form.dataset.form==='project'){
  touch('project','',ev.target.name);
  S.taskTouched[ev.target.name]=true;S.projectDrafts[ev.target.name]=ev.target.value;ev.target.required=requiredTaskFields.has(ev.target.name);S.taskConfirmed=false;invalidate('task');save();
  const note=form.querySelector('.task-draft-notice');if(note)note.textContent=activeRecord?.kind==='demo'?'演示草稿仅在本次预览有效，尚未提交。':'任务草稿已保存，尚未提交。';
 }else if(form.dataset.form==='edit'){
 const key=form.dataset.draftKey,draft=S.drafts[key]||{values:{},reason:''};
 if(ev.target.name==='_reason')draft.reason=ev.target.value;
 else{touch(form.dataset.kind,form.dataset.id,ev.target.name);draft.values[ev.target.name]=ev.target.value;}
 S.drafts[key]=draft;save();
}
 else if(form.dataset.form==='selection'){touch('selection','',ev.target.name);S.selectionReason=form.elements.selectionReason.value;S.compatibility=form.elements.compatibility.value;invalidate('strategies');save();}
});

document.addEventListener('toggle',ev=>{const el=ev.target;if(el.isConnected&&el.matches&&el.matches('details[data-open-key]')){const motion=evidenceMotion.get(el),opening=motion?motion.opening:el.open;if(opening)U.open.add(el.dataset.openKey);else U.open.delete(el.dataset.openKey);}},true);

document.addEventListener('submit',ev=>{
 const f=ev.target;if(!f.dataset.form)return;ev.preventDefault();const v=Object.fromEntries(new FormData(f));
 const stage=f.closest('.stage-section')?.dataset.flowStage||U.stage;
 if(f.dataset.form==='measure-add'){
  const binding=measureBinding(f.dataset.propertyKey);if(!binding){toast('当前产品性质已变化，请先检查。');return;}
  try{
   const result=M.addCandidate(S,binding.d,translationModel(binding.d),binding.dimension.key,binding.property.text,v.measureText);
   S.designMeasures=result.state.designMeasures;delete S.measureDrafts[binding.property.key];touch('selection','','designMeasures');touch('selection','','measureDrafts');
   invalidate('strategies');log('designMeasures',result.candidate.id,'添加具体设计措施',{},result.candidate);save();
   const ui=measureUi(binding.property.key),current=measureBinding(binding.property.key);ui.page=M.page(current.property.candidates,Number.MAX_SAFE_INTEGER,6).page;ui.adding=false;
   refreshMeasureProperty(binding.property.key,{measureId:result.candidate.id});refreshMeasureCounts(binding.d);toast('新措施已添加，可自行勾选。');
  }catch(error){toast(error.message);f.querySelector('textarea')?.focus({preventScroll:true});}
 }
 else if(f.dataset.form==='create-project'){
 try{
  const base=v.template==='sample'?defaults():blankDefaults();
  const project=Projects.create(v.name,base,v.template);
  $('dialog').close();openProject(project.id,'task');
 }catch(error){toast(error.message);}
}
 else if(f.dataset.form==='rename-project'){try{Projects.rename(f.dataset.projectId,v.name);$('dialog').close();renderHub();}catch(error){toast(error.message);}}
 else if(f.dataset.form==='new-event'){
 const id='E-'+String(Math.max(0,...[...S.events.map(e=>e.id),...S.deletedEventIds].map(id=>Number(id.slice(2))||0))+1).padStart(2,'0'),source=obj('sources',v.sourceId);
 if(!source){toast('请选择现有原始资料。');return;}
 const e={id,displayTitle:v.displayTitle.trim(),emotionCategory:(v.emotionCategory||'').trim(),evidenceType:v.evidenceType||'direct',causeTitle:'',evaluationObject:'',userConcern:'',title:v.title.trim(),context:v.context.trim(),trigger:v.trigger.trim(),response:v.response.trim(),emotionEvidence:v.emotionEvidence.trim(),sourceId:source.id,paragraphId:source.paragraphs?.[0]?.id||'',status:'pending',eventStatus:'pending',reason:'',appraisals:A.normalize({}),relation:'support',evidence:'direct'};
 S.events.push(e);ensureEmotionGroups(S);downstream('events',id,id+' 的事件已添加');for(const key of Object.keys(e))touch('events',id,key);S.eventIndex=S.events.length-1;log('events',id,'添加事件',{},e);save();$('dialog').close();go('events',true,'smooth','next');toast('事件已添加，尚未确认。');
}
 else if(f.dataset.form==='project')commitProject(true);
 else if(f.dataset.form==='source'){
  if(!v.text.trim()){toast('请填写资料原文。');return;}
  const id='S-'+String(Math.max(0,...S.sources.map(s=>Number(s.id.slice(2))||0))+1).padStart(2,'0'),source={id,title:v.title.trim()||'手动资料 '+id,type:'手动文本',provenance:v.provenance.trim()||'用户手动输入',paragraphs:v.text.trim().split(/\n\s*\n/).filter(Boolean).map((text,i)=>({id:String(i+1).padStart(2,'0'),text}))};
  S.sources.push(source);log('sources',id,'添加资料',{},source);save();$('dialog').close();render({motion:'none'});toast('资料文本已保存。');
 }else if(f.dataset.form==='edit'){
  const k=f.dataset.kind,id=f.dataset.id,o=obj(k,id),reason=(v._reason||'').trim();delete v._reason;Object.keys(v).forEach(k=>v[k]=v[k].trim());
  if(f.dataset.mode==='cause'){
   const priorDraft=S.drafts[f.dataset.draftKey]?.values||{};
   for(const dimension of A.dimensions){const noteKey='appraisals.'+dimension.key+'.note';if(Object.prototype.hasOwnProperty.call(priorDraft,noteKey)&&!Object.prototype.hasOwnProperty.call(v,noteKey))v[noteKey]=String(priorDraft[noteKey]).trim();}
   if(!v.reason){toast('请填写候选原因解释。');return;}
   const candidate=copy(o);for(const [key,value] of Object.entries(v))writePath(candidate,key,value);
   const legacyDimension=A.dimensions.find(d=>A.isSupported(candidate.appraisals[d.key].status)&&legacyAppraisalBasis(candidate.appraisals[d.key].evidence));
   if(legacyDimension){toast('请用当前情感事件补充'+legacyDimension.label+'的事件依据。旧来源引用仍保留在历史中。');return;}
   const check=A.validate(candidate.appraisals);if(!check.valid){
    toast(check.errors[0].message);
    const error=check.errors[0],data=candidate.appraisals[error.key],field=!data.judgment?'judgment':'evidence',input=f.elements.namedItem('appraisals.'+error.key+'.'+field);
    if(input){input.closest('details').open=true;input.focus();}return;
   }
  }else if(k==='directions'){if(!v.title||!v.task||!v.concern){toast('请填写方向名称、对应产品任务与用户关切。');return;}}else if(Object.entries(v).some(([key,value])=>!value&&!optionalRecordFields.has(key))){toast('请补全修改内容。');return;}
  const records=k==='patterns'?patternGroup(o).records:[o],before=copy(k==='patterns'?records:o);
  for(const record of records){for(const [key,value] of Object.entries(v)){writePath(record,key,value);touch(k,record.id,key);}record.status='pending';touch(k,record.id,'status');delete S.flags[record.id];}
  if(k==='events')ensureEmotionGroups(S);
  if(f.dataset.mode==='event'){o.eventStatus='pending';touch(k,id,'eventStatus');S.flags[id]=[id+' 的事件记录已修改，原因需复查'];}
  delete S.drafts[f.dataset.draftKey];const count=records.reduce((sum,record)=>sum+downstream(k,record.id,record.id+' 的'+(f.dataset.mode==='event'?'事件记录':'判断内容')+'已修改'),0);
  invalidate(stage);log(k,id,'修改候选',before,o,reason);U.editing=null;save();go(stage,true,'auto','none');toast('修改已保存，等待检查。'+(count?count+' 项关联结果需复查。':''));
 }else if(f.dataset.form==='selection'){
  if(!S.selection.length){toast('请先选择至少一个策略。');return;}if(!v.selectionReason.trim()||!v.compatibility.trim()){toast('请补全选择理由与冲突处理。');return;}
  S.selectionReason=v.selectionReason.trim();S.compatibility=v.compatibility.trim();log('selection','COMBINATION','保存组合理由',{}, {ids:S.selection,reason:S.selectionReason,compatibility:S.compatibility});save();toast('组合理由已保存，可完成本阶段或继续修改。');
 }
});


async function syncMaterialLibrary(){
 return; // No local materials service is connected in the isolated experience copy.
 if(!window.PrototypeFiles||!activeProjectId||activeRecord?.kind==='demo')return;
 const projectId=activeProjectId,state=S,client=filesForProject();
 try{
  const files=await client.listFiles();if(projectId!==activeProjectId||state!==S)return;
  const existing=new Set(S.sources.map(source=>source.attachmentId).filter(Boolean));
  let count=0;for(const file of files)if(!existing.has(file.id)){S.sources.push(sourceFromFile(file));existing.add(file.id);count++;}
  if(count){save();render({motion:'none'});}
 }catch(error){if(projectId===activeProjectId&&content.querySelector('#upload-status'))$('upload-status').textContent=error.message||'请使用启动原型入口，以保存和打开原文件。';}
}
window.addEventListener('resize',()=>{
 for(const grid of content.querySelectorAll('.appraisal-grid.is-motion-sizing'))window.PrototypeMotion?.dismiss(grid);
});
window.addEventListener('hashchange',route);
// No API configuration or credential handling in this trial.
document.addEventListener('input',ev=>{if(ev.target.matches('[data-hub-search]')){Hub.query=ev.target.value;renderProjectList();}});
document.addEventListener('change',ev=>{if(ev.target.matches('[data-hub-sort]')){Hub.sort=ev.target.value;try{Projects.preferences({sort:Hub.sort});}catch(error){}renderProjectList();}});
route();
})();
