import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getDateTimeFormat, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import {
  getLadderFrom,
  getLadderTo,
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
} from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

// 发布准备

const createBasicFormDS = ({ rfHeaderId, sourceCategory }) => ({
  paging: false,
  fields: [
    // 基本信息
    {
      name: 'rfTitle',
      label: intl.get('ssrc.rfDetail.model.rfDetail.rfiTitle').d('征询书标题'),
    },
    {
      name: 'templateName',
      label: intl.get('ssrc.rfDetail.model.rfDetail.templateName').d('征询模板'),
    },
    {
      name: 'sourceProjectName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.sourceProject`).d('寻源项目'),
    },
    {
      name: 'progressNodes',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.progressNodes`).d('寻源节点'),
    },
    {
      name: 'rfRemark',
      label: intl.get('ssrc.rfDetail.model.rfDetail.rfRemark').d('备注'),
    },
    // 采购组织及人员
    {
      name: 'companyName',
      label: intl.get('ssrc.common.company').d('公司'),
    },
    {
      name: 'unitName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.unitName`).d('需求部门'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.purchOrgName`).d('采购组织名称'),
    },
    {
      name: 'purAgentName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.purchaseAgentName`).d('采购员'),
    },
    // 邀请范围
    {
      name: 'sourceMethod',
      label: intl.get('ssrc.rfDetail.model.rfDetail.sourceType').d('寻源方式'),
      lookupCode: 'SSRC.SOURCE_METHOD',
    },
    {
      name: 'allowSourceSupplierStages',
      label: intl
        .get('ssrc.rfDetail.model.rfDetail.allowSourceSupplierStages')
        .d('可参与寻源供应商阶段'),
    },
    // 附件
    {
      name: 'rfiAttachmentUuid',
      type: 'attachment',
    },
    {
      name: 'techAttachmentUuid',
      type: 'attachment',
    },
    {
      name: 'businessAttachmentUuid',
      type: 'attachment',
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.HEADER_INFO_${sourceCategory},SSRC.INQUIRY_HALL_RF_DETAIL.HEADER_ORG_${sourceCategory},SSRC.INQUIRY_HALL_RF_DETAIL.INVITE_RANGE_${sourceCategory},SSRC.INQUIRY_HALL_RF_DETAIL.CREATE_${sourceCategory}_ATTACHMENT`,
      },
    }),
  },
});

const sourceGroupDS = ({ rfHeaderId, sourceCategory }) => ({
  primaryKey: 'rfMemberId',
  selection: false,

  fields: [
    {
      name: 'loginName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.account`).d('账号'),
    },
    {
      name: 'contactName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.contactName`).d('名称'),
    },
    {
      name: 'contactPhone',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.contactPhone`).d('手机'),
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'contactMail',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.contactMail`).d('邮箱'),
    },
    {
      name: 'publicContactFlag',
      label: (
        <Tooltip
          placement="right"
          title={intl
            .get('ssrc.rfDetail.model.rfDetail.contactPublicTip')
            .d('该列控制是否将联系方式显示在公告以及供应商查看界面')}
        >
          {intl.get('ssrc.rfDetail.model.rfDetail.publicContactFlag').d('公布联系方式')}
        </Tooltip>
      ),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
  ],

  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/members`,
      method: 'GET',
      data: {
        rfHeaderId,
        customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.MEMBER_${sourceCategory}`,
      },
    }),
  },
});

