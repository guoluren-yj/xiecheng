import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 基本信息
const basicFormDS = () => ({
  paging: false,
  autoQuery: true,
  fields: [
    {
      name: 'rfTitle',
      label: intl.get('ssrc.rfCheck.model.rfCheck.rfTitle').d('征询书标题'),
      disabled: true,
    },
    {
      name: 'rfName',
      label: intl.get(`ssrc.rfCheck.model.rfCheck.sourceProjectName`).d('寻源项目名称'),
    },
    {
      name: 'rfNum1',
      label: intl.get(`ssrc.rfCheck.model.rfCheck.sourceProjectNum`).d('寻源项目编号'),
    },
    {
      name: 'adjustRemark',
      label: intl.get('ssrc.bidChange.model.bidChange.changeDocument').d('变更说明'),
    },
    {
      name: 'adjustAttachmentUuid',
      type: 'string',
    },
  ],
});

// 征询范围
const inquiryScopeDS = ({ adjustRecordId, customizeUnitCode }) => ({
  autoQuery: false,
  dataToJSON: 'all',
  primaryKey: 'rfLineSupplierAdjustId',
  selection: false,
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
      name: 'contactName',
      label: intl.get('ssrc.rfDetail.model.rfDetail.contact.person').d('联系人'),
    },
    {
      name: 'contactPhone',
      label: intl.get('ssrc.rfDetail.model.rfDetail.contact.way').d('联系方式'),
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'contactMail',
      label: intl.get(`ssrc.rf.model.rf.contactMail`).d('邮箱'),
    },
    {
      name: 'rfLineSupplier',
      type: 'object',
    },
    {
      name: 'adjustFields',
      type: 'object',
      defaultValue: [],
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/supplier/adjust/details`,
      method: 'GET',
      data: {
        organizationId,
        adjustRecordId,
        customizeUnitCode,
      },
    }),
  },
});

// 征询阶段
const consultationDS = () => ({
  autoQuery: false,
  paging: false,
  fields: [
    {
      name: 'adjustFields',
      type: 'object',
      defaultValue: [],
    },
    {
      name: 'rfConfRuleOriginalDTO',
      type: 'object',
    },
    {
      name: 'nowAdjustedField',
      type: 'string',
    },
    {
      label: intl
        .get('ssrc.inquiryHall.model.inquiryHall.reply.minQuotedSupplier')
        .d('最少回复供应商数'),
      name: 'minQuotedSupplier',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.clarifyEndDate`).d('澄清截止时间'),
      name: 'clarifyEndDate',
      type: 'dateTime',
      showFormat: 'dateTime',
      disabled: true,
    },
    // 评分模版
    {
      label: intl.get(`ssrc.rf.model.rf.templateLov`).d('参考评分模板'),
      name: 'scoreTemplateCode',
    },
    // 权重
    {
      name: 'technologyWeight',
      type: 'number',
    },
    {
      name: 'businessWeight',
      type: 'number',
    },
    // 标书规则
    {
      name: 'bidRuleType',
    },
    // 评分方式
    {
      name: 'scoreType',
    },
  ],
});

