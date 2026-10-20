/*
 * @Description: file content
 * @Date: 2022-02-15 20:35:24
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import { invert, isArray, isUndefined, isEmpty, isNil, pick } from 'lodash';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { PHONE } from 'utils/regExp';
import { HZERO_IAM } from 'utils/config';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import {
  wholeTableUnitCodes,
  wholeSearchUnitCodes,
  detailTableUnitCodes,
  detailSearchUnitCodes,
} from '@/routes/NewSupplySettle/StoreProvider';
import {
  headUnitCodes,
  lineUnitCodes,
  taxInvGirdCode,
  quoteInvUnitCodes,
  writeOffAddUnitCodes,
  multiWriteOffAddUnitCodes,
  cuszLineUnitCodes,
  advanceInvListCodes,
  paymentStageCode,
  paymentStageLineCode,
} from '@/routes/NewSupplySettle/Detail/StoreProvider';
import { decimalSum, noZeroValidator, settleLineConfig } from '@/utils/amountConfig';
import {
  numberFormatterOptions,
  transformSupplierData,
  amountFormatterOptions,
  transformQselectDate,
} from '@/utils/utils';

const organizationId = getCurrentOrganizationId();
const prefix = `${SRM_SSTA}/v1/${organizationId}`;

const editAbleRender = ({ record, dataSet, name }) => {
  const { preEditor } = settleLineConfig[name];
  const ds = dataSet || record.dataSet;
  const { parent } = ds;
  const documentType = parent.current.get('documentType');
  const updateFlag = isUndefined(ds.getState('updateFlag')) ? parent.getState('updateFlag') : ds.getState('updateFlag');
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

const taxValidator = (value, name, record) => {
  // eslint-disable-next-line prefer-destructuring
  const dataSet = record.dataSet;
  const taxConfigMap = dataSet.getState('taxConfigMap') || [];
  const invoiceSpecies = record.get('invoiceSpecies');
  const invoiceSpeciesConfigItem = taxConfigMap.find((item) => item.invoiceType === invoiceSpecies);
  if (!invoiceSpeciesConfigItem || isEmpty(invoiceSpeciesConfigItem) || !value?.length) return true;
  const targetFieldLength = name === 'invoiceCode' ? 'invoiceCodeLength' : 'invoiceNumLength';
  const targetTaxLength = Number(invoiceSpeciesConfigItem[targetFieldLength]);
  return value.length !== targetTaxLength
    ? intl
        .get('ssta.common.validate.message.fieldOverLength', { len: targetTaxLength })
        .d('字段长度异常，根据配置表仅能输入{len}位字符')
    : true;
};

export const permissionDS = (permissionCodeMap, ingoreKeyList = []) => {
  return {
    autoQuery: true,
    autoCreate: true,
    dataToJson: 'all',
    data: [{}],
    fields: Object.keys(permissionCodeMap).map((name) => ({ name, type: 'boolean' })),
    transport: {
      read: () => {
        return {
          url: `${HZERO_IAM}/hzero/v1/menus/check-permissions`,
          method: 'POST',
          params: {},
          data: Object.values(permissionCodeMap),
          transformResponse: (res) => {
            try {
              const invertCodeMap = invert(permissionCodeMap);
              return Object.fromEntries(
                JSON.parse(res).map(({ code, approve }) => {
                  const permissionKey = invertCodeMap[code];
                  return [permissionKey, ingoreKeyList.includes(permissionKey) ? true : approve];
                })
              );
            } catch {
              return {};
            }
          },
        };
      },
    },
  };
};

export const wholeTableDS = (action) => {
  return {
    pageSize: 20,
    autoQuery: false,
    forceValidate: true,
    cacheSelection: true,
    selection: 'multiple',
    dataToJSON: 'selected',
    autoQueryAfterSubmit: false,
    primaryKey: 'settleHeaderId',
    queryParameter: {
      customizeUnitCode: [wholeSearchUnitCodes[action], wholeTableUnitCodes[action]].join(),
    },
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
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentTypeMeaning`).d('结算单类型'),
        type: 'string',
        name: 'settleTypeMeaning',
      },
      {
        name: 'invOrganizationName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.invOrganizationName').d('库存组织'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleCustomCompany').d('结算客户公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.supplierCompanyName').d('结算供应商公司'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.currencyCode').d('币种'),
      },
      {
        name: 'netAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.netInvoiceApplyAmount').d('发票申请金额（不含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceApplyTaxAmount').d('发票申请税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.includedInvoiceApplyAmount').d('发票申请金额（含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'paymentAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.collectionAmount').d('收款总金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'applyAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.applyCollectionAmount').d('预收款核销总金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'prepaymentAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.preCollectionApplyAmount').d('预收款申请金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'settleStatus',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
      {
        name: 'settleStatusMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
      },
      {
        name: 'syncStatus',
        type: 'string',
        lookupCode: 'SSTA.SETTLE_HEADER_SYNC_STATUS',
        label: intl.get('ssta.supplySettle.model.supplySettle.syncStatusMeaning').d('同步ERP状态'),
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
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'sourceSupplierCompanyName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.sourceSupplierName').d('数据源平台供应商名称'),
      },
      {
        name: 'sourceSupplierCompanyNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.sourceSupplierCompanyNum').d('数据源平台供应商编码'),
      },
      {
        name: 'confirmCollaborativeMode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.confirmCollaborativeModes').d('协同模式'),
      },
      {
        name: 'supplierSiteCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.supplierSiteCode').d('供应商地点'),
      },
      // 退款相关字段
      {
        name: 'refundStatus',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.refundStatus').d('预付款退款标识'),
        lookupCode: 'SSTA.SETTLE_REFUND_STATUS',
      },
      {
        name: 'prepaymentRefundAmount',
        type: 'string',
        label: intl.get(`ssta.supplySettle.model.supplySettle.prePaymentRefundAmount`).d('预付款退款总金额'),
      },
    ],
    transport: {
      read: ({ dataSet, data }) => {
        const reParams = dataSet.getState('reParams');
        return {
          url: `${prefix}/settle-headers/supplier/page`,
          method: 'GET',
          data: filterNullValueObject({
            ...data,
            ...transformQselectDate(data, { dateRange: 'creationDate' }),
            ...transformSupplierData(data.supplierCompanyId),
            ...reParams,
            action: action.toUpperCase(),
          }),
        };
      },
      submit: ({ dataSet, data }) => {
        const { customizeUnitCode: queryDataCode } = dataSet.queryParameter;
        const submitType = dataSet.getState('submitType');
        const { filledInfo = {}, filledInfoCode = '' } = dataSet.getState('filledParams') || {};
        switch (submitType) {
          case 'withdraw':
            return {
              url: `${prefix}/settle-headers/supplier/recall`,
              method: 'PUT',
              data: data[0],
              params: dataSet.queryParameter,
            };
          case 'cancel':
            return {
              url: `${prefix}/settle-headers/supplier/cancel`,
              method: 'PUT',
              params: { customizeUnitCode: `${queryDataCode},${filledInfoCode}` },
              data: data.map((item) => ({ ...item, ...filledInfo })),
            };
          case 'delete':
            return {
              url: `${prefix}/settle-headers/supplier/batch-delete`,
              method: 'PUT',
              params: dataSet.queryParameter,
            };
          case 'return':
            return {
              url: `${prefix}/settle-headers/supplier/return`,
              method: 'PUT',
              params: { customizeUnitCode: `${queryDataCode},${filledInfoCode}` },
              data: data.map((item) => ({ ...item, ...filledInfo })),
            };
          case 'deleteSettle':
            return {
              url: `${prefix}/settle-headers/supplier/physics-delete`,
              method: 'POST',
              params: dataSet.queryParameter,
              data: data[0],
            };
          default:
        }
      },
    },
  };
};

export const detailInvTableDS = () => {
  return {
    pageSize: 20,
    autoQuery: false,
    cacheSelection: true,
    selection: 'multiple',
    dataToJSON: 'selected',
    primaryKey: 'settleLineId',
    fields: [
      {
        name: 'settleStatus',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
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
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentTypeMeaning`).d('结算单类型'),
        type: 'string',
        name: 'settleTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleTransactionNum`).d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.sourceSettleNumAndLineNum`).d('结算事务来源编号｜行号'),
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
        label: intl.get('ssta.supplySettle.model.supplySettle.suppliersCompanysName').d('结算供应商公司'),
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
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.netInvoiceApplyAmount').d('发票申请金额（不含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
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
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.unitPriceBatch').d('每'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.netAmounts`).d('本次开票不含税金额'),
        type: 'number',
        name: 'netAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
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
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.taxIncludedsPrice`).d('本次开票含税单价'),
        type: 'number',
        name: 'taxIncludedPrice',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.taxIncludedsAmounts`).d('本次开票含税金额'),
        type: 'number',
        name: 'taxIncludedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleMatchDimension`).d('结算匹配维度'),
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
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'invoicePayEnableFlag',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceCollectionFlag').d('启用开票并收款'),
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.CollectionAmount`).d('本次收款金额'),
        type: 'number',
        name: 'paymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.applysCollectionAmount`).d('本次预收款核销金额'),
        type: 'number',
        name: 'applyAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.invoicedAmount`).d('已开票含税金额'),
        type: 'number',
        name: 'invoicedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.paidCollectionAmount`).d('已收款金额'),
        type: 'number',
        name: 'paidAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.trxDate`).d('结算事务日期'),
        type: 'date',
        name: 'trxDate',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.poAndLineNum`).d('采购订单编号｜行号'),
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
        label: intl.get('ssta.supplySettle.model.supplySettle.sourceParentSettleLineNum').d('父事务编号|行号'),
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
        label: intl.get('ssta.supplySettle.model.supplySettle.trxTypeCodeMeaning').d('采购事务类型'),
      },
      {
        name: 'dataSourceMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.dataSourceMeaning').d('数据来源系统'),
      },
      {
        name: 'sourcePlatformCodeMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.sourcePlatformCodeMeaning').d('数据来源类型'),
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
      {
        name: 'supplierSiteCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.supplierSiteCode').d('供应商地点'),
      },
      {
        name: 'multiDealTrxNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.multiDealTrxNum').d('三方交易关联事务来源编号'),
      },
      {
        name: 'multiDealTrxLineNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.multiDealTrxLineNum').d('三方交易关联事务来源行'),
      },
      {
        name: 'multiDealPoNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.multiDealPoNum').d('三方交易关联订单编号'),
      },
      {
        name: 'multiDealPoLineNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.multiDealPoLineNum').d('三方交易关联订单行号'),
      },
      {
        name: 'thirdSkuCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.thirdSkuCode').d('第三方商品编码'),
      },
      {
        name: 'thirdSkuName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.thirdSkuName').d('第三方商品名称'),
      },
      {
        name: 'poCreateName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.poCreateName').d('订单创建人'),
      },
      {
        name: 'orderTypeName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.orderTyoeName').d('订单类型名称'),
      },
      {
        name: 'unitName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.unitName').d('部门名称'),
      },
      {
        name: 'lineRemark',
        type: 'string',
        label: intl.get('ssta.common.model.common.lineRemark').d('行备注'),
      },
    ],
    transport: {
      read: ({ dataSet, params, data }) => {
        const reParams = dataSet.getState('reParams');
        return {
          url: `${prefix}/settle-lines/supplier`,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            ...reParams,
            action: 'INVOICE',
            customizeUnitCode: [detailTableUnitCodes.invoice, detailSearchUnitCodes.invoice].join(),
          }),
          data: filterNullValueObject({
            ...data,
            ...transformQselectDate(data, { dateRange: 'creationDate' }),
            ...transformSupplierData(data.supplierCompanyId),
          }),
        };
      },
    },
  };
};
export const detailPayTableDS = () => {
  return {
    pageSize: 20,
    autoQuery: false,
    cacheSelection: true,
    selection: 'multiple',
    dataToJSON: 'selected',
    primaryKey: 'settleLineId',
    fields: [
      {
        name: 'settleStatus',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
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
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentTypeMeaning`).d('结算单类型'),
        type: 'string',
        name: 'settleTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleTransactionNum`).d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.sourceSettleNumAndLineNum`).d('结算事务来源编号｜行号'),
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
        label: intl.get('ssta.supplySettle.model.supplySettle.supplierCompanyssName').d('结算供应商公司'),
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
        label: intl.get(`ssta.supplySettle.model.supplySettle.invoiceApplySettleNum`).d('发票申请结算单号'),
        type: 'string',
        name: 'sourceSettleHeaderNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.CollectionsAmount`).d('本次收款金额'),
        type: 'number',
        name: 'paymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.applysCollectionAmount`).d('本次预收款核销金额'),
        type: 'number',
        name: 'applyAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.invoicedAmount`).d('已开票含税金额'),
        type: 'number',
        name: 'invoicedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.paidCollectionAmount`).d('已收款金额'),
        type: 'number',
        name: 'paidAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleMatchDimension`).d('结算匹配维度'),
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
        label: intl.get('ssta.supplySettle.model.supplySettle.sourceParentSettlesLineNum').d('父事务编号|行号'),
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
        label: intl.get('ssta.supplySettle.model.supplySettle.trxTypeCodeMeaning').d('采购事务类型'),
      },
      {
        name: 'dataSourceMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.dataSourceMeaning').d('数据来源系统'),
      },
      {
        name: 'sourcePlatformCodeMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.sourcePlatformCodeMeaning').d('数据来源类型'),
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
      {
        name: 'supplierSiteCode',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.supplierSiteCode').d('供应商地点'),
      },
      {
        name: 'multiDealTrxNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.multiDealTrxNum').d('三方交易关联事务来源编号'),
      },
      {
        name: 'multiDealTrxLineNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.multiDealTrxLineNum').d('三方交易关联事务来源行'),
      },
      {
        name: 'multiDealPoNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.multiDealPoNum').d('三方交易关联订单编号'),
      },
      {
        name: 'multiDealPoLineNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.multiDealPoLineNum').d('三方交易关联订单行号'),
      },
      {
        name: 'lineRemark',
        type: 'string',
        label: intl.get('ssta.common.model.common.lineRemark').d('行备注'),
      },
    ],
    transport: {
      read: ({ dataSet, params, data }) => {
        const reParams = dataSet.getState('reParams');
        return {
          url: `${prefix}/settle-lines/supplier`,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            ...reParams,
            action: 'PAYMENT',
            customizeUnitCode: [detailTableUnitCodes.payment, detailSearchUnitCodes.payment].join(),
          }),
          data: filterNullValueObject({
            ...data,
            ...transformQselectDate(data, { dateRange: 'creationDate' }),
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
export const detailPreTableDS = () => {
  return {
    pageSize: 20,
    autoQuery: false,
    cacheSelection: true,
    selection: 'multiple',
    dataToJSON: 'selected',
    primaryKey: 'prepaymentLineId',
    fields: [
      {
        name: 'settleStatus',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
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
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentTypeMeaning`).d('结算单类型'),
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
        label: intl.get('ssta.supplySettle.model.supplySettle.supplierCompanyssName').d('结算供应商公司'),
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
        label: intl.get(`ssta.supplySettle.model.supplySettle.expectCollectionDate`).d('期望收款日期'),
        type: 'dateTime',
        name: 'expectPaymentDate',
      },
      {
        name: 'associateNum',
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateNum`).d('关联单据号'),
        type: 'string',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.associateAmount`).d('关联单据金额'),
        type: 'number',
        name: 'associateAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.preCollectionAmoun`).d('预收款行金额'),
        type: 'number',
        name: 'prepaymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.prepaymentApplyAmount`).d('已核销金额'),
        type: 'number',
        name: 'prepaymentApplyAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
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
      read: ({ dataSet, params, data }) => {
        const reParams = dataSet.getState('reParams');
        return {
          url: `${prefix}/pre-payment-lines/supplier`,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            ...reParams,
            customizeUnitCode: [detailTableUnitCodes.prepayment, detailSearchUnitCodes.prepayment].join(),
          }),
          data: filterNullValueObject({
            ...data,
            ...transformQselectDate(data, { dateRange: 'creationDate' }),
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
export const detailDemTableDS = () => {
  return {
    pageSize: 20,
    autoQuery: false,
    cacheSelection: true,
    selection: 'multiple',
    dataToJSON: 'selected',
    primaryKey: 'dimensionKey',
    fields: [
      {
        name: 'settleStatus',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleStatus').d('结算单状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
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
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentTypeMeaning`).d('结算单类型'),
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
        label: intl.get('ssta.supplySettle.model.supplySettle.supplierCompanyssName').d('结算供应商公司'),
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
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'remainingPaymentAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.remainingCollectionAmount').d('剩余可收款金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },

      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionAmountBy`).d('本次收款金额'),
        type: 'number',
        name: 'paymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionPreAmount`).d('本次预收款核销金额'),
        type: 'number',
        name: 'applyAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },

      {
        name: 'paymentSpliteRuleMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.collectionSpliteRule').d('收款自动拆分规则'),
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
      read: ({ dataSet, params, data }) => {
        const reParams = dataSet.getState('reParams');
        return {
          url: `${prefix}/settle-lines/mutil-payment/supplier`,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            ...reParams,
            customizeUnitCode: [detailTableUnitCodes.demension, detailSearchUnitCodes.demension].join(),
          }),
          data: filterNullValueObject({
            ...data,
            ...transformQselectDate(data, { dateRange: 'creationDate' }),
            ...transformSupplierData(data.supplierCompanyId),
          }),
        };
      },
    },
  };
};

export const quoteInvoiceDS = () => {
  return {
    pageSize: 20,
    autoQuery: false,
    dataToJSON: 'selected',
    cacheSelection: true,
    primaryKey: 'settleHeaderId',
    queryParameter: {
      customizeUnitCode: quoteInvUnitCodes.join(),
    },
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
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentTypeMeaning`).d('结算单类型'),
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
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleSupplierCompany').d('结算供应商'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.currencyCode').d('币种'),
      },
      {
        name: 'netAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.netInvoiceApplyAmount').d('发票申请金额（不含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceApplyTaxAmount').d('发票申请税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.includedInvoiceApplyAmount').d('发票申请金额（含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'paidAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.paidCollectionAmount').d('已收款金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'remainingPaymentAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.remainCollectionAmountBy').d('剩余收款金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionAmountBy`).d('本次收款金额'),
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
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.applysCollectionAmount`)
          .d('本次预收款核销金额'),
        type: 'number',
        name: 'applyAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
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
      {
        name: 'predictExpectPaymentDate',
        type: 'date',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.preExpPayDate').d('预计期望付款日期'),
      },
      {
        name: 'predictExpectPaymentDateCalculateStatus',
        type: 'string',
        lookupCode: 'SSTA.PREDICT_EXPECT_PAYMENT_DATE.CALCULATE_STATUS',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.preExpPayDateCalcStatus')
          .d('预计期望付款日期计算状态'),
      },
      {
        name: 'predictExpectPaymentDateTriggerAction',
        type: 'string',
        lookupCode: 'SSTA.PREDICT_EXPECT_PAYMENT_DATE.TRIGGER_ACTION',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.preExpPayDateTriggerAction')
          .d('预计期望付款日期触发动作'),
      },
      {
        name: 'predictExpectPaymentDateCalculateTime',
        type: 'dateTime',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.preExpPayDateCalcTime').d('预计期望付款日期计算时间'),
      },
      {
        name: 'predictExpectPaymentDateCalculateErrorMsg',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.preExpPayDateCalcErrorMsg')
          .d('预计期望付款日期计算错误信息'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${prefix}/settle-headers/supplier/payment-by-invoice`,
          method: 'GET',
          data: filterNullValueObject({
            ...data,
            ...transformQselectDate(data, { creationDateRange: 'creationDate' }),
            ...transformSupplierData(data.supplierCompanyId),
          }),
        };
      },
      submit: ({ dataSet, data }) => {
        const stepFlag = dataSet.getState('stepFlag');
        const submitType = dataSet.getState('submitType');
        const supplierObj = transformSupplierData(dataSet?.queryDataSet?.current?.get('supplierCompanyId')) || {};
        if (submitType === 'submit') {
          return {
            url: `${prefix}/settle-headers/supplier/create-payment-by-invoice`,
            method: 'POST',
            data: data.map((item) => ({ ...item, stepFlag })),
          };
        } else if (submitType === 'createValidate') {
          return {
            url: `${prefix}/settle-headers/supplier/validate/create-payment-by-invoice`,
            method: 'POST',
            data: data.map((item) => ({ ...item, stepFlag })),
          };
        } else if (submitType === 'createSelectedSync') {
          const queryData = dataSet.queryDataSet?.current?.toData() || {};
          return {
            url: `/ssta/v1/${organizationId}/settle-headers/supplier/payment-by-invoice/batch`,
            method: 'POST',
            data: filterNullValueObject({
              stepFlag,
              ...queryData,
              ...transformQselectDate(queryData, { creationDateRange: 'creationDate' }),
              ...supplierObj,
              customizeUnitCode: quoteInvUnitCodes.join(),
              settleHeaderList: data,
            }),
          };
        }
      },
    },
    feedback: {
      submitSuccess: () => {},
    },
  };
};

export const payRecordDS = (settleHeaderId) => {
  return {
    autoQuery: true,
    selection: false,
    pageSize: 20,
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
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.collectionDate`).d('收款日期'),
        type: 'date',
        name: 'paymentDate',
      },
      {
        label: intl.get(`ssta.purchaseSettle.view.message.model.purchaseSettle.collectionType`).d('收款类型'),
        type: 'string',
        name: 'paymentTypeMeaning',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${prefix}/payment-records/${settleHeaderId}/show`,
          method: 'GET',
        };
      },
    },
  };
};

export const writeOffRecordDS = (prepaymentLineId) => {
  return {
    autoQuery: true,
    selection: false,
    pageSize: 20,
    fields: [
      {
        name: 'settleTransactionNum',
        type: 'string',
        label: intl.get('hzero.common.components.operationAudit.settleTransactionNum').d('结算事务编号'),
      },
      {
        name: 'settleNum',
        type: 'string',
        label: intl.get('hzero.common.components.operationAudit.settleNum').d('关联结算单号'),
      },
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get('hzero.common.components.operationAudit.lineNum').d('关联结算行号'),
      },
      {
        name: 'applyAmount',
        type: 'number',
        label: intl.get('hzero.common.components.operationAudit.applyAmount').d('核销金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'settleStatusMeaning',
        type: 'string',
        label: intl.get('hzero.common.components.operationAudit.settleStatusMeaning').d('关联结算单状态'),
      },
    ],
    transport: {
      read: () => ({
        url: `${prefix}/pre-payment-lines/write/off/record/${prepaymentLineId}`,
        method: 'GET',
      }),
    },
  };
};

export const taxInvoiceDS = (settleHeaderId) => {
  return {
    pageSize: 20,
    autoQuery: false,
    forceValidate: true,
    selection: 'multiple',
    dataToJSON: 'selected',
    cacheSelection: true,
    primaryKey: 'taxInvoiceHeaderId',
    queryParameter: { customizeUnitCode: taxInvGirdCode },
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
        // required: true,
        dynamicProps: {
          required: ({ record }) =>
            ![
              'COMMERCIAL_INVOICE',
              'VAT_ALL_ELECTRONIC_SPECIAL_INVOICE',
              'VAT_ALL_ELECTRONIC_ORDINARY_INVOICE',
              'VAT_ALL_PAPER_SPECIAL_INVOICE',
              'VAT_ALL_PAPER_ORDINARY_INVOICE',
              'VAT_ALL_ELECTRONIC_VEHICLE_SELL_INVOICE',
              'VAT_ALL_ELECTRONIC_TRAFFIC_FEE_INVOICE',
              'VAT_ALL_PAPER__VEHICLE_SELL_INVOICE',
            ].includes(record.get('invoiceSpecies')),
        },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.invoiceNumber`).d('发票号码'),
        type: 'string',
        name: 'invoiceNumber',
        required: true,
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.invoicingDate`).d('开票日期'),
        type: 'date',
        name: 'invoicingDate',
        computedProps: {
          required: ({ dataSet }) => {
            const enableCheckFlag = dataSet.getState('enableCheckFlag');
            return enableCheckFlag === 1;
          },
        },
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.netAmount`).d('不含税金额'),
        type: 'number',
        name: 'netAmount',
        required: true,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.taxAmount`).d('税额'),
        type: 'number',
        name: 'taxAmount',
        required: true,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.taxIncludedAmount`).d('含税金额'),
        type: 'number',
        name: 'taxIncludedAmount',
        required: true,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.invoiceSpecies`).d('发票种类'),
        type: 'string',
        name: 'invoiceSpecies',
        required: true,
        lookupCode: 'SSTA.INVOICE_TYPE',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.invoiceSpecies`).d('发票种类'),
        type: 'string',
        name: 'invoiceSpeciesMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.deductFlag`).d('是否抵扣'),
        type: 'boolean',
        name: 'deductFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.checkCodeMeaning`).d('校验码'),
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
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.validateStatus`).d('查验状态'),
        type: 'string',
        name: 'validateStatus',
        lookupCode: 'SSTA.INVOICE_CHECK_STATUS',
        defaultValue: 'UNCHECK',
      },

      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.validateMessage`).d('查验状态说明'),
        type: 'string',
        name: 'validateMessage',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.taxInvoiceStatus`).d('发票状态'),
        type: 'string',
        name: 'taxInvoiceStatus',
        lookupCode: 'SSTA.TAX_INVOICE_STATUS',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.taxInvoiceStatus`).d('发票状态'),
        type: 'string',
        name: 'taxInvoiceStatusMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.invoiceUrl`).d('电子发票地址'),
        type: 'string',
        name: 'invoiceUrl',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.detaild`).d('操作'),
        type: 'string',
        name: 'detailed',
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl.get('hzero.common.button.uploadView').d('附件查看'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: 'finance-invoice',
        // showHistory: true,
        // max: 9,
        // sortable: true,
      },
      // 发票池字段转来
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get('ssta.supplyInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方名称'),
      },
      {
        name: 'supUnifiedSocialCode',
        type: 'string',
        label: intl.get('ssta.supplyInvoicePool.model.purchaseInvoicePool.supUnifiedSocialCode').d('销方纳税人识别号'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.supplyInvoicePool.model.purchaseInvoicePool.companyName').d('购方名称'),
      },
      {
        name: 'purUnifiedSocialCode',
        type: 'string',
        label: intl.get('ssta.supplyInvoicePool.model.purchaseInvoicePool.purUnifiedSocialCode').d('购方纳税人识别号'),
      },
      {
        name: 'seeocr',
        type: 'string',
        label: intl.get('ssta.supplyInvoicePool.model.purchaseInvoicePool.OcrFile').d('OCR文件'),
      },
      {
        name: 'ofdFileUrl',
        type: 'string',
        label: intl.get('ssta.common.view.message.ofdFileUrl').d('OFD文件'),
      },
      {
        name: 'aiAttachmentUrl',
        type: 'string',
        label: intl.get(`ssta.common.model.common.aiRecognizeFile`).d('AI识别文件'),
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.validateStatus`).d('查验状态'),
        type: 'string',
        name: 'validateStatusMeaning',
      },
      {
        name: 'associatedApplyNum',
        type: 'string',
        label: intl.get('ssta.common.model.common.associatedInvApplyDocNum').d('关联开票申请单号'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${prefix}/tax-invoice-headers/${settleHeaderId}`,
          method: 'GET',
        };
      },
      submit: ({ dataSet }) => {
        const submitType = dataSet.getState('submitType');
        switch (submitType) {
          case 'check':
            return {
              url: `${prefix}/tax-invoice-headers/batch-check`,
              method: 'POST',
            };
          case 'autoCheck':
            return {
              url: `${prefix}/tax-invoice-headers/check-settle-header/${settleHeaderId}/AUTO`,
              method: 'POST',
              data: null,
            };
          case 'validate':
            return {
              url: `${prefix}/tax-invoice-headers/validate/${settleHeaderId}`,
              method: 'GET',
              data: null,
            };
          default:
        }
      },
      destroy: ({ data }) => {
        return {
          url: `${prefix}/tax-invoice-headers`,
          method: 'DELETE',
          data,
        };
      },
    },
    feedback: {
      submitSuccess: () => {},
    },
  };
};

/**
 * 销售方结算单税务发票头数据源
 * @return {import('choerodon-ui/dataset/data-set/DataSet').DataSetProps}
 */
