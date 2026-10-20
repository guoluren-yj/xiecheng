// import intl from 'utils/intl';

export function getResultTab(intl) {
  return [
    {
      id: 18,
      title: intl
        .get('sdat.riskScanReport.view.title.industrialChanges')
        .d('工商变更风险-工商变更'),
      code: 'QUERY_EP_RISK_CHANGE_RECORDS_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskNewScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdType',
          label: intl.get('sdat.riskNewScanReport.view.title.changeType').d('变更类型'),
        },
        {
          fieldName: 'stdChangeDate',
          label: intl.get('sdat.riskNewScanReport.view.title.changeDate').d('变更日期'),
        },
        {
          fieldName: 'stdChangeItem',
          label: intl.get('sdat.riskNewScanReport.view.title.changeItem').d('变更项目'),
        },
        {
          fieldName: 'stdBeforeContent',
          label: intl.get('sdat.riskNewScanReport.view.title.beforeChange').d('变更前内容'),
        },
        {
          fieldName: 'stdAfterContent',
          label: intl.get('sdat.riskNewScanReport.view.title.afterChange').d('变更后内容'),
        },
      ],
    },

    {
      id: 5,
      title: intl.get('sdat.riskScanReport.view.title.openingAnnouncement').d('司法风险-开庭公告'),
      code: 'QUERY_EP_RISK_COURT_NOTICE_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdHearingDate',
          label: intl.get('sdat.riskScanReport.view.title.courtDate').d('开庭日期'),
        },
        {
          fieldName: 'stdCaseNo',
          label: intl.get('sdat.riskScanReport.view.title.caseNo').d('案号'),
        },
        {
          fieldName: 'stdCaseReason',
          label: intl.get('sdat.riskScanReport.view.title.causeAction').d('案由'),
        },
        {
          fieldName: 'stdPlaintiff',
          label: intl.get('sdat.riskScanReport.view.title.plaintiff').d('上诉人，原告'),
        },
        {
          fieldName: 'stdDefendant',
          label: intl.get('sdat.riskScanReport.view.title.defendant').d('被上诉人，被告'),
        },
        {
          fieldName: 'stdPureRole',
          label: intl.get('sdat.riskScanReport.view.title.partyIdentity').d('当事人身份'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.court').d('法院'),
        },
      ],
    },

    // {
    //   id: 3,
    //   title: intl.get('sdat.riskScanReport.view.title.judicialAnnouncement').d('司法风险-法院公告'),
    //   code: 'QUERY_EP_RISK_NOTICE_LIST_V2',
    //   fields: [
    //     {
    //       fieldName: 'serialNo',
    //       label: intl.get('hzero.common.view.serialNumber').d('序号'),
    //     },
    //     {
    //       fieldName: 'riskLevel',
    //       label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
    //     },
    //     {
    //       fieldName: 'stdDate',
    //       label: intl.get('sdat.riskScanReport.view.title.publishDate').d('发布日期'),
    //     },
    //     {
    //       fieldName: 'stdType',
    //       label: intl.get('sdat.riskScanReport.view.title.announcementType').d('公告类型'),
    //     },
    //     {
    //       fieldName: 'stdCourt',
    //       label: intl.get('sdat.riskScanReport.view.title.court').d('法院'),
    //     },
    //     {
    //       fieldName: 'stdContent',
    //       label: intl.get('sdat.riskScanReport.view.title.content').d('内容'),
    //     },

    //     {
    //       fieldName: 'stdPerson',
    //       label: intl.get('sdat.riskScanReport.view.title.party').d('当事人'),
    //     },
    //   ],
    // },

    {
      id: 1,
      title: intl.get('sdat.riskScanReport.view.title.judicialFilingInfo').d('司法风险-立案信息'),
      code: 'QUERY_EP_RISK_CASE_DETAIL_LIST_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdStartDate',
          label: intl.get('sdat.riskScanReport.view.title.caseFilingTime').d('立案时间'),
        },
        {
          fieldName: 'stdCaseNo',
          label: intl.get('sdat.riskScanReport.view.title.caseNo').d('案号'),
        },
        {
          fieldName: 'stdCaseCause',
          label: intl.get('sdat.riskScanReport.view.title.causeAction').d('案由'),
        },
        {
          fieldName: 'stdRolePlaintiff',
          label: intl.get('sdat.riskScanReport.view.title.plaintiff').d('上诉人，原告'),
        },
        {
          fieldName: 'stdRoleDefendant',
          label: intl.get('sdat.riskScanReport.view.title.defendant').d('被上诉人，被告'),
        },
        {
          fieldName: 'stdRoleOther',
          label: intl.get('sdat.riskScanReport.view.title.other').d('其他'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.court').d('法院'),
        },
        {
          fieldName: 'stdCaseStatus',
          label: intl.get('sdat.riskScanReport.view.title.caseStatus').d('案件状态'),
        },
        {
          fieldName: 'stdUrl',
          label: intl.get('sdat.riskScanReport.view.title.sourceLink').d('数据源链接'),
        },
      ],
    },

    // {
    //   id: 2,
    //   title: intl.get('sdat.riskScanReport.view.title.judicialCase').d('司法风险-终本案件'),
    //   code: 'QUERY_EP_RISK_TERMINATION_CASE_V2',
    //   fields: [
    //     {
    //       fieldName: 'serialNo',
    //       label: intl.get('hzero.common.view.serialNumber').d('序号'),
    //     },
    //     {
    //       fieldName: 'riskLevel',
    //       label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
    //     },
    //     {
    //       fieldName: 'stdFilingDate',
    //       label: intl.get('sdat.riskScanReport.view.title.filingDate').d('立案日期'),
    //     },
    //     {
    //       fieldName: 'stdTerminateDate',
    //       label: intl.get('sdat.riskScanReport.view.title.finalDate').d('终本日期'),
    //     },
    //     {
    //       fieldName: 'stdCaseNoTerminal',
    //       label: intl.get('sdat.riskScanReport.view.title.executionNo').d('执行案号'),
    //     },
    //     {
    //       fieldName: 'stdCaseNoOrigin',
    //       label: intl.get('sdat.riskScanReport.view.title.accordingNo').d('执行依据案号'),
    //     },
    //     {
    //       fieldName: 'stdAmount',
    //       label: intl.get('sdat.riskScanReport.view.title.executionTarget').d('执行标的'),
    //     },
    //     {
    //       fieldName: 'stdFailPerformAmount',
    //       label: intl.get('sdat.riskScanReport.view.title.unfulfilledAmount').d('未履行金额'),
    //     },
    //     {
    //       fieldName: 'stdCourt',
    //       label: intl.get('sdat.riskScanReport.view.title.executionCourt').d('执行法院'),
    //     },
    //     {
    //       fieldName: 'stdStatus',
    //       label: intl.get('sdat.riskScanReport.view.title.status').d('状态'),
    //     },
    //   ],
    // },

    {
      id: 4,
      title: intl.get('sdat.riskScanReport.view.title.judicialCompany').d('司法风险-被执行企业'),
      code: 'QUERY_EP_RISK_EXECUTED_PERSON_LIST_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdCaseDate',
          label: intl.get('sdat.riskScanReport.view.title.filingDate').d('立案日期'),
        },
        {
          fieldName: 'stdCaseNumber',
          label: intl.get('sdat.riskScanReport.view.title.documentNumber').d('执行依据文号'),
        },
        {
          fieldName: 'stdAmount',
          label: intl.get('sdat.riskScanReport.view.title.executionAmount').d('执行金额'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.executionCourt').d('执行法院'),
        },
        {
          fieldName: 'stdStatus',
          label: intl.get('sdat.riskScanReport.view.title.executionStatus').d('执行状态'),
        },
      ],
    },

    {
      id: 6,
      title: intl
        .get('sdat.riskScanReport.view.title.enterprisesDishonesty')
        .d('司法风险-失信被执行企业'),
      code: 'QUERY_EP_RISK_EXECUTION_LIST_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdDate',
          label: intl.get('sdat.riskScanReport.view.title.caseFilingTime').d('立案时间'),
        },
        {
          fieldName: 'stdDocNumber',
          label: intl.get('sdat.riskScanReport.view.title.documentNumber').d('执行依据文号'),
        },
        {
          fieldName: 'stdCaseNumber',
          label: intl.get('sdat.riskScanReport.view.title.caseNo').d('案号'),
        },
        {
          fieldName: 'stdExecutionDesc',
          label: intl
            .get('sdat.riskScanReport.view.title.specificSituation')
            .d('失信被执行人行为具体情形'),
        },
        {
          fieldName: 'stdAmount',
          label: intl.get('sdat.riskScanReport.view.title.executionTarget').d('执行标的'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.executionCourt').d('执行法院'),
        },
        {
          fieldName: 'stdExecutionStatus',
          label: intl.get('sdat.riskScanReport.view.title.performance').d('被执行人履行情况'),
        },
      ],
    },

    {
      id: 22,
      title: intl.get('sdat.riskScanReport.view.title.judgmentDocuments').d('司法风险-裁判文书'),
      code: 'QUERY_EP_RISK_JUDGMENT_DOCUMENT_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdDate',
          label: intl.get('sdat.riskScanReport.view.title.judgmentDate').d('判决日期'),
        },
        {
          fieldName: 'stdCaseNo',
          label: intl.get('sdat.riskScanReport.view.title.caseNo').d('案号'),
        },
        {
          fieldName: 'stdCaseCause',
          label: intl.get('sdat.riskScanReport.view.title.causeAction').d('案由'),
        },
        {
          fieldName: 'stdRole',
          label: intl.get('sdat.riskScanReport.view.title.roleStr').d('角色'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.court').d('法院'),
        },
        {
          fieldName: 'stdTitle',
          label: intl.get('sdat.riskScanReport.view.title.title').d('标题'),
        },
        {
          fieldName: 'stdSubAmount',
          label: intl.get('sdat.riskScanReport.view.title.judgmentAmount').d('判决金额'),
        },
        {
          fieldName: 'stdVerdictType',
          label: intl.get('sdat.riskScanReport.view.title.judgmentType').d('判决书类型'),
        },
      ],
    },

    {
      id: 23,
      title: intl.get('sdat.riskScanReport.view.title.highConsumption').d('司法风险-限制高消费'),
      code: 'QUERY_EP_RISK_RESTRICTED_CONSUMER_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdFilingDate',
          label: intl.get('sdat.riskScanReport.view.title.filingDate').d('立案日期'),
        },
        {
          fieldName: 'stdCaseNo',
          label: intl.get('sdat.riskScanReport.view.title.caseNo').d('案号'),
        },
        {
          fieldName: 'stdCaseReason',
          label: intl.get('sdat.riskScanReport.view.title.causeAction').d('案由'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.court').d('法院'),
        },
        {
          fieldName: 'stdName',
          label: intl.get('sdat.riskScanReport.view.title.restrictSpenders').d('限制高消费人'),
        },
        {
          fieldName: 'stdContent',
          label: intl.get('sdat.riskScanReport.view.title.mainText').d('限消正文'),
        },
      ],
    },

    {
      id: 16,
      title: intl.get('sdat.riskScanReport.view.title.equityFreeze').d('经营风险-股权冻结'),
      code: 'QUERY_EP_RISK_JUDICIAL_FREEZE_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdPublicDate',
          label: intl.get('sdat.riskScanReport.view.title.announcementDate').d('公示日期'),
        },
        {
          fieldName: 'stdNumber',
          label: intl.get('sdat.riskScanReport.view.title.execuDocNo').d('执行通知书文号'),
        },
        {
          fieldName: 'stdAmount',
          label: intl.get('sdat.riskScanReport.view.title.equityAmount').d('股权数额'),
        },
        {
          fieldName: 'stdFreezeStartDate',
          label: intl.get('sdat.riskScanReport.view.title.freezeStartDate').d('冻结开始日期'),
        },
        {
          fieldName: 'stdFreezeYearMonth',
          label: intl.get('sdat.riskScanReport.view.title.freezePeriod').d('冻结期限（月）'),
        },
        {
          fieldName: 'stdObjName',
          label: intl.get('sdat.riskScanReport.view.title.targetParty').d('标的方'),
        },
        {
          fieldName: 'stdStatus',
          label: intl.get('sdat.riskScanReport.view.title.status').d('状态'),
        },
      ],
    },

    // {
    //   id: 13,
    //   title: intl.get('sdat.riskScanReport.view.title.protectionPenalties').d('经营风险-环保处罚'),
    //   code: 'QUERY_EP_RISK_EP_LIST_V2',
    //   fields: [
    //     {
    //       fieldName: 'serialNo',
    //       label: intl.get('hzero.common.view.serialNumber').d('序号'),
    //     },
    //     {
    //       fieldName: 'riskLevel',
    //       label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
    //     },
    //     {
    //       fieldName: 'stdPunishmentDate',
    //       label: intl.get('sdat.riskScanReport.view.title.punishmentDate').d('处罚日期'),
    //     },
    //     {
    //       fieldName: 'stdDocumentNo',
    //       label: intl.get('sdat.riskScanReport.view.title.documentNo').d('文书号'),
    //     },
    //     {
    //       fieldName: 'stdPunishmentType',
    //       label: intl.get('sdat.riskScanReport.view.title.punishmentType').d('环保处罚类型'),
    //     },
    //     {
    //       fieldName: 'stdPunishAmnt',
    //       label: intl.get('sdat.riskScanReport.view.title.punishmentAmount').d('处罚金额'),
    //     },
    //     {
    //       fieldName: 'stdPunishmentDept',
    //       label: intl.get('sdat.riskScanReport.view.title.penaltyUnit').d('处罚单位'),
    //     },
    //     {
    //       fieldName: 'stdPunishmentBasis',
    //       label: intl.get('sdat.riskScanReport.view.title.penaltyReason').d('处罚依据'),
    //     },
    //     {
    //       fieldName: 'stdPunishmentResult',
    //       label: intl.get('sdat.riskScanReport.view.title.penaltyCommon').d('处罚措施'),
    //     },
    //   ],
    // },

    {
      id: 11,
      title: intl.get('sdat.riskScanReport.view.title.arrearsInfo').d('经营风险-欠税信息'),
      code: 'QUERY_EP_RISK_OVER_DUE_TAX_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdPubDate',
          label: intl.get('sdat.riskScanReport.view.title.publishDate').d('发布日期'),
        },
        {
          fieldName: 'stdPubDepartment',
          label: intl.get('sdat.riskScanReport.view.title.issued').d('发布单位'),
        },
        {
          fieldName: 'stdOverdueType',
          label: intl.get('sdat.riskScanReport.view.title.taxesArrears').d('欠税税种'),
        },
        {
          fieldName: 'stdOverdueAmount',
          label: intl.get('sdat.riskScanReport.view.title.taxesAmount').d('欠税余额'),
        },
        {
          fieldName: 'stdCurrOverdueAmount',
          label: intl
            .get('sdat.riskScanReport.view.title.happenTaxesAmount')
            .d('当前发生的欠税余额'),
        },
        {
          fieldName: 'stdOverduePeriod',
          label: intl.get('sdat.riskScanReport.view.title.arrearsPeriod').d('欠税所属期'),
        },
        {
          fieldName: 'stdDisabled',
          label: intl.get('sdat.riskScanReport.view.title.historicInfo').d('历史信息'),
        },
      ],
    },

    {
      id: 12,
      title: intl.get('sdat.riskScanReport.view.title.operaPledge').d('经营风险-股权出质'),
      code: 'QUERY_EP_RISK_EQUITY_QUALITIES_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdDate',
          label: intl.get('sdat.riskScanReport.view.title.regisDate').d('登记日期'),
        },
        {
          fieldName: 'stdPledgor',
          label: intl.get('sdat.riskScanReport.view.title.pledgor').d('出质人'),
        },
        {
          fieldName: 'stdPledgorAmount',
          label: intl.get('sdat.riskScanReport.view.title.sharesNumber').d('出质股权数'),
        },
        {
          fieldName: 'stdPawnee',
          label: intl.get('sdat.riskScanReport.view.title.pledgee').d('质权人'),
        },
        {
          fieldName: 'stdStatus',
          label: intl.get('sdat.riskScanReport.view.title.status').d('状态'),
        },
      ],
    },

    {
      id: 0,
      title: intl
        .get('sdat.riskScanReport.view.title.businessViolations')
        .d('经营风险-重大税收违法'),
      code: 'QUERY_EP_RISK_TAX_RATE_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdTime',
          label: intl.get('sdat.riskScanReport.view.title.occurrenceTime').d('发生时间'),
        },
        {
          fieldName: 'stdProperty',
          label: intl.get('sdat.riskScanReport.view.title.caseNature').d('案件性质'),
        },
        {
          fieldName: 'stdIllegalFact',
          label: intl.get('sdat.riskScanReport.view.title.illegalFacts').d('主要违法事实'),
        },
        {
          fieldName: 'stdResult',
          label: intl
            .get('sdat.riskScanReport.view.title.punishment')
            .d('相关法律依据及,税务处理处罚情况'),
        },
        {
          fieldName: 'stdFinanceOfficer',
          label: intl
            .get('sdat.riskScanReport.view.title.financialManager')
            .d('负有直接责任的财务负责人'),
        },
        {
          fieldName: 'stdUpdatedTime',
          label: intl.get('sdat.riskScanReport.view.title.updateTime').d('更新时间'),
        },
      ],
    },

    {
      id: 7,
      title: intl.get('sdat.riskScanReport.view.title.businessPenalties').d('经营风险-行政处罚'),
      code: 'QUERY_EP_RISK_ADMIN_PUNISH_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdDate',
          label: intl.get('sdat.riskScanReport.view.title.punishmentDate').d('处罚日期'),
        },
        {
          fieldName: 'stdNumber',
          label: intl.get('sdat.riskScanReport.view.title.determineNo').d('决定书文号'),
        },
        {
          fieldName: 'stdIllegalType',
          label: intl.get('sdat.riskScanReport.view.title.illegalType').d('违法行为类型'),
        },
        {
          fieldName: 'stdContent',
          label: intl.get('sdat.riskScanReport.view.title.penaltyContent').d('行政处罚内容'),
        },
        {
          fieldName: 'stdDepartment',
          label: intl.get('sdat.riskScanReport.view.title.makingAuthority').d('决定机关名称'),
        },
        {
          fieldName: 'stdDate',
          label: intl.get('sdat.riskScanReport.view.title.penaltyDecisionDate').d('处罚决定日期'),
        },
        {
          fieldName: 'stdPunishAmnt',
          label: intl.get('sdat.riskScanReport.view.title.penalty').d('罚款金额(万元)'),
        },
      ],
    },

    {
      id: 8,
      title: intl.get('sdat.riskScanReport.view.title.businessAbnormality').d('经营风险-经营异常'),
      code: 'QUERY_EP_RISK_ABNORMALS_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdInDate',
          label: intl.get('sdat.riskScanReport.view.title.inTime').d('列入时间'),
        },
        {
          fieldName: 'stdInReason',
          label: intl.get('sdat.riskScanReport.view.title.inclusionReason').d('列入原因'),
        },
        {
          fieldName: 'stdInDepartment',
          label: intl
            .get('sdat.riskScanReport.view.title.inMakingAuthority')
            .d('列入异常做出决定机关'),
        },
        // {
        //   fieldName: 'stdOutDate',
        //   label: intl.get('sdat.riskScanReport.view.title.outTime').d('移出时间'),
        // },
        // {
        //   fieldName: 'stdOutReason',
        //   label: intl.get('sdat.riskScanReport.view.title.removalReason').d('移出原因'),
        // },
        // {
        //   fieldName: 'stdOutDepartment',
        //   label: intl
        //     .get('sdat.riskScanReport.view.title.outMakingAuthority')
        //     .d('移出异常做出决定机关'),
        // },
      ],
    },

    {
      id: 15,
      title: intl.get('sdat.riskScanReport.view.title.chattelMortgage').d('经营风险-动产抵押'),
      code: 'QUERY_EP_RISK_MORTGAGES_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdDate',
          label: intl.get('sdat.riskScanReport.view.title.regisDate').d('登记日期'),
        },
        {
          fieldName: 'stdNumber',
          label: intl.get('sdat.riskScanReport.view.title.regisNo').d('登记编号'),
        },
        {
          fieldName: 'stdDepartment',
          label: intl.get('sdat.riskScanReport.view.title.regisAuthority').d('登记机关'),
        },
        {
          fieldName: 'stdDebitScope',
          label: intl.get('sdat.riskScanReport.view.title.guaranteeScope').d('担保范围'),
        },
        {
          fieldName: 'stdAmount',
          label: intl.get('sdat.riskScanReport.view.title.guaranteeAmount').d('被担保债权数额'),
        },
        {
          fieldName: 'stdDebitType',
          label: intl.get('sdat.riskScanReport.view.title.guaranteeType').d('被担保债券种类'),
        },
        {
          fieldName: 'stdStatus',
          label: intl.get('sdat.riskScanReport.view.title.status').d('状态'),
        },
        {
          fieldName: 'stdDebitPeriod',
          label: intl.get('sdat.riskScanReport.view.title.guaranteePeriod').d('担保期限'),
        },
      ],
    },

    {
      id: 9,
      title: intl.get('sdat.riskScanReport.view.title.businessLaws').d('经营风险-严重违法'),
      code: 'QUERY_EP_RISK_SERIOUS_ILLEGAL_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdInDate',
          label: intl.get('sdat.riskScanReport.view.title.inTime').d('列入时间'),
        },
        {
          fieldName: 'stdInReason',
          label: intl.get('sdat.riskScanReport.view.title.inclusionReason').d('列入原因'),
        },
        {
          fieldName: 'stdInDepartment',
          label: intl
            .get('sdat.riskScanReport.view.title.inMakingAuthority')
            .d('列入异常做出决定机关'),
        },
        // {
        //   fieldName: 'stdOutDate',
        //   label: intl.get('sdat.riskScanReport.view.title.outTime').d('移出时间'),
        // },
        // {
        //   fieldName: 'stdOutReason',
        //   label: intl.get('sdat.riskScanReport.view.title.removalReason').d('移出原因'),
        // },
        // {
        //   fieldName: 'stdOutDepartment',
        //   label: intl
        //     .get('sdat.riskScanReport.view.title.outMakingAuthority')
        //     .d('移出异常做出决定机关'),
        // },
      ],
    },

    {
      id: 14,
      title: intl.get('sdat.riskScanReport.view.title.bankruptcy').d('经营风险-破产公告'),
      code: 'EP_RISK_BANKRUPTCY_NOTICES_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdPubDate',
          label: intl.get('sdat.riskScanReport.view.title.publicTime').d('公开时间'),
        },
        {
          fieldName: 'stdCaseTitle',
          label: intl.get('sdat.riskScanReport.view.title.caseTitle').d('案件标题'),
        },
        {
          fieldName: 'stdCaseNo',
          label: intl.get('sdat.riskScanReport.view.title.caseNo').d('案号'),
        },
        {
          fieldName: 'stdAppName',
          label: intl.get('sdat.riskScanReport.view.title.applicant').d('申请人'),
        },
        {
          fieldName: 'stdName',
          label: intl.get('sdat.riskScanReport.view.title.respondent').d('被申请人'),
        },
        {
          fieldName: 'stdCaseKind',
          label: intl.get('sdat.riskScanReport.view.title.caseType').d('案件类型'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.court').d('法院'),
        },
        {
          fieldName: 'stdContent',
          label: intl.get('sdat.riskScanReport.view.title.comment').d('正文'),
        },
      ],
    },

    {
      id: 19,
      title: intl.get('sdat.riskScanReport.view.title.certifications').d('经营风险-资质证书'),
      code: 'QUERY_EP_RISK_CERTIFICATE_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdNum',
          label: intl.get('sdat.riskScanReport.view.title.certificateNo').d('证书编号'),
        },
        {
          fieldName: 'stdType',
          label: intl.get('sdat.riskScanReport.view.title.certificateType').d('资质证书类型'),
        },
        {
          fieldName: 'stdIssueDate',
          label: intl.get('sdat.riskScanReport.view.title.issuingTime').d('发证时间'),
        },
        {
          fieldName: 'stdValidityEnd',
          label: intl.get('sdat.riskScanReport.view.title.validEndDate').d('截止时间'),
        },
        {
          fieldName: 'stdExpireStatus',
          label: intl.get('sdat.riskScanReport.view.title.status').d('状态'),
        },
        {
          fieldName: 'stdRemarks',
          label: intl.get('sdat.riskScanReport.view.title.description').d('备注'),
        },
      ],
    },

    {
      id: 20,
      title: intl.get('sdat.riskScanReport.view.title.equityPledge').d('经营风险-股权质押'),
      code: 'QUERY_EP_RISK_STOCK_PLEDGE_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdShareholderName',
          label: intl.get('sdat.riskScanReport.view.title.shareholderName').d('股东名称'),
        },
        {
          fieldName: 'stdNoticeDate',
          label: intl.get('sdat.riskScanReport.view.title.announDate').d('公告日期'),
        },
        {
          fieldName: 'stdSharesNum',
          label: intl.get('sdat.riskScanReport.view.title.sharesCount').d('所持股数'),
        },
        // {
        //   fieldName: 'stdShareholderCode',
        //   label: intl.get('sdat.riskScanReport.view.title.shareholderCode').d('股东代码'),
        // },
        {
          fieldName: 'stdInvAmount',
          label: intl.get('sdat.riskScanReport.view.title.amountInvolved').d('涉及金额'),
        },
        {
          fieldName: 'stdFallingClosingLine',
          label: intl.get('sdat.riskScanReport.view.title.isTouches').d('是否触及/跌破平仓线'),
        },
        {
          fieldName: 'stdFrozenSharesNum',
          label: intl.get('sdat.riskScanReport.view.title.pledgedCount').d('质押/冻结股数'),
        },
      ],
    },

    // {
    //   id: 21,
    //   title: intl.get('sdat.riskScanReport.view.title.officialBlacklist').d('经营风险-官方黑名单'),
    //   code: 'QUERY_EP_RISK_EXTERNAL_BLACKLIST_V2',
    //   fields: [
    //     {
    //       fieldName: 'serialNo',
    //       label: intl.get('hzero.common.view.serialNumber').d('序号'),
    //     },
    //     {
    //       fieldName: 'riskLevel',
    //       label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
    //     },
    //     {
    //       fieldName: 'stdBlacklistType',
    //       label: intl.get('sdat.riskScanReport.view.title.blackType').d('黑名单类型'),
    //     },
    //     {
    //       fieldName: 'stdMaintainDepartment',
    //       label: intl.get('sdat.riskScanReport.view.title.certificationDepartment').d('认定部门'),
    //     },
    //     {
    //       fieldName: 'stdBlacklistBasis',
    //       label: intl.get('sdat.riskScanReport.view.title.blackDeterBasis').d('黑名单认定依据'),
    //     },
    //     {
    //       fieldName: 'stdInListsDate',
    //       label: intl.get('sdat.riskScanReport.view.title.blacklistedDate').d('列入黑名单日期'),
    //     },
    //     {
    //       fieldName: 'stdOutListsDate',
    //       label: intl.get('sdat.riskScanReport.view.title.removalDate').d('移除黑名单日期'),
    //     },
    //     {
    //       fieldName: 'stdPunishmentResult',
    //       label: intl.get('sdat.riskScanReport.view.title.penaltyResult').d('处罚结果'),
    //     },
    //     {
    //       fieldName: 'stdDetails',
    //       label: intl.get('sdat.riskScanReport.view.title.dishonesty').d('失信情形'),
    //     },
    //   ],
    // },

    {
      id: 17,
      title: intl
        .get('sdat.riskScanReport.view.title.yuqingNeutralNews')
        .d('舆情风险-消极/中立新闻'),
      code: 'QUERY_EP_RISK_NEGATIVE_NEWS_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdTime',
          label: intl.get('sdat.riskScanReport.view.title.publishDate').d('发布日期'),
        },
        {
          fieldName: 'stdTitle',
          label: intl.get('sdat.riskScanReport.view.title.title').d('标题'),
        },
        {
          fieldName: 'stdContent',
          label: intl.get('sdat.riskScanReport.view.title.easyComment').d('简介'),
        },
        {
          fieldName: 'stdTag',
          label: intl.get('sdat.riskScanReport.view.title.opinionLabel').d('舆情标签'),
        },
        // {
        //   fieldName: 'stdNegIndex',
        //   label: intl.get('sdat.riskScanReport.view.title.negativeIndex').d('负面指数'),
        // },
        {
          fieldName: 'stdSentiment',
          label: intl.get('sdat.riskScanReport.view.title.emotionalAttributes').d('情感属性'),
        },
        {
          fieldName: 'stdSource',
          label: intl.get('sdat.riskScanReport.view.title.source').d('来源'),
        },
        {
          fieldName: 'stdUrl',
          label: intl.get('sdat.riskScanReport.view.title.originalLink').d('原文链接'),
        },
      ],
    },

    {
      id: 107,
      title: intl.get('sdat.riskScanReport.view.title.externalGuarantee').d('经营风险-对外担保'),
      code: 'QUERY_EP_RISK_GUARANTEE_LIST',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdGuarstartDate',
          label: intl.get('sdat.riskScanReport.view.title.stdGuarstartDate').d('担保起始日期'),
        },
        {
          fieldName: 'stdBuarRelation',
          label: intl
            .get('sdat.riskScanReport.view.title.stdBuarRelation')
            .d('被担保方_与披露方关系'),
        },
        {
          fieldName: 'stdGuarjine',
          label: intl.get('sdat.riskScanReport.view.title.stdGuarjine').d('担保金额'),
        },
        {
          fieldName: 'stdReportDate',
          label: intl.get('sdat.riskScanReport.view.title.stdReportDate').d('报告期'),
        },
        {
          fieldName: 'stdTradeDate',
          label: intl.get('sdat.riskScanReport.view.title.stdTradeDate').d('交易日期'),
        },
        {
          fieldName: 'stdNoticeDate',
          label: intl.get('sdat.riskScanReport.view.title.stdNoticeDate').d('公告日期'),
        },
        {
          fieldName: 'stdIsRltrade',
          label: intl.get('sdat.riskScanReport.view.title.stdIsRltrade').d('是否关联交易'),
        },
        {
          fieldName: 'stdGuarendDate',
          label: intl.get('sdat.riskScanReport.view.title.stdGuarendDate').d('担保终止日期'),
        },
        {
          fieldName: 'stdGuarRelation',
          label: intl
            .get('sdat.riskScanReport.view.title.stdGuarRelation')
            .d('担保方_与披露方关系'),
        },
        {
          fieldName: 'stdReportType',
          label: intl.get('sdat.riskScanReport.view.title.stdReportType').d('报告期类别'),
        },
        {
          fieldName: 'stdGuarMethod',
          label: intl.get('sdat.riskScanReport.view.title.stdGuarMethod').d('担保方式'),
        },
        {
          fieldName: 'stdIsPerform',
          label: intl.get('sdat.riskScanReport.view.title.stdIsPerform').d('是否履行完毕'),
        },
        {
          fieldName: 'stdWarContent',
          label: intl.get('sdat.riskScanReport.view.title.stdWarContent').d('担保事件说明'),
        },
        {
          fieldName: 'stdGuardealine',
          label: intl.get('sdat.riskScanReport.view.title.stdGuardealine').d('担保期限(年)'),
        },
        {
          fieldName: 'stdCurrency',
          label: intl.get('sdat.riskScanReport.view.title.stdCurrency').d('币种'),
        },
        {
          fieldName: 'stdGuarComName',
          label: intl.get('sdat.riskScanReport.view.title.stdGuarComName').d('担保方_公司名称'),
        },
        {
          fieldName: 'stdBuarComName',
          label: intl.get('sdat.riskScanReport.view.title.stdBuarComName').d('被担保方_公司名称'),
        },
      ],
    },

    {
      id: 110,
      title: intl.get('sdat.riskNewScanReport.view.title.equityPledge').d('经营风险-股权质押'),
      code: 'QUERY_EP_RISK_STOCK_PLEDGE_LIST_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdShareholderName',
          label: intl.get('sdat.riskScanReport.view.title.shareholderName').d('股东名称'),
        },
        {
          fieldName: 'stdNoticeDate',
          label: intl.get('sdat.riskScanReport.view.title.announDate').d('公告日期'),
        },
        {
          fieldName: 'stdSharesNum',
          label: intl.get('sdat.riskScanReport.view.title.sharesCount').d('所持股数'),
        },
        // {
        //   fieldName: 'stdShareholderCode',
        //   label: intl.get('sdat.riskScanReport.view.title.shareholderCode').d('股东代码'),
        // },
        {
          fieldName: 'stdInvAmount',
          label: intl.get('sdat.riskScanReport.view.title.amountInvolved').d('涉及金额'),
        },
        {
          fieldName: 'stdFallingClosingLine',
          label: intl.get('sdat.riskScanReport.view.title.isTouches').d('是否触及/跌破平仓线'),
        },
        {
          fieldName: 'stdFrozenSharesNum',
          label: intl.get('sdat.riskScanReport.view.title.pledgedCount').d('质押/冻结股数'),
        },
      ],
    },
    {
      id: 111,
      title: intl.get('sdat.riskNewScanReport.view.title.equityPledge').d('司法风险-终本案件'),
      code: 'QUERY_EP_RISK_TERMINATION_CASE_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdFilingDate',
          label: intl.get('sdat.riskScanReport.view.title.filingDate').d('立案日期'),
        },
        {
          fieldName: 'stdTerminateDate',
          label: intl.get('sdat.riskScanReport.view.title.finalDate').d('终本日期'),
        },
        {
          fieldName: 'stdCaseNoTerminal',
          label: intl.get('sdat.riskScanReport.view.title.executionNo').d('执行案号'),
        },
        {
          fieldName: 'stdCaseNoOrigin',
          label: intl.get('sdat.riskScanReport.view.title.accordingNo').d('执行依据案号'),
        },
        {
          fieldName: 'stdAmount',
          label: intl.get('sdat.riskScanReport.view.title.executionTarget').d('执行标的'),
        },
        {
          fieldName: 'stdFailPerformAmount',
          label: intl.get('sdat.riskScanReport.view.title.unfulfilledAmount').d('未履行金额'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.executionCourt').d('执行法院'),
        },
        {
          fieldName: 'stdStatus',
          label: intl.get('sdat.riskScanReport.view.title.status').d('状态'),
        },
      ],
    },
    {
      id: 112,
      title: intl.get('sdat.riskScanReport.view.title.officialBlacklist').d('经营风险-官方黑名单'),
      code: 'QUERY_EP_RISK_EXTERNAL_BLACKLIST_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdBlacklistType',
          label: intl.get('sdat.riskScanReport.view.title.blackType').d('黑名单类型'),
        },
        {
          fieldName: 'stdMaintainDepartment',
          label: intl.get('sdat.riskScanReport.view.title.certificationDepartment').d('认定部门'),
        },
        {
          fieldName: 'stdBlacklistBasis',
          label: intl.get('sdat.riskScanReport.view.title.blackDeterBasis').d('黑名单认定依据'),
        },
        {
          fieldName: 'stdInListsDate',
          label: intl.get('sdat.riskScanReport.view.title.blacklistedDate').d('列入黑名单日期'),
        },
        {
          fieldName: 'stdOutListsDate',
          label: intl.get('sdat.riskScanReport.view.title.removalDate').d('移除黑名单日期'),
        },
        {
          fieldName: 'stdPunishmentResult',
          label: intl.get('sdat.riskScanReport.view.title.penaltyResult').d('处罚结果'),
        },
        {
          fieldName: 'stdDetails',
          label: intl.get('sdat.riskScanReport.view.title.dishonesty').d('失信情形'),
        },
      ],
    },
    {
      id: 113,
      title: intl.get('sdat.riskScanReport.view.title.judicialAnnouncement').d('司法风险-法院公告'),
      code: 'QUERY_EP_RISK_NOTICE_LIST_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdDate',
          label: intl.get('sdat.riskScanReport.view.title.publishDate').d('发布日期'),
        },
        {
          fieldName: 'stdType',
          label: intl.get('sdat.riskScanReport.view.title.announcementType').d('公告类型'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.court').d('法院'),
        },
        {
          fieldName: 'stdContent',
          label: intl.get('sdat.riskScanReport.view.title.content').d('内容'),
        },

        {
          fieldName: 'stdPerson',
          label: intl.get('sdat.riskScanReport.view.title.party').d('当事人'),
        },
      ],
    },
    {
      id: 114,
      title: intl.get('sdat.riskScanReport.view.title.protectionPenalties').d('经营风险-环保处罚'),
      code: 'QUERY_EP_RISK_EP_LIST_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdPunishmentDate',
          label: intl.get('sdat.riskScanReport.view.title.punishmentDate').d('处罚日期'),
        },
        {
          fieldName: 'stdDocumentNo',
          label: intl.get('sdat.riskScanReport.view.title.documentNo').d('文书号'),
        },
        {
          fieldName: 'stdPunishmentType',
          label: intl.get('sdat.riskScanReport.view.title.punishmentType').d('环保处罚类型'),
        },
        {
          fieldName: 'stdPunishAmnt',
          label: intl.get('sdat.riskScanReport.view.title.punishmentAmount').d('处罚金额'),
        },
        {
          fieldName: 'stdPunishmentDept',
          label: intl.get('sdat.riskScanReport.view.title.penaltyUnit').d('处罚单位'),
        },
        {
          fieldName: 'stdPunishmentBasis',
          label: intl.get('sdat.riskScanReport.view.title.penaltyReason').d('处罚依据'),
        },
        {
          fieldName: 'stdPunishmentMeasure',
          label: intl.get('sdat.riskScanReport.view.title.penaltyCommon').d('处罚措施'),
        },
      ],
    },

    {
      id: 115,
      title: intl.get('sdat.riskScanReport.view.title.cancelFiling').d('经营风险-注销备案'),
      code: 'QUERY_EP_RISK_LOGOUT_RECORD_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdEname',
          label: intl.get('sdat.riskScanReport.view.title.businessName').d('企业名称'),
        },
        {
          fieldName: 'stdCreditNo',
          label: intl.get('sdat.riskScanReport.view.title.stdCreditNo').d('统一社会信用代码'),
        },
        {
          fieldName: 'stdAuditRegDate',
          label: intl.get('sdat.riskScanReport.view.title.stdAuditRegDate').d('清算组备案日期'),
        },
        {
          fieldName: 'stdAuditStartDate',
          label: intl.get('sdat.riskScanReport.view.title.stdAuditStartDate').d('清算组成立日期'),
        },
        {
          fieldName: 'stdLogoutReason',
          label: intl.get('sdat.riskScanReport.view.title.stdLogoutReason').d('注销原因'),
        },
        {
          fieldName: 'stdAuditAddress',
          label: intl.get('sdat.riskScanReport.view.title.stdAuditAddress').d('清算组办公地址'),
        },
        {
          fieldName: 'stdAuditLeader',
          label: intl.get('sdat.riskScanReport.view.title.stdAuditLeader').d('清算组负责人'),
        },

        {
          fieldName: 'stdAuditEmployees',
          label: intl.get('sdat.riskScanReport.view.title.stdAuditEmployees').d('清算组成员'),
        },
        {
          fieldName: 'stdCreditorStartDate',
          label: intl
            .get('sdat.riskScanReport.view.title.stdCreditorStartDate')
            .d('债权人公告开始日期'),
        },
        {
          fieldName: 'stdCreditorEndDate',
          label: intl
            .get('sdat.riskScanReport.view.title.stdCreditorEndDate')
            .d('债权人公告结束日期'),
        },
        {
          fieldName: 'stdCreditorAnnouncement',
          label: intl.get('sdat.riskScanReport.view.title.stdCreditorAnnouncement').d('公告内容'),
        },
        {
          fieldName: 'stdCreditorAddress',
          label: intl.get('sdat.riskScanReport.view.title.stdCreditorAddress').d('债权申报地址'),
        },
        {
          fieldName: 'stdCancelDate',
          label: intl.get('sdat.riskScanReport.view.title.stdCancelDate').d('终止注销决议日期'),
        },
        {
          fieldName: 'stdStatus',
          label: intl.get('sdat.riskScanReport.view.title.stdStatus').d('状态'),
        },
      ],
    },
    {
      id: 116,
      title: intl.get('sdat.riskScanReport.view.title.deliveryNotice').d('送达公告'),
      code: 'QUERY_EP_RISK_DELIVERY_NOTICE_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdCleanRole',
          label: intl.get('sdat.riskScanReport.view.title.stdCleanRole').d('当事人角色'),
        },
        {
          fieldName: 'stdStandardCaseNo',
          label: intl.get('sdat.riskScanReport.view.title.caseNo').d('案号'),
        },
        {
          fieldName: 'stdMaintainDepartment',
          label: intl.get('sdat.riskScanReport.view.title.stdMaintainDepartment').d('公告名称'),
        },
        {
          fieldName: 'stdTitle',
          label: intl.get('sdat.riskScanReport.view.title.causeAction').d('案由'),
        },
        {
          fieldName: 'stdDate',
          label: intl.get('sdat.riskScanReport.view.title.stdDate').d('发布时间'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.court').d('法院'),
        },
        {
          fieldName: 'stdContent',
          label: intl.get('sdat.riskScanReport.view.title.stdDetail').d('详情'),
        },
        {
          fieldName: 'stdUrl',
          label: intl.get('sdat.riskScanReport.view.title.stdUrl').d('详情页链接'),
        },
      ],
    },
    {
      id: 117,
      title: intl.get('sdat.riskScanReport.view.title.judicialAuction').d('司法风险-司法拍卖'),
      code: 'QUERY_EP_RISK_JUDICIAL_AUCTION_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdName',
          label: intl.get('sdat.riskScanReport.view.title.stdName').d('工商名称'),
        },
        {
          fieldName: 'stdFullName',
          label: intl.get('sdat.riskScanReport.view.title.businessName').d('企业名称'),
        },
        {
          fieldName: 'stdPunishmestdObjectNamentType',
          label: intl.get('sdat.riskScanReport.view.title.stdObjectName').d('标的物'),
        },
        {
          fieldName: 'stdProjectName',
          label: intl.get('sdat.riskScanReport.view.title.stdProjectName').d('项目名称'),
        },
        {
          fieldName: 'stdRestrict',
          label: intl.get('sdat.riskScanReport.view.title.stdRestrict').d('权利限制情况'),
        },
        {
          fieldName: 'stdBasis',
          label: intl.get('sdat.riskScanReport.view.title.stdBasis').d('权利来源'),
        },
        {
          fieldName: 'stdDescription',
          label: intl.get('sdat.riskScanReport.view.title.stdDescription').d('拍品介绍'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.stdCourt2').d('处置法院'),
        },
        {
          fieldName: 'stdStartPrice',
          label: intl.get('sdat.riskScanReport.view.title.stdStartPrice').d('起拍价'),
        },
        {
          fieldName: 'stdDate',
          label: intl.get('sdat.riskScanReport.view.title.stdDate2').d('拍卖日期'),
        },
        {
          fieldName: 'stdTransactionDate',
          label: intl.get('sdat.riskScanReport.view.title.stdTransactionDate').d('交易时间'),
        },
        {
          fieldName: 'stdTransactionPrice',
          label: intl.get('sdat.riskScanReport.view.title.stdTransactionPrice').d('交易价格'),
        },
      ],
    },

    {
      id: 118,
      title: intl.get('sdat.riskScanReport.view.title.inquiryEvaluation').d('司法风险-询价评估'),
      code: 'QUERY_EP_RISK_INQUIRY_EVALUATION_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdSubjectMatter',
          label: intl.get('sdat.riskScanReport.view.title.stdSubjectMatter').d('标的物名称'),
        },
        {
          fieldName: 'stdPropertyKind',
          label: intl.get('sdat.riskScanReport.view.title.stdPropertyKind').d('财产类型'),
        },
        {
          fieldName: 'stdType',
          label: intl.get('sdat.riskScanReport.view.title.stdType').d('类型'),
        },
        {
          fieldName: 'stdEname',
          label: intl.get('sdat.riskScanReport.view.title.stdEname118').d('被执行人名称'),
        },
        {
          fieldName: 'stdCaseNo',
          label: intl.get('sdat.riskScanReport.view.title.caseNo').d('案号'),
        },
        {
          fieldName: 'stdCourtName',
          label: intl.get('sdat.riskScanReport.view.title.court').d('法院'),
        },
        {
          fieldName: 'stdLotteryTime',
          label: intl.get('sdat.riskScanReport.view.title.stdLotteryTime').d('摇号日期'),
        },
        {
          fieldName: 'stdPubDate',
          label: intl.get('sdat.riskScanReport.view.title.publishDate').d('发布日期'),
        },
        {
          fieldName: 'stdSubjectMatterPeopleStr',
          label: intl
            .get('sdat.riskScanReport.view.title.stdSubjectMatterPeopleStr')
            .d('标的物所有人'),
        },
        {
          fieldName: 'stdEvaluationInstitutionStr',
          label: intl
            .get('sdat.riskScanReport.view.title.stdEvaluationInstitutionStr')
            .d('选定评估机构'),
        },
        {
          fieldName: 'stdResultStr',
          label: intl.get('sdat.riskScanReport.view.title.stdResultStr').d('询价结果'),
        },
      ],
    },

    {
      id: 119,
      title: intl.get('sdat.riskScanReport.view.title.restrictedExit').d('司法风险-限制出境核查'),
      code: 'QUERY_EP_RISK_RESTRICT_EXIT_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdName',
          label: intl.get('sdat.riskScanReport.view.title.businessName').d('企业名称'),
        },
        {
          fieldName: 'stdPname',
          label: intl.get('sdat.riskScanReport.view.title.stdPname').d('限制出境对象'),
        },
        {
          fieldName: 'stdAddress',
          label: intl.get('sdat.riskScanReport.view.title.stdAddress').d('被执行人地址'),
        },
        {
          fieldName: 'stdCaseNo',
          label: intl.get('sdat.riskScanReport.view.title.caseNo').d('案号'),
        },
        {
          fieldName: 'stdExecutionApplicant',
          label: intl.get('sdat.riskScanReport.view.title.stdExecutionApplicant').d('申请执行人'),
        },
        {
          fieldName: 'stdAmount',
          label: intl.get('sdat.riskScanReport.view.title.stdAmount').d('执行标的金额'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.stdCourt119').d('承办法院'),
        },
        {
          fieldName: 'stdPublishDate',
          label: intl.get('sdat.riskScanReport.view.title.publishDate').d('发布日期'),
        },
        {
          fieldName: 'stdCaseReason',
          label: intl.get('sdat.riskScanReport.view.title.stdCaseReason').d('执行案由'),
        },
        {
          fieldName: 'stdFilingDate',
          label: intl.get('sdat.riskScanReport.view.title.caseFilingTime').d('立案时间'),
        },
      ],
    },

    {
      id: 120,
      title: intl
        .get('sdat.riskScanReport.view.title.doubleRandomInspection')
        .d('经营风险-双随机检查'),
      code: 'QUERY_EP_RISK_ENTERPRISE_DOUBLE_CHECK_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        // {
        //   fieldName: 'stdDetails',
        //   label: intl.get('sdat.riskScanReport.view.title.stdDetails').d('详情列表'),
        // },
        {
          fieldName: 'stdRaninsTaskName',
          label: intl.get('sdat.riskScanReport.view.title.stdRaninsTaskName').d('抽查任务名称'),
        },
        {
          fieldName: 'stdRaninsPlanId',
          label: intl.get('sdat.riskScanReport.view.title.stdRaninsPlanId').d('抽查计划编号'),
        },
        {
          fieldName: 'stdRaninsTaskId',
          label: intl.get('sdat.riskScanReport.view.title.stdRaninsTaskId').d('抽查任务编号'),
        },
        {
          fieldName: 'stdInsDate',
          label: intl.get('sdat.riskScanReport.view.title.stdInsDate').d('抽查完成日期'),
        },
        {
          fieldName: 'stdInsAuth',
          label: intl.get('sdat.riskScanReport.view.title.stdInsAuth').d('抽查机关'),
        },
        {
          fieldName: 'stdRaninsPlaneName',
          label: intl.get('sdat.riskScanReport.view.title.stdRaninsPlaneName').d('抽查计划名称'),
        },
        {
          fieldName: 'stdRaninsTypeName',
          label: intl.get('sdat.riskScanReport.view.title.stdRaninsTypeName').d('抽查类型'),
        },
      ],
    },

    {
      id: 121,
      title: intl
        .get('sdat.riskScanReport.view.title.intellectualPropertyPledge')
        .d('经营风险-知识产权出质'),
      code: 'QUERY_EP_RISK_INTELLECTIUAL_PROPERTY_PLEDGE_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdPawnee',
          label: intl.get('sdat.riskScanReport.view.title.stdPawnee').d('质权人名称'),
        },
        {
          fieldName: 'stdPeriod',
          label: intl.get('sdat.riskScanReport.view.title.stdPeriod').d('质权登记期限'),
        },
        {
          fieldName: 'stdPawneeType',
          label: intl.get('sdat.riskScanReport.view.title.stdPawneeType').d('质权人类型'),
        },
        {
          fieldName: 'stdPublicDate',
          label: intl.get('sdat.riskScanReport.view.title.stdPublicDate').d('公示日期'),
        },
        {
          fieldName: 'stdName',
          label: intl.get('sdat.riskScanReport.view.title.stdName121').d('知识产权名称'),
        },
        {
          fieldName: 'stdPledgorType',
          label: intl.get('sdat.riskScanReport.view.title.stdPledgorType').d('出质人类型'),
        },
        {
          fieldName: 'stdPledgor',
          label: intl.get('sdat.riskScanReport.view.title.stdPledgor').d('出质人名称'),
        },
        {
          fieldName: 'stdNumber',
          label: intl.get('sdat.riskScanReport.view.title.stdNumber121').d('注册号'),
        },
        {
          fieldName: 'stdType',
          label: intl.get('sdat.riskScanReport.view.title.stdType121').d('种类'),
        },
      ],
    },

    {
      id: 122,
      title: intl.get('sdat.riskScanReport.view.title.productRecall').d('经营风险-产品召回'),
      code: 'QUERY_EP_RISK_PRODUCT_RECALL_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdEname',
          label: intl.get('sdat.riskScanReport.view.title.stdEname122').d('召回企业'),
        },
        {
          fieldName: 'stdReleaseDate',
          label: intl.get('sdat.riskScanReport.view.title.publishDate').d('发布日期'),
        },
        {
          fieldName: 'stdTitle',
          label: intl.get('sdat.riskScanReport.view.title.title').d('标题'),
        },
        {
          fieldName: 'stdProductName',
          label: intl.get('sdat.riskScanReport.view.title.stdProductName122').d('召回产品名称'),
        },
        {
          fieldName: 'stdRecallType',
          label: intl.get('sdat.riskScanReport.view.title.stdRecallType').d('召回类型'),
        },
        {
          fieldName: 'stdDetail',
          label: intl.get('sdat.riskScanReport.view.title.stdDetail').d('详情'),
        },
        {
          fieldName: 'stdUrl',
          label: intl.get('sdat.riskScanReport.view.title.stdUrl1').d('url'),
        },
      ],
    },

    {
      id: 123,
      title: intl.get('sdat.riskScanReport.view.title.simpleCancellation').d('经营风险-简易注销'),
      code: 'QUERY_EP_RISK_SIMPLIFIED_CANCELLATION_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdGsScaResult',
          label: intl.get('sdat.riskScanReport.view.title.stdGsScaResult').d('简易注销结果'),
        },
        {
          fieldName: 'stdNoticePeriod',
          label: intl.get('sdat.riskScanReport.view.title.stdNoticePeriod').d('公告期'),
        },
        {
          fieldName: 'stdUrl',
          label: intl.get('sdat.riskScanReport.view.title.stdUrl123').d('全体投资人承诺书(地址)'),
        },
        {
          fieldName: 'stdName',
          label: intl.get('sdat.riskScanReport.view.title.businessName').d('企业名称'),
        },
        {
          fieldName: 'stdGsScaObjections',
          label: intl.get('sdat.riskScanReport.view.title.stdGsScaObjections').d('异议信息'),
        },
        {
          fieldName: 'stdDepartment',
          label: intl.get('sdat.riskScanReport.view.title.regisAuthority').d('登记机关'),
        },
      ],
    },

    {
      id: 124,
      title: intl.get('sdat.riskScanReport.view.title.stopCheckAndInspection').d('抽查检查'),
      code: 'QUERY_EP_RISK_SPOT_CHECK_AND_INSPECTION_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdDate',
          label: intl.get('sdat.riskScanReport.view.title.stdDate0').d('日期'),
        },
        {
          fieldName: 'stdResult',
          label: intl.get('sdat.riskScanReport.view.title.stdResult').d('结果'),
        },
        {
          fieldName: 'stdDepartment',
          label: intl.get('sdat.riskScanReport.view.title.stdDepartment').d('检查实施机关'),
        },
        {
          fieldName: 'stdType',
          label: intl.get('sdat.riskScanReport.view.title.stdType').d('类型'),
        },
      ],
    },

    {
      id: 106,
      title: intl.get('sdat.riskNewScanReport.view.title.disasterRisk').d('灾害风险'),
      code: 'QUERY_EP_RISK_DISASTER_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskNewScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'type',
          label: intl.get('sdat.riskNewScanReport.view.disaster.disasterType').d('灾害类型'),
        },
        {
          fieldName: 'eventName',
          label: intl.get('sdat.riskNewScanReport.view.disaster.eventName').d('事件名称'),
        },
        {
          fieldName: 'measureValue',
          label: intl.get('sdat.riskNewScanReport.view.disaster.measureValue').d('量度值'),
        },
        {
          fieldName: 'measureUnit',
          label: intl.get('sdat.riskNewScanReport.view.disaster.measureUnit').d('量度单位'),
        },
        {
          fieldName: 'depth',
          label: intl.get('sdat.riskNewScanReport.view.disaster.sourceDepth').d('震源深度'),
        },
        {
          fieldName: 'gdacsScore',
          label: intl.get('sdat.riskNewScanReport.view.disaster.gdacsScore').d('GDACS评分'),
        },
        {
          fieldName: 'startDate',
          label: intl.get('sdat.riskNewScanReport.view.title.happenTime').d('发生时间'),
        },
        {
          fieldName: 'endDate',
          label: intl.get('sdat.riskNewScanReport.view.title.endTime').d('结束时间'),
        },
      ],
    },

    {
      id: 101,
      title: intl
        .get('sdat.riskNewScanReport.view.title.oneTimeInspectionPassRate')
        .d('一次交检合格率'),
      code: 'OneTimeInspectionPassRate',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskNewScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'calculateDimensions',
          label: intl.get('sdat.riskNewScanReport.view.title.calculateDimensions').d('计算维度'),
        },
        {
          fieldName: 'qi_sii_inspection_id_count_1d_003',
          label: intl
            .get('sdat.riskNewScanReport.view.title.oneTimeOrderNum')
            .d('近30天合格来料检验单数'),
        },
        {
          fieldName: 'qi_sii_inspection_id_count_1d_004',
          label: intl
            .get('sdat.riskNewScanReport.view.title.oneTimeOrderSum')
            .d('近30天全部来料检验单数'),
        },
        {
          fieldName: 'onetime_inspection_pass_rate',
          label: intl
            .get('sdat.riskNewScanReport.view.title.oneTimeInspectionPassRate')
            .d('一次交检合格率'),
        },
      ],
    },
    {
      id: 102,
      title: intl
        .get('sdat.riskNewScanReport.view.title.rectificationResponseRate')
        .d('整改响应率'),
      code: 'RectificationResponseRate',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskNewScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'calculateDimensions',
          label: intl.get('sdat.riskNewScanReport.view.title.calculateDimensions').d('计算维度'),
        },
        {
          fieldName: 'qh_qh_problem_header_id_count_1d_003',
          label: intl
            .get('sdat.riskNewScanReport.view.title.rectificationNum')
            .d('近30天响应及时的质量整改单头数'),
        },
        {
          fieldName: 'qh_qh_problem_header_id_count_1d_001',
          label: intl
            .get('sdat.riskNewScanReport.view.title.rectificationSum')
            .d('近30天全量已发布的质量整改单头数'),
        },
        {
          fieldName: 'rectification_response_rate',
          label: intl
            .get('sdat.riskNewScanReport.view.title.rectificationResponseRate')
            .d('整改响应率'),
        },
      ],
    },
    {
      id: 103,
      title: intl.get('sdat.riskNewScanReport.view.title.timelyDeliveryRate').d('到货及时率'),
      code: 'TimelyDeliveryRate',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskNewScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'calculateDimensions',
          label: intl.get('sdat.riskNewScanReport.view.title.calculateDimensions').d('计算维度'),
        },
        {
          fieldName: 'mll_ossrtl_rcv_trx_line_id_count_1d_001',
          label: intl.get('sdat.riskNewScanReport.view.title.timelyNum').d('近30天到货及时批次'),
        },
        {
          fieldName: 'mll_ossrtl_rcv_trx_line_id_count_1d_002',
          label: intl.get('sdat.riskNewScanReport.view.title.timelySum').d('近30天到货批次'),
        },
        {
          fieldName: 'timelydeliveryrate',
          label: intl.get('sdat.riskNewScanReport.view.title.timelyDeliveryRate').d('到货及时率'),
        },
      ],
    },
    {
      id: 104,
      title: intl.get('sdat.riskNewScanReport.view.title.quotationResponseRate').d('报价响应率'),
      code: 'QuotationResponseRate',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskNewScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'calculateDimensions',
          label: intl.get('sdat.riskNewScanReport.view.title.calculateDimensions').d('计算维度'),
        },
        {
          fieldName: 'srql_srh_rfx_header_id_dist_1d_005',
          label: intl.get('sdat.riskNewScanReport.view.title.quotationNum').d('近30天报价次数'),
        },
        {
          fieldName: 'srql_srh_rfx_header_id_dist_1d_004',
          label: intl.get('sdat.riskNewScanReport.view.title.quotationSum').d('近30天邀请报价次数'),
        },
        {
          fieldName: 'quotation_response_rate',
          label: intl
            .get('sdat.riskNewScanReport.view.title.quotationResponseRate')
            .d('报价响应率'),
        },
      ],
    },
    {
      id: 105,
      title: intl.get('sdat.riskNewScanReport.view.title.orderResponseRate').d('订单响应率'),
      code: 'OrderResponseRate',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskNewScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'calculateDimensions',
          label: intl.get('sdat.riskNewScanReport.view.title.calculateDimensions').d('计算维度'),
        },
        {
          fieldName: 'oll_ospll_po_header_id_dist_1d_003',
          label: intl
            .get('sdat.riskNewScanReport.view.title.orderNum')
            .d('近30天已发布且响应及时的订单发运行订单'),
        },
        {
          fieldName: 'oll_ospll_po_header_id_dist_1d_001',
          label: intl
            .get('sdat.riskNewScanReport.view.title.orderSum')
            .d('近30天已发布的订单发运行订单头数'),
        },
        {
          fieldName: 'order_response_rate',
          label: intl.get('sdat.riskNewScanReport.view.title.orderResponseRate').d('订单响应率'),
        },
      ],
    },
    {
      id: 108,
      title: intl.get('sdat.riskNewScanReport.view.title.delayDaysForInvoicing').d('开票延期天数'),
      code: 'DelayDaysForInvoicing',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskNewScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'calculateDimensions',
          label: intl.get('sdat.riskNewScanReport.view.title.calculateDimensions').d('计算维度'),
        },
        {
          fieldName: 'now',
          label: intl.get('sdat.riskNewScanReport.view.title.now').d('未核销发票的当前计算日期'),
        },
        {
          fieldName: 'max_spr_payment_date',
          label: intl
            .get('sdat.riskNewScanReport.view.title.maxSprPaymentDate')
            .d('结算单付款记录中最晚付款日期'),
        },
        {
          fieldName: 'delay_days_for_invoicing',
          label: intl
            .get('sdat.riskNewScanReport.view.title.delayDaysForInvoicing')
            .d('开票延期天数'),
        },
      ],
    },

    {
      id: 200,
      title: intl.get('sdat.riskNewScanReport.view.title.defaultRisk').d('默认风险项'),
      code: 'DEFAULT_RISK_TABLE_CODE',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskNewScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'riskName',
          label: intl.get('sdat.riskNewScanReport.view.title.riskName').d('风险名称'),
        },
        {
          fieldName: 'riskMessage',
          label: intl.get('sdat.riskNewScanReport.view.title.riskValue').d('风险值'),
        },
      ],
    },

    {
      id: 201,
      title: intl.get('sdat.riskScanReport.view.title.bankruptcy').d('经营风险-破产公告'),
      code: 'QUERY_EP_RISK_BANKRUPTCY_NOTICES_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdNoticeKind',
          label: intl.get('sdat.riskScanReport.view.title.stdNoticeKind').d('公告类型'),
        },
        {
          fieldName: 'stdNoticeTitle',
          label: intl.get('sdat.riskScanReport.view.title.stdNoticeTitle').d('公告标题'),
        },
        {
          fieldName: 'stdCaseNo',
          label: intl.get('sdat.riskScanReport.view.title.caseNo').d('案号'),
        },
        {
          fieldName: 'stdCaseTitle',
          label: intl.get('sdat.riskScanReport.view.title.stdNoticeCaseTitle').d('案件标题'),
        },
        {
          fieldName: 'stdPubDate',
          label: intl.get('sdat.riskScanReport.view.title.stdPubDate').d('公开日期'),
        },
        {
          fieldName: 'stdPubPeople',
          label: intl.get('sdat.riskScanReport.view.title.stdPubPeople').d('公开人'),
        },
      ],
    },

    {
      id: 202,
      title: intl.get('sdat.riskScanReport.view.title.publicNotice').d('经营风险-公示催告'),
      code: 'QUERY_EP_RISK_PUBLIC_NOTICE_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdDate',
          label: intl.get('sdat.riskScanReport.view.title.publishDate').d('发布日期'),
        },
        {
          fieldName: 'stdType',
          label: intl.get('sdat.riskScanReport.view.title.announcementType').d('公告类型'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.court').d('法院'),
        },
        {
          fieldName: 'stdContent',
          label: intl.get('sdat.riskScanReport.view.title.content').d('内容'),
        },

        {
          fieldName: 'stdPerson',
          label: intl.get('sdat.riskScanReport.view.title.party').d('当事人'),
        },
      ],
    },

    {
      id: 203,
      title: intl
        .get('sdat.riskScanReport.view.title.abnormalOperatingStatus')
        .d('经营风险-经营状态异常'),
      code: 'QUERY_EP_RISK_ABNORMAL_OPERATING_STATUS_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdNewStatus',
          label: intl.get('sdat.riskScanReport.view.title.stdNewStatus').d('经营状态'),
        },
      ],
    },

    {
      id: 204,
      title: intl.get('sdat.riskScanReport.view.title.enterpriseShell').d('经营风险-企业空壳'),
      code: 'QUERY_EP_RISK_SHELL_DETAIL_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdLevel',
          label: intl.get('sdat.riskScanReport.view.title.stdShellLevel').d('空壳等级'),
        },
        {
          fieldName: 'stdScore',
          label: intl.get('sdat.riskScanReport.view.title.stdShellIndex').d('空壳指数'),
        },
        {
          fieldName: 'stdHitStr',
          label: intl.get('sdat.riskScanReport.view.title.stdHitStr').d('命中类标签'),
        },
        {
          fieldName: 'stdSuggestionStr',
          label: intl.get('sdat.riskScanReport.view.title.stdSuggestionStr').d('提示类标签'),
        },
      ],
    },

    {
      id: 205,
      title: intl.get('sdat.riskScanReport.view.title.briberyIllegalCase').d('行贿违法'),
      code: 'QUERY_EP_RISK_BRIBERY_ILLEGAL_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdDefendants',
          label: intl.get('sdat.riskScanReport.view.title.defendant').d('被上诉人，被告'),
        },
        {
          fieldName: 'stdTitle',
          label: intl.get('sdat.riskScanReport.view.title.caseTitle').d('案件标题'),
        },
        {
          fieldName: 'stdCaseCause',
          label: intl.get('sdat.riskScanReport.view.title.causeAction').d('案由'),
        },
        {
          fieldName: 'stdSubAmount',
          label: intl.get('sdat.riskScanReport.view.title.judgmentAmount').d('判决金额'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.court').d('法院'),
        },
        {
          fieldName: 'stdJudgeResult',
          label: intl.get('sdat.riskScanReport.view.title.judgmentResult').d('判决结果'),
        },
        {
          fieldName: 'stdUrl',
          label: intl.get('sdat.riskScanReport.view.title.judgeUrl').d('链接'),
        },
        {
          fieldName: 'stdDisabled',
          label: intl.get('sdat.riskScanReport.view.title.isHistory').d('是否历史'),
        },
        {
          fieldName: 'stdDate',
          label: intl.get('sdat.riskScanReport.view.title.judgmentTime').d('判决时间'),
        },
        {
          fieldName: 'stdPubDate',
          label: intl.get('sdat.riskScanReport.view.title.publishDate').d('发布日期'),
        },
      ],
    },

    {
      id: 206,
      title: intl.get('sdat.riskScanReport.view.title.bankruptcyCase').d('破产案件'),
      code: 'QUERY_EP_RISK_BANKRUPTCY_LIST_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdAppName',
          label: intl.get('sdat.riskScanReport.view.title.applicant').d('申请人'),
        },
        {
          fieldName: 'stdName',
          label: intl.get('sdat.riskScanReport.view.title.respondent').d('被申请人'),
        },
        {
          fieldName: 'stdCaseKind',
          label: intl.get('sdat.riskScanReport.view.title.caseType').d('案件类型'),
        },
        {
          fieldName: 'stdManagementAgency',
          label: intl.get('sdat.riskScanReport.view.title.adminAgency').d('管理人机构'),
        },
        {
          fieldName: 'stdAgencyPrincipal',
          label: intl.get('sdat.riskScanReport.view.title.adminPrincipal').d('管理人主要负责人'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.court').d('法院'),
        },
        {
          fieldName: 'stdCaseNo',
          label: intl.get('sdat.riskScanReport.view.title.caseNo').d('案号'),
        },
        {
          fieldName: 'stdDisabled',
          label: intl.get('sdat.riskScanReport.view.title.isHistory').d('是否历史'),
        },
        {
          fieldName: 'stdPubDate',
          label: intl.get('sdat.riskScanReport.view.title.publicTime').d('公开时间'),
        },
      ],
    },

    {
      id: 207,
      title: intl.get('sdat.riskScanReport.view.title.abnormalHouseholdCase').d('非正常户'),
      code: 'QUERY_EP_RISK_ABNORMAL_HOUSEHOLD_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdReason',
          label: intl.get('sdat.riskScanReport.view.title.identifiedReason').d('认定原因'),
        },
        {
          fieldName: 'stdState',
          label: intl.get('sdat.riskScanReport.view.title.taxpayerStatus').d('纳税人状态'),
        },
        {
          fieldName: 'stdJudgeDate',
          label: intl.get('sdat.riskScanReport.view.title.designationDate').d('认定日期'),
        },
        {
          fieldName: 'stdJudgeDepartment',
          label: intl.get('sdat.riskScanReport.view.title.certifyingUnit').d('认定单位'),
        },

        {
          fieldName: 'stdArea',
          label: intl.get('sdat.riskScanReport.view.title.stdArea').d('生产经营地址'),
        },
        {
          fieldName: 'stdOverdueAmount',
          label: intl.get('sdat.riskScanReport.view.title.taxArrearsAmount').d('欠税金额'),
        },
        {
          fieldName: 'stdTaxNum',
          label: intl
            .get('sdat.riskScanReport.view.title.taxpayerIdentificationNumber')
            .d('纳税人识别号'),
        },
        {
          fieldName: 'stdJudgeArea',
          label: intl.get('sdat.riskScanReport.view.title.stdJudgeArea').d('认定单位的地址'),
        },
        {
          fieldName: 'stdPubDate',
          label: intl.get('sdat.riskScanReport.view.title.announDate').d('公告日期'),
        },
        {
          fieldName: 'stdJudgePhone',
          label: intl.get('sdat.riskScanReport.view.title.stdJudgePhone').d('认定单位电话'),
        },
        {
          fieldName: 'stdIsHistory',
          label: intl.get('sdat.riskScanReport.view.title.isHistory').d('是否历史'),
        },
        {
          fieldName: 'stdOverdueType',
          label: intl.get('sdat.riskScanReport.view.title.taxArrearsType').d('欠税税务种类'),
        },
      ],
    },

    {
      id: 208,
      title: intl.get('sdat.riskScanReport.view.title.equityChange').d('股权变更'),
      code: 'QUERY_EP_RISK_EQUITY_CHANGE_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdName',
          label: intl.get('sdat.riskScanReport.view.title.companyName').d('企业名称'),
        },
        {
          fieldName: 'stdBeforePercent',
          label: intl.get('sdat.riskScanReport.view.title.beforeEquityChange').d('股权更改前'),
        },
        {
          fieldName: 'stdAfterPercent',
          label: intl.get('sdat.riskScanReport.view.title.afterEquityChange').d('股权更改后'),
        },
        {
          fieldName: 'stdChangeDate',
          label: intl.get('sdat.riskScanReport.view.title.recordChangeTime').d('记录变更时间'),
        },
        {
          fieldName: 'stdPublicDate',
          label: intl.get('sdat.riskScanReport.view.title.recordPublishingTime').d('记录发布时间'),
        },
      ],
    },

    {
      id: 209,
      title: intl.get('sdat.riskScanReport.view.title.judgeDocument').d('裁判文书列表'),
      code: 'QUERY_EP_RISK_JUDGMENT_DOCUMENT_LIST_V2',
      fields: [
        {
          fieldName: 'serialNo',
          label: intl.get('hzero.common.view.serialNumber').d('序号'),
        },
        {
          fieldName: 'riskLevel',
          label: intl.get('sdat.riskScanReport.view.title.riskLevel').d('风险等级'),
        },
        {
          fieldName: 'stdType',
          label: intl.get('sdat.riskScanReport.view.title.stdType').d('类型'),
        },
        {
          fieldName: 'stdTitle',
          label: intl.get('sdat.riskScanReport.view.title.title').d('标题'),
        },
        {
          fieldName: 'stdDate',
          label: intl.get('sdat.riskScanReport.view.title.judgmentDate').d('判决日期'),
        },
        {
          fieldName: 'stdCaseNo',
          label: intl.get('sdat.riskScanReport.view.title.caseNo').d('案号'),
        },
        {
          fieldName: 'stdCaseCause',
          label: intl.get('sdat.riskScanReport.view.title.causeAction').d('案由'),
        },

        {
          fieldName: 'stdRole',
          label: intl.get('sdat.riskScanReport.view.title.roleStr').d('角色'),
        },
        {
          fieldName: 'stdDisabled',
          label: intl.get('sdat.riskScanReport.view.title.isHistory').d('是否历史'),
        },
        {
          fieldName: 'stdCourt',
          label: intl.get('sdat.riskScanReport.view.title.court').d('法院'),
        },
        // {
        //   fieldName: 'stdCaseType',
        //   label: intl.get('sdat.riskScanReport.view.title.caseType').d('案件类型'),
        // },
        {
          fieldName: 'stdSubAmount',
          label: intl.get('sdat.riskScanReport.view.title.subAmount').d('判决金额'),
        },
        {
          fieldName: 'stdPubDate',
          label: intl.get('sdat.riskScanReport.view.title.publishDate').d('发布日期'),
        },
      ],
    },
  ];
}
