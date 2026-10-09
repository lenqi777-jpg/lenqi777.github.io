/* 策略方案预览：只派生当前已选措施及其来源，不改写项目、不推断新的研究关系。 */
(function(global){
'use strict';
const A=global.PrototypeAppraisals,P=global.PrototypePatterns,T=global.PrototypeTranslations,M=global.PrototypeMeasures;
if(!A||!P||!T||!M)throw new Error('请先加载评价、模式、转译和具体措施定义。');
const dimensions=A.dimensions;
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const text=value=>typeof value==='string'?value:'';
const trimmed=value=>text(value).trim();
const list=value=>Array.isArray(value)?value:[];
const unique=values=>[...new Set(values)];
const selectionFields=['measureId','directionId','dimensionKey','propertyText','measureText','selectionKey'];
const snapshot=value=>Object.fromEntries(selectionFields.map(key=>[key,text(value?.[key])]));
const recordFlags=(state,id)=>list(state.flags?.[id]).filter(value=>typeof value==='string');
const firstById=values=>{const result=new Map();for(const value of values)if(object(value)&&typeof value.id==='string'&&!result.has(value.id))result.set(value.id,value);return result;};
const sourceEligible=event=>!['counter','ambiguous','insufficient'].includes(event?.relation)&&!['meaning','insufficient'].includes(event?.evidenceType);
function groupStatus(group,state){
 if(group.records.some(record=>recordFlags(state,record.id).length))return 'review';
 if(group.records.length&&group.records.every(record=>record.status==='confirmed'))return 'confirmed';
 if(group.records.length&&group.records.every(record=>record.status==='discarded'))return 'discarded';
 return 'pending';
}
function patternGroups(state){
 const groups=new Map();
 for(const pattern of list(state.patterns)){
  if(!object(pattern)||!trimmed(pattern.id))continue;
  const category=trimmed(pattern.emotionCategory),key=category?'emotion:'+category:'record:'+pattern.id;
  if(!groups.has(key))groups.set(key,{key,category,primary:pattern,records:[]});
  groups.get(key).records.push(pattern);
 }
 return [...groups.values()];
}
function build(input){
 const state=object(input)?input:{},projectSource=object(state.project)?state.project:{};
 const project=Object.fromEntries(['id','name','targetUsers','product','emotion','notes','status','validation'].map(key=>[key,text(projectSource[key])]));
 const result={project,totals:{measureCount:0,propertyCount:0,dimensionCount:0,directionCount:0,patternCount:0,eventCount:0,unresolvedCount:0,selectionCount:list(state.measureSelections).length},events:[],patterns:[],directions:[],unresolvedSelections:[]};
 const allSelections=list(state.measureSelections),consumed=new Set(),groups=patternGroups(state),groupByRecord=new Map();
 groups.forEach(group=>group.records.forEach(record=>groupByRecord.set(record.id,group)));
 const eventRecords=firstById(list(state.events)),directionRecords=firstById(list(state.directions));
 const patternResults=new Map(),patternViews=new Map(),eventViews=new Map();
 const unresolved=(selection,index,reason)=>{consumed.add(index);result.unresolvedSelections.push({snapshot:snapshot(selection),inputIndex:index,needsReview:true,reason});};
 const aggregation=group=>{
  if(!patternResults.has(group.key))patternResults.set(group.key,P.aggregate(group.primary,list(state.events),{deletedEventIds:list(state.deletedEventIds),reviewFlags:state.flags||{}}));
  return patternResults.get(group.key);
 };
 for(const [id,direction] of directionRecords){
  const selectedIndices=allSelections.map((selection,index)=>object(selection)&&selection.directionId===id?index:-1).filter(index=>index>=0);
  if(!selectedIndices.length)continue;
  const group=groupByRecord.get(direction.patternId);
  if(!group){selectedIndices.forEach(index=>unresolved(allSelections[index],index,'设计方向对应的来源评价模式已不存在，请检查原选择。'));continue;}
  const aggregate=aggregation(group),translation=T.describe(direction,aggregate,projectSource),workspace=M.workspace(direction,translation,state);
  const view={id,title:text(direction.title),patternId:text(direction.patternId),sourcePatternId:text(group.primary.id),groupId:group.key,status:text(direction.status),validation:text(direction.validation),reviewFlags:recordFlags(state,id),assumptions:text(direction.assumptions),limits:text(direction.limits),dimensions:[]};
  for(const dimension of workspace.dimensions){
   const row=translation.rows.find(item=>item.key===dimension.key),stat=aggregate.dimensions.find(item=>item.key===dimension.key);
   const sourceEventIds=list(stat?.eventIds).filter(eventId=>sourceEligible(eventRecords.get(eventId)));
   const dimensionView={key:dimension.key,label:dimension.label,adoption:dimension.adoption,state:dimension.state,capability:text(row?.capability),boundary:text(row?.boundary),sourceEventIds:sourceEventIds.slice(),properties:[]};
   for(const property of dimension.properties){
    const measures=[];
    for(const candidate of property.candidates){
     if(!candidate.selected)continue;
     const matching=selectedIndices.filter(index=>M.validSelection(allSelections[index])&&allSelections[index].measureId===candidate.id&&M.fields.every(key=>trimmed(allSelections[index][key])===trimmed(candidate[key])));
     if(!sourceEventIds.length){matching.forEach(index=>unresolved(allSelections[index],index,'该评价维度已没有可列入方案的有效支持事件，请检查来源。'));continue;}
     matching.forEach(index=>consumed.add(index));
     measures.push({id:text(candidate.id),measureText:text(candidate.measureText),createdBy:text(candidate.createdBy),selectionSnapshots:candidate.selectionSnapshots.map(snapshot)});
    }
    if(measures.length)dimensionView.properties.push({key:property.key,text:property.text,measures});
   }
   if(dimensionView.properties.length)view.dimensions.push(dimensionView);
  }
  for(const index of selectedIndices)if(!consumed.has(index)){
   const selection=allSelections[index],stale=workspace.staleSelections.find(item=>M.selectionKey(item)===M.selectionKey(selection));
   unresolved(selection,index,stale?.reason||'措施、产品性质或当前来源不再匹配，请检查原选择。');
  }
  if(!view.dimensions.length)continue;
  result.directions.push(view);
  if(!patternViews.has(group.key)){
   patternViews.set(group.key,{id:text(group.primary.id),groupId:group.key,title:text(group.primary.patternTitle)||text(group.primary.emotionCategory)||'未命名评价模式',emotionCategory:group.category,recordIds:unique(group.records.map(record=>record.id)),status:groupStatus(group,state),validation:text(group.primary.validation),reviewFlags:unique(group.records.flatMap(record=>recordFlags(state,record.id))),summary:P.describePattern(aggregate),currentEligibleCount:aggregate.eligibleCount,reviewedEventCount:aggregate.reviewedEventCount,candidateEventCount:aggregate.candidateEventCount,selectedDimensionKeys:[],supportingEventIds:[],dimensions:[],directionIds:[]});
  }
  const patternView=patternViews.get(group.key);patternView.directionIds.push(id);
  for(const dimension of view.dimensions){
   patternView.selectedDimensionKeys=unique([...patternView.selectedDimensionKeys,dimension.key]);
   patternView.supportingEventIds=unique([...patternView.supportingEventIds,...dimension.sourceEventIds]);
   for(const eventId of dimension.sourceEventIds){
    if(!eventViews.has(eventId)){
     const event=eventRecords.get(eventId),eventView={...Object.fromEntries(['id','displayTitle','title','context','trigger','response','emotionEvidence','evidenceType','emotionCategory','sourceId','paragraphId','eventStatus','status','validation'].map(key=>[key,text(event[key])])),reviewFlags:recordFlags(state,eventId),groupIds:[],directionIds:[],cause:{title:text(event.causeTitle),reason:text(event.reason),evaluationObject:text(event.evaluationObject),userConcern:text(event.userConcern),status:text(event.status),reviewFlags:recordFlags(state,eventId),appraisals:[]}};
     eventViews.set(eventId,eventView);
    }
    const eventView=eventViews.get(eventId);eventView.groupIds=unique([...eventView.groupIds,group.key]);eventView.directionIds=unique([...eventView.directionIds,id]);
    if(!eventView.cause.appraisals.some(item=>item.key===dimension.key)){
     const entry=A.normalize(eventRecords.get(eventId).appraisals)[dimension.key];
     eventView.cause.appraisals.push({key:dimension.key,label:dimension.label,status:entry.status,judgment:entry.judgment,evidence:entry.evidence,note:entry.note});
    }
   }
  }
 }
 allSelections.forEach((selection,index)=>{
  if(consumed.has(index))return;
  unresolved(selection,index,!M.validSelection(selection)?'措施选择信息不完整，请检查原记录。':!directionRecords.has(selection.directionId)?'原设计方向已不存在，请检查原选择。':'措施选择无法对应当前有效来源，请检查原记录。');
 });
 const order=key=>dimensions.findIndex(dimension=>dimension.key===key);
 result.patterns=[...patternViews.values()].map(view=>{
  view.selectedDimensionKeys.sort((a,b)=>order(a)-order(b));
  const aggregate=patternResults.get(view.groupId);
  view.dimensions=view.selectedDimensionKeys.map(key=>{
   const stat=aggregate.dimensions.find(item=>item.key===key),eventIds=stat.eventIds.filter(eventId=>view.supportingEventIds.includes(eventId)),records=stat.records.filter(record=>eventIds.includes(record.eventId));
   const statusCounts={satisfied:0,partial:0,unsatisfied:0,insufficient:0};records.forEach(record=>statusCounts[record.status]++);
   return {key,label:stat.label,eventIds,count:eventIds.length,denominator:aggregate.eligibleCount,statusCounts};
  });
  return view;
 });
 result.events=[...eventViews.values()].map(view=>{view.cause.appraisals.sort((a,b)=>order(a.key)-order(b.key));return view;});
 result.totals.measureCount=result.directions.reduce((total,direction)=>total+direction.dimensions.reduce((count,dimension)=>count+dimension.properties.reduce((sum,property)=>sum+property.measures.length,0),0),0);
 result.totals.propertyCount=result.directions.reduce((total,direction)=>total+direction.dimensions.reduce((count,dimension)=>count+dimension.properties.length,0),0);
 result.totals.dimensionCount=result.directions.reduce((total,direction)=>total+direction.dimensions.length,0);
 result.totals.directionCount=result.directions.length;result.totals.patternCount=result.patterns.length;result.totals.eventCount=result.events.length;result.totals.unresolvedCount=result.unresolvedSelections.length;
 result.unresolvedSelections.sort((a,b)=>a.inputIndex-b.inputIndex);
 return result;
}
global.PrototypeExport=Object.freeze({build});
})(window);
