/*
 * @Description:
 * @Date: 2020-07-23 10:38:14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { amountFormatterOptions } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

// 订单
const tableDs2 = () => ({
  autoQuery: false,
  selection: 'multiple',
  primaryKey: 'tempKey',
  cacheSelection: true,
  // table表单显示的字段
  fields: [
    {
      name: 'displayNum',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.purchaseOrderNum').d('采购订单号'),
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
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl
        .get('ssta.prePayment.model.prePayment.orderTotalAmountIncludeTax')
        .d('订单总额（含税）'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'amount',
      type: 'number',
      label: intl
        .get('ssta.prePayment.model.prePayment.orderTotalAmountExcludeTax')
        .d('订单总额（不含税）'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'paymentAmount',
      type: 'number',
      label: intl.get('ssta.prePayment.model.prePayment.paymentAmount').d('剩余可付金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'orderTypeName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.orderTypeName').d('采购订单类型'),
    },
    {
      name: 'organizationName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.organizationName').d('采购组织'),
    },
    {
      name: 'purchaseAgentName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.purchaseAgentName').d('采购员'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('ssta.prePayment.model.prePayment.creationDate').d('创建时间'),
    },
    {
      name: 'releasedDate',
      type: 'dateTime',
      label: intl.get('ssta.prePayment.model.prePayment.releasedDate').d('发布时间'),
    },

    {
      label: intl.get(`ssta.prePayment.model.prePayment.poItemName`).d('物料名称'),
      type: 'string',
      name: 'itemName',
    },
    {
      label: intl.get(`ssta.prePayment.model.prePayment.quantity`).d('数量'),
      type: 'number',
      name: 'quantity',
    },
    {
      label: intl.get(`ssta.prePayment.model.prePayment.taxIncludedLineAmount1`).d('含税行金额'),
      type: 'number',
      name: 'taxIncludedLineAmount',
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      label: intl.get(`ssta.prePayment.model.prePayment.lineAmount1`).d('不含税行金额'),
      type: 'number',
      name: 'lineAmount',
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      label: intl.get(`ssta.prePayment.model.prePayment.categoryName`).d('品类'),
      type: 'string',
      name: 'categoryName',
    },
    {
      label: intl.get(`ssta.prePayment.model.prePayment.createdBy`).d('订单创建人'),
      type: 'string',
      name: 'poCreateName',
    },
  ],

  transport: {
    read: ({ data }) => {
      const { settleHeaderId, ...otherData } = data;
      return {
        url: `/ssta/v1/${organizationId}/pre-payment-lines/${settleHeaderId}/add-order`,
        method: 'GET',
        data: {
          ...otherData,
          settleHeaderId,
        },
      };
    },
  },
});

// 协议
const tableDs3 = () => ({
  autoQuery: false,
  selection: 'multiple',
  primaryKey: 'tempKey',
  cacheSelection: true,
  // table表单显示的字段
  fields: [
    {
      name: 'displayNum',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.displayNum1').d('采购协议编号'),
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
      name: 'pcName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.pcName').d('采购协议名称'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.prePayment.model.prePayment.agreementAmount').d('协议总额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'originalAmount',
      type: 'number',
      label: intl
        .get('ssta.prePayment.model.prePayment.originCurrencyAmountExTax')
        .d('原币金额（不含税）'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'originalTaxIncludeAmount',
      type: 'number',
      label: intl
        .get('ssta.prePayment.model.prePayment.originCurrencyAmountInTax')
        .d('原币金额（含税）'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'paymentAmount',
      type: 'number',
      label: intl.get('ssta.prePayment.model.prePayment.paymentAmount').d('剩余可付金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.currencyCode').d('币种'),
    },
    {
      name: 'pcTypeName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.pcTypeName').d('协议类型'),
    },
    {
      name: 'startDateActive',
      type: 'date',
      label: intl.get('ssta.prePayment.model.prePayment.startDateActive').d('协议起始日期'),
    },
    {
      name: 'endDateActive',
      type: 'date',
      label: intl.get('ssta.prePayment.model.prePayment.endDateActive').d('协议终止日期'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('ssta.prePayment.model.prePayment.creationDate').d('创建时间'),
    },
    {
      name: 'confirmedDate',
      type: 'date',
      label: intl.get('ssta.prePayment.model.prePayment.confirmedDate').d('生效时间'),
    },
    {
      label: intl.get(`ssta.prePayment.model.prePayment.pendingFlag`).d('是否已暂挂'),
      type: 'number',
      name: 'pendingFlag',
      lookupCode: 'HPFM.FLAG',
    },
  ],

  transport: {
    read: ({ data }) => {
      const { settleHeaderId, ...otherData } = data;
      return {
        url: `/ssta/v1/${organizationId}/pre-payment-lines/${settleHeaderId}/add-order`,
        method: 'GET',
        data: {
          ...otherData,
          settleHeaderId,
        },
      };
    },
  },
});

// 协议阶段
const tableDs4 = () => ({
  autoQuery: false,
  selection: 'multiple',
  primaryKey: 'tempKey',
  cacheSelection: true,
  fields: [
    {
      name: 'associateNum',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.pcNum').d('采购协议编号'),
    },
    {
      name: 'pcName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.pcName').d('采购协议名称'),
    },
    {
      name: 'associateLineNum',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.associateLineNum').d('阶段编码'),
    },
    {
      name: 'stageName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.stageName').d('阶段名称'),
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.currencyCode').d('币种'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl
        .get('ssta.prePayment.model.prePayment.pcStageNumIncludeTax')
        .d('协议阶段金额（含税）'),
      computedProps: { formatterOptions: amountFormatterOptions },
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
      name: 'pcTypeName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.pcTypeName').d('协议类型'),
    },
    {
      name: 'pcStatusCode',
      type: 'string',
      lookupCode: 'SPCM.CONTRACT.STATUS',
      label: intl.get('ssta.prePayment.model.prePayment.pcStatusCode').d('协议状态'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('ssta.prePayment.model.prePayment.creationDate').d('创建时间'),
    },
    {
      label: intl.get(`ssta.prePayment.model.prePayment.pendingFlag`).d('是否已暂挂'),
      type: 'number',
      name: 'pendingFlag',
      lookupCode: 'HPFM.FLAG',
    },
  ],

  transport: {
    read: ({ data }) => {
      const { settleHeaderId, ...otherData } = data;
      return {
        url: `/ssta/v1/${organizationId}/pre-payment-lines/${settleHeaderId}/add-order`,
        method: 'GET',
        data: {
          ...otherData,
          settleHeaderId,
        },
      };
    },
  },
});

// 协议标的
const tableDs5 = () => ({
  autoQuery: false,
  selection: 'multiple',
  primaryKey: 'tempKey',
  cacheSelection: true,
  fields: [
    {
      name: 'associateNum',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.pcNum').d('采购协议编号'),
    },
    {
      name: 'pcName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.pcName').d('采购协议名称'),
    },
    {
      name: 'associateLineNum',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.lineNum').d('标的行号'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.itemName').d('物料名称'),
    },
    {
      name: 'lineAmount',
      type: 'number',
      label: intl.get('ssta.prePayment.model.prePayment.lineAmount').d('协议标的行不含税金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.prePayment.model.prePayment.taxAmount').d('协议标的行税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxIncludedLineAmount',
      type: 'number',
      label: intl
        .get('ssta.prePayment.model.prePayment.taxIncludedLineAmount')
        .d('协议标的行含税金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
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
      name: 'pcTypeName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.pcTypeName').d('协议类型'),
    },
    {
      name: 'pcStatusCodeMeaning',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.pcStatusCodeMeaning').d('协议状态'),
    },
    {
      name: 'createByRealName',
      type: 'string',
      label: intl.get('ssta.prePayment.model.prePayment.createByRealName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('ssta.prePayment.model.prePayment.creationDate').d('创建时间'),
    },
    {
      label: intl.get(`ssta.prePayment.model.prePayment.pendingFlag`).d('是否已暂挂'),
      type: 'number',
      name: 'pendingFlag',
      lookupCode: 'HPFM.FLAG',
    },
  ],

  transport: {
    read: ({ data }) => {
      const { settleHeaderId, ...otherData } = data;
      return {
        url: `/ssta/v1/${organizationId}/pre-payment-lines/${settleHeaderId}/add-order`,
        method: 'GET',
        data: {
          ...otherData,
          settleHeaderId,
        },
      };
    },
  },
});

export { tableDs2, tableDs3, tableDs4, tableDs5 };
