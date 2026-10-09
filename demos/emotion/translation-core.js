/* 产品性质转译：当前评价依据与产品能力分别核对，不从情绪或频次自动生成性质。 */
(function(global){
'use strict';
const A=global.PrototypeAppraisals;
if(!A)throw new Error('请先加载认知评价定义。');
const dimensions=A.dimensions;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=v=>typeof v==='string'?v.trim():'';
const clone=v=>JSON.parse(JSON.stringify(v));
const planKeys=Object.freeze(['adoption','properties','capability','boundary']);
const planFields=Object.freeze(dimensions.flatMap(d=>planKeys.map(key=>'dimensionPlans.'+d.key+'.'+key)));
const adoptionLabels=Object.freeze({candidate:'可承接候选',limited:'有条件承接',excluded:'不由产品承接',pending:'待论证'});
const stateLabels=Object.freeze({...adoptionLabels,source_missing:'来源尚未支持',product_changed:'产品已变化，需复查'});
const defaultPlan=()=>({adoption:'pending',properties:'',capability:'',boundary:''});
function normalizeDirection(direction){
 const out=clone(object(direction)?direction:{});
 if(!own(out,'dimensionPlans'))out.dimensionPlans={};
 if(object(out.dimensionPlans))for(const d of dimensions){
  if(!own(out.dimensionPlans,d.key))out.dimensionPlans[d.key]=defaultPlan();
  else if(object(out.dimensionPlans[d.key]))for(const key of planKeys)if(!own(out.dimensionPlans[d.key],key))out.dimensionPlans[d.key][key]=defaultPlan()[key];
 }
 if(!own(out,'productBasis'))out.productBasis='';
 if(!own(out,'translationVersion'))out.translationVersion=1;
 return out;
}
function describe(direction,aggregate,project){
 const out=normalizeDirection(direction),product=typeof project?.product==='string'?project.product:'',basis=typeof out.productBasis==='string'?out.productBasis:'';
 const productChanged=!text(product)||basis!==product;
 const total=Number.isInteger(aggregate?.eligibleCount)&&aggregate.eligibleCount>0?aggregate.eligibleCount:0;
 const rows=dimensions.map(d=>{
  const stat=(Array.isArray(aggregate?.dimensions)?aggregate.dimensions:[]).find(item=>item?.key===d.key);
  const sourceCount=total&&Number.isInteger(stat?.count)&&stat.count>0?Math.min(total,stat.count):0;
  const plan=object(out.dimensionPlans)&&object(out.dimensionPlans[d.key])?out.dimensionPlans[d.key]:defaultPlan();
  const adoption=own(adoptionLabels,plan.adoption)?plan.adoption:'pending';
  const properties=typeof plan.properties==='string'?plan.properties:'',capability=typeof plan.capability==='string'?plan.capability:'',boundary=typeof plan.boundary==='string'?plan.boundary:'';
  const propertyLines=properties.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  const state=adoption==='excluded'?'excluded':!sourceCount?'source_missing':productChanged&&['candidate','limited'].includes(adoption)?'product_changed':adoption;
  const counts={satisfied:0,partial:0,unsatisfied:0,insufficient:0};
  for(const key of Object.keys(counts))if(Number.isInteger(stat?.statusCounts?.[key])&&stat.statusCounts[key]>=0)counts[key]=stat.statusCounts[key];
  const sourceJudgments=(Array.isArray(stat?.records)?stat.records:[]).filter(record=>A.isSupported(record?.status)&&text(record.judgment)&&text(record.evidence)).map(record=>({eventId:record.eventId,status:record.status,judgment:record.judgment,evidence:record.evidence}));
  return {key:d.key,label:d.label,sourceCount,denominator:total,sourceStatusCounts:counts,sourceJudgments,adoption,state,statusLabel:stateLabels[state],properties,propertyLines,capability,boundary};
 });
 return {productChanged,rows,activeRows:rows.filter(row=>['candidate','limited'].includes(row.state)&&row.propertyLines.length&&text(row.capability)),excludedRows:rows.filter(row=>row.adoption==='excluded')};
}
/* 仅派生阅读布局；来源、承接结论及已记录性质不因分组而改写。 */
function layout(summary){
 const rows=Array.isArray(summary?.rows)?summary.rows:[],wide=[],compact=[];
 const compactWeight=.65,minColumnWidth=240;
 for(const dimension of dimensions){
  const row=rows.find(item=>item?.key===dimension.key);
  if(!row)continue;
  const propertyLines=(Array.isArray(row.propertyLines)?row.propertyLines:[]).map(text).filter(Boolean);
  const hasCurrentProperties=row.adoption!=='excluded'&&Number(row.sourceCount)>0&&propertyLines.length>0;
  const layoutCharacterCount=hasCurrentProperties?propertyLines.reduce((count,line)=>count+Array.from(line).length,0):0;
  const layoutUnits=hasCurrentProperties?propertyLines.length+Math.ceil(layoutCharacterCount/80):0;
  const layoutWeight=hasCurrentProperties?1+Math.min(.6,layoutUnits*.08):compactWeight;
  const derived={...row,propertyLines,layoutWeight,layoutUnits,layoutCharacterCount};
  (hasCurrentProperties?wide:compact).push(derived);
 }
 const columns=wide.map(row=>({kind:'wide',key:row.key,weight:row.layoutWeight,row}));
 if(compact.length)columns.push({kind:'compact',key:'pending',weight:compactWeight,rows:compact});
 return {wide,compact,columns,compactWeight,minColumnWidth};
}
function validate(direction,aggregate,project){
 const errors=[],fail=(key,message)=>errors.push({key,message});
 if(!object(direction))return {valid:false,errors:[{key:'',message:'设计方向须为对象。'}]};
 const summary=describe(direction,aggregate,project),normalized=normalizeDirection(direction);
 if(!object(normalized.dimensionPlans))fail('dimensionPlans','请按七个评价维度填写产品性质。');
 if(summary.productChanged)fail('productBasis','目标产品已变化或尚未明确，请按当前目标产品重新检查并保存转译。');
 for(const row of summary.rows){
  const prefix='dimensionPlans.'+row.key,raw=object(normalized.dimensionPlans)?normalized.dimensionPlans[row.key]:null;
  if(raw!==null&&!object(raw)){fail(prefix,row.label+'的转译记录格式不正确。');continue;}
  if(object(raw)&&!own(adoptionLabels,raw.adoption))fail(prefix+'.adoption',row.label+'请选择当前产品能否承接。');
  if(['candidate','limited'].includes(row.adoption)){
   if(!row.sourceCount)fail(prefix+'.adoption',row.label+'目前没有来源模式的有效评价依据，不能作为可承接方向。');
   if(!row.propertyLines.length)fail(prefix+'.properties',row.label+'请列出产品需要具备的性质。');
   if(!text(row.capability))fail(prefix+'.capability',row.label+'请说明目标产品可实际承接的能力与约束。');
  }
  if(row.adoption==='excluded'&&!text(row.boundary))fail(prefix+'.boundary',row.label+'请说明不由目标产品承接的理由。');
 }
 if(!summary.activeRows.length)fail('dimensionPlans','至少需要一项有当前来源依据、产品性质与实际能力的可承接方向。');
 return {valid:errors.length===0,errors};
}
global.PrototypeTranslations=Object.freeze({dimensions,planKeys,planFields,adoptionLabels,stateLabels,normalizeDirection,describe,assemble:describe,layout,validate});
})(window);
