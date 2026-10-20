/* eslint-disable no-param-reassign */
import moment from 'moment';
import { isArray } from 'lodash';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import { settleLineConfig, decimalSum } from '@/utils/amountConfig';
import {
  transformSupplierData,
  numberFormatterOptions,
  amountFormatterOptions,
} from '@/utils/utils';
// import { decimalPointAccuracy, getUrlVars } from '@/routes/utils';
// import { dateTimeRender } from 'utils/renderer';

// const tableUnitCodes = {
//   C: 'SSTA.PURCHASE_POOL_LIST.INVOICE_GRID',
//   D: 'SSTA.PURCHASE_POOL_LIST.PAYMENT_GRID',
// };

// const filterUnitCodes = {
//   C: 'SSTA.PURCHASE_POOL_LIST.INVOICE_FILTER',
//   D: 'SSTA.PURCHASE_POOL_LIST.PAYMENT_FILTER',
// };

const tableUnitCodesADD = {
  C: 'SSTA.PURCHASE_SETTLE_DETAIL.ADD.INVOICE',
  D: 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT.ADD.LIST',
};

const filterUnitCodesADD = {
  C: 'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_INV',
  D: 'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_PAY',
};

const organizationId = getCurrentOrganizationId();

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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createDate').d('创建日期范围'),
      },
      // {
      //   name: 'createDateFrom',
      //   type: 'dateTime',
      //   label: intl
      //     .get('ssta.purchaseSettle.model.purchaseSettle.createDateFrom')
      //     .d('创建日期从'),
      // },
      // {
      //   name: 'createDateTo',
      //   type: 'dateTime',
      //   label: intl
      //     .get('ssta.purchaseSettle.model.purchaseSettle.createDateTo')
      //     .d('创建日期至'),
      // },
      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.param')
          .d('输入供应商、公司、结算策略进行查询'),
      },
      {
        name: 'dateRange',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.dateRange').d('结算事务日期范围'),
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
      },
      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleCompany').d('结算公司'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.supplier').d('供应商'),
        lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplierCompanyIdLov.supplierCompanyId',
      },

      {
        name: 'supplierCompanyNum',
        bind: 'supplierCompanyIdLov.supplierCompanyNum',
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
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.currencyCode`).d('币种'),
        type: 'object',
        name: 'currencyCode',
        lovCode: 'SSTA.CURRENCY',
        lovPara: { organizationId },
        transformRequest: (value) => value && value.currencyCode,
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.settleTypeCode`).d('结算单类型'),
        type: 'string',
        name: 'documentType',
        lookupCode: 'SSTA.SETTLE_TYPE',
      },
      {
        name: 'settleNum',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleNum').d('结算单编号'),
      },
      {
        name: 'settleStatus',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
      {
        name: 'camp',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.campMeaning').d('创建方阵营'),
        lookupCode: 'SSTA.CAMP',
      },
      {
        name: 'isPrint',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.isPrint').d('打印状态'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'settleConfigNumLov',
        type: 'object',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStrategy').d('结算策略'),
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
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.invOrganizationLov`)
          .d('库存组织'),
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
          .get(`ssta.purchaseSettle.model.purchaseSettle.sourceSupplierName`)
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleNum').d('结算单编号'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`)
          .d('结算单类型'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleCompany').d('结算公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleSupplier').d('结算供应商'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.currencyCode').d('币种'),
      },
      {
        name: 'netAmount',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.netAmount').d('开票不含税总金额'),
      },
      {
        name: 'taxAmount',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.taxAmount').d('开票总税额'),
      },
      {
        name: 'taxIncludedAmount',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoicedAmountTaxIncluding')
          .d('开票含税总金额'),
      },
      {
        name: 'paymentAmount',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.paymentAmount').d('总付款金额'),
      },
      {
        name: 'applyAmount',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.applyAmount')
          .d('预付款核销总金额'),
      },
      {
        name: 'prepaymentAmount',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.prepaymentAmount')
          .d('预付款总金额'),
      },
      {
        name: 'settleStatusMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
      },
      {
        name: 'syncStatusMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.syncStatusMeaning')
          .d('同步ERP状态'),
      },
      {
        name: 'syncResponseMsg',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.processRemark').d('反馈信息'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.submitedDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createdUserName').d('创建人'),
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.campMeaning').d('创建方阵营'),
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
          .get('ssta.purchaseSettle.model.purchaseSettle.sourceSupplierName')
          .d('数据源平台供应商名称'),
      },
      {
        name: 'sourceSupplierCompanyNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.sourceSupplierCompanyNum')
          .d('数据源平台供应商编码'),
      },
      {
        name: 'confirmCollaborativeMode',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.confirmCollaborativeModes')
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

        const url = `/ssta/v1/${organizationId}/settle-headers/purchaser/page?action=${action}`;
        delete data.action;
        return {
          url,
          method: 'GET',
          data: filterNullValueObject({
            ...data,
            ...transformSupplierData(data.supplierCompanyId),
            ...reParams,
          }),
        };
      },
    },
  };
};

