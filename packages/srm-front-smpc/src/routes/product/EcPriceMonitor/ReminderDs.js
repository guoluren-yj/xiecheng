import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const mapProps = {
  ROLE: {
    lovCode: 'HIAM.TENANT.ROLE',
    textField: 'code',
  },
  ACCOUNT: {
    lovCode: 'HIAM.TENANT.USER',
    textField: 'loginName',
  },
};
const getCommonProps = () => {
  return ['lovCode', 'textField'].reduce((pre, cur) => {
    return { ...pre, [cur]: ({ record }) => mapProps?.[record.get('remindType')]?.[cur] };
  }, {});
};

export default function ReminderDs(monitorStrategyId, readOnly = false) {
  return {
    primaryKey: 'monitorRemindId',
    selection: readOnly ? false : 'multiple',
    pageSize: 20,
    cacheModified: true,
    fields: [
      {
        name: 'remindType',
        lookupCode: 'SMPC.EC_PRICE_MONITOR_REMIND_TYPE',
        required: true,
        label: intl.get('smpc.ecPriceMonitor.view.dimension').d('维度'),
      },
      {
        name: 'accountLov',
        type: 'object',
        ignore: 'always',
        lovPara: { tenantId: organizationId },
        valueField: 'id',
        required: true,
        label: intl.get('smpc.ecPriceMonitor.view.code').d('编码'),
        computedProps: {
          required: ({ record }) => !!record.get('remindType'),
          ...getCommonProps(),
        },
      },
      {
        name: 'dataId',
        bind: 'accountLov.id',
      },
      {
        name: 'dataIdCode',
        computedProps: {
          bind: ({ record }) =>
            record.get('remindType') === 'ACCOUNT' ? 'accountLov.loginName' : 'accountLov.code',
        },
      },
      {
        name: 'dataIdName',
        label: intl.get('smpc.ecPriceMonitor.view.name').d('名称'),
        computedProps: {
          bind: ({ record }) =>
            record.get('remindType') === 'ACCOUNT' ? 'accountLov.realName' : 'accountLov.name',
        },
      },
    ],
    queryFields: [
      {
        name: 'roleName',
        label: intl.get('smpc.ecPriceMonitor.view.roleName').d('角色名称'),
        display: true,
      },
      {
        name: 'loginName',
        label: intl.get('smpc.ecPriceMonitor.view.loginName').d('子账户账号'),
        display: true,
      },
      {
        name: 'realName',
        label: intl.get('smpc.ecPriceMonitor.view.realName').d('子账户名称'),
        display: true,
      },
      {
        name: 'monitorRemindId',
        label: intl.get('hzero.common.date.createdDate').d('创建时间'),
        sortFlag: true,
        visible: false,
      },
    ],
    events: {
      update: ({ record, name }) => {
        if (name === 'remindType') {
          record.set('accountLov', null);
        }
      },
    },
    transport: {
      read: ({ data }) => ({
        url: `/smpc/v1/${organizationId}/ec-price-monitor-reminds`,
        method: 'GET',
        data: { ...data, monitorStrategyId },
      }),
      submit: ({ data }) => ({
        url: `/smpc/v1/${organizationId}/ec-price-monitor-reminds`,
        method: 'POST',
        data: data.map((m) => ({
          ...m,
          monitorStrategyId: m.monitorStrategyId || monitorStrategyId,
          tenantId: organizationId,
        })),
      }),
      destroy: ({ data }) => ({
        url: `/smpc/v1/${organizationId}/ec-price-monitor-reminds/batch-delete`,
        method: 'DELETE',
        data,
      }),
    },
  };
}
