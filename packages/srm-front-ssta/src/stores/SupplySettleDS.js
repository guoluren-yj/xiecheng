/* eslint-disable no-param-reassign */
import moment from 'moment';
import { isArray } from 'lodash';
import { math } from 'choerodon-ui/dataset';

import {
  getResponse,
  getCurrentOrganizationId,
  filterNullValueObject,
  getDateFormat,
  getCurrentUserId,
} from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX, DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { settleLineConfig, decimalSum } from '@/utils/amountConfig';
import {
  transformSupplierData,
  numberFormatterOptions,
  amountFormatterOptions,
} from '@/utils/utils';
// import { decimalPointAccuracy, getUrlVars } from '@/routes/utils';
// import { dateTimeRender } from 'utils/renderer';

// const tableUnitCodes = {
//   C: 'SSTA.SUPPLY_POOL_LIST.INVOICE_GRID',
//   D: 'SSTA.SUPPLY_POOL_LIST.PAYMENT_GRID',
// };

// const filterUnitCodes = {
//   C: 'SSTA.SUPPLY_POOL_LIST.INVOICE_FILTER',
//   D: 'SSTA.SUPPLY_POOL_LIST.PAYMENT_FILTER',
// };

const tableUnitCodesADD = {
  C: 'SSTA.SUPPLY_SETTLE_DETAIL.ADD.INVOICE',
  D: 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT.ADD.LIST',
};

const filterUnitCodesADD = {
  C: 'SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_ADD_INV',
  D: 'SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_ADD_PAY',
};

const organizationId = getCurrentOrganizationId();

const userId = getCurrentUserId();

const editAbleRender = ({ record, dataSet, name }) => {
  const { preEditor } = settleLineConfig[name];
  const { documentType, updateFlag } = dataSet || record.dataSet;
  return preEditor(record, documentType, updateFlag);
};

const validatorRender = (_, name, record) => {
  const { preValidator } = settleLineConfig[name];
  // 只读不校验
  if (editAbleRender({ record, name }) === false) {
    return true;
  }
  return preValidator(name, record);
};

const paymentInfoValidator = ({ dataSet, name }) => {
  const { fields } = dataSet.custConfig || {};
  const { visible, editable, required } =
    (fields || []).find((item) => item.fieldCode === name) || {};
  if ([visible, editable, required].includes(0)) {
    return false;
  } else {
    return dataSet.current && dataSet.current.get('paymentAmount') > 0;
  }
};

const tableDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'settleHeaderId',
    pageSize: 20,
    queryFields: [
      {
        name: 'date',
        type: 'date',
        range: ['start', 'end'],
        dynamicProps: {
          disabled: ({ record }) => record.get('dateRange'),
        },
        defaultValue: { start: moment().subtract(6, 'month'), end: moment() },
        label: intl.get('ssta.supplySettlePool.model.supplySettlePool.create').d('创建日期范围'),
      },
      // {
      //   name: 'createDateFrom',
      //   type: 'dateTime',
      //   label: intl
      //     .get('ssta.supplySettle.model.supplySettle.createDateFrom')
      //     .d('创建日期从'),
      // },
      // {
      //   name: 'createDateTo',
      //   type: 'dateTime',
      //   label: intl
      //     .get('ssta.supplySettle.model.supplySettle.createDateTo')
      //     .d('创建日期至'),
      // },
      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.supplySettlePool.model.supplySettlePool.supparams')
          .d('输入供应商公司、客户公司结算策略进行查询'),
      },
      {
        name: 'dateRange',
        type: 'string',
        label: intl
          .get('ssta.supplySettlePool.model.supplySettlePool.dateRange')
          .d('结算事务日期范围'),
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
      },
      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.customCompany').d('客户公司'),
        lovCode: 'SPFM.USER_AUTH.CUSTOMER',
        noCache: true,
        ignore: 'always',
      },
      {
        name: 'companyId',
        bind: 'companyIdLov.companyId',
      },
      {
        name: 'supplierCompanyIdLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.supplierCompanyId').d('供应商公司'),
        lovCode: 'SSTA.USER_AUTH.COMPANY_FOR_SUPPLIER',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId, userId },
      },
      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyIdLov.companyId',
      },
      {
        name: 'supplierCompanyNum',
        bind: 'supplierCompanyIdLov.companyNum',
      },
      {
        name: 'supplierId',
        bind: 'supplierCompanyIdLov.supplierId',
      },
      {
        name: 'supplierNum',
        bind: 'supplierCompanyIdLov.supplierNum',
      },
      // {
      //   name: 'supplierCompanyId',
      //   bind: 'supplierCompanyIdLov.companyId',
      // },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.currencyCode`).d('币种'),
        type: 'object',
        name: 'currencyCode',
        lovCode: 'SSTA.CURRENCY',
        lovPara: { organizationId },
        transformRequest: (value) => value && value.currencyCode,
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentType`).d('结算单类型'),
        type: 'string',
        name: 'documentType',
        lookupCode: 'SSTA.SETTLE_TYPE',
      },
      {
        name: 'settleNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleNum').d('结算单编号'),
      },
      {
        name: 'settleStatus',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
      {
        name: 'camp',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.campMeaning').d('创建方阵营'),
        lookupCode: 'SSTA.CAMP',
      },
      {
        name: 'isPrint',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.isPrint').d('打印状态'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'settleConfigNumLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStrategy').d('结算策略'),
        lovCode: 'SSTA.SETTLE_CONFIG',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'settleConfigNum',
        bind: 'settleConfigNumLov.settleConfigNum',
      },
      {
        name: 'invOrganizationLov',
        type: 'object',
        label: intl.get(`ssta.supplySettle.model.supplySettle.invOrganizationLov`).d('库存组织'),
        ignore: 'always',
        multiple: true,
        lovCode: 'HPFM.INV_ORGANIZATION',
      },
      {
        name: 'invOrganizationIdList',
        bind: 'invOrganizationLov.organizationId',
        transformRequest: (value) => (isArray(value) ? value.join() : null),
      },
      {
        name: 'sourceSupplierCompanyLov',
        type: 'object',
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.sourceSupplierName`)
          .d('数据源平台供应商名称'),
        ignore: 'always',
        lovCode: 'SSTA.USER_AUTH.SUPPLIER',
        noCache: true,
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'sourceSupplierCompanyId',
        bind: 'sourceSupplierCompanyLov.supplierCompanyId',
      },
    ],
    fields: [
      {
        name: 'settleNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleNum').d('结算单编号'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentTypeMeaning`).d('结算单类型'),
        type: 'string',
        name: 'documentTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`)
          .d('结算单类型'),
        type: 'string',
        name: 'settleTypeMeaning',
      },
      {
        name: 'invOrganizationName',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invOrganizationName')
          .d('库存组织'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleCustomCompany')
          .d('结算客户公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.supplierCompanyName')
          .d('结算供应商公司'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.currencyCode').d('币种'),
      },
      {
        name: 'netAmount',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.netAmount').d('开票不含税总金额'),
      },
      {
        name: 'taxAmount',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.taxAmount').d('开票总税额'),
      },
      {
        name: 'taxIncludedAmount',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.taxIncludedAmount').d('开票含税金额'),
      },
      {
        name: 'paymentAmount',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.collectionAmount').d('收款总金额'),
      },
      {
        name: 'applyAmount',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.applyCollectionAmount')
          .d('预收款核销总金额'),
      },
      {
        name: 'prepaymentAmount',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.preCollectionAmount')
          .d('预收款总金额'),
      },
      {
        name: 'settleStatusMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
      },
      {
        name: 'syncStatusMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.syncStatusMeaning').d('同步ERP状态'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('ssta.supplySettle.model.supplySettle.submitedDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.createdUserName').d('创建人'),
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.campMeaning').d('创建方阵营'),
      },
      {
        name: 'isPrint',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.isPrint').d('打印状态'),
      },
      {
        name: 'sourceSupplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.sourceSupplierName')
          .d('数据源平台供应商名称'),
      },
      {
        name: 'sourceSupplierCompanyNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.sourceSupplierCompanyNum')
          .d('数据源平台供应商编码'),
      },
      {
        name: 'confirmCollaborativeMode',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.confirmCollaborativeModes')
          .d('协同模式'),
      },
      {
        name: 'supplierSiteCode',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.supplierSiteCode')
          .d('供应商地点'),
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ dataSet, data }) => {
        const {
          queryParameter: { action },
          reParams,
        } = dataSet;
        const url = `/ssta/v1/${organizationId}/settle-headers/supplier/page?action=${action}`;
        delete data.date;
        delete data.dateRange;
        delete data.action;
        return {
          url,
          method: 'GET',
          data: filterNullValueObject({
            ...reParams,
            ...data,
            ...transformSupplierData(data.supplierCompanyId),
          }),
        };
      },
    },
  };
};

const recordDS = () => {
  return {
    selection: false,
    autoQuery: false,
    pageSize: 0,
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.processUser`).d('操作人'),
        type: 'string',
        name: 'processUser',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.processDate`).d('操作日期'),
        type: 'string',
        name: 'processDate',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.processStatusMeaning`).d('动作'),
        type: 'string',
        name: 'processStatusMeaning',
      },
      // {
      //   label: intl
      //     .get(`ssta.supplySettle.supplySettle.recordId`)
      //     .d('事务单号｜行号'),
      //   type: 'string',
      //   name: 'recordId',
      // },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.processRemark`)
          .d('说明'),
        type: 'string',
        name: 'processRemark',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ dataSet }) => {
        const {
          queryParameter: { settleHeaderId },
        } = dataSet;
        const url = `/ ssta / v1 / ${organizationId} /settle-header-actions/${settleHeaderId} `;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};
const taxRecordDS = () => {
  return {
    selection: false,
    autoQuery: false,
    pageSize: 0,
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.processUser`).d('操作人'),
        type: 'string',
        name: 'processUser',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.processDate`).d('操作日期'),
        type: 'string',
        name: 'processDate',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.processStatusMeaning`).d('动作'),
        type: 'string',
        name: 'processStatusMeaning',
      },
      // {
      //   label: intl
      //     .get(`ssta.supplySettle.supplySettle.recordId`)
      //     .d('事务单号｜行号'),
      //   type: 'string',
      //   name: 'recordId',
      // },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.processRemark`)
          .d('说明'),
        type: 'string',
        name: 'processRemark',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ dataSet }) => {
        const {
          queryParameter: { taxInvoiceHeaderId },
        } = dataSet;
        const url = `/ssta/v1/${organizationId}/tax-invoice-action/${taxInvoiceHeaderId}`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};
const showDS = () => {
  return {
    selection: false,
    autoQuery: false,
    queryParameter: {
      customizeUnitCode: 'SSTA.SUPPLY_SETTLE_LIST.VIEWPAYMENTRECORDS',
    },
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleHeaderId`).d('结算单头ID'),
        type: 'string',
        name: 'settleHeaderId',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.erpCollectionNum`).d('ERP收款单号'),
        type: 'string',
        name: 'erpPaymentNum',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.collectAmount`).d('收款金额'),
        type: 'number',
        name: 'paymentAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.collectionDate`).d('收款日期'),
        type: 'string',
        name: 'paymentDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.collectionType`)
          .d('收款类型'),
        type: 'string',
        name: 'paymentType',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ dataSet }) => {
        const {
          queryParameter: { settleHeaderId },
        } = dataSet;
        const url = `/ ssta / v1 / ${organizationId} /payment-records/${settleHeaderId} /show`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};