export const taxInvHeaderDS = ({ settleHeaderId, enableCheckFlag, taxInvoiceHeaderId, customizeUnitCode }) => ({
  dataToJSON: 'all',
  forceValidate: true,
  primaryKey: 'taxInvoiceHeaderId',
  autoQuery: !isNil(taxInvoiceHeaderId),
  autoCreate: isNil(taxInvoiceHeaderId),
  fields: [
    {
      name: 'taxAmount',
      type: 'number',
      required: true,
      label: intl.get('ssta.costSheet.model.costSheet.thetaxAmount').d('税额'),
      computedProps: {
        formatterOptions: amountFormatterOptions,
        required: ({ dataSet, record }) => {
          const { taxInvoiceLineList } = dataSet.children;
          const { ocrFileUrl, ofdFileUrl } = record.get(['ocrFileUrl', 'ofdFileUrl']);
          return !!ocrFileUrl || !!ofdFileUrl || taxInvoiceLineList?.length === 0;
        },
      },
    },
    {
      label: intl.get(`ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceSpecies`).d('发票种类'),
      type: 'string',
      name: 'invoiceSpecies',
      required: true,
      lookupCode: 'SSTA.INVOICE_TYPE',
    },
    {
      name: 'invoiceType',
      bind: 'invoiceSpecies.value',
    },
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceCode').d('发票代码'),
      // required: true,
      dynamicProps: {
        required: ({ record }) =>
          ![
            'COMMERCIAL_INVOICE',
            'VAT_ALL_ELECTRONIC_SPECIAL_INVOICE',
            'VAT_ALL_ELECTRONIC_ORDINARY_INVOICE',
            'VAT_ALL_PAPER_SPECIAL_INVOICE',
            'VAT_ALL_PAPER_ORDINARY_INVOICE',
            'VAT_ALL_ELECTRONIC_VEHICLE_SELL_INVOICE',
            'VAT_ALL_ELECTRONIC_TRAFFIC_FEE_INVOICE',
            'VAT_ALL_PAPER__VEHICLE_SELL_INVOICE',
          ].includes(record.get('invoiceSpecies')),
        disabled: ({ record }) =>
          [
            'VAT_ALL_ELECTRONIC_SPECIAL_INVOICE',
            'VAT_ALL_ELECTRONIC_ORDINARY_INVOICE',
            'VAT_ALL_PAPER_SPECIAL_INVOICE',
            'VAT_ALL_PAPER_ORDINARY_INVOICE',
            'VAT_ALL_ELECTRONIC_VEHICLE_SELL_INVOICE',
            'VAT_ALL_ELECTRONIC_TRAFFIC_FEE_INVOICE',
            'VAT_ALL_PAPER__VEHICLE_SELL_INVOICE',
          ].includes(record.get('invoiceSpecies')),
      },
      validator: taxValidator,
    },
    {
      name: 'invoiceNumber',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.telCode').d('发票号码'),
      required: true,
      validator: taxValidator,
    },

    {
      name: 'invoicingDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTime').d('开票日期'),
      required: enableCheckFlag,
    },
    {
      name: 'companyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH.CUSTOMER_WITH_TAX',
      lovPara: { tenantId: organizationId },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.buier').d('购方'),
    },
    {
      name: 'companyName',
      bind: 'companyNameLov.companyName',
    },
    {
      name: 'purUnifiedSocialCode',
      bind: 'companyNameLov.unifiedSocialCode',
    },
    {
      name: 'companyId',
      bind: 'companyNameLov.companyId',
    },
    {
      name: 'supplierCompanyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH_SUPPLIER_COMPANY_WITH_TAX',
      lovPara: { tenantId: organizationId },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方'),
      valueField: 'lovKey',
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierCompanyNameLov.companyName',
    },
    {
      name: 'supUnifiedSocialCode',
      bind: 'supplierCompanyNameLov.unifiedSocialCode',
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierCompanyNameLov.companyId',
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierCompanyNameLov.supplierTenantId',
    },
    {
      name: 'netAmount',
      type: 'number',
      required: true,
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.netAmount').d('不含税金额'),
      computedProps: {
        formatterOptions: amountFormatterOptions,
        required: ({ dataSet, record }) => {
          const { taxInvoiceLineList } = dataSet.children;
          const { ocrFileUrl, ofdFileUrl } = record.get(['ocrFileUrl', 'ofdFileUrl']);
          return !!ocrFileUrl || !!ofdFileUrl || taxInvoiceLineList?.length === 0;
        },
      },
    },
    {
      name: 'checkCode',
      type: 'string',
      label: intl
        .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkcodeWarning')
        .d('校验码 (多位时请输入后6位即可)'),
      pattern: /^[a-zA-Z\d]+$/,
      defaultValidationMessages: {
        patternMismatch: intl.get('ssta.purchaseInvoicePool.view.validation.onlyDigitOrLetter').d('请输入字母或者数字'),
      },
      dynamicProps: {
        required: ({ record }) => {
          let flag = false;
          try {
            // 点保存上时出现了get的值为对象的情况，导致使用includes方法报错
            flag = [
              'VAT_PAPER_ORDINARY_INVOICE',
              'VAT_ELECTRONIC_ORDINARY_INVOICE',
              'VAT_ROLL_ORDINARY_INVOICE',
            ].includes(record?.get('invoiceSpecies'));
          } catch (e) {
            flag = false;
          }
          return enableCheckFlag && flag;
        },
      },
    },
    {
      name: 'memo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.memo').d('备忘说明'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
    },

    {
      name: 'seeocr',
      type: 'string',
    },
    {
      name: 'aiAttachmentUrl',
      type: 'string',
      label: intl.get(`ssta.common.model.common.aiRecognizeFile`).d('AI识别文件'),
    },
    {
      name: 'buyerContact',
      type: 'string',
      label: intl.get('ssta.common.model.common.buyerContact').d('购方联系人'),
    },
    {
      name: 'sellerContact',
      type: 'string',
      label: intl.get('ssta.common.model.common.sellerContact').d('销方联系人'),
    },
    {
      name: 'beneficiaryBank',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryBank').d('收款银行'),
    },
    {
      name: 'beneficiaryBankAddress',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryBankAddress').d('收款银行地址'),
    },
    {
      name: 'beneficiaryAccountNum',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryAccountNum').d('收款银行账号'),
    },
    {
      name: 'beneficiaryAccountName',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryAccountName').d('收款银行账户名称'),
    },
    {
      name: 'paymentTerms',
      type: 'string',
      label: intl.get('ssta.common.model.common.paymentTerms').d('支付条款'),
    },
  ],
  queryParameter: { taxInvoiceHeaderId, customizeUnitCode },
  transport: {
    read: ({ dataSet }) => {
      const newTaxtInvoiceHeaderId = dataSet.getState('taxInvoiceHeaderId');
      return {
        url: `${prefix}/tax-invoice-headers/detail/${taxInvoiceHeaderId || newTaxtInvoiceHeaderId}`,
        method: 'GET',
      };
    },
    submit: ({ params, data }) => {
      return {
        url: `${prefix}/tax-invoice-headers/${settleHeaderId}`,
        method: 'POST',
        params: {
          ...params,
          customizeUnitCode,
        },
        data: data.map((item) => {
          const { netAmount, taxAmount } = item;
          return { ...item, netAmount: netAmount || 0, taxAmount: taxAmount || 0 };
        }),
      };
    },
  },
});