const recordDS = (paramData) => {
  const { lookupCode, isFilter = false, lovPara = {} } = paramData || {};
  return {
    selection: false,
    autoQuery: false,
    pageSize: 0,
    queryFields: [
      lookupCode && {
        name: 'processStatus',
        display: true,
        noCache: true,
        lookupCode,
        label: intl.get('ssta.common.operate.processStatus').d('操作节点'),
        lovPara,
      },
      {
        name: 'dateRange',
        label: intl.get('ssta.common.model.message.trxDate').d('操作时间'),
        type: 'date',
        range: ['form', 'to'],
        ignore: 'always',
        display: true,
      },
    ].filter((item) => !!item),
    fields: [
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.processUser`).d('操作人'),
        type: 'string',
        name: 'processUser',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.processDate`).d('操作日期'),
        type: 'string',
        name: 'processDate',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.processStatusMeaning`).d('动作'),
        type: 'string',
        name: 'processStatusMeaning',
      },
      // {
      //   label: intl
      //     .get(`ssta.purchaseSettle.purchaseSettle.recordId`)
      //     .d('事务单号｜行号'),
      //   type: 'string',
      //   name: 'recordId',
      // },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.processRemark`)
          .d('说明'),
        type: 'string',
        name: 'processRemark',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ dataSet, params }) => {
        const {
          queryParameter: { settleHeaderId },
        } = dataSet;
        const { dateRange, ...other } = dataSet?.queryDataSet?.current?.toData() || {};
        const dateFromTo = dateRange?.split(',') || [];
        const queryParams = filterNullValueObject({
          ...params,
          processDateFrom: dateFromTo[0] ? moment(dateFromTo[0]).format(DATETIME_MIN) : undefined,
          processDateTo: dateFromTo[1] ? moment(dateFromTo[1]).format(DATETIME_MAX) : undefined,
          ...other,
        });
        delete queryParams.__dirty;
        const url = `/ssta/v1/${organizationId}/settle-header-actions/${settleHeaderId}`;
        return {
          url: isFilter ? `${url}/new` : url,
          method: 'GET',
          params: queryParams,
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
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.processUser`).d('操作人'),
        type: 'string',
        name: 'processUser',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.processDate`).d('操作日期'),
        type: 'string',
        name: 'processDate',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.processStatusMeaning`).d('动作'),
        type: 'string',
        name: 'processStatusMeaning',
      },
      // {
      //   label: intl
      //     .get(`ssta.purchaseSettle.purchaseSettle.recordId`)
      //     .d('事务单号｜行号'),
      //   type: 'string',
      //   name: 'recordId',
      // },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.processRemark`)
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
      customizeUnitCode: 'SSTA.PURCHASE_SETTLE_LIST.VIEWPAYMENTRECORDS',
    },
    fields: [
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.settleHeaderId`).d('结算单头ID'),
        type: 'string',
        name: 'settleHeaderId',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.erpPaymentNum`).d('ERP付款单号'),
        type: 'string',
        name: 'erpPaymentNum',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.paymentAmount`).d('付款金额'),
        type: 'string',
        name: 'paymentAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.paymentDate`).d('付款日期'),
        type: 'date',
        format: 'YYYY-MM-DD',
        name: 'paymentDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentType`)
          .d('付款类型'),
        type: 'string',
        name: 'paymentTypeMeaning',
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
        const url = `/ssta/v1/${organizationId}/payment-records/${settleHeaderId}/show`;
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleNum').d('结算单编号'),
      },
      {
        name: 'documentTypeMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.documentType').d('结算单类型'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.camp').d('创建方阵营'),
      },
      {
        name: 'settleStatus',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.creationDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createdUserName').d('创建人'),
      },

      /**
       * 交易方信息
       */
      {
        name: 'companyNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleCompanyNum')
          .d('结算公司编号'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleCompanyName')
          .d('结算公司名称'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.currencyCode').d('币种'),
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleSupplierNum')
          .d('结算供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleSupplierName')
          .d('结算供应商名称'),
      },
      {
        name: 'sourceSupplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.sourceSupplierName')
          .d('数据源平台供应商名称'),
      },
      {
        name: 'sourceSupplierCompanyNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.sourceSupplierCompanyNum')
          .d('数据源平台供应商编码'),
      },
      {
        name: 'ouName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettlePool.ouName').d('业务实体'),
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
          .get('ssta.purchaseSettle.model.purchaseSettle.settleNetAmount')
          .d('结算不含税总金额'),
      },
      {
        name: 'settleTaxAmount',
        type: 'number',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleTaxAmount').d('结算总税额'),
      },
      {
        name: 'settleTaxIncludedAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleTaxIncludedAmount')
          .d('结算含税总金额'),
      },
      {
        name: 'invoicedNetAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoicedNetAmount')
          .d('已开票不含税总金额'),
      },
      {
        name: 'invoicedTaxAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoicedTaxAmount')
          .d('已开票税额'),
      },
      {
        name: 'invoicedTaxIncludedAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoicedTaxIncludedAmounts')
          .d('已开票含税金额'),
      },
      {
        name: 'paidAmount',
        type: 'number',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.paidAmount').d('已付款金额'),
      },
      {
        name: 'remainingPaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.remainingPaymentAmount')
          .d('剩余付款金额'),
      },
      /**
       * 开票信息 -- 系统
       */
      {
        name: 'netAmount',
        type: 'number',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.netAmount').d('开票不含税总金额'),
      },
      {
        name: 'taxAmount',
        type: 'number',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.taxAmount').d('开票总税额'),
      },
      {
        name: 'taxIncludedAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoiceTaxIncludedAmountss')
          .d('开票含税总金额'),
      },

      /**
       * 发票匹配信息
       */
      {
        name: 'invoiceNetAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoiceNetAmount')
          .d('发票不含税总金额'),
      },
      {
        name: 'invoiceTaxAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoiceTaxAmount')
          .d('发票总税额'),
      },
      {
        name: 'invoiceTaxIncludedAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoiceTaxIncludedAmountss')
          .d('开票含税总金额'),
      },
      {
        name: 'invoiceDifferenceAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoiceDifferenceAmount2')
          .d('发票尾差值'),
      },
      {
        name: 'invoiceSpliteRule',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoiceSpliteRule')
          .d('发票自动拆分规则'),
        lookupCode: 'SSTA.AUTO_SPLIT_RULE_INV',
      },

      /**
       * 预付款核销信息
       */
      {
        name: 'applyAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.applyAmount')
          .d('预付款核销总金额'),
      },

      /**
       * 付款信息
       */
      {
        name: 'paymentAmount',
        type: 'number',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.paymentAmount').d('付款总金额'),
      },
      {
        name: 'paymentSpliteRule',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.paymentSpliteRule')
          .d('付款自动拆分规则'),
        lookupCode: 'SSTA.AUTO_SPLIT_RULE',
      },

      /**
       * 主策略信息
       */
      {
        name: 'settleConfigNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.mainSettleStrategyNum')
          .d('主结算策略编码'),
      },
      {
        name: 'settleConfigName',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.mainSettleStrategyName')
          .d('主结算策略名称'),
      },
      {
        name: 'configVersionNumber',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.configVersionNumber')
          .d('主结算策略版本号'),
      },

      {
        name: 'confirmCollaborativeModeMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.confirmCollaborativeModeMeaning')
          .d('协同模式-确认'),
      },
      {
        name: 'invoiceMatchMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.invoiceMatch').d('发票匹配规则'),
      },
      {
        name: 'confirmApproveMethodMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.confirmApproveMethodMeaning')
          .d('审批方式-确认'),
      },
      {
        name: 'cancelCollaborativeModeMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.cancelCollaborativeModeMeaning')
          .d('协同模式-取消'),
      },
      {
        name: 'cancelApproveMethodMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.cancelApproveMethodMeaning')
          .d('审批方式-取消'),
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
        name: 'amountValidateLevelMeaning',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle..validateLevel`)
          .d('尾差校验等级'),
      },
      {
        name: 'amountValidateAction',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.validateAction`)
          .d('尾差校验节点'),
        multiple: true,
        lookupCode: 'SSTA.AMOUNT_VALIDATE_ACTION',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        transformResponse: (value) => (value && !isArray(value) ? value.split(',') : []),
      },
      {
        name: 'amountAdjustFlag',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.amountAdjustFlag`)
          .d('尾差自动调整'),
        lookupCode: 'HPFM.FLAG',
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
      {
        name: 'amountAdjustModeMeaning',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.adjustMode`).d('尾差分摊模式'),
      },
      {
        name: 'amountAdjustRuleMeaning',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.adjustRule`).d('尾差分摊规则'),
      },
      {
        name: 'defaultPaymentDimensionMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.defaultPaymentDimensionMeaning')
          .d('付款维度【默认】'),
      },
      {
        name: 'defaultPaymentSpliteRuleMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.defaultPaymentSpliteRule')
          .d('付款自动拆分规则【默认】'),
      },
      {
        name: 'defaultPrepaymentSpliteRuleMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.defaultPrepaymentSpliteRule')
          .d('预付款核销自动拆分规则【默认】'),
      },
      {
        name: 'auto',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.auto').d('自动出单'),
      },
      {
        name: 'lineLimitQuantity',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.lineLimitQuantity')
          .d('结算单行数限制'),
      },
      {
        name: 'invoicePayEnableFlag',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoicePayEnableFlag')
          .d('启用开票并付款'),
      },
      {
        name: 'prepaymentDimensionMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.prepaymentDimension')
          .d('预付款核销维度'),
      },
      {
        name: 'prepaymentCheckLevel',
        type: 'string',
        lookupCode: 'SSTA.PREPAYMENT_CHECK_LEVEL',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.prepaymentCheckLevel')
          .d('预付款核销校验等级'),
      },
      {
        name: 'prepaymentCheckPoint',
        type: 'string',
        lookupCode: 'SSTA.PREPAYMENT_CHECK_PIONT',
        multiple: true,
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.prepaymentCheckPoint')
          .d('预付款核销校验节点'),
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
      /**
       * 直连开票信息
       */
      {
        name: 'directInvoicingTypeMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.directInvoicingTypeMeaning')
          .d('直连开票类型'),
      },
      {
        name: 'invoiceTypeMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoiceTypeMeaning')
          .d('开票类型'),
      },
      {
        name: 'invoiceMethodMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.invoiceMethod').d('开票方式'),
      },
      {
        name: 'taxRegistrationNumber',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.taxRegistrationNumber')
          .d('购方税号'),
      },
      {
        name: 'supplierTaxRegistrationNumber',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.supplierTaxRegistrationNumber')
          .d('销方税号'),
      },
      {
        name: 'contactName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.contactName').d('联系人'),
        bind: 'regionLov.contactName',
      },
      {
        name: 'regionLov',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.regionName').d('收单地区'),
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
      //   type: '',
      //   label: intl.get('ssta.purchaseSettle.model.purchaseSettle.regionName').d('收单地区'),
      // },
      {
        name: 'address',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.address').d('详细地址'),
        bind: 'regionLov.address',
      },
      {
        name: 'mobile',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.mobile').d('手机号'),
        bind: 'regionLov.mobile',
      },
      {
        name: 'invoiceContent',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.invoiceContent').d('开票内容'),
      },
      {
        name: 'invoiceContentDetail',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoiceContentDetail')
          .d('开票内容详情'),
      },
      {
        name: 'invoiceFailMsg',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoiceFailMsg')
          .d('直连开票失败原因'),
      },
      /**
       * 其他信息
       */
      {
        name: 'remark',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.remark').d('备注'),
      },
      {
        name: 'canceledReason',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.canceledReason').d('取消原因'),
      },
      {
        name: 'approvedRemark',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.approvedRemark')
          .d('审批意见-确认'),
      },
      {
        name: 'canceledRemark',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.canceledRemark')
          .d('审批意见-取消'),
      },
      {
        name: 'accountingDate',
        type: 'date',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.accountingDate').d('记账日期'),
      },
      {
        name: 'termCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.termCode').d('付款条件'),
      },
      {
        name: 'invOrganizationName',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invOrganizationName')
          .d('库存组织'),
      },
      {
        name: 'sourceSettleNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSettleNum')
          .d('结算事务来源编号'),
      },
      {
        name: 'purOrganizationName',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.purchOrganizationName')
          .d('采购组织'),
      },
      {
        name: 'supplierSiteCode',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.supplierSiteCode')
          .d('供应商地点'),
      },
      /**
       * 附件
       */
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.purchaserEnclosure')
          .d('采购方附件'),
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
          url: `/ssta/v1/${organizationId}/bill-headers/purchaser`,
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
        name: 'accountingDate',
        type: 'date',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.accountingDate').d('记账日期'),
      },
      {
        name: 'canceledReason',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.canceledReason').d('取消原因'),
      },
      {
        name: 'approvedRemark',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.approvedRemark')
          .d('审批意见-确认'),
      },
      {
        name: 'canceledRemark',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.canceledRemark')
          .d('审批意见-取消'),
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
    dataToJSON: 'dirty',
    forceValidate: true,
    autoQueryAfterSubmit: false,
    fields: [
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.lineNum`).d('结算单行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.settleTransactionNum`)
          .d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.sourceSettleNumAndLineNum`)
          .d('结算事务来源编号｜行号'),
        type: 'string',
        name: 'sourceSettleNumAndLineNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.itemCode`)
          .d('结算商品编码'),
        type: 'string',
        name: 'itemCode',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.itemName`).d('结算商品名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.sourceSettleNum`).d('发票申请结算单号'),
        type: 'string',
        name: 'sourceSettleHeaderNum',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.common.quantity`).d('本次开票数量'),
        name: 'quantity',
        type: 'number',
        validator: validatorRender,
        dynamicProps: {
          required: editAbleRender,
        },
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.netPrice`)
          .d('本次开票不含税单价'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.unitPriceBatch').d('每'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.netAmounts`)
          .d('本次开票不含税金额'),
        type: 'number',
        name: 'netAmount',
        dynamicProps: {
          required: editAbleRender,
        },
        validator: validatorRender,
      },
      {
        label: intl.get(`ssta.purchaseSettle.view.model.taxCode`).d('税码'),
        type: 'string',
        name: 'taxCode',
      },
      {
        label: intl.get(`ssta.purchaseSettle.view.model.taxRate`).d('税率'),
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
        label: intl.get(`ssta.purchaseSettle.common.taxAmount`).d('税额'),
        type: 'number',
        name: 'taxAmount',
        dynamicProps: {
          required: editAbleRender,
        },
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.taxIncludedPrice`).d('本次开票含税单价'),
        type: 'number',
        name: 'taxIncludedPrice',
        dynamicProps: {
          required: editAbleRender,
        },
        validator: validatorRender,
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.common.currentTaxIncludedAmount`)
          .d('本次开票含税金额'),
        type: 'number',
        name: 'taxIncludedAmount',
        dynamicProps: {
          required: editAbleRender,
        },
        validator: validatorRender,
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.settleMatchDimension`).d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimensionMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.settleBasePrice`).d('结算基准价'),
        type: 'string',
        name: 'settleBasePriceMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.enableQuantity`).d('可开票数量'),
        type: 'number',
        name: 'enableQuantity',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.orignPrice`).d('原开票单价'),
        type: 'number',
        name: 'orignPrice',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.enableAmount`).d('可开票金额'),
        type: 'number',
        name: 'enableAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.paymentAmount`).d('本次付款金额'),
        type: 'number',
        name: 'paymentAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.applyAmount`).d('本次预付款核销金额'),
        type: 'number',
        name: 'applyAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.invoicedTaxIncludedAmount`).d('已开票含税金额'),
        type: 'number',
        name: 'invoicedAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.paidAmount`).d('已付款金额'),
        type: 'number',
        name: 'paidAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.remainingPaymentAmount`).d('剩余付款金额'),
        type: 'number',
        name: 'remainingPaymentAmount',
      },
      {
        name: 'adjustNetAmount',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.adjustNetAmount`)
          .d('尾差不含税调整金额'),
      },
      {
        name: 'adjustTaxAmount',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.adjustTaxAmount`)
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
      read: ({ dataSet, data }) => {
        const { settleHeaderId, ...others } = data;
        const customizeUnitCode =
          dataSet.documentType === 'PAYMENT'
            ? 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTIONDETAIL,SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTION_DETAIL_SEARCH'
            : 'SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTIONDETAIL,SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTION_DETAIL_SEARCH';
        const url = `/ssta/v1/${organizationId}/settle-lines/${settleHeaderId}?customizeUnitCode=${customizeUnitCode}`;
        // const { type } = getUrlVars(window.location.search);
        return {
          url,
          method: 'GET',
          data: others,
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleNum').d('结算单编号'),
      },
      {
        name: 'settleStatus',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.camp').d('创建方阵营'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.creationDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createdUserName').d('创建人'),
      },
      {
        name: 'createdUnitName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createdUnitName').d('创建人部门'),
      },
      {
        name: 'documentType',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.documentType').d('结算单类型'),
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
          .get('ssta.purchaseSettle.model.purchaseSettle.settleCompanyName')
          .d('结算公司名称'),
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        ignore: 'always',
        noCache: true,
        textFiled: 'companyName',
        required: true,
      },
      {
        name: 'companyNum',
        type: 'string',
        bind: 'companyNumLov.companyNum',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleCompanyNum')
          .d('结算公司编码'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.currencyCode').d('币种'),
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
          .get('ssta.purchaseSettle.model.purchaseSettle.settleSupplierName')
          .d('结算供应商名称'),
        lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
        ignore: 'always',
        noCache: true,
        lovPara: { tenantId: organizationId },
        required: true,
        dynamicProps: {
          disabled: ({ record }) => !record.get('companyId'),
          required: ({ record }) => record.get('companyId'),
          lovPara: ({ record }) => ({
            tenantId: getCurrentOrganizationId(),
            companyId: record.get('companyId'),
          }),
        },
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierCompanyNum',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleSupplierNum')
          .d('结算供应商编码'),
      },

      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierCompanyId',
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
        name: 'supplierName',
        bind: 'supplierCompanyNumLov.supplierName',
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierCompanyName',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleSupplierName')
          .d('结算供应商名称'),
      },
      {
        name: 'ouName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.ouName').d('业务实体'),
      },
      {
        name: 'supplierSiteLov',
        type: 'object',
        lovCode: 'SSTA.SUPPLIER_SITE',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.supplierSiteLov').d('供应商地点'),
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
       * 付款信息
       */
      {
        name: 'prepaymentType',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.prepaymentType').d('预付款类型'),
        required: true,
        lookupCode: 'SSTA.PREPAYMENT_TYPE',
      },
      {
        name: 'prepaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.prepaymentAmount')
          .d('预付款总金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
        // TODO:
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.bankId`).d('收款银行'),
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
        // cascadeMap: { parentValue: 'supplierCompanyNumLov' },
      },
      {
        name: 'bankId',
        bind: 'bankIdLov.bankId',
      },
      {
        name: 'bankName',
        bind: 'bankIdLov.bankName',
        // required: true,
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.bankId`).d('收款银行'),
        // dynamicProps: {
        //   required: ({ record }) => record.get('settleTaxAmount') > 0,
        // },
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.bankBranchName`).d('收款开户行'),
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
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.bankAccountName1`)
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
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentMethod`)
          .d('付款方式'),
        type: 'object',
        name: 'paymentMethodLov',
        lovCode: 'SMDM.PAYMENT_TYPE',
        ignore: 'always',
        noCache: true,
        required: true,
        // textFiled: 'typeName',
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
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentCondition`).d('付款条件'),
        type: 'object',
        name: 'paymentCondition',
        ignore: 'always',
        lovCode: 'SMDM.PAYMENT.TERM',
        noCache: true,
        textFiled: 'paymentTermName',
        dynamicProps: {
          required: () => true,
          // required: ({ record }) => record.get('settleTaxAmount') > 0,
          lovPara: () => ({
            tenantId: getCurrentOrganizationId(),
          }),
        },
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
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentDiscountAmount`)
          .d('付款折扣金额'),
        type: 'number',
        name: 'paymentDiscountAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planNum',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanNum`)
          .d('付款计划编号'),
      },
      {
        name: 'versionNumber',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanVersionNum`)
          .d('付款计划版本号'),
      },
      {
        name: 'planStageNum',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.payPlanStageNum`)
          .d('付款计划阶段编码'),
      },
      {
        name: 'planStageDesc',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.payPlanStageDesc`)
          .d('付款计划阶段描述'),
      },
      {
        name: 'planStageAmount',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.planStageAmount`)
          .d('计划阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planStageBalance',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.balanceStageAmount`)
          .d('剩余阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planStagePercent',
        type: 'number',
        label: intl.get(`ssta.purchaseSettle.view.purchaseSettle.stagePercent`).d('阶段比例（%）'),
      },
      {
        name: 'planStageStartDate',
        type: 'date',
        label: intl.get(`ssta.purchaseSettle.view.purchaseSettle.stageStartDate`).d('阶段开始日期'),
      },
      {
        name: 'planStageEndDate',
        type: 'date',
        label: intl.get(`ssta.purchaseSettle.view.purchaseSettle.stageEndDate`).d('阶段到期日期'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.expectPaymentDate`)
          .d('期望付款日期'),
        type: 'date',
        name: 'expectPaymentDate',
        required: true,
      },
      // TODO:
      {
        name: 'remark',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.remark').d('备注'),
      },
      {
        name: 'canceledReason',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.canceledReason').d('取消原因'),
      },
      {
        name: 'confirmCollaborativeModeMeaning',
        type: 'string',
        // lookupCode: 'SSTA.COOPERATION_MODE',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.confirmCollaborativeMode')
          .d('协同模式-确认'),
      },
      {
        name: 'confirmApproveMethodMeaning',
        type: 'string',
        // lookupCode: 'SSTA.APPROVAL_METHOD',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.confirmApproveMethod')
          .d('审批方式-确认'),
      },
      {
        name: 'cancelCollaborativeModeMeaning',
        type: 'string',
        // lookupCode: 'SSTA.COOPERATION_MODE',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.cancelCollaborativeMode')
          .d('协同模式-取消'),
      },
      {
        name: 'cancelApproveMethodMeaning',
        type: 'string',
        // lookupCode: 'SSTA.APPROVAL_METHOD',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.cancelApproveMethod')
          .d('审批方式-取消'),
      },
      {
        name: 'approvedRemark',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.approvedRemark')
          .d('审批意见-确认'),
      },
      {
        name: 'canceledRemark',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.canceledRemark')
          .d('审批意见-取消'),
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
      {
        name: 'paymentControlRuleSource',
        type: 'string',
        lookupCode: 'SSTA.PAYMENT_CONTROL_RULE_SOURCE',
        label: intl.get('ssta.common.model.common.paymentControlRuleSource').d('付款管控规则来源'),
      },
      /**
       * 附件
       */
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.purchaserEnclosure`)
          .d('采购方附件'),
      },
    ],
    transport: {
      create: ({ data }) => {
        const url = `/ssta/v1/${organizationId}/pre-pay-headers/purchaser/save`;
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
          url: `/ssta/v1/${organizationId}/bill-headers/purchaser`,
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.canceledReason').d('取消原因'),
      },
      {
        name: 'approvedRemark',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.approvedRemark')
          .d('审批意见-确认'),
      },
      {
        name: 'canceledRemark',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.canceledRemark')
          .d('审批意见-取消'),
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
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.lineNum`).d('结算单行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        name: 'prepaymentAmount',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentAmount1`)
          .d('预付款行金额'),
        type: 'number',
        validator: (value, _, record) => {
          if (value <= 0) {
            return intl
              .get(`ssta.purchaseSettle.model.supplySettle.pleaseInput`)
              .d('请填写大于0的预付款行金额');
          }
          if (record.get('associateAmount') && math.gt(value, record.get('associateAmount'))) {
            return intl
              .get(`ssta.purchaseSettle.model.supplySettle.pleaseInputSmall`)
              .d('预付款行金额不得大于关联单据金额');
          }
          return true;
        },
        required: true,
        computedProps: {
          precision: ({ record }) => record.get('amountPrecision'),
          formatterOptions: amountFormatterOptions,
        },
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.associateNum`).d('关联单据号'),
        type: 'object',
        name: 'associateNumLov',
        ignore: 'always',
        noCache: true,
      },
      {
        name: 'associateNum',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.associateNum`).d('关联单据号'),
        type: 'string',
      },
      {
        name: 'associateLineNum',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.associateLineNum`)
          .d('关联单据行号'),
      },
      {
        name: 'associateNumAndLineNum',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.associateNumAndLineNum`)
          .d('关联单据号 | 关联单据行号'),
        type: 'string',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.associateAmount`)
          .d('关联单据金额'),
        type: 'number',
        name: 'associateAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'launchPrepaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.prePayment.model.prePayment.prepaymentInitiatedAmount')
          .d('预付款已发起金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'prepaymentOccupiedAmount',
        type: 'number',
        label: intl
          .get('ssta.prePayment.model.prePayment.prepaymentOccupiedAmount')
          .d('预付款已占用金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        type: 'number',
        label: intl
          .get('ssta.prePayment.model.prePayment.prepaymentCompletedAmount')
          .d('预付款已完成金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.prepaymentApplyAmount`).d('已核销金额'),
        type: 'number',
        name: 'prepaymentApplyAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.poItemName`).d('商品名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.quantity`).d('数量'),
        type: 'number',
        name: 'quantity',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.taxIncludedLineAmount`).d('含税行金额'),
        type: 'number',
        name: 'taxIncludedLineAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.lineAmount1`).d('不含税行金额'),
        type: 'number',
        name: 'lineAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.categoryName`).d('品类'),
        type: 'string',
        name: 'categoryName',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.poCreatedName`).d('订单创建人'),
        type: 'string',
        name: 'poCreatedName',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.poCreationDate`).d('订单创建时间'),
        type: 'dateTime',
        name: 'poCreationDate',
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prePaymentApplyNum`)
          .d('预付款申请编号'),
      },
      {
        name: 'planNum',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanNum`)
          .d('付款计划编号'),
      },
      {
        name: 'versionNumber',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanVersionNum`)
          .d('付款计划版本号'),
      },
      {
        name: 'planStageNum',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.payPlanStageNum`)
          .d('付款计划阶段编码'),
      },
      {
        name: 'planStageDesc',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.payPlanStageDesc`)
          .d('付款计划阶段描述'),
      },
      {
        name: 'planStageAmount',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.planStageAmount`)
          .d('计划阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planStageBalance',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.balanceStageAmount`)
          .d('剩余阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planStagePercent',
        type: 'number',
        label: intl.get(`ssta.purchaseSettle.view.purchaseSettle.stagePercent`).d('阶段比例（%）'),
      },
      {
        name: 'planStageStartDate',
        type: 'date',
        label: intl.get(`ssta.purchaseSettle.view.purchaseSettle.stageStartDate`).d('阶段开始日期'),
      },
      {
        name: 'planStageEndDate',
        type: 'date',
        label: intl.get(`ssta.purchaseSettle.view.purchaseSettle.stageEndDate`).d('阶段到期日期'),
      },
      {
        name: 'paymentTypeName',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentMethod`)
          .d('付款方式'),
      },
      {
        name: 'paymentTermName',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentCondition`).d('付款条件'),
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
          'SSTA.PURCHASE_SETTLE_DETAIL.PRE_TRANSACTIONDETAIL,SSTA.PURCHASE_SETTLE_DETAIL.PRE_TRANSACTION_DETAIL_SEARCH';
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
    autoCreate: true,
    selection: 'multiple',
    autoQuery: false,
    fields: [
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.invoiceSpecies`)
          .d('发票种类'),
        type: 'string',
        name: 'invoiceSpeciesMeaning',
        // required: true,
        // lookupCode: 'SSTA.INVOICE_TYPE',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.lineNumber`).d('行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.supplySettle.invoiceCode`).d('发票代码'),
        type: 'string',
        name: 'invoiceCode',
        required: true,
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.supplySettle.invoiceNumber`).d('发票号码'),
        type: 'string',
        name: 'invoiceNumber',
        required: true,
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.invoicingDate`)
          .d('开票日期'),
        type: 'date',
        name: 'invoicingDate',
        // dynamicProps: {
        //   required: ({ dataSet }) => dataSet.invoiceMatch === 'COMPANY',
        // },
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.netAmount`)
          .d('不含税金额'),
        type: 'number',
        name: 'netAmount',
        required: true,
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.taxAmount`)
          .d('税额'),
        type: 'number',
        name: 'taxAmount',
        required: true,
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.taxIncludedAmount`)
          .d('含税金额'),
        type: 'number',
        name: 'taxIncludedAmount',
        required: true,
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.invoiceSpecies`)
          .d('发票种类'),
        type: 'string',
        name: 'invoiceSpecies',
        required: true,
        lookupCode: 'SSTA.INVOICE_TYPE',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.deductFlag`)
          .d('是否抵扣'),
        type: 'boolean',
        name: 'deductFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.checkCodeMeaning`)
          .d('校验码'),
        type: 'string',
        name: 'checkCode',
        // validator: (value) => {
        //   if (value && value.length !== 6) {
        //     return intl
        //       .get(`ssta.purchaseSettle.view.message.checkCodeError`)
        //       .d('请输入校验码后六位');
        //   }
        //   return true;
        // },
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.validateStatus`)
          .d('查验状态'),
        type: 'string',
        name: 'validateStatus',
        lookupCode: 'SSTA.INVOICE_CHECK_STATUS',
        defaultValue: 'UNCHECK',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.validateMessage`)
          .d('查验状态说明'),
        type: 'string',
        name: 'validateMessage',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.taxInvoiceStatus`)
          .d('发票状态'),
        type: 'string',
        name: 'taxInvoiceStatus',
        lookupCode: 'SSTA.TAX_INVOICE_STATUS',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.taxInvoiceStatus`)
          .d('发票状态'),
        type: 'string',
        name: 'taxInvoiceStatusMeaning',
        // lookupCode: 'SSTA.TAX_INVOICE_STATUS',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.invoiceUrl`)
          .d('电子发票地址'),
        type: 'string',
        name: 'invoiceUrl',
      },
      {
        label: intl.get(`ssta.purchaseSettle.view.message.model.purchaseSettle.detasile`).d('操作'),
        type: 'string',
        name: 'detailed',
      },
      // 发票池转来
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName')
          .d('销方名称'),
      },
      {
        name: 'supUnifiedSocialCode',
        type: 'string',
        label: intl
          .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supUnifiedSocialCode')
          .d('销方纳税人识别号'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl
          .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.companyName')
          .d('购方名称'),
      },
      {
        name: 'purUnifiedSocialCode',
        type: 'string',
        label: intl
          .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.purUnifiedSocialCode')
          .d('购方纳税人识别号'),
      },
      {
        name: 'seeocr',
        type: 'string',
        label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.OcrFile').d('OCR文件'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.validateStatus`)
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
          'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE_ADD_OLD,SSTA.PURCHASE_SETTLE_DETAIL.TAXINVOICE,SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE_EDIT_OLD';
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
        //   queryParameter:,
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
    selection: false,
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.lineNums`).d('行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.itemCodes`).d('商品编码'),
        type: 'string',
        name: 'itemCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.handname`)
          .d('货物或应税劳务名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.specifnum`)
          .d('规格型号'),
        type: 'string',
        name: 'specificationsModel',
      },

      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.uom`).d('单位'),
        type: 'string',
        name: 'uom',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.proces`).d('数量'),
        type: 'string',
        name: 'quantity',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.netPrice`).d('不含税单价'),
        type: 'string',
        name: 'netPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.netAmount`)
          .d('不含税金额'),
        type: 'string',
        name: 'netAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.taxIncludedAmount`).d('含税金额'),
        type: 'string',
        name: 'taxIncludedAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.view.message.model.purchaseSettle.taxRate`).d('税率'),
        type: 'string',
        name: 'taxRate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.taxAmount`)
          .d('税额'),
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
 * 预付款核销
 */
