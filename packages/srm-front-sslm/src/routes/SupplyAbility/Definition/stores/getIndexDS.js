/*
 * getIndexDS - 列表相关DS
 * @Date: 2022-02-16 15:23:43
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 供货能力清单
const getAbilityListDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'supplierCompanyNum',
      label: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
    },
    {
      name: 'stageDescription',
      label: intl.get('sslm.common.view.supplier.stageDescription').d('生命周期阶段'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.company.name').d('公司'),
    },
    {
      name: 'createUserName',
      label: intl.get('sslm.common.view.creator.name').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sslm.common.view.created.date').d('创建日期'),
    },
    {
      name: 'lastUpdateUserName',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.lastUpdateUserName').d('最后更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: 'date',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.lastUpdateDate').d('最后更新日期'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-abilitys`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode:
            'SSLM.SUPPLIER_ABLILITY_DEFINITION.LIST,SSLM.SUPPLIER_ABLILITY_DEFINITION.LIST_SEARCH_BAR',
        },
      };
    },
  },
});

// 拓展中供货能力
const getExpandAbilityDS = () => ({
  pageSize: 20,
  cacheSelection: true,
  primaryKey: 'supplyAbilityExpandId',
  dataToJSON: 'selected',
  fields: [
    {
      name: 'supplyAbilityExpandStatus',
      lookupCode: 'SUPPLY_ABILITY_EXPAND_STATUS',
      label: intl.get('sslm.common.modal.application.status').d('申请状态'),
    },
    {
      name: 'expandNum',
      label: intl.get('sslm.common.modal.application.number').d('申请单号'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.company.companyName').d('公司名称'),
    },
    {
      name: 'createdUserName',
      label: intl.get('sslm.common.view.creator.name').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sslm.common.view.created.date').d('创建日期'),
    },
    {
      name: 'lastUpdatedUserName',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.lastUpdateUserName').d('最后更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: 'date',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.lastUpdateDate').d('最后更新日期'),
    },
    {
      name: 'operation',
      label: intl.get('sslm.common.button.operationRecords').d('操作记录'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-expands`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode:
            'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_LIST,SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_LIST_SEARCH_BAR',
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (!['NEW', 'REJECT'].includes(record.data.supplyAbilityExpandStatus)) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
});

export { getAbilityListDS, getExpandAbilityDS };