// 寻源小组
const sourcingTeamDS = ({ adjustRecordId, customizeUnitCode }) => ({
  autoQuery: false,
  primaryKey: 'rfMemberAdjustId',
  dataToJSON: 'all',
  selection: false,
  fields: [
    {
      name: 'adjustFields',
      type: 'object',
      defaultValue: [],
    },
    {
      name: 'loginName',
      label: intl.get(`ssrc.rf.model.rf.account`).d('账号'),
    },
    {
      name: 'contactName',
      label: intl.get(`ssrc.rf.model.rf.contactName`).d('名称'),
    },
    {
      name: 'contactPhone',
      label: intl.get(`ssrc.rf.model.rf.contactPhone`).d('手机'),
    },
    {
      name: 'internationalTelCode',
      // lookupCode: 'HPFM.IDD',
    },
    {
      name: 'contactMail',
      label: intl.get(`ssrc.rf.model.rf.contactMail`).d('邮箱'),
    },
    {
      name: 'publicContactFlag',
      label: (
        <Tooltip
          placement="right"
          title={intl
            .get('ssrc.rf.model.rf.contactPublicTip')
            .d('该列控制是否将联系方式显示在公告以及供应商查看界面')}
        >
          {intl.get('ssrc.rf.model.rf.publicContactFlag').d('公布联系方式')}
        </Tooltip>
      ),
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/member/adjust/details`,
      method: 'GET',
      data: {
        organizationId,
        adjustRecordId,
        customizeUnitCode,
      },
    }),
  },
});

// 专家组
const expertDS = ({ adjustRecordId, customizeUnitCode }) => ({
  autoQuery: false,
  // dataToJSON: 'all',
  primaryKey: 'rfExpertAdjustId',
  selection: false,
  fields: [
    {
      label: intl.get(`ssrc.rf.model.rf.expertSubAccount`).d('专家子账户'),
      name: 'loginName',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.expertName`).d('专家姓名'),
      name: 'expertName',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.expertRole`).d('职责'),
      name: 'expertRole',
      lookupCode: 'SSRC.EXPERT_DUTY',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.currentScoringType`).d('本次评分类别'),
      name: 'scoreCategory',
      lookupCode: 'SSRC.EXPERT_TEAM',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.expertType`).d('专家类型'),
      name: 'expertType',
      lookupCode: 'SSRC.EXPERT_TYPE',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.rfxPhone`).d('联系电话'),
      name: 'phone',
    },
    {
      name: 'internationalTelCode',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.rfxEmail`).d('电子邮箱'),
      name: 'email',
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/expert/adjust/details`,
      method: 'GET',
      data: {
        organizationId,
        adjustRecordId,
        customizeUnitCode,
      },
    }),
  },
});

// 评分要素
const scoreDS = ({ expertCategory, adjustRecordId, customizeUnitCode }) => {
  return {
    autoQuery: false,
    dataToJSON: 'all',
    primaryKey: 'rfIndicateAdjustId',
    idField: 'rfIndicateAdjustId',
    parentField: 'parentRfIndicateId',
    expandField: 'expand',
    paging: false,
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.rf.model.rf.indicateCode`).d('要素编码'),
        name: 'indicateCode',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.indicateName`).d('要素名称'),
        name: 'indicateName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateTypeMeaning`).d('要素类型'),
        name: 'indicateType',
        type: 'string',
        lookupCode: 'SSRC.INDICATE_TYPE',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.scoreRemark`).d('评分细则'),
        name: 'indicateRemark',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.weightPercent`).d('权重'),
        name: 'indicateWeight',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.minScore`).d('最低分'),
        name: 'minScore',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.maxScore`).d('最高分'),
        name: 'maxScore',
        type: 'number',
      },
      {
        name: 'expertDistribute',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/indicate/adjust/details`,
          method: 'GET',
          data: {
            adjustRecordId,
            scoreCategory: expertCategory,
            customizeUnitCode,
          },
        };
      },
    },
  };
};

// 专家分配
const expertModalDS = ({ customizeUnitCode }) => {
  return {
    primaryKey: 'indicAssginId',
    paging: false,
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.rf.model.rf.expertSubAccount`).d('专家子账户'),
        name: 'loginName',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.expertName`).d('专家姓名'),
        name: 'expertName',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.whetherAssign`).d('是否分配'),
        name: 'assignFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get('ssrc.rf.model.rf.expertWeight').d('专家权重'),
        name: 'expertWeight',
        type: 'number',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { rfHeaderAdjustId = null, rfIndicateAdjustId },
        } = dataSet;

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/expert-indic-assign/adjusts/${rfHeaderAdjustId}/expert-assign`,
          method: 'GET',
          data: {
            rfIndicateAdjustId,
            customizeUnitCode,
          },
        };
      },
    },
  };
};

// 附件
const attachmentDS = () => {
  return {
    dataToJSON: 'all',
    fields: [
      {
        name: 'businessAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rf-adjust',
        readOnly: true,
      },
      {
        name: 'techAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rf-adjust',
        readOnly: true,
      },
      {
        name: 'rfiAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.rf.view.message.upLoadChangeAttachment`).d('上传附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rf-adjust',
        readOnly: true,
      },
    ],
    transport: {},
  };
};

export {
  basicFormDS,
  inquiryScopeDS,
  consultationDS,
  sourcingTeamDS,
  expertDS,
  scoreDS,
  attachmentDS,
  expertModalDS,
};
