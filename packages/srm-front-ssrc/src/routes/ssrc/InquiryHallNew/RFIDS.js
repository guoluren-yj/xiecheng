import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';

import { getBatchOperationFlag } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

// 审批中load事件
const approvingLoad = async ({ dataSet }) => {
  const businessKeys = dataSet.reduce((pre, record) => {
    const key = record.get('businessKey');
    if(key) {
      pre.push(key);
    }
    return pre;
  }, []);
  if(!isEmpty(businessKeys)){
    // 查询审批按钮显示状态
    const simpleApprovalHistoryData = await queryBatchSimpleApprovalHistory(businessKeys);
    // 查询审批记录数据
    const approvaFlags = await queryBatchApprovaFlag(businessKeys);
    // 查询撤销按钮显示状态
    const operationFlags = await getBatchOperationFlag(businessKeys);
    dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
  };
};


const TableDS = (config = {}) => ({
  primaryKey: 'rfxHeaderId',
  name: 'allTableDS',
  dataToJSON: 'all',
  selection: false,
  pageSize: config.pageSize || 10,
  fields: [
    // {
    //   name: 'status',
    //   type: 'object',
    //   label: intl.get('ssrc.inquiryHall.view.status').d('状态'),
    //   multiLine: true,
    //   ignore: 'always',
    // },
    {
      name: 'displayRfStatusMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.view.status').d('状态'),
      // bind: 'status.displayRfStatusMeaning',
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
      name: 'rfNum',
      type: 'string',
      // bind: 'rfInfo.rfNum',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.${config.sourceCategory}No.`)
        .d(`${config.sourceCategory}单号`),
    },
    {
      name: 'rfTitle',
      type: 'string',
      // bind: 'rfInfo.rfTitle',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.Title').d('标题'),
    },
    // {
    //   name: 'templateName',
    //   type: 'string',
    //   bind: 'rfxInfo.templateName',
    //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingTemplate').d('寻源模板'),
    // },
    // {
    //   name: 'sourceProjectName',
    //   type: 'string',
    //   bind: 'rfxInfo.sourceProjectName',
    //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourceProject').d('寻源项目'),
    // },
    // {
    //   name: 'sectionName',
    //   type: 'string',
    //   bind: 'rfxInfo.sectionName',
    //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.sectionName').d('标段名称'),
    // },
    {
      name: 'sourceProjectName',
      type: 'string',
      // bind: 'rfInfo.sourceCategoryMeaning',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.source.projectName').d('寻源项目'),
    },
    {
      name: 'sourceMethodMeaning',
      type: 'string',
      // bind: 'rfInfo.sourceMethodMeaning',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingApproach').d('寻源方式'),
    },
    {
      name: 'implementation',
      type: 'object',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.implementation').d('执行情况'),
      // multiLine: true,
      ignore: 'always',
    },
    {
      name: 'rejectMessage',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.approvalMessage').d('拒绝理由'),
    },
    // {
    //   name: 'time',
    //   type: 'object',
    //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.time').d('时间'),
    //   multiLine: true,
    //   ignore: 'always',
    // },
    // {
    //   name: 'prequalEndDate',
    //   type: 'string',
    //   bind: 'time.prequalEndDate',
    //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.applicationDeadTime').d('预审截止'),
    // },
    {
      name: 'quotationStartDate',
      type: 'string',
      // bind: 'time.quotationStartDate',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.RFIquotationStartTimes`).d('征询开始'),
    },
    {
      name: 'quotationEndDate',
      type: 'string',
      // bind: 'time.quotationEndDate',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.RFIquotationDeadTimes`).d('征询截止'),
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
    //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.quotationRules').d('报价规则'),
    //   multiLine: true,
    //   ignore: 'always',
    // },
    // {
    //   name: 'quotationTypeMeaning',
    //   type: 'string',
    //   bind: 'quotationRules.quotationTypeMeaning',
    //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式'),
    // },
    // {
    //   name: 'sealedQuotationFlag',
    //   type: 'number',
    //   bind: 'quotationRules.sealedQuotationFlag',
    //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`).d('密封报价'),
    // },
    // {
    //   name: 'currencyCode',
    //   type: 'string',
    //   bind: 'quotationRules.currencyCode',
    //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
    // },
    // {
    //   name: 'auctionDirectionMeaning',
    //   type: 'string',
    //   bind: 'quotationRules.auctionDirectionMeaning',
    //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingDirection`).d('报价方向'),
    // },
    // {
    //   name: 'createInfo',
    //   type: 'object',
    //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.createInfo').d('创建信息'),
    //   multiLine: true,
    //   ignore: 'always',
    // },
    {
      name: 'creationDate',
      type: 'string',
      // bind: 'createInfo.creationDate',
      label: intl.get(`ssrc.common.model.common.creationDateTime`).d('创建时间'),
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
    // {
    //   name: 'descriptionObject',
    //   type: 'string',
    //   bind: 'description.descriptionObject',
    // },
    // {
    //   name: 'descriptionObject2',
    //   type: 'string',
    //   bind: 'description.descriptionObject2',
    // },
    // {
    //   name: 'descriptionObject3',
    //   type: 'string',
    //   bind: 'description.descriptionObject3',
    // },
    // {
    //   name: 'suggestedSuppliers',
    //   type: 'object',
    //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.winBidSituation').d('中标情况'),
    //   multiLine: true,
    //   ignore: 'always',
    // },
    // {
    //   name: 'viewSuggestedSuppliers',
    //   type: 'string',
    //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.winBidSituation').d('中标情况'),
    //   ignore: 'always',
    // },
    // {
    //   name: 'supplierCompanyName',
    //   type: 'string',
    //   bind: 'suggestedSuppliers.supplierCompanyName',
    //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
    // },
    // {
    //   name: 'budgetAmount',
    //   type: 'string',
    //   bind: 'suggestedSuppliers.budgetAmount',
    // },
    {
      name: 'adjustRecordFlag',
      type: 'number',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, advancedData, ...others } = data;
      const url = `${Prefix}/${organizationId}/rf/list/${config.tab}`;
      return {
        url,
        method: 'GET',
        data: {
          ...others,
          ...advancedData,
          ...params,
          sourceCategory: config.sourceCategory,
          customizeUnitCode: config.customizeUnitCode,
        },
      };
    },
  },
  events: {
    load: async (...args) => {
      if(['processing', 'all'].includes(config.tab)) {
        await approvingLoad(...args);
      }
    },
 },
});

// 执行情况供应商
const replySupplierDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'feedbackStatusMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.status').d('状态'),
    },
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

    // {
    //   name: 'attachmentFlag',
    //   type: 'number',
    //   label: intl.get('ssrc.inquiryHall.model.inquiryHall.attachement').d('附件'),
    // },
  ],
});

// 执行情况专家
const scoreRfDS = () => ({
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
});

export { TableDS, replySupplierDS, scoreRfDS };