/**
 * 销售方结算单税务发票行数据源
 * @return {import('choerodon-ui/dataset/data-set/DataSet').DataSetProps}
 */
export const taxInvLineDS = (customizeCode) => ({
  pageSize: 20,
  autoQuery: false,
  forceValidate: true,
  primaryKey: 'taxInvoiceLineId',
  fields: [
    {
      name: 'taxInvoiceLineNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.linseNum').d('行号'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.chargsseCodeOrItemName').d('项目名称/货物或应税劳务，服务名称'),
      required: true,
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.netAmountMeaningno').d('金额(不含税)'),
      required: true,
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.quantitys').d('数量'),
    },

    {
      name: 'taxRate',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.theTaxsRate').d('税率'),
    },

    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thetaxAmount').d('税额'),
      required: true,
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'netPrice',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thenetsPrice').d('不含税单价'),
    },

    {
      name: 'specificationsModel',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.spec').d('规格型号'),
    },

    {
      name: 'uom',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.theUom').d('单位'),
    },
    // {
    //   name: 'expenseItem',
    //   type: 'string',
    //   label: intl.get('ssta.costSheet.model.costSheet.expenseItem').d('费用项目(货运发票)'),
    //   lookupCode: 'SSTA.CHARGE_TREATMENT_METHOD',
    // },
    {
      name: 'plateNo',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.plateNo').d('车牌号（通行费）'),
    },
    {
      name: 'trafficType',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.trafficType').d('类型'),
    },
    {
      name: 'trafficDateStart',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.trafficDateStart').d('通行日期起（通行费）'),
    },
    {
      name: 'trafficDateEnd',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.trafficDateEnd').d('通行日期至（通行费）'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { taxInvoiceHeaderId } = data;
      return {
        url: `/ssta/v1/${organizationId}/tax-invoice-lines/${taxInvoiceHeaderId}`,
        method: 'GET',
        data: { customizeUnitCode: customizeCode },
      };
    },
    destroy: ({ data, dataSet }) => {
      const headInfo = dataSet.parent?.current?.toData() || {};
      return {
        url: `/ssta/v1/${organizationId}/tax-invoice-lines`,
        data: { ...headInfo, taxInvoiceLineList: data },
        method: 'DELETE',
        params: { customizeUnitCode: customizeCode },
      };
    },
  },
});

export const taxFormDetailDs = ({ taxInvoiceHeaderId, customizeUnitCode }) => ({
  autoQuery: true,
  fields: [
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invoiceCode').d('发票代码'),
    },
    {
      name: 'invoiceNumber',
      type: 'string',

      label: intl.get('ssta.costSheet.model.costSheet.invoiceNum').d('发票号码'),
    },
    {
      name: 'invoicingDate',
      type: 'date',
      label: intl.get('ssta.costSheet.model.costSheet.invoicingDate').d('开票日期'),
      disabled: true,
    },
    {
      name: 'invoiceSpeciesMeaning',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invoiceTypeMeaning').d('发票种类'),
    },
    {
      name: 'sumCheckTimes',
      type: 'string',

      label: intl.get('ssta.costSheet.model.costSheet.sumCheckTimes').d('累计查验次数'),
    },
    {
      name: 'checkTimes',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.checkTimes').d('当天查验次数'),
    },
    {
      name: 'checkCode',
      type: 'string',

      label: intl.get('ssta.costSheet.model.costSheet.checkCode').d('校验码'),
    },

    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supcompanysName').d('销方名称'),
    },

    {
      name: 'supUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supUnifiedSocialCode').d('销方税号'),
    },
    {
      name: 'supAccount',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supAccount').d('销方银行账号'),
    },
    {
      name: 'supAddrAndTel',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supAddrAndTel').d('销方地址电话'),
    },
    {
      name: 'machineNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.machineNum').d('机器编号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.buyscompanyName').d('购方名称'),
    },
    {
      name: 'purUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.pure').d('购方税号'),
    },
    {
      name: 'purAccount',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.purAccount').d('购方银行账号'),
    },
    {
      name: 'purAddrAndTel',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.purAddrAndTel').d('购方地址电话'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.netAmountMeaningno').d('金额(不含税)'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thetaxAmount').d('税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxIncludedAmountMeaning').d('金额(含税)'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    // {
    //   name: 'zeroTaxRateFlag',
    //   type: 'string',
    //   label: intl.get('ssta.costSheet.model.costSheet.zeroTaxRateFlag').d('零税率标志'),
    // },
    {
      name: 'tollFlag',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.tollFlag').d('通行费标志'),
    },
    {
      name: 'invalidFlagMeaning',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invalidFlag').d('作废标志'),
    },
    {
      name: 'invoiceSpecialMark',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invoiceSpecialMark').d('特殊票种标志'),
      lookupCode: 'SDIM.INVOICE_SPECIAL_MARK',
    },
    {
      name: 'drawer',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.drawer').d('开票人'),
    },

    {
      name: 'payee',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.payee').d('收款人'),
    },
    {
      name: 'reviewer',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.reviewer').d('复核人'),
    },
    // {
    //   name: 'blueInvoiceNum',
    //   type: 'string',
    //   label: intl.get('ssta.costSheet.model.costSheet.blueInvoiceNum').d('蓝票发票代码'),
    // },
    // {
    //   name: 'blueInvoiceCode',
    //   type: 'string',
    //   label: intl.get('ssta.costSheet.model.costSheet.blueInvoiceCode').d('蓝票发票号码'),
    // },
    {
      label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.invoiceUrl`).d('电子发票地址'),
      type: 'string',
      name: 'invoiceUrl',
    },
    {
      name: 'jpgUrl',
      type: 'string',
      label: intl.get('ssta.common.view.message.ofdFileUrl').d('OFD文件'),
    },
    {
      name: 'xmlSourceFileUrl',
      type: 'string',
      label: intl.get('ssta.common.model.invoice.xmlFile').d('XML文件'),
    },
    {
      name: 'ocrFileUrl',
      type: 'string',
      label: intl.get('ssta.supplyInvoicePool.model.purchaseInvoicePool.OcrFile').d('OCR文件'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('hzero.common.button.uploadView').d('附件查看'),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'finance-invoice',
    },
    {
      name: 'aiAttachmentUrl',
      type: 'string',
      label: intl.get(`ssta.common.model.common.aiRecognizeFile`).d('AI识别文件'),
    },
    {
      name: 'buyerContact',
      type: 'string',
      label: intl.get('ssta.common.model.common.buyerContact').d('购方联系人'),
    },
    {
      name: 'sellerContact',
      type: 'string',
      label: intl.get('ssta.common.model.common.sellerContact').d('销方联系人'),
    },
    {
      name: 'beneficiaryBank',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryBank').d('收款银行'),
    },
    {
      name: 'beneficiaryBankAddress',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryBankAddress').d('收款银行地址'),
    },
    {
      name: 'beneficiaryAccountNum',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryAccountNum').d('收款银行账号'),
    },
    {
      name: 'beneficiaryAccountName',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryAccountName').d('收款银行账户名称'),
    },
    {
      name: 'paymentTerms',
      type: 'string',
      label: intl.get('ssta.common.model.common.paymentTerms').d('支付条款'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.remark').d('备注'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `/ssta/v1/${organizationId}/tax-invoice-headers/detail/${taxInvoiceHeaderId}`,
        method: 'GET',
        data: { customizeUnitCode },
      };
    },
  },
});

export const taxLineDetailDS = ({ taxInvoiceHeaderId, customizeUnitCode }) => {
  return {
    pageSize: 20,
    selection: false,
    autoQuery: true,
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.linesNum`).d('行号'),
        type: 'string',
        name: 'taxInvoiceLineNum',
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
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.specificsationModel`).d('规格型号'),
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
        type: 'number',
        name: 'quantity',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.netPrice`).d('不含税单价'),
        type: 'number',
        name: 'netPrice',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.netAmount`).d('不含税金额'),
        type: 'number',
        name: 'netAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.taxIncludedAmount`).d('含税金额'),
        type: 'number',
        name: 'taxIncludedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.taxRate`).d('税率'),
        type: 'number',
        name: 'taxRate',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.taxAmount`).d('税额'),
        type: 'number',
        name: 'taxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'plateNo',
        type: 'string',
        label: intl.get('ssta.supplySettle.view.message.model.supplySettle.plateNo').d('车牌号（通行费）'),
      },
      {
        name: 'trafficType',
        type: 'string',
        label: intl.get('ssta.supplySettle.view.message.model.supplySettle.trafficType').d('类型'),
      },
      {
        name: 'trafficDateStart',
        type: 'string',
        label: intl.get('ssta.supplySettle.view.message.model.supplySettle.trafficDateStart').d('通行日期起（通行费）'),
      },
      {
        name: 'trafficDateEnd',
        type: 'string',
        label: intl.get('ssta.supplySettle.view.message.model.supplySettle.trafficDateEnd').d('通行日期至（通行费）'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${prefix}/tax-invoice-lines/${taxInvoiceHeaderId}`,
          method: 'GET',
          data: { customizeUnitCode },
        };
      },
    },
  };
};

export const taxLineRecordDS = (taxInvoiceHeaderId) => {
  return {
    selection: false,
    autoQuery: false,
    pageSize: 1000,
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.processUser`).d('操作人'),
        type: 'string',
        name: 'processUser',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.processDate`).d('操作日期'),
        type: 'dateTime',
        name: 'processDate',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.processStatusMeaning`).d('动作'),
        type: 'string',
        name: 'processStatusMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.processRemark`).d('说明'),
        type: 'string',
        name: 'processRemark',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${prefix}/tax-invoice-action/${taxInvoiceHeaderId}`,
          method: 'GET',
        };
      },
    },
  };
};

export const choseInvoicePoolDS = (queryParameter) => ({
  pageSize: 20,
  selection: 'multiple',
  dataToJSON: 'selected',
  primaryKey: 'invoiceHeaderId',
  queryParameter: {
    ...queryParameter,
    customizeUnitCode: 'SSTA.SUPPLY_SETTLE_DETAIL.INV_TAX_POOL,SSTA.SUPPLY_SETTLE_DETAIL.INV_TAX_POOL_GRID',
  },
  fields: [
    // 选择发票池
    {
      name: 'invoiceStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceStatusMeaning').d('发票状态'), // SSTA.CHARGE_STATUS
    },
    {
      name: 'checkStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkStatusMeaning').d('查验状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.operation').d('操作'),
    },

    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTypeMeaning').d('发票类型'),
    },
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.InvoiceCode').d('发票代码'),
    },
    {
      name: 'invoiceNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTel').d('发票号码'),
    },
    {
      name: 'invoicingDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoicingDate').d('开票日期'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.notHaveMoneyTax.').d('发票不含税金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxAmountInvoice').d('发票税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxInclssudedAmount').d('价税合计'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'checkCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkCode').d('校验码'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.remark').d('备注（票面）'),
    },
    {
      name: 'memo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.memo').d('备忘说明'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方名称'),
    },
    {
      name: 'supUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supUnifiedSocialCode').d('销方纳税人识别号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.companyName').d('购方名称'),
    },
    {
      name: 'purUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.purUnifiedSocialCode').d('购方纳税人识别号'),
    },
    {
      name: 'invoiceSource',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceSource').d('进池来源'),
    },
    {
      name: 'checkDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkDate').d('查验日期'),
    },
    {
      name: 'fileUrl',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.FileUrl').d('文件URL'),
    },
    {
      name: 'h',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceToPreview').d('发票预览'),
    },
    {
      name: 'g',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.propFilePreview').d('附件查看'),
    },
    {
      name: 'documentStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.documentStatusMeaning').d('单据状态'),
    },
    {
      name: 'associatedDocumentNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.associatedDocumentNum').d('关联单据'),
    },
    {
      name: 'cancelledFlag',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.cancelledsFlag').d('取消标识'),
    },
    {
      name: 'exceptionStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.exceptionStatusMeaning').d('异常标识'),
    },
    {
      name: 'sumCheckTimes',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.sumCheckTimes').d('累计查验次数'),
    },
    {
      name: 'checkTimes',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.todayCheckTimes').d('当天查验次数'),
    },
    // 关联表单的
    {
      name: 'invoiceTypeList',
      type: 'string',

      lookupCode: 'SSTA.INVOICE_POOL_TYPE',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxType').d('发票类型'),
    },

    {
      name: 'companyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH.CUSTOMER_WITH_TAX',
      lovPara: { tenantId: organizationId },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.buier').d('购方'),
    },
    {
      name: 'supplierCompanyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH_SUPPLIER_COMPANY_WITH_TAX',
      lovPara: { tenantId: organizationId },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方'),
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierCompanyNameLov.supplierTenantId',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${prefix}/invoice-header/supplier/select-from-pool`,
        method: 'GET',
      };
    },
    submit: () => {
      return {
        url: `${prefix}/invoice-header/tax-invoice-header/${queryParameter.settleHeaderId}`,
        method: 'POST',
      };
    },
  },
});