const prepaymentDS = (amountPer, source) => {
  return {
    selection: 'multiple',
    autoQuery: false,
    paging: source !== 'quoteInvoice',
    fields: [
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentTitle`)
          .d('预付款结算单号｜行号'),
        type: 'string',
        name: 'prepaymentTitle',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentRemainingAmount`)
          .d('预付款剩余核销金额'),
        type: 'string',
        name: 'prepaymentRemainingAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.applyAmount`).d('本次核销金额'),
        type: 'number',
        name: 'applyAmount',
        min: 10 ** -amountPer,
        required: true,
        validator: (value, dataSet, record) => {
          const { prepaymentRemainingAmount } = record.toData();
          if (math.lt(prepaymentRemainingAmount, value)) {
            return `本次核销金额不得超过预付款剩余核销金额`;
          }
          return true;
        },
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentAmount`)
          .d('预付款金额'),
        type: 'string',
        name: 'prepaymentAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentType`)
          .d('预付款类型'),
        type: 'string',
        name: 'prepaymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.associateNumd`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentCreatedBy`)
          .d('预付款申请人'),
        type: 'string',
        name: 'prepaymentCreatedBy',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentCreationDates`)
          .d('预付款创建时间'),
        type: 'date',
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
        const customizeUnitCode = 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT.PEYPAYMENT.BOX';
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
          .get(`ssta.purchaseSettle.model.purchaseSettle.prePaymentSettleNum`)
          .d('预付款结算单号'),
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
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.associateNums`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.associateLineNum`)
          .d('关联单据行号'),
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
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentRemainingAmount`)
          .d('预付款剩余核销金额'),
        type: 'string',
        name: 'prepaymentRemainingAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentTitle`)
          .d('预付款结算单号｜行号'),
        type: 'string',
        name: 'prepaymentTitle',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentTypeMeaning`)
          .d('预付款类型'),
        type: 'string',
        name: 'prepaymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.associateNum`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentCreatedBy`)
          .d('预付款申请人'),
        type: 'string',
        name: 'prepaymentCreatedBy',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentCreationDate`)
          .d('预付款创建时间'),
        type: 'date',
        name: 'prepaymentCreationDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.associateLineNum`)
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
          'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_PRE_OFF_ADD,SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT.PEYPAYMENT.BOX.ADD.LIST';
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
 * 多维度付款
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
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentRangeCode`).d('付款维度'),
        lookupCode: 'SSTA.PAYMENT_DIMENSION',
        defaultValue: paymentDimension,
        disabled: !updateFlag,
      },
    ],
    fields: [
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.documentNum`).d('单据编号'),
        type: 'string',
        name: 'documentNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.invoicedTaxIncludedAmounts`)
          .d('已开票含税金额'),
        type: 'number',
        name: 'invoicedTaxIncludedAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.purchaseSettle.remainingPaymentAmount`)
          .d('剩余可付金额'),
        type: 'number',
        name: 'remainingPaymentAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentAmount`)
          .d('本次付款金额'),
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
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.applyAmount`)
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
 * 付款信息维护
 */
const paymentInfoDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    forceValidate: true,
    fields: [
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.bankId`).d('收款银行'),
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
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.bankId`).d('收款银行'),
      },
      {
        name: 'bankId',
        bind: 'bankIdLov.bankId',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.bankId`).d('收款银行'),
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.bankBranchName`).d('收款开户行'),
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
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.bankAccountName`)
          .d('银行账户名称'),
        type: 'string',
        name: 'bankAccountName',
        bind: 'bankIdLov.bankAccountName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentMethod`)
          .d('付款方式'),
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
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentCondition`).d('付款条件'),
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
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentDiscountAmount`)
          .d('付款折扣金额'),
        type: 'number',
        name: 'paymentDiscountAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.expectPaymentDate`)
          .d('期望付款日期'),
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
        const customizeUnitCode = 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_INFO_BOX';
        const url = `/ssta/v1/${organizationId}/settle-header-pre-verifications/${settleHeaderId}?customizeUnitCode=${customizeUnitCode}`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};

