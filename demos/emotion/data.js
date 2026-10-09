/* 可点击原型演示数据：无真实研究或 AI 输出。 */
window.PROTOTYPE_DATA = {
  "meta": {
    "version": "2.2",
    "notice": "以下任务、生活资料与候选结果均为虚构演示内容，用于检查原型流程，不代表真实访谈、用户研究或 AI 分析结果。",
    "validationNotice": "设计师确认仅表示允许继续设计推演，所有模式、迁移方向及策略均未经过目标用户验证。"
  },
  "project": {
    "id": "PR-01",
    "name": "烹饪中的安心体验",
    "targetUsers": "示例：刚开始独立下厨、希望了解操作是否正确的成年人。",
    "product": "示例：带有数字操作界面的家用空气炸锅。",
    "emotion": "安心",
    "status": "pending",
    "validation": "unvalidated",
    "notes": ""
  },
  "sources": [
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
  ],
  "events": [
    {
      "id": "E-01",
      "title": "交付前能够核对，感到放心",
      "sourceId": "S-01",
      "paragraphId": "02",
      "context": "周五，用户准备把合作完成的文件交给负责人，几个人分别修改了不同部分。用户能够查看修改过程并核对最终结果，还会看一遍最后版本，确认没有把旧文件交出去。记录中用户说：“交出去的时候就放心了。”",
      "trigger": "能够看到修改过程，并核对最终结果。",
      "response": "查看最终版本，确认后完成交付。",
      "emotionEvidence": "“交出去的时候就放心了。”",
      "evidenceType": "direct",
      "relation": "support",
      "emotion": "放心",
      "reason": "过程与最终结果都能核对，可能减少对交付出错的不确定感。",
      "status": "pending",
      "validation": "unvalidated",
      "displayTitle": "协作交付",
      "causeTitle": "交付不确定感",
      "evaluationObject": "交付文件的修改过程与最终版本",
      "userConcern": "希望交付的是最终版本，避免把旧文件交出去。",
      "emotionCategory": "安心"
    },
    {
      "id": "E-02",
      "title": "安排被再次确认，感到踏实",
      "sourceId": "S-02",
      "paragraphId": "01",
      "context": "出发前，用户又查看了一遍确认消息，里面写明集合位置和联络方式。对方确认了时间和地点，也说明安排有变化时如何联系；用户知道临时换地点时该找谁确认，并说“我心里就踏实了”。",
      "trigger": "接送时间、地点以及发生变化后的联络方式被说明。",
      "response": "出发前查看确认消息；出现变化时知道向谁询问。",
      "emotionEvidence": "“我心里就踏实了。”",
      "evidenceType": "direct",
      "relation": "support",
      "emotion": "踏实",
      "reason": "关键安排被确认，变化时的回应方式也明确，可能减少对出行失误的不确定感。",
      "status": "pending",
      "validation": "unvalidated",
      "displayTitle": "接送确认",
      "causeTitle": "出行不确定感",
      "evaluationObject": "接送时间、集合地点及变动后的联络安排",
      "userConcern": "希望按明确的时间、地点出行；安排变化时知道向谁确认。",
      "emotionCategory": "安心"
    },
    {
      "id": "E-03",
      "title": "维修没有进展消息，越等越担心",
      "sourceId": "S-03",
      "paragraphId": "03",
      "context": "用户早上把机器送去维修，对方表示当天可以处理。到了下午，用户仍在等待，对方没有主动告知进展。用户在记录中说不知道处理到哪一步，“越等越担心”。",
      "trigger": "承诺的时间逐渐临近，但处理进度未知。",
      "response": "到了下午仍在等待；记录中说不知道维修处理到哪一步。",
      "emotionEvidence": "“我不知道处理到哪一步了，越等越担心。”",
      "evidenceType": "direct",
      "relation": "counter",
      "emotion": "担心",
      "reason": "等待中缺少可核对的进展，可能放大对延误和维修结果的不确定感。",
      "status": "pending",
      "validation": "unvalidated",
      "displayTitle": "维修等待",
      "causeTitle": "维修不确定感",
      "evaluationObject": "维修进展及当天能否完成的结果",
      "userConcern": "希望机器按承诺当天修好，并知道目前处理到哪一步。",
      "emotionCategory": "担心"
    },
    {
      "id": "E-04",
      "title": "客服解释处理步骤，用户觉得清楚、专业",
      "sourceId": "S-04",
      "paragraphId": "01",
      "context": "客服把处理步骤解释得很清楚，用户在评论中说“我觉得他们做得很专业”，同时表示目前还不知道最后能否处理好。",
      "trigger": "服务人员把处理步骤解释得清楚。",
      "response": "评价服务流程专业，同时保留对最终结果的疑问。",
      "emotionEvidence": "客服把步骤解释得很清楚，我觉得他们做得很专业。",
      "evidenceType": "meaning",
      "relation": "ambiguous",
      "emotion": "尚不能判断",
      "reason": "清楚的步骤可能支持可理解性，但不足以断言使用者已感到安心。",
      "status": "pending",
      "validation": "unvalidated",
      "displayTitle": "服务流程说明",
      "causeTitle": "流程可理解性",
      "evaluationObject": "客服对处理步骤的说明",
      "userConcern": "希望理解处理步骤；对最终能否处理好仍有疑问。",
      "emotionCategory": "意义判断"
    },
    {
      "id": "E-05",
      "title": "一段写着“终于结束了”的记录",
      "sourceId": "S-05",
      "paragraphId": "01",
      "context": "用户在短记录中写下“终于结束了”；资料没有进一步描述所指的事情和发生经过。",
      "trigger": "资料未说明是什么事情结束。",
      "response": "只留下一句结束的表达，没有行为记录。",
      "emotionEvidence": "“终于结束了。”",
      "evidenceType": "insufficient",
      "relation": "insufficient",
      "emotion": "尚不能判断",
      "reason": "背景、触发和反应均不足，暂不形成情感原因解释。",
      "status": "pending",
      "validation": "unvalidated",
      "displayTitle": "结束短记录",
      "causeTitle": "原因待补充",
      "evaluationObject": "",
      "userConcern": "",
      "emotionCategory": "未确定"
    }
  ],
  "patterns": [
    {
      "id": "P-01",
      "title": "关键条件与结果可核对",
      "summary": "在交付与出行示例中，能确认重要条件或结果与放心、踏实表达共同出现；这可能与降低出错的不确定性有关。",
      "eventIds": [
        "E-01",
        "E-02"
      ],
      "counterEventIds": [
        "E-03"
      ],
      "boundaryEventIds": [
        "E-04",
        "E-05"
      ],
      "scope": "适用于使用者在意结果正确、安排可靠，而且核对信息仍能影响判断的任务。当前仅有两个虚构支持事件。",
      "uncertainty": "共同出现不证明因果；信任、经验及任务重要性可能影响感受。“专业”评价与背景不足的短句不计作支持。",
      "contentType": "候选评价模式",
      "status": "pending",
      "validation": "unvalidated",
      "patternTitle": "安心感",
      "emotionCategory": "安心",
      "checkItems": "同组事件是否有明确的安心、放心或踏实表达？\n高频维度的判断是否都有事件介绍、反应或表达作为依据？\n是否保留未满足、证据不足及待复查的记录？\n是否只将本组结果作为候选规律，并保留后续用户验证？",
      "reviewChecks": {}
    },
    {
      "id": "P-02",
      "title": "变化有约定的回应方式",
      "summary": "出行示例中，对变化后的联络方式有明确约定；维修相反示例中，等待缺少进展消息。回应方式可能影响过程是否可预期。",
      "eventIds": [
        "E-02"
      ],
      "counterEventIds": [
        "E-03"
      ],
      "boundaryEventIds": [
        "E-04"
      ],
      "scope": "面向需要等待或可能出现变化的过程。当前只有一个支持事件，保留为局部假设，不作跨情境确定规律。",
      "uncertainty": "尚不能判断主动提醒与可自行查询哪个更重要，也未说明通知频率、信任基础及不同使用者的差异。",
      "contentType": "局部假设",
      "status": "pending",
      "validation": "unvalidated",
      "patternTitle": "安心感",
      "emotionCategory": "安心",
      "checkItems": "同组事件是否有明确的安心、放心或踏实表达？\n高频维度的判断是否都有事件介绍、反应或表达作为依据？\n是否保留未满足、证据不足及待复查的记录？\n是否只将本组结果作为候选规律，并保留后续用户验证？",
      "reviewChecks": {}
    }
  ],
  "directions": [
    {
      "id": "D-01",
      "title": "让烹饪关键条件和完成结果可核对",
      "patternId": "P-01",
      "task": "设定烹饪参数，并在结束前判断本次任务是否完成。",
      "concern": "所选模式和参数是否符合当前食物，结束时是否还需检查。",
      "proposal": "把本次关键设置、当前阶段及结束后的检查点组织为可查看的信息，支持使用者核对而不是仅被动接受“完成”。",
      "assumptions": "假设烹饪新手的不确定性部分来自缺少核对信息，且能理解这些检查点；这一对应尚未有目标用户证据。",
      "limits": "生活资料来自交付和出行情境；信息核对不能判断食物安全，也不能承诺实际烹饪成功。",
      "status": "pending",
      "validation": "unvalidated",
      "dimensionPlans": {
        "motivation": {
          "adoption": "candidate",
          "properties": "用户能够核对所选模式、参数与本次烹饪目标的对应。\n发现设置不合适时，用户能够在设备允许范围内调整。",
          "capability": "目标产品具有模式和参数设置能力；核对内容须与设备实际采用的设置一致，调整须服从控制与安全限制。",
          "boundary": "不能承诺每种食物都达到用户期望；目标用户是否重视这种核对仍需研究。"
        },
        "coping": {
          "adoption": "limited",
          "properties": "检查后发现仍需处理时，用户能够判断是否继续烹饪，以及可执行的下一步。",
          "capability": "以设备确实支持的暂停、续时和结束操作为条件；针对当前食物的检查说明需要可靠内容依据。",
          "boundary": "判断与操作依据尚需验证；不能代替用户处理设备故障或判断食品安全。"
        },
        "certainty": {
          "adoption": "candidate",
          "properties": "用户能够理解当前烹饪状态及关键阶段的含义。\n用户能够核对本次设置与真实运行状态。\n用户能够区分程序已结束与食物仍需检查，获得判断完成状态的可用依据。",
          "capability": "以设备已有、可读取的设置与控制状态为依据；完成判断只使用能够可靠取得的信息，不能用显示效果模拟真实状态。",
          "boundary": "程序结束和剩余时间不能证明食物已熟或安全；没有相应传感能力时不得给出确定的食物结果。"
        }
      },
      "productBasis": "示例：带有数字操作界面的家用空气炸锅。",
      "translationVersion": 1
    },
    {
      "id": "D-02",
      "title": "过程变化可解释，并有可执行的下一步",
      "patternId": "P-02",
      "task": "等待烹饪，遇到暂停、翻面或异常时理解变化并选择操作。",
      "concern": "过程是否正常，出现变化时自己能做什么，以及何时继续。",
      "proposal": "变化发生时说明当前情况和下一步，把需要注意的过程转成有回应的过程，并保留使用者调整与继续的选择。",
      "assumptions": "假设烹饪等待与出行安排存在可迁移的过程不确定性；及时回应可能支持可预期性，但实际频率与感受尚需检验。",
      "limits": "模式目前是单事件局部假设；过多提醒可能增加负担，异常信息也可能加剧担心。",
      "status": "pending",
      "validation": "unvalidated",
      "dimensionPlans": {
        "motivation": {
          "adoption": "limited",
          "properties": "用户能够在过程变化后核对当前设置是否仍符合本次烹饪目标，并在可控范围内作出调整。",
          "capability": "须具备真实设置读取与允许范围内的调整能力；调整信息应与控制逻辑对应。",
          "boundary": "不能把可调整等同于目标必然实现；此目标任务关切仍是假设。"
        },
        "coping": {
          "adoption": "candidate",
          "properties": "暂停、翻面或可识别异常发生后，用户能够理解自己可以做什么。\n用户能够在设备允许的范围内暂停、调整或继续；超出处理范围时知道求助途径。",
          "capability": "仅回应设备能可靠识别的变化与实际支持的操作；下一步说明须符合设备使用规则。",
          "boundary": "不能保证用户能修复故障，也不应将危险处理交给缺乏经验的使用者。"
        },
        "certainty": {
          "adoption": "limited",
          "properties": "用户能够确认变化后的设备状态，以及何时可以继续。\n用户能够区分已知状态与仍待确认的信息。",
          "capability": "依赖准确的暂停、恢复与异常状态信息；无法识别的情况应明确未知并保留检查或求助路径。",
          "boundary": "不能用虚假进展消除等待；过度提醒可能增加负担，呈现时机需检验。"
        }
      },
      "productBasis": "示例：带有数字操作界面的家用空气炸锅。",
      "translationVersion": 1
    }
  ],
  "strategies": [
    {
      "id": "ST-01",
      "title": "一眼可核对的本次任务卡",
      "directionId": "D-01",
      "mechanism": "通过持续可见的状态信息，支持使用者自己核对关键条件。",
      "measure": "将模式、温度、剩余时间和当前阶段集中展示；设置变化后显示变化内容，机身操作仍保持可用。",
      "response": "让“我设了什么、现在进行到哪一步”有清楚的对应，回应对正确设置和任务进展的关切。",
      "feasibility": "可利用设备已有状态信息；阶段名称需与实际控制逻辑对应，不能只用动画模拟真实进展。",
      "burden": "信息较少且不打断操作；需要检查新手能否理解参数和阶段名称。",
      "limits": "显示状态不等于证明食物已熟；缺少真实设备状态时不能给出确定进展。",
      "status": "pending",
      "validation": "unvalidated"
    },
    {
      "id": "ST-02",
      "title": "结束前的简短检查步骤",
      "directionId": "D-01",
      "mechanism": "通过使用者主动检查，把系统结束提示与实际结果判断区分开。",
      "measure": "结束时按当前食物提供简短检查提示，可选择“再烹饪一会儿”或“结束”；食品安全提示需有可靠依据。",
      "response": "提供结束前核对结果的机会，回应对完成是否符合预期的关切。",
      "feasibility": "需建立适用的食物与检查提示内容，并与续时操作联通；本原型仅演示检查概念。",
      "burden": "增加一次主动判断；步骤过多或提示重复会降低使用意愿。",
      "limits": "视觉提示不能替代必要的安全判断；不同食物的适用检查方法必须另行研究。",
      "status": "pending",
      "validation": "unvalidated"
    },
    {
      "id": "ST-03",
      "title": "只在关键变化时提醒",
      "directionId": "D-02",
      "mechanism": "通过事件触发的说明，及时回应需要注意的过程变化。",
      "measure": "在需要翻面、暂停或发生异常时提示发生了什么、是否需要操作及可选下一步；普通进展不连续推送。",
      "response": "避免使用者在变化中只知道等待，使变化后的处理方式可理解。",
      "feasibility": "依赖设备能够准确识别相关事件，并建立与实际操作一致的提示。",
      "burden": "提醒可关闭，频率克制；仍需验证哪些事件值得打断。",
      "limits": "提醒错误会增加不确定性；解释语气和呈现时机需在真实烹饪任务中检验。",
      "status": "pending",
      "validation": "unvalidated"
    },
    {
      "id": "ST-04",
      "title": "随时暂停，清楚地继续",
      "directionId": "D-02",
      "mechanism": "通过可恢复的主动操作，让使用者在不确定时能够控制下一步。",
      "measure": "提供清楚的暂停、查看当前设置、调整与继续入口；继续前显示将采用的设置，避免误触后直接执行。",
      "response": "允许使用者遇到疑问先停下核对，回应对过程变化和处理选择的关切。",
      "feasibility": "需与设备允许的暂停和恢复范围一致；调整操作必须遵守设备安全限制。",
      "burden": "让谨慎使用者有选择，也可能增加操作次数；需避免把简单任务变成反复确认。",
      "limits": "控制选项不能保证安心，也可能使缺乏经验者更犹豫；需要真实使用任务检验。",
      "status": "pending",
      "validation": "unvalidated"
    }
  ]
};

