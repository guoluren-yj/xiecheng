import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import { SRM_SPC } from '_utils/config';
import { formatTreeData } from './utils';

const organizationId = getCurrentOrganizationId();

const listLineDS = () => ({
  // autoQuery: true,
  selection: false,
  primaryKey: 'expandId',
  idField: 'expandId',
  parentField: 'parentId',
  expandField: 'expand',
  paging: 'server',
  pageSize: 20,
  // table表单显示的字段
  fields: [
    {
      name: 'expandStatus',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.expandStatus').d('策略状态'),
    },
    {
      name: 'edit',
      type: 'string',
      label: intl.get('hzero.common.action').d('操作'),
    },
    {
      name: 'expandCode',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.priceLibCode').d('策略编码'),
    },
    {
      name: 'expandName',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.expandName').d('策略名称'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
    {
      name: 'priorityLevel',
      type: 'number',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.priorityLevel').d('优先级'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.remark').d('策略说明'),
    },
    {
      name: 'priceLibExpandCodes',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.priceLibExpandCodes').d('调用规则'),
      lookupCode: 'SSRC.PRICE_LIB_SOURCE_FROM',
      multiple: ',',
    },
    {
      name: 'templateIdMeaning',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.templateIds').d('价格库模板'),
      // lovCode: 'SSRC.PRICE_LIB_TEMPLATE',
      multiple: ',',
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.creationDate').d('创建时间'),
    },
    {
      name: 'versionNum',
      type: 'number',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.versionNum').d('版本'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.enabledFlag').d('是否启用'),
    },
  ],

  // 查询表单字段
  // queryFields: [
  //   {
  //     name: 'expandCode',
  //     type: 'string',
  //     label: intl.get('ssrc.priceExpandStrategy.model.strategy.priceLibCode').d('策略编码'),
  //   },
  //   {
  //     name: 'expandName',
  //     type: 'string',
  //     label: intl.get('ssrc.priceExpandStrategy.model.strategy.expandName').d('策略名称'),
  //   },
  //   {
  //     name: 'priceLibExpandCodes',
  //     type: 'string',
  //     label: intl.get('ssrc.priceExpandStrategy.model.strategy.priceLibExpandCodes').d('调用规则'),
  //     lookupCode: 'SSRC.PRICE_LIB_SOURCE_FROM',
  //   },
  // ],
  queryParameter: {
    customizeUnitCode: 'SSRC.PRICE_EXPAND_STRATEGY.LIST.FILTER',
  },
  transport: {
    read: {
      url: `${SRM_SPC}/v1/${organizationId}/price-lib-expands`,
      method: 'GET',
      transformResponse: (data) => {
        return formatTreeData(data, 'expandId', 'expandStatus');
      },
    },
  },
});

export { listLineDS };