/**
 * 预付款核销
 */
const multiPrepaymentDS = (amountPer) => {
  return {
    paging: false,
    selection: 'multiple',
    autoQuery: false,
    fields: [
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentTitle`)
          .d('预付款结算单号｜行号'),
        type: 'string',
        name: 'prepaymentTitle',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentRemainingAmount`)
          .d('预付款剩余核销金额'),
        type: 'string',
        name: 'prepaymentRemainingAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.applyAmount`).d('本次核销金额'),
        type: 'number',
        name: 'applyAmount',
        min: 10 ** -amountPer,
        required: true,
        validator: (value, dataSet, record) => {
          const { prepaymentRemainingAmount } = record.toData();
          if (math.lt(prepaymentRemainingAmount, value)) {
            return `本次核销金额不得超过预付款剩余核销金额`;
          }
          return true;
        },
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentAmount`)
          .d('预付款金额'),
        type: 'string',
        name: 'prepaymentAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentType`).d('预付款类型'),
        type: 'string',
        name: 'prepaymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.associateNum`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentCreatedBy`)
          .d('预付款申请人'),
        type: 'string',
        name: 'prepaymentCreatedBy',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentCreationDate`)
          .d('预付款创建时间'),
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
          .get(`ssta.purchaseSettle.model.purchaseSettle.prePaymentSettleNum`)
          .d('预付款结算单号'),
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
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.associateNums`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.associateLineNum`)
          .d('关联单据行号'),
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
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentRemainingAmount`)
          .d('预付款剩余核销金额'),
        type: 'string',
        name: 'prepaymentRemainingAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentTitle`)
          .d('预付款结算单号｜行号'),
        type: 'string',
        name: 'prepaymentTitle',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentTypeMeaning`)
          .d('预付款类型'),
        type: 'string',
        name: 'prepaymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.associateNum`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentCreatedBy`)
          .d('预付款申请人'),
        type: 'string',
        name: 'prepaymentCreatedBy',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentCreationDate`)
          .d('预付款创建时间'),
        type: 'date',
        name: 'prepaymentCreationDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.associateLineNum`)
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
          'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT.MULT.PEYPAYMENT.ADD.LIST,SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_MULTI_PRE_OFF_ADD';
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createDate').d('创建日期范围'),
      },
      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.param')
          .d('输入供应商、公司、结算策略进行查询'),
      },
      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.company').d('公司'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.supplier').d('供应商'),
        lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplierCompanyIdLov.supplierCompanyId',
      },

      {
        name: 'supplierCompanyNum',
        bind: 'supplierCompanyIdLov.supplierCompanyNum',
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
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.currencyCode`).d('币种'),
        type: 'object',
        name: 'currencyCode',
        lovCode: 'SSTA.CURRENCY',
        lovPara: { organizationId },
        transformRequest: (value) => value && value.currencyCode,
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.creationDateFrom`)
          .d('创建日期从'),
        type: 'date',
        name: 'creationDateFrom',
        defaultValue: moment().subtract(6, 'month'),
        dynamicProps: {
          disabled: ({ record }) => record.get('date'),
        },
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.creationDateTo`).d('创建日期至'),
        type: 'date',
        name: 'creationDateTo',
        dynamicProps: {
          disabled: ({ record }) => record.get('date'),
        },
      },
      {
        name: 'settleNum',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleNum').d('结算单编号'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.campMeaning').d('创建方阵营'),
        lookupCode: 'SSTA.CAMP',
      },
    ],
    fields: [
      {
        name: 'settleNum',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleNum').d('结算单编号'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`)
          .d('结算单类型'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleSupplier').d('结算供应商'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.currencyCode').d('币种'),
      },
      {
        name: 'netAmount',
        type: 'number',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.netAmount').d('开票不含税总金额'),
      },
      {
        name: 'taxAmount',
        type: 'number',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.taxAmount').d('开票总税额'),
      },
      {
        name: 'taxIncludedAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoiceTaxIncludedAmount')
          .d('开票含税金额'),
      },
      {
        name: 'paidAmount',
        type: 'number',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.paidAmount').d('已付款金额'),
      },
      {
        name: 'remainingPaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.remainingPaymentAmount')
          .d('剩余付款金额'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentAmount`)
          .d('本次付款金额'),
        type: 'number',
        name: 'paymentAmount',
        required: true,
        validator: (value, name, record) => {
          const { remainingPaymentAmount, paymentAmount, applyAmount } = record.toData();
          const payAmount = decimalSum([
            math.abs(remainingPaymentAmount || 0),
            math.negated(math.abs(paymentAmount || 0)),
            math.negated(math.abs(applyAmount || 0)),
          ]);
          if (value * remainingPaymentAmount < 0) {
            return intl
              .get(`ssta.common.message.validate.sameSign.remainingPaymentAmount`)
              .d(`本次付款金额需与剩余付款金额同号`);
          }
          if (payAmount < 0) {
            return intl
              .get(`ssta.common.message.validate.cannotExceed.remainingPaymentAmount`)
              .d(`本次付款金额不得超过剩余付款金额`);
          }
          return true;
        },
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.applyAmount`)
          .d('本次预付款核销金额'),
        type: 'number',
        name: 'applyAmount',
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.creationDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createdUserName').d('创建人'),
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.campMeaning').d('创建方阵营'),
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
          url: `/ssta/v1/${organizationId}/settle-headers/purchaser/payment-by-invoice`,
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
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.date')
          .d('结算事务日期范围'),
      },
      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.param')
          .d('输入供应商、公司、商品进行查询'),
      },
      {
        name: 'dateRange',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.dateRange')
          .d('结算事务日期范围'),
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.item`).d('结算商品'),
        type: 'string',
        name: 'item',
      },

      {
        name: 'settleNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.settleNum')
          .d('结算事务编号'),
      },
      {
        name: 'sourceSettleNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSettleNum')
          .d('结算事务来源编号'),
      },
      {
        name: 'settleConfigNumLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.settleStrategyNum')
          .d('结算策略编码'),
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
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.poNum`).d('采购订单编号'),
        type: 'string',
        name: 'poNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ecPoSubNum`)
          .d('电商子订单编号'),
        type: 'string',
        name: 'ecPoSubNum',
      },
      {
        name: 'purOrganizationIdLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.purOrganizationIdLov')
          .d('采购组织'),
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
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.agentIdLov').d('采购员'),
      },
      {
        name: 'agentId',
        type: 'string',
        bind: 'agentIdLov.purchaseAgentId',
      },
      {
        name: 'trxTypeCodeLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.trxTypeCode')
          .d('采购事务类型'),
        lovCode: 'SSTA.SETTLE_TRX_TYPE',
        ignore: 'always',
        noCache: true,
      },
      {
        name: 'trxTypeCode',
        bind: 'trxTypeCodeLov.rcvTypeCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleBasePrice`)
          .d('结算基准价'),
        type: 'string',
        name: 'settleBasePrice',
        lookupCode: 'SSTA.BASE_PRICE',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMode`)
          .d('结算模式'),
        type: 'string',
        name: 'settleMode',
        lookupCode: 'SSTA.SETTLE_MODE',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimension',
        lookupCode: 'SSTA.MATCH_DIMENSION',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billStatus`)
          .d('对账状态'),
        type: 'string',
        name: 'billStatus',
        lookupCode: 'SSTA.SETTLE_BILL_STATUS',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceStatus`)
          .d('开票状态'),
        type: 'string',
        name: 'invoiceStatus',
        lookupCode: 'SSTA.SETTLE_INVOICE_STATUS',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentStatus`)
          .d('付款状态'),
        type: 'string',
        name: 'paymentStatus',
        lookupCode: 'SSTA.SETTLE_PAYMENT_STATUS',
      },
      {
        name: 'billRemoveFlag',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.billRemoveFlag')
          .d('对账暂挂'),
        lookupCode: 'HPFM.FLAG',
        defaultValue: 0,
        required: true,
      },
      {
        name: 'displayReverseFlag',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.displayReverseFlag')
          .d('显示已冲销数据'),
        lookupCode: 'HPFM.FLAG',
        defaultValue: 0,
        required: true,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourcePlatformCode`)
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
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.settleNum')
          .d('结算事务编号'),
      },
      {
        name: 'errorSettleNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.errorSettleNum')
          .d('结算事务编号'),
      },
      {
        name: 'souceSettleAndLineNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.souceSettleAndLineNum')
          .d('结算事务来源编号｜行号'),
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.company`).d('公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanyName`)
          .d('供应商名称'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.currencyCode`).d('币种'),
        type: 'string',
        name: 'currencyCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.itemName`)
          .d('结算商品名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        type: 'string',
        name: 'quantity',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.quantity`)
          .d('可结算数量'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billTaxIncludedAmount`)
          .d('可对账含税金额'),
        type: 'string',
        name: 'taxIncludedAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invOrganizationName`)
          .d('库存组织'),
        type: 'string',
        name: 'invOrganizationName',
      },
      {
        type: 'string',
        name: 'billStatusMeaning',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billStatusMeaning`)
          .d('对账状态'),
      },
      {
        type: 'string',
        name: 'invoiceStatusMeaning',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceStatusMeanings`)
          .d('开票状态'),
      },
      {
        type: 'string',
        name: 'paymentStatusMeaning',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentStatusMeaning`)
          .d('付款状态'),
      },

      /**
       * 可对账
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.netPrice`)
          .d('不含税单价'),
        type: 'string',
        name: 'netPrice',
      },
      {
        label: intl.get(`hzero.common.view.unitPriceBatch`).d('每'),
        name: 'unitPriceBatch',
        type: 'string',
      },
      {
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.netAmount')
          .d('不含税金额'),
        name: 'netAmount',
        type: 'string',
      },
      {
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.taxCode').d('税码'),
        name: 'taxCode',
        type: 'string',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxRate`).d('税率'),
        type: 'string',
        name: 'taxRate',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxAmount`).d('税额'),
        type: 'string',
        name: 'taxAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncludedPrice`)
          .d('含税单价'),
        type: 'string',
        name: 'taxIncludedPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billTaxIncludedAmount`)
          .d('可对账含税金额'),
        type: 'string',
        name: 'taxIncludedAmount',
      },

      /**
       * 可开票
       */

      /**
       * 可付款
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoicedTaxIncludedAmount`)
          .d('已开票含税金额'),
        type: 'string',
        name: 'invoiceCompletedAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentOccupiedAmount`)
          .d('已付款发起金额'),
        type: 'string',
        name: 'paymentOccupiedAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ablePayAmount`)
          .d('可付款金额'),
        type: 'string',
        name: 'ablePayAmount',
      },

      /**
       * 垃圾箱
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.errorType`)
          .d('导入失败类型'),
        type: 'string',
        name: 'errorTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.errorMsg`)
          .d('导入失败原因'),
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
            ? `/ssta/v1/${organizationId}/settles/purchaser/page-invoice-able`
            : `/ssta/v1/${organizationId}/settles/purchaser/page-payment-able`;
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
    pageSize: 20,
    cacheSelection: true,
    primaryKey: 'settleLineId',
    queryFields: [
      {
        name: 'date',
        type: 'date',
        range: ['start', 'end'],
        dynamicProps: {
          disabled: ({ record }) => record.get('dateRange'),
        },
        defaultValue: { start: moment().subtract(6, 'month'), end: moment() },
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.creates')
          .d('事务日期范围'),
      },

      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.invoicesParams')
          .d('输入供应商、公司、商品进行查询'),
      },
      {
        name: 'dateRange',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.dateRanges')
          .d('事务日期范围'),
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
      },
      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.company').d('公司'),
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        // lovCode: 'SPFM.USER_AUTH_COMPANY',

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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.supplierCompanyId').d('供应商'),
        lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId },
        valueField: 'lovKey',
      },
      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierCompanyId',
      },
      {
        name: 'supplierTenantId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierTenantId',
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
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.currencyCode`).d('币种'),
        type: 'object',
        name: 'currencyCode',
        // lovCode: 'SSTA.CURRENCY',
        lovCode: 'SMDM.LEDGER.CURRENCY',
        textField: 'currencyCode',
        lovPara: { organizationId },
        transformRequest: (value) => value && value.currencyCode,
      },
      {
        name: 'itemParam',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.itemParam').d('结算商品'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.settleTransactionNum`)
          .d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        name: 'sourceSettleNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSettleNum')
          .d('结算事务来源编号'),
      },
      {
        name: 'settleConfigNumLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigNum')
          .d('结算策略编码'),
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
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.poNum`).d('采购订单编号'),
        type: 'string',
        name: 'poNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ecPoSubNum`)
          .d('电商子订单编号'),
        type: 'string',
        name: 'ecPoSubNum',
      },
      {
        name: 'purOrganizationIdLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.purOrganizationIdLov')
          .d('采购组织'),
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
      //   label: intl.get('ssta.purchaseSettle.model.purchaseSettle.invOrganizationId').d('库存组织'),
      // },
      {
        name: 'invOrganizationLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.invOrganizationLov')
          .d('库存组织'),
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
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.agentIdLov').d('采购员'),
      },
      {
        name: 'trxTypeCodeLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.trxTypeCodess')
          .d('采购事务类型'),
        // lovCode: 'SSTA.SETTLE_TRX_TYPE',
        lovCode: 'SSTA.SETTLE_TRX_TYPE',

        ignore: 'always',
        noCache: true,
      },
      {
        name: 'trxTypeCode',
        bind: 'trxTypeCodeLov.rcvTypeCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleBasePrice`)
          .d('结算基准价'),
        type: 'string',
        name: 'settleBasePrice',
        lookupCode: 'SSTA.BASE_PRICE',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMode`)
          .d('结算模式'),
        type: 'string',
        name: 'settleMode',
        lookupCode: 'SSTA.SETTLE_MODE',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimension',
        lookupCode: 'SSTA.MATCH_DIMENSION',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourcePlatformsCode`)
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
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourcePlatformLov`)
          .d('数据来源类型'),
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
      //   label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.settleTypeCode`).d('结算单类型'),
      //   type: 'string',
      //   name: 'documentType',
      //   lookupCode: 'SSTA.SETTLE_TYPE',
      // },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleHeaderNum').d('结算单编号'),
      },
      {
        name: 'settleStatusCodeList',
        type: 'object',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
        lovCode: 'SSTA.SETTLE_STATUS',
        lovPara: { organizationId },
        multiple: true,

        transformRequest: (value) =>
          isArray(value) ? value.map((item) => item.value).join() : null,
      },
      {
        name: 'camp',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.campMeaning').d('创建方阵营'),
        lookupCode: 'SSTA.CAMP',
      },
      {
        name: 'invoicePayEnableFlag',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoicePayEnableFlag')
          .d('启用开票并付款'),
      },
      // {
      //   name: 'settleConfigNumLov',
      //   type: 'object',
      //   label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleConfigNum').d('结算策略'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleHeaderNum').d('结算单编号'),
      },
      {
        label: intl.get('hzero.common.button.operator').d('操作'),
        type: 'string',
        name: 'operation',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.lineNum`).d('结算单行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`)
          .d('结算单类型'),
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
          .get(`ssta.purchaseSettle.model.purchaseSettle.settleTransactionNum`)
          .d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.sourceSettleNumAndLineNum`)
          .d('结算事务来源编号｜行号'),
        type: 'string',
        name: 'sourceSettleNumAndLineNum',
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.companysName').d('结算单公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.supplierCompanysName')
          .d('结算单供应商'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.currencyCode').d('币种'),
      },
      {
        name: 'itemCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.itemCode').d('结算商品编码'),
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.itemName').d('结算商品名称'),
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.uom`).d('单位'),
        type: 'string',
        name: 'uom',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.common.quantity`).d('本次开票数量'),
        name: 'quantity',
        type: 'number',
      },

      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.netPrice`)
          .d('本次开票不含税单价'),
        type: 'number',
        name: 'netPrice',
      },
      {
        name: 'unitPriceBatch',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.unitPriceBatch').d('每'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.netAmounts`)
          .d('本次开票不含税金额'),
        type: 'number',
        name: 'netAmount',
      },

      {
        label: intl.get(`ssta.purchaseSettle.view.model.taxRate`).d('税率'),
        type: 'number',
        name: 'taxRate',
      },

      {
        label: intl.get(`ssta.purchaseSettle.common.taxAmount`).d('税额'),
        type: 'number',
        name: 'taxAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.taxIncludedPrice`).d('本次开票含税单价'),
        type: 'number',
        name: 'taxIncludedPrice',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.taxIncludedAmount`).d('本次开票含税金额'),
        type: 'number',
        name: 'taxIncludedAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimensionMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.settleBasePrice`).d('结算基准价'),
        type: 'string',
        name: 'settleBasePriceMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.settleMode`).d('结算模式'),
        type: 'string',
        name: 'settleModeMeaning',
        // lookupCode: 'SSTA.SETTLE_MODE',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.enableQuantity`).d('可开票数量'),
        type: 'number',
        name: 'enableQuantity',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.orignPrice`).d('原开票单价'),
        type: 'number',
        name: 'orignPrice',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.enableAmount`).d('可开票金额'),
        type: 'number',
        name: 'enableAmount',
      },
      {
        name: 'invoicePayEnableFlag',
        type: 'string',
        // lookupCode: 'HPFM.FLAG',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.invoicePayEnableFlag')
          .d('启用开票并付款'),
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.paymentAmount`).d('本次付款金额'),
        type: 'number',
        name: 'paymentAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.applyAmount`).d('本次预付款核销金额'),
        type: 'number',
        name: 'applyAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.invoicedAmount`).d('已开票含税金额'),
        type: 'number',
        name: 'invoicedAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.paidAmount`).d('已付款金额'),
        type: 'number',
        name: 'paidAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.trxDate`).d('结算事务日期'),
        type: 'date',
        name: 'trxDate',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.poAndLineNum`).d('采购订单编号｜行号'),
        type: 'string',
        name: 'poAndLineNum',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.ecPoSubNum`).d('电商子订单编号'),
        type: 'string',
        name: 'ecPoSubNum',
      },

      {
        name: 'sourceParentSettleNumAndLineNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.common.sourceParentSettleLinesNums')
          .d('父事务编号｜行号'),
      },
      {
        label: intl.get('ssta.purchaseSettle.common.asnAndLineNum').d('送货单号|行号'),
        type: 'string',
        name: 'asnAndLineNum',
      },
      {
        name: 'orderType',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.orderType').d('订单类型'),
      },
      {
        name: 'purOrganizationName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.purOrganizationId').d('采购组织'),
      },
      {
        name: 'invOrganizationName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.invOrganizationId').d('库存组织'),
      },
      {
        name: 'purchaseAgentName',
        type: 'string',
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.agentIdLov').d('采购员'),
      },
      {
        name: 'trxTypeCodeMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.trxTypeCodessMeaning')
          .d('采购事务类型'),
      },
      {
        name: 'dataSourceMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.dataSourceMeaning')
          .d('数据来源系统'),
      },
      {
        name: 'sourcePlatformCodeMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.sourcePlatformCodeMeaning')
          .d('数据来源类型'),
      },
      {
        name: 'settleHeaderCreationDate',

        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.submitedDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createdUserName').d('创建人'),
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.campMeaning').d('创建方阵营'),
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
          .get('ssta.purchaseSettle.model.purchaseSettle.multiDealTrxNum')
          .d('三方交易关联事务来源编号'),
      },
      {
        name: 'multiDealTrxLineNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.multiDealTrxLineNum')
          .d('三方交易关联事务来源行'),
      },
      {
        name: 'multiDealPoNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.multiDealPoNum')
          .d('三方交易关联订单编号'),
      },
      {
        name: 'multiDealPoLineNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.multiDealPoLineNum')
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
          'SSTA.PURCHASE_SETTLE_LIST.INVOICE_LINE_LIST,SSTA.PURCHASE_SETTLE_LIST.LINE_BAR_INVOICE';

        let url = '';
        switch (detailType) {
          case 'INVOICE':
            url = `/ssta/v1/${organizationId}/settle-lines/purchaser?action=${detailType}&customizeUnitCode=${customizeUnitCode}`;
            break;
          case 'PAYMENT':
            url = `/ssta/v1/${organizationId}/settle-lines/purchaser?action=${detailType}&customizeUnitCode=${customizeUnitCode}`;
            break;
          case 'PREPAYMENT':
            url = `/ssta/v1/${organizationId}/pre-payment-lines/purchaser`;
            break;
          case 'DIMENSION':
            url = `/ssta/v1/${organizationId}/settle-lines/mutil-payment/purchaser`;
            break;

          default:
            url = `/ssta/v1/${organizationId}/settle-lines/purchaser?action=INVOICE&customizeUnitCode=${customizeUnitCode}`;

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
            ...data,
            ...transformSupplierData(data.supplierCompanyId),
            ...reParams,
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
    pageSize: 20,
    cacheSelection: true,
    primaryKey: 'settleLineId',
    queryFields: [
      {
        name: 'date',
        type: 'date',
        range: ['start', 'end'],
        dynamicProps: {
          disabled: ({ record }) => record.get('dateRange'),
        },
        defaultValue: { start: moment().subtract(6, 'month'), end: moment() },
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.creates')
          .d('事务日期范围'),
      },

      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.sstaparams')
          .d('输入供应商、公司、商品进行查询'),
      },

      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.companyIds').d('结算公司'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.supplierCompanyIds').d('供应商'),
        // label: intl.get('ssta.purchaseSettle.model.purchaseSettle.supplierCompanyIds').d('供应商'),
        lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId },
        valueField: 'lovKey',
      },
      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierCompanyId',
      },
      {
        name: 'supplierTenantId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierTenantId',
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
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.currencyCode`).d('币种'),
        type: 'object',
        name: 'currencyCode',
        lovCode: 'SSTA.CURRENCY',
        lovPara: { organizationId },
        transformRequest: (value) => value && value.currencyCode,
      },
      {
        name: 'itemParam',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.itemParam').d('结算商品'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.settleTransactionNum`)
          .d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        name: 'sourceSettleNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSettleNum')
          .d('结算事务来源编号'),
      },
      {
        name: 'settleConfigNumLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigNum')
          .d('结算策略编码'),
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
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.poNum`).d('采购订单编号'),
        type: 'string',
        name: 'poNum',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.ecPoSubNum`).d('电商子订单编号'),
        type: 'string',
        name: 'ecPoSubNum',
      },
      {
        name: 'purOrganizationIdLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.purOrganizationIdLov')
          .d('采购组织'),
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
      {
        name: 'invOrganizationLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.invOrganizationLov')
          .d('库存组织'),
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
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.agentIdLov').d('采购员'),
      },
      {
        name: 'trxTypeCodeLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.trxTypesCode')
          .d('采购事务类型'),
        lovCode: 'SSTA.SETTLE_TRX_TYPE',
        ignore: 'always',
        noCache: true,
      },
      {
        name: 'trxTypeCode',
        bind: 'trxTypeCodeLov.rcvTypeCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleBasePrice`)
          .d('结算基准价'),
        type: 'string',
        name: 'settleBasePrice',
        lookupCode: 'SSTA.BASE_PRICE',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMode`)
          .d('结算模式'),
        type: 'string',
        name: 'settleMode',
        lookupCode: 'SSTA.SETTLE_MODE',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimension',
        lookupCode: 'SSTA.MATCH_DIMENSION',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourcePlatformsCode`)
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
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourcePlatformLov`)
          .d('数据来源类型'),
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
      //   label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.settleTypeCode`).d('结算单类型'),
      //   type: 'string',
      //   name: 'documentType',
      //   lookupCode: 'SSTA.SETTLE_TYPE',
      // },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleHeaderNum').d('结算单编号'),
      },
      // {
      //   name: 'settleStatus',
      //   type: 'string',
      //   label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
      //   lookupCode: 'SSTA.SETTLE_STATUS',
      // },

      {
        name: 'settleStatusCodeList',
        type: 'object',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.campMeaning').d('创建方阵营'),
        lookupCode: 'SSTA.CAMP',
      },
      {
        name: 'dateRange',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.dateRanges')
          .d('事务日期范围'),
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
      },
    ],
    fields: [
      {
        name: 'settleStatusMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleNumber').d('结算单编号'),
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get('hzero.common.button.operator').d('操作'),
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.lineNum`).d('结算单行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`)
          .d('结算单类型'),
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
          .get(`ssta.purchaseSettle.model.purchaseSettle.settleTransactionNum`)
          .d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.sourceSettleNumAndLineNum`)
          .d('结算事务来源编号｜行号'),
        type: 'string',
        name: 'sourceSettleNumAndLineNum',
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.companysName').d('结算单公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.supplierCompanysName')
          .d('结算单供应商'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.currencyCode').d('币种'),
      },
      {
        name: 'itemCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.itemCode').d('结算商品编码'),
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.itemName').d('结算商品名称'),
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.uom`).d('单位'),
        type: 'string',
        name: 'uom',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.sourceSettleNum`).d('发票申请结算单号'),
        type: 'string',
        name: 'sourceSettleHeaderNum',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.paymentAmount`).d('本次付款金额'),
        type: 'number',
        name: 'paymentAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.applyAmount`).d('本次预付款核销金额'),
        type: 'number',
        name: 'applyAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.invoicedAmount`).d('已开票含税金额'),
        type: 'number',
        name: 'invoicedAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.paidAmount`).d('已付款金额'),
        type: 'number',
        name: 'paidAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimensionMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.settleBasePrice`).d('结算基准价'),
        type: 'string',
        name: 'settleBasePriceMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.settleMode`).d('结算模式'),
        type: 'string',
        name: 'settleModeMeaning',
        // lookupCode: 'SSTA.SETTLE_MODE',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.trxDate`).d('结算事务日期'),
        type: 'date',
        name: 'trxDate',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.poAndLineNum`).d('采购订单编号｜行号'),
        type: 'string',
        name: 'poAndLineNum',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.ecPoSubNum`).d('电商子订单编号'),
        type: 'string',
        name: 'ecPoSubNum',
      },

      {
        name: 'sourceParentSettleNumAndLineNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.common.sourceParentSettlesLineNum')
          .d('父事务编号|行号'),
      },
      {
        label: intl.get('ssta.purchaseSettle.common.asnAndLineNum').d('送货单号|行号'),
        type: 'string',
        name: 'asnAndLineNum',
      },
      {
        name: 'orderType',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.orderType').d('订单类型'),
      },
      {
        name: 'purOrganizationName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.purOrganizationId').d('采购组织'),
      },
      {
        name: 'invOrganizationName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.invOrganizationId').d('库存组织'),
      },
      {
        name: 'purchaseAgentName',
        type: 'string',
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.agentIdLov').d('采购员'),
      },
      {
        name: 'trxTypeCodeMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.trxTypeCodesMeaning')
          .d('采购事务类型'),
      },
      {
        name: 'dataSourceMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.dataSourceMeaning')
          .d('数据来源系统'),
      },
      {
        name: 'sourcePlatformCodeMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.sourcePlatformCodeMeaning')
          .d('数据来源类型'),
      },
      {
        name: 'settleHeaderCreationDate',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.submitedDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createdUserName').d('创建人'),
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.campMeaning').d('创建方阵营'),
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
          .get('ssta.purchaseSettle.model.purchaseSettle.multiDealTrxNum')
          .d('三方交易关联事务来源编号'),
      },
      {
        name: 'multiDealTrxLineNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.multiDealTrxLineNum')
          .d('三方交易关联事务来源行'),
      },
      {
        name: 'multiDealPoNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.multiDealPoNum')
          .d('三方交易关联订单编号'),
      },
      {
        name: 'multiDealPoLineNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.multiDealPoLineNum')
          .d('三方交易关联订单行号'),
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ data, reParams }) => {
        // eslint-disable-next-line
        // const {
        //   queryParameter: { detailType },
        // } = dataSet;

        const customizeUnitCode =
          'SSTA.PURCHASE_SETTLE_LIST.LINE_BAR_PAYMENT,SSTA.PURCHASE_SETTLE_LIST.PAYMENT_GRID';

        const url = `/ssta/v1/${organizationId}/settle-lines/purchaser?action=PAYMENT&customizeUnitCode=${customizeUnitCode}`;

        delete data.date;
        delete data.dateRange;
        delete data.detailType;
        return {
          url,
          method: 'GET',
          data: filterNullValueObject({
            ...data,
            ...transformSupplierData(data.supplierCompanyId),
            ...reParams,
          }),
        };
      },
    },
  };
};
const preDetailDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    pageSize: 20,
    cacheSelection: true,
    primaryKey: 'prepaymentLineId',
    queryFields: [
      {
        name: 'date',
        type: 'date',
        range: ['start', 'end'],
        dynamicProps: {
          disabled: ({ record }) => record.get('dateRange'),
        },
        defaultValue: { start: moment().subtract(6, 'month'), end: moment() },
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.createdaterange')
          .d('创建事务日期范围'),
      },

      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.sstasSupParams')
          .d('输入供应商、公司进行查询'),
      },

      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.companyId').d('结算公司'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.supplierCompanyId').d('供应商'),
        lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId },
        valueField: 'lovKey',
      },
      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierCompanyId',
      },
      {
        name: 'supplierTenantId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierTenantId',
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
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.currencyCode`).d('币种'),
        type: 'object',
        name: 'currencyCode',
        lovCode: 'SSTA.CURRENCY',
        lovPara: { organizationId },
        transformRequest: (value) => value && value.currencyCode,
      },

      {
        name: 'prepaymentType',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.prepaymentType').d('预付款类型'),

        lookupCode: 'SSTA.PREPAYMENT_TYPE',
      },
      {
        name: 'associateNum',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.associateNum`).d('关联单据号'),
        type: 'string',
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleHeaderNum').d('结算单编号'),
      },
      {
        name: 'settleStatusCodeList',
        type: 'object',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.campMeaning').d('创建方阵营'),
        lookupCode: 'SSTA.CAMP',
      },
      {
        name: 'dateRange',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.newsRange')
          .d('创建日期范围'),
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
      },
    ],
    fields: [
      {
        name: 'settleStatusMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleHeaderNum').d('结算单编号'),
      },

      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.lineNum`).d('结算单行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        type: 'string',
        name: 'operation',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`)
          .d('结算单类型'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.companysName').d('结算单公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.supplierCompanysName')
          .d('结算单供应商'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.currencyCode').d('币种'),
      },
      {
        name: 'prepaymentTypeMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.prepaymentType').d('预付款类型'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentType`)
          .d('付款类型'),
        type: 'string',
        name: 'paymentTypeName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentCondition`)
          .d('付款条件'),
        type: 'string',
        name: 'paymentTermName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.expectPaymentDate`)
          .d('期望付款日期'),
        type: 'date',
        name: 'expectPaymentDate',
      },
      {
        name: 'associateNum',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.associateNum`).d('关联单据号'),
        type: 'string',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.associateAmount`)
          .d('关联单据金额'),
        type: 'string',
        name: 'associateAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.prepaymentAmoun`)
          .d('预付款行金额'),
        type: 'number',
        name: 'prepaymentAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.prepaymentApplyAmount`).d('已核销金额'),
        type: 'string',
        name: 'prepaymentApplyAmount',
      },
      {
        name: 'settleHeaderCreationDate',

        type: 'dateTime',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.submitedDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createdUserName').d('创建人'),
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.campMeaning').d('创建方阵营'),
      },
    ],
    transport: {
      /**
       * 查询
       */

      read: ({ data, reParams }) => {
        // const {
        //   queryParameter: { detailType },
        // } = dataSet;
        const customizeUnitCode =
          'SSTA.PURCHASE_SETTLE_LIST.PREPAYMENT_GRID,SSTA.PURCHASE_SETTLE_LIST.LINE_BAR_PREPAYMENT';

        const url = `/ssta/v1/${organizationId}/pre-payment-lines/purchaser?customizeUnitCode=${customizeUnitCode}`;

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
const demensionDetailDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    pageSize: 20,
    cacheSelection: true,
    primaryKey: 'dimensionKey',
    queryFields: [
      {
        name: 'date',
        type: 'date',
        range: ['start', 'end'],
        dynamicProps: {
          disabled: ({ record }) => record.get('dateRange'),
        },
        defaultValue: { start: moment().subtract(6, 'month'), end: moment() },
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.newdatasRange')
          .d('创建日期范围'),
      },

      {
        name: 'param',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.sstaParams')
          .d('输入供应商、公司进行查询'),
      },

      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.companyId').d('结算公司'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.supplierCompanyId').d('供应商'),
        lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
        noCache: true,
        ignore: 'always',
        lovPara: { tenantId: organizationId },
        valueField: 'lovKey',
      },
      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierCompanyId',
      },
      {
        name: 'supplierTenantId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierTenantId',
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
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.currencyCode`).d('币种'),
        type: 'object',
        name: 'currencyCode',
        lovCode: 'SSTA.CURRENCY',
        lovPara: { organizationId },
        transformRequest: (value) => value && value.currencyCode,
      },
      {
        name: 'paymentDimension',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentRangeCode`).d('付款维度'),
        lookupCode: 'SSTA.PAYMENT_DIMENSION',
        // defaultValue: paymentDimension,
        // disabled: type !== 'UPDATE',
      },
      {
        name: 'documentNum',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.associateNums`).d('关联单据编号'),
        type: 'string',
      },

      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settlesNum').d('结算单编号'),
      },
      // {
      //   name: 'settleStatus',
      //   type: 'string',
      //   label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
      //   lookupCode: 'SSTA.SETTLE_STATUS',
      // },
      {
        name: 'settleStatusCodeList',
        type: 'object',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.campMeaning').d('创建方阵营'),
        lookupCode: 'SSTA.CAMP',
      },
      {
        name: 'dateRange',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.newsRange')
          .d('创建日期范围'),
        lookupCode: 'SINV.INVOICE_TIME_RANGE',
        defaultValue: 'RECENT HALF YEAR',
      },
    ],
    fields: [
      {
        name: 'settleStatusMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleNumber').d('结算单编号'),
      },
      {
        name: 'prePaymentWriteOff',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.button.prePaymentWriteOff`).d('预付款核销'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`)
          .d('结算单类型'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.companysName').d('结算单公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.supplierCompanysName')
          .d('结算单供应商'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.currencyCode').d('币种'),
      },

      {
        name: 'paymentDimensionMeaning',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentRangeCode`).d('付款维度'),
      },

      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.associateNumd`).d('关联单据编号'),
        type: 'string',
        // name: 'associateNum',
        name: 'documentNum',
      },

      {
        label: intl.get(`ssta.purchaseSettle.common.invoicedAmount`).d('已开票含税金额'),
        type: 'number',
        // name: 'invoicedAmount',
        name: 'invoicedTaxIncludedAmount',
      },
      {
        name: 'remainingPaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.remainingPaymentAmount')
          .d('剩余可付款金额'),
      },

      {
        label: intl.get(`ssta.purchaseSettle.common.paymentAmount`).d('本次付款金额'),
        type: 'number',
        name: 'paymentAmount',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.applyAmount`).d('本次预付款核销金额'),
        type: 'number',
        name: 'applyAmount',
      },
      {
        name: 'paymentSpliteRuleMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.paymentSpliteRule')
          .d('付款自动拆分规则'),
      },
      {
        name: 'settleHeaderCreationDate',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.submitedDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createdUserName').d('创建人'),
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.campMeaning').d('创建方阵营'),
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ data, reParams }) => {
        // const {
        //   queryParameter: { detailType },
        // } = dataSet;

        const customizeUnitCode =
          'SSTA.PURCHASE_SETTLE_LIST.DEMENSION_GRID,SSTA.PURCHASE_SETTLE_LIST.LINE_BAR_DEMENSION';

        const url = `/ssta/v1/${organizationId}/settle-lines/mutil-payment/purchaser?customizeUnitCode=${customizeUnitCode}`;

        // const url = `/ssta/v1/${organizationId}/settle-headers/purchaser/page?action=${detailType}&customizeUnitCode=${customizeUnitCode}`;

        delete data.date;
        delete data.dateRange;
        delete data.detailType;
        return {
          url,
          method: 'GET',
          data: filterNullValueObject({
            ...data,
            ...transformSupplierData(data.supplierCompanyId),
            ...reParams,
          }),
        };
      },
    },
  };
};
/**
 * 多维度付款
 */