export const invPoolHeaderDS = ({ invoiceHeaderId, customizeUnitCode }) => ({
  autoQuery: true,
  autoCreate: true,
  fields: [
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invoiceCode').d('发票代码'),
    },
    {
      name: 'invoiceNum',
      type: 'string',

      label: intl.get('ssta.costSheet.model.costSheet.invoiceNum').d('发票号码'),
    },
    {
      name: 'invoicingDate',
      type: 'date',
      label: intl.get('ssta.costSheet.model.costSheet.invoicingDate').d('开票日期'),
      disabled: true,
    },
    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invoiceTypeMeaning').d('发票种类'),
    },
    {
      name: 'sumCheckTimes',
      type: 'string',

      label: intl.get('ssta.costSheet.model.costSheet.sumCheckTimes').d('累计查验次数'),
    },
    {
      name: 'checkTimes',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.checkTimes').d('当天查验次数'),
    },
    {
      name: 'checkCode',
      type: 'string',

      label: intl.get('ssta.costSheet.model.costSheet.checkCode').d('校验码'),
    },

    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supplierCompanyName').d('销方名称'),
    },

    {
      name: 'supUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supUnifiedSocialCode').d('销方税号'),
    },
    {
      name: 'supAccount',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supAccount').d('销方银行账号'),
    },
    {
      name: 'supAddrAndTel',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supAddrAndTel').d('销方地址电话'),
    },
    {
      name: 'machineNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.machineNum').d('机器编号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.purname').d('购方名称'),
    },
    {
      name: 'purUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.purUnifieCode').d('购方税号'),
    },
    {
      name: 'purAccount',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.purAccount').d('购方银行账号'),
    },
    {
      name: 'purAddrAndTel',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.purAddrAndTel').d('购方地址电话'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.netamount').d('发票金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxamount').d('发票税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxIncludAmount').d('价税合计'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'zeroTaxRateFlag',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.zeroTaxRateFlag').d('零税率标志'),
    },
    {
      name: 'tollFlag',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.tollFlag').d('通行费标志'),
    },
    {
      name: 'invalidFlagMeaning',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invalidFlag').d('作废标志'),
    },
    {
      name: 'invoiceSpecialMark',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invoiceSpecialMark').d('特殊票种标志'),
      lookupCode: 'SSTA.INVOICE_SPECIAL_MARK',
    },
    {
      name: 'drawer',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.drawer').d('开票人'),
    },
    {
      name: 'payee',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.payee').d('收款人'),
    },
    {
      name: 'reviewer',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.reviewer').d('复核人'),
    },
    {
      name: 'blueInvoiceNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.blueInvoiceNum').d('蓝票发票代码'),
    },
    {
      name: 'blueInvoiceCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.blueInvoiceCode').d('蓝票发票号码'),
    },
    {
      name: 'fileUrl',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.fileURL').d('文件URL'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.remark').d('备注'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${prefix}/invoice-header/detail/${invoiceHeaderId}`,
        method: 'GET',
        data: { customizeUnitCode },
      };
    },
  },
});

export const invPoolLineDS = ({ invoiceHeaderId, customizeUnitCode }) => ({
  pageSize: 20,
  autoQuery: true,
  selection: false,
  primaryKey: 'lineId',
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.linseNum').d('行号'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.chargsseCode').d('货物或应税劳务，服务名称'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.Amounts').d('金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.quantitys').d('数量'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxsRatse').d('税率'),
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thetaxAmount').d('税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxIncludedPrice',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxIncssludedAmount').d('含税单价'),
    },
    {
      name: 'taxIncludedAmount;',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thetaxIncludesdAmount').d('含税金额'),
    },
    {
      name: 'netPrice',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thenetPrice').d('不含税单价'),
    },
    {
      name: 'spec',
      type: 'object',
      label: intl.get('ssta.costSheet.model.costSheet.spec').d('规格型号'),
    },
    {
      name: 'uom',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.theUom').d('单位'),
    },
    // {
    //   name: 'expenseItem',
    //   type: 'string',
    //   label: intl.get('ssta.costSheet.model.costSheet.expenseItem').d('费用项目(货运发票)'),
    //   lookupCode: 'SSTA.CHARGE_TREATMENT_METHOD',
    // },
    {
      name: 'plateNo',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.plateNo').d('车牌号（通行费）'),
    },
    {
      name: 'trafficType',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.trafficType').d('类型'),
    },
    {
      name: 'trafficDateStart',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.trafficDateStart').d('通行日期起（通行费）'),
    },
    {
      name: 'trafficDateEnd',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.trafficDateEnd').d('通行日期至（通行费）'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${prefix}/invoice-line/${invoiceHeaderId}`,
        method: 'GET',
        data: { customizeUnitCode },
      };
    },
  },
});