const headerDS = () => {
  return {
    selection: false,
    queryFields: [],
    forceValidate: true,
    fields: [
      /**
       * 基本信息
       */
      {
        name: 'settleNum',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleNum').d('结算单编号'),
      },
      {
        name: 'documentTypeMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.documentType').d('结算单类型'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`)
          .d('结算单类型'),
        type: 'string',
        name: 'settleTypeMeaning',
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.camp').d('创建方阵营'),
      },
      {
        name: 'settleStatus',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('ssta.supplySettle.model.supplySettle.creationDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.createdUserName').d('创建人'),
      },

      /**
       * 交易方信息
       */
      {
        name: 'companyNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleCustomCompanyNum')
          .d('结算客户公司编号'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleCustomCompanyName')
          .d('结算客户公司名称'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.currencyCode').d('币种'),
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleSupplierCompanyNum')
          .d('结算供应商公司编码'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleSupplierCompanyName')
          .d('结算供应商公司名称'),
      },
      {
        name: 'sourceSupplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.sourceSupplierName')
          .d('数据源平台供应商名称'),
      },
      {
        name: 'sourceSupplierCompanyNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.sourceSupplierCompanyNum')
          .d('数据源平台供应商编码'),
      },
      {
        name: 'ouName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.ouName').d('业务实体'),
      },
      {
        label: intl.get(`ssta.common.model.common.unitName`).d('部门名称'),
        type: 'string',
        name: 'unitName',
      },
      /**
       * 交易金额信息
       */

      /**
       * 汇总信息
       */
      {
        name: 'settleNetAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleNetAmount')
          .d('结算不含税总金额'),
      },
      {
        name: 'settleTaxAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleTaxAmount').d('结算总税额'),
      },
      {
        name: 'settleTaxIncludedAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleTaxIncludedAmount')
          .d('结算含税总金额'),
      },
      {
        name: 'invoicedNetAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.invoicedNetAmount')
          .d('已开票不含税总金额'),
      },
      {
        name: 'invoicedTaxAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoicedTaxAmount').d('已开票税额'),
      },
      {
        name: 'invoicedTaxIncludedAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.invoicedTaxIncludedAmounts')
          .d('已开票含税金额'),
      },
      {
        name: 'paidAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.paidCollectionAmount')
          .d('已收款金额'),
      },
      {
        name: 'remainingPaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.remainingCollectionAmount')
          .d('剩余收款金额'),
      },
      /**
       * 开票信息 -- 系统
       */
      {
        name: 'netAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.netAmount').d('开票不含税总金额'),
      },
      {
        name: 'taxAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.taxAmount').d('开票总税额'),
      },
      {
        name: 'taxIncludedAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.taxIncludedAmount')
          .d('开票含税总金额'),
      },

      /**
       * 发票匹配信息
       */
      {
        name: 'invoiceNetAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.invoiceNetAmount')
          .d('发票不含税总金额'),
      },
      {
        name: 'invoiceTaxAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceTaxAmount').d('发票总税额'),
      },
      {
        name: 'invoiceTaxIncludedAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.invoiceTaxIncludedAmount')
          .d('发票含税总金额'),
      },
      {
        name: 'invoiceDifferenceAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.invoiceDifferenceAmount2')
          .d('发票尾差值'),
      },
      {
        name: 'invoiceSpliteRule',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.invoiceSpliteRule')
          .d('发票自动拆分规则'),
        lookupCode: 'SSTA.AUTO_SPLIT_RULE_INV',
      },

      /**
       * 预收款核销信息
       */
      {
        name: 'applyAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.applyAmountCollection')
          .d('预收款核销总金额'),
      },

      /**
       * 收款信息
       */
      {
        name: 'paymentAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.collectionAmount').d('收款总金额'),
      },
      {
        name: 'paymentSpliteRule',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.collectionSpliteRule')
          .d('收款自动拆分规则'),
        lookupCode: 'SSTA.AUTO_SPLIT_RULE',
      },

      /**
       * 主策略信息
       */
      {
        name: 'settleConfigNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.mainSettleStrategyNum')
          .d('主结算策略编码'),
      },
      {
        name: 'settleConfigName',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.mainSettleStrategyName')
          .d('主结算策略名称'),
      },
      {
        name: 'configVersionNumber',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.configVersionNumber')
          .d('主结算策略版本号'),
      },

      {
        name: 'confirmCollaborativeModeMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.confirmCollaborativeModeMeaning')
          .d('协同模式-确认'),
      },
      {
        name: 'invoiceMatchMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceMatch').d('发票匹配规则'),
      },
      {
        name: 'confirmApproveMethodMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.confirmApproveMethodMeaning')
          .d('审批方式-确认'),
      },
      {
        name: 'cancelCollaborativeModeMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.cancelCollaborativeModeMeaning')
          .d('协同模式-取消'),
      },
      {
        name: 'cancelApproveMethodMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.cancelApproveMethodMeaning')
          .d('审批方式-取消'),
      },

      {
        name: 'amountValidateLevelMeaning',
        type: 'string',
        label: intl.get(`ssta.supplySettle.model.supplySettle.validateLevel`).d('尾差校验等级'),
      },
      {
        name: 'amountValidateAction',
        type: 'string',
        label: intl.get(`ssta.supplySettle.model.supplySettle.validateAction`).d('尾差校验节点'),
        multiple: true,
        lookupCode: 'SSTA.AMOUNT_VALIDATE_ACTION',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        transformResponse: (value) => (value && !isArray(value) ? value.split(',') : []),
      },
      {
        name: 'amountAdjustFlag',
        type: 'string',
        label: intl.get(`ssta.supplySettle.model.supplySettle.amountAdjustFlag`).d('尾差自动调整'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'amountAdjustModeMeaning',
        type: 'string',
        label: intl.get(`ssta.supplySettle.model.supplySettle.adjustMode`).d('尾差分摊模式'),
      },
      {
        name: 'amountAdjustRuleMeaning',
        type: 'string',
        label: intl.get(`ssta.supplySettle.model.supplySettle.adjustRule`).d('尾差分摊规则'),
      },
      {
        name: 'defaultPaymentDimensionMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.defaultCollectionDimensionMeaning')
          .d('收款维度【默认】'),
      },
      {
        name: 'defaultPaymentSpliteRuleMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.defaultCollectionSpliteRule')
          .d('收款自动拆分规则【默认】'),
      },
      {
        name: 'defaultPrepaymentSpliteRuleMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.defaultPreCollectionSpliteRule')
          .d('预收款核销自动拆分规则【默认】'),
      },
      {
        name: 'auto',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.auto').d('自动出单'),
      },
      {
        name: 'lineLimitQuantity',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.lineLimitQuantity')
          .d('结算单行数限制'),
      },
      {
        name: 'invoicePayEnableFlag',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.invoiceCollectionFlag')
          .d('启用开票并收款'),
      },
      {
        name: 'prepaymentDimensionMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.prepaymentDimensions')
          .d('预收款核销维度'),
      },
      {
        name: 'prepaymentCheckLevel',
        type: 'string',
        lookupCode: 'SSTA.PREPAYMENT_CHECK_LEVEL',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.prepaymentCheckLevels')
          .d('预收款核销校验等级'),
      },
      {
        name: 'prepaymentCheckPoint',
        type: 'string',
        lookupCode: 'SSTA.PREPAYMENT_CHECK_PIONT',
        multiple: true,
        label: intl
          .get('ssta.supplySettle.model.supplySettle.prepaymentCheckPoints')
          .d('预收款核销校验节点'),
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        transformResponse: (value) => (value && !isArray(value) ? value.split(',') : []),
      },
      {
        name: 'initSettleConfigNum',
        type: 'string',

        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.initSettleConfigNum')
          .d('初始策略编码'),
      },
      {
        name: 'initConfigVersionNumber',
        type: 'string',

        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.initConfigVersionNumber')
          .d('初始策略版本号'),
      },
      {
        name: 'invoiceToleranceRangeLimit',
        type: 'number',
        range: ['invoiceToleranceRangeLower', 'invoiceToleranceRangeUpper'],
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.taxIncludedAmountTol`)
          .d('含税金额允差范围'),
      },
      {
        name: 'invoiceToleranceRangeLower',
        type: 'number',
        bind: 'invoiceToleranceRangeLimit.invoiceToleranceRangeLower',
      },
      {
        name: 'invoiceToleranceRangeUpper',
        type: 'number',
        bind: 'invoiceToleranceRangeLimit.invoiceToleranceRangeUpper',
      },
      {
        name: 'taxAmountTolLimit',
        type: 'number',
        range: ['taxAmountTolLower', 'taxAmountTolUpper'],
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle..taxAmountTol`).d('税额允差范围'),
      },
      {
        name: 'taxAmountTolLower',
        type: 'number',
        bind: 'taxAmountTolLimit.taxAmountTolLower',
      },
      {
        name: 'taxAmountTolUpper',
        type: 'number',
        bind: 'taxAmountTolLimit.taxAmountTolUpper',
      },
      {
        name: 'amountAdjustTolLimit',
        type: 'number',
        range: ['amountAdjustTolLower', 'amountAdjustTolUpper'],
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.autoTaxIncludedAmountTol`)
          .d('自动调整含税金额允差范围'),
      },
      {
        name: 'amountAdjustTolLower',
        type: 'number',
        bind: 'amountAdjustTolLimit.amountAdjustTolLower',
      },
      {
        name: 'amountAdjustTolUpper',
        type: 'number',
        bind: 'amountAdjustTolLimit.amountAdjustTolUpper',
      },
      {
        name: 'taxAmountAdjustTolLimit',
        type: 'number',
        range: ['taxAmountAdjustTolLower', 'taxAmountAdjustTolUpper'],
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.autoTaxAmountTol`)
          .d('自动调整税额允差范围'),
      },
      {
        name: 'taxAmountAdjustTolLower',
        type: 'number',
        bind: 'taxAmountAdjustTolLimit.taxAmountAdjustTolLower',
      },
      {
        name: 'taxAmountAdjustTolUpper',
        type: 'number',
        bind: 'taxAmountAdjustTolLimit.taxAmountAdjustTolUpper',
      },

      /**
       * 直连开票信息
       */
      {
        name: 'directInvoicingTypeMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.directInvoicingTypeMeaning')
          .d('直连开票类型'),
      },
      {
        name: 'invoiceTypeMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceTypeMeaning').d('开票类型'),
      },
      {
        name: 'invoiceMethodMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceMethod').d('开票方式'),
      },
      {
        name: 'taxRegistrationNumber',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.taxRegistrationNumber').d('购方税号'),
      },
      {
        name: 'supplierTaxRegistrationNumber',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.supplierTaxRegistrationNumber')
          .d('销方税号'),
      },
      {
        name: 'regionLov',
        label: intl.get('ssta.supplySettle.model.supplySettle.regionName').d('收单地区'),
        type: 'object',
        ignore: 'always',
        textField: 'areaAddress',
        valueField: 'regionId',
        lovCode: 'SMAL.INVOICE_ADDRESS_LIST',
        lovPara: { tenantId: organizationId },
        noCache: true,
        transformResponse: (_, record) => {
          const { regionName = '' } = record;
          return {
            areaAddress: regionName,
          };
        },
      },
      {
        name: 'regionId',
        type: 'string',
        bind: 'regionLov.regionId',
      },
      // {
      //   name: 'regionName',
      //   type: 'string',
      //   label: intl.get('ssta.supplySettle.model.supplySettle.regionName').d('收单地区'),
      // },
      {
        name: 'contactName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.contactName').d('联系人'),
        bind: 'regionLov.contactName',
      },
      {
        name: 'address',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.address').d('详细地址'),
        bind: 'regionLov.address',
      },
      {
        name: 'mobile',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.mobile').d('手机号'),
        bind: 'regionLov.mobile',
      },
      {
        name: 'invoiceContent',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceContent').d('开票内容'),
      },
      {
        name: 'invoiceContentDetail',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.invoiceContentDetail')
          .d('开票内容详情'),
      },
      {
        name: 'invoiceFailMsg',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.invoiceFailMsg')
          .d('直连开票失败原因'),
      },

      {
        name: 'sdimPreviewFlag',
        type: 'string',
        label: intl
          .get(`ssta.directPoolSupply.model.directPoolSupply.sdimPreviewFlag`)
          .d('二次确认标志'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'sdimInvoiceType',
        type: 'string',
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.billType`).d('发票种类'),
        lookupCode: 'SDIM.INVOICE_TYPE',
        dynamicProps: {
          required: ({ record }) => record.get('directInvoicingType') === 'INVOICE_PLATFORM',
        },
      },
      {
        name: 'sdimPurCompanyName',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.purname').d('购方名称'),
      },
      // {
      //   name: 'purUnifiedSocialCode',
      //   type: 'string',
      //   label: intl
      //     .get(`ssta.directPoolSupply.model.directPoolSupply.purUnifiedSocialCode`)
      //     .d('购方纳税人识别号'),
      //   bind: 'purchaseCompanyLov.unifiedSocialCode',
      // },
      {
        name: 'sdimSupCompanyName',
        type: 'string',
        bind: 'saleCompanyLov.supplierCompanyName',
        label: intl.get('ssta.costSheet.model.costSheet.supcompanysName').d('销方名称'),
      },
      // {
      //   name: 'saleUnifiedSocialCode',
      //   type: 'string',
      //   label: intl
      //     .get(`ssta.directPoolSupply.model.directPoolSupply.supUnifiedSocialCode`)
      //     .d('销方纳税人识别号'),
      //   bind: 'saleCompanyLov.unifiedSocialCode',
      // },
      {
        name: 'sdimPurCompanyType',
        type: 'string',
        label: intl
          .get(`ssta.directPoolSupply.model.directPoolSupply.purCompanyType`)
          .d('购方企业类型'),
        lookupCode: 'SDIM.COMPANY_TYPE',
        dynamicProps: {
          required: ({ record }) => record.get('directInvoicingType') === 'INVOICE_PLATFORM',
        },
      },
      {
        name: 'sdimSupCompanyType',
        type: 'string',
        label: intl
          .get(`ssta.directPoolSupply.model.directPoolSupply.supCompanyType`)
          .d('销方企业类型'),
        lookupCode: 'SDIM.COMPANY_TYPE',
        dynamicProps: {
          required: ({ record }) => record.get('directInvoicingType') === 'INVOICE_PLATFORM',
        },
      },
      {
        name: 'sdimPurAddress',
        type: 'string',
        label: intl.get('ssta.common.model.common.purAddress').d('购方地址'),
      },
      {
        name: 'sdimPurTelephone',
        type: 'string',
        label: intl.get('ssta.common.model.common.purPhone').d('购方电话'),
      },
      {
        name: 'sdimSupAddress',
        type: 'string',
        label: intl.get('ssta.common.model.common.supAddress').d('销方地址'),
      },
      {
        name: 'sdimSupTelephone',
        type: 'string',
        label: intl.get('ssta.common.model.common.supPhone').d('销方电话'),
      },
      {
        name: 'sdimPurBankName',
        type: 'string',
        label: intl.get('ssta.common.model.common.purAccountBank').d('购方开户行'),
      },
      {
        name: 'sdimPurBankAccount',
        type: 'string',
        label: intl.get('ssta.common.model.common.purBankAccountNum').d('购方银行账号'),
      },
      {
        name: 'sdimSupBankName',
        type: 'string',
        label: intl.get('ssta.common.model.common.supAccountBank').d('销方开户行'),
      },
      {
        name: 'sdimSupBankAccount',
        type: 'string',
        label: intl.get('ssta.common.model.common.supBankAccountNum').d('销方银行账号'),
      },
      {
        name: 'sdimReceiver',
        type: 'string',
        label: intl
          .get(`ssta.directPoolSupply.model.directPoolSupply.receiverPaper`)
          .d('纸票收件人'),
      },
      {
        name: 'sdimRecipientPhone',
        type: 'string',
        label: intl
          .get(`ssta.directPoolSupply.model.directPoolSupply.receiverPaperPhone`)
          .d('纸票收件人电话'),
      },
      {
        name: 'sdimRecipientAddress',
        type: 'string',
        label: intl
          .get(`ssta.directPoolSupply.model.directPoolSupply.receiverPaperAddress`)
          .d('纸票收件人地址'),
      },

      /**
       * 其他信息
       */
      {
        name: 'remark',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.remark').d('备注'),
      },
      {
        name: 'canceledReason',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.canceledReason').d('取消原因'),
      },
      {
        name: 'approvedRemark',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.approvedRemark').d('审批意见-确认'),
      },
      {
        name: 'canceledRemark',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.canceledRemark').d('审批意见-取消'),
      },
      {
        name: 'accountingDate',
        type: 'date',
        label: intl.get('ssta.supplySettle.model.supplySettle.accountingDate').d('记账日期'),
      },
      {
        name: 'termCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.termCode').d('付款条件'),
      },
      {
        name: 'invOrganizationName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.invOrganizationName').d('库存组织'),
      },
      {
        name: 'sourceSettleNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.sourceSettleNum')
          .d('结算事务来源编号'),
      },
      {
        name: 'purOrganizationName',
        type: 'string',
        label: intl
          .get('ssta.supplySettlePool.model.supplySettlePool.purchOrganizationName')
          .d('采购组织'),
      },
      {
        name: 'supplierSiteCode',
        type: 'string',
        label: intl
          .get('ssta.supplySettlePool.model.supplySettlePool.supplierSiteCode4')
          .d('供应商地点'),
      },
      /**
       * 附件
       */
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl
          .get('ssta.supplySettlePool.model.supplySettlePool.purchaserEnclosure')
          .d('销售方附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: () => {
        const url = `/ssta/v1/${organizationId}/settle-headers`;
        return {
          url,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `/ssta/v1/${organizationId}/bill-headers/supplier`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

const filledInfoDs = () => {
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'canceledReason',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.canceledReason').d('取消原因'),
      },
      {
        name: 'approvedRemark',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.approvedRemark').d('审批意见-确认'),
      },
      {
        name: 'canceledRemark',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.canceledRemark').d('审批意见-取消'),
      },
    ],
  };
};