// 演示措施明确对应当前方向的一条产品性质，旧 strategies 仅保留存档。
window.PROTOTYPE_DATA.designMeasures = [
  {
    "id": "M-01",
    "directionId": "D-01",
    "dimensionKey": "motivation",
    "propertyText": "用户能够核对所选模式、参数与本次烹饪目标的对应。",
    "measureText": "在开始前并列显示本次选择的食物、模式、温度和时长，供用户逐项核对。"
  },
  {
    "id": "M-02",
    "directionId": "D-01",
    "dimensionKey": "motivation",
    "propertyText": "用户能够核对所选模式、参数与本次烹饪目标的对应。",
    "measureText": "在模式选择页列出各模式适用的食物和参数范围，并保留当前选择供对照。"
  },
  {
    "id": "M-03",
    "directionId": "D-01",
    "dimensionKey": "motivation",
    "propertyText": "发现设置不合适时，用户能够在设备允许范围内调整。",
    "measureText": "在开始前的设置摘要旁提供“修改模式”“修改温度”“修改时长”入口。"
  },
  {
    "id": "M-04",
    "directionId": "D-01",
    "dimensionKey": "motivation",
    "propertyText": "发现设置不合适时，用户能够在设备允许范围内调整。",
    "measureText": "在设备允许调整的阶段保留参数修改入口，并明确显示可调范围和生效时机。"
  },
  {
    "id": "M-05",
    "directionId": "D-01",
    "dimensionKey": "coping",
    "propertyText": "检查后发现仍需处理时，用户能够判断是否继续烹饪，以及可执行的下一步。",
    "measureText": "在程序结束页提供食物检查要点，并列出“继续烹饪”和“结束本次”的可执行入口。"
  },
  {
    "id": "M-06",
    "directionId": "D-01",
    "dimensionKey": "coping",
    "propertyText": "检查后发现仍需处理时，用户能够判断是否继续烹饪，以及可执行的下一步。",
    "measureText": "在选择继续烹饪后显示新增时长及将采用的设置，由用户核对后启动续时。"
  },
  {
    "id": "M-07",
    "directionId": "D-01",
    "dimensionKey": "certainty",
    "propertyText": "用户能够理解当前烹饪状态及关键阶段的含义。",
    "measureText": "在运行页用文字标出当前阶段，并在阶段名称旁解释此时设备正在做什么。"
  },
  {
    "id": "M-08",
    "directionId": "D-01",
    "dimensionKey": "certainty",
    "propertyText": "用户能够理解当前烹饪状态及关键阶段的含义。",
    "measureText": "按顺序列出关键阶段，突出当前阶段，并区分已经完成和尚未开始的阶段。"
  },
  {
    "id": "M-09",
    "directionId": "D-01",
    "dimensionKey": "certainty",
    "propertyText": "用户能够核对本次设置与真实运行状态。",
    "measureText": "在运行页并列显示已设参数与设备可读取的实际状态，并标明数据更新时间。"
  },
  {
    "id": "M-10",
    "directionId": "D-01",
    "dimensionKey": "certainty",
    "propertyText": "用户能够核对本次设置与真实运行状态。",
    "measureText": "提供“查看本次设置”入口，展开后保留实时运行状态，便于在同一页面对照。"
  },
  {
    "id": "M-11",
    "directionId": "D-01",
    "dimensionKey": "certainty",
    "propertyText": "用户能够区分程序已结束与食物仍需检查，获得判断完成状态的可用依据。",
    "measureText": "把结束提示写为“程序已结束，请检查食物”，并在同一区域列出下一步检查事项。"
  },
  {
    "id": "M-12",
    "directionId": "D-01",
    "dimensionKey": "certainty",
    "propertyText": "用户能够区分程序已结束与食物仍需检查，获得判断完成状态的可用依据。",
    "measureText": "在结束页分别列出设备已经完成的程序步骤和仍需由用户检查的食物结果。"
  },
  {
    "id": "M-13",
    "directionId": "D-02",
    "dimensionKey": "motivation",
    "propertyText": "用户能够在过程变化后核对当前设置是否仍符合本次烹饪目标，并在可控范围内作出调整。",
    "measureText": "在暂停或恢复页并列显示原设置与当前设置，旁边提供设备允许的修改入口。"
  },
  {
    "id": "M-14",
    "directionId": "D-02",
    "dimensionKey": "motivation",
    "propertyText": "用户能够在过程变化后核对当前设置是否仍符合本次烹饪目标，并在可控范围内作出调整。",
    "measureText": "在调整后、继续前显示本次修改的参数及其生效时机，由用户核对后继续。"
  },
  {
    "id": "M-15",
    "directionId": "D-02",
    "dimensionKey": "coping",
    "propertyText": "暂停、翻面或可识别异常发生后，用户能够理解自己可以做什么。",
    "measureText": "把变化提示组织成“当前情况—下一步操作”，直接列出此状态下可以执行的按钮。"
  },
  {
    "id": "M-16",
    "directionId": "D-02",
    "dimensionKey": "coping",
    "propertyText": "暂停、翻面或可识别异常发生后，用户能够理解自己可以做什么。",
    "measureText": "在设备可识别的异常提示中提供对应处理步骤，超出用户处理范围时直接显示求助入口。"
  },
  {
    "id": "M-17",
    "directionId": "D-02",
    "dimensionKey": "coping",
    "propertyText": "用户能够在设备允许的范围内暂停、调整或继续；超出处理范围时知道求助途径。",
    "measureText": "在运行页保留“暂停”入口，暂停后集中展示设备允许的调整与继续操作。"
  },
  {
    "id": "M-18",
    "directionId": "D-02",
    "dimensionKey": "coping",
    "propertyText": "用户能够在设备允许的范围内暂停、调整或继续；超出处理范围时知道求助途径。",
    "measureText": "在不能继续的状态禁用相关操作并说明原因，同时显示说明书或售后求助入口。"
  },
  {
    "id": "M-19",
    "directionId": "D-02",
    "dimensionKey": "certainty",
    "propertyText": "用户能够确认变化后的设备状态，以及何时可以继续。",
    "measureText": "在暂停、等待操作和可继续之间使用不同的文字状态，并列出恢复运行需要满足的条件。"
  },
  {
    "id": "M-20",
    "directionId": "D-02",
    "dimensionKey": "certainty",
    "propertyText": "用户能够确认变化后的设备状态，以及何时可以继续。",
    "measureText": "在设备确认可以恢复时显示“可以继续”及当前设置，条件未满足时列出还需完成的操作。"
  },
  {
    "id": "M-21",
    "directionId": "D-02",
    "dimensionKey": "certainty",
    "propertyText": "用户能够区分已知状态与仍待确认的信息。",
    "measureText": "在状态页分别标出“设备已确认”和“仍需检查”的信息，无法读取的状态明确显示未知。"
  },
  {
    "id": "M-22",
    "directionId": "D-02",
    "dimensionKey": "certainty",
    "propertyText": "用户能够区分已知状态与仍待确认的信息。",
    "measureText": "对设备尚未确认的变化显示“正在确认”及检查或求助入口，确认后再更新为具体状态。"
  }
];