const rfItemLineDS = ({ rfHeaderId, sourceCategory }) => ({
  primaryKey: 'rfLineItemId',
  selection: false,

  fields: [
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.lineNum`).d('行号'),
      name: 'rfLineItemNum',
    },
    {
      name: 'sectionCode',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sectionCode').d('标段编码'),
    },
    {
      name: 'sectionName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sectionName').d('标段名称'),
    },
    {
      name: 'ouName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.businessUnit`).d('业务实体'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.invOrganizationName`).d('库存组织'),
    },
    {
      name: 'itemCode',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.itemCode`).d('物料编码'),
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.itemName`).d('物料名称'),
      name: 'itemName',
    },
    {
      name: 'itemCategoryName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.itemCategory`).d('物料类别'),
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.quantity`).d('需求数量'),
      name: 'secondaryQuantity',
      type: 'number',
    },
    {
      name: 'secondaryUomName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.unit`).d('单位'),
    },
    {
      name: 'demandQuantity',
      type: 'number',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getQtyName(doubleUnitFlag);
        },
      },
    },
    {
      name: 'uomName',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getUomName(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.priceQuantity`).d('价格批量'),
      name: 'priceBatch',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.taxInclude`).d('是否含税'),
      name: 'taxIncludedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'taxRate',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.taxRate`).d('税率（%）'),
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.neededDate`).d('需求日期'),
      name: 'demandDate',
      type: 'date',
      format: 'YYYY-MM-DD',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.ladderInquiryFlag`).d('阶梯报价'),
      name: 'ladderOffer',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.prNum`).d('采购申请号'),
      name: 'prNum',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.prLineNum`).d('采购申请行号'),
      name: 'prDisplayLineNum',
    },
    {
      name: 'projectTaskName',
      label: intl.get('ssrc.common.model.common.projectTaskNme').d('项目任务名称'),
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.attachmentUuid`).d('附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      readOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rf-rfitem',
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/items`,
      method: 'GET',
      data: {
        rfHeaderId,
        customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.LINE_ITEM_${sourceCategory}`,
      },
    }),
  },
});

const ruleFormDS = ({ rfHeaderId, sourceCategory }) => ({
  paging: false,
  fields: [
    {
      name: 'expertScoreType',
      lookupCode: 'SSRC.EXPERT_SCORE_TYPE',
      label: (
        <Tooltip
          placement="right"
          title={intl
            .get('ssrc.rfDetail.model.rfDetail.scoreTip')
            .d(
              '勾选后，该方案邀请书在供应商回复后会进入专家评分环节，评分后会将分数显示在确定入围名单环节。'
            )}
        >
          {intl.get('ssrc.rfDetail.model.rfDetail.expertScoreType').d('专家评分')}
        </Tooltip>
      ),
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.startFlag`).d('发布即开始'),
      name: 'startFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'quotationRunningDuration',
      type: 'number',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.quotationRunningDuration`).d('报价运行时间'),
    },
    {
      label:
        sourceCategory === 'RFP'
          ? intl.get(`ssrc.rfDetail.model.rfDetail.answerStartTime`).d('回复开始时间')
          : intl.get(`ssrc.rfDetail.model.rfDetail.quotationStartTime`).d('征询开始时间'),
      name: 'quotationStartDate',
      type: 'dateTime',
      format: getDateTimeFormat(),
    },
    {
      label:
        sourceCategory === 'RFP'
          ? intl.get(`ssrc.rfDetail.model.rfDetail.answerDeadline`).d('回复截止时间')
          : intl.get(`ssrc.rfDetail.model.rfDetail.quotationDeadline`).d('征询截止时间'),
      name: 'quotationEndDate',
      type: 'dateTime',
      format: getDateTimeFormat(),
    },
    {
      label: intl.get(`ssrc.rf.model.rf.currency`).d('币种'),
      name: 'currencyCode',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.multiCurrency`).d('允许多币种报价'),
      name: 'multiCurrencyFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`ssrc.rf.model.rf.clarifyEndDate`).d('澄清截止时间'),
      name: 'clarifyEndDate',
      type: 'dateTime',
      format: getDateTimeFormat(),
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.bidRuleType`).d('标书规则'),
      lookupCode: 'SSRC.BID_RULE_TYPE',
      name: 'bidRuleType',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.openBidOrder`).d('评标步制'),
      lookupCode: 'SSRC.OPEN_BID_ORDER',
      name: 'openBidOrder',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.scoreType`).d('评分方式'),
      lookupCode: 'SSRC.TEMPLATE_SCORE_TYPE',
      name: 'scoreType',
    },
    {
      name: 'scoreTemplateCode',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.templateLov`).d('参考评分模板'),
    },
    // 权重
    {
      name: 'technologyWeight',
      type: 'number',
      step: 0.01,
      precision: 2,
    },
    {
      name: 'businessWeight',
      type: 'number',
      step: 0.01,
      precision: 2,
    },
    {
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.replyMethod`).d('回复方式'),
      lookupCode: 'SSRC.RF_REPLY_TYPE',
      name: 'replyType',
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/rule`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.CONF_RULE_NODE_${sourceCategory},SSRC.INQUIRY_HALL_RF_DETAIL.CONF_RULE_STAGE_${sourceCategory},SSRC.INQUIRY_HALL_RF_DETAIL.CONF_RULE_EXPERT_${sourceCategory},SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_CONFIG_${sourceCategory}`,
      },
    }),
  },
});

const supplierTableDS = ({ rfHeaderId, sourceCategory }) => ({
  primaryKey: 'rfLineSupplierId',
  selection: false,

  fields: [
    {
      name: 'supplierCompanyId',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.supplierCompanyNum`).d('供应商编码'),
      name: 'supplierCompanyNum',
    },
    {
      name: 'supplierTenantId',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.lifeCycle`).d('生命周期阶段'),
      name: 'stageDescription',
    },
    {
      name: 'contactName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.contacts`).d('联系人'),
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.contactPhone`).d('联系电话'),
      name: 'contactPhone',
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.email`).d('电子邮件'),
      name: 'contactMail',
      type: 'email',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/suppliers`,
        method: 'GET',
        data: {
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.LINE_SUPPLIER_${sourceCategory}`,
        },
      };
    },
  },
});

