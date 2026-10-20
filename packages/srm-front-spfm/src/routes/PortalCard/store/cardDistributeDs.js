import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';

export default function getCardDistributeDs() {
  return {
    pageSize: 10,
    primaryKey: 'tenantId',
    cacheSelection: true,
    queryFields: [
      {
        name: 'tenantName',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.tenant.tenantName').d('租户名称'),
      },
      {
        name: 'creationDateFrom',
        type: 'date',
        label: intl.get('hzero.common.date.register.from').d('注册时间从'),
      },
      {
        name: 'creationDateTo',
        type: 'date',
        label: intl.get('hzero.common.date.register.to').d('注册时间至'),
      },
    ],
    fields: [
      {
        name: 'tenantNumObject',
        type: 'object',
        lovCode: 'HPFM.ASSIGN_TENANT',
        textField: 'tenantNum',
        valueField: 'tenantNum',
        label: intl.get('hptl.portalAssign.model.tenant.tenantCode').d('租户编码'),
        required: true,
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantNumObject.tenantId',
      },
      {
        name: 'tenantNum',
        type: 'string',
        bind: 'tenantNumObject.tenantNum',
      },
      {
        name: 'tenantName',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.tenant.tenantName').d('租户名称'),
        bind: 'tenantNumObject.tenantName',
      },
      {
        name: 'creationDate',
        type: 'string',
        label: intl.get('hzero.common.date.register').d('注册时间'),
        bind: 'tenantNumObject.creationDate',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/layout-card/dist`,
          method: 'get',
          data,
        };
      },
      create: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/layout-card/distribute`,
          method: 'post',
          data,
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/layout-card/distribute`,
          method: 'post',
          data,
        };
      },
    },
  };
}