const lineDS = () => {
  return {
    selection: 'multiple',
    primaryKey: 'settleLineId',
    cacheSelection: true,
    queryFields: [],
    forceValidate: true,
    autoQueryAfterSubmit: false,
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.lineNum`).d('结算单行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.settleTransactionNum`)
          .d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.sourceSettleNumAndLineNum`)
          .d('结算事务来源编号｜行号'),
        type: 'string',
        name: 'sourceSettleNumAndLineNum',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.itemCode`)
          .d('结算商品编码'),
        type: 'string',
        name: 'itemCode',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.itemName`).d('结算商品名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.invoiceApplySettleNum`)
          .d('发票申请结算单号'),
        type: 'string',
        name: 'sourceSettleHeaderNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.quantity`).d('本次开票数量'),
        name: 'quantity',
        type: 'number',
        validator: validatorRender,
        dynamicProps: {
          required: editAbleRender,
        },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.netPrice`).d('本次开票不含税单价'),
        type: 'number',
        name: 'netPrice',
        dynamicProps: {
          required: editAbleRender,
        },
        validator: validatorRender,
      },
      {
        name: 'unitPriceBatch',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.unitPriceBatch').d('每'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.netAmounts`).d('本次开票不含税金额'),
        type: 'number',
        name: 'netAmount',
        dynamicProps: {
          required: editAbleRender,
        },
        validator: validatorRender,
      },
      {
        label: intl.get(`ssta.supplySettle.view.model.taxCode`).d('税码'),
        type: 'string',
        name: 'taxCode',
      },
      {
        label: intl.get(`ssta.supplySettle.view.model.taxRate`).d('税率'),
        type: 'object',
        name: 'taxRateLov',
        dynamicProps: {
          required: editAbleRender,
          lovPara: ({ dataSet, record }) => ({
            companyId: dataSet.companyId,
            supplierCompanyId: dataSet.supplierCompanyId,
            tenantId: getCurrentOrganizationId(),
            source: 'SETTLEINVIOCE',
            itemId: record.get('itemId'),
          }),
        },
        ignore: 'always',
        noCache: true,
        lovCode: 'SSTA.TAX_RATE_SERVICE',
        textFiled: 'taxRate',
      },
      {
        name: 'taxId',
        bind: 'taxRateLov.taxId',
      },
      {
        name: 'taxRate',
        bind: 'taxRateLov.taxRate',
      },
      {
        label: intl.get(`ssta.supplySettle.common.taxAmount`).d('税额'),
        type: 'number',
        name: 'taxAmount',
        dynamicProps: {
          required: editAbleRender,
        },
      },
      {
        label: intl.get(`ssta.supplySettle.common.taxIncludedPrice`).d('本次开票含税单价'),
        type: 'number',
        name: 'taxIncludedPrice',
        dynamicProps: {
          required: editAbleRender,
        },
        validator: validatorRender,
      },
      {
        label: intl.get(`ssta.supplySettle.common.currentTaxIncludedAmount`).d('本次开票含税金额'),
        type: 'number',
        name: 'taxIncludedAmount',
        dynamicProps: {
          required: editAbleRender,
        },
        validator: validatorRender,
      },
      {
        label: intl.get(`ssta.supplySettle.common.settleMatchDimension`).d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimensionMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.common.settleBasePrice`).d('结算基准价'),
        type: 'string',
        name: 'settleBasePriceMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.common.enableQuantity`).d('可开票数量'),
        type: 'number',
        name: 'enableQuantity',
      },
      {
        label: intl.get(`ssta.supplySettle.common.orignPrice`).d('原开票单价'),
        type: 'number',
        name: 'orignPrice',
      },
      {
        label: intl.get(`ssta.supplySettle.common.enableAmount`).d('可开票金额'),
        type: 'number',
        name: 'enableAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.common.paymentCollectionAmount`).d('本次收款金额'),
        type: 'number',
        name: 'paymentAmount',
        dynamicProps: {
          required: editAbleRender,
        },
        validator: validatorRender,
      },
      {
        label: intl.get(`ssta.supplySettle.common.applyAmountCollection`).d('本次预收款核销金额'),
        type: 'number',
        name: 'applyAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.common.invoicedTaxIncludedAmount`).d('已开票含税金额'),
        type: 'number',
        name: 'invoicedAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.common.paidAmountCollection`).d('已收款金额'),
        type: 'number',
        name: 'paidAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.common.remainingCollectionAmount`).d('剩余收款金额'),
        type: 'number',
        name: 'remainingPaymentAmount',
      },
      {
        name: 'adjustNetAmount',
        type: 'number',
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.adjustNetAmount`)
          .d('尾差不含税调整金额'),
      },
      {
        name: 'adjustTaxAmount',
        type: 'number',
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.adjustTaxAmount`)
          .d('尾差税额调整金额'),
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.invOrganizationName`).d('库存组织'),
        type: 'string',
        name: 'invOrganizationName',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ data, dataSet }) => {
        const { settleHeaderId } = data;
        const customizeUnitCode =
          dataSet.documentType === 'PAYMENT'
            ? 'SSTA.SUPPLY_SETTLE_DETAIL.PAY_TRANSACTIONDETAIL,SSTA.SUPPLY_SETTLE_DETAIL.PAY_TRANSACTION_DETAIL_SEARCH'
            : 'SSTA.SUPPLY_SETTLE_DETAIL.TRANSACTIONDETAIL,SSTA.SUPPLY_SETTLE_DETAIL.TRANSACTION_DETAIL_SEARCH';
        const url = `/ssta/v1/${organizationId}/settle-lines/${settleHeaderId}?customizeUnitCode=${customizeUnitCode}`;
        // const { type } = getUrlVars(window.location.search);
        return {
          url,
          method: 'GET',
          // transformResponse: (res) => {
          //   const response = JSON.parse(res);
          //   response.content = response.content.map((item) => {
          //     return {
          //       ...item,
          //       quantity:
          //         type === 'UPDATE'
          //           ? decimalPointAccuracy(item.quantity, item.uomPrecision)
          //           : item.quantity,
          //     };
          //   });
          //   return response;
          // },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `/ssta/v1/${organizationId}/settle-lines/cancel`,
          method: 'PUT',
          data,
        };
      },
    },
  };
};

const prePaymentHeaderDS = () => {
  return {
    autoCreate: true,
    paging: false,
    forceValidate: true,
    fields: [
      /**
       * 基本信息
       */
      {
        name: 'settleNum',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleNum').d('结算单编号'),
      },
      {
        name: 'settleStatus',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.camp').d('创建方阵营'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('ssta.supplySettle.model.supplySettle.creationDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.createdUserName').d('创建人'),
      },
      {
        name: 'documentType',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.documentType').d('结算单类型'),
        lookupCode: 'SSTA.RECORD_DOCUMENT_TYPE',
        defaultValue: 'PREPAYMENT',
      },
      {
        name: 'settleTypeMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.documentType').d('结算单类型'),
      },

      /**
       * 交易方信息
       */
      {
        name: 'companyNumLov',
        type: 'object',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleCustomCompanyName')
          .d('结算客户公司名称'),
        lovCode: 'SFIN.PAYMENT_CUSTOMER_COMPANY',
        ignore: 'always',
        noCache: true,
        textField: 'companyName',
        required: true,
      },
      {
        name: 'companyNum',
        type: 'string',
        bind: 'companyNumLov.companyNum',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleCustomCompanyNum')
          .d('结算客户公司编号'),
      },
      {
        name: 'companyId',
        type: 'string',
        bind: 'companyNumLov.companyId',
      },
      {
        name: 'companyName',
        type: 'string',
        bind: 'companyNumLov.companyName',
      },
      {
        name: 'currencyCodeLov',
        type: 'object',
        noCache: true,
        lovCode: 'SSTA.CURRENCY',
        lovPara: { organizationId },
        label: intl.get('ssta.supplySettle.model.supplySettle.currencyCode').d('币种'),
        required: true,
        ignore: 'always',
        textField: 'currencyCode',
      },
      {
        name: 'currencyCode',
        bind: 'currencyCodeLov.currencyCode',
        // required: true,
      },
      {
        name: 'currencyName',
        bind: 'currencyCodeLov.currencyName',
      },
      {
        name: 'supplierCompanyNumLov',
        type: 'object',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleSupplierName')
          .d('结算供应商名称'),
        lovCode: 'SSTA.USER_AUTH.COMPANY_FOR_SUPPLIER',
        ignore: 'always',
        noCache: true,

        lovPara: { tenantId: organizationId },
        required: true,
        cascadeMap: { parentValue: 'companyId' },
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        bind: 'supplierCompanyNumLov.companyNum',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleSupplierNum')
          .d('结算供应商编码'),
      },
      // {
      //   name: 'supplierCompanyId',
      //   type: 'string',
      //   bind: 'supplierCompanyNumLov.companyId',
      // },

      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyNumLov.companyId',
      },
      {
        name: 'supplierTenantId',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierTenantId',
      },
      {
        name: 'supplierId',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierId',
      },
      {
        name: 'supplierNum',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierNum',
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierCompanyName',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleSupplierName')
          .d('结算供应商名称'),
      },
      {
        name: 'supplierId',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierId',
      },
      {
        name: 'supplierNum',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierNum',
      },
      {
        name: 'supplierName',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierName',
      },
      {
        name: 'supplierSiteLov',
        type: 'object',
        lovCode: 'SSTA.SUPPLIER_SITE',
        label: intl.get('ssta.supplySettle.model.supplySettle.supplierSiteLov').d('供应商地点'),
        noCache: true,
        ignore: 'always',
        textField: 'supplierSiteCode',
        dynamicProps: {
          required: ({ record }) => record.get('supplierSiteEnableFlag') === 1,
          lovPara: ({ record }) => ({
            supplierId: record.get('supplierId'),
            tenantId: getCurrentOrganizationId(),
          }),
        },
      },
      {
        name: 'supplierSiteId',
        bind: 'supplierSiteLov.supplierSiteId',
      },
      {
        name: 'supplierSiteCode',
        bind: 'supplierSiteLov.supplierSiteCode',
      },
      {
        label: intl.get(`ssta.common.model.common.unitName`).d('部门名称'),
        type: 'string',
        name: 'unitName',
      },
      /**
       * 收款信息
       */
      {
        name: 'prepaymentType',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.preCollectionType').d('预收款类型'),
        required: true,
        lookupCode: 'SSTA.PREPAYMENT_TYPE',
      },
      {
        name: 'prepaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.preCollectionAmount')
          .d('预收款总金额'),
        // TODO:
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.bankId`).d('收款银行'),
        type: 'object',
        name: 'bankIdLov',
        ignore: 'always',
        noCache: true,
        required: true,
        textField: 'bankName',
        dynamicProps: {
          lovCode: ({ dataSet }) =>
            dataSet.getState('supBankFlag')
              ? 'SSTA.COMPANY_BANK_ACCOUNT_SUP'
              : 'SSTA.COMPANY_BANK_ACCOUNT',
          disabled: ({ record }) => !record.get('supplierCompanyNumLov'),
          required: ({ record }) => record.get('supplierCompanyNumLov'),
          lovPara: ({ record }) => ({
            companyId: record.get('companyId'),
            supplierCompanyId: record.get('supplierCompanyId'),
            tenantId: getCurrentOrganizationId(),
            supplierId: record.get('supplierId'),
          }),
        },
      },
      {
        name: 'bankId',
        bind: 'bankIdLov.bankId',
      },
      {
        name: 'bankName',
        bind: 'bankIdLov.bankName',
        label: intl.get(`ssta.supplySettle.model.supplySettle.bankId`).d('收款银行'),
        // dynamicProps: {
        //   required: ({ record }) => record.get('settleTaxAmount') > 0,
        // },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.bankBranchName`).d('收款开户行'),
        type: 'string',
        name: 'bankBranchName',
        bind: 'bankIdLov.bankBranchName',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.bankAccountNum`).d('收款银行帐号'),
        type: 'string',
        name: 'bankAccountNum',
        bind: 'bankIdLov.bankAccountNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.bankAccountName`)
          .d('收款银行账户名称'),
        type: 'string',
        name: 'bankAccountName',
        bind: 'bankIdLov.bankAccountName',
      },
      {
        name: 'associationAccountId', // 关联账户id
        bind: 'bankIdLov.associationAccountId',
      },
      {
        name: 'associationSystem', // 账户来源系统（内部，外部）
        bind: 'bankIdLov.associationSystem',
      },
      {
        name: 'bankFirm', // 联行行号
        bind: 'bankIdLov.bankFirm',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.collectionMethod`)
          .d('收款方式'),
        type: 'object',
        name: 'paymentMethodLov',
        lovCode: 'SMDM.PAYMENT_TYPE',
        ignore: 'always',
        noCache: true,
        required: true,
        // dynamicProps: {
        //   required: ({ record }) => record.get('settleTaxAmount') > 0,
        // },
      },
      {
        name: 'paymentTypeId',
        bind: 'paymentMethodLov.typeId',
      },
      {
        name: 'paymentTypeName',
        bind: 'paymentMethodLov.typeName',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionCondition`).d('收款条件'),
        type: 'object',
        name: 'paymentCondition',
        ignore: 'always',
        lovCode: 'SMDM.PAYMENT.TERM',
        noCache: true,
        textFiled: 'paymentTermName',
        required: true,
        // dynamicProps: {
        //   required: ({ record }) => record.get('settleTaxAmount') > 0,
        // },
      },
      {
        name: 'paymentTermId',
        bind: 'paymentCondition.termId',
        dynamicProps: {
          required: ({ record }) => record.get('settleTaxAmount') > 0,
        },
      },
      {
        name: 'paymentTermName',
        bind: 'paymentCondition.termName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.collectionDiscountAmount`)
          .d('收款折扣金额'),
        type: 'number',
        name: 'paymentDiscountAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.expectCollectionDate`)
          .d('期望收款日期'),
        type: 'date',
        name: 'expectPaymentDate',
        required: true,
      },
      // TODO:
      {
        name: 'paymentMethod',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.collectionMethod').d('收款方式'),
        dynamicProps: {
          required: ({ record }) => record.get('settleTaxAmount') > 0,
        },
      },
      {
        label: intl.get('ssta.supplySettle.model.supplySettle.collectionCondition').d('收款条件'),
        type: 'object',
        name: 'paymentCondition',
        ignore: 'always',
        lovCode: 'SMDM.PAYMENT.TERM',
        noCache: true,
        textFiled: 'paymentTermName',
        dynamicProps: {
          // required: ({ record }) => record.get('settleTaxAmount') > 0,
          lovPara: () => ({
            tenantId: getCurrentOrganizationId(),
          }),
        },
        required: true,
      },
      {
        name: 'paymentTermId',
        bind: 'paymentCondition.termId',
        // dynamicProps: {
        //   required: ({ record }) => record.get('settleTaxAmount') > 0,
        // },
      },
      {
        name: 'paymentTermName',
        bind: 'paymentCondition.termName',
      },
      {
        name: 'netAmount',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.netAmountCollection')
          .d('期望收款日期'),
        dynamicProps: {
          required: ({ record }) => record.get('settleTaxAmount') > 0,
        },

        // TODO:
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.remark').d('备注'),
      },
      {
        name: 'canceledReason',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.canceledReason').d('取消原因'),
      },
      {
        name: 'confirmCollaborativeModeMeaning',
        type: 'string',
        // lookupCode: 'SSTA.COOPERATION_MODE',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.confirmCollaborativeMode')
          .d('协同模式-确认'),
      },
      {
        name: 'confirmApproveMethodMeaning',
        type: 'string',
        // lookupCode: 'SSTA.APPROVAL_METHOD',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.confirmApproveMethod')
          .d('审批方式-确认'),
      },
      {
        name: 'cancelCollaborativeModeMeaning',
        type: 'string',
        // lookupCode: 'SSTA.COOPERATION_MODE',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.cancelCollaborativeMode')
          .d('协同模式-取消'),
      },
      {
        name: 'cancelApproveMethodMeaning',
        type: 'string',
        // lookupCode: 'SSTA.APPROVAL_METHOD',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.cancelApproveMethod')
          .d('审批方式-取消'),
      },
      {
        name: 'approvedRemark',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.approvedRemark').d('审批意见-确认'),
      },
      {
        name: 'canceledRemark',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.canceledRemark').d('审批意见-取消'),
      },
      {
        name: 'supplierApprovedRemark',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.approvalRemarkSupWaitConfirmed')
          .d('审批意见-供应商待确认'),
      },
      {
        name: 'supplierCanceledRemark',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.approvalRemarkSupWaitCanceled')
          .d('审批意见-供应商待取消'),
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.ouIdLov`).d('业务实体'),
        type: 'object',
        name: 'ouIdLov',
        ignore: 'always',
        lovCode: 'SSTA.SPFM.USER_AUTH.OU',
        noCache: true,
        textFiled: 'ouId',
        dynamicProps: {
          disabled: ({ record }) => !record.get('companyId'),
          lovPara: ({ record }) => ({
            tenantId: getCurrentOrganizationId(),
            companyId: record.get('companyId'),
          }),
        },
      },
      {
        name: 'ouId',
        bind: 'ouIdLov.ouId',
      },
      {
        name: 'ouName',
        bind: 'ouIdLov.ouName',
      },
      /**
       * 附件
       */
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl
          .get('ssta.supplySettlePool.model.supplySettlePool.purchaserEnclosure')
          .d('销售方附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      },
    ],
    transport: {
      create: ({ data }) => {
        const url = `/ssta/v1/${organizationId}/pre-pay-headers/supplier/save`;
        return {
          url,
          method: 'PUT',
          data: data[0],
        };
      },
      /**
       * 查询
       */
      read: ({ dataSet }) => {
        const {
          queryParameter: { settleHeaderId },
        } = dataSet;
        const url = `/ssta/v1/${organizationId}/pre-pay-headers/${settleHeaderId}`;
        return {
          url,
          method: 'GET',
        };
      },

      destroy: ({ data }) => {
        return {
          url: `/ssta/v1/${organizationId}/bill-headers/supplier`,
          method: 'DELETE',
          data,
        };
      },
    },

    events: {
      update: ({ name, value, record }) => {
        if (['supplierCompanyNumLov', 'companyNumLov'].includes(name) && value === null) {
          record.set('bankIdLov', null);
        }
      },
    },
  };
};

const prePaymentFilledInfoDs = () => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'canceledReason',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.canceledReason').d('取消原因'),
      },
      {
        name: 'approvedRemark',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.approvedRemark').d('审批意见-确认'),
      },
      {
        name: 'canceledRemark',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.canceledRemark').d('审批意见-取消'),
      },
    ],
  };
};

const prePaymentLineDS = () => {
  return {
    selection: 'multiple',
    primaryKey: 'prepaymentLineId',
    cacheSelection: true,
    queryFields: [],
    forceValidate: true,
    cacheModified: true,
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.lineNum`).d('结算单行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.preCollectionAmountBt`)
          .d('预收款金额'),
        type: 'number',
        validator: (value, _, record) => {
          if (value <= 0) {
            return intl
              .get(`ssta.supplySettle.model.supplySettle.pleaseInputCollection`)
              .d('请填写大于0的预收款行金额');
          }
          if (record.get('associateAmount') && math.gt(value, record.get('associateAmount'))) {
            return intl
              .get(`ssta.supplySettle.model.supplySettle.pleaseInputSmallCollection`)
              .d('预收款行金额不得大于关联单据金额');
          }

          return true;
        },
        required: true,
        name: 'prepaymentAmount',
        computedProps: {
          precision: ({ record }) => record.get('amountPrecision'),
        },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateNum`).d('关联单据号'),
        type: 'object',
        name: 'associateNumLov',
        ignore: 'always',
        noCache: true,
      },
      {
        name: 'associateNum',
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateNum`).d('关联单据号'),
        type: 'string',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateLineNum`).d('关联单据行号'),
        type: 'string',
        name: 'associateLineNum',
      },
      {
        name: 'associateNumAndLineNum',
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.associateNumAndLineNum`)
          .d('关联单据号 | 关联单据行号'),
        type: 'string',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.associateAmount`)
          .d('关联单据金额'),
        type: 'string',
        name: 'associateAmount',
      },
      {
        name: 'launchPrepaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.prePayment.model.prePayment.preCollectionInitiatedAmount')
          .d('预收款已发起金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'prepaymentOccupiedAmount',
        type: 'number',
        label: intl
          .get('ssta.prePayment.model.prePayment.preCollectionOccupiedAmount')
          .d('预收款已占用金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        type: 'number',
        label: intl
          .get('ssta.prePayment.model.prePayment.preCollectionCompletedAmount')
          .d('预收款已完成金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.common.prepaymentApplyAmount`).d('已核销金额'),
        type: 'string',
        name: 'prepaymentApplyAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.common.itemName`).d('商品名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        label: intl.get(`ssta.supplySettle.common.poItemName`).d('数量'),
        type: 'string',
        name: 'quantity',
      },
      {
        label: intl.get(`ssta.supplySettle.common.taxIncludedLineAmount`).d('含税行金额'),
        type: 'string',
        name: 'taxIncludedLineAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.common.lineAmount1`).d('不含税行金额'),
        type: 'string',
        name: 'lineAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.common.categoryName`).d('品类'),
        type: 'string',
        name: 'categoryName',
      },
      {
        label: intl.get(`ssta.supplySettle.common.poCreatedName`).d('订单创建人'),
        type: 'string',
        name: 'poCreatedName',
      },
      {
        label: intl.get(`ssta.supplySettle.common.poCreationDate`).d('订单创建时间'),
        type: 'dateTime',
        name: 'poCreationDate',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionTypeName`).d('收款方式'),
        type: 'string',
        name: 'paymentTypeName',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionCondition`).d('收款条件'),
        type: 'string',
        name: 'paymentTermName',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ dataSet }) => {
        const {
          queryParameter: { settleHeaderId },
        } = dataSet;
        const customizeUnitCode =
          'SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTIONDETAIL,SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTION_DETAIL_SEARCH';
        const url = `/ssta/v1/${organizationId}/pre-payment-lines/${settleHeaderId}?customizeUnitCode=${customizeUnitCode}`;
        return {
          url,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `/ssta/v1/${organizationId}/pre-payment-lines/batch/cancel`,
          data,
          method: 'PUT',
        };
      },
      submit: ({ data, dataSet }) => {
        const { settleHeaderId } = dataSet;
        return {
          url: `/ssta/v1/${organizationId}/pre-payment-lines/batch/save`,
          method: 'PUT',
          data: data.map((item) => {
            return {
              ...item,
              settleHeaderId,
            };
          }),
        };
      },
    },
  };
};