const noticeDS = ({ rfHeaderId, sourceCategory }) => {
  return {
    autoQuery: true,
    dataToJSON: 'all',
    paging: false,
    fields: [
      {
        label: intl.get('ssrc.rf.model.rf.noticeTitle').d('公告标题'),
        name: 'noticeTitle',
      },
      {
        name: 'noticeDays',
        label: intl.get('ssrc.rf.model.rf.noticeDays').d('公告天数'),
        type: 'number',
      },
      {
        name: 'noticeAttachmentUuid',
        label: intl.get(`ssrc.rf.model.rf.noticeAttachment`).d('公告附件'),
      },
      {
        name: 'noticePreview',
        label: intl.get('ssrc.rf.model.rf.noticePreview').d('公告预览'),
      },
    ],
    transport: {
      read: () => ({
        url: `${SRM_SSRC}/v1/${organizationId}/source-notices/${sourceCategory}/BR/${rfHeaderId}`,
        method: 'GET',
        data: {
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.NOTICES_${sourceCategory}`,
        },
      }),
    },
  };
};

/**
 * 阶梯报价DS
 * @param {*} checkNode 是否是核价节点的阶梯报价
 * @returns Json
 */
const ladderQuotationTableDS = (checkNode = false) => ({
  primaryKey: 'ladderInquiryId',
  selection: false,
  paging: false,
  fields: [
    {
      name: 'rfLadderLineNum',
      label: intl.get('ssrc.rfDetail.model.rfDetail.rfLadderLineNum').d('行号'),
    },
    {
      name: 'secondaryLadderFrom',
      type: 'number',
      min: 0,
      label: intl.get('ssrc.rfDetail.model.rfDetail.ladderFromRange').d('数量从（>=）'),
    },
    {
      name: 'secondaryLadderTo',
      type: 'number',
      min: 0,
      label: intl.get('ssrc.rfDetail.model.rfDetail.ladderToRange').d('数量至(<)'),
    },
    {
      name: 'ladderFrom',
      type: 'number',
      min: 0,
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return `${getLadderFrom(doubleUnitFlag)}(>=)`;
        },
      },
    },
    {
      name: 'ladderTo',
      type: 'number',
      min: 0,
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return `${getLadderTo(doubleUnitFlag)} (<)`;
        },
      },
    },
    {
      name: 'validLadderSecondaryPrice',
      type: 'number',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
    },
    {
      name: 'validNetLadderSecPrice',
      type: 'number',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
    },
    {
      name: 'validLadderPrice',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => getPriceName(dataSet.getState('doubleUnitFlag')),
      },
    },
    {
      name: 'validNetLadderPrice',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => getNetPriceName(dataSet.getState('doubleUnitFlag')),
      },
    },
    {
      name: 'ladderRemark',
      label: intl.get('ssrc.rfDetail.model.rfDetail.remark').d('备注'),
    },
    {
      name: 'remark',
      label: intl.get('ssrc.rfDetail.model.rfDetail.remark').d('备注'),
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { rfLineItemId, quotationLineId },
      } = dataSet;
      return {
        url: checkNode
          ? `${SRM_SSRC}/v1/${organizationId}/rf-ladder-quotations/${quotationLineId}`
          : `${SRM_SSRC}/v1/${organizationId}/rf/${rfLineItemId}/ladder-inquiry`,
        method: 'GET',
      };
    },
  },
});

const rfFormDS = ({ rfHeaderId, sourceCategory }) => ({
  paging: false,
  fields: [
    {
      name: 'rfContent',
      label: intl.get('ssrc.rfDetail.model.rfDetail.rfContent').d('内容'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/form`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.FORM_${
          sourceCategory === 'RFP' ? 'FRP' : 'RFI'
        }`,
      },
    },
  },
});

// 专家
const expertTableDS = ({ rfHeaderId, sourceCategory }) => {
  return {
    primaryKey: 'rfExpertId',
    paging: false,
    selection: false,
    fields: [
      {
        name: 'loginName',
        label: intl.get(`ssrc.rfDetail.model.rfDetail.expertSubAccount`).d('专家子账户'),
      },
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.expertName`).d('专家姓名'),
        name: 'expertName',
      },
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.expertRole`).d('职责'),
        name: 'expertRole',
        lookupCode: 'SSRC.EXPERT_DUTY',
      },
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.currentScoringType`).d('本次评分类别'),
        name: 'scoreCategory',
        lookupCode: 'SSRC.EXPERT_TEAM',
      },
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.expertType`).d('专家类型'),
        name: 'expertType',
        lookupCode: 'SSRC.EXPERT_TYPE',
      },
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.rfxPhone`).d('联系电话'),
        name: 'phone',
      },
      {
        name: 'internationalTelCode',
        lookupCode: 'HPFM.IDD',
      },
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.rfxEmail`).d('电子邮箱'),
        name: 'email',
      },
    ],
    transport: {
      read: () => ({
        url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/experts`,
        method: 'GET',
        data: {
          customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_EXPERTS_${sourceCategory}`,
        },
      }),
      destroy: () => {
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/experts`,
          method: 'DELETE',
        };
      },
      submit: ({ data }) => ({
        url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/experts`,
        method: 'POST',
        data,
      }),
    },
  };
};

const scoringElementDS = ({ expertCategory, rfHeaderId, customizeUnitCode }) => {
  return {
    primaryKey: 'rfIndicateId',
    idField: 'rfIndicateId',
    parentField: 'parentRfIndicateId',
    expandField: 'expand',
    selection: false,
    paging: false,
    fields: [
      {
        name: 'indicateCode',
        label: intl.get(`ssrc.rfDetail.model.rfDetail.indicateCode`).d('要素编码'),
      },
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.indicateName`).d('要素名称'),
        name: 'indicateName',
        maxLength: 200,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateTypeMeaning`).d('要素类型'),
        name: 'indicateTypeMeaning',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.scoreRemark`).d('评分细则'),
        name: 'indicateRemark',
        maxLength: 1000,
      },
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.weightPercent`).d('权重(%)'),
        name: 'indicateWeight',
        type: 'number',
        max: 100,
        min: 0,
        step: 0.01,
        precision: 2,
      },
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.minScore`).d('最低分'),
        name: 'minScore',
        type: 'number',
        min: 0,
        step: 0.01,
      },
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.maxScore`).d('最高分'),
        name: 'maxScore',
        type: 'number',
        // max: 100,
        min: 'minScore',
        step: 0.01,
      },
      {
        label: intl.get('ssrc.rfDetail.model.rfDetail.assignedExperts').d('已分配专家'),
        name: 'assignedExperts',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/indicates`,
          method: 'GET',
          data: {
            scoreCategory: expertCategory,
            customizeUnitCode,
          },
        };
      },
    },
  };
};

