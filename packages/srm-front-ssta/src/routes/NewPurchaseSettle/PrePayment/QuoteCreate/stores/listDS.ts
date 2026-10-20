import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType, DataSetSelection, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { amountFormatterOptions, transformSupplierData } from '../../../../../utils/utils';
import { GridCustCode, SearchCustCode, ActiveKey } from '../utils/type';

const organizationId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${organizationId}`;

export const quoteOrderDS = (): DataSetProps => {
  const queryParameter = {
    prepaymentType: 'ORDER',
    customizeUnitCode: [GridCustCode[ActiveKey.Order], SearchCustCode[ActiveKey.Order]].join(),
  };
  return {
    pageSize: 20,
    autoQuery: false,
    primaryKey: 'tempKey',
    cacheSelection: true,
    dataToJSON: DataToJSON.selected,
    selection: DataSetSelection.multiple,
    fields: [
      {
        name: 'displayNum',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.purchaseOrderNum').d('采购订单号'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.companyName').d('公司名称'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.supplierName').d('供应商名称'),
      },
      {
        name: 'ouName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.businessEntity').d('业务实体'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.currency').d('币种'),
      },
      {
        name: 'supplierSiteCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.supplierSite').d('供应商地点'),
      },
      {
        name: 'launchPrepaymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentInitiatedAmount').d('预付款已发起金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'prepaymentOccupiedAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentOccupiedAmount').d('预付款已占用金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentCompletedAmount').d('预付款已完成金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.orderTotalAmountIncludeTax').d('订单总额（含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'amount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.orderTotalAmountExcludeTax').d('订单总额（不含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'orderTypeName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.orderTypeName').d('采购订单类型'),
      },
      {
        name: 'organizationName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.organizationName').d('采购组织'),
      },
      {
        name: 'purchaseAgentName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.purchaseAgentName').d('采购员'),
      },
      {
        name: 'pendingFlag',
        lookupCode: 'HPFM.FLAG',
        label: intl.get(`ssta.prePayment.model.prePayment.suspended`).d('已暂挂'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('ssta.prePayment.model.prePayment.creationDate').d('创建时间'),
      },
      {
        name: 'releasedDate',
        type: FieldType.dateTime,
        label: intl.get('ssta.prePayment.model.prePayment.releasedDate').d('发布时间'),
      },
      {
        name: 'purchaseOrgId',
        type: FieldType.string,
        label: intl.get('ssta.common.view.message.purchaseOrgId').d('采购组织ID'),
      },
      {
        name: 'agentId',
        type: FieldType.string,
        label: intl.get('ssta.common.view.message.agentId').d('采购员ID'),
      },
    ],
    queryParameter,
    transport: {
      read: ({ data }) => {
        const { supplierLovKey, publishDate_range: publishDateRange, companyId, ...otherData } = data;
        const [publishDateStart, publishDateEnd] = publishDateRange ? publishDateRange.split(',') : [];
        return {
          url: `${apiPrefix}/pre-payment-lines/queryOrders`,
          method: 'GET',
          data: {
            ...otherData,
            camp: 'PURCHASER',
            queryCompanyId: companyId,
            publishDateStart,
            publishDateEnd,
            ...transformSupplierData(supplierLovKey),
          },
        };
      },
      submit: ({ dataSet }): any => {
        const pendingFlag = dataSet?.queryDataSet?.current?.get('pendingFlag');
        const submitType = dataSet?.getState('submitType');
        if (submitType === 'hodle') {
          return {
            url: `${apiPrefix}/pre-pay-headers/pending/order`,
            method: 'POST',
            params: {
              ...queryParameter,
              pendingFlag: pendingFlag === '0' ? 1 : 0,
            },
          };
        } else if (submitType === 'createValidate') {
          return {
            url: `${apiPrefix}/pre-pay-headers/purchaser/validate/create/new`,
            method: 'PUT',
            params: queryParameter,
          };
        } else if (submitType === 'create') {
          return {
            url: `${apiPrefix}/pre-pay-headers/purchaser/create/new`,
            method: 'PUT',
            params: queryParameter,
          };
        }
      },
    },
    feedback: {
      submitSuccess: () => { },
    },
  };
};

export const quotePoLineDS = (): DataSetProps => {
  const queryParameter = {
    prepaymentType: 'PO_LINE',
    customizeUnitCode: [GridCustCode[ActiveKey.PoLine], SearchCustCode[ActiveKey.PoLine]].join(),
  };
  return {
    pageSize: 20,
    autoQuery: false,
    primaryKey: 'tempKey',
    cacheSelection: true,
    dataToJSON: DataToJSON.selected,
    selection: DataSetSelection.multiple,
    fields: [
      {
        name: 'displayNum',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.displayAndLineNum').d('采购订单号|行号'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.companyName').d('公司名称'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.supplierName').d('供应商名称'),
      },
      {
        name: 'ouName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.businessEntity').d('业务实体'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.currency').d('币种'),
      },
      {
        name: 'supplierSiteCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.supplierSite').d('供应商地点'),
      },
      {
        name: 'launchPrepaymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentInitiatedAmount').d('预付款已发起金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'prepaymentOccupiedAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentOccupiedAmount').d('预付款已占用金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentCompletedAmount').d('预付款已完成金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.orderTotalAmountIncludeTax').d('订单总额（含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'amount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.orderTotalAmountExcludeTax').d('订单总额（不含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'orderTypeName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.orderTypeName').d('采购订单类型'),
      },
      {
        name: 'organizationName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.organizationName').d('采购组织'),
      },
      {
        name: 'purchaseAgentName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.purchaseAgentName').d('采购员'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('ssta.prePayment.model.prePayment.creationDate').d('创建时间'),
      },
      {
        name: 'releasedDate',
        type: FieldType.dateTime,
        label: intl.get('ssta.prePayment.model.prePayment.releasedDate').d('发布时间'),
      },
      {
        label: intl.get(`ssta.prePayment.model.prePayment.poItemName`).d('物料名称'),
        type: FieldType.string,
        name: 'itemName',
      },
      {
        label: intl.get(`ssta.prePayment.model.prePayment.quantity`).d('数量'),
        type: FieldType.number,
        name: 'quantity',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.prePayment.model.prePayment.lineAmountIncludeTax)`).d('行金额（含税）'),
        type: FieldType.number,
        name: 'taxIncludedLineAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.prePayment.model.prePayment.lineAmountExcludeTax`).d('行金额（不含税）'),
        type: FieldType.number,
        name: 'lineAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.prePayment.model.prePayment.categoryName`).d('品类'),
        type: FieldType.string,
        name: 'categoryName',
      },
      {
        label: intl.get('ssta.prePayment.model.prePayment.realName').d('创建人'),
        type: FieldType.string,
        name: 'poCreateName',
      },
      {
        name: 'pendingFlag',
        lookupCode: 'HPFM.FLAG',
        label: intl.get(`ssta.prePayment.model.prePayment.suspended`).d('已暂挂'),
      },
      {
        name: 'purchaseOrgId',
        type: FieldType.string,
        label: intl.get('ssta.common.view.message.purchaseOrgId').d('采购组织ID'),
      },
      {
        name: 'agentId',
        type: FieldType.string,
        label: intl.get('ssta.common.view.message.agentId').d('采购员ID'),
      },
    ],
    queryParameter,
    transport: {
      read: ({ data }) => {
        const { supplierLovKey, publishDate_range: publishDateRange, companyId, ...otherData } = data;
        const [publishDateStart, publishDateEnd] = publishDateRange ? publishDateRange.split(',') : [];
        return {
          url: `${apiPrefix}/pre-payment-lines/queryOrderLines`,
          method: 'GET',
          data: {
            ...otherData,
            camp: 'PURCHASER',
            queryCompanyId: companyId,
            publishDateStart,
            publishDateEnd,
            ...transformSupplierData(supplierLovKey),
          },
        };
      },
      submit: ({ dataSet }): any => {
        const pendingFlag = dataSet?.queryDataSet?.current?.get('pendingFlag');
        const submitType = dataSet?.getState('submitType');
        if (submitType === 'hodle') {
          return {
            url: `${apiPrefix}/pre-pay-headers/pending/order`,
            method: 'POST',
            params: {
              ...queryParameter,
              pendingFlag: pendingFlag === '0' ? 1 : 0,
            },
          };
        } else if (submitType === 'createValidate') {
          return {
            url: `${apiPrefix}/pre-pay-headers/purchaser/validate/create/new`,
            method: 'PUT',
            params: queryParameter,
          };
        } else if (submitType === 'create') {
          return {
            url: `${apiPrefix}/pre-pay-headers/purchaser/create/new`,
            method: 'PUT',
            params: queryParameter,
          };
        }
      },
    },
    feedback: {
      submitSuccess: () => { },
    },
  };
};

