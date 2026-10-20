/*
 * @Date: 2022-12-09 13:59:28
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

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
      lovPara: { tenantId },
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
      lovPara: { tenantId },
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
      lovPara: { tenantId },
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
      lovPara: { tenantId },
      label: intl.get('sslm.common.model.paymentTerms').d('付款条款'),
      transformRequest: value => value && value.termId,
      transformResponse: (value, object) =>
        value
          ? {
              termId: object.termId,
              termName: object.termIdMeaning,
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
  transport: {
    read: ({ dataSet }) => {
      const queryParams = dataSet?.parent?.getQueryParameter('queryParmas') || {};
      const customizeUnitCode = dataSet.getQueryParameter('customizeUnitCode');
      const { requisitionId, ...others } = queryParams;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/life-cycle-change-syncs/${requisitionId}`,
        method: 'GET',
        params: {
          ...others,
          customizeUnitCode,
        },
        data: {},
      };
    },
  },
});

export const getPurchaseLineDS = () => ({
  primaryKey: 'supplierSyncPfId',
  cacheSelection: true,
  forceValidate: true,
  pageSize: 20,
  fields: [
    {
      name: 'purchaseOrgId',
      required: true,
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.PURORG',
      textField: 'organizationCode',
      label: intl.get('sslm.common.model.purchaseOrgCode').d('采购组织编码'),
      transformRequest: value => value && value.purchaseOrgId,
      transformResponse: (value, object) =>
        value
          ? {
              purchaseOrgId: object.purchaseOrgId,
              organizationCode: object.organizationCode,
              organizationName: object.organizationName,
            }
          : null,
    },
    {
      name: 'organizationCode',
      bind: 'purchaseOrgId.organizationCode',
    },
    {
      name: 'organizationName',
      bind: 'purchaseOrgId.organizationName',
      label: intl
        .get('sslm.supplierInform.model.supplierInform.organizationName')
        .d('采购组织名称'),
    },
    {
      name: 'purchaseAgentId',
      type: 'object',
      lovCode: 'SMDM.PURCHASE_AGENT',
      lovPara: { tenantId },
      label: intl.get('sslm.supplierInform.model.supplierInform.purchaseAgent').d('采购组'),
      transformRequest: value => value && value.purchaseAgentId,
      transformResponse: (value, object) =>
        value
          ? {
              purchaseAgentId: object.purchaseAgentId,
              purchaseAgentName: object.purchaseAgentName,
            }
          : null,
    },
    {
      name: 'purchaseAgentName',
      bind: 'purchaseAgentId.purchaseAgentName',
    },
    {
      name: 'termId',
      required: true,
      type: 'object',
      lovCode: 'SSLM.PAYMENT.TERM',
      lovPara: { tenantId },
      label: intl.get('sslm.common.model.paymentTerms').d('付款条款'),
      transformRequest: value => value && value.termId,
      transformResponse: (value, object) =>
        value
          ? {
              termId: object.termId,
              termName: object.termIdMeaning,
            }
          : null,
    },
    {
      name: 'termName',
      bind: 'termId.termName',
    },
    {
      name: 'paymentTypeCode',
      type: 'object',
      lovCode: 'SMDM.PAYMENT_TYPE_CODE',
      lovPara: { tenantId },
      label: intl.get('sslm.supplierInform.model.supplierInform.payMethod').d('付款方式'),
      transformRequest: value => value && value.typeCode,
      transformResponse: (value, object) =>
        value
          ? {
              typeCode: object.paymentTypeCode,
              typeName: object.typeName,
            }
          : null,
    },
    {
      name: 'typeName',
      bind: 'paymentTypeCode.typeName',
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
      lovPara: { tenantId },
      label: intl.get('sslm.supplierInform.model.supplierInform.currencyCode').d('订单货币'),
      transformRequest: value => value && value.currencyCode,
      transformResponse: (value, object) =>
        value
          ? {
              currencyCode: object.currencyCode,
              currencyName: object.currencyName,
            }
          : null,
    },
    {
      name: 'currencyName',
      bind: 'currencyCode.currencyName',
    },
    {
      name: 'reconciliationAccount',
      type: 'object',
      required: true,
      textField: 'meaning',
      valueField: 'value',
      lovCode: 'SSLM.RECONCILIATION_ACCOUNT',
      lovPara: { tenantId },
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
      name: 'sortNumber',
      required: true,
      type: 'number',
      step: 1,
      min: 0,
      numberGrouping: false,
      label: intl.get('sslm.supplierInform.model.supplierInform.sortNumber').d('排序码'),
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
  transport: {
    read: ({ dataSet, params }) => {
      const queryParams = dataSet?.parent?.getQueryParameter('queryParmas') || {};
      const customizeUnitCode = dataSet.getQueryParameter('customizeUnitCode');
      const { requisitionId, ...others } = queryParams;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/life-cycle-change-sync-pfs/${requisitionId}`,
        method: 'GET',
        data: {},
        params: {
          ...params,
          ...others,
          customizeUnitCode,
        },
      };
    },
    destroy: ({ dataSet, data, params }) => {
      const queryParams = dataSet?.parent?.getQueryParameter('queryParmas') || {};
      const customizeUnitCode = dataSet.getQueryParameter('customizeUnitCode');
      const { requisitionId, ...others } = queryParams;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/life-cycle-change-sync-pfs/${requisitionId}`,
        method: 'DELETE',
        data: data && data.map(n => n.supplierSyncPfId),
        params: {
          ...others,
          ...params,
          customizeUnitCode,
        },
      };
    },
  },
});
