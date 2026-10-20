import intl from 'hzero-front/lib/utils/intl';
import { HZERO_HWFP } from 'hzero-front/lib/utils/config';

const url = `${HZERO_HWFP}/v1/dynamic-table-configs`;

export const tableDS = () => {
  return {
    queryFields: [
      {
        name: 'tenantId',
        label: intl.get('entity.tenant.tag').d('租户'),
        lovCode: 'HPFM.TENANT_ALL',
        lock: true,
        type: 'object',
      },
      {
        name: 'enableFlag',
        label: intl.get('hzero.common.status').d('状态'),
        lookupCode: 'HPFM.ENABLED_FLAG',
        lock: true,
      },
    ],
    fields: [
      {
        name: 'tenantId',
        label: intl.get('entity.tenant.tag').d('租户'),
      },
      {
        name: 'tenantName',
        label: intl.get('entity.tenant.tag').d('租户'),
      },
      {
        name: 'dynamicLabel',
        label: intl.get('hwfp.dynamicTable.model.dynamicLabel').d('动态表后缀标签'),
      },
      {
        name: 'enableFlag',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'migrateFlag',
        label: intl.get('hwfp.dynamicTable.model.migrateFlag').d('迁移标识'),
      },
    ],
    transport: {
      read: {
        url,
        method: 'GET',
      },
      destroy: {
        url,
        method: 'DELETE',
      },
    },
  };
};

export const formDS = () => {
  return {
    fields: [
      {
        name: 'tenantLov',
        label: intl.get('entity.tenant.tag').d('租户'),
        lovCode: 'HPFM.TENANT_ALL',
        required: true,
        type: 'object',
        ignore: 'always',
      },
      {
        name: 'tenantId',
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'tenantName',
        bind: 'tenantLov.tenantName',
      },
      {
        name: 'dynamicLabel',
        label: intl.get('hwfp.dynamicTable.model.dynamicLabel').d('动态表后缀标签'),
        required: false,
      },
      {
        name: 'enableFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        label: intl.get('hzero.common.status.enable').d('启用'),
        defaultValue: 1,
      },
    ],
    transport: {
      submit: {
        url,
        method: 'POST',
      },
    },
  };
};
