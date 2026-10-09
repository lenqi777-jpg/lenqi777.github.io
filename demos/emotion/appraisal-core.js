/* 七维评价记录：不请求模型，不从情绪词反推维度。 */
(function (global) {
'use strict';
const dimensions = Object.freeze([
 {key:'motivation',label:'动机一致性',question:'当前情况与用户已表达的需求或动机相符合吗？',values:['一致','不一致','部分一致']},
 {key:'pleasantness',label:'内在愉悦感',question:'用户是否直接表达了感官层面的愉悦或不愉悦？',values:['愉悦','不愉悦','混合']},
 {key:'expectation',label:'预期确认',question:'已知实际结果是否确认或违背了用户事前的预期？',values:['符合预期','违背预期','部分符合']},
 {key:'agency',label:'代理成分',question:'用户将当前情况的起因或责任归于谁或什么？',values:['自己','他人或产品','环境或客观情况','多方归因']},
 {key:'norm',label:'标准符合性',question:'用户是否依据明确的规范或标准判断当前情况？',values:['符合','违反','超过']},
 {key:'coping',label:'应对能力',question:'用户是否认为自己有办法处理或改变不利情况？',values:['较高','有限','较低']},
 {key:'certainty',label:'确定性成分',question:'用户对事件、条件或结果的发生有多确定？',values:['确定','不确定','部分确定']}
].map(function(d){d.values=Object.freeze(d.values);return Object.freeze(d);}));
const statusLabels=Object.freeze({satisfied:'满足',partial:'部分满足',unsatisfied:'不满足',insufficient:'证据不足'});
const statuses=new Set(Object.keys(statusLabels));
const isSupported=status=>status==='satisfied'||status==='partial'||status==='unsatisfied';
const textFields=['judgment','evidence','note'];
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=v=>typeof v==='string'?v.trim():'';
const blank=()=>Object.fromEntries(dimensions.map(d=>[d.key,{status:'insufficient',judgment:'',evidence:'',note:''}]));
function normalize(raw){
 const result=blank();if(!object(raw))return result;
 dimensions.forEach(d=>{
  const entry=own(raw,d.key)&&object(raw[d.key])?raw[d.key]:{},n=result[d.key];
  n.status=statuses.has(entry.status)?entry.status:'insufficient';
  // Preserve authored text exactly, including intentional whitespace and empty values.
  textFields.forEach(f=>n[f]=typeof entry[f]==='string'?entry[f]:'');
  if(typeof entry.legacyStatus==='string')n.legacyStatus=entry.legacyStatus;
  if(typeof entry.status==='string'&&!statuses.has(entry.status))n.legacyStatus=entry.status;
  // A supported comparison requires both a concrete comparison and its event basis.
  if(isSupported(n.status)&&(!text(n.judgment)||!text(n.evidence)))n.status='insufficient';
 });
 return result;
}
function validate(raw){
 const errors=[],fail=(key,code,message)=>errors.push({key,code,message});
 if(raw==null)return {valid:true,errors};
 if(!object(raw))return {valid:false,errors:[{key:'',code:'invalid-object',message:'评价记录须为七维对象。'}]};
 dimensions.forEach(d=>{
  const k=d.key;if(!own(raw,k))return;const e=raw[k];
  if(!object(e)){fail(k,'invalid-entry',d.label+'的记录格式不正确。');return;}
  if(e.status!=null&&!statuses.has(e.status))fail(k,'invalid-status',d.label+'请选择满足、部分满足、不满足或证据不足。');
  textFields.forEach(f=>{if(e[f]!=null&&typeof e[f]!=='string')fail(k,'invalid-text-'+f,d.label+'的文字字段格式不正确。');});
  if(isSupported(e.status)){
   if(!text(e.judgment))fail(k,'missing-judgment','请补充'+d.label+'的用户希望、实际情况与满足程度。');
   if(!text(e.evidence))fail(k,'missing-evidence','请补充'+d.label+'的情感事件依据与字段位置。');
  }
 });
 return {valid:errors.length===0,errors};
}
// Authored fictional v0.6 records only. Uploaded or edited records never receive these examples.
const references=[
  {
    "event": {
      "id": "E-01",
      "title": "交付前能够核对，感到放心",
      "sourceId": "S-01",
      "paragraphId": "02",
      "context": "周五，用户准备把合作完成的文件交给负责人，几个人分别修改了不同部分。用户能够查看修改过程并核对最终结果，还会看一遍最后版本，确认没有把旧文件交出去。记录中用户说：“交出去的时候就放心了。”",
      "trigger": "能够看到修改过程，并核对最终结果。",
      "response": "查看最终版本，确认后完成交付。",
      "emotionEvidence": "“交出去的时候就放心了。”"
    },
    "source": {
      "id": "S-01",
      "title": "技术协作中的交付检查",
      "type": "演示日记片段",
      "provenance": "为可点击原型编写的虚构片段；无真实参与者、采集时间或外部链接。",
      "paragraphs": [
        {
          "id": "01",
          "text": "周五要把合作完成的文件交给负责人，几个人分别改了不同的部分。"
        },
        {
          "id": "02",
          "text": "能看到修改过程，也能核对最终结果，交出去的时候就放心了。"
        },
        {
          "id": "03",
          "text": "我还是会看一遍最后的版本，确认没有把旧文件交出去。"
        }
      ]
    }
  },
  {
    "event": {
      "id": "E-02",
      "title": "安排被再次确认，感到踏实",
      "sourceId": "S-02",
      "paragraphId": "01",
      "context": "出发前，用户又查看了一遍确认消息，里面写明集合位置和联络方式。对方确认了时间和地点，也说明安排有变化时如何联系；用户知道临时换地点时该找谁确认，并说“我心里就踏实了”。",
      "trigger": "接送时间、地点以及发生变化后的联络方式被说明。",
      "response": "出发前查看确认消息；出现变化时知道向谁询问。",
      "emotionEvidence": "“我心里就踏实了。”"
    },
    "source": {
      "id": "S-02",
      "title": "出行前的接送确认",
      "type": "演示生活记录",
      "provenance": "为可点击原型编写的虚构片段；无真实参与者、采集时间或外部链接。",
      "paragraphs": [
        {
          "id": "01",
          "text": "时间和地点都跟我确认了一遍，也说清楚有变化会怎么联系，我心里就踏实了。"
        },
        {
          "id": "02",
          "text": "出发前我又看了一眼消息，里面写着集合位置和联络方式。"
        },
        {
          "id": "03",
          "text": "如果临时换地方，我知道该找谁确认，不用自己到处问。"
        }
      ]
    }
  },
  {
    "event": {
      "id": "E-03",
      "title": "维修没有进展消息，越等越担心",
      "sourceId": "S-03",
      "paragraphId": "03",
      "context": "用户早上把机器送去维修，对方表示当天可以处理。到了下午，用户仍在等待，对方没有主动告知进展。用户在记录中说不知道处理到哪一步，“越等越担心”。",
      "trigger": "承诺的时间逐渐临近，但处理进度未知。",
      "response": "到了下午仍在等待；记录中说不知道维修处理到哪一步。",
      "emotionEvidence": "“我不知道处理到哪一步了，越等越担心。”"
    },
    "source": {
      "id": "S-03",
      "title": "维修过程中的等待",
      "type": "演示帖子片段",
      "provenance": "为可点击原型编写的虚构片段；无真实参与者、采集时间或外部链接。",
      "paragraphs": [
        {
          "id": "01",
          "text": "早上把机器送去维修，对方说当天可以处理。"
        },
        {
          "id": "02",
          "text": "到下午我一直在等，对方没有主动告诉我进展。"
        },
        {
          "id": "03",
          "text": "说今天能修好，但一直没有消息。我不知道处理到哪一步了，越等越担心。"
        }
      ]
    }
  },
  {
    "event": {
      "id": "E-04",
      "title": "客服解释处理步骤，用户觉得清楚、专业",
      "sourceId": "S-04",
      "paragraphId": "01",
      "context": "客服把处理步骤解释得很清楚，用户在评论中说“我觉得他们做得很专业”，同时表示目前还不知道最后能否处理好。",
      "trigger": "服务人员把处理步骤解释得清楚。",
      "response": "评价服务流程专业，同时保留对最终结果的疑问。",
      "emotionEvidence": "客服把步骤解释得很清楚，我觉得他们做得很专业。"
    },
    "source": {
      "id": "S-04",
      "title": "对服务流程的评价",
      "type": "演示评论片段",
      "provenance": "为可点击原型编写的虚构歧义片段，用于区分意义判断与情绪证据。",
      "paragraphs": [
        {
          "id": "01",
          "text": "客服把步骤解释得很清楚，我觉得他们做得很专业。"
        },
        {
          "id": "02",
          "text": "不过最后能不能处理好，我现在还不知道。"
        }
      ]
    }
  },
  {
    "event": {
      "id": "E-05",
      "title": "一段写着“终于结束了”的记录",
      "sourceId": "S-05",
      "paragraphId": "01",
      "context": "用户在短记录中写下“终于结束了”；资料没有进一步描述所指的事情和发生经过。",
      "trigger": "资料未说明是什么事情结束。",
      "response": "只留下一句结束的表达，没有行为记录。",
      "emotionEvidence": "“终于结束了。”"
    },
    "source": {
      "id": "S-05",
      "title": "没有完整背景的短句",
      "type": "演示短记录",
      "provenance": "为可点击原型编写的虚构资料不足片段，不用于支持确定的情感原因。",
      "paragraphs": [
        {
          "id": "01",
          "text": "终于结束了。"
        }
      ]
    }
  }
];
const eventFields=['id','title','sourceId','paragraphId','context','trigger','response','emotionEvidence'];
function originalDemo(event,sources){
 if(!object(event)||!Array.isArray(sources))return false;
 const ref=references.find(r=>eventFields.every(f=>event[f]===r.event[f]));if(!ref)return false;
 const source=sources.find(s=>s&&s.id===event.sourceId);
 if(!object(source)||source.attachmentId||source.file||source.fileId||source.originalFileId)return false;
 if(!['id','title','type','provenance'].every(f=>source[f]===ref.source[f]))return false;
 if(!Array.isArray(source.paragraphs)||source.paragraphs.length!==ref.source.paragraphs.length)return false;
 return source.paragraphs.every((p,i)=>object(p)&&p.id===ref.source.paragraphs[i].id&&p.text===ref.source.paragraphs[i].text);
}
function eventEvidence(event,fields){
 const labels={context:'事件介绍',trigger:'诱发对象 / 事件',response:'用户反应与表达',emotionEvidence:'情感证据'};
 return fields.map(key=>event.id+' · '+labels[key]+'：'+event[key]).join('\n');
}
function seed(event,sources){
 const result=blank();if(!originalDemo(event,sources))return result;
 const comparison=(key,status,judgment,fields,note)=>result[key]={status,judgment,evidence:eventEvidence(event,fields),note};
 const missing=(key,note,fields=[])=>result[key]={status:'insufficient',judgment:'',evidence:eventEvidence(event,fields),note};
 if(event.id==='E-01'){
  comparison('motivation','satisfied','用户希望交付最终版本，避免把旧文件交出去。实际能够查看修改过程并核对最后版本，确认后完成交付，满足了避免误交旧文件的目标。',['context','response'],
   '事件介绍记载了避免交付旧版本的目标。满足判断仅针对版本核对，不代表内容全部正确；其与放心之间的关系仍是待检查的解释。');
  comparison('certainty','satisfied','用户希望确认所交文件是最后版本。实际能够查看修改过程并核对最后版本，确认没有把旧文件交出去，满足了确认文件版本的需要。',['context','trigger'],
   '比较目标限定为文件版本的确认，不据此证明文件内容全部正确或交付必定成功。满足程度是本项目的匹配标记，不等同于心理学确定性量表。');
  missing('coping','能够核对不等于能够修正错误。事件记录未说明发现问题后的处理办法或有效性。');
 }else if(event.id==='E-02'){
  comparison('certainty','satisfied','用户希望出发前明确接送安排和变化时的联系途径。实际时间、地点和联络方式都已被说明，满足了对这些安排信息明确性的需要。',['context','trigger'],
   '希望明确安排是根据出发前反复查看确认消息形成的候选解释，须由设计师核查；不代表未来变化本身已确定。');
  comparison('coping','satisfied','用户希望安排变化时有明确的询问途径。实际知道临时换地点时该找谁确认，满足了找到询问途径的需要。',['context','response'],
   '用户希望有询问途径是根据事件中的查看和询问行为形成的候选解释。应对范围仅为向指定联系人询问，不能推断能够控制接送变化或保证结果。');
 }else if(event.id==='E-03'){
  comparison('certainty','unsatisfied','用户希望知道维修处理到哪一步。实际到了下午仍在等待，对方没有主动告知进展，用户明确说不知道处理到哪一步，因此没有满足对维修进展明确性的需要。',['context','response'],
   '希望了解进展是根据不知道处理到哪一步的表述和等待行为提出的候选解释，尚需核查。此判断只针对当前进度未知，不等于认定当天处理承诺已被违背。');
  missing('expectation','事件介绍提到当天处理的承诺，但记录停留在下午等待，未给最终结果，不能认定预期已确认或已被违背。',['context']);
 }else if(event.id==='E-04'){
  missing('certainty','事件介绍记载目前还不知道最后能否处理好，但未明确用户希望获得哪种确定性条件，不能仅由结果未知判断其需要不满足。',['context','response']);
  missing('norm','事件记录未指明专业评价所采用的规范或标准，不能自动归为标准符合性。');
 }else if(event.id==='E-05'){
  missing('certainty','事件记录未说明所指事件及判断对象，不能仅凭结束一词推断确定性评价。',['context']);
 }
 return result;
}
// Exact historical authored entries are the only comparisons whose new degree
// can be migrated automatically. A custom candidate has no known satisfaction.
const legacySeeds={"v0.7":{"E-01":{"motivation":{"status":"candidate","judgment":"符合需求 / 动机","evidence":"S-01 段落 03：“我还是会看一遍最后的版本，确认没有把旧文件交出去。”","note":"明确表达了避免交付旧版本的目标；可核对提供实现这一目标的条件。是否因这个目标而放心仍是待检查的解释。"},"pleasantness":{"status":"insufficient","judgment":"","evidence":"","note":""},"expectation":{"status":"insufficient","judgment":"","evidence":"","note":""},"agency":{"status":"insufficient","judgment":"","evidence":"","note":""},"norm":{"status":"insufficient","judgment":"","evidence":"","note":""},"coping":{"status":"insufficient","judgment":"","evidence":"","note":"能够核对不等于能够修正错误。原文没有说明发现问题后的处理办法或有效性。"},"certainty":{"status":"candidate","judgment":"部分条件已确定","evidence":"S-01 段落 02：“能看到修改过程，也能核对最终结果”；段落 03：“确认没有把旧文件交出去。”","note":"评价对象限定为所交文件是否旧版本。可核对可能减少这方面的未知，属于解释候选；不能据此宣称文件全部正确或交付必定成功。"}},"E-02":{"motivation":{"status":"insufficient","judgment":"","evidence":"","note":""},"pleasantness":{"status":"insufficient","judgment":"","evidence":"","note":""},"expectation":{"status":"insufficient","judgment":"","evidence":"","note":""},"agency":{"status":"insufficient","judgment":"","evidence":"","note":""},"norm":{"status":"insufficient","judgment":"","evidence":"","note":""},"coping":{"status":"candidate","judgment":"有可行动的应对办法","evidence":"S-02 段落 03：“如果临时换地方，我知道该找谁确认，不用自己到处问。”","note":"应对范围仅为变化后主动向指定联系人询问。不能据此推断用户能够控制接送变化或保证结果。"},"certainty":{"status":"candidate","judgment":"部分条件已确定","evidence":"S-02 段落 01：“时间和地点都跟我确认了一遍，也说清楚有变化会怎么联系”；段落 02：“里面写着集合位置和联络方式。”","note":"评价对象限定为接送时间、地点和变化后的联系途径；不代表接送必然顺利，也不代表未来变化本身已确定。"}},"E-03":{"motivation":{"status":"insufficient","judgment":"","evidence":"","note":""},"pleasantness":{"status":"insufficient","judgment":"","evidence":"","note":""},"expectation":{"status":"insufficient","judgment":"","evidence":"S-03 段落 01：“对方说当天可以处理”；段落 03：“说今天能修好，但一直没有消息。”","note":"原文提到当天处理的承诺，但记录停留在下午等待，尚无最终结果，不能认定预期已确认或已被违背。"},"agency":{"status":"insufficient","judgment":"","evidence":"","note":""},"norm":{"status":"insufficient","judgment":"","evidence":"","note":""},"coping":{"status":"insufficient","judgment":"","evidence":"","note":""},"certainty":{"status":"candidate","judgment":"结果仍不确定","evidence":"S-03 段落 03：“我不知道处理到哪一步了”；段落 02：“对方没有主动告诉我进展。”","note":"用户明确表达不知道维修进展。维度由这段认知表述提出，不由“担心”一词反推；维修最终结果仍未知。"}},"E-04":{"motivation":{"status":"insufficient","judgment":"","evidence":"","note":""},"pleasantness":{"status":"insufficient","judgment":"","evidence":"","note":""},"expectation":{"status":"insufficient","judgment":"","evidence":"","note":""},"agency":{"status":"insufficient","judgment":"","evidence":"","note":""},"norm":{"status":"insufficient","judgment":"","evidence":"","note":"“专业”未指明用户采用的规范或标准，不能自动归为标准符合性。"},"coping":{"status":"insufficient","judgment":"","evidence":"","note":""},"certainty":{"status":"candidate","judgment":"结果仍不确定","evidence":"S-04 段落 02：“不过最后能不能处理好，我现在还不知道。”","note":"这是对处理结果未知的明确表述；不能由“专业、清楚”断言安心已经发生。"}},"E-05":{"motivation":{"status":"insufficient","judgment":"","evidence":"","note":""},"pleasantness":{"status":"insufficient","judgment":"","evidence":"","note":""},"expectation":{"status":"insufficient","judgment":"","evidence":"","note":""},"agency":{"status":"insufficient","judgment":"","evidence":"","note":""},"norm":{"status":"insufficient","judgment":"","evidence":"","note":""},"coping":{"status":"insufficient","judgment":"","evidence":"","note":""},"certainty":{"status":"insufficient","judgment":"","evidence":"S-05 段落 01：“终于结束了。”","note":"短句未说明所指事件及用户对结果的判断对象，不能仅凭“结束”推断确定性评价。"}}},"v0.8":{"E-01":{"motivation":{"status":"candidate","judgment":"能够核对最终版本，与避免交付旧文件的目标一致。","evidence":"E-01 · 事件介绍：周五，用户准备把合作完成的文件交给负责人，几个人分别修改了不同部分。用户能够查看修改过程并核对最终结果，还会看一遍最后版本，确认没有把旧文件交出去。记录中用户说：“交出去的时候就放心了。”","note":"事件介绍记载了避免交付旧版本的目标；核对提供实现这一目标的条件。其与放心之间的关系仍是待检查的解释。"},"pleasantness":{"status":"insufficient","judgment":"","evidence":"","note":""},"expectation":{"status":"insufficient","judgment":"","evidence":"","note":""},"agency":{"status":"insufficient","judgment":"","evidence":"","note":""},"norm":{"status":"insufficient","judgment":"","evidence":"","note":""},"coping":{"status":"insufficient","judgment":"","evidence":"","note":"能够核对不等于能够修正错误。事件记录未说明发现问题后的处理办法或有效性。"},"certainty":{"status":"candidate","judgment":"所交文件是否旧版本有核对条件，部分确定。","evidence":"E-01 · 事件介绍：周五，用户准备把合作完成的文件交给负责人，几个人分别修改了不同部分。用户能够查看修改过程并核对最终结果，还会看一遍最后版本，确认没有把旧文件交出去。记录中用户说：“交出去的时候就放心了。”\nE-01 · 诱发对象 / 事件：能够看到修改过程，并核对最终结果。","note":"判断对象限定为所交文件是否旧版本。核对可能减少这方面的未知；不能据此宣称文件全部正确或交付必定成功。"}},"E-02":{"motivation":{"status":"insufficient","judgment":"","evidence":"","note":""},"pleasantness":{"status":"insufficient","judgment":"","evidence":"","note":""},"expectation":{"status":"insufficient","judgment":"","evidence":"","note":""},"agency":{"status":"insufficient","judgment":"","evidence":"","note":""},"norm":{"status":"insufficient","judgment":"","evidence":"","note":""},"coping":{"status":"candidate","judgment":"安排变化时知道向谁询问，具有有限的应对途径。","evidence":"E-02 · 事件介绍：出发前，用户又查看了一遍确认消息，里面写明集合位置和联络方式。对方确认了时间和地点，也说明安排有变化时如何联系；用户知道临时换地点时该找谁确认，并说“我心里就踏实了”。\nE-02 · 用户反应与表达：出发前查看确认消息；出现变化时知道向谁询问。","note":"应对范围仅为主动向指定联系人询问。不能据此推断用户能够控制接送变化或保证结果。"},"certainty":{"status":"candidate","judgment":"接送时间、地点及变化后的联系途径已明确，部分确定。","evidence":"E-02 · 事件介绍：出发前，用户又查看了一遍确认消息，里面写明集合位置和联络方式。对方确认了时间和地点，也说明安排有变化时如何联系；用户知道临时换地点时该找谁确认，并说“我心里就踏实了”。\nE-02 · 诱发对象 / 事件：接送时间、地点以及发生变化后的联络方式被说明。","note":"判断对象限定为已说明的安排和联系途径；不代表接送必然顺利，也不代表未来变化本身已确定。"}},"E-03":{"motivation":{"status":"insufficient","judgment":"","evidence":"","note":""},"pleasantness":{"status":"insufficient","judgment":"","evidence":"","note":""},"expectation":{"status":"insufficient","judgment":"","evidence":"E-03 · 事件介绍：用户早上把机器送去维修，对方表示当天可以处理。到了下午，用户仍在等待，对方没有主动告知进展。用户在记录中说不知道处理到哪一步，“越等越担心”。","note":"事件介绍提到当天处理的承诺，但记录停留在下午等待，未给最终结果，不能认定预期已确认或已被违背。"},"agency":{"status":"insufficient","judgment":"","evidence":"","note":""},"norm":{"status":"insufficient","judgment":"","evidence":"","note":""},"coping":{"status":"insufficient","judgment":"","evidence":"","note":""},"certainty":{"status":"candidate","judgment":"维修处理进度未知，最终处理结果仍不确定。","evidence":"E-03 · 用户反应与表达：到了下午仍在等待；记录中说不知道维修处理到哪一步。\nE-03 · 诱发对象 / 事件：承诺的时间逐渐临近，但处理进度未知。","note":"事件记录明确记载用户不知道维修进展。依据来自这一判断表述，不由担心一词反推；维修最终结果未知。"}},"E-04":{"motivation":{"status":"insufficient","judgment":"","evidence":"","note":""},"pleasantness":{"status":"insufficient","judgment":"","evidence":"","note":""},"expectation":{"status":"insufficient","judgment":"","evidence":"","note":""},"agency":{"status":"insufficient","judgment":"","evidence":"","note":""},"norm":{"status":"insufficient","judgment":"","evidence":"","note":"事件记录未指明专业评价所采用的规范或标准，不能自动归为标准符合性。"},"coping":{"status":"insufficient","judgment":"","evidence":"","note":""},"certainty":{"status":"candidate","judgment":"最终处理结果仍不确定。","evidence":"E-04 · 事件介绍：客服把处理步骤解释得很清楚，用户在评论中说“我觉得他们做得很专业”，同时表示目前还不知道最后能否处理好。\nE-04 · 用户反应与表达：评价服务流程专业，同时保留对最终结果的疑问。","note":"事件介绍记载用户目前还不知道最后能否处理好；不能由专业、清楚断言安心已经发生。"}},"E-05":{"motivation":{"status":"insufficient","judgment":"","evidence":"","note":""},"pleasantness":{"status":"insufficient","judgment":"","evidence":"","note":""},"expectation":{"status":"insufficient","judgment":"","evidence":"","note":""},"agency":{"status":"insufficient","judgment":"","evidence":"","note":""},"norm":{"status":"insufficient","judgment":"","evidence":"","note":""},"coping":{"status":"insufficient","judgment":"","evidence":"","note":""},"certainty":{"status":"insufficient","judgment":"","evidence":"E-05 · 事件介绍：用户在短记录中写下“终于结束了”；资料没有进一步描述所指的事情和发生经过。","note":"事件记录未说明所指事件及判断对象，不能仅凭结束一词推断确定性评价。"}}}};
const entryFields=['status','judgment','evidence','note'];
function migrateSatisfaction(event,sources,options={}){
 const raw=object(event)&&object(event.appraisals)?event.appraisals:null;
 const appraisals=raw?normalize(raw):seed(event,sources),migrated=[],previousStates={},protectedStatuses=[];
 if(!raw)return {appraisals,migrated,previousStates,protectedStatuses};
 const touched=object(options.touched)?options.touched:{};
 const drafts=Array.isArray(options.drafts)?options.drafts:Object.values(object(options.drafts)?options.drafts:{});
 const authored=originalDemo(event,sources),defaults=authored?seed(event,sources):null;
 function changed(key){
  const prefix='appraisals.'+key,paths=entryFields.map(f=>prefix+'.'+f);
  if(touched.appraisals||touched[prefix]||paths.some(p=>touched[p])||entryFields.some(f=>touched[key]?.[f]))return true;
  return drafts.some(d=>object(d)&&object(d.values)&&(own(d.values,'appraisals')||own(d.values,prefix)||paths.some(p=>own(d.values,p))));
 }
 dimensions.forEach(d=>{
  const key=d.key,old=object(raw[key])?raw[key]:{};
  const historical=authored&&['v0.7','v0.8'].some(v=>{
   const baseline=legacySeeds[v][event.id]?.[key];
   return baseline&&entryFields.every(f=>old[f]===baseline[f]);
  });
  if(historical&&!changed(key)){
   if(entryFields.some(f=>old[f]!==defaults[key][f])){
    previousStates[key]={...old};appraisals[key]={...defaults[key]};migrated.push(key);
   }
   return;
  }
  // Do not infer satisfied from candidate, non-applicability, emotion, or an
  // outcome word. Keep the authored comparison/basis/note and request review.
  if(typeof old.status==='string'&&!statuses.has(old.status)){
   previousStates[key]={...old};protectedStatuses.push(key);
  }else if(isSupported(old.status)&&appraisals[key].status==='insufficient'){
   previousStates[key]={...old};protectedStatuses.push(key);
  }
 });
 return {appraisals,migrated,previousStates,protectedStatuses};
}
// Compatibility entry point: v0.9 performs a whole-entry, edit-aware upgrade.
function migrateEventEvidence(event,sources,options={}){
 const result=migrateSatisfaction(event,sources,options),previousEvidence={},previousJudgment={};
 for(const key of result.migrated){
  const previous=result.previousStates[key];
  if(previous.evidence!==result.appraisals[key].evidence)previousEvidence[key]=previous.evidence;
  if(previous.judgment!==result.appraisals[key].judgment)previousJudgment[key]=previous.judgment;
 }
 return {...result,previousEvidence,previousJudgment};
}
function forEvent(event,sources){
 // Explicitly empty/incomplete records belong to a user/project and are never repopulated.
 return object(event)&&own(event,'appraisals')?normalize(event.appraisals):seed(event,sources);
}
global.PrototypeAppraisals=Object.freeze({dimensions,statusLabels,isSupported,normalize,validate,seed,forEvent,migrateEventEvidence,migrateSatisfaction});
})(window);
