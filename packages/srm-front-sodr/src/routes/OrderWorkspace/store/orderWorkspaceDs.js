import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';

import { getDynamicLabel, getBatchOperationFlag } from '@/routes/components/utils';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

// 整单-待提交
const toBeSubmited = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  modifiedCheck: false,
  cacheModified: true,
  primaryKey: 'poHeaderId',
  pageSize: 20,
  fields: [
    {
      name: 'statusCode',
      label: intl.get('sodr.workspace.model.common.statusCode').d('状态'),
    },
    {
      name: 'aiPreReview',
      label: intl.get('sodr.workspace.view.workspace.aiPreReview').d('智能预审'),
    },
    {
      name: 'displayPoNum',
      label: intl.get('sodr.workspace.model.common.displayPoNum').d('订单编号'),
    },
    // {
    //   name: 'operationRecord',
    //   label: intl.get('sodr.workspace.view.option.operationRecord').d('操作记录'),
    // },
    {
      name: 'supplierName',
      label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
    },
    {
      name: 'companyId',
      label: intl.get('sodr.workspace.model.common.companyName').d('公司'),
    },
    {
      name: 'ouId',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    },
    {
      name: 'purchaseOrgId',
      label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
    },
    {
      name: 'agentId',
      label: intl.get('sodr.workspace.model.common.agentId').d('采购员'),
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
    },
    {
      name: 'amount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
    },
    {
      name: 'poTypeId',
      label: intl.get('sodr.workspace.model.common.poTypeCode').d('订单类型'),
    },
    {
      name: 'sourceBillTypeCode',
      label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('来源单据'),
    },
    {
      name: 'poSourcePlatform',
      label: intl.get('sodr.workspace.model.common.poSourcePlatform').d('来源平台'),
    },
    {
      name: 'erpCreatedName',
      label: intl.get('sodr.workspace.model.common.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
    },
    {
      name: 'supplierCode',
      label: intl.get('sodr.workspace.model.common.supplierCode').d('供应商编码'),
    },
    {
      name: 'shipToLocationAddress',
      label: intl.get('sodr.workspace.model.common.shipToLocationAddress').d('收货方地址'),
    },
    {
      name: 'billToLocationAddress',
      label: intl.get('sodr.workspace.model.common.billToLocationAddress').d('收单方地址'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get('sodr.workspace.model.common.supplierSiteName').d('供应商地点'),
    },
    {
      name: 'displayReleaseNum',
      label: intl.get('sodr.workspace.model.common.displayReleaseNum').d('发放号'),
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
    },
  ],
  queryParameter: {
    poWorkbenchFlag: 1,
    customizeUnitCode: 'SODR.WORKSPACE_TOBESUBMITED.SEARCH,SODR.WORKSPACE_TOBESUBMITED.LIST',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-header/maintain`,
        method: 'GET',
      };
    },
  },
  events: {
    unSelect({ record }) {
      record.reset();
    },
    unSelectAll({ dataSet }) {
      dataSet.forEach((i) => i.reset());
    },
  },
});

// 整单-审批中
const underApproval = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  modifiedCheck: false,
  cacheModified: true,
  primaryKey: 'poHeaderId',
  pageSize: 20,
  fields: [
    {
      name: 'statusCode',
      label: intl.get('sodr.workspace.model.common.statusCode').d('状态'),
    },
    {
      name: 'aiPreReview',
      label: intl.get('sodr.workspace.view.workspace.aiPreReview').d('智能预审'),
    },
    {
      name: 'action',
      label: intl.get('sodr.workspace.model.common.action').d('操作'),
    },
    {
      name: 'displayPoNum',
      label: intl.get('sodr.workspace.model.common.displayPoNum').d('订单编号'),
    },
    {
      name: 'viewDetail',
      type: 'string',
      label: intl.get('sodr.workspace.model.common.implementation').d('审批进度'),
    },
    {
      name: 'supplierName',
      label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
    },
    {
      name: 'companyId',
      label: intl.get('sodr.workspace.model.common.companyName').d('公司'),
    },
    {
      name: 'ouId',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    },
    {
      name: 'purchaseOrgId',
      label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
    },
    {
      name: 'agentId',
      label: intl.get('sodr.workspace.model.common.agentId').d('采购员'),
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
    },
    {
      name: 'amount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
    },
    {
      name: 'poTypeId',
      label: intl.get('sodr.workspace.model.common.poTypeCode').d('订单类型'),
    },
    {
      name: 'sourceBillTypeCode',
      label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('来源单据'),
    },
    {
      name: 'poSourcePlatform',
      label: intl.get('sodr.workspace.model.common.poSourcePlatform').d('来源平台'),
    },
    {
      name: 'realName',
      label: intl.get('sodr.workspace.model.common.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
    },
    {
      name: 'supplierCode',
      label: intl.get('sodr.workspace.model.common.supplierCode').d('供应商编码'),
    },
    {
      name: 'shipToLocationAddress',
      label: intl.get('sodr.workspace.model.common.shipToLocationAddress').d('收货方地址'),
    },
    {
      name: 'billToLocationAddress',
      label: intl.get('sodr.workspace.model.common.billToLocationAddress').d('收单方地址'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get('sodr.workspace.model.common.supplierSiteName').d('供应商地点'),
    },
    {
      name: 'releaseNum',
      label: intl.get('sodr.workspace.model.common.displayReleaseNum').d('发放号'),
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
    },
  ],
  queryParameter: {
    poWorkbenchFlag: 1,
    customizeUnitCode: 'SODR.WORKSPACE_UNDERAPPROVAL.SEARCH,SODR.WORKSPACE_UNDERAPPROVAL.LIST',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-header/approving`,
        method: 'GET',
      };
    },
  },
  events: {
    async load({ dataSet }) {
      const workFlowBussinessKeys = dataSet.reduce((acc, cur) => {
        const value = cur.get('workFlowBusinessKey');
        if (value) {
          acc.push(value);
        }
        return acc;
      }, []);
      if (!isEmpty(workFlowBussinessKeys)) {
        // 查询审批记录数据
        const simpleApprovalHistoryData = await queryBatchSimpleApprovalHistory(
          workFlowBussinessKeys
        );
        // 获取审批按钮显示状态
        const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
        // 获取撤销审批按钮状态
        const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
        dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
      }
    },
    unSelect({ record }) {
      record.reset();
    },
    unSelectAll({ dataSet }) {
      dataSet.forEach((i) => i.reset());
    },
  },
});