export const settleHeaderDS = (settleHeaderId = '', documentType, otherProps) => {
  const { remoteProps } = otherProps || {};
  return {
    // autoCreate: true,
    selection: false,
    dataToJSON: 'all',
    forceValidate: true,
    // primaryKey: 'settleHeaderId',   暂时不要添加primaryKey，因为会导致submit方法返回内容回写ds
    queryParameter: {
      settleHeaderId,
      customizeUnitCode: headUnitCodes[documentType].join(),
    },
    autoQuery: false,
    autoQueryAfterSubmit: false,
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
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.documentTypeMeaning`).d('结算单类型'),
        type: 'string',
        name: 'settleTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.documentTypeMeaning`).d('结算单类型'),
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
      {
        name: 'purInvoiceHeader',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.purInvoiceHeader').d('采购方发票抬头'),
      },
      {
        name: 'purTaxRegistrationNumber',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.purTaxRegistrationNumber').d('采购方税务登记号'),
      },
      {
        name: 'enableChargeDebitFlag',
        type: 'string',
        label: intl.get(`ssta.supplySettle.model.supplySettle.enableChargeDebitFlag`).d('费用单账扣'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'documentCreationType',
        type: 'string',
        lookupCode: 'SSTA.DOCUMENT_CREATIONT_YPE',
        label: intl.get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceBillType').d('单据创建类型'),
      },
      {
        name: 'sourceSystemDocumentNum',
        type: 'string',
        label: intl.get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceBillNum').d('来源系统编号'),
      },
      {
        name: 'thirdEcInvoiceNum',
        type: 'string',
        label: intl
          .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.thirdEcInvoiceNum')
          .d('第三方电商开票申请号'),
      },
      /**
       * 交易方信息
       */
      {
        name: 'companyNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleCustomCompanyNum').d('结算客户公司编号'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleCustomCompanyName').d('结算客户公司名称'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.currencyCode').d('币种'),
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleSupplierCompanyNum').d('结算供应商公司编码'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleSupplierCompanyName').d('结算供应商公司名称'),
      },
      {
        name: 'sourceSupplierCompanyName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.sourceSupplierName').d('数据源平台供应商名称'),
      },
      {
        name: 'sourceSupplierCompanyNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.sourceSupplierCompanyNum').d('数据源平台供应商编码'),
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
      {
        name: 'paymentStatus',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.paymentStatus').d('付款申请状态'),
        lookupCode: 'SSTA.INVOICE_PAYMENT_STATUS',
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
        label: intl.get('ssta.supplySettle.model.supplySettle.settleNetAmount').d('结算不含税总金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'settleTaxAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleTaxAmount').d('结算总税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'settleTaxIncludedAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.settleTaxIncludedAmount').d('结算含税总金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'invoicedNetAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoicedNetAmount').d('已开票不含税总金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'invoicedTaxAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoicedTaxAmount').d('已开票税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'invoicedTaxIncludedAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoicedTaxIncludedAmounts').d('已开票含税金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'paidAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.paidCollectionAmount').d('已收款金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'remainingPaymentAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.remainingCollectionAmount').d('剩余收款金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      /**
       * 开票信息 -- 系统
       */
      {
        name: 'netAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.netInvoiceApplyAmount').d('发票申请金额（不含税）'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceApplyTaxAmount').d('发票申请税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.taxIncludedAmount').d('开票含税总金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },

      /**
       * 发票匹配信息
       */
      {
        name: 'invoiceNetAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceNetAmount').d('发票不含税总金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'invoiceTaxAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceTaxAmount').d('发票总税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'invoiceTaxIncludedAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceTaxIncludedAmount').d('发票含税总金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'invoiceDifferenceAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceDifferenceAmount2').d('发票尾差值'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'invoiceSpliteRule',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceSpliteRule').d('发票自动拆分规则'),
        lookupCode: 'SSTA.AUTO_SPLIT_RULE_INV',
      },

      /**
       * 预收款核销信息
       */
      {
        name: 'applyAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.thisApplyAmountCollection').d('本次预收款核销金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'prepaymentSpliteRule',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.preCollectionSpliteRule').d('预收款拆分规则'),
        lookupCode: 'SSTA.AUTO_SPLIT_RULE',
      },

      /**
       * 收款信息
       */
      {
        name: 'paymentAmount',
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.thisCollectionAmount').d('本次实际收款金额'),
        computedProps: {
          required: ({ record }) => {
            const optPermissionObj = Object.fromEntries(
              record
                .get('optPermissionList')
                .map(({ permissionType, operationType = '' }) =>
                  operationType.split(',').map((i) => [i, permissionType])
                )
                .flat()
            );
            const { HEAD_PAYMENT: headPayment } = optPermissionObj;
            return record.get('settleType') !== 'INVOICE' && headPayment === 'EDIT';
          },
          formatterOptions: amountFormatterOptions,
        },
      },
      {
        name: 'paymentSpliteRule',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.collectionSpliteRule').d('收款自动拆分规则'),
        lookupCode: 'SSTA.AUTO_SPLIT_RULE',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.bankId`).d('收款银行'),
        type: 'object',
        name: 'bankIdLov',
        ignore: 'always',
        noCache: true,
        textField: 'bankName',
        dynamicProps: {
          lovCode: ({ dataSet }) =>
            dataSet.getState('supBankFlag') ? 'SSTA.COMPANY_BANK_ACCOUNT_SUP' : 'SSTA.COMPANY_BANK_ACCOUNT',
          lovPara: ({ dataSet }) => ({
            companyId: dataSet.current && dataSet.current.get('companyId'),
            supplierCompanyId: dataSet.current && dataSet.current.get('supplierCompanyId'),
            tenantId: organizationId,
            supplierId: dataSet.current && dataSet.current.get('supplierId'),
          }),
          required: ({ record }) => record.get('paymentAmount') > 0,
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
          .get(`ssta.supplySettle.view.message.model.supplySettle.collectionBankAccountName`)
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
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.collectionMethod`).d('收款方式'),
        type: 'object',
        name: 'paymentMethodLov',
        lovCode: 'SMDM.PAYMENT_TYPE',
        // ignore: 'always',
        noCache: true,
        dynamicProps: {
          required: ({ record }) => record.get('paymentAmount') > 0,
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
        // ignore: 'always',
        lovCode: 'SMDM.PAYMENT.TERM',
        noCache: true,
        dynamicProps: {
          required: ({ record }) => record.get('paymentAmount') > 0,
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
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.collectionDiscountAmount`).d('收款折扣金额'),
        type: 'number',
        name: 'paymentDiscountAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planNum',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanNum`).d('付款计划编号'),
      },
      {
        name: 'versionNumber',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanVersionNum`).d('付款计划版本号'),
      },
      {
        name: 'planStageNum',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.stageNum`).d('阶段编码'),
      },
      {
        name: 'planStageDesc',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.stageDesc`).d('阶段描述'),
      },
      {
        name: 'planStageAmount',
        type: 'number',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.planStageAmount`).d('计划阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planStageBalance',
        type: 'number',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.balanceStageAmount`).d('剩余阶段金额'),
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
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.expectCollectionDate`).d('期望收款日期'),
        type: 'date',
        name: 'expectPaymentDate',
        dynamicProps: {
          required: ({ record }) => record.get('paymentAmount') > 0,
        },
      },

      /**
       * 主策略信息
       */
      {
        name: 'settleConfigNum',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.mainSettleStrategyNum').d('主结算策略编码'),
      },
      {
        name: 'settleConfigName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.mainSettleStrategyName').d('主结算策略名称'),
      },
      {
        name: 'configVersionNumber',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.configVersionNumber').d('主结算策略版本号'),
      },

      {
        name: 'confirmCollaborativeModeMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.confirmCollaborativeModeMeaning').d('协同模式-确认'),
      },
      {
        name: 'invoiceMatchMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceMatch').d('发票匹配规则'),
      },
      {
        name: 'confirmApproveMethodMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.confirmApproveMethodMeaning').d('审批方式-确认'),
      },
      {
        name: 'cancelCollaborativeModeMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.cancelCollaborativeModeMeaning').d('协同模式-取消'),
      },
      {
        name: 'cancelApproveMethodMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.cancelApproveMethodMeaning').d('审批方式-取消'),
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
        label: intl.get('ssta.supplySettle.model.supplySettle.defaultCollectionDimensionMeaning').d('收款维度【默认】'),
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
        label: intl.get('ssta.supplySettle.model.supplySettle.lineLimitQuantity').d('结算单行数限制'),
      },
      {
        name: 'invoicePayEnableFlag',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceCollectionFlag').d('启用开票并收款'),
      },
      {
        name: 'prepaymentDimensionMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.prepaymentDimensions').d('预收款核销维度'),
      },
      {
        name: 'prepaymentCheckLevel',
        type: 'string',
        lookupCode: 'SSTA.PREPAYMENT_CHECK_LEVEL',
        label: intl.get('ssta.supplySettle.model.supplySettle.prepaymentCheckLevels').d('预收款核销校验等级'),
      },
      {
        name: 'prepaymentCheckPoint',
        type: 'string',
        lookupCode: 'SSTA.PREPAYMENT_CHECK_PIONT',
        multiple: true,
        label: intl.get('ssta.supplySettle.model.supplySettle.prepaymentCheckPoints').d('预收款核销校验节点'),
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        transformResponse: (value) => (value && !isArray(value) ? value.split(',') : []),
      },
      {
        name: 'autoApplyPrepaymentRuleCode',
        type: 'string',
        label: intl.get(`ssta.supplySettle.model.supplySettle.preColAutoWriteOffRule`).d('预收款自动核销规则'),
        lookupCode: 'SSTA.AUTO_APPLY_SPLIT_RULE',
      },
      {
        name: 'autoApplyPayAmountRuleCode',
        type: 'string',
        label: intl
          .get(`ssta.supplySettle.model.supplySettle.afterPreColAutoWriteOffPayAmount`)
          .d('预收款自动核销后付款金额'),
        lookupCode: 'SSTA.AUTO_APPLY_PAY_AMOUNT_RULES',
      },
      {
        name: 'initSettleConfigNum',
        type: 'string',

        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.initSettleConfigNum').d('初始策略编码'),
      },
      {
        name: 'initConfigVersionNumber',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.initConfigVersionNumber').d('初始策略版本号'),
      },
      {
        name: 'invoiceUxFlag',
        type: 'number',
        lookupCode: 'HPFM.FLAG',
        label: intl.get('ssta.common.model.common.invoiceUxTitleShow').d('发票UX标题显示'),
      },
      {
        name: 'paymentUxFlag',
        type: 'number',
        lookupCode: 'HPFM.FLAG',
        label: intl.get('ssta.common.model.common.paymentUxTitleShow').d('付款UX标题显示'),
      },
      {
        name: 'invoicePaymentUxFlag',
        type: 'number',
        lookupCode: 'HPFM.FLAG',
        label: intl.get('ssta.common.model.common.paymentUxTitleShow').d('付款UX标题显示'),
      },
      {
        name: 'invoiceToleranceRangeLimit',
        type: 'number',
        range: ['invoiceToleranceRangeLower', 'invoiceToleranceRangeUpper'],
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.taxIncludedAmountTol`).d('含税金额允差范围'),
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
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.autoTaxAmountTol`).d('自动调整税额允差范围'),
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
        name: 'paymentControlRuleSource',
        type: 'string',
        lookupCode: 'SSTA.PAYMENT_CONTROL_RULE_SOURCE',
        label: intl.get('ssta.common.model.common.paymentControlRuleSource').d('付款管控规则来源'),
      },
      {
        name: 'expectPaymentDateInitRule',
        type: 'string',
        lookupCode: 'SSTA.EXPECT_PAYMENT_DATE_INIT_RULE',
        label: intl.get('ssta.common.model.common.expectPaymentDateInitRule').d('期望付款日期默认规则'),
      },

      /**
       * 直连开票信息
       */
      {
        name: 'directInvoicingTypeMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.directInvoicingTypeMeaning').d('直连开票类型'),
      },
      {
        name: 'invoiceType',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceTypeMeaning').d('开票类型'),
        lookupCode: 'SSTA.EC_INVOICE_TYPE',
        dynamicProps: {
          disabled: ({ record }) => record.get('directInvoicingType') !== 'EC',
        },
      },
      {
        name: 'invoiceMethodMeaning',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceMethod').d('开票方式'),
        disabled: true,
      },
      {
        name: 'regionLov',
        label: intl.get('ssta.supplySettle.model.supplySettle.regionName').d('收单地区'),
        type: 'object',
        ignore: 'always',
        textField: 'regionName',
        valueField: 'regionId',
        lovCode: 'SMAL.INVOICE_ADDRESS_LIST',
        noCache: true,
        dynamicProps: {
          lovPara: ({ record }) => ({
            tenantId: organizationId,
            companyId: record.get('companyId'),
          }),
        },
        transformResponse: (_, record) => {
          const { regionName = '', regionId, contactName, address, mobile } = record;
          return {
            regionName,
            regionId,
            contactName,
            address,
            mobile,
          };
        },
      },
      {
        name: 'regionId',
        type: 'string',
        bind: 'regionLov.regionId',
      },
      {
        name: 'contactName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.contactName').d('联系人'),
        bind: 'regionLov.contactName',
      },
      {
        name: 'regionName',
        type: 'string',
      },
      {
        name: 'address',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.address').d('详细地址'),
        bind: 'regionLov.fullAddress',
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
        disabled: true,
      },
      {
        name: 'invoiceContentDetail',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceContentDetail').d('开票内容详情'),
        disabled: true,
      },
      {
        name: 'invoiceFailMsg',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.invoiceFailMsg').d('直连开票失败原因'),
        disabled: true,
      },

      {
        name: 'sdimPreviewFlag',
        type: 'string',
        label: intl.get(`ssta.common.model.common.sdimPreviewFlag`).d('二次确认标志'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'sdimInvoiceType',
        type: 'string',
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.billType`).d('发票种类'),
        lookupCode: 'SDIM.INVOICE_TYPE',
        dynamicProps: {
          required: ({ record }) =>
            record.get('documentType') === 'INVOICE' &&
            record.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING' &&
            record.get('directInvoicingType') === 'INVOICE_PLATFORM',
        },
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
        name: 'sdimPurCompanyLov',
        type: 'object',
        lovCode: 'SSTA.COMPANY_INVOICE.FOR_PUR_COMPANY_NAME',
        textField: 'sdimPurCompanyName',
        label: intl.get('ssta.costSheet.model.costSheet.purname').d('购方名称'),
        noCache: true,
        ignore: 'always',
        disabled: true,
        lovPara: { tenantId: organizationId },
        // required: true,
      },
      {
        name: 'sdimPurCompanyName',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.purname').d('购方名称'),
        bind: 'sdimPurCompanyLov.sdimPurCompanyName',
      },
      {
        name: 'sdimPurAddress',
        type: 'string',
        bind: 'sdimPurCompanyLov.sdimPurAddress',
        label: intl.get('ssta.common.model.common.purAddress').d('购方地址'),
      },
      {
        name: 'sdimPurTelephone',
        type: 'string',
        bind: 'sdimPurCompanyLov.sdimPurTelephone',
        label: intl.get('ssta.common.model.common.purPhone').d('购方电话'),
      },
      {
        name: 'sdimPurAddrAndPhone',
        type: 'string',
        label: intl.get('ssta.common.model.common.sdimPurAddrAndPhone').d('购方地址、电话'),
        disabled: true,
      },
      {
        name: 'sdimPurCompanyId',
        type: 'string',
        bind: 'sdimPurCompanyLov.sdimPurCompanyId',
      },
      {
        name: 'sdimPurBankName',
        type: 'string',
        bind: 'sdimPurCompanyLov.sdimPurBankName',
        label: intl.get('ssta.common.model.common.purAccountBank').d('购方开户行'),
      },
      {
        name: 'sdimPurBankAccount',
        type: 'string',
        bind: 'sdimPurCompanyLov.sdimPurBankAccount',
        label: intl.get('ssta.common.model.common.purBankAccountNum').d('购方银行账号'),
      },
      {
        name: 'sdimPurBankAccountAndName',
        type: 'string',
        label: intl.get('ssta.common.model.common.sdimPurBankAccountAndName').d('购方开户行及账号'),
        disabled: true,
      },
      {
        name: 'purchaserTaxNumber',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.taxRegistrationNumber').d('购方税号'),
        bind: 'sdimPurCompanyLov.purchaserTaxNumber',
        disabled: true,
      },
      {
        name: 'saleCompanyLov',
        label: intl.get('ssta.costSheet.model.costSheet.supcompanysName').d('销方名称'),
        type: 'object',
        lovCode: 'SSTA.USER_AUTH_SUPPLIER_WITH_TAX',
        textField: 'sdimSupInvoiceHeader',
        noCache: true,
        // required: true,
        lovPara: {
          tenantId: getCurrentOrganizationId(),
        },
        ignore: 'always',
        disabled: true,
      },
      { name: 'sdimSupCompanyId', bind: 'saleCompanyLov.supplierCompanyId' },
      {
        name: 'supplierTaxRegistrationNumber',
        type: 'string',
        bind: 'saleCompanyLov.supplierTaxNumber',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.supplierTaxRegistrationNumber').d('销方税号'),
        disabled: true,
      },
      {
        name: 'supplierTaxNumber',
        bind: 'saleCompanyLov.supplierTaxNumber',
      },
      {
        name: 'sdimSupCompanyName',
        type: 'string',
        bind: 'saleCompanyLov.supplierCompanyName',
        label: intl.get('ssta.costSheet.model.costSheet.supcompanysName').d('销方名称'),
      },
      {
        name: 'sdimSupInvoiceHeader',
        bind: 'saleCompanyLov.sdimSupInvoiceHeader',
      },
      {
        name: 'sdimSupAddress',
        type: 'string',
        label: intl.get('ssta.common.model.common.supAddress').d('销方地址'),
        bind: 'saleCompanyLov.sdimSupAddress',
      },
      {
        name: 'sdimSupTelephone',
        type: 'string',
        bind: 'saleCompanyLov.sdimSupTelephone',
        label: intl.get('ssta.common.model.common.supPhone').d('销方电话'),
      },
      {
        name: 'sdimSupAddrAndPhone',
        type: 'string',
        label: intl.get('ssta.common.model.common.sdimSupAddrAndPhone').d('销方地址、电话'),
        disabled: true,
      },
      {
        name: 'sdimSupBankName',
        type: 'string',
        bind: 'saleCompanyLov.sdimSupBankName',
        label: intl.get('ssta.common.model.common.supAccountBank').d('销方开户行'),
      },
      {
        name: 'sdimSupBankAccount',
        type: 'string',
        bind: 'saleCompanyLov.sdimSupBankAccount',
        label: intl.get('ssta.common.model.common.supBankAccountNum').d('销方银行账号'),
      },
      {
        name: 'sdimSupBankNameAndAccount',
        type: 'string',
        label: intl.get('ssta.common.model.common.sdimSupBankNameAndAccount').d('销方开户行及账号'),
        disabled: true,
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
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.purCompanyType`).d('购方企业类型'),
        lookupCode: 'SDIM.COMPANY_TYPE',
      },
      {
        name: 'sdimSupCompanyType',
        type: 'string',
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.supCompanyType`).d('销方企业类型'),
        lookupCode: 'SDIM.COMPANY_TYPE',
        dynamicProps: {
          disabled: ({ record }) => record.get('directInvoicingType') !== 'INVOICE_PLATFORM',
        },
      },
      {
        name: 'sdimReceiver',
        type: 'string',
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.receiverPaper`).d('纸票收件人'),
      },
      {
        name: 'sdimRecipientPhone',
        type: 'string',
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.receiverPaperPhone`).d('纸票收件人电话'),
      },
      {
        name: 'sdimReceiverMail',
        type: 'string',
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.sdimReceiverMail`).d('纸票收件人邮箱'),
      },
      {
        name: 'sdimRecipientAddress',
        type: 'string',
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.receiverPaperAddress`).d('纸票收件人地址'),
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
        label: intl.get('ssta.supplySettle.model.supplySettle.sourceSettleNum').d('结算事务来源编号'),
      },
      {
        name: 'purOrganizationName',
        type: 'string',
        label: intl.get('ssta.supplySettlePool.model.supplySettlePool.purchOrganizationName').d('采购组织'),
      },
      {
        name: 'supplierSiteCode',
        type: 'string',
        label: intl.get('ssta.supplySettlePool.model.supplySettlePool.supplierSiteCode4').d('供应商地点'),
      },
      {
        name: 'logisticsCompanyLov',
        type: 'object',
        label: intl.get('ssta.common.model.common.logisticsCompany').d('物流公司'),
        lovCode: 'SINV.ASN_SHIPPER_NAME',
        lovPara: { tenantId: organizationId },
        noCache: true,
        // ignore: 'always',
        computedProps: {
          required: ({ dataSet }) => dataSet.getState('logisticsFilledFlag'),
        },
      },
      {
        name: 'logisticsCompanyCode',
        bind: 'logisticsCompanyLov.value',
      },
      {
        name: 'logisticsCompanyCodeMeaning',
        bind: 'logisticsCompanyLov.meaning',
      },
      {
        name: 'logisticsNum',
        type: 'string',
        label: intl.get('ssta.common.model.common.logisticsNum').d('物流单号'),
        computedProps: {
          required: ({ dataSet }) => dataSet.getState('logisticsFilledFlag'),
        },
      },
      {
        name: 'logisticsPhoneNum',
        type: 'string',
        label: intl.get('ssta.common.model.common.logisticsPhoneNum').d('收货预留手机号'),
        pattern: PHONE,
        computedProps: {
          required: ({ dataSet, record }) =>
            dataSet.getState('logisticsFilledFlag') && record.get('logisticsCompanyCode') === 'SF',
        },
      },

      /**
       * 附件
       */
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl.get('ssta.supplySettlePool.model.supplySettlePool.enclosure').d('附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const batchFlag = dataSet.getQueryParameter('settleHeaderIds');
        const urlSuffix = batchFlag ? '/batch-settle-header' : '';
        return {
          url: `${prefix}/settle-headers${urlSuffix}`,
          method: 'GET',
        };
      },
      submit: ({ dataSet, data, params }) => {
        const submitType = dataSet.getState('submitType');
        const stepFlag = dataSet.getState('stepFlag');
        const validatedResultDTO = dataSet.getState('validatedResultDTO');
        const currentData = remoteProps
          ? remoteProps.process(
              'SSTA_SUPPLYSETTLE_DETAIL_PROCESS_SETTLEHEADERDS_SUBMIT_DATA',
              data[dataSet.currentIndex]
            )
          : data[dataSet.currentIndex];
        currentData.stepFlag = stepFlag;
        const defaultConfig = {
          url: `${prefix}/settle-headers/supplier/${submitType}`,
          method: 'PUT',
          data: currentData,
          params: {
            ...params,
            customizeUnitCode: headUnitCodes[documentType].concat(lineUnitCodes[documentType]).join(),
          },
        };
        const batchConifg = { ...defaultConfig, data: [currentData] };
        switch (submitType) {
          case 'submit':
            Object.assign(defaultConfig.data, { validatedResultDTO });
            return defaultConfig;
          case 'update':
            return defaultConfig;
          case 'confirm':
            delete batchConifg.data[0].settleLineList;
            return batchConifg;
          case 'return':
            delete batchConifg.data[0].settleLineList;
            return batchConifg;
          case 'cancel':
            delete batchConifg.data[0].settleLineList;
            return batchConifg;
          case 'delete':
            batchConifg.url = `${prefix}/settle-headers/supplier/batch-delete`;
            delete batchConifg.data[0].settleLineList;
            return batchConifg;
          case 'revoke':
            defaultConfig.url = `${prefix}/settle-headers/supplier/recall`;
            return defaultConfig;
          case 'deleteValidate':
            batchConifg.url = `${prefix}/settle-headers/supplier/validate/delete`;
            delete batchConifg.data[0].settleLineList;
            return batchConifg;
          case 'cancelValidate':
            batchConifg.url = `${prefix}/settle-headers/supplier/validate/cancel`;
            delete batchConifg.data[0].settleLineList;
            return batchConifg;
          case 'submitValidate':
            defaultConfig.url = `${prefix}/settle-headers/supplier/validate/submit`;
            return defaultConfig;
          case 'submitFirstValidate':
            defaultConfig.url = `${prefix}/settle-lines/validate`;
            return defaultConfig;
          case 'submitWarnCancelValidate':
            defaultConfig.url = `${prefix}/settle-headers/validate/submit-cancel`;
            return defaultConfig;
          case 'confirmValidate':
            defaultConfig.url = `${prefix}/settle-headers/supplier/validate/confirm`;
            return defaultConfig;
          case 'payAutoAssign':
            defaultConfig.url = `${prefix}/settle-headers/payment-match`;
            return defaultConfig;
          case 'multiDemenAssign':
            defaultConfig.url = `${prefix}/settle-headers/muti-dimension-payment-match`;
            return defaultConfig;
          case 'invAutoMatch':
            defaultConfig.url = `${prefix}/settle-headers/invoice-match`;
            return defaultConfig;
          case 'toleranceAdjust':
            defaultConfig.url = `${prefix}/settle-headers/amount-adjust`;
            return defaultConfig;
          case 'autoCheckTaxInvoice':
            return {
              url: `${prefix}/tax-invoice-headers/check-settle-header/${settleHeaderId}/AUTO`,
              method: 'POST',
              data: null,
              params: null,
            };
          case 'validateTaxInvoice':
            return {
              url: `${prefix}/tax-invoice-headers/validate/${settleHeaderId}`,
              method: 'GET',
              data: null,
              params: null,
            };
          case 'updateLogisticsInfo':
            defaultConfig.url = `${prefix}/settle-headers/update-logistics-info`;
            return defaultConfig;
          case 'syncLogisticsInfo':
            defaultConfig.url = `${prefix}/settle-headers/sync-logistics-info`;
            return defaultConfig;
          case 'directInvoice':
            defaultConfig.url = `${prefix}/settle-headers/supplier/direct/invoice`;
            return defaultConfig;
          case 'taxInvApplyPreview':
            defaultConfig.url = `${prefix}/settle-headers/supplier/direct/invoice`;
            return defaultConfig;
          case 'stageLineValidate':
            defaultConfig.url = `${prefix}/payment-stage-headers/payment/update-validate`;
            delete batchConifg.data[0].settleLineList;
            return defaultConfig;
          case 'stageLineReMatch':
            defaultConfig.url = `${prefix}/payment-stage-headers/payment/supplier/re-match`;
            return defaultConfig;
          case 'deleteSettle':
            defaultConfig.url = `${prefix}/settle-headers/supplier/physics-delete`;
            defaultConfig.method = 'POST';
            return defaultConfig;
          default:
        }
      },
    },
    // 避免全部notication.success
    feedback: {
      submitSuccess: () => {},
    },
  };
};

export const settleLineDS = (documentType, remoteProps) => {
  const defaultSettleLineDS = {
    autoQuery: false,
    pageSize: 20,
    forceValidate: true,
    cacheSelection: true,
    selection: 'multiple',
    primaryKey: 'settleLineId',
    autoQueryAfterSubmit: false,
    queryParameter: {
      customizeUnitCode: lineUnitCodes[documentType].join(),
    },
    record: {
      dynamicProps: {
        selectable: (record) => {
          const { parent: settleHeaderDs } = record?.dataSet || {};
          const { settleStatus, directInvoicingType, invoiceMatchRuleCode } =
            settleHeaderDs?.current?.get(['settleStatus', 'directInvoicingType', 'invoiceMatchRuleCode']) || {};
          // 状态=直连开票异常，且 ecInvoicedFlag为1 不让勾选
          const invoiceExceptionFlag =
            settleStatus === 'INVOICE_EXCEPTION' &&
            directInvoicingType === 'EC' &&
            invoiceMatchRuleCode === 'DIRECT_INVOICING';
          return !(invoiceExceptionFlag && record?.get('ecInvoicedFlag'));
        },
      },
    },
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.lineNum`).d('结算单行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.settleTransactionNum`).d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.sourceSettleNumAndLineNum`).d('结算事务来源编号｜行号'),
        type: 'string',
        name: 'sourceSettleNumAndLineNum',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.itemCode`).d('结算商品编码'),
        type: 'string',
        name: 'itemCode',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.itemName`).d('结算商品名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.sourceSettleHeaderNum`).d('发票申请结算单'),
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
          precision: ({ record }) => record.get('uomPrecision'),
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
        type: 'number',
        label: intl.get('ssta.supplySettle.model.supplySettle.unitPriceBatch').d('每'),
        dynamicProps: {
          required: editAbleRender,
        },
        validator: validatorRender,
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.netAmounts`).d('本次开票不含税金额'),
        type: 'number',
        name: 'netAmount',
        dynamicProps: {
          required: editAbleRender,
          formatterOptions: amountFormatterOptions,
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
            companyId: dataSet.parent.current?.companyId,
            supplierCompanyId: dataSet.parent.current?.supplierCompanyId,
            tenantId: getCurrentOrganizationId(),
            source: 'SETTLEINVIOCE',
            itemId: record.get('itemId'),
          }),
        },
        ignore: 'always',
        noCache: true,
        lovCode: 'SSTA.TAX_RATE_SERVICE',
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
        name: 'taxRateType',
        type: 'string',
        bind: 'taxRateLov.taxRateType',
      },
      {
        label: intl.get(`ssta.supplySettle.common.taxAmount`).d('税额'),
        type: 'number',
        name: 'taxAmount',
        dynamicProps: {
          required: editAbleRender,
          formatterOptions: amountFormatterOptions,
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
          formatterOptions: amountFormatterOptions,
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
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.common.paymentCollectionAmount`).d('本次收款金额'),
        type: 'number',
        name: 'paymentAmount',
        dynamicProps: {
          required: editAbleRender,
          formatterOptions: amountFormatterOptions,
        },
        validator: validatorRender,
      },
      {
        label: intl.get(`ssta.supplySettle.common.applyAmountCollection`).d('本次预收款核销金额'),
        type: 'number',
        name: 'applyAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.common.invoicedTaxIncludedAmount`).d('已开票含税金额'),
        type: 'number',
        name: 'invoicedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.common.paidAmountCollection`).d('已收款金额'),
        type: 'number',
        name: 'paidAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.common.remainingCollectionAmount`).d('剩余收款金额'),
        type: 'number',
        name: 'remainingPaymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'adjustNetAmount',
        type: 'number',
        label: intl.get(`ssta.supplySettle.model.supplySettle.adjustNetAmount`).d('尾差不含税调整金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'adjustTaxAmount',
        type: 'number',
        label: intl.get(`ssta.supplySettle.model.supplySettle.adjustTaxAmount`).d('尾差税额调整金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.invOrganizationName`).d('库存组织'),
        type: 'string',
        name: 'invOrganizationName',
      },
      {
        name: 'thirdSkuCode',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.thirdSkuCode').d('第三方商品编码'),
      },
      {
        name: 'thirdSkuName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.thirdSkuName').d('第三方商品名称'),
      },
      {
        name: 'poCreateName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.poCreateName').d('订单创建人'),
      },
      {
        name: 'orderTypeName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.orderTyoeName').d('订单类型名称'),
      },
      {
        name: 'unitName',
        type: 'string',
        label: intl.get('ssta.supplySettle.model.supplySettle.unitName').d('部门名称'),
      },
      {
        name: 'poNum',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.poNum`).d('采购订单编号'),
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentApplyNum`).d('付款申请编号'),
      },
      {
        name: 'planNum',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanNum`).d('付款计划编号'),
      },
      {
        name: 'versionNumber',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanVersionNum`).d('付款计划版本号'),
      },
      {
        name: 'planStageNum',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.stageNum`).d('阶段编码'),
      },
      {
        name: 'planStageDesc',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.stageDesc`).d('阶段描述'),
      },
      {
        name: 'planStageAmount',
        type: 'number',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.planStageAmount`).d('计划阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planStageBalance',
        type: 'number',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.balanceStageAmount`).d('剩余阶段金额'),
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
        name: 'lineRemark',
        type: 'string',
        label: intl.get('ssta.common.model.common.lineRemark').d('行备注'),
      },
      {
        name: 'ecInvoicedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'orderOverAmountValidateRuleEnableFlagMeaning',
        type: 'string',
        label: intl
          .get(`ssta.supplySettle.view.supplySettle.orderOverAmountValidateRuleEnableFlagMeaning`)
          .d('是否启用超额校验(订单)'),
      },
      {
        name: 'orderOverAmountValidateRuleCheckLevelMeaning',
        type: 'string',
        label: intl
          .get(`ssta.supplySettle.view.supplySettle.orderOverAmountValidateRuleCheckLevelMeaning`)
          .d('校验等级(订单)'),
      },
      {
        name: 'orderOverAmountValidateRuleTolControlTypeMeaning',
        type: 'string',
        label: intl
          .get(`ssta.supplySettle.view.supplySettle.orderOverAmountValidateRuleTolControlTypeMeaning`)
          .d('超额校验允差控制类型(订单)'),
      },
      {
        name: 'orderOverAmountValidateRuleTolTolRange',
        type: 'number',
        label: intl
          .get(`ssta.supplySettle.view.supplySettle.orderOverAmountValidateRuleTolTolRange`)
          .d('超额校验允差(订单)'),
      },
      {
        name: 'contractOverAmountValidateRuleEnableFlagMeaning',
        type: 'string',
        label: intl
          .get(`ssta.supplySettle.view.supplySettle.contractOverAmountValidateRuleEnableFlagMeaning`)
          .d('是否启用超额校验(协议)'),
      },
      {
        name: 'contractOverAmountValidateRuleCheckLevelMeaning',
        type: 'string',
        label: intl
          .get(`ssta.supplySettle.view.supplySettle.contractOverAmountValidateRuleCheckLevelMeaning`)
          .d('校验等级(协议)'),
      },
      {
        name: 'contractOverAmountValidateRuleTolControlTypeMeaning',
        type: 'string',
        label: intl
          .get(`ssta.supplySettle.view.supplySettle.contractOverAmountValidateRuleTolControlTypeMeaning`)
          .d('超额校验允差控制类型(协议)'),
      },
      {
        name: 'contractOverAmountValidateRuleTolTolRange',
        type: 'number',
        label: intl
          .get(`ssta.supplySettle.view.supplySettle.contractOverAmountValidateRuleTolTolRange`)
          .d('超额校验允差(协议)'),
      },
    ],
    transport: {
      read: ({ data, dataSet }) => {
        const { settleHeaderId } = data;
        const { queryParameter, queryDataSet } = dataSet;
        const queryData = queryDataSet?.current?.toData() || {};
        delete queryData.__dirty;
        return {
          url: `${prefix}/settle-lines/${settleHeaderId}`,
          method: 'GET',
          data: Object.assign(queryData, queryParameter), // 因为头ds没有设置 primaryKey,所以data需要特殊处理
        };
      },
      destroy: ({ data, dataSet, params }) => {
        const stepFlag = dataSet.getState('stepFlag');
        return {
          url: `${prefix}/settle-lines/cancel`,
          method: 'PUT',
          data: data.map((item) => ({ ...item, stepFlag })),
          params: {
            ...params,
            customizeUnitCode: headUnitCodes[documentType].join(),
          },
        };
      },
    },
  };

  return remoteProps
    ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_SETTLELINEDS_CONFIG', defaultSettleLineDS, {
        editAbleRender,
      })
    : defaultSettleLineDS;
};

