/*
 * @Date: 2023-04-12 14:34:31
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getPurchaseHeaderDS = () => ({
  forceValidate: true,
  fields: [
    {
      name: 'programmeGroups',
      lookupCode: 'SSLM.PROGRAMME_GROUPS',
      label: intl.get('spfm.importErp.model.importErp.planGroups').d('计划组'),
    },
    {
      name: 'schemeGroup',
      label: intl.get('sslm.supplierInform.model.supplierInform.schemeGroup').d('方案组'),
    },
    {
      name: 'accountGroup',
      type: 'object',
      lovCode: 'SSLM.SYNC_ACCOUNT_GROUP',
      textField: 'meaning',
      valueField: 'value',
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.supplierInform.model.supplierInform.accountGroup').d('账户组'),
      transformRequest: value => value && value.value,
      transformResponse: (value, object) =>
        value
          ? {
              value: object.accountGroup,
              meaning: object.accountGroupMeaning,
            }
          : null,
    },
    {
      name: 'reconciliationAccount',
      type: 'object',
      lovCode: 'SSLM.RECONCILIATION_ACCOUNT',
      textField: 'meaning',
      valueField: 'value',
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
      transformRequest: value => value && value.value,
      transformResponse: (value, object) =>
        value
          ? {
              value: object.reconciliationAccount,
              meaning: object.reconciliationAccountMeaning,
            }
          : null,
    },
    {
      name: 'ouId',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.OU_CODE',
      textField: 'ouCode',
      valueField: 'ouId',
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.supplierInform.model.supplierInform.erpCompanyCode').d('erp公司代码'),
      transformRequest: value => value && value.ouId,
      transformResponse: (value, object) =>
        value
          ? {
              ouId: object.ouId,
              ouCode: object.ouCode,
            }
          : null,
    },
    {
      name: 'termId',
      type: 'object',
      lovCode: 'SMDM.PAYMENT.TERM',
      textField: 'termName',
      valueField: 'termId',
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.common.model.paymentTerms').d('付款条款'),
      transformRequest: value => value && value.termId,
      transformResponse: (value, object) =>
        value
          ? {
              termId: object.termId,
              termName: object.termName,
            }
          : null,
    },
    {
      name: 'frozenFlag',
      type: 'boolean',
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sslm.supplierInform.model.supplierInform.accountFlag').d('记账冻结'),
    },
    {
      name: 'paymentFrozen',
      lookupCode: 'SSLM.PAYMENT_FROZEN',
      label: intl.get('spfm.importErp.model.importErp.paymentFreezeCode').d('记账冻结代码'),
    },
  ],
  events: {
    create: ({ dataSet, record }) => {
      const { changeReqId } = dataSet.getState('dsState') || {};
      record.set({ changeReqId });
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const { changeReqId } = dataSet.getState('dsState') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-change-syncs`,
        method: 'GET',
        data: {
          changeReqId,
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.PURCHASE_HEAD',
        },
      };
    },
  },
});

export const getPurchaseLineDS = ({ compareFlag = false } = {}) => ({
  forceValidate: true,
  paging: !compareFlag, // 对比不分页
  fields: [
    {
      name: 'organizationCode',
      required: true,
      type: 'object',
      textField: 'organizationCode',
      lovCode: 'SPFM.USER_AUTH.PURORG_CODE',
      label: intl.get('sslm.supplierInform.model.supplierInform.organizationCode').d('采购组织'),
      transformRequest: value => value && value.organizationCode,
      transformResponse: (value, data) => {
        const { purchaseOrgId, organizationCode, organizationName } = data;
        return value
          ? {
              purchaseOrgId,
              organizationCode,
              organizationName,
            }
          : null;
      },
    },
    {
      name: 'purchaseOrgId',
      bind: 'organizationCode.purchaseOrgId',
    },
    {
      name: 'organizationName',
      bind: 'organizationCode.organizationName',
      label: intl
        .get('sslm.supplierInform.model.supplierInform.organizationName')
        .d('采购组织名称'),
    },
    {
      name: 'purchaseAgentId',
      type: 'object',
      lovCode: 'SMDM.PURCHASE_AGENT',
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.supplierInform.model.supplierInform.purchaseAgent').d('采购员'),
      transformRequest: value => value && value.purchaseAgentId,
      transformResponse: (value, data) => {
        const { purchaseAgentId, purchaseAgentName } = data;
        return value ? { purchaseAgentId, purchaseAgentName } : null;
      },
    },
    {
      name: 'termId',
      required: true,
      type: 'object',
      lovCode: 'SSLM.PAYMENT.TERM',
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.supplierInform.model.supplierInform.termName').d('付款条款'),
      transformRequest: value => value && value.termId,
      transformResponse: (value, data) => {
        const { termId, termName } = data;
        return value ? { termId, termName } : null;
      },
    },
    {
      name: 'typeCode',
      type: 'object',
      lovCode: 'SMDM.PAYMENT_TYPE',
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.supplierInform.model.supplierInform.payMethod').d('付款方式'),
      transformRequest: value => value && value.typeCode,
      transformResponse: (value, data) => {
        const { typeCode, typeName } = data;
        return value ? { typeCode, typeName } : null;
      },
    },
    {
      name: 'typeId',
      bind: 'typeCode.typeId',
    },
    {
      name: 'typeName',
      bind: 'typeCode.typeName',
    },
    {
      name: 'tradeTerms',
      lookupCode: 'SSLM.TRADE_TERMS',
      label: intl.get('spfm.importErp.model.importErp.internationalCondition').d('国贸条件'),
    },
    {
      name: 'tradeTermsSite',
      label: intl.get('spfm.importErp.model.importErp.internationalSite').d('国贸地点'),
    },
    {
      name: 'currencyCode',
      type: 'object',
      required: true,
      lovCode: 'SMDM.CURRENCY',
      label: intl.get('sslm.supplierInform.model.supplierInform.currencyCode').d('订单货币'),
      transformRequest: value => value && value.currencyCode,
      transformResponse: (value, data) => {
        const { currencyCode, currencyName } = data;
        return value ? { currencyCode, currencyName } : null;
      },
    },
    {
      name: 'reconciliationAccount',
      required: true,
      type: 'object',
      lovPara: { tenantId: organizationId },
      lovCode: 'SSLM.RECONCILIATION_ACCOUNT',
      label: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
      transformRequest: value => value && value.value,
      transformResponse: (value, data) => {
        const { reconciliationAccount, reconciliationAccountMeaning } = data;
        return value
          ? { value: reconciliationAccount, meaning: reconciliationAccountMeaning }
          : null;
      },
    },
    {
      name: 'sortNumber',
      required: true,
      type: 'number',
      min: 0,
      step: 1,
      numberGrouping: false,
      label: intl.get(`sslm.supplierInform.model.supplierInform.sortNumber`).d('排序码'),
    },
    {
      name: 'frozenFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get(`sslm.supplierInform.model.purchase.frozenFlag`).d('采购冻结'),
    },
  ],
  events: {
    create: ({ dataSet, record }) => {
      const { changeReqId } = dataSet.getState('dsState') || {};
      record.set({ changeReqId });
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const { changeReqId } = dataSet.getState('dsState') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-change-synced-pfs`,
        method: 'GET',
        data: {
          changeReqId,
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.PURCHASE_LINE',
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-change-synced-pfs`,
        method: 'DELETE',
        data: data && data.map(n => n.supplierSyncPfId),
        params: { customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.PURCHASE_LINE' },
      };
    },
  },
});