export const quoteContractDS = (): DataSetProps => {
  const queryParameter = {
    prepaymentType: 'CONTRACT',
    customizeUnitCode: [GridCustCode[ActiveKey.Contract], SearchCustCode[ActiveKey.Contract]].join(),
  };
  return {
    pageSize: 20,
    autoQuery: false,
    primaryKey: 'tempKey',
    cacheSelection: true,
    dataToJSON: DataToJSON.selected,
    selection: DataSetSelection.multiple,
    fields: [
      {
        name: 'displayNum',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.displayNum1').d('采购协议编号'),
      },
      {
        name: 'launchPrepaymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentInitiatedAmount').d('预付款已发起金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'prepaymentOccupiedAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentOccupiedAmount').d('预付款已占用金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentCompletedAmount').d('预付款已完成金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'originalTaxIncludeAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.originCurrencyAmountInTax').d('原币金额（含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'originalAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.originCurrencyAmountExTax').d('原币金额（不含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'pcName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.pcName').d('采购协议名称'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.companyName').d('公司名称'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.supplierName').d('供应商名称'),
      },
      {
        name: 'ouName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.businessEntity').d('业务实体'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.currency').d('币种'),
      },
      {
        name: 'pcTypeName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.pcTypeName').d('协议类型'),
      },
      {
        name: 'startDateActive',
        type: FieldType.date,
        label: intl.get('ssta.prePayment.model.prePayment.startDateActive').d('协议起始日期'),
      },
      {
        name: 'endDateActive',
        type: FieldType.date,
        label: intl.get('ssta.prePayment.model.prePayment.endDateActive').d('协议终止日期'),
      },
      {
        name: 'realName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.realName').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.date,
        label: intl.get('ssta.prePayment.model.prePayment.creationDate').d('创建时间'),
      },
      {
        name: 'confirmedDate',
        type: FieldType.date,
        label: intl.get('ssta.prePayment.model.prePayment.confirmedDate').d('生效时间'),
      },
      {
        label: intl.get(`ssta.prePayment.model.prePayment.suspended`).d('已暂挂'),
        type: FieldType.number,
        name: 'pendingFlag',
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'purchaseOrgId',
        type: FieldType.string,
        label: intl.get('ssta.common.view.message.purchaseOrgId').d('采购组织ID'),
      },
      {
        name: 'purchaseAgentId',
        type: FieldType.string,
        label: intl.get('ssta.common.view.message.agentId').d('采购员ID'),
      },
    ],
    queryParameter,
    transport: {
      read: ({ data }) => {
        const { supplierLovKey, ...otherData } = data;
        return {
          url: `${apiPrefix}/pre-payment-lines/query-contract`,
          method: 'GET',
          data: {
            ...otherData,
            ...transformSupplierData(supplierLovKey),
          },
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        const pendingFlag = dataSet?.queryDataSet?.current?.get('pendingFlag');
        if (submitType === 'hodle') {
          return {
            url: `${apiPrefix}/pre-pay-headers/pending/contract`,
            method: 'POST',
            params: {
              ...queryParameter,
              pendingFlag: pendingFlag === '0' ? 1 : 0,
            },
          };
        } else if (submitType === 'createValidate') {
          return {
            url: `${apiPrefix}/pre-pay-headers/purchaser/validate/create/new`,
            method: 'PUT',
            params: queryParameter,
          };
        } else if (submitType === 'create') {
          return {
            url: `${apiPrefix}/pre-pay-headers/purchaser/create/new`,
            method: 'PUT',
            params: queryParameter,
          };
        }
      },
    },
    feedback: {
      submitSuccess: () => { },
    },
  };
};

