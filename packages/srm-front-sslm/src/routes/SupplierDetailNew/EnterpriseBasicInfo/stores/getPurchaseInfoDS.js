/*
 * @Date: 2022-12-09 13:59:28
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getPurchaseHeaderDS = () => ({
  fields: [
    {
      label: intl.get('spfm.importErp.model.importErp.planGroups').d('计划组'),
      name: 'programmeGroupsMeaning',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.schemeGroup').d('方案组'),
      name: 'schemeGroup',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.accountGroup').d('账户组'),
      name: 'accountGroupMeaning',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
      name: 'reconciliationAccountMeaning',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.erpCompanyCode').d('erp公司代码'),
      name: 'ouCode',
    },
    {
      label: intl.get('spfm.importErp.model.importErp.termName').d('付款条款'),
      name: 'termName',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.bookingFrozen').d('记账冻结'),
      name: 'frozenFlag',
    },
    {
      label: intl.get('spfm.importErp.model.importErp.paymentFreezeCode').d('付款冻结代码'),
      name: 'paymentFrozenMeaning',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const params = dataSet.getQueryParameter('params');
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-sync/selectSync`,
        method: 'GET',
        data: params,
        params: {},
      };
    },
  },
});

export const getPurchaseLineDS = () => ({
  selection: false,
  fields: [
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.organizationCode').d('采购组织'),
      name: 'organizationCode',
    },
    {
      label: intl
        .get('sslm.supplierInform.model.supplierInform.organizationName')
        .d('采购组织名称'),
      name: 'organizationName',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.purchaseAgent').d('采购员'),
      name: 'purchaseAgentName',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.termName').d('付款条款'),
      name: 'termName',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.payMethod').d('付款方式'),
      name: 'typeName',
    },
    {
      label: intl.get('spfm.importErp.model.importErp.internationalCondition').d('国贸条件'),
      name: 'tradeTermsMeaning',
    },
    {
      label: intl.get('spfm.importErp.model.importErp.internationalSite').d('国贸地点'),
      name: 'tradeTermsSite',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.currencyCode').d('订单货币'),
      name: 'currencyName',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
      name: 'reconciliationAccountMeaning',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.sortNumber').d('排序码'),
      name: 'sortNumber',
    },
    {
      label: intl.get('sslm.supplierInform.model.supplierInform.frozenFlag').d('采购冻结'),
      name: 'frozenFlag',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const params = dataSet.getQueryParameter('params');
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-sync-pfs`,
        method: 'GET',
        data: params,
      };
    },
  },
});
