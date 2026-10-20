import intl from 'utils/intl';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

// 头信息卡片字段
const headerAFCardFields = () => [
  {
    name: 'clarifyTitleAndNum',
  },
  {
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.createdBy`).d('创建人'),
    name: 'submittedByUserName',
  },
  {
    label: intl.get(`hzero.common.creationDate`).d('创建时间'),
    name: 'submittedDate',
  },
  {
    // 澄清函来源
    name: 'sourceCategoryMeaning',
  },
];

// 基础信息字段
const clarifyInfoFields = () => [
  {
    label: intl.get(`ssrc.clarify.model.clarify.title`).d('标题'),
    name: 'title',
  },
  {
    label: intl.get('ssrc.clarify.model.clarify.clarifyNum').d('澄清单号'),
    name: 'clarifyNum',
  },
  {
    label: intl.get('ssrc.clarify.model.clarify.sourceNum').d('寻源单号'),
    name: 'sourceNum',
  },
  {
    label: intl.get('ssrc.common.company').d('公司'),
    name: 'companyName',
  },
  {
    label: intl.get(`ssrc.clarify.model.clarify.context`).d('澄清函文件'),
    name: 'attachmentUuid',
    bucketName: PRIVATE_BUCKET,
  },
];

// 澄清函正文字段
const clarifyContentFields = () => [
  {
    name: 'context',
  },
];

// 头信息ds
const headerDS = (payload) => {
  const { clarifyId, customizeUnitCode } = payload;
  return {
    fields: [...headerAFCardFields(), ...clarifyInfoFields(), ...clarifyContentFields()],
    transport: {
      read({ dataSet }) {
        const {
          queryParameter: { templateInfo = {} },
        } = dataSet || {};
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/clarify/${clarifyId}`,
          method: 'GET',
          data: {
            customizeUnitCode,
            ...(templateInfo || {}),
          },
        };
      },
    },
  };
};

// 澄清函关联问题表格ds
const relatedQuestionDS = (payload) => {
  const { clarifyId, customizeUnitCode } = payload || {};
  return {
    primaryKey: 'issueLineId',
    selection: false,
    fields: [
      {
        label: intl.get('ssrc.clarify.view.clarification.clarificationNo').d('澄清类型'),
        name: 'clarifyTypeMeaning',
      },
      {
        label: intl.get('ssrc.clarify.view.clarification.clarificationTitle').d('问题描述'),
        name: 'description',
      },
      {
        label: intl.get('ssrc.clarify.view.clarification.clarificationCompany').d('问题编号'),
        name: 'issueFinalNum',
      },
      {
        label: intl.get('ssrc.clarify.view.clarification.clarificationPublishDate').d('提交时间'),
        name: 'submittedDate',
      },
      {
        label: intl.get('ssrc.clarify.view.clarification.submittedByUserName').d('提交人'),
        name: 'submittedByUserName',
      },
      {
        label: intl.get('ssrc.clarify.view.clarification.clarificationPublisher').d('供应商'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('ssrc.clarify.view.clarification.problemAnnex').d('问题附件'),
        name: 'attachmentUuid',
        bucketName: PRIVATE_BUCKET,
        type: 'attachment',
        readOnly: true,
      },
    ],
    transport: {
      read({ dataSet }) {
        const {
          queryParameter: { templateInfo = {}, sourceId, sourceType },
        } = dataSet || {};
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/clarify/refer-issue`,
          method: 'GET',
          data: {
            clarifyId,
            sourceId,
            sourceType,
            customizeUnitCode,
            ...(templateInfo || {}),
          },
        };
      },
    },
  };
};

export { headerDS, relatedQuestionDS };