export const quotePcStageDS = (): DataSetProps => {
  const queryParameter = {
    prepaymentType: 'CONTRACT_STAGE',
    customizeUnitCode: [GridCustCode[ActiveKey.PcStage], SearchCustCode[ActiveKey.PcStage]].join(),
  };
  return {
    pageSize: 20,
    autoQuery: false,
    primaryKey: 'tempKey',
    cacheSelection: true,
    dataToJSON: DataToJSON.selected,
    selection: DataSetSelection.multiple,
    fields: [
      {
        name: 'pcNumAndStageNum',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.pcNumAndStageNum').d('采购协议编号-阶段编号'),
      },
      {
        name: 'launchPrepaymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentInitiatedAmount').d('预付款已发起金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'prepaymentOccupiedAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentOccupiedAmount').d('预付款已占用金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentCompletedAmount').d('预付款已完成金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.pcStageNumIncludeTax').d('协议阶段金额（含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'pcStatusCode',
        type: FieldType.string,
        lookupCode: 'SPCM.CONTRACT.STATUS',
        label: intl.get('ssta.prePayment.model.prePayment.pcStatusCode').d('协议状态'),
      },
      {
        name: 'pcName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.contractName').d('协议名称'),
      },
      {
        name: 'stageName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.stageName').d('阶段名称'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.companyName').d('公司名称'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.supplierName').d('供应商名称'),
      },
      {
        name: 'ouName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.businessEntity').d('业务实体'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.currency').d('币种'),
      },
      {
        name: 'pcTypeName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.pcTypeName').d('协议类型'),
      },
      {
        name: 'startDateActive',
        type: FieldType.date,
        label: intl.get('ssta.prePayment.model.prePayment.startDateActive').d('协议起始日期'),
      },
      {
        name: 'endDateActive',
        type: FieldType.date,
        label: intl.get('ssta.prePayment.model.prePayment.endDateActive').d('协议终止日期'),
      },
      {
        name: 'realName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.realName').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.date,
        label: intl.get('ssta.prePayment.model.prePayment.creationDate').d('创建时间'),
      },
      {
        label: intl.get(`ssta.prePayment.model.prePayment.suspended`).d('已暂挂'),
        type: FieldType.number,
        name: 'pendingFlag',
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'purchaseOrgId',
        type: FieldType.string,
        label: intl.get('ssta.common.view.message.purchaseOrgId').d('采购组织ID'),
      },
      {
        name: 'purchaseAgentId',
        type: FieldType.string,
        label: intl.get('ssta.common.view.message.agentId').d('采购员ID'),
      },
    ],
    queryParameter,
    transport: {
      read: ({ data }) => {
        const { supplierLovKey, ...otherData } = data;
        return {
          url: `${apiPrefix}/pre-payment-lines/query-contract-stage`,
          method: 'GET',
          data: {
            ...otherData,
            ...transformSupplierData(supplierLovKey),
          },
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        const pendingFlag = dataSet?.queryDataSet?.current?.get('pendingFlag');
        if (submitType === 'hodle') {
          return {
            url: `${apiPrefix}/pre-pay-headers/pending/contract`,
            method: 'POST',
            params: {
              ...queryParameter,
              pendingFlag: pendingFlag === '0' ? 1 : 0,
            },
          };
        } else if (submitType === 'createValidate') {
          return {
            url: `${apiPrefix}/pre-pay-headers/purchaser/validate/create/new`,
            method: 'PUT',
            params: queryParameter,
          };
        } else if (submitType === 'create') {
          return {
            url: `${apiPrefix}/pre-pay-headers/purchaser/create/new`,
            method: 'PUT',
            params: queryParameter,
          };
        }
      },
    },
    feedback: {
      submitSuccess: () => { },
    },
  };
};

