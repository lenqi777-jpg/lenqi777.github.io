/* 具体设计措施：以方向、评价维度和产品性质原文保存对应，不从旧策略猜测分组。 */
(function(global){
'use strict';
const A=global.PrototypeAppraisals;
if(!A)throw new Error('请先加载认知评价定义。');
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const text=value=>typeof value==='string'?value.trim():'';
const clone=value=>JSON.parse(JSON.stringify(value));
const dimensions=A.dimensions;
const dimensionKeys=new Set(dimensions.map(d=>d.key));
const fields=Object.freeze(['directionId','dimensionKey','propertyText','measureText']);
function migrate(state){
 if(!object(state))return state;
 // Add missing collections only. An intentionally empty collection remains empty,
 // and every legacy strategy, selection, draft and revision remains untouched.
 if(!own(state,'designMeasures'))state.designMeasures=[];
 if(!own(state,'measureSelections'))state.measureSelections=[];
 if(!own(state,'measureDrafts'))state.measureDrafts={};
 if(!own(state,'strategyDirectionIndex'))state.strategyDirectionIndex=0;
 if(!own(state,'measureFormatVersion'))state.measureFormatVersion=1;
 const max=Math.max(0,(Array.isArray(state.directions)?state.directions.length:0)-1);
 for(const key of ['directionIndex','strategyDirectionIndex']){
  const value=Number(state[key]);state[key]=Math.max(0,Math.min(Number.isFinite(value)?Math.trunc(value):0,max));
 }
 return state;
}
function normalize(state){return migrate(clone(object(state)?state:{}));}
function propertyKey(directionId,dimensionKey,propertyText){return JSON.stringify([directionId,dimensionKey,text(propertyText)]);}
function selectionKey(selection){return JSON.stringify([selection?.measureId,...fields.map(key=>text(selection?.[key]))]);}
function validCandidate(value){return object(value)&&text(value.id)&&text(value.directionId)&&dimensionKeys.has(value.dimensionKey)&&text(value.propertyText)&&text(value.measureText);}
function validSelection(value){return object(value)&&text(value.measureId)&&text(value.directionId)&&dimensionKeys.has(value.dimensionKey)&&text(value.propertyText)&&text(value.measureText);}
function sameBinding(candidate,selection){return selection.measureId===candidate.id&&fields.every(key=>text(selection[key])===text(candidate[key]));}
function snapshot(candidate){const result={measureId:candidate.id,...Object.fromEntries(fields.map(key=>[key,candidate[key]]))};result.selectionKey=selectionKey(result);return result;}
function workspace(direction,translationSummary,state){
 const directionId=typeof direction?.id==='string'?direction.id:'';
 const sourceRows=Array.isArray(translationSummary?.rows)?translationSummary.rows:[];
 const allCandidates=Array.isArray(state?.designMeasures)?state.designMeasures:[];
 const allSelections=Array.isArray(state?.measureSelections)?state.measureSelections:[];
 const candidates=allCandidates.filter(item=>object(item)&&item.directionId===directionId);
 const selections=allSelections.filter(item=>object(item)&&item.directionId===directionId);
 const candidateIds=new Map();
 for(const candidate of allCandidates)if(object(candidate)&&typeof candidate.id==='string')candidateIds.set(candidate.id,(candidateIds.get(candidate.id)||0)+1);
 const matchedCandidates=new Set(),matchedSelections=new Set();
 const groups=[],reviewDimensions=[];
 for(const dimension of dimensions){
  const row=sourceRows.find(item=>item?.key===dimension.key);
  if(!row||row.adoption==='excluded')continue;
  const lines=[...new Set((Array.isArray(row.propertyLines)?row.propertyLines:String(row.properties||'').split(/\r?\n/)).map(text).filter(Boolean))];
  if(!lines.length)continue;
  const active=!(translationSummary?.productChanged)&&Number(row.sourceCount)>0&&['candidate','limited'].includes(row.adoption)&&['candidate','limited'].includes(row.state)&&text(row.capability)&&(Array.isArray(translationSummary?.activeRows)?translationSummary.activeRows.some(item=>item?.key===dimension.key):true);
  if(!active){reviewDimensions.push({key:dimension.key,label:dimension.label,state:row.state,adoption:row.adoption,needsReview:true,properties:lines.map(propertyText=>({key:propertyKey(directionId,dimension.key,propertyText),text:propertyText})),reason:row.state==='product_changed'?'目标产品已变化，请先回设计转译检查性质。':!(Number(row.sourceCount)>0)?'当前来源不再支持原产品性质，请先回设计转译检查。':'产品性质尚未形成当前可承接方向，请先回设计转译检查。'});continue;}
  const properties=lines.map(propertyText=>{
   const choices=candidates.filter(candidate=>validCandidate(candidate)&&candidateIds.get(candidate.id)===1&&candidate.dimensionKey===dimension.key&&text(candidate.propertyText)===propertyText).map(candidate=>{
    matchedCandidates.add(candidate);
    const selectedSnapshots=selections.filter(selection=>validSelection(selection)&&sameBinding(candidate,selection));
    selectedSnapshots.forEach(selection=>matchedSelections.add(selection));
    return {...clone(candidate),selected:selectedSnapshots.length>0,needsReview:false,selectionSnapshots:[...new Map(selectedSnapshots.map(selection=>[selectionKey(selection),{...clone(selection),selectionKey:selectionKey(selection)}])).values()]};
   });
   return {key:propertyKey(directionId,dimension.key,propertyText),text:propertyText,candidates:choices,selectedCount:choices.filter(candidate=>candidate.selected).length};
  });
  groups.push({key:dimension.key,label:dimension.label,state:row.state,adoption:row.adoption,needsReview:false,properties,selectedCount:properties.reduce((count,property)=>count+property.selectedCount,0)});
 }
 const staleCandidates=candidates.filter(candidate=>!matchedCandidates.has(candidate)).map(candidate=>({...clone(candidate),needsReview:true,reason:!validCandidate(candidate)?'措施记录信息不完整。':candidateIds.get(candidate.id)!==1?'措施标识重复，需检查原记录。':'原产品性质、来源或承接状态已变化，需检查对应关系。'}));
 const staleSelections=[...new Map(selections.filter(selection=>!matchedSelections.has(selection)).map(selection=>[selectionKey(selection),{...clone(selection),selectionKey:selectionKey(selection),needsReview:true,reason:'原措施或产品性质已变化，已选内容保留，需检查对应关系。'}])).values()];
 return {directionId,dimensions:groups,reviewDimensions,staleCandidates,staleSelections,selectedCount:groups.reduce((count,dimension)=>count+dimension.selectedCount,0),selectionCount:new Set(selections.map(selectionKey)).size};
}
function setSelection(state,measureId,checked,direction,translationSummary){
 const out=normalize(state);
 if(!Array.isArray(out.designMeasures)||!Array.isArray(out.measureSelections))throw new Error('措施记录格式异常，原记录未改写。');
 if(typeof checked!=='boolean')throw new Error('请选择措施的选中状态。');
 const model=workspace(direction,translationSummary,out);
 const candidate=model.dimensions.flatMap(d=>d.properties.flatMap(property=>property.candidates)).find(item=>item.id===measureId);
 if(!candidate)throw new Error('该措施的产品性质或来源已变化，请先检查对应关系。');
 const matches=selection=>validSelection(selection)&&sameBinding(candidate,selection);
 if(checked){
  out.measureSelections=out.measureSelections.filter(selection=>!matches(selection));out.measureSelections.push(snapshot(candidate));
 }else out.measureSelections=out.measureSelections.filter(selection=>!matches(selection));
 return out;
}
function removeSelection(state,key){
 const out=normalize(state);
 if(!Array.isArray(out.measureSelections))throw new Error('措施选择记录格式异常，原记录未改写。');
 if(typeof key!=='string')throw new Error('措施选择标识无效。');
 out.measureSelections=out.measureSelections.filter(selection=>selectionKey(selection)!==key);
 return out;
}
function addCandidate(state,direction,translationSummary,dimensionKey,propertyText,measureText){
 const out=normalize(state);
 if(!Array.isArray(out.designMeasures)||!Array.isArray(out.measureSelections))throw new Error('措施记录格式异常，原记录未改写。');
 const content=text(measureText);
 if(!content)throw new Error('请先填写具体设计措施。');
 if(Array.from(content).length>1000)throw new Error('具体设计措施请控制在1000个字以内。');
 const model=workspace(direction,translationSummary,out),dimension=model.dimensions.find(item=>item.key===dimensionKey);
 const property=dimension?.properties.find(item=>item.text===text(propertyText));
 if(!property)throw new Error('该产品性质或来源已变化，请先回设计转译检查对应关系。');
 if(out.designMeasures.some(item=>object(item)&&item.directionId===direction.id&&item.dimensionKey===dimensionKey&&text(item.propertyText)===property.text&&text(item.measureText)===content))throw new Error('这条产品性质下已存在相同措施。');
 // IDs survive old selections and history so newly authored text never borrows
 // the identity of a historical measure that has since left the current list.
 const usedIds=new Set();
 for(const item of [...out.designMeasures,...out.measureSelections,...(Array.isArray(out.strategies)?out.strategies:[])])if(object(item)){if(text(item.id))usedIds.add(item.id);if(text(item.measureId))usedIds.add(item.measureId);}
 for(const revision of Array.isArray(out.revisions)?out.revisions:[]){
  if(!object(revision))continue;
  if(text(revision.id))usedIds.add(revision.id);
  for(const value of [revision.before,revision.after]){
   const items=Array.isArray(value)?value:object(value)?[value,...(Array.isArray(value.removedSelections)?value.removedSelections:[])]:[];
   for(const item of items)if(object(item)){
    if(text(item.measureId))usedIds.add(item.measureId);
    if(text(item.candidate?.id))usedIds.add(item.candidate.id);
   }
  }
 }
 let counter=1;while(usedIds.has('M-user-'+counter))counter++;
 const candidate={id:'M-user-'+counter,directionId:direction.id,dimensionKey,propertyText:property.text,measureText:content,createdBy:'designer'};
 out.designMeasures.push(candidate);
 return {state:out,candidate:clone(candidate)};
}
function removeCandidate(state,measureId){
 const out=normalize(state);
 if(!Array.isArray(out.designMeasures)||!Array.isArray(out.measureSelections))throw new Error('措施记录格式异常，原记录未改写。');
 const matches=out.designMeasures.map((candidate,index)=>object(candidate)&&candidate.id===measureId?index:-1).filter(index=>index>=0);
 if(matches.length!==1)throw new Error('措施标识已失效或重复，请检查原记录。');
 const position=matches[0],candidate=out.designMeasures[position];
 if(!validCandidate(candidate))throw new Error('具体措施信息不完整，请先检查原记录。');
 const isMatch=selection=>validSelection(selection)&&sameBinding(candidate,selection);
 const removedSelections=out.measureSelections.filter(isMatch).map(clone);
 out.designMeasures.splice(position,1);out.measureSelections=out.measureSelections.filter(selection=>!isMatch(selection));
 return {state:out,candidate:clone(candidate),removedSelections,position};
}
function restoreCandidate(state,deletion){
 const out=normalize(state),candidate=deletion?.candidate;
 if(!Array.isArray(out.designMeasures)||!Array.isArray(out.measureSelections))throw new Error('措施记录格式异常，原记录未改写。');
 if(!validCandidate(candidate))throw new Error('原删除记录不完整，无法恢复措施。');
 if(out.designMeasures.some(item=>object(item)&&item.id===candidate.id))throw new Error('原措施标识已被占用，无法恢复，请检查当前记录。');
 const position=Number.isInteger(deletion.position)?Math.max(0,Math.min(deletion.position,out.designMeasures.length)):out.designMeasures.length;
 out.designMeasures.splice(position,0,clone(candidate));
 const keys=new Set(out.measureSelections.map(selectionKey));
 for(const selection of Array.isArray(deletion.removedSelections)?deletion.removedSelections:[]){
  if(!validSelection(selection)||!sameBinding(candidate,selection))continue;
  const key=selectionKey(selection);if(keys.has(key))continue;out.measureSelections.push(clone(selection));keys.add(key);
 }
 return out;
}
function page(candidates,index,pageSize=6){
 const list=Array.isArray(candidates)?candidates:[],size=Number.isInteger(pageSize)&&pageSize>0?pageSize:6,total=list.length,pages=Math.max(1,Math.ceil(total/size));
 const requested=Number(index),current=Math.max(0,Math.min(Number.isFinite(requested)?Math.trunc(requested):0,pages-1));
 return {items:list.slice(current*size,(current+1)*size),total,page:current,pages};
}
global.PrototypeMeasures=Object.freeze({dimensions,fields,migrate,normalize,propertyKey,selectionKey,validCandidate,validSelection,snapshot,workspace,setSelection,removeSelection,addCandidate,removeCandidate,restoreCandidate,page});
})(window);
