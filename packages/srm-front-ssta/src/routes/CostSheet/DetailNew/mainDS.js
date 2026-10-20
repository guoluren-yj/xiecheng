/*
 * @Description:
 * @Date: 2020-08-20 14:21:53
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { getDatas, amountFormatterOptions } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

// 头
const formDs = () => ({
  // autoQuery: true,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'chargeNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.chargeNum').d('费用单编号'),
      disabled: true,
    },
    {
      name: 'chargeStatus',
      type: 'string',
      lookupCode: 'SSTA.CHARGE_STATUS',
      defaultValue: 'NEW',
      label: intl.get('ssta.costSheet.model.costSheet.chargeStatus').d('费用单状态'),
      required: true,
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.createdByName').d('创建人'),
      disabled: true,
    },
    {
      name: 'createdUnitLov',
      type: 'object',
      lovCode: 'SPRM.USER_EMPLOYEE_ALL_UNIT',
      label: intl.get('ssta.costSheet.model.costSheet.createdUnitName').d('创建人部门'),
      noCache: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      ignore: 'always',
    },
    {
      name: 'createdUnitName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.createdUnitName').d('创建人部门'),
      disabled: true,
      bind: 'createdUnitLov.unitName',
    },
    {
      name: 'createdUnitId',
      type: 'string',
      bind: 'createdUnitLov.unitId',
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('ssta.costSheet.model.costSheet.createdDate').d('创建日期'),
    },
    {
      name: 'chargeHeaderSourceMeaning',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.chargeHeaderSourceMeaning').d('数据来源'),
    },
    {
      name: 'sourceNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.sourceNum').d('来源单号'),
    },
    {
      name: 'reverseStatus',
      type: 'string',
      lookupCode: 'SSTA.CHARGE_REVERSE_STATUS',
      defaultValue: '0',
      label: intl.get('ssta.costSheet.model.costSheet.reverseStatusMeaning').d('冲销标识'),
    },
    {
      name: 'reverseNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.reverse').d('冲销关联单据'),
    },
    {
      name: 'companLov',
      type: 'object',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      textField: 'companyName',
      label: intl.get('ssta.costSheet.model.costSheet.companyName').d('公司名称'),
      noCache: true,
      required: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      ignore: 'always',
    },
    {
      name: 'companyId',
      type: 'string',
      bind: 'companLov.companyId',
    },
    {
      name: 'companyName',
      type: 'string',
      bind: 'companLov.companyName',
    },
    {
      name: 'companyNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.companyCode').d('公司编码'),
      bind: 'companLov.companyNum',
    },
    {
      name: 'currencyLov',
      type: 'object',
      lovCode: 'SSTA.CURRENCY',
      textField: 'currencyCode',
      label: intl.get('ssta.costSheet.model.costSheet.currencyCode').d('币种'),
      noCache: true,
      required: true,
      ignore: 'always',
    },
    {
      name: 'currencyCode',
      bind: 'currencyLov.currencyCode',
    },
    {
      name: 'currencyName',
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'ouNameLov',
      type: 'object',
      lovCode: 'SSTA.SPFM.USER_AUTH.OU',
      textField: 'ouName',
      valueField: 'ouId',
      label: intl.get('ssta.costSheet.model.costSheet.ouName').d('业务实体'),
      noCache: true,
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record }) => ({
          companyId: record.get('companyId'),
          tenantId: getCurrentOrganizationId(),
        }),
        disabled: ({ record }) => !record.get('companLov'),
      },
    },
    {
      name: 'ouCode',
      bind: 'ouNameLov.ouCode',
    },
    {
      name: 'ouId',
      bind: 'ouNameLov.ouId',
    },
    {
      name: 'ouName',
      bind: 'ouNameLov.ouName',
    },
    {
      name: 'supplierCompanyLov',
      type: 'object',
      label: intl.get('ssta.settlePool.model.settlePool.supplierCompanyName').d('供应商名称'),
      lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
      noCache: true,
      ignore: 'always',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => !record.get('companyId'),
        lovPara: ({ record }) => ({
          pageSource: 'CostSheet',
          companyId: record.get('companyId'),
          tenantId: getCurrentOrganizationId(),
        }),
      },
    },

    {
      name: 'supplierSiteLov',
      type: 'object',
      lovCode: 'SSTA.SUPPLIER_SITE',
      // textField: 'currencyCode',
      label: intl.get('ssta.costSheet.model.costSheet.supplierSiteLov').d('供应商地点'),
      noCache: true,
      ignore: 'always',
      textField: 'supplierSiteCode',
      dynamicProps: {
        required: ({ record }) => record.get('supplierSiteEnableFlag') === 1,
        lovPara: ({ record }) => ({
          supplierId: record.get('supplierId'),
          tenantId: getCurrentOrganizationId(),
          ouId: record.get('ouId'),
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
      name: 'supplierTenantId',
      type: 'string',
      bind: 'supplierCompanyLov.supplierTenantId',
    },
    {
      name: 'supplierCompanyId',
      type: 'string',
      bind: 'supplierCompanyLov.supplierCompanyId',
    },
    {
      name: 'supplierId',
      bind: 'supplierCompanyLov.supplierId',
    },
    {
      name: 'supplierNum',
      bind: 'supplierCompanyLov.supplierNum',
    },
    {
      name: 'supplierName',
      bind: 'supplierCompanyLov.supplierName',
    },
    // 创建时，供应商编码展示本地供应商编码，supplierCompanyNum需要传平台供应商编码
    {
      name: 'displaySupplierNum',
      type: 'string',
      label: intl.get('ssta.settlePool.model.settlePool.supplierCompanyCode').d('供应商编码'),
    },
    {
      name: 'supplierCompanyNum',
      type: 'string',
      // label: intl.get('ssta.settlePool.model.settlePool.supplierCompanyCode').d('供应商编码'),
      bind: 'supplierCompanyLov.supplierCompanyNum',
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssta.settlePool.model.settlePool.supplierCompanyName').d('供应商名称'),
      bind: 'supplierCompanyLov.supplierCompanyName',
    },
    {
      name: 'netAmount',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.netAmount').d('总金额(不含税)'),
    },
    {
      name: 'taxAmount',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.taxAmount').d('税额'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.taxIncludedAmount').d('总金额(含税)'),
    },
    {
      name: 'remarks',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.remarks').d('备注'),
    },
    {
      name: 'approvalOpinions',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.approvalOpinions').d('审批意见'),
      // dynamicProps: {
      //   required: ({ dataSet }) => {
      //     const { approveFlag } = dataSet;
      //     return Number(approveFlag) === 1;
      //   },
      // },
    },
    {
      name: 'chargeUuid',
      type: 'attachment',
      label: intl.get('ssta.costSheet.model.costSheet.purchaserEnclosure').d('采购方附件'),
    },
    {
      name: 'reverseDesc',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.reverseDesc').d('冲销说明'),
    },
    {
      name: 'purOrganizationIdLov',
      type: 'object',
      label: intl
        .get('ssta.purchaseSettlePool.model.purchaseSettlePool.purchasingOrganization')
        .d('采购组织'),
      ignore: 'always',
      noCache: true,
      lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
      dynamicProps: {
        lovPara: ({ record }) => ({
          companyId: record.get('companyId'),
          ouId: record.get('ouId'),
        }),
      },
    },
    {
      name: 'purOrganizationName',
      bind: 'purOrganizationIdLov.organizationName',
    },
    {
      name: 'purOrganizationId',
      bind: 'purOrganizationIdLov.purchaseOrgId',
    },
    {
      name: 'purOrganizationCode',
      bind: 'purOrganizationIdLov.organizationCode',
    },
    {
      name: 'invOrganizationLov',
      type: 'object',
      label: intl
        .get('ssta.purchaseSettlePool.model.purchaseSettlePool.invOrganizationLov')
        .d('库存组织'),
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTH.INVORG',
      dynamicProps: {
        lovPara: ({ record }) => ({
          companyId: record.get('companyId'),
          ouId: record.get('ouId'),
        }),
        disabled: ({ record }) => !record.get('companLov'),
      },
    },
    {
      name: 'invOrganizationName',
      bind: 'invOrganizationLov.organizationName',
    },
    {
      name: 'invOrganizationId',
      bind: 'invOrganizationLov.organizationId',
    },
    {
      name: 'invOrganizationCode',
      bind: 'invOrganizationLov.organizationCode',
    },

    {
      name: 'agentLov',
      type: 'object',
      label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.agentId`).d('采购员'),
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTH.PUR_ORG_AGENT',
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: getCurrentOrganizationId(),
          purchaseOrgId: record?.get('purOrganizationId'),
        }),
      },
    },
    {
      name: 'agentId',
      bind: 'agentLov.purchaseAgentId',
    },
    {
      name: 'purchaseAgentName',
      bind: 'agentLov.purchaseAgentName',
    },
  ],
  events: {
    update: ({ name, value, record }) => {
      if (name === 'supplierCompanyLov') {
        const { supplierName, supplierCompanyName } = value || {};
        if (!supplierName) {
          // 适配平台供应商组件的 displayField 为 supplierName
          record.set({
            supplierName: supplierCompanyName,
          });
        }
      }
    },
  },
});

const filledInfoDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'approvalOpinions',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.approvalOpinions').d('审批意见'),
    },
  ],
});
const reverseInfoDs = () => ({
  autoCreate: false,
  fields: [
    {
      name: 'reverseDesc',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.reverseDesc').d('冲销说明'),
    },
  ],
});

// 行DS
const tableDs = () => ({
  autoQuery: false,
  primaryKey: 'chargeLineId',
  cacheSelection: true,
  forceValidate: true,
  record: {
    dynamicProps: {
      selectable: (record) => !['REBATE'].includes(record?.get('chargeLineSource')),
    },
  },
  // table表单显示的字段
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.lineNum').d('费用单行号'),
    },
    {
      name: 'chargeLov',
      type: 'object',
      label: intl.get('ssta.costSheet.model.costSheet.chargeCode').d('费用编码'),
      textField: 'value',
      lovCode: 'SSTA.CHARGE',
      noCache: true,
      required: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      ignore: 'always',
    },
    {
      name: 'chargeName',
      type: 'string',
      bind: 'chargeLov.meaning',
      label: intl.get('ssta.costSheet.model.costSheet.chargeName').d('费用名称'),
    },
    {
      name: 'chargeCode',
      type: 'string',
      bind: 'chargeLov.value',
    },
    {
      name: 'taxRateLov',
      type: 'object',
      label: intl.get('ssta.costSheet.model.costSheet.taxRate').d('税率'),
      textField: 'taxRate',
      lovCode: 'SSTA.TAX_RATE_SERVICE',
      noCache: true,
      required: true,
      dynamicProps: {
        lovPara: ({ record }) => ({
          companyId: record.get('companyId') || null,
          supplierCompanyId: record.get('supplierCompanyId') || null,
          tenantId: getCurrentOrganizationId(),
          source: 'EXPENSE',
        }),
      },
      ignore: 'always',
    },
    {
      name: 'taxCode',
      type: 'string',
      bind: 'taxRateLov.taxCode',
    },
    {
      name: 'taxRate',
      type: 'number',
      bind: 'taxRateLov.taxRate',
    },
    {
      name: 'taxId',
      type: 'string',
      bind: 'taxRateLov.taxId',
    },
    {
      name: 'taxRateType',
      type: 'string',
      bind: 'taxRateLov.taxRateType',
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.netAmount').d('金额(不含税)'),
      required: true,
      dynamicProps: {
        disabled: ({ record }) => {
          // 1->含税价 0->不含税价
          return Number(record.get('taxIncludedEnableFlag')) === 1;
        },
        readOnly: ({ record }) => {
          // 1->含税价 0->不含税价
          return Number(record.get('taxIncludedEnableFlag')) === 1;
        },
        formatterOptions: amountFormatterOptions,
      },
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxIncludedAmount').d('总金额(含税)'),
      required: true,
      dynamicProps: {
        disabled: ({ record }) => {
          // 1->含税价 0->不含税价
          return Number(record.get('taxIncludedEnableFlag')) === 0;
        },
        readOnly: ({ record }) => {
          // 1->含税价 0->不含税价
          return Number(record.get('taxIncludedEnableFlag')) === 0;
        },
        formatterOptions: amountFormatterOptions,
      },
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxAmount').d('税额'),
      dynamicProps: {
        disabled: ({ record }) => {
          // 1->含税价 0->不含税价
          return !record.get('taxRate') || Number(record.get('taxAmountUpdateFlag')) === 0;
        },
        readOnly: ({ record }) => {
          // 1->含税价 0->不含税价
          return !record.get('taxRate') || Number(record.get('taxAmountUpdateFlag')) === 0;
        },
        required: ({ record }) => {
          // 1->含税价 0->不含税价
          return Number(record.get('taxAmountUpdateFlag')) === 1;
        },
        formatterOptions: amountFormatterOptions,
      },
    },
    {
      name: 'pcNumLov',
      type: 'object',
      label: intl.get('ssta.costSheet.model.costSheet.pcNum').d('采购协议编号'),
      textField: 'pcNum',
      lovCode: 'SSTA.CHARGE_PC_NUM',
      noCache: true,
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record }) => ({
          dynPcNum: record.get('pcNum1') || null,
          dynPoNum: record.get('poNum') || null,
          currencyCode: record.get('currencyCode') || null,
          companyId: record.get('companyId') || null,
          supplierCompanyId: record.get('supplierCompanyId') || null,
          tenantId: getCurrentOrganizationId(),
          supplierId: record.get('supplierId'),
          ouId: record.get('ouId'),
        }),
      },
    },
    {
      name: 'pcNum',
      type: 'string',
      bind: 'pcNumLov.pcNum',
    },
    {
      name: 'poNum1',
      type: 'string',
      ignore: 'always',
      bind: 'pcNumLov.poNum',
    },
    {
      name: 'poNumLov',
      type: 'object',
      label: intl.get('ssta.costSheet.model.costSheet.poNum').d('采购订单编号'),
      textField: 'poNum',
      lovCode: 'SSTA.CHARGE_PO_NUM',
      noCache: true,
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record, dataSet }) => ({
          dynPoNum: record.get('poNum1') || null,
          dynPcNum: record.get('pcNum') || null,
          currencyCode: record.get('currencyCode') || null,
          companyId: record.get('companyId') || null,
          supplierCompanyId: record.get('supplierCompanyId') || null,
          tenantId: getCurrentOrganizationId(),
          supplierId: record.get('supplierId'),
          ouId: record.get('ouId'),
          supplierSiteId: dataSet.supplierSiteId,
          customizeFilterComparison: 'ouId:=,companyId:=,currencyCode:=',
        }),
      },
    },
    {
      name: 'poNum',
      type: 'string',
      bind: 'poNumLov.poNum',
    },
    {
      name: 'poHeaderId',
      type: 'string',
      bind: 'poNumLov.poHeaderId',
    },
    {
      name: 'pcNum1',
      type: 'string',
      ignore: 'always',
      bind: 'poNumLov.pcNum',
    },
    {
      name: 'lineRemarks',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.lineRemarks').d('行备注'),
    },
    {
      name: 'treatmentMethod',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.treatmentMethod').d('费用处理方式'),
      lookupCode: 'SSTA.CHARGE_TREATMENT_METHOD',
    },
    {
      name: 'reverseLineNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.reverseLineNum').d('冲销关联单据行号'),
    },
    {
      name: 'pushSettleStatusMeaning',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.pushSettleStatusMeaning').d('推送结算池状态'),
    },
    {
      name: 'pushBackMsg',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.pushBackMsg').d('推送信息'),
    },
    {
      name: 'opr',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.opr').d('操作'),
    },
    {
      name: 'costIdLov',
      type: 'object',
      label: intl.get('ssta.costSheet.model.costSheet.costId').d('成本中心'),
      // textField: 'poNum',
      lovCode: 'SSTA.COST_CENTER',
      noCache: true,
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record }) => ({
          dynPoNum: record.get('costName') || null,

          currencyCode: record.get('currencyCode') || null,
          companyId: record.get('companyId') || null,
          supplierCompanyId: record.get('supplierCompanyId') || null,
          tenantId: getCurrentOrganizationId(),
        }),
      },
    },
    {
      name: 'costName',
      type: 'string',
      bind: 'costIdLov.costName',
    },
    {
      name: 'costId',
      type: 'string',
      bind: 'costIdLov.costId',
    },
    {
      name: 'sourceDocumentNum',
      type: 'string',
      label: intl.get('ssta.common.view.title.sourceDocumentNum').d('来源单据号'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `/ssta/v1/${organizationId}/charge-lines?customizeUnitCode=SSTA.COST_SHEET_DETAIL.TRANSACTIONDETAIL,SSTA.COST_SHEET_DETAIL.TRANSACTION_DETAIL_SEARCH`,
        method: 'GET',
        data,
      };
    },
    destroy: ({ data }) => {
      return {
        url: `/ssta/v1/${organizationId}/charge-lines/batch/cancel`,
        data,
        method: 'PUT',
      };
    },
    submit: ({ data }) => {
      return {
        url: `/ssta/v1/${organizationId}/charge-lines/batch/save`,
        data,
        method: 'PUT',
      };
    },
  },
});

const lineTableDs = {
  BILL: (documentType) => ({
    primaryKey: 'chargeRecordId',
    // table表单显示的字段
    fields: [
      {
        name: 'documentNumAndLine',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.documentNumAndLine').d('对账单编号|行号'),
      },
      {
        name: 'quantity',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.quantity').d('对账数量'),
      },
      {
        name: 'netPrice',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.netPrice').d('对账不含税单价'),
      },
      {
        name: 'unitPriceBatch',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.unitPriceBatch').d('每'),
      },
      {
        name: 'netAmount',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.netAmounts').d('对账不含税金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxRate',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.taxRates').d('对账税率'),
      },
      {
        name: 'taxAmount',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.taxAmounts').d('对账税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedPrice',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.taxIncludedPrice').d('对账含税单价'),
      },
      {
        name: 'taxIncludedAmount',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.taxIncludedAmounts').d('对账含税金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'recordStatusMeaning',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.recordStatusMeaning').d('对账状态'),
      },
      {
        name: 'executionDate',
        type: 'date',
        label: intl.get('ssta.costSheet.model.costSheet.billDate').d('对账日期'),
      },
      {
        name: 'recordSource',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.recordSource').d('对账来源'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.execCompanyName').d('执行公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.supplierCompanyName').d('执行供应商'),
      },
      {
        name: 'opr',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.opr').d('操作'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { ...otherData } = data;
        const queryParams = getDatas(otherData);
        return {
          url: `/ssta/v1/${organizationId}/settle-records/record-charge/${documentType}`,
          method: 'GET',
          data: {
            ...queryParams,
          },
        };
      },
    },
  }),
  INVOICE: (documentType) => ({
    primaryKey: 'chargeRecordId',
    // table表单显示的字段
    fields: [
      {
        name: 'documentNumAndLine',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.documentNumAndLine1').d('结算单编号|行号'),
      },
      {
        name: 'documentNum',
        type: 'string',
      },
      {
        name: 'quantity',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.quantity1').d('开票数量'),
      },
      {
        name: 'netPrice',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.netPrice1').d('开票不含税单价'),
      },
      {
        name: 'unitPriceBatch',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.unitPriceBatch').d('每'),
      },
      {
        name: 'netAmount',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.netAmount1').d('开票不含税金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxRate',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.taxRate1').d('开票税率'),
      },
      {
        name: 'taxAmount',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.taxAmount1').d('开票税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedPrice',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.taxIncludedPrice1').d('开票含税单价'),
      },
      {
        name: 'taxIncludedAmount',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.taxIncludedAmount1').d('开票含税金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'recordStatusMeaning',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.recordStatusMeaning1').d('开票状态'),
      },
      {
        name: 'executionDate',
        type: 'date',
        label: intl.get('ssta.costSheet.model.costSheet.invoiceDate').d('开票日期'),
      },
      {
        name: 'recordSource',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.recordSource1').d('开票来源'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.execCompanyName').d('执行公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.supplierCompanyName').d('执行供应商'),
      },
      {
        name: 'opr',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.opr').d('操作'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { ...otherData } = data;
        const queryParams = getDatas(otherData);
        return {
          url: `/ssta/v1/${organizationId}/settle-records/record-charge/${documentType}`,
          method: 'GET',
          data: {
            ...queryParams,
          },
        };
      },
    },
  }),
  PAYMENT: (documentType) => ({
    primaryKey: 'chargeRecordId',
    // table表单显示的字段
    fields: [
      {
        name: 'documentNumAndLine',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.documentNumAndLine1').d('结算单编号|行号'),
      },
      {
        name: 'documentNum',
        type: 'string',
      },
      {
        name: 'paymentTypeMeaning',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.paymentTypeMeaning').d('付款类型'),
      },
      {
        name: 'paymentAmount',
        type: 'number',
        label: intl.get('ssta.costSheet.model.costSheet.paymentAmount').d('付款金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'recordStatusMeaning',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.recordStatusMeaning2').d('付款状态'),
      },
      {
        name: 'executionDate',
        type: 'date',
        label: intl.get('ssta.costSheet.model.costSheet.paymentDate').d('付款日期'),
      },
      {
        name: 'recordSource',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.recordSource2').d('付款来源'),
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.settleHeaderNum').d('SRM发票结算单号'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.execCompanyName').d('执行公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.supplierCompanyName').d('执行供应商'),
      },
      {
        name: 'opr',
        type: 'string',
        label: intl.get('ssta.costSheet.model.costSheet.opr').d('操作'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { ...otherData } = data;
        const queryParams = getDatas(otherData);
        return {
          url: `/ssta/v1/${organizationId}/settle-records/record-charge/${documentType}`,
          method: 'GET',
          data: {
            ...queryParams,
          },
        };
      },
    },
  }),
};

const sourceDocumentDS = (data) => {
  return {
    paging: false,
    autoQuery: true,
    selection: false,
    data,
    fields: [
      {
        name: 'displayDocNum',
        label: intl.get('ssta.common.model.sourceDocument.displayDocNum').d('展示来源单据号'),
      },
      {
        name: 'displayLineNum',
        label: intl.get('ssta.common.model.sourceDocument.displayLineNum').d('展示来源单据行号'),
      },
      {
        name: 'docNum',
        label: intl.get('ssta.common.model.sourceDocument.docNum').d('来源单据号'),
      },
      {
        name: 'lineNum',
        label: intl.get('ssta.common.model.sourceDocument.lineNum').d('来源单据行号'),
      },
    ],
  };
};

export { formDs, tableDs, lineTableDs, filledInfoDs, reverseInfoDs, sourceDocumentDS };