// 整单-待发布
const toBeReleased = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  modifiedCheck: false,
  cacheModified: true,
  primaryKey: 'poHeaderId',
  pageSize: 20,
  fields: [
    {
      name: 'statusCode',
      label: intl.get('sodr.workspace.model.common.statusCode').d('状态'),
    },
    {
      name: 'displayPoNum',
      label: intl.get('sodr.workspace.model.common.displayPoNum').d('订单编号'),
    },
    {
      name: 'supplierName',
      label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
    },
    {
      name: 'companyId',
      label: intl.get('sodr.workspace.model.common.companyName').d('公司'),
    },
    {
      name: 'ouId',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    },
    {
      name: 'purchaseOrgId',
      label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
    },
    {
      name: 'agentId',
      label: intl.get('sodr.workspace.model.common.agentId').d('采购员'),
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
    },
    {
      name: 'amount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
    },
    {
      name: 'poTypeId',
      label: intl.get('sodr.workspace.model.common.poTypeCode').d('订单类型'),
    },
    {
      name: 'sourceBillTypeCode',
      label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('来源单据'),
    },
    {
      name: 'poSourcePlatform',
      label: intl.get('sodr.workspace.model.common.poSourcePlatform').d('来源平台'),
    },
    {
      name: 'realName',
      label: intl.get('sodr.workspace.model.common.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
    },
    {
      name: 'supplierCode',
      label: intl.get('sodr.workspace.model.common.supplierCode').d('供应商编码'),
    },
    {
      name: 'shipToLocationAddress',
      label: intl.get('sodr.workspace.model.common.shipToLocationAddress').d('收货方地址'),
    },
    {
      name: 'billToLocationAddress',
      label: intl.get('sodr.workspace.model.common.billToLocationAddress').d('收单方地址'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get('sodr.workspace.model.common.supplierSiteName').d('供应商地点'),
    },
    {
      name: 'displayReleaseNum',
      label: intl.get('sodr.workspace.model.common.displayReleaseNum').d('发放号'),
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
    },
  ],
  queryParameter: {
    poWorkbenchFlag: 1,
    customizeUnitCode: 'SODR.WORKSPACE_TOBERELEASED.SEARCH,SODR.WORKSPACE_TOBERELEASED.LIST',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-header/publishing`,
        method: 'GET',
      };
    },
  },
  events: {
    unSelect({ record }) {
      record.reset();
    },
    unSelectAll({ dataSet }) {
      dataSet.forEach((i) => i.reset());
    },
  },
});

// 整单-待签署
const toBeSigned = (withProp) => {
  const { remote } = withProp;
  // 埋点ds的props
  const otherSignDsProps = remote?.process?.('getSignedDsProps') || {};
  return {
    selection: false,
    dataToJSON: 'selected',
    cacheSelection: true,
    modifiedCheck: false,
    cacheModified: true,
    primaryKey: 'poHeaderId',
    pageSize: 20,
    ...otherSignDsProps,
    fields: [
      {
        name: 'statusCode',
        label: intl.get('sodr.workspace.model.common.statusCode').d('状态'),
      },
      {
        name: 'displayPoNum',
        label: intl.get('sodr.workspace.model.common.displayPoNum').d('订单编号'),
      },
      {
        name: 'supplierName',
        label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
      },
      {
        name: 'companyId',
        label: intl.get('sodr.workspace.model.common.companyName').d('公司'),
      },
      {
        name: 'ouId',
        label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
      },
      {
        name: 'purchaseOrgId',
        label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
      },
      {
        name: 'agentId',
        label: intl.get('sodr.workspace.model.common.agentId').d('采购员'),
      },
      {
        name: 'taxIncludeAmount',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
      },
      {
        name: 'amount',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
      },
      {
        name: 'currencyCode',
        label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
      },
      {
        name: 'poTypeId',
        label: intl.get('sodr.workspace.model.common.poTypeCode').d('订单类型'),
      },
      {
        name: 'sourceBillTypeCode',
        label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('来源单据'),
      },
      {
        name: 'poSourcePlatform',
        label: intl.get('sodr.workspace.model.common.poSourcePlatform').d('来源平台'),
      },
      {
        name: 'realName',
        label: intl.get('sodr.workspace.model.common.realName').d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        format: DEFAULT_DATETIME_FORMAT,
        label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
      },
      {
        name: 'supplierCode',
        label: intl.get('sodr.workspace.model.common.supplierCode').d('供应商编码'),
      },
      {
        name: 'shipToLocationAddress',
        label: intl.get('sodr.workspace.model.common.shipToLocationAddress').d('收货方地址'),
      },
      {
        name: 'billToLocationAddress',
        label: intl.get('sodr.workspace.model.common.billToLocationAddress').d('收单方地址'),
      },
      {
        name: 'supplierSiteName',
        label: intl.get('sodr.workspace.model.common.supplierSiteName').d('供应商地点'),
      },
      {
        name: 'displayReleaseNum',
        label: intl.get('sodr.workspace.model.common.displayReleaseNum').d('发放号'),
      },
      {
        name: 'electricSignFlag',
        label: intl.get('sodr.common.model.common.electricSignFlag').d('电签标志'),
      },
      {
        name: 'electricSignStatus',
        label: intl.get('sodr.common.model.common.electricSignStatus').d('电签状态'),
      },
      {
        name: 'terminateSignStatus',
        label: intl.get('sodr.common.model.common.terminateSignStatus').d('解约签署状态'),
      },
      {
        name: 'remark',
        label: intl.get('sodr.workspace.model.common.remark').d('备注'),
      },
    ],
    queryParameter: {
      poWorkbenchFlag: 1,
      customizeUnitCode: 'SODR.WORKSPACE_TOBESIGNED.SEARCH,SODR.WORKSPACE_TOBESIGNED.LIST',
    },
    transport: {
      read: () => {
        return {
          // url: `${SRM_SPUC}/v1/${organizationId}/po-header/publishing`,
          url: `${SRM_SPUC}/v1/${organizationId}/po-header-signs`,
          method: 'GET',
        };
      },
    },
    events: {
      unSelect({ record }) {
        record.reset();
      },
      unSelectAll({ dataSet }) {
        dataSet.forEach((i) => i.reset());
      },
    },
  };
};

// 整单-反馈审核中
const feedbackUnderReview = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  modifiedCheck: false,
  cacheModified: true,
  primaryKey: 'poHeaderId',
  pageSize: 20,
  fields: [
    {
      name: 'statusCode',
      label: intl.get('sodr.workspace.model.common.statusCode').d('状态'),
    },
    {
      name: 'displayPoNum',
      label: intl.get('sodr.workspace.model.common.displayPoNum').d('订单编号'),
    },
    {
      name: 'supplierName',
      label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
    },
    {
      name: 'feedbackDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sodr.workspace.model.common.feedbackDate').d('交期反馈时间'),
    },
    {
      name: 'releasedDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sodr.workspace.model.common.releasedDate').d('发布时间'),
    },
    {
      name: 'companyId',
      label: intl.get('sodr.workspace.model.common.companyName').d('公司'),
    },
    {
      name: 'ouId',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    },
    {
      name: 'purchaseOrgId',
      label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
    },
    {
      name: 'agentId',
      label: intl.get('sodr.workspace.model.common.agentId').d('采购员'),
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
    },
    {
      name: 'amount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
    },
    {
      name: 'poTypeId',
      label: intl.get('sodr.workspace.model.common.poTypeCode').d('订单类型'),
    },
    {
      name: 'sourceBillTypeCode',
      label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('来源单据'),
    },
    {
      name: 'poSourcePlatform',
      label: intl.get('sodr.workspace.model.common.poSourcePlatform').d('来源平台'),
    },
    {
      name: 'realName',
      label: intl.get('sodr.workspace.model.common.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
    },
    {
      name: 'supplierCode',
      label: intl.get('sodr.workspace.model.common.supplierCode').d('供应商编码'),
    },
    {
      name: 'shipToLocationAddress',
      label: intl.get('sodr.workspace.model.common.shipToLocationAddress').d('收货方地址'),
    },
    {
      name: 'billToLocationAddress',
      label: intl.get('sodr.workspace.model.common.billToLocationAddress').d('收单方地址'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get('sodr.workspace.model.common.supplierSiteName').d('供应商地点'),
    },
    {
      name: 'displayReleaseNum',
      label: intl.get('sodr.workspace.model.common.displayReleaseNum').d('发放号'),
    },
    {
      name: 'electricSignFlag',
      label: intl.get('sodr.workspace.model.common.electricSignFlag').d('电签标识'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'electricSignStatus',
      label: intl.get('sodr.workspace.model.common.electricSignStatus').d('电签状态'),
      lookupCode: 'SODR.PO_SIGN_STATUS',
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
    },
  ],
  queryParameter: {
    poWorkbenchFlag: 1,
    customizeUnitCode:
      'SODR.WORKSPACE_FEEDBACKUNDERREVIEW.SEARCH,SODR.WORKSPACE_FEEDBACKUNDERREVIEW.LIST',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-header/delivery-query`,
        method: 'GET',
      };
    },
  },
  events: {
    unSelect({ record }) {
      record.reset();
    },
    unSelectAll({ dataSet }) {
      dataSet.forEach((i) => i.reset());
    },
  },
});

