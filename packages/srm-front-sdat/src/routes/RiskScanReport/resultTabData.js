// import intl from 'utils/intl';

export function getResultTab(intl) {
  return [
    {
      id: 18,
      title: intl
        .get('sdat.riskScanReport.view.title.industrialChanges')
        .d('工商变更风险-工商变更'),
      url: '/change-records',
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
          label: intl.get('sdat.riskScanReport.view.title.changeType').d('变更类型'),
        },
        {
          fieldName: 'stdChangeDate',
          label: intl.get('sdat.riskScanReport.view.title.changeDate').d('变更日期'),
        },
        {
          fieldName: 'stdChangeItem',
          label: intl.get('sdat.riskScanReport.view.title.changeItem').d('变更项目'),
        },
        {
          fieldName: 'stdBeforeContent',
          label: intl.get('sdat.riskScanReport.view.title.beforeChange').d('变更前内容'),
        },
        {
          fieldName: 'stdAfterContent',
          label: intl.get('sdat.riskScanReport.view.title.afterChange').d('变更后内容'),
        },
      ],
    },

    {
      id: 5,
      title: intl.get('sdat.riskScanReport.view.title.openingAnnouncement').d('司法风险-开庭公告'),
      url: '/court-notice',
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

    {
      id: 3,
      title: intl.get('sdat.riskScanReport.view.title.judicialAnnouncement').d('司法风险-法院公告'),
      url: '/notice-list',
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
      id: 1,
      title: intl.get('sdat.riskScanReport.view.title.judicialFilingInfo').d('司法风险-立案信息'),
      url: '/case-detail',
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
      ],
    },

    {
      id: 2,
      title: intl.get('sdat.riskScanReport.view.title.judicialCase').d('司法风险-终本案件'),
      url: '/termination-case',
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
      id: 4,
      title: intl.get('sdat.riskScanReport.view.title.judicialCompany').d('司法风险-被执行企业'),
      url: '/executed-person-list',
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
      url: '/execution-list',
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
      url: '/judgment-document',
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
      url: '/restricted-consumer',
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
      url: '/judicial-freeze',
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

    {
      id: 13,
      title: intl.get('sdat.riskScanReport.view.title.protectionPenalties').d('经营风险-环保处罚'),
      url: '/ep-list',
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
          fieldName: 'stdPunishmentResult',
          label: intl.get('sdat.riskScanReport.view.title.penaltyCommon').d('处罚措施'),
        },
      ],
    },

    {
      id: 11,
      title: intl.get('sdat.riskScanReport.view.title.arrearsInfo').d('经营风险-欠税信息'),
      url: '/over-due-tax',
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
      ],
    },

    {
      id: 12,
      title: intl.get('sdat.riskScanReport.view.title.operaPledge').d('经营风险-股权出质'),
      url: '/equity-qualities',
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
      url: '/tax-case',
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
      url: '/admin-punish',
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
      url: '/abnormal',
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
        {
          fieldName: 'stdOutDate',
          label: intl.get('sdat.riskScanReport.view.title.outTime').d('移出时间'),
        },
        {
          fieldName: 'stdOutReason',
          label: intl.get('sdat.riskScanReport.view.title.removalReason').d('移出原因'),
        },
        {
          fieldName: 'stdOutDepartment',
          label: intl
            .get('sdat.riskScanReport.view.title.outMakingAuthority')
            .d('移出异常做出决定机关'),
        },
      ],
    },

    {
      id: 15,
      title: intl.get('sdat.riskScanReport.view.title.chattelMortgage').d('经营风险-动产抵押'),
      url: '/mortgages',
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
      url: '/serious-illegal',
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
        {
          fieldName: 'stdOutDate',
          label: intl.get('sdat.riskScanReport.view.title.outTime').d('移出时间'),
        },
        {
          fieldName: 'stdOutReason',
          label: intl.get('sdat.riskScanReport.view.title.removalReason').d('移出原因'),
        },
        {
          fieldName: 'stdOutDepartment',
          label: intl
            .get('sdat.riskScanReport.view.title.outMakingAuthority')
            .d('移出异常做出决定机关'),
        },
      ],
    },

    {
      id: 14,
      title: intl.get('sdat.riskScanReport.view.title.bankruptcy').d('经营风险-破产公告'),
      url: '/bankruptcy-list',
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
      url: '/certificate',
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
      url: '/stock-pledge',
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
      id: 21,
      title: intl.get('sdat.riskScanReport.view.title.officialBlacklist').d('经营风险-官方黑名单'),
      url: '/external-blacklist',
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
      id: 17,
      title: intl.get('sdat.riskScanReport.view.title.badNews').d('经营风险-负面新闻'),
      url: '/negative-news',
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
        {
          fieldName: 'stdNegIndex',
          label: intl.get('sdat.riskScanReport.view.title.negativeIndex').d('负面指数'),
        },
        {
          fieldName: 'stdSentiment',
          label: intl.get('sdat.riskScanReport.view.title.emotionalAttributes').d('情感属性'),
        },
        {
          fieldName: 'stdSource',
          label: intl.get('sdat.riskScanReport.view.title.source').d('来源'),
        },
      ],
    },
  ];
}
