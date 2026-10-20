import { getCurrentOrganizationId, isTenantRoleLevel, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';

import { amountFormatterOptions } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

// 结算池详情个性化编码
const customizeUnitCode = [
  'SSTA.ECAUTO_BILL_DETAIL_DRAWER.TRADINGPARTY',
  'SSTA.ECAUTO_BILL_DETAIL_DRAWER.TRANSACTIONAMOUNT',
  'SSTA.ECAUTO_BILL_DETAIL_DRAWER.TRANSACTIONMATTER',
  'SSTA.ECAUTO_BILL_DETAIL_DRAWER.BILL_GRID',
  'SSTA.ECAUTO_BILL_DETAIL_DRAWER.INVOICE_GRID',
  'SSTA.ECAUTO_BILL_DETAIL_DRAWER.PAYMENT_GRID',
  'SSTA.ECAUTO_BILL_DETAIL_DRAWER.DATARULES',
  'SSTA.ECAUTO_BILL_DETAIL_DRAWER.BILLRULES',
  'SSTA.ECAUTO_BILL_DETAIL_DRAWER.SETTLERULES',
].join();

const invoiceDS = () => {
  return {
    pageSize: 5,
    selection: false,
    autoQuery: false,
    fields: [
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settlementNumAndLines`)
          .d('结算单编号-行号'),
        type: 'string',
        name: 'documentNumAndLine',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.quantitys`).d('开票数量'),
        name: 'quantity',
        type: 'number',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.netPrices`)
          .d('开票单价(不含税)'),
        type: 'number',
        name: 'netPrice',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.unitPriceBatch`).d('每'),
        name: 'unitPriceBatch',
        type: 'number',
      },
      {
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.netAmounts')
          .d('开票金额(不含税)'),
        name: 'netAmount',
        type: 'number',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxRates`).d('开票税率'),
        type: 'number',
        name: 'taxRate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxAmounts`)
          .d('开票税额'),
        type: 'number',
        name: 'taxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncludedPrices`)
          .d('开票单价(含税)'),
        type: 'number',
        name: 'taxIncludedPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxHavaMoney`)
          .d('开票金额(含税)'),
        type: 'number',
        name: 'taxIncludedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.recordStatuss`)
          .d('开票状态'),
        type: 'string',
        name: 'recordStatusMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.recordDates`)
          .d('开票日期'),
        type: 'date',
        name: 'recordDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.recordSources`)
          .d('开票来源'),
        type: 'string',
        name: 'recordSource',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.companynames`)
          .d('执行公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanysNames`)
          .d('执行供应商'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.camp_range`)
          .d('创建方阵营'),
        type: 'string',
        name: 'campMeaning',
      },
      {
        label: intl.get(`ssta.common.model.common.processUser`).d('操作人'),
        type: 'string',
        name: 'createdUserName',
      },
      {
        label: intl.get(`ssta.common.model.common.processTime`).d('操作时间'),
        type: 'dateTime',
        name: 'creationDate',
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.operation').d('操作'),
      },
    ],
    transport: {
      /**
       * 查询
       */

      read: ({ dataSet, params }) => {
        const {
          queryParameter: { settleId, documentType },
          filter,
        } = dataSet;
        if (!settleId) return; // 无 settleId 的不执行查询
        const { recordSource = [], paymentType = [], recordStatus = [], ...rest } = filter;
        const paramsData = filterNullValueObject({
          recordSource: recordSource.join(','),
          recordStatus: recordStatus.join(','),
          paymentType: paymentType.join(','),
          ...rest,
          ...params,
        });
        const url = isTenantRoleLevel()
          ? `/ssta/v1/${organizationId}/settle-records/record/${settleId}/${documentType}`
          : `/ssta/v1/settle-records/record/${settleId}/${documentType}`;
        return {
          url,
          method: 'GET',
          params: paramsData,
        };
      },
    },
  };
};

const reconDS = () => {
  return {
    pageSize: 5,
    selection: false,
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.status`).d('状态'),
        type: 'string',
        name: 'recordStatusMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.statementNumAndLines`)
          .d('对账单编号-行号'),
        type: 'string',
        name: 'documentNumAndLine',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.reconciliationQuantity`)
          .d('对账数量'),
        name: 'quantity',
        type: 'number',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billNetPrice`)
          .d('对账单价(不含税)'),
        type: 'number',
        name: 'netPrice',
      },
      {
        label: intl.get(`hzero.common.view.unitPriceBatch`).d('每'),
        name: 'unitPriceBatch',
        type: 'number',
      },
      {
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.billNetAmount')
          .d('对账金额(不含税)'),
        name: 'netAmount',
        type: 'number',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billTaxRate`)
          .d('对账税率'),
        type: 'number',
        name: 'taxRate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billTaxAmount`)
          .d('对账税额'),
        type: 'number',
        name: 'taxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billTaxIncludedsPrice`)
          .d('对账单价(含税)'),
        type: 'number',
        name: 'taxIncludedPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billNetAmount`)
          .d('对账金额(不含税)'),
        type: 'number',
        name: 'netAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billTaxIncludedAmount`)
          .d('对账金额(含税)'),
        type: 'number',
        name: 'taxIncludedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billRecordDate`)
          .d('对账日期'),
        type: 'date',
        name: 'recordDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billRecordSource`)
          .d('对账来源'),
        type: 'string',
        name: 'recordSource',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.companyNamess`)
          .d('执行公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanyNames`)
          .d('执行供应商'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.camp_range`)
          .d('创建方阵营'),
        type: 'string',
        name: 'campMeaning',
      },
      {
        label: intl.get(`ssta.common.model.common.processUser`).d('操作人'),
        type: 'string',
        name: 'createdUserName',
      },
      {
        label: intl.get(`ssta.common.model.common.processTime`).d('操作时间'),
        type: 'dateTime',
        name: 'creationDate',
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.operation').d('操作'),
      },
    ],
    transport: {
      /**
       * 查询
       */

      read: ({ dataSet, params }) => {
        const {
          queryParameter: { settleId, documentType },
          filter,
        } = dataSet;
        if (!settleId) return; // 无 settleId 的不执行查询
        const { recordSource = [], paymentType = [], recordStatus = [], ...rest } = filter;
        const paramsData = filterNullValueObject({
          recordSource: recordSource.join(','),
          recordStatus: recordStatus.join(','),
          paymentType: paymentType.join(','),
          ...rest,
          ...params,
        });
        const url = isTenantRoleLevel()
          ? `/ssta/v1/${organizationId}/settle-records/record/${settleId}/${documentType}`
          : `/ssta/v1/settle-records/record/${settleId}/${documentType}`;
        return {
          url,
          method: 'GET',
          params: paramsData,
        };
      },
    },
  };
};

const payDS = () => {
  return {
    pageSize: 5,
    selection: false,
    autoQuery: false,
    fields: [
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.documentNumsAndLines`)
          .d('结算单编号'),
        type: 'string',
        name: 'documentNum',
      },
      // {
      //   label: intl
      //     .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.documentNumAndLines`)
      //     .d('结算单编号|行号'),
      //   type: 'string',
      //   name: 'documentNumAndLine',
      // },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentTypes`)
          .d('付款类型'),
        name: 'paymentTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentAmounts`)
          .d('付款金额'),
        type: 'number',
        name: 'paymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.recordPayStatus`)
          .d('付款状态'),
        name: 'recordStatusMeaning',
        type: 'string',
      },
      {
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.paysDate').d('付款日期'),
        name: 'recordDate',
        type: 'date',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paySources`)
          .d('付款来源'),
        type: 'string',
        name: 'recordSource',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.companyNames`)
          .d('执行公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanyNames`)
          .d('执行供应商'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.camp_range`)
          .d('创建方阵营'),
        type: 'string',
        name: 'campMeaning',
      },
      {
        label: intl.get(`ssta.common.model.common.processUser`).d('操作人'),
        type: 'string',
        name: 'createdUserName',
      },
      {
        label: intl.get(`ssta.common.model.common.processTime`).d('操作时间'),
        type: 'dateTime',
        name: 'creationDate',
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.operation').d('操作'),
      },
    ],
    transport: {
      /**
       * 查询
       */

      read: ({ dataSet, params }) => {
        const {
          queryParameter: { settleId, documentType },
          filter,
        } = dataSet;
        if (!settleId) return; // 无 settleId 的不执行查询
        const { recordSource = [], paymentType = [], recordStatus = [], ...rest } = filter;
        const paramsData = filterNullValueObject({
          recordSource: recordSource.join(','),
          recordStatus: recordStatus.join(','),
          paymentType: paymentType.join(','),
          ...rest,
          ...params,
        });
        const url = isTenantRoleLevel()
          ? `/ssta/v1/${organizationId}/settle-records/record/${settleId}/${documentType}`
          : `/ssta/v1/settle-records/record/${settleId}/${documentType}`;
        return {
          url,
          method: 'GET',
          params: paramsData,
        };
      },
    },
  };
};

const detailDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    queryParameter: { customizeUnitCode },
    fields: [
      /**
       * 交易方信息
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceCompanyNum`)
          .d('数据源公司编码'),
        type: 'string',
        name: 'sourceCompanyNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceCompanyName`)
          .d('数据源公司名称'),
        type: 'string',
        name: 'sourceCompanyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.companyNum`)
          .d('结算公司编码'),
        type: 'string',
        name: 'companyNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.companysNames`)
          .d('结算公司名称'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSupplierCompanyNum`)
          .d('数据源供应商编码'),
        type: 'string',
        name: 'sourceSupplierCompanyNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSupplierCompanyName`)
          .d('数据源供应商名称'),
        type: 'string',
        name: 'sourceSupplierCompanyName',
      },

      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanyNum`)
          .d('结算供应商编码'),
        type: 'string',
        name: 'supplierCompanyNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierCompanyName1`)
          .d('结算供应商名称'),
        type: 'string',
        name: 'supplierCompanyName',
      },

      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSupplierSiteCode1`)
          .d('数据源供应商地点'),
        type: 'string',
        name: 'sourceSupplierSiteCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierSiteCode1`)
          .d('结算供应商地点'),
        type: 'string',
        name: 'supplierSiteCode',
      },
      {
        label: intl.get(`ssta.common.model.common.unitName`).d('部门名称'),
        type: 'string',
        name: 'unitName',
      },
      /**
       * 交易金额信息
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.itemCode`)
          .d('结算商品编码'),
        type: 'string',
        name: 'itemCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.itemName`)
          .d('结算商品名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        type: 'number',
        name: 'quantity',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleableQuantity`)
          .d('可结算数量'),
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.unitPriceBatch`).d('每'),
        name: 'unitPriceBatch',
        type: 'number',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.netPrice`)
          .d('单价(不含税)'),
        type: 'number',
        name: 'netPrice',
      },
      {
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.netAmount')
          .d('金额(不含税)'),
        name: 'netAmount',
        type: 'number',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncludedAmount`)
          .d('金额(含税)'),
        type: 'number',
        name: 'taxIncludedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncludedPrice`)
          .d('单价(含税)'),
        type: 'number',
        name: 'taxIncludedPrice',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxRate`).d('税率'),
        type: 'number',
        name: 'taxRate',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxAmount`).d('税额'),
        type: 'number',
        name: 'taxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.currencyCode`)
          .d('结算币种'),
        type: 'string',
        name: 'currencyCode',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.uom`).d('单位'),
        type: 'string',
        name: 'uom',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.specificationsModel`)
          .d('规格型号'),
        type: 'string',
        name: 'specificationsModel',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.srmItemCode`)
          .d('srm物料编号'),
        type: 'string',
        name: 'srmItemCode',
      },
      {
        name: 'categoryName',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.categoryName`)
          .d('物料分类'),
      },
      /**
       * 交易事务信息
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.requestedByRealName`)
          .d('采购申请人姓名'),
        type: 'string',
        name: 'requestedByRealName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.prLineNum`)
          .d('采购申请单行编号'),
        type: 'string',
        name: 'prLineNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.prNum`)
          .d('采购申请单编号'),
        type: 'string',
        name: 'prNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleNum`)
          .d('结算事物编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.errorSettleNum`)
          .d('结算事物编号'),
        type: 'string',
        name: 'errorSettleNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSettleNum`)
          .d('结算事务来源编号'),
        name: 'sourceSettleNum',
        type: 'string',
      },
      {
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.sourceSettleLineNum')
          .d('结算事务来源行号'),
        name: 'sourceSettleLineNum',
        type: 'string',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.dataSource`)
          .d('数据来源'),
        type: 'string',
        name: 'dataSourceMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.trxLineNums`)
          .d('srm事务编码-行号'),
        type: 'string',
        name: 'trxLineNums',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.trxDate`)
          .d('结算事务日期'),
        type: 'date',
        name: 'trxDate',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.trxYear`).d('事务年度'),
        type: 'string',
        name: 'trxYear',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.contractAndLineNum`)
          .d('协议编号-行号'),
        type: 'string',
        name: 'contractAndLineNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.poAndLineNum`)
          .d('采购订单编号-行号'),
        type: 'string',
        name: 'poAndLineNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.asnAndLineNum`)
          .d('送货单号-行号'),
        type: 'string',
        name: 'asnAndLineNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.poLineLocation`)
          .d('发运行'),
        type: 'string',
        name: 'poLineLocation',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.releaseNum`).d('发放号'),
        type: 'string',
        name: 'releaseNum',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.orderType`).d('订单类型'),
        type: 'string',
        name: 'orderType',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.purOrganizationId`)
          .d('采购组织'),
        type: 'string',
        name: 'purOrganizationName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invOrganizationName`)
          .d('库存组织'),
        type: 'string',
        name: 'invOrganizationName',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.inventoryName`).d('库房'),
        type: 'string',
        name: 'inventoryName',
      },
      {
        name: 'trxTypeCode',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.trxTypeCode`)
          .d('事务类型编码'),
      },
      {
        name: 'trxTypeCodeMeaning',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.trxTypeCodeMeaning`)
          .d('采购事务类型名称'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.createdByName`)
          .d('创建人'),
        type: 'string',
        name: 'createdByName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.creationDate`)
          .d('创建时间'),
        type: 'dateTime',
        name: 'creationDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.businessTypeMeaning`)
          .d('业务类别'),
        type: 'string',
        name: 'businessTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.stockTypeMeaning`)
          .d('特殊库存'),
        type: 'string',
        name: 'stockTypeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourcePlatformCodeMeaning`)
          .d('数据来源类型'),
        type: 'string',
        name: 'sourcePlatformCodeMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.agentId`).d('采购员'),
        type: 'string',
        name: 'purchaseAgentName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceParentSettleAndLineNum`)
          .d('父事务处理编号｜行号'),
        type: 'string',
        name: 'sourceParentSettleAndLineNum',
      },

      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.freightFlag`)
          .d('运费标识'),
        type: 'boolean',
        name: 'freightFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ecPoNum`)
          .d('电商订单编号'),
        type: 'string',
        name: 'ecPoNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ecPoSubNum`)
          .d('电商子订单编号'),
        type: 'string',
        name: 'ecPoSubNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.deliverTime`)
          .d('妥投时间'),
        type: 'dateTime',
        name: 'deliverTime',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.deliverQuantity`)
          .d('妥投数量'),
        type: 'number',
        name: 'deliverQuantity',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ecDeliverQuantity`)
          .d('配送数量'),
        type: 'number',
        name: 'ecDeliverQuantity',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceMethodMeaning`)
          .d('开票方式'),
        type: 'string',
        name: 'invoiceMethodMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceInformation`)
          .d('电商发票信息'),
        type: 'string',
        name: 'invoiceInfo',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.afterSalesStatusMeaning`)
          .d('电商售后状态'),
        type: 'string',
        name: 'afterSalesStatusMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTypeMeaning`)
          .d('电商开票类型'),
        type: 'string',
        name: 'invoiceTypeMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.costName`).d('成本中心'),
        type: 'string',
        name: 'costName',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ouName`).d('业务实体'),
        type: 'string',
        name: 'ouName',
      },
      {
        name: 'sinvLineAttachmentUuid',
        type: 'attachment',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleAttach`)
          .d('结算事务行附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.termCode`).d('付款条件'),
        type: 'string',
        name: 'termCode',
      },
      {
        label: intl.get(`ssta.settlePool.model.settlePool.supplierOrderTypeCode`).d('E卡标志'),
        type: 'string',
        name: 'supplierOrderTypeCode',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceInfo`)
          .d('电商发票信息'),
        type: 'string',
        name: 'invoiceInfo',
      },
      {
        type: 'string',
        name: 'multiDealTrxNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealTrxNum`)
          .d('三方交易关联事务来源编号'),
      },
      {
        type: 'string',
        name: 'multiDealTrxLineNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealTrxLineNum`)
          .d('三方交易关联事务来源行'),
      },
      {
        type: 'string',
        name: 'multiDealPoNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealPoNum`)
          .d('三方交易关联订单编号'),
      },
      {
        type: 'string',
        name: 'multiDealPoLineNum',
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.multiDealPoLineNum`)
          .d('三方交易关联订单行号'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.pcSubjectLineNum`)
          .d('协议标的行号'),
        type: 'string',
        name: 'pcSubjectLineNum',
      },
      {
        name: 'poClosedFlagMeaning',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettlePool.model.purchaseSettlePool.poClosedFlag')
          .d('订单关闭标识'),
      },
      {
        label: intl.get(`ssta.common.model.common.unitName`).d('部门名称'),
        type: 'string',
        name: 'unitName',
      },
      /**
       * 对账信息
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billOccupiedQuantity`)
          .d('对账占用数量'),
        type: 'number',
        name: 'billOccupiedQuantity',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billOccupiedNetAmount`)
          .d('对账占用金额(不含税)'),
        type: 'number',
        name: 'billOccupiedNetAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billOccupiedTaxAmount`)
          .d('对账占用税额'),
        type: 'number',
        name: 'billOccupiedTaxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billOccupiedAmount`)
          .d('对账占用金额(含税)'),
        type: 'number',
        name: 'billOccupiedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billCompletedQuantity`)
          .d('对账完成数量'),
        type: 'number',
        name: 'billCompletedQuantity',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billCompletedNetAmount`)
          .d('对账完成金额(不含税)'),
        type: 'number',
        name: 'billCompletedNetAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billCompletedTaxAmount`)
          .d('对账完成税额'),
        type: 'number',
        name: 'billCompletedTaxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billCompletedAmount`)
          .d('对账完成金额(含税)'),
        type: 'number',
        name: 'billCompletedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billRemoveFlag`)
          .d('对账暂挂'),
        type: 'boolean',
        name: 'billRemoveFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billLockQuantity`)
          .d('对账锁定标记'),
        type: 'string',
        name: 'billLockQuantity',
      },
      /**
       * 开票信息
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceOccupiedQuantity`)
          .d('开票占用数量'),
        type: 'number',
        name: 'invoiceOccupiedQuantity',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceOccupiedNetAmount`)
          .d('开票占用金额(不含税)'),
        type: 'number',
        name: 'invoiceOccupiedNetAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceOccupiedTaxAmount`)
          .d('开票占用税额'),
        type: 'number',
        name: 'invoiceOccupiedTaxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceOccupiedAmount`)
          .d('开票占用金额(含税)'),
        type: 'number',
        name: 'invoiceOccupiedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceCompletedQuantity`)
          .d('开票完成数量'),
        type: 'number',
        name: 'invoiceCompletedQuantity',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceCompletedNetAmount`)
          .d('开票完成金额(不含税)'),
        type: 'number',
        name: 'invoiceCompletedNetAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceCompletedTaxAmount`)
          .d('开票完成税额'),
        type: 'number',
        name: 'invoiceCompletedTaxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceCompletedAmount`)
          .d('开票完成金额(含税)'),
        type: 'number',
        name: 'invoiceCompletedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceRemoveFlag`)
          .d('开票暂挂'),
        type: 'boolean',
        name: 'invoiceRemoveFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceLockQuantity`)
          .d('开票锁定标记'),
        type: 'string',
        name: 'invoiceLockQuantity',
      },
      /**
       * 付款信息
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentOccupiedAmountMeaning`)
          .d('付款占用金额'),
        type: 'number',
        name: 'paymentOccupiedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentCompletedAmountMeaning`)
          .d('付款完成金额'),
        type: 'number',
        name: 'paymentCompletedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      // {
      //   label: intl
      //     .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceOccupiedTaxAmount`)
      //     .d('开票占用税额'),
      //   type: 'string',
      //   name: 'invoiceOccupiedTaxAmount',
      // },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentRemoveFlag`)
          .d('付款暂挂'),
        type: 'boolean',
        name: 'paymentRemoveFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentLockQuantity`)
          .d('付款锁定标记'),
        type: 'string',
        name: 'paymentLockQuantity',
      },
      /**
       * 结算数据规则
       */

      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigNum`)
          .d('结算策略编号'),
        type: 'string',
        name: 'settleConfigNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigName`)
          .d('结算策略名称'),
        type: 'string',
        name: 'settleConfigName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigVersionNumber`)
          .d('版本号'),
        type: 'string',
        name: 'versionNumber',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleBasePrice`)
          .d('结算基准价'),
        type: 'string',
        name: 'settleBasePriceMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMode`)
          .d('结算模式'),
        type: 'string',
        name: 'settleModeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimensionMeaning',
      },
      /**
       * 对账单规则
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billCompanyMeaning`)
          .d('对账公司'),
        type: 'string',
        name: 'billCompanyMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billSupplierMeaning`)
          .d('对账供应商'),
        type: 'string',
        name: 'billSupplierMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billPartMatchFlag`)
          .d('部分匹配'),
        type: 'boolean',
        name: 'billPartMatchFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceAdjustFlag`)
          .d('单价调整'),
        type: 'boolean',
        name: 'priceAdjustFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billDependencyFlag`)
          .d('是否依赖'),
        type: 'boolean',
        name: 'billDependencyFlag',
        trueValue: 1,
        falseValue: 0,
      },
      /**
       * 结算单规则
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceSettleCompanyCodeMeaning`)
          .d('开票结算公司'),
        type: 'string',
        name: 'invoiceSettleCompanyCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentSettleCompanyCodeMeaning`)
          .d('付款结算公司'),
        type: 'string',
        name: 'paymentSettleCompanyCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceSettleSupplierCode`)
          .d('开票供应商'),
        type: 'string',
        name: 'invoiceSettleSupplierCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentSettleSupplierCode`)
          .d('付款供应商'),
        type: 'string',
        name: 'paymentSettleSupplierCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoicePartMatchFlag`)
          .d('部分匹配-开票'),
        type: 'boolean',
        name: 'invoicePartMatchFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentPartMatchFlag`)
          .d('部分匹配-付款'),
        type: 'boolean',
        name: 'paymentPartMatchFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoicePriceEditFlag`)
          .d('单价调整'),
        type: 'boolean',
        name: 'invoicePriceEditFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTaxRateEditFlag`)
          .d('税率调整'),
        type: 'boolean',
        name: 'invoiceTaxRateEditFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTaxAmountEditFlag`)
          .d('税额调整'),
        type: 'boolean',
        name: 'invoiceTaxAmountEditFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'taxAmountAllowanceRange',
        type: 'number',
        range: ['taxAllowanceAmountLower', 'taxAllowanceAmountUpper'],
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTaxAllowanceAmount`)
          .d('税额允差'),
      },
      {
        name: 'taxAllowanceAmountLower',
        type: 'number',
        bind: 'taxAmountAllowanceRange.taxAllowanceAmountLower',
      },
      {
        name: 'taxAllowanceAmountUpper',
        type: 'number',
        bind: 'taxAmountAllowanceRange.taxAllowanceAmountUpper',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceDependencyFlag`)
          .d('是否依赖-开票'),
        type: 'boolean',
        name: 'invoiceDependencyFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentDependencyFlag`)
          .d('是否依赖-付款'),
        type: 'boolean',
        name: 'paymentDependencyFlag',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: (config) => {
        const { dataSet } = config;
        const {
          queryParameter: { settleId, settleErrorId, type },
        } = dataSet;
        const url =
          type === 'B'
            ? isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settles/detail-for-bill/${settleId}`
              : `/ssta/v1/settles/detail-detail-for-bill/${settleId}`
            : type === 'E'
            ? isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/ssta-settle-errors/detail/${settleErrorId}`
              : `/ssta/v1/ssta-settle-errors/detail/${settleErrorId}`
            : isTenantRoleLevel()
            ? `/ssta/v1/${organizationId}/settles/detail/${settleId}`
            : `/ssta/v1/settles/detail/${settleId}`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};

const configDS = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    queryParameter: { customizeUnitCode },
    fields: [
      /**
       * 结算数据规则
       */

      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigNum`)
          .d('结算策略编号'),
        type: 'string',
        name: 'settleConfigNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigName`)
          .d('结算策略名称'),
        type: 'string',
        name: 'settleConfigName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigVersionNumber`)
          .d('版本号'),
        type: 'string',
        name: 'versionNumber',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleBasePrice`)
          .d('结算基准价'),
        type: 'string',
        name: 'settleBasePriceMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMode`)
          .d('结算模式'),
        type: 'string',
        name: 'settleModeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleMatchDimension`)
          .d('结算匹配维度'),
        type: 'string',
        name: 'settleMatchDimensionMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleConfigVersionNumber1`)
          .d('数据规则版本号'),
        type: 'string',
        name: 'settleConfigVersionNumber',
      },
      /**
       * 对账单规则
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billCompany`)
          .d('对账公司'),
        type: 'string',
        name: 'billCompanyMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billSupplier`)
          .d('对账供应商'),
        type: 'string',
        name: 'billSupplierMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billPartMatchFlag`)
          .d('部分匹配'),
        type: 'boolean',
        name: 'billPartMatchFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceAdjustFlag`)
          .d('单价调整'),
        type: 'boolean',
        name: 'priceAdjustFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.billDependencyFlag`)
          .d('是否依赖'),
        type: 'boolean',
        name: 'billDependencyFlag',
        trueValue: 1,
        falseValue: 0,
      },
      /**
       * 结算单规则
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceSettleCompanyCodeMeaning`)
          .d('开票结算公司'),
        type: 'string',
        name: 'invoiceSettleCompanyCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentSettleCompanyCodeMeaning`)
          .d('付款结算公司'),
        type: 'string',
        name: 'paymentSettleCompanyCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceSettleSupplierCode`)
          .d('开票供应商'),
        type: 'string',
        name: 'invoiceSettleSupplierCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentSettleSupplierCode`)
          .d('付款供应商'),
        type: 'string',
        name: 'paymentSettleSupplierCodeMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoicePartMatchFlag`)
          .d('部分匹配-开票'),
        type: 'boolean',
        name: 'invoicePartMatchFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentPartMatchFlag`)
          .d('部分匹配-付款'),
        type: 'boolean',
        name: 'paymentPartMatchFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoicePriceEditFlag`)
          .d('单价调整-开票'),
        type: 'boolean',
        name: 'invoicePriceEditFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTaxRateEditFlag`)
          .d('税率调整-开票'),
        type: 'boolean',
        name: 'invoiceTaxRateEditFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTaxAmountEditFlag`)
          .d('税额调整-开票'),
        type: 'boolean',
        name: 'invoiceTaxAmountEditFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'taxAmountAllowanceRange',
        type: 'number',
        range: ['taxAllowanceAmountLower', 'taxAllowanceAmountUpper'],
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceTaxAllowanceAmount`)
          .d('税额允差'),
      },
      {
        name: 'taxAllowanceAmountLower',
        type: 'number',
        bind: 'taxAmountAllowanceRange.taxAllowanceAmountLower',
      },
      {
        name: 'taxAllowanceAmountUpper',
        type: 'number',
        bind: 'taxAmountAllowanceRange.taxAllowanceAmountUpper',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceDependencyFlag`)
          .d('是否依赖-开票'),
        type: 'boolean',
        name: 'invoiceDependencyFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentDependencyFlag`)
          .d('是否依赖-付款'),
        type: 'boolean',
        name: 'paymentDependencyFlag',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: (config) => {
        const { dataSet } = config;
        const {
          queryParameter: { settleId, settleConfigNum, type, settleConfigId },
        } = dataSet;
        if (!settleConfigNum) {
          return;
        }
        const url =
          type === 'E'
            ? isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settle-config/release-config/${settleConfigNum}`
              : // `/ssta/v1/${organizationId}/settle-config/detailBySettleConfigNum/${settleConfigNum}`
                `/ssta/v1//settle-config/detailBySettleConfigNum/${settleConfigNum}`
            : type === 'F'
            ? isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settle-config/current-config-by-id/${settleConfigId}`
              : `/ssta/v1/settle-config/current-config-by-id/${settleConfigId}`
            : isTenantRoleLevel()
            ? `/ssta/v1/${organizationId}/settle-config/release-config/${settleConfigNum}`
            : `/ssta/v1/settles/detail/${settleId}`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};

export { invoiceDS, reconDS, payDS, detailDS, configDS };