/**
 * 税务发票
 */
const taxDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.lineNumber`).d('行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.invoiceCode`).d('发票代码'),
        type: 'string',
        name: 'invoiceCode',
        required: true,
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.invoiceNumber`).d('发票号码'),
        type: 'string',
        name: 'invoiceNumber',
        required: true,
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.invoicingDate`)
          .d('开票日期'),
        type: 'date',
        name: 'invoicingDate',
        // dynamicProps: {
        //   required: ({ dataSet }) => dataSet.invoiceMatch === 'OFFLINE_INVOICE',
        // },
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.netAmount`)
          .d('不含税金额'),
        type: 'number',
        name: 'netAmount',
        required: true,
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.taxAmount`).d('税额'),
        type: 'number',
        name: 'taxAmount',
        required: true,
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.taxIncludedAmount`)
          .d('含税金额'),
        type: 'number',
        name: 'taxIncludedAmount',
        required: true,
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.invoiceSpecies`)
          .d('发票种类'),
        type: 'string',
        name: 'invoiceSpecies',
        required: true,
        lookupCode: 'SSTA.INVOICE_TYPE',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.invoiceSpecies`)
          .d('发票种类'),
        type: 'string',
        name: 'invoiceSpeciesMeaning',
        // required: true,
        // lookupCode: 'SSTA.INVOICE_TYPE',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.deductFlag`)
          .d('是否抵扣'),
        type: 'boolean',
        name: 'deductFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.checkCodeMeaning`)
          .d('校验码'),
        type: 'string',
        name: 'checkCode',
        // validator: (value) => {
        //   if (value && value.length !== 6) {
        //     return intl
        //       .get(`ssta.supplySettle.view.message.checkCodeError`)
        //       .d('请输入校验码后六位');
        //   }
        //   return true;
        // },
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.validateStatus`)
          .d('查验状态'),
        type: 'string',
        name: 'validateStatus',
        lookupCode: 'SSTA.INVOICE_CHECK_STATUS',
        defaultValue: 'UNCHECK',
      },

      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.validateMessage`)
          .d('查验状态说明'),
        type: 'string',
        name: 'validateMessage',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.taxInvoiceStatus`)
          .d('发票状态'),
        type: 'string',
        name: 'taxInvoiceStatus',
        lookupCode: 'SSTA.TAX_INVOICE_STATUS',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.taxInvoiceStatus`)
          .d('发票状态'),
        type: 'string',
        name: 'taxInvoiceStatusMeaning',
        // lookupCode: 'SSTA.TAX_INVOICE_STATUS',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.invoiceUrl`)
          .d('电子发票地址'),
        type: 'string',
        name: 'invoiceUrl',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.detaild`).d('操作'),
        type: 'string',
        name: 'detailed',
      },
      // 发票池字段转来
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.supplyInvoicePool.model.purchaseInvoicePool.supplierCompanyName')
          .d('销方名称'),
      },
      {
        name: 'supUnifiedSocialCode',
        type: 'string',
        label: intl
          .get('ssta.supplyInvoicePool.model.purchaseInvoicePool.supUnifiedSocialCode')
          .d('销方纳税人识别号'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl
          .get('ssta.supplyInvoicePool.model.purchaseInvoicePool.companyName')
          .d('购方名称'),
      },
      {
        name: 'purUnifiedSocialCode',
        type: 'string',
        label: intl
          .get('ssta.supplyInvoicePool.model.purchaseInvoicePool.purUnifiedSocialCode')
          .d('购方纳税人识别号'),
      },
      {
        name: 'seeocr',
        type: 'string',
        label: intl.get('ssta.supplyInvoicePool.model.purchaseInvoicePool.OcrFile').d('OCR文件'),
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.validateStatus`)
          .d('查验状态'),
        type: 'string',
        name: 'validateStatusMeaning',
        // lookupCode: 'SSTA.INVOICE_CHECK_STATUS',
        // defaultValue: 'UNCHECK',
      },
    ],
    transport: {
      /**
       * 查询 /v1/{organizationId}/tax-invoice-headers/{settleHeaderId}
       */
      read: ({ dataSet }) => {
        const {
          queryParameter: { settleHeaderId },
        } = dataSet;
        const customizeUnitCode =
          'SSTA.SUPPLY_SETTLE_DETAIL.TAXINVOICE,SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE_ADD_OLD,SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE_EDIT_OLD';
        const url = `/ssta/v1/${organizationId}/tax-invoice-headers/${settleHeaderId}?customizeUnitCode=${customizeUnitCode}`;
        return {
          url,
          method: 'GET',
        };
      },
      submit: ({ data, dataSet }) => {
        const {
          queryParameter: { settleHeaderId },
        } = dataSet;
        return {
          url: `/ssta/v1/${organizationId}/tax-invoice-headers/${settleHeaderId}`,
          method: 'POST',
          data: data.map((item) => {
            return {
              ...item,
              settleHeaderId,
            };
          }),
        };
      },
      destroy: ({ data }) => {
        // const {
        //   queryParameter: { settleHeaderId },
        // } = dataSet;
        return {
          url: `/ssta/v1/${organizationId}/tax-invoice-headers`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

/**
 * 税务发票
 */
const taxLineDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.linesNum`).d('行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.itemsCode`).d('商品编码'),
        type: 'string',
        name: 'itemCode',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.itemNames`).d('货物或应税劳务名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.specificsationModel`)
          .d('规格型号'),
        type: 'string',
        name: 'specificationsModel',
      },

      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.uom`).d('单位'),
        type: 'string',
        name: 'uom',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.processnum`).d('数量'),
        type: 'string',
        name: 'quantity',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.netPrice`).d('不含税单价'),
        type: 'string',
        name: 'netPrice',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.netAmount`)
          .d('不含税金额'),
        type: 'string',
        name: 'netAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.taxIncludedAmount`).d('含税金额'),
        type: 'string',
        name: 'taxIncludedAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.taxRate`).d('税率'),
        type: 'string',
        name: 'taxRate',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.taxAmount`).d('税额'),
        type: 'string',
        name: 'taxAmount',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ dataSet }) => {
        const {
          queryParameter: { taxInvoiveHeaderId },
        } = dataSet;
        const url = `/ssta/v1/${organizationId}/tax-invoice-lines/${taxInvoiveHeaderId}`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};

/**
 * 预收款核销
 */
const prepaymentDS = (amountPer, source) => {
  return {
    selection: 'multiple',
    autoQuery: false,
    paging: source !== 'quoteInvoice',
    fields: [
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.collectionTitle`)
          .d('预收款结算单号｜行号'),
        type: 'string',
        name: 'prepaymentTitle',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.collectionRemainingAmount`)
          .d('预收款剩余核销金额'),
        type: 'string',
        name: 'prepaymentRemainingAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.applyAmount`).d('本次核销金额'),
        type: 'number',
        name: 'applyAmount',
        min: 10 ** -amountPer,
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionAmount`)
          .d('预收款金额'),
        type: 'string',
        name: 'preCollectionAmountBt',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionAmountBt`)
          .d('预收款金额'),
        type: 'string',
        name: 'prepaymentAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionType`)
          .d('预收款类型'),
        type: 'string',
        name: 'prepaymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.associateNum`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionCreated`)
          .d('预收款申请人'),
        type: 'string',
        name: 'prepaymentCreatedBy',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionCreationDate`)
          .d('预收款创建时间'),
        type: 'string',
        name: 'prepaymentCreationDate',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ dataSet }) => {
        const {
          isLine,
          queryParameter: { settleHeaderId, settleLineId },
        } = dataSet;
        const customizeUnitCode = 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT.PEYPAYMENT.BOX';
        const url = isLine
          ? `/ssta/v1/${organizationId}/settle-apply-lines/${settleHeaderId}/${settleLineId}?customizeUnitCode=${customizeUnitCode}`
          : `/ssta/v1/${organizationId}/settle-apply-lines/${settleHeaderId}?customizeUnitCode=${customizeUnitCode}`;
        return {
          url,
          method: 'GET',
          data: {},
        };
      },
    },
  };
};

const prepaymentAddDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    queryFields: [
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.collectionSettleNum`)
          .d('预收款结算单号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        name: 'creationDate',
        type: 'date',
        range: ['from', 'to'],
      },
      {
        name: 'creationDateFrom',
        bind: 'creationDate.from',
        transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
      },
      {
        name: 'creationDateTo',
        bind: 'creationDate.to',
        transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateNum`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateLineNum`).d('关联单据行号'),
        type: 'string',
        name: 'associateLineNum',
        dynamicProps: {
          disabled: ({ record }) => !record.get('associateNum'),
        },
      },
    ],
    fields: [
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.prepaymentRemainingAmount`)
          .d('预收款剩余核销金额'),
        type: 'string',
        name: 'prepaymentRemainingAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.preCollectionTitle`)
          .d('预收款结算单号｜行号'),
        type: 'string',
        name: 'prepaymentTitle',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionType`)
          .d('预收款类型'),
        type: 'string',
        name: 'prepaymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.associateNum`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionCreated`)
          .d('预收款申请人'),
        type: 'string',
        name: 'prepaymentCreatedBy',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionCreationDate`)
          .d('预收款创建时间'),
        type: 'date',
        name: 'prepaymentCreationDate',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.associateLineNum`)
          .d('关联单据行号'),
        type: 'string',
        name: 'associateLineNum',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: () => {
        const customizeUnitCode =
          'SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_PRE_OFF_ADD,SSTA.SUPPLY_SETTLE_DETAIL.BOX.ADD.LIST';
        const url = `/ssta/v1/${organizationId}/settle-apply-lines/prepayment?customizeUnitCode=${customizeUnitCode}`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};

/**
 * 多维度收款
 */
const multiDimensionDS = (paymentDimension, updateFlag) => {
  return {
    paging: false,
    selection: false,
    autoCreate: true,
    queryFields: [
      {
        name: 'paymentDimension',
        type: 'string',
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionRangeCode`).d('收款维度'),
        lookupCode: 'SSTA.PAYMENT_DIMENSION',
        defaultValue: paymentDimension,
        disabled: !updateFlag,
      },
    ],
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentNum`).d('单据编号'),
        type: 'string',
        name: 'documentNum',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.invoicedTaxIncludedAmounts`)
          .d('已开票含税金额'),
        type: 'number',
        name: 'invoicedTaxIncludedAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.remainCollectionAmount`).d('剩余可收金额'),
        type: 'number',
        name: 'remainingPaymentAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.collectionAmountBy`)
          .d('本次收款金额'),
        type: 'number',
        name: 'paymentAmount',
        required: true,
        validator: (value, name, record) => {
          const {
            remainingPaymentAmount,
            invoicedTaxIncludedAmount,
            paymentAmount,
            applyAmount,
          } = record.toData();
          const payAmount = decimalSum([
            math.abs(remainingPaymentAmount || 0),
            math.negated(math.abs(paymentAmount || 0)),
            math.negated(math.abs(applyAmount || 0)),
          ]);
          if (value * invoicedTaxIncludedAmount < 0) {
            return intl
              .get(`ssta.common.message.validate.sameSign.invoicedTaxIncludedAmount`)
              .d(`本次付款金额需与已开票含税金额同号`);
          }
          if (payAmount < 0) {
            return `${intl
              .get(`ssta.common.message.validate.cannotExceed.ablePayAmount`)
              .d(`本次付款金额超过可付款金额，请检查`)}`;
          }
          return true;
        },
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.applyAmount`)
          .d('本次核销金额'),
        type: 'number',
        name: 'applyAmount',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ dataSet }) => {
        const {
          queryParameter: { settleHeaderId },
        } = dataSet;
        const url = `/ssta/v1/${organizationId}/settle-lines/mutil-payment/${settleHeaderId}`;
        return {
          url,
          method: 'GET',
          params: { size: 0 },
        };
      },
    },
  };
};

/**
 * 收款信息维护
 */
const paymentInfoDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    forceValidate: true,
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.bankId`).d('收款银行'),
        type: 'object',
        name: 'bankIdLov',
        ignore: 'always',
        noCache: true,
        lovCode: 'SSTA.COMPANY_BANK_ACCOUNT',
        textField: 'bankName',
        dynamicProps: {
          lovPara: ({ dataSet }) => ({
            companyId: dataSet.current && dataSet.current.get('companyId'),
            supplierCompanyId: dataSet.current && dataSet.current.get('supplierCompanyId'),
            tenantId: organizationId,
            supplierId: dataSet.current && dataSet.current.get('supplierId'),
          }),
          required: paymentInfoValidator,
        },
      },
      {
        name: 'bankName',
        bind: 'bankIdLov.bankName',
        label: intl.get(`ssta.supplySettle.model.supplySettle.bankId`).d('收款银行'),
      },
      {
        name: 'bankId',
        bind: 'bankIdLov.bankId',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.bankId`).d('收款银行'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.bankBranchName`).d('收款开户行'),
        type: 'string',
        name: 'bankBranchName',
        bind: 'bankIdLov.bankBranchName',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.bankAccountNum`).d('收款银行帐号'),
        type: 'string',
        name: 'bankAccountNum',
        bind: 'bankIdLov.bankAccountNum',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.bankAccountName`)
          .d('银行账户名称'),
        type: 'string',
        name: 'bankAccountName',
        bind: 'bankIdLov.bankAccountName',
      },
      {
        name: 'associationAccountId', // 关联账户id
        bind: 'bankIdLov.associationAccountId',
      },
      {
        name: 'associationSystem', // 账户来源系统（内部，外部）
        bind: 'bankIdLov.associationSystem',
      },
      {
        name: 'bankFirm', // 联行行号
        bind: 'bankIdLov.bankFirm',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.collectionMethod`)
          .d('收款方式'),
        type: 'object',
        name: 'paymentMethodLov',
        lovCode: 'SMDM.PAYMENT_TYPE',
        ignore: 'always',
        noCache: true,
        textFiled: 'typeName',
        dynamicProps: {
          required: paymentInfoValidator,
        },
      },
      {
        name: 'paymentTypeId',
        bind: 'paymentMethodLov.typeId',
      },
      {
        name: 'paymentTypeName',
        bind: 'paymentMethodLov.typeName',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionCondition`).d('收款条件'),
        type: 'object',
        name: 'paymentCondition',
        ignore: 'always',
        lovCode: 'SMDM.PAYMENT.TERM',
        noCache: true,
        textFiled: 'paymentTermName',
        dynamicProps: {
          required: paymentInfoValidator,
        },
      },
      {
        name: 'paymentTermId',
        bind: 'paymentCondition.termId',
      },
      {
        name: 'paymentTermName',
        bind: 'paymentCondition.termName',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.collectionDiscountAmount`)
          .d('收款折扣金额'),
        type: 'number',
        name: 'paymentDiscountAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.expectCollectionDate`)
          .d('期望收款日期'),
        type: 'date',
        name: 'expectPaymentDate',
        dynamicProps: {
          required: paymentInfoValidator,
        },
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ dataSet }) => {
        const {
          queryParameter: { settleHeaderId },
        } = dataSet;
        const url = `/ssta/v1/${organizationId}/settle-header-pre-verifications/${settleHeaderId}`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};