// 整单-全部
const all = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  modifiedCheck: false,
  cacheModified: true,
  primaryKey: 'poHeaderId',
  pageSize: 20,
  fields: [
    {
      name: 'statusCode',
      label: intl.get('sodr.workspace.model.common.statusCode').d('状态'),
    },
    {
      name: 'action',
      label: intl.get('sodr.workspace.model.common.action').d('操作'),
    },
    {
      name: 'displayPoNum',
      label: intl.get('sodr.workspace.model.common.displayPoNum').d('订单编号'),
    },
    {
      name: 'supplierName',
      label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
    },
    {
      name: 'companyId',
      label: intl.get('sodr.workspace.model.common.companyName').d('公司'),
    },
    {
      name: 'ouId',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    },
    {
      name: 'purchaseOrgId',
      label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
    },
    {
      name: 'agentId',
      label: intl.get('sodr.workspace.model.common.agentId').d('采购员'),
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
    },
    {
      name: 'amount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
    },
    {
      name: 'poTypeId',
      label: intl.get('sodr.workspace.model.common.poTypeCode').d('订单类型'),
    },
    {
      name: 'sourceBillTypeCode',
      label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('来源单据'),
    },
    {
      name: 'poSourcePlatform',
      label: intl.get('sodr.workspace.model.common.poSourcePlatform').d('来源平台'),
    },
    {
      name: 'releasedDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sodr.workspace.model.common.releasedDate').d('发布时间'),
    },
    {
      name: 'realName',
      label: intl.get('sodr.workspace.model.common.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
    },
    {
      name: 'supplierCode',
      label: intl.get('sodr.workspace.model.common.supplierCode').d('供应商编码'),
    },
    {
      name: 'shipToLocationAddress',
      label: intl.get('sodr.workspace.model.common.shipToLocationAddress').d('收货方地址'),
    },
    {
      name: 'billToLocationAddress',
      label: intl.get('sodr.workspace.model.common.billToLocationAddress').d('收单方地址'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get('sodr.workspace.model.common.supplierSiteName').d('供应商地点'),
    },
    {
      name: 'displayReleaseNum',
      label: intl.get('sodr.workspace.model.common.displayReleaseNum').d('发放号'),
    },
    {
      name: 'poNum',
      label: intl.get('sodr.workspace.model.common.poNum').d('SRM订单编号'),
    },
    {
      name: 'exportErpFlag',
      label: intl.get('sodr.workspace.model.common.exportErpFlag').d('同步状态'),
    },
    {
      name: 'electricSignFlag',
      label: intl.get('sodr.workspace.model.common.electricSignFlag').d('电签标识'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'electricSignStatus',
      label: intl.get('sodr.workspace.model.common.electricSignStatus').d('电签状态'),
      lookupCode: 'SODR.PO_SIGN_STATUS',
    },
    {
      name: 'syncSupplierStatus',
      label: intl
        .get('sodr.workspace.model.common.exportVendorSystemStatus')
        .d('导出供应商系统状态'),
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
    },
  ],
  queryParameter: {
    poWorkbenchFlag: 1,
    customizeUnitCode: 'SODR.WORKSPACE_ALL.SERARCH,SODR.WORKSPACE_ALL.LIST',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-header/purchaser`,
        method: 'GET',
      };
    },
  },
  events: {
    async load({ dataSet }) {
      const workFlowBussinessKeys = dataSet.reduce((acc, cur) => {
        const { workFlowBusinessKey, operationList = [] } = cur.get([
          'workFlowBusinessKey',
          'operationList',
        ]);
        // 存在workFlowBusinessKey并且后端没有返回统一撤销审批标识才需要去查工作流的
        if (workFlowBusinessKey && !operationList.includes('UNIFY_RECALL')) {
          acc.push(workFlowBusinessKey);
        }
        return acc;
      }, []);
      if (!isEmpty(workFlowBussinessKeys)) {
        // 获取审批按钮显示状态
        const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
        // 获取撤销审批按钮状态
        const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
        dataSet.setState({ approvaFlags, operationFlags });
      }
    },
    unSelect({ record }) {
      record.reset();
    },
    unSelectAll({ dataSet }) {
      dataSet.forEach((i) => i.reset());
    },
  },
});

// 明细-反馈审核中
const detailFeedback = (withProp) => {
  const { remote } = withProp;
  const config = {
    dataToJSON: 'selected',
    cacheSelection: true,
    modifiedCheck: false,
    cacheModified: true,
    primaryKey: 'poLineLocationId',
    pageSize: 20,
    fields: [
      {
        name: 'statusCode',
        label: intl.get('sodr.workspace.model.common.statusCode').d('状态'),
      },
      {
        name: 'displayPoNum',
        label: intl.get('sodr.workspace.model.common.displayPoNumAndLineNums').d('订单编号-行号'),
      },
      {
        name: 'supplierName',
        label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
      },
      {
        name: 'displayLineNum',
        label: intl.get('sodr.workspace.model.common.displayLineNum').d('行号'),
      },
      {
        name: 'displayLineLocationNum',
        label: intl.get('sodr.workspace.model.common.displayLineLocationNum').d('发运号'),
      },
      {
        name: 'itemCode',
        label: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
      },
      {
        name: 'needByDate',
        label: intl.get('sodr.workspace.model.common.needByDate').d('需求日期'),
        type: 'date',
        format: DEFAULT_DATE_FORMAT,
      },
      {
        name: 'promiseDeliveryDate',
        label: intl.get('sodr.workspace.model.common.promiseDeliveryDate').d('承诺交货日期'),
        type: 'date',
        format: DEFAULT_DATE_FORMAT,
      },
      {
        name: 'originalQuantity',
        label: intl.get('sodr.workspace.model.common.originalQuantity').d('原需求数量'),
        type: 'number',
        dynamicProps: {
          precision: ({ record }) => record.get('uomPrecision'),
        },
      },
      {
        name: 'secondaryQuantity',
        label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
        type: 'number',
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          precision: ({ record }) => record.get('secondaryUomPrecision'),
        },
      },
      {
        name: 'quantity',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          precision: ({ record }) => record.get('uomPrecision'),
          label: ({ dataSet }) =>
            getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
        },
      },
      {
        name: 'supplierCode',
        label: intl.get('sodr.workspace.model.common.supplierCode').d('供应商编码'),
      },
      {
        name: 'companyName',
        label: intl.get('sodr.workspace.model.common.company').d('公司'),
      },
      {
        name: 'orgName',
        label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
      },
      {
        name: 'purOrganizationName',
        label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
      },
      {
        name: 'agentName',
        label: intl.get('sodr.workspace.model.common.agentId').d('采购员'),
      },
      {
        name: 'feedbackDate',
        type: 'date',
        format: DEFAULT_DATE_FORMAT,
        label: intl.get('sodr.workspace.model.common.feedbackDate').d('交期反馈日期'),
      },
      {
        name: 'poTypeCode',
        label: intl.get('sodr.workspace.model.common.poTypeId').d('订单类型'),
      },
      {
        name: 'poSourcePlatform',
        label: intl.get('sodr.workspace.model.common.poSourcePlatform').d('来源平台'),
      },
      {
        name: 'sourceBillTypeCode',
        label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('来源单据'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        format: DEFAULT_DATETIME_FORMAT,
        label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
      },
      {
        name: 'headerRemark',
        label: intl.get('sodr.workspace.model.common.headerRemark').d('头备注'),
      },
    ],
    queryParameter: {
      poWorkbenchFlag: 1,
      customizeUnitCode: 'SODR.WORKSPACE_DETAILFEEDBACK.SEARCH,SODR.WORKSPACE_DETAILFEEDBACK.LIST',
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-line/detailList`,
          method: 'GET',
        };
      },
    },
    events: {
      unSelect({ record }) {
        record.reset();
      },
      unSelectAll({ dataSet }) {
        dataSet.forEach((i) => i.reset());
      },
    },
  };
  return remote ? remote.process('processDetailFeedbackDsConfig', config) : config;
};

