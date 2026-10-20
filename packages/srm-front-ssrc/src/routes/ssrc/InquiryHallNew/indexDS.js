import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PrefixV2, getQuotationName } from '@/utils/globalVariable';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';

import { getBatchOperationFlag } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

// 审批中load事件
const approvingLoad = async ({ dataSet }) => {
  const businessKeys = dataSet.reduce((pre, record) => {
    const key = record.get('businessKey');
    if (key) {
      pre.push(key);
    }
    return pre;
  }, []);
  // console.log('businessKeys', businessKeys);
  if (!isEmpty(businessKeys)) {
    // 查询审批按钮显示状态
    const simpleApprovalHistoryData = await queryBatchSimpleApprovalHistory(businessKeys);
    // 查询审批记录数据
    const approvaFlags = await queryBatchApprovaFlag(businessKeys);
    // 查询撤销按钮显示状态
    const operationFlags = await getBatchOperationFlag(businessKeys);
    dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
  }
};

const allTableDS = (config = {}) => {
  const quotationName = getQuotationName(config.bidFlag);
  return {
    primaryKey: 'rfxHeaderId',
    name: 'allTableDS',
    pageSize: config.pageSize || 5,
    dataToJSON: 'all',
    selection: false,
    fields: [
      // {
      //   name: 'status',
      //   type: 'object',
      //   label: intl.get('ssrc.inquiryHall.view.status').d('状态'),
      //   multiLine: true,
      //   ignore: 'always',
      // },
      {
        name: 'rfxStatusMeaning',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.view.status').d('状态'),
        // bind: 'status.rfxStatusMeaning',
      },
      {
        name: 'countDown',
        type: 'string',
        // bind: 'status.countDown',
      },
      // {
      //   name: 'operate',
      //   type: 'string',
      //   label: intl.get('ssrc.inquiryHall.view.message.button.operating').d('操作'),
      //   multiLine: true,
      //   ignore: 'always',
      // },
      {
        name: 'operat',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.view.message.button.operating').d('操作'),
        // bind: 'operate.operat',
      },
      {
        name: 'others',
        type: 'string',
        // bind: 'operate.others',
      },
      {
        name: 'rfxNum',
        type: 'string',
        // bind: 'rfxInfo.rfxNum',
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.commonRFXNo.', {
            categoryCode: config.bidFlag ? 'BID' : 'RFX',
          })
          .d('{categoryCode}单号'),
      },
      {
        name: 'rfxTitle',
        type: 'string',
        // bind: 'rfxInfo.rfxTitle',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.Title').d('标题'),
      },
      {
        name: 'templateName',
        type: 'string',
        // bind: 'rfxInfo.templateName',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingTemplate').d('寻源模板'),
      },
      {
        name: 'sourceProjectName',
        type: 'string',
        // bind: 'rfxInfo.sourceProjectName',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourceProject').d('寻源项目'),
      },
      {
        name: 'sectionName',
        type: 'string',
        // bind: 'rfxInfo.sectionName',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sectionName').d('标段名称'),
      },
      {
        name: 'sourceCategoryMeaning',
        type: 'string',
        // bind: 'rfxInfo.sourceCategoryMeaning',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingCategory').d('寻源类别'),
      },
      {
        name: 'secondarySourceCategoryMeaning',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingCategory').d('寻源类别'),
      },
      {
        name: 'sourceMethodMeaning',
        type: 'string',
        // bind: 'rfxInfo.sourceMethodMeaning',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingApproach').d('寻源方式'),
      },
      {
        name: 'offlineWholeFlagMeaning',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.offlineWholeFlagMeaning').d('采购方式'),
      },
      // {
      //   name: 'implementation',
      //   type: 'object',
      //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.implementation').d('执行情况'),
      // },
      {
        name: 'approvalMessage',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.approvalMessage').d('拒绝理由'),
      },
      {
        name: 'viewDetail',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.implementation').d('执行情况'),
      },
      {
        name: 'finishingRate',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.finishingRate`).d('完成度'),
      },
      // {
      //   name: 'time',
      //   type: 'object',
      //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.time').d('时间'),
      //   multiLine: true,
      //   ignore: 'always',
      // },
      {
        name: 'prequalEndDate',
        type: 'dateTime',
        // bind: 'time.prequalEndDate',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.applicationDeadTime').d('预审截止'),
      },
      {
        name: 'quotationStartDate',
        type: 'dateTime',
        // bind: 'time.quotationStartDate',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStartTime`, { quotationName })
          .d('{quotationName}开始'),
      },
      {
        name: 'quotationEndDate',
        type: 'dateTime',
        // bind: 'time.quotationEndDate',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDeadTime`, { quotationName })
          .d('{quotationName}截止'),
      },
      // {
      //   name: 'finishedTime',
      //   type: 'object',
      //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.time').d('时间'),
      //   multiLine: true,
      //   ignore: 'always',
      // },
      {
        name: 'checkFinishedDate',
        type: 'dateTime',
        // bind: 'finishedTime.checkFinishedDate',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.checkFinishedDate`).d('完成时间'),
      },
      {
        name: 'checkFinishedDate2',
        type: 'string',
        // bind: 'finishedTime.checkFinishedDate2',
      },
      {
        name: 'checkFinishedDate3',
        type: 'string',
        // bind: 'finishedTime.checkFinishedDate3',
      },
      // {
      //   name: 'organizationInfo',
      //   type: 'object',
      //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.organizationInfo').d('组织信息'),
      //   multiLine: true,
      //   ignore: 'always',
      // },
      {
        name: 'companyName',
        type: 'string',
        // bind: 'organizationInfo.companyName',
        label: intl.get('ssrc.common.company').d('公司'),
      },
      {
        name: 'purOrganizationName',
        type: 'string',
        // bind: 'organizationInfo.purOrganizationName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
      },
      // {
      //   name: 'quotationRules',
      //   type: 'object',
      //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.quotationRules').d('{quotationName}规则'),
      //   multiLine: true,
      //   ignore: 'always',
      // },
      {
        name: 'quotationTypeMeaning',
        type: 'string',
        // bind: 'quotationRules.quotationTypeMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式'),
      },
      {
        name: 'sealedQuotationFlag',
        type: 'number',
        // bind: 'quotationRules.sealedQuotationFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`).d('密封报价'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        // bind: 'quotationRules.currencyCode',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
      },
      {
        name: 'auctionDirectionMeaning',
        type: 'string',
        // bind: 'quotationRules.auctionDirectionMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingDirection`).d('报价方向'),
      },
      // {
      //   name: 'createInfo',
      //   type: 'object',
      //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.createInfo').d('创建信息'),
      //   multiLine: true,
      //   ignore: 'always',
      // },
      {
        name: 'creationDate',
        type: 'dateTime',
        // bind: 'createInfo.creationDate',
        label: intl.get(`ssrc.common.model.common.creationDateTime`).d('创建时间'),
      },
      {
        name: 'sourceCreationDate',
        type: 'dateTime',
        // bind: 'createInfo.creationDate',
        label: intl.get(`ssrc.common.model.common.documentCreationDate`).d('单据创建时间'),
      },
      {
        name: 'createdByName',
        type: 'string',
        // bind: 'createInfo.createdByName',
        label: intl.get(`ssrc.common.model.common.createdByName`).d('创建人'),
      },
      {
        name: 'createdUnitName',
        type: 'string',
        // bind: 'createInfo.createdUnitName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.createdUnitName`).d('创建人部门'),
      },
      // {
      //   name: 'description',
      //   type: 'object',
      //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.descriptions').d('说明'),
      //   multiLine: true,
      //   ignore: 'always',
      // },
      {
        name: 'descriptionObject',
        type: 'string',
        // bind: 'description.descriptionObject',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.descriptions').d('说明'),
      },
      {
        name: 'descriptionObject2',
        type: 'string',
        // bind: 'description.descriptionObject2',
      },
      {
        name: 'descriptionObject3',
        type: 'string',
        // bind: 'description.descriptionObject3',
      },
      // {
      //   name: 'suggestedSuppliers',
      //   type: 'object',
      //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.winBidSituation').d('中标情况'),
      //   multiLine: true,
      //   ignore: 'always',
      // },
      {
        name: 'viewSuggestedSuppliers',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.winBidSituation').d('中标情况'),
        // ignore: 'always',
      },
      {
        name: 'quotationFeedBack',
        type: 'string',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuoteResponse`, { quotationName })
          .d('{quotationName}响应'),
      },
      {
        name: 'adjustRecordFlag',
        type: 'number',
      },
      {
        name: 'brAcceptNoticeFlag',
        label: intl.get('ssrc.common.acceptNotice.brAcceptNoticeFlag').d('中标公告已发布'),
      },
      {
        name: 'brAcceptNoticeRuleFlag',
        label: intl.get('ssrc.common.acceptNotice.brAcceptNoticeRuleFlag').d('中标通知已发布'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { advancedData, ...others } = data;
        let url;
        switch (config.currentStatus) {
          case 'processing':
            url = `${PrefixV2}/${organizationId}/rfx/list/processing`;
            break;
          case 'approving':
            url = `${PrefixV2}/${organizationId}/rfx/list/approving`;
            break;
          case 'attention':
            url = `${PrefixV2}/${organizationId}/rfx/list/attention`;
            break;
          case 'toBeReleased':
            url = `${PrefixV2}/${organizationId}/rfx/list/unreleased`;
            break;
          case 'finished':
            url = `${PrefixV2}/${organizationId}/rfx/list/finished/success`;
            break;
          case 'finishOthers':
            url = `${PrefixV2}/${organizationId}/rfx/list/finished/others`;
            break;
          default:
            url = `${PrefixV2}/${organizationId}/rfx/list/all`;
            break;
        }
        return {
          url,
          method: 'GET',
          data: { ...others, ...data.advancedData },
        };
      },
    },
    events: {
      load: async (...args) => {
        // console.log('currentStatus', config.currentStatus);
        if (['approving', 'all', 'processing', 'attention'].includes(config.currentStatus)) {
          await approvingLoad(...args);
        }
      },
    },
  };
};

const SourcingTemplateDS = (record, selectedLength) => ({
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'templateIdLov',
      label: intl.get(`ssrc.inquiryHall.model.projectSetup.sourcingTemplate`).d('寻源模板'),
      required: true,
      type: 'object',
      lovCode: 'SSRC.TEMPLATE_NAME',
      valueField: 'templateId',
      lovPara: {
        sourceCategory: 'RFX',
        sourceMethod: 'INVITE',
      },
    },
    {
      name: 'templateId',
      bind: 'templateIdLov.templateId',
    },
    {
      name: 'mergeType',
      label: intl.get(`ssrc.inquiryHall.model.projectSetup.prequalMergeType`).d('资格预审合并方式'),
      type: 'string',
      lookupCode: 'SSRC_PREQUAL_MERGE_TYPE',
      dynamicProps: {
        required({ record: r, dataSet: { queryParameter } }) {
          const { subjectMatterRule } = queryParameter;
          return (
            subjectMatterRule === 'PACK' &&
            r.get('qualificationType') === 'PRE' &&
            selectedLength > 1
          );
        },
      },
    },
  ],
});

const quotationInfoDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierCompanyNum').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierCompanysName').d('供应商名称'),
    },
    {
      name: 'status',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.status').d('状态'),
    },
    {
      name: 'supBiddingStatusMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.status').d('状态'),
    },
    {
      name: 'attachmentFlag',
      type: 'number',
      label: intl
        .get('ssrc.inquiryHall.model.inquiryHall.whetherHeaderAttachmentUploaded')
        .d('是否上传头附件'),
    },
    {
      name: 'attachmentLineFlag',
      type: 'number',
      label: intl
        .get('ssrc.inquiryHall.model.inquiryHall.whetherLineAttachmentUploaded')
        .d('是否上传行附件'),
    },
    {
      name: 'quotedCount',
      type: 'number',
    },
    {
      name: 'feedbackStatus',
      type: 'string',
    },
    {
      name: 'feedbackStatusMeaning',
      type: 'string',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...others } = data;
      return {
        url: `${PrefixV2}/${organizationId}/rfx/feedback/quotation`,
        method: 'GET',
        data: { ...others, ...data.params },
      };
    },
  },
});

const submitInfoDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierCompanyNum').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierCompanysName').d('供应商名称'),
    },
    {
      name: 'displayPreSupplerStatusMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.status').d('状态'),
    },
    {
      name: 'attachmentFlag',
      type: 'number',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.attachement').d('附件'),
    },
    {
      name: 'quotedCount',
      type: 'number',
    },
    {
      name: 'feedbackStatus',
      type: 'string',
    },
    {
      name: 'feedbackStatusMeaning',
      type: 'string',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...others } = data;
      return {
        url: `${PrefixV2}/${organizationId}/rfx/feedback/prequal`,
        method: 'GET',
        data: { ...others, ...data.params },
      };
    },
  },
});

const scoreInfoDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'loginName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.subAccountCode').d('子账户编码'),
    },
    {
      name: 'expertName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.expertName').d('专家姓名'),
    },
    {
      name: 'scoredStatusMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.status').d('状态'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...others } = data;
      return {
        url: `${PrefixV2}/${organizationId}/rfx/feedback/experts`,
        method: 'GET',
        data: { ...others, ...data.params },
      };
    },
  },
});

const bidInfoDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierCompanyNum').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierCompanysName').d('供应商名称'),
    },
    {
      name: 'biddingAmount',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidAccount').d('中标金额'),
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedCurrencyCode`).d('中标币种'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...others } = data;
      return {
        url: `${PrefixV2}/${organizationId}/rfx/feedback/outbid`,
        method: 'GET',
        data: {
          ...others,
          ...data.params,
        },
      };
    },
  },
});

const rfTemplateDS = ({ sourceCategory }) => ({
  autoCreate: true,
  selection: 'single',
  fields: [
    {
      name: 'rfTemplateLov',
      type: 'object',
      lovCode: 'SSRC.RF_TEMPLATE',
      lovPara: {
        sourceCategory,
        latestFlag: 'Y',
      },
    },
    {
      name: 'templateId',
      bind: 'rfTemplateLov.templateId',
    },
  ],
});

const offlineWholeDS = (options = {}) => {
  const { secondarySourceCategory } = options || {};

  return {
    autoCreate: true,
    fields: [
      {
        name: 'sourceType',
        defaultValue: 'rfx',
        required: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
        name: 'templateLov',
        type: 'object',
        lovCode: 'SSRC.TEMPLATE_NAME',
        lovPara: {
          sourceCategory: 'RFX',
          secondarySourceCategory,
        },
        dynamicProps: {
          required({ record }) {
            const sourceType = record.get('sourceType');
            return sourceType === 'rfx';
          },
        },
      },
    ],
  };
};

export {
  allTableDS,
  quotationInfoDS,
  scoreInfoDS,
  bidInfoDS,
  submitInfoDS,
  rfTemplateDS,
  SourcingTemplateDS,
  offlineWholeDS,
};
