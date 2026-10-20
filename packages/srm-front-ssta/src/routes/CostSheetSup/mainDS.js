/*
 * @Description:
 * @Date: 2020-07-23 10:38:14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { transformSupplierData, amountFormatterOptions, transformQselectDate } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

const mainTableDs = (chargeType) => ({
  primaryKey: 'chargeHeaderId',
  cacheSelection: true,
  pageSize: 20,
  // autoQuery: true,
  selection: 'multiple',
  // table表单显示的字段
  fields: [
    {
      name: 'chargeNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.chargeNum').d('费用单编号'),
    },
    {
      name: 'enablePushFlag',
      type: 'string',
      defaultValue: '0',
    },
    {
      name: 'chargeStatusMeaning',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.chargeStatus').d('费用单状态'), // SSTA.CHARGE_STATUS
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.companyNameCustomer').d('客户公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supplierCompanyName2').d('供应商公司'),
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.currencyCode').d('币种'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.netAmount').d('不含税总金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxAmount').d('税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxIncludedAmount').d('含税总金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('ssta.costSheet.model.costSheet.createdDate').d('创建日期'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.createdByName').d('创建人'),
    },
    {
      name: 'reverseStatusMeaning',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.reverseStatusMeaning').d('冲销标识'),
    },
    {
      name: 'reverseNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.reverseNum').d('冲销关联单据号'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.operation').d('操作'),
    },
  ],

  queryFields: [],
  queryParameter: {
    chargeType,
  },
  transport: {
    read: ({ data }) => {
      const { supplierCompanyId } = data || {};
      return {
        url: `/ssta/v1/${organizationId}/charge-headers/supplier?customizeUnitCode=SSTA.COST_SHEET_SUP_LIST.GRID,SSTA.COST_SHEET_SUP_LIST.SEARCH_BAR`,
        method: 'GET',
        data: {
          ...data,
          ...transformQselectDate(data, { creationDateRange: 'creationDate' }),
          ...transformSupplierData(supplierCompanyId),
        },
      };
    },
  },
});

const detailTableDs = () => ({
  primaryKey: 'chargeLineId',
  cacheSelection: true,
  cacheModified: true,
  // autoQuery: true,
  selection: 'multiple',
  // table表单显示的字段
  pageSize: 20,
  fields: [
    {
      name: 'chargeStatusMeaning',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.chargeStatus').d('费用单状态'), // SSTA.CHARGE_STATUS
    },
    {
      name: 'chargeNumAndLine',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.chargeNumLineNum').d('费用单编号-行号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.companyName').d('公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supplierCompanyName1').d('供应商'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.operation').d('操作'),
    },
    {
      name: 'chargeCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.chargeCode').d('费用编码'),
    },
    {
      name: 'chargeName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.chargeName').d('费用名称'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.netAmount').d('总金额(不含税)'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxRate').d('税率'),
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxAmount').d('税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxIncludedAmount').d('总金额(含税)'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'pcNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.pcNum').d('采购协议编号'),
    },
    {
      name: 'poNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.poNum').d('采购订单编号'),
    },
    {
      name: 'treatmentMethod',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.treatmentMethod').d('费用处理方式'),
      lookupCode: 'SSTA.CHARGE_TREATMENT_METHOD',
    },
    {
      name: 'pushSettleStatusMeaning',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.pushSettleStatusMeaning').d('推送结算池状态'),
    },
    {
      name: 'pushBackMsgMeaning',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.pushBackMsg').d('推送信息'),
    },
    {
      name: 'reverseLineNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.reverseLineNum').d('冲销关联单据行号'),
    },
  ],

  queryFields: [],

  transport: {
    read: ({ data }) => {
      return {
        url: `/ssta/v1/${organizationId}/charge-lines/supplier/detail-line-list?customizeUnitCode=SSTA.COST_SHEET_SUP_LIST.GRID_DETAIL,SSTA.COST_SHEET_SUP_LIST.SEARCH_BAR_DETAIL`,
        method: 'GET',
        data: {
          ...data,
          ...transformQselectDate(data, { creationDateRange: 'creationDate' }),
        },
      };
    },
  },
});

export { mainTableDs, detailTableDs };