// 明细-全部
const detailAll = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  modifiedCheck: false,
  cacheModified: true,
  primaryKey: 'poLineLocationId',
  pageSize: 20,
  fields: [
    {
      name: 'displayStatusCode',
      label: intl.get('sodr.workspace.model.common.displayStatusCode').d('状态'),
    },
    {
      name: 'action',
      label: intl.get('sodr.workspace.model.common.action').d('操作'),
    },
    {
      name: 'displayPoNum',
      label: intl.get('sodr.workspace.model.common.displayPoNumAndLineNums').d('订单编号-行号'),
    },
    {
      name: 'supplierName',
      label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
    },
    // {
    //   name: 'displayLineNum',
    //   label: intl.get('sodr.workspace.model.common.displayLineNum').d('行号'),
    // },
    {
      name: 'displayLineLocationNum',
      label: intl.get('sodr.workspace.model.common.displayLineLocationNum').d('发运号'),
    },
    {
      name: 'itemCode',
      label: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
    },
    {
      name: 'secondaryQuantity',
      label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
      },
    },
    {
      name: 'secondaryUomCodeAndName',
      label: intl.get('sodr.workspace.model.common.uomId').d('单位'),
    },
    {
      name: 'uomCodeAndName',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
      },
    },
    {
      name: 'unitPrice',
      label: intl.get('sodr.workspace.model.common.unitPrices').d('单价(不含税)'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
    },
    {
      name: 'lineAmount',
      label: intl.get('sodr.workspace.model.common.lineAmounts').d('行金额(不含税)'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
    },
    {
      name: 'enteredTaxIncludedPrice',
      label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrices').d('单价(含税)'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
    },
    {
      name: 'taxIncludedLineAmount',
      label: intl.get('sodr.workspace.model.common.taxIncludedLineAmounts').d('行金额(含税)'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
    },
    {
      name: 'taxRate',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.taxId').d('税率'),
    },
    {
      name: 'unitPriceBatch',
      label: intl.get('sodr.workspace.model.common.unitPriceBatch').d('每'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
    },
    {
      name: 'needByDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('sodr.workspace.model.common.needByDate').d('需求日期'),
    },
    {
      name: 'orderTypeCode',
      label: intl.get('sodr.workspace.model.common.poTypeCode').d('订单类型'),
    },
    {
      name: 'companyName',
      label: intl.get('sodr.workspace.model.common.company').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
    },
    {
      name: 'purchaseAgentName',
      label: intl.get('sodr.workspace.model.common.agentId').d('采购员'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get('sodr.workspace.model.common.invOrganizationId').d('库存组织'),
    },
    {
      name: 'categoryName',
      label: intl.get('sodr.workspace.model.common.categoryId').d('物料分类'),
    },
    {
      name: 'productNum',
      label: intl.get('sodr.workspace.model.common.productNum').d('商品编码'),
    },
    {
      name: 'productName',
      label: intl.get('sodr.workspace.model.common.productName').d('商品名称'),
    },
    {
      name: 'catalogName',
      label: intl.get('sodr.workspace.model.common.catalogName').d('商品目录'),
    },
    {
      name: 'poSourcePlatform',
      label: intl.get('sodr.workspace.model.common.poSourcePlatform').d('来源平台'),
    },
    {
      name: 'sourceBillTypeCode',
      label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('来源单据'),
    },
    {
      name: 'erpCreatedName',
      label: intl.get('sodr.workspace.model.common.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
    },
    {
      name: 'versionNum',
      label: intl.get('sodr.workspace.model.common.versionNum').d('版本号'),
    },
    {
      name: 'releaseNum',
      label: intl.get('sodr.workspace.model.common.releaseNum').d('发放号'),
    },
    {
      name: 'supplierCode',
      label: intl.get('sodr.workspace.model.common.supplierCode').d('供应商编码'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get('sodr.workspace.model.common.supplierSiteName').d('供应商地点'),
    },
    {
      name: 'inventoryName',
      label: intl.get('sodr.workspace.model.common.invInventoryId').d('收货库房'),
    },
    {
      name: 'locationName',
      label: intl.get('sodr.workspace.model.common.invLocationId').d('收货库位'),
    },
    {
      name: 'shipToThirdPartyAddress',
      label: intl.get('sodr.workspace.model.common.receivingAddress').d('收货地址'),
    },
    {
      name: 'shipToThirdPartyContact',
      label: intl.get('sodr.workspace.model.common.shipToThirdPartyContact').d('联系人信息'),
    },
    {
      name: 'receiveTelNum',
      label: intl.get('sodr.workspace.model.common.receiveTelNum').d('联系电话'),
    },
    {
      name: 'netReceivedQuantity',
      label: intl.get('sodr.workspace.model.common.netReceivedQuantity').d('净接收'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
    },
    {
      name: 'netDeliverQuantity',
      label: intl.get('sodr.workspace.model.common.netDeliverQuantity').d('净入库'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
    },
    {
      name: 'notDeliverQuantity',
      label: intl.get('sodr.workspace.model.common.notDeliverQuantity').d('未入库'),
      type: 'number',
    },
    {
      name: 'shippedQuantity',
      label: intl.get('sodr.workspace.model.common.shippedQuantity').d('已发货'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
    },
    {
      name: 'invoicedQuantity',
      label: intl.get('sodr.workspace.model.common.invoicedQuantity').d('已开票'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
    },
    {
      name: 'deliveryStatus',
      label: intl.get('sodr.workspace.model.common.deliveryStatus').d('发货状态'),
      lookupCode: 'SPUC.EXECUTION_STATUS',
    },
    {
      name: 'receiptStatus',
      label: intl.get('sodr.workspace.model.common.receiptStatus').d('收货状态'),
      lookupCode: 'SPUC.EXECUTION_STATUS',
    },
    {
      name: 'reconciliationStatus',
      label: intl.get('sodr.workspace.model.common.reconciliationStatus').d('对账状态'),
      lookupCode: 'SPUC.EXECUTION_STATUS',
    },
    {
      name: 'invoicingStatus',
      label: intl.get('sodr.workspace.model.common.invoicingStatus').d('开票状态'),
      lookupCode: 'SPUC.EXECUTION_STATUS',
    },
    {
      name: 'costName',
      label: intl.get('sodr.workspace.model.common.costId').d('成本中心'),
    },
    {
      name: 'departmentName',
      label: intl.get('sodr.workspace.model.common.departmentId').d('部门'),
    },
    {
      name: 'brand',
      label: intl.get('sodr.workspace.model.common.brand').d('品牌'),
    },
    {
      name: 'specifications',
      label: intl.get('sodr.workspace.model.common.specifications').d('规格'),
    },
    {
      name: 'model',
      label: intl.get('sodr.workspace.model.common.model').d('型号'),
    },
    {
      name: 'projectCategory',
      label: intl.get('sodr.workspace.model.common.projectCategory').d('项目类别'),
    },
    {
      name: 'consignedFlag',
      label: intl.get('sodr.workspace.model.common.consignedFlag').d('是否寄售'),
    },
    {
      name: 'returnedFlag',
      label: intl.get('sodr.workspace.model.common.returnedFlag').d('是否退回'),
    },
    {
      name: 'freeFlag',
      label: intl.get('sodr.workspace.model.common.freeFlag').d('是否免费'),
    },
    {
      name: 'bom',
      label: intl.get('sodr.workspace.model.common.bom').d('外协BOM'),
    },
    {
      name: 'promiseDeliveryDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('sodr.workspace.model.common.promiseDeliveryDate').d('承诺交货日期'),
    },
    {
      name: 'delayFlag',
      label: intl.get('sodr.workspace.model.common.delayFlag').d('交期满足需求'),
    },
    {
      name: 'urgentFlag',
      label: intl.get('sodr.workspace.model.common.urgentFlag').d('是否加急'),
    },
    {
      name: 'urgentDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sodr.workspace.model.common.urgentDate').d('加急时间'),
    },
    {
      name: 'prRequestedName',
      label: intl.get('sodr.workspace.model.common.prRequestedName').d('申请人'),
    },
    {
      name: 'releasedDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sodr.workspace.model.common.releasedDate').d('发布时间'),
    },
    {
      name: 'confirmedDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sodr.workspace.model.common.confirmedDate').d('确认时间'),
    },
    // {
    //   name: 'prExecutePointVOList',
    //   type: 'object',
    //   label: intl.get(`sodr.workspace.model.common.prExecutePoint`).d('执行状态'),
    // },
    {
      name: 'checkContectDoc',
      label: intl.get(`sodr.workspace.model.common.checkContectDoc`).d('执行单据'),
    },
    {
      name: 'billMatchedQuantity',
      type: 'number',
      label: intl.get(`sodr.common.model.common.billMatchedQuantity`).d('已对账'),
    },
    {
      name: 'docFlow',
      label: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
    },
    {
      name: 'exportErpFlag',
      label: intl.get('sodr.workspace.model.common.exportErpFlag').d('同步状态'),
    },
    {
      name: 'deliveryStrategyId',
      type: 'object',
      lovCode: 'SLOD.DELIVERY_STRATEGY',
      label: intl.get(`sodr.common.model.common.strategyName`).d('发货策略'),
      transformResponse: (value, object) =>
        object?.deliveryStrategyId
          ? {
              strategyHeaderId: object?.deliveryStrategyId,
              strategyName: object?.deliveryStrategyIdMeaning,
            }
          : null,
      transformRequest: (value) => {
        return value?.strategyHeaderId;
      },
      lovPara: {
        tenantId: organizationId,
      },
    },
    {
      name: 'strategyHeaderId',
      type: 'object',
      lovCode: 'SINV.STRATEGY_LINE_CODE_AND_NAME_PO',
      label: intl.get(`sodr.common.modle.common.receivingStrategy`).d('收货策略'),
      transformResponse: (value, object) =>
        object?.strategyHeaderId
          ? {
              strategyHeaderId: object?.strategyHeaderId,
              strategyGroupName: object?.strategyHeaderIdMeaning,
            }
          : null,
      transformRequest: (value) => {
        return value?.strategyHeaderId;
      },
      lovPara: {
        tenantId: organizationId,
      },
    },
    {
      name: 'headerRemark',
      label: intl.get('sodr.workspace.model.common.headerRemark').d('备注'),
    },
  ],
  queryParameter: {
    poWorkbenchFlag: 1,
    customizeUnitCode: 'SODR.WORKSPACE_DETAILALL.SEARCH,SODR.WORKSPACE_DETAILALL.LIST',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-location/purchaser`,
        method: 'GET',
      };
    },
  },
  events: {
    unSelect({ record }) {
      record.reset();
    },
    unSelectAll({ dataSet }) {
      dataSet.forEach((i) => i.reset());
    },
  },
});

// const orderCopy = () => ({
//   autoQuery: false,
//   dataToJSON: 'selected',
//   selection: 'single',
//   fields: [
//     {
//       name: 'statusCode',
//       label: intl.get('sodr.workspace.model.common.statusCode').d('状态'),
//     },
//     {
//       name: 'displayPoNum',
//       label: intl.get('sodr.workspace.model.common.displayPoNum').d('订单编号'),
//     },
//     {
//       name: 'supplierCode',
//       label: intl.get('sodr.workspace.model.common.supplierCode').d('供应商编码'),
//     },
//     {
//       name: 'supplierName',
//       label: intl.get('sodr.workspace.model.common.supplierName').d('供应商名称'),
//     },
//     {
//       name: 'creationDate',
//       label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
//     },
//     {
//       name: 'poTypeCode',
//       label: intl.get('sodr.workspace.model.common.poTypeCode').d('订单类型'),
//     },
//     {
//       name: 'companyName',
//       label: intl.get('sodr.workspace.model.common.companyName').d('公司'),
//     },
//     {
//       name: 'orgName',
//       label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
//     },
//     {
//       name: 'purOrganizationName',
//       label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
//     },
//   ],
//   transport: {
//     read: () => {
//       return {
//         url: `${SRM_SPUC}/v1/${organizationId}/po-header/copy/list`,
//         method: 'GET',
//       };
//     },
//   },
// });

// 关闭/取消原因
const reason = () => ({
  dataToJSON: 'all',
  autoCreate: true,
  fields: [
    {
      name: 'closeCancelRemark',
      required: true,
    },
  ],
});

// 导出供应商系统状态的弹窗
const exportVendorSystemStatus = () => ({
  dataToJSON: 'all',
  // autoCreate: true,
  selection: false,
  fields: [
    {
      name: 'syncTypeMeaning',
      label: intl.get('sodr.workspace.model.common.syncTypeMeaning').d('导入类型'),
    },
    {
      name: 'syncStatusMeaning',
      label: intl.get('sodr.workspace.model.common.syncStatusMeaning').d('导入状态'),
      lookupCode: 'SODR.PO.APPROVED_SYNC_STATUS',
    },
    {
      name: 'syncResponseMsg',
      label: intl.get('sodr.workspace.model.common.syncResponseMsg').d('导入消息'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sodr.workspace.model.common.processedDate').d('操作时间'),
    },
    {
      name: 'lastUpdatedName',
      label: intl.get('sodr.workspace.model.common.processUserName').d('操作人'),
    },
    {
      name: 'resynchronize',
      label: intl.get('sodr.workspace.view.button.resynchronize').d('重新同步'),
    },
    {
      name: 'externalSystemCode',
      label: intl.get('sodr.workspace.model.common.externalSystem').d('外部系统'),
    },
    {
      name: 'syncType',
      label: intl.get('sodr.workspace.model.common.syncType').d('接口代码'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { poHeaderId } = data;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-status-sync-supplier-records/query/${poHeaderId}`,
        method: 'GET',
        data: {},
      };
    },
  },
});

export {
  toBeSubmited,
  underApproval,
  toBeReleased,
  toBeSigned,
  feedbackUnderReview,
  all,
  detailFeedback,
  detailAll,
  // orderCopy,
  reason,
  exportVendorSystemStatus,
};