const batchModifyDS = (headerDs, lineDs) => {
  const { amountPrecision, settleHeaderId } =
    headerDs.current?.get(['amountPrecision', 'settleHeaderId']) || {};
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentAmount1`)
          .d('预付款行金额'),
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
        let customizeUnitCode = 'SSTA.PURCHASE_SETTLE_DETAIL.PRE__BATCH_MODIFY_LINE';
        let searchBarData = {};
        if (selected.length === 0) {
          // 如果没有勾选，需要过滤出没有行id（点新增未保存）的数据 checkedPrePaymentLineList，newPrePaymentLineList
          newPrePaymentLineList = lineDs
            .filter((v) => !v?.get('prepaymentLineId'))
            .map((item) => ({ ...item.toData(), settleHeaderId }));
          customizeUnitCode = `${customizeUnitCode},SSTA.PURCHASE_SETTLE_DETAIL.PRE_TRANSACTIONDETAIL,SSTA.PURCHASE_SETTLE_DETAIL.PRE_TRANSACTION_DETAIL_SEARCH`;
          searchBarData = lineDs.queryDataSet?.current?.toData() || {};
          delete searchBarData.__dirty;
        } else {
          // 如果选中了，需要把选中数据放到checkedPrePaymentLineList，未选中数据中新增的放到newPrePaymentLineList
          // 重新赋值加上settleHeaderId，避免选中的数据中有新增的
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
