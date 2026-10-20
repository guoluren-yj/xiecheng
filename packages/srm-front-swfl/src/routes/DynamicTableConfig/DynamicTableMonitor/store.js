import intl from 'hzero-front/lib/utils/intl';
import { HZERO_HWFP } from 'hzero-front/lib/utils/config';

const url = `${HZERO_HWFP}/v1/dynamic-table-monitor-configs`;

export const tableDS = () => {
  return {
    queryFields: [
      {
        name: 'serviceName',
        label: intl.get('hwfp.dynamicTableMonitor.model.serviceName').d('服务名'),
        lock: true,
      },
      {
        name: 'apiPermission',
        label: intl.get('hwfp.dynamicTableMonitor.model.apiPermission').d('API Permission'),
        lock: true,
      },
      {
        name: 'sqlId',
        label: intl.get('hwfp.dynamicTableMonitor.model.sqlID').d('SQL ID'),
        lock: true,
      },
      {
        name: 'monitorFlag',
        label: intl.get('hwfp.dynamicTableMonitor.model.monitorFlag').d('监控标识'),
        lock: true,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
      {
        name: 'changeFlag',
        label: intl.get('hwfp.dynamicTableMonitor.model.changeFlag').d('更改表名标识'),
        lock: true,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
    ],
    fields: [
      {
        name: 'serviceName',
        label: intl.get('hwfp.dynamicTableMonitor.model.serviceName').d('服务名'),
      },
      {
        name: 'apiPermission',
        label: intl.get('hwfp.dynamicTableMonitor.model.apiPermission').d('API Permission'),
      },
      {
        name: 'sqlId',
        label: intl.get('hwfp.dynamicTableMonitor.model.sqlID').d('SQL ID'),
      },
      {
        name: 'monitorFlag',
        label: intl.get('hwfp.dynamicTableMonitor.model.monitorFlag').d('监控标识'),
      },
      {
        name: 'changeFlag',
        label: intl.get('hwfp.dynamicTableMonitor.model.changeFlag').d('更改表名标识'),
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
        name: 'serviceName',
        label: intl.get('hwfp.dynamicTableMonitor.model.serviceName').d('服务名'),
        required: true,
      },
      {
        name: 'apiPermission',
        label: intl.get('hwfp.dynamicTableMonitor.model.apiPermission').d('API Permission'),
      },
      {
        name: 'sqlId',
        label: intl.get('hwfp.dynamicTableMonitor.model.sqlID').d('SQL ID'),
      },
      {
        name: 'monitorFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        label: intl.get('hwfp.dynamicTableMonitor.model.monitorFlag').d('监控标识'),
        defaultValue: 1,
      },
      {
        name: 'changeFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        label: intl.get('hwfp.dynamicTableMonitor.model.changeFlag').d('更改表名标识'),
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