export const cuszLineDS = (documentType, settleHeaderId) => ({
  selection: false,
  autoQuery: false,
  primaryKey: 'expandId',
  forceValidate: true,
  fields: [],
  autoQueryAfterSubmit: false,
  queryParameter: {
    documentType,
    documentId: settleHeaderId,
    customizeUnitCode: cuszLineUnitCodes[documentType].join(),
  },
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter, queryDataSet } = dataSet;
      const queryData = queryDataSet?.current?.toData() || {};
      delete queryData.__dirty;
      return {
        url: `${prefix}/settle-expand-lines/list`,
        method: 'GET',
        data: Object.assign(queryData, queryParameter), // 因为头ds没有设置 primaryKey,所以data需要特殊处理
      };
    },
  },
});

export const multiDimensionPayDS = (paymentDimension, updateFlag, partHeaderData) => {
  const { settleHeaderId } = partHeaderData || {};
  return {
    paging: false,
    autoQuery: false,
    selection: false,
    dataToJSON: 'all',
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
        label: intl.get(`ssta.supplySettle.model.supplySettle.invoicedTaxIncludedAmounts`).d('已开票含税金额'),
        type: 'number',
        name: 'invoicedTaxIncludedAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.remainCollectionAmount`).d('剩余可收金额'),
        type: 'number',
        name: 'remainingPaymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.collectionAmountBy`).d('本次收款金额'),
        type: 'number',
        name: 'paymentAmount',
        required: true,
        validator: (value, name, record) => {
          const { remainingPaymentAmount, invoicedTaxIncludedAmount, paymentAmount, applyAmount } = record.toData();
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
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.applyAmount`).d('本次核销金额'),
        type: 'number',
        name: 'applyAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planNum',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanNum`).d('付款计划编号'),
      },
      {
        name: 'versionNumber',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanVersionNum`).d('付款计划版本号'),
      },
      {
        name: 'planStageNum',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.stageNum`).d('阶段编码'),
      },
      {
        name: 'planStageDesc',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.stageDesc`).d('阶段描述'),
      },
      {
        name: 'planStageAmount',
        type: 'number',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.planStageAmount`).d('计划阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planStageBalance',
        type: 'number',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.balanceStageAmount`).d('剩余阶段金额'),
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
    ],
    transport: {
      read: () => {
        return {
          url: `${prefix}/settle-lines/mutil-payment/${settleHeaderId}`,
          method: 'GET',
          params: { size: 0 },
        };
      },
      submit: ({ dataSet, data }) => {
        const submitType = dataSet.getState('submitType');
        if (submitType === 'autoApplyAmount') {
          return {
            url: `${prefix}/settle-apply-lines/auto-apply-amount`,
            method: 'POST',
            data: {
              ...partHeaderData,
              dimensionPaymentDTOS: data,
            },
          };
        } else if (submitType === 'autoWriteOff') {
          const paymentDimensionParam = dataSet.queryDataSet?.current?.get('paymentDimension');
          return {
            url: `${prefix}/settle-apply-lines/auto-apply`,
            method: 'PUT',
            data: { settleHeaderId, paymentDimension: paymentDimensionParam },
          };
        } else if (submitType === 'submit') {
          return {
            url: `${prefix}/settle-headers/dimension-payment-match/${settleHeaderId}`,
            method: 'PUT',
            data: data.map((item) => {
              // lodash不转换可观察数组
              const combineFields = Array.from(dataSet.getState('combineFields') || []);
              return {
                ...item,
                // 后端没办法接受未定义的字段
                dimensionExpandFieldMap: pick(item, combineFields),
              };
            }),
          };
        }
      },
    },
    feedback: {
      submitSuccess: () => {},
    },
  };
};

export const prePayWriteOffDS = (settleHeaderId, settleLineId, source) => {
  return {
    dataToJSON: 'all',
    selection: 'multiple',
    forceValidate: true,
    primaryKey: 'applyLineId',
    paging: source !== 'quoteInvoice',
    autoQuery: source !== 'quoteInvoice',
    pageSize: 20,
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionTitle`).d('预收款结算单号｜行号'),
        type: 'string',
        name: 'prepaymentTitle',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionTitle`).d('预收款结算单号｜行号'),
        type: 'string',
        name: 'preHeadAndLineLink',
        bind: 'prepaymentTitle',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionRemainingAmount`).d('预收款剩余核销金额'),
        type: 'number',
        name: 'prepaymentRemainingAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.applyAmount`).d('本次核销金额'),
        type: 'number',
        name: 'applyAmount',
        required: true,
        computedProps: {
          min: ({ record }) => 10 ** -record.get('amountPrecision'),
          formatterOptions: amountFormatterOptions,
        },
        validator: (value, name, record) => {
          const prepaymentRemainingAmount = record.get('prepaymentRemainingAmount');
          if (math.lt(prepaymentRemainingAmount, value)) {
            return intl
              .get(`ssta.common.message.validate.cannotExceed`, {
                text: record.dataSet.getField(name).get('label'),
                maxText: record.dataSet.getField('prepaymentRemainingAmount').get('label'),
              })
              .d(`{text}不能超过{maxText}`);
          }
          return true;
        },
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionAmount`).d('预收款金额'),
        type: 'string',
        name: 'preCollectionAmountBt',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionAmountBt`).d('预收款金额'),
        type: 'number',
        name: 'prepaymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionType`).d('预收款类型'),
        type: 'string',
        name: 'prepaymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.associateNum`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionCreated`).d('预收款申请人'),
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
      read: ({ params }) => {
        const urlSuffix = settleLineId ? `/${settleLineId}` : '';
        return {
          url: `${prefix}/settle-apply-lines/${settleHeaderId}${urlSuffix}`,
          method: 'GET',
          params: {
            ...params,
            customizeUnitCode: 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT.PEYPAYMENT.BOX',
          },
        };
      },
      submit: ({ params }) => {
        const urlSuffix = settleLineId ? `/${settleLineId}` : '';
        return {
          url: `${prefix}/settle-apply-lines/${settleHeaderId}${urlSuffix}`,
          method: 'PUT',
          params: {
            ...params,
            customizeUnitCode: 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT.PEYPAYMENT.BOX',
          },
        };
      },
      destroy: () => ({
        url: `${prefix}/settle-apply-lines`,
        method: 'DELETE',
      }),
    },
  };
};

