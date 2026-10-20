/*
 * @Description:
 * @Date: 2021-11-24 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const strategyDS = () => ({
  name: 'user',
  dataToJSON: 'dirty-field',
  // autoQuery: true,
  cacheSelection: true,
  pageSize: 20,
  fields: [
    {
      name: 'strategyStatusMeaning',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.status').d('状态'),
      required: true,
      lookupCode: 'SLOD.STRATEGY_STATUS',
    },
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.strategyCode').d('策略编码'),
      required: true,
    },
    {
      name: 'strategyName',
      type: 'intl',
      label: intl.get('slod.shipmentsConfiguration.model.strategyName').d('策略描述'),
      required: true,
    },
    {
      name: 'sourceCode',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.sourceCode').d('来源单据'),
      required: true,
      lookupCode: 'SLOD.STRATEGY_SOURCE',
    },
    {
      name: 'dataVersion',
      type: 'number',
      label: intl.get('slod.shipmentsConfiguration.model.version').d('版本'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.uniqueLabelCodeRule').d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/strategy/strategy-header/list`,
        method: 'GET',
        data: queryData,
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/strategy/strategy-header`,
        method: 'POST',
        data,
      };
    },
  },
});

export { strategyDS };