export const quotePcSubjectDS = (): DataSetProps => {
  const queryParameter = {
    prepaymentType: 'CONTRACT_SUBJECT',
    customizeUnitCode: [GridCustCode[ActiveKey.PcSubject], SearchCustCode[ActiveKey.PcSubject]].join(),
  };
  return {
    pageSize: 20,
    autoQuery: false,
    primaryKey: 'tempKey',
    cacheSelection: true,
    dataToJSON: DataToJSON.selected,
    selection: DataSetSelection.multiple,
    fields: [
      {
        name: 'associateNum',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.pcNum').d('采购协议编号'),
      },
      {
        name: 'taxIncludedLineAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.pcSubjectLineAmountInTax').d('协议标的行金额（含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'launchPrepaymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentInitiatedAmount').d('预付款已发起金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'prepaymentOccupiedAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentOccupiedAmount').d('预付款已占用金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.prepaymentCompletedAmount').d('预付款已完成金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'pcName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.pcName').d('采购协议名称'),
      },
      {
        name: 'associateLineNum',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.lineNum').d('标的行号'),
      },
      {
        name: 'itemCode',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.itemName').d('物料名称'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.companyName').d('公司名称'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.supplierName').d('供应商名称'),
      },
      {
        name: 'ouName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.businessEntity').d('业务实体'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.currency').d('币种'),
      },
      {
        name: 'lineAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.pcSubjectLineAmountExTax').d('协议标的行金额（不含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxAmount',
        type: FieldType.number,
        label: intl.get('ssta.prePayment.model.prePayment.taxAmount').d('协议标的行税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'pcTypeName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.pcTypeName').d('协议类型'),
      },
      {
        name: 'pcStatusCodeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.pcStatusCodeMeaning').d('协议状态'),
      },
      {
        name: 'createByRealName',
        type: FieldType.string,
        label: intl.get('ssta.prePayment.model.prePayment.createByRealName').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.date,
        label: intl.get('ssta.prePayment.model.prePayment.creationDate').d('创建时间'),
      },
      {
        label: intl.get(`ssta.prePayment.model.prePayment.suspended`).d('已暂挂'),
        type: FieldType.number,
        name: 'pendingFlag',
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'purchaseOrgId',
        type: FieldType.string,
        label: intl.get('ssta.common.view.message.purchaseOrgId').d('采购组织ID'),
      },
      {
        name: 'purchaseAgentId',
        type: FieldType.string,
        label: intl.get('ssta.common.view.message.agentId').d('采购员ID'),
      },
    ],
    queryParameter,
    transport: {
      read: ({ data }) => {
        const { supplierLovKey, ...otherData } = data;
        return {
          url: `${apiPrefix}/pre-payment-lines/query-contract-subject`,
          method: 'GET',
          data: {
            ...otherData,
            ...transformSupplierData(supplierLovKey),
          },
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        const pendingFlag = dataSet?.queryDataSet?.current?.get('pendingFlag');
        if (submitType === 'hodle') {
          return {
            url: `${apiPrefix}/pre-pay-headers/pending/contract`,
            method: 'POST',
            params: {
              ...queryParameter,
              pendingFlag: pendingFlag === '0' ? 1 : 0,
            },
          };
        } else if (submitType === 'createValidate') {
          return {
            url: `${apiPrefix}/pre-pay-headers/purchaser/validate/create/new`,
            method: 'PUT',
            params: queryParameter,
          };
        } else if (submitType === 'create') {
          return {
            url: `${apiPrefix}/pre-pay-headers/purchaser/create/new`,
            method: 'PUT',
            params: queryParameter,
          };
        }
      },
    },
    feedback: {
      submitSuccess: () => { },
    },
  };
};
