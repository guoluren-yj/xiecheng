import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const packageTableDS = () => ({
  primaryKey: 'marketBasketId',
  autoQuery: true,
  // table表单显示的字段
  fields: [
    {
      name: 'basketName',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.packageName').d('采购套餐名称'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.packageDesc').d('采购套餐描述'),
    },
    {
      name: 'sourceFrom',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.packageSource').d('采购套餐来源'),
    },
    {
      name: 'createTime',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.createTime').d('创建时间'),
    },
    {
      name: 'startDate',
      type: 'dateTime',
      label: intl.get('small.common.model.startTime').d('开始时间'),
    },
    {
      name: 'endDate',
      type: 'dateTime',
      label: intl.get('small.common.model.endTime').d('截止时间'),
    },
    {
      name: 'effectiveDays',
      type: 'number',
      label: intl.get('small.mallHomePlate.model.effectiveDays').d('有效天数'),
    },
    {
      name: 'enabledFlag',
      type: 'number',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'edit',
      type: 'string',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  queryFields: [
    {
      name: 'basketName',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.packageName').d('采购套餐名称'),
    },
    {
      name: 'startDate',
      type: 'dateTime',
      label: intl.get('small.common.model.startTime').d('开始时间'),
    },
    {
      name: 'endDate',
      type: 'dateTime',
      label: intl.get('small.common.model.endTime').d('截止时间'),
    },
    {
      name: 'enabledFlag',
      type: 'number',
      label: intl.get('hzero.common.status').d('状态'),
      lookupCode: 'HPFM.ENABLED_FLAG',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.enabledFlag === 1 || record.data.companyId === -1) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/market-baskets`,
        method: 'GET',
        data: {
          companyId: -1,
          ...data,
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/market-baskets`,
        data,
        method: 'DELETE',
        transformResponse: (res) => {
          if (!res) {
            dataSet.query();
          }
        },
      };
    },
  },
});

const historyDs = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      label: intl.get('small.common.model.action.user').d('操作人'),
      name: 'operatedByName',
    },
    {
      label: intl.get('small.common.model.action.time').d('操作时间'),
      name: 'operatedDate',
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'operationName',
    },
    {
      label: intl.get('hzero.common.explain').d('说明'),
      name: 'operatedRemark',
    },
  ],
  transport: {
    read() {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/basket-historys`,
        method: 'GET',
      };
    },
  },
});
export { packageTableDS, historyDs };
