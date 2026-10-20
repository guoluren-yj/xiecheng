import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';

export const getRegisterStrategyDS = () => ({
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'tenantNum',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.registerAuth.tenantNum').d('租户编码'),
    },
    {
      name: 'tenantName',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.registerAuth.tenantName').d('租户名称'),
    },
    {
      name: 'webUrl',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.registerAuth.subDomain').d('二级域名'),
    },
    {
      name: 'registerStrategy',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.registerAuth.registerStrategy').d('注册策略'),
    },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/company-actions/new-register/query-strategy`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          customizeUnitCode:
            'SSLM.REGISTER_AUTH_MANAGE.REGISTER_STRATEGY.FILTER,SSLM.REGISTER_AUTH_MANAGE.REGISTER_STRATEGY.LIST',
        },
        data: {},
      };
    },
  },
});