export const prePayWriteOffAddDS = (settleHeader, settleLineId, source, prepaymentLineIdList) => {
  const settleHeaderId = settleHeader.get('settleHeaderId');
  const partParams =
    source === 'quoteInvoice'
      ? { prepaymentLineIdList, settleHeaderId }
      : settleLineId
      ? { settleLineId, originSettleHeaderId: settleHeaderId, summaryFlag: 0 }
      : { settleHeaderId, originSettleHeaderId: settleHeaderId, summaryFlag: 1 };
  return {
    autoQuery: false, // 筛选器代理自动查询
    selection: 'multiple',
    dataToJSON: 'selected',
    pageSize: 20,
    primaryKey: 'prepaymentLineId',
    queryParameter: {
      ...partParams,
      ...settleHeader.get(['ouId', 'companyId', 'supplierId', 'currencyCode', 'supplierSiteId', 'supplierCompanyId']),
      customizeUnitCode: writeOffAddUnitCodes.join(),
    },
    record: {
      dynamicProps: {
        selectable: (record) => record.get('prepaymentRemainingAmount') > 0,
      },
    },
    queryFields: [],
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.prepaymentRemainingAmount`).d('预收款剩余核销金额'),
        type: 'number',
        name: 'prepaymentRemainingAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.preCollectionTitle`).d('预收款结算单号｜行号'),
        type: 'string',
        name: 'prepaymentTitle',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionType`).d('预收款类型'),
        type: 'string',
        name: 'prepaymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.associateNum`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionCreated`).d('预收款申请人'),
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
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.associateLineNum`).d('关联单据行号'),
        type: 'string',
        name: 'associateLineNum',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: () => {
        return {
          url: `${prefix}/settle-apply-lines/prepayment`,
          method: 'GET',
        };
      },
      submit: ({ params }) => {
        const urlSuffix = settleLineId ? `/${settleLineId}` : '';
        return {
          url: `${prefix}/settle-apply-lines/${settleHeaderId}${urlSuffix}`,
          method: 'PUT',
          params: {
            ...params,
            customizeUnitCode: writeOffAddUnitCodes.join(),
          },
        };
      },
    },
  };
};

export const multiPrePayWriteOffDS = () => {
  return {
    paging: false,
    selection: 'multiple',
    forceValidate: true,
    pageSize: 20,
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.preCollectionTitle`).d('预收款结算单号｜行号'),
        type: 'string',
        name: 'prepaymentTitle',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionTitle`).d('预收款结算单号｜行号'),
        type: 'string',
        name: 'preHeadAndLineLink',
        bind: 'prepaymentTitle',
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionRemainingAmount`).d('预收款剩余核销金额'),
        type: 'number',
        name: 'prepaymentRemainingAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.applyAmount`).d('本次核销金额'),
        type: 'number',
        name: 'applyAmount',
        computedProps: {
          min: ({ record }) => 10 ** -record.get('amountPrecision'),
          formatterOptions: amountFormatterOptions,
        },
        required: true,
        validator: (value, name, record) => {
          const prepaymentRemainingAmount = record.get('prepaymentRemainingAmount');
          if (math.lt(prepaymentRemainingAmount, value)) {
            return intl
              .get(`ssta.common.message.validate.cannotExceed`, {
                text: record.dataSet.getField(name).get('label'),
                maxText: record.dataSet.getField('prepaymentRemainingAmount').get('label'),
              })
              .d(`{text}不能超过{maxText}`);
          }
          return true;
        },
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionAmountBt`).d('预收款金额'),
        type: 'number',
        name: 'prepaymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionType`).d('预收款类型'),
        type: 'string',
        name: 'prepaymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.associateNum`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionCreated`).d('预收款申请人'),
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