/**
 * 预收款核销
 */
const multiPrepaymentDS = (amountPer) => {
  return {
    paging: false,
    selection: 'multiple',
    autoQuery: false,
    fields: [
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.preCollectionTitle`)
          .d('预收款结算单号｜行号'),
        type: 'string',
        name: 'prepaymentTitle',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.collectionRemainingAmount`)
          .d('预收款剩余核销金额'),
        type: 'string',
        name: 'prepaymentRemainingAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.applyAmount`).d('本次核销金额'),
        type: 'number',
        name: 'applyAmount',
        min: 10 ** -amountPer,
        required: true,
        validator: (value, dataSet, record) => {
          const { prepaymentRemainingAmount } = record.toData();
          if (math.lt(prepaymentRemainingAmount, value)) {
            return intl
              .get(`ssta.supplySettle.supplySettle.collectionWriteOffApplyAmount`)
              .d('本次核销金额不得超过预收款剩余核销金额');
          }
          return true;
        },
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionAmountBt`)
          .d('预收款金额'),
        type: 'string',
        name: 'prepaymentAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionType`)
          .d('预收款类型'),
        type: 'string',
        name: 'prepaymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.associateNum`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionCreated`)
          .d('预收款申请人'),
        type: 'string',
        name: 'prepaymentCreatedBy',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionCreationDate`)
          .d('预收款创建时间'),
        type: 'date',
        name: 'prepaymentCreationDate',
      },
    ],
  };
};

const multiPrepaymentAddDS = (multiDimensionDs) => {
  return {
    selection: 'multiple',
    autoQuery: false,
    queryFields: [
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.collectionSettleNum`)
          .d('预收款结算单号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        name: 'creationDate',
        type: 'date',
        range: ['from', 'to'],
      },
      {
        name: 'creationDateFrom',
        bind: 'creationDate.from',
        transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
      },
      {
        name: 'creationDateTo',
        bind: 'creationDate.to',
        transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateNum`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateLineNum`).d('关联单据行号'),
        type: 'string',
        name: 'associateLineNum',
        dynamicProps: {
          disabled: ({ record }) => !record.get('associateNum'),
        },
      },
    ],
    fields: [
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.collectionRemainingAmount`)
          .d('预收款剩余核销金额'),
        type: 'string',
        name: 'prepaymentRemainingAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.collectionTitle`)
          .d('预收款结算单号｜行号'),
        type: 'string',
        name: 'prepaymentTitle',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionType`)
          .d('预收款类型'),
        type: 'string',
        name: 'prepaymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.associateNum`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionCreated`)
          .d('预收款申请人'),
        type: 'string',
        name: 'prepaymentCreatedBy',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.collectiontCreationDate`)
          .d('预收款创建时间'),
        type: 'date',
        name: 'prepaymentCreationDate',
      },
      {
        label: intl
          .get(`ssta.supplySettle.view.message.model.supplySettle.associateLineNum`)
          .d('关联单据行号'),
        type: 'string',
        name: 'associateLineNum',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: () => {
        const customizeUnitCode =
          'SSTA.SUPPLY_SETTLE_DETAIL.INVOICE_INFO_BOX_ADD.LIST,SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_MULTI_PRE_OFF_ADD';
        const url = `/ssta/v1/${organizationId}/settle-apply-lines/prepayment?customizeUnitCode=${customizeUnitCode}`;
        return {
          url,
          method: 'GET',
          transformResponse: (response) => {
            const res = JSON.parse(response);
            if (!getResponse(res) || !res?.content) return;
            const preApplyAmountList = [];
            const multiPrepaymentAddList = [];
            multiDimensionDs.records.forEach((item) => {
              if (Array.from(item.get('settleApplyLineList')).length > 0) {
                Array.from(item.get('settleApplyLineList')).forEach((a) => {
                  preApplyAmountList.push(a);
                });
              }
            });
            res.content.forEach((row) => {
              let { prepaymentRemainingAmount } = row;
              preApplyAmountList.forEach((input) => {
                if (input.prepaymentLineId === row.prepaymentLineId) {
                  prepaymentRemainingAmount =
                    Number(prepaymentRemainingAmount) - Number(input.applyAmount || 0);
                }
              });
              multiPrepaymentAddList.push({
                ...row,
                prepaymentRemainingAmount,
              });
            });
            return {
              ...res,
              content: multiPrepaymentAddList,
            };
          },
        };
      },
    },
  };
};

const currencyDS = () => {
  return {
    selection: false,
    autoQuery: false,
    fields: [
      {
        type: 'string',
        name: 'amount',
      },
      {
        type: 'string',
        name: 'price',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: () => {
        const url = `/ssta/v1/${organizationId}/amount`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};

const paymentInvoiceDS = () => {
  return {
    autoQuery: false,
    dataToJSON: 'selected',
    queryFields: [
      {
        name: 'date',
        type: 'string',
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
        label: intl.get('ssta.supplySettle.model.supplySettle.createDate').d('创建日期范围'),
      },
      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.param')
          .d('输入供应商、公司、结算策略进行查询'),
      },
      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.company`).d('公司'),
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        noCache: true,
        ignore: 'always',
      },
      {
        name: 'companyId',
        bind: 'companyIdLov.companyId',
      },
      {
        name: 'supplierCompanyIdLov',
        type: 'object',
        label: intl.get(`ssta.supplySettle.model.supplySettle.supplier`).d('供应商'),
        lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierCompanyId',
      },

      {
        name: 'supplierId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierId',
      },
      {
        name: 'supplierNum',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierNum',
      },
      {
        name: 'supplierCompanyNum',
        bind: 'supplierCompanyIdLov.supplierCompanyNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.currencyCode`).d('币种'),
        type: 'object',
        name: 'currencyCode',
        lovCode: 'SSTA.CURRENCY',
        lovPara: { organizationId },
        transformRequest: (value) => value && value.currencyCode,
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.creationDateFrom`).d('创建日期从'),
        type: 'date',
        name: 'creationDateFrom',
        defaultValue: moment().subtract(6, 'month'),
        dynamicProps: {
          disabled: ({ record }) => record.get('date'),
        },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.creationDateTo`).d('创建日期至'),
        type: 'date',
        name: 'creationDateTo',
        dynamicProps: {
          disabled: ({ record }) => record.get('date'),
        },
      },
      {
        name: 'settleNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleNum').d('结算单编号'),
      },
      {
        name: 'settleConfigNumLov',
        type: 'object',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStrategy').d('结算策略'),
        lovCode: 'SSTA.SETTLE_CONFIG',
        noCache: true,
        ignore: 'always',
        multiple: true,
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'settleConfigNumList',
        bind: 'settleConfigNumLov.settleConfigNum',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },
      {
        name: 'camp',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.campMeaning').d('创建方阵营'),
        lookupCode: 'SSTA.CAMP',
      },
    ],
    fields: [
      {
        name: 'settleNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleNum').d('结算单编号'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentTypeMeaning`).d('结算单类型'),
        type: 'string',
        name: 'documentTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`)
          .d('结算单类型'),
        type: 'string',
        name: 'settleTypeMeaning',
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleCompany').d('结算公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleSupplierCompany')
          .d('结算供应商'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.currencyCode').d('币种'),
      },
      {
        name: 'netAmount',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.netAmount').d('开票不含税总金额'),
      },
      {
        name: 'taxAmount',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.taxAmount').d('开票总税额'),
      },
      {
        name: 'taxIncludedAmount',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.taxIncludedAmount').d('开票含税金额'),
      },
      {
        name: 'paidAmount',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.paidCollectionAmount')
          .d('已收款金额'),
      },
      {
        name: 'remainingPaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.remainCollectionAmountBy')
          .d('剩余收款金额'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.collectionAmount`)
          .d('本次收款金额'),
        type: 'number',
        name: 'paymentAmount',
        required: true,
        validator: (value, dataSet, record) => {
          const { remainingPaymentAmount, paymentAmount, applyAmount } = record.toData();
          const payAmount = decimalSum([
            math.abs(remainingPaymentAmount || 0),
            math.negated(math.abs(paymentAmount || 0)),
            math.negated(math.abs(applyAmount || 0)),
          ]);
          if (value * remainingPaymentAmount < 0) {
            return intl
              .get(`ssta.common.message.validate.sameSign.remainingCollectionAmountBy`)
              .d(`本次收款金额需与剩余收款金额同号`);
          }
          if (payAmount < 0) {
            return intl
              .get(`ssta.common.message.validate.cannotExceed.remainingCollectionAmountBt`)
              .d(`本次收款金额不得超过剩余收款金额`);
          }
          return true;
        },
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.applysCollectionAmount`)
          .d('本次预收款核销金额'),
        type: 'number',
        name: 'applyAmount',
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('ssta.supplySettle.model.supplySettle.creationDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.createdUserName').d('创建人'),
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.campMeaning').d('创建方阵营'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.button.operator').d('操作'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `/ssta/v1/${organizationId}/settle-headers/supplier/payment-by-invoice`,
          method: 'GET',
          data: filterNullValueObject({
            ...data,
            ...transformSupplierData(data.supplierCompanyId),
          }),
        };
      },
    },
  };
};

const addModalDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    primaryKey: 'settleId',
    cacheSelection: true,
    queryFields: [
      {
        name: 'documentNumList',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseBillCreate.documentNum')
          .d('对账单号'),
        multiple: ',',
      },
      {
        name: 'date',
        type: 'date',
        range: ['start', 'end'],
        dynamicProps: {
          disabled: ({ record }) => record.get('dateRange'),
        },
        defaultValue: { start: moment().subtract(6, 'month'), end: moment() },
        label: intl.get('ssta.supplySettle.model.supplySettle.date').d('结算事务日期范围'),
      },
      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.param')
          .d('输入供应商、公司、商品进行查询'),
      },
      {
        name: 'dateRange',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.dateRange').d('结算事务日期范围'),
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.item`).d('结算商品'),
        type: 'string',
        name: 'item',
      },

      {
        name: 'settleNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleTransactionNum')
          .d('结算事务编号'),
      },
      {
        name: 'sourceSettleNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.sourceSettleNum')
          .d('结算事务来源编号'),
      },
      {
        name: 'settleConfigNumLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStrategyNum').d('结算策略编码'),
        lovCode: 'SSTA.SETTLE_CONFIG',
        noCache: true,
        multiple: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'settleConfigNumList',
        bind: 'settleConfigNumLov.settleConfigNum',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.poNum`).d('采购订单编号'),
        type: 'string',
        name: 'poNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.ecPoSubNum`).d('电商子订单编号'),
        type: 'string',
        name: 'ecPoSubNum',
      },
      {
        name: 'purOrganizationIdLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.purOrganizationIdLov').d('采购组织'),
        ignore: 'always',
        noCache: true,
        multiple: true,
        lovCode: 'HPFM.PURCHASE_ORGANIZATION',
      },
      {
        name: 'purOrganizationIdList',
        bind: 'purOrganizationIdLov.purchaseOrgId',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },
      {
        name: 'agentName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.agentIdLov').d('采购员'),
      },
      {
        name: 'agentId',
        type: 'string',
        bind: 'agentIdLov.purchaseAgentId',
      },
      {
        name: 'trxTypeCodeLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.trxTypeCode').d('采购事务类型'),
        lovCode: 'SSTA.SETTLE_TRX_TYPE',
        ignore: 'always',
        noCache: true,
      },
      {
        name: 'trxTypeCode',
        bind: 'trxTypeCodeLov.rcvTypeCode',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleBasePrice`).d('结算基准价'),
        type: 'string',
        name: 'settleBasePrice',
        lookupCode: 'SSTA.BASE_PRICE',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleMode`).d('结算模式'),
        type: 'string',
        name: 'settleMode',
        lookupCode: 'SSTA.SETTLE_MODE',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimension',
        lookupCode: 'SSTA.MATCH_DIMENSION',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.billStatus`).d('对账状态'),
        type: 'string',
        name: 'billStatus',
        lookupCode: 'SSTA.SETTLE_BILL_STATUS',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.invoiceStatus`).d('开票状态'),
        type: 'string',
        name: 'invoiceStatus',
        lookupCode: 'SSTA.SETTLE_INVOICE_STATUS',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionsStatus`).d('收款状态'),
        type: 'string',
        name: 'paymentStatus',
        lookupCode: 'SSTA.SETTLE_PAYMENT_STATUS',
      },
      {
        name: 'billRemoveFlag',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.billRemoveFlag').d('对账暂挂'),
        lookupCode: 'HPFM.FLAG',
        defaultValue: 0,
        required: true,
      },
      {
        name: 'displayReverseFlag',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.displayReverseFlag')
          .d('显示已冲销数据'),
        lookupCode: 'HPFM.FLAG',
        defaultValue: 0,
        required: true,
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.sourcePlatformCode`)
          .d('数据来源系统'),
        type: 'string',
        name: 'sourcePlatformCode',
        lookupCode: 'SSTA.DATA_SOURCE_PLATFORM',
      },
      {
        name: 'supplierSiteLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.spplierSiteLov')
          .d('结算供应商地点'),
        ignore: 'always',
        noCache: true,
        multiple: true,
        lovCode: 'SSTA.SUPPLIER_SITE',
        dynamicProps: {
          disabled: ({ record }) =>
            record.get('supplierId') === undefined || record.get('supplierId') === null,
          lovPara: ({ record }) => ({
            supplierId: record.get('supplierId'),
            tenantId: organizationId,
          }),
        },
      },
      {
        name: 'supplierSiteIdList',
        bind: 'supplierSiteLov.supplierSiteId',
        transformRequest: (value) => {
          return isArray(value) ? value.join() : value;
        },
      },
    ],
    fields: [
      {
        name: 'settleNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleTransactionNum')
          .d('结算事务编号'),
      },
      {
        name: 'errorSettleNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.settleTransactionNum')
          .d('结算事务编号'),
      },
      {
        name: 'souceSettleAndLineNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.souceSettleAndLineNum')
          .d('结算事务来源编号｜行号'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.company`).d('公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.supplierCompanyName`).d('供应商名称'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.currencyCode`).d('币种'),
        type: 'string',
        name: 'currencyCode',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.itemName`).d('结算商品名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        type: 'string',
        name: 'quantity',
        label: intl.get(`ssta.supplySettle.model.supplySettle.quantity`).d('可结算数量'),
      },
      {
        type: 'string',
        name: 'invOrganizationName',
        label: intl.get(`ssta.supplySettle.model.supplySettle.invOrganizationName`).d('库存组织'),
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.taxIncludedssAmounts`)
          .d('可对账含税金额'),
        type: 'string',
        name: 'taxIncludedAmount',
      },
      {
        type: 'string',
        name: 'billStatusMeaning',
        label: intl.get(`ssta.supplySettle.model.supplySettle.billStatusMeaning`).d('对账状态'),
      },
      {
        type: 'string',
        name: 'invoiceStatusMeaning',
        label: intl.get(`ssta.supplySettle.model.supplySettle.invoiceStatusMeanings`).d('开票状态'),
      },
      {
        type: 'string',
        name: 'paymentStatusMeaning',
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.collectionStatusMeaning`)
          .d('收款状态'),
      },

      /**
       * 可对账
       */
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.netPrice`).d('不含税单价'),
        type: 'string',
        name: 'netPrice',
      },
      {
        label: intl.get(`hzero.common.view.unitPriceBatch`).d('每'),
        name: 'unitPriceBatch',
        type: 'string',
      },
      {
        label: intl.get('ssta.supplySettle.model.supplySettle.netAmount').d('不含税金额'),
        name: 'netAmount',
        type: 'string',
      },
      {
        label: intl.get('ssta.supplySettle.model.supplySettle.taxCode').d('税码'),
        name: 'taxCode',
        type: 'string',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.taxRate`).d('税率'),
        type: 'string',
        name: 'taxRate',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.taxAmount`).d('税额'),
        type: 'string',
        name: 'taxAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.taxIncludedPrice`).d('含税单价'),
        type: 'string',
        name: 'taxIncludedPrice',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.taxIncludedsAmount`)
          .d('可对账含税金额'),
        type: 'string',
        name: 'taxIncludedAmount',
      },

      /**
       * 可开票
       */

      /**
       * 可收款
       */
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.invoicedTaxIncludedAmounts`)
          .d('已开票含税金额'),
        type: 'string',
        name: 'invoiceCompletedAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.collectionOccupiedAmount`)
          .d('已收款发起金额'),
        type: 'string',
        name: 'paymentOccupiedAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.ablePayCollectionAmount`)
          .d('可收款金额'),
        type: 'string',
        name: 'ablePayAmount',
      },

      /**
       * 垃圾箱
       */
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.errorType`).d('导入失败类型'),
        type: 'string',
        name: 'errorTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.errorMsg`).d('导入失败原因'),
        type: 'string',
        name: 'errorMsg',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierSiteCode`)
          .d('供应商地点'),
        type: 'string',
        name: 'supplierSiteCode',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: (config) => {
        const { params, dataSet, data } = config;
        const {
          queryParameter: { type },
        } = dataSet;
        const url =
          type === 'C'
            ? `/ssta/v1/${organizationId}/settles/supplier/page-invoice-able`
            : `/ssta/v1/${organizationId}/settles/supplier/page-payment-able`;

        return {
          url,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            ...data,
            customizeUnitCode: [filterUnitCodesADD[type], tableUnitCodesADD[type]]
              .filter((item) => item)
              .join(),
          }),
        };
      },
    },
  };
};
const invoiceDetailDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'settleLineId',
    pageSize: 20,
    queryFields: [
      {
        name: 'date',
        type: 'date',
        range: ['start', 'end'],
        dynamicProps: {
          disabled: ({ record }) => record.get('dateRange'),
        },
        defaultValue: { start: moment().subtract(6, 'month'), end: moment() },
        label: intl.get('ssta.supplySettle.model.supplySettle.datasRanges').d('事务日期范围'),
      },

      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.supParams')
          .d('输入供应商公司、客户公司、商品进行查询'),
      },
      {
        name: 'dateRange',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.datessRanges').d('事务日期范围'),
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
      },
      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.companysId').d('客户公司'),
        lovCode: 'SPFM.USER_AUTH.CUSTOMER',
        noCache: true,
        ignore: 'always',
      },
      {
        name: 'companyId',
        bind: 'companyIdLov.companyId',
      },
      {
        name: 'supplierCompanyIdLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.supplierCompanyId').d('供应商公司'),
        lovCode: 'SSTA.USER_AUTH.COMPANY_FOR_SUPPLIER',
        // lovCode: 'SPFM.USER_AUTH.COMPANY',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId, userId },
      },
      // {
      //   name: 'supplierCompanyId',
      //   bind: 'supplierCompanyIdLov.companyId',
      //   // bind: 'supplierCompanyIdLov.companyId',
      // },
      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyIdLov.companyId',
      },
      {
        name: 'supplierCompanyNum',
        bind: 'supplierCompanyIdLov.companyNum',
      },
      {
        name: 'supplierId',
        bind: 'supplierCompanyIdLov.supplierId',
      },
      {
        name: 'supplierNum',
        bind: 'supplierCompanyIdLov.supplierNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.currencyCode`).d('币种'),
        type: 'object',
        name: 'currencyCode',
        lovCode: 'SSTA.CURRENCY',
        lovPara: { organizationId },
        transformRequest: (value) => value && value.currencyCode,
      },
      {
        name: 'itemParam',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.itemParam').d('结算商品'),
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.settleTransactionNum`)
          .d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        name: 'sourceSettleNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.sourceSettleNum')
          .d('结算事务来源编号'),
      },
      {
        name: 'settleConfigNumLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleConfigNum').d('结算策略编码'),
        lovCode: 'SSTA.SETTLE_CONFIG',
        noCache: true,
        multiple: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'settleConfigNumList',
        bind: 'settleConfigNumLov.settleConfigNum',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.poNum`).d('采购订单编号'),
        type: 'string',
        name: 'poNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.ecPoSubNum`).d('电商子订单编号'),
        type: 'string',
        name: 'ecPoSubNum',
      },
      {
        name: 'purOrganizationIdLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.purOrganizationIdLov').d('采购组织'),
        ignore: 'always',
        noCache: true,
        multiple: true,
        lovCode: 'HPFM.PURCHASE_ORGANIZATION',
      },
      {
        name: 'purOrganizationIds',
        bind: 'purOrganizationIdLov.purchaseOrgId',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },
      // {
      //   name: 'invOrganizationName',
      //   type: 'string',
      //   label: intl.get('ssta.supplySettle.model.supplySettle.invOrganizationId').d('库存组织'),
      // },
      {
        name: 'invOrganizationLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.invOrganizationLov').d('库存组织'),
        ignore: 'always',
        multiple: true,
        lovCode: 'HPFM.INV_ORGANIZATION',
      },
      {
        name: 'invOrganizationIds',
        bind: 'invOrganizationLov.organizationId',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },
      {
        name: 'purchaseAgentName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.agentIdLov').d('采购员'),
      },
      {
        name: 'trxTypeCodeLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.trxTypeCode').d('采购事务类型'),
        lovCode: 'SSTA.SETTLE_TRX_TYPE',
        ignore: 'always',
        noCache: true,
      },
      {
        name: 'trxTypeCode',
        bind: 'trxTypeCodeLov.rcvTypeCode',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleBasePrice`).d('结算基准价'),
        type: 'string',
        name: 'settleBasePrice',
        lookupCode: 'SSTA.BASE_PRICE',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleMode`).d('结算模式'),
        type: 'string',
        name: 'settleMode',
        lookupCode: 'SSTA.SETTLE_MODE',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimension',
        lookupCode: 'SSTA.MATCH_DIMENSION',
      },

      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.sourcePlatformsCode`)
          .d('数据来源系统'),
        // type: 'string',
        type: 'object',
        name: 'sourcePlatformCode',
        multiple: true,

        lovCode: 'SSTA.DATA_SOURCE',
      },
      {
        name: 'dataSourceList',
        bind: 'sourcePlatformCode.value',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },

      {
        name: 'sourcePlatformLov',
        type: 'object',
        label: intl.get(`ssta.supplySettle.model.supplySettle.sourcePlatformLov`).d('数据来源类型'),
        lovCode: 'SSTA.DATA_SOURCE_PLATFORM',
        ignore: 'always',
        multiple: true,
      },
      {
        name: 'sourcePlatformCodeList',
        bind: 'sourcePlatformLov.value',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },
      // {
      //   label: intl.get(`ssta.supplySettle.model.supplySettle.settleTypeCode`).d('结算单类型'),
      //   type: 'string',
      //   name: 'documentType',
      //   lookupCode: 'SSTA.SETTLE_TYPE',
      // },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settlesNum').d('结算单编号'),
      },
      {
        name: 'settleStatusCodeList',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
        lovCode: 'SSTA.SETTLE_STATUS',
        lovPara: { organizationId },
        // transformRequest: (value) => value && value.value,
        multiple: true,

        transformRequest: (value) =>
          isArray(value) ? value.map((item) => item.value).join() : null,
      },
      {
        name: 'camp',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.campMeaning').d('创建方阵营'),
        lookupCode: 'SSTA.CAMP',
      },
      {
        name: 'invoicePayEnableFlag',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.invoiceCollectionFlag')
          .d('启用开票并收款'),
      },
      // {
      //   name: 'settleConfigNumLov',
      //   type: 'object',
      //   label: intl.get('ssta.supplySettle.model.supplySettle.settleConfigNum').d('结算策略'),
      //   lovCode: 'SSTA.SETTLE_CONFIG',
      //   noCache: true,
      //   ignore: 'always',
      //   lovPara: { tenantId: organizationId },
      // },
      // {
      //   name: 'settleConfigNum',
      //   bind: 'settleConfigNumLov.settleConfigNum',
      // },
    ],
    fields: [
      {
        name: 'settleStatusMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleNum').d('结算单编号'),
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.lineNum`).d('结算单行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentTypeMeaning`).d('结算单类型'),
        type: 'string',
        name: 'documentTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`)
          .d('结算单类型'),
        type: 'string',
        name: 'settleTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.settleTransactionNum`)
          .d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.sourceSettleNumAndLineNum`)
          .d('结算事务来源编号｜行号'),
        type: 'string',
        name: 'sourceSettleNumAndLineNum',
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.companysNames').d('结算客户公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.suppliersCompanysName')
          .d('结算供应商公司'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.currencyCode').d('币种'),
      },
      {
        name: 'itemCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.itemCode').d('结算商品编码'),
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.itemName').d('结算商品名称'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.uom`).d('单位'),
        type: 'string',
        name: 'uom',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.sstaQuantity`).d('本次开票数量'),
        name: 'quantity',
        type: 'number',
      },
      {
        name: 'netAmount',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.netAmount').d('开票不含税总金额'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.quantity`).d('本次开票数量'),
        name: 'quantity',
        type: 'number',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.netPrice`).d('本次开票不含税单价'),
        type: 'number',
        name: 'netPrice',
      },
      {
        name: 'unitPriceBatch',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.unitPriceBatch').d('每'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.netAmounts`).d('本次开票不含税金额'),
        type: 'number',
        name: 'netAmount',
      },

      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.taxRates`).d('税率'),
        type: 'number',
        name: 'taxRate',
      },

      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.taxAmounts`).d('税额'),
        type: 'number',
        name: 'taxAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.taxIncludedsPrice`)
          .d('本次开票含税单价'),
        type: 'number',
        name: 'taxIncludedPrice',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.taxIncludedsAmounts`)
          .d('本次开票含税金额'),
        type: 'number',
        name: 'taxIncludedAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimensionMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleBasePrice`).d('结算基准价'),
        type: 'string',
        name: 'settleBasePriceMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleMode`).d('结算模式'),
        type: 'string',
        name: 'settleModeMeaning',
        // lookupCode: 'SSTA.SETTLE_MODE',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.enableQuantity`).d('可开票数量'),
        type: 'number',
        name: 'enableQuantity',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.orignPrice`).d('原开票单价'),
        type: 'number',
        name: 'orignPrice',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.enableAmount`).d('可开票金额'),
        type: 'number',
        name: 'enableAmount',
      },
      {
        name: 'invoicePayEnableFlag',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.invoiceCollectionFlag')
          .d('启用开票并收款'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.CollectionAmount`).d('本次收款金额'),
        type: 'number',
        name: 'paymentAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.applysCollectionAmount`)
          .d('本次预收款核销金额'),
        type: 'number',
        name: 'applyAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.invoicedAmount`).d('已开票含税金额'),
        type: 'number',
        name: 'invoicedAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.paidCollectionAmount`)
          .d('已收款金额'),
        type: 'number',
        name: 'paidAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.trxDate`).d('结算事务日期'),
        type: 'date',
        name: 'trxDate',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.poAndLineNum`)
          .d('采购订单编号｜行号'),
        type: 'string',
        name: 'poAndLineNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.ecPoSubNum`).d('电商子订单编号'),
        type: 'string',
        name: 'ecPoSubNum',
      },

      {
        name: 'sourceParentSettleNumAndLineNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.sourceParentSettleLineNum')
          .d('父事务编号|行号'),
      },
      {
        label: intl.get('ssta.supplySettle.model.supplySettle.asnAndLineNum').d('送货单号|行号'),
        type: 'string',
        name: 'asnAndLineNum',
      },
      {
        name: 'orderType',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.orderType').d('订单类型'),
      },
      {
        name: 'purOrganizationName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.purOrganizationId').d('采购组织'),
      },
      {
        name: 'invOrganizationName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.invOrganizationId').d('库存组织'),
      },
      {
        name: 'purchaseAgentName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.agentIdLov').d('采购员'),
      },
      {
        name: 'trxTypeCodeMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.trxTypeCodeMeaning')
          .d('采购事务类型'),
      },
      {
        name: 'dataSourceMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.dataSourceMeaning').d('数据来源系统'),
      },
      {
        name: 'sourcePlatformCodeMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.sourcePlatformCodeMeaning')
          .d('数据来源类型'),
      },
      {
        name: 'settleHeaderCreationDate',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.submitedDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.createdUserName').d('创建人'),
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.campMeaning').d('创建方阵营'),
      },
      {
        name: 'supplierSiteCode',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.supplierSiteCode')
          .d('供应商地点'),
      },
      {
        name: 'multiDealTrxNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.multiDealTrxNum')
          .d('三方交易关联事务来源编号'),
      },
      {
        name: 'multiDealTrxLineNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.multiDealTrxLineNum')
          .d('三方交易关联事务来源行'),
      },
      {
        name: 'multiDealPoNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.multiDealPoNum')
          .d('三方交易关联订单编号'),
      },
      {
        name: 'multiDealPoLineNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.multiDealPoLineNum')
          .d('三方交易关联订单行号'),
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ dataSet, data }) => {
        const {
          queryParameter: { detailType },
          reParams,
        } = dataSet;

        const customizeUnitCode =
          'SSTA.SUPPLY_SETTLE_LIST.INVOICE_LINE_GRID,SSTA.SUPPLY_SETTLE_LIST.LINE_BAR_INVOICE';

        let url = '';
        switch (detailType) {
          case 'INVOICE':
            url = `/ssta/v1/${organizationId}/settle-lines/supplier?action=${detailType}&customizeUnitCode=${customizeUnitCode}`;
            break;
          case 'PAYMENT':
            url = `/ssta/v1/${organizationId}/settle-lines/supplier?action=${detailType}&customizeUnitCode=${customizeUnitCode}`;
            break;
          case 'PREPAYMENT':
            url = `/ssta/v1/${organizationId}/pre-payment-lines/supplier`;
            break;
          case 'DIMENSION':
            url = `/ssta/v1/${organizationId}/settle-lines/mutil-payment/supplier`;
            break;

          default:
            url = `/ssta/v1/${organizationId}/settle-lines/supplier?action=INVOICE&customizeUnitCode=${customizeUnitCode}`;

            break;
        }

        // const url = `/ssta/v1/${organizationId}/settle-headers/purchaser/page?action=${detailType}&customizeUnitCode=${customizeUnitCode}`;

        delete data.date;
        delete data.dateRange;
        delete data.detailType;
        return {
          url,
          method: 'GET',
          data: filterNullValueObject({
            ...reParams,
            ...data,
            ...transformSupplierData(data.supplierCompanyId),
          }),
        };
      },
    },
  };
};
const payDetailDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'settleLineId',
    pageSize: 20,
    queryFields: [
      {
        name: 'date',
        type: 'date',
        range: ['start', 'end'],
        dynamicProps: {
          disabled: ({ record }) => record.get('dateRange'),
        },
        defaultValue: { start: moment().subtract(6, 'month'), end: moment() },
        label: intl.get('ssta.supplySettle.model.supplySettle.creates').d('事务日期范围'),
      },

      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.params')
          .d('输入供应商公司、客户公司、商品进行查询'),
      },

      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.companyId').d('客户公司'),
        lovCode: 'SPFM.USER_AUTH.CUSTOMER',
        noCache: true,
        ignore: 'always',
      },
      {
        name: 'companyId',
        bind: 'companyIdLov.companyId',
      },
      {
        name: 'supplierCompanyIdLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.supplierCompanyId').d('供应商公司'),
        lovCode: 'SSTA.USER_AUTH.COMPANY_FOR_SUPPLIER',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId, userId },
      },
      // {
      //   name: 'supplierCompanyId',
      //   // bind: 'supplierCompanyIdLov.supplierCompanyId',
      //   bind: 'supplierCompanyIdLov.companyId',
      // },
      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyIdLov.companyId',
      },
      {
        name: 'supplierCompanyNum',
        bind: 'supplierCompanyIdLov.companyNum',
      },
      {
        name: 'supplierId',
        bind: 'supplierCompanyIdLov.supplierId',
      },
      {
        name: 'supplierNum',
        bind: 'supplierCompanyIdLov.supplierNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.currencyCode`).d('币种'),
        type: 'object',
        name: 'currencyCode',
        lovCode: 'SSTA.CURRENCY',
        textField: 'currencyCode',
        lovPara: { organizationId },
        transformRequest: (value) => value && value.currencyCode,
      },
      {
        name: 'itemParam',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.itemParam').d('结算商品'),
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.settleTransactionNum`)
          .d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        name: 'sourceSettleNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.sourceSettleNum')
          .d('结算事务来源编号'),
      },
      {
        name: 'settleConfigNumLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleConfigNum').d('结算策略编码'),
        lovCode: 'SSTA.SETTLE_CONFIG',
        noCache: true,
        multiple: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'settleConfigNumList',
        bind: 'settleConfigNumLov.settleConfigNum',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.poNum`).d('采购订单编号'),
        type: 'string',
        name: 'poNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.ecPoSubNum`).d('电商子订单编号'),
        type: 'string',
        name: 'ecPoSubNum',
      },
      {
        name: 'purOrganizationIdLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.purOrganizationIdLov').d('采购组织'),
        ignore: 'always',
        noCache: true,
        multiple: true,
        lovCode: 'HPFM.PURCHASE_ORGANIZATION',
      },
      {
        name: 'purOrganizationIds',
        bind: 'purOrganizationIdLov.purchaseOrgId',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },
      // {
      //   name: 'invOrganizationName',
      //   type: 'string',
      //   label: intl.get('ssta.supplySettle.model.supplySettle.invOrganizationId').d('库存组织'),
      // },
      {
        name: 'invOrganizationLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.invOrganizationLov').d('库存组织'),
        ignore: 'always',
        multiple: true,
        lovCode: 'HPFM.INV_ORGANIZATION',
      },
      {
        name: 'invOrganizationIds',
        bind: 'invOrganizationLov.organizationId',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },
      {
        name: 'purchaseAgentName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.agentIdLov').d('采购员'),
      },
      {
        name: 'trxTypeCodeLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.trxTypeCode').d('采购事务类型'),
        lovCode: 'SSTA.SETTLE_TRX_TYPE',
        ignore: 'always',
        noCache: true,
      },
      {
        name: 'trxTypeCode',
        bind: 'trxTypeCodeLov.rcvTypeCode',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleBasePrice`).d('结算基准价'),
        type: 'string',
        name: 'settleBasePrice',
        lookupCode: 'SSTA.BASE_PRICE',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleMode`).d('结算模式'),
        type: 'string',
        name: 'settleMode',
        lookupCode: 'SSTA.SETTLE_MODE',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimension',
        lookupCode: 'SSTA.MATCH_DIMENSION',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.sourcePlatformsCode`)
          .d('数据来源系统'),
        // type: 'string',
        type: 'object',
        name: 'sourcePlatformCode',
        multiple: true,

        lovCode: 'SSTA.DATA_SOURCE',
      },
      {
        name: 'dataSourceList',
        bind: 'sourcePlatformCode.value',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },

      {
        name: 'sourcePlatformLov',
        type: 'object',
        label: intl.get(`ssta.supplySettle.model.supplySettle.sourcePlatformLov`).d('数据来源类型'),
        lovCode: 'SSTA.DATA_SOURCE_PLATFORM',
        ignore: 'always',
        multiple: true,
      },
      {
        name: 'sourcePlatformCodeList',
        bind: 'sourcePlatformLov.value',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },
      // {
      //   label: intl.get(`ssta.supplySettle.model.supplySettle.settleTypeCode`).d('结算单类型'),
      //   type: 'string',
      //   name: 'documentType',
      //   lookupCode: 'SSTA.SETTLE_TYPE',
      // },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settlesNum').d('结算单编号'),
      },
      // {
      //   name: 'settleStatus',
      //   type: 'string',
      //   label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
      //   lookupCode: 'SSTA.SETTLE_STATUS',
      // },

      {
        name: 'settleStatusCodeList',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
        lovCode: 'SSTA.SETTLE_STATUS',
        lovPara: { organizationId },
        // transformRequest: (value) => value && value.value,
        multiple: true,

        transformRequest: (value) =>
          isArray(value) ? value.map((item) => item.value).join() : null,
      },
      {
        name: 'camp',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.campMeaning').d('创建方阵营'),
        lookupCode: 'SSTA.CAMP',
      },
      {
        name: 'dateRange',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.dateRanges').d('事务日期范围'),
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
      },
    ],
    fields: [
      {
        name: 'settleStatusMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleNums').d('结算单编号'),
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.lineNum`).d('结算单行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentTypeMeaning`).d('结算单类型'),
        type: 'string',
        name: 'documentTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`)
          .d('结算单类型'),
        type: 'string',
        name: 'settleTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.settleTransactionNum`)
          .d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.sourceSettleNumAndLineNum`)
          .d('结算事务来源编号｜行号'),
        type: 'string',
        name: 'sourceSettleNumAndLineNum',
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.companyssName').d('结算客户公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.supplierCompanyssName')
          .d('结算供应商公司'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.currencyCode').d('币种'),
      },
      {
        name: 'itemCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.itemCode').d('结算商品编码'),
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.itemName').d('结算商品名称'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.uom`).d('单位'),
        type: 'string',
        name: 'uom',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.invoiceApplySettleNum`)
          .d('发票申请结算单号'),
        type: 'string',
        name: 'sourceSettleHeaderNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.CollectionsAmount`).d('本次收款金额'),
        type: 'number',
        name: 'paymentAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.applysCollectionAmount`)
          .d('本次预收款核销金额'),
        type: 'number',
        name: 'applyAmount',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.invoicedAmount`).d('已开票含税金额'),
        type: 'number',
        name: 'invoicedAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.paidCollectionAmount`)
          .d('已收款金额'),
        type: 'number',
        name: 'paidAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimensionMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleBasePrice`).d('结算基准价'),
        type: 'string',
        name: 'settleBasePriceMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleMode`).d('结算模式'),
        type: 'string',
        name: 'settleModeMeaning',
        // lookupCode: 'SSTA.SETTLE_MODE',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.trxDate`).d('结算事务日期'),
        type: 'date',
        name: 'trxDate',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.poAndLineNum`).d('采购订单编号|行号'),
        type: 'string',
        name: 'poAndLineNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.ecPoSubNum`).d('电商子订单编号'),
        type: 'string',
        name: 'ecPoSubNum',
      },

      {
        name: 'sourceParentSettleNumAndLineNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.sourceParentSettlesLineNum')
          .d('父事务编号|行号'),
      },
      {
        label: intl.get('ssta.supplySettle.model.supplySettle.asnAndLineNum').d('送货单号|行号'),
        type: 'string',
        name: 'asnAndLineNum',
      },
      {
        name: 'orderType',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.orderType').d('订单类型'),
      },
      {
        name: 'purOrganizationName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.purOrganizationId').d('采购组织'),
      },
      {
        name: 'invOrganizationName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.invOrganizationId').d('库存组织'),
      },
      {
        name: 'purchaseAgentName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.agentIdLov').d('采购员'),
      },
      {
        name: 'trxTypeCodeMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.trxTypeCodeMeaning')
          .d('采购事务类型'),
      },
      {
        name: 'dataSourceMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.dataSourceMeaning').d('数据来源系统'),
      },
      {
        name: 'sourcePlatformCodeMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.sourcePlatformCodeMeaning')
          .d('数据来源类型'),
      },
      {
        name: 'settleHeaderCreationDate',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.submitedDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.createdUserName').d('创建人'),
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.campMeaning').d('创建方阵营'),
      },
      {
        name: 'supplierSiteCode',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.supplierSiteCode')
          .d('供应商地点'),
      },
      {
        name: 'multiDealTrxNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.multiDealTrxNum')
          .d('三方交易关联事务来源编号'),
      },
      {
        name: 'multiDealTrxLineNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.multiDealTrxLineNum')
          .d('三方交易关联事务来源行'),
      },
      {
        name: 'multiDealPoNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.multiDealPoNum')
          .d('三方交易关联订单编号'),
      },
      {
        name: 'multiDealPoLineNum',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.multiDealPoLineNum')
          .d('三方交易关联订单行号'),
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ data, dataSet }) => {
        const { reParams } = dataSet;
        const customizeUnitCode =
          'SSTA.SUPPLY_SETTLE_LIST.PAYMENT_GRID,SSTA.SUPPLY_SETTLE_LIST.LINE_BAR_PAYMENT';
        const url = `/ssta/v1/${organizationId}/settle-lines/supplier?action=PAYMENT&customizeUnitCode=${customizeUnitCode}`;
        delete data.date;
        delete data.dateRange;
        delete data.detailType;
        return {
          url,
          method: 'GET',
          data: filterNullValueObject({
            ...reParams,
            ...data,
            ...transformSupplierData(data.supplierCompanyId),
          }),
        };
      },
    },
  };
};
/**
 * 明细预收款结算单行查询
 * @returns
 */
const preDetailDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'prepaymentLineId',
    pageSize: 20,
    queryFields: [
      {
        name: 'date',
        type: 'date',
        range: ['start', 'end'],
        dynamicProps: {
          disabled: ({ record }) => record.get('dateRange'),
        },
        defaultValue: { start: moment().subtract(6, 'month'), end: moment() },
        label: intl.get('ssta.supplySettle.model.supplySettle.creates').d('事务日期范围'),
      },

      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.supsparams')
          .d('输入供应商公司、客户公司进行查询'),
      },

      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.companyssId').d('客户公司'),
        lovCode: 'SPFM.USER_AUTH.CUSTOMER',
        noCache: true,
        ignore: 'always',
      },
      {
        name: 'companyId',
        bind: 'companyIdLov.companyId',
      },
      {
        name: 'supplierCompanyIdLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.supplierCompanyId').d('供应商公司'),
        lovCode: 'SSTA.USER_AUTH.COMPANY_FOR_SUPPLIER',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId, userId },
      },
      // {
      //   name: 'supplierCompanyId',
      //   bind: 'supplierCompanyIdLov.companyId',
      // },
      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyIdLov.companyId',
      },
      {
        name: 'supplierCompanyNum',
        bind: 'supplierCompanyIdLov.companyNum',
      },
      {
        name: 'supplierId',
        bind: 'supplierCompanyIdLov.supplierId',
      },
      {
        name: 'supplierNum',
        bind: 'supplierCompanyIdLov.supplierNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.currencyCode`).d('币种'),
        type: 'object',
        name: 'currencyCode',
        lovCode: 'SSTA.CURRENCY',
        lovPara: { organizationId },
        transformRequest: (value) => value && value.currencyCode,
      },

      {
        name: 'prepaymentType',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.collectionType').d('预收款类型'),

        lookupCode: 'SSTA.PREPAYMENT_TYPE',
      },
      {
        name: 'associateNum',
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateNum`).d('关联单据号'),
        type: 'string',
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleNum').d('结算单编号'),
      },
      // {
      //   name: 'settleStatus',
      //   type: 'string',
      //   label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
      //   lookupCode: 'SSTA.SETTLE_STATUS',
      // },
      {
        name: 'settleStatusCodeList',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
        lovCode: 'SSTA.SETTLE_STATUS',
        lovPara: { organizationId },
        // transformRequest: (value) => value && value.value,
        multiple: true,

        transformRequest: (value) =>
          isArray(value) ? value.map((item) => item.value).join() : null,
      },
      {
        name: 'camp',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.campMeaning').d('创建方阵营'),
        lookupCode: 'SSTA.CAMP',
      },
      {
        name: 'dateRange',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.datesRange').d('创建日期范围'),
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
      },
    ],
    fields: [
      {
        name: 'settleStatusMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settlesNum').d('结算单编号'),
      },

      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.lineNum`).d('结算单行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        type: 'string',
        name: 'operation',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentTypeMeaning`).d('结算单类型'),
        type: 'string',
        name: 'documentTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`)
          .d('结算单类型'),
        type: 'string',
        name: 'settleTypeMeaning',
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.companyssName').d('结算客户公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.supplierCompanyssName')
          .d('结算供应商公司'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.currencyCode').d('币种'),
      },
      {
        name: 'prepaymentTypeMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.collectionType').d('预收款类型'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionTypeName`).d('收款方式'),
        type: 'string',
        name: 'paymentTypeName',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionCondition`).d('收款条件'),
        type: 'string',
        name: 'paymentTermName',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.expectCollectionDate`)
          .d('期望收款日期'),
        type: 'date',
        name: 'expectPaymentDate',
      },
      {
        name: 'associateNum',
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateNum`).d('关联单据号'),
        type: 'string',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateAmount`).d('关联单据金额'),
        type: 'string',
        name: 'associateAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.preCollectionAmoun`)
          .d('预收款行金额'),
        type: 'number',
        name: 'prepaymentAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.prepaymentApplyAmount`)
          .d('已核销金额'),
        type: 'string',
        name: 'prepaymentApplyAmount',
      },
      {
        name: 'settleHeaderCreationDate',

        type: 'dateTime',
        label: intl.get('ssta.supplySettle.model.supplySettle.submitedDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.createdUserName').d('创建人'),
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.campMeaning').d('创建方阵营'),
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ data, dataSet }) => {
        const { reParams } = dataSet;

        const customizeUnitCode =
          'SSTA.SUPPLY_SETTLE_LIST.LINE_BAR_PREPAYMENT, SSTA.SUPPLY_SETTLE_LIST.PREPAYMENT_GRID';

        const url = `/ssta/v1/${organizationId}/pre-payment-lines/supplier?customizeUnitCode=${customizeUnitCode}`;

        // const url = `/ssta/v1/${organizationId}/settle-headers/purchaser/page?action=${detailType}&customizeUnitCode=${customizeUnitCode}`;
        data.settleHeaderCreationDateFrom =
          data.date &&
          data.date.start &&
          `${moment(data.date.start, getDateFormat()).format(DEFAULT_DATE_FORMAT)} 00:00:00`;
        data.settleHeaderCreationDateTo =
          data.date &&
          data.date.end &&
          `${moment(data.date.end, getDateFormat()).format(DEFAULT_DATE_FORMAT)} 23:59:59`;
        delete data.date;
        delete data.dateRange;
        delete data.detailType;
        return {
          url,
          method: 'GET',
          data: filterNullValueObject({
            ...reParams,
            ...data,
            ...transformSupplierData(data.supplierCompanyId),
          }),
        };
      },
    },
  };
};
/**
 * 明细多维度收款行查询
 * @returns
 */
const demensionDetailDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'dimensionKey',
    pageSize: 20,
    queryFields: [
      {
        name: 'date',
        type: 'date',
        range: ['start', 'end'],
        dynamicProps: {
          disabled: ({ record }) => record.get('dateRange'),
        },
        defaultValue: { start: moment().subtract(6, 'month'), end: moment() },
        label: intl.get('ssta.supplySettle.model.supplySettle.create').d('事务日期范围'),
      },

      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.supparams')
          .d('输入供应商公司、客户公司进行查询'),
      },

      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.companysId').d('客户公司'),
        lovCode: 'SPFM.USER_AUTH.CUSTOMER',
        noCache: true,
        ignore: 'always',
      },
      {
        name: 'companyId',
        bind: 'companyIdLov.companyId',
      },
      {
        name: 'supplierCompanyIdLov',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.supplierCompanyId').d('供应商公司'),
        lovCode: 'SSTA.USER_AUTH.COMPANY_FOR_SUPPLIER',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId, userId },
      },
      // {
      //   name: 'supplierCompanyId',
      //   bind: 'supplierCompanyIdLov.companyId',
      // },
      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyIdLov.companyId',
      },
      {
        name: 'supplierCompanyNum',
        bind: 'supplierCompanyIdLov.companyNum',
      },
      {
        name: 'supplierId',
        bind: 'supplierCompanIdyLov.supplierId',
      },
      {
        name: 'supplierNum',
        bind: 'supplierCompanyIdLov.supplierNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.currencyCode`).d('币种'),
        type: 'object',
        name: 'currencyCode',
        lovCode: 'SSTA.CURRENCY',
        lovPara: { organizationId },
        transformRequest: (value) => value && value.currencyCode,
      },
      {
        name: 'paymentDimension',
        type: 'string',
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionRangeCode`).d('收款维度'),
        lookupCode: 'SSTA.PAYMENT_DIMENSION',
        // defaultValue: paymentDimension,
        // disabled: type !== 'UPDATE',
      },
      {
        name: 'documentNum',
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateNums`).d('关联单据编号'),
        type: 'string',
      },

      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleHeaderNum').d('结算单编号'),
      },
      // {
      //   name: 'settleStatus',
      //   type: 'string',
      //   label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
      //   lookupCode: 'SSTA.SETTLE_STATUS',
      // },
      {
        name: 'settleStatusCodeList',
        type: 'object',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
        lovCode: 'SSTA.SETTLE_STATUS',
        lovPara: { organizationId },
        // transformRequest: (value) => value && value.value,
        multiple: true,

        transformRequest: (value) =>
          isArray(value) ? value.map((item) => item.value).join() : null,
      },

      {
        name: 'camp',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.campMeaning').d('创建方阵营'),
        lookupCode: 'SSTA.CAMP',
      },
      {
        name: 'dateRange',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.datessRange').d('创建日期范围'),
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
      },
    ],
    fields: [
      {
        name: 'settleStatusMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleHeaderNum').d('结算单编号'),
      },
      {
        name: 'preColWriteOff',
        type: 'string',
        label: intl.get(`ssta.supplySettle.button.preColWriteOff`).d('预收款核销'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentTypeMeaning`).d('结算单类型'),
        type: 'string',
        name: 'documentTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`)
          .d('结算单类型'),
        type: 'string',
        name: 'settleTypeMeaning',
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.companyssNames').d('结算客户公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.supplierCompanyssName')
          .d('结算供应商公司'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.currencyCode').d('币种'),
      },

      {
        name: 'paymentDimensionMeaning',
        type: 'string',
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionRangeCode`).d('收款维度'),
      },

      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateNumd`).d('关联单据编号'),
        type: 'string',
        name: 'documentNum',
      },

      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.invoicedAmount`).d('已开票含税金额'),
        type: 'number',
        name: 'invoicedTaxIncludedAmount',
      },
      {
        name: 'remainingPaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.remainingCollectionAmount')
          .d('剩余可收款金额'),
      },

      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.collectionAmountBy`)
          .d('本次收款金额'),
        type: 'number',
        name: 'paymentAmount',
      },
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.collectionPreAmount`)
          .d('本次预收款核销金额'),
        type: 'number',
        name: 'applyAmount',
      },

      {
        name: 'paymentSpliteRuleMeaning',
        type: 'string',
        label: intl
          .get('ssta.supplySettle.model.supplySettle.collectionSpliteRule')
          .d('收款自动拆分规则'),
      },
      {
        name: 'settleHeaderCreationDate',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.submitedDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.createdUserName').d('创建人'),
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.campMeaning').d('创建方阵营'),
      },
    ],
    transport: {
      /**
       * 查询
       */
      // eslint-disable-next-line
      read: ({ data, dataSet }) => {
        const { reParams } = dataSet;

        const customizeUnitCode =
          'SSTA.SUPPLY_SETTLE_LIST.DEMENSION_GRID,SSTA.SUPPLY_SETTLE_LIST.LINE_BAR_DEMENSION';

        const url = `/ssta/v1/${organizationId}/settle-lines/mutil-payment/supplier?customizeUnitCode=${customizeUnitCode}`;

        // const url = `/ssta/v1/${organizationId}/settle-headers/purchaser/page?action=${detailType}&customizeUnitCode=${customizeUnitCode}`;

        delete data.date;
        delete data.dateRange;
        delete data.detailType;
        return {
          url,
          method: 'GET',
          data: filterNullValueObject({
            ...reParams,
            ...data,
            ...transformSupplierData(data.supplierCompanyId),
          }),
        };
      },
    },
  };
};

const batchModifyDS = (headerDs, lineDs) => {
  const { amountPrecision, settleHeaderId } =
    headerDs.current?.get(['amountPrecision', 'settleHeaderId']) || {};
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.preCollectionAmountBt`)
          .d('预收款金额'),
        name: 'prepaymentAmount',
        type: 'number',
        computedProps: {
          formatterOptions: ({ value }) => numberFormatterOptions(value, amountPrecision),
        },
      },
    ],
    transport: {
      submit: ({ data, params }) => {
        const { selected, unSelected } = lineDs;
        let checkedPrePaymentLineList = [];
        let newPrePaymentLineList = [];
        let customizeUnitCode = 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_BATCH_MODIFY_LINE';
        let searchBarData = {};
        if (selected.length === 0) {
          // 如果没有勾选，需要过滤出没有行id（点新增未保存）的数据 checkedPrePaymentLineList，newPrePaymentLineList
          newPrePaymentLineList = lineDs
            .filter((v) => !v?.get('prepaymentLineId'))
            .map((item) => ({ ...item.toData(), settleHeaderId }));
          customizeUnitCode = `${customizeUnitCode},SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTIONDETAIL,SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTION_DETAIL_SEARCH`;
          searchBarData = lineDs.queryDataSet?.current?.toData() || {};
          delete searchBarData.__dirty;
        } else {
          // 如果选中了，需要把选中数据放到checkedPrePaymentLineList，未选中数据中新增的放到newPrePaymentLineList
          checkedPrePaymentLineList = selected.map((item) => ({
            ...item.toData(),
            settleHeaderId,
          }));
          newPrePaymentLineList = unSelected
            .filter((v) => !v?.get('prepaymentLineId'))
            .map((item) => ({ ...item.toData(), settleHeaderId }));
        }
        return {
          url: `/ssta/v1/${organizationId}/pre-payment-lines/batch/edit`,
          method: 'PUT',
          data: { ...data[0], settleHeaderId, newPrePaymentLineList, checkedPrePaymentLineList },
          params: {
            ...params,
            ...searchBarData,
            customizeUnitCode,
          },
        };
      },
    },
  };
};

export {
  tableDS,
  headerDS,
  filledInfoDs,
  lineDS,
  recordDS,
  showDS,
  prePaymentHeaderDS,
  prePaymentFilledInfoDs,
  prePaymentLineDS,
  taxDS,
  taxLineDS,
  prepaymentDS,
  multiDimensionDS,
  prepaymentAddDS,
  paymentInfoDS,
  multiPrepaymentAddDS,
  multiPrepaymentDS,
  currencyDS,
  paymentInvoiceDS,
  addModalDS,
  invoiceDetailDS,
  payDetailDS,
  preDetailDS,
  demensionDetailDS,
  taxRecordDS,
  batchModifyDS,
};
