/*
 * @Descripttion: 寻源过程审批--DS
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-26 15:27:16
 * @LastEditors: yiping.liu
 */
import intl from 'utils/intl';

// 基本信息
const basicFormDS = () => ({
  autoQuery: false,
  paging: false,
  fields: [
    {
      name: 'rfTitle',
      label: intl.get('ssrc.rfCheck.model.rfCheck.rfTitle').d('征询书标题'),
    },
    {
      name: 'sourceProjectName',
      label: intl.get(`ssrc.rfCheck.model.rfCheck.sourceProjectName`).d('寻源项目名称'),
    },
    {
      name: 'sourceProjectNum',
      label: intl.get(`ssrc.rfCheck.model.rfCheck.sourceProjectNum`).d('寻源项目编号'),
    },
    {
      name: 'closeReason',
      label: intl.get('ssrc.rfApprove.model.rfApprove.close.reason').d('关闭原因'),
    },
    {
      name: 'adjustAttachmentUuid',
      type: 'string',
    },
  ],
  // transport: {
  //   read: () => ({
  //     url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}`,
  //     method: 'GET',
  //     data: {
  //       customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.QUOTATION_RF_INFO_${sourceCategory}`,
  //     },
  //   }),
  // },
});

// 征询范围
const inquiryScopeDS = () => ({
  autoQuery: false,
  fields: [
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.quotationNum`).d('供应商编码'),
      name: 'supplierCompanyNum',
    },
    {
      name: 'supplierCompanyId',
    },
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.stageDescription`).d('生命周期阶段'),
      name: 'stageDescription',
    },
    {
      name: 'contactNameLov',
      label: intl.get('ssrc.rfDetail.model.rfDetail.contact.person').d('联系人'),
      type: 'string',
    },
    {
      name: 'supplierContactId',
      bind: 'contactNameLov.supplierContactId',
    },
    {
      name: 'contactName',
      bind: 'contactNameLov.contactName',
    },
    {
      name: 'contactPhone',
      label: intl.get('ssrc.rfDetail.model.rfDetail.contact.way').d('联系方式'),
    },
    {
      name: 'contactMail',
      label: intl.get(`ssrc.rf.model.rf.contactMail`).d('邮箱'),
      type: 'email',
    },
  ],
});

// 征询阶段
const consultationDS = () => ({
  // autoQuery: false,
  // paging: false,
  autoCreate: true,
  fields: [
    {
      name: 'adjustFields',
      type: 'object',
      defaultValue: [],
    },
    {
      name: 'startDate',
      label: intl.get('ssrc.rfController.model.consultation.start').d('征询开始时间'),
      type: 'dateTime',
    },
    {
      name: 'endDate',
      label: intl.get('ssrc.rfController.model.consultation.end').d('征询结束时间'),
      type: 'dateTime',
    },
  ],
});

// 采购员
const buyerDS = () => ({
  paging: false,
  autoQuery: false,
  fields: [
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员'),
      name: 'purchaseAgentId',
    },
  ],
});

// 寻源小组
const sourcingTeamDS = () => ({
  autoQuery: false,
  fields: [
    {
      label: intl.get(`ssrc.rf.model.rf.account`).d('账号'),
      name: 'account',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.contactName`).d('名称'),
      name: 'contactName',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.contactMail`).d('邮箱'),
      name: 'contactMail',
    },
    {
      label: intl.get(`ssrc.rfController.model.rfController.phone`).d('手机号'),
      name: 'phone',
    },
    {
      label: intl.get('ssrc.rf.model.rf.publicContactFlag').d('公布联系方式'),
      name: 'publicContactFlag',
    },
  ],
});

// 专家组
const expertDS = () => ({
  fields: [
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertSubAccount`).d('专家子账户'),
      name: 'expert',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertName`).d('专家姓名'),
      name: 'expertName',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.duty`).d('职责'),
      name: 'evaluateLeaderFlag',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currentScoringType`).d('本次评分类别'),
      name: 'team',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertType`).d('专家类型'),
      name: 'expertTypeMeaning',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxPhone`).d('联系电话'),
      name: 'phone',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxEmail`).d('电子邮箱'),
      name: 'email',
    },
  ],
});

// 评分要素
const scoreDS = () => ({
  fields: [
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateCode`).d('要素编码'),
      name: 'indicateLov',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateName`).d('要素名称'),
      name: 'indicateName',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPercent`).d('权重'),
      name: 'weight',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minScore`).d('最低分'),
      name: 'minScore',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxScore`).d('最高分'),
      name: 'maxScore',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.score.elements`).d('评分要素细项'),
      name: 'scoreElements',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreRemark`).d('评分细则'),
      name: 'indicateRemark',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertAllocation`).d('专家分配'),
      name: 'expertDistribute',
      type: 'string',
    },
  ],
});

export { basicFormDS, inquiryScopeDS, consultationDS, buyerDS, sourcingTeamDS, expertDS, scoreDS };