export const multiPrePayWriteOffAddDS = (settleHeader, topRecord, multiPrePayWriteOffDs) => {
  const settleHeaderId = settleHeader.get('settleHeaderId');
  const partParams = {
    writeOffCode: 'DIMENSION',
    originSettleHeaderId: settleHeaderId,
    documentNum: topRecord.get('documentNum'),
    documentHeaderNum: topRecord.get('documentHeaderNum'),
    documentLineNum: topRecord.get('documentLineNum'),
    paymentDimension: topRecord.get('paymentDimensionParam'),
    prepaymentLineIdList: multiPrePayWriteOffDs.map((item) => item.get('prepaymentLineId')).join(),
    customizeUnitCode: multiWriteOffAddUnitCodes.join(),
  };
  return {
    autoQuery: false,
    selection: 'multiple',
    pageSize: 20,
    primaryKey: 'prepaymentLineId',
    queryParameter: Object.assign(
      partParams,
      settleHeader.get(['ouId', 'companyId', 'supplierId', 'currencyCode', 'supplierSiteId', 'supplierCompanyId'])
    ),
    record: {
      dynamicProps: {
        selectable: (record) => record.get('prepaymentRemainingAmount') > 0,
      },
    },
    queryFields: [],
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionRemainingAmount`).d('预收款剩余核销金额'),
        type: 'number',
        name: 'prepaymentRemainingAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.collectionTitle`).d('预收款结算单号｜行号'),
        type: 'string',
        name: 'prepaymentTitle',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionType`).d('预收款类型'),
        type: 'string',
        name: 'prepaymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettle.supplySettle.associateNum`).d('关联单据编号'),
        type: 'string',
        name: 'associateNum',
      },
      {
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.preCollectionCreated`).d('预收款申请人'),
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
        label: intl.get(`ssta.supplySettle.view.message.model.supplySettle.associateLineNum`).d('关联单据行号'),
        type: 'string',
        name: 'associateLineNum',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: () => {
        return {
          url: `${prefix}/settle-apply-lines/prepayment`,
          method: 'GET',
          transformResponse: (response) => {
            const res = JSON.parse(response);
            if (!getResponse(res) || !res?.content) return;
            const preApplyAmountList = [];
            const multiPrepaymentAddList = [];
            topRecord.dataSet.forEach((item) => {
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
                  prepaymentRemainingAmount = Number(prepaymentRemainingAmount) - Number(input.applyAmount || 0);
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

export const filledInfoDs = () => ({
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
    {
      name: 'accountingDate',
      type: 'date',
      label: intl.get('ssta.purchaseSettle.model.purchaseSettle.accountingDate').d('记账日期'),
    },
  ],
});

export const redTableDS = (data) => ({
  autoCreate: false,
  data,
  selection: false,
  paging: false,
  dataToJSON: 'all',
  fields: [
    {
      name: 'settleNum',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleNum').d('结算单编号'),
    },
    {
      name: 'settleConfigNum',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleConfigNum').d('结算策略编码'),
    },
    {
      name: 'invoiceRefundedReason',
      type: 'string',
      lookupCode: 'SDIM.WRITE_OFF_REASON',
      label: intl.get('ssta.common.model.purchaseSettle.invoiceRefundedReason').d('冲红原因'),
    },
  ],
  transport: {
    submit: ({ dataSet }) => {
      const invoiceData = dataSet?.getState('invoiceData');
      return {
        url: `${prefix}/tax-invoice-headers/invoice-platform/update/red-info`,
        method: 'PUT',
        data: invoiceData,
      };
    },
  },
  feedback: {
    submitSuccess: () => {},
  },
});

export const redTableLineDS = (data) => ({
  autoCreate: false,
  data,
  selection: false,
  paging: false,
  forceValidate: true,
  fields: [
    {
      label: intl.get(`ssta.purchaseSettle.model.supplySettle.invoiceNumber`).d('发票号码'),
      type: 'string',
      name: 'invoiceNum',
    },
    {
      label: intl.get(`ssta.purchaseSettle.model.supplySettle.invoiceCode`).d('发票代码'),
      type: 'string',
      name: 'invoiceCode',
    },
    {
      name: 'invoiceRefundedReason',
      type: 'string',
      lookupCode: 'SDIM.WRITE_OFF_REASON',
      label: intl.get('ssta.common.model.purchaseSettle.invoiceRefundedReason').d('冲红原因'),
      required: true,
    },
  ],
});

export const batchModifyDS = (settleHeaderDs, settleLineDs) => {
  const { companyId, supplierCompanyId, documentType, amountPrecision, pricePrecision, settleType } =
    settleHeaderDs.current?.get([
      'companyId',
      'supplierCompanyId',
      'documentType',
      'amountPrecision',
      'pricePrecision',
      'settleType',
    ]) || {};
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.quantity`).d('本次开票数量'),
        name: 'quantity',
        type: 'number',
        validator: noZeroValidator,
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.netPrice`).d('本次开票不含税单价'),
        type: 'number',
        name: 'netPrice',
        validator: noZeroValidator,
        computedProps: {
          formatterOptions: ({ value }) => numberFormatterOptions(value, pricePrecision),
        },
      },
      {
        label: intl.get(`ssta.supplySettle.model.supplySettle.netAmounts`).d('本次开票不含税金额'),
        type: 'number',
        name: 'netAmount',
        validator: noZeroValidator,
        computedProps: {
          formatterOptions: ({ value }) => numberFormatterOptions(value, amountPrecision),
        },
      },
      {
        label: intl.get(`ssta.supplySettle.view.model.taxRate`).d('税率'),
        type: 'object',
        name: 'taxRateLov',
        dynamicProps: {
          lovPara: () => ({
            companyId,
            supplierCompanyId,
            tenantId: organizationId,
            source: 'SETTLEINVIOCE',
          }),
        },
        ignore: 'always',
        noCache: true,
        lovCode: 'SSTA.TAX_RATE_SERVICE',
        textField: 'taxRate',
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
        name: 'taxCode',
        bind: 'taxRateLov.taxCode',
      },
      {
        name: 'taxRateType',
        type: 'string',
        bind: 'taxRateLov.taxRateType',
      },
      {
        label: intl.get(`ssta.supplySettle.common.taxAmount`).d('税额'),
        type: 'number',
        name: 'taxAmount',
        computedProps: {
          formatterOptions: ({ value }) => numberFormatterOptions(value, amountPrecision),
        },
      },
      {
        label: intl.get(`ssta.supplySettle.common.taxIncludedPrice`).d('本次开票含税单价'),
        type: 'number',
        name: 'taxIncludedPrice',
        validator: noZeroValidator,
        computedProps: {
          formatterOptions: ({ value }) => numberFormatterOptions(value, pricePrecision),
        },
      },
      {
        label: intl.get(`ssta.supplySettle.common.currentTaxIncludedAmount`).d('本次开票含税金额'),
        type: 'number',
        name: 'taxIncludedAmount',
        validator: noZeroValidator,
        computedProps: {
          formatterOptions: ({ value }) => numberFormatterOptions(value, amountPrecision),
        },
      },
      {
        label: intl.get(`ssta.supplySettle.common.paymentCollectionAmount`).d('本次收款金额'),
        type: 'number',
        name: 'paymentAmount',
        computedProps: {
          formatterOptions: ({ value }) => numberFormatterOptions(value, amountPrecision),
        },
      },
      {
        name: 'lineRemark',
        type: 'string',
        label: intl.get('ssta.common.model.common.lineRemark').d('行备注'),
      },
    ],
    transport: {
      submit: ({ data, params }) => {
        const { selected } = settleLineDs;
        const headerData = settleHeaderDs.current?.toJSONData() || {};
        let searchBarData;
        if (settleLineDs.selected.length) {
          headerData.settleLineIdList = selected.map((item) => item.get('settleLineId'));
        } else {
          searchBarData = settleLineDs.queryDataSet?.current?.toData() || {};
          delete searchBarData.__dirty;
        }
        const customizeCode =
          settleType === 'PAYMENT'
            ? 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT_BATCH_MODIFY_LINE'
            : 'SSTA.SUPPLY_SETTLE_DETAIL.INV_BATCH_MODIFY_LINE';
        return {
          url: `${prefix}/settle-headers/supplier/update/batch`,
          method: 'PUT',
          data: { ...headerData, settleLine: data[0] },
          params: {
            ...params,
            ...searchBarData,
            customizeUnitCode: [...lineUnitCodes[documentType], customizeCode].join(),
          },
        };
      },
    },
  };
};

// 先发票后事务
export const taxInvoicePoolDS = () => ({
  pageSize: 20,
  autoQuery: false,
  forceValidate: true,
  selection: 'multiple',
  dataToJSON: 'selected',
  queryParameter: { customizeUnitCode: advanceInvListCodes.join() },
  cacheSelection: true,
  primaryKey: 'invoiceHeaderId',
  fields: [
    {
      name: 'invoiceStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceStatusMeaning').d('发票状态'), // SSTA.CHARGE_STATUS
    },
    {
      name: 'checkStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkStatusMeaning').d('查验状态'),
    },
    {
      name: 'validateMessage',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.validateMessage').d('查验状态说明'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.operation').d('操作'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get(`ssta.purchaseInvoicePool.model.purchaseInvoicePool.reve2rs2eNum`).d('附件查看'),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
    },
    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTypeMeaning').d('发票类型'),
    },
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.InvoiceCode').d('发票代码'),
    },
    {
      name: 'invoiceNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTel').d('发票号码'),
    },
    {
      name: 'invoicingDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoicingDate').d('开票日期'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.notHaveMoney.').d('不含税金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxAmount').d('税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxInclssudedAmount').d('价税合计'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'checkCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkCode').d('校验码'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.remark').d('备注（票面）'),
    },
    {
      name: 'memo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.memo').d('备忘说明'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方名称'),
    },
    {
      name: 'supUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supUnifiedSocialCode').d('销方纳税人识别号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.companyName').d('购方名称'),
    },
    {
      name: 'purUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.purUnifiedSocialCode').d('购方纳税人识别号'),
    },
    {
      name: 'invoiceSourceMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceSource').d('进池来源'),
    },
    {
      name: 'checkDate',
      type: 'dateTime',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkDate').d('查验日期'),
    },
    {
      name: 'fileUrl',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.FileURL').d('文件URL'),
    },
    {
      name: 'uniSee',
      type: 'string',
      label: intl.get(`ssta.costSheet.view.message.checkOCRFile`).d('OCR识别文件'),
    },
    {
      name: 'aiAttachmentUrl',
      type: 'string',
      label: intl.get(`ssta.common.model.common.aiRecognizeFile`).d('AI识别文件'),
    },
    {
      name: 'ofdFileUrl',
      type: 'string',
      label: intl.get('ssta.common.view.message.ofdFileUrl').d('OFD文件'),
    },
    {
      name: 'documentStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.documentStatusMeaning').d('单据状态'),
    },
    {
      name: 'associatedDocumentNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.associatedDocumentNum').d('关联单据'),
    },
    {
      name: 'cancelledFlag',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.cancelledsFlag').d('取消标识'),
    },
    {
      name: 'cancelledFlagMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.cancelledsFlag').d('取消标识'),
    },
    {
      name: 'exceptionStatusMeaning',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.exceptionStatusMeaning').d('异常标识'),
    },
    {
      name: 'sumCheckTimes',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.revesng').d('累计查验次数'),
    },
    {
      name: 'checkTimes',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.todayCheckTimes').d('当天查验次数'),
    },
    {
      name: 'belongCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.belongCompanyName').d('所属公司'),
    },
    {
      name: 'belongSupplierCompanyName',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.belongSupplierCompanyName').d('所属供应商'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `/ssta/v1/${organizationId}/invoice-header/supplier/page`,
        method: 'GET',
        data: {
          ...data,
          ...transformQselectDate(data, { creationDateRange: 'creationDate' }),
          ...transformSupplierData(data?.belongSupplierCompanyId, {
            supCompanyPropCode: 'belongSupplierCompanyId',
            supPropCode: 'belongSupplierId',
          }),
          documentStatusList: 'NOT_ASSOCIATED',
          cancelledFlagList: '0',
        },
      };
    },
    submit: ({ dataSet }) => {
      const submitType = dataSet.getState('submitType');
      switch (submitType) {
        case 'check':
          return {
            url: `${prefix}/invoice-header/batch-check`,
            method: 'POST',
          };
        case 'createInv':
          return {
            url: `${prefix}/invoice-header/step-save`,
            method: 'POST',
          };
        default:
      }
    },
    destroy: () => {
      return {
        url: `${prefix}/invoice-header/purchaser/cancel`,
        method: 'POST',
      };
    },
  },
  feedback: {
    submitSuccess: () => {},
  },
});

/**
 * 税务发票池头数据源
 * @return {import('choerodon-ui/dataset/data-set/DataSet').DataSetProps}
 */
export const taxInvPoolHeaderDS = ({ invoiceHeaderId, customizeUnitCode }) => ({
  dataToJSON: 'all',
  forceValidate: true,
  primaryKey: 'invoiceHeaderId',
  autoQuery: !isNil(invoiceHeaderId),
  autoCreate: isNil(invoiceHeaderId),
  fields: [
    {
      name: 'invoiceType',
      type: 'string',
      lookupCode: 'SSTA.INVOICE_POOL_TYPE',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxType').d('发票类型'),
      required: true,
    },
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceCode').d('发票代码'),

      dynamicProps: {
        required: ({ record }) =>
          !['17', '18', '19', '83', '87', '98', '99', '105'].includes(record.get('invoiceType')),
      },
    },
    {
      name: 'invoiceNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.telCode').d('发票号码'),
      required: true,
    },
    {
      name: 'invoicingDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTime').d('开票日期'),
      computedProps: {
        required: ({ dataSet }) => {
          const enableCheckFlag = dataSet.getState('enableCheckFlag');
          return enableCheckFlag === 1;
        },
      },
    },
    {
      name: 'companyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.buier').d('购方'),
    },
    {
      name: 'companyName',
      bind: 'companyNameLov.companyName',
    },
    {
      name: 'purUnifiedSocialCode',
      bind: 'companyNameLov.unifiedSocialCode',
    },
    {
      name: 'companyId',
      bind: 'companyNameLov.companyId',
    },
    {
      name: 'supplierCompanyNameLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER_SUP',
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方'),
      valueField: 'lovKey',
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierCompanyNameLov.displaySupplierName',
    },
    {
      name: 'supUnifiedSocialCode',
      bind: 'supplierCompanyNameLov.supUnifiedSocialCode',
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierCompanyNameLov.supplierCompanyId',
    },
    {
      name: 'extUnifiedSocialCode',
      bind: 'supplierCompanyNameLov.extUnifiedSocialCode',
    },
    {
      name: 'supplierId',
      bind: 'supplierCompanyNameLov.supplierId',
    },
    {
      name: 'supplierName',
      bind: 'supplierCompanyNameLov.supplierName',
    },
    {
      name: 'supplierNum',
      bind: 'supplierCompanyNameLov.supplierNum',
    },
    {
      name: 'supplierTenantId',
      bind: 'belongSupplierCompanyIdLov.supplierTenantId',
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.netAmount').d('不含税金额'),
      required: true,
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.nettaxAmount').d('税额'),
      required: true,
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'checkCode',
      type: 'string',
      label: intl
        .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkcodeWarning')
        .d('校验码 (多位时请输入后6位即可)'),
      dynamicProps: {
        required: ({ record }) =>
          record.getState('enableCheckFlag') && ['04', '10', '11'].includes(record.get('invoiceType')),
      },
    },
    {
      name: 'memo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.memo').d('备忘说明'),
    },
    {
      name: 'belongCompanyIdLov',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.CUSTOMER',
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.BelongCompanyid').d('所属客户'),
      required: true,
    },
    {
      name: 'belongCompanyId',
      bind: 'belongCompanyIdLov.companyId',
    },
    {
      name: 'belongCompanyName',
      bind: 'belongCompanyIdLov.companyName',
    },
    {
      name: 'belongSupplierCompanyIdLov',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH.COMPANY_FOR_SUPPLIER',
      required: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.belongsCompanyId').d('所属公司'),
    },
    {
      name: 'belongSupplierCompanyId',
      bind: 'belongSupplierCompanyIdLov.companyId',
    },
    {
      name: 'belongSupplierCompanyName',
      bind: 'belongSupplierCompanyIdLov.displayValue',
    },
    {
      name: 'belongSupplierId',
      bind: 'belongSupplierCompanyIdLov.supplierId',
    },
    {
      name: 'supplierTenantId',
      bind: 'belongSupplierCompanyIdLov.supplierTenantId',
    },
    {
      name: 'buyerContact',
      type: 'string',
      label: intl.get('ssta.common.model.common.buyerContact').d('购方联系人'),
    },
    {
      name: 'sellerContact',
      type: 'string',
      label: intl.get('ssta.common.model.common.sellerContact').d('销方联系人'),
    },
    {
      name: 'beneficiaryBank',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryBank').d('收款银行'),
    },
    {
      name: 'beneficiaryBankAddress',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryBankAddress').d('收款银行地址'),
    },
    {
      name: 'beneficiaryAccountNum',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryAccountNum').d('收款银行账号'),
    },
    {
      name: 'beneficiaryAccountName',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryAccountName').d('收款银行账户名称'),
    },
    {
      name: 'paymentTerms',
      type: 'string',
      label: intl.get('ssta.common.model.common.paymentTerms').d('支付条款'),
    },
  ],
  queryParameter: { invoiceHeaderId, customizeUnitCode },
  transport: {
    read: ({ dataSet }) => {
      const newInvoiceHeaderId = dataSet.getState('invoiceHeaderId');
      return {
        url: `/ssta/v1/${organizationId}/invoice-header/detail/${invoiceHeaderId || newInvoiceHeaderId}`,
        method: 'GET',
      };
    },
    submit: ({ data, params }) => {
      const baseConfig = {
        url: `${prefix}/invoice-header/purchaser`,
        params: { ...params, customizeUnitCode },
        data: data.map((item) => {
          const { netAmount, taxAmount } = item;
          return { ...item, netAmount: netAmount || 0, taxAmount: taxAmount || 0 };
        }),
      };
      // 新建和保存接口不一样
      if (invoiceHeaderId) {
        const { netAmount, taxAmount } = data[0];
        Object.assign(baseConfig, {
          method: 'PUT',
          data: { ...data[0], netAmount: netAmount || 0, taxAmount: taxAmount || 0 },
        });
      } else {
        baseConfig.method = 'POST';
      }
      return baseConfig;
    },
  },
});

export const taxInvoicePooloperationDS = () => ({
  selection: false,
  primaryKey: 'actionId',
  pageSize: 0,
  fields: [
    {
      name: 'processUser',
      type: 'string',
      label: intl.get('hzero.common.components.operationAudit.operatedBy').d('操作人'),
    },
    {
      name: 'processUserName',
      type: 'string',
      label: intl.get('hzero.common.components.operationAudit.operatedBy').d('操作人'),
    },
    {
      name: 'processDate',
      type: 'dateTime',
      label: intl.get('hzero.common.components.operationAudit.operatedTime').d('操作时间'),
    },
    {
      name: 'processStatusMeaning',
      type: 'string',
      label: intl.get('hzero.common.actions').d('动作'),
    },
    {
      name: 'processRemark',
      type: 'string',
      label: intl.get('hzero.common.components.operationAudit.operationRemark').d('操作说明'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { invoiceHeaderId } = data;
      return {
        url: `/ssta/v1/${organizationId}/invoice-action/${invoiceHeaderId}`,
        method: 'GET',
      };
    },
  },
});

/**
 * 税务发票池行数据源
 * @return {import('choerodon-ui/dataset/data-set/DataSet').DataSetProps}
 */
export const taxInvPoolLineDS = (customizeCode) => ({
  pageSize: 20,
  autoQuery: false,
  forceValidate: true,
  primaryKey: 'lineId',
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.linseNum').d('行号'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.chargsseCodeOrItemName').d('项目名称/货物或应税劳务，服务名称'),
      required: true,
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.netAmountMeaningno').d('金额(不含税)'),
      required: true,
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.quantitys').d('数量'),
    },

    {
      name: 'taxRate',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.theTaxsRate').d('税率'),
    },

    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thetaxAmount').d('税额'),
      required: true,
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'netPrice',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thenetsPrice').d('不含税单价'),
    },

    {
      name: 'spec',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.spec').d('规格型号'),
    },

    {
      name: 'uom',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.theUom').d('单位'),
    },
    {
      name: 'plateNo',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.plateNo').d('车牌号（通行费）'),
    },
    {
      name: 'trafficType',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.trafficType').d('类型'),
    },
    {
      name: 'trafficDateStart',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.trafficDateStart').d('通行日期起（通行费）'),
    },
    {
      name: 'trafficDateEnd',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.trafficDateEnd').d('通行日期至（通行费）'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { invoiceHeaderId } = data;
      return {
        url: `${prefix}/invoice-line/${invoiceHeaderId}`,
        method: 'GET',
        data: { customizeUnitCode: customizeCode },
      };
    },
    destroy: ({ data, dataSet }) => {
      const headerInfo = dataSet.parent?.current?.toData() || {};
      return {
        url: `${prefix}/invoice-line`,
        data: { ...headerInfo, invoiceLineList: data },
        method: 'DELETE',
        params: { customizeUnitCode: customizeCode },
      };
    },
  },
});

export const payDS = () => {
  return {
    pageSize: 5,
    selection: false,
    autoQuery: false,
    queryParameter: { customizeUnitCode: 'SSTA.SUPPLY_SETTLE_LIST.PAY_APPLY_EXCUTE_LINE' },
    fields: [
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.settlementNumAndLines`).d('结算单编号|行号'),
        type: 'string',
        name: 'documentNumAndLine',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.documentsNumAndLines`).d('结算单编号'),
        type: 'string',
        name: 'documentNum',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleNum`).d('结算事务编号'),
        type: 'string',
        name: 'settleNum',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.collectionType`).d('收款类型'),
        name: 'paymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.collectionAmount`).d('收款金额'),
        type: 'number',
        name: 'paymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`hzero.common.view.collectionStatus`).d('收款状态'),
        name: 'recordStatusMeaning',
        type: 'string',
      },
      {
        label: intl.get('hzero.common.collectionDates').d('收款日期'),
        name: 'recordDate',
        type: 'date',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.collectionSources`).d('收款来源'),
        type: 'string',
        name: 'recordSource',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.companyNames`).d('执行客户公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.supplierCompanyNames`).d('执行供应商公司'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.campMeaning`).d('创建方阵营'),
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
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.processRemarks`).d('操作备注'),
        type: 'string',
        name: 'remark',
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get('ssta.supplySettlePool.model.supplySettlePool.operation').d('操作'),
      },
    ],
    transport: {
      /**
       * 查询
       */

      read: ({ dataSet, params }) => {
        const {
          queryParameter: { settleHeaderId },
          filter,
        } = dataSet;
        if (!settleHeaderId) return; // 无 settleId 的不执行查询
        const { recordSource = [], paymentType = [], recordStatus = [], ...rest } = filter;
        const paramsData = filterNullValueObject({
          recordSource: recordSource.join(','),
          recordStatus: recordStatus.join(','),
          paymentType: paymentType.join(','),
          ...rest,
          ...params,
        });
        const url = `/ssta/v1/${organizationId}/settle-records/invoice-settle-payment-record`;

        return {
          url,
          method: 'GET',
          params: paramsData,
        };
      },
    },
  };
};

export const payApplyExcuteRecordDS = () => {
  return {
    selection: false,
    autoQuery: false,
    pageSize: 20,
    fields: [
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.documentNumAndLine`).d('结算单编号|行号'),
        type: 'string',
        name: 'documentNumAndLine',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.sourceDocumentNumAndLine`).d('开票单号'),
        type: 'string',
        name: 'sourceDocumentNumAndLine',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.collectionType`).d('收款类型'),
        name: 'paymentTypeMeaning',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.collectionAmount`).d('收款金额'),
        type: 'number',
        name: 'paymentAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`hzero.common.view.collectionStatus`).d('收款状态'),
        name: 'recordStatusMeaning',
        type: 'string',
      },
      {
        label: intl.get('hzero.common.collectionDates').d('收款日期'),
        name: 'recordDate',
        type: 'date',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.recordCollectionSources`).d('收款来源'),
        type: 'string',
        name: 'recordSource',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.companyNames`).d('执行客户公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl.get(`ssta.supplySettlePool.model.supplySettlePool.supplierCompanyNames`).d('执行供应商公司'),
        type: 'string',
        name: 'supplierCompanyName',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: () => {
        const url = `/ssta/v1/${organizationId}/settle-sub-records`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};

export const PaymentStageDS = (settleHeaderId) => ({
  autoQuery: false,
  selection: 'multiple',
  queryParameter: {
    settleHeaderId,
  },
  cacheSelection: true,
  primaryKey: 'stageLineId',
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.prePayment.lineNum').d('行号'),
    },
    {
      name: 'stageDocumentAndLineNum',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.prePayment.docTermNumAndLine').d('条款来源单据编号-行号'),
    },
    {
      name: 'stageNum',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.prePayment.stageNum').d('阶段编码'),
    },
    {
      name: 'stageDesc',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.prePayment.stageDesc').d('阶段描述'),
    },
    {
      name: 'stageAmount',
      type: 'number',
      label: intl.get('ssta.purchaseSettle.model.prePayment.stageAmount').d('阶段金额'),
    },
    {
      name: 'paymentAmount',
      type: 'number',
      label: intl.get('ssta.purchaseSettle.model.prePayment.docPaymentAmount').d('本次实际付款金额'),
    },
    {
      name: 'applyAmount',
      type: 'number',
      label: intl.get('ssta.purchaseSettle.model.prePayment.currentApplyAmount').d('本次实际付款金额'),
    },
    {
      name: 'applyOccupyAmount',
      type: 'number',
      label: intl.get('ssta.purchaseSettle.model.prePayment.docPrepaymentApplyAmount').d('已核销金额'),
    },
    {
      name: 'enableApplyAmount',
      type: 'number',
      label: intl.get('ssta.purchaseSettle.model.prePayment.enableApplyAmount').d('可核销金额'),
    },
    {
      name: 'prepPaymentAmount',
      type: 'number',
      label: intl.get('ssta.purchaseSettle.model.prePayment.prepCompletePayAmount').d('编制确认付款金额'),
    },
    {
      name: 'paymentOccupyAmount',
      type: 'number',
      label: intl.get('ssta.purchaseSettle.model.prePayment.docPaidAmount').d('已付款金额'),
    },
    {
      name: 'enablePaymentAmount',
      type: 'number',
      label: intl.get('ssta.purchaseSettle.model.prePayment.docAbleAmount').d('可付款金额'),
    },
    {
      name: 'prepLatestPaymentDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('ssta.purchaseSettle.model.prePayment.prepPaymentDate').d('编制确认付款日期（最早）'),
    },
    {
      name: 'prepLastPaymentDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('ssta.purchaseSettle.model.prePayment.prepPaymentDateLast').d('编制确认付款日期（最晚）'),
    },

    {
      name: 'prepDocumentAndLineNum',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.prePayment.prepDocumentAndLineNum').d('编制来源单据单号-行号'),
    },
    {
      name: 'prepRelationNum',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.prePayment.settleNumAndStageLine').d('结算单行&阶段明细行关联标识'),
    },
    {
      name: 'prepPaymentDate',
      type: 'date',
      label: intl.get('ssta.purchaseSettle.model.prePayment.prepPaymentConfirmDate').d('编制确认付款日期'),
      format: DEFAULT_DATE_FORMAT,
    },
    {
      name: 'syncStatus',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.prePayment.syncStatus').d('同步状态'),
      lookupCode: 'SSTA.SETTLE_HEADER_SYNC_STATUS',
    },
    {
      name: 'shareFlag',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.prePayment.shareFlag').d('本次付款/核销'),
      lookupCode: 'HPFM.FLAG',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { paymentStageTypeCustom } = data;
      const customizeUnitCode =
        paymentStageTypeCustom === 'PAYMENT_STAGE'
          ? Object.values(paymentStageCode).join()
          : Object.values(paymentStageLineCode).join();
      const url =
        paymentStageTypeCustom === 'PAYMENT_STAGE'
          ? `/ssta/v1/${organizationId}/payment-stage-headers/list?customizeUnitCode=${customizeUnitCode}`
          : `/ssta/v1/${organizationId}/payment-stage-lines/list?customizeUnitCode=${customizeUnitCode}`;
      return {
        url,
        method: 'GET',
      };
    },
  },
});