const expertModalDS = ({ rfHeaderId, sourceCategory }) => {
  return {
    primaryKey: 'indicAssginId',
    paging: false,
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.expertSubAccount`).d('专家子账户'),
        name: 'loginName',
      },
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.expertName`).d('专家姓名'),
        name: 'expertName',
      },
      {
        label: intl.get(`ssrc.rfDetail.model.rfDetail.whetherAssign`).d('是否分配'),
        name: 'assignFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get('ssrc.rfDetail.model.rfDetail.expertWeight').d('专家权重'),
        name: 'expertWeight',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { rfIndicateId = null },
        } = dataSet;

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/expert-assign`,
          method: 'GET',
          data: {
            rfIndicateId,
            customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_ASSIGN_${sourceCategory}`,
          },
        };
      },
    },
  };
};

// 核价

const checkPendingBasicFormDS = ({ rfHeaderId, sourceCategory }) => ({
  paging: false,
  fields: [
    // 基本信息
    {
      name: 'rfTitle',
      label: intl.get('ssrc.rfDetail.model.rfDetail.rfiTitle').d('征询书标题'),
    },
    {
      name: 'templateName',
      label: intl.get('ssrc.rfDetail.model.rfDetail.templateName').d('征询模板'),
    },
    {
      name: 'sourceProjectName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.sourceProjectName`).d('寻源项目名称'),
    },
    {
      name: 'sourceProjectNum',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.sourceProjectNum`).d('寻源项目编号'),
    },
    {
      name: 'rfRemark',
      label: intl.get('ssrc.rfDetail.model.rfDetail.rfRemark').d('备注'),
    },
    // 附件
    {
      name: 'checkAttachmentUuid',
      type: 'attachment',
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/check/${rfHeaderId}`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.CHECK_RF_INFO_${sourceCategory},SSRC.INQUIRY_HALL_RF_DETAIL.${sourceCategory}_ATTACHMENT`,
      },
    }),
  },
});

const supplierDS = ({ rfHeaderId, sourceCategory }) => ({
  primaryKey: 'rfLineSupplierId',
  selection: false,
  fields: [
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.supplierNum`).d('供应商编码'),
      name: 'supplierCompanyNum',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.quotationContent`).d('供应商备注'),
      name: 'quotationContent',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.viewAttachmentUuid`).d('查看附件'),
      name: 'supplierAttach',
      type: 'attachment',
      readOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfi-rfiheader',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.suggestedFlag`).d('是否选择'),
      name: 'suggestedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.suggestedRemark`).d('选择理由'),
      name: 'suggestedRemark',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.uploadAttachmentUuid`).d('查看附件'),
      name: 'suggestedAttachmentUuid',
      type: 'attachment',
      readOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rf-rfitem',
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'suggestedFlag' && !value) {
        if (record.get('suggestedRemark')) {
          record.set('suggestedRemark', null);
        }
      }
    },
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/check/${rfHeaderId}/supplier`,
        method: 'GET',
        data: {
          customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.CHECK_SUPPLIER_QUO_${sourceCategory}`,
        },
      };
    },
  },
});

// 征询中
// 基本信息
const consultBasicFormDS = ({ rfHeaderId, sourceCategory }) => ({
  autoQuery: false,
  paging: false,
  fields: [
    {
      name: 'rfTitle',
      label: intl.get('ssrc.rfCheck.model.rfCheck.rfTitle').d('征询书标题'),
    },
    {
      name: 'templateName',
      label: intl.get('ssrc.rfDetail.model.rfDetail.templateName').d('征询模板'),
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
      name: 'rfRemark',
      label: intl.get('ssrc.rfCheck.model.rfCheck.rfRemark').d('备注'),
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.QUOTATION_RF_INFO_${sourceCategory}`,
      },
    }),
  },
});

