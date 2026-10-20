import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';

const getAccountDS = () => ({
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'loginName',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.user.loginName').d('账号'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.user.realName').d('名称'),
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
    },
    {
      name: 'phone',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl.get('sslm.registerAuthManage.modal.user.phone').d('手机号'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.registerAuthManage.modal.user.createDate').d('账号生成时间'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.user.relatedEnterprise').d('关联企业'),
    },
    {
      name: 'associationStatus',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.user.relatedStatus').d('关联状态'),
    },
    {
      name: 'registerDomain',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.user.registerDomain').d('注册域名'),
    },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/company-actions/new-register/query-user`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          customizeUnitCode:
            'SSLM.REGISTER_AUTH_MANAGE.ACCOUNT.FILTER,SSLM.REGISTER_AUTH_MANAGE.ACCOUNT.LIST',
        },
        data: {},
      };
    },
  },
});

const registerDomainDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'associationStatus',
      type: 'string',
      label: intl.get('hzero.common.button.status').d('状态'),
    },
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
      name: 'registerWebUrl',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.registerAuth.subDomain').d('二级域名'),
    },
    {
      name: 'versionNum',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.registerAuth.strategyVersion').d('策略版本'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.registerAuthManage.modal.registerAuth.registerDate').d('注册时间'),
    },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/company-actions/new-register/query-user-url`,
        method: 'GET',
        params: {
          ...params,
          ...data,
        },
        data: {},
      };
    },
  },
});

export { getAccountDS, registerDomainDS };
