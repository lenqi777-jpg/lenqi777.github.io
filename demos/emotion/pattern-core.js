/* 同情绪评价模式：仅统计已保存事件判断，不请求模型、不从情绪词反推维度。 */
(function(global){
'use strict';
const A=global.PrototypeAppraisals;
if(!A)throw new Error('请先加载认知评价定义。');
const dimensions=A.dimensions;
const eventFields=Object.freeze(['displayTitle','causeTitle','evaluationObject','userConcern','emotionCategory']);
const patternFields=Object.freeze(['patternTitle','emotionCategory','checkItems','reviewChecks']);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=v=>typeof v==='string'?v.trim():'';
const clone=v=>JSON.parse(JSON.stringify(v));
const supported=s=>s==='satisfied'||s==='partial'||s==='unsatisfied';
const stateCounts=()=>({satisfied:0,partial:0,unsatisfied:0,insufficient:0});
function shortTitle(value,fallback,max=18){
 const s=text(value).split(/[，,。；;\n]/)[0];
 const chars=Array.from(s);return chars.length?chars.slice(0,max).join('')+(chars.length>max?'…':''):fallback;
}
function normalizeEvent(event){
 const out=clone(object(event)?event:{});
 const defaults={displayTitle:shortTitle(out.title,'未命名事件'),causeTitle:'待补充原因',evaluationObject:text(out.trigger),userConcern:'',emotionCategory:''};
 for(const key of eventFields)if(!own(out,key))out[key]=defaults[key];
 return out;
}
function normalizePattern(pattern){
 const out=clone(object(pattern)?pattern:{});
 const defaults={patternTitle:text(out.emotionCategory)||shortTitle(out.title,'未命名评价模式'),emotionCategory:'',checkItems:'',reviewChecks:{}};
 for(const key of patternFields)if(!own(out,key))out[key]=defaults[key];
 return out;
}
function hasEventBasis(event,entry){
 const evidence=text(entry.evidence);if(!evidence)return false;
 const ids=evidence.match(/\bE[-－]\d+\b/g)||[];
 if(ids.length&&!ids.some(id=>id.replace('－','-')===event.id))return false;
 const hasEventId=ids.some(id=>id.replace('－','-')===event.id);
 const hasField=/(事件介绍|情境背景|诱发对象|用户反应|情感证据|评价对象|用户关切)/.test(evidence);
 if(/\bS[-－]\d+\b/i.test(evidence)&&!hasEventId)return false;
 const facts=evidence.replace(/\b[ES][-－]\d+\b/g,'').replace(/诱发对象\s*\/\s*事件|用户反应与表达|事件介绍|情境背景|诱发对象|用户反应|情感证据|评价对象|用户关切/g,'').replace(/[\s·:：，,。；;\/]/g,'');
 if((hasEventId||hasField)&&Array.from(facts).length>=3)return true;
 const fields=['title','context','trigger','response','emotionEvidence','evaluationObject','userConcern'].map(k=>text(event[k])).filter(Boolean);
 const quotes=Array.from(evidence.matchAll(/[“「"]([^”」"]{3,})[”」"]/g),m=>m[1]);
 return quotes.some(q=>fields.some(f=>f.includes(q)));
}
function recordReviewed(event,options){
 const flags=options.reviewFlags?.[event.id];
 const flagged=Array.isArray(flags)?flags.length>0:!!flags;
 return event.eventStatus==='confirmed'&&event.status==='confirmed'&&!flagged;
}
function aggregate(pattern,events,options={}){
 const p=normalizePattern(pattern),category=text(p.emotionCategory);
 const deleted=new Set((options.deletedEventIds||[]).filter(id=>typeof id==='string'));
 const scoped=Array.isArray(options.eventIds)?new Set(options.eventIds):options.poolMode==='linked'?new Set(p.eventIds||[]):null;
 const unique=new Map(),excluded=[];
 for(const event of Array.isArray(events)?events:[]){
  if(!object(event)||!text(event.id)){excluded.push({id:'',reason:'invalid-record'});continue;}
  if(unique.has(event.id)){excluded.push({id:event.id,reason:'duplicate-id'});continue;}
  unique.set(event.id,event);
 }
 const referenced=[...new Set([...(p.eventIds||[]),...(p.counterEventIds||[]),...(p.boundaryEventIds||[]),...(options.eventIds||[])])];
 const missingEventIds=referenced.filter(id=>!unique.has(id)&&!deleted.has(id));
 if(scoped)for(const id of scoped)if(!unique.has(id)&&!deleted.has(id))excluded.push({id,reason:'missing-record'});
 const eligible=[];
 for(const event of unique.values()){
  let reason='';
  if(deleted.has(event.id))reason='deleted';
  else if(scoped&&!scoped.has(event.id))reason='outside-pool';
  else if(!category)reason='missing-group';
  else if(text(event.emotionCategory)!==category)reason='different-emotion';
  else if(event.status==='discarded'||event.eventStatus==='discarded')reason='discarded';
  else if(['meaning','insufficient'].includes(event.evidenceType)||!text(event.emotionEvidence))reason='emotion-evidence-insufficient';
  else if(options.requireConfirmed&&!recordReviewed(event,options))reason='unreviewed';
  if(reason)excluded.push({id:event.id,reason});
  else eligible.push(event);
 }
 const reviewed=eligible.filter(event=>recordReviewed(event,options));
 const reviewedIds=new Set(reviewed.map(event=>event.id));
 const byDimension=dimensions.map(d=>({
  key:d.key,label:d.label,count:0,denominator:eligible.length,frequency:0,
  reviewedCount:0,reviewedDenominator:reviewed.length,reviewedFrequency:0,
  candidateCount:0,insufficientCount:0,statusCounts:stateCounts(),reviewedStatusCounts:stateCounts(),
  eventIds:[],reviewedEventIds:[],candidateEventIds:[],insufficientEventIds:[],records:[]
 }));
 for(const event of eligible){
  // normalize accepts only the four current states; explicit incomplete text remains insufficient.
  const values=A.normalize(event.appraisals);
  for(const dim of byDimension){
   const entry=values[dim.key],valid=supported(entry.status)&&hasEventBasis(event,entry);
   const status=valid?entry.status:'insufficient',isReviewed=reviewedIds.has(event.id);
   dim.statusCounts[status]++;if(isReviewed)dim.reviewedStatusCounts[status]++;
   dim.records.push({eventId:event.id,status,reviewed:isReviewed,judgment:entry.judgment,evidence:entry.evidence});
   if(!valid){dim.insufficientCount++;dim.insufficientEventIds.push(event.id);continue;}
   dim.count++;dim.eventIds.push(event.id);
   if(isReviewed){dim.reviewedCount++;dim.reviewedEventIds.push(event.id);}
   else{dim.candidateCount++;dim.candidateEventIds.push(event.id);}
  }
 }
 for(const dim of byDimension){
  dim.frequency=dim.denominator?dim.count/dim.denominator:0;
  dim.reviewedFrequency=dim.reviewedDenominator?dim.reviewedCount/dim.reviewedDenominator:0;
 }
 const ranked=byDimension.slice().sort((a,b)=>b.count-a.count||dimensions.findIndex(d=>d.key===a.key)-dimensions.findIndex(d=>d.key===b.key));
 const max=ranked[0]?.count||0,reviewMax=Math.max(0,...byDimension.map(d=>d.reviewedCount));
 return {
  emotionCategory:category,eventIds:eligible.map(e=>e.id),eligibleEvents:eligible.map(clone),
  eligibleCount:eligible.length,reviewedEventIds:reviewed.map(e=>e.id),reviewedEventCount:reviewed.length,
  candidateEventCount:eligible.length-reviewed.length,missingEventIds,excluded,dimensions:byDimension,rankedDimensions:ranked,
  mostFrequentKeys:max?byDimension.filter(d=>d.count===max).map(d=>d.key):[],
  reviewedMostFrequentKeys:reviewMax?byDimension.filter(d=>d.reviewedCount===reviewMax).map(d=>d.key):[],
  denominatorLabel:'当前同情绪事件',interpretation:'次数表示该维度在事件解释中被涉及，不代表因果关系、总体发生率或目标用户已验证。'
 };
}
// Summary phrases describe the recorded comparison state, not emotion intensity or causation.
const relationMeanings=Object.freeze({
 motivation:['实际情况符合用户想实现的目标','实际情况只实现了部分目标','实际情况没有达到用户的目标'],
 pleasantness:['事件本身符合用户的感官喜好','事件本身只部分符合用户的感官喜好','事件本身不符合用户的感官喜好'],
 expectation:['实际结果符合用户原先的预期','实际结果只部分符合用户原先的预期','实际结果违背用户原先的预期'],
 agency:['起因或责任的归属符合用户希望','起因或责任的归属只部分符合用户希望','起因或责任的归属不符合用户希望'],
 norm:['实际情况符合用户采用的标准','实际情况只部分符合用户采用的标准','实际情况没有达到用户采用的标准'],
 coping:['用户知道遇到变化或困难时如何应对','用户有部分应对办法，但仍有困难','用户缺少可行的应对办法'],
 certainty:['用户能够确认重要信息、条件或结果','用户能确认部分信息，但仍有不确定的内容','用户在意的信息或结果仍不确定']
});
function describePattern(result){
 const total=result.eligibleCount,category=text(result.emotionCategory)||'未分组';
 const ranked=result.rankedDimensions.filter(d=>d.count>0),threshold=ranked[Math.min(1,ranked.length-1)]?.count;
 const states=['satisfied','partial','unsatisfied'];
 const relations=threshold?ranked.filter(d=>d.count>=threshold).map(d=>({
  key:d.key,label:d.label,count:d.count,denominator:total,statusCounts:clone(d.statusCounts),eventIds:d.eventIds.slice(),
  text:states.map((key,index)=>d.statusCounts[key]?d.statusCounts[key]+'条事件中，'+relationMeanings[d.key][index]:'').filter(Boolean).join('；')+'。'
 })):[];
 const headline=!total?'当前还没有可总结的“'+category+'”事件。':!relations.length?'当前“'+category+'”事件的七维依据仍不足，暂未形成模式总结。':total===1?'这条“'+category+'”事件的解释涉及以下评价关系。':'当前'+total+'条“'+category+'”事件的解释，较多涉及以下评价关系。';
 const note=!total?'补充同组事件及评价依据后，概要会同步更新。':'依据当前'+total+'条同组事件'+(result.candidateEventCount?'，其中'+result.candidateEventCount+'条待检查':'，事件与原因均已检查')+'。'+(total===1?'这是单条事件的局部归纳。':'具体维度组合因事件而异，作为当前材料中的候选归纳。');
 return {headline,relations,note};
}
global.PrototypePatterns=Object.freeze({eventFields,patternFields,normalizeEvent,normalizePattern,shortTitle,hasEventBasis,aggregate,describePattern});
})(window);