// 供应商响应情况
const supplierResponseDS = ({ rfHeaderId, sourceCategory }) => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.quotationNum`).d('供应商编码'),
      name: 'supplierCompanyNum',
    },
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      name: 'feedbackStatusMeaning',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.isParticipate`).d('是否参与'),
    },
    {
      name: 'quotationStatusMeaning',
      label: intl.get('ssrc.rfDetail.model.rfDetail.isReply').d('是否回复'),
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rf.supplier.attachmentUuid`).d('供应商附件'),
      name: 'supplierAttach',
      type: 'attachment',
    },
    {
      name: 'contactName',
      label: intl.get('ssrc.rfDetail.model.rfDetail.contact.person').d('联系人'),
    },
    {
      name: 'contactPhone',
      label: intl.get('ssrc.rfDetail.model.rfDetail.contact.phone').d('联系电话'),
    },
    {
      name: 'contactMail',
      label: intl.get('ssrc.rfDetail.model.rfDetail.email').d('电子邮箱'),
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/quotation/detail`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.QUOTATION_SUPPLIER_${sourceCategory}`,
      },
    }),
  },
});

const ItemLineDetailDS = ({ rfHeaderId, customizeUnitCode }) => ({
  // primaryKey: 'rfLineItemId',
  selection: false,

  fields: [
    {
      name: 'sectionCode',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sectionCode').d('标段编码'),
    },
    {
      name: 'sectionName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sectionName').d('标段名称'),
    },
    {
      name: 'itemCode',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.itemCode`).d('物料编码'),
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.itemName`).d('物料名称'),
      name: 'itemName',
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.code`).d('供应商编码'),
    },
    {
      label: intl.get(`ssrc.common.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.unitPriceTax`).d('单价(含税)'),
      name: 'validQuotationSecPrice',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
      name: 'validNetSecondaryPrice',
      type: 'number',
    },
    {
      name: 'validQuotationPrice',
      type: 'number',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getPriceName(doubleUnitFlag);
        },
      },
    },
    {
      name: 'validNetPrice',
      type: 'number',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getNetPriceName(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.taxInclude`).d('是否含税'),
      name: 'taxIncludedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'currencyCode',
      label: intl.get(`ssrc.rf.model.rf.currencyCode`).d('币种'),
    },
    {
      name: 'exchangeRate',
      label: intl.get(`ssrc.rf.model.rf.exchangeRate`).d('汇率'),
      type: 'number',
    },
    {
      name: 'taxRate',
      label: intl.get(`ssrc.rf.model.rf.taxRate`).d('税率（%）'),
      align: 'right',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.suppleirQuantity`).d('可供数量'),
      name: 'validQuotationSecQuantity',
      align: 'right',
      type: 'number',
    },
    {
      name: 'validQuotationQuantity',
      type: 'number',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getAvailableQtyName(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.ladderInquiryFlag`).d('阶梯报价'),
      name: 'ladderOffer',
    },
    {
      label: intl.get(`ssrc.bidHall.model.bidHall.lineAmount`).d('行金额'),
      type: 'number',
      name: 'totalAmount',
    },
    {
      label: intl.get(`ssrc.bidHall.model.bidHall.netAmount`).d('行金额(不含税)'),
      type: 'number',
      name: 'netAmount',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.unit`).d('单位'),
      name: 'secondaryUomName',
    },
    {
      name: 'uomName',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getUomName(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.itemCategory`).d('物料类别'),
      name: 'itemCategoryName',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.quantity`).d('需求数量'),
      name: 'secondaryQuantity',
      type: 'number',
    },
    {
      name: 'demandQuantity',
      type: 'number',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getQtyName(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.priceQuantity`).d('价格批量'),
      name: 'priceBatchQuantity',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: 99999999999999,
    },
    {
      label: intl.get(`ssrc.rf.model.rf.neededDate`).d('需求日期'),
      name: 'demandDate',
      type: 'date',
      format: 'YYYY-MM-DD',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.purchaserAttachmentUuid`).d('采购方附件'),
      name: 'purchaseAttachmentUuid',
      type: 'attachment',
      readOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rf-rfitem',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rf.supplier.attachmentUuid`).d('供应商附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      readOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rf-rfitem',
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/quotation/${rfHeaderId}/check/lines`,
      method: 'GET',
      data: {
        customizeUnitCode,
      },
    }),
  },
});

// 评分
const scoreBasicFormDS = ({ rfHeaderId, sourceCategory }) => ({
  paging: false,
  fields: [
    // 基本信息
    {
      name: 'rfTitle',
      label: intl.get('ssrc.rfDetail.model.rfDetail.rfiTitle').d('征询书标题'),
    },
    {
      name: 'sourceProjectName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.sourceProjectName`).d('寻源项目名称'),
    },
    {
      name: 'sourceProjectNum',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.sourceProjectNum`).d('寻源项目编号'),
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.bidRuleType`).d('标书规则'),
      lookupCode: 'SSRC.BID_RULE_TYPE',
      name: 'bidRuleType',
      defaultValue: 'NONE',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.openBidOrder`).d('评标步制'),
      lookupCode: 'SSRC.OPEN_BID_ORDER',
      name: 'openBidOrder',
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/info`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_HEADER_INFO_${sourceCategory}`,
      },
    }),
  },
});

const scoreResultDS = ({ rfHeaderId }) => ({
  primaryKey: 'supplierCompanyId',
  paging: false,
  selection: false,
  fields: [
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.supplierCompanyNum`).d('供应商编码'),
      name: 'supplierCompanyNum',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      name: 'candidateFlag',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.candidateFlag`).d('推荐'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.candidateSuggestion`).d('推荐意见'),
      name: 'candidateSuggestion',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.score`).d('总分'),
      name: 'score',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.invalidFlag`).d('无效回复'),
      name: 'invalidFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.invalidReason`).d('无效报价原因'),
      name: 'invalidReason',
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/score-detail`,
      method: 'GET',
    }),
  },
});

const scoreDetailDS = () => ({
  primaryKey: 'evaluateIndicId',
  idField: 'evaluateIndicId',
  parentField: 'parentIndicateId',
  expandField: 'expand',
  paging: false,
  selection: false,
  fields: [
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.indicateName`).d('要素细项'),
      name: 'indicateName',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.scoringInterval`).d('评分区间'),
      name: 'scoringInterval',
    },
    {
      name: 'indicScore',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.indicScore`).d('得分'),
    },
    {
      label: <>{intl.get(`ssrc.rfDetail.model.rfDetail.weight`).d('权重')}%</>,
      name: 'weight',
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/${data.evaluateScoreId}/expert-detail`,
      method: 'GET',
    }),
  },
});

const scoringInfoDS = ({ sourceCategory }) => ({
  paging: false,
  fields: [
    {
      label: intl.get(`ssrc.expertScoring.model.expertScoring.Invalid`).d('是否无效'),
      name: 'suggestInvalidFlag',
    },
    {
      label: intl.get(`ssrc.expertScoring.model.expertScoring.expertSuggestion`).d('评审意见'),
      name: 'expertSuggestion',
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get(`ssrc.expertScoring.model.expertScoring.expertAttachment`).d('评审附件'),
    },
  ],
  transport: {
    read: ({ data: { queryParams = {} } }) => {
      const { quotationHeaderId, evaluateScoreIds, supplierId } = queryParams;
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/evaluate-scores/${quotationHeaderId}/${sourceCategory}/header`,
        method: 'GET',
        params: {
          evaluateScoreIds,
          supplierId,
          customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_DETAIL_HEADER_${sourceCategory}`,
        },
      };
    },
  },
});

export {
  createBasicFormDS,
  sourceGroupDS,
  rfItemLineDS,
  ruleFormDS,
  supplierTableDS,
  noticeDS,
  ladderQuotationTableDS,
  rfFormDS,
  expertTableDS,
  scoringElementDS,
  expertModalDS,
  checkPendingBasicFormDS,
  supplierDS,
  consultBasicFormDS,
  supplierResponseDS,
  ItemLineDetailDS,
  scoreBasicFormDS,
  scoreResultDS,
  scoreDetailDS,
  scoringInfoDS,
};
